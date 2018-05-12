// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "tag",
    names: ["\\tag@"],
    props: {
        numArgs: 1,
        argTypes: ["text"],
        consumeMode: "text",
    },
    handler(context, args) {
        const body = args[0];
        return {
            type: "tag",
            body: ordargument(body),
        };
    },
    htmlBuilder(group, options) {
        const newOptions = options.withFont("mathrm");
        const inner = html.buildExpression(group.value.body, newOptions, true);
        buildCommon.tryCombineChars(inner);
        return buildCommon.makeSpan(["mord", "text", "tag"],
            inner, newOptions);
    },
    mathmlBuilder(group, options) {
        const node = mml.makeTextRow(group.value.body, options);
        node.setAttribute("class", "tag");
        return node;
    },
});
