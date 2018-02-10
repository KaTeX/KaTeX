// @flow
/** Include this to ensure that all functions are defined. */
import ParseError from "./ParseError";
import ParseNode from "./ParseNode";
import {
    default as _defineFunction,
    ordargument,
    _functions,
} from "./defineFunction";

import type {FunctionPropSpec, FunctionHandler} from "./defineFunction" ;
import type {Measurement} from "./units" ;

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

// TODO(kevinb): have functions return an object and call defineFunction with
// that object in this file instead of relying on side-effects.
import "./functions/sqrt";

import "./functions/color";

import "./functions/text";

import "./functions/enclose";

import "./functions/overline";

import "./functions/underline";

import "./functions/rule";

import "./functions/kern";

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

const singleCharIntegrals: {[string]: string} = {
    "\u222b": "\\int",
    "\u222c": "\\iint",
    "\u222d": "\\iiint",
    "\u222e": "\\oint",
};

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
    "\\det", "\\gcd", "\\inf", "\\lim", "\\max", "\\min", "\\Pr", "\\sup",
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
    "\\int", "\\iint", "\\iiint", "\\oint", "\u222b", "\u222c",
    "\u222d", "\u222e",
], {
    numArgs: 0,
}, function(context) {
    let fName = context.funcName;
    if (fName.length === 1) {
        fName = singleCharIntegrals[fName];
    }
    return {
        type: "op",
        limits: false,
        symbol: true,
        body: fName,
    };
});

// Parse a line thickness ParseNode from a fraction.
// An empty thickness argument is a valid input to \genfrac.
// That's why we can't just specify a "size" argument for \genfrac.
const barLineFromNode = function(
    lineThickness: ParseNode
): [boolean, Measurement | null] {
    let hasBarLine;
    let barSize = null;
    if (lineThickness.value.length === 0) {
        hasBarLine = true;   // omitted dimension => std bar thickness
    } else {
        // Parse the custom line thickness
        let str = "";
        for (let i = 0; i < lineThickness.value.length; i++ ) {
            str += lineThickness.value[i].value;
        }

        const match = (/([-+]?) *(\d+(?:\.\d*)?|\.\d+) *([a-z]{2})/).exec(str);
        if (!match) {
            throw new ParseError("Invalid size: '" + str + "'");
        }

        const num = +str.replace(/[^+\-\d.]/g, '');  // cast to a number
        if (num === 0) {
            hasBarLine = false;
        } else {
            hasBarLine = true;
            barSize = {
                number: num,
                unit: str.replace(/[+\-\d. ]/g, ''),
            };
        }
    }

    return [hasBarLine, barSize];
};

const delimFromNode = function(delimNode: ParseNode): string | null {
    let delim = null;
    if (delimNode.value.length > 0) {
        delim = delimNode.value;
        delim = delim === "." ? null : delim;
    }
    return delim;
};

// TeXbook generalized fractions
defineFunction([
    "\\dfrac", "\\frac", "\\tfrac",
    "\\dbinom", "\\binom", "\\tbinom",
    "\\\\atopfrac", // can’t be entered directly
    "\\\\bracefrac", "\\\\brackfrac",   // ditto
], {
    numArgs: 2,
    greediness: 2,
}, function(context, args) {
    const numer = args[0];
    const denom = args[1];
    let hasBarLine;
    let leftDelim = null;
    let rightDelim = null;
    let size = "auto";

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
        case "\\\\bracefrac":
            hasBarLine = false;
            leftDelim = "\\{";
            rightDelim = "\\}";
            break;
        case "\\\\brackfrac":
            hasBarLine = false;
            leftDelim = "[";
            rightDelim = "]";
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
        barSize: null,
        leftDelim: leftDelim,
        rightDelim: rightDelim,
        size: size,
    };
});

const stylArray = ["display", "text", "script", "scriptscript"];

// AMS \genfrac function
defineFunction(["\\genfrac"], {
    numArgs: 6,
    greediness: 6,
    argTypes: ["math", "math", "text", "text", "math", "math"],
}, function(context, args) {
    const [leftNode, rightNode, lineThickness, styl, numer, denom] = args;

    const leftDelim = delimFromNode(leftNode);
    const rightDelim = delimFromNode(rightNode);

    const [hasBarLine, barSize] = barLineFromNode(lineThickness);

    let size = "auto";
    if (styl.value.length > 0) {
        size = stylArray[styl.value[0].value];
    }

    return {
        type: "genfrac",
        numer: numer,
        denom: denom,
        hasBarLine: hasBarLine,
        barSize: barSize,
        leftDelim: leftDelim,
        rightDelim: rightDelim,
        size: size,
    };
});

// Infix generalized fractions
defineFunction(["\\over", "\\choose", "\\atop", "\\brace", "\\brack"], {
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
        case "\\brace":
            replaceWith = "\\\\bracefrac";
            break;
        case "\\brack":
            replaceWith = "\\\\brackfrac";
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

// More infix fractions
defineFunction(["\\above"], {
    numArgs: 1,
    infix: true,
}, function(context, args) {
    const sizeNode = args[0];
    return {
        type: "infix",
        replaceWith: "\\\\abovefrac",
        token: context.token,
        sizeNode: sizeNode,
    };
});

defineFunction(["\\\\abovefrac"], {
    numArgs: 3,
}, function(context, args) {
    const [numer, denom, sizeNode] = args;
    const [hasBarLine, barSize] = barLineFromNode(sizeNode);

    return {
        type: "genfrac",
        numer: numer,
        denom: denom,
        hasBarLine: hasBarLine,
        barSize: barSize,
        leftDelim: null,
        rightDelim: null,
        size: "auto",
    };
});

defineFunction(["\\atopwithdelims", "\\overwithdelims"], {
    numArgs: 2,
    infix: true,
}, function(context, args) {
    const replaceWith = "\\" + context.funcName + "frac";
    const [leftDelim, rightDelim] = args;
    return {
        type: "infix",
        replaceWith: replaceWith,
        leftDelim: leftDelim,
        rightDelim: rightDelim,
        token: context.token,
    };
});

defineFunction(["\\\\atopwithdelimsfrac", "\\\\overwithdelimsfrac"], {
    numArgs: 4,
}, function(context, args) {
    const [numer, denom, leftDelimNode, rightDelimNode] = args;
    const leftDelim = delimFromNode(leftDelimNode);
    const rightDelim = delimFromNode(rightDelimNode);
    const hasBarLine = context.funcName === "\\\\overwithdelimsfrac";

    return {
        type: "genfrac",
        numer: numer,
        denom: denom,
        hasBarLine: hasBarLine,
        barSize: null,
        leftDelim: leftDelim,
        rightDelim: rightDelim,
        size: "auto",
    };
});

defineFunction(["\\abovewithdelims"], {
    numArgs: 3,
    infix: true,
}, function(context, args) {
    const [leftDelim, rightDelim, sizeNode] = args;
    return {
        type: "infix",
        replaceWith: "\\\\abovewithdelimsfrac",
        leftDelim: leftDelim,
        rightDelim: rightDelim,
        sizeNode: sizeNode,
        token: context.token,
    };
});

defineFunction(["\\\\abovewithdelimsfrac"], {
    numArgs: 5,
}, function(context, args) {
    const [numer, denom, leftDelimNode, rightDelimNode, sizeNode] = args;
    const leftDelim = delimFromNode(leftDelimNode);
    const rightDelim = delimFromNode(rightDelimNode);
    const [hasBarLine, barSize] = barLineFromNode(sizeNode);

    return {
        type: "genfrac",
        numer: numer,
        denom: denom,
        hasBarLine: hasBarLine,
        barSize: barSize,
        leftDelim: leftDelim,
        rightDelim: rightDelim,
        size: "auto",
    };
});

import "./functions/op";

import "./functions/operatorname";

import "./functions/lap";

import "./functions/smash";

import "./functions/delimsizing";

import "./functions/sizing";

import "./functions/styling";

import "./functions/font";

import "./functions/accent";

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
import "./functions/accentunder";

// Stretchy arrows with an optional argument
defineFunction([
    "\\xleftarrow", "\\xrightarrow", "\\xLeftarrow", "\\xRightarrow",
    "\\xleftrightarrow", "\\xLeftrightarrow", "\\xhookleftarrow",
    "\\xhookrightarrow", "\\xmapsto", "\\xrightharpoondown",
    "\\xrightharpoonup", "\\xleftharpoondown", "\\xleftharpoonup",
    "\\xrightleftharpoons", "\\xleftrightharpoons", "\\xlongequal",
    "\\xtwoheadrightarrow", "\\xtwoheadleftarrow", "\\xtofrom",
    // The next 3 functions are here to support the mhchem extension.
    // Direct use of these functions is discouraged and may break someday.
    "\\xrightleftarrows", "\\xrightequilibrium",
    "\\xleftequilibrium",
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

import "./functions/verb";

// Hyperlinks
import "./functions/href";

// MathChoice
import "./functions/mathchoice";
