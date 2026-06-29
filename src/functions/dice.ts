import defineFunction from "../defineFunction";
import {makeSymbol} from "../buildCommon";

import * as mml from "../buildMathML";
import {assertNodeType} from "../parseNode";
import {MathNode} from "../mathMLTree";

const diceUnicode = ['\u2680', '\u2681', '\u2682',
    '\u2683', '\u2684', '\u2685'];

defineFunction({
    type: "dice",
    names: ["\\epsdice"],
    numArgs: 1,
    numOptionalArgs: 1,
    argTypes: ["raw", "raw"],
    allowedInText: true,

    handler({parser}, args, optArgs) {
        const value = assertNodeType(args[0], "raw");
        const face = optArgs[0];
        if (!['1', '2', '3', '4', '5', '6'].includes(value.string)) {
            throw new Error("Illegal value for \\epsdice.");
        }
        return {
            type: "dice",
            mode: parser.mode,
            value: parseInt(value.string),
            face: face && assertNodeType(face, "raw").string,
        };
    },

    htmlBuilder(group, options) {
        const value = group.value;
        const black = (group.face === "black");
        return makeSymbol(diceUnicode[value - 1], "Main-Regular", "text",
                            options, black ? ["dice-black"] : []);
    },

    mathmlBuilder(group, options) {
        const value = group.value;
        const text = mml.makeText(diceUnicode[value - 1], group.mode, options);
        const node = new MathNode("mi", [text]);
        node.setAttribute("mathvariant", "normal");
        return node;
    },
});
