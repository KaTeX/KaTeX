// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

// Non-mathy text, possibly in a font
const textFontFamilies = {
    "\\text": undefined, "\\textrm": "textrm", "\\textsf": "textsf",
    "\\texttt": "texttt", "\\textnormal": "textrm",
};

const textFontWeights = {
    "\\textbf": "textbf",
};

const textFontShapes = {
    "\\textit": "textit",
};

defineFunction({
    type: "text",
    names: [
        // Font families
        "\\text", "\\textrm", "\\textsf", "\\texttt", "\\textnormal",
        // Font weights
        "\\textbf",
        // Font Shapes
        "\\textit",
    ],
    props: {
        numArgs: 1,
        argTypes: ["text"],
        greediness: 2,
        allowedInText: true,
        consumeMode: "text",
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
        const font = group.value.font;
        // Checks if the argument is a font family or a font style.
        let newOptions;
        if (textFontFamilies[font]) {
            newOptions = options.withTextFontFamily(textFontFamilies[font]);
        } else if (textFontWeights[font]) {
            newOptions = options.withTextFontWeight(textFontWeights[font]);
        } else {
            newOptions = options.withTextFontShape(textFontShapes[font]);
        }
        const inner = html.buildExpression(group.value.body, newOptions, true);
        buildCommon.tryCombineChars(inner);
        return buildCommon.makeSpan(["mord", "text"],
            inner, newOptions);
    },
    mathmlBuilder(group, options) {
        return mml.makeTextRow(group.value.body, options);
    },
});
