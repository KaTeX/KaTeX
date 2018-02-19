// @flow
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import delimiter from "../delimiter";
import mathMLTree from "../mathMLTree";
import Style from "../Style";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "genfrac",
    names: [
        "\\dfrac", "\\frac", "\\tfrac",
        "\\dbinom", "\\binom", "\\tbinom",
        "\\\\atopfrac", // can’t be entered directly
    ],
    props: {
        numArgs: 2,
        greediness: 2,
    },
    handler: (context, args) => {
        const numer = args[0];
        const denom = args[1];
        let hasBarLine;
        let leftDelim = null;
        let rightDelim = null;
        let size = "auto";

        switch (context.funcName) {
            case "\\dfrac":
            case "\\frac":
            case "\\tfrac":
                hasBarLine = true;
                break;
            case "\\\\atopfrac":
                hasBarLine = false;
                break;
            case "\\dbinom":
            case "\\binom":
            case "\\tbinom":
                hasBarLine = false;
                leftDelim = "(";
                rightDelim = ")";
                break;
            default:
                throw new Error("Unrecognized genfrac command");
        }

        switch (context.funcName) {
            case "\\dfrac":
            case "\\dbinom":
                size = "display";
                break;
            case "\\tfrac":
            case "\\tbinom":
                size = "text";
                break;
        }

        return {
            type: "genfrac",
            numer: numer,
            denom: denom,
            hasBarLine: hasBarLine,
            leftDelim: leftDelim,
            rightDelim: rightDelim,
            size: size,
        };
    },
    htmlBuilder: (group, options) => {
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
        const numerm = html.buildGroup(group.value.numer, newOptions, options);

        newOptions = options.havingStyle(dstyle);
        const denomm = html.buildGroup(group.value.denom, newOptions, options);

        let rule;
        let ruleWidth;
        let ruleSpacing;
        if (group.value.hasBarLine) {
            rule = buildCommon.makeLineSpan("frac-line", options);
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
        if (!rule) {
            // Rule 15c
            const candidateClearance =
                (numShift - numerm.depth) - (denomm.height - denomShift);
            if (candidateClearance < clearance) {
                numShift += 0.5 * (clearance - candidateClearance);
                denomShift += 0.5 * (clearance - candidateClearance);
            }

            frac = buildCommon.makeVList({
                positionType: "individualShift",
                children: [
                    {type: "elem", elem: denomm, shift: denomShift},
                    {type: "elem", elem: numerm, shift: -numShift},
                ],
            }, options);
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

            frac = buildCommon.makeVList({
                positionType: "individualShift",
                children: [
                    {type: "elem", elem: denomm, shift: denomShift},
                    // The next line would ordinarily contain "shift: midShift".
                    // But we put the rule into a a span that is 5 rules tall,
                    // to overcome a Chrome rendering issue. Put another way,
                    // we've replaced a kern of width = 2 * ruleWidth with a
                    // bottom padding inside the SVG = 2 * ruleWidth.
                    {type: "elem", elem: rule,   shift: midShift + 2 * ruleWidth},
                    {type: "elem", elem: numerm, shift: -numShift},
                ],
            }, options);
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
            leftDelim = html.makeNullDelimiter(options, ["mopen"]);
        } else {
            leftDelim = delimiter.customSizedDelim(
                group.value.leftDelim, delimSize, true,
                options.havingStyle(style), group.mode, ["mopen"]);
        }
        if (group.value.rightDelim == null) {
            rightDelim = html.makeNullDelimiter(options, ["mclose"]);
        } else {
            rightDelim = delimiter.customSizedDelim(
                group.value.rightDelim, delimSize, true,
                options.havingStyle(style), group.mode, ["mclose"]);
        }

        return buildCommon.makeSpan(
            ["mord"].concat(newOptions.sizingClasses(options)),
            [leftDelim, buildCommon.makeSpan(["mfrac"], [frac]), rightDelim],
            options);
    },
    mathmlBuilder: (group, options) => {
        const node = new mathMLTree.MathNode(
            "mfrac",
            [
                mml.buildGroup(group.value.numer, options),
                mml.buildGroup(group.value.denom, options),
            ]);

        if (!group.value.hasBarLine) {
            node.setAttribute("linethickness", "0px");
        }

        if (group.value.leftDelim != null || group.value.rightDelim != null) {
            const withDelims = [];

            if (group.value.leftDelim != null) {
                const leftOp = new mathMLTree.MathNode(
                    "mo", [new mathMLTree.TextNode(group.value.leftDelim)]);

                leftOp.setAttribute("fence", "true");

                withDelims.push(leftOp);
            }

            withDelims.push(node);

            if (group.value.rightDelim != null) {
                const rightOp = new mathMLTree.MathNode(
                    "mo", [new mathMLTree.TextNode(group.value.rightDelim)]);

                rightOp.setAttribute("fence", "true");

                withDelims.push(rightOp);
            }

            const outerNode = new mathMLTree.MathNode("mrow", withDelims);

            return outerNode;
        }

        return node;
    },
});
