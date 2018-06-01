//@flow
// Row breaks within tabular environments, and line breaks at top level

import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import {calculateSize} from "../units";
import ParseError from "../ParseError";
import {assertNodeType} from "../ParseNode";

// \\ is a macro mapping to either \cr or \newline.  Because they have the
// same signature, we implement them as one megafunction, with newRow
// indicating whether we're in the \cr case, and newLine indicating whether
// to break the line in the \newline case.

defineFunction({
    type: "cr",
    names: ["\\cr", "\\newline"],
    props: {
        numArgs: 0,
        numOptionalArgs: 1,
        argTypes: ["size"],
        allowedInText: true,
    },

    handler: (context, args, optArgs) => {
        const size = optArgs[0];
        const newRow = (context.funcName === "\\cr");
        let newLine = false;
        if (!newRow) {
            if (context.parser.settings.displayMode &&
                context.parser.settings.useStrictBehavior(
                    "newLineInDisplayMode", "In LaTeX, \\\\ or \\newline " +
                    "does nothing in display mode")) {
                newLine = false;
            } else {
                newLine = true;
            }
        }
        return {
            type: "cr",
            newLine,
            newRow,
            size: size && assertNodeType(size, "size"),
        };
    },

    // The following builders are called only at the top level,
    // not within tabular/array environments.

    htmlBuilder: (group, options) => {
        if (group.value.newRow) {
            throw new ParseError(
                "\\cr valid only within a tabular/array environment");
        }
        const span = buildCommon.makeSpan(["mspace"], [], options);
        if (group.value.newLine) {
            span.classes.push("newline");
            if (group.value.size) {
                span.style.marginTop =
                    calculateSize(group.value.size.value.value, options) + "em";
            }
        }
        return span;
    },

    mathmlBuilder: (group, options) => {
        const node = new mathMLTree.MathNode("mspace");
        if (group.value.newLine) {
            node.setAttribute("linebreak", "newline");
            if (group.value.size) {
                node.setAttribute("height",
                    calculateSize(group.value.size.value.value, options) + "em");
            }
        }
        return node;
    },
});
