// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import ParseNode, {assertNodeType} from "../ParseNode";
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
        const href = assertNodeType(args[0], "url").value.value;
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
        assertType(math, MathNode).setAttribute("href", group.value.href);
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
        const href = assertNodeType(args[0], "url").value.value;
        const chars = [];
        for (let i = 0; i < href.length; i++) {
            let c = href[i];
            if (c === "~") {
                c = "\\textasciitilde";
            }
            chars.push(new ParseNode("textord", c, "text"));
        }
        const body = new ParseNode("text", {
            type: "text",
            font: "\\texttt",
            body: chars,
        }, parser.mode);
        return new ParseNode("href", {
            type: "href",
            href: href,
            body: ordargument(body),
        }, parser.mode);
    },
});
