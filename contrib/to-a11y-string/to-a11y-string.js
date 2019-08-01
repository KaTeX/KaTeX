// @flow
/**
 * KaTeX A11y
 * A library for converting KaTeX math into readable strings.
 */

// NOTE(jeresig): We need to keep this file as pure ES5 to avoid import
// problems into webapp.
// NOTE(jeresig): This probably isn't true anymore, we can probably update it!
/* eslint-disable no-const */

// NOTE: since we're importing types here these files won't actually be
// included in the build.
import type {Atom} from "../../src/symbols";
import type {AnyParseNode} from "../../src/ParseNode";

// TODO: change this to a $FlowIgnore, need to modify .flowconfig for this to work
// $FlowFixMe: we import the types directly anyways
import katex from "katex";

const stringMap = {
    "(": "left parenthesis",
    ")": "right parenthesis",
    "[": "open bracket",
    "]": "close bracket",
    "\\{": "left brace",
    "\\}": "right brace",
    "\\lvert": "open vertical bar",
    "\\rvert": "close vertical bar",
    "|": "vertical bar",
    "\\uparrow": "up arrow",
    "\\Uparrow": "up arrow",
    "\\downarrow": "down arrow",
    "\\Downarrow": "down arrow",
    "\\updownarrow": "up down arrow",
    "\\leftarrow": "left arrow",
    "\\Leftarrow": "left arrow",
    "\\rightarrow": "right arrow",
    "\\Rightarrow": "right arrow",
    "\\langle": "open angle",
    "\\rangle": "close angle",
    "\\lfloor": "open floor",
    "\\rfloor": "close floor",
    "\\int": "integral",
    "\\intop": "integral",
    "\\lim": "limit",
    "\\ln": "natural log",
    "\\log": "log",
    "\\sin": "sine",
    "\\cos": "cosine",
    "\\tan": "tangent",
    "\\cot": "cotangent",
    "\\sum": "sum",
    "/": "slash",
    ",": "comma",
    ".": "point",
    "-": "negative",
    "+": "plus",
    "~": "tilde",
    ":": "colon",
    "?": "question mark",
    "'": "apostrophe",
    "\\%": "percent",
    " ": "space",
    "\\ ": "space",
    "\\$": "dollar sign",
    "\\angle": "angle",
    "\\degree": "degree",
    "\\circ": "circle",
    "\\vec": "vector",
    "\\triangle": "triangle",
    "\\pi": "pi",
    "\\prime": "prime",
    "\\infty": "infinity",
    "\\alpha": "alpha",
    "\\beta": "beta",
    "\\gamma": "gamma",
    "\\omega": "omega",
    "\\theta": "theta",
    "\\sigma": "sigma",
    "\\lambda": "lambda",
    "\\tau": "tau",
    "\\Delta": "delta",
    "\\delta": "delta",
    "\\mu": "mu",
    "\\rho": "rho",
    "\\nabla": "del",
    "\\ell": "ell",
    "\\ldots": "dots",
    // TODO: add entries for all accents
    "\\hat": "hat",
};

const powerMap = {
    "prime": "prime",
    "degree": "degrees",
    "circle": "degrees",
    "2": "squared",
    "3": "cubed",
};

const openMap = {
    "|": "open vertical bar",
    ".": "",
};

const closeMap = {
    "|": "close vertical bar",
    ".": "",
};

const binMap = {
    "+": "plus",
    "-": "minus",
    "\\pm": "plus minus",
    "\\cdot": "dot",
    "*": "times",
    "/": "divided by",
    "\\times": "times",
    "\\div": "divided by",
    "\\circ": "circle",
    "\\bullet": "bullet",
};

const relMap = {
    "=": "equals",
    "\\approx": "approximately equals",
    "≠": "does not equal",
    "\\geq": "is greater than or equal to",
    "\\ge": "is greater than or equal to",
    "\\leq": "is less than or equal to",
    "\\le": "is less than or equal to",
    ">": "is greater than",
    "<": "is less than",
    "\\leftarrow": "left arrow",
    "\\Leftarrow": "left arrow",
    "\\rightarrow": "right arrow",
    "\\Rightarrow": "right arrow",
    ":": "colon",
};

const accentUnderMap = {
    "\\underleftarrow": "left arrow",
    "\\underrightarrow": "right arrow",
    "\\underleftrightarrow": "left-right arrow",
    "\\undergroup": "group",
    "\\underlinesegment": "line segment",
    "\\utilde": "tilde",
};

type NestedArray<T> = Array<T | NestedArray<T>>;

const buildString = (
    str: string,
    type: Atom | "normal",
    a11yStrings: NestedArray<string>,
) => {
    if (!str) {
        return;
    }

    let ret;

    if (type === "open") {
        ret = str in openMap ? openMap[str] : stringMap[str] || str;
    } else if (type === "close") {
        ret = str in closeMap ? closeMap[str] : stringMap[str] || str;
    } else if (type === "bin") {
        ret = binMap[str] || str;
    } else if (type === "rel") {
        ret = relMap[str] || str;
    } else {
        ret = stringMap[str] || str;
    }


    // If nothing was found and it's not a plain string or number
    // if (ret === str && !/^\w+$/.test(str)) {
    //     // This is likely a case that we'll need to handle
    //     throw new Error("KaTeX a11y " + type + " string not found: " + str);
    // }

    // If the text to add is a number and there is already a string
    // in the list and the last string is a number then we should
    // combine them into a single number
    if (
        /^\d+$/.test(ret) &&
        a11yStrings.length > 0 &&
        // TODO(kevinb): check that the last item in a11yStrings is a string
        // I think we might be able to drop the nested arrays, which would make
        // this easier to type - $FlowFixMe
        /^\d+$/.test(a11yStrings[a11yStrings.length - 1])
    ) {
        a11yStrings[a11yStrings.length - 1] += ret;
    } else if (ret) {
        a11yStrings.push(ret);
    }
};

const buildRegion = (
    a11yStrings: NestedArray<string>,
    callback: (regionStrings: NestedArray<string>) => void,
) => {
    const regionStrings: NestedArray<string> = [];
    a11yStrings.push(regionStrings);
    callback(regionStrings);
};

const handleObject = (
    tree: AnyParseNode,
    a11yStrings: NestedArray<string>,
    atomType: Atom | "normal",
) => {
     // Everything else is assumed to be an object...
    switch (tree.type) {
        case "accent": {
            buildRegion(a11yStrings, (a11yStrings) => {
                buildA11yStrings(tree.base, a11yStrings, atomType);
                a11yStrings.push("with");
                buildString(tree.label, "normal", a11yStrings);
                a11yStrings.push("on top");
            });
            break;
        }

        case "accentUnder": {
            buildRegion(a11yStrings, (a11yStrings) => {
                buildA11yStrings(tree.base, a11yStrings, atomType);
                a11yStrings.push("with");
                buildString(accentUnderMap[tree.label], "normal", a11yStrings);
                a11yStrings.push("underneath");
            });
            break;
        }

        case "accent-token": {
            throw new Error("TODO: accent-token");
        }

        case "atom": {
            const {text} = tree;
            switch (tree.family) {
                case "bin": {
                    buildString(text, "bin", a11yStrings);
                    break;
                }
                case "close": {
                    buildString(text, "close", a11yStrings);
                    break;
                }
                // TODO(kevinb): figure out what should be done for inner
                case "inner": {
                    buildA11yStrings(tree, a11yStrings, atomType);
                    break;
                }
                case "open": {
                    buildString(text, "open", a11yStrings);
                    break;
                }
                case "punct": {
                    buildString(text, "punct", a11yStrings);
                    break;
                }
                case "rel": {
                    buildString(text, "rel", a11yStrings);
                    break;
                }
                default: {
                    (tree.family: empty);
                    throw new Error(`"${tree.family}" is not a valid atom type`);
                }
            }
            break;
        }

        case "color": {
            const color = tree.color.replace(/katex-/, "");

            buildRegion(a11yStrings, (regionStrings) => {
                regionStrings.push("start color " + color);
                buildA11yStrings(tree.body, regionStrings, atomType);
                regionStrings.push("end color " + color);
            });
            break;
        }

        case "color-token": {
            throw new Error("TODO: color-token");
        }

        case "delimsizing": {
            if (tree.delim && tree.delim !== ".") {
                buildString(tree.delim, "normal", a11yStrings);
            }
            break;
        }

        case "genfrac": {
            buildRegion(a11yStrings, (regionStrings) => {
                // genfrac can have unbalanced delimiters
                const {leftDelim, rightDelim} = tree;

                // NOTE: Not sure if this is a safe assumption
                // hasBarLine true -> fraction, false -> binomial
                if (tree.hasBarLine) {
                    regionStrings.push("start fraction");
                    leftDelim && buildString(leftDelim, "open", regionStrings);
                    buildA11yStrings(tree.numer, regionStrings, atomType);
                    regionStrings.push("divided by");
                    buildA11yStrings(tree.denom, regionStrings, atomType);
                    rightDelim && buildString(rightDelim, "close", regionStrings);
                    regionStrings.push("end fraction");
                } else {
                    regionStrings.push("start binomial");
                    leftDelim && buildString(leftDelim, "open", regionStrings);
                    buildA11yStrings(tree.numer, regionStrings, atomType);
                    regionStrings.push("over");
                    buildA11yStrings(tree.denom, regionStrings, atomType);
                    rightDelim && buildString(rightDelim, "close", regionStrings);
                    regionStrings.push("end binomial");
                }
            });
            break;
        }

        // katex: function(tree: ParseNode<"katex">, a11yStrings) {
        //     a11yStrings.push("KaTeX");
        // },

        case "kern": {
            // No op: we don't attempt to present kerning information
            // to the screen reader.
            break;
        }

        case "leftright": {
            buildRegion(a11yStrings, (regionStrings) => {
                buildString(tree.left, "open", regionStrings);
                buildA11yStrings(tree.body, regionStrings, atomType);
                buildString(tree.right, "close", regionStrings);
            });
            break;
        }

        case "leftright-right": {
            // TODO: double check that this is a no-op
            break;
        }

        case "lap": {
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "mathord": {
            buildString(tree.text, "normal", a11yStrings);
            break;
        }

        case "op": {
            const {body, name} = tree;
            if (body) {
                buildA11yStrings(body, a11yStrings, atomType);
            } else if (name) {
                buildString(name, "normal", a11yStrings);
            }
            break;
        }

        case "op-token": {
            throw new Error("TODO: op-token");
        }

        case "ordgroup": {
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "overline": {
            buildRegion(a11yStrings, function(a11yStrings) {
                a11yStrings.push("start overline");
                buildA11yStrings(tree.body, a11yStrings, atomType);
                a11yStrings.push("end overline");
            });
            break;
        }

        case "phantom": {
            a11yStrings.push("empty space");
            break;
        }

        case "raisebox": {
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "rule": {
            // NOTE: Is there something more useful that we can put here?
            a11yStrings.push("rule");
            break;
        }

        case "sizing": {
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "spacing": {
            a11yStrings.push("space");
            break;
        }

        case "styling": {
            // We ignore the styling and just pass through the contents
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "sqrt": {
            buildRegion(a11yStrings, (regionStrings) => {
                const {body, index} = tree;
                if (index) {
                    const indexString = flatten(
                        buildA11yStrings(index, [], atomType)).join(",");
                    if (indexString === "3") {
                        regionStrings.push("cube root of");
                        buildA11yStrings(body, regionStrings, atomType);
                        regionStrings.push("end cube root");
                        return;
                    }

                    regionStrings.push("root");
                    regionStrings.push("start index");
                    buildA11yStrings(index, regionStrings, atomType);
                    regionStrings.push("end index");
                    return;
                }

                regionStrings.push("square root of");
                buildA11yStrings(body, regionStrings, atomType);
                regionStrings.push("end square root");
            });
            break;
        }

        case "supsub": {
            const {base, sub, sup} = tree;

            if (base) {
                buildA11yStrings(base, a11yStrings, atomType);
            }

            if (sub) {
                buildRegion(a11yStrings, function(regionStrings) {
                    regionStrings.push("start subscript");
                    buildA11yStrings(sub, regionStrings, atomType);
                    regionStrings.push("end subscript");
                });
            }

            if (sup) {
                buildRegion(a11yStrings, function(regionStrings) {
                    const supString = flatten(
                        buildA11yStrings(sup, [], atomType)).join(",");

                    if (supString in powerMap) {
                        regionStrings.push(powerMap[supString]);
                        return;
                    }

                    regionStrings.push("start superscript");
                    buildA11yStrings(sup, regionStrings, atomType);
                    regionStrings.push("end superscript");
                });
            }
            break;
        }

        case "text": {
            // TODO: handle other fonts
            if (tree.font === "\\textbf") {
                buildRegion(a11yStrings, function(regionStrings) {
                    regionStrings.push("start bold text");
                    buildA11yStrings(tree.body, regionStrings, atomType);
                    regionStrings.push("end bold text");
                });
                break;
            }
            buildRegion(a11yStrings, function(regionStrings) {
                regionStrings.push("start text");
                buildA11yStrings(tree.body, regionStrings, atomType);
                regionStrings.push("end text");
            });
            break;
        }

        case "textord": {
            buildString(tree.text, atomType, a11yStrings);
            break;
        }

        case "smash": {
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "enclose": {
            // TODO: create a map for these.
            // TODO: differentiate between a body with a single atom, e.g.
            // "cancel a" instead of "start cancel, a, end cancel"
            if (/cancel/.test(tree.label)) {
                buildRegion(a11yStrings, function(regionStrings) {
                    regionStrings.push("start cancel");
                    buildA11yStrings(tree.body, regionStrings, atomType);
                    regionStrings.push("end cancel");
                });
                break;
            } else if (/box/.test(tree.label)) {
                buildRegion(a11yStrings, function(regionStrings) {
                    regionStrings.push("start box");
                    buildA11yStrings(tree.body, regionStrings, atomType);
                    regionStrings.push("end box");
                });
                break;
            } else if (/sout/.test(tree.label)) {
                buildRegion(a11yStrings, function(regionStrings) {
                    regionStrings.push("start strikeout");
                    buildA11yStrings(tree.body, regionStrings, atomType);
                    regionStrings.push("end strikeout");
                });
                break;
            }
            throw new Error(
                `TODO: enclose node with ${tree.label} not supported yet`);
        }

        case "vphantom": {
            throw new Error("TODO: vphantom");
        }

        case "hphantom": {
            throw new Error("TODO: hphantom");
        }

        case "operatorname": {
            throw new Error("TODO: operatorname");
        }

        case "array": {
            throw new Error("TODO: array");
        }

        case "keyVals": {
            throw new Error("TODO: keyVals");
        }

        case "raw": {
            throw new Error("TODO: raw");
        }

        case "size": {
            throw new Error("TODO: size");
        }

        case "url": {
            throw new Error("TODO: url");
        }

        case "tag": {
            throw new Error("TODO: tag");
        }

        case "verb": {
            throw new Error("TODO: verb");
        }

        case "environment": {
            throw new Error("TODO: environment");
        }

        case "horizBrace": {
            buildString(`start ${tree.label.slice(1)}`, "normal", a11yStrings);
            buildA11yStrings(tree.base, a11yStrings, atomType);
            buildString(`end ${tree.label.slice(1)}`, "normal", a11yStrings);
            break;
        }

        case "infix": {
            throw new Error("All infix nodes are replaced with other nodes");
        }

        case "includegraphics": {
            throw new Error("TODO: includegraphics");
        }

        case "font": {
            // TODO: callout the start/end of specific fonts
            // TODO: map \BBb{N} to "the naturals" or something like that
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "href": {
            throw new Error("TODO: href");
        }

        case "cr": {
            // used by environments
            throw new Error("TODO: cr");
        }

        case "underline": {
            buildRegion(a11yStrings, function(a11yStrings) {
                a11yStrings.push("start underline");
                buildA11yStrings(tree.body, a11yStrings, atomType);
                a11yStrings.push("end underline");
            });
            break;
        }

        case "xArrow": {
            throw new Error("TODO: xArrow");
        }

        case "mclass": {
            // \neq and \ne are macros so we let "htmlmathml" render the mathmal
            // side of things and extract the text from that.
            const atomType = tree.mclass.slice(1);
            // $FlowFixMe: drop the leading "m" from the values in mclass
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "mathchoice": {
            // TODO: track which which style we're using, e.g. dispaly, text, etc.
            // default to text style if even that may not be the correct style
            buildA11yStrings(tree.text, a11yStrings, atomType);
            break;
        }

        case "htmlmathml": {
            buildA11yStrings(tree.mathml, a11yStrings, atomType);
            break;
        }

        case "middle": {
            throw new Error("TODO: middle");
        }

        default:
            (tree.type: empty);
            throw new Error("KaTeX a11y un-recognized type: " + tree.type);
    }
};

const buildA11yStrings = (
    tree: AnyParseNode | AnyParseNode[],
    a11yStrings: NestedArray<string> = [],
    atomType: Atom | "normal",
) => {
    if (tree instanceof Array) {
        for (let i = 0; i < tree.length; i++) {
            buildA11yStrings(tree[i], a11yStrings, atomType);
        }
    } else {
        handleObject(tree, a11yStrings, atomType);
    }

    return a11yStrings;
};

const renderStrings = function(a11yStrings: NestedArray<string>, a11yNode: Node) {
    const doc = a11yNode.ownerDocument;

    for (let i = 0; i < a11yStrings.length; i++) {
        const a11yString = a11yStrings[i];

        if (i > 0) {
            // Note: We insert commas in (not just spaces) to provide
            // screen readers with some "breathing room". When inserting the
            // commas the screen reader knows to pause slightly and it provides
            // an overall better listening experience.
            a11yNode.appendChild(doc.createTextNode(", "));
        }

        if (typeof a11yString === "string") {
            a11yNode.appendChild(doc.createTextNode(a11yString));
        } else {
            const newBaseNode = doc.createElement("span");
            // NOTE(jeresig): We may want to add in a tabIndex property
            // to the node here, in order to support keyboard navigation.
            a11yNode.appendChild(newBaseNode);
            renderStrings(a11yString, newBaseNode);
        }
    }
};

const parseMath = function(text: string) {
    // colorIsTextColor is an option added in KaTeX 0.9.0 for backward
    // compatibility. It makes \color parse like \textcolor. We use it
    // in the KA webapp, and need it here because the tests are written
    // assuming it is set.
    return katex.__parse(text, {colorIsTextColor: true});
};

const render = function(text: string, a11yNode: Node) {
    const tree = parseMath(text);
    const a11yStrings = buildA11yStrings(tree, [], "normal");
    renderStrings(a11yStrings, a11yNode);
};

const flatten = function(array) {
    let result = [];

    array.forEach(function(item) {
        if (item instanceof Array) {
            result = result.concat(flatten(item));
        } else {
            result.push(item);
        }
    });

    return result;
};

const renderString = function(text: string) {
    const tree = parseMath(text);
    const a11yStrings = buildA11yStrings(tree, [], "normal");
    return flatten(a11yStrings).join(", ");
};

export {
    render, renderString, parseMath,
};
