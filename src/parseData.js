/**
 * The resulting parse tree nodes of the parse tree.
 *
 * It is possible to provide position information, so that a ParseNode can
 * fulfil a role similar to a Token in error reporting.
 * For details on the corresponding properties see Token constructor.
 * Providing such information can lead to better error reporting.
 *
 * @param {string}  type       type of node, like e.g. "ordgroup"
 * @param {?object} value      type-specific representation of the node
 * @param {string}  mode       parse mode in action for this node,
 *                             "math" or "text"
 * @param {Token=} firstToken  first token of the input for this node,
 *                             will omit position information if unset
 * @param {Token=} lastToken   last token of the input for this node,
 *                             will default to firstToken if unset
 */
function ParseNode(type, value, mode, firstToken, lastToken) {
    this.type = type;
    this.value = value;
    this.mode = mode;
    if (firstToken && (!lastToken || lastToken.lexer === firstToken.lexer)) {
        this.lexer = firstToken.lexer;
        this.start = firstToken.start;
        this.end = (lastToken || firstToken).end;
    }
}

module.exports = {
    ParseNode: ParseNode
};

