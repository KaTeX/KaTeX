var Parser = require("./Parser");
var parser = new Parser();

var parseTree = function(toParse) {
    return parser.parse(toParse);
};

module.exports = parseTree;
