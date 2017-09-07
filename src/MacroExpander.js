// @flow
/**
 * This file contains the “gullet” where macros are expanded
 * until only non-macro tokens remain.
 */

import Lexer from "./Lexer";
import {Token} from "./Token";
import builtinMacros from "./macros";
import ParseError from "./ParseError";
import objectAssign from "object-assign";

import type {MacroContextInterface, MacroMap, MacroExpansion} from "./macros";

export default class MacroExpander implements MacroContextInterface {
    lexer: Lexer;
    macros: MacroMap;
    stack: Token[];
    discardedWhiteSpace: Token[];

    constructor(input: string, macros: MacroMap) {
        this.lexer = new Lexer(input);
        this.macros = objectAssign({}, builtinMacros, macros);
        this.stack = []; // contains tokens in REVERSE order
        this.discardedWhiteSpace = [];
    }

    /**
     * Returns the topmost token on the stack, without expanding it.
     * Similar in behavior to TeX's `\futurelet`.
     */
    future(): Token {
        if (this.stack.length === 0) {
            this.stack.push(this.lexer.lex());
        }
        return this.stack[this.stack.length - 1];
    }

    /**
     * Remove and return the next unexpanded token.
     */
    popToken(): Token {
        this.future();  // ensure non-empty stack
        return this.stack.pop();
    }

    /**
     * Consume all following space tokens, without expansion.
     */
    consumeSpaces() {
        for (;;) {
            const token = this.future();
            if (token.text === " ") {
                this.stack.pop();
            } else {
                break;
            }
        }
    }

    /**
     * Expand the next token only once if possible.
     *
     * If the token is expanded, the resulting tokens will be pushed onto
     * the stack in reverse order and will be returned as an array,
     * also in reverse order.
     *
     * If not, the next token will be returned without removing it
     * from the stack.  This case can be detected by a `Token` return value
     * instead of an `Array` return value.
     *
     * In either case, the next token will be on the top of the stack,
     * or the stack will be empty.
     *
     * Used to implement `expandAfterFuture` and `expandNextToken`.
     *
     * At the moment, macro expansion doesn't handle delimited macros,
     * i.e. things like those defined by \def\foo#1\end{…}.
     * See the TeX book page 202ff. for details on how those should behave.
     */
    expandOnce(): Token | Token[] {
        const topToken = this.popToken();
        const name = topToken.text;
        const isMacro = (name.charAt(0) === "\\");
        if (isMacro) {
            // Consume all spaces after \macro
            this.consumeSpaces();
        }
        if (!(isMacro && this.macros.hasOwnProperty(name))) {
            // Fully expanded
            this.stack.push(topToken);
            return topToken;
        }
        const {tokens, numArgs} = this._getExpansion(name);
        let expansion = tokens;
        if (numArgs) {
            const args: Token[][] = [];
            // obtain arguments, either single token or balanced {…} group
            for (let i = 0; i < numArgs; ++i) {
                this.consumeSpaces();  // ignore spaces before each argument
                const startOfArg = this.popToken();
                if (startOfArg.text === "{") {
                    const arg: Token[] = [];
                    let depth = 1;
                    while (depth !== 0) {
                        const tok = this.popToken();
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
            for (let i = expansion.length - 1; i >= 0; --i) {
                let tok = expansion[i];
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
                        // replace the placeholder with the indicated argument
                        expansion.splice(i, 2, ...args[tok.text - 1]);
                    } else {
                        throw new ParseError(
                            "Not a valid argument number",
                            tok);
                    }
                }
            }
        }
        // Concatenate expansion onto top of stack.
        this.stack.push(...expansion);
        return expansion;
    }

    /**
     * Expand the next token only once (if possible), and return the resulting
     * top token on the stack (without removing anything from the stack).
     * Similar in behavior to TeX's `\expandafter\futurelet`.
     * Equivalent to expandOnce() followed by future().
     */
    expandAfterFuture(): Token {
        this.expandOnce();
        return this.future();
    }

    /**
     * Recursively expand first token, then return first non-expandable token.
     */
    expandNextToken(): Token {
        for (;;) {
            const expanded = this.expandOnce();
            // expandOnce returns Token if and only if it's fully expanded.
            if (expanded instanceof Token) {
                // \relax stops the expansion, but shouldn't get returned (a
                // null return value couldn't get implemented as a function).
                if (expanded.text === "\\relax") {
                    this.stack.pop();
                } else {
                    return this.stack.pop();  // === expanded
                }
            }
        }

        // Flow unable to figure out that this pathway is impossible.
        // https://github.com/facebook/flow/issues/4808
        throw new Error(); // eslint-disable-line no-unreachable
    }

    /**
     * Returns the expanded macro as a reversed array of tokens and a macro
     * argument count.
     * Caches macro expansions for those that were defined simple TeX strings.
     */
    _getExpansion(name: string): MacroExpansion {
        const definition = this.macros[name];
        const expansion =
            typeof definition === "function" ? definition(this) : definition;
        if (typeof expansion === "string") {
            let numArgs = 0;
            if (expansion.indexOf("#") !== -1) {
                const stripped = expansion.replace(/##/g, "");
                while (stripped.indexOf("#" + (numArgs + 1)) !== -1) {
                    ++numArgs;
                }
            }
            const bodyLexer = new Lexer(expansion);
            const tokens = [];
            let tok = bodyLexer.lex();
            while (tok.text !== "EOF") {
                tokens.push(tok);
                tok = bodyLexer.lex();
            }
            tokens.reverse(); // to fit in with stack using push and pop
            const expanded = {tokens, numArgs};
            // Cannot cache a macro defined using a function since it relies on
            // parser context.
            if (typeof definition !== "function") {
                this.macros[name] = expanded;
            }
            return expanded;
        }

        return expansion;
    }

    /**
     * Recursively expand first token, then return first non-expandable token.
     * If given a `true` argument, skips over any leading whitespace in
     * expansion, instead returning the first non-whitespace token
     * (like TeX's \ignorespaces).
     * Any skipped whitespace is stored in `this.discardedWhiteSpace`
     * so that `unget` can correctly undo the effects of `get`.
     */
    get(ignoreSpace: boolean): Token {
        this.discardedWhiteSpace = [];
        let token = this.expandNextToken();
        if (ignoreSpace) {
            while (token.text === " ") {
                this.discardedWhiteSpace.push(token);
                token = this.expandNextToken();
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
    unget(token: Token) {
        this.stack.push(token);
        while (this.discardedWhiteSpace.length !== 0) {
            this.stack.push(this.discardedWhiteSpace.pop());
        }
    }
}

