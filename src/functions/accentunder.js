// @flow
// Horizontal overlap functions
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import stretchy from "../stretchy";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "accentUnder",
    names: [
        "\\underleftarrow", "\\underrightarrow", "\\underleftrightarrow",
        "\\undergroup", "\\underlinesegment", "\\utilde",
    ],
    props: {
        numArgs: 1,
    },
    handler: (context, args) => {
        const base = args[0];
        return {
            type: "accentUnder",
            label: context.funcName,
            base: base,
        };
    },
    htmlBuilder: (group, options) => {
        // Treat under accents much like underlines.
        const innerGroup = html.buildGroup(group.value.base, options);

        const accentBody = stretchy.svgSpan(group, options);
        const kern = group.value.label === "\\utilde" ? 0.12 : 0;

        // Generate the vlist, with the appropriate kerns
        const vlist = buildCommon.makeVList({
            positionType: "bottom",
            positionData: accentBody.height + kern,
            children: [
                {type: "elem", elem: accentBody, wrapperClasses: ["svg-align"]},
                {type: "kern", size: kern},
                {type: "elem", elem: innerGroup},
            ],
        }, options);

        return buildCommon.makeSpan(["mord", "accentunder"], [vlist], options);
    },
    mathmlBuilder: (group, options) => {
        const accentNode = stretchy.mathMLnode(group.value.label);
        const node = new mathMLTree.MathNode(
            "munder",
            [mml.buildGroup(group.value.body, options), accentNode]
        );
        node.setAttribute("accentunder", "true");
        return node;
    },
});
