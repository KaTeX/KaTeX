var functions = require("./functions");
var Lexer = require("./Lexer");
var symbols = require("./symbols");
var utils = require("./utils");

var ParseError = require("./ParseError");

/**
 * This file contains the parser used to parse out a TeX expression from the
 * input. Since TeX isn't context-free, standard parsers don't work particularly
 * well.
 *
 * The strategy of this parser is as such:
 *
 * The main functions (the `.parse...` ones) take a position in the current
 * parse string to parse tokens from. The lexer (found in Lexer.js, stored at
 * this.lexer) also supports pulling out tokens at arbitrary places. When
 * individual tokens are needed at a position, the lexer is called to pull out a
 * token, which is then used.
 *
 * The main functions also take a mode that the parser is currently in
 * (currently "math" or "text"), which denotes whether the current environment
 * is a math-y one or a text-y one (e.g. inside \text). Currently, this serves
 * to limit the functions which can be used in text mode.
 *
 * The main functions then return an object which contains the useful data that
 * was parsed at its given point, and a new position at the end of the parsed
 * data. The main functions can call each other and continue the parsing by
 * using the returned position as a new starting point.
 *
 * There are also extra `.handle...` functions, which pull out some reused
 * functionality into self-contained functions.
 *
 * The earlier functions return `ParseResult`s, which contain a ParseNode and a
 * new position.
 *
 * The later functions (which are called deeper in the parse) sometimes return
 * ParseFuncOrArgument, which contain a ParseResult as well as some data about
 * whether the parsed object is a function which is missing some arguments, or a
 * standalone object which can be used as an argument to another function.
 */

/**
 * Main Parser class
 */
function Parser(input) {
    // Make a new lexer
    this.lexer = new Lexer(input);
}

/**
 * The resulting parse tree nodes of the parse tree.
 */
function ParseNode(type, value, mode) {
    this.type = type;
    this.value = value;
    this.mode = mode;
}

/**
 * A result and final position returned by the `.parse...` functions.
 */
function ParseResult(result, newPosition) {
    this.result = result;
    this.position = newPosition;
}


/**
 * Checks a result to make sure it has the right type, and throws an
 * appropriate error otherwise.
 *
 * @result {Token}
 */
Parser.prototype.expect = function(token, type) {
    if (token.type !== type) {
        throw new ParseError(
            "Expected '" + type + "', got '" + token.type + "'",
            this.lexer, token.position
        );
    }
};

/**
 * Main parsing function, which parses an entire input.
 *
 * @return {?Array.<ParseNode>}
 */
Parser.prototype.parse = function(input) {
    // Try to parse the input
    var parse = this.parseInput(0, "math");
    return parse.result;
};

/**
 * Parses an entire input tree.
 */
Parser.prototype.parseInput = function(pos, mode) {
    // Parse an expression
    var expression = this.parseExpression(pos, mode);
    // If we succeeded, make sure there's an EOF at the end
    var EOF = this.lexer.lex(expression.position, mode);
    this.expect(EOF, "EOF");
    return expression;
};

/**
 * Handles a body of an expression.
 */
Parser.prototype.handleExpressionBody = function(pos, mode) {
    var body = [];
    var atom;
    // Keep adding atoms to the body until we can't parse any more atoms (either
    // we reached the end, a }, or a \right)
    while ((atom = this.parseAtom(pos, mode))) {
        body.push(atom.result);
        pos = atom.position;
    }
    // TODO: update to use ParseResult
    return {
        body: body,
        position: pos
    };
};

/**
 * Parses an "expression", which is a list of atoms.
 *
 * @return {ParseResult}
 */
Parser.prototype.parseExpression = function(pos, mode) {
    var body = this.handleExpressionBody(pos, mode);
    return new ParseResult(body.body, body.position);
};

// The greediness of a superscript or subscript
var SUPSUB_GREEDINESS = 1;

/**
 * Handle a subscript or superscript with nice errors.
 */
Parser.prototype.handleSupSubscript = function(pos, mode, symbol, name) {
    var group = this.parseGroup(pos, mode);

    if (!group) {
        throw new ParseError(
            "Expected group after '" + symbol + "'", this.lexer, pos);
    } else if (group.result.isFunction) {
        var funcName = group.result.type;
        var func = functions.funcs[funcName];
        if (func.numArgs > 0) {
            // ^ and _ have a greediness, so handle interactions with functions'
            // greediness
            var funcGreediness = functions.getGreediness(funcName);
            if (funcGreediness > SUPSUB_GREEDINESS) {
                return this.parseFunction(pos, mode);
            } else {
                throw new ParseError(
                        "Got function '" + funcName + "' with no arguments " +
                        "as " + name,
                    this.lexer, pos);
            }
        }
    }
    // fall-through
    return group;
};

/**
 * Parses a group with optional super/subscripts.
 *
 * @return {?ParseResult}
 */
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

Parser.prototype.parseLeftRight = function (pos, mode) {
    var left = this.lexer.lex(pos, mode);
    var leftDelim = this.lexer.lex(left.position, mode);

    if (!utils.contains(functions.delimiters, leftDelim.text)) {
        throw new ParseError(
                "Invalid delimiter: '" + leftDelim.text + "' after '" +
                func + "'",
            this.lexer, leftDelim.position);
    }

    // Parse out the implicit body
    var body = this.handleExpressionBody(leftDelim.position, mode);

    // Check the next token
    var right = this.lexer.lex(body.position, mode);
    var rightDelim = this.lexer.lex(right.position, mode);

    if (right && right.type === "\\right") {
        if (utils.contains(functions.delimiters, rightDelim.text)) {

            return new ParseResult(
                new ParseNode("leftright", {
                    body: body.body,
                    left: leftDelim.text,
                    right: rightDelim.text
                }, mode),
                rightDelim.position);
        } else {
            throw new ParseError(
                    "Invalid delimiter: '" + rightDelim.text + "' after '" +
                    func + "'",
                this.lexer, rightDelim.position);
        }
    } else {
        throw new ParseError("Missing \\right", this.lexer, body.position);
    }
};

/**
 * Parses an implicit group, which is a group that starts at the end of a
 * specified, and ends right before a higher explicit group ends, or at EOL. It
 * is used for functions that appear to affect the current style, like \Large or
 * \textrm, where instead of keeping a style we just pretend that there is an
 * implicit grouping after it until the end of the group. E.g.
 *   small text {\Large large text} small text again
 * It is also used for \left and \right to get the correct grouping.
 *
 * @return {?ParseResult}
 */
Parser.prototype.parseImplicitGroup = function(pos, mode) {
    var start = this.parseSymbol(pos, mode);

    if (!start || !start.result) {
        // If we didn't get anything we handle, fall back to parseFunction
        return this.parseFunction(pos, mode);
    }

    var funcName = start.result.type;

    if (funcName === "\\left") {
        return this.parseLeftRight(pos, mode);
    } else if (funcName === "\\right") {
        // If we see a right, explicitly fail the parsing here so the \left
        // handling ends the group
        return null;
    } else if (utils.contains(sizeFuncs, funcName)) {
        // If we see a sizing function, parse out the implict body
        var body = this.handleExpressionBody(start.position, mode);
        return new ParseResult(
            new ParseNode("sizing", {
                // Figure out what size to use based on the list of functions above
                size: "size" + (utils.indexOf(sizeFuncs, funcName) + 1),
                value: body.body
            }, mode),
            body.position);
    } else if (utils.contains(styleFuncs, funcName)) {
        // If we see a styling function, parse out the implict body
        var body = this.handleExpressionBody(start.position, mode);
        return new ParseResult(
            new ParseNode("styling", {
                // Figure out what style to use by pulling out the style from
                // the function name
                style: funcName.slice(1, funcName.length - 5),
                value: body.body
            }, mode),
            body.position);
    } else {
        // Defer to parseFunction if it's not a function we handle
        return this.parseFunction(pos, mode);
    }
};



/**
 * Parses an entire function, including its base and all of its arguments
 *
 * @return {?ParseResult}
 */
Parser.prototype.parseFunction = function(pos, mode) {
    var baseGroup = this.parseGroup(pos, mode);

    if (baseGroup) {
        if (baseGroup.result.isFunction) {
            var funcName = baseGroup.result.type;
            var func = functions.funcs[funcName];

            if (mode === "text" && !func.allowedInText) {
                throw new ParseError(
                    "Can't use function '" + funcName + "' in text mode",
                    this.lexer, baseGroup.position);
            }

            var newPos = baseGroup.position;
            var result;

            var argTypes = this.getArgTypes(func, mode);

            if (func.numArgs > 0) {
                var baseGreediness = functions.getGreediness(funcName);
                var args = [funcName];
                var positions = [newPos];
                for (var i = 0; i < func.numArgs; i++) {
                    var argType = argTypes && argTypes[i];
                    if (argType) {
                        var arg = this.parseSpecialGroup(newPos, argType, mode);
                    } else {
                        var arg = this.parseGroup(newPos, mode);
                    }
                    if (!arg) {
                        throw new ParseError(
                            "Expected group after '" + funcName + "'",
                            this.lexer, newPos);
                    }

                    var argNode;
                    var argName = arg.result.type;
                    // TODO: once we get rid of the extra level of indirection
                    // TODO: reintroduce numArgs
                    if (arg.result.isFunction && functions.funcs[argName].numArgs > 0) {
                        var argGreediness = functions.getGreediness(argName);
                        if (argGreediness > baseGreediness) {
                            argNode = this.parseFunction(newPos, mode);
                        } else {
                            throw new ParseError(
                                "Got function '" + argName + "' as " +
                                    "argument to function '" + funcName + "'",
                                this.lexer, arg.position - 1);
                        }
                    } else {
                        argNode = arg;
                    }
                    args.push(argNode.result);
                    positions.push(argNode.position);
                    newPos = argNode.position;
                }

                args.push(positions);

                result = functions.funcs[funcName].handler.apply(this, args);
            } else {
                result = functions.funcs[funcName].handler.apply(this, [funcName]);
            }

            var node = new ParseNode(result.type, result, mode);
            return new ParseResult(node, newPos);
        } else {
            return baseGroup;
        }
    } else {
        return null;
    }
};

/**
 * Parses a group when the mode is changing. Takes a position, a new mode, and
 * an outer mode that is used to parse the outside.
 *
 * @return {?ParseResult}
 */
Parser.prototype.parseSpecialGroup = function(pos, mode, outerMode) {
    if (mode === "color" || mode === "size") {
        // color and size modes are special because they should have braces and
        // should only lex a single symbol inside
        var openBrace = this.lexer.lex(pos, outerMode);
        this.expect(openBrace, "{");
        var inner = this.lexer.lex(openBrace.position, mode);
        var closeBrace = this.lexer.lex(inner.position, outerMode);
        this.expect(closeBrace, "}");

        var node = new ParseNode("color", inner.text, outerMode);
        return new ParseResult(node, closeBrace.position);
    } else if (mode === "text") {
        // text mode is special because it should ignore the whitespace before
        // it
        var whitespace = this.lexer.lex(pos, "whitespace");
        return this.parseGroup(whitespace.position, mode);
    } else {
        return this.parseGroup(pos, mode);
    }
};

/**
 * Parses a group, which is either a single nucleus (like "x") or an expression
 * in braces (like "{x+y}")
 *
 * @return {?ParseResult}
 */
Parser.prototype.parseGroup = function(pos, mode) {
    var start = this.lexer.lex(pos, mode);
    // Try to parse an open brace
    if (start.type === "{") {
        // If we get a brace, parse an expression
        var expression = this.parseExpression(start.position, mode);
        // Make sure we get a close brace
        var closeBrace = this.lexer.lex(expression.position, mode);
        this.expect(closeBrace, "}");

        var node = new ParseNode("ordgroup", expression.result, mode);
        return new ParseResult(node, closeBrace.position);
    } else {
        // Otherwise, just return a nucleus
        return this.parseSymbol(pos, mode);
    }
};

/**
 * Parse a single symbol out of the string. Here, we handle both the functions
 * we have defined, as well as the single character symbols
 *
 * @return {?ParseResult}
 */
Parser.prototype.parseSymbol = function(pos, mode) {
    var nucleus = this.lexer.lex(pos, mode);
    var node;

    if (functions.funcs[nucleus.type]) {
        // If there is a function with this name, we use its data
        node = new ParseNode(nucleus.type, nucleus.text, mode);
        node.isFunction = true;
        return new ParseResult(node, nucleus.position);
    } else if (symbols[mode][nucleus.text]) {
        // Otherwise if this is a no-argument function, find the type it
        // corresponds to in the symbols map
        node = new ParseNode(symbols[mode][nucleus.text].group, nucleus.text, mode);
        node.isFunction = false;
        return new ParseResult(node, nucleus.position);
    } else {
        return null;
    }
};

// Here, we replace "original" argTypes with the current mode
Parser.prototype.getArgTypes = function (func, mode) {
    var argTypes = func.argTypes;
    if (argTypes) {
        argTypes = argTypes.slice();
        for (var i = 0; i < argTypes.length; i++) {
            if (argTypes[i] === "original") {
                argTypes[i] = mode;
            }
        }
    }
    return argTypes;
};

module.exports = Parser;
