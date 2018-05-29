//@flow
// Horizontal spacing commands

import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import {calculateSize} from "../units";
import {assertNodeType} from "../ParseNode";

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
        const size = assertNodeType(args[0], "size");
        if (context.parser.settings.strict) {
            const mathFunction = (context.funcName[1] === 'm');  // \mkern, \mskip
            const muUnit = (size.value.value.unit === 'mu');
            if (mathFunction) {
                if (!muUnit) {
                    context.parser.settings.reportNonstrict("mathVsTextUnits",
                        `LaTeX's ${context.funcName} supports only mu units, ` +
                        `not ${size.value.value.unit} units`);
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
            dimension: size.value.value,
        };
    },
    htmlBuilder: (group, options) => {
        return buildCommon.makeGlue(group.value.dimension, options);
    },
    mathmlBuilder: (group, options) => {
        const dimension = calculateSize(group.value.dimension, options);
        return new mathMLTree.SpaceNode(dimension);
    },
});
