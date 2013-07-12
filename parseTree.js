var parser = require("./parser.jison");
parser.lexer = require("./lexer");
parser.yy = {
    parseError: function(str) {
        throw new Error(str);
    }
};

var parseTree = function(toParse) {
    return parser.parse(toParse);
}

module.exports = parseTree;
