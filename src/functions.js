// @flow
/** Include this to ensure that all functions are defined. */
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

import "./functions/mclass";

import "./functions/mod";

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

// Row and line breaks
import "./functions/cr";

// Environment delimiters
import "./functions/environment";

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
