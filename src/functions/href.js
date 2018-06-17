// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import ParseNode, {assertNodeType} from "../ParseNode";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "href",
    names: ["\\href"],
    props: {
        numArgs: 2,
        argTypes: ["string", "original"],
    },
    handler: ({parser}, args) => {
        const body = args[1];
        // hyperref package allows backslashes alone in href, but doesn't generate
        // valid links in such cases; we interpret this as "undefiend" behaviour,
        // and keep them as-is. Some browser will replace backslashes with
        // forward slashes.
        const href = assertNodeType(args[0], "string").value.value
                .replace(/\\([#$%&~_^{}])/g, '$1');
        return new ParseNode("href", {
            type: "href",
            href: href,
            body: ordargument(body),
        }, parser.mode);
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
