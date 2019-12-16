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
import type {MathDomNode, documentFragment} from "./mathMLTree";
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
export const makeRow = function(body: $ReadOnlyArray<MathDomNode>): MathDomNode {
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
    } else if (font === "mathbf") {
        return "bold";
    } else if (font === "mathbb") {
        return "double-struck";
    } else if (font === "mathfrak") {
        return "fraktur";
    } else if (font === "mathscr" || font === "mathcal") {
        // MathML makes no distinction between script and caligrahpic
        return "script";
    } else if (font === "mathsf") {
        return "sans-serif";
    } else if (font === "mathtt") {
        return "monospace";
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
    isOrdgroup?: boolean,
): MathNode[] {
    if (expression.length === 1) {
        const group = buildGroup(expression[0], options);
        if (isOrdgroup && group instanceof MathNode && group.type === "mo") {
            // When TeX writers want to suppress spacing on an operator,
            // they often put the operator by itself inside braces.
            group.setAttribute("lspace", "0em");
            group.setAttribute("rspace", "0em");
        }
        return [group];
    }

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
    isOrdgroup?: boolean,
): MathDomNode {
    return makeRow(buildExpression(expression, options, isOrdgroup));
};

/**
 * Takes a group from the parser and calls the appropriate groupBuilders function
 * on it to produce a MathML node.
 */
export const buildGroup = function(
    group: ?AnyParseNode,
    options: Options,
): MathNode {
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

const setSoftLineBreaks = function(expression: MathNode[]): documentFragment {
    // We want the expression to render with soft line breaks after
    // each top-level binary or relational operator, per TeXbook p. 173.
    // Break the expression into un-breakable blocks.
    const mrows = [];
    let block = [];
    let canBeBIN = false; // The first token can't be an infix binary operator.
    for (let i = 0; i < expression.length; i++) {
        const node = expression[i];
        block.push(node);
        if (node.type && node.type === "mo") {
            const next = (i < expression.length - 1) ? expression[i + 1] : null;
            const nextNodeIsNoBreak = next && next.type &&
                (next.type === "mspace" || next.type === "mtext" ) &&
                next.attributes.linebreak &&
                next.attributes.linebreak === "nobreak";

            if (canBeBIN && !node.attributes.stretchy &&
                !node.attributes.separator && !nextNodeIsNoBreak) {
                // Start a new block. (Insert a soft linebreak.)
                mrows.push(new mathMLTree.MathNode("mrow", block));
                block = [];
            }

            const isOpenDelimiter = node.attributes.stretchy &&
                // $FlowFixMe
                "([{⌈⌊⎰⌜⌞⟦⟨⟪⟬⟮⦃⦅".indexOf(node.children[0].text) > -1;
            // Any operator that follows an open delimiter is unary.
            canBeBIN = !(node.attributes.separator || isOpenDelimiter);
        } else {
            canBeBIN = true;
        }
    }
    if (block.length > 0) {
        mrows.push(new mathMLTree.MathNode("mrow", block));
    }
    return mathMLTree.newDocumentFragment(mrows);
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
    forMathmlOnly: boolean,
): DomSpan {
    const expression = buildExpression(tree, options);

    // If expression is not a single <mrow> or <mtable>, then set soft line breaks.
    const topLevel = (
            expression.length === 1 &&
            expression[0] instanceof MathNode &&
            utils.contains(["mrow", "mtable"], expression[0].type)
        )
        ? expression[0]
        : setSoftLineBreaks(expression);

    const math = new mathMLTree.MathNode("math", [topLevel]);
    math.setAttribute("xmlns", "http://www.w3.org/1998/Math/MathML");

    // You can't style <math> nodes, so we wrap the node in a span.
    // NOTE: The span class is not typed to have <math> nodes as children, and
    // we don't want to make the children type more generic since the children
    // of span are expected to have more fields in `buildHtml` contexts.
    const wrapperClass = forMathmlOnly ? "katex" : "katex-mathml";
    // $FlowFixMe
    const wrapper = buildCommon.makeSpan([wrapperClass], [math]);

    // Include the TeX source.
    wrapper.setAttribute("data-tex", texExpression);

    return wrapper;
}
