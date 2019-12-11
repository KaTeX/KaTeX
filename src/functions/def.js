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
        let tok = parser.gullet.popToken();
        const name = tok.text;
        if (/^(?:[\\{}$&#^_]|EOF)$/.test(name)) {
            throw new ParseError("Expected a control sequence", tok);
        }

        let numArgs = 0;
        let insert;
        const delimiters = [[]];
        // <parameter text> contains no braces
        while (parser.gullet.future().text !== "{") {
            tok = parser.gullet.popToken();
            if (tok.text === "#") {
                // If the very last character of the <parameter text> is #, so that
                // this # is immediately followed by {, TeX will behave as if the {
                // had been inserted at the right end of both the parameter text
                // and the replacement text.
                if (parser.gullet.future().text === "{") {
                    insert = parser.gullet.future();
                    delimiters[numArgs].push("{");
                    break;
                }

                // A parameter, the first appearance of # must be followed by 1,
                // the next by 2, and so on; up to nine #’s are allowed
                tok = parser.gullet.popToken();
                if (!(/^[1-9]$/.test(tok.text))) {
                    throw new ParseError(`Invalid argument number "${tok.text}"`);
                }
                if (parseInt(tok.text) !== numArgs + 1) {
                    throw new ParseError(
                        `Argument number "${tok.text}" out of order`);
                }
                numArgs++;
                delimiters.push([]);
            } else if (tok.text === "EOF") {
                throw new ParseError("Expected a macro definition");
            } else {
                delimiters[numArgs].push(tok.text);
            }
        }
        // replacement text, enclosed in '{' and '}' and properly nested
        const {tokens} = parser.gullet.consumeArg();
        if (insert) {
            tokens.unshift(insert);
        }

        parser.gullet.macros.set(name, {
            tokens,
            numArgs,
            delimiters,
        }, funcName === "\\gdef");
        return {
            type: "internal",
            mode: parser.mode,
        };
    },
});
