// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import {assertNodeType} from "../ParseNode";

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
        const href = assertNodeType(args[0], "url").value.value;
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
        const math = mml.buildExpressionRow(group.value.body, options);
        math.setAttribute("href", group.value.href);
        return math;
    },
});
