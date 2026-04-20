/**
 * Provides a single function for parsing an expression using a Parser
 * TODO(emily): Remove this
 */

import Parser from "./Parser";
import ParseError from "./ParseError";
import {Token} from "./Token";
import functions from "./functions";

import type Settings from "./Settings";
import type {AnyParseNode} from "./parseNode";

const hasBalancedSiunitxBraces = (siunitxSettings: string): boolean => {
    let depth = 0;

    for (let i = 0; i < siunitxSettings.length; i++) {
        const char = siunitxSettings[i];
        if (char !== "{" && char !== "}") {
            continue;
        }

        // In TeX, \{ and \} are control symbols and do not open/close groups.
        let backslashCount = 0;
        for (let j = i - 1; j >= 0 && siunitxSettings[j] === "\\"; j--) {
            backslashCount++;
        }
        if (backslashCount % 2 === 1) {
            continue;
        }

        if (char === "{") {
            depth++;
        } else {
            depth--;
            if (depth < 0) {
                return false;
            }
        }
    }

    return depth === 0;
};

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
    if (settings.siunitx && !functions["\\sisetup"]) {
        throw new ParseError(
            "The `siunitx` option requires loading `katex/contrib/siunitx` first.",
        );
    }
    if (settings.siunitx && !hasBalancedSiunitxBraces(settings.siunitx)) {
        throw new ParseError(
            "Invalid `siunitx` option: unbalanced braces in settings.siunitx.",
        );
    }
    const expression = settings.siunitx
        ? `\\sisetup{${settings.siunitx}}${toParse as string}`
        : (toParse as string);
    const parser = new Parser(expression, settings);

    // Blank out any \df@tag to avoid spurious "Duplicate \tag" errors
    delete parser.gullet.macros.current["\\df@tag"];

    let tree = parser.parse();

    if (settings.siunitx && tree.length > 0) {
        const firstNode = tree[0];
        if (firstNode.type === "siunitx" && firstNode.command === "\\sisetup") {
            tree = tree.slice(1);
        }
    }

    // Prevent a color definition from persisting between calls to katex.render().
    delete parser.gullet.macros.current["\\current@color"];
    delete parser.gullet.macros.current["\\color"];
    delete parser.gullet.macros.current["\\@siunitx@options"];

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

    return tree;
};

export default parseTree;
