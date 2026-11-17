import Parser from "./Parser";
import ParseError from "./ParseError";
import {Token} from "./Token";
import {takeLabel, takeTagParen} from "./functions/label";

import type Settings from "./Settings";
import type {AnyParseNode} from "./types/nodes";

/**
 * Parses an expression using a Parser, then returns the parsed result.
 */
const parseTree = function(
    toParse: string | InstanceType<typeof String>,
    settings: Settings,
): AnyParseNode[] {
    if (!(typeof toParse === 'string' || toParse instanceof String)) {
        throw new TypeError('KaTeX can only parse string typed expression');
    }
    const parser = new Parser(toParse as string, settings);

    // Blank out any \df@tag to avoid spurious "Duplicate \tag" errors
    delete parser.gullet.macros.current["\\df@tag"];
    delete parser.gullet.macros.current["\\df@tagparen"];
    delete parser.gullet.macros.current["\\df@label"];

    let tree = parser.parse();

    // Prevent a color definition from persisting between calls to katex.render().
    delete parser.gullet.macros.current["\\current@color"];
    delete parser.gullet.macros.current["\\color"];

    // If the input used \tag, it will set the \df@tag macro to the tag.
    // In this case, we separately parse the tag and wrap the tree.
    if (parser.gullet.macros.get("\\df@tag")) {
        if (!settings.displayMode) {
            throw new ParseError("\\tag works only in display equations");
        }
        tree = [{
            type: "tag",
            mode: "text",
            body: tree,
            tag: parser.subparse([new Token("\\df@tag")]),
        }];
    }
    const tagParen = takeTagParen(parser);

    // A \label that no environment's row took (taken after the \tag, which
    // may hold it) belongs to the whole formula: its \tag, if it has one, or
    // else an empty anchor at its start (which buildHTML keeps out of the way
    // of an environment's equation numbers).
    const label = takeLabel(parser);
    if (label) {
        if (tree.length === 1 && tree[0].type === "tag") {
            tree[0].label = label;
            // for a \ref to leave out the parentheses \tag (not \tag*) added
            if (tagParen) {
                tree[0].paren = true;
            }
        } else {
            tree = [{type: "label", mode: "math", id: label}, ...tree];
        }
    }

    return tree;
};

export default parseTree;
