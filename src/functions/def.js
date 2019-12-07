//@flow
import defineFunction from "../defineFunction";
import ParseError from "../ParseError";
import {assertNodeType} from "../parseNode";

const globalMap = {
    "\\global": "\\global",
    "\\long": "\\\\globallong",
    "\\\\globallong": "\\\\globallong",
    "\\def": "\\gdef",
    "\\gdef": "\\gdef",
    "\\edef": "\\xdef",
    "\\xdef": "\\xdef",
    "\\let": "\\\\globallet",
};

// <assignment> -> <non-macro assignment>|<macro assignment>
// <non-macro assignment> -> <simple assignment>|\global<non-macro assignment>
// <macro assignment> -> <definition>|<prefix><macro assignment>
// <prefix> -> \global|\long|\outer
// There is no \par, so ignore \long
defineFunction({
    type: "internal",
    names: [
        "\\global", "\\long",
        "\\\\globallong", // can’t be entered directly
    ],
    props: {
        numArgs: 0,
        allowedInText: true,
    },
    handler({parser, funcName}) {
        parser.consumeSpaces();
        const token = parser.fetch();
        if (globalMap[token.text]) {
            if (funcName === "\\global" || funcName === "\\\\globallong") {
                token.text = globalMap[token.text];
            }
            return assertNodeType(parser.parseFunction(), "internal");
        }
        throw new ParseError(`Invalid token after macro prefix`, token);
    },
});

// Basic support for macro definitions: \def, \gdef, \edef, \xdef
// <definition> -> <def><control sequence><definition text>
// <def> -> \def|\gdef|\edef|\xdef
// <definition text> -> <parameter text><left brace><balanced text><right brace>
defineFunction({
    type: "internal",
    names: ["\\def", "\\gdef", "\\edef", "\\xdef"],
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
        if (funcName === "\\edef" || funcName === "\\xdef") {
            arg = parser.gullet.expandTokens(arg);
            arg.reverse();
        }
        // Final arg is the expansion of the macro
        parser.gullet.macros.set(name, {
            tokens: arg,
            numArgs,
        }, funcName === globalMap[funcName]);

        return {
            type: "internal",
            mode: parser.mode,
        };
    },
});

defineFunction({
    type: "internal",
    names: [
        "\\let",
        "\\\\globallet", // can’t be entered directly
    ],
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

        parser.gullet.consumeSpaces();
        tok = parser.gullet.popToken();
        if (tok.text === "=") { // consume optional equals
            tok = parser.gullet.popToken();
            if (tok.text === " ") { // consume one optional space
                tok = parser.gullet.popToken();
            }
        }

        const macro = parser.gullet.macros.get(tok.text);
        if (macro == null) {
            // if macro is undefined at this moment, set noexpand to 2
            // to not expand later too and pass it to the parser
            tok.noexpand = 2;
        }
        parser.gullet.macros.set(name, macro || {
            tokens: [tok],
            numArgs: 0,
            unexpandable: !parser.gullet.isExpandable(tok.text),
        }, funcName === "\\\\globallet");

        return {
            type: "internal",
            mode: parser.mode,
        };
    },
});
