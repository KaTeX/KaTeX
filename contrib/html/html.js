// @flow
import defineFunction, {ordargument} from "../../src/defineFunction";
import buildCommon from "../../src/buildCommon";
import mathMLTree from "../../src/mathMLTree";
import domTree from "../../src/domTree";
import {defineGroupParser, newArgument} from "../../src/Parser";
import ParseNode from "../../src/ParseNode";

import {buildExpression as htmlBuildExpression} from "../../src/buildHTML";
import {buildExpression as mmlBuildExpression} from "../../src/buildMathML";

import type {ParsedArg} from "../../src/Parser";

defineGroupParser("string", function(optional: boolean): ?ParsedArg {
    const res = this.parseStringGroupWithBalancedBraces("string", optional);
    if (!res) {
        return null;
    }
    return newArgument(new ParseNode("string", res.text, "text"), res);
});

// $FlowFixMe
defineFunction({
    type: "class",
    names: ["\\class"],
    props: {
        numArgs: 2,
        allowedInText: true,
        greediness: 3,
        argTypes: ["string", "original"],
    },
    handler: (context, args) =>  {
        const classes = args[0];
        const body = args[1];
        return {
            type: "class",
            classes: classes.value,
            value: ordargument(body),
        };
    },
    htmlBuilder: (group, options) => {
        const elements = htmlBuildExpression(group.value.value, options, false);
        const classes = group.value.classes.trim().split(/\s+/);
        const fragment = new buildCommon.makeFragment(elements);

        fragment.children.forEach(children => {
            if (!(children instanceof domTree.svgNode)) {
                children.classes.push(...classes);
            }
        });
        return fragment;
    },
    mathmlBuilder: (group, options) => {
        const inner = mmlBuildExpression(group.value.value, options);
        const node = new mathMLTree.MathNode("mstyle", inner);
        node.setAttribute("class", group.value.classes);
        return node;
    },
});
