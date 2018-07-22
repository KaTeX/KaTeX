// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import Style from "../Style";
import ParseNode from "../ParseNode";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

const chooseMathStyle = (group, options) => {
    const style = options.style;
    if (style.size === Style.DISPLAY.size) {
        return group.value.display;
    } else if  (style.size === Style.TEXT.size) {
        return group.value.text;
    } else if  (style.size === Style.SCRIPT.size) {
        return group.value.script;
    } else if  (style.size === Style.SCRIPTSCRIPT.size) {
        return group.value.scriptscript;
    }
    return group.value.text;

};

defineFunction({
    type: "mathchoice",
    names: ["\\mathchoice"],
    props: {
        numArgs: 4,
    },
    handler: ({parser}, args) => {
        return new ParseNode("mathchoice", {
            type: "mathchoice",
            display:      ordargument(args[0]),
            text:         ordargument(args[1]),
            script:       ordargument(args[2]),
            scriptscript: ordargument(args[3]),
        }, parser.mode);
    },
    htmlBuilder: (group, options) => {
        const body = chooseMathStyle(group, options);
        const elements = html.buildExpression(
            body,
            options,
            false
        );
        return new buildCommon.makeFragment(elements);
    },
    mathmlBuilder: (group, options) => {
        const body = chooseMathStyle(group, options);
        return mml.buildExpressionRow(body, options);
    },
});
