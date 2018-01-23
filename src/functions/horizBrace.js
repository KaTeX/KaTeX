// @flow
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import stretchy from "../stretchy";
import Style from "../Style";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "horizBrace",
    names: ["\\overbrace", "\\underbrace"],
    props: {
        numArgs: 1,
    },
    handler(context, args, optArgs) {
        const base = args[0];
        return {
            type: "horizBrace",
            label: context.funcName,
            isOver: /^\\over/.test(context.funcName),
            base: base,
        };
    },
    htmlBuilder(group, options) {
        const style = options.style;

        const hasSupSub = (group.type === "supsub");
        let supSubGroup;
        let newOptions;
        if (hasSupSub) {
            // Ref: LaTeX source2e: }}}}\limits}
            // i.e. LaTeX treats the brace similar to an op and passes it
            // with \limits, so we need to assign supsub style.
            if (group.value.sup) {
                newOptions = options.havingStyle(style.sup());
                supSubGroup = html.buildGroup(group.value.sup, newOptions, options);
            } else {
                newOptions = options.havingStyle(style.sub());
                supSubGroup = html.buildGroup(group.value.sub, newOptions, options);
            }
            group = group.value.base;
        }

        // Build the base group
        const body = html.buildGroup(
        group.value.base, options.havingBaseStyle(Style.DISPLAY));

        // Create the stretchy element
        const braceBody = stretchy.svgSpan(group, options);

        // Generate the vlist, with the appropriate kerns               ┏━━━━━━━━┓
        // This first vlist contains the subject matter and the brace:   equation
        let vlist;
        if (group.value.isOver) {
            vlist = buildCommon.makeVList({
                positionType: "firstBaseline",
                children: [
                    {type: "elem", elem: body},
                    {type: "kern", size: 0.1},
                    {type: "elem", elem: braceBody},
                ],
            }, options);
        } else {
            vlist = buildCommon.makeVList({
                positionType: "bottom",
                positionData: body.depth + 0.1 + braceBody.height,
                children: [
                    {
                        type: "elem",
                        elem: braceBody,
                        wrapperClasses: ["svg-align"],
                    },
                    {type: "kern", size: 0.1},
                    {type: "elem", elem: body},
                ],
            }, options);
        }

        if (hasSupSub && supSubGroup) {
            // In order to write the supsub, wrap the first vlist in another vlist:
            // They can't all go in the same vlist, because the note might be wider
            // than the equation. We want the equation to control the brace width.

            //      note          long note           long note
            //   ┏━━━━━━━━┓   or    ┏━━━┓     not    ┏━━━━━━━━━┓
            //    equation           eqn                 eqn

            const vSpan = buildCommon.makeSpan(["mord",
                (group.value.isOver ? "mover" : "munder")],
                [vlist], options);

            if (group.value.isOver) {
                vlist = buildCommon.makeVList({
                    positionType: "firstBaseline",
                    children: [
                        {type: "elem", elem: vSpan},
                        {type: "kern", size: 0.2},
                        {type: "elem", elem: supSubGroup},
                    ],
                }, options);
            } else {
                vlist = buildCommon.makeVList({
                    positionType: "bottom",
                    positionData: vSpan.depth + 0.2 + supSubGroup.height,
                    children: [
                        {type: "elem", elem: supSubGroup},
                        {type: "kern", size: 0.2},
                        {type: "elem", elem: vSpan},
                    ],
                }, options);
            }
        }

        return buildCommon.makeSpan(
            ["mord", (group.value.isOver ? "mover" : "munder")],
            [vlist], options);
    },
    mathmlBuilder(group, options) {
        const accentNode = stretchy.mathMLnode(group.value.label);
        return new mathMLTree.MathNode(
            (group.value.isOver ? "mover" : "munder"),
            [mml.buildGroup(group.value.base, options), accentNode]
        );
    },
});
