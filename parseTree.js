var Parser = require("./Parser");

// Parses the expression using the parser
var parseTree = function(toParse) {
    var parser = new Parser(toParse);

    return parser.parse();
}

module.exports = parseTree;
