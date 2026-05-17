import defineFunction, {ordargument} from "../defineFunction";
import {makeSpan} from "../buildCommon";
import {assertNodeType} from "../parseNode";
import ParseError from "../ParseError";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";
import type {AnyTrustContext} from "../Settings";

defineFunction({
    type: "html",
    names: ["\\htmlClass", "\\htmlId", "\\htmlStyle", "\\htmlData"],
    props: {
        numArgs: 2,
        argTypes: ["raw", "original"],
        allowedInText: true,
    },
    handler: ({parser, funcName, token}, args) => {
        const value = assertNodeType(args[0], "raw").string;
        const body = args[1];

        if (parser.settings.strict) {
            parser.settings.reportNonstrict("htmlExtension",
                "HTML extension is disabled on strict mode");
        }

        let trustContext: AnyTrustContext;
        const attributes: Record<string, string> = {};

        switch (funcName) {
            case "\\htmlClass":
                attributes.class = value;
                trustContext = {
                    command: "\\htmlClass",
                    class: value,
                };
                break;
            case "\\htmlId":
                attributes.id = value;
                trustContext = {
                    command: "\\htmlId",
                    id: value,
                };
                break;
            case "\\htmlStyle":
                attributes.style = value;
                trustContext = {
                    command: "\\htmlStyle",
                    style: value,
                };
                break;
            case "\\htmlData": {
                // Split on unescaped commas only. Backslash escapes the
                // following character so it is included literally.
                const data = [];
                let current = "";
                let escaped = false;
                for (const char of value) {
                    if (escaped) {
                        current += char;
                        escaped = false;
                    } else if (char === "\\") {
                        escaped = true;
                    } else if (char === ",") {
                        data.push(current);
                        current = "";
                    } else {
                        current += char;
                    }
                }
                if (escaped) {
                    current += "\\";
                }
                data.push(current);

                for (const item of data) {
                    const firstEquals = item.indexOf("=");
                    if (firstEquals < 0) {
                        throw new ParseError(`\\htmlData key/value '${item}'` +
                            ` missing equals sign`);
                    }
                    const key = item.slice(0, firstEquals).trim();
                    const val = item.slice(firstEquals + 1);
                    attributes["data-" + key] = val;
                }

                trustContext = {
                    command: "\\htmlData",
                    attributes,
                };
                break;
            }
            default:
                throw new Error("Unrecognized html command");
        }

        if (!parser.settings.isTrusted(trustContext)) {
            return parser.formatUnsupportedCmd(funcName);
        }
        return {
            type: "html",
            mode: parser.mode,
            attributes,
            body: ordargument(body),
        };
    },
    htmlBuilder: (group, options) => {
        const elements = html.buildExpression(group.body, options, false);

        const classes = ["enclosing"];
        if (group.attributes.class) {
            classes.push(...group.attributes.class.trim().split(/\s+/));
        }

        const span = makeSpan(classes, elements, options);
        for (const attr in group.attributes) {
            if (attr !== "class" && group.attributes.hasOwnProperty(attr)) {
                span.setAttribute(attr, group.attributes[attr]);
            }
        }
        return span;
    },
    mathmlBuilder: (group, options) => {
        return mml.buildExpressionRow(group.body, options);
    },
});
