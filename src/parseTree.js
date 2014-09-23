/**
 * Provides a single function for parsing an expression using a Parser
 * TODO(emily): Remove this
 */

var Parser = require("./Parser");

/**
 * Parses an expression using a Parser, then returns the parsed result.
 */
var parseTree = function(toParse) {
    var parser = new Parser(toParse);

    return parser.parse();
};

module.exports = parseTree;
