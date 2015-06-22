var utils = require("./utils");
var ParseError = require("./ParseError");

/* This file contains a list of functions that we parse, identified by
 * the calls to declareFunction.
 *
 * The first argument to declareFunction is a single name or a list of names.
 * All functions named in such a list will share a single implementation.
 *
 * Each declared function can have associated properties, which
 * include the following:
 *
 *  - numArgs: The number of arguments the function takes.
 *             If this is the only property, it can be passed as a number
 *             instead of an element of a properties object.
 *  - argTypes: (optional) An array corresponding to each argument of the
 *              function, giving the type of argument that should be parsed. Its
 *              length should be equal to `numArgs + numOptionalArgs`. Valid
 *              types:
 *               - "size": A size-like thing, such as "1em" or "5ex"
 *               - "color": An html color, like "#abc" or "blue"
 *               - "original": The same type as the environment that the
 *                             function being parsed is in (e.g. used for the
 *                             bodies of functions like \color where the first
 *                             argument is special and the second argument is
 *                             parsed normally)
 *              Other possible types (probably shouldn't be used)
 *               - "text": Text-like (e.g. \text)
 *               - "math": Normal math
 *              If undefined, this will be treated as an appropriate length
 *              array of "original" strings
 *  - greediness: (optional) The greediness of the function to use ungrouped
 *                arguments.
 *
 *                E.g. if you have an expression
 *                  \sqrt \frac 1 2
 *                since \frac has greediness=2 vs \sqrt's greediness=1, \frac
 *                will use the two arguments '1' and '2' as its two arguments,
 *                then that whole function will be used as the argument to
 *                \sqrt. On the other hand, the expressions
 *                  \frac \frac 1 2 3
 *                and
 *                  \frac \sqrt 1 2
 *                will fail because \frac and \frac have equal greediness
 *                and \sqrt has a lower greediness than \frac respectively. To
 *                make these parse, we would have to change them to:
 *                  \frac {\frac 1 2} 3
 *                and
 *                  \frac {\sqrt 1} 2
 *
 *                The default value is `1`
 *  - allowedInText: (optional) Whether or not the function is allowed inside
 *                   text mode (default false)
 *  - numOptionalArgs: (optional) The number of optional arguments the function
 *                     should parse. If the optional arguments aren't found,
 *                     `null` will be passed to the handler in their place.
 *                     (default 0)
 *
 * The last argument is that implementation, the handler for the function(s).
 * It is called to handle these functions and their arguments.
 * Its own arguments are:
 * - func: the text of the function
 * - [args]: the next arguments are the arguments to the function,
 *           of which there are numArgs of them
 * - positions: the positions in the overall string of the function
 *              and the arguments. Should only be used to produce
 *              error messages
 * The handler is called with `this` referring to the parser.
 * The function should return an object with the following keys:
 * - type: The type of element that this is. This is then used in
 *         buildHTML/buildMathML to determine which function
 *         should be called to build this node into a DOM node
 * Any other data can be added to the object, which will be passed
 * in to the function in buildHTML/buildMathML as `group.value`.
 */

function declareFunction(names, props, handler) {
    if (typeof names === "string") {
        names = [names];
    }
    if (typeof props === "number") {
        props = { numArgs: props };
    }
    // Set default values of functions
    var data = {
        numArgs: props.numArgs,
        argTypes: props.argTypes,
        greediness: (props.greediness === undefined) ? 1 : props.greediness,
        allowedInText: !!props.allowedInText,
        numOptionalArgs: props.numOptionalArgs || 0,
        handler: handler
    };
    for (var i = 0; i < names.length; ++i) {
        module.exports[names[i]] = data;
    }
}

// A normal square root
declareFunction("\\sqrt", {
    numArgs: 1,
    numOptionalArgs: 1
}, function(func, index, body, positions) {
    return {
        type: "sqrt",
        body: body,
        index: index
    };
});

// Some non-mathy text
declareFunction("\\text", {
    numArgs: 1,
    argTypes: ["text"],
    greediness: 2
}, function(func, body) {
    // Since the corresponding buildHTML/buildMathML function expects a
    // list of elements, we normalize for different kinds of arguments
    // TODO(emily): maybe this should be done somewhere else
    var inner;
    if (body.type === "ordgroup") {
        inner = body.value;
    } else {
        inner = [body];
    }

    return {
        type: "text",
        body: inner
    };
});

// A two-argument custom color
declareFunction("\\color", {
    numArgs: 2,
    allowedInText: true,
    greediness: 3,
    argTypes: ["color", "original"]
}, function(func, color, body) {
    // Normalize the different kinds of bodies (see \text above)
    var inner;
    if (body.type === "ordgroup") {
        inner = body.value;
    } else {
        inner = [body];
    }

    return {
        type: "color",
        color: color.value,
        value: inner
    };
});

// An overline
declareFunction("\\overline", {
    numArgs: 1
}, function(func, body) {
    return {
        type: "overline",
        body: body
    };
});

// A box of the width and height
declareFunction("\\rule", {
    numArgs: 2,
    numOptionalArgs: 1,
    argTypes: ["size", "size", "size"]
}, function(func, shift, width, height) {
    return {
        type: "rule",
        shift: shift && shift.value,
        width: width.value,
        height: height.value
    };
});

// A KaTeX logo
declareFunction("\\KaTeX", {
    numArgs: 0
}, function(func) {
    return {
        type: "katex"
    };
});

declareFunction("\\phantom", {
    numArgs: 1
}, function(func, body) {
    var inner;
    if (body.type === "ordgroup") {
        inner = body.value;
    } else {
        inner = [body];
    }

    return {
        type: "phantom",
        value: inner
    };
});

// Extra data needed for the delimiter handler down below
var delimiterSizes = {
    "\\bigl" : {type: "open",    size: 1},
    "\\Bigl" : {type: "open",    size: 2},
    "\\biggl": {type: "open",    size: 3},
    "\\Biggl": {type: "open",    size: 4},
    "\\bigr" : {type: "close",   size: 1},
    "\\Bigr" : {type: "close",   size: 2},
    "\\biggr": {type: "close",   size: 3},
    "\\Biggr": {type: "close",   size: 4},
    "\\bigm" : {type: "rel",     size: 1},
    "\\Bigm" : {type: "rel",     size: 2},
    "\\biggm": {type: "rel",     size: 3},
    "\\Biggm": {type: "rel",     size: 4},
    "\\big"  : {type: "textord", size: 1},
    "\\Big"  : {type: "textord", size: 2},
    "\\bigg" : {type: "textord", size: 3},
    "\\Bigg" : {type: "textord", size: 4}
};

var delimiters = [
    "(", ")", "[", "\\lbrack", "]", "\\rbrack",
    "\\{", "\\lbrace", "\\}", "\\rbrace",
    "\\lfloor", "\\rfloor", "\\lceil", "\\rceil",
    "<", ">", "\\langle", "\\rangle",
    "/", "\\backslash",
    "|", "\\vert", "\\|", "\\Vert",
    "\\uparrow", "\\Uparrow",
    "\\downarrow", "\\Downarrow",
    "\\updownarrow", "\\Updownarrow",
    "."
];

// Single-argument color functions
declareFunction([
    "\\blue", "\\orange", "\\pink", "\\red",
    "\\green", "\\gray", "\\purple",
    "\\blueA", "\\blueB", "\\blueC", "\\blueD", "\\blueE",
    "\\tealA", "\\tealB", "\\tealC", "\\tealD", "\\tealE",
    "\\greenA", "\\greenB", "\\greenC", "\\greenD", "\\greenE",
    "\\goldA", "\\goldB", "\\goldC", "\\goldD", "\\goldE",
    "\\redA", "\\redB", "\\redC", "\\redD", "\\redE",
    "\\maroonA", "\\maroonB", "\\maroonC", "\\maroonD", "\\maroonE",
    "\\purpleA", "\\purpleB", "\\purpleC", "\\purpleD", "\\purpleE",
    "\\mintA", "\\mintB", "\\mintC",
    "\\grayA", "\\grayB", "\\grayC", "\\grayD", "\\grayE",
    "\\grayF", "\\grayG", "\\grayH", "\\grayI",
    "\\kaBlue", "\\kaGreen"
], {
    numArgs: 1,
    allowedInText: true,
    greediness: 3
}, function(func, body) {
    var atoms;
    if (body.type === "ordgroup") {
        atoms = body.value;
    } else {
        atoms = [body];
    }

    return {
        type: "color",
        color: "katex-" + func.slice(1),
        value: atoms
    };
});

// There are 2 flags for operators; whether they produce limits in
// displaystyle, and whether they are symbols and should grow in
// displaystyle. These four groups cover the four possible choices.

// No limits, not symbols
declareFunction([
    "\\arcsin", "\\arccos", "\\arctan", "\\arg", "\\cos", "\\cosh",
    "\\cot", "\\coth", "\\csc", "\\deg", "\\dim", "\\exp", "\\hom",
    "\\ker", "\\lg", "\\ln", "\\log", "\\sec", "\\sin", "\\sinh",
    "\\tan","\\tanh"
], {
    numArgs: 0
}, function(func) {
    return {
        type: "op",
        limits: false,
        symbol: false,
        body: func
    };
});

// Limits, not symbols
declareFunction([
    "\\det", "\\gcd", "\\inf", "\\lim", "\\liminf", "\\limsup", "\\max",
    "\\min", "\\Pr", "\\sup"
], {
    numArgs: 0
}, function(func) {
    return {
        type: "op",
        limits: true,
        symbol: false,
        body: func
    };
});

// No limits, symbols
declareFunction([
    "\\int", "\\iint", "\\iiint", "\\oint"
], {
    numArgs: 0
}, function(func) {
    return {
        type: "op",
        limits: false,
        symbol: true,
        body: func
    };
});

// Limits, symbols
declareFunction([
    "\\coprod", "\\bigvee", "\\bigwedge", "\\biguplus", "\\bigcap",
    "\\bigcup", "\\intop", "\\prod", "\\sum", "\\bigotimes",
    "\\bigoplus", "\\bigodot", "\\bigsqcup", "\\smallint"
], {
    numArgs: 0
}, function(func) {
    return {
        type: "op",
        limits: true,
        symbol: true,
        body: func
    };
});

// Fractions
declareFunction([
    "\\dfrac", "\\frac", "\\tfrac",
    "\\dbinom", "\\binom", "\\tbinom"
], {
    numArgs: 2,
    greediness: 2
}, function(func, numer, denom) {
    var hasBarLine;
    var leftDelim = null;
    var rightDelim = null;
    var size = "auto";

    switch (func) {
    case "\\dfrac":
    case "\\frac":
    case "\\tfrac":
        hasBarLine = true;
        break;
    case "\\dbinom":
    case "\\binom":
    case "\\tbinom":
        hasBarLine = false;
        leftDelim = "(";
        rightDelim = ")";
        break;
    default:
        throw new Error("Unrecognized genfrac command");
    }

    switch (func) {
    case "\\dfrac":
    case "\\dbinom":
        size = "display";
        break;
    case "\\tfrac":
    case "\\tbinom":
        size = "text";
        break;
    }

    return {
        type: "genfrac",
        numer: numer,
        denom: denom,
        hasBarLine: hasBarLine,
        leftDelim: leftDelim,
        rightDelim: rightDelim,
        size: size
    };
});

// Left and right overlap functions
declareFunction(["\\llap", "\\rlap"], {
    numArgs: 1,
    allowedInText: true
}, function(func, body) {
    return {
        type: func.slice(1),
        body: body
    };
});

// Delimiter functions
declareFunction([
    "\\bigl", "\\Bigl", "\\biggl", "\\Biggl",
    "\\bigr", "\\Bigr", "\\biggr", "\\Biggr",
    "\\bigm", "\\Bigm", "\\biggm", "\\Biggm",
    "\\big",  "\\Big",  "\\bigg",  "\\Bigg",
    "\\left", "\\right"
], {
    numArgs: 1
}, function(func, delim, positions) {
    if (!utils.contains(delimiters, delim.value)) {
        throw new ParseError(
            "Invalid delimiter: '" + delim.value + "' after '" +
                func + "'",
            this.lexer, positions[1]);
    }

    // \left and \right are caught somewhere in Parser.js, which is
    // why this data doesn't match what is in buildHTML.
    if (func === "\\left" || func === "\\right") {
        return {
            type: "leftright",
            value: delim.value
        };
    } else {
        return {
            type: "delimsizing",
            size: delimiterSizes[func].size,
            delimType: delimiterSizes[func].type,
            value: delim.value
        };
    }
});

// Sizing functions (handled in Parser.js explicitly, hence no handler)
declareFunction([
    "\\tiny", "\\scriptsize", "\\footnotesize", "\\small",
    "\\normalsize", "\\large", "\\Large", "\\LARGE", "\\huge", "\\Huge"
], 0, null);

// Style changing functions (handled in Parser.js explicitly, hence no
// handler)
declareFunction([
    "\\displaystyle", "\\textstyle", "\\scriptstyle",
    "\\scriptscriptstyle"
], 0, null);

// Accents
declareFunction([
    "\\acute", "\\grave", "\\ddot", "\\tilde", "\\bar", "\\breve",
    "\\check", "\\hat", "\\vec", "\\dot"
    // We don't support expanding accents yet
    // "\\widetilde", "\\widehat"
], {
    numArgs: 1
}, function(func, base) {
    return {
        type: "accent",
        accent: func,
        base: base
    };
});

// Infix generalized fractions
declareFunction(["\\over", "\\choose"], {
    numArgs: 0
}, function (func) {
    var replaceWith;
    switch (func) {
    case "\\over":
        replaceWith = "\\frac";
        break;
    case "\\choose":
        replaceWith = "\\binom";
        break;
    default:
        throw new Error("Unrecognized infix genfrac command");
    }
    return {
        type: "infix",
        replaceWith: replaceWith
    };
});

// Row breaks for aligned data
declareFunction(["\\\\", "\\cr"], {
    numArgs: 0,
    numOptionalArgs: 1,
    argTypes: ["size"]
}, function(func, size) {
    return {
        type: "cr",
        size: size
    };
});

// Environment delimiters
declareFunction(["\\begin", "\\end"], {
    numArgs: 1,
    argTypes: ["text"]
}, function(func, nameGroup, positions) {
    if (nameGroup.type !== "ordgroup") {
        throw new ParseError(
            "Invalid environment name",
            this.lexer, positions[1]);
    }
    var name = "";
    for (var i = 0; i < nameGroup.value.length; ++i) {
        name += nameGroup.value[i].value;
    }
    return {
        type: "environment",
        name: name,
        namepos: positions[1]
    };
});
