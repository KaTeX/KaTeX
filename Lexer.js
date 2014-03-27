var ParseError = require("./ParseError");

// The main lexer class
function Lexer(input) {
    this._input = input;
};

// The result of a single lex
function LexResult(type, text, position) {
    this.type = type;
    this.text = text;
    this.position = position;
}

// "normal" types of tokens
var mathNormals = [
    [/^[/|@."`0-9]/, "textord"],
    [/^[a-zA-Z]/, "mathord"],
    [/^[*+-]/, "bin"],
    [/^[=<>:]/, "rel"],
    [/^[,;]/, "punct"],
    [/^'/, "'"],
    [/^\^/, "^"],
    [/^_/, "_"],
    [/^{/, "{"],
    [/^}/, "}"],
    [/^[(\[]/, "open"],
    [/^[)\]?!]/, "close"],
    [/^~/, "spacing"]
];

var textNormals = [
    [/^[a-zA-Z0-9`!@*()-=+\[\]'";:?\/.,]/, "textord"],
    [/^{/, "{"],
    [/^}/, "}"],
    [/^~/, "spacing"]
];

// Build a regex to easily parse the functions
var anyFunc = /^\\(?:[a-zA-Z]+|.)/;

Lexer.prototype._innerLex = function(pos, normals, ignoreWhitespace) {
    var input = this._input.slice(pos);

    // Get rid of whitespace
    if (ignoreWhitespace) {
        var whitespace = input.match(/^\s*/)[0];
        pos += whitespace.length;
        input = input.slice(whitespace.length);
    } else {
        // Do the funky concatenation of whitespace
        var whitespace = input.match(/^( +|\\  +)/);
        if (whitespace !== null) {
            return new LexResult(" ", " ", pos + whitespace[0].length);
        }
    }

    // If there's no more input to parse, return an EOF token
    if (input.length === 0) {
        return new LexResult("EOF", null, pos);
    }

    var match;
    if ((match = input.match(anyFunc))) {
        // If we match one of the tokens, extract the type
        return new LexResult(match[0], match[0], pos + match[0].length);
    } else {
        // Otherwise, we look through the normal token regexes and see if it's
        // one of them.
        for (var i = 0; i < normals.length; i++) {
            var normal = normals[i];

            if ((match = input.match(normal[0]))) {
                // If it is, return it
                return new LexResult(
                    normal[1], match[0], pos + match[0].length);
            }
        }
    }

    // We didn't match any of the tokens, so throw an error.
    throw new ParseError("Unexpected character: '" + input[0] +
        "' at position " + pos);
}

// A regex to match a CSS color (like #ffffff or BlueViolet)
var cssColor = /^(#[a-z0-9]+|[a-z]+)/i;

Lexer.prototype._innerLexColor = function(pos) {
    var input = this._input.slice(pos);

    // Ignore whitespace
    var whitespace = input.match(/^\s*/)[0];
    pos += whitespace.length;
    input = input.slice(whitespace.length);

    var match;
    if ((match = input.match(cssColor))) {
        // If we look like a color, return a color
        return new LexResult("color", match[0], pos + match[0].length);
    }

    // We didn't match a color, so throw an error.
    throw new ParseError("Invalid color at position " + pos);
};

// Lex a single token
Lexer.prototype.lex = function(pos, mode) {
    if (mode === "math") {
        return this._innerLex(pos, mathNormals, true);
    } else if (mode === "text") {
        return this._innerLex(pos, textNormals, false);
    } else if (mode === "color") {
        return this._innerLexColor(pos);
    }
};

module.exports = Lexer;
