// @flow
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import utils from "../utils";
import stretchy from "../stretchy";
import ParseNode, {assertNodeType} from "../ParseNode";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";


const htmlBuilder = (group, options) => {
    // \cancel, \bcancel, \xcancel, \sout, \fbox, \colorbox, \fcolorbox
    const inner = html.buildGroup(group.value.body, options);

    const label = group.value.label.substr(1);
    const scale = options.sizeMultiplier;
    let img;
    let imgShift = 0;

    // In the LaTeX cancel package, line geometry is slightly different
    // depending on whether the subject is wider than it is tall, or vice versa.
    // We don't know the width of a group, so as a proxy, we test if
    // the subject is a single character. This captures most of the
    // subjects that should get the "tall" treatment.
    const isSingleChar = utils.isCharacterBox(group.value.body);

    if (label === "sout") {
        img = buildCommon.makeSpan(["stretchy", "sout"]);
        img.height = options.fontMetrics().defaultRuleThickness / scale;
        imgShift = -0.5 * options.fontMetrics().xHeight;

    } else {
        // Add horizontal padding
        if (/cancel/.test(label)) {
            if (!isSingleChar) {
                inner.classes.push("cancel-pad");
            }
        } else {
            inner.classes.push("boxpad");
        }

        // Add vertical padding
        let vertPad = 0;
        // ref: LaTeX source2e: \fboxsep = 3pt;  \fboxrule = .4pt
        // ref: cancel package: \advance\totalheight2\p@ % "+2"
        if (/box/.test(label)) {
            vertPad = label === "colorbox" ? 0.3 : 0.34;
        } else {
            vertPad = isSingleChar ? 0.2 : 0;
        }

        img = stretchy.encloseSpan(inner, label, vertPad, options);
        imgShift = inner.depth + vertPad;

        if (group.value.backgroundColor) {
            img.style.backgroundColor = group.value.backgroundColor.value;
            if (group.value.borderColor) {
                img.style.borderColor = group.value.borderColor.value;
            }
        }
    }

    let vlist;
    if (group.value.backgroundColor) {
        vlist = buildCommon.makeVList({
            positionType: "individualShift",
            children: [
                // Put the color background behind inner;
                {type: "elem", elem: img, shift: imgShift},
                {type: "elem", elem: inner, shift: 0},
            ],
        }, options);
    } else {
        vlist = buildCommon.makeVList({
            positionType: "individualShift",
            children: [
                // Write the \cancel stroke on top of inner.
                {
                    type: "elem",
                    elem: inner,
                    shift: 0,
                },
                {
                    type: "elem",
                    elem: img,
                    shift: imgShift,
                    wrapperClasses: /cancel/.test(label) ? ["svg-align"] : [],
                },
            ],
        }, options);
    }

    if (/cancel/.test(label)) {
        // The cancel package documentation says that cancel lines add their height
        // to the expression, but tests show that isn't how it actually works.
        vlist.height = inner.height;
        vlist.depth = inner.depth;
    }

    if (/cancel/.test(label) && !isSingleChar) {
        // cancel does not create horiz space for its line extension.
        return buildCommon.makeSpan(["mord", "cancel-lap"], [vlist], options);
    } else {
        return buildCommon.makeSpan(["mord"], [vlist], options);
    }
};

const mathmlBuilder = (group, options) => {
    const node = new mathMLTree.MathNode(
        "menclose", [mml.buildGroup(group.value.body, options)]);
    switch (group.value.label) {
        case "\\cancel":
            node.setAttribute("notation", "updiagonalstrike");
            break;
        case "\\bcancel":
            node.setAttribute("notation", "downdiagonalstrike");
            break;
        case "\\sout":
            node.setAttribute("notation", "horizontalstrike");
            break;
        case "\\fbox":
            node.setAttribute("notation", "box");
            break;
        case "\\fcolorbox":
            // TODO(ron): I don't know any way to set the border color.
            node.setAttribute("notation", "box");
            break;
        case "\\xcancel":
            node.setAttribute("notation", "updiagonalstrike downdiagonalstrike");
            break;
    }
    if (group.value.backgroundColor) {
        node.setAttribute("mathbackground", group.value.backgroundColor.value);
    }
    return node;
};

defineFunction({
    type: "enclose",
    names: ["\\colorbox"],
    props: {
        numArgs: 2,
        allowedInText: true,
        greediness: 3,
        argTypes: ["color", "text"],
    },
    handler({parser, funcName}, args, optArgs) {
        const color = assertNodeType(args[0], "color-token");
        const body = args[1];
        return new ParseNode("enclose", {
            type: "enclose",
            label: funcName,
            backgroundColor: color,
            body: body,
        }, parser.mode);
    },
    htmlBuilder,
    mathmlBuilder,
});

defineFunction({
    type: "enclose",
    names: ["\\fcolorbox"],
    props: {
        numArgs: 3,
        allowedInText: true,
        greediness: 3,
        argTypes: ["color", "color", "text"],
    },
    handler({parser, funcName}, args, optArgs) {
        const borderColor = assertNodeType(args[0], "color-token");
        const backgroundColor = assertNodeType(args[1], "color-token");
        const body = args[2];
        return new ParseNode("enclose", {
            type: "enclose",
            label: funcName,
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            body: body,
        }, parser.mode);
    },
    htmlBuilder,
    mathmlBuilder,
});

defineFunction({
    type: "enclose",
    names: ["\\cancel", "\\bcancel", "\\xcancel", "\\sout", "\\fbox"],
    props: {
        numArgs: 1,
    },
    handler({parser, funcName}, args, optArgs) {
        const body = args[0];
        return new ParseNode("enclose", {
            type: "enclose",
            label: funcName,
            body: body,
        }, parser.mode);
    },
    htmlBuilder,
    mathmlBuilder,
});
