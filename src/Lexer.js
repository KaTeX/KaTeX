/**
 * The Lexer class handles tokenizing the input in various ways. Since our
 * parser expects us to be able to backtrack, the lexer allows lexing from any
 * given starting point.
 *
 * Its main exposed function is the `lex` function, which takes a position to
 * lex from and a type of token to lex. It defers to the appropriate `_innerLex`
 * function.
 *
 * The various `_innerLex` functions perform the actual lexing of different
 * kinds.
 */

var Token = require("./Token");
var extensions = require("./extensions");
var ParseError = require("./ParseError");

// The main lexer class
function Lexer(input) {
    this._input = input;
}

// "normal" types of tokens. These are tokens which can be matched by a simple
// regex, and have a type which is listed.
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

// These are "normal" tokens like above, but should instead be parsed in text
// mode.
var textNormals = [
    [/^[a-zA-Z0-9`!@*()-=+\[\]'";:?\/.,]/, "textord"],
    [/^{/, "{"],
    [/^}/, "}"],
    [/^~/, "spacing"]
];

// Regexes for matching whitespace
var whitespaceRegex = /^\s*/;
var whitespaceConcatRegex = /^( +|\\  +)/;

// This regex matches any other TeX function, which is a backslash followed by a
// word or a single symbol
var anyFunc = /^\\(?:[a-zA-Z]+|.)/;

/**
 * This function lexes a single normal token. It takes a position, a list of
 * "normal" tokens to try, and whether it should completely ignore whitespace or
 * not.
 */
Lexer.prototype._innerLex = function(pos, normals, ignoreWhitespace) {
    var input = this._input.slice(pos);

    if (ignoreWhitespace) {
        // Get rid of whitespace.
        var whitespace = input.match(whitespaceRegex)[0];
        pos += whitespace.length;
        input = input.slice(whitespace.length);
    } else {
        // Do the funky concatenation of whitespace that happens in text mode.
        var whitespace = input.match(whitespaceConcatRegex);
        if (whitespace !== null) {
            return new Token(" ", " ", pos + whitespace[0].length);
        }
    }

    // If there's no more input to parse, return an EOF token
    if (input.length === 0) {
        return new Token("EOF", null, pos);
    }

    var match;
    if ((match = input.match(anyFunc))) {
        // If we match a function token, return it
        return new Token(match[0], match[0], pos + match[0].length);
    } else {
        // Otherwise, we look through the normal token regexes and see if it's
        // one of them.
        for (var i = 0; i < normals.length; i++) {
            var normal = normals[i];

            if ((match = input.match(normal[0]))) {
                // If it is, return it
                return new Token(
                    normal[1], match[0], pos + match[0].length);
            }
        }
    }

    throw new ParseError("Unexpected character: '" + input[0] +
        "'", this, pos);
};

// A regex to match a CSS color (like #ffffff or BlueViolet)
var cssColor = /^(#[a-z0-9]+|[a-z]+)/i;

/**
 * This function lexes a CSS color.
 */
Lexer.prototype._innerLexColor = function(pos) {
    var input = this._input.slice(pos);

    // Ignore whitespace
    var whitespace = input.match(whitespaceRegex)[0];
    pos += whitespace.length;
    input = input.slice(whitespace.length);

    var match;
    if ((match = input.match(cssColor))) {
        // If we look like a color, return a color
        return new Token("color", match[0], pos + match[0].length);
    } else {
        throw new ParseError("Invalid color", this, pos);
    }
};

// A regex to match a dimension. Dimensions look like
// "1.2em" or ".4pt" or "1 ex"
var sizeRegex = /^(\d+(?:\.\d*)?|\.\d+)\s*([a-z]{2})/;

/**
 * This function lexes a dimension.
 */
Lexer.prototype._innerLexSize = function(pos) {
    var input = this._input.slice(pos);

    // Ignore whitespace
    var whitespace = input.match(whitespaceRegex)[0];
    pos += whitespace.length;
    input = input.slice(whitespace.length);

    var match;
    if ((match = input.match(sizeRegex))) {
        var unit = match[2];
        // We only currently handle "em" and "ex" units
        if (unit !== "em" && unit !== "ex") {
            throw new ParseError("Invalid unit: '" + unit + "'", this, pos);
        }
        return new Token("size", {
                number: +match[1],
                unit: unit
            }, pos + match[0].length);
    }

    throw new ParseError("Invalid size", this, pos);
};

/**
 * This function lexes a string of whitespace.
 */
Lexer.prototype._innerLexWhitespace = function(pos) {
    var input = this._input.slice(pos);

    var whitespace = input.match(whitespaceRegex)[0];
    pos += whitespace.length;

    return new Token("whitespace", whitespace, pos);
};

Lexer.prototype._innerLexMath = function(pos) {
    return this._innerLex(pos, mathNormals, true);
};

Lexer.prototype._innerLexText = function(pos) {
    return this._innerLex(pos, textNormals, false);
};

var innerLexers = {
    math: Lexer.prototype._innerLexMath,
    text: Lexer.prototype._innerLexText,
    color: Lexer.prototype._innerLexColor,
    size: Lexer.prototype._innerLexSize,
    whitespace: Lexer.prototype._innerLexWhitespace
};

/**
 * This function lexes a single token starting at `pos` and of the given mode.
 * Based on the mode, we defer to one of the `_innerLex` functions.
 */
Lexer.prototype.lex = function(pos, mode) {
    if (mode instanceof Function) {
        return mode.call(this, pos);
    }

    if (innerLexers.hasOwnProperty(mode)) {
        return innerLexers[mode].call(this, pos, mode);
    }

    for (var i = 0; i < extensions.exts.length; i++) {
        var ext = extensions.exts[i];
        if (ext.mode === mode && ext.lexer) {
            return ext.lexer.call(this, pos);
        }
    }

    throw new ParseError("The '" + mode + "' is not supported yet",
        this, pos);
};

module.exports = Lexer;
