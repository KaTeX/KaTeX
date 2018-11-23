//@flow
// Row breaks within tabular environments, and line breaks at top level

import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";

// \\ is a macro mapping to either \cr or \newline.  Because they have the
// same signature, we implement them as one megafunction, with newRow
// indicating whether we're in the \cr case, and newLine indicating whether
// to break the line in the \newline case.

defineFunction({
    type: "nop",
    names: ["\\nop"],
    props: {
        numArgs: 0,
        numOptionalArgs: 0,
        allowedInText: true,
    },

    handler({parser, funcName}, args, optArgs) {
        return {
            type: "nop",
            mode: parser.mode,
        };
    },

    // The following builders are called only at the top level,
    // not within tabular/array environments.

    htmlBuilder(group, options) {
        return buildCommon.makeSpan(["mspace"], [], options);
    },

    mathmlBuilder(group, options) {
        return new mathMLTree.MathNode("nop");
    },
});
