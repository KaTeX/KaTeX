/* eslint no-console:0 */
/**
 * This file does the main work of building a domTree structure from a parse
 * tree. The entry point is the `buildHTML` function, which takes a parse tree.
 * Then, the buildExpression, buildGroup, and various groupTypes functions are
 * called, to produce a final HTML tree.
 */

const ParseError = require("./ParseError");
const Style = require("./Style");

const buildCommon = require("./buildCommon");
const delimiter = require("./delimiter");
const domTree = require("./domTree");
const fontMetrics = require("./fontMetrics");
const utils = require("./utils");

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
 * Take a list of nodes, build them in order, and return a list of the built
 * nodes. documentFragments are flattened into their contents, so the
 * returned list contains no fragments. `isRealGroup` is true if `expression`
 * is a real group (no atoms will be added on either side), as opposed to
 * a partial group (e.g. one created by \color).
 */
const buildExpression = function(expression, options, isRealGroup) {
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
    let spaces = null;
    for (let i = 0; i < groups.length; i++) {
        if (isSpace(groups[i])) {
            spaces = spaces || [];
            spaces.push(groups[i]);
            groups.splice(i, 1);
            i--;
        } else if (spaces) {
            if (groups[i] instanceof domTree.symbolNode) {
                groups[i] = makeSpan([].concat(groups[i].classes), [groups[i]]);
            }
            buildCommon.prependChildren(groups[i], spaces);
            spaces = null;
        }
    }
    if (spaces) {
        Array.prototype.push.apply(groups, spaces);
    }

    // Binary operators change to ordinary symbols in some contexts.
    for (let i = 0; i < groups.length; i++) {
        if (isBin(groups[i])
            && (isBinLeftCanceller(groups[i - 1], isRealGroup)
                || isBinRightCanceller(groups[i + 1], isRealGroup))) {
            groups[i].classes[0] = "mord";
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
    if (!group) {
        return false;
    } else if (group.type === "op") {
        // Operators handle supsubs differently when they have limits
        // (e.g. `\displaystyle\sum_2^3`)
        return group.value.limits &&
            (options.style.size === Style.DISPLAY.size ||
            group.value.alwaysHandleSupSub);
    } else if (group.type === "accent") {
        return isCharacterBox(group.value.base);
    } else {
        return null;
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

const makeNullDelimiter = function(options, classes) {
    return makeSpan(classes.concat([
        "sizing", "reset-" + options.size, "size5",
        options.style.reset(), Style.TEXT.cls(),
        "nulldelimiter"]));
};

/**
 * This is a map of group types to the function used to handle that type.
 * Simpler types come at the beginning, while complicated types come afterwards.
 */
const groupTypes = {};

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
    return makeSpan(
        ["mord", options.style.cls()],
        buildExpression(group.value, options.reset(), true),
        options
    );
};

groupTypes.text = function(group, options) {
    const newOptions = options.withFont(group.value.style);
    const inner = buildExpression(group.value.body, newOptions, true);
    for (let i = 0; i < inner.length - 1; i++) {
        if (inner[i].tryCombine(inner[i + 1])) {
            inner.splice(i + 1, 1);
            i--;
        }
    }
    return makeSpan(["mord", "text", newOptions.style.cls()],
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
    if (shouldHandleSupSub(group.value.base, options)) {
        return groupTypes[group.value.base.type](group, options);
    }

    const base = buildGroup(group.value.base, options.reset());
    let supmid;
    let submid;
    let sup;
    let sub;

    const style = options.style;
    let newOptions;

    if (group.value.sup) {
        newOptions = options.withStyle(style.sup());
        sup = buildGroup(group.value.sup, newOptions);
        supmid = makeSpan([style.reset(), style.sup().cls()],
            [sup], newOptions);
    }

    if (group.value.sub) {
        newOptions = options.withStyle(style.sub());
        sub = buildGroup(group.value.sub, newOptions);
        submid = makeSpan([style.reset(), style.sub().cls()],
            [sub], newOptions);
    }

    // Rule 18a
    let supShift;
    let subShift;
    if (isCharacterBox(group.value.base)) {
        supShift = 0;
        subShift = 0;
    } else {
        supShift = base.height - style.metrics.supDrop;
        subShift = base.depth + style.metrics.subDrop;
    }

    // Rule 18c
    let minSupShift;
    if (style === Style.DISPLAY) {
        minSupShift = style.metrics.sup1;
    } else if (style.cramped) {
        minSupShift = style.metrics.sup3;
    } else {
        minSupShift = style.metrics.sup2;
    }

    // scriptspace is a font-size-independent size, so scale it
    // appropriately
    const multiplier = Style.TEXT.sizeMultiplier *
            style.sizeMultiplier;
    const scriptspace =
        (0.5 / fontMetrics.metrics.ptPerEm) / multiplier + "em";

    let supsub;
    if (!group.value.sup) {
        // Rule 18b
        subShift = Math.max(
            subShift, style.metrics.sub1,
            sub.height - 0.8 * style.metrics.xHeight);

        supsub = buildCommon.makeVList([
            {type: "elem", elem: submid},
        ], "shift", subShift, options);

        supsub.children[0].style.marginRight = scriptspace;

        // Subscripts shouldn't be shifted by the base's italic correction.
        // Account for that by shifting the subscript back the appropriate
        // amount. Note we only do this when the base is a single symbol.
        if (base instanceof domTree.symbolNode) {
            supsub.children[0].style.marginLeft = -base.italic + "em";
        }
    } else if (!group.value.sub) {
        // Rule 18c, d
        supShift = Math.max(supShift, minSupShift,
            sup.depth + 0.25 * style.metrics.xHeight);

        supsub = buildCommon.makeVList([
            {type: "elem", elem: supmid},
        ], "shift", -supShift, options);

        supsub.children[0].style.marginRight = scriptspace;
    } else {
        supShift = Math.max(
            supShift, minSupShift, sup.depth + 0.25 * style.metrics.xHeight);
        subShift = Math.max(subShift, style.metrics.sub2);

        const ruleWidth = fontMetrics.metrics.defaultRuleThickness;

        // Rule 18e
        if ((supShift - sup.depth) - (sub.height - subShift) <
                4 * ruleWidth) {
            subShift = 4 * ruleWidth - (supShift - sup.depth) + sub.height;
            const psi = 0.8 * style.metrics.xHeight - (supShift - sup.depth);
            if (psi > 0) {
                supShift += psi;
                subShift -= psi;
            }
        }

        supsub = buildCommon.makeVList([
            {type: "elem", elem: submid, shift: subShift},
            {type: "elem", elem: supmid, shift: -supShift},
        ], "individualShift", null, options);

        // See comment above about subscripts not being shifted
        if (base instanceof domTree.symbolNode) {
            supsub.children[0].style.marginLeft = -base.italic + "em";
        }

        supsub.children[0].style.marginRight = scriptspace;
        supsub.children[1].style.marginRight = scriptspace;
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

    newOptions = options.withStyle(nstyle);
    const numer = buildGroup(group.value.numer, newOptions);
    const numerreset = makeSpan([style.reset(), nstyle.cls()],
        [numer], newOptions);

    newOptions = options.withStyle(dstyle);
    const denom = buildGroup(group.value.denom, newOptions);
    const denomreset = makeSpan([style.reset(), dstyle.cls()],
        [denom], newOptions);

    let ruleWidth;
    if (group.value.hasBarLine) {
        ruleWidth = fontMetrics.metrics.defaultRuleThickness /
            options.style.sizeMultiplier;
    } else {
        ruleWidth = 0;
    }

    // Rule 15b
    let numShift;
    let clearance;
    let denomShift;
    if (style.size === Style.DISPLAY.size) {
        numShift = style.metrics.num1;
        if (ruleWidth > 0) {
            clearance = 3 * ruleWidth;
        } else {
            clearance = 7 * fontMetrics.metrics.defaultRuleThickness;
        }
        denomShift = style.metrics.denom1;
    } else {
        if (ruleWidth > 0) {
            numShift = style.metrics.num2;
            clearance = ruleWidth;
        } else {
            numShift = style.metrics.num3;
            clearance = 3 * fontMetrics.metrics.defaultRuleThickness;
        }
        denomShift = style.metrics.denom2;
    }

    let frac;
    if (ruleWidth === 0) {
        // Rule 15c
        const candidateClearance =
            (numShift - numer.depth) - (denom.height - denomShift);
        if (candidateClearance < clearance) {
            numShift += 0.5 * (clearance - candidateClearance);
            denomShift += 0.5 * (clearance - candidateClearance);
        }

        frac = buildCommon.makeVList([
            {type: "elem", elem: denomreset, shift: denomShift},
            {type: "elem", elem: numerreset, shift: -numShift},
        ], "individualShift", null, options);
    } else {
        // Rule 15d
        const axisHeight = style.metrics.axisHeight;

        if ((numShift - numer.depth) - (axisHeight + 0.5 * ruleWidth) <
                clearance) {
            numShift +=
                clearance - ((numShift - numer.depth) -
                             (axisHeight + 0.5 * ruleWidth));
        }

        if ((axisHeight - 0.5 * ruleWidth) - (denom.height - denomShift) <
                clearance) {
            denomShift +=
                clearance - ((axisHeight - 0.5 * ruleWidth) -
                             (denom.height - denomShift));
        }

        const mid = makeSpan(
            [options.style.reset(), Style.TEXT.cls(), "frac-line"]);
        // Manually set the height of the line because its height is
        // created in CSS
        mid.height = ruleWidth;

        const midShift = -(axisHeight - 0.5 * ruleWidth);

        frac = buildCommon.makeVList([
            {type: "elem", elem: denomreset, shift: denomShift},
            {type: "elem", elem: mid,        shift: midShift},
            {type: "elem", elem: numerreset, shift: -numShift},
        ], "individualShift", null, options);
    }

    // Since we manually change the style sometimes (with \dfrac or \tfrac),
    // account for the possible size change here.
    frac.height *= style.sizeMultiplier / options.style.sizeMultiplier;
    frac.depth *= style.sizeMultiplier / options.style.sizeMultiplier;

    // Rule 15e
    let delimSize;
    if (style.size === Style.DISPLAY.size) {
        delimSize = style.metrics.delim1;
    } else {
        delimSize = style.metrics.delim2;
    }

    let leftDelim;
    let rightDelim;
    if (group.value.leftDelim == null) {
        leftDelim = makeNullDelimiter(options, ["mopen"]);
    } else {
        leftDelim = delimiter.customSizedDelim(
            group.value.leftDelim, delimSize, true,
            options.withStyle(style), group.mode, ["mopen"]);
    }
    if (group.value.rightDelim == null) {
        rightDelim = makeNullDelimiter(options, ["mclose"]);
    } else {
        rightDelim = delimiter.customSizedDelim(
            group.value.rightDelim, delimSize, true,
            options.withStyle(style), group.mode, ["mclose"]);
    }

    return makeSpan(
        ["mord", options.style.reset(), style.cls()],
        [leftDelim, makeSpan(["mfrac"], [frac]), rightDelim],
        options);
};

const calculateSize = function(sizeValue, style) {
    let x = sizeValue.number;
    if (sizeValue.unit === "ex") {
        x *= style.metrics.emPerEx;
    } else if (sizeValue.unit === "mu") {
        x /= 18;
    }
    return x;
};

groupTypes.array = function(group, options) {
    let r;
    let c;
    const nr = group.value.body.length;
    let nc = 0;
    let body = new Array(nr);

    const style = options.style;

    // Horizontal spacing
    const pt = 1 / fontMetrics.metrics.ptPerEm;
    const arraycolsep = 5 * pt; // \arraycolsep in article.cls

    // Vertical spacing
    const baselineskip = 12 * pt; // see size10.clo
    // Default \arraystretch from lttab.dtx
    // TODO(gagern): may get redefined once we have user-defined macros
    const arraystretch = utils.deflt(group.value.arraystretch, 1);
    const arrayskip = arraystretch * baselineskip;
    const arstrutHeight = 0.7 * arrayskip; // \strutbox in ltfsstrc.dtx and
    const arstrutDepth = 0.3 * arrayskip;  // \@arstrutbox in lttab.dtx

    let totalHeight = 0;
    for (r = 0; r < group.value.body.length; ++r) {
        const inrow = group.value.body[r];
        let height = arstrutHeight; // \@array adds an \@arstrut
        let depth = arstrutDepth;   // to each tow (via the template)

        if (nc < inrow.length) {
            nc = inrow.length;
        }

        const outrow = new Array(inrow.length);
        for (c = 0; c < inrow.length; ++c) {
            const elt = buildGroup(inrow[c], options);
            if (depth < elt.depth) {
                depth = elt.depth;
            }
            if (height < elt.height) {
                height = elt.height;
            }
            outrow[c] = elt;
        }

        let gap = 0;
        if (group.value.rowGaps[r]) {
            gap = calculateSize(group.value.rowGaps[r].value, style);
            if (gap > 0) { // \@argarraycr
                gap += arstrutDepth;
                if (depth < gap) {
                    depth = gap; // \@xargarraycr
                }
                gap = 0;
            }
        }

        outrow.height = height;
        outrow.depth = depth;
        totalHeight += height;
        outrow.pos = totalHeight;
        totalHeight += depth + gap; // \@yargarraycr
        body[r] = outrow;
    }

    const offset = totalHeight / 2 + style.metrics.axisHeight;
    const colDescriptions = group.value.cols || [];
    const cols = [];
    let colSep;
    let colDescrNum;
    for (c = 0, colDescrNum = 0;
         // Continue while either there are more columns or more column
         // descriptions, so trailing separators don't get lost.
         c < nc || colDescrNum < colDescriptions.length;
         ++c, ++colDescrNum) {

        let colDescr = colDescriptions[colDescrNum] || {};

        let firstSeparator = true;
        while (colDescr.type === "separator") {
            // If there is more than one separator in a row, add a space
            // between them.
            if (!firstSeparator) {
                colSep = makeSpan(["arraycolsep"], []);
                colSep.style.width =
                    fontMetrics.metrics.doubleRuleSep + "em";
                cols.push(colSep);
            }

            if (colDescr.separator === "|") {
                const separator = makeSpan(
                    ["vertical-separator"],
                    []);
                separator.style.height = totalHeight + "em";
                separator.style.verticalAlign =
                    -(totalHeight - offset) + "em";

                cols.push(separator);
            } else {
                throw new ParseError(
                    "Invalid separator type: " + colDescr.separator);
            }

            colDescrNum++;
            colDescr = colDescriptions[colDescrNum] || {};
            firstSeparator = false;
        }

        if (c >= nc) {
            continue;
        }

        let sepwidth;
        if (c > 0 || group.value.hskipBeforeAndAfter) {
            sepwidth = utils.deflt(colDescr.pregap, arraycolsep);
            if (sepwidth !== 0) {
                colSep = makeSpan(["arraycolsep"], []);
                colSep.style.width = sepwidth + "em";
                cols.push(colSep);
            }
        }

        let col = [];
        for (r = 0; r < nr; ++r) {
            const row = body[r];
            const elem = row[c];
            if (!elem) {
                continue;
            }
            const shift = row.pos - offset;
            elem.depth = row.depth;
            elem.height = row.height;
            col.push({type: "elem", elem: elem, shift: shift});
        }

        col = buildCommon.makeVList(col, "individualShift", null, options);
        col = makeSpan(
            ["col-align-" + (colDescr.align || "c")],
            [col]);
        cols.push(col);

        if (c < nc - 1 || group.value.hskipBeforeAndAfter) {
            sepwidth = utils.deflt(colDescr.postgap, arraycolsep);
            if (sepwidth !== 0) {
                colSep = makeSpan(["arraycolsep"], []);
                colSep.style.width = sepwidth + "em";
                cols.push(colSep);
            }
        }
    }
    body = makeSpan(["mtable"], cols);
    return makeSpan(["mord"], [body], options);
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

groupTypes.llap = function(group, options) {
    const inner = makeSpan(
        ["inner"], [buildGroup(group.value.body, options.reset())]);
    const fix = makeSpan(["fix"], []);
    return makeSpan(
        ["mord", "llap", options.style.cls()], [inner, fix], options);
};

groupTypes.rlap = function(group, options) {
    const inner = makeSpan(
        ["inner"], [buildGroup(group.value.body, options.reset())]);
    const fix = makeSpan(["fix"], []);
    return makeSpan(
        ["mord", "rlap", options.style.cls()], [inner, fix], options);
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
    let baseShift = 0;
    let slant = 0;
    if (group.value.symbol) {
        // If this is a symbol, create the symbol.
        const fontName = large ? "Size2-Regular" : "Size1-Regular";
        base = buildCommon.makeSymbol(
            group.value.body, fontName, "math", options,
            ["mop", "op-symbol", large ? "large-op" : "small-op"]);

        // Shift the symbol so its center lies on the axis (rule 13). It
        // appears that our fonts have the centers of the symbols already
        // almost on the axis, so these numbers are very small. Note we
        // don't actually apply this here, but instead it is used either in
        // the vlist creation or separately when there are no limits.
        baseShift = (base.height - base.depth) / 2 -
            style.metrics.axisHeight * style.sizeMultiplier;

        // The slant of the symbol is just its italic correction.
        slant = base.italic;
    } else if (group.value.value) {
        // If this is a list, compose that list.
        const inner = buildExpression(group.value.value, options, true);

        base = makeSpan(["mop"], inner, options);
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

    if (hasLimits) {
        // IE 8 clips \int if it is in a display: inline-block. We wrap it
        // in a new span so it is an inline, and works.
        base = makeSpan([], [base]);

        let supmid;
        let supKern;
        let submid;
        let subKern;
        let newOptions;
        // We manually have to handle the superscripts and subscripts. This,
        // aside from the kern calculations, is copied from supsub.
        if (supGroup) {
            newOptions = options.withStyle(style.sup());
            const sup = buildGroup(supGroup, newOptions);
            supmid = makeSpan([style.reset(), style.sup().cls()],
                [sup], newOptions);

            supKern = Math.max(
                fontMetrics.metrics.bigOpSpacing1,
                fontMetrics.metrics.bigOpSpacing3 - sup.depth);
        }

        if (subGroup) {
            newOptions = options.withStyle(style.sub());
            const sub = buildGroup(subGroup, newOptions);
            submid = makeSpan([style.reset(), style.sub().cls()],
                [sub], newOptions);

            subKern = Math.max(
                fontMetrics.metrics.bigOpSpacing2,
                fontMetrics.metrics.bigOpSpacing4 - sub.height);
        }

        // Build the final group as a vlist of the possible subscript, base,
        // and possible superscript.
        let finalGroup;
        let top;
        let bottom;
        if (!supGroup) {
            top = base.height - baseShift;

            finalGroup = buildCommon.makeVList([
                {type: "kern", size: fontMetrics.metrics.bigOpSpacing5},
                {type: "elem", elem: submid},
                {type: "kern", size: subKern},
                {type: "elem", elem: base},
            ], "top", top, options);

            // Here, we shift the limits by the slant of the symbol. Note
            // that we are supposed to shift the limits by 1/2 of the slant,
            // but since we are centering the limits adding a full slant of
            // margin will shift by 1/2 that.
            finalGroup.children[0].style.marginLeft = -slant + "em";
        } else if (!subGroup) {
            bottom = base.depth + baseShift;

            finalGroup = buildCommon.makeVList([
                {type: "elem", elem: base},
                {type: "kern", size: supKern},
                {type: "elem", elem: supmid},
                {type: "kern", size: fontMetrics.metrics.bigOpSpacing5},
            ], "bottom", bottom, options);

            // See comment above about slants
            finalGroup.children[1].style.marginLeft = slant + "em";
        } else if (!supGroup && !subGroup) {
            // This case probably shouldn't occur (this would mean the
            // supsub was sending us a group with no superscript or
            // subscript) but be safe.
            return base;
        } else {
            bottom = fontMetrics.metrics.bigOpSpacing5 +
                submid.height + submid.depth +
                subKern +
                base.depth + baseShift;

            finalGroup = buildCommon.makeVList([
                {type: "kern", size: fontMetrics.metrics.bigOpSpacing5},
                {type: "elem", elem: submid},
                {type: "kern", size: subKern},
                {type: "elem", elem: base},
                {type: "kern", size: supKern},
                {type: "elem", elem: supmid},
                {type: "kern", size: fontMetrics.metrics.bigOpSpacing5},
            ], "bottom", bottom, options);

            // See comment above about slants
            finalGroup.children[0].style.marginLeft = -slant + "em";
            finalGroup.children[2].style.marginLeft = slant + "em";
        }

        return makeSpan(["mop", "op-limits"], [finalGroup], options);
    } else {
        if (group.value.symbol) {
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

groupTypes.overline = function(group, options) {
    // Overlines are handled in the TeXbook pg 443, Rule 9.
    const style = options.style;

    // Build the inner group in the cramped style.
    const innerGroup = buildGroup(group.value.body,
            options.withStyle(style.cramp()));

    const ruleWidth = fontMetrics.metrics.defaultRuleThickness /
        style.sizeMultiplier;

    // Create the line above the body
    const line = makeSpan(
        [style.reset(), Style.TEXT.cls(), "overline-line"]);
    line.height = ruleWidth;
    line.maxFontSize = 1.0;

    // Generate the vlist, with the appropriate kerns
    const vlist = buildCommon.makeVList([
        {type: "elem", elem: innerGroup},
        {type: "kern", size: 3 * ruleWidth},
        {type: "elem", elem: line},
        {type: "kern", size: ruleWidth},
    ], "firstBaseline", null, options);

    return makeSpan(["mord", "overline"], [vlist], options);
};

groupTypes.underline = function(group, options) {
    // Underlines are handled in the TeXbook pg 443, Rule 10.
    const style = options.style;

    // Build the inner group.
    const innerGroup = buildGroup(group.value.body, options);

    const ruleWidth = fontMetrics.metrics.defaultRuleThickness /
        style.sizeMultiplier;

    // Create the line above the body
    const line = makeSpan([style.reset(), Style.TEXT.cls(), "underline-line"]);
    line.height = ruleWidth;
    line.maxFontSize = 1.0;

    // Generate the vlist, with the appropriate kerns
    const vlist = buildCommon.makeVList([
        {type: "kern", size: ruleWidth},
        {type: "elem", elem: line},
        {type: "kern", size: 3 * ruleWidth},
        {type: "elem", elem: innerGroup},
    ], "top", innerGroup.height, options);

    return makeSpan(["mord", "underline"], [vlist], options);
};

groupTypes.sqrt = function(group, options) {
    // Square roots are handled in the TeXbook pg. 443, Rule 11.
    const style = options.style;

    // First, we do the same steps as in overline to build the inner group
    // and line
    const inner = buildGroup(
        group.value.body, options.withStyle(style.cramp()));

    const ruleWidth = fontMetrics.metrics.defaultRuleThickness /
        style.sizeMultiplier;

    const line = makeSpan(
        [style.reset(), Style.TEXT.cls(), "sqrt-line"], [],
        options);
    line.height = ruleWidth;
    line.maxFontSize = 1.0;

    let phi = ruleWidth;
    if (style.id < Style.TEXT.id) {
        phi = style.metrics.xHeight;
    }

    // Calculate the clearance between the body and line
    let lineClearance = ruleWidth + phi / 4;

    const innerHeight = (inner.height + inner.depth) * style.sizeMultiplier;
    const minDelimiterHeight = innerHeight + lineClearance + ruleWidth;

    // Create a \surd delimiter of the required minimum size
    const delim = makeSpan(["sqrt-sign"], [
        delimiter.customSizedDelim("\\surd", minDelimiterHeight,
                                   false, options, group.mode)],
                         options);

    const delimDepth = (delim.height + delim.depth) - ruleWidth;

    // Adjust the clearance based on the delimiter size
    if (delimDepth > inner.height + inner.depth + lineClearance) {
        lineClearance =
            (lineClearance + delimDepth - inner.height - inner.depth) / 2;
    }

    // Shift the delimiter so that its top lines up with the top of the line
    const delimShift = -(inner.height + lineClearance + ruleWidth) +
          delim.height;
    delim.style.top = delimShift + "em";
    delim.height -= delimShift;
    delim.depth += delimShift;

    // We add a special case here, because even when `inner` is empty, we
    // still get a line. So, we use a simple heuristic to decide if we
    // should omit the body entirely. (note this doesn't work for something
    // like `\sqrt{\rlap{x}}`, but if someone is doing that they deserve for
    // it not to work.
    let body;
    if (inner.height === 0 && inner.depth === 0) {
        body = makeSpan();
    } else {
        body = buildCommon.makeVList([
            {type: "elem", elem: inner},
            {type: "kern", size: lineClearance},
            {type: "elem", elem: line},
            {type: "kern", size: ruleWidth},
        ], "firstBaseline", null, options);
    }

    if (!group.value.index) {
        return makeSpan(["mord", "sqrt"], [delim, body], options);
    } else {
        // Handle the optional root index

        // The index is always in scriptscript style
        const newOptions = options.withStyle(Style.SCRIPTSCRIPT);
        const root = buildGroup(group.value.index, newOptions);
        const rootWrap = makeSpan(
            [style.reset(), Style.SCRIPTSCRIPT.cls()],
            [root],
            newOptions);

        // Figure out the height and depth of the inner part
        const innerRootHeight = Math.max(delim.height, body.height);
        const innerRootDepth = Math.max(delim.depth, body.depth);

        // The amount the index is shifted by. This is taken from the TeX
        // source, in the definition of `\r@@t`.
        const toShift = 0.6 * (innerRootHeight - innerRootDepth);

        // Build a VList with the superscript shifted up correctly
        const rootVList = buildCommon.makeVList(
            [{type: "elem", elem: rootWrap}],
            "shift", -toShift, options);
        // Add a class surrounding it so we can add on the appropriate
        // kerning
        const rootVListWrap = makeSpan(["root"], [rootVList]);

        return makeSpan(["mord", "sqrt"],
            [rootVListWrap, delim, body], options);
    }
};

groupTypes.sizing = function(group, options) {
    // Handle sizing operators like \Huge. Real TeX doesn't actually allow
    // these functions inside of math expressions, so we do some special
    // handling.
    const inner = buildExpression(group.value.value,
            options.withSize(group.value.size), false);

    // Compute the correct maxFontSize.
    const style = options.style;
    const fontSize = buildCommon.sizingMultiplier[group.value.size] *
          style.sizeMultiplier;

    // Add size-resetting classes to the inner list and set maxFontSize
    // manually. Handle nested size changes.
    for (let i = 0; i < inner.length; i++) {
        const pos = utils.indexOf(inner[i].classes, "sizing");
        if (pos < 0) {
            inner[i].classes.push("sizing", "reset-" + options.size,
                                  group.value.size, style.cls());
            inner[i].maxFontSize = fontSize;
        } else if (inner[i].classes[pos + 1] === "reset-" + group.value.size) {
            // This is a nested size change: e.g., inner[i] is the "b" in
            // `\Huge a \small b`. Override the old size (the `reset-` class)
            // but not the new size.
            inner[i].classes[pos + 1] = "reset-" + options.size;
        }
    }

    return buildCommon.makeFragment(inner);
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
    const newOptions = options.withStyle(newStyle);

    // Build the inner expression in the new style.
    const inner = buildExpression(
        group.value.value, newOptions, false);

    // Add style-resetting classes to the inner list. Handle nested changes.
    for (let i = 0; i < inner.length; i++) {
        const pos = utils.indexOf(inner[i].classes, newStyle.reset());
        if (pos < 0) {
            inner[i].classes.push(options.style.reset(), newStyle.cls());
        } else {
            // This is a nested style change, as `\textstyle a\scriptstyle b`.
            // Only override the old style (the reset class).
            inner[i].classes[pos] = options.style.reset();
        }
    }

    return new buildCommon.makeFragment(inner);
};

groupTypes.font = function(group, options) {
    const font = group.value.font;
    return buildGroup(group.value.body, options.withFont(font));
};

groupTypes.delimsizing = function(group, options) {
    const delim = group.value.value;

    if (delim === ".") {
        // Empty delimiters still count as elements, even though they don't
        // show anything.
        return makeSpan([group.value.mclass]);
    }

    // Use delimiter.sizedDelim to generate the delimiter.
    return delimiter.sizedDelim(
            delim, group.value.size, options, group.mode,
            [group.value.mclass]);
};

groupTypes.leftright = function(group, options) {
    // Build the inner expression
    const inner = buildExpression(group.value.body, options.reset(), true);

    let innerHeight = 0;
    let innerDepth = 0;
    let hadMiddle = false;

    // Calculate its height and depth
    for (let i = 0; i < inner.length; i++) {
        if (inner[i].isMiddle) {
            hadMiddle = true;
        } else {
            innerHeight = Math.max(inner[i].height, innerHeight);
            innerDepth = Math.max(inner[i].depth, innerDepth);
        }
    }

    const style = options.style;

    // The size of delimiters is the same, regardless of what style we are
    // in. Thus, to correctly calculate the size of delimiter we need around
    // a group, we scale down the inner size based on the size.
    innerHeight *= style.sizeMultiplier;
    innerDepth *= style.sizeMultiplier;

    let leftDelim;
    if (group.value.left === ".") {
        // Empty delimiters in \left and \right make null delimiter spaces.
        leftDelim = makeNullDelimiter(options, ["mopen"]);
    } else {
        // Otherwise, use leftRightDelim to generate the correct sized
        // delimiter.
        leftDelim = delimiter.leftRightDelim(
            group.value.left, innerHeight, innerDepth, options,
            group.mode, ["mopen"]);
    }
    // Add it to the beginning of the expression
    inner.unshift(leftDelim);

    // Handle middle delimiters
    if (hadMiddle) {
        for (let i = 1; i < inner.length; i++) {
            if (inner[i].isMiddle) {
                // Apply the options that were active when \middle was called
                inner[i] = delimiter.leftRightDelim(
                    inner[i].isMiddle.value, innerHeight, innerDepth,
                    inner[i].isMiddle.options, group.mode, []);
            }
        }
    }

    let rightDelim;
    // Same for the right delimiter
    if (group.value.right === ".") {
        rightDelim = makeNullDelimiter(options, ["mclose"]);
    } else {
        rightDelim = delimiter.leftRightDelim(
            group.value.right, innerHeight, innerDepth, options,
            group.mode, ["mclose"]);
    }
    // Add it to the end of the expression.
    inner.push(rightDelim);

    return makeSpan(
        ["minner", style.cls()], inner, options);
};

groupTypes.middle = function(group, options) {
    let middleDelim;
    if (group.value.value === ".") {
        middleDelim = makeNullDelimiter(options, []);
    } else {
        middleDelim = delimiter.sizedDelim(
            group.value.value, 1, options,
            group.mode, []);
        middleDelim.isMiddle = {value: group.value.value, options: options};
    }
    return middleDelim;
};

groupTypes.rule = function(group, options) {
    // Make an empty span for the rule
    const rule = makeSpan(["mord", "rule"], [], options);
    const style = options.style;

    // Calculate the shift, width, and height of the rule, and account for units
    let shift = 0;
    if (group.value.shift) {
        shift = calculateSize(group.value.shift, style);
    }

    let width = calculateSize(group.value.width, style);
    let height = calculateSize(group.value.height, style);

    // The sizes of rules are absolute, so make it larger if we are in a
    // smaller style.
    shift /= style.sizeMultiplier;
    width /= style.sizeMultiplier;
    height /= style.sizeMultiplier;

    // Style the rule to the right size
    rule.style.borderRightWidth = width + "em";
    rule.style.borderTopWidth = height + "em";
    rule.style.bottom = shift + "em";

    // Record the height and width
    rule.width = width;
    rule.height = height + shift;
    rule.depth = -shift;

    return rule;
};

groupTypes.kern = function(group, options) {
    // Make an empty span for the rule
    const rule = makeSpan(["mord", "rule"], [], options);
    const style = options.style;

    let dimension = 0;
    if (group.value.dimension) {
        dimension = calculateSize(group.value.dimension, style);
    }

    dimension /= style.sizeMultiplier;

    rule.style.marginLeft = dimension + "em";

    return rule;
};

groupTypes.accent = function(group, options) {
    // Accents are handled in the TeXbook pg. 443, rule 12.
    let base = group.value.base;
    const style = options.style;

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
        supsubGroup = buildGroup(
            supsub, options.reset());
    }

    // Build the base group
    const body = buildGroup(
        base, options.withStyle(style.cramp()));

    // Calculate the skew of the accent. This is based on the line "If the
    // nucleus is not a single character, let s = 0; otherwise set s to the
    // kern amount for the nucleus followed by the \skewchar of its font."
    // Note that our skew metrics are just the kern between each character
    // and the skewchar.
    let skew = 0;
    if (isCharacterBox(base)) {
        // If the base is a character box, then we want the skew of the
        // innermost character. To do that, we find the innermost character:
        const baseChar = getBaseElem(base);
        // Then, we render its group to get the symbol inside it
        const baseGroup = buildGroup(
            baseChar, options.withStyle(style.cramp()));
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
        style.metrics.xHeight);

    // Build the accent
    const accent = buildCommon.makeSymbol(
        group.value.accent, "Main-Regular", "math", options);
    // Remove the italic correction of the accent, because it only serves to
    // shift the accent over to a place we don't want.
    accent.italic = 0;

    // The \vec character that the fonts use is a combining character, and
    // thus shows up much too far to the left. To account for this, we add a
    // specific class which shifts the accent over to where we want it.
    // TODO(emily): Fix this in a better way, like by changing the font
    const vecClass = group.value.accent === "\\vec" ? "accent-vec" : null;

    let accentBody = makeSpan(["accent-body", vecClass], [
        makeSpan([], [accent])]);

    accentBody = buildCommon.makeVList([
        {type: "elem", elem: body},
        {type: "kern", size: -clearance},
        {type: "elem", elem: accentBody},
    ], "firstBaseline", null, options);

    // Shift the accent over by the skew. Note we shift by twice the skew
    // because we are centering the accent, so by adding 2*skew to the left,
    // we shift it to the right by 1*skew.
    accentBody.children[1].style.marginLeft = 2 * skew + "em";

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

groupTypes.phantom = function(group, options) {
    const elements = buildExpression(
        group.value.value,
        options.withPhantom(),
        false
    );

    // \phantom isn't supposed to affect the elements it contains.
    // See "color" for more details.
    return new buildCommon.makeFragment(elements);
};

groupTypes.mclass = function(group, options) {
    const elements = buildExpression(group.value.value, options, true);

    return makeSpan([group.value.mclass], elements, options);
};

/**
 * buildGroup is the function that takes a group and calls the correct groupType
 * function for it. It also handles the interaction of size and style changes
 * between parents and children.
 */
const buildGroup = function(group, options) {
    if (!group) {
        return makeSpan();
    }

    if (groupTypes[group.type]) {
        // Call the groupTypes function
        const groupNode = groupTypes[group.type](group, options);
        let multiplier;

        // If the style changed between the parent and the current group,
        // account for the size difference
        if (options.style !== options.parentStyle) {
            multiplier = options.style.sizeMultiplier /
                    options.parentStyle.sizeMultiplier;

            groupNode.height *= multiplier;
            groupNode.depth *= multiplier;
        }

        // If the size changed between the parent and the current group, account
        // for that size difference.
        if (options.size !== options.parentSize) {
            multiplier = buildCommon.sizingMultiplier[options.size] /
                    buildCommon.sizingMultiplier[options.parentSize];

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
const buildHTML = function(tree, options) {
    // buildExpression is destructive, so we need to make a clone
    // of the incoming tree so that it isn't accidentally changed
    tree = JSON.parse(JSON.stringify(tree));

    // Build the expression contained in the tree
    const expression = buildExpression(tree, options, true);
    const body = makeSpan(["base", options.style.cls()], expression, options);

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
};

module.exports = buildHTML;
