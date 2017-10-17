/* eslint no-console:0 */
/**
 * This module contains general functions that can be used for building
 * different kinds of domTree nodes in a consistent manner.
 */

import domTree from "./domTree";
import fontMetrics from "./fontMetrics";
import symbols from "./symbols";
import utils from "./utils";

// The following have to be loaded from Main-Italic font, using class mainit
const mainitLetters = [
    "\\imath",   // dotless i
    "\\jmath",   // dotless j
    "\\pounds",  // pounds symbol
];

/**
 * Looks up the given symbol in fontMetrics, after applying any symbol
 * replacements defined in symbol.js
 */
const lookupSymbol = function(value, fontFamily, mode) {
    // Replace the value with its replaced value from symbol.js
    if (symbols[mode][value] && symbols[mode][value].replace) {
        value = symbols[mode][value].replace;
    }
    return {
        value: value,
        metrics: fontMetrics.getCharacterMetrics(value, fontFamily),
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
 */
const makeSymbol = function(value, fontFamily, mode, options, classes) {
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
            classes);
    } else {
        // TODO(emily): Figure out a good way to only print this in development
        typeof console !== "undefined" && console.warn(
            "No character metrics for '" + value + "' in style '" +
                fontFamily + "'");
        symbolNode = new domTree.symbolNode(value, 0, 0, 0, 0, classes);
    }

    if (options) {
        symbolNode.maxFontSize = options.sizeMultiplier;
        if (options.style.isTight()) {
            symbolNode.classes.push("mtight");
        }
        if (options.getColor()) {
            symbolNode.style.color = options.getColor();
        }
    }

    return symbolNode;
};

/**
 * Makes a symbol in Main-Regular or AMS-Regular.
 * Used for rel, bin, open, close, inner, and punct.
 */
const mathsym = function(value, mode, options, classes) {
    // Decide what font to render the symbol in by its entry in the symbols
    // table.
    // Have a special case for when the value = \ because the \ is used as a
    // textord in unsupported command errors but cannot be parsed as a regular
    // text ordinal and is therefore not present as a symbol in the symbols
    // table for text
    if (value === "\\" || symbols[mode][value].font === "main") {
        return makeSymbol(value, "Main-Regular", mode, options, classes);
    } else {
        return makeSymbol(
            value, "AMS-Regular", mode, options, classes.concat(["amsrm"]));
    }
};

/**
 * Determines which of the two font names (Main-Italic and Math-Italic) and
 * corresponding style tags (mainit or mathit) to use for font "mathit",
 * depending on the symbol.  Use this function instead of fontMap for font
 * "mathit".
 */
const mathit = function(value, mode, options, classes) {
    if (/[0-9]/.test(value.charAt(0)) ||
            // glyphs for \imath and \jmath do not exist in Math-Italic so we
            // need to use Main-Italic instead
            utils.contains(mainitLetters, value)) {
        return {
            fontName: "Main-Italic",
            fontClasses: ["mainit"],
        };
    } else {
        return {
            fontName: "Math-Italic",
            fontClasses: ["mathit"],
        };
    }
};

/**
 * Makes either a mathord or textord in the correct font and color.
 */
const makeOrd = function(group, options, type) {
    const mode = group.mode;
    const value = group.value;

    const classes = ["mord"];
    const fontData = lookupFontData(value, mode, options, classes, type);
    return makeSymbol(value, fontData.fontName, mode, options,
        classes.concat(fontData.fontClasses));
};

/**
 * Looks up the appropriate font for the given arguments.
 */
const lookupFontData = function(value, mode, options, classes, type) {
    let fontLookup;
    if (mode === "text") {
        fontLookup = lookupTextFont(value, mode, options, classes, type);
    } else {
        fontLookup = lookupMathFont(value, mode, options, classes, type);
    }
    return fontLookup;
};

/**
 * Looks up a font for math mode. Math fonts cannot stack, and any font
 * applied will override the previous font. An example would be
 * /mathbf{/mathsf{hi}} which will render a non-bold sans-serif font.
 */
const lookupMathFont = function(value, mode, options, classes, type) {
    let mathFontData = {};
    const fonts = options.fonts;
    if (!fonts.length) {
        mathFontData = lookupDefaultFont(value, mode, options, classes, type);
    } else {
        const font = fonts[fonts.length - 1];
        if (font === "mathit" || utils.contains(mainitLetters, value)) {
            mathFontData = mathit(value, mode, options, classes);
        } else {
            mathFontData.fontName = fontMap[font].fontName;
            mathFontData.fontClasses = [font];
        }
    }
    return mathFontData;
};

/**
 * Looks up a font for text mode. Since text fonts can stack, this behaves
 * differently than math mode. An example of this would be: /textsf{/textbf{hi}}
 * which will render a bold sans-serif font
 */
const lookupTextFont = function(value, mode, options, classes, type) {
    let italicTxt = '';
    let boldTxt = '';
    let fontName = '';
    let font = '';
    const fontClasses = [];
    const fonts = options.fonts;
    fonts.forEach((fontOrStyle) => {
        if (fontOrStyle === 'textit') {
            italicTxt = 'Italic';
            fontClasses.push('textit');
        } else if (fontOrStyle === 'textbf') {
            boldTxt = 'Bold';
            fontClasses.push('textbf');
        } else if (fontMap[fontOrStyle]) {
            fontName = fontMap[fontOrStyle].fontName;
            font = fontOrStyle;
        }
    });
    // If no font was provided, use the default.
    if (!font) {
        const defaultData = lookupDefaultFont(value, mode, options, classes, type);
        fontName = defaultData.fontName;
        font = defaultData.fontClasses[0];
    }
    fontClasses.push(font);
    // If it's bold or italic, strip the "regular part", and add the appropriate
    // Bold/Italic string. An example of this could be SansSerif-Bold.
    if (italicTxt || boldTxt) {
        const baseFont = fontName.split("-")[0];
        fontName = `${baseFont}-${boldTxt}${italicTxt}`;
    }
    return {
        fontName,
        fontClasses,
    };
};

/**
 * Makes a symbol in the default font for mathords and textords.
 */
const lookupDefaultFont = function(value, mode, options, classes, type) {
    const defaultFontData = {};
    if (type === "mathord") {
        const fontLookup = mathit(value, mode, options, classes);
        defaultFontData.fontName = fontLookup.fontName;
        defaultFontData.fontClasses = fontLookup.fontClasses;
    } else if (type === "textord") {
        const font = symbols[mode][value] && symbols[mode][value].font;
        if (font === "ams") {
            defaultFontData.fontName = "AMS-Regular";
            defaultFontData.fontClasses = ["amsrm"];
        } else { // if (font === "main") {
            defaultFontData.fontName = "Main-Regular";
            defaultFontData.fontClasses = ["mathrm"];
        }
    } else {
        throw new Error("unexpected type: " + type + " in mathDefault");
    }
    return defaultFontData;
};

/**
 * Combine as many characters as possible in the given array of characters
 * via their tryCombine method.
 */
const tryCombineChars = function(chars) {
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
const sizeElementFromChildren = function(elem) {
    let height = 0;
    let depth = 0;
    let maxFontSize = 0;

    if (elem.children) {
        for (let i = 0; i < elem.children.length; i++) {
            if (elem.children[i].height > height) {
                height = elem.children[i].height;
            }
            if (elem.children[i].depth > depth) {
                depth = elem.children[i].depth;
            }
            if (elem.children[i].maxFontSize > maxFontSize) {
                maxFontSize = elem.children[i].maxFontSize;
            }
        }
    }

    elem.height = height;
    elem.depth = depth;
    elem.maxFontSize = maxFontSize;
};

/**
 * Makes a span with the given list of classes, list of children, and options.
 *
 * TODO: Ensure that `options` is always provided (currently some call sites
 * don't pass it).
 * TODO: add a separate argument for math class (e.g. `mop`, `mbin`), which
 * should if present come first in `classes`.
 */
const makeSpan = function(classes, children, options) {
    const span = new domTree.span(classes, children, options);

    sizeElementFromChildren(span);

    return span;
};

/**
 * Prepends the given children to the given span, updating height, depth, and
 * maxFontSize.
 */
const prependChildren = function(span, children) {
    span.children = children.concat(span.children);

    sizeElementFromChildren(span);
};

/**
 * Makes a document fragment with the given list of children.
 */
const makeFragment = function(children) {
    const fragment = new domTree.documentFragment(children);

    sizeElementFromChildren(fragment);

    return fragment;
};


// TODO(#939): Uncomment and use VListParam as the type of makeVList's first param.
/*
type VListElem =
    {type: "elem", elem: DomChildNode, marginLeft?: string, marginRight?: string};
type VListKern = {type: "kern", size: number};

// A list of child or kern nodes to be stacked on top of each other (i.e. the
// first element will be at the bottom, and the last at the top).
type VListChild = VListElem | VListKern;

type VListParam = {|
    // Each child contains how much it should be shifted downward.
    positionType: "individualShift",
    children: (VListElem & {shift: number})[],
|} | {|
    // "top": The positionData specifies the topmost point of the vlist (note this
    //        is expected to be a height, so positive values move up).
    // "bottom": The positionData specifies the bottommost point of the vlist (note
    //           this is expected to be a depth, so positive values move down).
    // "shift": The vlist will be positioned such that its baseline is positionData
    //          away from the baseline of the first child. Positive values move
    //          downwards.
    positionType: "top" | "bottom" | "shift",
    positionData: number,
    children: VListChild[],
|} | {|
    // The vlist is positioned so that its baseline is aligned with the baseline
    // of the first child. This is equivalent to "shift" with positionData=0.
    positionType: "firstBaseline",
    children: VListChild[],
|};
*/

/**
 * Makes a vertical list by stacking elements and kerns on top of each other.
 * Allows for many different ways of specifying the positioning method.
 *
 * See parameter documentation on the type documentation above.
 */
const makeVList = function({positionType, positionData, children}, options) {
    let depth;
    let currPos;
    let i;
    if (positionType === "individualShift") {
        const oldChildren = children;
        children = [oldChildren[0]];

        // Add in kerns to the list of children to get each element to be
        // shifted to the correct specified shift
        depth = -oldChildren[0].shift - oldChildren[0].elem.depth;
        currPos = depth;
        for (i = 1; i < oldChildren.length; i++) {
            const diff = -oldChildren[i].shift - currPos -
                oldChildren[i].elem.depth;
            const size = diff -
                (oldChildren[i - 1].elem.height +
                 oldChildren[i - 1].elem.depth);

            currPos = currPos + diff;

            children.push({type: "kern", size: size});
            children.push(oldChildren[i]);
        }
    } else if (positionType === "top") {
        // We always start at the bottom, so calculate the bottom by adding up
        // all the sizes
        let bottom = positionData;
        for (i = 0; i < children.length; i++) {
            if (children[i].type === "kern") {
                bottom -= children[i].size;
            } else {
                bottom -= children[i].elem.height + children[i].elem.depth;
            }
        }
        depth = bottom;
    } else if (positionType === "bottom") {
        depth = -positionData;
    } else if (positionType === "shift") {
        depth = -children[0].elem.depth - positionData;
    } else if (positionType === "firstBaseline") {
        depth = -children[0].elem.depth;
    } else {
        depth = 0;
    }

    // Create a strut that is taller than any list item. The strut is added to
    // each item, where it will determine the item's baseline. Since it has
    // `overflow:hidden`, the strut's top edge will sit on the item's line box's
    // top edge and the strut's bottom edge will sit on the item's baseline,
    // with no additional line-height spacing. This allows the item baseline to
    // be positioned precisely without worrying about font ascent and
    // line-height.
    let pstrutSize = 0;
    for (i = 0; i < children.length; i++) {
        if (children[i].type === "elem") {
            const child = children[i].elem;
            pstrutSize = Math.max(pstrutSize, child.maxFontSize, child.height);
        }
    }
    pstrutSize += 2;
    const pstrut = makeSpan(["pstrut"], []);
    pstrut.style.height = pstrutSize + "em";

    // Create a new list of actual children at the correct offsets
    const realChildren = [];
    let minPos = depth;
    let maxPos = depth;
    currPos = depth;
    for (i = 0; i < children.length; i++) {
        if (children[i].type === "kern") {
            currPos += children[i].size;
        } else {
            const child = children[i].elem;

            const childWrap = makeSpan([], [pstrut, child]);
            childWrap.style.top = (-pstrutSize - currPos - child.depth) + "em";
            if (children[i].marginLeft) {
                childWrap.style.marginLeft = children[i].marginLeft;
            }
            if (children[i].marginRight) {
                childWrap.style.marginRight = children[i].marginRight;
            }

            realChildren.push(childWrap);
            currPos += child.height + child.depth;
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
const makeVerb = function(group, options) {
    let text = group.value.body;
    if (group.value.star) {
        text = text.replace(/ /g, '\u2423');  // Open Box
    } else {
        text = text.replace(/ /g, '\xA0');    // No-Break Space
        // (so that, in particular, spaces don't coalesce)
    }
    return text;
};

// A map of spacing functions to their attributes, like size and corresponding
// CSS class
const spacingFunctions = {
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
const fontMap = {
    // styles
    "mathbf": {
        variant: "bold",
        fontName: "Main-Bold",
    },
    "mathrm": {
        variant: "normal",
        fontName: "Main-Regular",
    },

    // "textit" and "textbf" are missing because they only apply styling to the
    // font and are not fonts by themselves.

    // "mathit" is missing because it requires the use of two fonts: Main-Italic
    // and Math-Italic.  This is handled by a special case in makeOrd which ends
    // up calling mathit.

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

export default {
    fontMap: fontMap,
    makeSymbol: makeSymbol,
    mathsym: mathsym,
    makeSpan: makeSpan,
    makeFragment: makeFragment,
    makeVList: makeVList,
    makeOrd: makeOrd,
    makeVerb: makeVerb,
    tryCombineChars: tryCombineChars,
    prependChildren: prependChildren,
    spacingFunctions: spacingFunctions,
};
