// @flow
/** Include this to ensure that all functions are defined. */
import utils from "./utils";
import ParseError from "./ParseError";
import ParseNode from "./ParseNode";
import {
    default as _defineFunction,
    ordargument,
    _functions,
} from "./defineFunction";

import type {FunctionPropSpec, FunctionHandler} from "./defineFunction" ;

// WARNING: New functions should be added to src/functions and imported here.

const functions = _functions;
export default functions;

// Define a convenience function that mimcs the old semantics of defineFunction
// to support existing code so that we can migrate it a little bit at a time.
const defineFunction = function(
    names: string[],
    props: FunctionPropSpec,
    handler: ?FunctionHandler, // null only if handled in parser
) {
    _defineFunction({names, props, handler});
};

// A normal square root
defineFunction(["\\sqrt"], {
    numArgs: 1,
    numOptionalArgs: 1,
}, function(context, args, optArgs) {
    const index = optArgs[0];
    const body = args[0];
    return {
        type: "sqrt",
        body: body,
        index: index,
    };
});

// Non-mathy text, possibly in a font
const textFunctionFonts = {
    "\\text": undefined, "\\textrm": "mathrm", "\\textsf": "mathsf",
    "\\texttt": "mathtt", "\\textnormal": "mathrm", "\\textbf": "mathbf",
    "\\textit": "textit",
};

defineFunction([
    "\\text", "\\textrm", "\\textsf", "\\texttt", "\\textnormal",
    "\\textbf", "\\textit",
], {
    numArgs: 1,
    argTypes: ["text"],
    greediness: 2,
    allowedInText: true,
}, function(context, args) {
    const body = args[0];
    return {
        type: "text",
        body: ordargument(body),
        font: textFunctionFonts[context.funcName],
    };
});

// A two-argument custom color
defineFunction(["\\textcolor"], {
    numArgs: 2,
    allowedInText: true,
    greediness: 3,
    argTypes: ["color", "original"],
}, function(context, args) {
    const color = args[0];
    const body = args[1];
    return {
        type: "color",
        color: color.value,
        value: ordargument(body),
    };
});

// \color is handled in Parser.js's parseImplicitGroup
defineFunction(["\\color"], {
    numArgs: 1,
    allowedInText: true,
    greediness: 3,
    argTypes: ["color"],
}, null);

// colorbox
defineFunction(["\\colorbox"], {
    numArgs: 2,
    allowedInText: true,
    greediness: 3,
    argTypes: ["color", "text"],
}, function(context, args) {
    const color = args[0];
    const body = args[1];
    return {
        type: "enclose",
        label: context.funcName,
        backgroundColor: color,
        body: body,
    };
});

// fcolorbox
defineFunction(["\\fcolorbox"], {
    numArgs: 3,
    allowedInText: true,
    greediness: 3,
    argTypes: ["color", "color", "text"],
}, function(context, args) {
    const borderColor = args[0];
    const backgroundColor = args[1];
    const body = args[2];
    return {
        type: "enclose",
        label: context.funcName,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        body: body,
    };
});

// An overline
defineFunction(["\\overline"], {
    numArgs: 1,
}, function(context, args) {
    const body = args[0];
    return {
        type: "overline",
        body: body,
    };
});

// An underline
defineFunction(["\\underline"], {
    numArgs: 1,
}, function(context, args) {
    const body = args[0];
    return {
        type: "underline",
        body: body,
    };
});

// A box of the width and height
defineFunction(["\\rule"], {
    numArgs: 2,
    numOptionalArgs: 1,
    argTypes: ["size", "size", "size"],
}, function(context, args, optArgs) {
    const shift = optArgs[0];
    const width = args[0];
    const height = args[1];
    return {
        type: "rule",
        shift: shift && shift.value,
        width: width.value,
        height: height.value,
    };
});

// TODO: In TeX, \mkern only accepts mu-units, and \kern does not accept
// mu-units. In current KaTeX we relax this; both commands accept any unit.
defineFunction(["\\kern", "\\mkern"], {
    numArgs: 1,
    argTypes: ["size"],
}, function(context, args) {
    return {
        type: "kern",
        dimension: args[0].value,
    };
});

import "./functions/katex";

import "./functions/phantom";

// Math class commands except \mathop
defineFunction([
    "\\mathord", "\\mathbin", "\\mathrel", "\\mathopen",
    "\\mathclose", "\\mathpunct", "\\mathinner",
], {
    numArgs: 1,
}, function(context, args) {
    const body = args[0];
    return {
        type: "mclass",
        mclass: "m" + context.funcName.substr(5),
        value: ordargument(body),
    };
});

// Build a relation by placing one symbol on top of another
defineFunction(["\\stackrel"], {
    numArgs: 2,
}, function(context, args) {
    const top = args[0];
    const bottom = args[1];

    const bottomop = new ParseNode("op", {
        type: "op",
        limits: true,
        alwaysHandleSupSub: true,
        symbol: false,
        value: ordargument(bottom),
    }, bottom.mode);

    const supsub = new ParseNode("supsub", {
        base: bottomop,
        sup: top,
        sub: null,
    }, top.mode);

    return {
        type: "mclass",
        mclass: "mrel",
        value: [supsub],
    };
});

import "./functions/mod";

const fontAliases = {
    "\\Bbb": "\\mathbb",
    "\\bold": "\\mathbf",
    "\\frak": "\\mathfrak",
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
    "\\kaBlue", "\\kaGreen",
], {
    numArgs: 1,
    allowedInText: true,
    greediness: 3,
}, function(context, args) {
    const body = args[0];
    return {
        type: "color",
        color: "katex-" + context.funcName.slice(1),
        value: ordargument(body),
    };
});

// There are 2 flags for operators; whether they produce limits in
// displaystyle, and whether they are symbols and should grow in
// displaystyle. These four groups cover the four possible choices.

// No limits, not symbols
defineFunction([
    "\\arcsin", "\\arccos", "\\arctan", "\\arctg", "\\arcctg",
    "\\arg", "\\ch", "\\cos", "\\cosec", "\\cosh", "\\cot", "\\cotg",
    "\\coth", "\\csc", "\\ctg", "\\cth", "\\deg", "\\dim", "\\exp",
    "\\hom", "\\ker", "\\lg", "\\ln", "\\log", "\\sec", "\\sin",
    "\\sinh", "\\sh", "\\tan", "\\tanh", "\\tg", "\\th",
], {
    numArgs: 0,
}, function(context) {
    return {
        type: "op",
        limits: false,
        symbol: false,
        body: context.funcName,
    };
});

// Limits, not symbols
defineFunction([
    "\\det", "\\gcd", "\\inf", "\\lim", "\\liminf", "\\limsup", "\\max",
    "\\min", "\\Pr", "\\sup",
], {
    numArgs: 0,
}, function(context) {
    return {
        type: "op",
        limits: true,
        symbol: false,
        body: context.funcName,
    };
});

// No limits, symbols
defineFunction([
    "\\int", "\\iint", "\\iiint", "\\oint",
], {
    numArgs: 0,
}, function(context) {
    return {
        type: "op",
        limits: false,
        symbol: true,
        body: context.funcName,
    };
});

import "./functions/op";

import "./functions/operatorname";

import "./functions/genfrac";

import "./functions/lap";

import "./functions/smash";

import "./functions/delimsizing";

// Sizing functions (handled in Parser.js explicitly, hence no handler)
defineFunction([
    "\\tiny", "\\scriptsize", "\\footnotesize", "\\small",
    "\\normalsize", "\\large", "\\Large", "\\LARGE", "\\huge", "\\Huge",
], {numArgs: 0}, null);

// Style changing functions (handled in Parser.js explicitly, hence no
// handler)
defineFunction([
    "\\displaystyle", "\\textstyle", "\\scriptstyle",
    "\\scriptscriptstyle",
], {numArgs: 0}, null);

// Old font changing functions
defineFunction([
    "\\rm", "\\sf", "\\tt", "\\bf", "\\it", //"\\sl", "\\sc",
], {numArgs: 0}, null);

defineFunction([
    // styles
    "\\mathrm", "\\mathit", "\\mathbf",

    // families
    "\\mathbb", "\\mathcal", "\\mathfrak", "\\mathscr", "\\mathsf",
    "\\mathtt",

    // aliases
    "\\Bbb", "\\bold", "\\frak",
], {
    numArgs: 1,
    greediness: 2,
}, function(context, args) {
    const body = args[0];
    let func = context.funcName;
    if (func in fontAliases) {
        func = fontAliases[func];
    }
    return {
        type: "font",
        font: func.slice(1),
        body: body,
    };
});

// Accents
defineFunction([
    "\\acute", "\\grave", "\\ddot", "\\tilde", "\\bar", "\\breve",
    "\\check", "\\hat", "\\vec", "\\dot",
    "\\widehat", "\\widetilde", "\\overrightarrow", "\\overleftarrow",
    "\\Overrightarrow", "\\overleftrightarrow", "\\overgroup",
    "\\overlinesegment", "\\overleftharpoon", "\\overrightharpoon",
], {
    numArgs: 1,
}, function(context, args) {
    const base = args[0];

    const isStretchy = !utils.contains([
        "\\acute", "\\grave", "\\ddot", "\\tilde", "\\bar", "\\breve",
        "\\check", "\\hat", "\\vec", "\\dot",
    ], context.funcName);

    const isShifty = !isStretchy || utils.contains([
        "\\widehat", "\\widetilde",
    ], context.funcName);

    return {
        type: "accent",
        label: context.funcName,
        isStretchy: isStretchy,
        isShifty: isShifty,
        base: base,
    };
});

// Text-mode accents
defineFunction([
    "\\'", "\\`", "\\^", "\\~", "\\=", "\\u", "\\.", '\\"',
    "\\r", "\\H", "\\v",
], {
    numArgs: 1,
    allowedInText: true,
    allowedInMath: false,
}, function(context, args) {
    const base = args[0];

    return {
        type: "accent",
        label: context.funcName,
        isStretchy: false,
        isShifty: true,
        base: base,
    };
});

// Horizontal stretchy braces
defineFunction([
    "\\overbrace", "\\underbrace",
], {
    numArgs: 1,
}, function(context, args) {
    const base = args[0];
    return {
        type: "horizBrace",
        label: context.funcName,
        isOver: /^\\over/.test(context.funcName),
        base: base,
    };
});

// Stretchy accents under the body
defineFunction([
    "\\underleftarrow", "\\underrightarrow", "\\underleftrightarrow",
    "\\undergroup", "\\underlinesegment", "\\undertilde",
], {
    numArgs: 1,
}, function(context, args) {
    const base = args[0];
    return {
        type: "accentUnder",
        label: context.funcName,
        base: base,
    };
});

// Stretchy arrows with an optional argument
defineFunction([
    "\\xleftarrow", "\\xrightarrow", "\\xLeftarrow", "\\xRightarrow",
    "\\xleftrightarrow", "\\xLeftrightarrow", "\\xhookleftarrow",
    "\\xhookrightarrow", "\\xmapsto", "\\xrightharpoondown",
    "\\xrightharpoonup", "\\xleftharpoondown", "\\xleftharpoonup",
    "\\xrightleftharpoons", "\\xleftrightharpoons", "\\xLongequal",
    "\\xtwoheadrightarrow", "\\xtwoheadleftarrow", "\\xLongequal",
    "\\xtofrom",
], {
    numArgs: 1,
    numOptionalArgs: 1,
}, function(context, args, optArgs) {
    const below = optArgs[0];
    const body = args[0];
    return {
        type: "xArrow",   // x for extensible
        label: context.funcName,
        body: body,
        below: below,
    };
});

// enclose
defineFunction(["\\cancel", "\\bcancel", "\\xcancel", "\\sout", "\\fbox"], {
    numArgs: 1,
}, function(context, args) {
    const body = args[0];
    return {
        type: "enclose",
        label: context.funcName,
        body: body,
    };
});

// Infix generalized fractions
defineFunction(["\\over", "\\choose", "\\atop"], {
    numArgs: 0,
    infix: true,
}, function(context) {
    let replaceWith;
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
        token: context.token,
    };
});

// Row breaks for aligned data
defineFunction(["\\\\", "\\cr"], {
    numArgs: 0,
    numOptionalArgs: 1,
    argTypes: ["size"],
}, function(context, args, optArgs) {
    const size = optArgs[0];
    return {
        type: "cr",
        size: size,
    };
});

// Environment delimiters
defineFunction(["\\begin", "\\end"], {
    numArgs: 1,
    argTypes: ["text"],
}, function(context, args) {
    const nameGroup = args[0];
    if (nameGroup.type !== "ordgroup") {
        throw new ParseError("Invalid environment name", nameGroup);
    }
    let name = "";
    for (let i = 0; i < nameGroup.value.length; ++i) {
        name += nameGroup.value[i].value;
    }
    return {
        type: "environment",
        name: name,
        nameGroup: nameGroup,
    };
});

// Box manipulation
defineFunction(["\\raisebox"], {
    numArgs: 2,
    argTypes: ["size", "text"],
    allowedInText: true,
}, function(context, args) {
    const amount = args[0];
    const body = args[1];
    return {
        type: "raisebox",
        dy: amount,
        body: body,
        value: ordargument(body),
    };
});

// \verb and \verb* are dealt with directly in Parser.js.
// If we end up here, it's because of a failure to match the two delimiters
// in the regex in Lexer.js.  LaTeX raises the following error when \verb is
// terminated by end of line (or file).
defineFunction(["\\verb"], {
    numArgs: 0,
    allowedInText: true,
}, function(context) {
    throw new ParseError(
        "\\verb ended by end of line instead of matching delimiter");
});

// MathChoice
import "./functions/mathchoice";
