var ParseError = require("./ParseError");

var buildTree = require("./buildTree");
var parseTree = require("./parseTree");
var utils = require("./utils");

var process = function(toParse, baseNode) {
    utils.clearNode(baseNode);

    var tree = parseTree(toParse);
    var node = buildTree(tree).toDOM();

    baseNode.appendChild(node);
};

module.exports = {
    process: process,
    ParseError: ParseError
};
