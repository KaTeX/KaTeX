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
    overbracket : "\u23b4",
    underbrace : "\u23b5",
    overbrace : "\u23de",
    underbracket : "\u23df",
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

const katexImagesData = {
                 // height, depth, fileName
    overleftarrow : [0.334, 0, "leftarrow"],
    underleftarrow : [0.334, 0, "leftarrow"],
    xleftarrow : [0.261, 0.261, "xleftarrow"],
    overrightarrow : [0.334, 0, "rightarrow"],
    underrightarrow : [0.334, 0, "rightarrow"],
    xrightarrow : [0.261, 0.261, "xrightarrow"],
    overbrace : [0.548, 0, "overbrace"],
    underbrace : [0.548, 0, "underbrace"],
    overbracket : [0.3, 0, "overbracket"],
    underbracket : [0.3, 0, "underbracket"],
    overleftrightarrow : [0.334, 0, "leftrightarrow"],
    underleftrightarrow : [0.334, 0, "leftrightarrow"],
    xleftrightarrow : [0.261, 0.261, "xleftrightarrow"],
    Overrightarrow : [0.56, 0, "doublerightarrow"],
    xLeftarrow : [0.28, 0.28, "doubleleftarrow"],
    xRightarrow : [0.28, 0.28, "doublerightarrow"],
    xLeftrightarrow : [0.28, 0.28, "doubleleftrightarrow"],
    overleftharpoon : [0.334, 0, "leftharpoon"],
    overrightharpoon : [0.334, 0, "rightharpoon"],
    xleftharpoonup : [0.261, 0.261, "xleftharpoon"],
    xrightharpoonup : [0.261, 0.261, "xrightharpoon"],
    xhookleftarrow : [0.261, 0.261, "hookleftarrow"],
    xhookrightarrow : [0.261, 0.261, "hookrightarrow"],
    overlinesegment : [0.334, 0, "linesegment"],
    underlinesegment : [0.334, 0, "linesegment"],
    xmapsto : [0.261, 0.261, "mapsto"],
    xrightharpoondown : [0.261, 0.261, "xrightharpoondown"],
    xleftharpoondown : [0.261, 0.261, "xleftharpoondown"],
    xrightleftharpoons : [0.358, 0.358, "rightleftharpoons"],
    xleftrightharpoons : [0.358, 0.358, "leftrightharpoons"],
    overgroup : [0.262, 0, "overgroup"],
    undergroup : [0.262, 0, "undergroup"],
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
            height = 0.34;
            fileName = (label === "widehat" ? "widehat" : "tilde") + "4";
        } else {
            const imgIndex = [1, 1, 2, 2, 3, 3][numChars];
            if (label === "widehat") {
                height = [0, 0.16, 0.23, 0.23, 0.28, 0.28][numChars];
                fileName = "widehat" + imgIndex;
            } else {
                height = [0, 0.15, 0.195, 0.195, 0.26, 0.26][numChars];
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
    if (utils.contains(["overbracket", "underbracket"], label)) {
        node = buildCommon.makeSpan(["stretchy", label], [], options);
        // Deal with the optional arguments.
        if (group.value.thickness) {
            const lineWt = group.value.thickness.value + "em";
            node.style.borderWidth = (group.value.isOver ? lineWt : 0) + " " +
                lineWt + " " + (group.value.isOver ? 0 : lineWt) + " " + lineWt;
        }
        if (group.value.height) {
            height = group.value.height;
            node.style.height = height + "em";
        }

    } else if (options.color) {
        classArray.push(fileName);         // Set span height and IE image.
        classArray.push("mask");           // Over-ride image in most browsers.
        classArray.push(fileName + "-mask"); // Set mask-image.
        node = buildCommon.makeSpan(classArray, [], options);
        node.style.backgroundColor = options.color;
    } else {
        classArray.push(fileName);             // Set image and span height.
        node = buildCommon.makeSpan(classArray, [], options);
    }

    node.height = height;
    node.depth = depth;
    node.maxFontSize = (height > 1.0 ? 1.1 * height : 1.0);
    return node;
};

const strikeSpan = function(label, options) {
    // Return a span for \cancel, \bcancel, or \xcancel
    let node;
    if (options.color) {
        node = buildCommon.makeSpan(["strike", label + "-mask"], [], options);
        node.style.backgroundColor = options.color;
    } else {
        node = buildCommon.makeSpan(["strike", label], [], options);
    }
    return node;
};

module.exports = {
    mathMLnode: mathMLnode,
    strikeSpan: strikeSpan,
    svgSpan: svgSpan,
};
