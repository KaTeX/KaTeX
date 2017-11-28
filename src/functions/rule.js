// @flow
import buildCommon from "../buildCommon";
import defineFunction from "../defineFunction";
import mathMLTree from "../mathMLTree";
import {calculateSize} from "../units";

defineFunction({
    type: "rule",
    names: ["\\rule"],
    props: {
        numArgs: 2,
        numOptionalArgs: 1,
        argTypes: ["size", "size", "size"],
    },
    handler(context, args, optArgs) {
        const shift = optArgs[0];
        const width = args[0];
        const height = args[1];
        return {
            type: "rule",
            shift: shift && shift.value,
            width: width.value,
            height: height.value,
        };
    },
    htmlBuilder(group, options) {
        // Make an empty span for the rule
        const rule = buildCommon.makeSpan(["mord", "rule"], [], options);

        // Calculate the shift, width, and height of the rule, and account for units
        let shift = 0;
        if (group.value.shift) {
            shift = calculateSize(group.value.shift, options);
        }

        const width = calculateSize(group.value.width, options);
        const height = calculateSize(group.value.height, options);

        // Style the rule to the right size
        rule.style.borderRightWidth = width + "em";
        rule.style.borderTopWidth = height + "em";
        rule.style.bottom = shift + "em";

        // Record the height and width
        rule.width = width;
        rule.height = height + shift;
        rule.depth = -shift;
        // Font size is the number large enough that the browser will
        // reserve at least `absHeight` space above the baseline.
        // The 1.125 factor was empirically determined
        rule.maxFontSize = height * 1.125 * options.sizeMultiplier;

        return rule;
    },
    mathmlBuilder(group, options) {
        // TODO(emily): Figure out if there's an actual way to draw black boxes
        // in MathML.
        const node = new mathMLTree.MathNode("mrow");

        return node;
    },
});
