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

/**
 * Takes a symbol and converts it into a MathML text node after performing
 * optional replacement from symbols.js.
 */
export const makeText = function(text, mode, options) {
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
export const makeRow = function(body) {
    if (body.length === 1) {
        return body[0];
    } else {
        return new mathMLTree.MathNode("mrow", body);
    }
};

/**
 * Returns the math variant as a string or null if none is required.
 */
export const getVariant = function(group, options) {
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
    if (!font) {
        return null;
    }

    const mode = group.mode;
    if (font === "mathit") {
        return "italic";
    } else if (font === "boldsymbol") {
        return "bold-italic";
    }

    let value = group.value;
    if (utils.contains(["\\imath", "\\jmath"], value)) {
        return null;
    }

    if (symbols[mode][value] && symbols[mode][value].replace) {
        value = symbols[mode][value].replace;
    }

    const fontName = buildCommon.fontMap[font].fontName;
    if (getCharacterMetrics(value, fontName, mode)) {
        return buildCommon.fontMap[font].variant;
    }

    return null;
};

/**
 * Takes a list of nodes, builds them, and returns a list of the generated
 * MathML nodes.  Also combine consecutive <mtext> outputs into a single
 * <mtext> tag.
 */
export const buildExpression = function(expression, options) {
    const groups = [];
    let lastGroup;
    for (let i = 0; i < expression.length; i++) {
        const group = buildGroup(expression[i], options);
        // Concatenate adjacent <mtext>s
        if (group.type === 'mtext' && lastGroup && lastGroup.type === 'mtext'
            && group.getAttribute('mathvariant') ===
               lastGroup.getAttribute('mathvariant')) {
            lastGroup.children.push(...group.children);
        // Concatenate adjacent <mn>s
        } else if (group.type === 'mn' &&
                   lastGroup && lastGroup.type === 'mn') {
            lastGroup.children.push(...group.children);
        // Concatenate <mn>...</mn> followed by <mi>.</mi>
        } else if (group.type === 'mi' && group.children.length === 1 &&
                   group.children[0].text === '.' &&
                   lastGroup && lastGroup.type === 'mn') {
            lastGroup.children.push(...group.children);
        } else {
            groups.push(group);
            lastGroup = group;
        }
    }

    // TODO(kevinb): combine \\not with mrels and mords

    return groups;
};

/**
 * Equivalent to buildExpression, but wraps the elements in an <mrow>
 * if there's more than one.  Returns a single node instead of an array.
 */
export const buildExpressionRow = function(expression, options) {
    return makeRow(buildExpression(expression, options));
};

/**
 * Takes a group from the parser and calls the appropriate groupBuilders function
 * on it to produce a MathML node.
 */
export const buildGroup = function(group, options) {
    if (!group) {
        return new mathMLTree.MathNode("mrow");
    }

    if (groupBuilders[group.type]) {
        // Call the groupBuilders function
        const result = groupBuilders[group.type](group, options);
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
export default function buildMathML(tree, texExpression, options) {
    const expression = buildExpression(tree, options);

    // Wrap up the expression in an mrow so it is presented in the semantics
    // tag correctly, unless it's a single <mrow> or <mtable>.
    let wrapper;
    if (expression.length === 1 &&
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
    return buildCommon.makeSpan(["katex-mathml"], [math]);
}
