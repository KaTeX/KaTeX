// @flow
import {defineFunctionBuilders} from "../defineFunction";
import mathMLTree from "../mathMLTree";

import * as mml from "../buildMathML";

defineFunctionBuilders({
    type: "tag",
    mathmlBuilder(group, options) {
        const pad = new mathMLTree.MathNode("mtd", []);
        pad.setAttribute("width", "50%");
        const pad2 = new mathMLTree.MathNode("mtd", []);
        pad2.setAttribute("width", "50%");

        const table = new mathMLTree.MathNode("mtable", [
            new mathMLTree.MathNode("mtr", [
                pad,
                new mathMLTree.MathNode("mtd", [
                    mml.buildExpressionRow(group.body, options),
                ]),
                pad2,
                new mathMLTree.MathNode("mtd", [
                    mml.buildExpressionRow(group.tag, options),
                ]),
            ]),
        ]);
        table.setAttribute("width", "100%");
        return table;
    },
});

