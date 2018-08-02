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
    handler({parser}, args) {
        const body = args[0];
        return {
            type: "overline",
            mode: parser.mode,
            value: {
                type: "overline",
                body: body,
            },
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
                {type: "kern", size: 3 * line.height},
                {type: "elem", elem: line},
                {type: "kern", size: line.height},
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
