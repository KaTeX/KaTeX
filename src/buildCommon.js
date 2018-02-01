// @flow
/* eslint no-console:0 */
/**
 * This module contains general functions that can be used for building
 * different kinds of domTree nodes in a consistent manner.
 */

import domTree from "./domTree";
import fontMetrics from "./fontMetrics";
import symbols from "./symbols";
import utils from "./utils";
import stretchy from "./stretchy";
import {calculateSize} from "./units";

import type Options from "./Options";
import type ParseNode from "./ParseNode";
import type {CharacterMetrics} from "./fontMetrics";
import type {Mode} from "./types";
import type {DomChildNode, CombinableDomNode, CssStyle} from "./domTree";
import type {Measurement} from "./units";

// The following have to be loaded from Main-Italic font, using class mainit
const mainitLetters = [
    "\\imath", "ı",       // dotless i
    "\\jmath", "ȷ",       // dotless j
    "\\pounds", "\\mathsterling", "\\textsterling", "£",   // pounds symbol
];

/**
 * Looks up the given symbol in fontMetrics, after applying any symbol
 * replacements defined in symbol.js
 */
const lookupSymbol = function(
    value: string,
    // TODO(#963): Use a union type for this.
    fontFamily: string,
    mode: Mode,
): {value: string, metrics: ?CharacterMetrics} {
    // Replace the value with its replaced value from symbol.js
    if (symbols[mode][value] && symbols[mode][value].replace) {
        value = symbols[mode][value].replace;
    }
    return {
        value: value,
        metrics: fontMetrics.getCharacterMetrics(value, fontFamily, mode),
    };
};

/**
 * Makes a symbolNode after translation via the list of symbols in symbols.js.
 * Correctly pulls out metrics for the character, and optionally takes a list of
 * classes to be attached to the node.
 *
 * TODO: make argument order closer to makeSpan
 * TODO: add a separate argument for math class (e.g. `mop`, `mbin`), which
 * should if present come first in `classes`.
 * TODO(#953): Make `options` mandatory and always pass it in.
 */
const makeSymbol = function(
    value: string,
    fontFamily: string,
    mode: Mode,
    options?: Options,
    classes?: string[],
): domTree.symbolNode {
    const lookup = lookupSymbol(value, fontFamily, mode);
    const metrics = lookup.metrics;
    value = lookup.value;

    let symbolNode;
    if (metrics) {
        let italic = metrics.italic;
        if (mode === "text") {
            italic = 0;
        }
        symbolNode = new domTree.symbolNode(
            value, metrics.height, metrics.depth, italic, metrics.skew,
            metrics.width, classes);
    } else {
        // TODO(emily): Figure out a good way to only print this in development
        typeof console !== "undefined" && console.warn(
            "No character metrics for '" + value + "' in style '" +
                fontFamily + "'");
        symbolNode = new domTree.symbolNode(value, 0, 0, 0, 0, 0, classes);
    }

    if (options) {
        symbolNode.maxFontSize = options.sizeMultiplier;
        if (options.style.isTight()) {
            symbolNode.classes.push("mtight");
        }
        const color = options.getColor();
        if (color) {
            symbolNode.style.color = color;
        }
    }

    return symbolNode;
};

/**
 * Makes a symbol in Main-Regular or AMS-Regular.
 * Used for rel, bin, open, close, inner, and punct.
 *
 * TODO(#953): Make `options` mandatory and always pass it in.
 */
const mathsym = function(
    value: string,
    mode: Mode,
    options?: Options,
    classes?: string[] = [],
): domTree.symbolNode {
    // Decide what font to render the symbol in by its entry in the symbols
    // table.
    // Have a special case for when the value = \ because the \ is used as a
    // textord in unsupported command errors but cannot be parsed as a regular
    // text ordinal and is therefore not present as a symbol in the symbols
    // table for text, as well as a special case for boldsymbol because it
    // can be used for bold + and -
    if ((options && options.fontFamily && options.fontFamily === "boldsymbol") &&
            lookupSymbol(value, "Main-Bold", mode).metrics) {
        return makeSymbol(value, "Main-Bold", mode, options,
            classes.concat(["mathbf"]));
    } else if (value === "\\" || symbols[mode][value].font === "main") {
        return makeSymbol(value, "Main-Regular", mode, options, classes);
    } else {
        return makeSymbol(
            value, "AMS-Regular", mode, options, classes.concat(["amsrm"]));
    }
};

/**
 * Makes a symbol in the default font for mathords and textords.
 */
const mathDefault = function(
    value: string,
    mode: Mode,
    options: Options,
    classes: string[],
    type: string, // TODO(#892): Use ParseNode type here.
): domTree.symbolNode {
    if (type === "mathord") {
        const fontLookup = mathit(value, mode, options, classes);
        return makeSymbol(value, fontLookup.fontName, mode, options,
            classes.concat([fontLookup.fontClass]));
    } else if (type === "textord") {
        const font = symbols[mode][value] && symbols[mode][value].font;
        if (font === "ams") {
            const fontName = retrieveTextFontName("amsrm", options.fontWeight,
                  options.fontShape);
            return makeSymbol(
                value, fontName, mode, options,
                classes.concat("amsrm", options.fontWeight, options.fontShape));
        } else { // if (font === "main") {
            const fontName = retrieveTextFontName("textrm", options.fontWeight,
                  options.fontShape);
            return makeSymbol(
                value, fontName, mode, options,
                classes.concat(options.fontWeight, options.fontShape));
        }
    } else {
        throw new Error("unexpected type: " + type + " in mathDefault");
    }
};

/**
 * Determines which of the two font names (Main-Italic and Math-Italic) and
 * corresponding style tags (mainit or mathit) to use for font "mathit",
 * depending on the symbol.  Use this function instead of fontMap for font
 * "mathit".
 */
const mathit = function(
    value: string,
    mode: Mode,
    options: Options,
    classes: string[],
): {| fontName: string, fontClass: string |} {
    if (/[0-9]/.test(value.charAt(0)) ||
            // glyphs for \imath and \jmath do not exist in Math-Italic so we
            // need to use Main-Italic instead
            utils.contains(mainitLetters, value)) {
        return {
            fontName: "Main-Italic",
            fontClass: "mainit",
        };
    } else {
        return {
            fontName: "Math-Italic",
            fontClass: "mathit",
        };
    }
};

/**
 * Determines which of the two font names (Main-Bold and Math-BoldItalic) and
 * corresponding style tags (mathbf or boldsymbol) to use for font "boldsymbol",
 * depending on the symbol.  Use this function instead of fontMap for font
 * "boldsymbol".
 */
const boldsymbol = function(
    value: string,
    mode: Mode,
    options: Options,
    classes: string[],
): {| fontName: string, fontClass: string |} {
    if (lookupSymbol(value, "Math-BoldItalic", mode).metrics) {
        return {
            fontName: "Math-BoldItalic",
            fontClass: "boldsymbol",
        };
    } else {
        // Some glyphs do not exist in Math-BoldItalic so we need to use
        // Main-Bold instead.
        return {
            fontName: "Main-Bold",
            fontClass: "mathbf",
        };
    }
};

/**
 * Makes either a mathord or textord in the correct font and color.
 */
const makeOrd = function(
    group: ParseNode,
    options: Options,
    type: string, // TODO(#892): Use ParseNode type here.
): domTree.symbolNode {
    const mode = group.mode;
    const value = group.value;

    const classes = ["mord"];

    const fontFamily = options.fontFamily;
    if (fontFamily) {
        let fontName;
        let fontClasses;
        if (fontFamily === "boldsymbol") {
            const fontData = boldsymbol(value, mode, options, classes);
            fontName = fontData.fontName;
            fontClasses = [fontData.fontClass];
        } else if (fontFamily === "mathit" ||
                   utils.contains(mainitLetters, value)) {
            const fontData = mathit(value, mode, options, classes);
            fontName = fontData.fontName;
            fontClasses = [fontData.fontClass];
        } else if (fontFamily.indexOf("math") !== -1 || mode === "math") {
            // To support old font functions (i.e. \rm \sf etc.) or math mode.
            fontName = fontMap[fontFamily].fontName;
            fontClasses = [fontFamily];
        } else {
            fontName = retrieveTextFontName(fontFamily, options.fontWeight,
                                            options.fontShape);
            fontClasses = [fontFamily, options.fontWeight, options.fontShape];
        }
        if (lookupSymbol(value, fontName, mode).metrics) {
            return makeSymbol(value, fontName, mode, options,
                classes.concat(fontClasses));
        } else {
            return mathDefault(value, mode, options, classes, type);
        }
    } else {
        return mathDefault(value, mode, options, classes, type);
    }
};

/**
 * Combine as many characters as possible in the given array of characters
 * via their tryCombine method.
 */
const tryCombineChars = function(
    chars: CombinableDomNode[],
): CombinableDomNode[] {
    for (let i = 0; i < chars.length - 1; i++) {
        if (chars[i].tryCombine(chars[i + 1])) {
            chars.splice(i + 1, 1);
            i--;
        }
    }
    return chars;
};

/**
 * Calculate the height, depth, and maxFontSize of an element based on its
 * children.
 */
const sizeElementFromChildren = function(
    elem: domTree.span | domTree.anchor | domTree.documentFragment,
) {
    let height = 0;
    let depth = 0;
    let maxFontSize = 0;

    for (const child of elem.children) {
        if (child.height > height) {
            height = child.height;
        }
        if (child.depth > depth) {
            depth = child.depth;
        }
        if (child.maxFontSize > maxFontSize) {
            maxFontSize = child.maxFontSize;
        }
    }

    elem.height = height;
    elem.depth = depth;
    elem.maxFontSize = maxFontSize;
};

/**
 * Makes a span with the given list of classes, list of children, and options.
 *
 * TODO(#953): Ensure that `options` is always provided (currently some call
 * sites don't pass it) and make the type below mandatory.
 * TODO: add a separate argument for math class (e.g. `mop`, `mbin`), which
 * should if present come first in `classes`.
 */
const makeSpan = function(
    classes?: string[],
    children?: DomChildNode[],
    options?: Options,
    style?: CssStyle,
): domTree.span {
    const span = new domTree.span(classes, children, options, style);

    sizeElementFromChildren(span);

    return span;
};

const makeLineSpan = function(
    className: string,
    options: Options,
) {
    // Return a span with an SVG image of a horizontal line. The SVG path
    // fills the middle fifth of the span. We want an extra tall span
    // because Chrome will sometimes not display a span that is 0.04em tall.
    const lineHeight = options.fontMetrics().defaultRuleThickness;
    const line = stretchy.ruleSpan(className, lineHeight, options);
    line.height = lineHeight;
    line.style.height = 5 * line.height + "em";
    line.maxFontSize = 1.0;
    return line;
};

/**
 * Makes an anchor with the given href, list of classes, list of children,
 * and options.
 */
const makeAnchor = function(
    href: string,
    classes: string[],
    children: DomChildNode[],
    options: Options,
) {
    const anchor = new domTree.anchor(href, classes, children, options);

    sizeElementFromChildren(anchor);

    return anchor;
};

/**
 * Makes a document fragment with the given list of children.
 */
const makeFragment = function(
    children: DomChildNode[],
): domTree.documentFragment {
    const fragment = new domTree.documentFragment(children);

    sizeElementFromChildren(fragment);

    return fragment;
};


// These are exact object types to catch typos in the names of the optional fields.
type VListElem = {|
    type: "elem",
    elem: DomChildNode,
    marginLeft?: string,
    marginRight?: string,
    wrapperClasses?: string[],
    wrapperStyle?: CssStyle,
|};
type VListElemAndShift = {|
    type: "elem",
    elem: DomChildNode,
    shift: number,
    marginLeft?: string,
    marginRight?: string,
    wrapperClasses?: string[],
    wrapperStyle?: CssStyle,
|};
type VListKern = {| type: "kern", size: number |};

// A list of child or kern nodes to be stacked on top of each other (i.e. the
// first element will be at the bottom, and the last at the top).
type VListChild = VListElem | VListKern;

type VListParam = {|
    // Each child contains how much it should be shifted downward.
    positionType: "individualShift",
    children: VListElemAndShift[],
|} | {|
    // "top": The positionData specifies the topmost point of the vlist (note this
    //        is expected to be a height, so positive values move up).
    // "bottom": The positionData specifies the bottommost point of the vlist (note
    //           this is expected to be a depth, so positive values move down).
    // "shift": The vlist will be positioned such that its baseline is positionData
    //          away from the baseline of the first child which MUST be an
    //          "elem". Positive values move downwards.
    positionType: "top" | "bottom" | "shift",
    positionData: number,
    children: VListChild[],
|} | {|
    // The vlist is positioned so that its baseline is aligned with the baseline
    // of the first child which MUST be an "elem". This is equivalent to "shift"
    // with positionData=0.
    positionType: "firstBaseline",
    children: VListChild[],
|};


// Computes the updated `children` list and the overall depth.
//
// This helper function for makeVList makes it easier to enforce type safety by
// allowing early exits (returns) in the logic.
const getVListChildrenAndDepth = function(params: VListParam): {
    children: (VListChild | VListElemAndShift)[] | VListChild[],
    depth: number,
} {
    if (params.positionType === "individualShift") {
        const oldChildren = params.children;
        const children: (VListChild | VListElemAndShift)[] = [oldChildren[0]];

        // Add in kerns to the list of params.children to get each element to be
        // shifted to the correct specified shift
        const depth = -oldChildren[0].shift - oldChildren[0].elem.depth;
        let currPos = depth;
        for (let i = 1; i < oldChildren.length; i++) {
            const diff = -oldChildren[i].shift - currPos -
                oldChildren[i].elem.depth;
            const size = diff -
                (oldChildren[i - 1].elem.height +
                 oldChildren[i - 1].elem.depth);

            currPos = currPos + diff;

            children.push({type: "kern", size});
            children.push(oldChildren[i]);
        }

        return {children, depth};
    }

    let depth;
    if (params.positionType === "top") {
        // We always start at the bottom, so calculate the bottom by adding up
        // all the sizes
        let bottom = params.positionData;
        for (const child of params.children) {
            bottom -= child.type === "kern"
                ? child.size
                : child.elem.height + child.elem.depth;
        }
        depth = bottom;
    } else if (params.positionType === "bottom") {
        depth = -params.positionData;
    } else {
        const firstChild = params.children[0];
        if (firstChild.type !== "elem") {
            throw new Error('First child must have type "elem".');
        }
        if (params.positionType === "shift") {
            depth = -firstChild.elem.depth - params.positionData;
        } else if (params.positionType === "firstBaseline") {
            depth = -firstChild.elem.depth;
        } else {
            throw new Error(`Invalid positionType ${params.positionType}.`);
        }
    }
    return {children: params.children, depth};
};

/**
 * Makes a vertical list by stacking elements and kerns on top of each other.
 * Allows for many different ways of specifying the positioning method.
 *
 * See VListParam documentation above.
 */
const makeVList = function(params: VListParam, options: Options): domTree.span {
    const {children, depth} = getVListChildrenAndDepth(params);

    // Create a strut that is taller than any list item. The strut is added to
    // each item, where it will determine the item's baseline. Since it has
    // `overflow:hidden`, the strut's top edge will sit on the item's line box's
    // top edge and the strut's bottom edge will sit on the item's baseline,
    // with no additional line-height spacing. This allows the item baseline to
    // be positioned precisely without worrying about font ascent and
    // line-height.
    let pstrutSize = 0;
    for (const child of children) {
        if (child.type === "elem") {
            const elem = child.elem;
            pstrutSize = Math.max(pstrutSize, elem.maxFontSize, elem.height);
        }
    }
    pstrutSize += 2;
    const pstrut = makeSpan(["pstrut"], []);
    pstrut.style.height = pstrutSize + "em";

    // Create a new list of actual children at the correct offsets
    const realChildren = [];
    let minPos = depth;
    let maxPos = depth;
    let currPos = depth;
    for (const child of children) {
        if (child.type === "kern") {
            currPos += child.size;
        } else {
            const elem = child.elem;
            const classes = child.wrapperClasses || [];
            const style = child.wrapperStyle || {};

            const childWrap = makeSpan(classes, [pstrut, elem], undefined, style);
            childWrap.style.top = (-pstrutSize - currPos - elem.depth) + "em";
            if (child.marginLeft) {
                childWrap.style.marginLeft = child.marginLeft;
            }
            if (child.marginRight) {
                childWrap.style.marginRight = child.marginRight;
            }

            realChildren.push(childWrap);
            currPos += elem.height + elem.depth;
        }
        minPos = Math.min(minPos, currPos);
        maxPos = Math.max(maxPos, currPos);
    }

    // The vlist contents go in a table-cell with `vertical-align:bottom`.
    // This cell's bottom edge will determine the containing table's baseline
    // without overly expanding the containing line-box.
    const vlist = makeSpan(["vlist"], realChildren);
    vlist.style.height = maxPos + "em";

    // A second row is used if necessary to represent the vlist's depth.
    let rows;
    if (minPos < 0) {
        const depthStrut = makeSpan(["vlist"], []);
        depthStrut.style.height = -minPos + "em";

        // Safari wants the first row to have inline content; otherwise it
        // puts the bottom of the *second* row on the baseline.
        const topStrut = makeSpan(["vlist-s"], [new domTree.symbolNode("\u200b")]);

        rows = [makeSpan(["vlist-r"], [vlist, topStrut]),
            makeSpan(["vlist-r"], [depthStrut])];
    } else {
        rows = [makeSpan(["vlist-r"], [vlist])];
    }

    const vtable = makeSpan(["vlist-t"], rows);
    if (rows.length === 2) {
        vtable.classes.push("vlist-t2");
    }
    vtable.height = maxPos;
    vtable.depth = -minPos;
    return vtable;
};

// Converts verb group into body string, dealing with \verb* form
const makeVerb = function(group: ParseNode, options: Options): string {
    // TODO(#892): Make ParseNode type-safe and confirm `group.type` to guarantee
    // that `group.value.body` is of type string.
    let text = group.value.body;
    if (group.value.star) {
        text = text.replace(/ /g, '\u2423');  // Open Box
    } else {
        text = text.replace(/ /g, '\xA0');    // No-Break Space
        // (so that, in particular, spaces don't coalesce)
    }
    return text;
};

// Glue is a concept from TeX which is a flexible space between elements in
// either a vertical or horizontal list.  In KaTeX, at least for now, it's
// static space between elements in a horizontal layout.
const makeGlue = (measurement: Measurement, options: Options): domTree.span => {
    // Make an empty span for the rule
    const rule = makeSpan(["mord", "rule"], [], options);
    const size = calculateSize(measurement, options);
    rule.style.marginRight = `${size}em`;
    return rule;
};

// Takes an Options object, and returns the appropriate fontLookup
const retrieveTextFontName = function(
    fontFamily: string,
    fontWeight: string,
    fontShape: string,
): string {
    const baseFontName = retrieveBaseFontName(fontFamily);
    const fontStylesName = retrieveFontStylesName(fontWeight, fontShape);
    return `${baseFontName}-${fontStylesName}`;
};

const retrieveBaseFontName = function(font: string): string {
    let baseFontName = "";
    switch (font) {
        case "amsrm":
            baseFontName = "AMS";
            break;
        case "textrm":
            baseFontName = "Main";
            break;
        case "textsf":
            baseFontName = "SansSerif";
            break;
        case "texttt":
            baseFontName = "Typewriter";
            break;
        default:
            throw new Error(`Invalid font provided: ${font}`);
    }
    return baseFontName;
};

const retrieveFontStylesName = function(
    fontWeight?: string,
    fontShape?: string,
): string {
    let fontStylesName = '';
    if (fontWeight === "textbf") {
        fontStylesName += "Bold";
    }
    if (fontShape === "textit") {
        fontStylesName += "Italic";
    }
    return fontStylesName || "Regular";
};

// A map of spacing functions to their attributes, like size and corresponding
// CSS class
const spacingFunctions: {[string]: {| size: string, className: string |}} = {
    "\\qquad": {
        size: "2em",
        className: "qquad",
    },
    "\\quad": {
        size: "1em",
        className: "quad",
    },
    "\\enspace": {
        size: "0.5em",
        className: "enspace",
    },
    "\\;": {
        size: "0.277778em",
        className: "thickspace",
    },
    "\\:": {
        size: "0.22222em",
        className: "mediumspace",
    },
    "\\,": {
        size: "0.16667em",
        className: "thinspace",
    },
    "\\!": {
        size: "-0.16667em",
        className: "negativethinspace",
    },
};

/**
 * Maps TeX font commands to objects containing:
 * - variant: string used for "mathvariant" attribute in buildMathML.js
 * - fontName: the "style" parameter to fontMetrics.getCharacterMetrics
 */
// A map between tex font commands an MathML mathvariant attribute values
const fontMap: {[string]: {| variant: string, fontName: string |}} = {
    // styles
    "mathbf": {
        variant: "bold",
        fontName: "Main-Bold",
    },
    "mathrm": {
        variant: "normal",
        fontName: "Main-Regular",
    },
    "textit": {
        variant: "italic",
        fontName: "Main-Italic",
    },

    // "mathit" and "boldsymbol" are missing because they require the use of two
    // fonts: Main-Italic and Math-Italic for "mathit", and Math-BoldItalic and
    // Main-Bold for "boldsymbol".  This is handled by a special case in makeOrd
    // which ends up calling mathit and boldsymbol.

    // families
    "mathbb": {
        variant: "double-struck",
        fontName: "AMS-Regular",
    },
    "mathcal": {
        variant: "script",
        fontName: "Caligraphic-Regular",
    },
    "mathfrak": {
        variant: "fraktur",
        fontName: "Fraktur-Regular",
    },
    "mathscr": {
        variant: "script",
        fontName: "Script-Regular",
    },
    "mathsf": {
        variant: "sans-serif",
        fontName: "SansSerif-Regular",
    },
    "mathtt": {
        variant: "monospace",
        fontName: "Typewriter-Regular",
    },
};

const svgData: {
    [string]: ([string, number, number])
} = {
     //   path, width, height
    vec: ["vec", 0.471, 0.714],  // values from the font glyph
};

const staticSvg = function(value: string, options: Options): domTree.span {
    // Create a span with inline SVG for the element.
    const [pathName, width, height] = svgData[value];
    const path = new domTree.pathNode(pathName);
    const svgNode = new domTree.svgNode([path], {
        "width": width + "em",
        "height": height + "em",
        // Override CSS rule `.katex svg { width: 100% }`
        "style": "width:" + width + "em",
        "viewBox": "0 0 " + 1000 * width + " " + 1000 * height,
        "preserveAspectRatio": "xMinYMin",
    });
    const span = makeSpan(["overlay"], [svgNode], options);
    span.height = height;
    span.style.height = height + "em";
    span.style.width = width + "em";
    return span;
};

export default {
    fontMap,
    makeSymbol,
    mathsym,
    makeSpan,
    makeLineSpan,
    makeAnchor,
    makeFragment,
    makeVList,
    makeOrd,
    makeVerb,
    makeGlue,
    staticSvg,
    svgData,
    tryCombineChars,
    spacingFunctions,
};
