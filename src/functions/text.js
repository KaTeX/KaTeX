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

const optionsWithFont = (group, options) => {
    const font = group.font;
    // Checks if the argument is a font family or a font style.
    if (!font) {
        return options;
    } else if (textFontFamilies[font]) {
        return options.withTextFontFamily(textFontFamilies[font]);
    } else if (textFontWeights[font]) {
        return options.withTextFontWeight(textFontWeights[font]);
    } else {
        return options.withTextFontShape(textFontShapes[font]);
    }
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
    handler({parser, funcName}, args) {
        const body = args[0];
        return {
            type: "text",
            mode: parser.mode,
            body: ordargument(body),
            font: funcName,
        };
    },
    htmlBuilder(group, options) {
        const newOptions = optionsWithFont(group, options);
        const inner = html.buildExpression(group.body, newOptions, true);
        buildCommon.tryCombineChars(inner);
        return buildCommon.makeSpan(["mord", "text"], inner, newOptions);
    },
    mathmlBuilder(group, options) {
        const newOptions = optionsWithFont(group, options);
        return mml.buildExpressionRow(group.body, newOptions);
    },
});
