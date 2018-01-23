// @flow
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import stretchy from "../stretchy";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "xArrow",
    names: [
        "\\xleftarrow", "\\xrightarrow", "\\xLeftarrow", "\\xRightarrow",
        "\\xleftrightarrow", "\\xLeftrightarrow", "\\xhookleftarrow",
        "\\xhookrightarrow", "\\xmapsto", "\\xrightharpoondown",
        "\\xrightharpoonup", "\\xleftharpoondown", "\\xleftharpoonup",
        "\\xrightleftharpoons", "\\xleftrightharpoons", "\\xlongequal",
        "\\xtwoheadrightarrow", "\\xtwoheadleftarrow", "\\xtofrom",
    ],
    props: {
        numArgs: 1,
        numOptionalArgs: 1,
    },
    handler(context, args, optArgs) {
        const below = optArgs[0];
        const body = args[0];
        return {
            type: "xArrow",   // x for extensible
            label: context.funcName,
            body: body,
            below: below,
        };
    },
    htmlBuilder(group, options) {
        const style = options.style;

        // Build the argument groups in the appropriate style.
        // Ref: amsmath.dtx:   \hbox{$\scriptstyle\mkern#3mu{#6}\mkern#4mu$}%

        let newOptions = options.havingStyle(style.sup());
        const upperGroup = html.buildGroup(group.value.body, newOptions, options);
        upperGroup.classes.push("x-arrow-pad");

        let lowerGroup;
        if (group.value.below) {
            // Build the lower group
            newOptions = options.havingStyle(style.sub());
            lowerGroup = html.buildGroup(group.value.below, newOptions, options);
            lowerGroup.classes.push("x-arrow-pad");
        }

        const arrowBody = stretchy.svgSpan(group, options);

        // Re shift: Note that stretchy.svgSpan returned arrowBody.depth = 0.
        // The point we want on the math axis is at 0.5 * arrowBody.height.
        const arrowShift = -options.fontMetrics().axisHeight +
            0.5 * arrowBody.height;
        // 2 mu kern. Ref: amsmath.dtx: #7\if0#2\else\mkern#2mu\fi
        const upperShift = -options.fontMetrics().axisHeight -
            0.5 * arrowBody.height - 0.111;

        // Generate the vlist
        let vlist;
        if (lowerGroup) {
            const lowerShift = -options.fontMetrics().axisHeight
                + lowerGroup.height + 0.5 * arrowBody.height
                + 0.111;
            vlist = buildCommon.makeVList({
                positionType: "individualShift",
                children: [
                    {type: "elem", elem: upperGroup, shift: upperShift},
                    {
                        type: "elem",
                        elem: arrowBody,
                        shift: arrowShift,
                        wrapperClasses: ["svg-align"],
                    },
                    {type: "elem", elem: lowerGroup, shift: lowerShift},
                ],
            }, options);
        } else {
            vlist = buildCommon.makeVList({
                positionType: "individualShift",
                children: [
                    {type: "elem", elem: upperGroup, shift: upperShift},
                    {
                        type: "elem",
                        elem: arrowBody,
                        shift: arrowShift,
                        wrapperClasses: ["svg-align"],
                    },
                ],
            }, options);
        }

        return buildCommon.makeSpan(["mrel", "x-arrow"], [vlist], options);
    },
    mathmlBuilder(group, options) {
        const arrowNode = stretchy.mathMLnode(group.value.label);
        let node;
        let lowerNode;

        if (group.value.body) {
            const upperNode = mml.buildGroup(group.value.body, options);
            if (group.value.below) {
                lowerNode = mml.buildGroup(group.value.below, options);
                node = new mathMLTree.MathNode(
                    "munderover", [arrowNode, lowerNode, upperNode]
                );
            } else {
                node = new mathMLTree.MathNode("mover", [arrowNode, upperNode]);
            }
        } else if (group.value.below) {
            lowerNode = mml.buildGroup(group.value.below, options);
            node = new mathMLTree.MathNode("munder", [arrowNode, lowerNode]);
        } else {
            node = new mathMLTree.MathNode("mover", [arrowNode]);
        }
        return node;
    },
});
