var Lexer = require("./Lexer");
var utils = require("./utils");
var symbols = require("./symbols");

var ParseError = require("./ParseError");

// Main Parser class
function Parser() {
};

// Returned by the Parser.parse... functions. Stores the current results and
// the new lexer position.
function ParseResult(result, newPosition) {
    this.result = result;
    this.position = newPosition;
}

// The resulting parse tree nodes of the parse tree.
function ParseNode(type, value, mode) {
    this.type = type;
    this.value = value;
    this.mode = mode;
}

// Checks a result to make sure it has the right type, and throws an
// appropriate error otherwise.
Parser.prototype.expect = function(result, type) {
    if (result.type !== type) {
        throw new ParseError(
            "Expected '" + type + "', got '" + result.type + "'",
            this.lexer, result.position
        );
    }
};

// Main parsing function, which parses an entire input. Returns either a list
// of parseNodes or null if the parse fails.
Parser.prototype.parse = function(input) {
    // Make a new lexer
    this.lexer = new Lexer(input);

    // Try to parse the input
    var parse = this.parseInput(0, "math");
    return parse.result;
};

// Parses an entire input tree
Parser.prototype.parseInput = function(pos, mode) {
    // Parse an expression
    var expression = this.parseExpression(pos, mode);
    // If we succeeded, make sure there's an EOF at the end
    var EOF = this.lexer.lex(expression.position, mode);
    this.expect(EOF, "EOF");
    return expression;
};

// Parses an "expression", which is a list of atoms
Parser.prototype.parseExpression = function(pos, mode) {
    // Start with a list of nodes
    var expression = [];
    while (true) {
        // Try to parse atoms
        var parse = this.parseAtom(pos, mode);
        if (parse) {
            // Copy them into the list
            expression.push(parse.result);
            pos = parse.position;
        } else {
            break;
        }
    }
    return new ParseResult(expression, pos);
};

// Parses a superscript expression, like "^3"
Parser.prototype.parseSuperscript = function(pos, mode) {
    if (mode !== "math") {
        throw new ParseError(
            "Trying to parse superscript in non-math mode", this.lexer, pos);
    }

    // Try to parse a "^" character
    var sup = this.lexer.lex(pos, mode);
    if (sup.type === "^") {
        // If we got one, parse the corresponding group
        var group = this.parseGroup(sup.position, mode);
        if (group) {
            return group;
        } else {
            // Throw an error if we didn't find a group
            throw new ParseError(
                "Couldn't find group after '^'", this.lexer, sup.position);
        }
    } else if (sup.type === "'") {
        var pos = sup.position;
        return new ParseResult(
            new ParseNode("textord", "\\prime", mode), sup.position, mode);
    } else {
        return null;
    }
};

// Parses a subscript expression, like "_3"
Parser.prototype.parseSubscript = function(pos, mode) {
    if (mode !== "math") {
        throw new ParseError(
            "Trying to parse subscript in non-math mode", this.lexer, pos);
    }

    // Try to parse a "_" character
    var sub = this.lexer.lex(pos, mode);
    if (sub.type === "_") {
        // If we got one, parse the corresponding group
        var group = this.parseGroup(sub.position, mode);
        if (group) {
            return group;
        } else {
            // Throw an error if we didn't find a group
            throw new ParseError(
                "Couldn't find group after '_'", this.lexer, sub.position);
        }
    } else {
        return null;
    }
};

// Parses an atom, which consists of a nucleus, and an optional superscript and
// subscript
Parser.prototype.parseAtom = function(pos, mode) {
    // Parse the nucleus
    var nucleus = this.parseGroup(pos, mode);
    var nextPos = pos;
    var nucleusNode;

    // Text mode doesn't have superscripts or subscripts, so we only parse the
    // nucleus in this case
    if (mode === "text") {
        return nucleus;
    }

    if (nucleus) {
        nextPos = nucleus.position;
        nucleusNode = nucleus.result;
    }

    var sup;
    var sub;

    // Now, we try to parse a subscript or a superscript (or both!), and
    // depending on whether those succeed, we return the correct type.
    while (true) {
        var node;
        if ((node = this.parseSuperscript(nextPos, mode))) {
            if (sup) {
                throw new ParseError(
                    "Double superscript", this.lexer, nextPos);
            }
            nextPos = node.position;
            sup = node.result;
            continue;
        }
        if ((node = this.parseSubscript(nextPos, mode))) {
            if (sub) {
                throw new ParseError(
                    "Double subscript", this.lexer, nextPos);
            }
            nextPos = node.position;
            sub = node.result;
            continue;
        }
        break;
    }

    if (sup || sub) {
        return new ParseResult(
            new ParseNode("supsub", {base: nucleusNode, sup: sup,
                    sub: sub}, mode),
            nextPos);
    } else {
        return nucleus;
    }
}

// Parses a group, which is either a single nucleus (like "x") or an expression
// in braces (like "{x+y}")
Parser.prototype.parseGroup = function(pos, mode) {
    var start = this.lexer.lex(pos, mode);
    // Try to parse an open brace
    if (start.type === "{") {
        // If we get a brace, parse an expression
        var expression = this.parseExpression(start.position, mode);
        // Make sure we get a close brace
        var closeBrace = this.lexer.lex(expression.position, mode);
        this.expect(closeBrace, "}");
        return new ParseResult(
            new ParseNode("ordgroup", expression.result, mode),
            closeBrace.position);
    } else {
        // Otherwise, just return a nucleus
        return this.parseNucleus(pos, mode);
    }
};

// Parses an implicit group, which is a group that starts where you want it, and
// ends right before a higher explicit group ends, or at EOL. It is used for
// functions that appear to affect the current style, like \Large or \textrm,
// where instead of keeping a style we just pretend that there is an implicit
// grouping after it until the end of the group.
Parser.prototype.parseImplicitGroup = function(pos, mode) {
    // Since parseExpression already ends where we want it to, we just need to
    // call that and it does what we want.
    var expression = this.parseExpression(pos, mode);
    return new ParseResult(
        new ParseNode("ordgroup", expression.result, mode),
        expression.position);
};

// Parses a custom color group, which looks like "{#ffffff}"
Parser.prototype.parseColorGroup = function(pos, mode) {
    var start = this.lexer.lex(pos, mode);
    // Try to parse an open brace
    if (start.type === "{") {
        // Parse the color
        var color = this.lexer.lex(start.position, "color");
        // Make sure we get a close brace
        var closeBrace = this.lexer.lex(color.position, mode);
        this.expect(closeBrace, "}");
        return new ParseResult(
            new ParseNode("color", color.text),
            closeBrace.position);
    } else {
        // It has to have an open brace, so if it doesn't we throw
        throw new ParseError(
            "There must be braces around colors",
            this.lexer, pos
        );
    }
};

// Parses a text group, which looks like "{#ffffff}"
Parser.prototype.parseTextGroup = function(pos, mode) {
    var start = this.lexer.lex(pos, mode);
    // Try to parse an open brace
    if (start.type === "{") {
        // Parse the text
        var text = this.parseExpression(start.position, "text");
        // Make sure we get a close brace
        var closeBrace = this.lexer.lex(text.position, mode);
        this.expect(closeBrace, "}");
        return new ParseResult(
            new ParseNode("ordgroup", text.result, "text"),
            closeBrace.position);
    } else {
        // It has to have an open brace, so if it doesn't we throw
        throw new ParseError(
            "There must be braces around text",
            this.lexer, pos
        );
    }
};

// A list of 1-argument color functions
var colorFuncs = [
    "\\blue", "\\orange", "\\pink", "\\red", "\\green", "\\gray", "\\purple"
];

// A list of 1-argument sizing functions
var sizeFuncs = [
    "\\tiny", "\\scriptsize", "\\footnotesize", "\\small", "\\normalsize",
    "\\large", "\\Large", "\\LARGE", "\\huge", "\\Huge"
];

// A list of math functions replaced by their names
var namedFns = [
    "\\arcsin", "\\arccos", "\\arctan", "\\arg", "\\cos", "\\cosh",
    "\\cot", "\\coth", "\\csc", "\\deg", "\\dim", "\\exp", "\\hom",
    "\\ker", "\\lg", "\\ln", "\\log", "\\sec", "\\sin", "\\sinh",
    "\\tan","\\tanh"
];

// Parses a "nucleus", which is either a single token from the tokenizer or a
// function and its arguments
Parser.prototype.parseNucleus = function(pos, mode) {
    var nucleus = this.lexer.lex(pos, mode);

    if (utils.contains(colorFuncs, nucleus.type)) {
        // If this is a color function, parse its argument and return
        var group = this.parseGroup(nucleus.position, mode);
        if (group) {
            var atoms;
            if (group.result.type === "ordgroup") {
                atoms = group.result.value;
            } else {
                atoms = [group.result];
            }
            return new ParseResult(
                new ParseNode("color",
                    {color: "katex-" + nucleus.type.slice(1), value: atoms},
                    mode),
                group.position);
        } else {
            throw new ParseError(
                "Expected group after '" + nucleus.text + "'",
                this.lexer, nucleus.position
            );
        }
    } else if (nucleus.type === "\\color") {
        // If this is a custom color function, parse its first argument as a
        // custom color and its second argument normally
        var color = this.parseColorGroup(nucleus.position, mode);
        if (color) {
            var inner = this.parseGroup(color.position, mode);
            if (inner) {
                var atoms;
                if (inner.result.type === "ordgroup") {
                    atoms = inner.result.value;
                } else {
                    atoms = [inner.result];
                }
                return new ParseResult(
                    new ParseNode("color",
                        {color: color.result.value, value: atoms},
                        mode),
                    inner.position);
            } else {
                throw new ParseError(
                    "Expected second group after '" + nucleus.text + "'",
                    this.lexer, color.position
                );
            }
        } else {
            throw new ParseError(
                "Expected color after '" + nucleus.text + "'",
                    this.lexer, nucleus.position
                );
        }
    } else if (mode === "math" && utils.contains(sizeFuncs, nucleus.type)) {
        // If this is a size function, parse its argument and return
        var group = this.parseImplicitGroup(nucleus.position, mode);
        return new ParseResult(
            new ParseNode("sizing", {
                size: "size" + (utils.indexOf(sizeFuncs, nucleus.type) + 1),
                value: group.result
            }, mode),
            group.position);
    } else if (mode === "math" && utils.contains(namedFns, nucleus.type)) {
        // If this is a named function, just return it plain
        return new ParseResult(
            new ParseNode("namedfn", nucleus.text, mode),
            nucleus.position);
    } else if (nucleus.type === "\\llap" || nucleus.type === "\\rlap") {
        // If this is an llap or rlap, parse its argument and return
        var group = this.parseGroup(nucleus.position, mode);
        if (group) {
            return new ParseResult(
                new ParseNode(nucleus.type.slice(1), group.result, mode),
                group.position);
        } else {
            throw new ParseError(
                "Expected group after '" + nucleus.text + "'",
                this.lexer, nucleus.position
            );
        }
    } else if (mode === "math" && nucleus.type === "\\text") {
        var group = this.parseTextGroup(nucleus.position, mode);
        if (group) {
            return new ParseResult(
                new ParseNode(nucleus.type.slice(1), group.result, mode),
                group.position);
        } else {
            throw new ParseError(
                "Expected group after '" + nucleus.text + "'",
                this.lexer, nucleus.position
            );
        }
    } else if (mode === "math" && (nucleus.type === "\\dfrac" ||
                                   nucleus.type === "\\frac" ||
                                   nucleus.type === "\\tfrac")) {
        // If this is a frac, parse its two arguments and return
        var numer = this.parseGroup(nucleus.position, mode);
        if (numer) {
            var denom = this.parseGroup(numer.position, mode);
            if (denom) {
                return new ParseResult(
                    new ParseNode("frac", {
                        numer: numer.result,
                        denom: denom.result,
                        size: nucleus.type.slice(1)
                    }, mode),
                    denom.position);
            } else {
                throw new ParseError("Expected denominator after '" +
                    nucleus.type + "'",
                    this.lexer, numer.position
                );
            }
        } else {
            throw new ParseError("Expected numerator after '" +
                nucleus.type + "'",
                this.lexer, nucleus.position
            );
        }
    } else if (mode === "math" && nucleus.type === "\\KaTeX") {
        // If this is a KaTeX node, return the special katex result
        return new ParseResult(
            new ParseNode("katex", null, mode),
            nucleus.position
        );
    } else if (symbols[mode][nucleus.text]) {
        // Otherwise if this is a no-argument function, find the type it
        // corresponds to in the symbols map
        return new ParseResult(
            new ParseNode(symbols[mode][nucleus.text].group, nucleus.text, mode),
            nucleus.position);
    } else {
        // Otherwise, we couldn't parse it
        return null;
    }
};

module.exports = Parser;
