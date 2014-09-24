// The resulting token returned from `lex`.
function Token(type, text, position) {
    this.type = type;
    this.text = text;
    this.position = position;
}

module.exports = Token;
