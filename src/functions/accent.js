// @flow
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import utils from "../utils";
import stretchy from "../stretchy";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

const htmlBuilder = (group, options) => {
    // Accents are handled in the TeXbook pg. 443, rule 12.
    let base = group.value.base;

    let supsubGroup;
    if (group.type === "supsub") {
        // If our base is a character box, and we have superscripts and
        // subscripts, the supsub will defer to us. In particular, we want
        // to attach the superscripts and subscripts to the inner body (so
        // that the position of the superscripts and subscripts won't be
        // affected by the height of the accent). We accomplish this by
        // sticking the base of the accent into the base of the supsub, and
        // rendering that, while keeping track of where the accent is.

        // The supsub group is the group that was passed in
        const supsub = group;
        // The real accent group is the base of the supsub group
        group = supsub.value.base;
        // The character box is the base of the accent group
        base = group.value.base;
        // Stick the character box into the base of the supsub group
        supsub.value.base = base;

        // Rerender the supsub group with its new base, and store that
        // result.
        supsubGroup = html.buildGroup(supsub, options);
    }

    // Build the base group
    const body = html.buildGroup(base, options.havingCrampedStyle());

    // Does the accent need to shift for the skew of a character?
    const mustShift = group.value.isShifty && utils.isCharacterBox(base);

    // Calculate the skew of the accent. This is based on the line "If the
    // nucleus is not a single character, let s = 0; otherwise set s to the
    // kern amount for the nucleus followed by the \skewchar of its font."
    // Note that our skew metrics are just the kern between each character
    // and the skewchar.
    let skew = 0;
    if (mustShift) {
        // If the base is a character box, then we want the skew of the
        // innermost character. To do that, we find the innermost character:
        const baseChar = utils.getBaseElem(base);
        // Then, we render its group to get the symbol inside it
        const baseGroup = html.buildGroup(baseChar, options.havingCrampedStyle());
        // Finally, we pull the skew off of the symbol.
        skew = baseGroup.skew;
        // Note that we now throw away baseGroup, because the layers we
        // removed with getBaseElem might contain things like \color which
        // we can't get rid of.
        // TODO(emily): Find a better way to get the skew
    }

    const accentBelow = group.value.label === "\\c";

    // calculate the amount of space between the body and the accent
    let clearance = accentBelow
        ? body.height + body.depth
        : Math.min(
            body.height,
            options.fontMetrics().xHeight);

    // Build the accent
    let accentBody;
    if (!group.value.isStretchy) {
        let accent;
        let width: number;
        if (group.value.label === "\\vec") {
            // Before version 0.9, \vec used the combining font glyph U+20D7.
            // But browsers, especially Safari, are not consistent in how they
            // render combining characters when not preceded by a character.
            // So now we use an SVG.
            // If Safari reforms, we should consider reverting to the glyph.
            accent = buildCommon.staticSvg("vec", options);
            width = buildCommon.svgData.vec[1];
        } else {
            accent = buildCommon.makeSymbol(
                group.value.label, "Main-Regular", group.mode, options);
            // Remove the italic correction of the accent, because it only serves to
            // shift the accent over to a place we don't want.
            accent.italic = 0;
            width = accent.width;
            if (accentBelow) {
                clearance += accent.depth;
            }
        }

        accentBody = buildCommon.makeSpan(["accent-body"], [accent]);

        // CSS defines `.katex .accent .accent-body { width: 0 }`
        // so that the accent doesn't contribute to the bounding box.
        // We need to shift the character by its width (effectively half
        // its width) to compensate.
        let left = -width / 2;

        // Shift the accent over by the skew.
        left += skew;

        accentBody.style.left = left + "em";

        accentBody = buildCommon.makeVList({
            positionType: "firstBaseline",
            children: [
                {type: "elem", elem: body},
                {type: "kern", size: -clearance},
                {type: "elem", elem: accentBody},
            ],
        }, options);

    } else {
        accentBody = stretchy.svgSpan(group, options);

        accentBody = buildCommon.makeVList({
            positionType: "firstBaseline",
            children: [
                {type: "elem", elem: body},
                {
                    type: "elem",
                    elem: accentBody,
                    wrapperClasses: ["svg-align"],
                    wrapperStyle: skew > 0
                        ? {
                            width: `calc(100% - ${2 * skew}em)`,
                            marginLeft: `${(2 * skew)}em`,
                        }
                        : undefined,
                },
            ],
        }, options);
    }

    const accentWrap =
        buildCommon.makeSpan(["mord", "accent"], [accentBody], options);

    if (supsubGroup) {
        // Here, we replace the "base" child of the supsub with our newly
        // generated accent.
        supsubGroup.children[0] = accentWrap;

        // Since we don't rerun the height calculation after replacing the
        // accent, we manually recalculate height.
        supsubGroup.height = Math.max(accentWrap.height, supsubGroup.height);

        // Accents should always be ords, even when their innards are not.
        supsubGroup.classes[0] = "mord";

        return supsubGroup;
    } else {
        return accentWrap;
    }
};

const mathmlBuilder = (group, options) => {
    let accentNode;
    if (group.value.isStretchy) {
        accentNode = stretchy.mathMLnode(group.value.label);
    } else {
        accentNode = new mathMLTree.MathNode(
            "mo", [mml.makeText(group.value.label, group.mode)]);
    }

    const node = new mathMLTree.MathNode(
        "mover",
        [mml.buildGroup(group.value.base, options), accentNode]);

    node.setAttribute("accent", "true");

    return node;
};

const NON_STRETCHY_ACCENT_REGEX = new RegExp([
    "\\acute", "\\grave", "\\ddot", "\\tilde", "\\bar", "\\breve",
    "\\check", "\\hat", "\\vec", "\\dot", "\\mathring",
].map(accent => `\\${accent}`).join("|"));

// Accents
defineFunction({
    type: "accent",
    names: [
        "\\acute", "\\grave", "\\ddot", "\\tilde", "\\bar", "\\breve",
        "\\check", "\\hat", "\\vec", "\\dot", "\\mathring",
        "\\widehat", "\\widetilde", "\\overrightarrow", "\\overleftarrow",
        "\\Overrightarrow", "\\overleftrightarrow", "\\overgroup",
        "\\overlinesegment", "\\overleftharpoon", "\\overrightharpoon",
    ],
    props: {
        numArgs: 1,
    },
    handler: (context, args) => {
        const base = args[0];

        const isStretchy = !NON_STRETCHY_ACCENT_REGEX.test(context.funcName);
        const isShifty = !isStretchy ||
            context.funcName === "\\widehat" ||
            context.funcName === "\\widetilde";

        return {
            type: "accent",
            label: context.funcName,
            isStretchy: isStretchy,
            isShifty: isShifty,
            base: base,
        };
    },
    htmlBuilder,
    mathmlBuilder,
});

// Text-mode accents
defineFunction({
    type: "accent",
    names: [
        "\\'", "\\`", "\\^", "\\~", "\\=", "\\u", "\\.", '\\"',
        "\\r", "\\H", "\\v", "\\c",
    ],
    props: {
        numArgs: 1,
        allowedInText: true,
        allowedInMath: false,
    },
    handler: (context, args) => {
        const base = args[0];

        return {
            type: "accent",
            label: context.funcName,
            isStretchy: false,
            isShifty: true,
            base: base,
        };
    },
    htmlBuilder,
    mathmlBuilder,
});
