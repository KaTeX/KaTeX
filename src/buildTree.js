// @flow
import buildHTML from "./buildHTML";
import buildMathML from "./buildMathML";
import buildCommon from "./buildCommon";
import Options from "./Options";
import Settings from "./Settings";
import Style from "./Style";

import type ParseNode from "./ParseNode";
import type domTree from "./domTree";

const optionsFromSettings = function(settings: Settings) {
    return new Options({
        style: (settings.displayMode ? Style.DISPLAY : Style.TEXT),
        maxSize: settings.maxSize,
    });
};

export const buildTree = function(
    tree: ParseNode[],
    expression: string,
    settings: Settings,
): domTree.span {
    const options = optionsFromSettings(settings);
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

export const buildHTMLTree = function(
    tree: ParseNode[],
    expression: string,
    settings: Settings,
): domTree.span {
    const options = optionsFromSettings(settings);
    const htmlNode = buildHTML(tree, options);
    const katexNode = buildCommon.makeSpan(["katex"], [htmlNode]);
    if (settings.displayMode) {
        return buildCommon.makeSpan(["katex-display"], [katexNode]);
    } else {
        return katexNode;
    }
};

export default buildTree;
