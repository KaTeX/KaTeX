// @flow
import {defineFunctionBuilders} from "../defineFunction";
import buildCommon from "../buildCommon";
import domTree from "../domTree";
import mathMLTree from "../mathMLTree";
import utils from "../utils";
import Style from "../Style";
import {checkNodeType} from "../ParseNode";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";
import * as accent from "./accent";
import * as horizBrace from "./horizBrace";
import * as op from "./op";

import type Options from "../Options";
import type ParseNode from "../ParseNode";
import type {HtmlBuilder} from "../defineFunction";
import type {MathNodeType} from "../mathMLTree";

/**
 * Sometimes, groups perform special rules when they have superscripts or
 * subscripts attached to them. This function lets the `supsub` group know that
 * Sometimes, groups perform special rules when they have superscripts or
 * its inner element should handle the superscripts and subscripts instead of
 * handling them itself.
 */
const htmlBuilderDelegate = function(
    group: ParseNode<"supsub">,
    options: Options,
): ?HtmlBuilder<*> {
    const base = group.value.base;
    if (!base) {
        return null;
    } else if (base.type === "op") {
        // Operators handle supsubs differently when they have limits
        // (e.g. `\displaystyle\sum_2^3`)
        const delegate = base.value.limits &&
            (options.style.size === Style.DISPLAY.size ||
            base.value.alwaysHandleSupSub);
        return delegate ? op.htmlBuilder : null;
    } else if (base.type === "accent") {
        return utils.isCharacterBox(base.value.base) ? accent.htmlBuilder : null;
    } else if (base.type === "horizBrace") {
        const isSup = !group.value.sub;
        return isSup === base.value.isOver ? horizBrace.htmlBuilder : null;
    } else {
        return null;
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
        const builderDelegate = htmlBuilderDelegate(group, options);
        if (builderDelegate) {
            return builderDelegate(group, options);
        }

        const {base: valueBase, sup: valueSup, sub: valueSub} = group.value;
        const base = html.buildGroup(valueBase, options);
        let supm;
        let subm;

        const metrics = options.fontMetrics();

        // Rule 18a
        let supShift = 0;
        let subShift = 0;

        const isCharacterBox = valueBase && utils.isCharacterBox(valueBase);
        if (valueSup) {
            const newOptions = options.havingStyle(options.style.sup());
            supm = html.buildGroup(valueSup, newOptions, options);
            if (!isCharacterBox) {
                supShift = base.height - newOptions.fontMetrics().supDrop
                    * newOptions.sizeMultiplier / options.sizeMultiplier;
            }
        }

        if (valueSub) {
            const newOptions = options.havingStyle(options.style.sub());
            subm = html.buildGroup(valueSub, newOptions, options);
            if (!isCharacterBox) {
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
        if (supm && subm) {
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

            // Subscripts shouldn't be shifted by the base's italic correction.
            // Account for that by shifting the subscript back the appropriate
            // amount. Note we only do this when the base is a single symbol.
            const marginLeft =
                base instanceof domTree.symbolNode ? -base.italic + "em" : null;
            const vlistElem = [
                {type: "elem", elem: subm, shift: subShift, marginRight,
                    marginLeft},
                {type: "elem", elem: supm, shift: -supShift, marginRight},
            ];

            supsub = buildCommon.makeVList({
                positionType: "individualShift",
                children: vlistElem,
            }, options);
        } else if (subm) {
            // Rule 18b
            subShift = Math.max(
                subShift, metrics.sub1,
                subm.height - 0.8 * metrics.xHeight);

            // See comment above about subscripts not being shifted.
            const marginLeft =
                base instanceof domTree.symbolNode ? -base.italic + "em" : null;
            const vlistElem =
                [{type: "elem", elem: subm, marginLeft, marginRight}];

            supsub = buildCommon.makeVList({
                positionType: "shift",
                positionData: subShift,
                children: vlistElem,
            }, options);
        } else if (supm) {
            // Rule 18c, d
            supShift = Math.max(supShift, minSupShift,
                supm.depth + 0.25 * metrics.xHeight);

            supsub = buildCommon.makeVList({
                positionType: "shift",
                positionData: -supShift,
                children: [{type: "elem", elem: supm, marginRight}],
            }, options);
        } else {
            throw new Error("supsub must have either sup or sub.");
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

        const horizBrace = checkNodeType(group.value.base, "horizBrace");
        if (horizBrace) {
            isSup = !!group.value.sup;
            if (isSup === horizBrace.value.isOver) {
                isBrace = true;
                isOver = horizBrace.value.isOver;
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

        let nodeType: MathNodeType;
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

