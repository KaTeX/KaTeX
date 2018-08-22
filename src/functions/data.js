import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import ParseError from "../ParseError";

import {assertNodeType} from "../parseNode";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "data",
    names: ["\\data"],
    props: {
        numArgs: 2,
        allowedInText: true,
        argTypes: ["text", "original"],
    },
    handler: ({parser}, args) => {
        const body = args[1];

        const attribGroup = args[0];
        if (attribGroup.type !== "ordgroup") {
            throw new ParseError("Invalid data attributes", attribGroup);
        }
        let dataAttributes = "";
        for (let i = 0; i < attribGroup.body.length; ++i) {
            if (attribGroup.body[i].type === "spacing") {
                continue;
            }
            dataAttributes += assertNodeType(attribGroup.body[i], "textord").text;
        }
        dataAttributes = dataAttributes.split(',');
        dataAttributes = dataAttributes.map(p => p.split('='));

        const attributes = dataAttributes.reduce((obj, val) => {
            obj["data-" + val[0]] = val[1] || '';
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
