// @flow
import buildCommon from "../buildCommon";
import defineEnvironment from "../defineEnvironment";
import mathMLTree from "../mathMLTree";
import ParseError from "../ParseError";
import ParseNode from "../ParseNode";
import {calculateSize} from "../units";
import utils from "../utils";
import stretchy from "../stretchy";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

import type Parser from "../Parser";
import type {StyleStr} from "../types";

// Data stored in the ParseNode associated with the environment.
type AlignSpec = { type: "separator", separator: string } | {
    type: "align",
    align: string,
    pregap?: number,
    postgap?: number,
};
type ArrayEnvNodeData = {
    type: "array",
    hskipBeforeAndAfter?: boolean,
    arraystretch?: number,
    addJot?: boolean,
    cols?: AlignSpec[],
    // These fields are always set, but not on struct construction
    // initialization.
    body?: ParseNode[][], // List of rows in the (2D) array.
    rowGaps?: number[],
};

/**
 * Parse the body of the environment, with rows delimited by \\ and
 * columns delimited by &, and create a nested list in row-major order
 * with one group per cell.  If given an optional argument style
 * ("text", "display", etc.), then each cell is cast into that style.
 */
function parseArray(
    parser: Parser,
    result: ArrayEnvNodeData,
    style: StyleStr,
): ParseNode {
    let row = [];
    const body = [row];
    const rowGaps = [];
    while (true) {  // eslint-disable-line no-constant-condition
        let cell = parser.parseExpression(false, undefined);
        cell = new ParseNode("ordgroup", cell, parser.mode);
        if (style) {
            cell = new ParseNode("styling", {
                style: style,
                value: [cell],
            }, parser.mode);
        }
        row.push(cell);
        const next = parser.nextToken.text;
        if (next === "&") {
            parser.consume();
        } else if (next === "\\end") {
            // Arrays terminate newlines with `\crcr` which consumes a `\cr` if
            // the last line is empty.
            const lastRow = body[body.length - 1];
            if (body.length > 1
                && lastRow.length === 1
                && lastRow[0].value.value[0].value.length === 0) {
                body.pop();
            }
            break;
        } else if (next === "\\\\" || next === "\\cr") {
            const cr = parser.parseFunction();
            if (!cr) {
                throw new ParseError(`Failed to parse function after ${next}`);
            }
            rowGaps.push(cr.value.size);
            row = [];
            body.push(row);
        } else {
            throw new ParseError("Expected & or \\\\ or \\end",
                                 parser.nextToken);
        }
    }
    result.body = body;
    result.rowGaps = rowGaps;
    return new ParseNode(result.type, result, parser.mode);
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

const htmlBuilder = function(group, options) {
    let r;
    let c;
    const nr = group.value.body.length;
    let nc = 0;
    let body = new Array(nr);

    // Horizontal spacing
    const pt = 1 / options.fontMetrics().ptPerEm;
    const arraycolsep = 5 * pt; // \arraycolsep in article.cls

    // Vertical spacing
    const baselineskip = 12 * pt; // see size10.clo
    // Default \jot from ltmath.dtx
    // TODO(edemaine): allow overriding \jot via \setlength (#687)
    const jot = 3 * pt;
    // Default \arraystretch from lttab.dtx
    // TODO(gagern): may get redefined once we have user-defined macros
    const arraystretch = utils.deflt(group.value.arraystretch, 1);
    const arrayskip = arraystretch * baselineskip;
    const arstrutHeight = 0.7 * arrayskip; // \strutbox in ltfsstrc.dtx and
    const arstrutDepth = 0.3 * arrayskip;  // \@arstrutbox in lttab.dtx

    let totalHeight = 0;
    for (r = 0; r < group.value.body.length; ++r) {
        const inrow = group.value.body[r];
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

        let gap = 0;
        if (group.value.rowGaps[r]) {
            gap = calculateSize(group.value.rowGaps[r].value, options);
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
        if (group.value.addJot) {
            depth += jot;
        }

        outrow.height = height;
        outrow.depth = depth;
        totalHeight += height;
        outrow.pos = totalHeight;
        totalHeight += depth + gap; // \@yargarraycr
        body[r] = outrow;
    }

    const offset = totalHeight / 2 + options.fontMetrics().axisHeight;
    const colDescriptions = group.value.cols || [];
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
                const separator = stretchy.ruleSpan("vertical-separator", 0.05,
                    options);
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
        if (c > 0 || group.value.hskipBeforeAndAfter) {
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

        if (c < nc - 1 || group.value.hskipBeforeAndAfter) {
            sepwidth = utils.deflt(colDescr.postgap, arraycolsep);
            if (sepwidth !== 0) {
                colSep = buildCommon.makeSpan(["arraycolsep"], []);
                colSep.style.width = sepwidth + "em";
                cols.push(colSep);
            }
        }
    }
    body = buildCommon.makeSpan(["mtable"], cols);
    return buildCommon.makeSpan(["mord"], [body], options);
};

const mathmlBuilder = function(group, options) {
    return new mathMLTree.MathNode(
        "mtable", group.value.body.map(function(row) {
            return new mathMLTree.MathNode(
                "mtr", row.map(function(cell) {
                    return new mathMLTree.MathNode(
                        "mtd", [mml.buildGroup(cell, options)]);
                }));
        }));
};

// Convinient function for aligned and alignedat environments.
const alignedHandler = function(context, args) {
    let res = {
        type: "array",
        cols: [],
        addJot: true,
    };
    res = parseArray(context.parser, res, "display");

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
    const emptyGroup = new ParseNode("ordgroup", [], context.mode);
    if (args[0] && args[0].value) {
        let arg0 = "";
        for (let i = 0; i < args[0].value.length; i++) {
            arg0 += args[0].value[i].value;
        }
        numMaths = Number(arg0);
        numCols = numMaths * 2;
    }
    const isAligned = !numCols;
    res.value.body.forEach(function(row) {
        for (let i = 1; i < row.length; i += 2) {
            // Modify ordgroup node within styling node
            const ordgroup = row[i].value.value[0];
            ordgroup.value.unshift(emptyGroup);
        }
        if (!isAligned) { // Case 1
            const curMaths = row.length / 2;
            if (numMaths < curMaths) {
                throw new ParseError(
                    "Too many math in a row: " +
                    `expected ${numMaths}, but got ${curMaths}`,
                    row);
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
        res.value.cols[i] = {
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
    handler: function(context, args) {
        let colalign = args[0];
        colalign = colalign.value.map ? colalign.value : [colalign];
        const cols = colalign.map(function(node) {
            const ca = node.value;
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
            }
            throw new ParseError(
                "Unknown column alignment: " + node.value,
                node);
        });
        let res = {
            type: "array",
            cols: cols,
            hskipBeforeAndAfter: true, // \@preamble in lttab.dtx
        };
        res = parseArray(context.parser, res, dCellStyle(context.envName));
        return res;
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
    handler: function(context) {
        const delimiters = {
            "matrix": null,
            "pmatrix": ["(", ")"],
            "bmatrix": ["[", "]"],
            "Bmatrix": ["\\{", "\\}"],
            "vmatrix": ["|", "|"],
            "Vmatrix": ["\\Vert", "\\Vert"],
        }[context.envName];
        let res = {
            type: "array",
            hskipBeforeAndAfter: false, // \hskip -\arraycolsep in amsmath
        };
        res = parseArray(context.parser, res, dCellStyle(context.envName));
        if (delimiters) {
            res = new ParseNode("leftright", {
                body: [res],
                left: delimiters[0],
                right: delimiters[1],
            }, context.mode);
        }
        return res;
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
    handler: function(context) {
        let res = {
            type: "array",
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
        res = parseArray(context.parser, res, dCellStyle(context.envName));
        res = new ParseNode("leftright", {
            body: [res],
            left: "\\{",
            right: ".",
        }, context.mode);
        return res;
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
    handler: function(context) {
        let res = {
            type: "array",
            cols: [{
                type: "align",
                align: "c",
            }],
            addJot: true,
        };
        res = parseArray(context.parser, res, "display");
        return res;
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
