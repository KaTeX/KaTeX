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

export type AccentStructType = {|
    type: "accent",
    label: string,
    isStretchy: boolean,
    isShifty: boolean,
    base: ParseNode<*>,
|};

// Map from `type` field value to corresponding `value` type.
type ParseNodeTypes = {
    "array": ArrayEnvNodeData,
    "accent": AccentStructType,
    "color": {|
        type: "color",
        color: string,
        value: ParseNode<*>[],
    |},
    "leftright": {|
        body: [{|
            type: "array",
            hskipBeforeAndAfter: boolean,
        |} | ParseNode<*>],
        left: string,
        right: string,
    |},
    "op": {|
        type: "op",
        limits: boolean,
        symbol: boolean,
        alwaysHandleSupSub?: boolean,
        suppressBaseShift?: boolean,
        body?: string,
        value?: ParseNode<*>[],
    |},
    "ordgroup": ParseNode<*>[],
    "size": {|
        number: number,
        unit: string,
    |},
    "styling": {|
        type: "styling",
        style: StyleStr,
        value: ParseNode<*>[],
    |},
    "supsub": {|
        base: ?ParseNode<*>,
        sup?: ?ParseNode<*>,
        sub?: ?ParseNode<*>,
    |},
    "text": {|
        type: "text",
        body: ParseNode<*>[],
        font?: string,
    |},
    "textord": string,
    "url": string,
    "verb": {|
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
    // From functions.js and functions/*.js. See also "accent", "color", "op",
    // "styling", and "text" above.
    "accentUnder": {|
        type: "accentUnder",
        label: string,
        base: ParseNode<*>,
    |},
    "cr": {|
        type: "cr",
        size: ?ParseNode<*>,
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
        backgroundColor?: ParseNode<*>,
        borderColor?: ParseNode<*>,
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
    "leftright": {|
        type?: "leftright",
        body?: ParseNode<*>[],
        left: string,
        right: string,
    |} | {|
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
        dy: ParseNode<*>,
        body: ParseNode<*>,
        value: ParseNode<*>[],
    |},
    "rule": {|
        type: "rule",
        shift: ?Measurement,
        width: ParseNode<*>,
        height: ParseNode<*>,
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
