// @flow
// TODO(kevinb): implement \\sl and \\sc

import defineFunction from "../defineFunction";
import ParseNode from "../ParseNode";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";


const htmlBuilder = (group, options) => {
    const font = group.value.font;
    return html.buildGroup(group.value.body, options.withFontFamily(font));
};

const mathmlBuilder = (group, options) => {
    const font = group.value.font;
    return mml.buildGroup(group.value.body, options.withFontFamily(font));
};

const fontAliases = {
    "\\Bbb": "\\mathbb",
    "\\bold": "\\mathbf",
    "\\frak": "\\mathfrak",
    "\\bm": "\\boldsymbol",
};

defineFunction({
    type: "font",
    names: [
        // styles
        "\\mathrm", "\\mathit", "\\mathbf", "\\boldsymbol",

        // families
        "\\mathbb", "\\mathcal", "\\mathfrak", "\\mathscr", "\\mathsf",
        "\\mathtt",

        // aliases
        "\\Bbb", "\\bold", "\\frak", "\\bm",
    ],
    props: {
        numArgs: 1,
        greediness: 2,
    },
    handler: (context, args) => {
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
    },
    htmlBuilder,
    mathmlBuilder,
});

const oldFontFuncsMap = {
    "\\rm": "mathrm",
    "\\sf": "mathsf",
    "\\tt": "mathtt",
    "\\bf": "mathbf",
    "\\it": "mathit",
};

// Old font changing functions
defineFunction({
    type: "font",
    names: Object.keys(oldFontFuncsMap),
    props: {
        numArgs: 0,
        allowedInText: true,
    },
    handler: (context, args) => {
        const {parser, funcName, breakOnTokenText} = context;

        parser.consumeSpaces();
        const body = parser.parseExpression(true, breakOnTokenText);
        const style = oldFontFuncsMap[funcName];

        return {
            type: "font",
            font: style,
            body: new ParseNode("ordgroup", body, parser.mode),
        };
    },
    htmlBuilder,
    mathmlBuilder,
});
