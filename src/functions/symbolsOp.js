// @flow
import {defineFunctionBuilders} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";

import * as mml from "../buildMathML";

import type Options from "../Options";
import type ParseNode from "../ParseNode";
import type {Group} from "../symbols";

// Operator ParseNodes created in Parser.js from symbol Groups in src/symbols.js.

// NOTE: `NODETYPE` is constrained by `Group` instead of `NodeType`. This
// guarantees that `group.value` is a string as required by buildCommon.mathsym.
function defineOpFunction<NODETYPE: Group>(
    type: NODETYPE,
    mathmlNodePostProcessor?: (
        mathMLTree.MathNode,
        ParseNode<NODETYPE>,
        Options) => *,
) {
    defineFunctionBuilders({
        type,
        htmlBuilder(group: ParseNode<NODETYPE>, options) {
            const groupValue: string = group.value;
            return buildCommon.mathsym(
                groupValue, group.mode, options, ["m" + type]);
        },
        mathmlBuilder(group: ParseNode<NODETYPE>, options) {
            const node = new mathMLTree.MathNode(
                "mo", [mml.makeText(group.value, group.mode)]);
            if (mathmlNodePostProcessor) {
                mathmlNodePostProcessor(node, group, options);
            }
            return node;
        },
    });
}

defineOpFunction("bin", (mathNode, group, options) => {
    const variant = mml.getVariant(group, options);
    if (variant === "bold-italic") {
        mathNode.setAttribute("mathvariant", variant);
    }
});
defineOpFunction("rel");
defineOpFunction("open");
defineOpFunction("close");
defineOpFunction("inner");
defineOpFunction("punct", mathNode => mathNode.setAttribute("separator", "true"));

