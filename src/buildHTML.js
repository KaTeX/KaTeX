// @flow
/**
 * This file does the main work of building a domTree structure from a parse
 * tree. The entry point is the `buildHTML` function, which takes a parse tree.
 * Then, the buildExpression, buildGroup, and various groupBuilders functions
 * are called, to produce a final HTML tree.
 */

import ParseError from "./ParseError";
import Style from "./Style";
import buildCommon from "./buildCommon";
import {Anchor} from "./domTree";
import utils, {assert} from "./utils";
import {checkNodeType} from "./parseNode";
import {spacings, tightSpacings} from "./spacingData";
import {_htmlGroupBuilders as groupBuilders} from "./defineFunction";
import {DocumentFragment} from "./tree";

import type Options from "./Options";
import type {AnyParseNode} from "./parseNode";
import type {HtmlDomNode, DomSpan} from "./domTree";

const makeSpan = buildCommon.makeSpan;

// Binary atoms (first class `mbin`) change into ordinary atoms (`mord`)
// depending on their surroundings. See TeXbook pg. 442-446, Rules 5 and 6,
// and the text before Rule 19.
const isBinLeftCanceller = function(
    node: ?HtmlDomNode,
    isRealGroup: boolean,
): boolean {
    // TODO: This code assumes that a node's math class is the first element
    // of its `classes` array. A later cleanup should ensure this, for
    // instance by changing the signature of `makeSpan`.
    if (node) {
        return utils.contains(["mbin", "mopen", "mrel", "mop", "mpunct"],
                              getTypeOfDomTree(node, "right"));
    } else {
        return isRealGroup;
    }
};

const isBinRightCanceller = function(
    node: ?HtmlDomNode,
    isRealGroup: boolean,
): boolean {
    if (node) {
        return utils.contains(["mrel", "mclose", "mpunct"],
                              getTypeOfDomTree(node, "left"));
    } else {
        return isRealGroup;
    }
};

const styleMap = {
    "display": Style.DISPLAY,
    "text": Style.TEXT,
    "script": Style.SCRIPT,
    "scriptscript": Style.SCRIPTSCRIPT,
};

type Side = "left" | "right";

const DomEnum = {
    mord: "mord",
    mop: "mop",
    mbin: "mbin",
    mrel: "mrel",
    mopen: "mopen",
    mclose: "mclose",
    mpunct: "mpunct",
    minner: "minner",
};
export type DomType = $Keys<typeof DomEnum>;

/**
 * Take a list of nodes, build them in order, and return a list of the built
 * nodes. documentFragments are flattened into their contents, so the
 * returned list contains no fragments. `isRealGroup` is true if `expression`
 * is a real group (no atoms will be added on either side), as opposed to
 * a partial group (e.g. one created by \color). `surrounding` is an array
 * consisting type of nodes that will be added to the left and right.
 */
export const buildExpression = function(
    expression: AnyParseNode[],
    options: Options,
    isRealGroup: boolean,
    surrounding: [?DomType, ?DomType] = [null, null],
): HtmlDomNode[] {
    // Parse expressions into `groups`.
    const rawGroups: HtmlDomNode[] = [];
    for (let i = 0; i < expression.length; i++) {
        const output = buildGroup(expression[i], options);
        if (output instanceof DocumentFragment) {
            const children: HtmlDomNode[] = output.children;
            rawGroups.push(...children);
        } else {
            rawGroups.push(output);
        }
    }
    // At this point `rawGroups` consists entirely of `symbolNode`s and `span`s.

    // Ignore explicit spaces (e.g., \;, \,) when determining what implicit
    // spacing should go between atoms of different classes, and add dummy
    // spans for determining spacings between surrounding atoms.
    const nonSpaces: (?HtmlDomNode)[] = [
        surrounding[0] ? makeSpan([surrounding[0]], [], options) : null,
        ...rawGroups.filter(group => group && group.classes[0] !== "mspace"),
        surrounding[1] ? makeSpan([surrounding[1]], [], options) : null,
    ];

    // Before determining what spaces to insert, perform bin cancellation.
    // Binary operators change to ordinary symbols in some contexts.
    for (let i = 1; i < nonSpaces.length - 1; i++) {
        const nonSpacesI: HtmlDomNode = assert(nonSpaces[i]);
        const left = getOutermostNode(nonSpacesI, "left");
        if (left.classes[0] === "mbin" &&
                isBinLeftCanceller(nonSpaces[i - 1], isRealGroup)) {
            left.classes[0] = "mord";
        }

        const right = getOutermostNode(nonSpacesI, "right");
        if (right.classes[0] === "mbin" &&
                isBinRightCanceller(nonSpaces[i + 1], isRealGroup)) {
            right.classes[0] = "mord";
        }
    }

    const groups = [];
    let j = 0;
    for (let i = 0; i < rawGroups.length; i++) {
        groups.push(rawGroups[i]);

        // For any group that is not a space, get the next non-space.  Then
        // lookup what implicit space should be placed between those atoms and
        // add it to groups.
        if (rawGroups[i].classes[0] !== "mspace" && j < nonSpaces.length - 1) {
            // if current non-space node is left dummy span, add a glue before
            // first real non-space node
            if (j === 0) {
                groups.pop();
                i--;
            }

            // Get the type of the current non-space node.  If it's a document
            // fragment, get the type of the rightmost node in the fragment.
            const left = getTypeOfDomTree(nonSpaces[j], "right");

            // Get the type of the next non-space node.  If it's a document
            // fragment, get the type of the leftmost node in the fragment.
            const right = getTypeOfDomTree(nonSpaces[j + 1], "left");

            // We use buildExpression inside of sizingGroup, but it returns a
            // document fragment of elements.  sizingGroup sets `isRealGroup`
            // to false to avoid processing spans multiple times.
            if (left && right && isRealGroup) {
                const nonSpacesJp1: HtmlDomNode = assert(nonSpaces[j + 1]);
                const space = isLeftTight(nonSpacesJp1)
                    ? tightSpacings[left][right]
                    : spacings[left][right];

                if (space) {
                    let glueOptions = options;

                    if (expression.length === 1) {
                        const node =
                            checkNodeType(expression[0], "sizing") ||
                            checkNodeType(expression[0], "styling");
                        if (!node) {
                            // No match.
                        } else if (node.type === "sizing") {
                            glueOptions = options.havingSize(node.size);
                        } else if (node.type === "styling") {
                            glueOptions = options.havingStyle(styleMap[node.style]);
                        }
                    }

                    groups.push(buildCommon.makeGlue(space, glueOptions));
                }
            }
            j++;
        }
    }

    return groups;
};

// Return the outermost node of a domTree.
const getOutermostNode = function(
    node: HtmlDomNode,
    side: Side,
): HtmlDomNode {
    if (node instanceof DocumentFragment ||
            node instanceof Anchor) {
        const children = node.children;
        if (children.length) {
            if (side === "right") {
                return getOutermostNode(children[children.length - 1], "right");
            } else if (side === "left") {
                return getOutermostNode(children[0], "right");
            }
        }
    }
    return node;
};

// Return math atom class (mclass) of a domTree.
export const getTypeOfDomTree = function(
    node: ?HtmlDomNode,
    side: Side,
): ?DomType {
    if (!node) {
        return null;
    }

    node = getOutermostNode(node, side);
    // This makes a lot of assumptions as to where the type of atom
    // appears.  We should do a better job of enforcing this.
    return DomEnum[node.classes[0]] || null;
};

// If `node` is an atom return whether it's been assigned the mtight class.
// If `node` is a document fragment, return the value of isLeftTight() for the
// leftmost node in the fragment.
// 'mtight' indicates that the node is script or scriptscript style.
export const isLeftTight = function(node: HtmlDomNode): boolean {
    node = getOutermostNode(node, "left");
    return node.hasClass("mtight");
};

export const makeNullDelimiter = function(
    options: Options,
    classes: string[],
): DomSpan {
    const moreClasses = ["nulldelimiter"].concat(options.baseSizingClasses());
    return makeSpan(classes.concat(moreClasses));
};

/**
 * buildGroup is the function that takes a group and calls the correct groupType
 * function for it. It also handles the interaction of size and style changes
 * between parents and children.
 */
export const buildGroup = function(
    group: ?AnyParseNode,
    options: Options,
    baseOptions?: Options,
): HtmlDomNode {
    if (!group) {
        return makeSpan();
    }

    if (groupBuilders[group.type]) {
        // Call the groupBuilders function
        // $FlowFixMe
        let groupNode: HtmlDomNode = groupBuilders[group.type](group, options);

        // If the size changed between the parent and the current group, account
        // for that size difference.
        if (baseOptions && options.size !== baseOptions.size) {
            groupNode = makeSpan(options.sizingClasses(baseOptions),
                [groupNode], options);

            const multiplier =
                options.sizeMultiplier / baseOptions.sizeMultiplier;

            groupNode.height *= multiplier;
            groupNode.depth *= multiplier;
        }

        return groupNode;
    } else {
        throw new ParseError(
            "Got group of unknown type: '" + group.type + "'");
    }
};

/**
 * Combine an array of HTML DOM nodes (e.g., the output of `buildExpression`)
 * into an unbreakable HTML node of class .base, with proper struts to
 * guarantee correct vertical extent.  `buildHTML` calls this repeatedly to
 * make up the entire expression as a sequence of unbreakable units.
 */
function buildHTMLUnbreakable(children, options) {
    // Compute height and depth of this chunk.
    const body = makeSpan(["base"], children, options);

    // Add strut, which ensures that the top of the HTML element falls at
    // the height of the expression, and the bottom of the HTML element
    // falls at the depth of the expression.
    // We used to have separate top and bottom struts, where the bottom strut
    // would like to use `vertical-align: top`, but in IE 9 this lowers the
    // baseline of the box to the bottom of this strut (instead of staying in
    // the normal place) so we use an absolute value for vertical-align instead.
    const strut = makeSpan(["strut"]);
    strut.style.height = (body.height + body.depth) + "em";
    strut.style.verticalAlign = -body.depth + "em";
    body.children.unshift(strut);

    return body;
}

/**
 * Take an entire parse tree, and build it into an appropriate set of HTML
 * nodes.
 */
export default function buildHTML(tree: AnyParseNode[], options: Options): DomSpan {
    // Strip off outer tag wrapper for processing below.
    let tag = null;
    if (tree.length === 1 && tree[0].type === "tag") {
        tag = tree[0].tag;
        tree = tree[0].body;
    }

    // Build the expression contained in the tree
    const expression = buildExpression(tree, options, true);

    const children = [];

    // Create one base node for each chunk between potential line breaks.
    // The TeXBook [p.173] says "A formula will be broken only after a
    // relation symbol like $=$ or $<$ or $\rightarrow$, or after a binary
    // operation symbol like $+$ or $-$ or $\times$, where the relation or
    // binary operation is on the ``outer level'' of the formula (i.e., not
    // enclosed in {...} and not part of an \over construction)."

    let parts = [];
    for (let i = 0; i < expression.length; i++) {
        parts.push(expression[i]);
        if (expression[i].hasClass("mbin") ||
            expression[i].hasClass("mrel") ||
            expression[i].hasClass("allowbreak")) {
            // Put any post-operator glue on same line as operator.
            // Watch for \nobreak along the way.
            let nobreak = false;
            while (i < expression.length - 1 &&
                   expression[i + 1].hasClass("mspace")) {
                i++;
                parts.push(expression[i]);
                if (expression[i].hasClass("nobreak")) {
                    nobreak = true;
                }
            }
            // Don't allow break if \nobreak among the post-operator glue.
            if (!nobreak) {
                children.push(buildHTMLUnbreakable(parts, options));
                parts = [];
            }
        } else if (expression[i].hasClass("newline")) {
            // Write the line except the newline
            parts.pop();
            if (parts.length > 0) {
                children.push(buildHTMLUnbreakable(parts, options));
                parts = [];
            }
            // Put the newline at the top level
            children.push(expression[i]);
        }
    }
    if (parts.length > 0) {
        children.push(buildHTMLUnbreakable(parts, options));
    }

    // Now, if there was a tag, build it too and append it as a final child.
    let tagChild;
    if (tag) {
        tagChild = buildHTMLUnbreakable(
            buildExpression(tag, options, true)
        );
        tagChild.classes = ["tag"];
        children.push(tagChild);
    }

    const htmlNode = makeSpan(["katex-html"], children);
    htmlNode.setAttribute("aria-hidden", "true");

    // Adjust the strut of the tag to be the maximum height of all children
    // (the height of the enclosing htmlNode) for proper vertical alignment.
    if (tagChild) {
        const strut = tagChild.children[0];
        strut.style.height = (htmlNode.height + htmlNode.depth) + "em";
        strut.style.verticalAlign = (-htmlNode.depth) + "em";
    }

    return htmlNode;
}
