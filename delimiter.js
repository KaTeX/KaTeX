var Options = require("./Options");
var ParseError = require("./ParseError");
var Style = require("./Style");

var domTree = require("./domTree");
var fontMetrics = require("./fontMetrics");
var parseTree = require("./parseTree");
var utils = require("./utils");
var symbols = require("./symbols");
var buildCommon = require("./buildCommon");
var makeSpan = require("./buildCommon").makeSpan;

// Get the metrics for a given symbol and font, after transformation (i.e.
// after following replacement from symbols.js)
var getMetrics = function(symbol, font) {
    if (symbols["math"][symbol] && symbols["math"][symbol].replace) {
        return fontMetrics.getCharacterMetrics(
            symbols["math"][symbol].replace, font);
    } else {
        return fontMetrics.getCharacterMetrics(
            symbol, font);
    }
};

var mathrmSize = function(value, size, mode) {
    return buildCommon.makeText(value, "Size" + size + "-Regular", mode);
};

var styleWrap = function(delim, toStyle, options) {
    var span = makeSpan(["style-wrap", options.style.reset(), toStyle.cls()], [delim]);

    var multiplier = toStyle.sizeMultiplier / options.style.sizeMultiplier;

    span.height *= multiplier;
    span.depth *= multiplier;
    span.maxFontSize = toStyle.sizeMultiplier;

    return span;
};

var makeSmallDelim = function(delim, style, center, options, mode) {
    var text = buildCommon.makeText(delim, "Main-Regular", mode);

    var span = styleWrap(text, style, options);

    if (center) {
        var shift =
            (1 - options.style.sizeMultiplier / style.sizeMultiplier) *
            fontMetrics.metrics.axisHeight;

        span.style.top = shift + "em";
        span.height -= shift;
        span.depth += shift;
    }

    return span;
};

var makeLargeDelim = function(delim, size, center, options, mode) {
    var inner = mathrmSize(delim, size, mode);

    var span = styleWrap(
        makeSpan(["delimsizing", "size" + size],
                 [inner], options.getColor()),
        Style.TEXT, options);

    if (center) {
        var shift = (1 - options.style.sizeMultiplier) *
            fontMetrics.metrics.axisHeight;

        span.style.top = shift + "em";
        span.height -= shift;
        span.depth += shift;
    }

    return span;
};

// Make an inner span with the given offset and in the given font
var makeInner = function(symbol, offset, font, mode) {
    var sizeClass;
    if (font === "Size1-Regular") {
        sizeClass = "size1";
    } else if (font === "Size4-Regular") {
        sizeClass = "size4";
    }

    var inner = makeSpan(
        ["delimsizinginner", sizeClass],
        [makeSpan([], [buildCommon.makeText(symbol, font, mode)])]);

    inner.style.top = offset + "em";
    inner.height -= offset;
    inner.depth += offset;

    return inner;
};

var makeStackedDelim = function(delim, heightTotal, center, options, mode) {
    // There are four parts, the top, a middle, a repeated part, and a bottom.
    var top, middle, repeat, bottom;
    top = repeat = bottom = delim;
    middle = null;
    var font = "Size1-Regular";
    var overlap = false;

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

        // For some reason, the sizes of this one delimiter don't work out
        // right, so we shrink it a bit to make it now add an extraneous
        // repeating part
        if (height + depth <= 1.21) {
            height -= 0.01;
            depth -= 0.01;
        }
    } else if (delim === "|" || delim === "\\vert") {
        overlap = true;
    } else if (delim === "\\|" || delim === "\\Vert") {
        overlap = true;
    } else if (delim === "[" || delim === "\\lbrack") {
        top = "\u23a1";
        repeat = "\u23a2";
        bottom = "\u23a3";
        font = "Size4-Regular";
        overlap = true;
    } else if (delim === "]" || delim === "\\rbrack") {
        top = "\u23a4";
        repeat = "\u23a5";
        bottom = "\u23a6";
        font = "Size4-Regular";
        overlap = true;
    } else if (delim === "\\lfloor") {
        repeat = top = "\u23a2";
        bottom = "\u23a3";
        font = "Size4-Regular";
        overlap = true;
    } else if (delim === "\\lceil") {
        top = "\u23a1";
        repeat = bottom = "\u23a2";
        font = "Size4-Regular";
        overlap = true;
    } else if (delim === "\\rfloor") {
        repeat = top = "\u23a5";
        bottom = "\u23a6";
        font = "Size4-Regular";
        overlap = true;
    } else if (delim === "\\rceil") {
        top = "\u23a4";
        repeat = bottom = "\u23a5";
        font = "Size4-Regular";
        overlap = true;
    } else if (delim === "(") {
        top = "\u239b";
        repeat = "\u239c";
        bottom = "\u239d";
        font = "Size4-Regular";
        overlap = true;
    } else if (delim === ")") {
        top = "\u239e";
        repeat = "\u239f";
        bottom = "\u23a0";
        font = "Size4-Regular";
        overlap = true;
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
    }

    // Get the metrics of the three sections
    var topMetrics = getMetrics(top, font);
    var topHeightTotal = topMetrics.height + topMetrics.depth;
    var repeatMetrics = getMetrics(repeat, font);
    var repeatHeightTotal = repeatMetrics.height + repeatMetrics.depth;
    var bottomMetrics = getMetrics(bottom, font);
    var bottomHeightTotal = bottomMetrics.height + bottomMetrics.depth;
    var middleMetrics, middleHeightTotal;
    if (middle !== null) {
        middleMetrics = getMetrics(middle, font);
        middleHeightTotal = middleMetrics.height + middleMetrics.depth;
    }

    var realHeightTotal = topHeightTotal + bottomHeightTotal;
    if (middle !== null) {
        realHeightTotal += middleHeightTotal;
    }

    while (realHeightTotal < heightTotal) {
        realHeightTotal += repeatHeightTotal;
        if (middle !== null) {
            realHeightTotal += repeatHeightTotal;
        }
    }

    var axisHeight = fontMetrics.metrics.axisHeight;
    if (center) {
        axisHeight *= options.style.sizeMultiplier;
    }
    var height = realHeightTotal / 2 + axisHeight;
    var depth = realHeightTotal / 2 - axisHeight;

    // Keep a list of the inner spans
    var inners = [];

    // Add the top symbol
    inners.push(
        makeInner(top, topMetrics.height - height, font, mode));

    if (middle === null) {
        var repeatHeight = realHeightTotal - topHeightTotal - bottomHeightTotal;
        var symbolCount = Math.ceil(repeatHeight / repeatHeightTotal);

        var overlapAmount;
        if (overlap) {
            // 2 * overlapAmount + repeatHeight =
            // (symbolCount - 1) * (repeatHeightTotal - overlapAmount) +
            //     repeatHeightTotal
            overlapAmount = (symbolCount * repeatHeightTotal -
                                 repeatHeight) / (symbolCount + 1);
        } else {
            overlapAmount = 0;
        }

        // Add repeat symbols until there's only space for the bottom symbol
        var currHeight = height - topHeightTotal + overlapAmount;
        for (var i = 0; i < symbolCount; i++) {
            inners.push(
                makeInner(repeat,
                    repeatMetrics.height - currHeight, font, mode));
            currHeight -= repeatHeightTotal - overlapAmount;
        }
    } else {
        // When there is a middle bit, we need the middle part and two repeated
        // sections

        // Calculate the number of symbols needed for the top and bottom
        // repeated parts
        var topRepeatHeight =
            realHeightTotal / 2 - topHeightTotal - middleHeightTotal / 2;
        var topSymbolCount = Math.ceil(topRepeatHeight / repeatHeightTotal);

        var bottomRepeatHeight =
            realHeightTotal / 2 - topHeightTotal - middleHeightTotal / 2;
        var bottomSymbolCount =
            Math.ceil(bottomRepeatHeight / repeatHeightTotal);

        // Add the top repeated part
        var currHeight = height - topHeightTotal;
        for (var i = 0; i < topSymbolCount; i++) {
            inners.push(
                makeInner(repeat,
                    repeatMetrics.height - currHeight, font, mode));
            currHeight -= repeatHeightTotal;
        }

        // Add the middle piece
        var midPoint = realHeightTotal / 2 - depth;
        inners.push(
            makeInner(middle,
                      middleMetrics.height - midPoint - middleHeightTotal / 2,
                      font, mode));

        // Add the bottom repeated part
        currHeight = midPoint - middleHeightTotal / 2;
        for (var i = 0; i < bottomSymbolCount; i++) {
            inners.push(
                makeInner(repeat,
                    repeatMetrics.height - currHeight, font, mode));
            currHeight -= repeatHeightTotal;
        }
    }

    // Add the bottom symbol
    inners.push(
        makeInner(bottom, depth - bottomMetrics.depth, font, mode));

    var fixIE = makeSpan(["fix-ie"], [new domTree.textNode("\u00a0")]);
    inners.push(fixIE);

    return styleWrap(
        makeSpan(["delimsizing", "mult"], inners, options.getColor()),
        Style.TEXT, options);
};

var normalDelimiters = [
    "(", ")", "[", "\\lbrack", "]", "\\rbrack",
    "\\{", "\\lbrace", "\\}", "\\rbrace",
    "\\lfloor", "\\rfloor", "\\lceil", "\\rceil",
    "<", ">", "\\langle", "\\rangle", "/", "\\backslash"
];

var stackDelimiters = [
    "\\uparrow", "\\downarrow", "\\updownarrow",
    "\\Uparrow", "\\Downarrow", "\\Updownarrow",
    "|", "\\|", "\\vert", "\\Vert"
];

var onlyNormalDelimiters = [
    "<", ">", "\\langle", "\\rangle", "/", "\\backslash"
];

// Metrics of the different sizes. Found by looking at TeX's output of
// $\bigl| \Bigl| \biggl| \Biggl| \showlists$
var sizeToMaxHeight = [0, 1.2, 1.8, 2.4, 3.0];

var makeSizedDelim = function(delim, size, options, mode) {
    if (delim === "<") {
        delim = "\\langle";
    } else if (delim === ">") {
        delim = "\\rangle";
    }

    var retDelim;

    if (utils.contains(normalDelimiters, delim)) {
        return makeLargeDelim(delim, size, false, options, mode);
    } else if (utils.contains(stackDelimiters, delim)) {
        return makeStackedDelim(
            delim, sizeToMaxHeight[size], false, options, mode);
    } else {
        throw new ParseError("Illegal delimiter: '" + delim + "'");
    }
};

var normalDelimiterSequence = [
    {type: "small", style: Style.SCRIPTSCRIPT},
    {type: "small", style: Style.SCRIPT},
    {type: "small", style: Style.TEXT},
    {type: "large", size: 1},
    {type: "large", size: 2},
    {type: "large", size: 3},
    {type: "large", size: 4}
];

var stackAlwaysDelimiterSequence = [
    {type: "small", style: Style.SCRIPTSCRIPT},
    {type: "small", style: Style.SCRIPT},
    {type: "small", style: Style.TEXT},
    {type: "stack"}
];

var stackLargeDelimiterSequence = [
    {type: "small", style: Style.SCRIPTSCRIPT},
    {type: "small", style: Style.SCRIPT},
    {type: "small", style: Style.TEXT},
    {type: "large", size: 1},
    {type: "large", size: 2},
    {type: "large", size: 3},
    {type: "large", size: 4},
    {type: "stack"}
];

var delimTypeToFont = function(type) {
    if (type.type === "small") {
        return "Main-Regular";
    } else if (type.type === "large") {
        return "Size" + type.size + "-Regular";
    } else if (type.type === "stack") {
        return "Size4-Regular";
    }
};

var traverseSequence = function(delim, height, sequence, options) {
    // Here, we choose the index we should start at in the sequences. In smaller
    // sizes (which correspond to larger numbers in style.size) we start earlier
    // in the sequence. Thus, scriptscript starts at index 3-3=0, script starts
    // at index 3-2=1, text starts at 3-1=2, and display starts at min(2,3-0)=2
    var start = Math.min(2, 3 - options.style.size);
    for (var i = start; i < sequence.length; i++) {
        if (sequence[i].type === "stack") {
            // This is always the last delimiter, so we just break the loop now.
            break;
        }

        var metrics = getMetrics(delim, delimTypeToFont(sequence[i]));

        var heightDepth = metrics.height + metrics.depth;

        if (sequence[i].type === "small") {
            heightDepth *= sequence[i].style.sizeMultiplier;
        }

        if (heightDepth > height) {
            return sequence[i];
        }
    }

    return sequence[sequence.length - 1];
};

var makeCustomSizedDelim = function(delim, height, center, options, mode) {
    if (delim === "<") {
        delim = "\\langle";
    } else if (delim === ">") {
        delim = "\\rangle";
    }

    var sequence;
    if (utils.contains(onlyNormalDelimiters, delim)) {
        sequence = normalDelimiterSequence;
    } else if (utils.contains(normalDelimiters, delim)) {
        sequence = stackLargeDelimiterSequence;
    } else {
        sequence = stackAlwaysDelimiterSequence;
    }

    var delimType = traverseSequence(delim, height, sequence, options);

    if (delimType.type === "small") {
        return makeSmallDelim(delim, delimType.style, center, options, mode);
    } else if (delimType.type === "large") {
        return makeLargeDelim(delim, delimType.size, center, options, mode);
    } else if (delimType.type === "stack") {
        return makeStackedDelim(delim, height, center, options, mode);
    }
};

var makeLeftRightDelim = function(delim, height, depth, options, mode) {
    var axisHeight =
        fontMetrics.metrics.axisHeight * options.style.sizeMultiplier;

    // Taken from TeX source, tex.web, function make_left_right
    var delimiterFactor = 901;
    var delimiterExtend = 5.0 / fontMetrics.metrics.ptPerEm;

    var maxDistFromAxis = Math.max(
        height - axisHeight, depth + axisHeight);

    var totalHeight = Math.max(
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

    return makeCustomSizedDelim(delim, totalHeight, true, options, mode);
};

module.exports = {
    sizedDelim: makeSizedDelim,
    customSizedDelim: makeCustomSizedDelim,
    leftRightDelim: makeLeftRightDelim
};
