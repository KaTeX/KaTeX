/**
 * These objects store the data about the DOM nodes we create, as well as some
 * extra data. They can then be transformed into real DOM nodes with the
 * `toNode` function or HTML markup using `toMarkup`. They are useful for both
 * storing extra properties on the nodes, as well as providing a way to easily
 * work with the DOM.
 *
 * Similar functions for working with MathML nodes exist in mathMLTree.js.
 */
import {cjkRegex, hangulRegex} from "./unicodeRegexes";
import utils from "./utils";
import svgGeometry from "./svgGeometry";

/**
 * Create an HTML className based on a list of classes. In addition to joining
 * with spaces, we also remove null or empty classes.
 */
const createClass = function(classes) {
    classes = classes.slice();
    for (let i = classes.length - 1; i >= 0; i--) {
        if (!classes[i]) {
            classes.splice(i, 1);
        }
    }

    return classes.join(" ");
};

/**
 * This node represents a span node, with a className, a list of children, and
 * an inline style. It also contains information about its height, depth, and
 * maxFontSize.
 */
class span {
    constructor(classes, children, options) {
        this.classes = classes || [];
        this.children = children || [];
        this.height = 0;
        this.depth = 0;
        this.maxFontSize = 0;
        this.style = {};
        this.attributes = {};
        if (options) {
            if (options.style.isTight()) {
                this.classes.push("mtight");
            }
            if (options.getColor()) {
                this.style.color = options.getColor();
            }
        }
    }

    /**
     * Sets an arbitrary attribute on the span. Warning: use this wisely. Not all
     * browsers support attributes the same, and having too many custom attributes
     * is probably bad.
     */
    setAttribute(attribute, value) {
        this.attributes[attribute] = value;
    }

    tryCombine(sibling) {
        return false;
    }

    /**
     * Convert the span into an HTML node
     */
    toNode() {
        const span = document.createElement("span");

        // Apply the class
        span.className = createClass(this.classes);

        // Apply inline styles
        for (const style in this.style) {
            if (Object.prototype.hasOwnProperty.call(this.style, style)) {
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
    toMarkup() {
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
 * This node represents a document fragment, which contains elements, but when
 * placed into the DOM doesn't have any representation itself. Thus, it only
 * contains children and doesn't have any HTML properties. It also keeps track
 * of a height, depth, and maxFontSize.
 */
class documentFragment {
    constructor(children) {
        this.children = children || [];
        this.height = 0;
        this.depth = 0;
        this.maxFontSize = 0;
    }

    /**
     * Convert the fragment into a node
     */
    toNode() {
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
    toMarkup() {
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
class symbolNode {
    constructor(value, height, depth, italic, skew, classes, style) {
        this.value = value || "";
        this.height = height || 0;
        this.depth = depth || 0;
        this.italic = italic || 0;
        this.skew = skew || 0;
        this.classes = classes || [];
        this.style = style || {};
        this.maxFontSize = 0;

        // Mark CJK characters with specific classes so that we can specify which
        // fonts to use.  This allows us to render these characters with a serif
        // font in situations where the browser would either default to a sans serif
        // or render a placeholder character.
        if (cjkRegex.test(value)) {
            // I couldn't find any fonts that contained Hangul as well as all of
            // the other characters we wanted to test there for it gets its own
            // CSS class.
            if (hangulRegex.test(value)) {
                this.classes.push('hangul_fallback');
            } else {
                this.classes.push('cjk_fallback');
            }
        }

        if (/[îïíì]/.test(this.value)) {    // add ī when we add Extended Latin
            this.value = iCombinations[this.value];
        }
    }

    tryCombine(sibling) {
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
    toNode() {
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
    toMarkup() {
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
class svgNode {
    constructor(children, attributes) {
        this.children = children || [];
        this.attributes = attributes || [];
    }

    toNode() {
        const svgNS = "http://www.w3.org/2000/svg";
        const node = document.createElementNS(svgNS, "svg");

        // Apply attributes
        for (let i = 0; i < this.attributes.length; i++) {
            const [name, value] = this.attributes[i];
            node.setAttribute(name, value);
        }

        for (let i = 0; i < this.children.length; i++) {
            node.appendChild(this.children[i].toNode());
        }
        return node;
    }

    toMarkup() {
        let markup = "<svg";

        // Apply attributes
        for (let i = 0; i < this.attributes.length; i++) {
            const [name, value] = this.attributes[i];
            markup +=  ` ${name}='${value}'`;
        }

        markup += ">";

        for (let i = 0; i < this.children.length; i++) {
            markup += this.children[i].toMarkup();
        }

        markup += "</svg>";

        return markup;

    }
}

class pathNode {
    constructor(pathName, alternate) {
        this.pathName = pathName;
        this.alternate = alternate;  // Used only for tall \sqrt
    }

    toNode() {
        const svgNS = "http://www.w3.org/2000/svg";
        const node = document.createElementNS(svgNS, "path");

        if (this.pathName !== "sqrtTall") {
            node.setAttribute("d", svgGeometry.path[this.pathName]);
        } else {
            node.setAttribute("d", this.alternate);
        }

        return node;
    }

    toMarkup() {
        if (this.pathName !== "sqrtTall") {
            return `<path d='${svgGeometry.path[this.pathName]}'/>`;
        } else {
            return `<path d='${this.alternate}'/>`;
        }
    }
}

class lineNode {
    constructor(attributes) {
        this.attributes = attributes || [];
    }

    toNode() {
        const svgNS = "http://www.w3.org/2000/svg";
        const node = document.createElementNS(svgNS, "line");

        // Apply attributes
        for (let i = 0; i < this.attributes.length; i++) {
            const [name, value] = this.attributes[i];
            node.setAttribute(name, value);
        }

        return node;
    }

    toMarkup() {
        let markup = "<line";

        for (let i = 0; i < this.attributes.length; i++) {
            const [name, value] = this.attributes[i];
            markup +=  ` ${name}='${value}'`;
        }

        markup += "/>";

        return markup;
    }
}

module.exports = {
    span: span,
    documentFragment: documentFragment,
    symbolNode: symbolNode,
    svgNode: svgNode,
    pathNode: pathNode,
    lineNode: lineNode,
};
