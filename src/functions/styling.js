// @flow
import defineFunction from "../defineFunction";
import mathMLTree from "../mathMLTree";
import Style from "../Style";
import {sizingGroup} from "./sizing";

import * as mml from "../buildMathML";

const styleMap = {
    "display": Style.DISPLAY,
    "text": Style.TEXT,
    "script": Style.SCRIPT,
    "scriptscript": Style.SCRIPTSCRIPT,
};

defineFunction({
    type: "styling",
    names: [
        "\\displaystyle", "\\textstyle", "\\scriptstyle",
        "\\scriptscriptstyle",
    ],
    props: {
        numArgs: 0,
        allowedInText: true,
    },
    handler: (context, args) => {
        const {breakOnTokenText, funcName, parser} = context;

        // parse out the implicit body
        parser.consumeSpaces();
        const body = parser.parseExpression(true, breakOnTokenText);

        return {
            type: "styling",
            // Figure out what style to use by pulling out the style from
            // the function name
            style: funcName.slice(1, funcName.length - 5),
            value: body,
        };
    },
    htmlBuilder: (group, options) => {
        // Style changes are handled in the TeXbook on pg. 442, Rule 3.
        const newStyle = styleMap[group.value.style];
        const newOptions = options.havingStyle(newStyle);
        return sizingGroup(group.value.value, newOptions, options);
    },
    mathmlBuilder: (group, options) => {
        // Figure out what style we're changing to.
        // TODO(kevinb): dedupe this with buildHTML.js
        // This will be easier of handling of styling nodes is in the same file.
        const styleMap = {
            "display": Style.DISPLAY,
            "text": Style.TEXT,
            "script": Style.SCRIPT,
            "scriptscript": Style.SCRIPTSCRIPT,
        };

        const newStyle = styleMap[group.value.style];
        const newOptions = options.havingStyle(newStyle);

        const inner = mml.buildExpression(group.value.value, newOptions);

        const node = new mathMLTree.MathNode("mstyle", inner);

        const styleAttributes = {
            "display": ["0", "true"],
            "text": ["0", "false"],
            "script": ["1", "false"],
            "scriptscript": ["2", "false"],
        };

        const attr = styleAttributes[group.value.style];

        node.setAttribute("scriptlevel", attr[0]);
        node.setAttribute("displaystyle", attr[1]);

        return node;
    },
});
