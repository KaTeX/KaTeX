/* eslint no-constant-condition:0 */
const parseData = require("./parseData");
const ParseError = require("./ParseError");
const Style = require("./Style");

const ParseNode = parseData.ParseNode;

/**
 * Parse the body of the environment, with rows delimited by \\ and
 * columns delimited by &, and create a nested list in row-major order
 * with one group per cell.  If given an optional argument style
 * ("text", "display", etc.), then each cell is cast into that style.
 */
function parseArray(parser, result, style) {
    let row = [];
    const body = [row];
    const rowGaps = [];
    while (true) {
        let cell = parser.parseExpression(false, null);
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
            break;
        } else if (next === "\\\\" || next === "\\cr") {
            const cr = parser.parseFunction();
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

/*
 * An environment definition is very similar to a function definition:
 * it is declared with a name or a list of names, a set of properties
 * and a handler containing the actual implementation.
 *
 * The properties include:
 *  - numArgs: The number of arguments after the \begin{name} function.
 *  - argTypes: (optional) Just like for a function
 *  - allowedInText: (optional) Whether or not the environment is allowed inside
 *                   text mode (default false) (not enforced yet)
 *  - numOptionalArgs: (optional) Just like for a function
 * A bare number instead of that object indicates the numArgs value.
 *
 * The handler function will receive two arguments
 *  - context: information and references provided by the parser
 *  - args: an array of arguments passed to \begin{name}
 * The context contains the following properties:
 *  - envName: the name of the environment, one of the listed names.
 *  - parser: the parser object
 *  - lexer: the lexer object
 *  - positions: the positions associated with these arguments from args.
 * The handler must return a ParseResult.
 */

function defineEnvironment(names, props, handler) {
    if (typeof names === "string") {
        names = [names];
    }
    if (typeof props === "number") {
        props = { numArgs: props };
    }
    // Set default values of environments
    const data = {
        numArgs: props.numArgs || 0,
        argTypes: props.argTypes,
        greediness: 1,
        allowedInText: !!props.allowedInText,
        numOptionalArgs: props.numOptionalArgs || 0,
        handler: handler,
    };
    for (let i = 0; i < names.length; ++i) {
        module.exports[names[i]] = data;
    }
}

// Decides on a style for cells in an array according to whether the given
// environment name starts with the letter 'd'.
function dCellStyle(envName) {
    if (envName.substr(0, 1) === "d") {
        return "display";
    } else {
        return "text";
    }
}

// Arrays are part of LaTeX, defined in lttab.dtx so its documentation
// is part of the source2e.pdf file of LaTeX2e source documentation.
// {darray} is an {array} environment where cells are set in \displaystyle,
// as defined in nccmath.sty.
defineEnvironment(["array", "darray"], {
    numArgs: 1,
}, function(context, args) {
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
});

// The matrix environments of amsmath builds on the array environment
// of LaTeX, which is discussed above.
defineEnvironment([
    "matrix",
    "pmatrix",
    "bmatrix",
    "Bmatrix",
    "vmatrix",
    "Vmatrix",
], {
}, function(context) {
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
});

// A cases environment (in amsmath.sty) is almost equivalent to
// \def\arraystretch{1.2}%
// \left\{\begin{array}{@{}l@{\quad}l@{}} … \end{array}\right.
// {dcases} is a {cases} environment where cells are set in \displaystyle,
// as defined in mathtools.sty.
defineEnvironment([
    "cases",
    "dcases",
], {
}, function(context) {
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
            postgap: Style.TEXT.metrics.quad,
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
});

// An aligned environment is like the align* environment
// except it operates within math mode.
// Note that we assume \nomallineskiplimit to be zero,
// so that \strut@ is the same as \strut.
defineEnvironment("aligned", {
}, function(context) {
    let res = {
        type: "array",
        cols: [],
    };
    res = parseArray(context.parser, res);
    const emptyGroup = new ParseNode("ordgroup", [], context.mode);
    let numCols = 0;
    res.value.body.forEach(function(row) {
        for (let i = 1; i < row.length; i += 2) {
            row[i].value.unshift(emptyGroup);
        }
        if (numCols < row.length) {
            numCols = row.length;
        }
    });
    for (let i = 0; i < numCols; ++i) {
        let align = "r";
        let pregap = 0;
        if (i % 2 === 1) {
            align = "l";
        } else if (i > 0) {
            pregap = 2; // one \qquad between columns
        }
        res.value.cols[i] = {
            type: "align",
            align: align,
            pregap: pregap,
            postgap: 0,
        };
    }
    return res;
});
