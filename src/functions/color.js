// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import {assertNodeType} from "../parseNode";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

const htmlBuilder = (group, options) => {
    const elements = html.buildExpression(
        group.body,
        options.withColor(group.color),
        false
    );

    // \color isn't supposed to affect the type of the elements it contains.
    // To accomplish this, we wrap the results in a fragment, so the inner
    // elements will be able to directly interact with their neighbors. For
    // example, `\color{red}{2 +} 3` has the same spacing as `2 + 3`
    return buildCommon.makeFragment(elements);
};

const mathmlBuilder = (group, options) => {
    const inner = mml.buildExpression(group.body,
        options.withColor(group.color));

    const node = new mathMLTree.MathNode("mstyle", inner);

    node.setAttribute("mathcolor", group.color);

    return node;
};

defineFunction({
    type: "color",
    names: ["\\textcolor"],
    props: {
        numArgs: 2,
        allowedInText: true,
        greediness: 3,
        argTypes: ["color", "original"],
    },
    handler({parser}, args) {
        const color = assertNodeType(args[0], "color-token").color;
        const body = args[1];
        return {
            type: "color",
            mode: parser.mode,
            color,
            body: ordargument(body),
        };
    },
    htmlBuilder,
    mathmlBuilder,
});

defineFunction({
    type: "color",
    names: ["\\color"],
    props: {
        numArgs: 1,
        allowedInText: true,
        greediness: 3,
        argTypes: ["color"],
    },
    handler({parser, breakOnTokenText}, args) {
        const color = assertNodeType(args[0], "color-token").color;

        // If we see a styling function, parse out the implicit body
        const body = parser.parseExpression(true, breakOnTokenText);

        return {
            type: "color",
            mode: parser.mode,
            color,
            body,
        };
    },
    htmlBuilder,
    mathmlBuilder,
});
