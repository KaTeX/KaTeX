
var buildHTML = require("./buildHTML");
var buildMathML = require("./buildMathML");
var buildCommon = require("./buildCommon");

var makeSpan = buildCommon.makeSpan;

var buildTree = function(tree, expression, settings) {
    // `buildHTML` sometimes messes with the parse tree (like turning bins ->
    // ords), so we build the MathML version first.
    var mathMLNode = buildMathML(tree, expression, settings);
    var htmlNode = buildHTML(tree, settings);

    var katexNode = makeSpan(["katex"], [
        mathMLNode, htmlNode
    ]);

    if (settings.displayMode) {
        return makeSpan(["katex-display"], [katexNode]);
    } else {
        return katexNode;
    }
};

module.exports = buildTree;
