//@flow
// Horizontal spacing commands

import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import { calculateSize } from "../units";
import ParseError from "../ParseError";

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
        const mathFunction = (context.funcName[1] === 'm');  // \mkern, \mskip
        const muUnit = (args[0].value.unit === 'mu');
        if (mathFunction) {
            if (!muUnit) {
                throw new ParseError(
                    `${context.funcName} supports only mu units, ` +
                    `not ${args[0].value.unit} units`);
            }
            if (context.parser.mode !== "math") {
                throw new ParseError(
                    `Can't use function '${context.funcName}' in text mode`);
            }
        } else {  // !mathFunction
            if (muUnit) {
                throw new ParseError(
                    `${context.funcName} does not support mu units`);
            }
        }
        return {
            type: "kern",
            dimension: args[0].value,
        };
    },
    htmlBuilder: (group, options) => {
        // Make an empty span for the rule
        const rule = buildCommon.makeSpan(["mord", "rule"], [], options);

        if (group.value.dimension) {
            const dimension = calculateSize(group.value.dimension, options);
            rule.style.marginLeft = dimension + "em";
        }

        return rule;
    },
    mathmlBuilder: (group) => {
        // TODO(kevin): Figure out if there's a way to add space in MathML
        const node = new mathMLTree.MathNode("mrow");

        return node;
    },
});
