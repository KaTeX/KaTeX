/**
 * This file provides support to buildMathML.js and buildHTML.js
 * for stretchy wide elements rendered from SVG files
 * and other CSS trickery.
 */

const domTree = require("./domTree");
const buildCommon = require("./buildCommon");
const mathMLTree = require("./mathMLTree");
const utils = require("./utils");

const stretchyCodePoint = {
    widehat: "^",
    widetilde: "~",
    undertilde: "~",
    overleftarrow: "\u2190",
    underleftarrow: "\u2190",
    xleftarrow: "\u2190",
    overrightarrow: "\u2192",
    underrightarrow: "\u2192",
    xrightarrow: "\u2192",
    underbrace: "\u23b5",
    overbrace: "\u23de",
    overleftrightarrow: "\u2194",
    underleftrightarrow: "\u2194",
    xleftrightarrow: "\u2194",
    Overrightarrow: "\u21d2",
    xRightarrow: "\u21d2",
    overleftharpoon: "\u21bc",
    xleftharpoonup: "\u21bc",
    overrightharpoon: "\u21c0",
    xrightharpoonup: "\u21c0",
    xLeftarrow: "\u21d0",
    xLeftrightarrow: "\u21d4",
    xhookleftarrow: "\u21a9",
    xhookrightarrow: "\u21aa",
    xmapsto: "\u21a6",
    xrightharpoondown: "\u21c1",
    xleftharpoondown: "\u21bd",
    xrightleftharpoons: "\u21cc",
    xleftrightharpoons: "\u21cb",
    xtwoheadleftarrow: "\u219e",
    xtwoheadrightarrow: "\u21a0",
    xLongequal: "=",
    xtofrom: "\u21c4",
};

const mathMLnode = function(label) {
    const node = new mathMLTree.MathNode(
        "mo", [new mathMLTree.TextNode(stretchyCodePoint[label.substr(1)])]);
    node.setAttribute("stretchy", "true");
    return node;
};

// Many of the KaTeX SVG images have been adapted from glyphs in KaTeX fonts.
// Copyright (c) 2009-2010, Design Science, Inc. (<www.mathjax.org>)
// Copyright (c) 2014-2017 Khan Academy (<www.khanacademy.org>)
// Licensed under the SIL Open Font License, Version 1.1.
// See \nhttp://scripts.sil.org/OFL

// Nested SVGs
//    Many of the KaTeX SVG images contain a nested SVG. This is done to
//    achieve a stretchy image while avoiding distortion of arrowheads or
//    brace corners.

//    The inner SVG typically contains a very long (400 em) arrow.

//    The outer SVG acts like a window that exposes only part of the inner SVG.
//    The outer SVG will grow or shrink to match the dimensions set by CSS.

//    The inner SVG always has a longer, thinner aspect ratio than the outer
//    SVG. After the inner SVG fills 100% of the height of the outer SVG,
//    there is a long arrow shaft left over. That left-over shaft is not shown.
//    Instead, it is sliced off because the inner SVG is set to
//    "preserveAspectRatio='... slice'".

//    Thus, the reader sees an arrow that matches the subject matter width
//    without distortion.

//    Some functions, such as \cancel, need to vary their aspect ratio. These
//    functions do not get the nested SVG treatment.

// Second Brush Stroke
//    Low resolution monitors struggle to display images in fine detail.
//    So browsers apply anti-aliasing. A long straight arrow shaft therefore
//    will sometimes appear as if it has a blurred edge.

//    To mitigate this, these SVG files contain a second "brush-stroke" on the
//    arrow shafts. That is, a second long thin rectangular SVG path has been
//    written directly on top of each arrow shaft. This reinforcement causes
//    some of the screen pixels to display as black instead of the anti-aliased
//    gray pixel that a  single path would generate. So we get arrow shafts
//    whose edges appear to be sharper.

// In the katexImagesData object just below, the dimensions all
// correspond to path geometry inside the relevant SVG.
// For example, \overrightarrow uses the same arrowhead as glyph U+2192
// from the KaTeX Main font. The scaling factor is 1000.
// That is, inside the font, that arrowhead is 522 units tall, which
// corresponds to 0.522 em inside the document.

const katexImagesData = {
                   //   path(s), minWidth, height, align
    overrightarrow: [["rightarrow"], 0.888, 522, "xMaxYMin"],
    overleftarrow: [["leftarrow"], 0.888, 522, "xMinYMin"],
    underrightarrow: [["rightarrow"], 0.888, 522, "xMaxYMin"],
    underleftarrow: [["leftarrow"], 0.888, 522, "xMinYMin"],
    xrightarrow: [["rightarrow"], 1.469, 522, "xMaxYMin"],
    xleftarrow: [["leftarrow"], 1.469, 522, "xMinYMin"],
    Overrightarrow: [["doublerightarrow"], 0.888, 560, "xMaxYMin"],
    xRightarrow: [["doublerightarrow"], 1.526, 560, "xMaxYMin"],
    xLeftarrow: [["doubleleftarrow"], 1.526, 560, "xMinYMin"],
    overleftharpoon: [["leftharpoon"], 0.888, 522, "xMinYMin"],
    xleftharpoonup: [["leftharpoon"], 0.888, 522, "xMinYMin"],
    xleftharpoondown: [["leftharpoondown"], 0.888, 522, "xMinYMin"],
    overrightharpoon: [["rightharpoon"], 0.888, 522, "xMaxYMin"],
    xrightharpoonup: [["rightharpoon"], 0.888, 522, "xMaxYMin"],
    xrightharpoondown: [["rightharpoondown"], 0.888, 522, "xMaxYMin"],
    xLongequal: [["longequal"], 0.888, 334, "xMinYMin"],
    xtwoheadleftarrow: [["twoheadleftarrow"], 0.888, 334, "xMinYMin"],
    xtwoheadrightarrow: [["twoheadrightarrow"], 0.888, 334, "xMaxYMin"],

    overleftrightarrow: [["leftarrow", "rightarrow"], 0.888, 522],
    overbrace: [["leftbrace", "midbrace", "rightbrace"], 1.6, 548],
    underbrace: [["leftbraceunder", "midbraceunder", "rightbraceunder"],
        1.6, 548],
    underleftrightarrow: [["leftarrow", "rightarrow"], 0.888, 522],
    xleftrightarrow: [["leftarrow", "rightarrow"], 1.75, 522],
    xLeftrightarrow: [["doubleleftarrow", "doublerightarrow"], 1.75, 560],
    xrightleftharpoons: [["leftharpoondownplus", "rightharpoonplus"], 1.75, 716],
    xleftrightharpoons: [["leftharpoonplus", "rightharpoondownplus"],
        1.75, 716],
    xhookleftarrow: [["leftarrow", "righthook"], 1.08, 522],
    xhookrightarrow: [["lefthook", "rightarrow"], 1.08, 522],
    overlinesegment: [["leftlinesegment", "rightlinesegment"], 0.888, 522],
    underlinesegment: [["leftlinesegment", "rightlinesegment"], 0.888, 522],
    overgroup: [["leftgroup", "rightgroup"], 0.888, 342],
    undergroup: [["leftgroupunder", "rightgroupunder"], 0.888, 342],
    xmapsto: [["leftmapsto", "rightarrow"], 1.5, 522],
    xtofrom: [["leftToFrom", "rightToFrom"], 1.75, 528],
};

const groupLength = function(arg) {
    if (arg.type === "ordgroup") {
        return arg.value.length;
    } else {
        return 1;
    }
};

const svgSpan = function(group, options) {
    // Create a span with inline SVG for the element.
    const label = group.value.label.substr(1);
    let attributes = [];
    let height;
    let viewBoxWidth = 400000;  // default
    let minWidth = 0;
    let path;
    let pathName;
    let svgNode;

    if (utils.contains(["widehat", "widetilde", "undertilde"], label)) {
        // There are four SVG images available for each function.
        // Choose a taller image when there are more characters.
        const numChars = groupLength(group.value.base);
        let viewBoxHeight;

        if (numChars > 5) {
            viewBoxHeight = (label === "widehat" ? 420 : 312);
            viewBoxWidth = (label === "widehat" ? 2364 : 2340);
            // Next get the span height, in 1000 ems
            height = (label === "widehat" ? 0.42 : 0.34);
            pathName = (label === "widehat" ? "widehat" : "tilde") + "4";
        } else {
            const imgIndex = [1, 1, 2, 2, 3, 3][numChars];
            if (label === "widehat") {
                viewBoxWidth = [0, 1062, 2364, 2364, 2364][imgIndex];
                viewBoxHeight = [0, 239, 300, 360, 420][imgIndex];
                height = [0, 0.24, 0.3, 0.3, 0.36, 0.42][imgIndex];
                pathName = "widehat" + imgIndex;
            } else {
                viewBoxWidth = [0, 600, 1033, 2339, 2340][imgIndex];
                viewBoxHeight = [0, 260, 286, 306, 312][imgIndex];
                height = [0, 0.26, 0.286, 0.3, 0.306, 0.34][imgIndex];
                pathName = "tilde" + imgIndex;
            }
        }
        path = new domTree.pathNode(pathName);
        attributes.push(["width", "100%"]);
        attributes.push(["height", height + "em"]);
        attributes.push(["viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`]);
        attributes.push(["preserveAspectRatio", "none"]);

        svgNode = new domTree.svgNode([path], attributes);

    } else {
        let width;
        let align;

        const [paths, gWidth, vbHeight, alignOne] = katexImagesData[label];
        const numSvgChildren = paths.length;
        const innerSVGs = [];
        height = vbHeight / 1000;
        minWidth = gWidth;

        for (let i = 0; i < numSvgChildren; i++) {
            path = new domTree.pathNode(paths[i]);
            attributes = [];

            if (numSvgChildren === 1) {
                width = "100%";
                align = alignOne;
            } else if (numSvgChildren === 2) {
                // small overlap to prevent a 1 pixel gap.
                if (i > 0) {
                    attributes.push(["x", "50%"]);
                }
                width = ["50.1%", "50%"][i];
                align = ["xMinYMin", "xMaxYMin"][i];
            } else {
                // 3 inner SVGs, as in a brace
                if (i > 0) {
                    attributes.push(["x", [null, "25%", "74.9%"][i]]);
                }
                width = ["25.5%", "50%", "25.1%"][i];
                align = ["xMinYMin", "xMidYMin", "xMaxYMin"][i];
            }

            attributes.push(["width", width]);
            attributes.push(["height", height + "em"]);
            attributes.push(["viewBox", `0 0 ${viewBoxWidth} ${vbHeight}`]);
            attributes.push(["preserveAspectRatio", align + " slice"]);

            innerSVGs.push(new domTree.svgNode([path], attributes));
        }
        attributes = [["width", "100%"], ["height", height + "em"]];
        svgNode = new domTree.svgNode(innerSVGs, attributes);
    }

    const span = buildCommon.makeSpan([], [svgNode], options);
    // Note that we are returning span.depth = 0.
    // Any adjustments relative to the baseline must be done in buildHTML.
    span.height = height;
    span.style.height = height + "em";
    if (minWidth > 0) {
        span.style.minWidth = minWidth + "em";
    }

    return span;
};

const encloseSpan = function(inner, label, pad, options) {
    // Return an image span for \cancel, \bcancel, \xcancel, or \fbox
    let img;
    const totalHeight = inner.height + inner.depth + 2 * pad;

    if (/(fbox)|(color)/.test(label)) {
        img = buildCommon.makeSpan(["stretchy", label], [], options);

        if (label === "fbox" && options.color) {
            img.style.borderColor = options.getColor();
        }

    } else {
        // \cancel, \bcancel, or \xcancel
        // Since \cancel's SVG is inline and it omits the viewBox attribute,
        // its stroke-width will not vary with span area.

        let attributes = [["x1", "0"]];
        const lines = [];

        if (label !== "cancel") {
            attributes.push(["y1", "0"]);
            attributes.push(["x2", "100%"]);
            attributes.push(["y2", "100%"]);
            attributes.push(["stroke-width", "0.046em"]);
            lines.push(new domTree.lineNode(attributes));
        }

        if (label === "xcancel") {
            attributes = [["x1", "0"]];  // start a second line.
        }

        if (label !== "bcancel") {
            attributes.push(["y1", "100%"]);
            attributes.push(["x2", "100%"]);
            attributes.push(["y2", "0"]);
            attributes.push(["stroke-width", "0.046em"]);
            lines.push(new domTree.lineNode(attributes));
        }

        attributes = [["width", "100%"], ["height", totalHeight + "em"]];
        const svgNode = new domTree.svgNode(lines, attributes);

        img = buildCommon.makeSpan([], [svgNode], options);
    }

    img.height = totalHeight;
    img.style.height = totalHeight + "em";

    return img;
};

module.exports = {
    encloseSpan: encloseSpan,
    mathMLnode: mathMLnode,
    svgSpan: svgSpan,
};
