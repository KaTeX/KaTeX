/* eslint no-constant-condition:0 */
import functions from "./functions";
import environments from "./environments";
import MacroExpander from "./MacroExpander";
import symbols from "./symbols";
import utils from "./utils";
import { validUnit } from "./units";
import { cjkRegex } from "./unicodeRegexes";
import ParseNode from "./ParseNode";
import ParseError from "./ParseError";

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

/** A function name or an argument to a function. */
class ParseFuncOrArgument {
    /**
     * @param {ParseNode|string} result It's a string if `isFunction=true` or if
     *     `result="$"` for switching into math mode; otherwise, it's a ParseNode
     *     and `isFunction` must be false. If it's a function, the string should
     *     be a name defined by defineFunction, e.g. "\\frac".
     * @param {boolean} isFunction True when this is a function. False when it's a
     *     function argument or "$" to switch into math mode.
     * @param {Token} token
     */
    constructor(result, isFunction, token) {
        this.result = result;
        // Is this a function (i.e. is it something defined in functions.js)?
        this.isFunction = isFunction;
        this.token = token;
    }
}

class Parser {
    constructor(input, settings) {
        // Create a new macro expander (gullet) and (indirectly via that) also a
        // new lexer (mouth) for this parser (stomach, in the language of TeX)
        this.gullet = new MacroExpander(input, settings.macros);
        // Use old \color behavior (same as LaTeX's \textcolor) if requested.
        // We do this after the macros object has been copied by MacroExpander.
        if (settings.colorIsTextColor) {
            this.gullet.macros["\\color"] = "\\textcolor";
        }
        // Store the settings for use in parsing
        this.settings = settings;
        // Count leftright depth (for \middle errors)
        this.leftrightDepth = 0;
    }

    /**
     * Checks a result to make sure it has the right type, and throws an
     * appropriate error otherwise.
     *
     * @param {boolean=} consume whether to consume the expected token,
     *                           defaults to true
     */
    expect(text, consume) {
        if (this.nextToken.text !== text) {
            throw new ParseError(
                "Expected '" + text + "', got '" + this.nextToken.text + "'",
                this.nextToken
            );
        }
        if (consume !== false) {
            this.consume();
        }
    }

    /**
     * Considers the current look ahead token as consumed,
     * and fetches the one after that as the new look ahead.
     */
    consume() {
        this.nextToken = this.gullet.get(this.mode === "math");
    }

    switchMode(newMode) {
        this.gullet.unget(this.nextToken);
        this.mode = newMode;
        this.consume();
    }

    /**
     * Main parsing function, which parses an entire input.
     *
     * @return {Array.<ParseNode>}
     */
    parse() {
        // Try to parse the input
        this.mode = "math";
        this.consume();
        const parse = this.parseInput();
        return parse;
    }

    /**
     * Parses an entire input tree.
     */
    parseInput() {
        // Parse an expression
        const expression = this.parseExpression(false);
        // If we succeeded, make sure there's an EOF at the end
        this.expect("EOF", false);
        return expression;
    }

    static endOfExpression = ["}", "\\end", "\\right", "&", "\\\\", "\\cr"];

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
     * @return {Array<ParseNode>}
     */
    parseExpression(breakOnInfix, breakOnTokenText) {
        const body = [];
        // Keep adding atoms to the body until we can't parse any more atoms (either
        // we reached the end, a }, or a \right)
        while (true) {
            const lex = this.nextToken;
            if (Parser.endOfExpression.indexOf(lex.text) !== -1) {
                break;
            }
            if (breakOnTokenText && lex.text === breakOnTokenText) {
                break;
            }
            if (breakOnInfix && functions[lex.text] && functions[lex.text].infix) {
                break;
            }
            const atom = this.parseAtom();
            if (!atom) {
                if (!this.settings.throwOnError && lex.text[0] === "\\") {
                    const errorNode = this.handleUnsupportedCmd();
                    body.push(errorNode);
                    continue;
                }

                break;
            }
            body.push(atom);
        }
        return this.handleInfixNodes(body);
    }

    /**
     * Rewrites infix operators such as \over with corresponding commands such
     * as \frac.
     *
     * There can only be one infix operator per group.  If there's more than one
     * then the expression is ambiguous.  This can be resolved by adding {}.
     *
     * @param {Array<ParseNode>} body
     * @return {Array<ParseNode>}
     */
    handleInfixNodes(body) {
        let overIndex = -1;
        let funcName;

        for (let i = 0; i < body.length; i++) {
            const node = body[i];
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
            let numerNode;
            let denomNode;

            const numerBody = body.slice(0, overIndex);
            const denomBody = body.slice(overIndex + 1);

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

            const value = this.callFunction(funcName, [numerNode, denomNode]);
            return [new ParseNode(value.type, value, this.mode)];
        } else {
            return body;
        }
    }

    // The greediness of a superscript or subscript
    static SUPSUB_GREEDINESS = 1;

    /**
     * Handle a subscript or superscript with nice errors.
     */
    handleSupSubscript(name) {
        const symbolToken = this.nextToken;
        const symbol = symbolToken.text;
        this.consume();
        const group = this.parseGroup();

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
            const funcGreediness = functions[group.result].greediness;
            if (funcGreediness > Parser.SUPSUB_GREEDINESS) {
                return this.parseFunction(group);
            } else {
                throw new ParseError(
                    "Got function '" + group.result + "' with no arguments " +
                        "as " + name, symbolToken);
            }
        } else {
            return group.result;
        }
    }

    /**
     * Converts the textual input of an unsupported command into a text node
     * contained within a color node whose color is determined by errorColor
     */
    handleUnsupportedCmd() {
        const text = this.nextToken.text;
        const textordArray = [];

        for (let i = 0; i < text.length; i++) {
            textordArray.push(new ParseNode("textord", text[i], "text"));
        }

        const textNode = new ParseNode(
            "text",
            {
                body: textordArray,
                type: "text",
            },
            this.mode);

        const colorNode = new ParseNode(
            "color",
            {
                color: this.settings.errorColor,
                value: [textNode],
                type: "color",
            },
            this.mode);

        this.consume();
        return colorNode;
    }

    /**
     * Parses a group with optional super/subscripts.
     *
     * @return {?ParseNode}
     */
    parseAtom() {
        // The body of an atom is an implicit group, so that things like
        // \left(x\right)^2 work correctly.
        const base = this.parseImplicitGroup();

        // In text mode, we don't have superscripts or subscripts
        if (this.mode === "text") {
            return base;
        }

        // Note that base may be empty (i.e. null) at this point.

        let superscript;
        let subscript;
        while (true) {
            // Lex the first token
            const lex = this.nextToken;

            if (lex.text === "\\limits" || lex.text === "\\nolimits") {
                // We got a limit control
                if (!base || base.type !== "op") {
                    throw new ParseError(
                        "Limit controls must follow a math operator",
                        lex);
                } else {
                    const limits = lex.text === "\\limits";
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
                if (superscript) {
                    throw new ParseError("Double superscript", lex);
                }
                const prime = new ParseNode("textord", "\\prime", this.mode);

                // Many primes can be grouped together, so we handle this here
                const primes = [prime];
                this.consume();
                // Keep lexing tokens until we get something that's not a prime
                while (this.nextToken.text === "'") {
                    // For each one, add another prime to the list
                    primes.push(prime);
                    this.consume();
                }
                // If there's a superscript following the primes, combine that
                // superscript in with the primes.
                if (this.nextToken.text === "^") {
                    primes.push(this.handleSupSubscript("superscript"));
                }
                // Put everything into an ordgroup as the superscript
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
                sub: subscript,
            }, this.mode);
        } else {
            // Otherwise return the original body
            return base;
        }
    }

    // A list of the size-changing functions, for use in parseImplicitGroup
    static sizeFuncs = [
        "\\tiny", "\\sixptsize", "\\scriptsize", "\\footnotesize", "\\small",
        "\\normalsize", "\\large", "\\Large", "\\LARGE", "\\huge", "\\Huge",
    ];

    // A list of the style-changing functions, for use in parseImplicitGroup
    static styleFuncs = [
        "\\displaystyle", "\\textstyle", "\\scriptstyle", "\\scriptscriptstyle",
    ];

    // Old font functions
    static oldFontFuncs = {
        "\\rm": "mathrm",
        "\\sf": "mathsf",
        "\\tt": "mathtt",
        "\\bf": "mathbf",
        "\\it": "mathit",
        //"\\sl": "textsl",
        //"\\sc": "textsc",
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
     * @return {?ParseNode}
     */
    parseImplicitGroup() {
        const start = this.parseSymbol();

        if (start == null) {
            // If we didn't get anything we handle, fall back to parseFunction
            return this.parseFunction();
        }

        const func = start.result;

        if (func === "\\left") {
            // If we see a left:
            // Parse the entire left function (including the delimiter)
            const left = this.parseFunction(start);
            // Parse out the implicit body
            ++this.leftrightDepth;
            const body = this.parseExpression(false);
            --this.leftrightDepth;
            // Check the next token
            this.expect("\\right", false);
            const right = this.parseFunction();
            return new ParseNode("leftright", {
                body: body,
                left: left.value.value,
                right: right.value.value,
            }, this.mode);
        } else if (func === "\\begin") {
            // begin...end is similar to left...right
            const begin = this.parseFunction(start);
            const envName = begin.value.name;
            if (!environments.hasOwnProperty(envName)) {
                throw new ParseError(
                    "No such environment: " + envName, begin.value.nameGroup);
            }
            // Build the environment object. Arguments and other information will
            // be made available to the begin and end methods using properties.
            const env = environments[envName];
            const args = this.parseArguments("\\begin{" + envName + "}", env);
            const context = {
                mode: this.mode,
                envName: envName,
                parser: this,
            };
            const result = env.handler(context, args);
            this.expect("\\end", false);
            const endNameToken = this.nextToken;
            const end = this.parseFunction();
            if (end.value.name !== envName) {
                throw new ParseError(
                    "Mismatch: \\begin{" + envName + "} matched " +
                    "by \\end{" + end.value.name + "}",
                    endNameToken);
            }
            result.position = end.position;
            return result;
        } else if (utils.contains(Parser.sizeFuncs, func)) {
            // If we see a sizing function, parse out the implicit body
            this.consumeSpaces();
            const body = this.parseExpression(false);
            return new ParseNode("sizing", {
                // Figure out what size to use based on the list of functions above
                size: utils.indexOf(Parser.sizeFuncs, func) + 1,
                value: body,
            }, this.mode);
        } else if (utils.contains(Parser.styleFuncs, func)) {
            // If we see a styling function, parse out the implicit body
            this.consumeSpaces();
            const body = this.parseExpression(true);
            return new ParseNode("styling", {
                // Figure out what style to use by pulling out the style from
                // the function name
                style: func.slice(1, func.length - 5),
                value: body,
            }, this.mode);
        } else if (func in Parser.oldFontFuncs) {
            const style = Parser.oldFontFuncs[func];
            // If we see an old font function, parse out the implicit body
            this.consumeSpaces();
            const body = this.parseExpression(true);
            if (style.slice(0, 4) === 'text') {
                return new ParseNode("text", {
                    style: style,
                    body: new ParseNode("ordgroup", body, this.mode),
                }, this.mode);
            } else {
                return new ParseNode("font", {
                    font: style,
                    body: new ParseNode("ordgroup", body, this.mode),
                }, this.mode);
            }
        } else if (func === "\\color") {
            // If we see a styling function, parse out the implicit body
            const color = this.parseColorGroup(false);
            if (!color) {
                throw new ParseError("\\color not followed by color");
            }
            const body = this.parseExpression(true);
            return new ParseNode("color", {
                type: "color",
                color: color.result.value,
                value: body,
            }, this.mode);
        } else if (func === "$") {
            if (this.mode === "math") {
                throw new ParseError("$ within math mode");
            }
            this.consume();
            const outerMode = this.mode;
            this.switchMode("math");
            const body = this.parseExpression(false, "$");
            this.expect("$", true);
            this.switchMode(outerMode);
            return new ParseNode("styling", {
                style: "text",
                value: body,
            }, "math");
        } else {
            // Defer to parseFunction if it's not a function we handle
            return this.parseFunction(start);
        }
    }

    /**
     * Parses an entire function, including its base and all of its arguments.
     * The base might either have been parsed already, in which case
     * it is provided as an argument, or it's the next group in the input.
     *
     * @param {ParseFuncOrArgument=} baseGroup optional as described above
     * @return {?ParseNode}
     */
    parseFunction(baseGroup) {
        if (!baseGroup) {
            baseGroup = this.parseGroup();
        }

        if (baseGroup) {
            if (baseGroup.isFunction) {
                const func = baseGroup.result;
                const funcData = functions[func];
                if (this.mode === "text" && !funcData.allowedInText) {
                    throw new ParseError(
                        "Can't use function '" + func + "' in text mode",
                        baseGroup.token);
                } else if (this.mode === "math" &&
                    funcData.allowedInMath === false) {
                    throw new ParseError(
                        "Can't use function '" + func + "' in math mode",
                        baseGroup.token);
                }

                const args = this.parseArguments(func, funcData);
                const token = baseGroup.token;
                const result = this.callFunction(func, args, token);
                return new ParseNode(result.type, result, this.mode);
            } else {
                return baseGroup.result;
            }
        } else {
            return null;
        }
    }

    /**
     * Call a function handler with a suitable context and arguments.
     */
    callFunction(name, args, token) {
        const context = {
            funcName: name,
            parser: this,
            token,
        };
        return functions[name].handler(context, args);
    }

    /**
     * Parses the arguments of a function or environment
     *
     * @param {string} func  "\name" or "\begin{name}"
     * @param {{numArgs:number,numOptionalArgs:number|undefined}} funcData
     * @return the array of arguments
     */
    parseArguments(func, funcData) {
        const totalArgs = funcData.numArgs + funcData.numOptionalArgs;
        if (totalArgs === 0) {
            return [];
        }

        const baseGreediness = funcData.greediness;
        const args = [];

        for (let i = 0; i < totalArgs; i++) {
            const nextToken = this.nextToken;
            const argType = funcData.argTypes && funcData.argTypes[i];
            let arg;
            if (i < funcData.numOptionalArgs) {
                if (argType) {
                    arg = this.parseGroupOfType(argType, true);
                } else {
                    arg = this.parseGroup(true);
                }
                if (!arg) {
                    args.push(null);
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
                            this.handleUnsupportedCmd(),
                            false);
                    } else {
                        throw new ParseError(
                            "Expected group after '" + func + "'", nextToken);
                    }
                }
            }
            let argNode;
            if (arg.isFunction) {
                const argGreediness =
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
        }

        return args;
    }

    /**
     * Parses a group when the mode is changing.
     *
     * @return {?ParseFuncOrArgument}
     */
    parseGroupOfType(innerMode, optional) {
        const outerMode = this.mode;
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
            this.consumeSpaces();
        }
        // By the time we get here, innerMode is one of "text" or "math".
        // We switch the mode of the parser, recurse, then restore the old mode.
        const res = this.parseGroup(optional);
        this.switchMode(outerMode);
        return res;
    }

    consumeSpaces() {
        while (this.nextToken.text === " ") {
            this.consume();
        }
    }

    /**
     * Parses a group, essentially returning the string formed by the
     * brace-enclosed tokens plus some position information.
     *
     * @param {string} modeName  Used to describe the mode in error messages
     * @param {boolean=} optional  Whether the group is optional or required
     */
    parseStringGroup(modeName, optional) {
        if (optional && this.nextToken.text !== "[") {
            return null;
        }
        const outerMode = this.mode;
        this.mode = "text";
        this.expect(optional ? "[" : "{");
        let str = "";
        const firstToken = this.nextToken;
        let lastToken = firstToken;
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
    }

    /**
     * Parses a regex-delimited group: the largest sequence of tokens
     * whose concatenated strings match `regex`. Returns the string
     * formed by the tokens plus some position information.
     *
     * @param {RegExp} regex
     * @param {string} modeName  Used to describe the mode in error messages
     */
    parseRegexGroup(regex, modeName) {
        const outerMode = this.mode;
        this.mode = "text";
        const firstToken = this.nextToken;
        let lastToken = firstToken;
        let str = "";
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
    }

    /**
     * Parses a color description.
     */
    parseColorGroup(optional) {
        const res = this.parseStringGroup("color", optional);
        if (!res) {
            return null;
        }
        const match = (/^(#[a-f0-9]{3}|#[a-f0-9]{6}|[a-z]+)$/i).exec(res.text);
        if (!match) {
            throw new ParseError("Invalid color: '" + res.text + "'", res);
        }
        return new ParseFuncOrArgument(
            new ParseNode("color", match[0], this.mode),
            false);
    }

    /**
     * Parses a size specification, consisting of magnitude and unit.
     */
    parseSizeGroup(optional) {
        let res;
        if (!optional && this.nextToken.text !== "{") {
            res = this.parseRegexGroup(
                /^[-+]? *(?:$|\d+|\d+\.\d*|\.\d*) *[a-z]{0,2} *$/, "size");
        } else {
            res = this.parseStringGroup("size", optional);
        }
        if (!res) {
            return null;
        }
        const match = (/([-+]?) *(\d+(?:\.\d*)?|\.\d+) *([a-z]{2})/).exec(res.text);
        if (!match) {
            throw new ParseError("Invalid size: '" + res.text + "'", res);
        }
        const data = {
            number: +(match[1] + match[2]), // sign + magnitude, cast to number
            unit: match[3],
        };
        if (!validUnit(data)) {
            throw new ParseError("Invalid unit: '" + data.unit + "'", res);
        }
        return new ParseFuncOrArgument(
            new ParseNode("size", data, this.mode),
            false);
    }

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
    parseGroup(optional) {
        const firstToken = this.nextToken;
        // Try to parse an open brace
        if (this.nextToken.text === (optional ? "[" : "{")) {
            // If we get a brace, parse an expression
            this.consume();
            const expression = this.parseExpression(false, optional ? "]" : null);
            const lastToken = this.nextToken;
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
    }

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
    formLigatures(group) {
        let n = group.length - 1;
        for (let i = 0; i < n; ++i) {
            const a = group[i];
            const v = a.value;
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
    }

    /**
     * Parse a single symbol out of the string. Here, we handle both the functions
     * we have defined, as well as the single character symbols
     *
     * @return {?ParseFuncOrArgument}
     */
    parseSymbol() {
        const nucleus = this.nextToken;

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
        } else if (nucleus.text === "$") {
            return new ParseFuncOrArgument(
                nucleus.text,
                false, nucleus);
        } else {
            return null;
        }
    }
}

Parser.prototype.ParseNode = ParseNode;

module.exports = Parser;
