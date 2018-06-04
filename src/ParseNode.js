// @flow
import SourceLocation from "./SourceLocation";
import {GROUPS} from "./symbols";
import type {ArrayEnvNodeData} from "./environments/array";
import type {Mode, StyleStr} from "./types";
import type {Token} from "./Token";
import type {Measurement} from "./units";

/**
 * The resulting parse tree nodes of the parse tree.
 *
 * It is possible to provide position information, so that a `ParseNode` can
 * fulfill a role similar to a `Token` in error reporting.
 * For details on the corresponding properties see `Token` constructor.
 * Providing such information can lead to better error reporting.
 */
export default class ParseNode<TYPE: NodeType> {
    type: TYPE;
    value: NodeValue<TYPE>;
    mode: Mode;
    loc: ?SourceLocation;

    constructor(
        type: TYPE,             // type of node, like e.g. "ordgroup"
        value: NodeValue<TYPE>, // type-specific representation of the node
        mode: Mode,         // parse mode in action for this node, "math" or "text"
        first?: {loc: ?SourceLocation}, // first token or node of the input for
                            // this node, will omit position information if unset
        last?: {loc: ?SourceLocation},  // last token or node of the input for this
                            // node, will default to firstToken if unset
    ) {
        this.type = type;
        this.value = value;
        this.mode = mode;
        this.loc = SourceLocation.range(first, last);
    }
}

export type NodeType = $Keys<ParseNodeTypes>;
export type NodeValue<TYPE: NodeType> = $ElementType<ParseNodeTypes, TYPE>;

export type LeftRightDelimType = {|
    type: "leftright",
    body: AnyParseNode[],
    left: string,
    right: string,
|};

// ParseNode's corresponding to Symbol `Group`s in symbols.js.
export type SymbolParseNode =
    ParseNode<"accent-token"> |
    ParseNode<"bin"> |
    ParseNode<"close"> |
    ParseNode<"inner"> |
    ParseNode<"mathord"> |
    ParseNode<"op-token"> |
    ParseNode<"open"> |
    ParseNode<"punct"> |
    ParseNode<"rel"> |
    ParseNode<"spacing"> |
    ParseNode<"textord">;

// Union of all possible `ParseNode<>` types.
// Unable to derive this directly from `ParseNodeTypes` due to
// https://github.com/facebook/flow/issues/6369.
// Cannot use `ParseNode<NodeType>` since `ParseNode` is not strictly co-variant
// w.r.t. its type parameter due to the way the value type is computed.
export type AnyParseNode =
    SymbolParseNode |
    ParseNode<"array"> |
    ParseNode<"color"> |
    ParseNode<"color-token"> |
    ParseNode<"op"> |
    ParseNode<"ordgroup"> |
    ParseNode<"size"> |
    ParseNode<"styling"> |
    ParseNode<"supsub"> |
    ParseNode<"tag"> |
    ParseNode<"text"> |
    ParseNode<"url"> |
    ParseNode<"verb"> |
    ParseNode<"accent"> |
    ParseNode<"accentUnder"> |
    ParseNode<"cr"> |
    ParseNode<"delimsizing"> |
    ParseNode<"enclose"> |
    ParseNode<"environment"> |
    ParseNode<"font"> |
    ParseNode<"genfrac"> |
    ParseNode<"horizBrace"> |
    ParseNode<"href"> |
    ParseNode<"infix"> |
    ParseNode<"kern"> |
    ParseNode<"lap"> |
    ParseNode<"leftright"> |
    ParseNode<"leftright-right"> |
    ParseNode<"mathchoice"> |
    ParseNode<"middle"> |
    ParseNode<"mclass"> |
    ParseNode<"mod"> |
    ParseNode<"operatorname"> |
    ParseNode<"overline"> |
    ParseNode<"phantom"> |
    ParseNode<"hphantom"> |
    ParseNode<"vphantom"> |
    ParseNode<"raisebox"> |
    ParseNode<"rule"> |
    ParseNode<"sizing"> |
    ParseNode<"smash"> |
    ParseNode<"sqrt"> |
    ParseNode<"underline"> |
    ParseNode<"xArrow">;

// Map from `type` field value to corresponding `value` type.
export type ParseNodeTypes = {
    "array": ArrayEnvNodeData,
    "color": {|
        type: "color",
        color: string,
        value: AnyParseNode[],
    |},
    "color-token": string,
    // To avoid requiring run-time type assertions, this more carefully captures
    // the requirements on the fields per the op.js htmlBuilder logic:
    // - `body` and `value` are NEVER set simultanouesly.
    // - When `symbol` is true, `body` is set.
    "op": {|
        type: "op",
        limits: boolean,
        alwaysHandleSupSub?: boolean,
        suppressBaseShift?: boolean,
        symbol: boolean,
        body: string,
        value?: void,
    |} | {|
        type: "op",
        limits: boolean,
        alwaysHandleSupSub?: boolean,
        suppressBaseShift?: boolean,
        symbol: false,  // If 'symbol' is true, `body` *must* be set.
        body?: void,
        value: AnyParseNode[],
    |},
    "ordgroup": AnyParseNode[],
    "size": {|
        type: "size",
        value: Measurement,
    |},
    "styling": {|
        type: "styling",
        style: StyleStr,
        value: AnyParseNode[],
    |},
    "supsub": {|
        type: "supsub",
        base: ?AnyParseNode,
        sup?: ?AnyParseNode,
        sub?: ?AnyParseNode,
    |},
    "tag": {|
        type: "tag",
        body: AnyParseNode[],
        tag: AnyParseNode[],
    |},
    "text": {|
        type: "text",
        body: AnyParseNode[],
        font?: string,
    |},
    "url": {|
        type: "url",
        value: string,
    |},
    "verb": {|
        type: "verb",
        body: string,
        star: boolean,
    |},
    // From symbol groups, constructed in Parser.js via `symbols` lookup.
    // (Some of these have "-token" suffix to distinguish them from existing
    // `ParseNode` types.)
    "accent-token": string,
    "bin": string,
    "close": string,
    "inner": string,
    "mathord": string,
    "op-token": string,
    "open": string,
    "punct": string,
    "rel": string,
    "spacing": string,
    "textord": string,
    // From functions.js and functions/*.js. See also "color", "op", "styling",
    // and "text" above.
    "accent": {|
        type: "accent",
        label: string,
        isStretchy?: boolean,
        isShifty?: boolean,
        base: AnyParseNode,
    |},
    "accentUnder": {|
        type: "accentUnder",
        label: string,
        isStretchy?: boolean,
        isShifty?: boolean,
        base: AnyParseNode,
    |},
    "cr": {|
        type: "cr",
        newRow: boolean,
        newLine: boolean,
        size: ?ParseNode<"size">,
    |},
    "delimsizing": {|
        type: "delimsizing",
        size: 1 | 2 | 3 | 4,
        mclass: "mopen" | "mclose" | "mrel" | "mord",
        value: string,
    |},
    "enclose": {|
        type: "enclose",
        label: string,
        backgroundColor?: ParseNode<"color-token">,
        borderColor?: ParseNode<"color-token">,
        body: AnyParseNode,
    |},
    "environment": {|
        type: "environment",
        name: string,
        nameGroup: AnyParseNode,
    |},
    "font": {|
        type: "font",
        font: string,
        body: AnyParseNode,
    |},
    "genfrac": {|
        type: "genfrac",
        continued: boolean,
        numer: AnyParseNode,
        denom: AnyParseNode,
        hasBarLine: boolean,
        leftDelim: ?string,
        rightDelim: ?string,
        size: StyleStr | "auto",
    |},
    "horizBrace": {|
        type: "horizBrace",
        label: string,
        isOver: boolean,
        base: AnyParseNode,
    |},
    "href": {|
        type: "href",
        href: string,
        body: AnyParseNode[],
    |},
    "infix": {|
        type: "infix",
        replaceWith: string,
        token: ?Token,
    |},
    "kern": {|
        type: "kern",
        dimension: Measurement,
    |},
    "lap": {|
        type: "lap",
        alignment: string,
        body: AnyParseNode,
    |},
    "leftright": LeftRightDelimType,
    "leftright-right": {|
        type: "leftright-right",
        value: string,
    |},
    "mathchoice": {|
        type: "mathchoice",
        display: AnyParseNode[],
        text: AnyParseNode[],
        script: AnyParseNode[],
        scriptscript: AnyParseNode[],
    |},
    "middle": {|
        type: "middle",
        value: string,
    |},
    "mclass": {|
        type: "mclass",
        mclass: string,
        value: AnyParseNode[],
    |},
    "mod": {|
        type: "mod",
        modType: string,
        value: ?AnyParseNode[],
    |},
    "operatorname": {|
        type: "operatorname",
        value: AnyParseNode[],
    |},
    "overline": {|
        type: "overline",
        body: AnyParseNode,
    |},
    "phantom": {|
        type: "phantom",
        value: AnyParseNode[],
    |},
    "hphantom": {|
        type: "hphantom",
        body: AnyParseNode,
        value: AnyParseNode[],
    |},
    "vphantom": {|
        type: "vphantom",
        body: AnyParseNode,
        value: AnyParseNode[],
    |},
    "raisebox": {|
        type: "raisebox",
        dy: ParseNode<"size">,
        body: AnyParseNode,
        value: AnyParseNode[],
    |},
    "rule": {|
        type: "rule",
        shift: ?Measurement,
        width: Measurement,
        height: Measurement,
    |},
    "sizing": {|
        type: "sizing",
        size: number,
        value: AnyParseNode[],
    |},
    "smash": {|
        type: "smash",
        body: AnyParseNode,
        smashHeight: boolean,
        smashDepth: boolean,
    |},
    "sqrt": {|
        type: "sqrt",
        body: AnyParseNode,
        index: ?AnyParseNode,
    |},
    "underline": {|
        type: "underline",
        body: AnyParseNode,
    |},
    "xArrow": {|
        type: "xArrow",
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
        // $FlowFixMe: Inference not sophisticated enough to figure this out.
        return node;
    }
    return null;
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
    if (node && GROUPS.hasOwnProperty(node.type)) {
        // $FlowFixMe
        return node;
    }
    return null;
}
