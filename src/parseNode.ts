import {NON_ATOMS} from "./symbols";
import SourceLocation from "./SourceLocation";
import { AlignSpec, ColSeparationType } from "./environments/array";
import { Atom } from "./symbols";
import { Mode, StyleStr } from "./types";
import { Token } from "./Token";
import { Measurement } from "./units";

export type NodeType = keyof ParseNodeTypes;
export type ParseNode<TYPE extends NodeType> = ParseNodeTypes[TYPE];

// ParseNode's corresponding to Symbol `Group`s in symbols.js.
export type SymbolParseNode = ParseNode<"atom"> | ParseNode<"accent-token"> | ParseNode<"mathord"> | ParseNode<"op-token"> | ParseNode<"spacing"> | ParseNode<"textord">;

// ParseNode from `Parser.formatUnsupportedCmd`
export type UnsupportedCmdParseNode = ParseNode<"color">;

// Union of all possible `ParseNode<>` types.
export type AnyParseNode = ParseNodeTypes[keyof ParseNodeTypes];

// Map from `NodeType` to the corresponding `ParseNode`.
type ParseNodeTypes = {
    "array": {
        type: "array",
        mode: Mode,
        loc?: SourceLocation | null,
        colSeparationType?: ColSeparationType,
        hskipBeforeAndAfter?: boolean,
        addJot?: boolean,
        cols?: AlignSpec[],
        arraystretch: number,
        body: AnyParseNode[][] // List of rows in the (2D) array.,
        rowGaps: Measurement | null[],
        hLinesBeforeRow: Array<boolean[]>
    },
    "color": {
        type: "color",
        mode: Mode,
        loc?: SourceLocation | null,
        color: string,
        body: AnyParseNode[]
    },
    "color-token": {
        type: "color-token",
        mode: Mode,
        loc?: SourceLocation | null,
        color: string
    },
    // To avoid requiring run-time type assertions, this more carefully captures
    // the requirements on the fields per the op.js htmlBuilder logic:
    // - `body` and `value` are NEVER set simultanouesly.
    // - When `symbol` is true, `body` is set.
    "op": {
        type: "op",
        mode: Mode,
        loc?: SourceLocation | null,
        limits: boolean,
        alwaysHandleSupSub?: boolean,
        suppressBaseShift?: boolean,
        parentIsSupSub: boolean,
        symbol: boolean,
        name: string,
        body?: void
    } | {
        type: "op",
        mode: Mode,
        loc?: SourceLocation | null,
        limits: boolean,
        alwaysHandleSupSub?: boolean,
        suppressBaseShift?: boolean,
        parentIsSupSub: boolean,
        symbol: false  // If 'symbol' is true, `body` *must* be set.,
        name?: void,
        body: AnyParseNode[]
    },
    "ordgroup": {
        type: "ordgroup",
        mode: Mode,
        loc?: SourceLocation | null,
        body: AnyParseNode[],
        semisimple?: boolean
    },
    "raw": {
        type: "raw",
        mode: Mode,
        loc?: SourceLocation | null,
        string: string
    },
    "size": {
        type: "size",
        mode: Mode,
        loc?: SourceLocation | null,
        value: Measurement,
        isBlank: boolean
    },
    "styling": {
        type: "styling",
        mode: Mode,
        loc?: SourceLocation | null,
        style: StyleStr,
        body: AnyParseNode[]
    },
    "supsub": {
        type: "supsub",
        mode: Mode,
        loc?: SourceLocation | null,
        base: AnyParseNode | null,
        sup?: AnyParseNode | null,
        sub?: AnyParseNode | null
    },
    "tag": {
        type: "tag",
        mode: Mode,
        loc?: SourceLocation | null,
        body: AnyParseNode[],
        tag: AnyParseNode[]
    },
    "text": {
        type: "text",
        mode: Mode,
        loc?: SourceLocation | null,
        body: AnyParseNode[],
        font?: string
    },
    "url": {
        type: "url",
        mode: Mode,
        loc?: SourceLocation | null,
        url: string
    },
    "verb": {
        type: "verb",
        mode: Mode,
        loc?: SourceLocation | null,
        body: string,
        star: boolean
    },
    // From symbol groups, constructed in Parser.js via `symbols` lookup.
    // (Some of these have "-token" suffix to distinguish them from existing
    // `ParseNode` types.)
    "atom": {
        type: "atom",
        family: Atom,
        mode: Mode,
        loc?: SourceLocation | null,
        text: string
    },
    "mathord": {
        type: "mathord",
        mode: Mode,
        loc?: SourceLocation | null,
        text: string
    },
    "spacing": {
        type: "spacing",
        mode: Mode,
        loc?: SourceLocation | null,
        text: string
    },
    "textord": {
        type: "textord",
        mode: Mode,
        loc?: SourceLocation | null,
        text: string
    },
    // These "-token" types don't have corresponding HTML/MathML builders.
    "accent-token": {
        type: "accent-token",
        mode: Mode,
        loc?: SourceLocation | null,
        text: string
    },
    "op-token": {
        type: "op-token",
        mode: Mode,
        loc?: SourceLocation | null,
        text: string
    },
    // From functions.js and functions/*.js. See also "color", "op", "styling",
    // and "text" above.
    "accent": {
        type: "accent",
        mode: Mode,
        loc?: SourceLocation | null,
        label: string,
        isStretchy?: boolean,
        isShifty?: boolean,
        base: AnyParseNode
    },
    "accentUnder": {
        type: "accentUnder",
        mode: Mode,
        loc?: SourceLocation | null,
        label: string,
        isStretchy?: boolean,
        isShifty?: boolean,
        base: AnyParseNode
    },
    "cr": {
        type: "cr",
        mode: Mode,
        loc?: SourceLocation | null,
        newRow: boolean,
        newLine: boolean,
        size: Measurement | null
    },
    "delimsizing": {
        type: "delimsizing",
        mode: Mode,
        loc?: SourceLocation | null,
        size: 1 | 2 | 3 | 4,
        mclass: "mopen" | "mclose" | "mrel" | "mord",
        delim: string
    },
    "enclose": {
        type: "enclose",
        mode: Mode,
        loc?: SourceLocation | null,
        label: string,
        backgroundColor?: string,
        borderColor?: string,
        body: AnyParseNode
    },
    "environment": {
        type: "environment",
        mode: Mode,
        loc?: SourceLocation | null,
        name: string,
        nameGroup: AnyParseNode
    },
    "font": {
        type: "font",
        mode: Mode,
        loc?: SourceLocation | null,
        font: string,
        body: AnyParseNode
    },
    "genfrac": {
        type: "genfrac",
        mode: Mode,
        loc?: SourceLocation | null,
        continued: boolean,
        numer: AnyParseNode,
        denom: AnyParseNode,
        hasBarLine: boolean,
        leftDelim: string | null,
        rightDelim: string | null,
        size: StyleStr | "auto",
        barSize: Measurement | null
    },
    "horizBrace": {
        type: "horizBrace",
        mode: Mode,
        loc?: SourceLocation | null,
        label: string,
        isOver: boolean,
        base: AnyParseNode
    },
    "href": {
        type: "href",
        mode: Mode,
        loc?: SourceLocation | null,
        href: string,
        body: AnyParseNode[]
    },
    "html": {
        type: "html",
        mode: Mode,
        loc?: SourceLocation | null,
        attributes: {
            [K in string]: string;
        },
        body: AnyParseNode[]
    },
    "htmlmathml": {
        type: "htmlmathml",
        mode: Mode,
        loc?: SourceLocation | null,
        html: AnyParseNode[],
        mathml: AnyParseNode[]
    },
    "includegraphics": {
        type: "includegraphics",
        mode: Mode,
        loc?: SourceLocation | null,
        alt: string,
        width: Measurement,
        height: Measurement,
        totalheight: Measurement,
        src: string
    },
    "infix": {
        type: "infix",
        mode: Mode,
        loc?: SourceLocation | null,
        replaceWith: string,
        size?: Measurement,
        token: Token | null
    },
    "internal": {
        type: "internal",
        mode: Mode,
        loc?: SourceLocation | null
    },
    "kern": {
        type: "kern",
        mode: Mode,
        loc?: SourceLocation | null,
        dimension: Measurement
    },
    "lap": {
        type: "lap",
        mode: Mode,
        loc?: SourceLocation | null,
        alignment: string,
        body: AnyParseNode
    },
    "leftright": {
        type: "leftright",
        mode: Mode,
        loc?: SourceLocation | null,
        body: AnyParseNode[],
        left: string,
        right: string,
        rightColor: string | null // undefined means "inherit"
    },
    "leftright-right": {
        type: "leftright-right",
        mode: Mode,
        loc?: SourceLocation | null,
        delim: string,
        color: string | null // undefined means "inherit"
    },
    "mathchoice": {
        type: "mathchoice",
        mode: Mode,
        loc?: SourceLocation | null,
        display: AnyParseNode[],
        text: AnyParseNode[],
        script: AnyParseNode[],
        scriptscript: AnyParseNode[]
    },
    "middle": {
        type: "middle",
        mode: Mode,
        loc?: SourceLocation | null,
        delim: string
    },
    "mclass": {
        type: "mclass",
        mode: Mode,
        loc?: SourceLocation | null,
        mclass: string,
        body: AnyParseNode[],
        isCharacterBox: boolean
    },
    "operatorname": {
        type: "operatorname",
        mode: Mode,
        loc?: SourceLocation | null,
        body: AnyParseNode[],
        alwaysHandleSupSub: boolean,
        limits: boolean,
        parentIsSupSub: boolean
    },
    "overline": {
        type: "overline",
        mode: Mode,
        loc?: SourceLocation | null,
        body: AnyParseNode
    },
    "phantom": {
        type: "phantom",
        mode: Mode,
        loc?: SourceLocation | null,
        body: AnyParseNode[]
    },
    "hphantom": {
        type: "hphantom",
        mode: Mode,
        loc?: SourceLocation | null,
        body: AnyParseNode
    },
    "vphantom": {
        type: "vphantom",
        mode: Mode,
        loc?: SourceLocation | null,
        body: AnyParseNode
    },
    "raisebox": {
        type: "raisebox",
        mode: Mode,
        loc?: SourceLocation | null,
        dy: Measurement,
        body: AnyParseNode
    },
    "rule": {
        type: "rule",
        mode: Mode,
        loc?: SourceLocation | null,
        shift: Measurement | null,
        width: Measurement,
        height: Measurement
    },
    "sizing": {
        type: "sizing",
        mode: Mode,
        loc?: SourceLocation | null,
        size: number,
        body: AnyParseNode[]
    },
    "smash": {
        type: "smash",
        mode: Mode,
        loc?: SourceLocation | null,
        body: AnyParseNode,
        smashHeight: boolean,
        smashDepth: boolean
    },
    "sqrt": {
        type: "sqrt",
        mode: Mode,
        loc?: SourceLocation | null,
        body: AnyParseNode,
        index: AnyParseNode | null
    },
    "underline": {
        type: "underline",
        mode: Mode,
        loc?: SourceLocation | null,
        body: AnyParseNode
    },
    "xArrow": {
        type: "xArrow",
        mode: Mode,
        loc?: SourceLocation | null,
        label: string,
        body: AnyParseNode,
        below: AnyParseNode | null
    }
};

/**
 * Asserts that the node is of the given type and returns it with stricter
 * typing. Throws if the node's type does not match.
 */
export function assertNodeType<NODETYPE extends NodeType>(node: AnyParseNode | null, type: NODETYPE): ParseNode<NODETYPE> {
    if (!node || node.type !== type) {
        throw new Error(
            `Expected node of type ${type}, but got ` +
            (node ? `node of type ${node.type}` : String(node)));
    }
    return node;
}

/**
 * Returns the node more strictly typed iff it is of the given type. Otherwise,
 * returns null.
 */
export function assertSymbolNodeType(node: AnyParseNode | null): SymbolParseNode {
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
export function checkSymbolNodeType(node: AnyParseNode | null): SymbolParseNode | null {
    if (node && (node.type === "atom" || NON_ATOMS.hasOwnProperty(node.type))) {
        // $FlowFixMe
        return node;
    }
    return null;
}
