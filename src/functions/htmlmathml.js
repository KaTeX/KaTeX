// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import ParseNode from "../ParseNode";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "htmlmathml",
    names: ["\\html@mathml"],
    props: {
        numArgs: 2,
        allowedInText: true,
    },
    handler: ({parser}, args) => {
        return new ParseNode("htmlmathml", {
            type: "htmlmathml",
            html:   ordargument(args[0]),
            mathml: ordargument(args[1]),
        }, parser.mode);
    },
    htmlBuilder: (group, options) => {
        const elements = html.buildExpression(
            group.value.html,
            options,
            false
        );
        return new buildCommon.makeFragment(elements);
    },
    mathmlBuilder: (group, options) => {
        return mml.buildExpressionRow(group.value.mathml, options);
    },
});
