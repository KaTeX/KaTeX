/**
 * This file contains the “gullet” where macros are expanded
 * until only non-macro tokens remain.
 */

import Lexer from "./Lexer";
import builtinMacros from "./macros";
import ParseError from "./ParseError";
import objectAssign from "object-assign";

class MacroExpander {
    constructor(input, macros) {
        this.lexer = new Lexer(input);
        this.macros = objectAssign({}, builtinMacros, macros);
        this.stack = []; // contains tokens in REVERSE order
        this.discardedWhiteSpace = [];
    }

    /**
     * Recursively expand first token, then return first non-expandable token.
     *
     * At the moment, macro expansion doesn't handle delimited macros,
     * i.e. things like those defined by \def\foo#1\end{…}.
     * See the TeX book page 202ff. for details on how those should behave.
     */
    nextToken() {
        for (;;) {
            if (this.stack.length === 0) {
                this.stack.push(this.lexer.lex());
            }
            const topToken = this.stack.pop();
            const name = topToken.text;
            if (!(name.charAt(0) === "\\" && this.macros.hasOwnProperty(name))) {
                return topToken;
            }
            let tok;
            let expansion = this.macros[name];
            if (typeof expansion === "string") {
                let numArgs = 0;
                if (expansion.indexOf("#") !== -1) {
                    const stripped = expansion.replace(/##/g, "");
                    while (stripped.indexOf("#" + (numArgs + 1)) !== -1) {
                        ++numArgs;
                    }
                }
                const bodyLexer = new Lexer(expansion);
                expansion = [];
                tok = bodyLexer.lex();
                while (tok.text !== "EOF") {
                    expansion.push(tok);
                    tok = bodyLexer.lex();
                }
                expansion.reverse(); // to fit in with stack using push and pop
                expansion.numArgs = numArgs;
                this.macros[name] = expansion;
            }
            if (expansion.numArgs) {
                const args = [];
                let i;
                // obtain arguments, either single token or balanced {…} group
                for (i = 0; i < expansion.numArgs; ++i) {
                    const startOfArg = this.get(true);
                    if (startOfArg.text === "{") {
                        const arg = [];
                        let depth = 1;
                        while (depth !== 0) {
                            tok = this.get(false);
                            arg.push(tok);
                            if (tok.text === "{") {
                                ++depth;
                            } else if (tok.text === "}") {
                                --depth;
                            } else if (tok.text === "EOF") {
                                throw new ParseError(
                                    "End of input in macro argument",
                                    startOfArg);
                            }
                        }
                        arg.pop(); // remove last }
                        arg.reverse(); // like above, to fit in with stack order
                        args[i] = arg;
                    } else if (startOfArg.text === "EOF") {
                        throw new ParseError(
                            "End of input expecting macro argument", topToken);
                    } else {
                        args[i] = [startOfArg];
                    }
                }
                // paste arguments in place of the placeholders
                expansion = expansion.slice(); // make a shallow copy
                for (i = expansion.length - 1; i >= 0; --i) {
                    tok = expansion[i];
                    if (tok.text === "#") {
                        if (i === 0) {
                            throw new ParseError(
                                "Incomplete placeholder at end of macro body",
                                tok);
                        }
                        tok = expansion[--i]; // next token on stack
                        if (tok.text === "#") { // ## → #
                            expansion.splice(i + 1, 1); // drop first #
                        } else if (/^[1-9]$/.test(tok.text)) {
                            // expansion.splice(i, 2, arg[0], arg[1], …)
                            // to replace placeholder with the indicated argument.
                            // TODO: use spread once we move to ES2015
                            expansion.splice.apply(
                                expansion,
                                [i, 2].concat(args[tok.text - 1]));
                        } else {
                            throw new ParseError(
                                "Not a valid argument number",
                                tok);
                        }
                    }
                }
            }
            this.stack = this.stack.concat(expansion);
        }
    }

    get(ignoreSpace) {
        this.discardedWhiteSpace = [];
        let token = this.nextToken();
        if (ignoreSpace) {
            while (token.text === " ") {
                this.discardedWhiteSpace.push(token);
                token = this.nextToken();
            }
        }
        return token;
    }

    /**
     * Undo the effect of the preceding call to the get method.
     * A call to this method MUST be immediately preceded and immediately followed
     * by a call to get.  Only used during mode switching, i.e. after one token
     * was got in the old mode but should get got again in a new mode
     * with possibly different whitespace handling.
     */
    unget(token) {
        this.stack.push(token);
        while (this.discardedWhiteSpace.length !== 0) {
            this.stack.push(this.discardedWhiteSpace.pop());
        }
    }
}

module.exports = MacroExpander;
