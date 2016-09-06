/* eslint no-console:0 */
/**
 * This is the main entry point for KaTeX. Here, we expose functions for
 * rendering expressions either to DOM nodes or to markup strings.
 *
 * We also expose the ParseError class to check if errors thrown from KaTeX are
 * errors in the expression, or errors in javascript handling.
 */

var ParseError = require("./src/ParseError");
var Settings = require("./src/Settings");

var buildHTML = require("./src/buildHTML");
var buildTree = require("./src/buildTree");
var canvasRenderer = require("./src/canvasRenderer");
var parseTree = require("./src/parseTree");
var utils = require("./src/utils");

/**
 * Parse and build an expression, and place that expression in the DOM node
 * given.
 */
var render = function(expression, baseNode, options) {
    utils.clearNode(baseNode);

    var settings = new Settings(options);

    var tree = parseTree(expression, settings);
    var node = buildTree(tree, expression, settings).toNode();

    baseNode.appendChild(node);
};

// KaTeX's styles don't work properly in quirks mode. Print out an error, and
// disable rendering.
if (typeof document !== "undefined") {
    if (document.compatMode !== "CSS1Compat") {
        typeof console !== "undefined" && console.warn(
            "Warning: KaTeX doesn't work in quirks mode. Make sure your " +
                "website has a suitable doctype.");

        render = function() {
            throw new ParseError("KaTeX doesn't work in quirks mode.");
        };
    }
}

/**
 * Parse and build an expression, and return the markup for that.
 */
var renderToString = function(expression, options) {
    var settings = new Settings(options);

    var tree = parseTree(expression, settings);
    return buildTree(tree, expression, settings).toMarkup();
};

/**
 * Parse and build an expression, and render that expression to the
 * canvas at the specified position.
 */
var renderToCanvas = function(expression, canvas, x, y, options) {
    var settings = new Settings(options);

    var tree = parseTree(expression, settings);
    var dom = buildHTML(tree, settings.initialOptions());
    canvasRenderer.render(dom, canvas, x, y, options);
};

/**
 * Parse and build an expression, and measure it for rendering to the
 * specified canvas.  The returned object has some dimensions as well
 * as a renderAt method which can be used to render the whole box.
 */
var canvasBox = function(expression, canvas, options) {
    var settings = new Settings(options);

    var tree = parseTree(expression, settings);
    var dom = buildHTML(tree, settings.initialOptions());
    return canvasRenderer.prepare(dom, canvas, options);
};

/**
 * Parse an expression and return the parse tree.
 */
var generateParseTree = function(expression, options) {
    var settings = new Settings(options);
    return parseTree(expression, settings);
};

module.exports = {
    render: render,
    renderToString: renderToString,
    renderToCanvas: renderToCanvas,
    canvasBox: canvasBox,
    /**
     * NOTE: This method is not currently recommended for public use.
     * The internal tree representation is unstable and is very likely
     * to change. Use at your own risk.
     */
    __parse: generateParseTree,
    ParseError: ParseError,
};
