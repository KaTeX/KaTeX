// @flow
/* eslint no-console:0 */
/**
 * This module contains general functions that can be used for building
 * different kinds of domTree nodes in a consistent manner.
 */

import {SymbolNode, Anchor, Span, PathNode, SvgNode, createClass} from "./domTree";
import {getCharacterMetrics} from "./fontMetrics";
import symbols, {ligatures} from "./symbols";
import {wideCharacterFont} from "./wide-character";
import {calculateSize} from "./units";
import {DocumentFragment} from "./tree";

import type Options from "./Options";
import type {ParseNode} from "./parseNode";
import type {CharacterMetrics} from "./fontMetrics";
import type {FontVariant, Mode} from "./types";
import type {documentFragment as HtmlDocumentFragment} from "./domTree";
import type {HtmlDomNode, DomSpan, SvgSpan, CssStyle} from "./domTree";
import type {Measurement} from "./units";

/**
 * Looks up the given symbol in fontMetrics, after applying any symbol
 * replacements defined in symbol.js
 */
const lookupSymbol = function(
    value: string,
    // TODO(#963): Use a union type for this.
    fontName: string,
    mode: Mode,
): {value: string, metrics: ?CharacterMetrics} {
    // Replace the value with its replaced value from symbol.js
    if (symbols[mode][value] && symbols[mode][value].replace) {
        value = symbols[mode][value].replace;
    }
    return {
        value: value,
        metrics: getCharacterMetrics(value, fontName, mode),
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
    fontName: string,
    mode: Mode,
    options?: Options,
    classes?: string[],
): SymbolNode {
    const lookup = lookupSymbol(value, fontName, mode);
    const metrics = lookup.metrics;
    value = lookup.value;

    let symbolNode;
    if (metrics) {
        let italic = metrics.italic;
        if (mode === "text" || (options && options.font === "mathit")) {
            italic = 0;
        }
        symbolNode = new SymbolNode(
            value, metrics.height, metrics.depth, italic, metrics.skew,
            metrics.width, classes);
    } else {
        // TODO(emily): Figure out a good way to only print this in development
        typeof console !== "undefined" && console.warn("No character metrics " +
            `for '${value}' in style '${fontName}' and mode '${mode}'`);
        symbolNode = new SymbolNode(value, 0, 0, 0, 0, 0, classes);
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
 */
const mathsym = function(
    value: string,
    mode: Mode,
    options: Options,
    classes?: string[] = [],
): SymbolNode {
    // Decide what font to render the symbol in by its entry in the symbols
    // table.
    // Have a special case for when the value = \ because the \ is used as a
    // textord in unsupported command errors but cannot be parsed as a regular
    // text ordinal and is therefore not present as a symbol in the symbols
    // table for text, as well as a special case for boldsymbol because it
    // can be used for bold + and -
    if (options.font === "boldsymbol" &&
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
    type: "mathord" | "textord",
): {| fontName: string, fontClass: string |} {
    if (type !== "textord" &&
        lookupSymbol(value, "Math-BoldItalic", mode).metrics) {
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
const makeOrd = function<NODETYPE: "spacing" | "mathord" | "textord">(
    group: ParseNode<NODETYPE>,
    options: Options,
    type: "mathord" | "textord",
): HtmlDocumentFragment | SymbolNode {
    const mode = group.mode;
    const text = group.text;

    const classes = ["mord"];

    // Math mode or Old font (i.e. \rm)
    const isFont = mode === "math" || (mode === "text" && options.font);
    const fontOrFamily = isFont ? options.font : options.fontFamily;
    if (text.charCodeAt(0) === 0xD835) {
        // surrogate pairs get special treatment
        const [wideFontName, wideFontClass] = wideCharacterFont(text, mode);
        return makeSymbol(text, wideFontName, mode, options,
            classes.concat(wideFontClass));
    } else if (fontOrFamily) {
        let fontName;
        let fontClasses;
        if (fontOrFamily === "boldsymbol") {
            const fontData = boldsymbol(text, mode, options, classes, type);
            fontName = fontData.fontName;
            fontClasses = [fontData.fontClass];
        } else if (isFont) {
            fontName = fontMap[fontOrFamily].fontName;
            fontClasses = [fontOrFamily];
        } else {
            fontName = retrieveTextFontName(fontOrFamily, options.fontWeight,
                                            options.fontShape);
            fontClasses = [fontOrFamily, options.fontWeight, options.fontShape];
        }

        if (lookupSymbol(text, fontName, mode).metrics) {
            return makeSymbol(text, fontName, mode, options,
                classes.concat(fontClasses));
        } else if (ligatures.hasOwnProperty(text) &&
                   fontName.substr(0, 10) === "Typewriter") {
            // Deconstruct ligatures in monospace fonts (\texttt, \tt).
            const parts = [];
            for (let i = 0; i < text.length; i++) {
                parts.push(makeSymbol(text[i], fontName, mode, options,
                                      classes.concat(fontClasses)));
            }
            return makeFragment(parts);
        }
    }

    // Makes a symbol in the default font for mathords and textords.
    if (type === "mathord") {
        return makeSymbol(text, "Math-Italic", mode, options,
            classes.concat(["mathnormal"]));
    } else if (type === "textord") {
        const font = symbols[mode][text] && symbols[mode][text].font;
        if (font === "ams") {
            const fontName = retrieveTextFontName("amsrm", options.fontWeight,
                  options.fontShape);
            return makeSymbol(
                text, fontName, mode, options,
                classes.concat("amsrm", options.fontWeight, options.fontShape));
        } else if (font === "main" || !font) {
            const fontName = retrieveTextFontName("textrm", options.fontWeight,
                  options.fontShape);
            return makeSymbol(
                text, fontName, mode, options,
                classes.concat(options.fontWeight, options.fontShape));
        } else { // fonts added by plugins
            const fontName = retrieveTextFontName(font, options.fontWeight,
                  options.fontShape);
            // We add font name as a css class
            return makeSymbol(
                text, fontName, mode, options,
                classes.concat(fontName, options.fontWeight, options.fontShape));
        }
    } else {
        throw new Error("unexpected type: " + type + " in makeOrd");
    }
};

/**
 * Returns true if subsequent symbolNodes have the same classes, skew, maxFont,
 * and styles.
 */
const canCombine = (prev: SymbolNode, next: SymbolNode) => {
    if (createClass(prev.classes) !== createClass(next.classes)
        || prev.skew !== next.skew
        || prev.maxFontSize !== next.maxFontSize) {
        return false;
    }

    // If prev and next both are just "mbin"s or "mord"s we don't combine them
    // so that the proper spacing can be preserved.
    if (prev.classes.length === 1) {
        const cls = prev.classes[0];
        if (cls === "mbin" || cls === "mord") {
            return false;
        }
    }

    for (const style in prev.style) {
        if (prev.style.hasOwnProperty(style)
            && prev.style[style] !== next.style[style]) {
            return false;
        }
    }

    for (const style in next.style) {
        if (next.style.hasOwnProperty(style)
            && prev.style[style] !== next.style[style]) {
            return false;
        }
    }

    return true;
};

/**
 * Combine consecutive domTree.symbolNodes into a single symbolNode.
 * Note: this function mutates the argument.
 */
const tryCombineChars = (chars: HtmlDomNode[]): HtmlDomNode[] => {
    for (let i = 0; i < chars.length - 1; i++) {
        const prev = chars[i];
        const next = chars[i + 1];
        if (prev instanceof SymbolNode
            && next instanceof SymbolNode
            && canCombine(prev, next)) {

            prev.text += next.text;
            prev.height = Math.max(prev.height, next.height);
            prev.depth = Math.max(prev.depth, next.depth);
            // Use the last character's italic correction since we use
            // it to add padding to the right of the span created from
            // the combined characters.
            prev.italic = next.italic;
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
    elem: DomSpan | Anchor | HtmlDocumentFragment,
) {
    let height = 0;
    let depth = 0;
    let ascent = 0;
    let descent = 0;
    let maxFontSize = 0;

    for (let i = 0; i < elem.children.length; i++) {
        const child = elem.children[i];
        if (child.height > height) {
            height = child.height;
        }
        if (child.depth > depth) {
            depth = child.depth;
        }
        if (child.ascent && child.ascent > ascent) {
            ascent = child.ascent;
        }
        if (child.descent && child.descent > descent) {
            descent = child.descent;
        }
        if (child.maxFontSize > maxFontSize) {
            maxFontSize = child.maxFontSize;
        }
    }

    elem.height = height;
    elem.depth = depth;
    elem.ascent = ascent;
    elem.descent = descent;
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
    children?: HtmlDomNode[],
    options?: Options,
    style?: CssStyle,
): DomSpan {
    const span = new Span(classes, children, options, style);

    sizeElementFromChildren(span);

    return span;
};

// SVG one is simpler -- doesn't require height, depth, max-font setting.
// This is also a separate method for typesafety.
const makeSvgSpan = (
    classes?: string[],
    children?: SvgNode[],
    options?: Options,
    style?: CssStyle,
): SvgSpan => new Span(classes, children, options, style);

const makeLineSpan = function(
    classes: string[],
    options: Options,
    thickness?: number,
): DomSpan {
    const line = makeSpan(classes, [], options);
    line.height = Math.max(
        thickness || options.fontMetrics().defaultRuleThickness,
        options.minRuleThickness,
    );
    line.ascent = line.height;
    line.style.borderBottomWidth = line.height + "em";
    line.maxFontSize = 1.0;
    line.depth = 0;
    line.descent = 0;
    return line;
};

/**
 * Makes an anchor with the given href, list of classes, list of children,
 * and options.
 */
const makeAnchor = function(
    href: string,
    classes: string[],
    children: HtmlDomNode[],
    options: Options,
): Anchor {
    const anchor = new Anchor(href, classes, children, options);

    sizeElementFromChildren(anchor);

    return anchor;
};

/**
 * Makes a document fragment with the given list of children.
 */
const makeFragment = function(
    children: HtmlDomNode[],
): HtmlDocumentFragment {
    const fragment = new DocumentFragment(children);

    sizeElementFromChildren(fragment);

    return fragment;
};

/**
 * Wraps group in a span if it's a document fragment, allowing to apply classes
 * and styles
 */
const wrapFragment = function(
    group: HtmlDomNode,
    options: Options,
): HtmlDomNode {
    if (group instanceof DocumentFragment) {
        return makeSpan([], [group], options);
    }
    return group;
};


/*
 * KaTeX vertical alignment emulates TeX. KaTeX, like TeX, knows the height and
 * depth of each glyph and uses that information to accurately place accents,
 * fraction bars, etc. But KaTeX must work within HTML constraints.
 *
 * HTML vertical alignment of text is done via an inline formatting context.
 * Ref: https://drafts.csswg.org/css-inline-3/#inline-formatting-context
 *
 * In brief, that means that HTML does not stack glyphs; it stacks line boxes.
 * The top of a line box is the top of a font’s ascent metric, aka sTypoAscender.
 * The box bottom is the bottom of a font’s descent metric, aka sTypoDescender.
 * The ascent and descent are the same for every glyph in the font.
 * Ref: https://drafts.csswg.org/css-inline-3/#ascent-descent
 * You can find sTypoAscender with https://opentype.js.org/font-inspector.html
 *
 * Below is a sketch of the KaTeX font’s line box with a few KaTeX glyphs.
 *
 *                                   ┏━━━━
 *                                   ┃
 *      ┌────────────────────────────╂──────┐     Font ascent  = 0.8 em
 *      │ ┃      ┃                   ┃      │     Font descent = 0.2 em
 *      │ ┃      ┃          ━━━━━━   ┃      │     H height = 0.683 em
 *      │ ┣━━━━━━┫  ╻    ╻           ┃      │     y height = 0.431 em
 *      │ ┃      ┃  ┃    ┃           ┃      │     y depth  = 0.204 em
 *      │ ┃      ┃  ╰━━━━┫           ┃      │     macron height  = 0.59 em
 *      ├─┸──────┸───────╂───────────╂──────┤     Size2 [ height = 1.15 em
 *      │                ┃           ┃      │     Size2 [ depth  = 0.65 em
 *      └────────────━━━━╯───────────╂──────┘
 *       not to scale                ┃
 *                                   ┃
 *                                   ┗━━━━
 *
 * KaTeX does vertical alignment by stacking line boxes inside a CSS flexbox.
 * Inside the flexbox, we set CSS line-height to 1.0, so we can ignore "leading".
 *
 * Most glpyhs are shorter than the line box. When these boxes are stacked, we
 * compensate by applying negative margin-top to the lower element.
 * A few glyphs are taller than the line box. For these, we compensate via
 * positive margin-top.
 */

// These are exact object types to catch typos in the names of the optional fields.
export type VListElem = {|
    type: "elem",
    elem: HtmlDomNode,
    wrapperClasses?: string[],
    wrapperStyle?: CssStyle,
|};
type VListElemAndShift = {|
    type: "elem",
    elem: HtmlDomNode,
    shift: number,
    wrapperClasses?: string[],
    wrapperStyle?: CssStyle,
|};
type VListKern = {| type: "kern", size: number |};

// A list of child or kern nodes to be stacked on top of each other.
// Order of input: Start at the top and work down.
//     Exception:  List may be in any order if positionType == "individualShift".
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
    //          away from the baseline of the last child which MUST be an
    //          "elem". Positive values move downwards.
    positionType: "top" | "bottom" | "shift",
    positionData: number,
    children: VListChild[],
|} | {|
    // The vlist is positioned so that its baseline is aligned with the baseline
    // of the last child which MUST be an "elem". This is equivalent to "shift"
    // with positionData=0.
    positionType: "firstBaseline",
    children: VListChild[],
|};

const getVListHeight = function(params: VListParam): number[] {
    // A helper function for makeVList.
    // Find the height at the top of the group.
    let overallHeight = 0;
    let iTop = -1;

    if (params.positionType === "individualShift") {
        const children: VListElemAndShift[] = params.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const elemHeight = child.elem.height - child.shift;
            if (elemHeight > overallHeight) {
                overallHeight = elemHeight;
                iTop = i;
            }
        }
        return [overallHeight, iTop];
    }

    const children: VListChild[] = params.children;
    if (params.positionType === "top") {
        overallHeight = params.positionData;
    } else {
        // Sum sizes to find overallHeight.
        let pos = 0;
        let iStart = 0;
        if (params.positionType === "bottom") {
            pos = -params.positionData;
            iStart = children.length - 1;
        } else {
            const lastChild = params.children[children.length - 1];
            if (lastChild.type !== "elem") {
                throw new Error('Last child must have type "elem".');
            } else if (params.positionType === "shift") {
                pos = lastChild.elem.height - params.positionData;
            } else if (params.positionType === "firstBaseline") {
                pos = lastChild.elem.height;
            } else {
                throw new Error(`Invalid positionType ${params.positionType}.`);
            }
            iStart = children.length - 2;
        }
        for (let i = iStart; i >= 0 ; i--) {
            const child = children[i];
            pos += child.type === "kern"
                ? child.size
                : child.elem.height + child.elem.depth;
        }
        overallHeight = pos;
    }

    // Which is the top element? (kerns don't count)
    for (let i = 0; i < children.length; i++) {
        if (children[i].type === "elem") {
            iTop = i;
            break;
        }
    }

    return [overallHeight, iTop]    
};

/**
 * This is the main KaTeX function for setting vertical alignment.
 * Makes a vertical list by creating a CSS vertical flexbox and populating
 * it with DOM elements (boxes).
 * Allows for many different ways of specifying the positioning method.
 *
 * See VListParam documentation above.
 */
const makeVList = function(params: VListParam, options: Options): DomSpan {
    const children = params.children;
    const [overallHeight, iTop] = getVListHeight(params);
    const topElem = children[iTop].elem;
    const overallAscent = overallHeight - topElem.height + topElem.ascent;

    // Track the position of the current TeX group.
    let texPos = overallHeight;
    // We'll start at the top and work down.
    let ceiling = overallAscent;

    let overallDepth = 0;
    let overallBottom = 0;
    let margin = 0;
    const stack: HtmlDomNode[] = [];

    for (const child of children) {
        if (child.type === "kern") {
            texPos -= child.size;
        } else {
            const elem = child.elem;
            const style = child.wrapperStyle || {};
            const classes = child.wrapperClasses || [];
            if (!classes.includes("accent-parent")) {
                classes.push("hbox");
            }
            const hbox = makeSpan(classes, [elem], options, style);
            hbox.style.height = elem.ascent + elem.descent + "em";
            if (child.hasOwnProperty("shift")) {
                margin = ceiling - (-child.shift + elem.ascent);
                texPos = -child.shift - elem.depth;
            }  else {
                const topPadding = elem.ascent - elem.height;
                margin = ceiling - (texPos + topPadding);
                texPos -= elem.height + elem.depth;
            }
            if (Math.abs(margin) > 0.001) {
                hbox.style.marginTop = margin.toFixed(4) + "em";
            }
            stack.push(hbox);
            overallDepth = Math.min(overallDepth, texPos);
            // The box bottom becomes the ceiling for the next box.
            ceiling = texPos + elem.depth - elem.descent;
            overallBottom = Math.min(overallBottom, ceiling);
        }
    }

    // Create the flexbox.
    const vbox = makeSpan(['vbox'], stack, options);
    const verticalAlign = overallAscent - topElem.ascent;
    vbox.style.verticalAlign = verticalAlign.toFixed(4) + "em";
    vbox.height = overallHeight;
    vbox.ascent = overallAscent;
    vbox.depth = -overallDepth;
    vbox.descent = -overallBottom;
    return vbox;
};

// Glue is a concept from TeX which is a flexible space between elements in
// either a vertical or horizontal list. In KaTeX, at least for now, it's
// static space between elements in a horizontal layout.
const makeGlue = (measurement: Measurement, options: Options): DomSpan => {
    // Make an empty span for the space
    const rule = makeSpan(["mspace"], [], options);
    const size = calculateSize(measurement, options);
    rule.style.marginRight = `${size}em`;
    return rule;
};

// Takes font options, and returns the appropriate fontLookup name
const retrieveTextFontName = function(
    fontFamily: string,
    fontWeight: string,
    fontShape: string,
): string {
    let baseFontName = "";
    switch (fontFamily) {
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
            baseFontName = fontFamily; // use fonts added by a plugin
    }

    let fontStylesName;
    if (fontWeight === "textbf" && fontShape === "textit") {
        fontStylesName = "BoldItalic";
    } else if (fontWeight === "textbf") {
        fontStylesName = "Bold";
    } else if (fontWeight === "textit") {
        fontStylesName = "Italic";
    } else {
        fontStylesName = "Regular";
    }

    return `${baseFontName}-${fontStylesName}`;
};

/**
 * Maps TeX font commands to objects containing:
 * - variant: string used for "mathvariant" attribute in buildMathML.js
 * - fontName: the "style" parameter to fontMetrics.getCharacterMetrics
 */
// A map between tex font commands an MathML mathvariant attribute values
const fontMap: {[string]: {| variant: FontVariant, fontName: string |}} = {
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
    "mathit": {
        variant: "italic",
        fontName: "Main-Italic",
    },
    "mathnormal": {
        variant: "italic",
        fontName: "Math-Italic",
    },

    // "boldsymbol" is missing because they require the use of multiple fonts:
    // Math-BoldItalic and Main-Bold.  This is handled by a special case in
    // makeOrd which ends up calling boldsymbol.

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
    vec: ["vec", 0.471, 0.714],                // values from the font glyph
    oiintSize1: ["oiintSize1", 0.957, 0.499],  // oval to overlay the integrand
    oiintSize2: ["oiintSize2", 1.472, 0.659],
    oiiintSize1: ["oiiintSize1", 1.304, 0.499],
    oiiintSize2: ["oiiintSize2", 1.98, 0.659],
};

const staticSvg = function(value: string, options: Options): SvgSpan {
    // Create a span with inline SVG for the element.
    const [pathName, width, height] = svgData[value];
    const path = new PathNode(pathName);
    const svgNode = new SvgNode([path], {
        "width": width + "em",
        "height": height + "em",
        // Override CSS rule `.katex svg { width: 100% }`
        "style": "width:" + width + "em",
        "viewBox": "0 0 " + 1000 * width + " " + 1000 * height,
        "preserveAspectRatio": "xMinYMin",
    });
    const span = makeSvgSpan(["overlay"], [svgNode], options);
    span.height = height;
    span.style.height = height + "em";
    span.style.width = width + "em";
    span.depth = 0;
    span.ascent = height;
    span.descent = 0;
    return span;
};

export default {
    fontMap,
    makeSymbol,
    mathsym,
    makeSpan,
    makeSvgSpan,
    makeLineSpan,
    makeAnchor,
    makeFragment,
    wrapFragment,
    makeVList,
    makeOrd,
    makeGlue,
    staticSvg,
    svgData,
    tryCombineChars,
};
