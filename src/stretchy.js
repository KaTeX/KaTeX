/**
 * This file provides support to buildMathML.js and buildHTML.js
 * for stretchy wide elements rendered from SVG files
 * and other CSS trickery.
 */

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

// In the katexImagesData object just below, the dimensions all
// correspond to path geometry inside the relevant SVG.
// For example, \rightarrow uses the same arrowhead as glyph U+2192
// from the KaTeX Main font. The scaling factor is 1000.
// That is, inside the font, that arrowhead is 522 units tall, which
// corresponds to 0.522 em inside the document.
// And for extensible arrows, we split that distance around the math axis.

const katexImagesData = {
                 // height, depth, imageName, minWidth
    overleftarrow: [0.522, 0, "leftarrow", 0.5],
    underleftarrow: [0.522, 0, "leftarrow", 0.5],
    xleftarrow: [0.261, 0.261, "leftarrow", 0.783],
    overrightarrow: [0.522, 0, "rightarrow", 0.5],
    underrightarrow: [0.522, 0, "rightarrow", 0.5],
    xrightarrow: [0.261, 0.261, "rightarrow", 0.783],
    overbrace: [0.548, 0, "overbrace", 1.6],
    underbrace: [0.548, 0, "underbrace", 1.6],
    overleftrightarrow: [0.522, 0, "leftrightarrow", 0.5],
    underleftrightarrow: [0.522, 0, "leftrightarrow", 0.5],
    xleftrightarrow: [0.261, 0.261, "leftrightarrow", 0.783],
    Overrightarrow: [0.56, 0, "doublerightarrow", 0.5],
    xLeftarrow: [0.28, 0.28, "doubleleftarrow", 0.783],
    xRightarrow: [0.28, 0.28, "doublerightarrow", 0.783],
    xLeftrightarrow: [0.28, 0.28, "doubleleftrightarrow", 0.955],
    overleftharpoon: [0.522, 0, "leftharpoon", 0.5],
    overrightharpoon: [0.522, 0, "rightharpoon", 0.5],
    xleftharpoonup: [0.261, 0.261, "leftharpoon", 0.783],
    xrightharpoonup: [0.261, 0.261, "rightharpoon", 0.783],
    xhookleftarrow: [0.261, 0.261, "hookleftarrow", 0.87],
    xhookrightarrow: [0.261, 0.261, "hookrightarrow", 0.87],
    overlinesegment: [0.414, 0, "linesegment", 0.5],
    underlinesegment: [0.414, 0, "linesegment", 0.5],
    xmapsto: [0.261, 0.261, "mapsto", 0.783],
    xrightharpoondown: [0.261, 0.261, "rightharpoondown", 0.783],
    xleftharpoondown: [0.261, 0.261, "leftharpoondown", 0.783],
    xrightleftharpoons: [0.358, 0.358, "rightleftharpoons", 0.716],
    xleftrightharpoons: [0.358, 0.358, "leftrightharpoons", 0.716],
    overgroup: [0.342, 0, "overgroup", 0.87],
    undergroup: [0.342, 0, "undergroup", 0.87],
    xtwoheadleftarrow: [0.167, 0.167, "twoheadleftarrow", 0.86],
    xtwoheadrightarrow: [0.167, 0.167, "twoheadrightarrow", 0.86],
    xLongequal: [0.167, 0.167, "longequal", 0.5],
    xtofrom: [0.264, 0.264, "tofrom", 0.86],
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

const svgPath = {
    doubleleftarrow: `<path d='M262 157
l10-10c34-36 62.7-77 86-123 3.3-8 5-13.3 5-16 0-5.3-6.7-8-20-8-7.3
 0-12.2.5-14.5 1.5-2.3 1-4.8 4.5-7.5 10.5-49.3 97.3-121.7 169.3-217 216-28
 14-57.3 25-88 33-6.7 2-11 3.8-13 5.5-2 1.7-3 4.2-3 7.5s1 5.8 3 7.5
c2 1.7 6.3 3.5 13 5.5 68 17.3 128.2 47.8 180.5 91.5 52.3 43.7 93.8 96.2 124.5
 157.5 9.3 8 15.3 12.3 18 13h6c12-.7 18-4 18-10 0-2-1.7-7-5-15-23.3-46-52-87
-86-123l-10-10h399738v-40H218c328 0 0 0 0 0l-10-8c-26.7-20-65.7-43-117-69 2.7
-2 6-3.7 10-5 36.7-16 72.3-37.3 107-64l10-8h399782v-40z
m8 0v40h399730v-40zm0 194v40h399730v-40z'/>`,

    doublerightarrow: `<path d='M399738 392l
-10 10c-34 36-62.7 77-86 123-3.3 8-5 13.3-5 16 0 5.3 6.7 8 20 8 7.3 0 12.2-.5
 14.5-1.5 2.3-1 4.8-4.5 7.5-10.5 49.3-97.3 121.7-169.3 217-216 28-14 57.3-25 88
-33 6.7-2 11-3.8 13-5.5 2-1.7 3-4.2 3-7.5s-1-5.8-3-7.5c-2-1.7-6.3-3.5-13-5.5-68
-17.3-128.2-47.8-180.5-91.5-52.3-43.7-93.8-96.2-124.5-157.5-9.3-8-15.3-12.3-18
-13h-6c-12 .7-18 4-18 10 0 2 1.7 7 5 15 23.3 46 52 87 86 123l10 10H0v40h399782
c-328 0 0 0 0 0l10 8c26.7 20 65.7 43 117 69-2.7 2-6 3.7-10 5-36.7 16-72.3 37.3
-107 64l-10 8H0v40zM0 157v40h399730v-40zm0 194v40h399730v-40z'/>`,

    leftarrow: `<path d='M400000 241H110l3-3c68.7-52.7 113.7-120
 135-202 4-14.7 6-23 6-25 0-7.3-7-11-21-11-8 0-13.2.8-15.5 2.5-2.3 1.7-4.2 5.8
-5.5 12.5-1.3 4.7-2.7 10.3-4 17-12 48.7-34.8 92-68.5 130S65.3 228.3 18 247
c-10 4-16 7.7-18 11 0 8.7 6 14.3 18 17 47.3 18.7 87.8 47 121.5 85S196 441.3 208
 490c.7 2 1.3 5 2 9s1.2 6.7 1.5 8c.3 1.3 1 3.3 2 6s2.2 4.5 3.5 5.5c1.3 1 3.3
 1.8 6 2.5s6 1 10 1c14 0 21-3.7 21-11 0-2-2-10.3-6-25-20-79.3-65-146.7-135-202
 l-3-3h399890zM100 241v40h399900v-40z'/>`,

    rightarrow: `<path d='M0 241v40h399891c-47.3 35.3-84 78-110 128
-16.7 32-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20
 11 8 0 13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7
 39-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85
-40.5-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5
-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67
 151.7 139 205zm0 0v40h399900v-40z'/>`,
};

const innerSVG = {
    // Since bcancel's SVG is inline and it omits the viewBox attribute,
    // it's stroke-width will not vary with span area.
    bcancel: `<line x1='0' y1='0' x2='100%' y2='100%' stroke-width='0.046em'/>`,

    cancel: `<line x1='0' y1='100%' x2='100%' y2='0' stroke-width='0.046em'/>`,

    // The doubleleftarrow geometry is from glyph U+21D0 in the font KaTeX Main
    doubleleftarrow: `><svg viewBox='0 0 400000 549'
preserveAspectRatio='xMinYMin slice'>${svgPath["doubleleftarrow"]}</svg>`,

    // doubleleftrightarrow is from glyph U+21D4 in font KaTeX Main
    doubleleftrightarrow: `><svg width='50.1%' viewBox='0 0 400000 549'
preserveAspectRatio='xMinYMin slice'>${svgPath["doubleleftarrow"]}</svg>
<svg x='50%' width='50%' viewBox='0 0 400000 549' preserveAspectRatio='xMaxYMin
 slice'>${svgPath["doublerightarrow"]}</svg>`,

    // doublerightarrow is from glyph U+21D2 in font KaTeX Main
    doublerightarrow: `><svg viewBox='0 0 400000 549'
preserveAspectRatio='xMaxYMin slice'>${svgPath["doublerightarrow"]}</svg>`,

    // hookleftarrow is from glyph U+21A9 in font KaTeX Main
    hookleftarrow: `><svg width='50.1%' viewBox='0 0 400000 522'
preserveAspectRatio='xMinYMin slice'>${svgPath["leftarrow"]}</svg>
<svg x='50%' width='50%' viewBox='0 0 400000 522' preserveAspectRatio='xMaxYMin
 slice'><path d='M399859 241c-764 0 0 0 0 0 40-3.3 68.7
 -15.7 86-37 10-12 15-25.3 15-40 0-22.7-9.8-40.7-29.5-54-19.7-13.3-43.5-21-71.5
 -23-17.3-1.3-26-8-26-20 0-13.3 8.7-20 26-20 38 0 71 11.2 99 33.5 0 0 7 5.6 21
 16.7 14 11.2 21 33.5 21 66.8s-14 61.2-42 83.5c-28 22.3-61 33.5-99 33.5L0 241z
 M0 281v-40h399859v40z'/></svg>`,

    // hookrightarrow is from glyph U+21AA in font KaTeX Main
    hookrightarrow: `><svg width='50.1%' viewBox='0 0 400000 522'
preserveAspectRatio='xMinYMin slice'><path d='M400000 281
H103s-33-11.2-61-33.5S0 197.3 0 164s14.2-61.2 42.5-83.5C70.8 58.2 104 47 142 47
c16.7 0 25 6.7 25 20 0 12-8.7 18.7-26 20-40 3.3-68.7 15.7-86 37-10 12-15 25.3
-15 40 0 22.7 9.8 40.7 29.5 54 19.7 13.3 43.5 21 71.5 23h399859zM103 281v-40
h399897v40z'/></svg><svg x='50%' width='50%' viewBox='0 0 400000 522'
preserveAspectRatio='xMaxYMin slice'>${svgPath["rightarrow"]}</svg>`,

    // leftarrow is from glyph U+2190 in font KaTeX Main
    leftarrow: `><svg viewBox='0 0 400000 522' preserveAspectRatio='xMinYMin
 slice'>${svgPath["leftarrow"]}</svg>`,

    // leftharpoon is from glyph U+21BD in font KaTeX Main
    leftharpoon: `><svg viewBox='0 0 400000 522' preserveAspectRatio='xMinYMin
 slice'><path d='M0 267c.7 5.3 3 10 7 14h399993v-40H93c3.3
-3.3 10.2-9.5 20.5-18.5s17.8-15.8 22.5-20.5c50.7-52 88-110.3 112-175 4-11.3 5
-18.3 3-21-1.3-4-7.3-6-18-6-8 0-13 .7-15 2s-4.7 6.7-8 16c-42 98.7-107.3 174.7
-196 228-6.7 4.7-10.7 8-12 10-1.3 2-2 5.7-2 11zm100-26v40h399900v-40z'/></svg>`,

    // leftharpoondown is from glyph U+21BD in font KaTeX Main
    leftharpoondown: `><svg viewBox='0 0 400000 522'
preserveAspectRatio='xMinYMin slice'><path d="M7 241c-4 4-6.333 8.667-7 14
 0 5.333.667 9 2 11s5.333 5.333 12 10c90.667 54 156 130 196 228 3.333 10.667
 6.333 16.333 9 17 2 .667 5 1 9 1h5c10.667 0 16.667-2 18-6 2-2.667 1-9.667-3-21
 -32-87.333-82.667-157.667-152-211l-3-3h399907v-40z
M93 281 H400000 v-40L7 241z"/></svg>`,

    // leftrightarrow is from glyph U+2194 in font KaTeX Main
    leftrightarrow: `><svg width='50.1%' viewBox='0 0 400000 522'
preserveAspectRatio='xMinYMin slice'>${svgPath["leftarrow"]}</svg>
<svg x='50%' width='50%' viewBox='0 0 400000 522' preserveAspectRatio='xMaxYMin
 slice'>${svgPath["rightarrow"]}</svg>`,

    // leftrightharpoons is from glyphs U+21BC/21B1 in font KaTeX Main
    leftrightharpoons: `><svg width='50.1%' viewBox='0 0 400000 716'
preserveAspectRatio='xMinYMin slice'><path d='M0 267c.7 5.3
 3 10 7 14h399993v-40H93c3.3-3.3 10.2-9.5 20.5-18.5s17.8-15.8 22.5-20.5c50.7-52
 88-110.3 112-175 4-11.3 5-18.3 3-21-1.3-4-7.3-6-18-6-8 0-13 .7-15 2s-4.7 6.7-8
 16c-42 98.7-107.3 174.7-196 228-6.7 4.7-10.7 8-12 10-1.3 2-2 5.7-2 11zm100-26
v40h399900v-40zM0 435v40h400000v-40zm0 0v40h400000v-40z'/></svg>
<svg x='50%' width='50%' viewBox='0 0 400000 716' preserveAspectRatio='xMaxYMin
 slice'><path d='M399747 705c0 7.3 6.7 11 20 11 8 0 13-.8
 15-2.5s4.7-6.8 8-15.5c40-94 99.3-166.3 178-217 13.3-8 20.3-12.3 21-13 5.3-3.3
 8.5-5.8 9.5-7.5 1-1.7 1.5-5.2 1.5-10.5s-2.3-10.3-7-15H0v40h399908c-34 25.3
-64.7 57-92 95-27.3 38-48.7 77.7-64 119-3.3 8.7-5 14-5 16zM0 435v40h399900v-40z
m0-194v40h400000v-40zm0 0v40h400000v-40z'/></svg>`,

    linesegment: `><svg width='50.1%' viewBox='0 0 400000 414'
preserveAspectRatio='xMinYMin slice'><path d='M40 187V40H0
v334h40V227h399960v-40zm0 0V40H0v334h40V227h399960v-40z'/></svg><svg x='50%'
width='50%' viewBox='0 0 400000 414' preserveAspectRatio='xMaxYMin slice'>
<path d='M0 187v40h399960v147h40V40h-40v147zm0
 0v40h399960v147h40V40h-40v147z'/></svg>`,

    longequal: ` viewBox='0 0 100 334' preserveAspectRatio='none'>
<path d='M0 50h100v40H0zm0 194h100v40H0z'/>`,

    // mapsto is from glyph U+21A6 in font KaTeX Main
    mapsto: `><svg width='50.1%' viewBox='0 0 400000 522'
preserveAspectRatio='xMinYMin slice'><path d='M40 241c740
 0 0 0 0 0v-75c0-40.7-.2-64.3-.5-71-.3-6.7-2.2-11.7-5.5-15-4-4-8.7-6-14-6-5.3 0
-10 2-14 6C2.7 83.3.8 91.3.5 104 .2 116.7 0 169 0 261c0 114 .7 172.3 2 175 4 8
 10 12 18 12 5.3 0 10-2 14-6 3.3-3.3 5.2-8.3 5.5-15 .3-6.7.5-30.3.5-71v-75
h399960zm0 0v40h399960v-40z'/></svg><svg x='50%' width='50%' viewBox='0 0
 400000 522' preserveAspectRatio='xMaxYMin slice'>${svgPath["rightarrow"]}</svg>`,

    // overbrace is from glyphs U+23A9/23A8/23A7 in font KaTeX_Size4-Regular
    overbrace: `><svg width='25.5%' viewBox='0 0 400000 548'
preserveAspectRatio='xMinYMin slice'><path d='M6 548l-6-6
v-35l6-11c56-104 135.3-181.3 238-232 57.3-28.7 117-45 179-50h399577v120H403
c-43.3 7-81 15-113 26-100.7 33-179.7 91-237 174-2.7 5-6 9-10 13-.7 1-7.3 1-20 1
H6z'/></svg><svg x='25%' width='50%' viewBox='0 0 400000 548'
preserveAspectRatio='xMidYMin slice'><path d='M200428 334
c-100.7-8.3-195.3-44-280-108-55.3-42-101.7-93-139-153l-9-14c-2.7 4-5.7 8.7-9 14
-53.3 86.7-123.7 153-211 199-66.7 36-137.3 56.3-212 62H0V214h199568c178.3-11.7
 311.7-78.3 403-201 6-8 9.7-12 11-12 .7-.7 6.7-1 18-1s17.3.3 18 1c1.3 0 5 4 11
 12 44.7 59.3 101.3 106.3 170 141s145.3 54.3 229 60h199572v120z'/></svg>
<svg x='74.9%' width='24.1%' viewBox='0 0 400000 548'
preserveAspectRatio='xMaxYMin slice'><path d='M400000 542l
-6 6h-17c-12.7 0-19.3-.3-20-1-4-4-7.3-8.3-10-13-35.3-51.3-80.8-93.8-136.5-127.5
s-117.2-55.8-184.5-66.5c-.7 0-2-.3-4-1-18.7-2.7-76-4.3-172-5H0V214h399571l6 1
c124.7 8 235 61.7 331 161 31.3 33.3 59.7 72.7 85 118l7 13v35z'/></svg>`,

    // overgroup is from the MnSymbol package (public domain)
    overgroup: `><svg width='50.1%' viewBox='0 0 400000 342'
preserveAspectRatio='xMinYMin slice'><path d='M400000 80
H435C64 80 168.3 229.4 21 260c-5.9 1.2-18 0-18 0-2 0-3-1-3-3v-38C76 61 257 0
 435 0h399565z'/></svg><svg x='50%' width='50%' viewBox='0 0 400000 342'
preserveAspectRatio='xMaxYMin slice'><path d='M0 80h399565
c371 0 266.7 149.4 414 180 5.9 1.2 18 0 18 0 2 0 3-1 3-3v-38
c-76-158-257-219-435-219H0z'/></svg>`,

    // rightarrow is from glyph U+2192 in font KaTeX Main
    rightarrow: `><svg viewBox='0 0 400000 522' preserveAspectRatio='xMaxYMin
 slice'>${svgPath["rightarrow"]}</svg>`,

    // rightharpoon is from glyph U+21C0 in font KaTeX Main
    rightharpoon: `><svg viewBox='0 0 400000 522' preserveAspectRatio='xMaxYMin
 slice'><path d='M0 241v40h399993c4.7-4.7 7-9.3 7-14 0-9.3
-3.7-15.3-11-18-92.7-56.7-159-133.7-199-231-3.3-9.3-6-14.7-8-16-2-1.3-7-2-15-2
-10.7 0-16.7 2-18 6-2 2.7-1 9.7 3 21 15.3 42 36.7 81.8 64 119.5 27.3 37.7 58
 69.2 92 94.5zm0 0v40h399900v-40z'/></svg>`,

    // rightharpoondown is from glyph U+21C1 in font KaTeX Main
    rightharpoondown: `><svg viewBox='0 0 400000 522'
preserveAspectRatio='xMaxYMin slice'><path d='M399747 511
c0 7.3 6.7 11 20 11 8 0 13-.8 15-2.5s4.7-6.8 8-15.5c40-94 99.3-166.3 178-217
 13.3-8 20.3-12.3 21-13 5.3-3.3 8.5-5.8 9.5-7.5 1-1.7 1.5-5.2 1.5-10.5s-2.3
 -10.3-7-15H0v40h399908c-34 25.3-64.7 57-92 95-27.3 38-48.7 77.7-64 119-3.3
 8.7-5 14-5 16zM0 241v40h399900v-40z'/></svg>`,

    // rightleftharpoons is from glyph U+21CC in font KaTeX Main
    rightleftharpoons: `><svg width='50%' viewBox='0 0 400000 716'
preserveAspectRatio='xMinYMin slice'><path d='M7 435c-4 4
-6.3 8.7-7 14 0 5.3.7 9 2 11s5.3 5.3 12 10c90.7 54 156 130 196 228 3.3 10.7 6.3
 16.3 9 17 2 .7 5 1 9 1h5c10.7 0 16.7-2 18-6 2-2.7 1-9.7-3-21-32-87.3-82.7
-157.7-152-211l-3-3h399907v-40H7zm93 0v40h399900v-40zM0 241v40h399900v-40z
m0 0v40h399900v-40z'/></svg><svg x='50%' width='50%' viewBox='0 0 400000 716'
preserveAspectRatio='xMaxYMin slice'><path d='M0 241v40
h399993c4.7-4.7 7-9.3 7-14 0-9.3-3.7-15.3-11-18-92.7-56.7-159-133.7-199-231-3.3
-9.3-6-14.7-8-16-2-1.3-7-2-15-2-10.7 0-16.7 2-18 6-2 2.7-1 9.7 3 21 15.3 42
 36.7 81.8 64 119.5 27.3 37.7 58 69.2 92 94.5zm0 0v40h399900v-40z
 m100 194v40h399900v-40zm0 0v40h399900v-40z'/></svg>`,

    // tilde1 is a modified version of a glyph from the MnSymbol package
    tilde1: ` viewBox='0 0 600 260' preserveAspectRatio='none'>
<path d='M200 55.538c-77 0-168 73.953-177 73.953-3 0-7
-2.175-9-5.437L2 97c-1-2-2-4-2-6 0-4 2-7 5-9l20-12C116 12 171 0 207 0c86 0
 114 68 191 68 78 0 168-68 177-68 4 0 7 2 9 5l12 19c1 2.175 2 4.35 2 6.525 0
 4.35-2 7.613-5 9.788l-19 13.05c-92 63.077-116.937 75.308-183 76.128
-68.267.847-113-73.952-191-73.952z'/>`,

    // Ditto tilde2, tilde3, and tilde 4
    tilde2: ` viewBox='0 0 1033 286' preserveAspectRatio='none'>
<path d='M344 55.266c-142 0-300.638 81.316-311.5 86.418
-8.01 3.762-22.5 10.91-23.5 5.562L1 120c-1-2-1-3-1-4 0-5 3-9 8-10l18.4-9C160.9
 31.9 283 0 358 0c148 0 188 122 331 122s314-97 326-97c4 0 8 2 10 7l7 21.114
c1 2.14 1 3.21 1 4.28 0 5.347-3 9.626-7 10.696l-22.3 12.622C852.6 158.372 751
 181.476 676 181.476c-149 0-189-126.21-332-126.21z'/>`,

    tilde3: ` viewBox='0 0 2339 306' preserveAspectRatio='none'>
<path d='M786 59C457 59 32 175.242 13 175.242c-6 0-10-3.457
-11-10.37L.15 138c-1-7 3-12 10-13l19.2-6.4C378.4 40.7 634.3 0 804.3 0c337 0
 411.8 157 746.8 157 328 0 754-112 773-112 5 0 10 3 11 9l1 14.075c1 8.066-.697
 16.595-6.697 17.492l-21.052 7.31c-367.9 98.146-609.15 122.696-778.15 122.696
 -338 0-409-156.573-744-156.573z'/>`,

    tilde4: ` viewBox='0 0 2340 312' preserveAspectRatio='none'>
<path d='M786 58C457 58 32 177.487 13 177.487c-6 0-10-3.345
-11-10.035L.15 143c-1-7 3-12 10-13l22-6.7C381.2 35 637.15 0 807.15 0c337 0 409
 177 744 177 328 0 754-127 773-127 5 0 10 3 11 9l1 14.794c1 7.805-3 13.38-9
 14.495l-20.7 5.574c-366.85 99.79-607.3 139.372-776.3 139.372-338 0-409
 -175.236-744-175.236z'/>`,

    // tofrom is from glyph U+21C4 in font KaTeX AMS Regular
    tofrom: `><svg width='50.1%' viewBox='0 0 400000 528'
preserveAspectRatio='xMinYMin slice'><path d='M0 147h400000
v40H0zm0 214c68 40 115.7 95.7 143 167h22c15.3 0 23-.3 23-1 0-1.3-5.3-13.7-16-37
-18-35.3-41.3-69-70-101l-7-8h399905v-40H95l7-8c28.7-32 52-65.7 70-101 10.7-23.3
 16-35.7 16-37 0-.7-7.7-1-23-1h-22C115.7 265.3 68 321 0 361zm0-174v-40h399900
v40zm100 154v40h399900v-40z'/></svg><svg x='50%' width='50%' viewBox='0 0
 400000 528' preserveAspectRatio='xMaxYMin slice'><path
d='M400000 167c-70.7-42-118-97.7-142-167h-23c-15.3 0-23 .3-23 1 0 1.3 5.3 13.7
 16 37 18 35.3 41.3 69 70 101l7 8H0v40h399905l-7 8c-28.7 32-52 65.7-70 101-10.7
 23.3-16 35.7-16 37 0 .7 7.7 1 23 1h23c24-69.3 71.3-125 142-167z
 M100 147v40h399900v-40zM0 341v40h399900v-40z'/></svg>`,

    // twoheadleftarrow is from glyph U+219E in font KaTeX AMS Regular
    twoheadleftarrow: `><svg viewBox='0 0 400000 334'
preserveAspectRatio='xMinYMin slice'><path d='M0 167c68 40
 115.7 95.7 143 167h22c15.3 0 23-.3 23-1 0-1.3-5.3-13.7-16-37-18-35.3-41.3-69
-70-101l-7-8h125l9 7c50.7 39.3 85 86 103 140h46c0-4.7-6.3-18.7-19-42-18-35.3
-40-67.3-66-96l-9-9h399716v-40H284l9-9c26-28.7 48-60.7 66-96 12.7-23.333 19
-37.333 19-42h-46c-18 54-52.3 100.7-103 140l-9 7H95l7-8c28.7-32 52-65.7 70-101
 10.7-23.333 16-35.7 16-37 0-.7-7.7-1-23-1h-22C115.7 71.3 68 127 0 167z'/>
</svg>`,

    // twoheadrightarrow is from glyph U+21A0 in font KaTeX AMS Regular
    twoheadrightarrow: `><svg viewBox='0 0 400000 334'
preserveAspectRatio='xMaxYMin slice'><path d='M400000 167
c-68-40-115.7-95.7-143-167h-22c-15.3 0-23 .3-23 1 0 1.3 5.3 13.7 16 37 18 35.3
 41.3 69 70 101l7 8h-125l-9-7c-50.7-39.3-85-86-103-140h-46c0 4.7 6.3 18.7 19 42
 18 35.3 40 67.3 66 96l9 9H0v40h399716l-9 9c-26 28.7-48 60.7-66 96-12.7 23.333
-19 37.333-19 42h46c18-54 52.3-100.7 103-140l9-7h125l-7 8c-28.7 32-52 65.7-70
 101-10.7 23.333-16 35.7-16 37 0 .7 7.7 1 23 1h22c27.3-71.3 75-127 143-167z'/>
</svg>`,

    // underbrace is from glyphs U+23A9/23A8/23A7 in font KaTeX_Size4-Regular
    underbrace: `><svg width='25.1%' viewBox='0 0 400000 548'
preserveAspectRatio='xMinYMin slice'><path d='M0 6l6-6h17
c12.688 0 19.313.3 20 1 4 4 7.313 8.3 10 13 35.313 51.3 80.813 93.8 136.5 127.5
 55.688 33.7 117.188 55.8 184.5 66.5.688 0 2 .3 4 1 18.688 2.7 76 4.3 172 5
h399450v120H429l-6-1c-124.688-8-235-61.7-331-161C60.687 138.7 32.312 99.3 7 54
L0 41V6z'/></svg><svg x='25%' width='50%' viewBox='0 0 400000 548'
preserveAspectRatio='xMidYMin slice'><path d='M199572 214
c100.7 8.3 195.3 44 280 108 55.3 42 101.7 93 139 153l9 14c2.7-4 5.7-8.7 9-14
 53.3-86.7 123.7-153 211-199 66.7-36 137.3-56.3 212-62h199568v120H200432c-178.3
 11.7-311.7 78.3-403 201-6 8-9.7 12-11 12-.7.7-6.7 1-18 1s-17.3-.3-18-1c-1.3 0
-5-4-11-12-44.7-59.3-101.3-106.3-170-141s-145.3-54.3-229-60H0V214z'/></svg>
<svg x='74.9%' width='25.1%' viewBox='0 0 400000 548'
preserveAspectRatio='xMaxYMin slice'><path d='M399994 0l6 6
v35l-6 11c-56 104-135.3 181.3-238 232-57.3 28.7-117 45-179 50H-300V214h399897
c43.3-7 81-15 113-26 100.7-33 179.7-91 237-174 2.7-5 6-9 10-13 .7-1 7.3-1 20-1
h17z'/></svg>`,

    // undergroup is from the MnSymbol package (public domain)
    undergroup: `><svg width='50.1%' viewBox='0 0 400000 342'
preserveAspectRatio='xMinYMin slice'><path d='M400000 262
H435C64 262 168.3 112.6 21 82c-5.9-1.2-18 0-18 0-2 0-3 1-3 3v38c76 158 257 219
 435 219h399565z'/></svg><svg x='50%' width='50%' viewBox='0 0 400000 342'
preserveAspectRatio='xMaxYMin slice'><path d='M0 262h399565
c371 0 266.7-149.4 414-180 5.9-1.2 18 0 18 0 2 0 3 1 3 3v38c-76 158-257
 219-435 219H0z'/></svg>`,

    // widehat1 is a modified version of a glyph from the MnSymbol package
    widehat1: ` viewBox='0 0 1062 239' preserveAspectRatio='none'>
<path d='M529 0h5l519 115c5 1 9 5 9 10 0 1-1 2-1 3l-4 22
c-1 5-5 9-11 9h-2L532 67 19 159h-2c-5 0-9-4-11-9l-5-22c-1-6 2-12 8-13z'/>`,

    // Ditto widehat2, widehat3, and widehat4
    widehat2: ` viewBox='0 0 2364 300' preserveAspectRatio='none'>
<path d='M1181 0h2l1171 176c6 0 10 5 10 11l-2 23c-1 6-5 10
-11 10h-1L1182 67 15 220h-1c-6 0-10-4-11-10l-2-23c-1-6 4-11 10-11z'/>`,

    widehat3: ` viewBox='0 0 2364 360' preserveAspectRatio='none'>
<path d='M1181 0h2l1171 236c6 0 10 5 10 11l-2 23c-1 6-5 10
-11 10h-1L1182 67 15 280h-1c-6 0-10-4-11-10l-2-23c-1-6 4-11 10-11z'/>`,

    widehat4: ` viewBox='0 0 2364 420' preserveAspectRatio='none'>
<path d='M1181 0h2l1171 296c6 0 10 5 10 11l-2 23c-1 6-5 10
-11 10h-1L1182 67 15 340h-1c-6 0-10-4-11-10l-2-23c-1-6 4-11 10-11z'/>`,

    xcancel: `<line x1='0' y1='0' x2='100%' y2='100%' stroke-width='0.046em'/>
<line x1='0' y1='100%' x2='100%' y2='0' stroke-width='0.046em'/>`,
};

const svgSpan = function(group, options) {
    // Create a span with inline SVG for the element.
    const label = group.value.label.substr(1);
    let height = 0;
    let depth = 0;
    let imageName = "";
    let minWidth = 0;

    if (utils.contains(["widehat", "widetilde", "undertilde"], label)) {
        // There are four SVG images available for each function.
        // Choose a taller image when there are more characters.
        const numChars = group.value.value.length;
        if (numChars > 5) {
            height = 0.312;
            imageName = (label === "widehat" ? "widehat" : "tilde") + "4";
        } else {
            const imgIndex = [1, 1, 2, 2, 3, 3][numChars];
            if (label === "widehat") {
                height = [0, 0.24, 0.30, 0.30, 0.36, 0.36][numChars];
                imageName = "widehat" + imgIndex;
            } else {
                height = [0, 0.26, 0.30, 0.30, 0.34, 0.34][numChars];
                imageName = "tilde" + imgIndex;
            }
        }
    } else {
        const imgData = katexImagesData[label];
        height = imgData[0];
        depth = imgData[1];
        imageName = imgData[2];
        minWidth = imgData[3];
    }

    const span = buildCommon.makeSpan([], [], options);
    span.height = height;
    span.depth = depth;
    const totalHeight = height + depth;
    span.style.height = totalHeight + "em";
    if (minWidth > 0) {
        span.style.minWidth = minWidth + "em";
    }

    span.innerHTML =
     `<svg width='100%' height='${totalHeight}em'${innerSVG[imageName]}</svg>`;

    return span;
};

const encloseSpan = function(inner, label, pad, options) {
    // Return an image span for \cancel, \bcancel, \xcancel, or \fbox
    let img;
    const totalHeight = inner.height + inner.depth + 2 * pad;

    if (label === "fbox") {
        img = buildCommon.makeSpan(["stretchy", label], [], options);
        if (options.color) {
            img.style.borderColor = options.getColor();
        }
    } else {
        img = buildCommon.makeSpan([], [], options);
        img.innerHTML =
         `<svg width='100%' height='${totalHeight}em'>${innerSVG[label]}</svg>`;
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
