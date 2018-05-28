// @flow
import SourceLocation from "./SourceLocation";
import type {ArrayEnvNodeData} from "./environments/array.js";
import type {Mode, StyleStr} from "./types";
import type {Token} from "./Token.js";
import type {Measurement} from "./units.js";

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
    body: ParseNode<*>[],
    left: string,
    right: string,
|};

// Map from `type` field value to corresponding `value` type.
export type ParseNodeTypes = {
    "array": ArrayEnvNodeData,
    "color": {|
        type: "color",
        color: string,
        value: ParseNode<*>[],
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
        value: ParseNode<*>[],
    |},
    "ordgroup": ParseNode<*>[],
    "size": {|
        type: "size",
        value: Measurement,
    |},
    "styling": {|
        type: "styling",
        style: StyleStr,
        value: ParseNode<*>[],
    |},
    "supsub": {|
        type: "supsub",
        base: ?ParseNode<*>,
        sup?: ?ParseNode<*>,
        sub?: ?ParseNode<*>,
    |},
    "tag": {|
        type: "tag",
        body: ParseNode<*>[],
        tag: ParseNode<*>[],
    |},
    "text": {|
        type: "text",
        body: ParseNode<*>[],
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
        base: ParseNode<*>,
    |},
    "accentUnder": {|
        type: "accentUnder",
        label: string,
        isStretchy?: boolean,
        isShifty?: boolean,
        base: ParseNode<*>,
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
        body: ParseNode<*>,
    |},
    "environment": {|
        type: "environment",
        name: string,
        nameGroup: ParseNode<*>,
    |},
    "font": {|
        type: "font",
        font: string,
        body: ParseNode<*>,
    |},
    "genfrac": {|
        type: "genfrac",
        numer: ParseNode<*>,
        denom: ParseNode<*>,
        hasBarLine: boolean,
        leftDelim: ?string,
        rightDelim: ?string,
        size: StyleStr | "auto",
    |},
    "horizBrace": {|
        type: "horizBrace",
        label: string,
        isOver: boolean,
        base: ParseNode<*>,
    |},
    "href": {|
        type: "href",
        href: string,
        body: ParseNode<*>[],
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
        body: ParseNode<*>,
    |},
    "leftright": LeftRightDelimType | {|
        type: "leftright",
        value: string,
    |},
    "mathchoice": {|
        type: "mathchoice",
        display: ParseNode<*>[],
        text: ParseNode<*>[],
        script: ParseNode<*>[],
        scriptscript: ParseNode<*>[],
    |},
    "middle": {|
        type: "middle",
        value: string,
    |},
    "mclass": {|
        type: "mclass",
        mclass: string,
        value: ParseNode<*>[],
    |},
    "mod": {|
        type: "mod",
        modType: string,
        value: ?ParseNode<*>[],
    |},
    "operatorname": {|
        type: "operatorname",
        value: ParseNode<*>[],
    |},
    "overline": {|
        type: "overline",
        body: ParseNode<*>,
    |},
    "phantom": {|
        type: "phantom",
        value: ParseNode<*>[],
    |},
    "hphantom": {|
        type: "hphantom",
        body: ParseNode<*>,
        value: ParseNode<*>[],
    |},
    "vphantom": {|
        type: "vphantom",
        body: ParseNode<*>,
        value: ParseNode<*>[],
    |},
    "raisebox": {|
        type: "raisebox",
        dy: ParseNode<"size">,
        body: ParseNode<*>,
        value: ParseNode<*>[],
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
        value: ParseNode<*>[],
    |},
    "smash": {|
        type: "smash",
        body: ParseNode<*>,
        smashHeight: boolean,
        smashDepth: boolean,
    |},
    "sqrt": {|
        type: "sqrt",
        body: ParseNode<*>,
        index: ?ParseNode<*>,
    |},
    "underline": {|
        type: "underline",
        body: ParseNode<*>,
    |},
    "xArrow": {|
        type: "xArrow",
        label: string,
        body: ParseNode<*>,
        below: ?ParseNode<*>,
    |},
};

/**
 * Asserts that the node is of the given type and returns it with stricter
 * typing. Throws if the node's type does not match.
 */
export function assertNodeType<NODETYPE: NodeType>(
    // The union allows either ParseNode<*> or the union of two specific nodes.
    node: ?ParseNode<*> | ParseNode<*>,
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
    // The union allows either ParseNode<*> or the union of two specific nodes.
    node: ?ParseNode<*> | ParseNode<*>,
    type: NODETYPE,
): ?ParseNode<NODETYPE> {
    return node && node.type === type ?
        (node: ParseNode<NODETYPE>) :
        null;
}
