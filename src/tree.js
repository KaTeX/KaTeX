// @flow

import utils from "./utils";

import type {CssStyle, HtmlDomNode} from "./domTree";
import type {MathDomNode} from "./mathMLTree";


// To ensure that all nodes have compatible signatures for these methods.
export interface VirtualNode {
    toNode(): Node;
    toMarkup(): string;
}


/**
 * This node represents a document fragment, which contains elements, but when
 * placed into the DOM doesn't have any representation itself. It only contains
 * children and doesn't have any DOM node properties.
 */
export class documentFragment<ChildType: VirtualNode>
    implements HtmlDomNode, MathDomNode {
    children: ChildType[];
    // HtmlDomNode
    classes: string[];
    height: number;
    depth: number;
    maxFontSize: number;
    style: CssStyle;          // Never used; needed for satisfying interface.

    constructor(children: ChildType[]) {
        this.children = children;
        this.classes = [];
        this.height = 0;
        this.depth = 0;
        this.maxFontSize = 0;
        this.style = {};
    }

    hasClass(className: string): boolean {
        return utils.contains(this.classes, className);
    }

    tryCombine(sibling: HtmlDomNode): boolean {
        return false;
    }

    /** Convert the fragment into a node. */
    toNode(): Node {
        const frag = document.createDocumentFragment();

        Array.prototype.forEach.call(this.children, function(child) {
            frag.appendChild(child.toNode());
        });

        return frag;
    }

    /** Convert the fragment into HTML markup. */
    toMarkup(): string {
        let markup = "";

        // Simply concatenate the markup for the children together.
        Array.prototype.forEach.call(this.children, function(child) {
            markup += child.toMarkup();
        });

        return markup;
    }

    /**
     * Converts the math node into a string, similar to innerText. Applies to
     * MathDomNode's only.
     */
    toText(): string {
        // To avoid this, we would subclass documentFragment separately for
        // MathML, but polyfills for subclassing is expensive per PR 1469.
        // $FlowFixMe: Only works for ChildType = MathDomNode.
        const toText = (child: ChildType): string => child.toText();
        return this.children.map(toText).join("");
    }
}
