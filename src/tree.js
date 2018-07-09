// @flow


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
export class documentFragment<ChildType: VirtualNode> implements VirtualNode {
    children: ChildType[];

    constructor(children: ChildType[]) {
        this.children = children;
    }

    /** Convert the fragment into a node. */
    toNode(): Node {
        const frag = document.createDocumentFragment();

        for (let i = 0; i < this.children.length; i++) {
            frag.appendChild(this.children[i].toNode());
        }

        return frag;
    }

    /** Convert the fragment into HTML markup. */
    toMarkup(): string {
        let markup = "";

        // Simply concatenate the markup for the children together.
        for (let i = 0; i < this.children.length; i++) {
            markup += this.children[i].toMarkup();
        }

        return markup;
    }
}
