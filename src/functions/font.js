// @flow
// TODO(kevinb): implement \\sl and \\sc

import buildCommon from "../buildCommon";
import defineFunction from "../defineFunction";
import ParseNode from "../ParseNode";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";


const htmlBuilder = (group, options) => {
    const font = group.value.font;
    const newOptions = options.withFont(font);
    return html.buildGroup(group.value.body, newOptions);
};

const mathmlBuilder = (group, options) => {
    const font = group.value.font;
    const newOptions = options.withFont(font);
    return mml.buildGroup(group.value.body, newOptions);
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
        // styles, except \boldsymbol defined below
        "\\mathrm", "\\mathit", "\\mathbf",

        // families
        "\\mathbb", "\\mathcal", "\\mathfrak", "\\mathscr", "\\mathsf",
        "\\mathtt",

        // aliases, except \bm defined below
        "\\Bbb", "\\bold", "\\frak",
    ],
    props: {
        numArgs: 1,
        greediness: 2,
    },
    handler: ({parser, funcName}, args) => {
        const body = args[0];
        let func = funcName;
        if (func in fontAliases) {
            func = fontAliases[func];
        }
        return new ParseNode("font", {
            type: "font",
            font: func.slice(1),
            body,
        }, parser.mode);
    },
    htmlBuilder,
    mathmlBuilder,
});

defineFunction({
    type: "mclass",
    names: ["\\boldsymbol", "\\bm"],
    props: {
        numArgs: 1,
        greediness: 2,
    },
    handler: ({parser}, args) => {
        const body = args[0];
        // amsbsy.sty's \boldsymbol uses \binrel spacing to inherit the
        // argument's bin|rel|ord status
        return new ParseNode("mclass", {
            type: "mclass",
            mclass: buildCommon.binrelClass(body),
            value: [
                new ParseNode("font", {
                    type: "font",
                    font: "boldsymbol",
                    body,
                }, parser.mode),
            ],
        }, parser.mode);
    },
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
    handler: ({parser, funcName, breakOnTokenText}, args) => {
        const {mode} = parser;
        parser.consumeSpaces();
        const body = parser.parseExpression(true, breakOnTokenText);
        const style = oldFontFuncsMap[funcName];

        return new ParseNode("font", {
            type: "font",
            font: style,
            body: new ParseNode("ordgroup", body, parser.mode),
        }, mode);
    },
    htmlBuilder,
    mathmlBuilder,
});
