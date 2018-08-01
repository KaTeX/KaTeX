// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";

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
        return {
            type: "htmlmathml",
            mode: parser.mode,
            value: {
                type: "htmlmathml",
                html:   ordargument(args[0]),
                mathml: ordargument(args[1]),
            },
        };
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
