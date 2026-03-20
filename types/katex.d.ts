// Adapted from
// - https://katex.org/docs/options
// - https://katex.org/docs/api
// - https://katex.org/docs/error
// for v0.16.11 on 2024/12/01
// with some references from https://www.npmjs.com/package/@types/katex

/**
 * For the `trust` option in `KatexOptions`, a custom function
 * `handler(context)` can be provided to customize behavior depending on the
 * context (command, arguments e.g. a URL, etc.)
 * @see https://katex.org/docs/options
 */
export type TrustContext =
    | { command: "\\url", url: string, protocol?: string }
    | { command: "\\href", url: string, protocol?: string }
    | { command: "\\includegraphics", url: string, protocol?: string }
    | { command: "\\htmlClass", class: string }
    | { command: "\\htmlId", id: string }
    | { command: "\\htmlStyle", style: string }
    | { command: "\\htmlData", attributes: Record<string, string> }


export type Catcodes = Record<string, number>;

export interface Lexer {
  input: string;
  tokenRegex: RegExp;
  settings: object;
  catcodes: Catcodes;
}

export interface SourceLocation {
  start: number;
  end: number;
  lexer: Lexer;
}

export interface Token {
  text: string;
  loc: SourceLocation | undefined;
  noexpand?: boolean;
  treatAsRelax?: boolean;
}


export type StrictFunction = (
  errorCode:
    | "unknownSymbol"
    | "unicodeTextInMathMode"
    | "mathVsTextUnits"
    | "commentAtEnd"
    | "htmlExtension"
    | "newLineInDisplayMode",
  errorMsg: string,
  token: Token,
) => boolean | "error" | "warn" | "ignore" | undefined;


/**
 * Options for `katex.render` and `katex.renderToString`.
 * @see https://katex.org/docs/options
 */
export interface KatexOptions {
    /**
     * If `true` the math will be rendered in display mode.
     * If `false` the math will be rendered in inline mode.
     * @see https://katex.org/docs/options
     *
     * @default false
     */
    displayMode?: boolean;
    /**
     * Determines the markup language of the output. The valid choices are:
     * - `html`: Outputs KaTeX in HTML only.
     * - `mathml`: Outputs KaTeX in MathML only.
     * - `htmlAndMathml`: Outputs HTML for visual rendering and includes MathML
     * for accessibility.
     *
     * @default "htmlAndMathml"
     */
    output?: "html" | "mathml" | "htmlAndMathml";
    /**
     * If `true`, display math has `\tag`s rendered on the left instead of the
     * right, like `\usepackage[leqno]{amsmath}` in LaTeX.
     *
     * @default false
     */
    leqno?: boolean;
    /**
     * If `true`, display math renders flush left with a `2em` left margin,
     * like `\documentclass[fleqn]` in LaTeX with the `amsmath` package.
     *
     * @default false
     */
    fleqn?: boolean;
    /**
     * If `true`, KaTeX will throw a `ParseError` when it encounters an
     * unsupported command or invalid LaTeX.
     * If `false`, KaTeX will render unsupported commands as text, and render
     * invalid LaTeX as its source code with hover text giving the error, in
     * the color given by `errorColor`.
     *
     * @default true
     */
    throwOnError?: boolean;
    /**
     * A color string given in the format `"#XXX"` or `"#XXXXXX"`. This option
     * determines the color that unsupported commands and invalid LaTeX are
     * rendered in when `throwOnError` is set to `false`.
     *
     * @default "#cc0000"
     */
    errorColor?: string;
    /**
     * A collection of custom macros.
     * @see https://katex.org/docs/options
     */
    macros?: Record<string, MacroDefinition>;
    /**
     * Specifies a minimum thickness, in ems, for fraction lines, `\sqrt` top
     * lines, `{array}` vertical lines, `\hline`, `\hdashline`, `\underline`,
     * `\overline`, and the borders of `\fbox`, `\boxed`, and `\fcolorbox`.
     * The usual value for these items is `0.04`, so for `minRuleThickness`
     * to be effective it should probably take a value slightly above `0.04`,
     * say `0.05` or `0.06`. Negative values will be ignored.
     */
    minRuleThickness?: number;
    /**
     * In early versions of both KaTeX (<0.8.0) and MathJax, the `\color`
     * function expected the content to be a function argument, as in
     * `\color{blue}{hello}`. In current KaTeX, `\color` is a switch, as in
     * `\color{blue}` hello. This matches LaTeX behavior. If you want the old
     * `\color` behavior, set option colorIsTextColor to true.
     */
    colorIsTextColor?: boolean;
    /**
     * All user-specified sizes, e.g. in `\rule{500em}{500em}`, will be capped
     * to `maxSize` ems. If set to `Infinity` (the default), users can make
     * elements and spaces arbitrarily large.
     *
     * @default Infinity
     */
    maxSize?: number;
    /**
     * Limit the number of macro expansions to the specified number, to prevent
     * e.g. infinite macro loops. `\edef` expansion counts all expanded tokens.
     * If set to `Infinity`, the macro expander will try to fully expand as in
     * LaTeX.
     *
     * @default 1000
     */
    maxExpand?: number;
    /**
     * If `false` or `"ignore"`, allow features that make writing LaTeX
     * convenient but are not actually supported by (Xe)LaTeX
     * (similar to MathJax).
     * If `true` or `"error"` (LaTeX faithfulness mode), throw an error for any
     * such transgressions.
     * If `"warn"` (the default), warn about such behavior via `console.warn`.
     * Provide a custom function `handler(errorCode, errorMsg, token)` to
     * customize behavior depending on the type of transgression (summarized by
     * the string code `errorCode` and detailed in `errorMsg`); this function
     * can also return `"ignore"`, `"error"`, or `"warn"` to use a built-in
     * behavior.
     * @see https://katex.org/docs/options
     *
     * @default "warn"
     */
    strict?:
        | boolean
        | "ignore" | "warn" | "error"
        | StrictFunction;
    /**
     * If `false` (do not trust input), prevent any commands like
     * `\includegraphics` that could enable adverse behavior, rendering them
     * instead in `errorColor`.
     * If `true` (trust input), allow all such commands.
     * Provide a custom function `handler(context)` to customize behavior
     * depending on the context (command, arguments e.g. a URL, etc.).
     * @see https://katex.org/docs/options
     *
     * @default false
    */
    trust?: boolean | ((context: TrustContext) => boolean);
    /**
     * Run KaTeX code in the global group. As a consequence, macros defined at
     * the top level by `\def` and `\newcommand` are added to the macros
     * argument and can be used in subsequent render calls. In LaTeX,
     * constructs such as `\begin{equation}` and `$$` create a local group and
     * prevent definitions other than `\gdef` from becoming visible outside of
     * those blocks, so this is KaTeX's default behavior.
     *
     * @default false
     */
    globalGroup?: boolean;
}

/**
 * In-browser rendering
 *
 * Call the `render` function with a TeX expression and a DOM element to
 * render into.
 *
 * @param {string} tex A TeX expression.
 * @param {HTMLElement} element A HTML DOM element.
 * @param {KatexOptions} options An options object.
 * @returns {void}
 * @see https://katex.org/docs/api
 */
export function render(
    tex: string,
    element: HTMLElement,
    options?: KatexOptions,
): void;

/**
 * Server-side rendering or rendering to a string
 *
 * Use the `renderToString` function to generate HTML on the server or to
 * generate an HTML string of the rendered math.
 *
 * @param {string} tex A TeX expression.
 * @param {KatexOptions} options An options object.
 * @returns {string} The HTML string of the rendered math.
 * @see https://katex.org/docs/api
 */
export function renderToString(tex: string, options?: KatexOptions): string;

/**
 * If KaTeX encounters an error (invalid or unsupported LaTeX) and
 * `throwOnError` hasn't been set to `false`, then `katex.render` and
 * `katex.renderToString` will throw an exception of type
 * `ParseError`. The message in this error includes some of the LaTeX source
 * code, so needs to be escaped if you want to render it to HTML.
 * @see https://katex.org/docs/error
 */
export class ParseError implements Error {
    constructor(message: string, token?: object);
    name: "ParseError";
    position: number | undefined;
    length: number | undefined;
    rawMessage: string;
    message: string;
}

export const version: string;

/**
 * Allowed type specifiers in the settings schema.
 */
export type SettingsSchemaType =
    | "boolean" | "string" | "number" | "object" | "function"
    | { enum: string[] };

/**
 * A single entry in the settings schema.
 */
export interface SettingsSchemaEntry {
    /** Allowed type(s) of the setting value. */
    type: SettingsSchemaType | SettingsSchemaType[];
    /** The default value. */
    default?: any;
    /** Description of the setting. */
    description?: string;
    /** Function to process/transform the option value. */
    processor?: (value: any) => any;
    /**
     * CLI argument flag. If not specified, the setting name prefixed with
     * `--` is used. Set to `false` to exclude from the CLI.
     */
    cli?: string | false;
    /** Default value specifically for CLI usage. */
    cliDefault?: any;
    /** Description specifically for CLI help text. */
    cliDescription?: string;
    /** Custom CLI argument processor (see Commander.js docs). */
    cliProcessor?: (value: any, previous: any) => any;
}

/**
 * Schema describing the available KaTeX settings, their types, defaults,
 * and descriptions.
 */
export const SETTINGS_SCHEMA: Record<string, SettingsSchemaEntry>;

// Extension API types

/**
 * Rendering mode: math or text.
 */
export type Mode = "math" | "text";

/**
 * Symbol font: "main" (standard font) or "ams" (AMS fonts).
 */
export type SymbolFont = "main" | "ams";

/**
 * Symbol group type, determining how the symbol is classified for spacing.
 */
export type SymbolGroup =
    | "bin" | "close" | "inner" | "open" | "punct" | "rel"
    | "accent-token" | "mathord" | "op-token" | "spacing" | "textord";

/**
 * Argument type for function arguments.
 */
export type ArgType = "color" | "size" | "url" | "raw" | "original" | "hbox" |
    "primitive" | "math" | "text";

/**
 * Token text values at which parsing should stop.
 */
export type BreakToken = "]" | "}" | "\\endgroup" | "$" | "\\)" | "\\\\" |
    "\\end" | "EOF";

/**
 * Context provided to function handlers.
 */
export interface FunctionContext {
    /** The name of the function being called (e.g. "\\sqrt"). */
    funcName: string;
    /** The KaTeX parser instance. */
    parser: object;
    /** The token that triggered this function. */
    token?: Token;
    /** If set, parsing stops at this token. */
    breakOnTokenText?: BreakToken;
}

/**
 * Properties that control how a function is parsed.
 */
export interface FunctionPropSpec {
    /** The number of required arguments. */
    numArgs: number;
    /**
     * Array of argument types. Length should equal
     * `numOptionalArgs + numArgs`. Types for optional arguments appear
     * before types for mandatory arguments.
     */
    argTypes?: ArgType[];
    /**
     * Whether the function can be used as an argument to primitive
     * commands like `\sqrt` and super/subscript. @default false
     */
    allowedInArgument?: boolean;
    /** Whether the function is allowed inside text mode. @default false */
    allowedInText?: boolean;
    /** Whether the function is allowed inside math mode. @default true */
    allowedInMath?: boolean;
    /**
     * Number of optional arguments. If not found during parsing,
     * `null` is passed to the handler in their place. @default 0
     */
    numOptionalArgs?: number;
    /** Must be true if the function is an infix operator. @default false */
    infix?: boolean;
    /** Whether the function is a TeX primitive. @default false */
    primitive?: boolean;
}

/**
 * Specification for defining a custom LaTeX function with its parse handler
 * and optional HTML/MathML builders.
 */
export interface FunctionDefSpec {
    /** Unique string to differentiate parse nodes. */
    type: string;
    /** LaTeX command names (e.g. ["\\myCmd"]). */
    names: string[];
    /** Properties that control parsing. */
    props: FunctionPropSpec;
    /**
     * Parse handler. Receives (context, args, optArgs) and returns a
     * parse node object (must include `type` and `mode` fields).
     */
    handler: ((
        context: FunctionContext,
        args: object[],
        optArgs: (object | null | undefined)[],
    ) => object) | null | undefined;
    /** Optional HTML rendering function. */
    htmlBuilder?: (group: object, options: object) => object;
    /** Optional MathML rendering function. */
    mathmlBuilder?: (group: object, options: object) => object;
}

/**
 * Context provided to macro handler functions.
 */
export interface MacroContext {
    /** Current parsing mode ("math" or "text"). */
    mode: Mode;
    /** Returns the topmost token on the stack without expanding it. */
    future(): Token;
    /** Remove and return the next unexpanded token. */
    popToken(): Token;
    /** Consume all following space tokens. */
    consumeSpaces(): void;
    /** Expand the next token only once if possible. */
    expandOnce(expandableOnly?: boolean): number | boolean;
    /**
     * Expand the next token only once (if possible), and return the
     * resulting top token on the stack (without removing anything).
     */
    expandAfterFuture(): Token;
    /** Recursively expand first token, then return first non-expandable token. */
    expandNextToken(): Token;
    /**
     * Fully expand the given macro name and return the resulting list of
     * tokens, or return `undefined` if no such macro is defined.
     */
    expandMacro(name: string): Token[] | undefined;
    /**
     * Fully expand the given macro name and return the result as a string,
     * or return `undefined` if no such macro is defined.
     */
    expandMacroAsText(name: string): string | undefined;
    /**
     * Fully expand the given token stream and return the resulting list of
     * tokens. Note that the input tokens are in reverse order, but the
     * output tokens are in forward order.
     */
    expandTokens(tokens: Token[]): Token[];
    /**
     * Consume an argument from the token stream, and return the resulting
     * tokens and start/end token.
     */
    consumeArg(delims?: string[] | null | undefined): MacroArg;
    /** Consume the specified number of arguments from the token stream. */
    consumeArgs(numArgs: number): Token[][];
    /** Determine whether a command is currently "defined" (has some functionality). */
    isDefined(name: string): boolean;
    /** Determine whether a command is expandable. */
    isExpandable(name: string): boolean;
}

/**
 * Result of consuming a macro argument.
 */
export interface MacroArg {
    tokens: Token[];
    start: Token;
    end: Token;
}

/**
 * A structured macro expansion.
 */
export interface MacroExpansion {
    tokens: Token[];
    numArgs: number;
    delimiters?: string[][];
    unexpandable?: boolean;
}

/**
 * A macro definition: a replacement string, a structured expansion,
 * or a function that produces one.
 */
export type MacroDefinition = string | MacroExpansion |
    ((context: MacroContext) => string | MacroExpansion);

// Extension API functions

/**
 * Adds a new function to KaTeX's function list. Functions directly produce
 * parse tree elements and have their own HTML/MathML builders.
 *
 * @param spec - The function definition specification.
 */
export function defineFunction(spec: FunctionDefSpec): void;

/**
 * Adds a new symbol to KaTeX's symbols table.
 *
 * @param mode - "math" or "text" mode.
 * @param font - "main" or "ams" font.
 * @param group - The symbol group type.
 * @param replace - The unicode replacement character, or null.
 * @param name - The LaTeX command name (e.g. "\\mySymbol").
 * @param acceptUnicodeChar - Whether to also accept the unicode character
 *     as input. Only applicable if `replace` is set.
 */
export function defineSymbol(
    mode: Mode,
    font: SymbolFont,
    group: SymbolGroup,
    replace: string | null | undefined,
    name: string,
    acceptUnicodeChar?: boolean,
): void;

/**
 * Adds a new macro to KaTeX's macro list.
 *
 * @param name - The macro name (e.g. "\\myMacro").
 * @param body - The macro body: a replacement string, a structured expansion,
 *     or a function that produces one.
 */
export function defineMacro(
    name: string,
    body: MacroDefinition,
): void;

export as namespace katex;

declare const katex: {
    version: string;
    render: typeof render;
    renderToString: typeof renderToString;
    ParseError: typeof ParseError;
    SETTINGS_SCHEMA: typeof SETTINGS_SCHEMA;
    defineFunction: typeof defineFunction;
    defineSymbol: typeof defineSymbol;
    defineMacro: typeof defineMacro;
};

export default katex;
