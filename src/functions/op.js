// @flow
// Limits, symbols
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import {SymbolNode} from "../domTree";
import * as mathMLTree from "../mathMLTree";
import utils from "../utils";
import Style from "../Style";
import {assertNodeType, checkNodeType} from "../parseNode";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

import type {HtmlBuilderSupSub, MathMLBuilder} from "../defineFunction";
import type {ParseNode} from "../parseNode";

// Most operators have a large successor symbol, but these don't.
const noSuccessor = [
    "\\smallint",
];

// NOTE: Unlike most `htmlBuilder`s, this one handles not only "op", but also
// "supsub" since some of them (like \int) can affect super/subscripting.
export const htmlBuilder: HtmlBuilderSupSub<"op"> = (grp, options) => {
    // Operators are handled in the TeXbook pg. 443-444, rule 13(a).
    let supGroup;
    let subGroup;
    let hasLimits = false;
    let group: ParseNode<"op">;
    const supSub = checkNodeType(grp, "supsub");
    if (supSub) {
        // If we have limits, supsub will pass us its group to handle. Pull
        // out the superscript and subscript and set the group to the op in
        // its base.
        supGroup = supSub.sup;
        subGroup = supSub.sub;
        group = assertNodeType(supSub.base, "op");
        hasLimits = true;
    } else {
        group = assertNodeType(grp, "op");
    }

    const style = options.style;

    let large = false;
    if (style.size === Style.DISPLAY.size &&
        group.symbol &&
        !utils.contains(noSuccessor, group.name)) {

        // Most symbol operators get larger in displaystyle (rule 13)
        large = true;
    }

    let base;
    if (group.symbol) {
        // If this is a symbol, create the symbol.
        const fontName = large ? "Size2-Regular" : "Size1-Regular";

        let stash = "";
        if (group.name === "\\oiint" || group.name === "\\oiiint") {
            // No font glyphs yet, so use a glyph w/o the oval.
            // TODO: When font glyphs are available, delete this code.
            stash = group.name.substr(1);
            // $FlowFixMe
            group.name = stash === "oiint" ? "\\iint" : "\\iiint";
        }

        base = buildCommon.makeSymbol(
            group.name, fontName, "math", options,
            ["mop", "op-symbol", large ? "large-op" : "small-op"]);

        if (stash.length > 0) {
            // We're in \oiint or \oiiint. Overlay the oval.
            // TODO: When font glyphs are available, delete this code.
            const italic = base.italic;
            const oval = buildCommon.staticSvg(stash + "Size"
                + (large ? "2" : "1"), options);
            base = buildCommon.makeVList({
                positionType: "individualShift",
                children: [
                    {type: "elem", elem: base, shift: 0},
                    {type: "elem", elem: oval, shift: large ? 0.08 : 0},
                ],
            }, options);
            // $FlowFixMe
            group.name = "\\" + stash;
            base.classes.unshift("mop");
            // $FlowFixMe
            base.italic = italic;
        }
    } else if (group.body) {
        // If this is a list, compose that list.
        const inner = html.buildExpression(group.body, options, true);
        if (inner.length === 1 && inner[0] instanceof SymbolNode) {
            base = inner[0];
            base.classes[0] = "mop"; // replace old mclass
        } else {
            base = buildCommon.makeSpan(
                ["mop"], buildCommon.tryCombineChars(inner), options);
        }
    } else {
        // Otherwise, this is a text operator. Build the text from the
        // operator's name.
        // TODO(emily): Add a space in the middle of some of these
        // operators, like \limsup
        const output = [];
        for (let i = 1; i < group.name.length; i++) {
            output.push(buildCommon.mathsym(group.name[i], group.mode));
        }
        base = buildCommon.makeSpan(["mop"], output, options);
    }

    // If content of op is a single symbol, shift it vertically.
    let baseShift = 0;
    let slant = 0;
    if ((base instanceof SymbolNode
        || group.name === "\\oiint" || group.name === "\\oiiint")
        && !group.suppressBaseShift) {
        // We suppress the shift of the base of \overset and \underset. Otherwise,
        // shift the symbol so its center lies on the axis (rule 13). It
        // appears that our fonts have the centers of the symbols already
        // almost on the axis, so these numbers are very small. Note we
        // don't actually apply this here, but instead it is used either in
        // the vlist creation or separately when there are no limits.
        baseShift = (base.height - base.depth) / 2 -
            options.fontMetrics().axisHeight;

        // The slant of the symbol is just its italic correction.
        // $FlowFixMe
        slant = base.italic;
    }

    if (hasLimits) {
        // IE 8 clips \int if it is in a display: inline-block. We wrap it
        // in a new span so it is an inline, and works.
        base = buildCommon.makeSpan([], [base]);

        let sub;
        let sup;
        // We manually have to handle the superscripts and subscripts. This,
        // aside from the kern calculations, is copied from supsub.
        if (supGroup) {
            const elem = html.buildGroup(
                supGroup, options.havingStyle(style.sup()), options);

            sup = {
                elem,
                kern: Math.max(
                    options.fontMetrics().bigOpSpacing1,
                    options.fontMetrics().bigOpSpacing3 - elem.depth),
            };
        }

        if (subGroup) {
            const elem = html.buildGroup(
                subGroup, options.havingStyle(style.sub()), options);

            sub = {
                elem,
                kern: Math.max(
                    options.fontMetrics().bigOpSpacing2,
                    options.fontMetrics().bigOpSpacing4 - elem.height),
            };
        }

        // Build the final group as a vlist of the possible subscript, base,
        // and possible superscript.
        let finalGroup;
        if (sup && sub) {
            const bottom = options.fontMetrics().bigOpSpacing5 +
                sub.elem.height + sub.elem.depth +
                sub.kern +
                base.depth + baseShift;

            finalGroup = buildCommon.makeVList({
                positionType: "bottom",
                positionData: bottom,
                children: [
                    {type: "kern", size: options.fontMetrics().bigOpSpacing5},
                    {type: "elem", elem: sub.elem, marginLeft: -slant + "em"},
                    {type: "kern", size: sub.kern},
                    {type: "elem", elem: base},
                    {type: "kern", size: sup.kern},
                    {type: "elem", elem: sup.elem, marginLeft: slant + "em"},
                    {type: "kern", size: options.fontMetrics().bigOpSpacing5},
                ],
            }, options);
        } else if (sub) {
            const top = base.height - baseShift;

            // Shift the limits by the slant of the symbol. Note
            // that we are supposed to shift the limits by 1/2 of the slant,
            // but since we are centering the limits adding a full slant of
            // margin will shift by 1/2 that.
            finalGroup = buildCommon.makeVList({
                positionType: "top",
                positionData: top,
                children: [
                    {type: "kern", size: options.fontMetrics().bigOpSpacing5},
                    {type: "elem", elem: sub.elem, marginLeft: -slant + "em"},
                    {type: "kern", size: sub.kern},
                    {type: "elem", elem: base},
                ],
            }, options);
        } else if (sup) {
            const bottom = base.depth + baseShift;

            finalGroup = buildCommon.makeVList({
                positionType: "bottom",
                positionData: bottom,
                children: [
                    {type: "elem", elem: base},
                    {type: "kern", size: sup.kern},
                    {type: "elem", elem: sup.elem, marginLeft: slant + "em"},
                    {type: "kern", size: options.fontMetrics().bigOpSpacing5},
                ],
            }, options);
        } else {
            // This case probably shouldn't occur (this would mean the
            // supsub was sending us a group with no superscript or
            // subscript) but be safe.
            return base;
        }

        return buildCommon.makeSpan(
            ["mop", "op-limits"], [finalGroup], options);
    } else {
        if (baseShift) {
            base.style.position = "relative";
            base.style.top = baseShift + "em";
        }

        return base;
    }
};

const mathmlBuilder: MathMLBuilder<"op"> = (group, options) => {
    let node;

    if (group.symbol) {
        // This is a symbol. Just add the symbol.
        node = new mathMLTree.MathNode(
            "mo", [mml.makeText(group.name, group.mode)]);
        if (utils.contains(noSuccessor, group.name)) {
            node.setAttribute("largeop", "false");
        }
    } else if (group.body) {
        // This is an operator with children. Add them.
        node = new mathMLTree.MathNode(
            "mo", mml.buildExpression(group.body, options));
    } else {
        // This is a text operator. Add all of the characters from the
        // operator's name.
        // TODO(emily): Add a space in the middle of some of these
        // operators, like \limsup.
        node = new mathMLTree.MathNode(
            "mi", [new mathMLTree.TextNode(group.name.slice(1))]);
        // Append an <mo>&ApplyFunction;</mo>.
        // ref: https://www.w3.org/TR/REC-MathML/chap3_2.html#sec3.2.4
        const operator = new mathMLTree.MathNode("mo",
            [mml.makeText("\u2061", "text")]);
        if (group.parentIsSupSub) {
            node = new mathMLTree.MathNode("mo", [node, operator]);
        } else {
            node = mathMLTree.newDocumentFragment([node, operator]);
        }
    }

    return node;
};

const singleCharBigOps: {[string]: string} = {
    "\u220F": "\\prod",
    "\u2210": "\\coprod",
    "\u2211": "\\sum",
    "\u22c0": "\\bigwedge",
    "\u22c1": "\\bigvee",
    "\u22c2": "\\bigcap",
    "\u22c3": "\\bigcup",
    "\u2a00": "\\bigodot",
    "\u2a01": "\\bigoplus",
    "\u2a02": "\\bigotimes",
    "\u2a04": "\\biguplus",
    "\u2a06": "\\bigsqcup",
};

defineFunction({
    type: "op",
    names: [
        "\\coprod", "\\bigvee", "\\bigwedge", "\\biguplus", "\\bigcap",
        "\\bigcup", "\\intop", "\\prod", "\\sum", "\\bigotimes",
        "\\bigoplus", "\\bigodot", "\\bigsqcup", "\\smallint", "\u220F",
        "\u2210", "\u2211", "\u22c0", "\u22c1", "\u22c2", "\u22c3", "\u2a00",
        "\u2a01", "\u2a02", "\u2a04", "\u2a06",
    ],
    props: {
        numArgs: 0,
    },
    handler: ({parser, funcName}, args) => {
        let fName = funcName;
        if (fName.length === 1) {
            fName = singleCharBigOps[fName];
        }
        return {
            type: "op",
            mode: parser.mode,
            limits: true,
            parentIsSupSub: false,
            symbol: true,
            name: fName,
        };
    },
    htmlBuilder,
    mathmlBuilder,
});

// Note: calling defineFunction with a type that's already been defined only
// works because the same htmlBuilder and mathmlBuilder are being used.
defineFunction({
    type: "op",
    names: ["\\mathop"],
    props: {
        numArgs: 1,
    },
    handler: ({parser}, args) => {
        const body = args[0];
        return {
            type: "op",
            mode: parser.mode,
            limits: false,
            parentIsSupSub: false,
            symbol: false,
            body: ordargument(body),
        };
    },
    htmlBuilder,
    mathmlBuilder,
});

// There are 2 flags for operators; whether they produce limits in
// displaystyle, and whether they are symbols and should grow in
// displaystyle. These four groups cover the four possible choices.

const singleCharIntegrals: {[string]: string} = {
    "\u222b": "\\int",
    "\u222c": "\\iint",
    "\u222d": "\\iiint",
    "\u222e": "\\oint",
    "\u222f": "\\oiint",
    "\u2230": "\\oiiint",
};

// No limits, not symbols
defineFunction({
    type: "op",
    names: [
        "\\arcsin", "\\arccos", "\\arctan", "\\arctg", "\\arcctg",
        "\\arg", "\\ch", "\\cos", "\\cosec", "\\cosh", "\\cot", "\\cotg",
        "\\coth", "\\csc", "\\ctg", "\\cth", "\\deg", "\\dim", "\\exp",
        "\\hom", "\\ker", "\\lg", "\\ln", "\\log", "\\sec", "\\sin",
        "\\sinh", "\\sh", "\\tan", "\\tanh", "\\tg", "\\th",
    ],
    props: {
        numArgs: 0,
    },
    handler({parser, funcName}) {
        return {
            type: "op",
            mode: parser.mode,
            limits: false,
            parentIsSupSub: false,
            symbol: false,
            name: funcName,
        };
    },
    htmlBuilder,
    mathmlBuilder,
});

// Limits, not symbols
defineFunction({
    type: "op",
    names: [
        "\\det", "\\gcd", "\\inf", "\\lim", "\\max", "\\min", "\\Pr", "\\sup",
    ],
    props: {
        numArgs: 0,
    },
    handler({parser, funcName}) {
        return {
            type: "op",
            mode: parser.mode,
            limits: true,
            parentIsSupSub: false,
            symbol: false,
            name: funcName,
        };
    },
    htmlBuilder,
    mathmlBuilder,
});

// No limits, symbols
defineFunction({
    type: "op",
    names: [
        "\\int", "\\iint", "\\iiint", "\\oint", "\\oiint", "\\oiiint",
        "\u222b", "\u222c", "\u222d", "\u222e", "\u222f", "\u2230",
    ],
    props: {
        numArgs: 0,
    },
    handler({parser, funcName}) {
        let fName = funcName;
        if (fName.length === 1) {
            fName = singleCharIntegrals[fName];
        }
        return {
            type: "op",
            mode: parser.mode,
            limits: false,
            parentIsSupSub: false,
            symbol: true,
            name: fName,
        };
    },
    htmlBuilder,
    mathmlBuilder,
});
