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
var normals = [
    [/^[/|@."`0-9]/, 'textord'],
    [/^[a-zA-Z]/, 'mathord'],
    [/^[*+-]/, 'bin'],
    [/^[=<>]/, 'rel'],
    [/^[,;]/, 'punct'],
    [/^\^/, '^'],
    [/^_/, '_'],
    [/^{/, '{'],
    [/^}/, '}'],
    [/^[(\[]/, 'open'],
    [/^[)\]?!]/, 'close']
];

// Different functions
var funcs = [
    // Bin symbols
    'cdot', 'pm', 'div',
    // Rel symbols
    'leq', 'geq', 'neq', 'nleq', 'ngeq',
    // Open/close symbols
    'lvert', 'rvert',
    // Punct symbols
    'colon',
    // Spacing symbols
    'qquad', 'quad', ' ', 'space', ',', ':', ';',
    // Colors
    'blue', 'orange', 'pink', 'red', 'green', 'gray', 'purple',
    // Mathy functions
    "arcsin", "arccos", "arctan", "arg", "cos", "cosh", "cot", "coth", "csc",
    "deg", "dim", "exp", "hom", "ker", "lg", "ln", "log", "sec", "sin", "sinh",
    "tan", "tanh",
    // Other functions
    'dfrac', 'llap', 'rlap'
];
// Build a regex to easily parse the functions
var anyFunc = new RegExp("^\\\\(" + funcs.join("|") + ")(?![a-zA-Z])");

// Lex a single token
Lexer.prototype.lex = function(pos) {
    var input = this._input.slice(pos);

    // Get rid of whitespace
    var whitespace = input.match(/^\s*/)[0];
    pos += whitespace.length;
    input = input.slice(whitespace.length);

    // If there's no more input to parse, return an EOF token
    if (input.length === 0) {
        return new LexResult('EOF', null, pos);
    }

    var match;
    if ((match = input.match(anyFunc))) {
        // If we match one of the tokens, extract the type
        return new LexResult(match[1], match[0], pos + match[0].length);
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
    throw "Unexpected character: '" + input[0] + "' at position " + this._pos;
};

module.exports = Lexer;
