// @flow
/**
 * The Lexer class handles tokenizing the input in various ways. Since our
 * parser expects us to be able to backtrack, the lexer allows lexing from any
 * given starting point.
 *
 * Its main exposed function is the `lex` function, which takes a position to
 * lex from and a type of token to lex. It defers to the appropriate `_innerLex`
 * function.
 *
 * The various `_innerLex` functions perform the actual lexing of different
 * kinds.
 */

import matchAt from "match-at";
import ParseError from "./ParseError";
import {LexerInterface, Token} from "./Token";

/* The following tokenRegex
 * - matches typical whitespace (but not NBSP etc.) using its first group
 * - does not match any control character \x00-\x1f except whitespace
 * - does not match a bare backslash
 * - matches any ASCII character except those just mentioned
 * - does not match the BMP private use area \uE000-\uF8FF
 * - does not match bare surrogate code units
 * - matches any BMP character except for those just described
 * - matches any valid Unicode surrogate pair
 * - matches a backslash followed by one or more letters
 * - matches a backslash followed by any BMP character, including newline
 * Just because the Lexer matches something doesn't mean it's valid input:
 * If there is no matching function or symbol definition, the Parser will
 * still reject the input.
 */
const tokenRegex = new RegExp(
    "([ \r\n\t]+)|" +                                 // whitespace
    "([!-\\[\\]-\u2027\u202A-\uD7FF\uF900-\uFFFF]" +  // single codepoint
    "|[\uD800-\uDBFF][\uDC00-\uDFFF]" +               // surrogate pair
    "|\\\\(?:[a-zA-Z@]+|[^\uD800-\uDFFF])" +          // function name
    ")"
);

/** Main Lexer class */
export default class Lexer implements LexerInterface {
    input: string;
    pos: number;

    constructor(input: string) {
        this.input = input;
        this.pos = 0;
    }

    /**
     * This function lexes a single token.
     */
    lex(): Token {
        const input = this.input;
        const pos = this.pos;
        if (pos === input.length) {
            return new Token("EOF", pos, pos, this);
        }
        const match = matchAt(tokenRegex, input, pos);
        if (match === null) {
            throw new ParseError(
                "Unexpected character: '" + input[pos] + "'",
                new Token(input[pos], pos, pos + 1, this));
        }
        const text = match[2] || " ";
        const start = this.pos;
        this.pos += match[0].length;
        const end = this.pos;
        return new Token(text, start, end, this);
    }
}
