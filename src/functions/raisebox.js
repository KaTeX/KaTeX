// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import {assertNodeType} from "../parseNode";
import {calculateSize} from "../units";

import * as mml from "../buildMathML";
import * as sizing from "./sizing";

// Box manipulation
defineFunction({
    type: "raisebox",
    names: ["\\raisebox"],
    props: {
        numArgs: 2,
        argTypes: ["size", "text"],
        allowedInText: true,
    },
    handler({parser}, args) {
        const amount = assertNodeType(args[0], "size");
        const body = args[1];
        return {
            type: "raisebox",
            mode: parser.mode,
            dy: amount,
            body,
        };
    },
    htmlBuilder(group, options) {
        const text = {
            type: "text",
            mode: group.mode,
            value: {
                type: "text",
                body: ordargument(group.body),
                font: "mathrm", // simulate \textrm
            },
        };
        const sizedText = {
            type: "sizing",
            mode: group.mode,
            value: {
                type: "sizing",
                value: [text],
                size: 6,                // simulate \normalsize
            },
        };
        const body = sizing.htmlBuilder(sizedText, options);
        const dy = calculateSize(group.dy.value.value, options);
        return buildCommon.makeVList({
            positionType: "shift",
            positionData: -dy,
            children: [{type: "elem", elem: body}],
        }, options);
    },
    mathmlBuilder(group, options) {
        const node = new mathMLTree.MathNode(
            "mpadded", [mml.buildGroup(group.body, options)]);
        const dy = group.dy.value.value.number + group.dy.value.value.unit;
        node.setAttribute("voffset", dy);
        return node;
    },
});

