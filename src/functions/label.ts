import defineFunction, {defineFunctionBuilders} from "../defineFunction";
import {makeAnchor, makeSpan} from "../buildCommon";
import {assertNodeType} from "../parseNode";
import {MathNode} from "../mathMLTree";
import ParseError from "../ParseError";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";
import type Parser from "../Parser";
import type Settings from "../Settings";
import type {ParseNode} from "../types/nodes";

// \label{name} marks an equation so that \ref{name} and \eqref{name} can link
// to it. KaTeX renders each formula on its own and doesn't know the page's
// equation numbering, so the label goes into the HTML as an id (prefixed by
// the `labelPrefix` setting, so labels can't clash with the page's own ids),
// and a reference is a link to that id which shows the label's name.
//
// Like \tag, a \label belongs to the row it's written in: in a top-level
// environment such as {align} the id goes on that row's equation number (or
// where it would be), and otherwise on the formula's \tag, or failing that
// on the formula itself. See `takeLabel`, used by parseArray and parseTree.

// The HTML id for a label: whitespace isn't allowed in an id
export const labelId = (settings: Settings, name: string): string =>
    settings.labelPrefix + name.trim().replace(/\s+/g, "-");

// The \label set since the last call, if any, as an HTML id; clears it
export const takeLabel = (parser: Parser): string | undefined => {
    const name = parser.gullet.macros.get("\\df@label");
    if (typeof name !== "string") {
        return undefined;
    }
    parser.gullet.macros.set("\\df@label", undefined, true);
    return labelId(parser.settings, name);
};

// Whether the \tag just taken put its own parentheses around it; clears it
export const takeTagParen = (parser: Parser): boolean => {
    const paren = parser.gullet.macros.has("\\df@tagparen");
    parser.gullet.macros.set("\\df@tagparen", undefined, true);
    return paren;
};

// A label with no equation number or \tag to go on: an empty anchor at the
// start of the formula (made by parseTree)
defineFunctionBuilders({
    type: "label",
    htmlBuilder(group, options) {
        const anchor = makeSpan(["katex-label"], [], options);
        anchor.setAttribute("id", group.id);
        return anchor;
    },
    mathmlBuilder(group) {
        const anchor = new MathNode("mrow", []);
        anchor.setAttribute(mml.MATHML_LABEL_ID, group.id);
        return anchor;
    },
});

defineFunction({
    type: "internal",
    names: ["\\label"],
    numArgs: 1,
    argTypes: ["raw"],
    allowedInText: true,

    handler: ({parser}, args) => {
        const name = assertNodeType(args[0], "raw").string;
        if (parser.gullet.macros.get("\\df@label") !== undefined) {
            throw new ParseError("Multiple \\label's");
        }
        // global, so a \label inside a group still reaches its row
        parser.gullet.macros.set("\\df@label", name, true);
        return {
            type: "internal",
            mode: parser.mode,
        };
    },
});

defineFunction({
    type: "ref",
    names: ["\\ref", "\\eqref"],
    numArgs: 1,
    argTypes: ["raw"],
    allowedInText: true,

    handler: ({parser, funcName}, args) => {
        const label = assertNodeType(args[0], "raw").string.trim();
        const eqref = funcName === "\\eqref";
        // The label's name as upright text, in parentheses for \eqref
        const text = eqref ? `(${label})` : label;
        const chars: ParseNode<"textord">[] = [];
        for (const c of text) {
            chars.push({
                type: "textord",
                mode: "text",
                text: c === "~" ? "\\textasciitilde" : c,
            });
        }
        // upright roman, even in italic text, as \eqref is in amsmath
        const body: ParseNode<"text"> = {
            type: "text",
            mode: parser.mode,
            font: "\\textrm",
            body: [{
                type: "text",
                mode: "text",
                font: "\\textup",
                body: chars,
            }],
        };
        return {
            type: "ref",
            mode: parser.mode,
            label,
            href: "#" + encodeURIComponent(labelId(parser.settings, label)),
            eqref,
            body: [body],
        };
    },

    htmlBuilder: (group, options) => {
        const elements = html.buildExpression(group.body, options, false);
        const anchor = makeAnchor(group.href,
            [group.eqref ? "katex-eqref" : "katex-ref"], elements, options);
        anchor.setAttribute("data-label", group.label);
        return anchor;
    },
    mathmlBuilder: (group, options) => {
        let math = mml.buildExpressionRow(group.body, options);
        if (!(math instanceof MathNode)) {
            math = new MathNode("mrow", [math]);
        }
        // marked like the HTML link, so the reference can be numbered there too
        (math as MathNode).classes.push(group.eqref ? "katex-eqref" : "katex-ref");
        (math as MathNode).setAttribute("href", group.href);
        (math as MathNode).setAttribute("data-label", group.label);
        return math;
    },
});
