var domTree = require("./domTree");
var fontMetrics = require("./fontMetrics");
var symbols = require("./symbols");

var makeText = function(value, style, mode) {
    if (symbols[mode][value] && symbols[mode][value].replace) {
        value = symbols[mode][value].replace;
    }

    var metrics = fontMetrics.getCharacterMetrics(value, style);

    if (metrics) {
        var textNode = new domTree.textNode(value, metrics.height,
            metrics.depth);
        if (metrics.italic > 0) {
            var span = makeSpan([], [textNode]);
            span.style.marginRight = metrics.italic + "em";

            return span;
        } else {
            return textNode;
        }
    } else {
        console && console.warn("No character metrics for '" + value +
            "' in style '" + style + "'");
        return new domTree.textNode(value, 0, 0);
    }
};

var mathit = function(value, mode) {
    return makeSpan(["mathit"], [makeText(value, "Math-Italic", mode)]);
};

var mathrm = function(value, mode) {
    if (symbols[mode][value].font === "main") {
        return makeText(value, "Main-Regular", mode);
    } else {
        return makeSpan(["amsrm"], [makeText(value, "AMS-Regular", mode)]);
    }
};

var sizeElementFromChildren = function(elem) {
    var height = 0;
    var depth = 0;
    var maxFontSize = 0;

    if (elem.children) {
        for (var i = 0; i < elem.children.length; i++) {
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

var makeSpan = function(classes, children, color) {
    var span = new domTree.span(classes, children);

    sizeElementFromChildren(span);

    if (color) {
        span.style.color = color;
    }

    return span;
};

var makeFragment = function(children) {
    var fragment = new domTree.documentFragment(children);

    sizeElementFromChildren(fragment);

    return fragment;
};

var makeFontSizer = function(options, fontSize) {
    var fontSizeInner = makeSpan([], [new domTree.textNode("\u200b")]);
    fontSizeInner.style.fontSize = (fontSize / options.style.sizeMultiplier) + "em";

    var fontSizer = makeSpan(
        ["fontsize-ensurer", "reset-" + options.size, "size5"],
        [fontSizeInner]);

    return fontSizer;
};

module.exports = {
    makeText: makeText,
    mathit: mathit,
    mathrm: mathrm,
    makeSpan: makeSpan,
    makeFragment: makeFragment,
    makeFontSizer: makeFontSizer
};
