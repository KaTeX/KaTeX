import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";

import {assertNodeType} from "../parseNode";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "data",
    names: ["\\data"],
    props: {
        numArgs: 2,
        allowedInText: true,
        argTypes: ["raw", "original"],
    },
    handler: ({parser}, args) => {
        const attributeStr = assertNodeType(args[0], "raw").string;
        const body = args[1];

        const attributes = attributeStr
            .split(',')
            .map(p => p.split('='))
            .reduce((obj, val) => {
                const name = val[0].trim();
                const value = val[1] || '';
                obj["data-" + name] = value.trim();
                return obj;
            }, {});

        return {
            type: "data",
            mode: parser.mode,
            body: ordargument(body),
            attributes,
        };
    },
    htmlBuilder: (group, options) => {
        const elements = html.buildExpression(
            group.body,
            options.withAttributes(group.attributes),
            false
        );

        // \data isn't supposed to affect the elements it contains.
        // See "color" for more details.
        return buildCommon.makeFragment(elements);
    },
    mathmlBuilder: (group, options) => {
        const inner = mml.buildExpression(group.body, options);
        return new mathMLTree.MathNode("mdata", inner);
    },
});
