// @flow

/**
 * This file provides support for Unicode range U+1D400 to U+1D7FF,
 * Mathematical Alphanumeric Symbols.
 *
 * Function wideCharacterFont takes a wide character as input and returns
 * the font class necessary to render it properly.
 */

import type {Mode} from "./types";
import ParseError from "./ParseError";

/**
 * Data below is from https://www.unicode.org/charts/PDF/U1D400.pdf
 * That document sorts characters into groups by font type, say bold or italic.
 *
 * In the arrays below, each subarray consists two elements:
 *      * The font specification of that group when in math mode.
 *      * The font specification of that group when in text mode.
 */

const wideLatinLetterData: Array<[string, string]> = [
    ["mathbf", "textbf"],             // A-Z bold upright
    ["mathbf", "textbf"],             // a-z bold upright
    ["mathit", "textit"],             // A-Z italic
    ["mathit", "textit"],             // a-z italic
    ["boldsymbol", "boldsymbol"],     // A-Z bold italic
    ["boldsymbol", "boldsymbol"],     // a-z bold italic

    // Map fancy A-Z letters to script, not calligraphic.
    // This aligns with unicode-math and math fonts (except Cambria Math).
    ["mathscr", "textscr"],           // A-Z script

    ["", ""],                         // a-z script.  No font available
    ["", ""],                         // A-Z bold script.  No font
    ["", ""],                         // a-z bold script.  No font
    ["mathfrak", "textfrak"],         // A-Z Fraktur
    ["mathfrak", "textfrak"],         // a-z Fraktur
    ["mathbb", "textbb"],             // A-Z double-struck
    ["", ""],                         // a-z double-struck.  No font.
    ["mathboldfrak", "textboldfrak"], // A-Z bold Fraktur
    ["", ""],                         // a-z bold Fraktur. No font.
    ["mathsf", "textsf"],             // A-Z sans-serif
    ["mathsf", "textsf"],             // a-z sans-serif
    ["mathboldsf", "textboldsf"],     // A-Z bold sans-serif
    ["mathboldsf", "textboldsf"],     // a-z bold sans-serif
    ["mathitsf", "textitsf"],         // A-Z italic sans-serif
    ["mathitsf", "textitsf"],         // a-z italic sans-serif
    ["", ""],                         // A-Z bold italic sans.  No font.
    ["", ""],                         // a-z bold italic sans.  No font.
    ["mathtt", "texttt"],             // A-Z monospace
    ["mathtt", "texttt"],             // a-z monospace
];

const wideNumeralData: Array<[string, string]> = [
    ["mathbf", "textbf"],             // 0-9 bold
    ["", ""],                         // 0-9 double-struck. No KaTeX font.
    ["mathsf", "textsf"],             // 0-9 sans-serif
    ["mathboldsf", "textboldsf"],     // 0-9 bold sans-serif
    ["mathtt", "texttt"],             // 0-9 monospace
];

export const wideCharacterFont = function(wideChar: string, mode: Mode): string {
    // IE doesn't support codePointAt(). So work with the surrogate pair.
    const H = wideChar.charCodeAt(0);    // high surrogate
    const L = wideChar.charCodeAt(1);    // low surrogate
    const codePoint = ((H - 0xD800) * 0x400) + (L - 0xDC00) + 0x10000;

    let i = 0;                          // row index, to be calculated below
    const j = mode === "math" ? 0 : 1;  // column index

    if (0x1D400 <= codePoint && codePoint < 0x1D6A4) {
        // wideLatinLetterData contains exactly 26 chars on each row.
        // So we can calculate the relevant row. No traverse necessary.
        i = Math.floor((codePoint - 0x1D400) / 26);
        return wideLatinLetterData[i][j];

    } else if (0x1D7CE <= codePoint && codePoint <= 0x1D7FF) {
        // Numerals, ten per row.
        i = Math.floor((codePoint - 0x1D7CE) / 10);
        return wideNumeralData[i][j];

    } else if (codePoint === 0x1D6A5 || codePoint === 0x1D6A6) {
        // dotless i or j
        return mode === "math" ? "mainit" : "textit";

    } else if (0x1D6A6 < codePoint && codePoint < 0x1D7CE) {
        // Greek letters. Not supported, yet.
        return "";

    } else {
        // We don't support any wide characters outside 1D400–1D7FF.
        throw new ParseError("Unsupported character: " + wideChar);
    }
};
