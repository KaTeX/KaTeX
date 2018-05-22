import {defineFunctionBuilders} from "../defineFunction";
import buildCommon from "../buildCommon";
import domTree from "../domTree";
import mathMLTree from "../mathMLTree";
import utils from "../utils";
import Style from "../Style";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

/**
 * Sometimes, groups perform special rules when they have superscripts or
 * subscripts attached to them. This function lets the `supsub` group know that
 * Sometimes, groups perform special rules when they have superscripts or
 * its inner element should handle the superscripts and subscripts instead of
 * handling them itself.
 */
const shouldHandleSupSub = function(group, options) {
    const base = group.value.base;
    if (!base) {
        return false;
    } else if (base.type === "op") {
        // Operators handle supsubs differently when they have limits
        // (e.g. `\displaystyle\sum_2^3`)
        return base.value.limits &&
            (options.style.size === Style.DISPLAY.size ||
            base.value.alwaysHandleSupSub);
    } else if (base.type === "accent") {
        return utils.isCharacterBox(base.value.base);
    } else if (base.type === "horizBrace") {
        const isSup = !group.value.sub;
        return (isSup === base.value.isOver);
    } else {
        return false;
    }
};

// Super scripts and subscripts, whose precise placement can depend on other
// functions that precede them.
defineFunctionBuilders({
    type: "supsub",
    htmlBuilder(group, options) {
        // Superscript and subscripts are handled in the TeXbook on page
        // 445-446, rules 18(a-f).

        // Here is where we defer to the inner group if it should handle
        // superscripts and subscripts itself.
        if (shouldHandleSupSub(group, options)) {
            return html.groupTypes[group.value.base.type](group, options);
        }

        const base = html.buildGroup(group.value.base, options);
        let supm;
        let subm;

        const metrics = options.fontMetrics();
        let newOptions;

        // Rule 18a
        let supShift = 0;
        let subShift = 0;

        if (group.value.sup) {
            newOptions = options.havingStyle(options.style.sup());
            supm = html.buildGroup(group.value.sup, newOptions, options);
            if (!utils.isCharacterBox(group.value.base)) {
                supShift = base.height - newOptions.fontMetrics().supDrop
                    * newOptions.sizeMultiplier / options.sizeMultiplier;
            }
        }

        if (group.value.sub) {
            newOptions = options.havingStyle(options.style.sub());
            subm = html.buildGroup(group.value.sub, newOptions, options);
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
        // appropriately for use as the marginRight.
        const multiplier = options.sizeMultiplier;
        const marginRight = (0.5 / metrics.ptPerEm) / multiplier + "em";

        let supsub;
        if (!group.value.sup) {
            // Rule 18b
            subShift = Math.max(
                subShift, metrics.sub1,
                subm.height - 0.8 * metrics.xHeight);

            const vlistElem = [{type: "elem", elem: subm, marginRight}];
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
                children: [{type: "elem", elem: supm, marginRight}],
            }, options);
        } else {
            supShift = Math.max(
                supShift, minSupShift, supm.depth + 0.25 * metrics.xHeight);
            subShift = Math.max(subShift, metrics.sub2);

            const ruleWidth = metrics.defaultRuleThickness;

            // Rule 18e
            const maxWidth = 4 * ruleWidth;
            if ((supShift - supm.depth) - (subm.height - subShift) < maxWidth) {
                subShift = maxWidth - (supShift - supm.depth) + subm.height;
                const psi = 0.8 * metrics.xHeight - (supShift - supm.depth);
                if (psi > 0) {
                    supShift += psi;
                    subShift -= psi;
                }
            }

            const vlistElem = [
                {type: "elem", elem: subm, shift: subShift, marginRight},
                {type: "elem", elem: supm, shift: -supShift, marginRight},
            ];
            // See comment above about subscripts not being shifted.
            if (base instanceof domTree.symbolNode) {
                vlistElem[0].marginLeft = -base.italic + "em";
            }

            supsub = buildCommon.makeVList({
                positionType: "individualShift",
                children: vlistElem,
            }, options);
        }

        // Wrap the supsub vlist in a span.msupsub to reset text-align.
        const mclass = html.getTypeOfDomTree(base) || "mord";
        return buildCommon.makeSpan([mclass],
            [base, buildCommon.makeSpan(["msupsub"], [supsub])],
            options);
    },
    mathmlBuilder(group, options) {
        // Is the inner group a relevant horizonal brace?
        let isBrace = false;
        let isOver;
        let isSup;
        if (group.value.base) {
            if (group.value.base.value.type === "horizBrace") {
                isSup = (group.value.sup ? true : false);
                if (isSup === group.value.base.value.isOver) {
                    isBrace = true;
                    isOver = group.value.base.value.isOver;
                }
            }
        }

        const children = [
            mml.buildGroup(group.value.base, options)];

        if (group.value.sub) {
            children.push(mml.buildGroup(group.value.sub, options));
        }

        if (group.value.sup) {
            children.push(mml.buildGroup(group.value.sup, options));
        }

        let nodeType;
        if (isBrace) {
            nodeType = (isOver ? "mover" : "munder");
        } else if (!group.value.sub) {
            const base = group.value.base;
            if (base && base.value.limits && options.style === Style.DISPLAY) {
                nodeType = "mover";
            } else {
                nodeType = "msup";
            }
        } else if (!group.value.sup) {
            const base = group.value.base;
            if (base && base.value.limits && options.style === Style.DISPLAY) {
                nodeType = "munder";
            } else {
                nodeType = "msub";
            }
        } else {
            const base = group.value.base;
            if (base && base.value.limits && options.style === Style.DISPLAY) {
                nodeType = "munderover";
            } else {
                nodeType = "msubsup";
            }
        }

        const node = new mathMLTree.MathNode(nodeType, children);

        return node;
    },
});

