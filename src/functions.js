var utils = require("./utils");
var ParseError = require("./ParseError");
var parseData = require("./parseData");
var ParseNode = parseData.ParseNode;

/* This file contains a list of functions that we parse, identified by
 * the calls to defineFunction.
 *
 * The first argument to defineFunction is a single name or a list of names.
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
 *  - infix: (optional) Must be true if the function is an infix operator.
 *
 * The last argument is that implementation, the handler for the function(s).
 * It is called to handle these functions and their arguments.
 * It receives two arguments:
 *  - context contains information and references provided by the parser
 *  - args is an array of arguments obtained from TeX input
 * The context contains the following properties:
 *  - funcName: the text (i.e. name) of the function, including \
 *  - parser: the parser object
 *  - lexer: the lexer object
 *  - positions: the positions in the overall string of the function
 *               and the arguments.
 * The latter three should only be used to produce error messages.
 *
 * The function should return an object with the following keys:
 *  - type: The type of element that this is. This is then used in
 *          buildHTML/buildMathML to determine which function
 *          should be called to build this node into a DOM node
 * Any other data can be added to the object, which will be passed
 * in to the function in buildHTML/buildMathML as `group.value`.
 */

function defineFunction(names, props, handler) {
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
        infix: !!props.infix,
        handler: handler
    };
    for (var i = 0; i < names.length; ++i) {
        module.exports[names[i]] = data;
    }
}

// Since the corresponding buildHTML/buildMathML function expects a
// list of elements, we normalize for different kinds of arguments
var ordargument = function(arg) {
    if (arg.type === "ordgroup") {
        return arg.value;
    } else {
        return [arg];
    }
};

// A normal square root
defineFunction("\\sqrt", {
    numArgs: 1,
    numOptionalArgs: 1
}, function(context, args) {
    var index = args[0];
    var body = args[1];
    return {
        type: "sqrt",
        body: body,
        index: index
    };
});

// Non-mathy text, possibly in a font
var textFunctionStyles = {
    "\\text": undefined, "\\textrm": "mathrm", "\\textsf": "mathsf",
    "\\texttt": "mathtt", "\\textnormal": "mathrm", "\\textbf": "mathbf",
    "\\textit": "textit"
};

defineFunction([
    "\\text", "\\textrm", "\\textsf", "\\texttt", "\\textnormal",
    "\\textbf", "\\textit"
], {
    numArgs: 1,
    argTypes: ["text"],
    greediness: 2,
    allowedInText: true
}, function(context, args) {
    var body = args[0];
    return {
        type: "text",
        body: ordargument(body),
        style: textFunctionStyles[context.funcName]
    };
});

// A two-argument custom color
defineFunction("\\color", {
    numArgs: 2,
    allowedInText: true,
    greediness: 3,
    argTypes: ["color", "original"]
}, function(context, args) {
    var color = args[0];
    var body = args[1];
    return {
        type: "color",
        color: color.value,
        value: ordargument(body)
    };
});

// An overline
defineFunction("\\overline", {
    numArgs: 1
}, function(context, args) {
    var body = args[0];
    return {
        type: "overline",
        body: body
    };
});

// An underline
defineFunction("\\underline", {
    numArgs: 1
}, function(context, args) {
    var body = args[0];
    return {
        type: "underline",
        body: body
    };
});

// A box of the width and height
defineFunction("\\rule", {
    numArgs: 2,
    numOptionalArgs: 1,
    argTypes: ["size", "size", "size"]
}, function(context, args) {
    var shift = args[0];
    var width = args[1];
    var height = args[2];
    return {
        type: "rule",
        shift: shift && shift.value,
        width: width.value,
        height: height.value
    };
});

// TODO: In TeX, \mkern only accepts mu-units, and \kern does not accept
// mu-units. In current KaTeX we relax this; both commands accept any unit.
defineFunction(["\\kern", "\\mkern"], {
    numArgs: 1,
    argTypes: ["size"]
}, function(context, args) {
    return {
        type: "kern",
        dimension: args[0].value
    };
});

// A KaTeX logo
defineFunction("\\KaTeX", {
    numArgs: 0
}, function(context) {
    return {
        type: "katex"
    };
});

defineFunction("\\phantom", {
    numArgs: 1
}, function(context, args) {
    var body = args[0];
    return {
        type: "phantom",
        value: ordargument(body)
    };
});

// Math class commands except \mathop
defineFunction([
    "\\mathord", "\\mathbin", "\\mathrel", "\\mathopen",
    "\\mathclose", "\\mathpunct", "\\mathinner"
], {
    numArgs: 1
}, function(context, args) {
    var body = args[0];
    return {
        type: "mclass",
        mclass: "m" + context.funcName.substr(5),
        value: ordargument(body)
    };
});

// Build a relation by placing one symbol on top of another
defineFunction("\\stackrel", {
    numArgs: 2
}, function(context, args) {
    var top = args[0];
    var bottom = args[1];

    var bottomop = new ParseNode("op", {
        type: "op",
        limits: true,
        alwaysHandleSupSub: true,
        symbol: false,
        value: ordargument(bottom)
    }, bottom.mode);

    var supsub = new ParseNode("supsub", {
        base: bottomop,
        sup: top,
        sub: null
    }, top.mode);

    return {
        type: "mclass",
        mclass: "mrel",
        value: [supsub]
    };
});

// \mod-type functions
defineFunction("\\bmod", {
    numArgs: 0
}, function(context, args) {
    return {
        type: "mod",
        modType: "bmod",
        value: null
    };
});

defineFunction(["\\pod", "\\pmod", "\\mod"], {
    numArgs: 1
}, function(context, args) {
    var body = args[0];
    return {
        type: "mod",
        modType: context.funcName.substr(1),
        value: ordargument(body)
    };
});

// Extra data needed for the delimiter handler down below
var delimiterSizes = {
    "\\bigl" : {mclass: "mopen",    size: 1},
    "\\Bigl" : {mclass: "mopen",    size: 2},
    "\\biggl": {mclass: "mopen",    size: 3},
    "\\Biggl": {mclass: "mopen",    size: 4},
    "\\bigr" : {mclass: "mclose",   size: 1},
    "\\Bigr" : {mclass: "mclose",   size: 2},
    "\\biggr": {mclass: "mclose",   size: 3},
    "\\Biggr": {mclass: "mclose",   size: 4},
    "\\bigm" : {mclass: "mrel",     size: 1},
    "\\Bigm" : {mclass: "mrel",     size: 2},
    "\\biggm": {mclass: "mrel",     size: 3},
    "\\Biggm": {mclass: "mrel",     size: 4},
    "\\big"  : {mclass: "mord",     size: 1},
    "\\Big"  : {mclass: "mord",     size: 2},
    "\\bigg" : {mclass: "mord",     size: 3},
    "\\Bigg" : {mclass: "mord",     size: 4}
};

var delimiters = [
    "(", ")", "[", "\\lbrack", "]", "\\rbrack",
    "\\{", "\\lbrace", "\\}", "\\rbrace",
    "\\lfloor", "\\rfloor", "\\lceil", "\\rceil",
    "<", ">", "\\langle", "\\rangle", "\\lt", "\\gt",
    "\\lvert", "\\rvert", "\\lVert", "\\rVert",
    "\\lgroup", "\\rgroup", "\\lmoustache", "\\rmoustache",
    "/", "\\backslash",
    "|", "\\vert", "\\|", "\\Vert",
    "\\uparrow", "\\Uparrow",
    "\\downarrow", "\\Downarrow",
    "\\updownarrow", "\\Updownarrow",
    "."
];

var fontAliases = {
    "\\Bbb": "\\mathbb",
    "\\bold": "\\mathbf",
    "\\frak": "\\mathfrak"
};

// Single-argument color functions
defineFunction([
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
}, function(context, args) {
    var body = args[0];
    return {
        type: "color",
        color: "katex-" + context.funcName.slice(1),
        value: ordargument(body)
    };
});

// There are 2 flags for operators; whether they produce limits in
// displaystyle, and whether they are symbols and should grow in
// displaystyle. These four groups cover the four possible choices.

// No limits, not symbols
defineFunction([
    "\\arcsin", "\\arccos", "\\arctan", "\\arg", "\\cos", "\\cosh",
    "\\cot", "\\coth", "\\csc", "\\deg", "\\dim", "\\exp", "\\hom",
    "\\ker", "\\lg", "\\ln", "\\log", "\\sec", "\\sin", "\\sinh",
    "\\tan", "\\tanh"
], {
    numArgs: 0
}, function(context) {
    return {
        type: "op",
        limits: false,
        symbol: false,
        body: context.funcName
    };
});

// Limits, not symbols
defineFunction([
    "\\det", "\\gcd", "\\inf", "\\lim", "\\liminf", "\\limsup", "\\max",
    "\\min", "\\Pr", "\\sup"
], {
    numArgs: 0
}, function(context) {
    return {
        type: "op",
        limits: true,
        symbol: false,
        body: context.funcName
    };
});

// No limits, symbols
defineFunction([
    "\\int", "\\iint", "\\iiint", "\\oint"
], {
    numArgs: 0
}, function(context) {
    return {
        type: "op",
        limits: false,
        symbol: true,
        body: context.funcName
    };
});

// Limits, symbols
defineFunction([
    "\\coprod", "\\bigvee", "\\bigwedge", "\\biguplus", "\\bigcap",
    "\\bigcup", "\\intop", "\\prod", "\\sum", "\\bigotimes",
    "\\bigoplus", "\\bigodot", "\\bigsqcup", "\\smallint"
], {
    numArgs: 0
}, function(context) {
    return {
        type: "op",
        limits: true,
        symbol: true,
        body: context.funcName
    };
});

// \mathop class command
defineFunction("\\mathop", {
    numArgs: 1
}, function(context, args) {
    var body = args[0];
    return {
        type: "op",
        limits: false,
        symbol: false,
        value: ordargument(body)
    };
});

// Fractions
defineFunction([
    "\\dfrac", "\\frac", "\\tfrac",
    "\\dbinom", "\\binom", "\\tbinom",
    "\\\\atopfrac" // can’t be entered directly
], {
    numArgs: 2,
    greediness: 2
}, function(context, args) {
    var numer = args[0];
    var denom = args[1];
    var hasBarLine;
    var leftDelim = null;
    var rightDelim = null;
    var size = "auto";

    switch (context.funcName) {
        case "\\dfrac":
        case "\\frac":
        case "\\tfrac":
            hasBarLine = true;
            break;
        case "\\\\atopfrac":
            hasBarLine = false;
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

    switch (context.funcName) {
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
defineFunction(["\\llap", "\\rlap"], {
    numArgs: 1,
    allowedInText: true
}, function(context, args) {
    var body = args[0];
    return {
        type: context.funcName.slice(1),
        body: body
    };
});

// Delimiter functions
var checkDelimiter = function(delim, context) {
    if (utils.contains(delimiters, delim.value)) {
        return delim;
    } else {
        throw new ParseError(
            "Invalid delimiter: '" + delim.value + "' after '" +
            context.funcName + "'", delim);
    }
};

defineFunction([
    "\\bigl", "\\Bigl", "\\biggl", "\\Biggl",
    "\\bigr", "\\Bigr", "\\biggr", "\\Biggr",
    "\\bigm", "\\Bigm", "\\biggm", "\\Biggm",
    "\\big",  "\\Big",  "\\bigg",  "\\Bigg"
], {
    numArgs: 1
}, function(context, args) {
    var delim = checkDelimiter(args[0], context);

    return {
        type: "delimsizing",
        size: delimiterSizes[context.funcName].size,
        mclass: delimiterSizes[context.funcName].mclass,
        value: delim.value
    };
});

defineFunction([
    "\\left", "\\right"
], {
    numArgs: 1
}, function(context, args) {
    var delim = checkDelimiter(args[0], context);

    // \left and \right are caught somewhere in Parser.js, which is
    // why this data doesn't match what is in buildHTML.
    return {
        type: "leftright",
        value: delim.value
    };
});

defineFunction("\\middle", {
    numArgs: 1
}, function(context, args) {
    var delim = checkDelimiter(args[0], context);
    if (!context.parser.leftrightDepth) {
        throw new ParseError("\\middle without preceding \\left", delim);
    }

    return {
        type: "middle",
        value: delim.value
    };
});

// Sizing functions (handled in Parser.js explicitly, hence no handler)
defineFunction([
    "\\tiny", "\\scriptsize", "\\footnotesize", "\\small",
    "\\normalsize", "\\large", "\\Large", "\\LARGE", "\\huge", "\\Huge"
], 0, null);

// Style changing functions (handled in Parser.js explicitly, hence no
// handler)
defineFunction([
    "\\displaystyle", "\\textstyle", "\\scriptstyle",
    "\\scriptscriptstyle"
], 0, null);

defineFunction([
    // styles
    "\\mathrm", "\\mathit", "\\mathbf",

    // families
    "\\mathbb", "\\mathcal", "\\mathfrak", "\\mathscr", "\\mathsf",
    "\\mathtt",

    // aliases
    "\\Bbb", "\\bold", "\\frak"
], {
    numArgs: 1,
    greediness: 2
}, function(context, args) {
    var body = args[0];
    var func = context.funcName;
    if (func in fontAliases) {
        func = fontAliases[func];
    }
    return {
        type: "font",
        font: func.slice(1),
        body: body
    };
});

// Accents
defineFunction([
    "\\acute", "\\grave", "\\ddot", "\\tilde", "\\bar", "\\breve",
    "\\check", "\\hat", "\\vec", "\\dot"
    // We don't support expanding accents yet
    // "\\widetilde", "\\widehat"
], {
    numArgs: 1
}, function(context, args) {
    var base = args[0];
    return {
        type: "accent",
        accent: context.funcName,
        base: base
    };
});

// Infix generalized fractions
defineFunction(["\\over", "\\choose", "\\atop"], {
    numArgs: 0,
    infix: true
}, function(context) {
    var replaceWith;
    switch (context.funcName) {
        case "\\over":
            replaceWith = "\\frac";
            break;
        case "\\choose":
            replaceWith = "\\binom";
            break;
        case "\\atop":
            replaceWith = "\\\\atopfrac";
            break;
        default:
            throw new Error("Unrecognized infix genfrac command");
    }
    return {
        type: "infix",
        replaceWith: replaceWith,
        token: context.token
    };
});

// Row breaks for aligned data
defineFunction(["\\\\", "\\cr"], {
    numArgs: 0,
    numOptionalArgs: 1,
    argTypes: ["size"]
}, function(context, args) {
    var size = args[0];
    return {
        type: "cr",
        size: size
    };
});

// Environment delimiters
defineFunction(["\\begin", "\\end"], {
    numArgs: 1,
    argTypes: ["text"]
}, function(context, args) {
    var nameGroup = args[0];
    if (nameGroup.type !== "ordgroup") {
        throw new ParseError("Invalid environment name", nameGroup);
    }
    var name = "";
    for (var i = 0; i < nameGroup.value.length; ++i) {
        name += nameGroup.value[i].value;
    }
    return {
        type: "environment",
        name: name,
        nameGroup: nameGroup
    };
});
