//@flow
// Horizontal spacing commands

import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import {calculateSize} from "../units";
import {assertNodeType} from "../parseNode";

// TODO: \hskip and \mskip should support plus and minus in lengths

const checkUnitConsistency = (expr, funcName, mathFunction, settings) => {
    if (expr.type === "sum") {
        checkUnitConsistency(expr.lhs, funcName, mathFunction, settings);
        checkUnitConsistency(expr.rhs, funcName, mathFunction, settings);
    } else if (expr.type === "multiply") {
        checkUnitConsistency(expr.lhs, funcName, mathFunction, settings);
    } else {
        const muUnit = (expr.unit === 'mu');
        if (mathFunction) {
            if (!muUnit) {
                settings.reportNonstrict("mathVsTextUnits",
                    `LaTeX's ${funcName} supports only mu units, ` +
                    `not ${expr.unit} units`);
            }
        } else {
            if (muUnit) {
                settings.reportNonstrict("mathVsTextUnits",
                    `LaTeX's ${funcName} doesn't support mu units`);
            }
        }
    }
};

defineFunction({
    type: "kern",
    names: ["\\kern", "\\mkern", "\\hskip", "\\mskip"],
    props: {
        numArgs: 1,
        argTypes: ["size"],
        primitive: true,
        allowedInText: true,
    },
    handler({parser, funcName}, args) {
        const size = assertNodeType(args[0], "size");
        if (parser.settings.strict) {
            const mathFunction = (funcName[1] === 'm');  // \mkern, \mskip
            checkUnitConsistency(
                size.value, funcName, mathFunction, parser.settings);
            if (mathFunction && parser.mode !== "math") {
                parser.settings.reportNonstrict("mathVsTextUnits",
                    `LaTeX's ${funcName} works only in math mode`);
            }
        }
        return {
            type: "kern",
            mode: parser.mode,
            dimension: size.value,
        };
    },
    htmlBuilder(group, options) {
        return buildCommon.makeGlue(group.dimension, options);
    },
    mathmlBuilder(group, options) {
        const dimension = calculateSize(group.dimension, options);
        return new mathMLTree.SpaceNode(dimension);
    },
});
