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
import delimiter from "./delimiter";
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
const getTypeOfDomTree = function(node) {
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
            return isCharacterBox(base.value.base);
        } else if (base.type === "horizBrace") {
            const isSup = (group.value.sub ? false : true);
            return (isSup === base.value.isOver);
        } else {
            return null;
        }
    }
};

/**
 * Sometimes we want to pull out the innermost element of a group. In most
 * cases, this will just be the group itself, but when ordgroups and colors have
 * a single element, we want to pull that out.
 */
const getBaseElem = function(group) {
    if (!group) {
        return false;
    } else if (group.type === "ordgroup") {
        if (group.value.length === 1) {
            return getBaseElem(group.value[0]);
        } else {
            return group;
        }
    } else if (group.type === "color") {
        if (group.value.value.length === 1) {
            return getBaseElem(group.value.value[0]);
        } else {
            return group;
        }
    } else if (group.type === "font") {
        return getBaseElem(group.value.body);
    } else {
        return group;
    }
};

/**
 * TeXbook algorithms often reference "character boxes", which are simply groups
 * with a single character in them. To decide if something is a character box,
 * we find its innermost group, and see if it is a single character.
 */
const isCharacterBox = function(group) {
    const baseElem = getBaseElem(group);

    // These are all they types of groups which hold single characters
    return baseElem.type === "mathord" ||
        baseElem.type === "textord" ||
        baseElem.type === "bin" ||
        baseElem.type === "rel" ||
        baseElem.type === "inner" ||
        baseElem.type === "open" ||
        baseElem.type === "close" ||
        baseElem.type === "punct";
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

groupTypes.text = function(group, options) {
    const newOptions = options.withFont(group.value.font);
    const inner = buildExpression(group.value.body, newOptions, true);
    buildCommon.tryCombineChars(inner);
    return makeSpan(["mord", "text"],
        inner, newOptions);
};

groupTypes.color = function(group, options) {
    const elements = buildExpression(
        group.value.value,
        options.withColor(group.value.color),
        false
    );

    // \color isn't supposed to affect the type of the elements it contains.
    // To accomplish this, we wrap the results in a fragment, so the inner
    // elements will be able to directly interact with their neighbors. For
    // example, `\color{red}{2 +} 3` has the same spacing as `2 + 3`
    return new buildCommon.makeFragment(elements);
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
        if (!isCharacterBox(group.value.base)) {
            supShift = base.height - newOptions.fontMetrics().supDrop
                * newOptions.sizeMultiplier / options.sizeMultiplier;
        }
    }

    if (group.value.sub) {
        newOptions = options.havingStyle(options.style.sub());
        subm = buildGroup(group.value.sub, newOptions, options);
        if (!isCharacterBox(group.value.base)) {
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

        supsub = buildCommon.makeVList(vlistElem, "shift", subShift, options);
    } else if (!group.value.sub) {
        // Rule 18c, d
        supShift = Math.max(supShift, minSupShift,
            supm.depth + 0.25 * metrics.xHeight);

        supsub = buildCommon.makeVList([
            {type: "elem", elem: supm, marginRight: scriptspace},
        ], "shift", -supShift, options);
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

        supsub = buildCommon.makeVList(vlistElem, "individualShift", null, options);
    }

    // We ensure to wrap the supsub vlist in a span.msupsub to reset text-align
    const mclass = getTypeOfDomTree(base) || "mord";
    return makeSpan([mclass],
        [base, makeSpan(["msupsub"], [supsub])],
        options);
};

groupTypes.genfrac = function(group, options) {
    // Fractions are handled in the TeXbook on pages 444-445, rules 15(a-e).
    // Figure out what style this fraction should be in based on the
    // function used
    let style = options.style;
    if (group.value.size === "display") {
        style = Style.DISPLAY;
    } else if (group.value.size === "text") {
        style = Style.TEXT;
    }

    const nstyle = style.fracNum();
    const dstyle = style.fracDen();
    let newOptions;

    newOptions = options.havingStyle(nstyle);
    const numerm = buildGroup(group.value.numer, newOptions, options);

    newOptions = options.havingStyle(dstyle);
    const denomm = buildGroup(group.value.denom, newOptions, options);

    let rule;
    let ruleWidth;
    let ruleSpacing;
    if (group.value.hasBarLine) {
        rule = makeLineSpan("frac-line", options);
        ruleWidth = rule.height;
        ruleSpacing = rule.height;
    } else {
        rule = null;
        ruleWidth = 0;
        ruleSpacing = options.fontMetrics().defaultRuleThickness;
    }

    // Rule 15b
    let numShift;
    let clearance;
    let denomShift;
    if (style.size === Style.DISPLAY.size) {
        numShift = options.fontMetrics().num1;
        if (ruleWidth > 0) {
            clearance = 3 * ruleSpacing;
        } else {
            clearance = 7 * ruleSpacing;
        }
        denomShift = options.fontMetrics().denom1;
    } else {
        if (ruleWidth > 0) {
            numShift = options.fontMetrics().num2;
            clearance = ruleSpacing;
        } else {
            numShift = options.fontMetrics().num3;
            clearance = 3 * ruleSpacing;
        }
        denomShift = options.fontMetrics().denom2;
    }

    let frac;
    if (ruleWidth === 0) {
        // Rule 15c
        const candidateClearance =
            (numShift - numerm.depth) - (denomm.height - denomShift);
        if (candidateClearance < clearance) {
            numShift += 0.5 * (clearance - candidateClearance);
            denomShift += 0.5 * (clearance - candidateClearance);
        }

        frac = buildCommon.makeVList([
            {type: "elem", elem: denomm, shift: denomShift},
            {type: "elem", elem: numerm, shift: -numShift},
        ], "individualShift", null, options);
    } else {
        // Rule 15d
        const axisHeight = options.fontMetrics().axisHeight;

        if ((numShift - numerm.depth) - (axisHeight + 0.5 * ruleWidth) <
                clearance) {
            numShift +=
                clearance - ((numShift - numerm.depth) -
                             (axisHeight + 0.5 * ruleWidth));
        }

        if ((axisHeight - 0.5 * ruleWidth) - (denomm.height - denomShift) <
                clearance) {
            denomShift +=
                clearance - ((axisHeight - 0.5 * ruleWidth) -
                             (denomm.height - denomShift));
        }

        const midShift = -(axisHeight - 0.5 * ruleWidth);

        frac = buildCommon.makeVList([
            {type: "elem", elem: denomm, shift: denomShift},
            {type: "elem", elem: rule,   shift: midShift},
            {type: "elem", elem: numerm, shift: -numShift},
        ], "individualShift", null, options);
    }

    // Since we manually change the style sometimes (with \dfrac or \tfrac),
    // account for the possible size change here.
    newOptions = options.havingStyle(style);
    frac.height *= newOptions.sizeMultiplier / options.sizeMultiplier;
    frac.depth *= newOptions.sizeMultiplier / options.sizeMultiplier;

    // Rule 15e
    let delimSize;
    if (style.size === Style.DISPLAY.size) {
        delimSize = options.fontMetrics().delim1;
    } else {
        delimSize = options.fontMetrics().delim2;
    }

    let leftDelim;
    let rightDelim;
    if (group.value.leftDelim == null) {
        leftDelim = makeNullDelimiter(options, ["mopen"]);
    } else {
        leftDelim = delimiter.customSizedDelim(
            group.value.leftDelim, delimSize, true,
            options.havingStyle(style), group.mode, ["mopen"]);
    }
    if (group.value.rightDelim == null) {
        rightDelim = makeNullDelimiter(options, ["mclose"]);
    } else {
        rightDelim = delimiter.customSizedDelim(
            group.value.rightDelim, delimSize, true,
            options.havingStyle(style), group.mode, ["mclose"]);
    }

    return makeSpan(
        ["mord"].concat(newOptions.sizingClasses(options)),
        [leftDelim, makeSpan(["mfrac"], [frac]), rightDelim],
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

groupTypes.lap = function(group, options) {
    // mathllap, mathrlap, mathclap
    let inner;
    if (group.value.alignment === "clap") {
        // ref: https://www.math.lsu.edu/~aperlis/publications/mathclap/
        inner = makeSpan([], [buildGroup(group.value.body, options)]);
        // wrap, since CSS will center a .clap > .inner > span
        inner = makeSpan(["inner"], [inner], options);
    } else {
        inner = makeSpan(
            ["inner"], [buildGroup(group.value.body, options)]);
    }
    const fix = makeSpan(["fix"], []);
    return makeSpan(
        ["mord", group.value.alignment], [inner, fix], options);
};

groupTypes.smash = function(group, options) {
    const node = makeSpan(["mord"], [buildGroup(group.value.body, options)]);

    if (!group.value.smashHeight && !group.value.smashDepth) {
        return node;
    }

    if (group.value.smashHeight) {
        node.height = 0;
        // In order to influence makeVList, we have to reset the children.
        if (node.children) {
            for (let i = 0; i < node.children.length; i++) {
                node.children[i].height = 0;
            }
        }
    }

    if (group.value.smashDepth) {
        node.depth = 0;
        if (node.children) {
            for (let i = 0; i < node.children.length; i++) {
                node.children[i].depth = 0;
            }
        }
    }

    // At this point, we've reset the TeX-like height and depth values.
    // But the span still has an HTML line height.
    // makeVList applies "display: table-cell", which prevents the browser
    // from acting on that line height. So we'll call makeVList now.

    return buildCommon.makeVList([
        {type: "elem", elem: node},
    ], "firstBaseline", null, options);
};

groupTypes.op = function(group, options) {
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
        const inner = buildExpression(group.value.value, options, true);
        if (inner.length === 1 && inner[0] instanceof domTree.symbolNode) {
            base = inner[0];
            base.classes[0] = "mop"; // replace old mclass
        } else {
            base = makeSpan(["mop"], inner, options);
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
        base = makeSpan(["mop"], output, options);
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
        base = makeSpan([], [base]);

        let supm;
        let supKern;
        let subm;
        let subKern;
        let newOptions;
        // We manually have to handle the superscripts and subscripts. This,
        // aside from the kern calculations, is copied from supsub.
        if (supGroup) {
            newOptions = options.havingStyle(style.sup());
            supm = buildGroup(supGroup, newOptions, options);

            supKern = Math.max(
                options.fontMetrics().bigOpSpacing1,
                options.fontMetrics().bigOpSpacing3 - supm.depth);
        }

        if (subGroup) {
            newOptions = options.havingStyle(style.sub());
            subm = buildGroup(subGroup, newOptions, options);

            subKern = Math.max(
                options.fontMetrics().bigOpSpacing2,
                options.fontMetrics().bigOpSpacing4 - subm.height);
        }

        // Build the final group as a vlist of the possible subscript, base,
        // and possible superscript.
        let finalGroup;
        let top;
        let bottom;
        if (!supGroup) {
            top = base.height - baseShift;

            // Shift the limits by the slant of the symbol. Note
            // that we are supposed to shift the limits by 1/2 of the slant,
            // but since we are centering the limits adding a full slant of
            // margin will shift by 1/2 that.
            finalGroup = buildCommon.makeVList([
                {type: "kern", size: options.fontMetrics().bigOpSpacing5},
                {type: "elem", elem: subm, marginLeft: -slant + "em"},
                {type: "kern", size: subKern},
                {type: "elem", elem: base},
            ], "top", top, options);
        } else if (!subGroup) {
            bottom = base.depth + baseShift;

            finalGroup = buildCommon.makeVList([
                {type: "elem", elem: base},
                {type: "kern", size: supKern},
                {type: "elem", elem: supm, marginLeft: slant + "em"},
                {type: "kern", size: options.fontMetrics().bigOpSpacing5},
            ], "bottom", bottom, options);
        } else if (!supGroup && !subGroup) {
            // This case probably shouldn't occur (this would mean the
            // supsub was sending us a group with no superscript or
            // subscript) but be safe.
            return base;
        } else {
            bottom = options.fontMetrics().bigOpSpacing5 +
                subm.height + subm.depth +
                subKern +
                base.depth + baseShift;

            finalGroup = buildCommon.makeVList([
                {type: "kern", size: options.fontMetrics().bigOpSpacing5},
                {type: "elem", elem: subm, marginLeft: -slant + "em"},
                {type: "kern", size: subKern},
                {type: "elem", elem: base},
                {type: "kern", size: supKern},
                {type: "elem", elem: supm, marginLeft: slant + "em"},
                {type: "kern", size: options.fontMetrics().bigOpSpacing5},
            ], "bottom", bottom, options);
        }

        return makeSpan(["mop", "op-limits"], [finalGroup], options);
    } else {
        if (baseShift) {
            base.style.position = "relative";
            base.style.top = baseShift + "em";
        }

        return base;
    }
};

groupTypes.mod = function(group, options) {
    const inner = [];

    if (group.value.modType === "bmod") {
        // “\nonscript\mskip-\medmuskip\mkern5mu”
        if (!options.style.isTight()) {
            inner.push(makeSpan(
                ["mspace", "negativemediumspace"], [], options));
        }
        inner.push(makeSpan(["mspace", "thickspace"], [], options));
    } else if (options.style.size === Style.DISPLAY.size) {
        inner.push(makeSpan(["mspace", "quad"], [], options));
    } else if (group.value.modType === "mod") {
        inner.push(makeSpan(["mspace", "twelvemuspace"], [], options));
    } else {
        inner.push(makeSpan(["mspace", "eightmuspace"], [], options));
    }

    if (group.value.modType === "pod" || group.value.modType === "pmod") {
        inner.push(buildCommon.mathsym("(", group.mode));
    }

    if (group.value.modType !== "pod") {
        const modInner = [
            buildCommon.mathsym("m", group.mode),
            buildCommon.mathsym("o", group.mode),
            buildCommon.mathsym("d", group.mode)];
        if (group.value.modType === "bmod") {
            inner.push(makeSpan(["mbin"], modInner, options));
            // “\mkern5mu\nonscript\mskip-\medmuskip”
            inner.push(makeSpan(["mspace", "thickspace"], [], options));
            if (!options.style.isTight()) {
                inner.push(makeSpan(
                    ["mspace", "negativemediumspace"], [], options));
            }
        } else {
            Array.prototype.push.apply(inner, modInner);
            inner.push(makeSpan(["mspace", "sixmuspace"], [], options));
        }
    }

    if (group.value.value) {
        Array.prototype.push.apply(inner,
            buildExpression(group.value.value, options, false));
    }

    if (group.value.modType === "pod" || group.value.modType === "pmod") {
        inner.push(buildCommon.mathsym(")", group.mode));
    }

    return buildCommon.makeFragment(inner);
};

groupTypes.katex = function(group, options) {
    // The KaTeX logo. The offsets for the K and a were chosen to look
    // good, but the offsets for the T, E, and X were taken from the
    // definition of \TeX in TeX (see TeXbook pg. 356)
    const k = makeSpan(
        ["k"], [buildCommon.mathsym("K", group.mode)], options);
    const a = makeSpan(
        ["a"], [buildCommon.mathsym("A", group.mode)], options);

    a.height = (a.height + 0.2) * 0.75;
    a.depth = (a.height - 0.2) * 0.75;

    const t = makeSpan(
        ["t"], [buildCommon.mathsym("T", group.mode)], options);
    const e = makeSpan(
        ["e"], [buildCommon.mathsym("E", group.mode)], options);

    e.height = (e.height - 0.2155);
    e.depth = (e.depth + 0.2155);

    const x = makeSpan(
        ["x"], [buildCommon.mathsym("X", group.mode)], options);

    return makeSpan(
        ["mord", "katex-logo"], [k, a, t, e, x], options);
};

const makeLineSpan = function(className, options, thickness) {
    const line = makeSpan([className], [], options);
    line.height = thickness || options.fontMetrics().defaultRuleThickness;
    line.style.borderBottomWidth = line.height + "em";
    line.maxFontSize = 1.0;
    return line;
};

groupTypes.overline = function(group, options) {
    // Overlines are handled in the TeXbook pg 443, Rule 9.

    // Build the inner group in the cramped style.
    const innerGroup = buildGroup(group.value.body,
            options.havingCrampedStyle());

    // Create the line above the body
    const line = makeLineSpan("overline-line", options);

    // Generate the vlist, with the appropriate kerns
    const vlist = buildCommon.makeVList([
        {type: "elem", elem: innerGroup},
        {type: "kern", size: 3 * line.height},
        {type: "elem", elem: line},
        {type: "kern", size: line.height},
    ], "firstBaseline", null, options);

    return makeSpan(["mord", "overline"], [vlist], options);
};

groupTypes.underline = function(group, options) {
    // Underlines are handled in the TeXbook pg 443, Rule 10.
    // Build the inner group.
    const innerGroup = buildGroup(group.value.body, options);

    // Create the line above the body
    const line = makeLineSpan("underline-line", options);

    // Generate the vlist, with the appropriate kerns
    const vlist = buildCommon.makeVList([
        {type: "kern", size: line.height},
        {type: "elem", elem: line},
        {type: "kern", size: 3 * line.height},
        {type: "elem", elem: innerGroup},
    ], "top", innerGroup.height, options);

    return makeSpan(["mord", "underline"], [vlist], options);
};

groupTypes.sqrt = function(group, options) {
    // Square roots are handled in the TeXbook pg. 443, Rule 11.

    // First, we do the same steps as in overline to build the inner group
    // and line
    let inner = buildGroup(group.value.body, options.havingCrampedStyle());
    if (inner.height === 0) {
        // Render a small surd.
        inner.height = options.fontMetrics().xHeight;
    }

    // Some groups can return document fragments.  Handle those by wrapping
    // them in a span.
    if (inner instanceof domTree.documentFragment) {
        inner = makeSpan([], [inner], options);
    }

    // Calculate the minimum size for the \surd delimiter
    const metrics = options.fontMetrics();
    const theta = metrics.defaultRuleThickness;

    let phi = theta;
    if (options.style.id < Style.TEXT.id) {
        phi = options.fontMetrics().xHeight;
    }

    // Calculate the clearance between the body and line
    let lineClearance = theta + phi / 4;

    const minDelimiterHeight = (inner.height + inner.depth +
        lineClearance + theta) * options.sizeMultiplier;

    // Create a sqrt SVG of the required minimum size
    const img = delimiter.customSizedDelim("\\surd", minDelimiterHeight,
                    false, options, group.mode);

    // Calculate the actual line width.
    // This actually should depend on the chosen font -- e.g. \boldmath
    // should use the thicker surd symbols from e.g. KaTeX_Main-Bold, and
    // have thicker rules.
    const ruleWidth = options.fontMetrics().sqrtRuleThickness *
        img.sizeMultiplier;

    const delimDepth = img.height - ruleWidth;

    // Adjust the clearance based on the delimiter size
    if (delimDepth > inner.height + inner.depth + lineClearance) {
        lineClearance =
            (lineClearance + delimDepth - inner.height - inner.depth) / 2;
    }

    // Shift the sqrt image
    const imgShift = img.height - inner.height - lineClearance - ruleWidth;

    inner.style.paddingLeft = img.advanceWidth + "em";

    // Overlay the image and the argument.
    const body = buildCommon.makeVList([
        {type: "elem", elem: inner},
        {type: "kern", size: -(inner.height + imgShift)},
        {type: "elem", elem: img},
        {type: "kern", size: ruleWidth},
    ], "firstBaseline", null, options);
    body.children[0].children[0].classes.push("svg-align");

    if (!group.value.index) {
        return makeSpan(["mord", "sqrt"], [body], options);
    } else {
        // Handle the optional root index

        // The index is always in scriptscript style
        const newOptions = options.havingStyle(Style.SCRIPTSCRIPT);
        const rootm = buildGroup(group.value.index, newOptions, options);

        // The amount the index is shifted by. This is taken from the TeX
        // source, in the definition of `\r@@t`.
        const toShift = 0.6 * (body.height - body.depth);

        // Build a VList with the superscript shifted up correctly
        const rootVList = buildCommon.makeVList(
            [{type: "elem", elem: rootm}],
            "shift", -toShift, options);
        // Add a class surrounding it so we can add on the appropriate
        // kerning
        const rootVListWrap = makeSpan(["root"], [rootVList]);

        return makeSpan(["mord", "sqrt"],
            [rootVListWrap, body], options);
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
    return buildGroup(group.value.body, options.withFont(font));
};

groupTypes.verb = function(group, options) {
    const text = buildCommon.makeVerb(group, options);
    const body = [];
    // \verb enters text mode and therefore is sized like \textstyle
    const newOptions = options.havingStyle(options.style.text());
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '\xA0') {  // spaces appear as nonbreaking space
            // The space character isn't in the Typewriter-Regular font,
            // so we implement it as a kern of the same size as a character.
            // 0.525 is the width of a texttt character in LaTeX.
            // It automatically gets scaled by the font size.
            const rule = makeSpan(["mord", "rule"], [], newOptions);
            rule.style.marginLeft = "0.525em";
            body.push(rule);
        } else {
            body.push(buildCommon.makeSymbol(text[i], "Typewriter-Regular",
                group.mode, newOptions, ["mathtt"]));
        }
    }
    buildCommon.tryCombineChars(body);
    return makeSpan(["mord", "text"].concat(newOptions.sizingClasses(options)),
        body, newOptions);
};

groupTypes.rule = function(group, options) {
    // Make an empty span for the rule
    const rule = makeSpan(["mord", "rule"], [], options);

    // Calculate the shift, width, and height of the rule, and account for units
    let shift = 0;
    if (group.value.shift) {
        shift = calculateSize(group.value.shift, options);
    }

    const width = calculateSize(group.value.width, options);
    const height = calculateSize(group.value.height, options);

    // Style the rule to the right size
    rule.style.borderRightWidth = width + "em";
    rule.style.borderTopWidth = height + "em";
    rule.style.bottom = shift + "em";

    // Record the height and width
    rule.width = width;
    rule.height = height + shift;
    rule.depth = -shift;
    // Font size is the number large enough that the browser will
    // reserve at least `absHeight` space above the baseline.
    // The 1.125 factor was empirically determined
    rule.maxFontSize = height * 1.125 * options.sizeMultiplier;

    return rule;
};

groupTypes.kern = function(group, options) {
    // Make an empty span for the rule
    const rule = makeSpan(["mord", "rule"], [], options);

    if (group.value.dimension) {
        const dimension = calculateSize(group.value.dimension, options);
        rule.style.marginLeft = dimension + "em";
    }

    return rule;
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
    const mustShift = group.value.isShifty && isCharacterBox(base);

    // Calculate the skew of the accent. This is based on the line "If the
    // nucleus is not a single character, let s = 0; otherwise set s to the
    // kern amount for the nucleus followed by the \skewchar of its font."
    // Note that our skew metrics are just the kern between each character
    // and the skewchar.
    let skew = 0;
    if (mustShift) {
        // If the base is a character box, then we want the skew of the
        // innermost character. To do that, we find the innermost character:
        const baseChar = getBaseElem(base);
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
        const accent = buildCommon.makeSymbol(
            group.value.label, "Main-Regular", group.mode, options);
        // Remove the italic correction of the accent, because it only serves to
        // shift the accent over to a place we don't want.
        accent.italic = 0;

        // The \vec character that the fonts use is a combining character, and
        // thus shows up much too far to the left. To account for this, we add a
        // specific class which shifts the accent over to where we want it.
        // TODO(emily): Fix this in a better way, like by changing the font
        // Similarly, text accent \H is a combining character and
        // requires a different adjustment.
        let accentClass = null;
        if (group.value.label === "\\vec") {
            accentClass = "accent-vec";
        } else if (group.value.label === '\\H') {
            accentClass = "accent-hungarian";
        }

        accentBody = makeSpan([], [accent]);
        accentBody = makeSpan(["accent-body", accentClass], [accentBody]);

        // Shift the accent over by the skew. Note we shift by twice the skew
        // because we are centering the accent, so by adding 2*skew to the left,
        // we shift it to the right by 1*skew.
        accentBody.style.marginLeft = 2 * skew + "em";

        accentBody = buildCommon.makeVList([
            {type: "elem", elem: body},
            {type: "kern", size: -clearance},
            {type: "elem", elem: accentBody},
        ], "firstBaseline", null, options);

    } else {
        accentBody = stretchy.svgSpan(group, options);

        accentBody = buildCommon.makeVList([
            {type: "elem", elem: body},
            {type: "elem", elem: accentBody},
        ], "firstBaseline", null, options);

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
        vlist = buildCommon.makeVList([
            {type: "elem", elem: body},
            {type: "kern", size: 0.1},
            {type: "elem", elem: braceBody},
        ], "firstBaseline", null, options);
        vlist.children[0].children[0].children[1].classes.push("svg-align");
    } else {
        vlist = buildCommon.makeVList([
            {type: "elem", elem: braceBody},
            {type: "kern", size: 0.1},
            {type: "elem", elem: body},
        ], "bottom", body.depth + 0.1 + braceBody.height, options);
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
            vlist = buildCommon.makeVList([
                {type: "elem", elem: vSpan},
                {type: "kern", size: 0.2},
                {type: "elem", elem: supSubGroup},
            ], "firstBaseline", null, options);
        } else {
            vlist = buildCommon.makeVList([
                {type: "elem", elem: supSubGroup},
                {type: "kern", size: 0.2},
                {type: "elem", elem: vSpan},
            ], "bottom", vSpan.depth + 0.2 + supSubGroup.height,
            options);
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
    const vlist = buildCommon.makeVList([
        {type: "elem", elem: accentBody},
        {type: "kern", size: kern},
        {type: "elem", elem: innerGroup},
    ], "bottom", accentBody.height + kern, options);

    vlist.children[0].children[0].children[0].classes.push("svg-align");

    return makeSpan(["mord", "accentunder"], [vlist], options);
};

groupTypes.enclose = function(group, options) {
    // \cancel, \bcancel, \xcancel, \sout, \fbox, \colorbox, \fcolorbox
    const inner = buildGroup(group.value.body, options);

    const label = group.value.label.substr(1);
    const scale = options.sizeMultiplier;
    let img;
    let imgShift = 0;
    const isColorbox = /color/.test(label);

    if (label === "sout") {
        img = makeSpan(["stretchy", "sout"]);
        img.height = options.fontMetrics().defaultRuleThickness / scale;
        imgShift = -0.5 * options.fontMetrics().xHeight;

    } else {
        // Add horizontal padding
        inner.classes.push(/cancel/.test(label) ? "cancel-pad" : "boxpad");

        // Add vertical padding
        let vertPad = 0;
        // ref: LaTeX source2e: \fboxsep = 3pt;  \fboxrule = .4pt
        // ref: cancel package: \advance\totalheight2\p@ % "+2"
        if (/box/.test(label)) {
            vertPad = label === "colorbox" ? 0.3 : 0.34;
        } else {
            vertPad = isCharacterBox(group.value.body) ? 0.2 : 0;
        }

        img = stretchy.encloseSpan(inner, label, vertPad, options);
        imgShift = inner.depth + vertPad;

        if (isColorbox) {
            img.style.backgroundColor = group.value.backgroundColor.value;
            if (label === "fcolorbox") {
                img.style.borderColor = group.value.borderColor.value;
            }
        }
    }

    let vlist;
    if (isColorbox) {
        vlist = buildCommon.makeVList([
            // Put the color background behind inner;
            {type: "elem", elem: img, shift: imgShift},
            {type: "elem", elem: inner, shift: 0},
        ], "individualShift", null, options);
    } else {
        vlist = buildCommon.makeVList([
            // Write the \cancel stroke on top of inner.
            {type: "elem", elem: inner, shift: 0},
            {type: "elem", elem: img, shift: imgShift},
        ], "individualShift", null, options);
    }

    if (/cancel/.test(label)) {
        vlist.children[0].children[0].children[1].classes.push("svg-align");

        // cancel does not create horiz space for its line extension.
        // That is, not when adjacent to a mord.
        return makeSpan(["mord", "cancel-lap"], [vlist], options);
    } else {
        return makeSpan(["mord"], [vlist], options);
    }
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
        vlist = buildCommon.makeVList([
            {type: "elem", elem: upperGroup, shift: upperShift},
            {type: "elem", elem: arrowBody,  shift: arrowShift},
            {type: "elem", elem: lowerGroup, shift: lowerShift},
        ], "individualShift", null, options);
    } else {
        vlist = buildCommon.makeVList([
            {type: "elem", elem: upperGroup, shift: upperShift},
            {type: "elem", elem: arrowBody,  shift: arrowShift},
        ], "individualShift", null, options);
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
    return buildCommon.makeVList([{
        type: "elem",
        elem: body,
    }], "shift", -dy, options);
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
