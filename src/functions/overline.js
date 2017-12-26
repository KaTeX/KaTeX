// @flow
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "overline",
    names: ["\\overline"],
    props: {
        numArgs: 1,
    },
    handler(context, args) {
        const body = args[0];
        return {
            type: "overline",
            body: body,
        };
    },
    htmlBuilder(group, options) {
        // Overlines are handled in the TeXbook pg 443, Rule 9.

        // Build the inner group in the cramped style.
        const innerGroup = html.buildGroup(group.value.body,
            options.havingCrampedStyle());

        // Create the line above the body
        const line = buildCommon.makeLineSpan("overline-line", options);

        // Generate the vlist, with the appropriate kerns
        const vlist = buildCommon.makeVList({
            positionType: "firstBaseline",
            children: [
                {type: "elem", elem: innerGroup},
                // The kern on the next line would ordinarily be 3 * line.height
                // But we put the line into a span that is 5 lines tall, to
                // overcome a Chrome rendering issue. The SVG has a space in
                // the bottom that is 2 lines high. That and the 1-line-high
                // kern sum up to the same distance as the old 3 line kern.
                {type: "kern", size: line.height},
                {type: "elem", elem: line},
            ],
        }, options);

        return buildCommon.makeSpan(["mord", "overline"], [vlist], options);
    },
    mathmlBuilder(group, options) {
        const operator = new mathMLTree.MathNode(
            "mo", [new mathMLTree.TextNode("\u203e")]);
        operator.setAttribute("stretchy", "true");

        const node = new mathMLTree.MathNode(
            "mover",
            [mml.buildGroup(group.value.body, options), operator]);
        node.setAttribute("accent", "true");

        return node;
    },
});
