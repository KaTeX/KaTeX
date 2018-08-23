// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import {assertNodeType} from "../parseNode";
import {assertType} from "../utils";
import {MathNode} from "../mathMLTree";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "href",
    names: ["\\href"],
    props: {
        numArgs: 2,
        argTypes: ["url", "original"],
        allowedInText: true,
    },
    handler: ({parser}, args) => {
        const body = args[1];
        const href = assertNodeType(args[0], "url").url;
        return {
            type: "href",
            mode: parser.mode,
            href,
            body: ordargument(body),
        };
    },
    htmlBuilder: (group, options) => {
        const elements = html.buildExpression(group.body, options, false);
        return new buildCommon.makeAnchor(group.href, [], elements, options);
    },
    mathmlBuilder: (group, options) => {
        const math = mml.buildExpressionRow(group.body, options);
        assertType(math, MathNode).setAttribute("href", group.href);
        return math;
    },
});

defineFunction({
    type: "href",
    names: ["\\url"],
    props: {
        numArgs: 1,
        argTypes: ["url"],
        allowedInText: true,
    },
    handler: ({parser}, args) => {
        const href = assertNodeType(args[0], "url").url;
        const chars = [];
        Array.prototype.forEach.call(href, function(node) {
            let c = node;
            if (c === "~") {
                c = "\\textasciitilde";
            }
            chars.push({
                type: "textord",
                mode: "text",
                text: c,
            });
        });
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
