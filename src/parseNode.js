// @flow
import {NON_ATOMS} from "./symbols";
import type SourceLocation from "./SourceLocation";
import type {AlignSpec} from "./environments/array";
import type {Atom} from "./symbols";
import type {Mode, StyleStr} from "./types";
import type {Token} from "./Token";
import type {Measurement} from "./units";

export type NodeType = $Keys<ParseNodeTypes>;
export type ParseNode<TYPE: NodeType> = $ElementType<ParseNodeTypes, TYPE>;

// ParseNode's corresponding to Symbol `Group`s in symbols.js.
export type SymbolParseNode =
    ParseNode<"atom"> |
    ParseNode<"accent-token"> |
    ParseNode<"mathord"> |
    ParseNode<"op-token"> |
    ParseNode<"spacing"> |
    ParseNode<"textord">;

// Union of all possible `ParseNode<>` types.
export type AnyParseNode = $Values<ParseNodeTypes>;

// Map from `NodeType` to the corresponding `ParseNode`.
type ParseNodeTypes = {
    "array": {|
        type: "array",
        mode: Mode,
        loc?: ?SourceLocation,
        hskipBeforeAndAfter?: boolean,
        addJot?: boolean,
        cols?: AlignSpec[],
        arraystretch: number,
        body: AnyParseNode[][], // List of rows in the (2D) array.
        rowGaps: (?Measurement)[],
        hLinesBeforeRow: Array<boolean[]>,
    |},
    "color": {|
        type: "color",
        mode: Mode,
        loc?: ?SourceLocation,
        color: string,
        body: AnyParseNode[],
    |},
    "color-token": {|
        type: "color-token",
        mode: Mode,
        loc?: ?SourceLocation,
        color: string,
    |},
    "keyVals": {|
        type: "keyVals",
        mode: Mode,
        loc?: ?SourceLocation,
        keyVals: string,
    |},
    // To avoid requiring run-time type assertions, this more carefully captures
    // the requirements on the fields per the op.js htmlBuilder logic:
    // - `body` and `value` are NEVER set simultanouesly.
    // - When `symbol` is true, `body` is set.
    "op": {|
        type: "op",
        mode: Mode,
        loc?: ?SourceLocation,
        limits: boolean,
        alwaysHandleSupSub?: boolean,
        suppressBaseShift?: boolean,
        parentIsSupSub: boolean,
        symbol: boolean,
        name: string,
        body?: void,
    |} | {|
        type: "op",
        mode: Mode,
        loc?: ?SourceLocation,
        limits: boolean,
        alwaysHandleSupSub?: boolean,
        suppressBaseShift?: boolean,
        parentIsSupSub: boolean,
        symbol: false,  // If 'symbol' is true, `body` *must* be set.
        name?: void,
        body: AnyParseNode[],
    |},
    "ordgroup": {|
        type: "ordgroup",
        mode: Mode,
        loc?: ?SourceLocation,
        body: AnyParseNode[],
        semisimple?: boolean,
    |},
    "raw": {|
        type: "raw",
        mode: Mode,
        loc?: ?SourceLocation,
        string: string,
    |},
    "size": {|
        type: "size",
        mode: Mode,
        loc?: ?SourceLocation,
        value: Measurement,
        isBlank: boolean,
    |},
    "styling": {|
        type: "styling",
        mode: Mode,
        loc?: ?SourceLocation,
        style: StyleStr,
        body: AnyParseNode[],
    |},
    "supsub": {|
        type: "supsub",
        mode: Mode,
        loc?: ?SourceLocation,
        base: ?AnyParseNode,
        sup?: ?AnyParseNode,
        sub?: ?AnyParseNode,
    |},
    "tag": {|
        type: "tag",
        mode: Mode,
        loc?: ?SourceLocation,
        body: AnyParseNode[],
        tag: AnyParseNode[],
    |},
    "text": {|
        type: "text",
        mode: Mode,
        loc?: ?SourceLocation,
        body: AnyParseNode[],
        font?: string,
    |},
    "url": {|
        type: "url",
        mode: Mode,
        loc?: ?SourceLocation,
        url: string,
    |},
    "verb": {|
        type: "verb",
        mode: Mode,
        loc?: ?SourceLocation,
        body: string,
        star: boolean,
    |},
    // From symbol groups, constructed in Parser.js via `symbols` lookup.
    // (Some of these have "-token" suffix to distinguish them from existing
    // `ParseNode` types.)
    "atom": {|
        type: "atom",
        family: Atom,
        mode: Mode,
        loc?: ?SourceLocation,
        text: string,
    |},
    "mathord": {|
        type: "mathord",
        mode: Mode,
        loc?: ?SourceLocation,
        text: string,
    |},
    "spacing": {|
        type: "spacing",
        mode: Mode,
        loc?: ?SourceLocation,
        text: string,
    |},
    "textord": {|
        type: "textord",
        mode: Mode,
        loc?: ?SourceLocation,
        text: string,
    |},
    // These "-token" types don't have corresponding HTML/MathML builders.
    "accent-token": {|
        type: "accent-token",
        mode: Mode,
        loc?: ?SourceLocation,
        text: string,
    |},
    "op-token": {|
        type: "op-token",
        mode: Mode,
        loc?: ?SourceLocation,
        text: string,
    |},
    // From functions.js and functions/*.js. See also "color", "op", "styling",
    // and "text" above.
    "accent": {|
        type: "accent",
        mode: Mode,
        loc?: ?SourceLocation,
        label: string,
        isStretchy?: boolean,
        isShifty?: boolean,
        base: AnyParseNode,
    |},
    "accentUnder": {|
        type: "accentUnder",
        mode: Mode,
        loc?: ?SourceLocation,
        label: string,
        isStretchy?: boolean,
        isShifty?: boolean,
        base: AnyParseNode,
    |},
    "cr": {|
        type: "cr",
        mode: Mode,
        loc?: ?SourceLocation,
        newRow: boolean,
        newLine: boolean,
        size: ?Measurement,
    |},
    "delimsizing": {|
        type: "delimsizing",
        mode: Mode,
        loc?: ?SourceLocation,
        size: 1 | 2 | 3 | 4,
        mclass: "mopen" | "mclose" | "mrel" | "mord",
        delim: string,
    |},
    "enclose": {|
        type: "enclose",
        mode: Mode,
        loc?: ?SourceLocation,
        label: string,
        backgroundColor?: string,
        borderColor?: string,
        body: AnyParseNode,
    |},
    "environment": {|
        type: "environment",
        mode: Mode,
        loc?: ?SourceLocation,
        name: string,
        nameGroup: AnyParseNode,
    |},
    "font": {|
        type: "font",
        mode: Mode,
        loc?: ?SourceLocation,
        font: string,
        body: AnyParseNode,
    |},
    "genfrac": {|
        type: "genfrac",
        mode: Mode,
        loc?: ?SourceLocation,
        continued: boolean,
        numer: AnyParseNode,
        denom: AnyParseNode,
        hasBarLine: boolean,
        leftDelim: ?string,
        rightDelim: ?string,
        size: StyleStr | "auto",
        barSize: Measurement | null,
    |},
    "horizBrace": {|
        type: "horizBrace",
        mode: Mode,
        loc?: ?SourceLocation,
        label: string,
        isOver: boolean,
        base: AnyParseNode,
    |},
    "href": {|
        type: "href",
        mode: Mode,
        loc?: ?SourceLocation,
        href: string,
        body: AnyParseNode[],
    |},
    "htmlmathml": {|
        type: "htmlmathml",
        mode: Mode,
        loc?: ?SourceLocation,
        html: AnyParseNode[],
        mathml: AnyParseNode[],
    |},
    "includegraphics": {|
        type: "includegraphics",
        mode: Mode,
        loc?: ?SourceLocation,
        alt: string,
        width: Measurement,
        height: Measurement,
        totalheight: Measurement,
        src: string,
    |},
    "infix": {|
        type: "infix",
        mode: Mode,
        loc?: ?SourceLocation,
        replaceWith: string,
        size?: Measurement,
        token: ?Token,
    |},
    "kern": {|
        type: "kern",
        mode: Mode,
        loc?: ?SourceLocation,
        dimension: Measurement,
    |},
    "lap": {|
        type: "lap",
        mode: Mode,
        loc?: ?SourceLocation,
        alignment: string,
        body: AnyParseNode,
    |},
    "leftright": {|
        type: "leftright",
        mode: Mode,
        loc?: ?SourceLocation,
        body: AnyParseNode[],
        left: string,
        right: string,
    |},
    "leftright-right": {|
        type: "leftright-right",
        mode: Mode,
        loc?: ?SourceLocation,
        delim: string,
    |},
    "mathchoice": {|
        type: "mathchoice",
        mode: Mode,
        loc?: ?SourceLocation,
        display: AnyParseNode[],
        text: AnyParseNode[],
        script: AnyParseNode[],
        scriptscript: AnyParseNode[],
    |},
    "middle": {|
        type: "middle",
        mode: Mode,
        loc?: ?SourceLocation,
        delim: string,
    |},
    "mclass": {|
        type: "mclass",
        mode: Mode,
        loc?: ?SourceLocation,
        mclass: string,
        body: AnyParseNode[],
    |},
    "operatorname": {|
        type: "operatorname",
        mode: Mode,
        loc?: ?SourceLocation,
        body: AnyParseNode[],
    |},
    "overline": {|
        type: "overline",
        mode: Mode,
        loc?: ?SourceLocation,
        body: AnyParseNode,
    |},
    "phantom": {|
        type: "phantom",
        mode: Mode,
        loc?: ?SourceLocation,
        body: AnyParseNode[],
    |},
    "hphantom": {|
        type: "hphantom",
        mode: Mode,
        loc?: ?SourceLocation,
        body: AnyParseNode,
    |},
    "vphantom": {|
        type: "vphantom",
        mode: Mode,
        loc?: ?SourceLocation,
        body: AnyParseNode,
    |},
    "raisebox": {|
        type: "raisebox",
        mode: Mode,
        loc?: ?SourceLocation,
        dy: Measurement,
        body: AnyParseNode,
    |},
    "rule": {|
        type: "rule",
        mode: Mode,
        loc?: ?SourceLocation,
        shift: ?Measurement,
        width: Measurement,
        height: Measurement,
    |},
    "sizing": {|
        type: "sizing",
        mode: Mode,
        loc?: ?SourceLocation,
        size: number,
        body: AnyParseNode[],
    |},
    "smash": {|
        type: "smash",
        mode: Mode,
        loc?: ?SourceLocation,
        body: AnyParseNode,
        smashHeight: boolean,
        smashDepth: boolean,
    |},
    "sqrt": {|
        type: "sqrt",
        mode: Mode,
        loc?: ?SourceLocation,
        body: AnyParseNode,
        index: ?AnyParseNode,
    |},
    "underline": {|
        type: "underline",
        mode: Mode,
        loc?: ?SourceLocation,
        body: AnyParseNode,
    |},
    "xArrow": {|
        type: "xArrow",
        mode: Mode,
        loc?: ?SourceLocation,
        label: string,
        body: AnyParseNode,
        below: ?AnyParseNode,
    |},
};

/**
 * Asserts that the node is of the given type and returns it with stricter
 * typing. Throws if the node's type does not match.
 */
export function assertNodeType<NODETYPE: NodeType>(
    node: ?AnyParseNode,
    type: NODETYPE,
): ParseNode<NODETYPE> {
    const typedNode = checkNodeType(node, type);
    if (!typedNode) {
        throw new Error(
            `Expected node of type ${type}, but got ` +
            (node ? `node of type ${node.type}` : String(node)));
    }
    // $FlowFixMe: Unsure why.
    return typedNode;
}

/**
 * Returns the node more strictly typed iff it is of the given type. Otherwise,
 * returns null.
 */
export function checkNodeType<NODETYPE: NodeType>(
    node: ?AnyParseNode,
    type: NODETYPE,
): ?ParseNode<NODETYPE> {
    if (node && node.type === type) {
        // The definition of ParseNode<TYPE> doesn't communicate to flow that
        // `type: TYPE` (as that's not explicitly mentioned anywhere), though that
        // happens to be true for all our value types.
        // $FlowFixMe
        return node;
    }
    return null;
}

/**
 * Asserts that the node is of the given type and returns it with stricter
 * typing. Throws if the node's type does not match.
 */
export function assertAtomFamily(
    node: ?AnyParseNode,
    family: Atom,
): ParseNode<"atom"> {
    const typedNode = checkAtomFamily(node, family);
    if (!typedNode) {
        throw new Error(
            `Expected node of type "atom" and family "${family}", but got ` +
            (node ?
                (node.type === "atom" ?
                    `atom of family ${node.family}` :
                    `node of type ${node.type}`) :
                String(node)));
    }
    return typedNode;
}

/**
 * Returns the node more strictly typed iff it is of the given type. Otherwise,
 * returns null.
 */
export function checkAtomFamily(
    node: ?AnyParseNode,
    family: Atom,
): ?ParseNode<"atom"> {
    return node && node.type === "atom" && node.family === family ?
        node :
        null;
}

/**
 * Returns the node more strictly typed iff it is of the given type. Otherwise,
 * returns null.
 */
export function assertSymbolNodeType(node: ?AnyParseNode): SymbolParseNode {
    const typedNode = checkSymbolNodeType(node);
    if (!typedNode) {
        throw new Error(
            `Expected node of symbol group type, but got ` +
            (node ? `node of type ${node.type}` : String(node)));
    }
    return typedNode;
}

/**
 * Returns the node more strictly typed iff it is of the given type. Otherwise,
 * returns null.
 */
export function checkSymbolNodeType(node: ?AnyParseNode): ?SymbolParseNode {
    if (node && (node.type === "atom" || NON_ATOMS.hasOwnProperty(node.type))) {
        // $FlowFixMe
        return node;
    }
    return null;
}
