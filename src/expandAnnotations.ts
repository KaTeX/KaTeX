/**
 * Utility to expand user-defined macros in TeX strings for use in
 * <annotation> elements. Only user-provided macros (from the `macros`
 * option) are expanded; built-in KaTeX macros are left untouched.
 */

import MacroExpander from "./MacroExpander";
import Settings from "./Settings";
import {Token} from "./Token";

import type {MacroMap} from "./defineMacro";

/**
 * Expand user-defined macros in a TeX expression string.
 *
 * This creates a MacroExpander with only user-provided macros (no built-in
 * KaTeX macros), fully expands all expandable tokens, and returns the
 * resulting TeX string.
 *
 * @param expression - The raw TeX expression
 * @param userMacros - User-defined macros from Settings.macros
 * @returns The expression with user macros expanded
 */
export default function expandAnnotations(
    expression: string,
    userMacros: MacroMap,
): string {
    if (!userMacros || Object.keys(userMacros).length === 0) {
        return expression;
    }

    const settings = new Settings({macros: userMacros});
    const expander = new MacroExpander(expression, settings, "text");

    // Remove built-in macros so only user macros are expanded
    expander.macros.builtins = {};

    // Collect all tokens from the lexer (forward order)
    const tokens: Token[] = [];
    for (;;) {
        const token = expander.lexer.lex();
        tokens.push(token);
        if (token.text === "EOF") {
            break;
        }
    }

    // expandTokens expects tokens in reverse order (pushed onto stack),
    // and returns output in forward order.
    const expanded = expander.expandTokens(tokens.reverse());

    return expanded
        .filter(t => t.text !== "EOF")
        .map(t => t.text)
        .join("");
}
