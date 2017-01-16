/* eslint no-console:0 */
/**
 * This is the main entry point for KaTeX. Here, we expose functions for
 * rendering expressions either to DOM nodes or to markup strings.
 *
 * We also expose the ParseError class to check if errors thrown from KaTeX are
 * errors in the expression, or errors in javascript handling.
 */

const ParseError = require("./src/ParseError");
const Settings = require("./src/Settings");

const buildTree = require("./src/buildTree");
const parseTree = require("./src/parseTree");
const utils = require("./src/utils");

/**
 * Parse and build an expression, and place that expression in the DOM node
 * given.
 */
const render = function(expression, baseNode, options) {
    utils.clearNode(baseNode);

    const settings = new Settings(options);

    const tree = parseTree(expression, settings);
    const node = buildTree(tree, expression, settings).toNode();

    baseNode.appendChild(node);
};

/**
 * Parse and build an expression, and return the markup for that.
 */
const renderToString = function(expression, options) {
    const settings = new Settings(options);

    const tree = parseTree(expression, settings);
    return buildTree(tree, expression, settings).toMarkup();
};

/**
 * Parse an expression and return the parse tree.
 */
const generateParseTree = function(expression, options) {
    const settings = new Settings(options);
    return parseTree(expression, settings);
};

module.exports = {
    render: render,
    renderToString: renderToString,
    /**
     * NOTE: This method is not currently recommended for public use.
     * The internal tree representation is unstable and is very likely
     * to change. Use at your own risk.
     */
    __parse: generateParseTree,
    ParseError: ParseError,
};
