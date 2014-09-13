var ParseError = require("./ParseError");

var buildTree = require("./buildTree");
var parseTree = require("./parseTree");
var utils = require("./utils");

var process = function(toParse, baseNode) {
    utils.clearNode(baseNode);

    var tree = parseTree(toParse);
    var node = buildTree(tree).toNode();

    baseNode.appendChild(node);
};

var renderToString = function(toParse) {
    var tree = parseTree(toParse);
    return buildTree(tree).toMarkup();
};

module.exports = {
    process: process,
    renderToString: renderToString,
    ParseError: ParseError
};
