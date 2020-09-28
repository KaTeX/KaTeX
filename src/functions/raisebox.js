// @flow
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import {assertNodeType} from "../parseNode";
import {calculateSize} from "../units";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

// \raisebox, \raise, and \lower

const htmlBuilder = (group, options) => {
    const body = html.buildGroup(group.body, options);
    const dy = calculateSize(group.dy, options);
    return buildCommon.makeVList({
        positionType: "shift",
        positionData: -dy,
        children: [{type: "elem", elem: body}],
    }, options);
};

const mathmlBuilder = (group, options) => {
    const node = new mathMLTree.MathNode(
        "mpadded", [mml.buildGroup(group.body, options)]);
    const dy = group.dy.number;
    node.setAttribute("voffset", dy + group.dy.unit);
    return node;
};

defineFunction({
    type: "raisebox",
    names: ["\\raisebox"],
    props: {
        numArgs: 2,
        argTypes: ["size", "hbox"],
        allowedInText: true,
    },
    handler({parser, funcName}, args) {
        const amount = assertNodeType(args[0], "size").value;
        const body = args[1];
        return {
            type: "raisebox",
            mode: parser.mode,
            funcName,
            dy: amount,
            body,
        };
    },
    htmlBuilder,
    mathmlBuilder,
});

defineFunction({
    type: "raisebox",
    names: ["\\raise", "\\lower"],
    props: {
        numArgs: 2,
        argTypes: ["size", "hbox"],
        allowedInText: true,
        primitive: true,
    },
    handler({parser, funcName}, args) {
        const amount = assertNodeType(args[0], "size").value;
        amount.number = funcName === "\\lower" ? -amount.number : amount.number;
        const body = args[1];
        return {
            type: "raisebox",
            mode: parser.mode,
            funcName,
            dy: amount,
            body,
        };
    },
    htmlBuilder,
    mathmlBuilder,
});
