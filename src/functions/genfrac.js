// @flow
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import delimiter from "../delimiter";
import mathMLTree from "../mathMLTree";
import Style from "../Style";
import ParseNode from "../ParseNode";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";
import type {Measurement} from "../units" ;       //  <-- NEW!
import {calculateSize} from "../units";           //  <-- NEW!

const htmlBuilder = (group, options) => {
    // Fractions are handled in the TeXbook on pages 444-445, rules 15(a-e).
    // Figure out what style this fraction should be in based on the
    // function used
    let style = options.style;
    if (group.value.size === "display") {
        style = Style.DISPLAY;
    } else if (group.value.size === "text" &&
        style.size === Style.DISPLAY.size) {
        // We're in a \tfrac but incoming style is displaystyle, so:
        style = Style.TEXT;
    } else if (group.value.size === "script") {         //  <-- NEW!
        style = Style.SCRIPT;                           //  <-- NEW!
    } else if (group.value.size === "scriptscript") {   //  <-- NEW!
        style = Style.SCRIPTSCRIPT;                     //  <-- NEW!
    }                                                   //  <-- NEW!

    const nstyle = style.fracNum();
    const dstyle = style.fracDen();
    let newOptions;

    newOptions = options.havingStyle(nstyle);
    const numerm = html.buildGroup(group.value.numer, newOptions, options);

    if (group.value.continued) {
        // \cfrac inserts a \strut into the numerator.
        // Get \strut dimensions from TeXbook page 353.
        const hStrut = 8.5 / options.fontMetrics().ptPerEm;
        const dStrut = 3.5 / options.fontMetrics().ptPerEm;
        numerm.height = numerm.height < hStrut ? hStrut : numerm.height;
        numerm.depth = numerm.depth < dStrut ? dStrut : numerm.depth;
    }

    newOptions = options.havingStyle(dstyle);
    const denomm = html.buildGroup(group.value.denom, newOptions, options);

    let rule;
    let ruleWidth;
    let ruleSpacing;
    if (group.value.hasBarLine) {
        if (group.value.barSize) {                                           //NEW!
            ruleWidth = calculateSize(group.value.barSize, options);         //NEW!
            rule = buildCommon.makeLineSpan("frac-line", options, ruleWidth);//NEW!
        } else {
            rule = buildCommon.makeLineSpan("frac-line", options);
        }
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
                {type: "elem", elem: rule,   shift: midShift},
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

    if (group.value.continued) {
        rightDelim = buildCommon.makeSpan([]); // zero width for \cfrac
    } else if (group.value.rightDelim == null) {
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
    } else if (group.value.barSize) {                                  // NEW!
        const ruleWidth = calculateSize(group.value.barSize, options); // NEW!
        node.setAttribute("linethickness", ruleWidth + "em");          // NEW!
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

        return mml.makeRow(withDelims);
    }

    return node;
};

defineFunction({
    type: "genfrac",
    names: [
        "\\cfrac", "\\dfrac", "\\frac", "\\tfrac",
        "\\dbinom", "\\binom", "\\tbinom",
        "\\\\atopfrac", // can’t be entered directly
        "\\\\bracefrac", "\\\\brackfrac",   // ditto         <--- NEW!
    ],
    props: {
        numArgs: 2,
        greediness: 2,
    },
    handler: ({parser, funcName}, args) => {
        const numer = args[0];
        const denom = args[1];
        let hasBarLine;
        let leftDelim = null;
        let rightDelim = null;
        let size = "auto";

        switch (funcName) {
            case "\\cfrac":
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
            case "\\\\bracefrac":         //   <--- NEW!
                hasBarLine = false;       //   <--- NEW!
                leftDelim = "\\{";        //   <--- NEW!
                rightDelim = "\\}";       //   <--- NEW!
                break;                    //   <--- NEW!
            case "\\\\brackfrac":         //   <--- NEW!
                hasBarLine = false;       //   <--- NEW!
                leftDelim = "[";          //   <--- NEW!
                rightDelim = "]";         //   <--- NEW!
                break;                    //   <--- NEW!
            default:
                throw new Error("Unrecognized genfrac command");
        }

        switch (funcName) {
            case "\\cfrac":
            case "\\dfrac":
            case "\\dbinom":
                size = "display";
                break;
            case "\\tfrac":
            case "\\tbinom":
                size = "text";
                break;
        }

        return new ParseNode("genfrac", {
            type: "genfrac",
            continued: funcName === "\\cfrac",
            numer: numer,
            denom: denom,
            hasBarLine: hasBarLine,
            leftDelim: leftDelim,
            rightDelim: rightDelim,
            size: size,
            barSize: null,
        }, parser.mode);
    },

    htmlBuilder,
    mathmlBuilder,
});

// Infix generalized fractions -- these are not rendered directly, but replaced
// immediately by one of the variants above.
defineFunction({
    type: "infix",
    names: ["\\over", "\\choose", "\\atop", "\\brace", "\\brack"],
    props: {
        numArgs: 0,
        infix: true,
    },
    handler({parser, funcName, token}) {
        let replaceWith;
        switch (funcName) {
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
        return new ParseNode("infix", {
            type: "infix",
            replaceWith: replaceWith,
            token: token,
        }, parser.mode);
    },
});

const stylArray = ["display", "text", "script", "scriptscript"];

// $FlowFixMe
const delimFromValue = function(delimString: string): string | null {
    let delim = null;
    if (delimString.length > 0) {
        delim = delimString;
        delim = delim === "." ? null : delim;
    }
    return delim;
};

defineFunction({
    type: "genfrac",
    names: ["\\genfrac"],
    props: {
        numArgs: 6,
        greediness: 6,
        argTypes: ["math", "math", "size", "text", "math", "math"],
    },
    handler: ({parser, funcName}, args) => {
        const [leftNode, rightNode, barNode, styl, numer, denom] = args;

        const leftDelim = delimFromValue(leftNode.value);
        const rightDelim = delimFromValue(rightNode.value);

        let hasBarLine;
        let barSize = null;
        if (barNode.value.isBlank) {
            // \genfrac acts differently than the other fractions.
            // It treats an empty bar size group as a signal to use
            // a standard bar size.
            hasBarLine = true;
        } else {
            // $FlowFixMe
            barSize = barNode.value.value;
            // $FlowFixMe
            hasBarLine = barSize.number > 0;
        }

        let size = "auto";
        // $FlowFixMe
        if (styl.value.length > 0) {
            // $FlowFixMe
            size = stylArray[styl.value[0].value];
        }

        // $FlowFixMe
        return new ParseNode("genfrac", {
            type: "genfrac",
            numer: numer,
            denom: denom,
            continued: false,
            hasBarLine: hasBarLine,
            barSize: barSize,
            leftDelim: leftDelim,
            rightDelim: rightDelim,
            size: size,
        }, parser.mode);
    },

    htmlBuilder,
    mathmlBuilder,
});

// Infix fractions with more operands than just numerator and denominator
defineFunction({
    type: "infix",
    names: ["\\above"],
    props: {
        numArgs: 1,
        argTypes: ["size"],
        infix: true,
    },
    handler({parser, funcName, token}, args) {
        const [sizeNode] = args;
        // $FlowFixMe
        return new ParseNode("infix", {
            type: "infix",
            replaceWith: "\\\\abovefrac",
            sizeNode: sizeNode,
            token: token,
        }, parser.mode);
    },
});

defineFunction({
    type: "infix",
    names: ["\\atopwithdelims", "\\overwithdelims"],
    props: {
        numArgs: 2,
        infix: true,
    },
    handler({parser, funcName, token}, args) {
        const [leftDelim, rightDelim] = args;
        return new ParseNode("infix", {
            type: "infix",
            replaceWith: "\\" + funcName + "frac",
            leftDelim: leftDelim,
            rightDelim: rightDelim,
            token: token,
        }, parser.mode);
    },
});

defineFunction({
    type: "infix",
    names: ["\\abovewithdelims"],
    props: {
        numArgs: 3,
        argTypes: ["math", "math", "size"],
        infix: true,
    },
    handler({parser, funcName, token}, args) {
        const [leftDelim, rightDelim, sizeNode] = args;
        // $FlowFixMe
        return new ParseNode("infix", {
            type: "infix",
            replaceWith: "\\\\abovewithdelimsfrac",
            leftDelim: leftDelim,
            rightDelim: rightDelim,
            sizeNode: sizeNode,
            token: token,
        }, parser.mode);
    },
});

defineFunction({
    type: "genfrac",
    names: ["\\\\abovefrac"],
    props: {
        numArgs: 3,
        argTypes: ["math", "size", "math"],
    },
    handler: ({parser, funcName}, args) => {
        const [numer, sizeNode, denom] = args;

        // $FlowFixMe
        const barSize = sizeNode.value.sizeNode.value.value;
        // $FlowFixMe
        const hasBarLine = barSize.number > 0;
        // $FlowFixMe
        return new ParseNode("genfrac", {
            type: "genfrac",
            numer: numer,
            denom: denom,
            continued: false,
            hasBarLine: hasBarLine,
            barSize: barSize,
            leftDelim: null,
            rightDelim: null,
            size: "auto",
        }, parser.mode);
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
    handler: ({parser, funcName}, args) => {
        const [numer, infixNode, denom] = args;
        // $FlowFixMe
        const leftDelim = delimFromValue(infixNode.value.leftDelim.value);
        // $FlowFixMe
        const rightDelim = delimFromValue(infixNode.value.rightDelim.value);
        const hasBarLine = funcName === "\\\\overwithdelimsfrac";

        return new ParseNode("genfrac", {
            type: "genfrac",
            numer: numer,
            denom: denom,
            continued: false,
            hasBarLine: hasBarLine,
            barSize: null,
            leftDelim: leftDelim,
            rightDelim: rightDelim,
            size: "auto",
        }, parser.mode);
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
    handler: ({parser, funcName}, args) => {
       const [numer, infixNode, denom] = args;
        // $FlowFixMe
        const leftDelim = delimFromValue(infixNode.value.leftDelim.value);
        // $FlowFixMe
        const rightDelim = delimFromValue(infixNode.value.rightDelim.value);

        // $FlowFixMe
        const barSize = infixNode.value.sizeNode.value.value;
        const hasBarLine = barSize.number > 0;

        return new ParseNode("genfrac", {
            type: "genfrac",
            numer: numer,
            denom: denom,
            continued: false,
            hasBarLine: hasBarLine,
            barSize: barSize,
            leftDelim: leftDelim,
            rightDelim: rightDelim,
            size: "auto",
        }, parser.mode);
    },

    htmlBuilder,
    mathmlBuilder,
});
