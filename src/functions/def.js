//@flow
import defineFunction from "../defineFunction";
import ParseError from "../ParseError";

// Basic support for macro definitions:
//     \def\macro{expansion}
//     \def\macro#1{expansion}
//     \def\macro#1#2{expansion}
//     \def\macro#1#2#3#4#5#6#7#8#9{expansion}
// Also the \gdef and \global\def equivalents
defineFunction({
    type: "internal",
    names: ["\\global", "\\def", "\\gdef"],
    props: {
        numArgs: 0,
        allowedInText: true,
    },
    handler({parser, funcName}) {
        if (funcName === "\\global") {
            const next = parser.gullet.consumeArgs(1)[0];
            if (next.length !== 1) {
                throw new ParseError("Invalid command after \\global");
            }
            const command = next[0].text;
            // TODO: Should expand command
            if (command === "\\def") {
                // \global\def is equivalent to \gdef
                funcName = "\\gdef";
            } else {
                throw new ParseError(`Invalid command '${command}' after \\global`);
            }
        }

        const global = funcName === "\\gdef";
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
        }, global);

        return {
            type: "internal",
            mode: parser.mode,
        };
    },
});

// \newcommand{\macro}[args]{definition}
// \renewcommand{\macro}[args]{definition}
// TODO: Optional arguments: \newcommand{\macro}[args][default]{definition}
defineFunction({
    type: "internal",
    names: ["\\newcommand", "\\renewcommand", "\\providecommand"],
    props: {
        numArgs: 0,
        allowedInText: true,
    },
    handler({parser, funcName}) {
        const existsOK = funcName !== "\\newcommand";
        const nonexistsOK = funcName !== "\\renewcommand";
        let arg = parser.gullet.consumeArgs(1)[0];
        if (arg.length !== 1) {
            throw new ParseError(
                "\\newcommand's first argument must be a macro name");
        }
        const name = arg[0].text;

        const exists = parser.gullet.isDefined(name);
        if (exists && !existsOK) {
            throw new ParseError(`\\newcommand{${name}} attempting to redefine ` +
                `${name}; use \\renewcommand`);
        }
        if (!exists && !nonexistsOK) {
            throw new ParseError(`\\renewcommand{${name}} when command ${name} ` +
                `does not yet exist; use \\newcommand`);
        }

        let numArgs = 0;
        arg = parser.gullet.consumeArgs(1)[0];
        if (arg.length === 1 && arg[0].text === "[") {
            let argText = '';
            let token = parser.fetch();
            while (token.text !== "]" && token.text !== "EOF") {
                // TODO: Should properly expand arg, e.g., ignore {}s
                argText += token.text;
                parser.consume();
                token = parser.fetch();
            }
            parser.consume();
            if (!argText.match(/^\s*[0-9]+\s*$/)) {
                throw new ParseError(`Invalid number of arguments: ${argText}`);
            }
            numArgs = parseInt(argText);
            arg = parser.gullet.consumeArgs(1)[0];
        }

        // Final arg is the expansion of the macro
        parser.gullet.macros.set(name, {
            tokens: arg,
            numArgs,
        });

        return {
            type: "internal",
            mode: parser.mode,
        };
    },
});
