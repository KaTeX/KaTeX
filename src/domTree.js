// @flow
/**
 * These objects store the data about the DOM nodes we create, as well as some
 * extra data. They can then be transformed into real DOM nodes with the
 * `toNode` function or HTML markup using `toMarkup`. They are useful for both
 * storing extra properties on the nodes, as well as providing a way to easily
 * work with the DOM.
 *
 * Similar functions for working with MathML nodes exist in mathMLTree.js.
 */
import { scriptFromCodepoint } from "./unicodeScripts";
import utils from "./utils";
import svgGeometry from "./svgGeometry";
import type Options from "./Options";

/**
 * Create an HTML className based on a list of classes. In addition to joining
 * with spaces, we also remove null or empty classes.
 */
const createClass = function(classes: string[]): string {
    classes = classes.slice();
    for (let i = classes.length - 1; i >= 0; i--) {
        if (!classes[i]) {
            classes.splice(i, 1);
        }
    }

    return classes.join(" ");
};

// To ensure that all nodes have compatible signatures for these methods.
interface VirtualDomNode {
    toNode(): Node;
    toMarkup(): string;
}

export interface CombinableDomNode extends VirtualDomNode {
    tryCombine(sibling: CombinableDomNode): boolean;
}

/**
 * All `DomChildNode`s MUST have `height`, `depth`, and `maxFontSize` numeric
 * fields.
 *
 * `DomChildNode` is not defined as an interface since `documentFragment` also
 * has these fields but should not be considered a `DomChildNode`.
 */
export type DomChildNode = span | anchor | svgNode | symbolNode;

export type SvgChildNode = pathNode | lineNode;

export type CssStyle = {[name: string]: string};

/**
 * This node represents a span node, with a className, a list of children, and
 * an inline style. It also contains information about its height, depth, and
 * maxFontSize.
 */
class span implements CombinableDomNode {
    classes: string[];
    children: DomChildNode[];
    height: number;
    depth: number;
    width: ?number;
    maxFontSize: number;
    style: CssStyle;
    attributes: {[string]: string};

    constructor(
        classes?: string[],
        children?: DomChildNode[],
        options?: Options,
        style?: CssStyle,
    ) {
        this.classes = classes || [];
        this.children = children || [];
        this.height = 0;
        this.depth = 0;
        this.maxFontSize = 0;
        this.style = Object.assign({}, style);
        this.attributes = {};
        if (options) {
            if (options.style.isTight()) {
                this.classes.push("mtight");
            }
            const color = options.getColor();
            if (color) {
                this.style.color = color;
            }
        }
    }

    /**
     * Sets an arbitrary attribute on the span. Warning: use this wisely. Not all
     * browsers support attributes the same, and having too many custom attributes
     * is probably bad.
     */
    setAttribute(attribute: string, value: string) {
        this.attributes[attribute] = value;
    }

    tryCombine(sibling: CombinableDomNode): boolean {
        return false;
    }

    /**
     * Convert the span into an HTML node
     */
    toNode(): HTMLSpanElement {
        const span = document.createElement("span");

        // Apply the class
        span.className = createClass(this.classes);

        // Apply inline styles
        for (const style in this.style) {
            if (Object.prototype.hasOwnProperty.call(this.style, style)) {
                // $FlowFixMe Flow doesn't seem to understand span.style's type.
                span.style[style] = this.style[style];
            }
        }

        // Apply attributes
        for (const attr in this.attributes) {
            if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                span.setAttribute(attr, this.attributes[attr]);
            }
        }

        // Append the children, also as HTML nodes
        for (let i = 0; i < this.children.length; i++) {
            span.appendChild(this.children[i].toNode());
        }

        return span;
    }

    /**
     * Convert the span into an HTML markup string
     */
    toMarkup(): string {
        let markup = "<span";

        // Add the class
        if (this.classes.length) {
            markup += " class=\"";
            markup += utils.escape(createClass(this.classes));
            markup += "\"";
        }

        let styles = "";

        // Add the styles, after hyphenation
        for (const style in this.style) {
            if (this.style.hasOwnProperty(style)) {
                styles += utils.hyphenate(style) + ":" + this.style[style] + ";";
            }
        }

        if (styles) {
            markup += " style=\"" + utils.escape(styles) + "\"";
        }

        // Add the attributes
        for (const attr in this.attributes) {
            if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                markup += " " + attr + "=\"";
                markup += utils.escape(this.attributes[attr]);
                markup += "\"";
            }
        }

        markup += ">";

        // Add the markup of the children, also as markup
        for (let i = 0; i < this.children.length; i++) {
            markup += this.children[i].toMarkup();
        }

        markup += "</span>";

        return markup;
    }
}

/**
 * This node represents an anchor (<a>) element with a hyperlink, a list of classes,
 * a list of children, and an inline style. It also contains information about its
 * height, depth, and maxFontSize.
 */
class anchor implements CombinableDomNode {
    href: string;
    classes: string[];
    children: DomChildNode[];
    height: number;
    depth: number;
    maxFontSize: number;
    style: CssStyle;
    attributes: {[string]: string};

    constructor(
        href: string,
        classes: string[],
        children: DomChildNode[],
        options: Options,
    ) {
        this.href = href;
        this.classes = classes;
        this.children = children;
        this.height = 0;
        this.depth = 0;
        this.maxFontSize = 0;
        this.style = {};
        this.attributes = {};
        if (options.style.isTight()) {
            this.classes.push("mtight");
        }
        const color = options.getColor();
        if (color) {
            this.style.color = color;
        }
    }

    /**
     * Sets an arbitrary attribute on the anchor. Warning: use this wisely. Not all
     * browsers support attributes the same, and having too many custom attributes
     * is probably bad.
     */
    setAttribute(attribute: string, value: string) {
        this.attributes[attribute] = value;
    }

    tryCombine(sibling: CombinableDomNode): boolean {
        return false;
    }

    /**
     * Convert the anchor into an HTML node
     */
    toNode(): HTMLAnchorElement {
        const a = document.createElement("a");

        // Apply the href
        a.setAttribute('href', this.href);

        // Apply the class
        if (this.classes.length) {
            a.className = createClass(this.classes);
        }

        // Apply inline styles
        for (const style in this.style) {
            if (Object.prototype.hasOwnProperty.call(this.style, style)) {
                // $FlowFixMe Flow doesn't seem to understand a.style's type.
                a.style[style] = this.style[style];
            }
        }

        // Apply attributes
        for (const attr in this.attributes) {
            if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                a.setAttribute(attr, this.attributes[attr]);
            }
        }

        // Append the children, also as HTML nodes
        for (let i = 0; i < this.children.length; i++) {
            a.appendChild(this.children[i].toNode());
        }

        return a;
    }

    /**
     * Convert the a into an HTML markup string
     */
    toMarkup(): string {
        let markup = "<a";

        // Add the href
        markup += `href="${markup += utils.escape(this.href)}"`;
        // Add the class
        if (this.classes.length) {
            markup += ` class="${utils.escape(createClass(this.classes))}"`;
        }

        let styles = "";

        // Add the styles, after hyphenation
        for (const style in this.style) {
            if (this.style.hasOwnProperty(style)) {
                styles += utils.hyphenate(style) + ":" + this.style[style] + ";";
            }
        }

        if (styles) {
            markup += " style=\"" + utils.escape(styles) + "\"";
        }

        // Add the attributes
        for (const attr in this.attributes) {
            if (attr !== "href" &&
                Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                markup += ` ${attr}="${utils.escape(this.attributes[attr])}"`;
            }
        }

        markup += ">";

        // Add the markup of the children, also as markup
        for (const child of this.children) {
            markup += child.toMarkup();
        }

        markup += "</a>";

        return markup;
    }
}

/**
 * This node represents a document fragment, which contains elements, but when
 * placed into the DOM doesn't have any representation itself. Thus, it only
 * contains children and doesn't have any HTML properties. It also keeps track
 * of a height, depth, and maxFontSize.
 */
class documentFragment implements VirtualDomNode {
    children: DomChildNode[];
    height: number;
    depth: number;
    maxFontSize: number;

    constructor(children?: DomChildNode[]) {
        this.children = children || [];
        this.height = 0;
        this.depth = 0;
        this.maxFontSize = 0;
    }

    /**
     * Convert the fragment into a node
     */
    toNode(): Node {
        // Create a fragment
        const frag = document.createDocumentFragment();

        // Append the children
        for (let i = 0; i < this.children.length; i++) {
            frag.appendChild(this.children[i].toNode());
        }

        return frag;
    }

    /**
     * Convert the fragment into HTML markup
     */
    toMarkup(): string {
        let markup = "";

        // Simply concatenate the markup for the children together
        for (let i = 0; i < this.children.length; i++) {
            markup += this.children[i].toMarkup();
        }

        return markup;
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
class symbolNode implements CombinableDomNode {
    value: string;
    height: number;
    depth: number;
    italic: number;
    skew: number;
    width: number;
    maxFontSize: number;
    classes: string[];
    style: CssStyle;

    constructor(
        value: string,
        height?: number,
        depth?: number,
        italic?: number,
        skew?: number,
        width?: number,
        classes?: string[],
        style?: CssStyle,
    ) {
        this.value = value;
        this.height = height || 0;
        this.depth = depth || 0;
        this.italic = italic || 0;
        this.skew = skew || 0;
        this.width = width || 0;
        this.classes = classes || [];
        this.style = Object.assign({}, style);
        this.maxFontSize = 0;

        // Mark text from non-Latin scripts with specific classes so that we
        // can specify which fonts to use.  This allows us to render these
        // characters with a serif font in situations where the browser would
        // either default to a sans serif or render a placeholder character.
        // We use CSS class names like cjk_fallback, hangul_fallback and
        // brahmic_fallback. See ./unicodeScripts.js for the set of possible
        // script names
        const script = scriptFromCodepoint(this.value.charCodeAt(0));
        if (script) {
            this.classes.push(script + "_fallback");
        }

        if (/[îïíì]/.test(this.value)) {    // add ī when we add Extended Latin
            this.value = iCombinations[this.value];
        }
    }

    tryCombine(sibling: CombinableDomNode): boolean {
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
        this.value += sibling.value;
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
        const node = document.createTextNode(this.value);
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

        const escaped = utils.escape(this.value);
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
class svgNode implements VirtualDomNode {
    children: SvgChildNode[];
    attributes: {[string]: string};
    // Required for all `DomChildNode`s. Are always 0 for svgNode.
    height: number;
    depth: number;
    maxFontSize: number;

    constructor(children?: SvgChildNode[], attributes?: {[string]: string}) {
        this.children = children || [];
        this.attributes = attributes || {};
        this.height = 0;
        this.depth = 0;
        this.maxFontSize = 0;
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

        for (let i = 0; i < this.children.length; i++) {
            node.appendChild(this.children[i].toNode());
        }
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

        for (let i = 0; i < this.children.length; i++) {
            markup += this.children[i].toMarkup();
        }

        markup += "</svg>";

        return markup;

    }
}

class pathNode implements VirtualDomNode {
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

class lineNode implements VirtualDomNode {
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

export default {
    span,
    anchor,
    documentFragment,
    symbolNode,
    svgNode,
    pathNode,
    lineNode,
};
