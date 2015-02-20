/**
 * This is the main entry point for KaTeX. Here, we expose functions for
 * rendering expressions either to DOM nodes or to markup strings.
 *
 * We also expose the ParseError class to check if errors thrown from KaTeX are
 * errors in the expression, or errors in javascript handling.
 */

var ParseError = require("./src/ParseError");
var Settings = require("./src/Settings");

var buildTree = require("./src/buildTree");
var parseTree = require("./src/parseTree");
var utils = require("./src/utils");

/**
 * Parse and build an expression, and place that expression in the DOM node
 * given.
 */
var render = function(toParse, baseNode, options) {
    utils.clearNode(baseNode);

    var settings = new Settings(options);

    var tree = parseTree(toParse, settings);
    var node = buildTree(tree, settings).toNode();

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
var renderToString = function(toParse, options) {
    var settings = new Settings(options);

    var tree = parseTree(toParse, settings);
    return buildTree(tree, settings).toMarkup();
};

var renderByClass = function(classToParse){
    var elements = document.getElementsByClassName(classToParse);
    // Loop through the elements
    for (var i = 0; i < elements.length; i++){
        // Get the current html for that element
        var currentHTML = elements[i].innerHTML;
        // Render 
        var renderedHTML = renderToString(currentHTML);
        // Update the HTML
        elements[i].innerHTML = renderedHTML;
    }
}

module.exports = {
    render: render,
    renderToString: renderToString,
    renderByClass: renderByClass,
    ParseError: ParseError
};
