/**
 * Utility to expand user-defined macros in TeX strings for use in
 * <annotation> elements. Only user-provided macros (from the `macros`
 * option) are expanded; built-in KaTeX macros are left untouched.
 *
 * Strategy: iterate through tokens produced by the Lexer. When a control
 * sequence matches a user-defined macro with a string expansion, substitute
 * the expansion text and re-tokenize it (to handle nested macros).
 * Whitespace between tokens is preserved by using the original source text
 * via token position information.
 */

import Lexer from "./Lexer";
import Settings from "./Settings";
import {Token} from "./Token";

import type {MacroMap} from "./defineMacro";

/**
 * Expand user-defined macros in a TeX expression string.
 *
 * Only macro definitions that are plain strings are expanded.
 * Function-valued macros and built-in commands are left as-is.
 *
 * @param expression - The raw TeX expression
 * @param userMacros - User-defined macros from Settings.macros
 * @param _maxExpand - Reserved for future use (expansion depth limit)
 * @returns The expression with user macros expanded
 */
export default function expandAnnotations(
    expression: string,
    userMacros: MacroMap,
    _maxExpand: number = 1000,
): string {
    if (!userMacros || Object.keys(userMacros).length === 0) {
        return expression;
    }

    const settings = new Settings({macros: userMacros});
    const lexer = new Lexer(expression, settings);

    // Collect all tokens from the lexer (forward order)
    const tokens: Token[] = [];
    for (;;) {
        const token = lexer.lex();
        tokens.push(token);
        if (token.text === "EOF") {
            break;
        }
    }

    // Build output by iterating tokens and expanding user macros.
    // Use original source text for non-expanded tokens to preserve whitespace.
    const result: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.text === "EOF") {
            break;
        }

        const macroDef = userMacros[token.text];
        if (macroDef != null && typeof macroDef === "string") {
            // Expand the macro: re-tokenize the expansion text and insert
            // the resulting tokens so nested macros can also be expanded.
            const subLexer = new Lexer(macroDef, settings);
            const subTokens: Token[] = [];
            for (;;) {
                const subToken = subLexer.lex();
                if (subToken.text === "EOF") {
                    break;
                }
                subTokens.push(subToken);
            }
            // Insert expanded tokens and re-process from current position
            // to handle nested user macros (e.g. \a -> \b+1, \b -> x)
            tokens.splice(i, 1, ...subTokens);
            i--;  // will be incremented back to i by for-loop
        } else if (token.loc &&
                   token.loc.lexer instanceof Lexer &&
                   token.loc.lexer.input === expression) {
            // Token from the original expression — use source text
            // to preserve whitespace between control words.
            result.push(expression.slice(token.loc.start, token.loc.end));
        } else {
            // Synthetic or sub-expression token — use text directly
            result.push(token.text);
        }
    }

    return result.join("");
}
