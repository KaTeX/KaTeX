// @flow
import SourceLocation from "./SourceLocation";
import type {Mode} from "./types";

/**
 * The resulting parse tree nodes of the parse tree.
 *
 * It is possible to provide position information, so that a `ParseNode` can
 * fulfill a role similar to a `Token` in error reporting.
 * For details on the corresponding properties see `Token` constructor.
 * Providing such information can lead to better error reporting.
 */
export default class ParseNode {
    type: *;
    value: *;
    mode: Mode;
    loc: ?SourceLocation;

    constructor(
        type: string,       // type of node, like e.g. "ordgroup"
        value: mixed,       // type-specific representation of the node
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
