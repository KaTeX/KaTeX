const buildHTML = require("./buildHTML");
const buildMathML = require("./buildMathML");
const buildCommon = require("./buildCommon");
const Options = require("./Options");
const Settings = require("./Settings");
const Style = require("./Style");

const makeSpan = buildCommon.makeSpan;

const buildTree = function(tree, expression, settings) {
    settings = settings || new Settings({});

    let startStyle = Style.TEXT;
    if (settings.displayMode) {
        startStyle = Style.DISPLAY;
    }

    // Setup the default options
    const options = new Options({
        style: startStyle,
        size: "size5",
    });

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
