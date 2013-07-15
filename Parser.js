var Lexer = require("./Lexer");
var utils = require("./utils");

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
function ParseNode(type, value) {
    this.type = type;
    this.value = value;
}

// Checks a result to make sure it has the right type, and throws an
// appropriate error otherwise.
var expect = function(result, type) {
    if (result.type !== type) {
        throw "Failed parsing: Expected '" + type + "', got '" + result.type + "'";
    }
};

// Main parsing function, which parses an entire input. Returns either a list
// of parseNodes or null if the parse fails.
Parser.prototype.parse = function(input) {
    // Make a new lexer
    this.lexer = new Lexer(input);

    // Try to parse the input
    var parse = this.parseInput(0);
    return parse.result;
};

// Parses an entire input tree
Parser.prototype.parseInput = function(pos) {
    // Parse an expression
    var expression = this.parseExpression(pos);
    // If we succeeded, make sure there's an EOF at the end
    var EOF = this.lexer.lex(expression.position);
    expect(EOF, 'EOF');
    return expression;
};

// Parses an "expression", which is a list of atoms
Parser.prototype.parseExpression = function(pos) {
    // Start with a list of nodes
    var expression = [];
    while (true) {
        // Try to parse atoms
        var parse = this.parseAtom(pos);
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
Parser.prototype.parseSuperscript = function(pos) {
    // Try to parse a "^" character
    var sup = this.lexer.lex(pos);
    if (sup.type === "^") {
        // If we got one, parse the corresponding group
        var group = this.parseGroup(sup.position);
        if (group) {
            return group;
        } else {
            // Throw an error if we didn't find a group
            throw "Parse error: Couldn't find group after '^'";
        }
    } else {
        return null;
    }
};

// Parses a subscript expression, like "_3"
Parser.prototype.parseSubscript = function(pos) {
    // Try to parse a "_" character
    var sub = this.lexer.lex(pos);
    if (sub.type === "_") {
        // If we got one, parse the corresponding group
        var group = this.parseGroup(sub.position);
        if (group) {
            return group;
        } else {
            // Throw an error if we didn't find a group
            throw "Parse error: Couldn't find group after '_'";
        }
    } else {
        return null;
    }
};

// Parses an atom, which consists of a nucleus, and an optional superscript and
// subscript
Parser.prototype.parseAtom = function(pos) {
    // Parse the nucleus
    var nucleus = this.parseGroup(pos);
    if (nucleus) {
        // Now, we try to parse a subscript or a superscript. If one of those
        // succeeds, we then try to parse the opposite one, and depending on
        // whether that succeeds, we return the correct type.
        var sup, sub;
        if (sup = this.parseSuperscript(nucleus.position)) {
            if (sub = this.parseSubscript(sup.position)) {
                return new ParseResult(
                    new ParseNode("supsub",
                        {base: nucleus.result, sup: sup.result,
                            sub: sub.result}),
                    sub.position);
            } else {
                return new ParseResult(
                    new ParseNode("sup",
                        {base: nucleus.result, sup: sup.result}),
                    sup.position);
            }
        } else if (sub = this.parseSubscript(nucleus.position)) {
            if (sup = this.parseSuperscript(sub.position)) {
                return new ParseResult(
                    new ParseNode("supsub",
                        {base: nucleus.result, sup: sup.result,
                            sub: sub.result}),
                    sup.position);
            } else {
                return new ParseResult(
                    new ParseNode("sub",
                        {base: nucleus.result, sub: sub.result}),
                    sub.position);
            }
        } else {
            return nucleus;
        }
    } else {
        return null;
    }
}

// Parses a group, which is either a single nucleus (like "x") or an expression
// in braces (like "{x+y}")
Parser.prototype.parseGroup = function(pos) {
    var start = this.lexer.lex(pos);
    // Try to parse an open brace
    if (start.type === "{") {
        // If we get a brace, parse an expression
        var expression = this.parseExpression(start.position);
        // Make sure we get a close brace
        var closeBrace = this.lexer.lex(expression.position);
        expect(closeBrace, "}");
        return new ParseResult(
            new ParseNode("ordgroup", expression.result),
            closeBrace.position);
    } else {
        // Otherwise, just return a nucleus
        return this.parseNucleus(pos);
    }
};


// A list of 1-argument color functions
var colorFuncs = [
    "\\blue", "\\orange", "\\pink", "\\red", "\\green", "\\gray", "\\purple"
];

// A map of elements that don't have arguments, and should simply be placed
// into a group depending on their type. The keys are the groups that items can
// be placed in, and the values are lists of element types that should be
// placed in those groups.
//
// For example, if the lexer returns something of type "colon", we should
// return a node of type "punct"
var copyFuncs = {
    "textord": ["textord"],
    "mathord": ["mathord"],
    "bin": ["bin", "\\pm", "\\div", "\\cdot"],
    "open": ["open", "\\lvert"],
    "close": ["close", "\\rvert"],
    "rel": ["rel", "\\leq", "\\geq", "\\neq", "\\nleq", "\\ngeq"],
    "spacing": ["\\qquad", "\\quad", "\\space", "\\ ", "\\,", "\\:", "\\;"],
    "punct": ["punct", "\\colon"],
    "namedfn": ["\\arcsin", "\\arccos", "\\arctan", "\\arg", "\\cos", "\\cosh",
        "\\cot", "\\coth", "\\csc", "\\deg", "\\dim", "\\exp", "\\hom",
        "\\ker", "\\lg", "\\ln", "\\log", "\\sec", "\\sin", "\\sinh", "\\tan",
        "\\tanh"]
};

// Build a list of all of the different functions in the copyFuncs list, to
// quickly check if the function should be interpreted by the map.
var funcToType = {};
for (var type in copyFuncs) {
    for (var i = 0; i < copyFuncs[type].length; i++) {
        var func = copyFuncs[type][i];
        funcToType[func] = type;
    }
}

// Parses a "nucleus", which is either a single token from the tokenizer or a
// function and its arguments
Parser.prototype.parseNucleus = function(pos) {
    var nucleus = this.lexer.lex(pos);

    if (utils.contains(colorFuncs, nucleus.type)) {
        // If this is a color function, parse its argument and return
        var group = this.parseGroup(nucleus.position);
        if (group) {
            var atoms;
            if (group.result.type === "ordgroup") {
                atoms = group.result.value;
            } else {
                atoms = [group.result];
            }
            return new ParseResult(
                new ParseNode("color",
                    {color: nucleus.type.slice(1), value: atoms}),
                group.position);
        } else {
            throw "Parse error: Expected group after '" + nucleus.text + "'";
        }
    } else if (nucleus.type === "\\llap" || nucleus.type === "\\rlap") {
        // If this is an llap or rlap, parse its argument and return
        var group = this.parseGroup(nucleus.position);
        if (group) {
            return new ParseResult(
                new ParseNode(nucleus.type.slice(1), nucleus.text),
                group.position);
        } else {
            throw "Parse error: Expected group after '" + nucleus.text + "'";
        }
    } else if (nucleus.type === "\\dfrac" || nucleus.type === "\\frac" ||
            nucleus.type === "\\tfrac") {
        // If this is a frac, parse its two arguments and return
        var numer = this.parseGroup(nucleus.position);
        if (numer) {
            var denom = this.parseGroup(numer.position);
            if (denom) {
                return new ParseResult(
                    new ParseNode("frac", {
                        numer: numer.result,
                        denom: denom.result,
                        size: nucleus.type.slice(1)
                    }),
                    denom.position);
            } else {
                throw "Parse error: Expected denominator after '" +
                        nucleus.type + "'";
            }
        } else {
            throw "Parse error: Expected numerator after '" + nucleus.type +
                    "'";
        }
    } else if (funcToType[nucleus.type]) {
        // Otherwise if this is a no-argument function, find the type it
        // corresponds to in the map and return
        return new ParseResult(
            new ParseNode(funcToType[nucleus.type], nucleus.text),
            nucleus.position);
    } else {
        // Otherwise, we couldn't parse it
        return null;
    }
};

module.exports = Parser;
