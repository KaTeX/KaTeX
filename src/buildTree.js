const buildHTML = require("./buildHTML");
const buildMathML = require("./buildMathML");
const buildCommon = require("./buildCommon");
const Settings = require("./Settings");

const makeSpan = buildCommon.makeSpan;

const buildTree = function(tree, expression, settings) {
    settings = settings || new Settings({});
    const options = settings.initialOptions();

    // `buildHTML` sometimes messes with the parse tree (like turning bins ->
    // ords), so we build the MathML version first.
    const mathMLNode = buildMathML(tree, expression, options);
    const htmlNode = buildHTML(tree, options);

    const katexNode = makeSpan(["katex"], [
        mathMLNode, htmlNode,
    ]);

    if (settings.displayMode) {
        return makeSpan(["katex-display"], [katexNode]);
    } else {
        return katexNode;
    }
};

module.exports = buildTree;
