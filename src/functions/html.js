// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import ParseNode, {assertNodeType} from "../ParseNode";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "html",
    names: ["\\class", "\\cssId"],
    props: {
        numArgs: 2,
        argTypes: ["string", "original"],
    },
    handler: ({parser, funcName, token}, args) => {
        if (parser.settings.strict) {
            parser.settings.reportNonstrict("htmlExtension",
                "HTML extension is disabled on strict mode");
        }

        const value = assertNodeType(args[0], "string").value.value;
        const body = ordargument(args[1]);
        return new ParseNode("html", {
            type: "html",
            [funcName.substr(1)]: value,
            body,
        }, parser.mode);
    },
    htmlBuilder: (group, options) => {
        const elements = html.buildExpression(group.value.body, options, false);
        const classes = ["enclosing"];
        if (group.value.class) {
            classes.push(...group.value.class.trim().split(/\s+/));
        }

        const span = new buildCommon.makeSpan(classes, elements, options);
        if (group.value.cssId) {
            span.setAttribute('id', group.value.cssId);
        }
        return span;
    },
    mathmlBuilder: (group, options) => {
        const math = mml.buildExpressionRow(group.value.body, options);
        if (group.value.class) {
            math.setAttribute('class', group.value.class);
        }
        if (group.value.cssId) {
            math.setAttribute('id', group.value.cssId);
        }
        return math;
    },
});
