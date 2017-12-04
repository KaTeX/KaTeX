// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

// Non-mathy text, possibly in a font
const textFunctionFonts = {
    "\\text": undefined, "\\textrm": "mathrm", "\\textsf": "mathsf",
    "\\texttt": "mathtt", "\\textnormal": "mathrm",
};

const textFontStyles = {
    "\\textbf": "textbf", "\\textit": "textit",
};

defineFunction({
    type: "text",
    names: [
        "\\text", "\\textrm", "\\textsf", "\\texttt", "\\textnormal",
        "\\textbf", "\\textit",
    ],
    props: {
        numArgs: 1,
        argTypes: ["text"],
        greediness: 2,
        allowedInText: true,
    },
    handler(context, args) {
        const body = args[0];
        return {
            type: "text",
            body: ordargument(body),
            font: context.funcName,
        };
    },
    htmlBuilder(group, options) {
        const fontOrStyle = group.value.font;
        // Checks if the argument is a font family or a font style.
        const newOptions = textFunctionFonts[fontOrStyle] ?
                           options.withFont(textFunctionFonts[fontOrStyle]) :
                           options.withFontStyle(textFontStyles[fontOrStyle]);
        const inner = html.buildExpression(group.value.body, newOptions, true);
        buildCommon.tryCombineChars(inner);
        return buildCommon.makeSpan(["mord", "text"],
            inner, newOptions);
    },
    mathmlBuilder(group, options) {
        const body = group.value.body;

        // Convert each element of the body into MathML, and combine consecutive
        // <mtext> outputs into a single <mtext> tag.  In this way, we don't
        // nest non-text items (e.g., $nested-math$) within an <mtext>.
        const inner = [];
        let currentText = null;
        for (let i = 0; i < body.length; i++) {
            const group = mml.buildGroup(body[i], options);
            if (group.type === 'mtext' && currentText != null) {
                Array.prototype.push.apply(currentText.children, group.children);
            } else {
                inner.push(group);
                if (group.type === 'mtext') {
                    currentText = group;
                }
            }
        }

        // If there is a single tag in the end (presumably <mtext>),
        // just return it.  Otherwise, wrap them in an <mrow>.
        if (inner.length === 1) {
            return inner[0];
        } else {
            return new mathMLTree.MathNode("mrow", inner);
        }
    },
});
