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

const sqrtInnerSVG = {
    // The main path geometry is from glyph U221A in the font KaTeX Main
    main: `<svg viewBox='0 0 400000 1000' preserveAspectRatio='xMinYMin
slice'><path d='M95 622c-2.667 0-7.167-2.667-13.5
-8S72 604 72 600c0-2 .333-3.333 1-4 1.333-2.667 23.833-20.667 67.5-54s
65.833-50.333 66.5-51c1.333-1.333 3-2 5-2 4.667 0 8.667 3.333 12 10l173
378c.667 0 35.333-71 104-213s137.5-285 206.5-429S812 17.333 812 14c5.333
-9.333 12-14 20-14h399166v40H845.272L620 507 385 993c-2.667 4.667-9 7-19
7-6 0-10-1-12-3L160 575l-65 47zM834 0h399166v40H845z'/></svg>`,

    // size1 is from glyph U221A in the font KaTeX_Size1-Regular
    1: `<svg viewBox='0 0 400000 1200' preserveAspectRatio='xMinYMin
slice'><path d='M263 601c.667 0 18 39.667 52 119s68.167
 158.667 102.5 238 51.833 119.333 52.5 120C810 373.333 980.667 17.667 982 11
c4.667-7.333 11-11 19-11h398999v40H1012.333L741 607c-38.667 80.667-84 175-136
 283s-89.167 185.333-111.5 232-33.833 70.333-34.5 71c-4.667 4.667-12.333 7-23
 7l-12-1-109-253c-72.667-168-109.333-252-110-252-10.667 8-22 16.667-34 26-22
 17.333-33.333 26-34 26l-26-26 76-59 76-60zM1001 0h398999v40H1012z'/></svg>`,

    // size2 is from glyph U221A in the font KaTeX_Size2-Regular
    2: `<svg viewBox='0 0 400000 1800' preserveAspectRatio='xMinYMin
slice'><path d='M1001 0h398999v40H1013.084S929.667 308 749
 880s-277 876.333-289 913c-4.667 4.667-12.667 7-24 7h-12c-1.333-3.333-3.667
-11.667-7-25-35.333-125.333-106.667-373.333-214-744-10 12-21 25-33 39l-32 39
c-6-5.333-15-14-27-26l25-30c26.667-32.667 52-63 76-91l52-60 208 722c56-175.333
 126.333-397.333 211-666s153.833-488.167 207.5-658.5C944.167 129.167 975 32.667
 983 10c4-6.667 10-10 18-10zm0 0h398999v40H1013z'/></svg>`,

    // size3 is from glyph U221A in the font KaTeX_Size3-Regular
    3: `<svg viewBox='0 0 400000 2400' preserveAspectRatio='xMinYMin
slice'><path d='M424 2398c-1.333-.667-38.5-172-111.5-514
S202.667 1370.667 202 1370c0-2-10.667 14.333-32 49-4.667 7.333-9.833 15.667
-15.5 25s-9.833 16-12.5 20l-5 7c-4-3.333-8.333-7.667-13-13l-13-13 76-122 77-121
 209 968c0-2 84.667-361.667 254-1079C896.333 373.667 981.667 13.333 983 10
c4-6.667 10-10 18-10h398999v40H1014.622S927.332 418.667 742 1206c-185.333
 787.333-279.333 1182.333-282 1185-2 6-10 9-24 9-8 0-12-.667-12-2z
M1001 0h398999v40H1014z'/></svg>`,

    // size4 is from glyph U221A in the font KaTeX_Size4-Regular
    4: `<svg viewBox='0 0 400000 3000' preserveAspectRatio='xMinYMin
slice'><path d='M473 2713C812.333 913.667 982.333 13 983 11
c3.333-7.333 9.333-11 18-11h399110v40H1017.698S927.168 518 741.5 1506C555.833
 2494 462 2989 460 2991c-2 6-10 9-24 9-8 0-12-.667-12-2s-5.333-32-16-92c-50.667
-293.333-119.667-693.333-207-1200 0-1.333-5.333 8.667-16 30l-32 64-16 33-26-26
 76-153 77-151c.667.667 35.667 202 105 604 67.333 400.667 102 602.667 104 606z
M1001 0h398999v40H1017z'/></svg>`,

    // tall is from glyph U23B7 in the font KaTeX_Size4-Regular
    tall: `l-4 4-4 4c-.667.667-2 1.5-4 2.5s-4.167 1.833-6.5 2.5-5.5 1-9.5 1h
-12l-28-84c-16.667-52-96.667 -294.333-240-727l-212 -643 -85 170c-4-3.333-8.333
-7.667-13 -13l-13-13l77-155 77-156c66 199.333 139 419.667 219 661 l218 661z
M702 0H400000v40H742z'/></svg>`,
};

const sqrtSpan = function(height, delim, options) {
    // Create a span containing an SVG image of a sqrt symbol.
    const span = buildCommon.makeSpan([], [], options);
    let sizeMultiplier = options.sizeMultiplier;  // default

    if (delim.type === "small") {
        // Get an SVG that is derived from glyph U+221A in font KaTeX-Main.
        const newOptions = options.havingBaseStyle(delim.style);
        sizeMultiplier = newOptions.sizeMultiplier / options.sizeMultiplier;

        span.height = 1 * sizeMultiplier;
        span.style.height = span.height + "em";
        span.surdWidth = 0.833 * sizeMultiplier;   // from the font.
        //In the font, the glyph is 1000 units tall. The font scale is 1:1000.

        span.innerHTML = `<svg width='100%' height='${span.height}em'>
            ${sqrtInnerSVG['main']}</svg>`;

    } else if (delim.type === "large") {
        // These SVGs come from fonts: KaTeX_Size1, _Size2, etc.
        // Get sqrt height from font data
        span.height = sizeToMaxHeight[delim.size] / sizeMultiplier;
        span.style.height = span.height + "em";
        span.surdWidth = 1.0 / sizeMultiplier; // from the font

        span.innerHTML = `<svg width="100%" height="${span.height}em">
            ${sqrtInnerSVG[delim.size]}</svg>`;

    } else {
        // Tall sqrt. In TeX, this would be stacked using multiple glyphs.
        // We'll use a single SVG to accomplish the same thing.
        span.height = height / sizeMultiplier;
        span.style.height = span.height + "em";
        span.surdWidth = 1.056 / sizeMultiplier;
        const viewBoxHeight = Math.floor(span.height * 1000); // scale = 1:1000
        const vertSegment = viewBoxHeight - 54;

        // This \sqrt is customized in both height and width. We set the
        // height now. Then CSS will stretch the image to the correct width.
        // This SVG path comes from glyph U+23B7, font KaTeX_Size4-Regular.
        span.innerHTML = `<svg width='100%' height='${span.height}em'>
            <svg viewBox='0 0 400000 ${viewBoxHeight}'
            preserveAspectRatio='xMinYMax slice'>
            <path d='M702 0H400000v40H742v${vertSegment}
            ${sqrtInnerSVG['tall']}</svg>`;
    }

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
        // Get an SVG image for
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
