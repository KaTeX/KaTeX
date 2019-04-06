// @flow
/**
 * This file converts a parse tree into a cooresponding MathML tree. The main
 * entry point is the `buildMathML` function, which takes a parse tree from the
 * parser.
 */

import buildCommon from "./buildCommon";
import {getCharacterMetrics} from "./fontMetrics";
import mathMLTree from "./mathMLTree";
import ParseError from "./ParseError";
import symbols, {ligatures} from "./symbols";
import utils from "./utils";
import {_mathmlGroupBuilders as groupBuilders} from "./defineFunction";
import {MathNode, TextNode} from "./mathMLTree";

import type Options from "./Options";
import type {AnyParseNode, SymbolParseNode} from "./parseNode";
import type {DomSpan} from "./domTree";
import type {MathDomNode} from "./mathMLTree";
import type {FontVariant, Mode} from "./types";

/**
 * Takes a symbol and converts it into a MathML text node after performing
 * optional replacement from symbols.js.
 */
export const makeText = function(
    text: string,
    mode: Mode,
    options?: Options,
): TextNode {
    if (symbols[mode][text] && symbols[mode][text].replace &&
        text.charCodeAt(0) !== 0xD835 &&
        !(ligatures.hasOwnProperty(text) && options &&
          ((options.fontFamily && options.fontFamily.substr(4, 2) === "tt") ||
           (options.font && options.font.substr(4, 2) === "tt")))) {
        text = symbols[mode][text].replace;
    }

    return new mathMLTree.TextNode(text);
};

/**
 * Wrap the given array of nodes in an <mrow> node if needed, i.e.,
 * unless the array has length 1.  Always returns a single node.
 */
export const makeRow = function(body: MathDomNode[]): MathDomNode {
    if (body.length === 1) {
        return body[0];
    } else {
        return new mathMLTree.MathNode("mrow", body);
    }
};

/**
 * Returns the math variant as a string or null if none is required.
 */
export const getVariant = function(
    group: SymbolParseNode,
    options: Options,
): ?FontVariant {
    // Handle \text... font specifiers as best we can.
    // MathML has a limited list of allowable mathvariant specifiers; see
    // https://www.w3.org/TR/MathML3/chapter3.html#presm.commatt
    if (options.fontFamily === "texttt") {
        return "monospace";
    } else if (options.fontFamily === "textsf") {
        if (options.fontShape === "textit" &&
            options.fontWeight === "textbf") {
            return "sans-serif-bold-italic";
        } else if (options.fontShape === "textit") {
            return "sans-serif-italic";
        } else if (options.fontWeight === "textbf") {
            return "bold-sans-serif";
        } else {
            return "sans-serif";
        }
    } else if (options.fontShape === "textit" &&
               options.fontWeight === "textbf") {
        return "bold-italic";
    } else if (options.fontShape === "textit") {
        return "italic";
    } else if (options.fontWeight === "textbf") {
        return "bold";
    }

    const font = options.font;
    if (!font || font === "mathnormal") {
        return null;
    }

    const mode = group.mode;
    if (font === "mathit") {
        return "italic";
    } else if (font === "boldsymbol") {
        return "bold-italic";
    }

    let text = group.text;
    if (utils.contains(["\\imath", "\\jmath"], text)) {
        return null;
    }

    if (symbols[mode][text] && symbols[mode][text].replace) {
        text = symbols[mode][text].replace;
    }

    const fontName = buildCommon.fontMap[font].fontName;
    if (getCharacterMetrics(text, fontName, mode)) {
        return buildCommon.fontMap[font].variant;
    }

    return null;
};

/**
 * Takes a list of nodes, builds them, and returns a list of the generated
 * MathML nodes.  Also combine consecutive <mtext> outputs into a single
 * <mtext> tag.
 */
export const buildExpression = function(
    expression: AnyParseNode[],
    options: Options,
): MathDomNode[] {
    const groups = [];
    let lastGroup;
    for (let i = 0; i < expression.length; i++) {
        const group = buildGroup(expression[i], options);
        if (group instanceof MathNode && lastGroup instanceof MathNode) {
            // Concatenate adjacent <mtext>s
            if (group.type === 'mtext' && lastGroup.type === 'mtext'
                && group.getAttribute('mathvariant') ===
                   lastGroup.getAttribute('mathvariant')) {
                lastGroup.children.push(...group.children);
                continue;
            // Concatenate adjacent <mn>s
            } else if (group.type === 'mn' && lastGroup.type === 'mn') {
                lastGroup.children.push(...group.children);
                continue;
            // Concatenate <mn>...</mn> followed by <mi>.</mi>
            } else if (group.type === 'mi' && group.children.length === 1 &&
                       lastGroup.type === 'mn') {
                const child = group.children[0];
                if (child instanceof TextNode && child.text === '.') {
                    lastGroup.children.push(...group.children);
                    continue;
                }
            } else if (lastGroup.type === 'mi' && lastGroup.children.length === 1) {
                const lastChild = lastGroup.children[0];
                if (lastChild instanceof TextNode && lastChild.text === '\u0338' &&
                    (group.type === 'mo' || group.type === 'mi' ||
                        group.type === 'mn')) {
                    const child = group.children[0];
                    if (child instanceof TextNode && child.text.length > 0) {
                        // Overlay with combining character long solidus
                        child.text = child.text.slice(0, 1) + "\u0338" +
                            child.text.slice(1);
                        groups.pop();
                    }
                }
            }
        }
        groups.push(group);
        lastGroup = group;
    }
    return groups;
};

/**
 * Equivalent to buildExpression, but wraps the elements in an <mrow>
 * if there's more than one.  Returns a single node instead of an array.
 */
export const buildExpressionRow = function(
    expression: AnyParseNode[],
    options: Options,
): MathDomNode {
    return makeRow(buildExpression(expression, options));
};

/**
 * Takes a group from the parser and calls the appropriate groupBuilders function
 * on it to produce a MathML node.
 */
export const buildGroup = function(
    group: ?AnyParseNode,
    options: Options,
): MathDomNode {
    if (!group) {
        return new mathMLTree.MathNode("mrow");
    }

    if (groupBuilders[group.type]) {
        // Call the groupBuilders function
        // $FlowFixMe
        const result: MathDomNode = groupBuilders[group.type](group, options);
        return result;
    } else {
        throw new ParseError(
            "Got group of unknown type: '" + group.type + "'");
    }
};

/**
 * Takes a full parse tree and settings and builds a MathML representation of
 * it. In particular, we put the elements from building the parse tree into a
 * <semantics> tag so we can also include that TeX source as an annotation.
 *
 * Note that we actually return a domTree element with a `<math>` inside it so
 * we can do appropriate styling.
 */
export default function buildMathML(
    tree: AnyParseNode[],
    texExpression: string,
    options: Options,
): DomSpan {
    const expression = buildExpression(tree, options);

    // Wrap up the expression in an mrow so it is presented in the semantics
    // tag correctly, unless it's a single <mrow> or <mtable>.
    let wrapper;
    if (expression.length === 1 && expression[0] instanceof MathNode &&
        utils.contains(["mrow", "mtable"], expression[0].type)) {
        wrapper = expression[0];
    } else {
        wrapper = new mathMLTree.MathNode("mrow", expression);
    }

    // Build a TeX annotation of the source
    const annotation = new mathMLTree.MathNode(
        "annotation", [new mathMLTree.TextNode(texExpression)]);

    annotation.setAttribute("encoding", "application/x-tex");

    const semantics = new mathMLTree.MathNode(
        "semantics", [wrapper, annotation]);

    const math = new mathMLTree.MathNode("math", [semantics]);

    // You can't style <math> nodes, so we wrap the node in a span.
    // NOTE: The span class is not typed to have <math> nodes as children, and
    // we don't want to make the children type more generic since the children
    // of span are expected to have more fields in `buildHtml` contexts.
    // $FlowFixMe
    return buildCommon.makeSpan(["katex-mathml"], [math]);
}
