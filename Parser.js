var functions = require("./functions");
var Lexer = require("./Lexer");
var symbols = require("./symbols");
var utils = require("./utils");

var ParseError = require("./ParseError");

// This file contains the parser used to parse out a TeX expression from the
// input. Since TeX isn't context-free, standard parsers don't work particularly
// well.

// The strategy of this parser is as such:
//
// The main functions (the `.parse...` ones) take a position in the current
// parse string to parse tokens from. The lexer (found in Lexer.js, stored at
// this.lexer) also supports pulling out tokens at arbitrary places. When
// individual tokens are needed at a position, the lexer is called to pull out a
// token, which is then used.
//
// The main functions also take a mode that the parser is currently in
// (currently "math" or "text"), which denotes whether the current environment
// is a math-y one or a text-y one (e.g. inside \text). Currently, this serves
// to limit the functions which can be used in text mode.
//
// The main functions then return an object which contains the useful data that
// was parsed at its given point, and a new position at the end of the parsed
// data. The main functions can call each other and continue the parsing by
// using the returned position as a new starting point.
//
// There are also extra `.handle...` functions, which pull out some reused
// functionality into self-contained functions.
//
// The earlier functions return `ParseResult`s, which contain a ParseNode and a
// new position.
//
// The later functions (which are called deeper in the parse) sometimes return
// ParseFuncOrArgument, which contain a ParseResult as well as some data about
// whether the parsed object is a function which is missing some arguments, or a
// standalone object which can be used as an argument to another function.

// Main Parser class
function Parser(input) {
    // Make a new lexer
    this.lexer = new Lexer(input);
};

// The resulting parse tree nodes of the parse tree.
function ParseNode(type, value, mode) {
    this.type = type;
    this.value = value;
    this.mode = mode;
}

// A result and final position returned by the `.parse...` functions.
function ParseResult(result, newPosition) {
    this.result = result;
    this.position = newPosition;
}

// An initial function (without its arguments), or an argument to a function.
// The `result` argument should be a ParseResult.
function ParseFuncOrArgument(result, isFunction, allowedInText, numArgs, argTypes) {
    this.result = result;
    // Is this a function (i.e. is it something defined in functions.js)?
    this.isFunction = isFunction;
    // Is it allowed in text mode?
    this.allowedInText = allowedInText;
    // How many arguments?
    this.numArgs = numArgs;
    // What types of arguments?
    this.argTypes = argTypes;
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

// Handles a body of an expression
Parser.prototype.handleExpressionBody = function(pos, mode) {
    var body = [];
    var atom;
    // Keep adding atoms to the body until we can't parse any more atoms (either
    // we reached the end, a }, or a \right)
    while ((atom = this.parseAtom(pos, mode))) {
        body.push(atom.result);
        pos = atom.position;
    }
    return {
        body: body,
        position: pos
    };
};

// Parses an "expression", which is a list of atoms
//
// Returns ParseResult
Parser.prototype.parseExpression = function(pos, mode) {
    var body = this.handleExpressionBody(pos, mode);
    return new ParseResult(body.body, body.position);
};

// The greediness of a superscript or subscript
var SUPSUB_GREEDINESS = 1;

// Handle a subscript or superscript with nice errors
Parser.prototype.handleSupSubscript = function(pos, mode, symbol, name) {
    var group = this.parseGroup(pos, mode);

    if (!group) {
        throw new ParseError(
            "Expected group after '" + symbol + "'", this.lexer, pos);
    } else if (group.numArgs > 0) {
        // ^ and _ have a greediness, so handle interactions with functions'
        // greediness
        var funcGreediness = functions.getGreediness(group.result.result);
        if (funcGreediness > SUPSUB_GREEDINESS) {
            return this.parseFunction(pos, mode);
        } else {
            throw new ParseError(
                "Got function '" + group.result.result + "' with no arguments " +
                    "as " + name,
                this.lexer, pos);
        }
    } else {
        return group.result;
    }
};

// Parses a group with optional super/subscripts
//
// Returns ParseResult or null
Parser.prototype.parseAtom = function(pos, mode) {
    // The body of an atom is an implicit group, so that things like
    // \left(x\right)^2 work correctly.
    var base = this.parseImplicitGroup(pos, mode);

    // In text mode, we don't have superscripts or subscripts
    if (mode === "text") {
        return base;
    }

    // Handle an empty base
    var currPos;
    if (!base) {
        currPos = pos;
        base = undefined;
    } else {
        currPos = base.position;
    }

    var superscript;
    var subscript;
    while (true) {
        // Lex the first token
        var lex = this.lexer.lex(currPos, mode);

        var group;
        if (lex.type === "^") {
            // We got a superscript start
            if (superscript) {
                throw new ParseError(
                    "Double superscript", this.lexer, currPos);
            }
            var result = this.handleSupSubscript(
                lex.position, mode, lex.type, "superscript");
            currPos = result.position;
            superscript = result.result;
        } else if (lex.type === "_") {
            // We got a subscript start
            if (subscript) {
                throw new ParseError(
                    "Double subscript", this.lexer, currPos);
            }
            var result = this.handleSupSubscript(
                lex.position, mode, lex.type, "subscript");
            currPos = result.position;
            subscript = result.result;
        } else if (lex.type === "'") {
            // We got a prime
            var prime = new ParseNode("textord", "\\prime", mode);

            // Many primes can be grouped together, so we handle this here
            var primes = [prime];
            currPos = lex.position;
            // Keep lexing tokens until we get something that's not a prime
            while ((lex = this.lexer.lex(currPos, mode)).type === "'") {
                // For each one, add another prime to the list
                primes.push(prime);
                currPos = lex.position;
            }
            // Put them into an ordgroup as the superscript
            superscript = new ParseNode("ordgroup", primes, mode);
        } else {
            // If it wasn't ^, _, or ', stop parsing super/subscripts
            break;
        }
    }

    if (superscript || subscript) {
        // If we got either a superscript or subscript, create a supsub
        return new ParseResult(
            new ParseNode("supsub", {
                base: base && base.result,
                sup: superscript,
                sub: subscript
            }, mode),
            currPos);
    } else {
        // Otherwise return the original body
        return base;
    }
};

// A list of the size-changing functions, for use in parseImplicitGroup
var sizeFuncs = [
    "\\tiny", "\\scriptsize", "\\footnotesize", "\\small", "\\normalsize",
    "\\large", "\\Large", "\\LARGE", "\\huge", "\\Huge"
];

// A list of the style-changing functions, for use in parseImplicitGroup
var styleFuncs = [
    "\\displaystyle", "\\textstyle", "\\scriptstyle", "\\scriptscriptstyle"
];

// Parses an implicit group, which is a group that starts at the end of a
// specified, and ends right before a higher explicit group ends, or at EOL. It
// is used for functions that appear to affect the current style, like \Large or
// \textrm, where instead of keeping a style we just pretend that there is an
// implicit grouping after it until the end of the group. E.g.
//   small text {\Large large text} small text again
// It is also used for \left and \right to get the correct grouping.
//
// Returns ParseResult or null
Parser.prototype.parseImplicitGroup = function(pos, mode) {
    var start = this.parseSymbol(pos, mode);

    if (!start || !start.result) {
        // If we didn't get anything we handle, fall back to parseFunction
        return this.parseFunction(pos, mode);
    }

    var func = start.result.result;

    if (func === "\\left") {
        // If we see a left:
        // Parse the entire left function (including the delimiter)
        var left = this.parseFunction(pos, mode);
        // Parse out the implicit body
        var body = this.handleExpressionBody(left.position, mode);
        // Check the next token
        var rightLex = this.parseSymbol(body.position, mode);

        if (rightLex && rightLex.result.result === "\\right") {
            // If it's a \right, parse the entire right function (including the delimiter)
            var right = this.parseFunction(body.position, mode);

            return new ParseResult(
                new ParseNode("leftright", {
                    body: body.body,
                    left: left.result.value.value,
                    right: right.result.value.value
                }, mode),
                right.position);
        } else {
            throw new ParseError("Missing \\right", this.lexer, body.position);
        }
    } else if (func === "\\right") {
        // If we see a right, explicitly fail the parsing here so the \left
        // handling ends the group
        return null;
    } else if (utils.contains(sizeFuncs, func)) {
        // If we see a sizing function, parse out the implict body
        var body = this.handleExpressionBody(start.result.position, mode);
        return new ParseResult(
            new ParseNode("sizing", {
                // Figure out what size to use based on the list of functions above
                size: "size" + (utils.indexOf(sizeFuncs, func) + 1),
                value: body.body
            }, mode),
            body.position);
    } else if (utils.contains(styleFuncs, func)) {
        // If we see a styling function, parse out the implict body
        var body = this.handleExpressionBody(start.result.position, mode);
        return new ParseResult(
            new ParseNode("styling", {
                // Figure out what style to use by pulling out the style from
                // the function name
                style: func.slice(1, func.length - 5),
                value: body.body
            }, mode),
            body.position);
    } else {
        // Defer to parseFunction if it's not a function we handle
        return this.parseFunction(pos, mode);
    }
};

// Parses an entire function, including its base and all of its arguments
//
// Returns ParseResult or null
Parser.prototype.parseFunction = function(pos, mode) {
    var baseGroup = this.parseGroup(pos, mode);

    if (baseGroup) {
        if (baseGroup.isFunction) {
            var func = baseGroup.result.result;
            if (mode === "text" && !baseGroup.allowedInText) {
                throw new ParseError(
                    "Can't use function '" + func + "' in text mode",
                    this.lexer, baseGroup.position);
            }

            var newPos = baseGroup.result.position;
            var result;
            if (baseGroup.numArgs > 0) {
                var baseGreediness = functions.getGreediness(func);
                var args = [func];
                var positions = [newPos];
                for (var i = 0; i < baseGroup.numArgs; i++) {
                    var argType = baseGroup.argTypes && baseGroup.argTypes[i];
                    if (argType) {
                        var arg = this.parseSpecialGroup(newPos, argType, mode);
                    } else {
                        var arg = this.parseGroup(newPos, mode);
                    }
                    if (!arg) {
                        throw new ParseError(
                            "Expected group after '" + baseGroup.result.result +
                                "'",
                            this.lexer, newPos);
                    }
                    var argNode;
                    if (arg.numArgs > 0) {
                        var argGreediness = functions.getGreediness(arg.result.result);
                        if (argGreediness > baseGreediness) {
                            argNode = this.parseFunction(newPos, mode);
                        } else {
                            throw new ParseError(
                                "Got function '" + arg.result.result + "' as " +
                                    "argument to function '" +
                                    baseGroup.result.result + "'",
                                this.lexer, arg.result.position - 1);
                        }
                    } else {
                        argNode = arg.result;
                    }
                    args.push(argNode.result);
                    positions.push(argNode.position);
                    newPos = argNode.position;
                }

                args.push(positions);

                result = functions.funcs[func].handler.apply(this, args);
            } else {
                result = functions.funcs[func].handler.apply(this, [func]);
            }

            return new ParseResult(
                new ParseNode(result.type, result, mode),
                newPos);
        } else {
            return baseGroup.result;
        }
    } else {
        return null;
    }
};

// Parses a group when the mode is changing. Takes a position, a new mode, and
// an outer mode that is used to parse the outside.
//
// Returns a ParseFuncOrArgument or null
Parser.prototype.parseSpecialGroup = function(pos, mode, outerMode) {
    if (mode === "color" || mode === "size") {
        // color and size modes are special because they should have braces and
        // should only lex a single symbol inside
        var openBrace = this.lexer.lex(pos, outerMode);
        this.expect(openBrace, "{");
        var inner = this.lexer.lex(openBrace.position, mode);
        var closeBrace = this.lexer.lex(inner.position, outerMode);
        this.expect(closeBrace, "}");
        return new ParseFuncOrArgument(
            new ParseResult(
                new ParseNode("color", inner.text, outerMode),
                closeBrace.position),
            false);
    } else if (mode === "text") {
        // text mode is special because it should ignore the whitespace before
        // it
        var whitespace = this.lexer.lex(pos, "whitespace");
        return this.parseGroup(whitespace.position, mode);
    } else {
        return this.parseGroup(pos, mode);
    }
};

// Parses a group, which is either a single nucleus (like "x") or an expression
// in braces (like "{x+y}")
//
// Returns a ParseFuncOrArgument or null
Parser.prototype.parseGroup = function(pos, mode) {
    var start = this.lexer.lex(pos, mode);
    // Try to parse an open brace
    if (start.type === "{") {
        // If we get a brace, parse an expression
        var expression = this.parseExpression(start.position, mode);
        // Make sure we get a close brace
        var closeBrace = this.lexer.lex(expression.position, mode);
        this.expect(closeBrace, "}");
        return new ParseFuncOrArgument(
            new ParseResult(
                new ParseNode("ordgroup", expression.result, mode),
                closeBrace.position),
            false);
    } else {
        // Otherwise, just return a nucleus
        return this.parseSymbol(pos, mode);
    }
};

// Parse a single symbol out of the string. Here, we handle both the functions
// we have defined, as well as the single character symbols
//
// Returns a ParseFuncOrArgument or null
Parser.prototype.parseSymbol = function(pos, mode) {
    var nucleus = this.lexer.lex(pos, mode);

    if (functions.funcs[nucleus.type]) {
        // If there is a function with this name, we use its data
        var func = functions.funcs[nucleus.type];

        // Here, we replace "original" argTypes with the current mode
        var argTypes = func.argTypes;
        if (argTypes) {
            argTypes = argTypes.slice();
            for (var i = 0; i < argTypes.length; i++) {
                if (argTypes[i] === "original") {
                    argTypes[i] = mode;
                }
            }
        }

        return new ParseFuncOrArgument(
            new ParseResult(nucleus.type, nucleus.position),
            true, func.allowedInText, func.numArgs, argTypes);
    } else if (symbols[mode][nucleus.text]) {
        // Otherwise if this is a no-argument function, find the type it
        // corresponds to in the symbols map
        return new ParseFuncOrArgument(
            new ParseResult(
                new ParseNode(symbols[mode][nucleus.text].group,
                              nucleus.text, mode),
                nucleus.position),
            false);
    } else {
        return null;
    }
};

module.exports = Parser;
