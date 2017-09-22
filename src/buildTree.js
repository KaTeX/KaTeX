import buildHTML from "./buildHTML";
import buildMathML from "./buildMathML";
import buildCommon from "./buildCommon";
import Options from "./Options";
import Settings from "./Settings";
import Style from "./Style";

const buildTree = function(tree, expression, settings) {
    settings = settings || new Settings({});

    let startStyle = Style.TEXT;
    if (settings.displayMode) {
        startStyle = Style.DISPLAY;
    }

    // Setup the default options
    const options = new Options({
        style: startStyle,
        maxSize: settings.maxSize,
    });

    // `buildHTML` sometimes messes with the parse tree (like turning bins ->
    // ords), so we build the MathML version first.
    const mathMLNode = buildMathML(tree, expression, options);
    const htmlNode = buildHTML(tree, options);

    const katexNode = buildCommon.makeSpan(["katex"], [
        mathMLNode, htmlNode,
    ]);

    if (settings.displayMode) {
        return buildCommon.makeSpan(["katex-display"], [katexNode]);
    } else {
        return katexNode;
    }
};

export default buildTree;
