// @flow
/* eslint no-constant-condition:0 */
import functions from "./functions";
import environments from "./environments";
import MacroExpander from "./MacroExpander";
import symbols, {ATOMS, extraLatin} from "./symbols";
import {validUnit} from "./units";
import {supportedCodepoint} from "./unicodeScripts";
import unicodeAccents from "./unicodeAccents";
import unicodeSymbols from "./unicodeSymbols";
import utils from "./utils";
import {assertNodeType, checkNodeType} from "./parseNode";
import ParseError from "./ParseError";
import {combiningDiacriticalMarksEndRegex, urlFunctionRegex} from "./Lexer";
import Settings from "./Settings";
import SourceLocation from "./SourceLocation";
import {Token} from "./Token";
import type {AnyParseNode, SymbolParseNode} from "./parseNode";
import type {Atom, Group} from "./symbols";
import type {Mode, ArgType, BreakToken} from "./types";
import type {FunctionContext, FunctionSpec} from "./defineFunction";
import type {EnvSpec} from "./defineEnvironment";

/**
 * This file contains the parser used to parse out a TeX expression from the
 * input. Since TeX isn't context-free, standard parsers don't work particularly
 * well.
 *
 * The strategy of this parser is as such:
 *
 * The main functions (the `.parse...` ones) take a position in the current
 * parse string to parse tokens from. The lexer (found in Lexer.js, stored at
 * this.gullet.lexer) also supports pulling out tokens at arbitrary places. When
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
 * ParsedFuncOrArg, which contain a ParseNode as well as some data about
 * whether the parsed object is a function which is missing some arguments, or a
 * standalone object which can be used as an argument to another function.
 */

type ParsedFunc = {|
    type: "fn",
    result: string, // Function name defined via defineFunction (e.g. "\\frac").
    token: Token,
|};
type ParsedArg = {|
    type: "arg",
    result: AnyParseNode,
    token: Token,
|};
type ParsedFuncOrArg = ParsedFunc | ParsedArg;

function newArgument(result: AnyParseNode, token: Token): ParsedArg {
    return {type: "arg", result, token};
}

function newFunction(token: Token): ParsedFunc {
    return {type: "fn", result: token.text, token};
}

export default class Parser {
    mode: Mode;
    gullet: MacroExpander;
    settings: Settings;
    leftrightDepth: number;
    nextToken: Token;

    constructor(input: string, settings: Settings) {
        // Start in math mode
        this.mode = "math";
        // Create a new macro expander (gullet) and (indirectly via that) also a
        // new lexer (mouth) for this parser (stomach, in the language of TeX)
        this.gullet = new MacroExpander(input, settings, this.mode);
        // Store the settings for use in parsing
        this.settings = settings;
        // Count leftright depth (for \middle errors)
        this.leftrightDepth = 0;
    }

    /**
     * Checks a result to make sure it has the right type, and throws an
     * appropriate error otherwise.
     */
    expect(text: string, consume?: boolean = true) {
        if (this.nextToken.text !== text) {
            throw new ParseError(
                "Expected '" + text + "', got '" + this.nextToken.text + "'",
                this.nextToken
            );
        }
        if (consume) {
            this.consume();
        }
    }

    /**
     * Considers the current look ahead token as consumed,
     * and fetches the one after that as the new look ahead.
     */
    consume() {
        this.nextToken = this.gullet.expandNextToken();
    }

    /**
     * Switches between "text" and "math" modes.
     */
    switchMode(newMode: Mode) {
        this.mode = newMode;
        this.gullet.switchMode(newMode);
    }

    /**
     * Main parsing function, which parses an entire input.
     */
    parse(): AnyParseNode[] {
        // Create a group namespace for the math expression.
        // (LaTeX creates a new group for every $...$, $$...$$, \[...\].)
        this.gullet.beginGroup();

        // Use old \color behavior (same as LaTeX's \textcolor) if requested.
        // We do this within the group for the math expression, so it doesn't
        // pollute settings.macros.
        if (this.settings.colorIsTextColor) {
            this.gullet.macros.set("\\color", "\\textcolor");
        }

        // Try to parse the input
        this.consume();
        const parse = this.parseExpression(false);

        // If we succeeded, make sure there's an EOF at the end
        this.expect("EOF", false);

        // End the group namespace for the expression
        this.gullet.endGroup();
        return parse;
    }

    static endOfExpression = ["}", "\\end", "\\right", "&"];

    /**
     * Parses an "expression", which is a list of atoms.
     *
     * `breakOnInfix`: Should the parsing stop when we hit infix nodes? This
     *                 happens when functions have higher precendence han infix
     *                 nodes in implicit parses.
     *
     * `breakOnTokenText`: The text of the token that the expression should end
     *                     with, or `null` if something else should end the
     *                     expression.
     */
    parseExpression(
        breakOnInfix: boolean,
        breakOnTokenText?: BreakToken,
    ): AnyParseNode[] {
        const body = [];
        // Keep adding atoms to the body until we can't parse any more atoms (either
        // we reached the end, a }, or a \right)
        while (true) {
            // Ignore spaces in math mode
            if (this.mode === "math") {
                this.consumeSpaces();
            }
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
            const atom = this.parseAtom(breakOnTokenText);
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
        if (this.mode === "text") {
            this.formLigatures(body);
        }
        return this.handleInfixNodes(body);
    }

    /**
     * Rewrites infix operators such as \over with corresponding commands such
     * as \frac.
     *
     * There can only be one infix operator per group.  If there's more than one
     * then the expression is ambiguous.  This can be resolved by adding {}.
     */
    handleInfixNodes(body: AnyParseNode[]): AnyParseNode[] {
        let overIndex = -1;
        let funcName;

        for (let i = 0; i < body.length; i++) {
            const node = checkNodeType(body[i], "infix");
            if (node) {
                if (overIndex !== -1) {
                    throw new ParseError(
                        "only one infix operator per group",
                        node.token);
                }
                overIndex = i;
                funcName = node.replaceWith;
            }
        }

        if (overIndex !== -1 && funcName) {
            let numerNode;
            let denomNode;

            const numerBody = body.slice(0, overIndex);
            const denomBody = body.slice(overIndex + 1);

            if (numerBody.length === 1 && numerBody[0].type === "ordgroup") {
                numerNode = numerBody[0];
            } else {
                numerNode = {type: "ordgroup", mode: this.mode, body: numerBody};
            }

            if (denomBody.length === 1 && denomBody[0].type === "ordgroup") {
                denomNode = denomBody[0];
            } else {
                denomNode = {type: "ordgroup", mode: this.mode, body: denomBody};
            }

            let node;
            if (funcName === "\\\\abovefrac") {
                node = this.callFunction(funcName,
                    [numerNode, body[overIndex], denomNode], []);
            } else {
                node = this.callFunction(funcName, [numerNode, denomNode], []);
            }
            return [node];
        } else {
            return body;
        }
    }

    // The greediness of a superscript or subscript
    static SUPSUB_GREEDINESS = 1;

    /**
     * Handle a subscript or superscript with nice errors.
     */
    handleSupSubscript(
        name: string,   // For error reporting.
    ): AnyParseNode {
        const symbolToken = this.nextToken;
        const symbol = symbolToken.text;
        this.consume();
        this.consumeSpaces(); // ignore spaces before sup/subscript argument
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
        }

        if (group.type === "fn") {
            // ^ and _ have a greediness, so handle interactions with functions'
            // greediness
            const funcGreediness = functions[group.result].greediness;
            if (funcGreediness > Parser.SUPSUB_GREEDINESS) {
                return this.parseGivenFunction(group);
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
    handleUnsupportedCmd(): AnyParseNode {
        const text = this.nextToken.text;
        const textordArray = [];

        for (let i = 0; i < text.length; i++) {
            textordArray.push({type: "textord", mode: "text", text: text[i]});
        }

        const textNode = {
            type: "text",
            mode: this.mode,
            body: textordArray,
        };

        const colorNode = {
            type: "color",
            mode: this.mode,
            color: this.settings.errorColor,
            body: [textNode],
        };

        this.consume();
        return colorNode;
    }

    /**
     * Parses a group with optional super/subscripts.
     */
    parseAtom(breakOnTokenText?: BreakToken): ?AnyParseNode {
        // The body of an atom is an implicit group, so that things like
        // \left(x\right)^2 work correctly.
        const base = this.parseImplicitGroup(breakOnTokenText);

        // In text mode, we don't have superscripts or subscripts
        if (this.mode === "text") {
            return base;
        }

        // Note that base may be empty (i.e. null) at this point.

        let superscript;
        let subscript;
        while (true) {
            // Guaranteed in math mode, so eat any spaces first.
            this.consumeSpaces();

            // Lex the first token
            const lex = this.nextToken;

            if (lex.text === "\\limits" || lex.text === "\\nolimits") {
                // We got a limit control
                const opNode = checkNodeType(base, "op");
                if (opNode) {
                    const limits = lex.text === "\\limits";
                    opNode.limits = limits;
                    opNode.alwaysHandleSupSub = true;
                } else {
                    throw new ParseError(
                        "Limit controls must follow a math operator",
                        lex);
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
                const prime = {type: "textord", mode: this.mode, text: "\\prime"};

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
                superscript = {type: "ordgroup", mode: this.mode, body: primes};
            } else {
                // If it wasn't ^, _, or ', stop parsing super/subscripts
                break;
            }
        }

        // Base must be set if superscript or subscript are set per logic above,
        // but need to check here for type check to pass.
        if (superscript || subscript) {
            // If we got either a superscript or subscript, create a supsub
            return {
                type: "supsub",
                mode: this.mode,
                base: base,
                sup: superscript,
                sub: subscript,
            };
        } else {
            // Otherwise return the original body
            return base;
        }
    }

    /**
     * Parses an implicit group, which is a group that starts at the end of a
     * specified, and ends right before a higher explicit group ends, or at EOL. It
     * is used for functions that appear to affect the current style, like \Large or
     * \textrm, where instead of keeping a style we just pretend that there is an
     * implicit grouping after it until the end of the group. E.g.
     *   small text {\Large large text} small text again
     */
    parseImplicitGroup(breakOnTokenText?: BreakToken): ?AnyParseNode {
        const start = this.parseSymbol();

        if (start == null) {
            // If we didn't get anything we handle, fall back to parseFunction
            return this.parseFunction();
        } else if (start.type === "arg") {
            // Defer to parseGivenFunction if it's not a function we handle
            return this.parseGivenFunction(start);
        }

        const func = start.result;

        if (func === "\\begin") {
            // begin...end is similar to left...right
            const begin =
                assertNodeType(this.parseGivenFunction(start), "environment");

            const envName = begin.name;
            if (!environments.hasOwnProperty(envName)) {
                throw new ParseError(
                    "No such environment: " + envName, begin.nameGroup);
            }
            // Build the environment object. Arguments and other information will
            // be made available to the begin and end methods using properties.
            const env = environments[envName];
            const {args, optArgs} =
                this.parseArguments("\\begin{" + envName + "}", env);
            const context = {
                mode: this.mode,
                envName: envName,
                parser: this,
            };
            const result = env.handler(context, args, optArgs);
            this.expect("\\end", false);
            const endNameToken = this.nextToken;
            let end = this.parseFunction();
            if (!end) {
                throw new ParseError("failed to parse function after \\end");
            }
            end = assertNodeType(end, "environment");
            if (end.name !== envName) {
                throw new ParseError(
                    `Mismatch: \\begin{${envName}} matched by \\end{${end.name}}`,
                    endNameToken);
            }
            return result;
        } else {
            // Defer to parseGivenFunction if it's not a function we handle
            return this.parseGivenFunction(start, breakOnTokenText);
        }
    }

    /**
     * Parses an entire function, including its base and all of its arguments.
     * It also handles the case where the parsed node is not a function.
     */
    parseFunction(): ?AnyParseNode {
        const baseGroup = this.parseGroup();
        return baseGroup ? this.parseGivenFunction(baseGroup) : null;
    }

    /**
     * Same as parseFunction(), except that the base is provided, guaranteeing a
     * non-nullable result.
     */
    parseGivenFunction(
        baseGroup: ParsedFuncOrArg,
        breakOnTokenText?: BreakToken,
    ): AnyParseNode {
        if (baseGroup.type === "fn") {
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

            // Consume the command token after possibly switching to the
            // mode specified by the function (for instant mode switching),
            // and then immediately switch back.
            if (funcData.consumeMode) {
                const oldMode = this.mode;
                this.switchMode(funcData.consumeMode);
                this.consume();
                this.switchMode(oldMode);
            } else {
                this.consume();
            }
            const {args, optArgs} = this.parseArguments(func, funcData);
            const token = baseGroup.token;
            return this.callFunction(
                func, args, optArgs, token, breakOnTokenText);
        } else {
            return baseGroup.result;
        }
    }

    /**
     * Call a function handler with a suitable context and arguments.
     */
    callFunction(
        name: string,
        args: AnyParseNode[],
        optArgs: (?AnyParseNode)[],
        token?: Token,
        breakOnTokenText?: BreakToken,
    ): AnyParseNode {
        const context: FunctionContext = {
            funcName: name,
            parser: this,
            token,
            breakOnTokenText,
        };
        const func = functions[name];
        if (func && func.handler) {
            return func.handler(context, args, optArgs);
        } else {
            throw new ParseError(`No function handler for ${name}`);
        }
    }

    /**
     * Parses the arguments of a function or environment
     */
    parseArguments(
        func: string,   // Should look like "\name" or "\begin{name}".
        funcData: FunctionSpec<*> | EnvSpec<*>,
    ): {
        args: AnyParseNode[],
        optArgs: (?AnyParseNode)[],
    } {
        const totalArgs = funcData.numArgs + funcData.numOptionalArgs;
        if (totalArgs === 0) {
            return {args: [], optArgs: []};
        }

        const baseGreediness = funcData.greediness;
        const args = [];
        const optArgs = [];

        for (let i = 0; i < totalArgs; i++) {
            const argType = funcData.argTypes && funcData.argTypes[i];
            const isOptional = i < funcData.numOptionalArgs;
            // Ignore spaces between arguments.  As the TeXbook says:
            // "After you have said ‘\def\row#1#2{...}’, you are allowed to
            //  put spaces between the arguments (e.g., ‘\row x n’), because
            //  TeX doesn’t use single spaces as undelimited arguments."
            if (i > 0 && !isOptional) {
                this.consumeSpaces();
            }
            // Also consume leading spaces in math mode, as parseSymbol
            // won't know what to do with them.  This can only happen with
            // macros, e.g. \frac\foo\foo where \foo expands to a space symbol.
            // In LaTeX, the \foo's get treated as (blank) arguments).
            // In KaTeX, for now, both spaces will get consumed.
            // TODO(edemaine)
            if (i === 0 && !isOptional && this.mode === "math") {
                this.consumeSpaces();
            }
            const nextToken = this.nextToken;
            let arg = argType ?
                this.parseGroupOfType(argType, isOptional) :
                this.parseGroup(isOptional);
            if (!arg) {
                if (isOptional) {
                    optArgs.push(null);
                    continue;
                }
                if (!this.settings.throwOnError &&
                    this.nextToken.text[0] === "\\") {
                    arg = newArgument(this.handleUnsupportedCmd(), nextToken);
                } else {
                    throw new ParseError(
                        "Expected group after '" + func + "'", nextToken);
                }
            }
            let argNode: AnyParseNode;
            if (arg.type === "fn") {
                const argGreediness =
                    functions[arg.result].greediness;
                if (argGreediness > baseGreediness) {
                    argNode = this.parseGivenFunction(arg);
                } else {
                    throw new ParseError(
                        "Got function '" + arg.result + "' as " +
                        "argument to '" + func + "'", nextToken);
                }
            } else {
                argNode = arg.result;
            }
            (isOptional ? optArgs : args).push(argNode);
        }

        return {args, optArgs};
    }

    /**
     * Parses a group when the mode is changing.
     */
    parseGroupOfType(
        type: ArgType,  // Used to describe the mode in error messages.
        optional: boolean,
    ): ?ParsedFuncOrArg {
        // Handle `original` argTypes
        if (type === "original") {
            type = this.mode;
        }

        if (type === "color") {
            return this.parseColorGroup(optional);
        }
        if (type === "size") {
            return this.parseSizeGroup(optional);
        }
        if (type === "url") {
            throw new ParseError(
                "Internal bug: 'url' arguments should be handled by Lexer",
                this.nextToken);
        }

        // By the time we get here, type is one of "text" or "math".
        // Specify this as mode to parseGroup.
        return this.parseGroup(optional, type);
    }

    consumeSpaces() {
        while (this.nextToken.text === " ") {
            this.consume();
        }
    }

    /**
     * Parses a group, essentially returning the string formed by the
     * brace-enclosed tokens plus some position information.
     */
    parseStringGroup(
        modeName: ArgType,  // Used to describe the mode in error messages.
        optional: boolean,
    ): ?Token {
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
     */
    parseRegexGroup(
        regex: RegExp,
        modeName: string,   // Used to describe the mode in error messages.
    ): Token {
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
    parseColorGroup(optional: boolean): ?ParsedArg {
        const res = this.parseStringGroup("color", optional);
        if (!res) {
            return null;
        }
        const match = (/^(#[a-f0-9]{3}|#[a-f0-9]{6}|[a-z]+)$/i).exec(res.text);
        if (!match) {
            throw new ParseError("Invalid color: '" + res.text + "'", res);
        }
        return newArgument({
            type: "color-token",
            mode: this.mode,
            color: match[0],
        }, res);
    }

    /**
     * Parses a size specification, consisting of magnitude and unit.
     */
    parseSizeGroup(optional: boolean): ?ParsedArg {
        let res;
        let isBlank = false;
        if (!optional && this.nextToken.text !== "{") {
            res = this.parseRegexGroup(
                /^[-+]? *(?:$|\d+|\d+\.\d*|\.\d*) *[a-z]{0,2} *$/, "size");
        } else {
            res = this.parseStringGroup("size", optional);
        }
        if (!res) {
            return null;
        }
        if (!optional && res.text.length === 0) {
            // Because we've tested for what is !optional, this block won't
            // affect \kern, \hspace, etc. It will capture the mandatory arguments
            // to \genfrac and \above.
            res.text = "0pt";    // Enable \above{}
            isBlank = true;      // This is here specifically for \genfrac
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
        return newArgument({
            type: "size",
            mode: this.mode,
            value: data,
            isBlank,
        }, res);
    }

    /**
     * If `optional` is false or absent, this parses an ordinary group,
     * which is either a single nucleus (like "x") or an expression
     * in braces (like "{x+y}").
     * If `optional` is true, it parses either a bracket-delimited expression
     * (like "[x+y]") or returns null to indicate the absence of a
     * bracket-enclosed group.
     * If `mode` is present, switches to that mode while parsing the group,
     * and switches back after.
     */
    parseGroup(optional?: boolean, mode?: Mode): ?ParsedFuncOrArg {
        const outerMode = this.mode;
        const firstToken = this.nextToken;
        // Try to parse an open brace
        if (this.nextToken.text === (optional ? "[" : "{")) {
            // Switch to specified mode before we expand symbol after brace
            if (mode) {
                this.switchMode(mode);
            }
            // Start a new group namespace
            this.gullet.beginGroup();
            // If we get a brace, parse an expression
            this.consume();
            const expression = this.parseExpression(false, optional ? "]" : "}");
            const lastToken = this.nextToken;
            // Switch mode back before consuming symbol after close brace
            if (mode) {
                this.switchMode(outerMode);
            }
            // End group namespace before consuming symbol after close brace
            this.gullet.endGroup();
            // Make sure we get a close brace
            this.expect(optional ? "]" : "}");
            return newArgument({
                type: "ordgroup",
                mode: this.mode,
                loc: SourceLocation.range(firstToken, lastToken),
                body: expression,
            }, firstToken.range(lastToken, firstToken.text));
        } else {
            // Otherwise, just return a nucleus, or nothing for an optional group
            if (mode) {
                this.switchMode(mode);
            }
            const result = optional ? null : this.parseSymbol();
            if (mode) {
                this.switchMode(outerMode);
            }
            return result;
        }
    }

    /**
     * Form ligature-like combinations of characters for text mode.
     * This includes inputs like "--", "---", "``" and "''".
     * The result will simply replace multiple textord nodes with a single
     * character in each value by a single textord node having multiple
     * characters in its value.  The representation is still ASCII source.
     * The group will be modified in place.
     */
    formLigatures(group: AnyParseNode[]) {
        let n = group.length - 1;
        for (let i = 0; i < n; ++i) {
            const a = group[i];
            // $FlowFixMe: Not every node type has a `text` property.
            const v = a.text;
            if (v === "-" && group[i + 1].text === "-") {
                if (i + 1 < n && group[i + 2].text === "-") {
                    group.splice(i, 3, {
                        type: "textord",
                        mode: "text",
                        loc: SourceLocation.range(a, group[i + 2]),
                        text: "---",
                    });
                    n -= 2;
                } else {
                    group.splice(i, 2, {
                        type: "textord",
                        mode: "text",
                        loc: SourceLocation.range(a, group[i + 1]),
                        text: "--",
                    });
                    n -= 1;
                }
            }
            if ((v === "'" || v === "`") && group[i + 1].text === v) {
                group.splice(i, 2, {
                    type: "textord",
                    mode: "text",
                    loc: SourceLocation.range(a, group[i + 1]),
                    text: v + v,
                });
                n -= 1;
            }
        }
    }

    /**
     * Parse a single symbol out of the string. Here, we handle both the functions
     * we have defined, as well as the single character symbols
     */
    parseSymbol(): ?ParsedFuncOrArg {
        const nucleus = this.nextToken;
        let text = nucleus.text;

        if (functions[text]) {
            // If there exists a function with this name, we return the
            // function and say that it is a function.
            // The token will be consumed later in parseGivenFunction
            // (after possibly switching modes).
            return newFunction(nucleus);
        } else if (/^\\(href|url)[^a-zA-Z]/.test(text)) {
            const match = text.match(urlFunctionRegex);
            if (!match) {
                throw new ParseError(
                    `Internal error: invalid URL token '${text}'`, nucleus);
            }
            const funcName = match[1];
            // match[2] is the only one that can be an empty string,
            // so it must be at the end of the following or chain:
            const rawUrl = match[4] || match[3] || match[2];
            // hyperref package allows backslashes alone in href, but doesn't
            // generate valid links in such cases; we interpret this as
            // "undefined" behaviour, and keep them as-is. Some browser will
            // replace backslashes with forward slashes.
            const url = rawUrl.replace(/\\([#$%&~_^{}])/g, '$1');
            let protocol = /^\s*([^\\/#]*?)(?::|&#0*58|&#x0*3a)/i.exec(url);
            protocol = (protocol != null ? protocol[1] : "_relative");
            const allowed = this.settings.allowedProtocols;
            if (!utils.contains(allowed,  "*") &&
                !utils.contains(allowed, protocol)) {
                throw new ParseError(
                    `Forbidden protocol '${protocol}' in ${funcName}`, nucleus);
            }
            const urlArg = {
                type: "url",
                mode: this.mode,
                url,
            };
            this.consume();
            if (funcName === "\\href") {  // two arguments
                this.consumeSpaces();  // ignore spaces between arguments
                let description = this.parseGroupOfType("original", false);
                if (description == null) {
                    throw new ParseError(`${funcName} missing second argument`,
                        nucleus);
                }
                if (description.type === "fn") {
                    description = this.parseGivenFunction(description);
                } else { // arg.type === "arg"
                    description = description.result;
                }
                return newArgument(this.callFunction(
                    funcName, [urlArg, description], []), nucleus);
            } else {  // one argument (\url)
                return newArgument(this.callFunction(
                    funcName, [urlArg], []), nucleus);
            }
        } else if (/^\\verb[^a-zA-Z]/.test(text)) {
            this.consume();
            let arg = text.slice(5);
            const star = (arg.charAt(0) === "*");
            if (star) {
                arg = arg.slice(1);
            }
            // Lexer's tokenRegex is constructed to always have matching
            // first/last characters.
            if (arg.length < 2 || arg.charAt(0) !== arg.slice(-1)) {
                throw new ParseError(`\\verb assertion failed --
                    please report what input caused this bug`);
            }
            arg = arg.slice(1, -1);  // remove first and last char
            return newArgument({
                type: "verb",
                mode: "text",
                body: arg,
                star,
            }, nucleus);
        }
        // At this point, we should have a symbol, possibly with accents.
        // First expand any accented base symbol according to unicodeSymbols.
        if (unicodeSymbols.hasOwnProperty(text[0]) &&
            !symbols[this.mode][text[0]]) {
            // This behavior is not strict (XeTeX-compatible) in math mode.
            if (this.settings.strict && this.mode === "math") {
                this.settings.reportNonstrict("unicodeTextInMathMode",
                    `Accented Unicode text character "${text[0]}" used in ` +
                    `math mode`, nucleus);
            }
            text = unicodeSymbols[text[0]] + text.substr(1);
        }
        // Strip off any combining characters
        const match = combiningDiacriticalMarksEndRegex.exec(text);
        if (match) {
            text = text.substring(0, match.index);
            if (text === 'i') {
                text = '\u0131';  // dotless i, in math and text mode
            } else if (text === 'j') {
                text = '\u0237';  // dotless j, in math and text mode
            }
        }
        // Recognize base symbol
        let symbol: AnyParseNode;
        if (symbols[this.mode][text]) {
            if (this.settings.strict && this.mode === 'math' &&
                extraLatin.indexOf(text) >= 0) {
                this.settings.reportNonstrict("unicodeTextInMathMode",
                    `Latin-1/Unicode text character "${text[0]}" used in ` +
                    `math mode`, nucleus);
            }
            const group: Group = symbols[this.mode][text].group;
            const loc = SourceLocation.range(nucleus);
            let s: SymbolParseNode;
            if (ATOMS.hasOwnProperty(group)) {
                // $FlowFixMe
                const family: Atom = group;
                s = {
                    type: "atom",
                    mode: this.mode,
                    family,
                    loc,
                    text,
                };
            } else {
                // $FlowFixMe
                s = {
                    type: group,
                    mode: this.mode,
                    loc,
                    text,
                };
            }
            symbol = s;
        } else if (text.charCodeAt(0) >= 0x80) { // no symbol for e.g. ^
            if (this.settings.strict) {
                if (!supportedCodepoint(text.charCodeAt(0))) {
                    this.settings.reportNonstrict("unknownSymbol",
                        `Unrecognized Unicode character "${text[0]}"` +
                        ` (${text.charCodeAt(0)})`, nucleus);
                } else if (this.mode === "math") {
                    this.settings.reportNonstrict("unicodeTextInMathMode",
                        `Unicode text character "${text[0]}" used in math mode`,
                        nucleus);
                }
            }
            symbol = {
                type: "textord",
                mode: this.mode,
                loc: SourceLocation.range(nucleus),
                text,
            };
        } else {
            return null;  // EOF, ^, _, {, }, etc.
        }
        this.consume();
        // Transform combining characters into accents
        if (match) {
            for (let i = 0; i < match[0].length; i++) {
                const accent: string = match[0][i];
                if (!unicodeAccents[accent]) {
                    throw new ParseError(`Unknown accent ' ${accent}'`, nucleus);
                }
                const command = unicodeAccents[accent][this.mode];
                if (!command) {
                    throw new ParseError(
                        `Accent ${accent} unsupported in ${this.mode} mode`,
                        nucleus);
                }
                symbol = {
                    type: "accent",
                    mode: this.mode,
                    loc: SourceLocation.range(nucleus),
                    label: command,
                    isStretchy: false,
                    isShifty: true,
                    base: symbol,
                };
            }
        }
        return newArgument(symbol, nucleus);
    }
}
