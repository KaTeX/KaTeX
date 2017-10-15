// @flow
/**
 * This file contains a list of utility functions which are useful in other
 * files.
 */

/**
 * Provide an `indexOf` function which works in IE8, but defers to native if
 * possible.
 */
const nativeIndexOf = Array.prototype.indexOf;
const indexOf = function<T>(list: Array<T>, elem: T): number {
    if (list == null) {
        return -1;
    }
    if (nativeIndexOf && list.indexOf === nativeIndexOf) {
        return list.indexOf(elem);
    }
    const l = list.length;
    for (let i = 0; i < l; i++) {
        if (list[i] === elem) {
            return i;
        }
    }
    return -1;
};

/**
 * Return whether an element is contained in a list
 */
const contains = function<T>(list: Array<T>, elem: T) {
    return indexOf(list, elem) !== -1;
};

/**
 * Provide a default value if a setting is undefined
 */
const deflt = function<T>(setting: T | void, defaultIfUndefined: T): * {
    return setting === undefined ? defaultIfUndefined : setting;
};

// hyphenate and escape adapted from Facebook's React under Apache 2 license

const uppercase = /([A-Z])/g;
const hyphenate = function(str: string): string {
    return str.replace(uppercase, "-$1").toLowerCase();
};

const ESCAPE_LOOKUP = {
    "&": "&amp;",
    ">": "&gt;",
    "<": "&lt;",
    "\"": "&quot;",
    "'": "&#x27;",
};

const ESCAPE_REGEX = /[&><"']/g;

// Type-safe only if the input string matches ESCAPE_REGEX.
function escaper(match: string): string {
    return ESCAPE_LOOKUP[match];
}

/**
 * Escapes text to prevent scripting attacks.
 */
function escape(text: mixed): string {
    return String(text).replace(ESCAPE_REGEX, escaper);
}

/**
 * A function to set the text content of a DOM element in all supported
 * browsers. Note that we don't define this if there is no document.
 */
let setTextContent;
if (typeof document !== "undefined") {
    const testNode = document.createElement("span");
    if ("textContent" in testNode) {
        setTextContent = function(node: Node, text: string) {
            node.textContent = text;
        };
    } else {
        setTextContent = function(node: Node, text: string) {
            node.innerText = text;
        };
    }
}

/**
 * A function to clear a node.
 */
function clearNode(node: Node) {
    setTextContent(node, "");
}

export default {
    contains: contains,
    deflt: deflt,
    escape: escape,
    hyphenate: hyphenate,
    indexOf: indexOf,
    setTextContent: setTextContent,
    clearNode: clearNode,
};
