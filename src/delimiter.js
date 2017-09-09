/**
 * This file deals with creating delimiters of various sizes. The TeXbook
 * discusses these routines on page 441-442, in the "Another subroutine sets box
 * x to a specified variable delimiter" paragraph.
 *
 * There are three main routines here. `makeSmallDelim` makes a delimiter in the
 * normal font, but in either text, script, or scriptscript style.
 * `makeLargeDelim` makes a delimiter in textstyle, but in one of the Size1,
 * Size2, Size3, or Size4 fonts. `makeStackedDelim` makes a delimiter out of
 * smaller pieces that are stacked on top of one another.
 *
 * The functions take a parameter `center`, which determines if the delimiter
 * should be centered around the axis.
 *
 * Then, there are three exposed functions. `sizedDelim` makes a delimiter in
 * one of the given sizes. This is used for things like `\bigl`.
 * `customSizedDelim` makes a delimiter with a given total height+depth. It is
 * called in places like `\sqrt`. `leftRightDelim` makes an appropriate
 * delimiter which surrounds an expression of a given height an depth. It is
 * used in `\left` and `\right`.
 */

import ParseError from "./ParseError";
import Style from "./Style";

import domTree from "./domTree";
import buildCommon, { makeSpan } from "./buildCommon";
import fontMetrics from "./fontMetrics";
import symbols from "./symbols";
import utils from "./utils";

/**
 * Get the metrics for a given symbol and font, after transformation (i.e.
 * after following replacement from symbols.js)
 */
const getMetrics = function(symbol, font) {
    if (symbols.math[symbol] && symbols.math[symbol].replace) {
        return fontMetrics.getCharacterMetrics(
            symbols.math[symbol].replace, font);
    } else {
        return fontMetrics.getCharacterMetrics(
            symbol, font);
    }
};

/**
 * Puts a delimiter span in a given style, and adds appropriate height, depth,
 * and maxFontSizes.
 */
const styleWrap = function(delim, toStyle, options, classes) {
    const newOptions = options.havingBaseStyle(toStyle);

    const span = makeSpan(
        (classes || []).concat(newOptions.sizingClasses(options)),
        [delim], options);

    span.delimSizeMultiplier = newOptions.sizeMultiplier / options.sizeMultiplier;
    span.height *= span.delimSizeMultiplier;
    span.depth *= span.delimSizeMultiplier;
    span.maxFontSize = newOptions.sizeMultiplier;

    return span;
};

const centerSpan = function(span, options, style) {
    const newOptions = options.havingBaseStyle(style);
    const shift =
        (1 - options.sizeMultiplier / newOptions.sizeMultiplier) *
        options.fontMetrics().axisHeight;

    span.classes.push("delimcenter");
    span.style.top = shift + "em";
    span.height -= shift;
    span.depth += shift;
};

/**
 * Makes a small delimiter. This is a delimiter that comes in the Main-Regular
 * font, but is restyled to either be in textstyle, scriptstyle, or
 * scriptscriptstyle.
 */
const makeSmallDelim = function(delim, style, center, options, mode, classes) {
    const text = buildCommon.makeSymbol(delim, "Main-Regular", mode, options);
    const span = styleWrap(text, style, options, classes);
    if (center) {
        centerSpan(span, options, style);
    }
    return span;
};

/**
 * Builds a symbol in the given font size (note size is an integer)
 */
const mathrmSize = function(value, size, mode, options) {
    return buildCommon.makeSymbol(value, "Size" + size + "-Regular",
        mode, options);
};

/**
 * Makes a large delimiter. This is a delimiter that comes in the Size1, Size2,
 * Size3, or Size4 fonts. It is always rendered in textstyle.
 */
const makeLargeDelim = function(delim, size, center, options, mode, classes) {
    const inner = mathrmSize(delim, size, mode, options);
    const span = styleWrap(
        makeSpan(["delimsizing", "size" + size], [inner], options),
        Style.TEXT, options, classes);
    if (center) {
        centerSpan(span, options, Style.TEXT);
    }
    return span;
};

/**
 * Make an inner span with the given offset and in the given font. This is used
 * in `makeStackedDelim` to make the stacking pieces for the delimiter.
 */
const makeInner = function(symbol, font, mode) {
    let sizeClass;
    // Apply the correct CSS class to choose the right font.
    if (font === "Size1-Regular") {
        sizeClass = "delim-size1";
    } else if (font === "Size4-Regular") {
        sizeClass = "delim-size4";
    }

    const inner = makeSpan(
        ["delimsizinginner", sizeClass],
        [makeSpan([], [buildCommon.makeSymbol(symbol, font, mode)])]);

    // Since this will be passed into `makeVList` in the end, wrap the element
    // in the appropriate tag that VList uses.
    return {type: "elem", elem: inner};
};

/**
 * Make a stacked delimiter out of a given delimiter, with the total height at
 * least `heightTotal`. This routine is mentioned on page 442 of the TeXbook.
 */
const makeStackedDelim = function(delim, heightTotal, center, options, mode,
                                classes) {
    // There are four parts, the top, an optional middle, a repeated part, and a
    // bottom.
    let top;
    let middle;
    let repeat;
    let bottom;
    top = repeat = bottom = delim;
    middle = null;
    // Also keep track of what font the delimiters are in
    let font = "Size1-Regular";

    // We set the parts and font based on the symbol. Note that we use
    // '\u23d0' instead of '|' and '\u2016' instead of '\\|' for the
    // repeats of the arrows
    if (delim === "\\uparrow") {
        repeat = bottom = "\u23d0";
    } else if (delim === "\\Uparrow") {
        repeat = bottom = "\u2016";
    } else if (delim === "\\downarrow") {
        top = repeat = "\u23d0";
    } else if (delim === "\\Downarrow") {
        top = repeat = "\u2016";
    } else if (delim === "\\updownarrow") {
        top = "\\uparrow";
        repeat = "\u23d0";
        bottom = "\\downarrow";
    } else if (delim === "\\Updownarrow") {
        top = "\\Uparrow";
        repeat = "\u2016";
        bottom = "\\Downarrow";
    } else if (delim === "[" || delim === "\\lbrack") {
        top = "\u23a1";
        repeat = "\u23a2";
        bottom = "\u23a3";
        font = "Size4-Regular";
    } else if (delim === "]" || delim === "\\rbrack") {
        top = "\u23a4";
        repeat = "\u23a5";
        bottom = "\u23a6";
        font = "Size4-Regular";
    } else if (delim === "\\lfloor") {
        repeat = top = "\u23a2";
        bottom = "\u23a3";
        font = "Size4-Regular";
    } else if (delim === "\\lceil") {
        top = "\u23a1";
        repeat = bottom = "\u23a2";
        font = "Size4-Regular";
    } else if (delim === "\\rfloor") {
        repeat = top = "\u23a5";
        bottom = "\u23a6";
        font = "Size4-Regular";
    } else if (delim === "\\rceil") {
        top = "\u23a4";
        repeat = bottom = "\u23a5";
        font = "Size4-Regular";
    } else if (delim === "(") {
        top = "\u239b";
        repeat = "\u239c";
        bottom = "\u239d";
        font = "Size4-Regular";
    } else if (delim === ")") {
        top = "\u239e";
        repeat = "\u239f";
        bottom = "\u23a0";
        font = "Size4-Regular";
    } else if (delim === "\\{" || delim === "\\lbrace") {
        top = "\u23a7";
        middle = "\u23a8";
        bottom = "\u23a9";
        repeat = "\u23aa";
        font = "Size4-Regular";
    } else if (delim === "\\}" || delim === "\\rbrace") {
        top = "\u23ab";
        middle = "\u23ac";
        bottom = "\u23ad";
        repeat = "\u23aa";
        font = "Size4-Regular";
    } else if (delim === "\\lgroup") {
        top = "\u23a7";
        bottom = "\u23a9";
        repeat = "\u23aa";
        font = "Size4-Regular";
    } else if (delim === "\\rgroup") {
        top = "\u23ab";
        bottom = "\u23ad";
        repeat = "\u23aa";
        font = "Size4-Regular";
    } else if (delim === "\\lmoustache") {
        top = "\u23a7";
        bottom = "\u23ad";
        repeat = "\u23aa";
        font = "Size4-Regular";
    } else if (delim === "\\rmoustache") {
        top = "\u23ab";
        bottom = "\u23a9";
        repeat = "\u23aa";
        font = "Size4-Regular";
    }

    // Get the metrics of the four sections
    const topMetrics = getMetrics(top, font);
    const topHeightTotal = topMetrics.height + topMetrics.depth;
    const repeatMetrics = getMetrics(repeat, font);
    const repeatHeightTotal = repeatMetrics.height + repeatMetrics.depth;
    const bottomMetrics = getMetrics(bottom, font);
    const bottomHeightTotal = bottomMetrics.height + bottomMetrics.depth;
    let middleHeightTotal = 0;
    let middleFactor = 1;
    if (middle !== null) {
        const middleMetrics = getMetrics(middle, font);
        middleHeightTotal = middleMetrics.height + middleMetrics.depth;
        middleFactor = 2; // repeat symmetrically above and below middle
    }

    // Calcuate the minimal height that the delimiter can have.
    // It is at least the size of the top, bottom, and optional middle combined.
    const minHeight = topHeightTotal + bottomHeightTotal + middleHeightTotal;

    // Compute the number of copies of the repeat symbol we will need
    const repeatCount = Math.ceil(
        (heightTotal - minHeight) / (middleFactor * repeatHeightTotal));

    // Compute the total height of the delimiter including all the symbols
    const realHeightTotal =
        minHeight + repeatCount * middleFactor * repeatHeightTotal;

    // The center of the delimiter is placed at the center of the axis. Note
    // that in this context, "center" means that the delimiter should be
    // centered around the axis in the current style, while normally it is
    // centered around the axis in textstyle.
    let axisHeight = options.fontMetrics().axisHeight;
    if (center) {
        axisHeight *= options.sizeMultiplier;
    }
    // Calculate the depth
    const depth = realHeightTotal / 2 - axisHeight;

    // Now, we start building the pieces that will go into the vlist

    // Keep a list of the inner pieces
    const inners = [];

    // Add the bottom symbol
    inners.push(makeInner(bottom, font, mode));

    if (middle === null) {
        // Add that many symbols
        for (let i = 0; i < repeatCount; i++) {
            inners.push(makeInner(repeat, font, mode));
        }
    } else {
        // When there is a middle bit, we need the middle part and two repeated
        // sections
        for (let i = 0; i < repeatCount; i++) {
            inners.push(makeInner(repeat, font, mode));
        }
        inners.push(makeInner(middle, font, mode));
        for (let i = 0; i < repeatCount; i++) {
            inners.push(makeInner(repeat, font, mode));
        }
    }

    // Add the top symbol
    inners.push(makeInner(top, font, mode));

    // Finally, build the vlist
    const newOptions = options.havingBaseStyle(Style.TEXT);
    const inner = buildCommon.makeVList(inners, "bottom", depth, newOptions);

    return styleWrap(
        makeSpan(["delimsizing", "mult"], [inner], newOptions),
        Style.TEXT, options, classes);
};

const sqrtSvg = function(sqrtName, height, viewBoxHeight, options) {
    let alternate;
    if (sqrtName === "sqrtTall") {
        // sqrtTall is from glyph U23B7 in the font KaTeX_Size4-Regular
        // One path edge has a variable length. It runs from the viniculumn
        // to a point near (14 units) the bottom of the surd. The viniculum
        // is 40 units thick. So the length of the line in question is:
        const vertSegment = viewBoxHeight - 54;
        alternate = `M702 0H400000v40H742v${vertSegment}l-4 4-4 4c-.667.667
-2 1.5-4 2.5s-4.167 1.833-6.5 2.5-5.5 1-9.5 1h-12l-28-84c-16.667-52-96.667
-294.333-240-727l-212 -643 -85 170c-4-3.333-8.333-7.667-13 -13l-13-13l77-155
 77-156c66 199.333 139 419.667 219 661 l218 661zM702 0H400000v40H742z`;
    }
    const pathNode = new domTree.pathNode(sqrtName, alternate);

    let attributes = [["width", "100%"], ["height", height + "em"]];
    attributes.push(["viewBox", "0 0 400000 " + viewBoxHeight]);
    attributes.push(["preserveAspectRatio", "xMinYMin slice"]);
    const innerSVG =  new domTree.svgNode([pathNode], attributes);

    attributes = [["width", "100%"], ["height", height + "em"]];
    const svg = new domTree.svgNode([innerSVG], attributes);
    return buildCommon.makeSpan([], [svg], options);
};

const sqrtSpan = function(height, delim, options) {
    // Create a span containing an SVG image of a sqrt symbol.
    let span;
    let sizeMultiplier = options.sizeMultiplier;  // default
    let spanHeight;
    let viewBoxHeight;

    if (delim.type === "small") {
        // Get an SVG that is derived from glyph U+221A in font KaTeX-Main.
        viewBoxHeight = 1000;  // from font
        const newOptions = options.havingBaseStyle(delim.style);
        sizeMultiplier = newOptions.sizeMultiplier / options.sizeMultiplier;
        spanHeight = 1 * sizeMultiplier;
        span = sqrtSvg("sqrtMain", spanHeight, viewBoxHeight, options);
        span.surdWidth = 0.833 * sizeMultiplier;   // from the font.

    } else if (delim.type === "large") {
        // These SVGs come from fonts: KaTeX_Size1, _Size2, etc.
        viewBoxHeight = 1000 * sizeToMaxHeight[delim.size];
        spanHeight = sizeToMaxHeight[delim.size] / sizeMultiplier;
        span = sqrtSvg("sqrtSize" + delim.size, spanHeight, viewBoxHeight, options);
        span.surdWidth = 1.0 / sizeMultiplier; // from the font

    } else {
        // Tall sqrt. In TeX, this would be stacked using multiple glyphs.
        // We'll use a single SVG to accomplish the same thing.
        spanHeight = height / sizeMultiplier;
        viewBoxHeight = Math.floor(1000 * spanHeight);
        span = sqrtSvg("sqrtTall", spanHeight, viewBoxHeight, options);
        span.surdWidth = 1.056 / sizeMultiplier;
    }

    span.height = spanHeight;
    span.style.height = spanHeight + "em";
    span.sizeMultiplier = sizeMultiplier;

    return span;
};

// There are three kinds of delimiters, delimiters that stack when they become
// too large
const stackLargeDelimiters = [
    "(", ")", "[", "\\lbrack", "]", "\\rbrack",
    "\\{", "\\lbrace", "\\}", "\\rbrace",
    "\\lfloor", "\\rfloor", "\\lceil", "\\rceil",
    "\\surd",
];

// delimiters that always stack
const stackAlwaysDelimiters = [
    "\\uparrow", "\\downarrow", "\\updownarrow",
    "\\Uparrow", "\\Downarrow", "\\Updownarrow",
    "|", "\\|", "\\vert", "\\Vert",
    "\\lvert", "\\rvert", "\\lVert", "\\rVert",
    "\\lgroup", "\\rgroup", "\\lmoustache", "\\rmoustache",
];

// and delimiters that never stack
const stackNeverDelimiters = [
    "<", ">", "\\langle", "\\rangle", "/", "\\backslash", "\\lt", "\\gt",
];

// Metrics of the different sizes. Found by looking at TeX's output of
// $\bigl| // \Bigl| \biggl| \Biggl| \showlists$
// Used to create stacked delimiters of appropriate sizes in makeSizedDelim.
const sizeToMaxHeight = [0, 1.2, 1.8, 2.4, 3.0];

/**
 * Used to create a delimiter of a specific size, where `size` is 1, 2, 3, or 4.
 */
const makeSizedDelim = function(delim, size, options, mode, classes) {
    // < and > turn into \langle and \rangle in delimiters
    if (delim === "<" || delim === "\\lt") {
        delim = "\\langle";
    } else if (delim === ">" || delim === "\\gt") {
        delim = "\\rangle";
    }

    // Sized delimiters are never centered.
    if (utils.contains(stackLargeDelimiters, delim) ||
        utils.contains(stackNeverDelimiters, delim)) {
        return makeLargeDelim(delim, size, false, options, mode, classes);
    } else if (utils.contains(stackAlwaysDelimiters, delim)) {
        return makeStackedDelim(
            delim, sizeToMaxHeight[size], false, options, mode, classes);
    } else {
        throw new ParseError("Illegal delimiter: '" + delim + "'");
    }
};

/**
 * There are three different sequences of delimiter sizes that the delimiters
 * follow depending on the kind of delimiter. This is used when creating custom
 * sized delimiters to decide whether to create a small, large, or stacked
 * delimiter.
 *
 * In real TeX, these sequences aren't explicitly defined, but are instead
 * defined inside the font metrics. Since there are only three sequences that
 * are possible for the delimiters that TeX defines, it is easier to just encode
 * them explicitly here.
 */

// Delimiters that never stack try small delimiters and large delimiters only
const stackNeverDelimiterSequence = [
    {type: "small", style: Style.SCRIPTSCRIPT},
    {type: "small", style: Style.SCRIPT},
    {type: "small", style: Style.TEXT},
    {type: "large", size: 1},
    {type: "large", size: 2},
    {type: "large", size: 3},
    {type: "large", size: 4},
];

// Delimiters that always stack try the small delimiters first, then stack
const stackAlwaysDelimiterSequence = [
    {type: "small", style: Style.SCRIPTSCRIPT},
    {type: "small", style: Style.SCRIPT},
    {type: "small", style: Style.TEXT},
    {type: "stack"},
];

// Delimiters that stack when large try the small and then large delimiters, and
// stack afterwards
const stackLargeDelimiterSequence = [
    {type: "small", style: Style.SCRIPTSCRIPT},
    {type: "small", style: Style.SCRIPT},
    {type: "small", style: Style.TEXT},
    {type: "large", size: 1},
    {type: "large", size: 2},
    {type: "large", size: 3},
    {type: "large", size: 4},
    {type: "stack"},
];

/**
 * Get the font used in a delimiter based on what kind of delimiter it is.
 */
const delimTypeToFont = function(type) {
    if (type.type === "small") {
        return "Main-Regular";
    } else if (type.type === "large") {
        return "Size" + type.size + "-Regular";
    } else if (type.type === "stack") {
        return "Size4-Regular";
    }
};

/**
 * Traverse a sequence of types of delimiters to decide what kind of delimiter
 * should be used to create a delimiter of the given height+depth.
 */
const traverseSequence = function(delim, height, sequence, options) {
    // Here, we choose the index we should start at in the sequences. In smaller
    // sizes (which correspond to larger numbers in style.size) we start earlier
    // in the sequence. Thus, scriptscript starts at index 3-3=0, script starts
    // at index 3-2=1, text starts at 3-1=2, and display starts at min(2,3-0)=2
    const start = Math.min(2, 3 - options.style.size);
    for (let i = start; i < sequence.length; i++) {
        if (sequence[i].type === "stack") {
            // This is always the last delimiter, so we just break the loop now.
            break;
        }

        const metrics = getMetrics(delim, delimTypeToFont(sequence[i]));
        let heightDepth = metrics.height + metrics.depth;

        // Small delimiters are scaled down versions of the same font, so we
        // account for the style change size.

        if (sequence[i].type === "small") {
            const newOptions = options.havingBaseStyle(sequence[i].style);
            heightDepth *= newOptions.sizeMultiplier;
        }

        // Check if the delimiter at this size works for the given height.
        if (heightDepth > height) {
            return sequence[i];
        }
    }

    // If we reached the end of the sequence, return the last sequence element.
    return sequence[sequence.length - 1];
};

/**
 * Make a delimiter of a given height+depth, with optional centering. Here, we
 * traverse the sequences, and create a delimiter that the sequence tells us to.
 */
const makeCustomSizedDelim = function(delim, height, center, options, mode,
                                    classes) {
    if (delim === "<" || delim === "\\lt") {
        delim = "\\langle";
    } else if (delim === ">" || delim === "\\gt") {
        delim = "\\rangle";
    }

    // Decide what sequence to use
    let sequence;
    if (utils.contains(stackNeverDelimiters, delim)) {
        sequence = stackNeverDelimiterSequence;
    } else if (utils.contains(stackLargeDelimiters, delim)) {
        sequence = stackLargeDelimiterSequence;
    } else {
        sequence = stackAlwaysDelimiterSequence;
    }

    // Look through the sequence
    const delimType = traverseSequence(delim, height, sequence, options);

    if (delim === "\\surd") {
        // Get an SVG image
        return sqrtSpan(height, delimType, options);
    } else {
        // Get the delimiter from font glyphs.
        // Depending on the sequence element we decided on, call the
        // appropriate function.
        if (delimType.type === "small") {
            return makeSmallDelim(delim, delimType.style, center, options,
                                  mode, classes);
        } else if (delimType.type === "large") {
            return makeLargeDelim(delim, delimType.size, center, options, mode,
                                  classes);
        } else if (delimType.type === "stack") {
            return makeStackedDelim(delim, height, center, options, mode,
                                    classes);
        }
    }
};

/**
 * Make a delimiter for use with `\left` and `\right`, given a height and depth
 * of an expression that the delimiters surround.
 */
const makeLeftRightDelim = function(delim, height, depth, options, mode,
                                  classes) {
    // We always center \left/\right delimiters, so the axis is always shifted
    const axisHeight =
        options.fontMetrics().axisHeight * options.sizeMultiplier;

    // Taken from TeX source, tex.web, function make_left_right
    const delimiterFactor = 901;
    const delimiterExtend = 5.0 / options.fontMetrics().ptPerEm;

    const maxDistFromAxis = Math.max(
        height - axisHeight, depth + axisHeight);

    const totalHeight = Math.max(
        // In real TeX, calculations are done using integral values which are
        // 65536 per pt, or 655360 per em. So, the division here truncates in
        // TeX but doesn't here, producing different results. If we wanted to
        // exactly match TeX's calculation, we could do
        //   Math.floor(655360 * maxDistFromAxis / 500) *
        //    delimiterFactor / 655360
        // (To see the difference, compare
        //    x^{x^{\left(\rule{0.1em}{0.68em}\right)}}
        // in TeX and KaTeX)
        maxDistFromAxis / 500 * delimiterFactor,
        2 * maxDistFromAxis - delimiterExtend);

    // Finally, we defer to `makeCustomSizedDelim` with our calculated total
    // height
    return makeCustomSizedDelim(delim, totalHeight, true, options, mode,
                                classes);
};

module.exports = {
    sizedDelim: makeSizedDelim,
    customSizedDelim: makeCustomSizedDelim,
    leftRightDelim: makeLeftRightDelim,
};
