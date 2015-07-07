/**
 * This file contains the “gullet” where macros are expanded
 * until only non-macro tokens remain.
 */

var Lexer = require("./Lexer");

function MacroExpander(input, macros) {
    this.lexer = new Lexer(input);
    this.macros = macros || {};
    this.stack = []; // contains tokens in REVERSE order
    this.discardedWhiteSpace = [];
}

MacroExpander.prototype.nextToken = function() {
    for (;;) {
        if (this.stack.length === 0) {
            this.stack.push(this.lexer.lex());
        }
        var top = this.stack.pop();
        var name = top.text;
        if (!(name.charAt(0) === "\\" && this.macros.hasOwnProperty(name))) {
            return top;
        }
        var expansion = this.macros[name];
        if (typeof expansion === "string") {
            var bodyLexer = new Lexer(expansion);
            expansion = [];
            var tok = bodyLexer.lex();
            while (tok.text !== "EOF") {
                expansion.push(tok);
                tok = bodyLexer.lex();
            }
            expansion.reverse();
            this.macros[name] = expansion;
        }
        this.stack = this.stack.concat(expansion);
    }
};

MacroExpander.prototype.get = function(ignoreSpace) {
    this.discardedWhiteSpace = [];
    var token = this.nextToken();
    if (ignoreSpace) {
        while (token.text === " ") {
            this.discardedWhiteSpace.push(token);
            token = this.nextToken();
        }
    }
    return token;
};

MacroExpander.prototype.unget = function(token) {
    this.stack.push(token);
    while (this.discardedWhiteSpace.length !== 0) {
        this.stack.push(this.discardedWhiteSpace.pop());
    }
};

module.exports = MacroExpander;
