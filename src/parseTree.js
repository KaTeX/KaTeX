/**
 * Provides a single function for parsing an expression using a Parser
 * TODO(emily): Remove this
 */

import Parser from "./Parser";

/**
 * Parses an expression using a Parser, then returns the parsed result.
 */
const parseTree = function(toParse, settings) {
    if (!(typeof toParse === 'string' || toParse instanceof String)) {
        throw new TypeError('KaTeX can only parse string typed expression');
    }
    const parser = new Parser(toParse, settings);

    return parser.parse();
};

module.exports = parseTree;
