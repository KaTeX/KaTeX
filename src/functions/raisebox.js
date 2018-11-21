// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import {assertNodeType} from "../parseNode";
import {calculateSize} from "../units";

import * as mml from "../buildMathML";
import {htmlBuilder as textHtmlBuilder} from "./text";

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
        const amount = assertNodeType(args[0], "size").value;
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
            body: ordargument(group.body),
            font: "mathrm", // simulate \textrm
        };
        const body = textHtmlBuilder(text, options);
        const dy = calculateSize(group.dy, options);
        return buildCommon.makeVList({
            positionType: "shift",
            positionData: -dy,
            children: [{type: "elem", elem: body}],
        }, options);
    },
    mathmlBuilder(group, options) {
        const node = new mathMLTree.MathNode(
            "mpadded", [mml.buildGroup(group.body, options)]);
        const dy = group.dy.number + group.dy.unit;
        node.setAttribute("voffset", dy);
        return node;
    },
});

