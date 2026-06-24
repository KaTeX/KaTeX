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
                // Split on commas at brace depth 0 so that users can wrap
                // values containing literal commas in braces, e.g.
                //   \htmlData{annotation_text={[a,b]}}{[a, b]}
                const data = [];
                let current = "";
                let depth = 0;
                for (let i = 0; i < value.length; i++) {
                    const ch = value[i];
                    if (ch === "{") {
                        current += ch;
                        depth++;
                    } else if (ch === "}") {
                        depth--;
                        current += ch;
                    } else if (ch === "," && depth === 0) {
                        data.push(current);
                        current = "";
                    } else {
                        current += ch;
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
                    // Strip outer braces from the value if they enclose
                    // the entire value (used for grouping to protect commas).
                    let trimmed = value;
                    if (value.length > 1 && value[0] === "{" &&
                            value[value.length - 1] === "}") {
                        let d = 0;
                        let balanced = true;
                        for (let j = 1; j < value.length - 1; j++) {
                            if (value[j] === "{") { d++; }
                            else if (value[j] === "}") { d--; }
                            if (d < 0) { balanced = false; break; }
                        }
                        if (balanced && d === 0) {
                            trimmed = value.slice(1, -1);
                        }
                    }
                    attributes["data-" + key.trim()] = trimmed;
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
