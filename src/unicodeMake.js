/* eslint-env node */
/* eslint no-console:0 */

// This is an internal Node tool, not part of the KaTeX distribution,
// whose purpose is to generate unicodeSymbols.js in this directory.
// In this way, only this tool, and not the distribution/browser,
// needs String's normalize function.

require('babel-register')({plugins: ["transform-es2015-modules-commonjs"]});
const accents = require('./unicodeAccents').default;

console.log("// @flow");
console.log("// This file is GENERATED by unicodeMake.js. DO NOT MODIFY.");
console.log("");

const encode = function(string) {
    let output = '"';
    for (let i = 0; i < string.length; i++) {
        let hex = string.charCodeAt(i).toString(16);
        while (hex.length < 4) {
            hex = `0${hex}`;
        }
        output += `\\u${hex}`;
    }
    output = `${output}"`;
    return output;
};

console.log("export default {");

const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" +
    "αβγδεϵζηθϑικλμνξοπϖρϱςστυφϕχψωΓΔΘΛΞΠΣΥΦΨΩ";
for (const letter of letters) {
    for (const accent of Object.getOwnPropertyNames(accents)) {
        const combined = letter + accent;
        const normalized = combined.normalize('NFC');
        if (normalized.length === 1) {
            console.log(
                `    ${encode(normalized)}: ${encode(combined)},`
                + `  // ${normalized} = ${accents[accent].text}{${letter}}`);
        }
        for (const accent2 of Object.getOwnPropertyNames(accents)) {
            if (accent === accent2) {
                continue;
            }
            const combined2 = combined + accent2;
            const normalized2 = combined2.normalize('NFC');
            if (normalized2.length === 1) {
                console.log(
                    `    ${encode(normalized2)}: ${encode(combined2)},`
                    + `  // ${normalized2} = ${accents[accent].text}`
                    + `${accents[accent2].text}{${letter}}`);
            }
        }
    }
}

console.log("};");
