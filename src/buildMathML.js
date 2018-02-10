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
import stretchy from "./stretchy";

/**
 * Takes a symbol and converts it into a MathML text node after performing
 * optional replacement from symbols.js.
 */
export const makeText = function(text, mode) {
    if (symbols[mode][text] && symbols[mode][text].replace) {
        text = symbols[mode][text].replace;
    }

    return new mathMLTree.TextNode(text);
};

/**
 * Returns the math variant as a string or null if none is required.
 */
const getVariant = function(group, options) {
    const font = options.fontFamily;
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

const defaultVariant = {
    "mi": "italic",
    "mn": "normal",
    "mtext": "normal",
};

groupTypes.mathord = function(group, options) {
    const node = new mathMLTree.MathNode(
        "mi",
        [makeText(group.value, group.mode)]);

    const variant = getVariant(group, options) || "italic";
    if (variant !== defaultVariant[node.type]) {
        node.setAttribute("mathvariant", variant);
    }
    return node;
};

groupTypes.textord = function(group, options) {
    const text = makeText(group.value, group.mode);

    const variant = getVariant(group, options) || "normal";

    let node;
    if (group.mode === 'text') {
        node = new mathMLTree.MathNode("mtext", [text]);
    } else if (/[0-9]/.test(group.value)) {
        // TODO(kevinb) merge adjacent <mn> nodes
        // do it as a post processing step
        node = new mathMLTree.MathNode("mn", [text]);
    } else if (group.value === "\\prime") {
        node = new mathMLTree.MathNode("mo", [text]);
    } else {
        node = new mathMLTree.MathNode("mi", [text]);
    }
    if (variant !== defaultVariant[node.type]) {
        node.setAttribute("mathvariant", variant);
    }

    return node;
};

groupTypes.bin = function(group, options) {
    const node = new mathMLTree.MathNode(
        "mo", [makeText(group.value, group.mode)]);

    const variant = getVariant(group, options);
    if (variant === "bold-italic") {
        node.setAttribute("mathvariant", variant);
    }

    return node;
};

groupTypes.rel = function(group) {
    const node = new mathMLTree.MathNode(
        "mo", [makeText(group.value, group.mode)]);

    return node;
};

groupTypes.open = function(group) {
    const node = new mathMLTree.MathNode(
        "mo", [makeText(group.value, group.mode)]);

    return node;
};

groupTypes.close = function(group) {
    const node = new mathMLTree.MathNode(
        "mo", [makeText(group.value, group.mode)]);

    return node;
};

groupTypes.inner = function(group) {
    const node = new mathMLTree.MathNode(
        "mo", [makeText(group.value, group.mode)]);

    return node;
};

groupTypes.punct = function(group) {
    const node = new mathMLTree.MathNode(
        "mo", [makeText(group.value, group.mode)]);

    node.setAttribute("separator", "true");

    return node;
};

groupTypes.ordgroup = function(group, options) {
    const inner = buildExpression(group.value, options);

    const node = new mathMLTree.MathNode("mrow", inner);

    return node;
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
        buildGroup(group.value.base, options, removeUnnecessaryRow)];

    if (group.value.sub) {
        children.push(
            buildGroup(group.value.sub, options, removeUnnecessaryRow));
    }

    if (group.value.sup) {
        children.push(
            buildGroup(group.value.sup, options, removeUnnecessaryRow));
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

groupTypes.spacing = function(group) {
    let node;

    if (group.value === "\\ " || group.value === "\\space" ||
        group.value === " " || group.value === "~") {
        node = new mathMLTree.MathNode(
            "mtext", [new mathMLTree.TextNode("\u00a0")]);
    } else {
        node = new mathMLTree.MathNode("mspace");

        node.setAttribute(
            "width", buildCommon.spacingFunctions[group.value].size);
    }

    return node;
};

groupTypes.horizBrace = function(group, options) {
    const accentNode = stretchy.mathMLnode(group.value.label);
    return new mathMLTree.MathNode(
        (group.value.isOver ? "mover" : "munder"),
        [buildGroup(group.value.base, options), accentNode]
    );
};

groupTypes.xArrow = function(group, options) {
    const arrowNode = stretchy.mathMLnode(group.value.label);
    let node;
    let lowerNode;

    if (group.value.body) {
        const upperNode = buildGroup(group.value.body, options);
        if (group.value.below) {
            lowerNode = buildGroup(group.value.below, options);
            node = new mathMLTree.MathNode(
                "munderover", [arrowNode, lowerNode, upperNode]
            );
        } else {
            node = new mathMLTree.MathNode("mover", [arrowNode, upperNode]);
        }
    } else if (group.value.below) {
        lowerNode = buildGroup(group.value.below, options);
        node = new mathMLTree.MathNode("munder", [arrowNode, lowerNode]);
    } else {
        node = new mathMLTree.MathNode("mover", [arrowNode]);
    }
    return node;
};

groupTypes.mclass = function(group, options) {
    const inner = buildExpression(group.value.value, options);
    return new mathMLTree.MathNode("mstyle", inner);
};

groupTypes.raisebox = function(group, options) {
    const node = new mathMLTree.MathNode(
        "mpadded", [buildGroup(group.value.body, options)]);
    const dy = group.value.dy.value.number + group.value.dy.value.unit;
    node.setAttribute("voffset", dy);
    return node;
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
 * Takes a group from the parser and calls the appropriate groupTypes function
 * on it to produce a MathML node.
 */
export const buildGroup = function(
    group, options, removeUnnecessaryRow = false,
) {
    if (!group) {
        return new mathMLTree.MathNode("mrow");
    }

    if (groupTypes[group.type]) {
        // Call the groupTypes function
        const result = groupTypes[group.type](group, options);
        if (removeUnnecessaryRow) {
            if (result.type === "mrow" && result.children.length === 1) {
                return result.children[0];
            }
        }
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
    // tag correctly.
    const wrapper = new mathMLTree.MathNode("mrow", expression);

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
