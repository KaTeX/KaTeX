// @flow
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import utils from "../utils";
import stretchy from "../stretchy";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";


const htmlBuilder = (group, options) => {
    // \cancel, \bcancel, \xcancel, \sout, \fbox, \colorbox, \fcolorbox
    const inner = html.buildGroup(group.value.body, options);

    const label = group.value.label.substr(1);
    const scale = options.sizeMultiplier;
    let img;
    let imgShift = 0;
    const isColorbox = /color/.test(label);

    if (label === "sout") {
        img = buildCommon.makeSpan(["stretchy", "sout"]);
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
            vertPad = utils.isCharacterBox(group.value.body) ? 0.2 : 0;
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
        // cancel does not create horiz space for its line extension.
        // That is, not when adjacent to a mord.
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
        case "\\colorbox":
            node.setAttribute("mathbackground",
                group.value.backgroundColor.value);
            break;
        case "\\fcolorbox":
            node.setAttribute("mathbackground",
                group.value.backgroundColor.value);
            // TODO(ron): I don't know any way to set the border color.
            node.setAttribute("notation", "box");
            break;
        default:
            // xcancel
            node.setAttribute("notation", "updiagonalstrike downdiagonalstrike");
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
    handler(context, args, optArgs) {
        const color = args[0];
        const body = args[1];
        return {
            type: "enclose",
            label: context.funcName,
            backgroundColor: color,
            body: body,
        };
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
    handler(context, args, optArgs) {
        const borderColor = args[0];
        const backgroundColor = args[1];
        const body = args[2];
        return {
            type: "enclose",
            label: context.funcName,
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            body: body,
        };
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
    handler(context, args, optArgs) {
        const body = args[0];
        return {
            type: "enclose",
            label: context.funcName,
            body: body,
        };
    },
    htmlBuilder,
    mathmlBuilder,
});
