/**
 * This file provides support for Unicode range U+1D400 to U+1D7FF,
 * Mathematical Alphanumeric Symbols.
 *
 * Function wideCharacterFont takes a wide character as input and returns
 * the font information necessary to render it properly.
 */

import type {Mode} from "./types";
import {FontName, FontClass} from "./types";
import ParseError from "./ParseError";

type WideChar = {
    readonly class: (typeof FontClass)[keyof typeof FontClass];
    readonly font: FontName | "";
};

const boldUpright: WideChar = {class: FontClass.boldUpright, font: FontName.MainBold};
const italic: WideChar = {class: FontClass.italic, font: FontName.MathItalic};
const boldItalic: WideChar = {class: FontClass.boldItalic, font: FontName.MainBoldItalic};
const script: WideChar = {class: FontClass.script, font: FontName.ScriptRegular};
const noFont: WideChar = {class: FontClass.noFont, font: ""};
const fraktur: WideChar = {class: FontClass.fraktur, font: FontName.FrakturRegular};
const doubleStruck: WideChar = {class: FontClass.doubleStruck, font: FontName.AMSRegular};
const boldFraktur: WideChar = {class: FontClass.boldFraktur, font: FontName.FrakturRegular};
const sansSerif: WideChar = {class: FontClass.sansSerif, font: FontName.SansSerifRegular};
const boldSansSerif: WideChar = {class: FontClass.boldSansSerif, font: FontName.SansSerifBold};
const italicSansSerif: WideChar = {class: FontClass.italicSansSerif, font: FontName.SansSerifItalic};
const monospace: WideChar = {class: FontClass.monospace, font: FontName.TypewriterRegular};

/**
 * Data below is from https://www.unicode.org/charts/PDF/U1D400.pdf
 * That document sorts characters into groups by font type, say bold or italic.
 *
 * In the arrays below, each object consists of two properties:
 *      * The font name, so that KaTeX can get font metrics.
 *      * The CSS class of that group depending on the mode.
 */

const wideLatinLetterData = [
    boldUpright, boldUpright,  // A-Z, a-z
    italic, italic,            // A-Z, a-z
    boldItalic, boldItalic,   // A-Z, a-z
    // Map fancy A-Z letters to script, not calligraphic.
    // This aligns with unicode-math and math fonts (except Cambria Math).
    script, noFont, // A-Z script, a-z — no font
    noFont, noFont, // A-Z bold script, a-z bold script — no font
    fraktur, fraktur,          // A-Z, a-z
    doubleStruck, doubleStruck, // A-Z double-struck, k double-struck
    // Note that we are using a bold font, but font metrics for regular Fraktur.
    boldFraktur, boldFraktur,  // A-Z, a-z
    sansSerif, sansSerif,      // A-Z, a-z
    boldSansSerif, boldSansSerif, // A-Z, a-z
    italicSansSerif, italicSansSerif, // A-Z, a-z
    noFont, noFont,           // A-Z bold italic sans, a-z bold italic sans - no font
    monospace, monospace,     // A-Z, a-z
] as const;

const wideNumeralData = [
    boldUpright,      // 0-9
    noFont,           // 0-9 double-struck. No KaTeX font.
    sansSerif,        // 0-9
    boldSansSerif,   // 0-9
    monospace,       // 0-9
] as const;

export const wideCharacterFont = (
    wideChar: string,
    mode: Mode,
):{
    readonly font: FontName | "";
    readonly cssClass: FontClass;
} => {

    // IE doesn't support codePointAt(). So work with the surrogate pair.
    const H = wideChar.charCodeAt(0);    // high surrogate
    const L = wideChar.charCodeAt(1);    // low surrogate
    const codePoint = ((H - 0xD800) * 0x400) + (L - 0xDC00) + 0x10000;

    if (0x1D400 <= codePoint && codePoint < 0x1D6A4) {
        // wideLatinLetterData contains exactly 26 chars on each row.
        // So we can calculate the relevant row. No traverse necessary.
        const i = Math.floor((codePoint - 0x1D400) / 26);
        const entry = wideLatinLetterData[i];
        return {font: entry.font, cssClass: entry.class[mode]};

    } else if (0x1D7CE <= codePoint && codePoint <= 0x1D7FF) {
        // Numerals, ten per row.
        const i = Math.floor((codePoint - 0x1D7CE) / 10);
        const entry = wideNumeralData[i];
        return {font: entry.font, cssClass: entry.class[mode]};

    } else if (codePoint === 0x1D6A5 || codePoint === 0x1D6A6) {
        // dotless i or j
        const entry = wideLatinLetterData[0];
        return {font: entry.font, cssClass: entry.class[mode]};

    } else if (0x1D6A6 < codePoint && codePoint < 0x1D7CE) {
        // Greek letters. Not supported, yet.
        return {font: "", cssClass: FontClass.noFont[mode]};

    } else {
        // We don't support any wide characters outside 1D400–1D7FF.
        throw new ParseError("Unsupported character: " + wideChar);
    }
};
