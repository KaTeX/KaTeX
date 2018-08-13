// @flow
import {defineFunctionBuilders} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";

import * as mml from "../buildMathML";

// Operator ParseNodes created in Parser.js from symbol Groups in src/symbols.js.

defineFunctionBuilders({
    type: "atom",
    htmlBuilder(group, options) {
        return buildCommon.mathsym(
            group.value, group.mode, options, ["m" + group.family]);
    },
    mathmlBuilder(group, options) {
        const node = new mathMLTree.MathNode(
            "mo", [mml.makeText(group.value, group.mode)]);
        if (group.family === "bin") {
            const variant = mml.getVariant(group, options);
            if (variant === "bold-italic") {
                node.setAttribute("mathvariant", variant);
            }
        } else if (group.family === "punct") {
            node.setAttribute("separator", "true");
        }
        return node;
    },
});

