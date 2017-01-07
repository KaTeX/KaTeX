/* eslint no-constant-condition:0 */
var functions = require("./functions");
var environments = require("./environments");
var MacroExpander = require("./MacroExpander");
var symbols = require("./symbols");
var utils = require("./utils");
var cjkRegex = require("./unicodeRegexes").cjkRegex;

var parseData = require("./parseData");
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
 * The parser has a property called "mode" indicating the mode that
 * the parser is currently in. Currently it has to be one of "math" or
 * "text", which denotes whether the current environment is a math-y
 * one or a text-y one (e.g. inside \text). Currently, this serves to
 * limit the functions which can be used in text mode.
 *
 * The main functions then return an object which contains the useful data that
 * was parsed at its given point, and a new position at the end of the parsed
 * data. The main functions can call each other and continue the parsing by
 * using the returned position as a new starting point.
 *
 * There are also extra `.handle...` functions, which pull out some reused
 * functionality into self-contained functions.
 *
 * The earlier functions return ParseNodes.
 * The later functions (which are called deeper in the parse) sometimes return
 * ParseFuncOrArgument, which contain a ParseNode as well as some data about
 * whether the parsed object is a function which is missing some arguments, or a
 * standalone object which can be used as an argument to another function.
 */

/**
 * Main Parser class
 */
function Parser(input, settings) {
    // Create a new macro expander (gullet) and (indirectly via that) also a
    // new lexer (mouth) for this parser (stomach, in the language of TeX)
    this.gullet = new MacroExpander(input, settings.macros);
    // Store the settings for use in parsing
    this.settings = settings;
    // Count leftright depth (for \middle errors)
    this.leftrightDepth = 0;
}

var ParseNode = parseData.ParseNode;

/**
 * An initial function (without its arguments), or an argument to a function.
 * The `result` argument should be a ParseNode.
 */
function ParseFuncOrArgument(result, isFunction, token) {
    this.result = result;
    // Is this a function (i.e. is it something defined in functions.js)?
    this.isFunction = isFunction;
    this.token = token;
}

/**
 * Checks a result to make sure it has the right type, and throws an
 * appropriate error otherwise.
 *
 * @param {boolean=} consume whether to consume the expected token,
 *                           defaults to true
 */
Parser.prototype.expect = function(text, consume) {
    if (this.nextToken.text !== text) {
        throw new ParseError(
            "Expected '" + text + "', got '" + this.nextToken.text + "'",
            this.nextToken
        );
    }
    if (consume !== false) {
        this.consume();
    }
};

/**
 * Considers the current look ahead token as consumed,
 * and fetches the one after that as the new look ahead.
 */
Parser.prototype.consume = function() {
    this.nextToken = this.gullet.get(this.mode === "math");
};

Parser.prototype.switchMode = function(newMode) {
    this.gullet.unget(this.nextToken);
    this.mode = newMode;
    this.consume();
};

/**
 * Main parsing function, which parses an entire input.
 *
 * @return {?Array.<ParseNode>}
 */
Parser.prototype.parse = function() {
    // Try to parse the input
    this.mode = "math";
    this.consume();
    var parse = this.parseInput();
    return parse;
};

/**
 * Parses an entire input tree.
 */
Parser.prototype.parseInput = function() {
    // Parse an expression
    var expression = this.parseExpression(false);
    // If we succeeded, make sure there's an EOF at the end
    this.expect("EOF", false);
    return expression;
};

var endOfExpression = ["}", "\\end", "\\right", "&", "\\\\", "\\cr"];

/**
 * Parses an "expression", which is a list of atoms.
 *
 * @param {boolean} breakOnInfix  Should the parsing stop when we hit infix
 *                  nodes? This happens when functions have higher precendence
 *                  than infix nodes in implicit parses.
 *
 * @param {?string} breakOnTokenText  The text of the token that the expression
 *                  should end with, or `null` if something else should end the
 *                  expression.
 *
 * @return {ParseNode}
 */
Parser.prototype.parseExpression = function(breakOnInfix, breakOnTokenText) {
    var body = [];
    // Keep adding atoms to the body until we can't parse any more atoms (either
    // we reached the end, a }, or a \right)
    while (true) {
        var lex = this.nextToken;
        if (endOfExpression.indexOf(lex.text) !== -1) {
            break;
        }
        if (breakOnTokenText && lex.text === breakOnTokenText) {
            break;
        }
        if (breakOnInfix && functions[lex.text] && functions[lex.text].infix) {
            break;
        }
        var atom = this.parseAtom();
        if (!atom) {
            if (!this.settings.throwOnError && lex.text[0] === "\\") {
                var errorNode = this.handleUnsupportedCmd();
                body.push(errorNode);
                continue;
            }

            break;
        }
        body.push(atom);
    }
    return this.handleInfixNodes(body);
};

/**
 * Rewrites infix operators such as \over with corresponding commands such
 * as \frac.
 *
 * There can only be one infix operator per group.  If there's more than one
 * then the expression is ambiguous.  This can be resolved by adding {}.
 *
 * @returns {Array}
 */
Parser.prototype.handleInfixNodes = function(body) {
    var overIndex = -1;
    var funcName;

    for (var i = 0; i < body.length; i++) {
        var node = body[i];
        if (node.type === "infix") {
            if (overIndex !== -1) {
                throw new ParseError(
                    "only one infix operator per group",
                    node.value.token);
            }
            overIndex = i;
            funcName = node.value.replaceWith;
        }
    }

    if (overIndex !== -1) {
        var numerNode;
        var denomNode;

        var numerBody = body.slice(0, overIndex);
        var denomBody = body.slice(overIndex + 1);

        if (numerBody.length === 1 && numerBody[0].type === "ordgroup") {
            numerNode = numerBody[0];
        } else {
            numerNode = new ParseNode("ordgroup", numerBody, this.mode);
        }

        if (denomBody.length === 1 && denomBody[0].type === "ordgroup") {
            denomNode = denomBody[0];
        } else {
            denomNode = new ParseNode("ordgroup", denomBody, this.mode);
        }

        var value = this.callFunction(
            funcName, [numerNode, denomNode], null);
        return [new ParseNode(value.type, value, this.mode)];
    } else {
        return body;
    }
};

// The greediness of a superscript or subscript
var SUPSUB_GREEDINESS = 1;

/**
 * Handle a subscript or superscript with nice errors.
 */
Parser.prototype.handleSupSubscript = function(name) {
    var symbolToken = this.nextToken;
    var symbol = symbolToken.text;
    this.consume();
    var group = this.parseGroup();

    if (!group) {
        if (!this.settings.throwOnError && this.nextToken.text[0] === "\\") {
            return this.handleUnsupportedCmd();
        } else {
            throw new ParseError(
                "Expected group after '" + symbol + "'",
                symbolToken
            );
        }
    } else if (group.isFunction) {
        // ^ and _ have a greediness, so handle interactions with functions'
        // greediness
        var funcGreediness = functions[group.result].greediness;
        if (funcGreediness > SUPSUB_GREEDINESS) {
            return this.parseFunction(group);
        } else {
            throw new ParseError(
                "Got function '" + group.result + "' with no arguments " +
                    "as " + name, symbolToken);
        }
    } else {
        return group.result;
    }
};

/**
 * Converts the textual input of an unsupported command into a text node
 * contained within a color node whose color is determined by errorColor
 */
Parser.prototype.handleUnsupportedCmd = function() {
    var text = this.nextToken.text;
    var textordArray = [];

    for (var i = 0; i < text.length; i++) {
        textordArray.push(new ParseNode("textord", text[i], "text"));
    }

    var textNode = new ParseNode(
        "text",
        {
            body: textordArray,
            type: "text"
        },
        this.mode);

    var colorNode = new ParseNode(
        "color",
        {
            color: this.settings.errorColor,
            value: [textNode],
            type: "color"
        },
        this.mode);

    this.consume();
    return colorNode;
};

/**
 * Parses a group with optional super/subscripts.
 *
 * @return {?ParseNode}
 */
Parser.prototype.parseAtom = function() {
    // The body of an atom is an implicit group, so that things like
    // \left(x\right)^2 work correctly.
    var base = this.parseImplicitGroup();

    // In text mode, we don't have superscripts or subscripts
    if (this.mode === "text") {
        return base;
    }

    // Note that base may be empty (i.e. null) at this point.

    var superscript;
    var subscript;
    while (true) {
        // Lex the first token
        var lex = this.nextToken;

        if (lex.text === "\\limits" || lex.text === "\\nolimits") {
            // We got a limit control
            if (!base || base.type !== "op") {
                throw new ParseError(
                    "Limit controls must follow a math operator",
                    lex);
            } else {
                var limits = lex.text === "\\limits";
                base.value.limits = limits;
                base.value.alwaysHandleSupSub = true;
            }
            this.consume();
        } else if (lex.text === "^") {
            // We got a superscript start
            if (superscript) {
                throw new ParseError("Double superscript", lex);
            }
            superscript = this.handleSupSubscript("superscript");
        } else if (lex.text === "_") {
            // We got a subscript start
            if (subscript) {
                throw new ParseError("Double subscript", lex);
            }
            subscript = this.handleSupSubscript("subscript");
        } else if (lex.text === "'") {
            // We got a prime
            var prime = new ParseNode("textord", "\\prime", this.mode);

            // Many primes can be grouped together, so we handle this here
            var primes = [prime];
            this.consume();
            // Keep lexing tokens until we get something that's not a prime
            while (this.nextToken.text === "'") {
                // For each one, add another prime to the list
                primes.push(prime);
                this.consume();
            }
            // Put them into an ordgroup as the superscript
            superscript = new ParseNode("ordgroup", primes, this.mode);
        } else {
            // If it wasn't ^, _, or ', stop parsing super/subscripts
            break;
        }
    }

    if (superscript || subscript) {
        // If we got either a superscript or subscript, create a supsub
        return new ParseNode("supsub", {
            base: base,
            sup: superscript,
            sub: subscript
        }, this.mode);
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

/**
 * Parses an implicit group, which is a group that starts at the end of a
 * specified, and ends right before a higher explicit group ends, or at EOL. It
 * is used for functions that appear to affect the current style, like \Large or
 * \textrm, where instead of keeping a style we just pretend that there is an
 * implicit grouping after it until the end of the group. E.g.
 *   small text {\Large large text} small text again
 * It is also used for \left and \right to get the correct grouping.
 *
 * @return {?ParseNode}
 */
Parser.prototype.parseImplicitGroup = function() {
    var start = this.parseSymbol();

    if (start == null) {
        // If we didn't get anything we handle, fall back to parseFunction
        return this.parseFunction();
    }

    var func = start.result;
    var body;

    if (func === "\\left") {
        // If we see a left:
        // Parse the entire left function (including the delimiter)
        var left = this.parseFunction(start);
        // Parse out the implicit body
        ++this.leftrightDepth;
        body = this.parseExpression(false);
        --this.leftrightDepth;
        // Check the next token
        this.expect("\\right", false);
        var right = this.parseFunction();
        return new ParseNode("leftright", {
            body: body,
            left: left.value.value,
            right: right.value.value
        }, this.mode);
    } else if (func === "\\begin") {
        // begin...end is similar to left...right
        var begin = this.parseFunction(start);
        var envName = begin.value.name;
        if (!environments.hasOwnProperty(envName)) {
            throw new ParseError(
                "No such environment: " + envName, begin.value.nameGroup);
        }
        // Build the environment object. Arguments and other information will
        // be made available to the begin and end methods using properties.
        var env = environments[envName];
        var args = this.parseArguments("\\begin{" + envName + "}", env);
        var context = {
            mode: this.mode,
            envName: envName,
            parser: this,
            positions: args.pop()
        };
        var result = env.handler(context, args);
        this.expect("\\end", false);
        var endNameToken = this.nextToken;
        var end = this.parseFunction();
        if (end.value.name !== envName) {
            throw new ParseError(
                "Mismatch: \\begin{" + envName + "} matched " +
                "by \\end{" + end.value.name + "}",
                endNameToken);
        }
        result.position = end.position;
        return result;
    } else if (utils.contains(sizeFuncs, func)) {
        // If we see a sizing function, parse out the implict body
        body = this.parseExpression(false);
        return new ParseNode("sizing", {
            // Figure out what size to use based on the list of functions above
            size: "size" + (utils.indexOf(sizeFuncs, func) + 1),
            value: body
        }, this.mode);
    } else if (utils.contains(styleFuncs, func)) {
        // If we see a styling function, parse out the implict body
        body = this.parseExpression(true);
        return new ParseNode("styling", {
            // Figure out what style to use by pulling out the style from
            // the function name
            style: func.slice(1, func.length - 5),
            value: body
        }, this.mode);
    } else {
        // Defer to parseFunction if it's not a function we handle
        return this.parseFunction(start);
    }
};

/**
 * Parses an entire function, including its base and all of its arguments.
 * The base might either have been parsed already, in which case
 * it is provided as an argument, or it's the next group in the input.
 *
 * @param {ParseFuncOrArgument=} baseGroup optional as described above
 * @return {?ParseNode}
 */
Parser.prototype.parseFunction = function(baseGroup) {
    if (!baseGroup) {
        baseGroup = this.parseGroup();
    }

    if (baseGroup) {
        if (baseGroup.isFunction) {
            var func = baseGroup.result;
            var funcData = functions[func];
            if (this.mode === "text" && !funcData.allowedInText) {
                throw new ParseError(
                    "Can't use function '" + func + "' in text mode",
                    baseGroup.token);
            }

            var args = this.parseArguments(func, funcData);
            var token = baseGroup.token;
            var result = this.callFunction(func, args, args.pop(), token);
            return new ParseNode(result.type, result, this.mode);
        } else {
            return baseGroup.result;
        }
    } else {
        return null;
    }
};

/**
 * Call a function handler with a suitable context and arguments.
 */
Parser.prototype.callFunction = function(name, args, positions, token) {
    var context = {
        funcName: name,
        parser: this,
        positions: positions,
        token: token
    };
    return functions[name].handler(context, args);
};

/**
 * Parses the arguments of a function or environment
 *
 * @param {string} func  "\name" or "\begin{name}"
 * @param {{numArgs:number,numOptionalArgs:number|undefined}} funcData
 * @return the array of arguments, with the list of positions as last element
 */
Parser.prototype.parseArguments = function(func, funcData) {
    var totalArgs = funcData.numArgs + funcData.numOptionalArgs;
    if (totalArgs === 0) {
        return [[this.pos]];
    }

    var baseGreediness = funcData.greediness;
    var positions = [this.pos];
    var args = [];

    for (var i = 0; i < totalArgs; i++) {
        var nextToken = this.nextToken;
        var argType = funcData.argTypes && funcData.argTypes[i];
        var arg;
        if (i < funcData.numOptionalArgs) {
            if (argType) {
                arg = this.parseGroupOfType(argType, true);
            } else {
                arg = this.parseGroup(true);
            }
            if (!arg) {
                args.push(null);
                positions.push(this.pos);
                continue;
            }
        } else {
            if (argType) {
                arg = this.parseGroupOfType(argType);
            } else {
                arg = this.parseGroup();
            }
            if (!arg) {
                if (!this.settings.throwOnError &&
                    this.nextToken.text[0] === "\\") {
                    arg = new ParseFuncOrArgument(
                        this.handleUnsupportedCmd(this.nextToken.text),
                        false);
                } else {
                    throw new ParseError(
                        "Expected group after '" + func + "'", nextToken);
                }
            }
        }
        var argNode;
        if (arg.isFunction) {
            var argGreediness =
                functions[arg.result].greediness;
            if (argGreediness > baseGreediness) {
                argNode = this.parseFunction(arg);
            } else {
                throw new ParseError(
                    "Got function '" + arg.result + "' as " +
                    "argument to '" + func + "'", nextToken);
            }
        } else {
            argNode = arg.result;
        }
        args.push(argNode);
        positions.push(this.pos);
    }

    args.push(positions);

    return args;
};


/**
 * Parses a group when the mode is changing.
 *
 * @return {?ParseFuncOrArgument}
 */
Parser.prototype.parseGroupOfType = function(innerMode, optional) {
    var outerMode = this.mode;
    // Handle `original` argTypes
    if (innerMode === "original") {
        innerMode = outerMode;
    }

    if (innerMode === "color") {
        return this.parseColorGroup(optional);
    }
    if (innerMode === "size") {
        return this.parseSizeGroup(optional);
    }

    this.switchMode(innerMode);
    if (innerMode === "text") {
        // text mode is special because it should ignore the whitespace before
        // it
        while (this.nextToken.text === " ") {
            this.consume();
        }
    }
    // By the time we get here, innerMode is one of "text" or "math".
    // We switch the mode of the parser, recurse, then restore the old mode.
    var res = this.parseGroup(optional);
    this.switchMode(outerMode);
    return res;
};

/**
 * Parses a group, essentially returning the string formed by the
 * brace-enclosed tokens plus some position information.
 *
 * @param {string} modeName  Used to describe the mode in error messages
 * @param {boolean=} optional  Whether the group is optional or required
 */
Parser.prototype.parseStringGroup = function(modeName, optional) {
    if (optional && this.nextToken.text !== "[") {
        return null;
    }
    var outerMode = this.mode;
    this.mode = "text";
    this.expect(optional ? "[" : "{");
    var str = "";
    var firstToken = this.nextToken;
    var lastToken = firstToken;
    while (this.nextToken.text !== (optional ? "]" : "}")) {
        if (this.nextToken.text === "EOF") {
            throw new ParseError(
                "Unexpected end of input in " + modeName,
                firstToken.range(this.nextToken, str));
        }
        lastToken = this.nextToken;
        str += lastToken.text;
        this.consume();
    }
    this.mode = outerMode;
    this.expect(optional ? "]" : "}");
    return firstToken.range(lastToken, str);
};

/**
 * Parses a regex-delimited group: the largest sequence of tokens
 * whose concatenated strings match `regex`. Returns the string
 * formed by the tokens plus some position information.
 *
 * @param {RegExp} regex
 * @param {string} modeName  Used to describe the mode in error messages
 */
Parser.prototype.parseRegexGroup = function(regex, modeName) {
    var outerMode = this.mode;
    this.mode = "text";
    var firstToken = this.nextToken;
    var lastToken = firstToken;
    var str = "";
    while (this.nextToken.text !== "EOF"
           && regex.test(str + this.nextToken.text)) {
        lastToken = this.nextToken;
        str += lastToken.text;
        this.consume();
    }
    if (str === "") {
        throw new ParseError(
            "Invalid " + modeName + ": '" + firstToken.text + "'",
            firstToken);
    }
    this.mode = outerMode;
    return firstToken.range(lastToken, str);
};

/**
 * Parses a color description.
 */
Parser.prototype.parseColorGroup = function(optional) {
    var res = this.parseStringGroup("color", optional);
    if (!res) {
        return null;
    }
    var match = (/^(#[a-z0-9]+|[a-z]+)$/i).exec(res.text);
    if (!match) {
        throw new ParseError("Invalid color: '" + res.text + "'", res);
    }
    return new ParseFuncOrArgument(
        new ParseNode("color", match[0], this.mode),
        false);
};

/**
 * Parses a size specification, consisting of magnitude and unit.
 */
Parser.prototype.parseSizeGroup = function(optional) {
    var res;
    if (!optional && this.nextToken.text !== "{") {
        res = this.parseRegexGroup(
            /^[-+]? *(?:$|\d+|\d+\.\d*|\.\d*) *[a-z]{0,2}$/, "size");
    } else {
        res = this.parseStringGroup("size", optional);
    }
    if (!res) {
        return null;
    }
    var match = (/([-+]?) *(\d+(?:\.\d*)?|\.\d+) *([a-z]{2})/).exec(res.text);
    if (!match) {
        throw new ParseError("Invalid size: '" + res.text + "'", res);
    }
    var data = {
        number: +(match[1] + match[2]), // sign + magnitude, cast to number
        unit: match[3]
    };
    if (data.unit !== "em" && data.unit !== "ex" && data.unit !== "mu") {
        throw new ParseError("Invalid unit: '" + data.unit + "'", res);
    }
    return new ParseFuncOrArgument(
        new ParseNode("color", data, this.mode),
        false);
};

/**
 * If the argument is false or absent, this parses an ordinary group,
 * which is either a single nucleus (like "x") or an expression
 * in braces (like "{x+y}").
 * If the argument is true, it parses either a bracket-delimited expression
 * (like "[x+y]") or returns null to indicate the absence of a
 * bracket-enclosed group.
 *
 * @param {boolean=} optional  Whether the group is optional or required
 * @return {?ParseFuncOrArgument}
 */
Parser.prototype.parseGroup = function(optional) {
    var firstToken = this.nextToken;
    // Try to parse an open brace
    if (this.nextToken.text === (optional ? "[" : "{")) {
        // If we get a brace, parse an expression
        this.consume();
        var expression = this.parseExpression(false, optional ? "]" : null);
        var lastToken = this.nextToken;
        // Make sure we get a close brace
        this.expect(optional ? "]" : "}");
        if (this.mode === "text") {
            this.formLigatures(expression);
        }
        return new ParseFuncOrArgument(
            new ParseNode("ordgroup", expression, this.mode,
                          firstToken, lastToken),
            false);
    } else {
        // Otherwise, just return a nucleus, or nothing for an optional group
        return optional ? null : this.parseSymbol();
    }
};

/**
 * Form ligature-like combinations of characters for text mode.
 * This includes inputs like "--", "---", "``" and "''".
 * The result will simply replace multiple textord nodes with a single
 * character in each value by a single textord node having multiple
 * characters in its value.  The representation is still ASCII source.
 *
 * @param {Array.<ParseNode>} group  the nodes of this group,
 *                                   list will be moified in place
 */
Parser.prototype.formLigatures = function(group) {
    var i;
    var n = group.length - 1;
    for (i = 0; i < n; ++i) {
        var a = group[i];
        var v = a.value;
        if (v === "-" && group[i + 1].value === "-") {
            if (i + 1 < n && group[i + 2].value === "-") {
                group.splice(i, 3, new ParseNode(
                    "textord", "---", "text", a, group[i + 2]));
                n -= 2;
            } else {
                group.splice(i, 2, new ParseNode(
                    "textord", "--", "text", a, group[i + 1]));
                n -= 1;
            }
        }
        if ((v === "'" || v === "`") && group[i + 1].value === v) {
            group.splice(i, 2, new ParseNode(
                "textord", v + v, "text", a, group[i + 1]));
            n -= 1;
        }
    }
};

/**
 * Parse a single symbol out of the string. Here, we handle both the functions
 * we have defined, as well as the single character symbols
 *
 * @return {?ParseFuncOrArgument}
 */
Parser.prototype.parseSymbol = function() {
    var nucleus = this.nextToken;

    if (functions[nucleus.text]) {
        this.consume();
        // If there exists a function with this name, we return the function and
        // say that it is a function.
        return new ParseFuncOrArgument(
            nucleus.text,
            true, nucleus);
    } else if (symbols[this.mode][nucleus.text]) {
        this.consume();
        // Otherwise if this is a no-argument function, find the type it
        // corresponds to in the symbols map
        return new ParseFuncOrArgument(
            new ParseNode(symbols[this.mode][nucleus.text].group,
                          nucleus.text, this.mode, nucleus),
            false, nucleus);
    } else if (this.mode === "text" && cjkRegex.test(nucleus.text)) {
        this.consume();
        return new ParseFuncOrArgument(
            new ParseNode("textord", nucleus.text, this.mode, nucleus),
            false, nucleus);
    } else {
        return null;
    }
};

Parser.prototype.ParseNode = ParseNode;

module.exports = Parser;
