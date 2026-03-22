/**
 * Converts a KaTeX parse tree into a human-readable string suitable for
 * screen readers and aria-labels.
 *
 * Examples:
 *   treeToA11yString(parse("\\frac{1}{2}"))
 *   -> "start fraction, 1, divided by, 2, end fraction"
 *
 *   treeToA11yString(parse("x^2"))
 *   -> "x, squared"
 */

import type {Atom} from "./symbols";
import type {AnyParseNode} from "./parseNode";

const stringMap: Record<string, string> = {
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
    "\\hat": "hat",
    "\\acute": "acute",
};
const powerMap: Record<string, string> = {
    "prime": "prime",
    "degree": "degrees",
    "circle": "degrees",
    "2": "squared",
    "3": "cubed",
};
const openMap: Record<string, string> = {
    "|": "open vertical bar",
    ".": "",
};
const closeMap: Record<string, string> = {
    "|": "close vertical bar",
    ".": "",
};
const binMap: Record<string, string> = {
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
const relMap: Record<string, string> = {
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
const accentUnderMap: Record<string, string> = {
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

    const last = a11yStrings[a11yStrings.length - 1];
    if (
        /^\d+$/.test(ret) &&
        a11yStrings.length > 0 &&
        typeof last === "string" &&
        /^\d+$/.test(last)
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
            break;
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
                case "inner": {
                    buildString(tree.text, "inner", a11yStrings);
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
                    (tree.family as never);
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
            break;
        }

        case "delimsizing": {
            if (tree.delim && tree.delim !== ".") {
                buildString(tree.delim, "normal", a11yStrings);
            }
            break;
        }

        case "genfrac": {
            buildRegion(a11yStrings, (regionStrings) => {
                const {leftDelim, rightDelim} = tree;

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

        case "hbox": {
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "kern": {
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
            buildString(tree.text, atomType, a11yStrings);
            break;
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

        case "pmb": {
            a11yStrings.push("bold");
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
            a11yStrings.push("rectangle");
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
            let isLog = false;

            if (base) {
                buildA11yStrings(base, a11yStrings, atomType);
                isLog = base.type === "op" && base.name === "\\log";
            }

            if (sub) {
                const regionName = isLog ? "base" : "subscript";
                buildRegion(a11yStrings, function(regionStrings) {
                    regionStrings.push(`start ${regionName}`);
                    buildA11yStrings(sub, regionStrings, atomType);
                    regionStrings.push(`end ${regionName}`);
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
            } else if (/phase/.test(tree.label)) {
                buildRegion(a11yStrings, function(regionStrings) {
                    regionStrings.push("start phase angle");
                    buildA11yStrings(tree.body, regionStrings, atomType);
                    regionStrings.push("end phase angle");
                });
                break;
            }
            throw new Error(
                `KaTeX-a11y: enclose node with ${tree.label} not supported yet`);
        }

        case "vcenter": {
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "vphantom": {
            throw new Error("KaTeX-a11y: vphantom not implemented yet");
        }

        case "operatorname": {
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "array": {
            throw new Error("KaTeX-a11y: array not implemented yet");
        }

        case "raw": {
            throw new Error("KaTeX-a11y: raw not implemented yet");
        }

        case "size": {
            break;
        }

        case "url": {
            throw new Error("KaTeX-a11y: url not implemented yet");
        }

        case "tag": {
            throw new Error("KaTeX-a11y: tag not implemented yet");
        }

        case "verb": {
            buildString(`start verbatim`, "normal", a11yStrings);
            buildString(tree.body, "normal", a11yStrings);
            buildString(`end verbatim`, "normal", a11yStrings);
            break;
        }

        case "environment": {
            throw new Error("KaTeX-a11y: environment not implemented yet");
        }

        case "horizBrace": {
            buildString(`start ${tree.label.slice(1)}`, "normal", a11yStrings);
            buildA11yStrings(tree.base, a11yStrings, atomType);
            buildString(`end ${tree.label.slice(1)}`, "normal", a11yStrings);
            break;
        }

        case "infix": {
            break;
        }

        case "includegraphics": {
            throw new Error("KaTeX-a11y: includegraphics not implemented yet");
        }

        case "font": {
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "href": {
            throw new Error("KaTeX-a11y: href not implemented yet");
        }

        case "cr": {
            throw new Error("KaTeX-a11y: cr not implemented yet");
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
            throw new Error("KaTeX-a11y: xArrow not implemented yet");
        }

        case "cdlabel": {
            throw new Error("KaTeX-a11y: cdlabel not implemented yet");
        }

        case "cdlabelparent": {
            throw new Error("KaTeX-a11y: cdlabelparent not implemented yet");
        }

        case "mclass": {
            const atomType = tree.mclass.slice(1);
            buildA11yStrings(tree.body, a11yStrings, atomType as Atom | "normal");
            break;
        }

        case "mathchoice": {
            buildA11yStrings(tree.text, a11yStrings, atomType);
            break;
        }

        case "htmlmathml": {
            buildA11yStrings(tree.mathml, a11yStrings, atomType);
            break;
        }

        case "middle": {
            buildString(tree.delim, atomType, a11yStrings);
            break;
        }

        case "internal": {
            break;
        }

        case "html": {
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        default:
            throw new Error("KaTeX a11y un-recognized type: " + (tree as AnyParseNode).type);
    }
};

export const buildA11yStrings = (
    tree: AnyParseNode | AnyParseNode[],
    a11yStrings: NestedArray<string> = [],
    atomType: Atom | "normal",
): NestedArray<string> => {
    if (tree instanceof Array) {
        for (let i = 0; i < tree.length; i++) {
            buildA11yStrings(tree[i], a11yStrings, atomType);
        }
    } else {
        handleObject(tree, a11yStrings, atomType);
    }

    return a11yStrings;
};

export const flatten = function(array: NestedArray<string>): string[] {
    let result: string[] = [];

    array.forEach(function(item) {
        if (Array.isArray(item)) {
            result = result.concat(flatten(item));
        } else {
            result.push(item);
        }
    });

    return result;
};

/**
 * Converts a parse tree to a human-readable a11y string.
 * Returns null if the tree contains unsupported node types.
 */
export const treeToA11yString = function(
    tree: AnyParseNode[],
): string | null {
    try {
        const a11yStrings = buildA11yStrings(tree, [], "normal");
        return flatten(a11yStrings).join(", ");
    } catch {
        return null;
    }
};
