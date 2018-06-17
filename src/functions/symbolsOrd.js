// @flow
import {defineFunctionBuilders} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";

import * as mml from "../buildMathML";

// "mathord" and "textord" ParseNodes created in Parser.js from symbol Groups in
// src/symbols.js.

const defaultVariant = {
    "mi": "italic",
    "mn": "normal",
    "mtext": "normal",
};

defineFunctionBuilders({
    type: "mathord",
    htmlBuilder(group, options) {
        return buildCommon.makeOrd(group, options, "mathord");
    },
    mathmlBuilder(group, options) {
        const node = new mathMLTree.MathNode(
            "mi",
            [mml.makeText(group.value, group.mode, options)]);

        const variant = mml.getVariant(group, options) || "italic";
        if (variant !== defaultVariant[node.type]) {
            node.setAttribute("mathvariant", variant);
        }
        return node;
    },
});

defineFunctionBuilders({
    type: "textord",
    htmlBuilder(group, options) {
        return buildCommon.makeOrd(group, options, "textord");
    },
    mathmlBuilder(group, options) {
        const text = mml.makeText(group.value, group.mode, options);
        const variant = mml.getVariant(group, options) || "normal";

        let node;
        if (group.mode === 'text') {
            node = new mathMLTree.MathNode("mtext", [text]);
        } else if (/[0-9]/.test(group.value)) {
            // TODO(kevinb) merge adjacent <mn> nodes
            // do it as a post processing step
            node = new mathMLTree.MathNode("mn", [text]);
        } else if (group.value === "\\prime") {
            node = new mathMLTree.MathNode("mo", [text]);
        } else {
            node = new mathMLTree.MathNode("mi", [text]);
        }
        if (variant !== defaultVariant[node.type]) {
            node.setAttribute("mathvariant", variant);
        }

        return node;
    },
});
