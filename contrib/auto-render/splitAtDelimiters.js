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

const escapeRegex = function(string) {
    return string.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
};


const splitAtDelimiters = function(text, delimiters) {
    let regexLeft;
    for (let i = 0; i < delimiters.length; i++) {
        if (i === 0) {
            regexLeft = "(";
        } else {
            regexLeft += "|";
        }
        regexLeft += escapeRegex(delimiters[i].left);
    }
    regexLeft = new RegExp(regexLeft + ")");

    let lookingForLeft = true;
    let index;
    const data = [];

    while (true) {
        if (lookingForLeft) {
            index = text.search(regexLeft);
            if (index === -1) {
                break;
            }
            if (index > 0) {
                data.push({
                    type: "text",
                    data: text.slice(0, index),
                });
                text = text.slice(index);
            }
        } else {
            let i = 0;
            while (!text.startsWith(delimiters[i].left)) { i++; }
            index = findEndOfMath(
                delimiters[i].right,
                text,
                delimiters[i].left.length
            );
            if (index === -1) {
                break;
            }

            data.push({
                type: "math",
                data: text.slice(delimiters[i].left.length, index),
                rawData: text.slice(0, index + delimiters[i].right.length),
                display: delimiters[i].display || false,
            });
            text = text.slice(index + delimiters[i].right.length);
        }

        lookingForLeft = !lookingForLeft;
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
