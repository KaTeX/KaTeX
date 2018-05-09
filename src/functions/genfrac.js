// @flow
import ParseError from "../ParseError";
import ParseNode from "../ParseNode";
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import delimiter from "../delimiter";
import mathMLTree from "../mathMLTree";
import Style from "../Style";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";
import type {Measurement} from "../units" ;
import {calculateSize} from "../units";

const htmlBuilder = (group, options) => {
    // Fractions are handled in the TeXbook on pages 444-445, rules 15(a-e).
    // Figure out what style this fraction should be in based on the
    // function used
    let style = options.style;
    if (group.value.size === "display") {
        style = Style.DISPLAY;
    } else if (group.value.size === "text") {
        style = Style.TEXT;
    } else if (group.value.size === "script") {
        style = Style.SCRIPT;
    } else if (group.value.size === "scriptscript") {
        style = Style.SCRIPTSCRIPT;
    }

    const nstyle = style.fracNum();
    const dstyle = style.fracDen();
    let newOptions;

    newOptions = options.havingStyle(nstyle);
    const numerm = html.buildGroup(group.value.numer, newOptions, options);

    newOptions = options.havingStyle(dstyle);
    const denomm = html.buildGroup(group.value.denom, newOptions, options);

    let rule;
    let ruleWidth = null;
    let ruleSpacing;
    if (group.value.hasBarLine) {
        if (group.value.barSize) {
            ruleWidth = calculateSize(group.value.barSize, newOptions);
        }
        rule = buildCommon.makeLineSpan("frac-line", ruleWidth, options);
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

    // Since we manually change the style sometimes (with \genfrac, \dfrac,
    // or \tfrac), account for the possible size change here.
    newOptions = options.havingStyle(style);
    frac.height *= newOptions.sizeMultiplier / options.sizeMultiplier;
    frac.depth *= newOptions.sizeMultiplier / options.sizeMultiplier;

    // Rule 15e
    let delimSize;
    if (style.size === Style.DISPLAY.size) {
        delimSize = options.fontMetrics().delim1;
    } else {
        delimSize = options.fontMetrics().delim2;

        if (style.size !== Style.TEXT.size) {
            delimSize *= newOptions.sizeMultiplier /
                options.havingStyle(Style.TEXT).sizeMultiplier;
        }
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
};

const mathmlBuilder = (group, options) => {
    const node = new mathMLTree.MathNode(
        "mfrac",
        [
            mml.buildGroup(group.value.numer, options),
            mml.buildGroup(group.value.denom, options),
        ]);

    if (!group.value.hasBarLine) {
        node.setAttribute("linethickness", "0px");
    } else if (group.barSize) {
        const ruleWidth = calculateSize(group.value.barSize, options);
        node.setAttribute("linethickness", ruleWidth + "em");
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
};

// Parse a line thickness ParseNode from a fraction.
// An empty thickness argument is a valid input to \genfrac.
// That's why we can't just specify a "size" argument for \genfrac.
const barLineFromNode = function(
    lineThickness: ParseNode
): [boolean, Measurement | null] {
    let hasBarLine;
    let barSize = null;
    if (lineThickness.value.length === 0) {
        hasBarLine = true;   // omitted dimension => std bar thickness
    } else {
        // Parse the custom line thickness
        let str = "";
        for (let i = 0; i < lineThickness.value.length; i++ ) {
            str += lineThickness.value[i].value;
        }

        const match = (/([-+]?) *(\d+(?:\.\d*)?|\.\d+) *([a-z]{2})/).exec(str);
        if (!match) {
            throw new ParseError("Invalid size: '" + str + "'");
        }

        const num = +str.replace(/[^+\-\d.]/g, '');  // cast to a number
        if (num === 0) {
            hasBarLine = false;
        } else {
            hasBarLine = true;
            barSize = {
                number: num,
                unit: str.replace(/[+\-\d. ]/g, ''),
            };
        }
    }

    return [hasBarLine, barSize];
};

const delimFromNode = function(delimNode: ParseNode): string | null {
    let delim = null;
    if (delimNode.value.length > 0) {
        delim = delimNode.value;
        delim = delim === "." ? null : delim;
    }
    return delim;
};

// TeXbook generalized fractions
defineFunction({
    type: "genfrac",
    names: [
        "\\dfrac", "\\frac", "\\tfrac",
        "\\dbinom", "\\binom", "\\tbinom",
        "\\\\atopfrac", // can’t be entered directly
        "\\\\bracefrac", "\\\\brackfrac",   // ditto
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
            case "\\\\bracefrac":
                hasBarLine = false;
                leftDelim = "\\{";
                rightDelim = "\\}";
                break;
            case "\\\\brackfrac":
                hasBarLine = false;
                leftDelim = "[";
                rightDelim = "]";
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
            barSize: null,
            leftDelim: leftDelim,
            rightDelim: rightDelim,
            size: size,
        };
    },

    htmlBuilder,
    mathmlBuilder,
});

const stylArray = ["display", "text", "script", "scriptscript"];

defineFunction({
    type: "genfrac",
    names: ["\\genfrac"],
    props: {
        numArgs: 6,
        greediness: 6,
        argTypes: ["math", "math", "text", "text", "math", "math"],
    },
    handler: (context, args) => {
        const [leftNode, rightNode, lineThickness, styl, numer, denom] = args;

        const leftDelim = delimFromNode(leftNode);
        const rightDelim = delimFromNode(rightNode);

        const [hasBarLine, barSize] = barLineFromNode(lineThickness);

        let size = "auto";
        if (styl.value.length > 0) {
            size = stylArray[styl.value[0].value];
        }

        return {
            type: "genfrac",
            numer: numer,
            denom: denom,
            hasBarLine: hasBarLine,
            barSize: barSize,
            leftDelim: leftDelim,
            rightDelim: rightDelim,
            size: size,
        };
    },

    htmlBuilder,
    mathmlBuilder,
});

// Infix generalized fractions
defineFunction({
    type: "genfrac",
    names: ["\\over", "\\choose", "\\atop", "\\brace", "\\brack"],
    props: {
        numArgs: 0,
        infix: true,
    },
    handler: (context) => {
        let replaceWith;
        switch (context.funcName) {
            case "\\over":
                replaceWith = "\\frac";
                break;
            case "\\choose":
                replaceWith = "\\binom";
                break;
            case "\\atop":
                replaceWith = "\\\\atopfrac";
                break;
            case "\\brace":
                replaceWith = "\\\\bracefrac";
                break;
            case "\\brack":
                replaceWith = "\\\\brackfrac";
                break;
            default:
                throw new Error("Unrecognized infix genfrac command");
        }
        return {
            type: "infix",
            replaceWith: replaceWith,
            token: context.token,
        };
    },

    htmlBuilder,
    mathmlBuilder,
});

// More infix fractions
defineFunction({
    type: "genfrac",
    names: ["\\above"],
    props: {
        numArgs: 1,
        infix: true,
    },
    handler: (context, args) => {
        const sizeNode = args[0];
        return {
            type: "infix",
            replaceWith: "\\\\abovefrac",
            token: context.token,
            sizeNode: sizeNode,
        };
    },
    htmlBuilder,
    mathmlBuilder,
});

defineFunction({
    type: "genfrac",
    names: ["\\\\abovefrac"],
    props: {
        numArgs: 3,
    },
    handler: (context, args) => {
        const [numer, denom, sizeNode] = args;
        const [hasBarLine, barSize] = barLineFromNode(sizeNode);

        return {
            type: "genfrac",
            numer: numer,
            denom: denom,
            hasBarLine: hasBarLine,
            barSize: barSize,
            leftDelim: null,
            rightDelim: null,
            size: "auto",
        };
    },

    htmlBuilder,
    mathmlBuilder,
});

defineFunction({
    type: "genfrac",
    names: ["\\atopwithdelims", "\\overwithdelims"],
    props: {
        numArgs: 2,
        infix: true,
    },
    handler: (context, args) => {
        const replaceWith = "\\" + context.funcName + "frac";
        const [leftDelim, rightDelim] = args;
        return {
            type: "infix",
            replaceWith: replaceWith,
            leftDelim: leftDelim,
            rightDelim: rightDelim,
            token: context.token,
        };
    },
    htmlBuilder,
    mathmlBuilder,
});

defineFunction({
    type: "genfrac",
    names: ["\\\\atopwithdelimsfrac", "\\\\overwithdelimsfrac"],
    props: {
        numArgs: 4,
    },
    handler: (context, args) => {
        const [numer, denom, leftDelimNode, rightDelimNode] = args;
        const leftDelim = delimFromNode(leftDelimNode);
        const rightDelim = delimFromNode(rightDelimNode);
        const hasBarLine = context.funcName === "\\\\overwithdelimsfrac";

        return {
            type: "genfrac",
            numer: numer,
            denom: denom,
            hasBarLine: hasBarLine,
            barSize: null,
            leftDelim: leftDelim,
            rightDelim: rightDelim,
            size: "auto",
        };
    },

    htmlBuilder,
    mathmlBuilder,
});

defineFunction({
    type: "genfrac",
    names: ["\\abovewithdelims"],
    props: {
        numArgs: 3,
        infix: true,
    },
    handler: (context, args) => {
        const [leftDelim, rightDelim, sizeNode] = args;
        return {
            type: "infix",
            replaceWith: "\\\\abovewithdelimsfrac",
            leftDelim: leftDelim,
            rightDelim: rightDelim,
            sizeNode: sizeNode,
            token: context.token,
        };
    },
    htmlBuilder,
    mathmlBuilder,
});

defineFunction({
    type: "genfrac",
    names: ["\\\\abovewithdelimsfrac"],
    props: {
        numArgs: 5,
    },
    handler: (context, args) => {
        const [numer, denom, leftDelimNode, rightDelimNode, sizeNode] = args;
        const leftDelim = delimFromNode(leftDelimNode);
        const rightDelim = delimFromNode(rightDelimNode);
        const [hasBarLine, barSize] = barLineFromNode(sizeNode);

        return {
            type: "genfrac",
            numer: numer,
            denom: denom,
            hasBarLine: hasBarLine,
            barSize: barSize,
            leftDelim: leftDelim,
            rightDelim: rightDelim,
            size: "auto",
        };
    },

    htmlBuilder,
    mathmlBuilder,
});
