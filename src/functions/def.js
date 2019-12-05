//@flow
import defineFunction from "../defineFunction";
import ParseError from "../ParseError";
import {assertNodeType} from "../parseNode";

const globalMap = {
    "\\def": "\\gdef",
    "\\gdef": "\\gdef",
};

// Basic support for macro definitions:
//     \def\macro{expansion}
//     \def\macro#1{expansion}
//     \def\macro#1#2{expansion}
//     \def\macro#1#2#3#4#5#6#7#8#9{expansion}
// Also the \gdef and \global\def equivalents
defineFunction({
    type: "internal",
    names: ["\\global"],
    props: {
        numArgs: 0,
        allowedInText: true,
    },
    handler({parser}) {
        parser.consumeSpaces();
        const token = parser.fetch();
        if (globalMap[token.text]) {
            token.text = globalMap[token.text];
            return assertNodeType(parser.parseFunction(), "internal");
        }
        throw new ParseError(`Invalid token after \\global`, token);
    },
});

defineFunction({
    type: "internal",
    names: ["\\def", "\\gdef"],
    props: {
        numArgs: 0,
        allowedInText: true,
    },
    handler({parser, funcName}) {
        let arg = parser.gullet.consumeArgs(1)[0];
        if (arg.length !== 1) {
            throw new ParseError("\\gdef's first argument must be a macro name");
        }
        const name = arg[0].text;
        // Count argument specifiers, and check they are in the order #1 #2 ...
        let numArgs = 0;
        arg = parser.gullet.consumeArgs(1)[0];
        while (arg.length === 1 && arg[0].text === "#") {
            arg = parser.gullet.consumeArgs(1)[0];
            if (arg.length !== 1) {
                throw new ParseError(
                    `Invalid argument number length "${arg.length}"`);
            }
            if (!(/^[1-9]$/.test(arg[0].text))) {
                throw new ParseError(
                    `Invalid argument number "${arg[0].text}"`);
            }
            numArgs++;
            if (parseInt(arg[0].text) !== numArgs) {
                throw new ParseError(
                    `Argument number "${arg[0].text}" out of order`);
            }
            arg = parser.gullet.consumeArgs(1)[0];
        }
        // Final arg is the expansion of the macro
        parser.gullet.macros.set(name, {
            tokens: arg,
            numArgs,
        }, funcName === "\\gdef");

        return {
            type: "internal",
            mode: parser.mode,
        };
    },
});
