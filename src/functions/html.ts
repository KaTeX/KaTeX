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
    numArgs: 2,
    argTypes: ["raw", "original"],
    allowedInText: true,

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
                // `{,}` escapes a literal comma. Braces are used rather than a
                // backslash because `\,` is a macro (a thin space) that expands
                // away before this raw argument is ever read.
                const ESCAPED_COMMA = "{,}";
                const data: string[] = [];
                let current = "";
                for (let i = 0; i < value.length; i++) {
                    if (value.startsWith(ESCAPED_COMMA, i)) {
                        current += ",";
                        i += ESCAPED_COMMA.length - 1;
                    } else if (value[i] === ",") {
                        data.push(current);
                        current = "";
                    } else {
                        current += value[i];
                    }
                }
                data.push(current);
                for (let i = 0; i < data.length; i++) {
                    const item = data[i];
                    const firstEquals = item.indexOf("=");
                    if (firstEquals < 0) {
                        throw new ParseError(`\\htmlData key/value '${item}'` +
                            ` missing equals sign`);
                    }
                    const key = item.slice(0, firstEquals);
                    const value = item.slice(firstEquals + 1);
                    attributes["data-" + key.trim()] = value;
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
        for (const [attr, value] of Object.entries(group.attributes)) {
            if (attr !== "class") {
                span.setAttribute(attr, value);
            }
        }
        return span;
    },
    mathmlBuilder: (group, options) => {
        return mml.buildExpressionRow(group.body, options);
    },
});
