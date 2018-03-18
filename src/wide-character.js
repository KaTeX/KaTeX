// @flow

/**
 * This file provides support for Unicode range U+1D400 to U+1D7FF,
 * Mathematical Alphanumeric Symbols.
 *
 * Function expandWideChar takes a wide character as input, expands it
 * into a macro with the appropriate font, and returns it to MacroExpander.js.
 */

import type {Mode} from "./types";
import ParseError from "./ParseError";

/**
 * Data below is from https://www.unicode.org/charts/PDF/U1D400.pdf
 * That document sorts characters into groups by font type, say bold or italic.
 *
 * In array wideCharData, each subarray consists four elements:
 *      * The Unicode code point at the end of a character group.
 *      * The font specification of that group when in math mode.
 *      * The font specification of that group when in text mode.
 *      * The offset from a Unicode code point to the character code of
 *            the corresponding plain text letter.
 */

const wideCharData: Array<[number, string, string, number]> = [
    [0x1D419, "\\mathbf{", "\\textbf{", 0x1D3BF],       // A-Z bold upright
    [0x1D433, "\\mathbf{", "\\textbf{", 0x1D3B9],       // a-z bold upright
    [0x1D44D, "", "\\textit{", 0x1D3F3],                // A-Z italic
    [0x1D467, "", "\\textit{", 0x1D3ED],                // a-z italic
    [0x1D481, "\\bm{", "\\textit{\\textbf{", 0x1D427],  // A-Z bold italic
    [0x1D49B, "\\bm{", "\\textit{\\textbf{", 0x1D421],  // a-z bold italic

    // Map fancy A-Z letters to script, not calligraphic.
    // This aligns with unicode-math and math fonts (except Cambria Math).
    // There is no KaTeX function for script in text mode.
    // So in text mode, we fall back to system font.
    [0x1D4B5, "\\mathscr{", "systemfont", 0x1D45B],     // A-Z script

    // KaTeX fonts don't include script or calligraphic for letters a-z.
    [0x1D4CF, "systemfont", "systemfont", 0x1D455],     //  a-z script

    // KaTeX fonts don't include bold script.
    [0x1D4E9, "systemfont", "systemfont", 0x1D48F],     // A-Z bold script

    // No KaTeX script or calligraphic font with letters a-z.
    // Note: if the system picks Cambria Math as a fallback, this
    //       will render in calligraphic. Other math fonts use script.
    [0x1D503, "systemfont", "systemfont", 0x1D489],     // a-z bold script.

    [0x1D51D, "\\mathfrak{", "systemfont", 0x1D4C3],    // A-Z Fraktur
    [0x1D537, "\\mathfrak{", "systemfont", 0x1D4BD],    // a-z Fraktur
    [0x1D551, "\\mathbb{", "systemfont", 0x1D4F7],      // A-Z double-struck

    // "k" is the only lower case double-struck letter in KaTeX fonts.
    [0x1D56B, "systemfont", "systemfont", 0x1D4F1],     // a-z double-struck

    // \textfrak{\textbf{...}} is not working.
    [0x1D585, "systemfont", "systemfont", 0x1D52B],   // A-Z bold Fraktur
    [0x1D59F, "systemfont", "systemfont", 0x1D525],   // a-z bold Fraktur

    [0x1D5B9, "\\mathsf{", "\\textsf{", 0x1D55F],     // A-Z sans-serif
    [0x1D5D3, "\\mathsf{", "\\textsf{", 0x1D559],     // a-z sans-serif
    [0x1D5ED, "\\mathord{\\textsf{\\textbf{",
        "\\textsf{\\textbf{", 0x1D593],               // A-Z bold sans-serif
    [0x1D607, "\\mathord{\\textsf{\\textbf{",
        "\\textsf{\\textbf{", 0x1D58D],               // a-z bold sans-serif
    [0x1D621, "\\mathord{\\textsf{\\textit{",
        "\\textsf{\\textit{", 0x1D5C7],               // A-Z italic sans-serif
    [0x1D63B, "\\mathord{\\textsf{\\textit{",
        "\\textsf{\\textit{", 0x1D5C1],               // a-z italic sans-serif

    // KaTeX fonts don't include bold italic sans.
    [0x1D655, "systemfont", "systemfont", 0x1D5FB],   // A-Z bold italic sans
    [0x1D66F, "systemfont", "systemfont", 0x1D5F5],   // a-z bold italic sans

    [0x1D689, "\\mathtt{", "\\texttt{", 0x1D62F],     // A-Z monospace
    [0x1D6A3, "\\mathtt{", "\\texttt{", 0x1D629],     // a-z monospace
    [0x1D6A4, "\u0131", "\u0131", -1],                // dotless i italic
    [0x1D6A5, "\u0237", "\u0237", -1],                // dotless j italic

    [0x1D7D7, "\\mathbf{", "\\textbf{", 0x1D79E],     // 0-9 bold

    // KaTeX fonts don't include double-struck numerals.
    [0x1D7E1, "systemfont", "systemfont", 0x1D7A8],   // 0-9 double-struck

    [0x1D7EB, "\\mathsf{", "\\textsf{", 0x1D7B2],     // 0-9 sans-serif
    [0x1D7F5, "\\mathord{\\textsf{\\textbf{",
        "\\textsf{\\textbf{", 0x1D7BC],               // 0-9 bold sans-serif
    [0x1D7FF, "\\mathtt{", "\\texttt{", 0x1D7C6],     // 0-9 monospace
];

export const expandWideChar = function(wideChar: string, mode: Mode): string {
    // IE doesn't support codePointAt(). So work with the surrogate pair.
    const H = wideChar.charCodeAt(0);    // high surrogate
    const L = wideChar.charCodeAt(1);    // low surrogate
    const codePoint = ((H - 0xD800) * 0x400) + (L - 0xDC00) + 0x10000;

    if (codePoint < 0x1D400 || codePoint > 0x1D7FF) {
        // We don't support any wide characters outside 1D400–1D7FF.
        throw new ParseError("Unsupported character: " + wideChar);
    }

    if (0x1D6A5 < codePoint && codePoint < 0x1D7CE) {
        // Greek letter. Return a private function to render the character
        // in a system font. Note that we can't return wideChar. MacroExpander
        // would send it right back here and we would have an infinite loop.
        // So we'll return the low surrogate. Function \sysfont knows how
        // to reconstruct the character from the low surrogate.

        // TODO: Fill out the rest of wideCharData so Greek letters
        //       will render in KaTeX fonts.
        return "\\sysfont{" + L + "}";
    }

    let i = 0;
    let iRow = 0;

    // Determine the relevant row of the wideCharData array.
    if (codePoint < 0x1D6A4) {
        // Below 0x1D6A4, wideCharData contains exactly 26 chars on each row.
        // So we can calculate the relevant row. No traverse necessary.
        iRow = Math.floor((codePoint - 0x1D400) / 26);

        // If you prepend or insert any new rows into wideCharData,
        // then please update the equations above and below.

    } else if (codePoint > 0x1D7CD) {
        // Above 1D7CD there are ten digits, 0-9, per row.
        iRow = Math.floor((codePoint - 0x1D7CE) / 10) + 28;

    } else {
        // Traverse the wideCharData array to find the relevant row.
        for (i = 26; i < wideCharData.length; i++) {
            if (codePoint <= wideCharData[i][0]) {
                iRow = i;
                break;
            }
        }
    }

    // Find the plain text letter that corresponds to wideChar.
    const offset = wideCharData[iRow][3];
    if (offset === -1) {
        // special item, e.g., \imath
        return mode === "math" ? wideCharData[iRow][1] :
            wideCharData[iRow][2];
    }
    const letter = String.fromCharCode(codePoint - offset);

    // Get the appropriate font.
    const format = mode === "math" ? wideCharData[iRow][1] :
            wideCharData[iRow][2];

    if (format === "systemfont") {
        // There is no macro available that will render wideChar in
        // the proper KaTeX font. Fall back to a system font.
        return "\\sysfont{" + L + "}";
    }

    // Finish with the closing delimiter(s).
    let closeDelim = "";
    if (format.length > 0) {
        const numBraces = format.split("{").length - 1;
        // IE doesn't support "}".repeat(numBraces)
        for (i = 0; i < numBraces; i++) {
            closeDelim += "}";
        }
    }

    // Return a macro to MacroExpander.
    return format + letter + closeDelim;
};
