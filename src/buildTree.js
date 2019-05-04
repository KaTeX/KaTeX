// @flow
import buildHTML from "./buildHTML";
import buildMathML from "./buildMathML";
import buildCommon from "./buildCommon";
import Options from "./Options";
import Settings from "./Settings";
import Style from "./Style";

import type {AnyParseNode} from "./parseNode";
import type {DomSpan} from "./domTree";

const optionsFromSettings = function(settings: Settings) {
    return new Options({
        style: (settings.displayMode ? Style.DISPLAY : Style.TEXT),
        maxSize: settings.maxSize,
    });
};

const displayWrap = function(node: DomSpan, settings: Settings): DomSpan {
    if (settings.displayMode) {
        const classes = ["katex-display"];
        if (settings.leqno) {
            classes.push("leqno");
        }
        if (settings.fleqn) {
            classes.push("fleqn");
        }
        node = buildCommon.makeSpan(classes, [node]);
    }
    return node;
};

export const buildTree = function(
    tree: AnyParseNode[],
    expression: string,
    settings: Settings,
): DomSpan {
    const options = optionsFromSettings(settings);
    const mathMLNode = buildMathML(tree, expression, options);
    const htmlNode = buildHTML(tree, options);

    const katexNode = buildCommon.makeSpan(["katex"], [
        mathMLNode, htmlNode,
    ]);

    return displayWrap(katexNode, settings);
};

export const buildHTMLTree = function(
    tree: AnyParseNode[],
    expression: string,
    settings: Settings,
): DomSpan {
    const options = optionsFromSettings(settings);
    const htmlNode = buildHTML(tree, options);
    const katexNode = buildCommon.makeSpan(["katex"], [htmlNode]);
    return displayWrap(katexNode, settings);
};

export const buildMathMLTree = function(
    tree: AnyParseNode[],
    expression: string,
    settings: Settings,
): DomSpan {
    const options = optionsFromSettings(settings);
    const mathMLNode = buildMathML(tree, expression, options);
    // Flow doesn't think a DomSpan has children.
    // $FlowFixMe
    const node = (buildCommon.makeSpan([], [mathMLNode])).children[0].children[0];
    node.setAttribute("xmlns", "http://www.w3.org/1998/Math/MathML");
    return node;
};

export default buildTree;
