/**
 * This file converts a parse tree into a cooresponding MathML tree. The main
 * entry point is the `buildMathML` function, which takes a parse tree from the
 * parser.
 */

var buildCommon = require("./buildCommon");
var mathMLTree = require("./mathMLTree");
var ParseError = require("./ParseError");
var symbols = require("./symbols");

var makeSpan = buildCommon.makeSpan;

/**
 * Takes a symbol and converts it into a MathML text node after performing
 * optional replacement from symbols.js.
 */
var makeText = function(text, mode) {
    if (symbols[mode][text] && symbols[mode][text].replace) {
        text = symbols[mode][text].replace;
    }

    return new mathMLTree.TextNode(text);
};

/**
 * Functions for handling the different types of groups found in the parse
 * tree. Each function should take a parse group and return a MathML node.
 */
var groupTypes = {
    mathord: function(group) {
        var node = new mathMLTree.MathNode("mi");

        node.addChild(makeText(group.value, group.mode));

        return node;
    },

    textord: function(group) {
        var node;
        if (/[0-9]/.test(group.value)) {
            node = new mathMLTree.MathNode("mn");
        } else {
            node = new mathMLTree.MathNode("mi");
            node.setAttribute("mathvariant", "normal");
        }

        node.addChild(makeText(group.value, group.mode));

        return node;
    },

    bin: function(group) {
        var node = new mathMLTree.MathNode("mo");

        node.addChild(makeText(group.value, group.mode));

        return node;
    },

    rel: function(group) {
        var node = new mathMLTree.MathNode("mo");

        node.addChild(makeText(group.value, group.mode));

        return node;
    },

    open: function(group) {
        var node = new mathMLTree.MathNode("mo");

        node.addChild(makeText(group.value, group.mode));

        return node;
    },

    close: function(group) {
        var node = new mathMLTree.MathNode("mo");

        node.addChild(makeText(group.value, group.mode));

        return node;
    },

    inner: function(group) {
        var node = new mathMLTree.MathNode("mo");

        node.addChild(makeText(group.value, group.mode));

        return node;
    },

    punct: function(group) {
        var node = new mathMLTree.MathNode("mo");

        node.setAttribute("separator", "true");

        node.addChild(makeText(group.value, group.mode));

        return node;
    },

    ordgroup: function(group) {
        var node = new mathMLTree.MathNode("mrow");

        var inner = buildExpression(group.value);

        for (var i = 0; i < inner.length; i++) {
            node.addChild(inner[i]);
        }

        return node;
    },

    text: function(group) {
        var node = new mathMLTree.MathNode("mtext");

        return node;
    },

    color: function(group) {
        var node = new mathMLTree.MathNode("mstyle");

        node.setAttribute("mathcolor", group.value.color);

        var inner = buildExpression(group.value.value);
        for (var i = 0; i < inner.length; i++) {
            node.addChild(inner[i]);
        }

        return node;
    },

    supsub: function(group) {
        var node;

        if (!group.value.sub) {
            node = new mathMLTree.MathNode("msup");
        } else if (!group.value.sup) {
            node = new mathMLTree.MathNode("msub");
        } else {
            node = new mathMLTree.MathNode("msubsup");
        }

        node.addChild(buildGroup(group.value.base));

        if (group.value.sub) {
            node.addChild(buildGroup(group.value.sub));
        }

        if (group.value.sup) {
            node.addChild(buildGroup(group.value.sup));
        }

        return node;
    },

    genfrac: function(group) {
        var node = new mathMLTree.MathNode("mfrac");

        node.addChild(buildGroup(group.value.numer));
        node.addChild(buildGroup(group.value.denom));

        if (!group.value.hasBarLine) {
            node.setAttribute("linethickness", "0px");
        }

        if (group.value.leftDelim != null || group.value.rightDelim != null) {
            var outerNode = new mathMLTree.MathNode("mrow");

            if (group.value.leftDelim != null) {
                var leftOp = new mathMLTree.MathNode("mo");

                leftOp.setAttribute("fence", "true");
                leftOp.addChild(new mathMLTree.TextNode(group.value.leftDelim));

                outerNode.addChild(leftOp);
            }

            outerNode.addChild(node);

            if (group.value.rightDelim != null) {
                var rightOp = new mathMLTree.MathNode("mo");

                rightOp.setAttribute("fence", "true");
                rightOp.addChild(new mathMLTree.TextNode(group.value.rightDelim));

                outerNode.addChild(rightOp);
            }

            return outerNode;
        }

        return node;
    },

    sqrt: function(group) {
        var node = new mathMLTree.MathNode("msqrt");

        node.addChild(buildGroup(group.value.body));

        return node;
    },

    leftright: function(group) {
        var outerNode = new mathMLTree.MathNode("mrow");

        if (group.value.left !== ".") {
            var leftNode = new mathMLTree.MathNode("mo");
            leftNode.setAttribute("fence", "true");

            leftNode.addChild(makeText(group.value.left, group.mode));

            outerNode.addChild(leftNode);
        }

        var inner = buildExpression(group.value.body);
        for (var i = 0; i < inner.length; i++) {
            outerNode.addChild(inner[i]);
        }

        if (group.value.right !== ".") {
            var rightNode = new mathMLTree.MathNode("mo");
            rightNode.setAttribute("fence", "true");

            rightNode.addChild(makeText(group.value.right, group.mode));

            outerNode.addChild(rightNode);
        }

        return outerNode;
    },

    accent: function(group) {
        var node = new mathMLTree.MathNode("mover");
        node.setAttribute("accent", "true");

        node.addChild(buildGroup(group.value.base));

        var accentNode = new mathMLTree.MathNode("mo");
        accentNode.addChild(makeText(group.value.accent, group.mode));

        node.addChild(accentNode);

        return node;
    },

    spacing: function(group) {
        var node;

        if (group.value === "\\ " || group.value === "\\space" ||
            group.value === " " || group.value === "~") {
            node = new mathMLTree.MathNode("mtext");

            node.addChild(new mathMLTree.TextNode("\u00a0"));
        } else {
            node = new mathMLTree.MathNode("mspace");

            var spaceMap = {
                "\\qquad": "2em",
                "\\quad": "1em",
                "\\enspace": "0.5em",
                "\\;": "0.277778em",
                "\\:": "0.22222em",
                "\\,": "0.16667em",
                "\\!": "-0.16667em"
            };

            node.setAttribute("width", spaceMap[group.value]);
        }

        return node;
    },

    op: function(group) {
        var node = new mathMLTree.MathNode("mo");

        // TODO(emily): handle big operators using the `largeop` attribute

        if (group.value.symbol) {
            // This is a symbol. Just add the symbol.
            node.addChild(makeText(group.value.body, group.mode));
        } else {
            // This is a text operator. Add all of the characters from the
            // operator's name.
            node.addChild(new mathMLTree.TextNode(group.value.body.slice(1)));
        }

        return node;
    },

    katex: function(group) {
        var node = new mathMLTree.MathNode("mtext");

        node.addChild(new mathMLTree.TextNode("KaTeX"));

        return node;
    },

    delimsizing: function(group) {
        var node = new mathMLTree.MathNode("mo");

        if (group.value.value === ".") {
            return node;
        }

        node.addChild(makeText(group.value.value, group.mode));

        node.setAttribute("fence", "true");

        return node;
    },

    styling: function(group) {
        var node = new mathMLTree.MathNode("mstyle");

        var styleAttributes = {
            "display": ["0", "true"],
            "text": ["0", "false"],
            "script": ["1", "false"],
            "scriptscript": ["2", "false"]
        };

        var attr = styleAttributes[group.value.style];

        node.setAttribute("scriptlevel", attr[0]);
        node.setAttribute("displaystyle", attr[1]);

        var inner = buildExpression(group.value.value);
        for (var i = 0; i < inner.length; i++) {
            node.addChild(inner[i]);
        }

        return node;
    },

    sizing: function(group) {
        var node = new mathMLTree.MathNode("mstyle");

        // TODO(emily): This doesn't produce the correct size for nested size
        // changes, because we don't keep state of what style we're currently
        // in, so we can't reset the size to normal before changing it.
        node.setAttribute(
            "mathsize", buildCommon.sizingMultiplier[group.value.size] + "em");

        var inner = buildExpression(group.value.value);
        for (var i = 0; i < inner.length; i++) {
            node.addChild(inner[i]);
        }

        return node;
    },

    overline: function(group) {
        var node = new mathMLTree.MathNode("mover");

        node.setAttribute("accent", "true");

        node.addChild(buildGroup(group.value.body));

        var operator = new mathMLTree.MathNode("mo");

        operator.setAttribute("stretchy", "true");
        operator.addChild(new mathMLTree.TextNode("\u203e"));

        node.addChild(operator);

        return node;
    },

    rule: function(group) {
        // TODO(emily): Figure out if there's an actual way to draw black boxes
        // in MathML.
        var node = new mathMLTree.MathNode("mrow");

        return node;
    },

    llap: function(group) {
        var node = new mathMLTree.MathNode("mpadded");

        node.setAttribute("lspace", "-1width");
        node.setAttribute("width", "0px");

        node.addChild(buildGroup(group.value.body));

        return node;
    },

    rlap: function(group) {
        var node = new mathMLTree.MathNode("mpadded");

        node.setAttribute("width", "0px");

        node.addChild(buildGroup(group.value.body));

        return node;
    }
};

/**
 * Takes a list of nodes, builds them, and returns a list of the generated
 * MathML nodes. A little simpler than the HTML version because we don't do any
 * previous-node handling.
 */
var buildExpression = function(expression) {
    var groups = [];
    for (var i = 0; i < expression.length; i++) {
        var group = expression[i];
        groups.push(buildGroup(group));
    }
    return groups;
};

/**
 * Takes a group from the parser and calls the appropriate groupTypes function
 * on it to produce a MathML node.
 */
var buildGroup = function(group) {
    if (!group) {
        return new mathMLTree.MathNode("mrow");
    }

    if (groupTypes[group.type]) {
        // Call the groupTypes function
        return groupTypes[group.type](group);
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
var buildMathML = function(tree, texExpression, settings) {
    var expression = buildExpression(tree);

    // Wrap up the expression in an mrow so it is presented in the semantics
    // tag correctly.
    var wrapper = new mathMLTree.MathNode("mrow");

    for (var i = 0; i < expression.length; i++) {
        wrapper.addChild(expression[i]);
    }

    // Build a TeX annotation of the source
    var annotation = new mathMLTree.MathNode("annotation");

    annotation.setAttribute("encoding", "application/x-tex");
    annotation.addChild(new mathMLTree.TextNode(texExpression));

    var semantics = new mathMLTree.MathNode("semantics");

    semantics.addChild(wrapper);
    semantics.addChild(annotation);

    var math = new mathMLTree.MathNode("math");

    math.addChild(semantics);

    // You can't style <math> nodes, so we wrap the node in a span.
    return makeSpan(["katex-mathml"], [math]);
};

module.exports = buildMathML;
