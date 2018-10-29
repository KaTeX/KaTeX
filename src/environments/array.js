// @flow
import buildCommon from "../buildCommon";
import defineEnvironment from "../defineEnvironment";
import defineFunction from "../defineFunction";
import mathMLTree from "../mathMLTree";
import ParseError from "../ParseError";
import {assertNodeType, assertSymbolNodeType} from "../parseNode";
import {checkNodeType, checkSymbolNodeType} from "../parseNode";
import {calculateSize} from "../units";
import utils from "../utils";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

import type Parser from "../Parser";
import type {ParseNode, AnyParseNode} from "../parseNode";
import type {StyleStr} from "../types";
import type {HtmlBuilder, MathMLBuilder} from "../defineFunction";

// Data stored in the ParseNode associated with the environment.
export type AlignSpec = { type: "separator", separator: string } | {
    type: "align",
    align: string,
    pregap?: number,
    postgap?: number,
};

function getHLines(parser: Parser): boolean[] {
    // Return an array. The array length = number of hlines.
    // Each element in the array tells if the line is dashed.
    const hlineInfo = [];
    parser.consumeSpaces();
    let nxt = parser.nextToken.text;
    while (nxt === "\\hline" || nxt === "\\hdashline") {
        parser.consume();
        hlineInfo.push(nxt === "\\hdashline");
        parser.consumeSpaces();
        nxt = parser.nextToken.text;
    }
    return hlineInfo;
}

/**
 * Parse the body of the environment, with rows delimited by \\ and
 * columns delimited by &, and create a nested list in row-major order
 * with one group per cell.  If given an optional argument style
 * ("text", "display", etc.), then each cell is cast into that style.
 */
function parseArray(
    parser: Parser,
    {hskipBeforeAndAfter, addJot, cols, arraystretch}: {|
        hskipBeforeAndAfter?: boolean,
        addJot?: boolean,
        cols?: AlignSpec[],
        arraystretch?: number,
    |},
    style: StyleStr,
): ParseNode<"array"> {
    // Parse body of array with \\ temporarily mapped to \cr
    parser.gullet.beginGroup();
    parser.gullet.macros.set("\\\\", "\\cr");

    // Get current arraystretch if it's not set by the environment
    if (!arraystretch) {
        const stretch = parser.gullet.expandMacroAsText("\\arraystretch");
        if (stretch == null) {
            // Default \arraystretch from lttab.dtx
            arraystretch = 1;
        } else {
            arraystretch = parseFloat(stretch);
            if (!arraystretch || arraystretch < 0) {
                throw new ParseError(`Invalid \\arraystretch: ${stretch}`);
            }
        }
    }

    let row = [];
    const body = [row];
    const rowGaps = [];
    const hLinesBeforeRow = [];

    // Test for \hline at the top of the array.
    hLinesBeforeRow.push(getHLines(parser));

    while (true) {  // eslint-disable-line no-constant-condition
        let cell = parser.parseExpression(false, "\\cr");
        cell = {
            type: "ordgroup",
            mode: parser.mode,
            body: cell,
        };
        if (style) {
            cell = {
                type: "styling",
                mode: parser.mode,
                style,
                body: [cell],
            };
        }
        row.push(cell);
        const next = parser.nextToken.text;
        if (next === "&") {
            parser.consume();
        } else if (next === "\\end") {
            // Arrays terminate newlines with `\crcr` which consumes a `\cr` if
            // the last line is empty.
            // NOTE: Currently, `cell` is the last item added into `row`.
            if (row.length === 1 && cell.type === "styling" &&
                cell.body[0].body.length === 0) {
                body.pop();
            }
            if (hLinesBeforeRow.length < body.length + 1) {
                hLinesBeforeRow.push([]);
            }
            break;
        } else if (next === "\\cr") {
            const cr = assertNodeType(parser.parseFunction(), "cr");
            rowGaps.push(cr.size);

            // check for \hline(s) following the row separator
            hLinesBeforeRow.push(getHLines(parser));

            row = [];
            body.push(row);
        } else {
            throw new ParseError("Expected & or \\\\ or \\cr or \\end",
                                 parser.nextToken);
        }
    }
    parser.gullet.endGroup();
    return {
        type: "array",
        mode: parser.mode,
        addJot,
        arraystretch,
        body,
        cols,
        rowGaps,
        hskipBeforeAndAfter,
        hLinesBeforeRow,
    };
}


// Decides on a style for cells in an array according to whether the given
// environment name starts with the letter 'd'.
function dCellStyle(envName): StyleStr {
    if (envName.substr(0, 1) === "d") {
        return "display";
    } else {
        return "text";
    }
}

type Outrow = {
    [idx: number]: *,
    height: number,
    depth: number,
    pos: number,
};

const htmlBuilder: HtmlBuilder<"array"> = function(group, options) {
    let r;
    let c;
    const nr = group.body.length;
    const hLinesBeforeRow = group.hLinesBeforeRow;
    let nc = 0;
    let body = new Array(nr);
    const hlines = [];

    // Horizontal spacing
    const pt = 1 / options.fontMetrics().ptPerEm;
    const arraycolsep = 5 * pt; // \arraycolsep in article.cls

    // Vertical spacing
    const baselineskip = 12 * pt; // see size10.clo
    // Default \jot from ltmath.dtx
    // TODO(edemaine): allow overriding \jot via \setlength (#687)
    const jot = 3 * pt;
    const arrayskip = group.arraystretch * baselineskip;
    const arstrutHeight = 0.7 * arrayskip; // \strutbox in ltfsstrc.dtx and
    const arstrutDepth = 0.3 * arrayskip;  // \@arstrutbox in lttab.dtx

    let totalHeight = 0;

    // Set a position for \hline(s) at the top of the array, if any.
    function setHLinePos(hlinesInGap: boolean[]) {
        for (let i = 0; i < hlinesInGap.length; ++i) {
            if (i > 0) {
                totalHeight += 0.25;
            }
            hlines.push({pos: totalHeight, isDashed: hlinesInGap[i]});
        }
    }
    setHLinePos(hLinesBeforeRow[0]);

    for (r = 0; r < group.body.length; ++r) {
        const inrow = group.body[r];
        let height = arstrutHeight; // \@array adds an \@arstrut
        let depth = arstrutDepth;   // to each tow (via the template)

        if (nc < inrow.length) {
            nc = inrow.length;
        }

        const outrow: Outrow = (new Array(inrow.length): any);
        for (c = 0; c < inrow.length; ++c) {
            const elt = html.buildGroup(inrow[c], options);
            if (depth < elt.depth) {
                depth = elt.depth;
            }
            if (height < elt.height) {
                height = elt.height;
            }
            outrow[c] = elt;
        }

        const rowGap = group.rowGaps[r];
        let gap = 0;
        if (rowGap) {
            gap = calculateSize(rowGap, options);
            if (gap > 0) { // \@argarraycr
                gap += arstrutDepth;
                if (depth < gap) {
                    depth = gap; // \@xargarraycr
                }
                gap = 0;
            }
        }
        // In AMS multiline environments such as aligned and gathered, rows
        // correspond to lines that have additional \jot added to the
        // \baselineskip via \openup.
        if (group.addJot) {
            depth += jot;
        }

        outrow.height = height;
        outrow.depth = depth;
        totalHeight += height;
        outrow.pos = totalHeight;
        totalHeight += depth + gap; // \@yargarraycr
        body[r] = outrow;

        // Set a position for \hline(s), if any.
        setHLinePos(hLinesBeforeRow[r + 1]);
    }

    const offset = totalHeight / 2 + options.fontMetrics().axisHeight;
    const colDescriptions = group.cols || [];
    const cols = [];
    let colSep;
    let colDescrNum;
    for (c = 0, colDescrNum = 0;
         // Continue while either there are more columns or more column
         // descriptions, so trailing separators don't get lost.
         c < nc || colDescrNum < colDescriptions.length;
         ++c, ++colDescrNum) {

        let colDescr = colDescriptions[colDescrNum] || {};

        let firstSeparator = true;
        while (colDescr.type === "separator") {
            // If there is more than one separator in a row, add a space
            // between them.
            if (!firstSeparator) {
                colSep = buildCommon.makeSpan(["arraycolsep"], []);
                colSep.style.width =
                    options.fontMetrics().doubleRuleSep + "em";
                cols.push(colSep);
            }

            if (colDescr.separator === "|") {
                const separator = buildCommon.makeSpan(
                    ["vertical-separator"], [], options
                );
                separator.style.height = totalHeight + "em";
                separator.style.verticalAlign =
                    -(totalHeight - offset) + "em";

                cols.push(separator);
            } else if (colDescr.separator === ":") {
                const separator = buildCommon.makeSpan(
                    ["vertical-separator", "vs-dashed"], [], options
                );
                separator.style.height = totalHeight + "em";
                separator.style.verticalAlign =
                    -(totalHeight - offset) + "em";

                cols.push(separator);
            } else {
                throw new ParseError(
                    "Invalid separator type: " + colDescr.separator);
            }

            colDescrNum++;
            colDescr = colDescriptions[colDescrNum] || {};
            firstSeparator = false;
        }

        if (c >= nc) {
            continue;
        }

        let sepwidth;
        if (c > 0 || group.hskipBeforeAndAfter) {
            sepwidth = utils.deflt(colDescr.pregap, arraycolsep);
            if (sepwidth !== 0) {
                colSep = buildCommon.makeSpan(["arraycolsep"], []);
                colSep.style.width = sepwidth + "em";
                cols.push(colSep);
            }
        }

        let col = [];
        for (r = 0; r < nr; ++r) {
            const row = body[r];
            const elem = row[c];
            if (!elem) {
                continue;
            }
            const shift = row.pos - offset;
            elem.depth = row.depth;
            elem.height = row.height;
            col.push({type: "elem", elem: elem, shift: shift});
        }

        col = buildCommon.makeVList({
            positionType: "individualShift",
            children: col,
        }, options);
        col = buildCommon.makeSpan(
            ["col-align-" + (colDescr.align || "c")],
            [col]);
        cols.push(col);

        if (c < nc - 1 || group.hskipBeforeAndAfter) {
            sepwidth = utils.deflt(colDescr.postgap, arraycolsep);
            if (sepwidth !== 0) {
                colSep = buildCommon.makeSpan(["arraycolsep"], []);
                colSep.style.width = sepwidth + "em";
                cols.push(colSep);
            }
        }
    }
    body = buildCommon.makeSpan(["mtable"], cols);

    // Add \hline(s), if any.
    if (hlines.length > 0) {
        const line = buildCommon.makeLineSpan("hline", options, 0.05);
        const dashes = buildCommon.makeLineSpan("hdashline", options, 0.05);
        const vListElems = [{type: "elem", elem: body, shift: 0}];
        while (hlines.length > 0) {
            const hline = hlines.pop();
            const lineShift = hline.pos - offset;
            if (hline.isDashed) {
                vListElems.push({type: "elem", elem: dashes, shift: lineShift});
            } else {
                vListElems.push({type: "elem", elem: line, shift: lineShift});
            }
        }
        body = buildCommon.makeVList({
            positionType: "individualShift",
            children: vListElems,
        }, options);
    }

    return buildCommon.makeSpan(["mord"], [body], options);
};

const mathmlBuilder: MathMLBuilder<"array"> = function(group, options) {
    return new mathMLTree.MathNode(
        "mtable", group.body.map(function(row) {
            return new mathMLTree.MathNode(
                "mtr", row.map(function(cell) {
                    return new mathMLTree.MathNode(
                        "mtd", [mml.buildGroup(cell, options)]);
                }));
        }));
};

// Convenience function for aligned and alignedat environments.
const alignedHandler = function(context, args) {
    const cols = [];
    const res = parseArray(context.parser, {cols, addJot: true}, "display");

    // Determining number of columns.
    // 1. If the first argument is given, we use it as a number of columns,
    //    and makes sure that each row doesn't exceed that number.
    // 2. Otherwise, just count number of columns = maximum number
    //    of cells in each row ("aligned" mode -- isAligned will be true).
    //
    // At the same time, prepend empty group {} at beginning of every second
    // cell in each row (starting with second cell) so that operators become
    // binary.  This behavior is implemented in amsmath's \start@aligned.
    let numMaths;
    let numCols = 0;
    const emptyGroup = {
        type: "ordgroup",
        mode: context.mode,
        body: [],
    };
    const ordgroup = checkNodeType(args[0], "ordgroup");
    if (ordgroup) {
        let arg0 = "";
        for (let i = 0; i < ordgroup.body.length; i++) {
            const textord = assertNodeType(ordgroup.body[i], "textord");
            arg0 += textord.text;
        }
        numMaths = Number(arg0);
        numCols = numMaths * 2;
    }
    const isAligned = !numCols;
    res.body.forEach(function(row) {
        for (let i = 1; i < row.length; i += 2) {
            // Modify ordgroup node within styling node
            const styling = assertNodeType(row[i], "styling");
            const ordgroup = assertNodeType(styling.body[0], "ordgroup");
            ordgroup.body.unshift(emptyGroup);
        }
        if (!isAligned) { // Case 1
            const curMaths = row.length / 2;
            if (numMaths < curMaths) {
                throw new ParseError(
                    "Too many math in a row: " +
                    `expected ${numMaths}, but got ${curMaths}`,
                    row[0]);
            }
        } else if (numCols < row.length) { // Case 2
            numCols = row.length;
        }
    });

    // Adjusting alignment.
    // In aligned mode, we add one \qquad between columns;
    // otherwise we add nothing.
    for (let i = 0; i < numCols; ++i) {
        let align = "r";
        let pregap = 0;
        if (i % 2 === 1) {
            align = "l";
        } else if (i > 0 && isAligned) { // "aligned" mode.
            pregap = 1; // add one \quad
        }
        cols[i] = {
            type: "align",
            align: align,
            pregap: pregap,
            postgap: 0,
        };
    }
    return res;
};

// Arrays are part of LaTeX, defined in lttab.dtx so its documentation
// is part of the source2e.pdf file of LaTeX2e source documentation.
// {darray} is an {array} environment where cells are set in \displaystyle,
// as defined in nccmath.sty.
defineEnvironment({
    type: "array",
    names: ["array", "darray"],
    props: {
        numArgs: 1,
    },
    handler(context, args) {
        // Since no types are specified above, the two possibilities are
        // - The argument is wrapped in {} or [], in which case Parser's
        //   parseGroup() returns an "ordgroup" wrapping some symbol node.
        // - The argument is a bare symbol node.
        const symNode = checkSymbolNodeType(args[0]);
        const colalign: AnyParseNode[] =
            symNode ? [args[0]] : assertNodeType(args[0], "ordgroup").body;
        const cols = colalign.map(function(nde) {
            const node = assertSymbolNodeType(nde);
            const ca = node.text;
            if ("lcr".indexOf(ca) !== -1) {
                return {
                    type: "align",
                    align: ca,
                };
            } else if (ca === "|") {
                return {
                    type: "separator",
                    separator: "|",
                };
            } else if (ca === ":") {
                return {
                    type: "separator",
                    separator: ":",
                };
            }
            throw new ParseError("Unknown column alignment: " + ca, nde);
        });
        const res = {
            cols,
            hskipBeforeAndAfter: true, // \@preamble in lttab.dtx
        };
        return parseArray(context.parser, res, dCellStyle(context.envName));
    },
    htmlBuilder,
    mathmlBuilder,
});

// The matrix environments of amsmath builds on the array environment
// of LaTeX, which is discussed above.
defineEnvironment({
    type: "array",
    names: [
        "matrix",
        "pmatrix",
        "bmatrix",
        "Bmatrix",
        "vmatrix",
        "Vmatrix",
    ],
    props: {
        numArgs: 0,
    },
    handler(context) {
        const delimiters = {
            "matrix": null,
            "pmatrix": ["(", ")"],
            "bmatrix": ["[", "]"],
            "Bmatrix": ["\\{", "\\}"],
            "vmatrix": ["|", "|"],
            "Vmatrix": ["\\Vert", "\\Vert"],
        }[context.envName];
        // \hskip -\arraycolsep in amsmath
        const payload = {hskipBeforeAndAfter: false};
        const res: ParseNode<"array"> =
            parseArray(context.parser, payload, dCellStyle(context.envName));
        return delimiters ? {
            type: "leftright",
            mode: context.mode,
            body: [res],
            left: delimiters[0],
            right: delimiters[1],
        } : res;
    },
    htmlBuilder,
    mathmlBuilder,
});

// A cases environment (in amsmath.sty) is almost equivalent to
// \def\arraystretch{1.2}%
// \left\{\begin{array}{@{}l@{\quad}l@{}} … \end{array}\right.
// {dcases} is a {cases} environment where cells are set in \displaystyle,
// as defined in mathtools.sty.
defineEnvironment({
    type: "array",
    names: [
        "cases",
        "dcases",
    ],
    props: {
        numArgs: 0,
    },
    handler(context) {
        const payload = {
            arraystretch: 1.2,
            cols: [{
                type: "align",
                align: "l",
                pregap: 0,
                // TODO(kevinb) get the current style.
                // For now we use the metrics for TEXT style which is what we were
                // doing before.  Before attempting to get the current style we
                // should look at TeX's behavior especially for \over and matrices.
                postgap: 1.0, /* 1em quad */
            }, {
                type: "align",
                align: "l",
                pregap: 0,
                postgap: 0,
            }],
        };
        const res: ParseNode<"array"> =
            parseArray(context.parser, payload, dCellStyle(context.envName));
        return {
            type: "leftright",
            mode: context.mode,
            body: [res],
            left: "\\{",
            right: ".",
        };
    },
    htmlBuilder,
    mathmlBuilder,
});

// An aligned environment is like the align* environment
// except it operates within math mode.
// Note that we assume \nomallineskiplimit to be zero,
// so that \strut@ is the same as \strut.
defineEnvironment({
    type: "array",
    names: ["aligned"],
    props: {
        numArgs: 0,
    },
    handler: alignedHandler,
    htmlBuilder,
    mathmlBuilder,
});

// A gathered environment is like an array environment with one centered
// column, but where rows are considered lines so get \jot line spacing
// and contents are set in \displaystyle.
defineEnvironment({
    type: "array",
    names: ["gathered"],
    props: {
        numArgs: 0,
    },
    handler(context) {
        const res = {
            cols: [{
                type: "align",
                align: "c",
            }],
            addJot: true,
        };
        return parseArray(context.parser, res, "display");
    },
    htmlBuilder,
    mathmlBuilder,
});

// alignat environment is like an align environment, but one must explicitly
// specify maximum number of columns in each row, and can adjust spacing between
// each columns.
defineEnvironment({
    type: "array",
    names: ["alignedat"],
    // One for numbered and for unnumbered;
    // but, KaTeX doesn't supports math numbering yet,
    // they make no difference for now.
    props: {
        numArgs: 1,
    },
    handler: alignedHandler,
    htmlBuilder,
    mathmlBuilder,
});

// Catch \hline outside array environment
defineFunction({
    type: "text", // Doesn't matter what this is.
    names: ["\\hline", "\\hdashline"],
    props: {
        numArgs: 0,
        allowedInText: true,
        allowedInMath: true,
    },
    handler(context, args) {
        throw new ParseError(
            `${context.funcName} valid only within array environment`);
    },
});
