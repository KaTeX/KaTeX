//@flow
// Horizontal spacing commands

import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import {calculateSize} from "../units";
import ParseNode, {assertNodeType} from "../ParseNode";

// TODO: \hskip and \mskip should support plus and minus in lengths

defineFunction({
    type: "kern",
    names: ["\\kern", "\\mkern", "\\hskip", "\\mskip"],
    props: {
        numArgs: 1,
        argTypes: ["size"],
        allowedInText: true,
    },
    handler: ({parser, funcName}, args) => {
        const size = assertNodeType(args[0], "size");
        if (parser.settings.strict) {
            const mathFunction = (funcName[1] === 'm');  // \mkern, \mskip
            const muUnit = (size.value.value.unit === 'mu');
            if (mathFunction) {
                if (!muUnit) {
                    parser.settings.reportNonstrict("mathVsTextUnits",
                        `LaTeX's ${funcName} supports only mu units, ` +
                        `not ${size.value.value.unit} units`);
                }
                if (parser.mode !== "math") {
                    parser.settings.reportNonstrict("mathVsTextUnits",
                        `LaTeX's ${funcName} works only in math mode`);
                }
            } else {  // !mathFunction
                if (muUnit) {
                    parser.settings.reportNonstrict("mathVsTextUnits",
                        `LaTeX's ${funcName} doesn't support mu units`);
                }
            }
        }
        return new ParseNode("kern", {
            type: "kern",
            dimension: size.value.value,
        }, parser.mode);
    },
    htmlBuilder: (group, options) => {
        return buildCommon.makeGlue(group.value.dimension, options);
    },
    mathmlBuilder: (group, options) => {
        const dimension = calculateSize(group.value.dimension, options);
        return new mathMLTree.SpaceNode(dimension);
    },
});
