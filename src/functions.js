// @flow
/** Include this to ensure that all functions are defined. */
import ParseError from "./ParseError";
import ParseNode from "./ParseNode";
import {
    default as _defineFunction,
    ordargument,
    _functions,
} from "./defineFunction";

import type {FunctionPropSpec, FunctionHandler} from "./defineFunction";
import type {NodeType} from "./ParseNode";

// WARNING: New functions should be added to src/functions and imported here.

const functions = _functions;
export default functions;

// Define a convenience function that mimcs the old semantics of defineFunction
// to support existing code so that we can migrate it a little bit at a time.
const defineFunction = function<NODETYPE: NodeType>(
    // Type of node data output by the function handler. This is required to aid
    // type inference of the actual function output.
    type: NODETYPE,
    names: string[],
    props: FunctionPropSpec,
    handler: ?FunctionHandler<NODETYPE>, // null only if handled in parser
) {
    _defineFunction({type, names, props, handler});
};

// TODO(kevinb): have functions return an object and call defineFunction with
// that object in this file instead of relying on side-effects.
import "./functions/sqrt";

import "./functions/color";

import "./functions/text";

import "./functions/math";

import "./functions/enclose";

import "./functions/overline";

import "./functions/underline";

import "./functions/rule";

import "./functions/kern";

import "./functions/phantom";

// Math class commands except \mathop
defineFunction("mclass", [
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

// Build a relation or stacked op by placing one symbol on top of another
defineFunction("mclass", ["\\stackrel", "\\overset", "\\underset"], {
    numArgs: 2,
}, function(context, args) {
    const baseArg = args[1];
    const shiftedArg = args[0];

    let mclass = "mrel";  // default. May change below.
    if (context.funcName !== "\\stackrel") {
        // LaTeX applies \binrel spacing to \overset and \underset.
        // \binrel spacing varies with (bin|rel|ord) of the atom in the argument.
        // We'll do the same.
        let atomType = "";
        if (baseArg.type === "ordgroup") {
            atomType = baseArg.value[0].type;
        } else {
            atomType = baseArg.type;
        }
        if (/^(bin|rel)$/.test(atomType)) {
            mclass = "m" + atomType;
        } else {
            // This may capture some instances in which the baseArg is more than
            // just a single symbol. Say a \overset inside an \overset.
            // TODO: A more comprehensive way to determine the baseArg type.
            mclass = "mord";
        }
    }

    const baseOp = new ParseNode("op", {
        type: "op",
        limits: true,
        alwaysHandleSupSub: true,
        symbol: false,
        suppressBaseShift: context.funcName !== "\\stackrel",
        value: ordargument(baseArg),
    }, baseArg.mode);

    const supsub = new ParseNode("supsub", {
        base: baseOp,
        sup: context.funcName === "\\underset" ? null : shiftedArg,
        sub: context.funcName === "\\underset" ? shiftedArg : null,
    }, shiftedArg.mode);

    return {
        type: "mclass",
        mclass: mclass,
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
defineFunction("op", [
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
defineFunction("op", [
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
defineFunction("op", [
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

import "./functions/op";

import "./functions/operatorname";

import "./functions/genfrac";

import "./functions/lap";

import "./functions/smash";

import "./functions/delimsizing";

import "./functions/sizing";

import "./functions/styling";

import "./functions/font";

import "./functions/accent";

// Horizontal stretchy braces
defineFunction("horizBrace", [
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
defineFunction("xArrow", [
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

// Infix generalized fractions
defineFunction("infix", ["\\over", "\\choose", "\\atop"], {
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
defineFunction("cr", ["\\\\", "\\cr"], {
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
defineFunction("environment", ["\\begin", "\\end"], {
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
defineFunction("raisebox", ["\\raisebox"], {
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
