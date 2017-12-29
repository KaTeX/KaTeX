// @flow
/**
 * These objects store data about MathML nodes. This is the MathML equivalent
 * of the types in domTree.js. Since MathML handles its own rendering, and
 * since we're mainly using MathML to improve accessibility, we don't manage
 * any of the styling state that the plain DOM nodes do.
 *
 * The `toNode` and `toMarkup` functions work simlarly to how they do in
 * domTree.js, creating namespaced DOM nodes and HTML text markup respectively.
 */

import utils from "./utils";

/**
 * MathML node types used in KaTeX. For a complete list of MathML nodes, see
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element.
 */
export type MathNodeType =
    "math" | "annotation" | "semantics" |
    "mtext" | "mn" | "mo" | "mi" | "mspace" |
    "mover" | "munder" | "munderover" | "msup" | "msub" |
    "mfrac" | "mroot" | "msqrt" |
    "mtable" | "mtr" | "mtd" |
    "mrow" | "menclose" |
    "mstyle" | "mpadded" | "mphantom";

/**
 * This node represents a general purpose MathML node of any type. The
 * constructor requires the type of node to create (for example, `"mo"` or
 * `"mspace"`, corresponding to `<mo>` and `<mspace>` tags).
 */
class MathNode {
    type: MathNodeType;
    attributes: {[string]: string};
    children: (MathNode | TextNode)[];

    constructor(type: MathNodeType, children?: (MathNode | TextNode)[]) {
        this.type = type;
        this.attributes = {};
        this.children = children || [];
    }

    /**
     * Sets an attribute on a MathML node. MathML depends on attributes to convey a
     * semantic content, so this is used heavily.
     */
    setAttribute(name: string, value: string) {
        this.attributes[name] = value;
    }

    /**
     * Converts the math node into a MathML-namespaced DOM element.
     */
    toNode(): Node {
        const node = document.createElementNS(
            "http://www.w3.org/1998/Math/MathML", this.type);

        for (const attr in this.attributes) {
            if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                node.setAttribute(attr, this.attributes[attr]);
            }
        }

        for (const child of this.children) {
            node.appendChild(child.toNode());
        }

        return node;
    }

    /**
     * Converts the math node into an HTML markup string.
     */
    toMarkup(): string {
        let markup = "<" + this.type;

        // Add the attributes
        for (const attr in this.attributes) {
            if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                markup += " " + attr + "=\"";
                markup += utils.escape(this.attributes[attr]);
                markup += "\"";
            }
        }

        markup += ">";

        for (let i = 0; i < this.children.length; i++) {
            markup += this.children[i].toMarkup();
        }

        markup += "</" + this.type + ">";

        return markup;
    }

    /**
     * Converts the math node into a string, similar to innerText.
     */
    toText(): string {
        if (this.type === "mspace") {
            if (this.attributes.width === "0.16667em") {
                return "\u2006";
            } else {
                // TODO: Use other space characters for different widths.
                // https://github.com/Khan/KaTeX/issues/1036
                return " ";
            }
        }
        return this.children.map(child => child.toText()).join("");
    }
}

/**
 * This node represents a piece of text.
 */
class TextNode {
    text: string;

    constructor(text: string) {
        this.text = text;
    }

    /**
     * Converts the text node into a DOM text node.
     */
    toNode(): Node {
        return document.createTextNode(this.text);
    }

    /**
     * Converts the text node into HTML markup (which is just the text itself).
     */
    toMarkup(): string {
        return utils.escape(this.text);
    }

    /**
     * Converts the text node into a string (which is just the text iteself).
     */
    toText(): string {
        return this.text;
    }
}

export default {
    MathNode,
    TextNode,
};
