// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import Style from "../Style";
import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "mathchoice",
    names: ["\\mathchoice"],
    props: {
        numArgs: 4,
    },
    handler: (context, args) => {
        return {
            type: "mathchoice",
            display:      ordargument(args[0]),
            text:         ordargument(args[1]),
            script:       ordargument(args[2]),
            scriptscript: ordargument(args[3]),
        };
    },
    htmlBuilder: (group, options) => {
        const style = options.style;
        let body = group.value.text;
        if (style.size === Style.DISPLAY.size) {
            body = group.value.display;
        } else if  (style.size === Style.TEXT.size) {
            body = group.value.text;
        } else if  (style.size === Style.SCRIPT.size) {
            body = group.value.script;
        } else if  (style.size === Style.SCRIPTSCRIPT.size) {
            body = group.value.scriptscript;
        }
        const elements = html.buildExpression(
            body,
            options,
            false
        );
        return new buildCommon.makeFragment(elements);
    },
    mathmlBuilder: (group, options) => {
        const style = options.style;
        let body = group.value.text;
        if (style === Style.DISPLAY) {
            body = group.value.display;
        } else if  (style === Style.TEXT) {
            body = group.value.text;
        } else if  (style === Style.SCRIPT) {
            body = group.value.script;
        } else if  (style === Style.SCRIPTSCRIPT) {
            body = group.value.scriptscript;
        }
        const elements = mml.buildExpression(
            body,
            options,
            false
        );
        return new mathMLTree.MathNode("mrow", elements);
    },
});
