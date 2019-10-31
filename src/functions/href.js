// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import {MathNode} from "../mathMLTree";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "href",
    names: ["\\href"],
    props: {
        argTypes: ["url", "original"],
        allowedInText: true,
    },
    handler: ({parser}, args) => {
        const body = args[1];
        const href = args[0].url;

        if (!parser.settings.isTrusted({
            command: "\\href",
            url: href,
        })) {
            return parser.formatUnsupportedCmd("\\href");
        }

        return {
            type: "href",
            mode: parser.mode,
            href,
            body: ordargument(body),
        };
    },
    htmlBuilder: (group, options) => {
        const elements = html.buildExpression(group.body, options, false);
        return buildCommon.makeAnchor(group.href, [], elements, options);
    },
    mathmlBuilder: (group, options) => {
        let math = mml.buildExpressionRow(group.body, options);
        if (!(math instanceof MathNode)) {
            math = new MathNode("mrow", [math]);
        }
        math.setAttribute("href", group.href);
        return math;
    },
});

defineFunction({
    type: "href",
    names: ["\\url"],
    props: {
        argTypes: ["url"],
        allowedInText: true,
    },
    handler: ({parser}, args) => {
        const href = args[0].url;

        if (!parser.settings.isTrusted({
            command: "\\url",
            url: href,
        })) {
            return parser.formatUnsupportedCmd("\\url");
        }

        const chars = [];
        for (let i = 0; i < href.length; i++) {
            let c = href[i];
            if (c === "~") {
                c = "\\textasciitilde";
            }
            chars.push({
                type: "textord",
                mode: "text",
                text: c,
            });
        }
        const body = {
            type: "text",
            mode: parser.mode,
            font: "\\texttt",
            body: chars,
        };
        return {
            type: "href",
            mode: parser.mode,
            href,
            body: ordargument(body),
        };
    },
});
