// @flow
/**
 * Provides a single function for parsing an expression using a Parser
 * TODO(emily): Remove this
 */

import Parser from "./Parser";
import ParseError from "./ParseError";
import ParseNode from "./ParseNode";

import type Settings from "./Settings";
import type {AnyParseNode} from "./ParseNode";

/**
 * Parses an expression using a Parser, then returns the parsed result.
 */
const parseTree = function(toParse: string, settings: Settings): AnyParseNode[] {
    if (!(typeof toParse === 'string' || toParse instanceof String)) {
        throw new TypeError('KaTeX can only parse string typed expression');
    }
    const parser = new Parser(toParse, settings);
    // Blank out any \df@tag to avoid spurious "Duplicate \tag" errors
    delete parser.gullet.macros.current["\\df@tag"];
    let tree = parser.parse();

    // If the input used \tag, it will set the \df@tag macro to the tag.
    // In this case, we separately parse the tag and wrap the tree.
    if (parser.gullet.macros.get("\\df@tag")) {
        if (!settings.displayMode) {
            throw new ParseError("\\tag works only in display equations");
        }
        parser.gullet.feed("\\df@tag");
        tree = [new ParseNode("tag", {
            type: "tag",
            body: tree,
            tag: parser.parse(),
        }, "text")];
    }

    return tree;
};

export default parseTree;
