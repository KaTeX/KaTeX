//@flow
// Horizontal spacing commands

import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import { calculateSize } from "../units";

// TODO: \hskip and \mskip should support plus and minus in lengths

defineFunction({
    type: "kern",
    names: ["\\kern", "\\mkern", "\\hskip", "\\mskip"],
    props: {
        numArgs: 1,
        argTypes: ["size"],
        allowedInText: true,
    },
    handler: (context, args) => {
        if (context.parser.settings.strict) {
            const mathFunction = (context.funcName[1] === 'm');  // \mkern, \mskip
            const muUnit = (args[0].value.value.unit === 'mu');
            if (mathFunction) {
                if (!muUnit) {
                    context.parser.settings.reportNonstrict("mathVsTextUnits",
                        `LaTeX's ${context.funcName} supports only mu units, ` +
                        `not ${args[0].value.value.unit} units`);
                }
                if (context.parser.mode !== "math") {
                    context.parser.settings.reportNonstrict("mathVsTextUnits",
                        `LaTeX's ${context.funcName} works only in math mode`);
                }
            } else {  // !mathFunction
                if (muUnit) {
                    context.parser.settings.reportNonstrict("mathVsTextUnits",
                        `LaTeX's ${context.funcName} doesn't support mu units`);
                }
            }
        }
        return {
            type: "kern",
            dimension: args[0].value.value,
        };
    },
    htmlBuilder: (group, options) => {
        return buildCommon.makeGlue(group.value.dimension, options);
    },
    mathmlBuilder: (group, options) => {
        const node = new mathMLTree.MathNode("mspace");

        const dimension = calculateSize(group.value.dimension, options);
        node.setAttribute("width", dimension + "em");

        return node;
    },
});
