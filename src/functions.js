// @flow
/** Include this to ensure that all functions are defined. */
import {
    default as _defineFunction,
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

// Stretch arrows
import "./functions/arrow";

// Row and line breaks
import "./functions/cr";

// Environment delimiters
import "./functions/environment";

// Box manipulation
import "./functions/raisebox";

import "./functions/verb";

// Hyperlinks
import "./functions/href";

// MathChoice
import "./functions/mathchoice";
