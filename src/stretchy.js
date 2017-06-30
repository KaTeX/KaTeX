/**
 * This file provides support to buildMathML.js and buildHTML.js
 * for stretchy wide elements rendered from background-image SVG files
 * and other CSS trickery.
 */

const buildCommon = require("./buildCommon");
const mathMLTree = require("./mathMLTree");
const utils = require("./utils");

const stretchyCodePoint = {
    widehat : "^",
    widetilde : "~",
    undertilde : "~",
    overleftarrow : "\u2190",
    underleftarrow : "\u2190",
    xleftarrow : "\u2190",
    overrightarrow: "\u2192",
    underrightarrow: "\u2192",
    xrightarrow : "\u2192",
    underbrace : "\u23b5",
    overbrace : "\u23de",
    overleftrightarrow : "\u2194",
    underleftrightarrow : "\u2194",
    xleftrightarrow : "\u2194",
    Overrightarrow : "\u21d2",
    xRightarrow : "\u21d2",
    overleftharpoon : "\u21bc",
    xleftharpoonup : "\u21bc",
    overrightharpoon : "\u21c0",
    xrightharpoonup : "\u21c0",
    xLeftarrow : "\u21d0",
    xLeftrightarrow : "\u21d4",
    xhookleftarrow : "\u21a9",
    xhookrightarrow : "\u21aa",
    xmapsto : "\u21a6",
    xrightharpoondown : "\u21c1",
    xleftharpoondown : "\u21bd",
    xrightleftharpoons : "\u21cc",
    xleftrightharpoons : "\u21cb",
    xtwoheadleftarrow : "\u219e",
    xtwoheadrightarrow : "\u21a0",
    xLongequal : "=",
    xtofrom : "\u21c4",
};

const mathMLnode = function(label) {
    const node = new mathMLTree.MathNode(
        "mo", [new mathMLTree.TextNode(stretchyCodePoint[label.substr(1)])]);
    node.setAttribute("stretchy", "true");
    return node;
};

// In the katexImagesData object just below, the dimensions all
// correspond to path geometry inside the relevant SVG file.
// For example, \rightarrow uses the same arrowhead as glyph U+2192
// from the KaTeX Main font. The scaling factor is 1000.
// That is, inside the font, that arrowhead is 522 units tall, which
// corresponds to 0.522 em inside the document.
// And for extensible arrows, we split that distance around the math axis.

const katexImagesData = {
                 // height, depth, fileName
    overleftarrow : [0.522, 0, "leftarrow"],
    underleftarrow : [0.522, 0, "leftarrow"],
    xleftarrow : [0.261, 0.261, "leftarrow"],
    overrightarrow : [0.522, 0, "rightarrow"],
    underrightarrow : [0.522, 0, "rightarrow"],
    xrightarrow : [0.261, 0.261, "rightarrow"],
    overbrace : [0.548, 0, "overbrace"],
    underbrace : [0.548, 0, "underbrace"],
    overleftrightarrow : [0.522, 0, "leftrightarrow"],
    underleftrightarrow : [0.522, 0, "leftrightarrow"],
    xleftrightarrow : [0.261, 0.261, "leftrightarrow"],
    Overrightarrow : [0.56, 0, "doublerightarrow"],
    xLeftarrow : [0.28, 0.28, "doubleleftarrow"],
    xRightarrow : [0.28, 0.28, "doublerightarrow"],
    xLeftrightarrow : [0.28, 0.28, "doubleleftrightarrow"],
    overleftharpoon : [0.522, 0, "leftharpoon"],
    overrightharpoon : [0.522, 0, "rightharpoon"],
    xleftharpoonup : [0.261, 0.261, "leftharpoon"],
    xrightharpoonup : [0.261, 0.261, "rightharpoon"],
    xhookleftarrow : [0.261, 0.261, "hookleftarrow"],
    xhookrightarrow : [0.261, 0.261, "hookrightarrow"],
    overlinesegment : [0.414, 0, "linesegment"],
    underlinesegment : [0.414, 0, "linesegment"],
    xmapsto : [0.261, 0.261, "mapsto"],
    xrightharpoondown : [0.261, 0.261, "rightharpoondown"],
    xleftharpoondown : [0.261, 0.261, "leftharpoondown"],
    xrightleftharpoons : [0.358, 0.358, "rightleftharpoons"],
    xleftrightharpoons : [0.358, 0.358, "leftrightharpoons"],
    overgroup : [0.342, 0, "overgroup"],
    undergroup : [0.342, 0, "undergroup"],
    xtwoheadleftarrow : [0.167, 0.167, "twoheadleftarrow"],
    xtwoheadrightarrow : [0.167, 0.167, "twoheadrightarrow"],
    xLongequal : [0.167, 0.167, "longequal"],
    xtofrom : [0.264, 0.264, "tofrom"],
};

const svgSpan = function(group, options) {
    // Create a span with class(es) that refer to the background-image
    // and/or the mask-image.
    const label = group.value.label.substr(1);
    let height = 0;
    let depth = 0;
    const classArray = ["stretchy"];
    let fileName = "";

    if (utils.contains(["widehat", "widetilde", "undertilde"], label)) {
        // There are four SVG images available for each function.
        // Choose a taller image when there are more characters.
        const numChars = group.value.value.length;
        if (numChars > 5) {
            height = 0.312;
            fileName = (label === "widehat" ? "widehat" : "tilde") + "4";
        } else {
            const imgIndex = [1, 1, 2, 2, 3, 3][numChars];
            if (label === "widehat") {
                height = [0, 0.24, 0.30, 0.30, 0.36, 0.36][numChars];
                fileName = "widehat" + imgIndex;
            } else {
                height = [0, 0.26, 0.30, 0.30, 0.34, 0.34][numChars];
                fileName = "tilde" + imgIndex;
            }
        }
    } else {
        const imgData = katexImagesData[label];
        height = imgData[0];
        depth = imgData[1];
        fileName = imgData[2];
        if (label.substr(0, 1) === "x") {
            classArray.push("x-arrow");     // Lengthen the arrow via padding.
        }
    }

    let node;
    if (options.color) {
        classArray.push(fileName);         // Set span height and IE image.
        // The next two lines each add a class that CSS will apply
        // only to browsers that support CSS mask.
        // IE will not recognize that CSS, so it will fall back to
        // the background-image set in the previous line of code.
        classArray.push("mask");             // Over-ride image.
        classArray.push(fileName + "-mask"); // Set mask-image.
        node = buildCommon.makeSpan(classArray, [], options);
        node.style.backgroundColor = options.color;
    } else {
        classArray.push(fileName);             // Set image and span height.
        node = buildCommon.makeSpan(classArray, [], options);
    }

    node.height = height;
    node.depth = depth;
    node.maxFontSize = 1;
    return node;
};

const encloseSpan = function(inner, isCharBox, label, pad, options) {
    // Return an image span for \cancel, \bcancel, \xcancel, or \fbox
    const img = buildCommon.makeSpan(["stretchy", label], [], options);

    if (options.color) {
        if (label === "fbox") {
            img.style.borderColor = options.color;
        } else {
            img.classes[2] = label + "-mask";
            img.style.backgroundColor = options.color;
        }
    }

    img.height = inner.height + inner.depth + 2 * pad;
    img.style.height = img.height + "em";

    if (/cancel/.test(label) && isCharBox) {
        img.maxFontSize = 1.2; // Make line box tall enough for image to fit.
    } else if (label === "fbox" && inner.maxFontSize > 1.0) {
        img.maxFontSize = 1.12 * inner.maxFontSize;
        // Bug: This will shift the whole line downward on the screen.
        // TODO(ron): Find a better way. Fix makeVList, perhaps.
    } else {
        img.maxFontSize = 1;
    }
    return img;
};

module.exports = {
    encloseSpan: encloseSpan,
    mathMLnode: mathMLnode,
    svgSpan: svgSpan,
};
