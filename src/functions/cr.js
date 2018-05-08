//@flow
// Row breaks within tabular environments, and line breaks at top level

import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import { calculateSize } from "../units";
import ParseError from "../ParseError";

defineFunction({
    type: "cr",
    names: ["\\\\", "\\cr", "\\newline"],
    props: {
        numArgs: 0,
        numOptionalArgs: 1,
        argTypes: ["size"],
        allowedInText: true,
    },

    handler: (context, args, optArgs) => {
        return {
            type: "cr",
            // \\ and \cr both end the row in a tabular environment
            newRow: context.funcName !== "\\newline",
            // \\ and \newline both end the line in an inline math environment
            newLine: context.funcName !== "\\cr",
            size: optArgs[0],
        };
    },

    // The following builders are called only at the top level,
    // not within tabular environments.

    htmlBuilder: (group, options) => {
        if (!group.value.newLine) {
            throw new ParseError(
                "\\cr valid only within a tabular environment");
        }
        const span = buildCommon.makeSpan(["mspace", "newline"], [], options);
        if (group.value.size) {
            span.style.marginTop =
                calculateSize(group.value.size.value, options) + "em";
        }
        return span;
    },

    mathmlBuilder: (group, options) => {
        const node = new mathMLTree.MathNode("mspace");
        node.setAttribute("linebreak", "newline");
        if (group.value.size) {
            node.setAttribute("height",
                calculateSize(group.value.size.value, options) + "em");
        }
        return node;
    },
});
