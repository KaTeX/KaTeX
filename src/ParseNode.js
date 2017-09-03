// @flow
import {LexerInterface, Token} from "./Token";

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
    mode: *;
    lexer: LexerInterface|void;
    start: number|void;
    end: number|void;

    constructor(
        type: string,       // type of node, like e.g. "ordgroup"
        value: mixed,       // type-specific representation of the node
        mode: string,       // parse mode in action for this node, "math" or "text"
        firstToken?: Token, // first token of the input for this node,
                            // will omit position information if unset
        lastToken?: Token,  // last token of the input for this node,
                            // will default to firstToken if unset
    ) {
        this.type = type;
        this.value = value;
        this.mode = mode;
        if (firstToken && (!lastToken || lastToken.lexer === firstToken.lexer)) {
            this.lexer = firstToken.lexer;
            this.start = firstToken.start;
            this.end = (lastToken || firstToken).end;
        }
    }
}
