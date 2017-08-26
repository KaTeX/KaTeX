// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "phantom",
    names: ["\\phantom"],
    props: {
        numArgs: 1,
    },
    handler: (context, args) => {
        const body = args[0];
        return {
            type: "phantom",
            value: ordargument(body),
        };
    },
    htmlBuilder: (group, options) => {
        const elements = html.buildExpression(
            group.value.value,
            options.withPhantom(),
            false
        );

        // \phantom isn't supposed to affect the elements it contains.
        // See "color" for more details.
        return new buildCommon.makeFragment(elements);
    },
    mathmlBuilder: (group, options) => {
        const inner = mml.buildExpression(group.value.value, options);
        return new mathMLTree.MathNode("mphantom", inner);
    },
});

defineFunction({
    type: "hphantom",
    names: ["\\hphantom"],
    props: {
        numArgs: 1,
    },
    handler: (context, args) => {
        const body = args[0];
        return {
            type: "hphantom",
            value: ordargument(body),
            body: body,
        };
    },
    htmlBuilder: (group, options) => {
        let node = buildCommon.makeSpan(
            [], [html.buildGroup(group.value.body, options.withPhantom())]);
        node.height = 0;
        node.depth = 0;
        if (node.children) {
            for (let i = 0; i < node.children.length; i++) {
                node.children[i].height = 0;
                node.children[i].depth = 0;
            }
        }

        // See smash for comment re: use of makeVList
        node = buildCommon.makeVList([
            {type: "elem", elem: node},
        ], "firstBaseline", null, options);

        return node;
    },
    mathmlBuilder: (group, options) => {
        const inner = mml.buildExpression(group.value.value, options);
        const node = new mathMLTree.MathNode("mphantom", inner);
        node.setAttribute("height", "0px");
        return node;
    },
});

defineFunction({
    type: "vphantom",
    names: ["\\vphantom"],
    props: {
        numArgs: 1,
    },
    handler: (context, args) => {
        const body = args[0];
        return {
            type: "vphantom",
            value: ordargument(body),
            body: body,
        };
    },
    htmlBuilder: (group, options) => {
        const inner = buildCommon.makeSpan(
            ["inner"],
            [html.buildGroup(group.value.body, options.withPhantom())]);
        const fix = buildCommon.makeSpan(["fix"], []);
        return buildCommon.makeSpan(
            ["mord", "rlap"], [inner, fix], options);
    },
    mathmlBuilder: (group, options) => {
        const inner = mml.buildExpression(group.value.value, options);
        const node = new mathMLTree.MathNode("mphantom", inner);
        node.setAttribute("width", "0px");
        return node;
    },
});
