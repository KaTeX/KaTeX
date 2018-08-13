// @flow
import {defineFunctionBuilders} from "../defineFunction";
import mathMLTree from "../mathMLTree";

import * as mml from "../buildMathML";

defineFunctionBuilders({
    type: "tag",
    mathmlBuilder(group, options) {
        const table = new mathMLTree.MathNode("mtable", [
            new mathMLTree.MathNode("mlabeledtr", [
                new mathMLTree.MathNode("mtd", [
                    mml.buildExpressionRow(group.tag, options),
                ]),
                new mathMLTree.MathNode("mtd", [
                    mml.buildExpressionRow(group.body, options),
                ]),
            ]),
        ]);
        table.setAttribute("side", "right");
        return table;
    },
});

