var parseTree = require("./parseTree");
var buildTree = require("./buildTree");
var utils = require("./utils");
var ParseError = require("./ParseError");

var process = function(toParse, baseNode) {
    var tree = parseTree(toParse);
    var node = buildTree(tree);

    utils.clearNode(baseNode);
    baseNode.appendChild(node);
};

module.exports = {
    process: process,
    ParseError: ParseError
};
