// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import {DISPLAY, TEXT, SCRIPT, SCRIPTSCRIPT} from "../Style";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

import type {ParseNode} from "../parseNode";

const chooseMathStyle = (group: ParseNode<"mathchoice">, options) => {
    switch (options.style.size) {
        case DISPLAY.size: return group.display;
        case TEXT.size: return group.text;
        case SCRIPT.size: return group.script;
        case SCRIPTSCRIPT.size: return group.scriptscript;
        default: return group.text;
    }
};

defineFunction({
    type: "mathchoice",
    names: ["\\mathchoice"],
    props: {
        numArgs: 4,
        primitive: true,
    },
    handler: ({parser}, args) => {
        return {
            type: "mathchoice",
            mode: parser.mode,
            display:      ordargument(args[0]),
            text:         ordargument(args[1]),
            script:       ordargument(args[2]),
            scriptscript: ordargument(args[3]),
        };
    },
    htmlBuilder: (group, options) => {
        const body = chooseMathStyle(group, options);
        const elements = html.buildExpression(
            body,
            options,
            false
        );
        return buildCommon.makeFragment(elements);
    },
    mathmlBuilder: (group, options) => {
        const body = chooseMathStyle(group, options);
        return mml.buildExpressionRow(body, options);
    },
});
