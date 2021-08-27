// @flow
import defineFunction from "../defineFunction";
import {assertNodeType} from "../parseNode";

// \@char is an internal function that takes a grouped decimal argument like
// {123} and converts into symbol with code 123.  It is used by the *macro*
// \char defined in macros.js.
defineFunction({
    type: "textord",
    names: ["\\char"],
    props: {
        numArgs: 1,
        argTypes: ["integer"],
        allowedInText: true,
    },
    handler({parser}, args) {
        const arg = assertNodeType(args[0], "integer");
        return {
            type: "textord",
            mode: parser.mode,
            text: String.fromCharCode(arg.value),
        };
    },
});
