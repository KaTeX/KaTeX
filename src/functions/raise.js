//@flow
/* eslint no-console:0 */

// Handle \raise, \lower, \raisebox, and \hbox.

import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import { calculateSize } from "../units";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

const htmlBuilder = (group, options) => {
    let body;
    if (/box/.test(group.value.funcName)) {
        // \raisebox or \hbox.
        // Simulate a TeX box, i.e., text mode and normalsize.
        body = html.groupTypes.sizing({value: {
            value: [{
                type: "text",
                value: {
                    body: group.value.value,
                    font: "mathrm", // simulate \textrm
                },
            }],
            size: 6,                // simulate \normalsize
        }}, options);
    } else {
        // \raise or \lower
        body = html.buildGroup(group.value.body, options, options);
    }

    if (group.value.dy) {
        const dy = calculateSize(group.value.dy.value, options);
        return buildCommon.makeVList({
            positionType: "shift",
            positionData: -dy,
            children: [{type: "elem", elem: body}],
        }, options);
    } else {
        return buildCommon.makeSpan([], [body], options);  // used by \hbox only
    }
};

const mathmlBuilder = (group, options) => {
    const node = new mathMLTree.MathNode(
        "mpadded", [mml.buildGroup(group.value.body, options)]);
    if (group.value.dy) {
        const dy = group.value.dy.value.number + group.value.dy.value.unit;
        node.setAttribute("voffset", dy);
    }
    return node;
};

defineFunction({
    type: "raise",
    names: ["\\raisebox"],
    props: {
        numArgs: 2,
        argTypes: ["size", "text"],  // TeX boxes switch to text mode.
        allowedInText: true,
    },
    handler: (context, args) => {
        const [amount, body] = args;
        return {
            type: "raise",
            dy: amount,
            body: body,
            value: ordargument(body),
            funcName: context.funcName,
        };
    },
    htmlBuilder,
    mathmlBuilder,
});

// KaTeX's \raise and \lower behave similarly to MathJax's \raise and \lower
// in that they are more liberal than LaTeX in the arguments that they accept.
// The first argument can be braced or unbraced.
// The second argument can be any valid TeX, not just a TeX box.
defineFunction({
    type: "raise",
    names: ["\\raise", "\\lower"],
    props: {
        numArgs: 2,
        greediness: 0,               // Less than the greediness of \hbox.
        argTypes: ["size", "math"],  // Allow math in second argument.
        allowedInText: true,
    },
    handler: (context, args) => {
        const [amount, body] = args;
        if (context.funcName === "\\lower") {
            amount.value.number = -amount.value.number;
        }
        return {
            type: "raise",
            dy: amount,
            body: body,
            funcName: context.funcName,
        };
    },
    htmlBuilder,
    mathmlBuilder,
});

// We provide \hbox for backwards compatibility with LaTeX \raise.
// This enables an author to write \raise6pt \hbox{text}.
defineFunction({
    type: "raise",
    names: ["\\hbox"],
    props: {
        numArgs: 1,
        greediness: 1,
        argTypes: ["text"],
        allowedInText: true,
    },
    handler: (context, args) => {
        const body = args[0];
        return {
            type: "raise",
            dy: null,
            body: body,
            value: ordargument(body),
            funcName: context.funcName,
        };
    },
    htmlBuilder,
    mathmlBuilder,
});

