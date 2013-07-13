var Parser = require("./Parser");
var parser = new Parser({verbose: true});

var parseTree = function(toParse) {
    return parser.parse(toParse);
}

module.exports = parseTree;
