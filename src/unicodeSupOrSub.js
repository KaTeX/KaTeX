// Helpers for Parser.js handling of Unicode (sub|super)script characters.

export const SUB = true;
export const SUPER = false;

export const unicodeSubRegEx = /^[₊₋₌₍₎₀₁₂₃₄₅₆₇₈₉ₐₑₒₓ]/;

export const uSubsAndSups = Object.freeze({
    '₊': '+',
    '₋': '-',
    '₌': '=',
    '₍': '(',
    '₎': ')',
    '₀': '0',
    '₁': '1',
    '₂': '2',
    '₃': '3',
    '₄': '4',
    '₅': '5',
    '₆': '6',
    '₇': '7',
    '₈': '8',
    '₉': '9',
    'ₐ': 'a',
    'ₑ': 'e',
    'ₒ': 'o',
    'ₓ': 'x',
    '⁺': '+',
    '⁻': '-',
    '⁼': '=',
    '⁽': '(',
    '⁾': ')',
    '⁰': '0',
    '¹': '1',
    '²': '2',
    '³': '3',
    '⁴': '4',
    '⁵': '5',
    '⁶': '6',
    '⁷': '7',
    '⁸': '8',
    '⁹': '9',
    'ⁱ': 'i',
    'ⁿ': 'n',
});
