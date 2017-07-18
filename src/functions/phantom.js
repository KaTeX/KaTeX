import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction(
    "\\phantom",
    {
        numArgs: 1,
    },
    (context, args) => {
        const body = args[0];
        return {
            type: "phantom",
            value: ordargument(body),
        };
    },
    "phantom",
    (group, options) => {
        const elements = html.buildExpression(
            group.value.value,
            options.withPhantom(),
            false
        );

        // \phantom isn't supposed to affect the elements it contains.
        // See "color" for more details.
        return new buildCommon.makeFragment(elements);
    },
    (group, options) => {
        const inner = mml.buildExpression(group.value.value, options);
        return new mathMLTree.MathNode("mphantom", inner);
    },
);

defineFunction(
    "\\hphantom",
    {
        numArgs: 1,
    },
    (context, args) => {
        const body = args[0];
        return {
            type: "hphantom",
            value: ordargument(body),
            body: body,
        };
    },
    "hphantom",
    (group, options) => {
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
    (group, options) => {
        const inner = mml.buildExpression(group.value.value, options);
        const node = new mathMLTree.MathNode("mphantom", inner);
        node.setAttribute("height", "0px");
        return node;
    },
);

defineFunction(
    "\\vphantom",
    {
        numArgs: 1,
    },
    (context, args) => {
        const body = args[0];
        return {
            type: "vphantom",
            value: ordargument(body),
            body: body,
        };
    },
    "vphantom",
    (group, options) => {
        const inner = buildCommon.makeSpan(
            ["inner"],
            [html.buildGroup(group.value.body, options.withPhantom())]);
        const fix = buildCommon.makeSpan(["fix"], []);
        return buildCommon.makeSpan(
            ["mord", "rlap"], [inner, fix], options);
    },
    (group, options) => {
        const inner = mml.buildExpression(group.value.value, options);
        const node = new mathMLTree.MathNode("mphantom", inner);
        node.setAttribute("width", "0px");
        return node;
    },
);

