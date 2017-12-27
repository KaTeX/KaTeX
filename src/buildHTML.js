/**
 * WARNING: New methods on groupTypes should be added to src/functions.
 *
 * This file does the main work of building a domTree structure from a parse
 * tree. The entry point is the `buildHTML` function, which takes a parse tree.
 * Then, the buildExpression, buildGroup, and various groupTypes functions are
 * called, to produce a final HTML tree.
 */

import ParseError from "./ParseError";
import Style from "./Style";

import buildCommon from "./buildCommon";
import domTree from "./domTree";
import { calculateSize } from "./units";
import utils from "./utils";
import stretchy from "./stretchy";

const makeSpan = buildCommon.makeSpan;

const isSpace = function(node) {
    return node instanceof domTree.span && node.classes[0] === "mspace";
};

// Binary atoms (first class `mbin`) change into ordinary atoms (`mord`)
// depending on their surroundings. See TeXbook pg. 442-446, Rules 5 and 6,
// and the text before Rule 19.
const isBin = function(node) {
    return node && node.classes[0] === "mbin";
};

const isBinLeftCanceller = function(node, isRealGroup) {
    // TODO: This code assumes that a node's math class is the first element
    // of its `classes` array. A later cleanup should ensure this, for
    // instance by changing the signature of `makeSpan`.
    if (node) {
        return utils.contains(["mbin", "mopen", "mrel", "mop", "mpunct"],
                              node.classes[0]);
    } else {
        return isRealGroup;
    }
};

const isBinRightCanceller = function(node, isRealGroup) {
    if (node) {
        return utils.contains(["mrel", "mclose", "mpunct"], node.classes[0]);
    } else {
        return isRealGroup;
    }
};

/**
 * Splice out any spaces from `children` starting at position `i`, and return
 * the spliced-out array. Returns null if `children[i]` does not exist or is not
 * a space.
 */
export const spliceSpaces = function(children, i) {
    let j = i;
    while (j < children.length && isSpace(children[j])) {
        j++;
    }
    if (j === i) {
        return null;
    } else {
        return children.splice(i, j - i);
    }
};

/**
 * Take a list of nodes, build them in order, and return a list of the built
 * nodes. documentFragments are flattened into their contents, so the
 * returned list contains no fragments. `isRealGroup` is true if `expression`
 * is a real group (no atoms will be added on either side), as opposed to
 * a partial group (e.g. one created by \color).
 */
export const buildExpression = function(expression, options, isRealGroup) {
    // Parse expressions into `groups`.
    const groups = [];
    for (let i = 0; i < expression.length; i++) {
        const group = expression[i];
        const output = buildGroup(group, options);
        if (output instanceof domTree.documentFragment) {
            Array.prototype.push.apply(groups, output.children);
        } else {
            groups.push(output);
        }
    }
    // At this point `groups` consists entirely of `symbolNode`s and `span`s.

    // Explicit spaces (e.g., \;, \,) should be ignored with respect to atom
    // spacing (e.g., "add thick space between mord and mrel"). Since CSS
    // adjacency rules implement atom spacing, spaces should be invisible to
    // CSS. So we splice them out of `groups` and into the atoms themselves.
    for (let i = 0; i < groups.length; i++) {
        const spaces = spliceSpaces(groups, i);
        if (spaces) {
            // Splicing of spaces may have removed all remaining groups.
            if (i < groups.length) {
                // If there is a following group, move space within it.
                if (groups[i] instanceof domTree.symbolNode) {
                    groups[i] = makeSpan([].concat(groups[i].classes),
                        [groups[i]]);
                }
                buildCommon.prependChildren(groups[i], spaces);
            } else {
                // Otherwise, put any spaces back at the end of the groups.
                Array.prototype.push.apply(groups, spaces);
                break;
            }
        }
    }

    // Binary operators change to ordinary symbols in some contexts.
    for (let i = 0; i < groups.length; i++) {
        if (isBin(groups[i])
            && (isBinLeftCanceller(groups[i - 1], isRealGroup)
                || isBinRightCanceller(groups[i + 1], isRealGroup))) {
            groups[i].classes[0] = "mord";
        }
    }

    // Process \\not commands within the group.
    // TODO(kevinb): Handle multiple \\not commands in a row.
    // TODO(kevinb): Handle \\not{abc} correctly.  The \\not should appear over
    // the 'a' instead of the 'c'.
    for (let i = 0; i < groups.length; i++) {
        if (groups[i].value === "\u0338" && i + 1 < groups.length) {
            const children = groups.slice(i, i + 2);

            children[0].classes = ["mainrm"];
            // \u0338 is a combining glyph so we could reorder the children so
            // that it comes after the other glyph.  This works correctly on
            // most browsers except for Safari.  Instead we absolutely position
            // the glyph and set its right side to match that of the other
            // glyph which is visually equivalent.
            children[0].style.position = "absolute";
            children[0].style.right = "0";

            // Copy the classes from the second glyph to the new container.
            // This is so it behaves the same as though there was no \\not.
            const classes = groups[i + 1].classes;
            const container = makeSpan(classes, children);

            // LaTeX adds a space between ords separated by a \\not.
            if (classes.indexOf("mord") !== -1) {
                // \glue(\thickmuskip) 2.77771 plus 2.77771
                container.style.paddingLeft = "0.277771em";
            }

            // Ensure that the \u0338 is positioned relative to the container.
            container.style.position = "relative";
            groups.splice(i, 2, container);
        }
    }

    return groups;
};

// Return math atom class (mclass) of a domTree.
export const getTypeOfDomTree = function(node) {
    if (node instanceof domTree.documentFragment) {
        if (node.children.length) {
            return getTypeOfDomTree(
                node.children[node.children.length - 1]);
        }
    } else {
        if (utils.contains([
            "mord", "mop", "mbin", "mrel", "mopen", "mclose",
            "mpunct", "minner",
        ], node.classes[0])) {
            return node.classes[0];
        }
    }
    return null;
};

/**
 * Sometimes, groups perform special rules when they have superscripts or
 * subscripts attached to them. This function lets the `supsub` group know that
 * its inner element should handle the superscripts and subscripts instead of
 * handling them itself.
 */
const shouldHandleSupSub = function(group, options) {
    if (!group.value.base) {
        return false;
    } else {
        const base = group.value.base;
        if (base.type === "op") {
            // Operators handle supsubs differently when they have limits
            // (e.g. `\displaystyle\sum_2^3`)
            return base.value.limits &&
                (options.style.size === Style.DISPLAY.size ||
                base.value.alwaysHandleSupSub);
        } else if (base.type === "accent") {
            return utils.isCharacterBox(base.value.base);
        } else if (base.type === "horizBrace") {
            const isSup = (group.value.sub ? false : true);
            return (isSup === base.value.isOver);
        } else {
            return null;
        }
    }
};

export const makeNullDelimiter = function(options, classes) {
    const moreClasses = ["nulldelimiter"].concat(options.baseSizingClasses());
    return makeSpan(classes.concat(moreClasses));
};

/**
 * This is a map of group types to the function used to handle that type.
 * Simpler types come at the beginning, while complicated types come afterwards.
 */
export const groupTypes = {};

groupTypes.mathord = function(group, options) {
    return buildCommon.makeOrd(group, options, "mathord");
};

groupTypes.textord = function(group, options) {
    return buildCommon.makeOrd(group, options, "textord");
};

groupTypes.bin = function(group, options) {
    return buildCommon.mathsym(
        group.value, group.mode, options, ["mbin"]);
};

groupTypes.rel = function(group, options) {
    return buildCommon.mathsym(
        group.value, group.mode, options, ["mrel"]);
};

groupTypes.open = function(group, options) {
    return buildCommon.mathsym(
        group.value, group.mode, options, ["mopen"]);
};

groupTypes.close = function(group, options) {
    return buildCommon.mathsym(
        group.value, group.mode, options, ["mclose"]);
};

groupTypes.inner = function(group, options) {
    return buildCommon.mathsym(
        group.value, group.mode, options, ["minner"]);
};

groupTypes.punct = function(group, options) {
    return buildCommon.mathsym(
        group.value, group.mode, options, ["mpunct"]);
};

groupTypes.ordgroup = function(group, options) {
    return makeSpan(["mord"],
        buildExpression(group.value, options, true),
        options
    );
};

groupTypes.supsub = function(group, options) {
    // Superscript and subscripts are handled in the TeXbook on page
    // 445-446, rules 18(a-f).

    // Here is where we defer to the inner group if it should handle
    // superscripts and subscripts itself.
    if (shouldHandleSupSub(group, options)) {
        return groupTypes[group.value.base.type](group, options);
    }

    const base = buildGroup(group.value.base, options);
    let supm;
    let subm;

    const metrics = options.fontMetrics();
    let newOptions;

    // Rule 18a
    let supShift = 0;
    let subShift = 0;

    if (group.value.sup) {
        newOptions = options.havingStyle(options.style.sup());
        supm = buildGroup(group.value.sup, newOptions, options);
        if (!utils.isCharacterBox(group.value.base)) {
            supShift = base.height - newOptions.fontMetrics().supDrop
                * newOptions.sizeMultiplier / options.sizeMultiplier;
        }
    }

    if (group.value.sub) {
        newOptions = options.havingStyle(options.style.sub());
        subm = buildGroup(group.value.sub, newOptions, options);
        if (!utils.isCharacterBox(group.value.base)) {
            subShift = base.depth + newOptions.fontMetrics().subDrop
                * newOptions.sizeMultiplier / options.sizeMultiplier;
        }
    }

    // Rule 18c
    let minSupShift;
    if (options.style === Style.DISPLAY) {
        minSupShift = metrics.sup1;
    } else if (options.style.cramped) {
        minSupShift = metrics.sup3;
    } else {
        minSupShift = metrics.sup2;
    }

    // scriptspace is a font-size-independent size, so scale it
    // appropriately
    const multiplier = options.sizeMultiplier;
    const scriptspace =
        (0.5 / metrics.ptPerEm) / multiplier + "em";

    let supsub;
    if (!group.value.sup) {
        // Rule 18b
        subShift = Math.max(
            subShift, metrics.sub1,
            subm.height - 0.8 * metrics.xHeight);

        const vlistElem = [{type: "elem", elem: subm, marginRight: scriptspace}];
        // Subscripts shouldn't be shifted by the base's italic correction.
        // Account for that by shifting the subscript back the appropriate
        // amount. Note we only do this when the base is a single symbol.
        if (base instanceof domTree.symbolNode) {
            vlistElem[0].marginLeft = -base.italic + "em";
        }

        supsub = buildCommon.makeVList({
            positionType: "shift",
            positionData: subShift,
            children: vlistElem,
        }, options);
    } else if (!group.value.sub) {
        // Rule 18c, d
        supShift = Math.max(supShift, minSupShift,
            supm.depth + 0.25 * metrics.xHeight);

        supsub = buildCommon.makeVList({
            positionType: "shift",
            positionData: -supShift,
            children: [{type: "elem", elem: supm, marginRight: scriptspace}],
        }, options);
    } else {
        supShift = Math.max(
            supShift, minSupShift, supm.depth + 0.25 * metrics.xHeight);
        subShift = Math.max(subShift, metrics.sub2);

        const ruleWidth = metrics.defaultRuleThickness;

        // Rule 18e
        if ((supShift - supm.depth) - (subm.height - subShift) <
                4 * ruleWidth) {
            subShift = 4 * ruleWidth - (supShift - supm.depth) + subm.height;
            const psi = 0.8 * metrics.xHeight - (supShift - supm.depth);
            if (psi > 0) {
                supShift += psi;
                subShift -= psi;
            }
        }

        const vlistElem = [
            {type: "elem", elem: subm, shift: subShift, marginRight: scriptspace},
            {type: "elem", elem: supm, shift: -supShift, marginRight: scriptspace},
        ];
        // See comment above about subscripts not being shifted
        if (base instanceof domTree.symbolNode) {
            vlistElem[0].marginLeft = -base.italic + "em";
        }

        supsub = buildCommon.makeVList({
            positionType: "individualShift",
            children: vlistElem,
        }, options);
    }

    // We ensure to wrap the supsub vlist in a span.msupsub to reset text-align
    const mclass = getTypeOfDomTree(base) || "mord";
    return makeSpan([mclass],
        [base, makeSpan(["msupsub"], [supsub])],
        options);
};

groupTypes.spacing = function(group, options) {
    if (group.value === "\\ " || group.value === "\\space" ||
        group.value === " " || group.value === "~") {
        // Spaces are generated by adding an actual space. Each of these
        // things has an entry in the symbols table, so these will be turned
        // into appropriate outputs.
        if (group.mode === "text") {
            return buildCommon.makeOrd(group, options, "textord");
        } else {
            return makeSpan(["mspace"],
                [buildCommon.mathsym(group.value, group.mode, options)],
                options);
        }
    } else {
        // Other kinds of spaces are of arbitrary width. We use CSS to
        // generate these.
        return makeSpan(
            ["mspace", buildCommon.spacingFunctions[group.value].className],
            [], options);
    }
};

function sizingGroup(value, options, baseOptions) {
    const inner = buildExpression(value, options, false);
    const multiplier = options.sizeMultiplier / baseOptions.sizeMultiplier;

    // Add size-resetting classes to the inner list and set maxFontSize
    // manually. Handle nested size changes.
    for (let i = 0; i < inner.length; i++) {
        const pos = utils.indexOf(inner[i].classes, "sizing");
        if (pos < 0) {
            Array.prototype.push.apply(inner[i].classes,
                options.sizingClasses(baseOptions));
        } else if (inner[i].classes[pos + 1] === "reset-size" + options.size) {
            // This is a nested size change: e.g., inner[i] is the "b" in
            // `\Huge a \small b`. Override the old size (the `reset-` class)
            // but not the new size.
            inner[i].classes[pos + 1] = "reset-size" + baseOptions.size;
        }

        inner[i].height *= multiplier;
        inner[i].depth *= multiplier;
    }

    return buildCommon.makeFragment(inner);
}

groupTypes.sizing = function(group, options) {
    // Handle sizing operators like \Huge. Real TeX doesn't actually allow
    // these functions inside of math expressions, so we do some special
    // handling.
    const newOptions = options.havingSize(group.value.size);
    return sizingGroup(group.value.value, newOptions, options);
};

groupTypes.styling = function(group, options) {
    // Style changes are handled in the TeXbook on pg. 442, Rule 3.

    // Figure out what style we're changing to.
    const styleMap = {
        "display": Style.DISPLAY,
        "text": Style.TEXT,
        "script": Style.SCRIPT,
        "scriptscript": Style.SCRIPTSCRIPT,
    };

    const newStyle = styleMap[group.value.style];
    const newOptions = options.havingStyle(newStyle);
    return sizingGroup(group.value.value, newOptions, options);
};

groupTypes.font = function(group, options) {
    const font = group.value.font;
    return buildGroup(group.value.body, options.withFontFamily(font));
};

groupTypes.accent = function(group, options) {
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
        supsubGroup = buildGroup(supsub, options);
    }

    // Build the base group
    const body = buildGroup(base, options.havingCrampedStyle());

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
        const baseGroup = buildGroup(baseChar, options.havingCrampedStyle());
        // Finally, we pull the skew off of the symbol.
        skew = baseGroup.skew;
        // Note that we now throw away baseGroup, because the layers we
        // removed with getBaseElem might contain things like \color which
        // we can't get rid of.
        // TODO(emily): Find a better way to get the skew
    }

    // calculate the amount of space between the body and the accent
    const clearance = Math.min(
        body.height,
        options.fontMetrics().xHeight);

    // Build the accent
    let accentBody;
    if (!group.value.isStretchy) {
        let accent;
        if (group.value.label === "\\vec") {
            // Before version 0.9, \vec used the combining font glyph U+20D7.
            // But browsers, especially Safari, are not consistent in how they
            // render combining characters when not preceded by a character.
            // So now we use an SVG.
            // If Safari reforms, we should consider reverting to the glyph.
            accent = buildCommon.staticSvg("vec", options);
            accent.width = parseFloat(accent.style.width);
        } else {
            accent = buildCommon.makeSymbol(
                group.value.label, "Main-Regular", group.mode, options);
        }
        // Remove the italic correction of the accent, because it only serves to
        // shift the accent over to a place we don't want.
        accent.italic = 0;

        accentBody = makeSpan(["accent-body"], [accent]);

        // CSS defines `.katex .accent .accent-body { width: 0 }`
        // so that the accent doesn't contribute to the bounding box.
        // We need to shift the character by its width (effectively half
        // its width) to compensate.
        let left = -accent.width / 2;

        // Shift the accent over by the skew.
        left += skew;

        // The \H character that the fonts use is a combining character, and
        // thus shows up much too far to the left. To account for this, we add
        // a manual shift of the width of one space.
        // TODO(emily): Fix this in a better way, like by changing the font
        if (group.value.label === '\\H') {
            left += 0.5;  // twice width of space, or width of accent
        }

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
                {type: "elem", elem: accentBody},
            ],
        }, options);

        const styleSpan = accentBody.children[0].children[0].children[1];
        styleSpan.classes.push("svg-align");  // text-align: left;
        if (skew > 0) {
            // Shorten the accent and nudge it to the right.
            styleSpan.style.width = `calc(100% - ${2 * skew}em)`;
            styleSpan.style.marginLeft = (2 * skew) + "em";
        }
    }

    const accentWrap = makeSpan(["mord", "accent"], [accentBody], options);

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

groupTypes.horizBrace = function(group, options) {
    const style = options.style;

    const hasSupSub = (group.type === "supsub");
    let supSubGroup;
    let newOptions;
    if (hasSupSub) {
        // Ref: LaTeX source2e: }}}}\limits}
        // i.e. LaTeX treats the brace similar to an op and passes it
        // with \limits, so we need to assign supsub style.
        if (group.value.sup) {
            newOptions = options.havingStyle(style.sup());
            supSubGroup = buildGroup(group.value.sup, newOptions, options);
        } else {
            newOptions = options.havingStyle(style.sub());
            supSubGroup = buildGroup(group.value.sub, newOptions, options);
        }
        group = group.value.base;
    }

    // Build the base group
    const body = buildGroup(
       group.value.base, options.havingBaseStyle(Style.DISPLAY));

    // Create the stretchy element
    const braceBody = stretchy.svgSpan(group, options);

    // Generate the vlist, with the appropriate kerns               ┏━━━━━━━━┓
    // This first vlist contains the subject matter and the brace:   equation
    let vlist;
    if (group.value.isOver) {
        vlist = buildCommon.makeVList({
            positionType: "firstBaseline",
            children: [
                {type: "elem", elem: body},
                {type: "kern", size: 0.1},
                {type: "elem", elem: braceBody},
            ],
        }, options);
        vlist.children[0].children[0].children[1].classes.push("svg-align");
    } else {
        vlist = buildCommon.makeVList({
            positionType: "bottom",
            positionData: body.depth + 0.1 + braceBody.height,
            children: [
                {type: "elem", elem: braceBody},
                {type: "kern", size: 0.1},
                {type: "elem", elem: body},
            ],
        }, options);
        vlist.children[0].children[0].children[0].classes.push("svg-align");
    }

    if (hasSupSub) {
        // In order to write the supsub, wrap the first vlist in another vlist:
        // They can't all go in the same vlist, because the note might be wider
        // than the equation. We want the equation to control the brace width.

        //      note          long note           long note
        //   ┏━━━━━━━━┓   or    ┏━━━┓     not    ┏━━━━━━━━━┓
        //    equation           eqn                 eqn

        const vSpan = makeSpan(["mord",
            (group.value.isOver ? "mover" : "munder")],
            [vlist], options);

        if (group.value.isOver) {
            vlist = buildCommon.makeVList({
                positionType: "firstBaseline",
                children: [
                    {type: "elem", elem: vSpan},
                    {type: "kern", size: 0.2},
                    {type: "elem", elem: supSubGroup},
                ],
            }, options);
        } else {
            vlist = buildCommon.makeVList({
                positionType: "bottom",
                positionData: vSpan.depth + 0.2 + supSubGroup.height,
                children: [
                    {type: "elem", elem: supSubGroup},
                    {type: "kern", size: 0.2},
                    {type: "elem", elem: vSpan},
                ],
            }, options);
        }
    }

    return makeSpan(["mord", (group.value.isOver ? "mover" : "munder")],
        [vlist], options);
};

groupTypes.accentUnder = function(group, options) {
    // Treat under accents much like underlines.
    const innerGroup = buildGroup(group.value.base, options);

    const accentBody = stretchy.svgSpan(group, options);
    const kern = (/tilde/.test(group.value.label) ? 0.12 : 0);

    // Generate the vlist, with the appropriate kerns
    const vlist = buildCommon.makeVList({
        positionType: "bottom",
        positionData: accentBody.height + kern,
        children: [
            {type: "elem", elem: accentBody},
            {type: "kern", size: kern},
            {type: "elem", elem: innerGroup},
        ],
    }, options);

    vlist.children[0].children[0].children[0].classes.push("svg-align");

    return makeSpan(["mord", "accentunder"], [vlist], options);
};

groupTypes.xArrow = function(group, options) {
    const style = options.style;

    // Build the argument groups in the appropriate style.
    // Ref: amsmath.dtx:   \hbox{$\scriptstyle\mkern#3mu{#6}\mkern#4mu$}%

    let newOptions = options.havingStyle(style.sup());
    const upperGroup = buildGroup(group.value.body, newOptions, options);
    upperGroup.classes.push("x-arrow-pad");

    let lowerGroup;
    if (group.value.below) {
        // Build the lower group
        newOptions = options.havingStyle(style.sub());
        lowerGroup = buildGroup(group.value.below, newOptions, options);
        lowerGroup.classes.push("x-arrow-pad");
    }

    const arrowBody = stretchy.svgSpan(group, options);

    // Re shift: Note that stretchy.svgSpan returned arrowBody.depth = 0.
    // The point we want on the math axis is at 0.5 * arrowBody.height.
    const arrowShift = -options.fontMetrics().axisHeight +
        0.5 * arrowBody.height;
    // 2 mu kern. Ref: amsmath.dtx: #7\if0#2\else\mkern#2mu\fi
    const upperShift = -options.fontMetrics().axisHeight -
        0.5 * arrowBody.height - 0.111;

    // Generate the vlist
    let vlist;
    if (group.value.below) {
        const lowerShift = -options.fontMetrics().axisHeight
            + lowerGroup.height + 0.5 * arrowBody.height
            + 0.111;
        vlist = buildCommon.makeVList({
            positionType: "individualShift",
            children: [
                {type: "elem", elem: upperGroup, shift: upperShift},
                {type: "elem", elem: arrowBody,  shift: arrowShift},
                {type: "elem", elem: lowerGroup, shift: lowerShift},
            ],
        }, options);
    } else {
        vlist = buildCommon.makeVList({
            positionType: "individualShift",
            children: [
                {type: "elem", elem: upperGroup, shift: upperShift},
                {type: "elem", elem: arrowBody,  shift: arrowShift},
            ],
        }, options);
    }

    vlist.children[0].children[0].children[1].classes.push("svg-align");

    return makeSpan(["mrel", "x-arrow"], [vlist], options);
};

groupTypes.mclass = function(group, options) {
    const elements = buildExpression(group.value.value, options, true);

    return makeSpan([group.value.mclass], elements, options);
};

groupTypes.raisebox = function(group, options) {
    const body = groupTypes.sizing({value: {
        value: [{
            type: "text",
            value: {
                body: group.value.value,
                font: "mathrm", // simulate \textrm
            },
        }],
        size: 6,                // simulate \normalsize
    }}, options);
    const dy = calculateSize(group.value.dy.value, options);
    return buildCommon.makeVList({
        positionType: "shift",
        positionData: -dy,
        children: [{type: "elem", elem: body}],
    }, options);
};

/**
 * buildGroup is the function that takes a group and calls the correct groupType
 * function for it. It also handles the interaction of size and style changes
 * between parents and children.
 */
export const buildGroup = function(group, options, baseOptions) {
    if (!group) {
        return makeSpan();
    }

    if (groupTypes[group.type]) {
        // Call the groupTypes function
        let groupNode = groupTypes[group.type](group, options);

        // If the size changed between the parent and the current group, account
        // for that size difference.
        if (baseOptions && options.size !== baseOptions.size) {
            groupNode = makeSpan(options.sizingClasses(baseOptions),
                [groupNode], options);

            const multiplier = options.sizeMultiplier /
                baseOptions.sizeMultiplier;

            groupNode.height *= multiplier;
            groupNode.depth *= multiplier;
        }

        return groupNode;
    } else {
        throw new ParseError(
            "Got group of unknown type: '" + group.type + "'");
    }
};

/**
 * Take an entire parse tree, and build it into an appropriate set of HTML
 * nodes.
 */
export default function buildHTML(tree, options) {
    // buildExpression is destructive, so we need to make a clone
    // of the incoming tree so that it isn't accidentally changed
    tree = JSON.parse(JSON.stringify(tree));

    // Build the expression contained in the tree
    const expression = buildExpression(tree, options, true);
    const body = makeSpan(["base"], expression, options);

    // Add struts, which ensure that the top of the HTML element falls at the
    // height of the expression, and the bottom of the HTML element falls at the
    // depth of the expression.
    const topStrut = makeSpan(["strut"]);
    const bottomStrut = makeSpan(["strut", "bottom"]);

    topStrut.style.height = body.height + "em";
    bottomStrut.style.height = (body.height + body.depth) + "em";
    // We'd like to use `vertical-align: top` but in IE 9 this lowers the
    // baseline of the box to the bottom of this strut (instead staying in the
    // normal place) so we use an absolute value for vertical-align instead
    bottomStrut.style.verticalAlign = -body.depth + "em";

    // Wrap the struts and body together
    const htmlNode = makeSpan(["katex-html"], [topStrut, bottomStrut, body]);

    htmlNode.setAttribute("aria-hidden", "true");

    return htmlNode;
}
