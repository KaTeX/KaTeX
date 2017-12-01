// @flow
// Limits, symbols
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import domTree from "../domTree";
import mathMLTree from "../mathMLTree";
import utils from "../utils";
import Style from "../Style";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

const htmlBuilder = (group, options) => {
    // Operators are handled in the TeXbook pg. 443-444, rule 13(a).
    let supGroup;
    let subGroup;
    let hasLimits = false;
    if (group.type === "supsub") {
        // If we have limits, supsub will pass us its group to handle. Pull
        // out the superscript and subscript and set the group to the op in
        // its base.
        supGroup = group.value.sup;
        subGroup = group.value.sub;
        group = group.value.base;
        hasLimits = true;
    }

    const style = options.style;

    // Most operators have a large successor symbol, but these don't.
    const noSuccessor = [
        "\\smallint",
    ];

    let large = false;
    if (style.size === Style.DISPLAY.size &&
        group.value.symbol &&
        !utils.contains(noSuccessor, group.value.body)) {

        // Most symbol operators get larger in displaystyle (rule 13)
        large = true;
    }

    let base;
    if (group.value.symbol) {
        // If this is a symbol, create the symbol.
        const fontName = large ? "Size2-Regular" : "Size1-Regular";
        base = buildCommon.makeSymbol(
            group.value.body, fontName, "math", options,
            ["mop", "op-symbol", large ? "large-op" : "small-op"]);
    } else if (group.value.value) {
        // If this is a list, compose that list.
        const inner = html.buildExpression(group.value.value, options, true);
        if (inner.length === 1 && inner[0] instanceof domTree.symbolNode) {
            base = inner[0];
            base.classes[0] = "mop"; // replace old mclass
        } else {
            base = buildCommon.makeSpan(["mop"], inner, options);
        }
    } else {
        // Otherwise, this is a text operator. Build the text from the
        // operator's name.
        // TODO(emily): Add a space in the middle of some of these
        // operators, like \limsup
        const output = [];
        for (let i = 1; i < group.value.body.length; i++) {
            output.push(buildCommon.mathsym(group.value.body[i], group.mode));
        }
        base = buildCommon.makeSpan(["mop"], output, options);
    }

    // If content of op is a single symbol, shift it vertically.
    let baseShift = 0;
    let slant = 0;
    if (base instanceof domTree.symbolNode) {
        // Shift the symbol so its center lies on the axis (rule 13). It
        // appears that our fonts have the centers of the symbols already
        // almost on the axis, so these numbers are very small. Note we
        // don't actually apply this here, but instead it is used either in
        // the vlist creation or separately when there are no limits.
        baseShift = (base.height - base.depth) / 2 -
            options.fontMetrics().axisHeight;

        // The slant of the symbol is just its italic correction.
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

const mathmlBuilder = (group, options) => {
    let node;

    // TODO(emily): handle big operators using the `largeop` attribute

    if (group.value.symbol) {
        // This is a symbol. Just add the symbol.
        node = new mathMLTree.MathNode(
            "mo", [mml.makeText(group.value.body, group.mode)]);
    } else if (group.value.value) {
        // This is an operator with children. Add them.
        node = new mathMLTree.MathNode(
            "mo", mml.buildExpression(group.value.value, options));
    } else {
        // This is a text operator. Add all of the characters from the
        // operator's name.
        // TODO(emily): Add a space in the middle of some of these
        // operators, like \limsup.
        node = new mathMLTree.MathNode(
            "mi", [new mathMLTree.TextNode(group.value.body.slice(1))]);

        // Append an <mo>&ApplyFunction;</mo>.
        // ref: https://www.w3.org/TR/REC-MathML/chap3_2.html#sec3.2.4
        const operator = new mathMLTree.MathNode("mo",
            [mml.makeText("\u2061", "text")]);

        return new domTree.documentFragment([node, operator]);
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
    "\u22c3": "\\bigcap",
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
    handler: (context, args) => {
        let fName = context.funcName;
        if (fName.length === 1) {
            fName = singleCharBigOps[fName];
        }
        return {
            type: "op",
            limits: true,
            symbol: true,
            body: fName,
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
    handler: (context, args) => {
        const body = args[0];
        return {
            type: "op",
            limits: false,
            symbol: false,
            value: ordargument(body),
        };
    },
    htmlBuilder,
    mathmlBuilder,
});
