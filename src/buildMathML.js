/**
 * WARNING: New methods on groupTypes should be added to src/functions.
 *
 * This file converts a parse tree into a cooresponding MathML tree. The main
 * entry point is the `buildMathML` function, which takes a parse tree from the
 * parser.
 */

import buildCommon from "./buildCommon";
import fontMetrics from "./fontMetrics";
import mathMLTree from "./mathMLTree";
import ParseError from "./ParseError";
import Style from "./Style";
import symbols from "./symbols";
import utils from "./utils";

/**
 * Takes a symbol and converts it into a MathML text node after performing
 * optional replacement from symbols.js.
 */
export const makeText = function(text, mode) {
    if (symbols[mode][text] && symbols[mode][text].replace) {
        if (text.charCodeAt(0) !== 0xD835) {
            text = symbols[mode][text].replace;
        }
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

export const makeTextRow = function(body, options) {
    // Convert each element of the body into MathML, and combine consecutive
    // <mtext> outputs into a single <mtext> tag.  In this way, we don't
    // nest non-text items (e.g., $nested-math$) within an <mtext>.
    const inner = [];
    let currentText = null;
    for (let i = 0; i < body.length; i++) {
        const group = buildGroup(body[i], options);
        if (group.type === 'mtext' && currentText !== null) {
            Array.prototype.push.apply(currentText.children, group.children);
        } else {
            inner.push(group);
            if (group.type === 'mtext') {
                currentText = group;
            } else {
                currentText = null;
            }
        }
    }

    return makeRow(inner);
};

/**
 * Returns the math variant as a string or null if none is required.
 */
export const getVariant = function(group, options) {
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
    if (fontMetrics.getCharacterMetrics(value, fontName, mode)) {
        return buildCommon.fontMap[font].variant;
    }

    return null;
};

/**
 * Functions for handling the different types of groups found in the parse
 * tree. Each function should take a parse group and return a MathML node.
 */
export const groupTypes = {};

groupTypes.ordgroup = function(group, options) {
    return buildExpressionRow(group.value, options);
};

groupTypes.supsub = function(group, options) {
    // Is the inner group a relevant horizonal brace?
    let isBrace = false;
    let isOver;
    let isSup;
    if (group.value.base) {
        if (group.value.base.value.type === "horizBrace") {
            isSup = (group.value.sup ? true : false);
            if (isSup === group.value.base.value.isOver) {
                isBrace = true;
                isOver = group.value.base.value.isOver;
            }
        }
    }

    const removeUnnecessaryRow = true;
    const children = [
        buildGroup(group.value.base, options)];

    if (group.value.sub) {
        children.push(buildGroup(group.value.sub, options));
    }

    if (group.value.sup) {
        children.push(buildGroup(group.value.sup, options));
    }

    let nodeType;
    if (isBrace) {
        nodeType = (isOver ? "mover" : "munder");
    } else if (!group.value.sub) {
        const base = group.value.base;
        if (base && base.value.limits && options.style === Style.DISPLAY) {
            nodeType = "mover";
        } else {
            nodeType = "msup";
        }
    } else if (!group.value.sup) {
        const base = group.value.base;
        if (base && base.value.limits && options.style === Style.DISPLAY) {
            nodeType = "munder";
        } else {
            nodeType = "msub";
        }
    } else {
        const base = group.value.base;
        if (base && base.value.limits && options.style === Style.DISPLAY) {
            nodeType = "munderover";
        } else {
            nodeType = "msubsup";
        }
    }

    const node = new mathMLTree.MathNode(nodeType, children);

    return node;
};

groupTypes.tag = function(group, options) {
    const table = new mathMLTree.MathNode("mtable", [
        new mathMLTree.MathNode("mlabeledtr", [
            new mathMLTree.MathNode("mtd", [
                buildExpressionRow(group.value.tag, options),
            ]),
            new mathMLTree.MathNode("mtd", [
                buildExpressionRow(group.value.body, options),
            ]),
        ]),
    ]);
    table.setAttribute("side", "right");
    return table;
};

/**
 * Takes a list of nodes, builds them, and returns a list of the generated
 * MathML nodes. A little simpler than the HTML version because we don't do any
 * previous-node handling.
 */
export const buildExpression = function(expression, options) {
    const groups = [];
    for (let i = 0; i < expression.length; i++) {
        const group = expression[i];
        groups.push(buildGroup(group, options));
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
 * Takes a group from the parser and calls the appropriate groupTypes function
 * on it to produce a MathML node.
 */
export const buildGroup = function(group, options) {
    if (!group) {
        return new mathMLTree.MathNode("mrow");
    }

    if (groupTypes[group.type]) {
        // Call the groupTypes function
        const result = groupTypes[group.type](group, options);
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
