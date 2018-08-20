// @flow
/**
 * These objects store the data about the DOM nodes we create, as well as some
 * extra data. They can then be transformed into real DOM nodes with the
 * `toNode` function or HTML markup using `toMarkup`. They are useful for both
 * storing extra properties on the nodes, as well as providing a way to easily
 * work with the DOM.
 *
 * Similar functions for working with MathML nodes exist in mathMLTree.js.
 *
 * TODO: refactor `span` and `anchor` into common superclass when
 * target environments support class inheritance
 */
import {scriptFromCodepoint} from "./unicodeScripts";
import utils from "./utils";
import svgGeometry from "./svgGeometry";
import type Options from "./Options";
import * as tree from "./tree";

import type {VirtualNode} from "./tree";


/**
 * Create an HTML className based on a list of classes. In addition to joining
 * with spaces, we also remove empty classes.
 */
const createClass = function(classes: string[]): string {
    return classes.filter(cls => cls).join(" ");
};

const initNode = function(
    classes?: string[],
    options?: Options,
    style?: CssStyle,
) {
    this.classes = classes || [];
    this.attributes = {};
    this.height = 0;
    this.depth = 0;
    this.maxFontSize = 0;
    this.style = style || {};
    if (options) {
        if (options.style.isTight()) {
            this.classes.push("mtight");
        }
        const color = options.getColor();
        if (color) {
            this.style.color = color;
        }
    }
};

/**
 * Convert into an HTML node
 */
const toNode = function(tagName: string): HTMLElement {
    const node = document.createElement(tagName);

    // Apply the class
    node.className = createClass(this.classes);

    // Apply inline styles
    Object.keys(this.style).map((style) => {
        // $FlowFixMe Flow doesn't seem to understand span.style's type.
        node.style[style] = this.style[style];
    });

    // Apply attributes
    Object.keys(this.attributes).map((attr) => {
        node.setAttribute(attr, this.attributes[attr]);
    });

    // Append the children, also as HTML nodes
    this.children.map((element) => {
        node.appendChild(element.toNode());
    });

    return node;
};

/**
 * Convert into an HTML markup string
 */
const toMarkup = function(tagName: string): string {
    let markup = `<${tagName}`;

    // Add the class
    if (this.classes.length) {
        markup += ` class="${utils.escape(createClass(this.classes))}"`;
    }

    let styles = "";

    // Add the styles, after hyphenation
    for (const style in this.style) {
        if (this.style.hasOwnProperty(style)) {
            styles += `${utils.hyphenate(style)}:${this.style[style]};`;
        }
    }

    if (styles) {
        markup += ` style="${utils.escape(styles)}"`;
    }

    // Add the attributes
    for (const attr in this.attributes) {
        if (this.attributes.hasOwnProperty(attr)) {
            markup += ` ${attr}="${utils.escape(this.attributes[attr])}"`;
        }
    }

    markup += ">";

    // Add the markup of the children, also as markup
    markup = this.children.reduce((concatenation, child) => {
        return concatenation + child.toMarkup();
    }, markup);

    markup += `</${tagName}>`;

    return markup;
};

export type CssStyle = {[name: string]: string};

export interface HtmlDomNode extends VirtualNode {
    classes: string[];
    height: number;
    depth: number;
    maxFontSize: number;
    style: CssStyle;

    hasClass(className: string): boolean;
    tryCombine(sibling: HtmlDomNode): boolean;
}

// Span wrapping other DOM nodes.
export type DomSpan = span<HtmlDomNode>;
// Span wrapping an SVG node.
export type SvgSpan = span<svgNode>;

export type SvgChildNode = pathNode | lineNode;
export type documentFragment = tree.documentFragment<HtmlDomNode>;


/**
 * This node represents a span node, with a className, a list of children, and
 * an inline style. It also contains information about its height, depth, and
 * maxFontSize.
 *
 * Represents two types with different uses: SvgSpan to wrap an SVG and DomSpan
 * otherwise. This typesafety is important when HTML builders access a span's
 * children.
 */
class span<ChildType: VirtualNode> implements HtmlDomNode {
    children: ChildType[];
    attributes: {[string]: string};
    classes: string[];
    height: number;
    depth: number;
    width: ?number;
    maxFontSize: number;
    style: CssStyle;

    constructor(
        classes?: string[],
        children?: ChildType[],
        options?: Options,
        style?: CssStyle,
    ) {
        initNode.call(this, classes, options, style);
        this.children = children || [];
    }

    /**
     * Sets an arbitrary attribute on the span. Warning: use this wisely. Not
     * all browsers support attributes the same, and having too many custom
     * attributes is probably bad.
     */
    setAttribute(attribute: string, value: string) {
        this.attributes[attribute] = value;
    }

    hasClass(className: string): boolean {
        return utils.contains(this.classes, className);
    }

    /**
     * Try to combine with given sibling.  Returns true if the sibling has
     * been successfully merged into this node, and false otherwise.
     * Default behavior fails (returns false).
     */
    tryCombine(sibling: HtmlDomNode): boolean {
        return false;
    }

    toNode(): HTMLElement {
        return toNode.call(this, "span");
    }

    toMarkup(): string {
        return toMarkup.call(this, "span");
    }
}

/**
 * This node represents an anchor (<a>) element with a hyperlink.  See `span`
 * for further details.
 */
class anchor implements HtmlDomNode {
    children: HtmlDomNode[];
    attributes: {[string]: string};
    classes: string[];
    height: number;
    depth: number;
    maxFontSize: number;
    style: CssStyle;

    constructor(
        href: string,
        classes: string[],
        children: HtmlDomNode[],
        options: Options,
    ) {
        initNode.call(this, classes, options);
        this.children = children || [];
        this.setAttribute('href', href);
    }

    setAttribute(attribute: string, value: string) {
        this.attributes[attribute] = value;
    }

    hasClass(className: string): boolean {
        return utils.contains(this.classes, className);
    }

    tryCombine(sibling: HtmlDomNode): boolean {
        return false;
    }

    toNode(): HTMLElement {
        return toNode.call(this, "a");
    }

    toMarkup(): string {
        return toMarkup.call(this, "a");
    }
}

const iCombinations = {
    'î': '\u0131\u0302',
    'ï': '\u0131\u0308',
    'í': '\u0131\u0301',
    // 'ī': '\u0131\u0304', // enable when we add Extended Latin
    'ì': '\u0131\u0300',
};

/**
 * A symbol node contains information about a single symbol. It either renders
 * to a single text node, or a span with a single text node in it, depending on
 * whether it has CSS classes, styles, or needs italic correction.
 */
class symbolNode implements HtmlDomNode {
    text: string;
    height: number;
    depth: number;
    italic: number;
    skew: number;
    width: number;
    maxFontSize: number;
    classes: string[];
    style: CssStyle;

    constructor(
        text: string,
        height?: number,
        depth?: number,
        italic?: number,
        skew?: number,
        width?: number,
        classes?: string[],
        style?: CssStyle,
    ) {
        this.text = text;
        this.height = height || 0;
        this.depth = depth || 0;
        this.italic = italic || 0;
        this.skew = skew || 0;
        this.width = width || 0;
        this.classes = classes || [];
        this.style = style || {};
        this.maxFontSize = 0;

        // Mark text from non-Latin scripts with specific classes so that we
        // can specify which fonts to use.  This allows us to render these
        // characters with a serif font in situations where the browser would
        // either default to a sans serif or render a placeholder character.
        // We use CSS class names like cjk_fallback, hangul_fallback and
        // brahmic_fallback. See ./unicodeScripts.js for the set of possible
        // script names
        const script = scriptFromCodepoint(this.text.charCodeAt(0));
        if (script) {
            this.classes.push(script + "_fallback");
        }

        if (/[îïíì]/.test(this.text)) {    // add ī when we add Extended Latin
            this.text = iCombinations[this.text];
        }
    }

    hasClass(className: string): boolean {
        return utils.contains(this.classes, className);
    }

    tryCombine(sibling: HtmlDomNode): boolean {
        if (!sibling
            || !(sibling instanceof symbolNode)
            || this.italic > 0
            || createClass(this.classes) !== createClass(sibling.classes)
            || this.skew !== sibling.skew
            || this.maxFontSize !== sibling.maxFontSize) {
            return false;
        }
        for (const style in this.style) {
            if (this.style.hasOwnProperty(style)
                && this.style[style] !== sibling.style[style]) {
                return false;
            }
        }
        for (const style in sibling.style) {
            if (sibling.style.hasOwnProperty(style)
                && this.style[style] !== sibling.style[style]) {
                return false;
            }
        }
        this.text += sibling.text;
        this.height = Math.max(this.height, sibling.height);
        this.depth = Math.max(this.depth, sibling.depth);
        this.italic = sibling.italic;
        return true;
    }

    /**
     * Creates a text node or span from a symbol node. Note that a span is only
     * created if it is needed.
     */
    toNode(): Node {
        const node = document.createTextNode(this.text);
        let span = null;

        if (this.italic > 0) {
            span = document.createElement("span");
            span.style.marginRight = this.italic + "em";
        }

        if (this.classes.length > 0) {
            span = span || document.createElement("span");
            span.className = createClass(this.classes);
        }

        for (const style in this.style) {
            if (this.style.hasOwnProperty(style)) {
                span = span || document.createElement("span");
                // $FlowFixMe Flow doesn't seem to understand span.style's type.
                span.style[style] = this.style[style];
            }
        }

        if (span) {
            span.appendChild(node);
            return span;
        } else {
            return node;
        }
    }

    /**
     * Creates markup for a symbol node.
     */
    toMarkup(): string {
        // TODO(alpert): More duplication than I'd like from
        // span.prototype.toMarkup and symbolNode.prototype.toNode...
        let needsSpan = false;

        let markup = "<span";

        if (this.classes.length) {
            needsSpan = true;
            markup += " class=\"";
            markup += utils.escape(createClass(this.classes));
            markup += "\"";
        }

        let styles = "";

        if (this.italic > 0) {
            styles += "margin-right:" + this.italic + "em;";
        }
        for (const style in this.style) {
            if (this.style.hasOwnProperty(style)) {
                styles += utils.hyphenate(style) + ":" + this.style[style] + ";";
            }
        }

        if (styles) {
            needsSpan = true;
            markup += " style=\"" + utils.escape(styles) + "\"";
        }

        const escaped = utils.escape(this.text);
        if (needsSpan) {
            markup += ">";
            markup += escaped;
            markup += "</span>";
            return markup;
        } else {
            return escaped;
        }
    }
}

/**
 * SVG nodes are used to render stretchy wide elements.
 */
class svgNode implements VirtualNode {
    children: SvgChildNode[];
    attributes: {[string]: string};

    constructor(children?: SvgChildNode[], attributes?: {[string]: string}) {
        this.children = children || [];
        this.attributes = attributes || {};
    }

    toNode(): Node {
        const svgNS = "http://www.w3.org/2000/svg";
        const node = document.createElementNS(svgNS, "svg");

        // Apply attributes
        for (const attr in this.attributes) {
            if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                node.setAttribute(attr, this.attributes[attr]);
            }
        }

        this.children.forEach((element) => {
            node.appendChild(element.toNode());
        });
        return node;
    }

    toMarkup(): string {
        let markup = "<svg";

        // Apply attributes
        for (const attr in this.attributes) {
            if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                markup += ` ${attr}='${this.attributes[attr]}'`;
            }
        }

        markup += ">";

        markup = this.children.reduce((concatenation, element) => {
            return concatenation + element.toMarkup();
        }, markup);

        markup += "</svg>";

        return markup;

    }
}

class pathNode implements VirtualNode {
    pathName: string;
    alternate: ?string;

    constructor(pathName: string, alternate?: string) {
        this.pathName = pathName;
        this.alternate = alternate;  // Used only for tall \sqrt
    }

    toNode(): Node {
        const svgNS = "http://www.w3.org/2000/svg";
        const node = document.createElementNS(svgNS, "path");

        if (this.alternate) {
            node.setAttribute("d", this.alternate);
        } else {
            node.setAttribute("d", svgGeometry.path[this.pathName]);
        }

        return node;
    }

    toMarkup(): string {
        if (this.alternate) {
            return `<path d='${this.alternate}'/>`;
        } else {
            return `<path d='${svgGeometry.path[this.pathName]}'/>`;
        }
    }
}

class lineNode implements VirtualNode {
    attributes: {[string]: string};

    constructor(attributes?: {[string]: string}) {
        this.attributes = attributes || {};
    }

    toNode(): Node {
        const svgNS = "http://www.w3.org/2000/svg";
        const node = document.createElementNS(svgNS, "line");

        // Apply attributes
        for (const attr in this.attributes) {
            if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                node.setAttribute(attr, this.attributes[attr]);
            }
        }

        return node;
    }

    toMarkup(): string {
        let markup = "<line";

        for (const attr in this.attributes) {
            if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                markup += ` ${attr}='${this.attributes[attr]}'`;
            }
        }

        markup += "/>";

        return markup;
    }
}

export function assertSymbolDomNode(
    group: HtmlDomNode,
): symbolNode {
    if (group instanceof symbolNode) {
        return group;
    } else {
        throw new Error(`Expected symbolNode but got ${String(group)}.`);
    }
}

export function assertSpan(
    group: HtmlDomNode,
): span<HtmlDomNode> {
    if (group instanceof span) {
        return group;
    } else {
        throw new Error(`Expected span<HtmlDomNode> but got ${String(group)}.`);
    }
}

export default {
    span,
    anchor,
    symbolNode,
    svgNode,
    pathNode,
    lineNode,
};
