// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "href",
    names: ["\\href"],
    props: {
        numArgs: 2,
        argTypes: ["url", "original"],
    },
    handler: (context, args) => {
        const body = args[1];
        const href  = args[0].value;
        return {
            type: "href",
            href: href,
            body: ordargument(body),
        };
    },
    htmlBuilder: (group, options) => {
        const elements = html.buildExpression(
            group.value.body,
            options,
            false
        );

        const href = group.value.href;

        return new buildCommon.makeAnchor(href, [], elements, options);
    },
    mathmlBuilder: (group, options) => {
        const inner = mml.buildExpression(group.value.body, options);
        const math = new mathMLTree.MathNode("mrow", inner);
        math.setAttribute("href", group.value.href);
        return math;
    },
});
