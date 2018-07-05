// @flow
import defineFunction from "../defineFunction";
import ParseError from "../ParseError";
import ParseNode from "../ParseNode";

// \@char is an internal function that takes a grouped decimal argument like
// {123} and converts into symbol with code 123.  It is used by the *macro*
// \char defined in macros.js.
defineFunction({
    type: "textord",
    names: ["\\@char"],
    props: {
        numArgs: 1,
        allowedInText: true,
    },
    handler({parser}, args) {
        const arg = args[0];
        if (arg.type !== "ordgroup") {
            throw new ParseError(
                `\\@char has invalid argument type ${arg.type}`);
        }
        const group = arg.value;
        let number = "";
        for (let i = 0; i < group.length; i++) {
            if (group[i].type !== "textord") {
                throw new ParseError(
                    `\\@char has invalid argument piece ${group[i].type}`);
            }
            number += group[i].value;
        }
        const code = parseInt(number);
        if (isNaN(code)) {
            throw new ParseError(`\\@char has non-numeric argument ${number}`);
        }
        return new ParseNode("textord", String.fromCharCode(code), parser.mode);
    },
});
