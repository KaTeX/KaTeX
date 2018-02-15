// @flow
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "underline",
    names: ["\\underline"],
    props: {
        numArgs: 1,
        allowedInText: true,
    },
    handler(context, args) {
        const body = args[0];
        return {
            type: "underline",
            body: body,
        };
    },
    htmlBuilder(group, options) {
        // Underlines are handled in the TeXbook pg 443, Rule 10.
        // Build the inner group.
        const innerGroup = html.buildGroup(group.value.body, options);

        // Create the line to go below the body
        const line = buildCommon.makeLineSpan("underline-line", options);

        // Generate the vlist, with the appropriate kerns
        const vlist = buildCommon.makeVList({
            positionType: "top",
            positionData: innerGroup.height,
            children: [
                // The SVG image is 5x as tall as the line.
                // The bottom 2/5 of the image is blank and acts like a kern.
                // So we omit the kern that would otherwise go at the bottom.
                {type: "elem", elem: line},
                {type: "kern", size: 5 * line.height},
                {type: "elem", elem: innerGroup},
            ],
        }, options);

        return buildCommon.makeSpan(["mord", "underline"], [vlist], options);
    },
    mathmlBuilder(group, options) {
        const operator = new mathMLTree.MathNode(
            "mo", [new mathMLTree.TextNode("\u203e")]);
        operator.setAttribute("stretchy", "true");

        const node = new mathMLTree.MathNode(
            "munder",
            [mml.buildGroup(group.value.body, options), operator]);
        node.setAttribute("accentunder", "true");

        return node;
    },
});
