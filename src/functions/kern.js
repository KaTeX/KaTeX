//@flow
/* eslint no-console:0 */
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
                typeof console !== "undefined" && console.warn(
                    `In LaTeX, ${context.funcName} supports only mu units, ` +
                    `not ${args[0].value.unit} units`);
            }
            if (context.parser.mode !== "math") {
                throw new ParseError(
                    `Can't use function '${context.funcName}' in text mode`);
            }
        } else {  // !mathFunction
            if (muUnit) {
                typeof console !== "undefined" && console.warn(
                    `In LaTeX, ${context.funcName} does not support mu units`);
            }
        }
        return {
            type: "kern",
            dimension: args[0].value,
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
