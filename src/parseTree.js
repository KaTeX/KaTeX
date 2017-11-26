// @flow
/**
 * Provides a single function for parsing an expression using a Parser
 * TODO(emily): Remove this
 */

import Parser from "./Parser";

import type ParseNode from "./ParseNode";
import type Settings from "./Settings";

/**
 * Parses an expression using a Parser, then returns the parsed result.
 */
const parseTree = function(toParse: string, settings: Settings): ParseNode[] {
    if (!(typeof toParse === 'string' || toParse instanceof String)) {
        throw new TypeError('KaTeX can only parse string typed expression');
    }
    const parser = new Parser(toParse, settings);

    return parser.parse();
};

export default parseTree;
