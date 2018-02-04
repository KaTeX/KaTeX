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
import {spacings, tightSpacings} from "./spacingData";

const makeSpan = buildCommon.makeSpan;

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

const styleMap = {
    "display": Style.DISPLAY,
    "text": Style.TEXT,
    "script": Style.SCRIPT,
    "scriptscript": Style.SCRIPTSCRIPT,
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
    const rawGroups = [];
    for (let i = 0; i < expression.length; i++) {
        const group = expression[i];
        const output = buildGroup(group, options);
        if (output instanceof domTree.documentFragment) {
            rawGroups.push(...output.children);
        } else {
            rawGroups.push(output);
        }
    }
    // At this point `rawGroups` consists entirely of `symbolNode`s and `span`s.

    // Ignore explicit spaces (e.g., \;, \,) when determining what implicit
    // spacing should go between atoms of different classes.
    const nonSpaces =
        rawGroups.filter(group => group && group.classes[0] !== "mspace");

    // Before determining what spaces to insert, perform bin cancellation.
    // Binary operators change to ordinary symbols in some contexts.
    for (let i = 0; i < nonSpaces.length; i++) {
        if (isBin(nonSpaces[i])) {
            if (isBinLeftCanceller(nonSpaces[i - 1], isRealGroup)
                    || isBinRightCanceller(nonSpaces[i + 1], isRealGroup)) {
                nonSpaces[i].classes[0] = "mord";
            }
        }
    }

    const groups = [];
    let j = 0;
    for (let i = 0; i < rawGroups.length; i++) {
        groups.push(rawGroups[i]);

        // For any group that is not a space, get the next non-space.  Then
        // lookup what implicit space should be placed between those atoms and
        // add it to groups.
        if (rawGroups[i].classes[0] !== "mspace" && j < nonSpaces.length - 1) {
            // Get the type of the current non-space node.  If it's a document
            // fragment, get the type of the rightmost node in the fragment.
            const left = getTypeOfDomTree(nonSpaces[j], "right");

            // Get the type of the next non-space node.  If it's a document
            // fragment, get the type of the leftmost node in the fragment.
            const right = getTypeOfDomTree(nonSpaces[j + 1], "left");

            // We use buildExpression inside of sizingGroup, but it returns a
            // document fragment of elements.  sizingGroup sets `isRealGroup`
            // to false to avoid processing spans multiple times.
            if (left && right && isRealGroup) {
                const space = isLeftTight(nonSpaces[j + 1])
                    ? tightSpacings[left][right]
                    : spacings[left][right];

                if (space) {
                    let glueOptions = options;

                    if (expression.length === 1) {
                        if (expression[0].type === "sizing") {
                            glueOptions = options.havingSize(
                                expression[0].value.size);
                        } else if (expression[0].type === "styling") {
                            glueOptions = options.havingStyle(
                                styleMap[expression[0].value.style]);
                        }
                    }

                    groups.push(buildCommon.makeGlue(space, glueOptions));
                }
            }
            j++;
        }
    }

    // Process \\not commands within the group.
    for (let i = 0; i < groups.length; i++) {
        if (groups[i].value === "\u0338") {
            groups[i].style.position = "absolute";
            // TODO(kevinb) fix this for Safari by switching to a non-combining
            // character for \not.
            // This value was determined empirically.
            // TODO(kevinb) figure out the real math for this value.
            groups[i].style.paddingLeft = "0.8em";
        }
    }

    return groups;
};

// Return math atom class (mclass) of a domTree.
export const getTypeOfDomTree = function(node, side = "right") {
    if (node instanceof domTree.documentFragment ||
            node instanceof domTree.anchor) {
        if (node.children.length) {
            if (side === "right") {
                return getTypeOfDomTree(
                    node.children[node.children.length - 1]);
            } else if (side === "left") {
                return getTypeOfDomTree(
                    node.children[0]);
            }
        }
    } else {
        // This makes a lot of assumptions as to where the type of atom
        // appears.  We should do a better job of enforcing this.
        if (utils.contains([
            "mord", "mop", "mbin", "mrel", "mopen", "mclose",
            "mpunct", "minner",
        ], node.classes[0])) {
            return node.classes[0];
        }
    }
    return null;
};

// If `node` is an atom return whether it's been assigned the mtight class.
// If `node` is a document fragment, return the value of isLeftTight() for the
// leftmost node in the fragment.
// 'mtight' indicates that the node is script or scriptscript style.
export const isLeftTight = function(node) {
    if (node instanceof domTree.documentFragment) {
        if (node.children.length) {
            return isLeftTight(node.children[0]);
        }
    } else {
        return utils.contains(node.classes, "mtight");
    }
    return false;
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
    let upperShift = -options.fontMetrics().axisHeight -
        0.5 * arrowBody.height - 0.111;
    if (group.value.label === "\\xleftequilibrium") {
        upperShift -= upperGroup.depth;
    }

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
