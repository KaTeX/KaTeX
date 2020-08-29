// @flow
import buildCommon from "../buildCommon";
import defineFunction from "../defineFunction";
import mathMLTree from "../mathMLTree";
import * as html from "../buildHTML";
import * as mml from "../buildMathML";
import {assertSymbolNodeType} from "../parseNode";
import ParseError from "../ParseError";

import type Parser from "../Parser";
import type {ParseNode, AnyParseNode} from "../parseNode";

const cdArrow = {
    ">": "\\\\cdrightarrow",
    "<": "\\\\cdleftarrow",
    "=": "\\\\cdlongequal",
    "A": "\\uparrow",
    "V": "\\downarrow",
    "|": "\\Vert",
    ".": "no arrow",
};

const newCell = () => {
    return {type: "styling", body: [], mode: "math", style: "display"};
};

const isLabelEnd = (node: AnyParseNode, endChar: string): boolean => {
    return ((node.type === "mathord" || node.type === "atom") &&
        node.text === endChar);
};

export function parseCD(parser: Parser): ParseNode<"array"> {
    // Get the array's parse nodes with \\ temporarily mapped to \cr.
    const parseNodes = [];
    parser.gullet.beginGroup();
    parser.gullet.macros.set("\\\\", "\\cr");
    parser.gullet.beginGroup();
    while (true) {  // eslint-disable-line no-constant-condition
        // Get the parse nodes for the next row.
        parseNodes.push(parser.parseExpression(false, "\\cr"));
        parser.gullet.endGroup();
        parser.gullet.beginGroup();
        const next = parser.fetch().text;
        if (next === "&" || next === "\\cr") {
            parser.consume();
        } else if (next === "\\end") {
            if (parseNodes[parseNodes.length - 1].length === 0) {
                parseNodes.pop(); // final row ended in \\
            }
            break;
        } else {
            throw new ParseError("Expected \\\\ or \\cr or \\end",
                                 parser.nextToken);
        }
    }

    let row = [];
    const body = [row];

    // Loop thru the parse nodes. Collect them into cells and arrows.
    for (let i = 0; i < parseNodes.length; i++) {
        // Start a new row.
        const nodes = parseNodes[i];
        let cell = newCell();

        for (let j = 0; j < nodes.length; j++) {
            if (!(nodes[j].type === "textord" && nodes[j].text === "@")) {
                cell.body.push(nodes[j]);
            } else {
                // Parse node j is an "@", the start of an arrow.
                row.push(cell);
                const arrowChar = assertSymbolNodeType(nodes[j + 1]).text;
                const firstLabel = {type: "ordgroup", mode: "math", body: []};
                const secondLabel = {type: "ordgroup", mode: "math", body: []};
                if ("=|.".indexOf(arrowChar) > -1) {
                    j += 1;
                } else if ("<>AV".indexOf(arrowChar) > -1) {
                    // Get the arrow labels.
                    for (let k = j + 2; k < nodes.length; k++) {
                        if (isLabelEnd(nodes[k], arrowChar)) {
                            j = k;
                            break;
                        }
                        firstLabel.body.push(nodes[k]);
                    }
                    for (let k = j + 1; k < nodes.length; k++) {
                        if (isLabelEnd(nodes[k], arrowChar)) {
                            j = k;
                            break;
                        }
                        secondLabel.body.push(nodes[k]);
                    }
                } else {
                    throw new ParseError(`Expected one of "<>AV=|." after @.`);
                }

                // Now join the arrow to its labels.
                // This acts in a way similar to a macro expansion.
                const funcName = cdArrow[arrowChar];
                let arrow;
                switch (funcName) {
                    case "\\\\cdrightarrow":
                    case "\\\\cdleftarrow":
                        arrow = parser.callFunction(
                            funcName, [firstLabel], [secondLabel]
                        );
                        break;
                    case "\\uparrow":
                    case "\\downarrow": {
                        const leftLabel = parser.callFunction(
                            "\\\\cdleft", [firstLabel], []
                        );
                        arrow = {
                            type: "atom",
                            text: funcName,
                            mode: "math",
                            family: "rel",
                        };
                        arrow = parser.callFunction("\\Big", [arrow], []);
                        const rightLabel = parser.callFunction(
                            "\\\\cdright", [secondLabel], []
                        );
                        arrow = {
                            type: "ordgroup",
                            mode: "math",
                            body: [leftLabel, arrow, rightLabel],
                        };
                        arrow = parser.callFunction("\\\\cdparent", [arrow], []);
                        break;
                    }
                    case "\\\\cdlongequal":
                        arrow = parser.callFunction("\\\\cdlongequal", [], []);
                        break;
                    case "\\Vert":
                        arrow = {type: "textord", text: "\\Vert", mode: "math"};
                        arrow = parser.callFunction("\\Big", [arrow], []);
                        break;
                    default:
                        arrow = {type: "textord", text: " ", mode: "math"};
                }
                arrow = {
                    type: "styling",
                    body: [arrow],
                    mode: "math",
                    style: "display",
                };
                row.push(arrow);
                cell = newCell();
            }
        }
        if (i % 2 === 0) {
            row.push(cell);
        } else {
            row.shift();
        }
        row = [];
        body.push(row);
    }

    // End row group
    parser.gullet.endGroup();
    // End array group defining \\
    parser.gullet.endGroup();

    // define column separation.
    const cols = new Array(body[0].length).fill({
        type: "align",
        align: "c",
        pregap: 0.25,  // CD package sets \enskip between columns.
        postgap: 0.25, // So pre and post each get half an \enskip, i.e. 0.25em.
    });

    return {
        type: "array",
        mode: "math",
        body,
        arraystretch: 1,
        addJot: true,
        rowGaps: [null],
        cols,
        colSeparationType: "CD",
        hLinesBeforeRow: new Array(body.length + 1).fill([]),
        isCD: true,
    };
}

// The function below are not available for general use.
// They are here only for internal use by the {CD} environment in placing labels
// next to vertical arrows.

defineFunction({
    type: "cdlabel",
    names: ["\\\\cdleft", "\\\\cdright"],
    props: {
        numArgs: 1,
    },
    handler({parser, funcName}, args) {
        return {
            type: "cdlabel",
            mode: parser.mode,
            side: funcName.slice(4),
            label: args[0],
        };
    },
    htmlBuilder(group, options) {
        const newOptions = options.havingStyle(options.style.sup());
        const label = buildCommon.wrapFragment(
            html.buildGroup(group.label, newOptions, options), options);
        label.classes.push("cd-label-" + group.side);
        label.style.bottom = (0.8 - label.depth) + "em";
        // Zero out label height & depth, so vertical align of arrow is set
        // by the arrow height, not by the label.
        label.height = 0;
        label.depth = 0;
        return label;
    },
    mathmlBuilder(group, options) {
        let label = new mathMLTree.MathNode("mrow",
            [mml.buildGroup(group.label, options)]);
        label = new mathMLTree.MathNode("mpadded", [label]);
        label.setAttribute("width", "0");
        if (group.side === "left") {
            label.setAttribute("lspace", "-1width");
        }
        // We have to guess at vertical alignment. We know the arrow is 1.8em tall,
        // But we don't know the height or depth of the label.
        label.setAttribute("voffset", "0.7em");
        label = new mathMLTree.MathNode("mstyle", [label]);
        label.setAttribute("displaystyle", "false");
        label.setAttribute("scriptlevel", "1");
        return label;
    },
});

defineFunction({
    type: "cdlabelparent",
    names: ["\\\\cdparent"],
    props: {
        numArgs: 1,
    },
    handler({parser}, args) {
        return {
            type: "cdlabelparent",
            mode: parser.mode,
            fragment: args[0],
        };
    },
    htmlBuilder(group, options) {
        // Wrap the vertical arrow and its labels.
        // The parent gets position: relative. The child gets position: absolute.
        // So CSS can locate the label correctly.
        const parent = buildCommon.wrapFragment(
            html.buildGroup(group.fragment, options), options
        );
        parent.classes.push("cd-vert-arrow");
        return parent;
    },
    mathmlBuilder(group, options) {
        return  new mathMLTree.MathNode("mrow",
        [mml.buildGroup(group.fragment, options)]);
    },
});
