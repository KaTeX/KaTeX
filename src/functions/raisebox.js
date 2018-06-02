// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import ParseNode, {assertNodeType} from "../ParseNode";
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
        return new ParseNode("raisebox", {
            type: "raisebox",
            dy: amount,
            body: body,
            value: ordargument(body),
        }, parser.mode);
    },
    htmlBuilder(group, options) {
        const text = new ParseNode("text", {
            type: "text",
            body: group.value.value,
            font: "mathrm", // simulate \textrm
        }, group.mode);
        const sizedText = new ParseNode("sizing", {
            type: "sizing",
            value: [text],
            size: 6,                // simulate \normalsize
        }, group.mode);
        const body = sizing.htmlBuilder(sizedText, options);
        const dy = calculateSize(group.value.dy.value.value, options);
        return buildCommon.makeVList({
            positionType: "shift",
            positionData: -dy,
            children: [{type: "elem", elem: body}],
        }, options);
    },
    mathmlBuilder(group, options) {
        const node = new mathMLTree.MathNode(
            "mpadded", [mml.buildGroup(group.value.body, options)]);
        const dy =
            group.value.dy.value.value.number + group.value.dy.value.value.unit;
        node.setAttribute("voffset", dy);
        return node;
    },
});

