/* eslint no-constant-condition:0 */
const findEndOfMath = function(delimiter, text, startIndex) {
    // Adapted from
    // https://github.com/Khan/perseus/blob/master/src/perseus-markdown.jsx
    let index = startIndex;
    let braceLevel = 0;

    const delimLength = delimiter.length;

    while (index < text.length) {
        const character = text[index];

        if (braceLevel <= 0 &&
            text.slice(index, index + delimLength) === delimiter) {
            return index;
        } else if (character === "\\") {
            index++;
        } else if (character === "{") {
            braceLevel++;
        } else if (character === "}") {
            braceLevel--;
        }

        index++;
    }

    return -1;
};

const escapeRegex = function(string, supportEscapedSpecialCharsInText) {
    if (supportEscapedSpecialCharsInText) {
        if (string === "$") {
            /* negative lookbehind to find any dollar not preceded by a
             backslash */
            return "(?<!\\\\)\\$";
        } else if (string === "(") {
            /* negative lookbehind to find any parenthesis not preceded by a
             backslash */
            return "(?<!\\\\)\\(";
        } else if (string === "\\(") {
            return "\\\\\\(";
        } else if (string === "\\$") {
            return "\\\\\\$";
        } else {
            return string.replace(/[-/\\^$*+?.)|[\]{}]/g, "\\$&");
        }
    } else {
        return string.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    }
};

const amsRegex = /^\\begin{/;

const splitAtDelimiters = function(text, delimiters,
    supportEscapedSpecialCharsInText) {
    let index;
    const data = [];

    const regexLeft = new RegExp("(" + delimiters.map((x) =>
        escapeRegex(x.left, supportEscapedSpecialCharsInText),
    ).join("|") + ")");

    while (true) {
        index = text.search(regexLeft);
        if (index === -1) {
            break;
        }
        if (index > 0) {
            data.push({
                type: "text",
                data: text.slice(0, index),
            });
            text = text.slice(index); // now text starts with delimiter
        }
        // ... so this always succeeds:
        const i = delimiters.findIndex((delim) => text.startsWith(delim.left));
        index = findEndOfMath(delimiters[i].right, text, delimiters[i].left.length);
        if (index === -1) {
            break;
        }
        const rawData = text.slice(0, index + delimiters[i].right.length);
        const math = amsRegex.test(rawData)
            ? rawData
            : text.slice(delimiters[i].left.length, index);
        data.push({
            type: "math",
            data: math,
            rawData,
            display: delimiters[i].display,
        });
        text = text.slice(index + delimiters[i].right.length);
    }

    if (text !== "") {
        data.push({
            type: "text",
            data: text,
        });
    }

    return data;
};

export default splitAtDelimiters;
