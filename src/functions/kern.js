//@flow
// Horizontal spacing commands

import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import {calculateSize} from "../units";
import {assertNodeType} from "../parseNode";

// TODO: \hskip and \mskip should support plus and minus in lengths

defineFunction({
    type: "kern",
    names: ["\\kern", "\\mkern", "\\hskip", "\\mskip"],
    props: {
        numArgs: 1,
        argTypes: ["size"],
        allowedInText: true,
    },
    handler({parser, funcName}, args) {
        const size = assertNodeType(args[0], "size");
        if (parser.settings.strict) {
            const mathFunction = (funcName[1] === 'm');  // \mkern, \mskip
            const muUnit = (size.value.unit === 'mu');
            if (mathFunction) {
                if (!muUnit) {
                    parser.settings.reportNonstrict("mathVsTextUnits",
                        `LaTeX's ${funcName} supports only mu units, ` +
                        `not ${size.value.unit} units`);
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
        if (group.mode === "text") {
            const character = new mathMLTree.TextNode(spaceCharacter(dimension));
            return new mathMLTree.MathNode("mtext", [character]);
        } else {
            const node = new mathMLTree.MathNode("mspace");
            node.setAttribute("width", dimension + "em");
            return node;
        }
    },
});

export const spaceCharacter = function(width: number): string {
    if (width >= 0.05555 && width <= 0.05556) {
        return "\u200a";           // &VeryThinSpace;
    } else if (width >= 0.1666 && width <= 0.1667) {
        return "\u2009";           // &ThinSpace;
    } else if (width >= 0.2222 && width <= 0.2223) {
        return "\u2005";           // &MediumSpace;
    } else if (width >= 0.2777 && width <= 0.2778) {
        return "\u2005\u200a";     // &ThickSpace;
    } else if (width >= -0.05556 && width <= -0.05555) {
        return "\u200a\u2063";     // &NegativeVeryThinSpace;
    } else if (width >= -0.1667 && width <= -0.1666) {
        return "\u2009\u2063";     // &NegativeThinSpace;
    } else if (width >= -0.2223 && width <= -0.2222) {
        return "\u205f\u2063";     // &NegativeMediumSpace;
    } else if (width >= -0.2778 && width <= -0.2777) {
        return "\u2005\u2063";     // &NegativeThickSpace;
    } else {
        return "";
    }
};
