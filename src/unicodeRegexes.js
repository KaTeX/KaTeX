// @flow
export const hangulRegex = /[\uAC00-\uD7AF]/;

// This regex combines
// - CJK symbols and punctuation: [\u3000-\u303F]
// - Hiragana: [\u3040-\u309F]
// - Katakana: [\u30A0-\u30FF]
// - CJK ideograms: [\u4E00-\u9FAF]
// - Hangul syllables: [\uAC00-\uD7AF]
// - Fullwidth punctuation: [\uFF00-\uFF60]
// Notably missing are halfwidth Katakana and Romanji glyphs.
export const cjkRegex =
    /[\u3000-\u30FF\u4E00-\u9FAF\uAC00-\uD7AF\uFF00-\uFF60]/;
