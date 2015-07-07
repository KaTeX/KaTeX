/**
 * The resulting parse tree nodes of the parse tree.
 */
function ParseNode(type, value, mode, firstToken, lastToken) {
    this.type = type;
    this.value = value;
    this.mode = mode;
    if (firstToken) {
        this.lexer = firstToken.lexer;
        this.start = firstToken.start;
        this.end = (lastToken || firstToken).end;
    }
}

module.exports = {
    ParseNode: ParseNode,
};

