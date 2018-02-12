// @flow
/**
 * This file provides support to buildMathML.js and buildHTML.js
 * for stretchy wide elements rendered from SVG files
 * and other CSS trickery.
 */

import domTree from "./domTree";
import buildCommon from "./buildCommon";
import mathMLTree from "./mathMLTree";
import utils from "./utils";

import type Options from "./Options";
import type ParseNode from "./ParseNode";

const stretchyCodePoint: {[string]: string} = {
    widehat: "^",
    widetilde: "~",
    utilde: "~",
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
    xlongequal: "=",
    xtofrom: "\u21c4",
    xrightleftarrows: "\u21c4",
    xrightequilibrium: "\u21cc",  // Not a perfect match.
    xleftequilibrium: "\u21cb",   // None better available.
};

const mathMLnode = function(label: string): mathMLTree.MathNode {
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

// Very Long SVGs
//    Many of the KaTeX stretchy wide elements use a long SVG image and an
//    overflow: hidden tactic to achieve a stretchy image while avoiding
//    distortion of arrowheads or brace corners.

//    The SVG typically contains a very long (400 em) arrow.

//    The SVG is in a container span that has overflow: hidden, so the span
//    acts like a window that exposes only part of the  SVG.

//    The SVG always has a longer, thinner aspect ratio than the container span.
//    After the SVG fills 100% of the height of the container span,
//    there is a long arrow shaft left over. That left-over shaft is not shown.
//    Instead, it is sliced off because the span's CSS has overflow: hidden.

//    Thus, the reader sees an arrow that matches the subject matter width
//    without distortion.

//    Some functions, such as \cancel, need to vary their aspect ratio. These
//    functions do not get the overflow SVG treatment.

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

const katexImagesData: {
    [string]: ([string[], number, number] | [string[], number, number, string])
} = {
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
    xlongequal: [["longequal"], 0.888, 334, "xMinYMin"],
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

    // The next three arrows are from the mhchem package.
    // In mhchem.sty, min-length is 2.0em. But these arrows might appear in the
    // document as \xrightarrow or \xrightleftharpoons. Those have
    // min-length = 1.75em, so we set min-length on these next three to match.
    xrightleftarrows: [["baraboveleftarrow", "rightarrowabovebar"], 1.75, 667],
    xrightequilibrium: [["baraboveshortleftharpoon",
        "rightharpoonaboveshortbar"], 1.75, 716],
    xleftequilibrium: [["shortbaraboveleftharpoon",
        "shortrightharpoonabovebar"], 1.75, 716],
};

const groupLength = function(arg: ParseNode): number {
    if (arg.type === "ordgroup") {
        return arg.value.length;
    } else {
        return 1;
    }
};

const svgSpan = function(group: ParseNode, options: Options): domTree.span {
    // Create a span with inline SVG for the element.
    function buildSvgSpan_(): {
        span: domTree.span,
        minWidth: number,
        height: number,
    } {
        let viewBoxWidth = 400000;  // default
        const label = group.value.label.substr(1);
        if (utils.contains(["widehat", "widetilde", "utilde"], label)) {
            // There are four SVG images available for each function.
            // Choose a taller image when there are more characters.
            const numChars = groupLength(group.value.base);
            let viewBoxHeight;
            let pathName;
            let height;

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
            const path = new domTree.pathNode(pathName);
            const svgNode = new domTree.svgNode([path], {
                "width": "100%",
                "height": height + "em",
                "viewBox": `0 0 ${viewBoxWidth} ${viewBoxHeight}`,
                "preserveAspectRatio": "none",
            });
            return {
                span: buildCommon.makeSpan([], [svgNode], options),
                minWidth: 0,
                height,
            };
        } else {
            const spans = [];

            const [paths, minWidth, viewBoxHeight, align1] = katexImagesData[label];
            const height = viewBoxHeight / 1000;

            const numSvgChildren = paths.length;
            let widthClasses;
            let aligns;
            if (numSvgChildren === 1) {
                widthClasses = ["hide-tail"];
                aligns = [align1];
            } else if (numSvgChildren === 2) {
                widthClasses = ["halfarrow-left", "halfarrow-right"];
                aligns = ["xMinYMin", "xMaxYMin"];
            } else if (numSvgChildren === 3) {
                widthClasses = ["brace-left", "brace-center", "brace-right"];
                aligns = ["xMinYMin", "xMidYMin", "xMaxYMin"];
            } else {
                throw new Error(
                    `Correct katexImagesData or update code here to support
                    ${numSvgChildren} children.`);
            }

            for (let i = 0; i < numSvgChildren; i++) {
                const path = new domTree.pathNode(paths[i]);

                const svgNode = new domTree.svgNode([path], {
                    "width": "400em",
                    "height": height + "em",
                    "viewBox": `0 0 ${viewBoxWidth} ${viewBoxHeight}`,
                    "preserveAspectRatio": aligns[i] + " slice",
                });

                const span =
                    buildCommon.makeSpan([widthClasses[i]], [svgNode], options);
                if (numSvgChildren === 1) {
                    return {span, minWidth, height};
                } else {
                    span.style.height = height + "em";
                    spans.push(span);
                }
            }

            return {
                span: buildCommon.makeSpan(["stretchy"], spans, options),
                minWidth,
                height,
            };
        }
    } // buildSvgSpan_()
    const {span, minWidth, height} = buildSvgSpan_();

    // Note that we are returning span.depth = 0.
    // Any adjustments relative to the baseline must be done in buildHTML.
    span.height = height;
    span.style.height = height + "em";
    if (minWidth > 0) {
        span.style.minWidth = minWidth + "em";
    }

    return span;
};

const encloseSpan = function(
    inner: domTree.span,
    label: string,
    pad: number,
    options: Options,
): domTree.span {
    // Return an image span for \cancel, \bcancel, \xcancel, or \fbox
    let img;
    const totalHeight = inner.height + inner.depth + 2 * pad;

    if (/fbox|color/.test(label)) {
        img = buildCommon.makeSpan(["stretchy", label], [], options);

        if (label === "fbox") {
            const color = options.color && options.getColor();
            if (color) {
                img.style.borderColor = color;
            }
        }

    } else {
        // \cancel, \bcancel, or \xcancel
        // Since \cancel's SVG is inline and it omits the viewBox attribute,
        // its stroke-width will not vary with span area.

        const lines = [];
        if (/^[bx]cancel$/.test(label)) {
            lines.push(new domTree.lineNode({
                "x1": "0",
                "y1": "0",
                "x2": "100%",
                "y2": "100%",
                "stroke-width": "0.046em",
            }));
        }

        if (/^x?cancel$/.test(label)) {
            lines.push(new domTree.lineNode({
                "x1": "0",
                "y1": "100%",
                "x2": "100%",
                "y2": "0",
                "stroke-width": "0.046em",
            }));
        }

        const svgNode = new domTree.svgNode(lines, {
            "width": "100%",
            "height": totalHeight + "em",
        });

        img = buildCommon.makeSpan([], [svgNode], options);
    }

    img.height = totalHeight;
    img.style.height = totalHeight + "em";

    return img;
};

const ruleSpan = function(className: string, lineThickness: number,
    options: Options): domTree.span {

    // Get a span with an SVG line that fills the middle fifth of the span.
    // We're using an extra wide span so Chrome won't round it down to zero.

    const lines = [];
    let svgNode;
    if (className === "vertical-separator") {
        // Apply 2 brush strokes for sharper edges on low-res screens.
        for (let i = 0; i < 2; i++) {
            lines.push(new domTree.lineNode({
                "x1": "5",
                "y1": "0",
                "x2": "5",
                "y2": "10",
                "stroke-width": "2",
            }));
        }

        svgNode = new domTree.svgNode(lines, {
            "width": "0.25em",
            "height": "100%",
            "viewBox": "0 0 10 10",
            "preserveAspectRatio": "none",
        });

    } else {
        for (let i = 0; i < 2; i++) {
            lines.push(new domTree.lineNode({
                "x1": "0",
                "y1": "5",
                "x2": "10",
                "y2": "5",
                "stroke-width": "2",
            }));
        }

        svgNode = new domTree.svgNode(lines, {
            "width": "100%",
            "height": 5 * lineThickness + "em",
            "viewBox": "0 0 10 10",
            "preserveAspectRatio": "none",
        });
    }

    return buildCommon.makeSpan([className], [svgNode], options);
};

export default {
    encloseSpan,
    mathMLnode,
    ruleSpan,
    svgSpan,
};
