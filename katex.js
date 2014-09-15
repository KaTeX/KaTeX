/**
 * This is the main entry point for KaTeX. Here, we expose functions for
 * rendering expressions either to DOM nodes or to markup strings.
 *
 * We also expose the ParseError class to check if errors thrown from KaTeX are
 * errors in the expression, or errors in javascript handling.
 */

var ParseError = require("./ParseError");

var buildTree = require("./buildTree");
var parseTree = require("./parseTree");
var utils = require("./utils");

/**
 * Parse and build an expression, and place that expression in the DOM node
 * given.
 */
var process = function(toParse, baseNode) {
    utils.clearNode(baseNode);

    var tree = parseTree(toParse);
    var node = buildTree(tree).toNode();

    baseNode.appendChild(node);
};

/**
 * Parse and build an expression, and return the markup for that.
 */
var renderToString = function(toParse) {
    var tree = parseTree(toParse);
    return buildTree(tree).toMarkup();
};

module.exports = {
    process: process,
    renderToString: renderToString,
    ParseError: ParseError
};
