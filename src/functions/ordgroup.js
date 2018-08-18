// @flow
import {defineFunctionBuilders} from "../defineFunction";
import buildCommon from "../buildCommon";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunctionBuilders({
    type: "ordgroup",
    htmlBuilder(group, options) {
        const inner = html.buildExpression(group.body, options, true);
        return buildCommon.makeSpan(
            ["mord"], buildCommon.tryCombineChars(inner), options);
    },
    mathmlBuilder(group, options) {
        return mml.buildExpressionRow(group.body, options);
    },
});

