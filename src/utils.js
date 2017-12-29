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
const contains = function<T>(list: Array<T>, elem: T): boolean {
    return indexOf(list, elem) !== -1;
};

/**
 * Provide a default value if a setting is undefined
 * NOTE: Couldn't use `T` as the output type due to facebook/flow#5022.
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

/**
 * Escapes text to prevent scripting attacks.
 */
function escape(text: mixed): string {
    return String(text).replace(ESCAPE_REGEX, match => ESCAPE_LOOKUP[match]);
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

type BaseElem = {|
    type: "mathord",
|} | {|
    type: "textord",
|} | {|
    type: "bin",
|} | {|
    type: "rel",
|} | {|
    type: "inner",
|} | {|
    type: "open",
|} | {|
    type: "close",
|} | {|
    type: "punct",
|};

type Group = {|
    type: "ordgroup",
    value: Group[],
|} | {|
    type: "color",
    value: {|
        value: Group[],
    |},
|} | {|
    type: "font",
    value: {|
        body: Group,
    |},
|} | BaseElem;

/**
 * Sometimes we want to pull out the innermost element of a group. In most
 * cases, this will just be the group itself, but when ordgroups and colors have
 * a single element, we want to pull that out.
 */
const getBaseElem = function(group: Group): Group | boolean {
    if (!group) {
        return false;
    } else if (group.type === "ordgroup") {
        if (group.value.length === 1) {
            return getBaseElem(group.value[0]);
        } else {
            return group;
        }
    } else if (group.type === "color") {
        if (group.value.value.length === 1) {
            return getBaseElem(group.value.value[0]);
        } else {
            return group;
        }
    } else if (group.type === "font") {
        return getBaseElem(group.value.body);
    } else {
        return group;
    }
};

/**
 * TeXbook algorithms often reference "character boxes", which are simply groups
 * with a single character in them. To decide if something is a character box,
 * we find its innermost group, and see if it is a single character.
 */
const isCharacterBox = function(group: Group): boolean {
    const baseElem = getBaseElem(group);

    // These are all they types of groups which hold single characters
    return baseElem.type === "mathord" ||
        baseElem.type === "textord" ||
        baseElem.type === "bin" ||
        baseElem.type === "rel" ||
        baseElem.type === "inner" ||
        baseElem.type === "open" ||
        baseElem.type === "close" ||
        baseElem.type === "punct";
};

export default {
    contains,
    deflt,
    escape,
    hyphenate,
    indexOf,
    setTextContent,
    clearNode,
    getBaseElem,
    isCharacterBox,
};
