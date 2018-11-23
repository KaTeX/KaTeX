// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

const htmlBuilder = (group, options) => {
    const elements = html.buildExpression(
        group.body,
        options,
        false
    );
    for (let i = 0; i < elements.length; i++) {
        elements[i].classes.push(group.xmlClass.string);
    }
    // \xmlClass isn't supposed to affect the type of the elements it contains.
    // To accomplish this, we wrap the results in a fragment, so the inner
    // elements will be able to directly interact with their neighbors. For
    // example, `\xmlClass{asd}{2 +} 3` has the same spacing as `2 + 3`
    return buildCommon.makeFragment(elements);
};

const mathmlBuilder = (group, options) => {
    const inner = mml.buildExpression(group.body, options);

    const node = new mathMLTree.MathNode("mstyle", inner);

    node.setAttribute("class", group.xmlClass);

    return node;
};

defineFunction({
    type: "xmlClass",
    names: ["\\xmlClass"],
    props: {
        numArgs: 2,
        allowedInText: true,
        greediness: 3,
        argTypes: ["raw", "original"],
    },
    handler({parser}, args) {
        const xmlClass = args[0];
        const body = args[1];
        return {
            type: "xmlClass",
            mode: parser.mode,
            xmlClass,
            body: ordargument(body),
        };
    },
    htmlBuilder,
    mathmlBuilder,
});
