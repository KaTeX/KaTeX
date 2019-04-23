// @flow
/**
 * Predefined macros for KaTeX.
 * This can be used to define some commands in terms of others.
 */

import fontMetricsData from "../submodules/katex-fonts/fontMetricsData";
import symbols from "./symbols";
import utils from "./utils";
import {Token} from "./Token";
import ParseError from "./ParseError";
import type Namespace from "./Namespace";

import type {Mode} from "./types";

/**
 * Provides context to macros defined by functions. Implemented by
 * MacroExpander.
 */
export interface MacroContextInterface {
    mode: Mode;

    /**
     * Object mapping macros to their expansions.
     */
    macros: Namespace<MacroDefinition>;

    /**
     * Returns the topmost token on the stack, without expanding it.
     * Similar in behavior to TeX's `\futurelet`.
     */
    future(): Token;

    /**
     * Remove and return the next unexpanded token.
     */
    popToken(): Token;

    /**
     * Expand the next token only once (if possible), and return the resulting
     * top token on the stack (without removing anything from the stack).
     * Similar in behavior to TeX's `\expandafter\futurelet`.
     */
    expandAfterFuture(): Token;

    /**
     * Recursively expand first token, then return first non-expandable token.
     */
    expandNextToken(): Token;

    /**
     * Fully expand the given macro name and return the resulting list of
     * tokens, or return `undefined` if no such macro is defined.
     */
    expandMacro(name: string): Token[] | void;

    /**
     * Fully expand the given macro name and return the result as a string,
     * or return `undefined` if no such macro is defined.
     */
    expandMacroAsText(name: string): string | void;

    /**
     * Consume the specified number of arguments from the token stream,
     * and return the resulting array of arguments.
     */
    consumeArgs(numArgs: number): Token[][];

    /**
     * Determine whether a command is currently "defined" (has some
     * functionality), meaning that it's a macro (in the current group),
     * a function, a symbol, or one of the special commands listed in
     * `implicitCommands`.
     */
    isDefined(name: string): boolean;
}

/** Macro tokens (in reverse order). */
export type MacroExpansion = {tokens: Token[], numArgs: number};

export type MacroDefinition = string | MacroExpansion |
    (MacroContextInterface => (string | MacroExpansion));
export type MacroMap = {[string]: MacroDefinition};

const builtinMacros: MacroMap = {};
export default builtinMacros;

// This function might one day accept an additional argument and do more things.
export function defineMacro(name: string, body: MacroDefinition) {
    builtinMacros[name] = body;
}

//////////////////////////////////////////////////////////////////////
// macro tools

// LaTeX's \@firstoftwo{#1}{#2} expands to #1, skipping #2
// TeX source: \long\def\@firstoftwo#1#2{#1}
defineMacro("\\@firstoftwo", function(context) {
    const args = context.consumeArgs(2);
    return {tokens: args[0], numArgs: 0};
});

// LaTeX's \@secondoftwo{#1}{#2} expands to #2, skipping #1
// TeX source: \long\def\@secondoftwo#1#2{#2}
defineMacro("\\@secondoftwo", function(context) {
    const args = context.consumeArgs(2);
    return {tokens: args[1], numArgs: 0};
});

// LaTeX's \@ifnextchar{#1}{#2}{#3} looks ahead to the next (unexpanded)
// symbol.  If it matches #1, then the macro expands to #2; otherwise, #3.
// Note, however, that it does not consume the next symbol in either case.
defineMacro("\\@ifnextchar", function(context) {
    const args = context.consumeArgs(3);  // symbol, if, else
    const nextToken = context.future();
    if (args[0].length === 1 && args[0][0].text === nextToken.text) {
        return {tokens: args[1], numArgs: 0};
    } else {
        return {tokens: args[2], numArgs: 0};
    }
});

// LaTeX's \@ifstar{#1}{#2} looks ahead to the next (unexpanded) symbol.
// If it is `*`, then it consumes the symbol, and the macro expands to #1;
// otherwise, the macro expands to #2 (without consuming the symbol).
// TeX source: \def\@ifstar#1{\@ifnextchar *{\@firstoftwo{#1}}}
defineMacro("\\@ifstar", "\\@ifnextchar *{\\@firstoftwo{#1}}");

// LaTeX's \TextOrMath{#1}{#2} expands to #1 in text mode, #2 in math mode
defineMacro("\\TextOrMath", function(context) {
    const args = context.consumeArgs(2);
    if (context.mode === 'text') {
        return {tokens: args[0], numArgs: 0};
    } else {
        return {tokens: args[1], numArgs: 0};
    }
});

// Lookup table for parsing numbers in base 8 through 16
const digitToNumber = {
    "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8,
    "9": 9, "a": 10, "A": 10, "b": 11, "B": 11, "c": 12, "C": 12,
    "d": 13, "D": 13, "e": 14, "E": 14, "f": 15, "F": 15,
};

// TeX \char makes a literal character (catcode 12) using the following forms:
// (see The TeXBook, p. 43)
//   \char123  -- decimal
//   \char'123 -- octal
//   \char"123 -- hex
//   \char`x   -- character that can be written (i.e. isn't active)
//   \char`\x  -- character that cannot be written (e.g. %)
// These all refer to characters from the font, so we turn them into special
// calls to a function \@char dealt with in the Parser.
defineMacro("\\char", function(context) {
    let token = context.popToken();
    let base;
    let number = '';
    if (token.text === "'") {
        base = 8;
        token = context.popToken();
    } else if (token.text === '"') {
        base = 16;
        token = context.popToken();
    } else if (token.text === "`") {
        token = context.popToken();
        if (token.text[0] === "\\") {
            number = token.text.charCodeAt(1);
        } else if (token.text === "EOF") {
            throw new ParseError("\\char` missing argument");
        } else {
            number = token.text.charCodeAt(0);
        }
    } else {
        base = 10;
    }
    if (base) {
        // Parse a number in the given base, starting with first `token`.
        number = digitToNumber[token.text];
        if (number == null || number >= base) {
            throw new ParseError(`Invalid base-${base} digit ${token.text}`);
        }
        let digit;
        while ((digit = digitToNumber[context.future().text]) != null &&
               digit < base) {
            number *= base;
            number += digit;
            context.popToken();
        }
    }
    return `\\@char{${number}}`;
});

// Basic support for macro definitions:
//     \def\macro{expansion}
//     \def\macro#1{expansion}
//     \def\macro#1#2{expansion}
//     \def\macro#1#2#3#4#5#6#7#8#9{expansion}
// Also the \gdef and \global\def equivalents
const def = (context, global: boolean) => {
    let arg = context.consumeArgs(1)[0];
    if (arg.length !== 1) {
        throw new ParseError("\\gdef's first argument must be a macro name");
    }
    const name = arg[0].text;
    // Count argument specifiers, and check they are in the order #1 #2 ...
    let numArgs = 0;
    arg = context.consumeArgs(1)[0];
    while (arg.length === 1 && arg[0].text === "#") {
        arg = context.consumeArgs(1)[0];
        if (arg.length !== 1) {
            throw new ParseError(`Invalid argument number length "${arg.length}"`);
        }
        if (!(/^[1-9]$/.test(arg[0].text))) {
            throw new ParseError(`Invalid argument number "${arg[0].text}"`);
        }
        numArgs++;
        if (parseInt(arg[0].text) !== numArgs) {
            throw new ParseError(`Argument number "${arg[0].text}" out of order`);
        }
        arg = context.consumeArgs(1)[0];
    }
    // Final arg is the expansion of the macro
    context.macros.set(name, {
        tokens: arg,
        numArgs,
    }, global);
    return '';
};
defineMacro("\\gdef", (context) => def(context, true));
defineMacro("\\def", (context) => def(context, false));
defineMacro("\\global", (context) => {
    const next = context.consumeArgs(1)[0];
    if (next.length !== 1) {
        throw new ParseError("Invalid command after \\global");
    }
    const command = next[0].text;
    // TODO: Should expand command
    if (command === "\\def") {
        // \global\def is equivalent to \gdef
        return def(context, true);
    } else {
        throw new ParseError(`Invalid command '${command}' after \\global`);
    }
});

// \newcommand{\macro}[args]{definition}
// \renewcommand{\macro}[args]{definition}
// TODO: Optional arguments: \newcommand{\macro}[args][default]{definition}
const newcommand = (context, existsOK: boolean, nonexistsOK: boolean) => {
    let arg = context.consumeArgs(1)[0];
    if (arg.length !== 1) {
        throw new ParseError(
            "\\newcommand's first argument must be a macro name");
    }
    const name = arg[0].text;

    const exists = context.isDefined(name);
    if (exists && !existsOK) {
        throw new ParseError(`\\newcommand{${name}} attempting to redefine ` +
            `${name}; use \\renewcommand`);
    }
    if (!exists && !nonexistsOK) {
        throw new ParseError(`\\renewcommand{${name}} when command ${name} ` +
            `does not yet exist; use \\newcommand`);
    }

    let numArgs = 0;
    arg = context.consumeArgs(1)[0];
    if (arg.length === 1 && arg[0].text === "[") {
        let argText = '';
        let token = context.expandNextToken();
        while (token.text !== "]" && token.text !== "EOF") {
            // TODO: Should properly expand arg, e.g., ignore {}s
            argText += token.text;
            token = context.expandNextToken();
        }
        if (!argText.match(/^\s*[0-9]+\s*$/)) {
            throw new ParseError(`Invalid number of arguments: ${argText}`);
        }
        numArgs = parseInt(argText);
        arg = context.consumeArgs(1)[0];
    }

    // Final arg is the expansion of the macro
    context.macros.set(name, {
        tokens: arg,
        numArgs,
    });
    return '';
};
defineMacro("\\newcommand", (context) => newcommand(context, false, true));
defineMacro("\\renewcommand", (context) => newcommand(context, true, false));
defineMacro("\\providecommand", (context) => newcommand(context, true, true));

//////////////////////////////////////////////////////////////////////
// Grouping
// \let\bgroup={ \let\egroup=}
defineMacro("\\bgroup", "{");
defineMacro("\\egroup", "}");

// Symbols from latex.ltx:
// \def\lq{`}
// \def\rq{'}
// \def \aa {\r a}
// \def \AA {\r A}
defineMacro("\\lq", "`");
defineMacro("\\rq", "'");
defineMacro("\\aa", "\\r a");
defineMacro("\\AA", "\\r A");

// Copyright (C) and registered (R) symbols. Use raw symbol in MathML.
// \DeclareTextCommandDefault{\textcopyright}{\textcircled{c}}
// \DeclareTextCommandDefault{\textregistered}{\textcircled{%
//      \check@mathfonts\fontsize\sf@size\z@\math@fontsfalse\selectfont R}}
// \DeclareRobustCommand{\copyright}{%
//    \ifmmode{\nfss@text{\textcopyright}}\else\textcopyright\fi}
defineMacro("\\textcopyright", "\\html@mathml{\\textcircled{c}}{\\char`©}");
defineMacro("\\copyright",
    "\\TextOrMath{\\textcopyright}{\\text{\\textcopyright}}");
defineMacro("\\textregistered",
    "\\html@mathml{\\textcircled{\\scriptsize R}}{\\char`®}");

// Characters omitted from Unicode range 1D400–1D7FF
defineMacro("\u212C", "\\mathscr{B}");  // script
defineMacro("\u2130", "\\mathscr{E}");
defineMacro("\u2131", "\\mathscr{F}");
defineMacro("\u210B", "\\mathscr{H}");
defineMacro("\u2110", "\\mathscr{I}");
defineMacro("\u2112", "\\mathscr{L}");
defineMacro("\u2133", "\\mathscr{M}");
defineMacro("\u211B", "\\mathscr{R}");
defineMacro("\u212D", "\\mathfrak{C}");  // Fraktur
defineMacro("\u210C", "\\mathfrak{H}");
defineMacro("\u2128", "\\mathfrak{Z}");

// Define \Bbbk with a macro that works in both HTML and MathML.
defineMacro("\\Bbbk", "\\Bbb{k}");

// Unicode middle dot
// The KaTeX fonts do not contain U+00B7. Instead, \cdotp displays
// the dot at U+22C5 and gives it punct spacing.
defineMacro("\u00b7", "\\cdotp");

// \llap and \rlap render their contents in text mode
defineMacro("\\llap", "\\mathllap{\\textrm{#1}}");
defineMacro("\\rlap", "\\mathrlap{\\textrm{#1}}");
defineMacro("\\clap", "\\mathclap{\\textrm{#1}}");

// \not is defined by base/fontmath.ltx via
// \DeclareMathSymbol{\not}{\mathrel}{symbols}{"36}
// It's thus treated like a \mathrel, but defined by a symbol that has zero
// width but extends to the right.  We use \rlap to get that spacing.
// For MathML we write U+0338 here. buildMathML.js will then do the overlay.
defineMacro("\\not", '\\html@mathml{\\mathrel{\\mathrlap\\@not}}{\\char"338}');

// Negated symbols from base/fontmath.ltx:
// \def\neq{\not=} \let\ne=\neq
// \DeclareRobustCommand
//   \notin{\mathrel{\m@th\mathpalette\c@ncel\in}}
// \def\c@ncel#1#2{\m@th\ooalign{$\hfil#1\mkern1mu/\hfil$\crcr$#1#2$}}
defineMacro("\\neq", "\\html@mathml{\\mathrel{\\not=}}{\\mathrel{\\char`≠}}");
defineMacro("\\ne", "\\neq");
defineMacro("\u2260", "\\neq");
defineMacro("\\notin", "\\html@mathml{\\mathrel{{\\in}\\mathllap{/\\mskip1mu}}}"
                       + "{\\mathrel{\\char`∉}}");
defineMacro("\u2209", "\\notin");

// Unicode stacked relations
defineMacro("\u2258", "\\html@mathml{" +
    "\\mathrel{=\\kern{-1em}\\raisebox{0.4em}{$\\scriptsize\\frown$}}" +
    "}{\\mathrel{\\char`\u2258}}");
defineMacro("\u2259",
    "\\html@mathml{\\stackrel{\\tiny\\wedge}{=}}{\\mathrel{\\char`\u2258}}");
defineMacro("\u225A",
    "\\html@mathml{\\stackrel{\\tiny\\vee}{=}}{\\mathrel{\\char`\u225A}}");
defineMacro("\u225B",
    "\\html@mathml{\\stackrel{\\scriptsize\\star}{=}}" +
    "{\\mathrel{\\char`\u225B}}");
defineMacro("\u225D",
    "\\html@mathml{\\stackrel{\\tiny\\mathrm{def}}{=}}" +
    "{\\mathrel{\\char`\u225D}}");
defineMacro("\u225E",
    "\\html@mathml{\\stackrel{\\tiny\\mathrm{m}}{=}}" +
    "{\\mathrel{\\char`\u225E}}");
defineMacro("\u225F",
    "\\html@mathml{\\stackrel{\\tiny?}{=}}{\\mathrel{\\char`\u225F}}");

// Misc Unicode
defineMacro("\u27C2", "\\perp");
defineMacro("\u203C", "\\mathclose{!\\mkern-0.8mu!}");
defineMacro("\u220C", "\\notni");
defineMacro("\u231C", "\\ulcorner");
defineMacro("\u231D", "\\urcorner");
defineMacro("\u231E", "\\llcorner");
defineMacro("\u231F", "\\lrcorner");
defineMacro("\u00A9", "\\copyright");
defineMacro("\u00AE", "\\textregistered");
defineMacro("\uFE0F", "\\textregistered");

//////////////////////////////////////////////////////////////////////
// LaTeX_2ε

// \vdots{\vbox{\baselineskip4\p@  \lineskiplimit\z@
// \kern6\p@\hbox{.}\hbox{.}\hbox{.}}}
// We'll call \varvdots, which gets a glyph from symbols.js.
// The zero-width rule gets us an equivalent to the vertical 6pt kern.
defineMacro("\\vdots", "\\mathord{\\varvdots\\rule{0pt}{15pt}}");
defineMacro("\u22ee", "\\vdots");

//////////////////////////////////////////////////////////////////////
// amsmath.sty
// http://mirrors.concertpass.com/tex-archive/macros/latex/required/amsmath/amsmath.pdf

// Italic Greek capital letters.  AMS defines these with \DeclareMathSymbol,
// but they are equivalent to \mathit{\Letter}.
defineMacro("\\varGamma", "\\mathit{\\Gamma}");
defineMacro("\\varDelta", "\\mathit{\\Delta}");
defineMacro("\\varTheta", "\\mathit{\\Theta}");
defineMacro("\\varLambda", "\\mathit{\\Lambda}");
defineMacro("\\varXi", "\\mathit{\\Xi}");
defineMacro("\\varPi", "\\mathit{\\Pi}");
defineMacro("\\varSigma", "\\mathit{\\Sigma}");
defineMacro("\\varUpsilon", "\\mathit{\\Upsilon}");
defineMacro("\\varPhi", "\\mathit{\\Phi}");
defineMacro("\\varPsi", "\\mathit{\\Psi}");
defineMacro("\\varOmega", "\\mathit{\\Omega}");

// \renewcommand{\colon}{\nobreak\mskip2mu\mathpunct{}\nonscript
// \mkern-\thinmuskip{:}\mskip6muplus1mu\relax}
defineMacro("\\colon", "\\nobreak\\mskip2mu\\mathpunct{}" +
    "\\mathchoice{\\mkern-3mu}{\\mkern-3mu}{}{}{:}\\mskip6mu");

// \newcommand{\boxed}[1]{\fbox{\m@th$\displaystyle#1$}}
defineMacro("\\boxed", "\\fbox{$\\displaystyle{#1}$}");

// \def\iff{\DOTSB\;\Longleftrightarrow\;}
// \def\implies{\DOTSB\;\Longrightarrow\;}
// \def\impliedby{\DOTSB\;\Longleftarrow\;}
defineMacro("\\iff", "\\DOTSB\\;\\Longleftrightarrow\\;");
defineMacro("\\implies", "\\DOTSB\\;\\Longrightarrow\\;");
defineMacro("\\impliedby", "\\DOTSB\\;\\Longleftarrow\\;");

// AMSMath's automatic \dots, based on \mdots@@ macro.
const dotsByToken = {
    ',': '\\dotsc',
    '\\not': '\\dotsb',
    // \keybin@ checks for the following:
    '+': '\\dotsb',
    '=': '\\dotsb',
    '<': '\\dotsb',
    '>': '\\dotsb',
    '-': '\\dotsb',
    '*': '\\dotsb',
    ':': '\\dotsb',
    // Symbols whose definition starts with \DOTSB:
    '\\DOTSB': '\\dotsb',
    '\\coprod': '\\dotsb',
    '\\bigvee': '\\dotsb',
    '\\bigwedge': '\\dotsb',
    '\\biguplus': '\\dotsb',
    '\\bigcap': '\\dotsb',
    '\\bigcup': '\\dotsb',
    '\\prod': '\\dotsb',
    '\\sum': '\\dotsb',
    '\\bigotimes': '\\dotsb',
    '\\bigoplus': '\\dotsb',
    '\\bigodot': '\\dotsb',
    '\\bigsqcup': '\\dotsb',
    '\\And': '\\dotsb',
    '\\longrightarrow': '\\dotsb',
    '\\Longrightarrow': '\\dotsb',
    '\\longleftarrow': '\\dotsb',
    '\\Longleftarrow': '\\dotsb',
    '\\longleftrightarrow': '\\dotsb',
    '\\Longleftrightarrow': '\\dotsb',
    '\\mapsto': '\\dotsb',
    '\\longmapsto': '\\dotsb',
    '\\hookrightarrow': '\\dotsb',
    '\\doteq': '\\dotsb',
    // Symbols whose definition starts with \mathbin:
    '\\mathbin': '\\dotsb',
    // Symbols whose definition starts with \mathrel:
    '\\mathrel': '\\dotsb',
    '\\relbar': '\\dotsb',
    '\\Relbar': '\\dotsb',
    '\\xrightarrow': '\\dotsb',
    '\\xleftarrow': '\\dotsb',
    // Symbols whose definition starts with \DOTSI:
    '\\DOTSI': '\\dotsi',
    '\\int': '\\dotsi',
    '\\oint': '\\dotsi',
    '\\iint': '\\dotsi',
    '\\iiint': '\\dotsi',
    '\\iiiint': '\\dotsi',
    '\\idotsint': '\\dotsi',
    // Symbols whose definition starts with \DOTSX:
    '\\DOTSX': '\\dotsx',
};

defineMacro("\\dots", function(context) {
    // TODO: If used in text mode, should expand to \textellipsis.
    // However, in KaTeX, \textellipsis and \ldots behave the same
    // (in text mode), and it's unlikely we'd see any of the math commands
    // that affect the behavior of \dots when in text mode.  So fine for now
    // (until we support \ifmmode ... \else ... \fi).
    let thedots = '\\dotso';
    const next = context.expandAfterFuture().text;
    if (next in dotsByToken) {
        thedots = dotsByToken[next];
    } else if (next.substr(0, 4) === '\\not') {
        thedots = '\\dotsb';
    } else if (next in symbols.math) {
        if (utils.contains(['bin', 'rel'], symbols.math[next].group)) {
            thedots = '\\dotsb';
        }
    }
    return thedots;
});

const spaceAfterDots = {
    // \rightdelim@ checks for the following:
    ')': true,
    ']': true,
    '\\rbrack': true,
    '\\}': true,
    '\\rbrace': true,
    '\\rangle': true,
    '\\rceil': true,
    '\\rfloor': true,
    '\\rgroup': true,
    '\\rmoustache': true,
    '\\right': true,
    '\\bigr': true,
    '\\biggr': true,
    '\\Bigr': true,
    '\\Biggr': true,
    // \extra@ also tests for the following:
    '$': true,
    // \extrap@ checks for the following:
    ';': true,
    '.': true,
    ',': true,
};

defineMacro("\\dotso", function(context) {
    const next = context.future().text;
    if (next in spaceAfterDots) {
        return "\\ldots\\,";
    } else {
        return "\\ldots";
    }
});

defineMacro("\\dotsc", function(context) {
    const next = context.future().text;
    // \dotsc uses \extra@ but not \extrap@, instead specially checking for
    // ';' and '.', but doesn't check for ','.
    if (next in spaceAfterDots && next !== ',') {
        return "\\ldots\\,";
    } else {
        return "\\ldots";
    }
});

defineMacro("\\cdots", function(context) {
    const next = context.future().text;
    if (next in spaceAfterDots) {
        return "\\@cdots\\,";
    } else {
        return "\\@cdots";
    }
});

defineMacro("\\dotsb", "\\cdots");
defineMacro("\\dotsm", "\\cdots");
defineMacro("\\dotsi", "\\!\\cdots");
// amsmath doesn't actually define \dotsx, but \dots followed by a macro
// starting with \DOTSX implies \dotso, and then \extra@ detects this case
// and forces the added `\,`.
defineMacro("\\dotsx", "\\ldots\\,");

// \let\DOTSI\relax
// \let\DOTSB\relax
// \let\DOTSX\relax
defineMacro("\\DOTSI", "\\relax");
defineMacro("\\DOTSB", "\\relax");
defineMacro("\\DOTSX", "\\relax");

// Spacing, based on amsmath.sty's override of LaTeX defaults
// \DeclareRobustCommand{\tmspace}[3]{%
//   \ifmmode\mskip#1#2\else\kern#1#3\fi\relax}
defineMacro("\\tmspace", "\\TextOrMath{\\kern#1#3}{\\mskip#1#2}\\relax");
// \renewcommand{\,}{\tmspace+\thinmuskip{.1667em}}
// TODO: math mode should use \thinmuskip
defineMacro("\\,", "\\tmspace+{3mu}{.1667em}");
// \let\thinspace\,
defineMacro("\\thinspace", "\\,");
// \def\>{\mskip\medmuskip}
// \renewcommand{\:}{\tmspace+\medmuskip{.2222em}}
// TODO: \> and math mode of \: should use \medmuskip = 4mu plus 2mu minus 4mu
defineMacro("\\>", "\\mskip{4mu}");
defineMacro("\\:", "\\tmspace+{4mu}{.2222em}");
// \let\medspace\:
defineMacro("\\medspace", "\\:");
// \renewcommand{\;}{\tmspace+\thickmuskip{.2777em}}
// TODO: math mode should use \thickmuskip = 5mu plus 5mu
defineMacro("\\;", "\\tmspace+{5mu}{.2777em}");
// \let\thickspace\;
defineMacro("\\thickspace", "\\;");
// \renewcommand{\!}{\tmspace-\thinmuskip{.1667em}}
// TODO: math mode should use \thinmuskip
defineMacro("\\!", "\\tmspace-{3mu}{.1667em}");
// \let\negthinspace\!
defineMacro("\\negthinspace", "\\!");
// \newcommand{\negmedspace}{\tmspace-\medmuskip{.2222em}}
// TODO: math mode should use \medmuskip
defineMacro("\\negmedspace", "\\tmspace-{4mu}{.2222em}");
// \newcommand{\negthickspace}{\tmspace-\thickmuskip{.2777em}}
// TODO: math mode should use \thickmuskip
defineMacro("\\negthickspace", "\\tmspace-{5mu}{.277em}");
// \def\enspace{\kern.5em }
defineMacro("\\enspace", "\\kern.5em ");
// \def\enskip{\hskip.5em\relax}
defineMacro("\\enskip", "\\hskip.5em\\relax");
// \def\quad{\hskip1em\relax}
defineMacro("\\quad", "\\hskip1em\\relax");
// \def\qquad{\hskip2em\relax}
defineMacro("\\qquad", "\\hskip2em\\relax");

// \tag@in@display form of \tag
defineMacro("\\tag", "\\@ifstar\\tag@literal\\tag@paren");
defineMacro("\\tag@paren", "\\tag@literal{({#1})}");
defineMacro("\\tag@literal", (context) => {
    if (context.macros.get("\\df@tag")) {
        throw new ParseError("Multiple \\tag");
    }
    return "\\gdef\\df@tag{\\text{#1}}";
});

// \renewcommand{\bmod}{\nonscript\mskip-\medmuskip\mkern5mu\mathbin
//   {\operator@font mod}\penalty900
//   \mkern5mu\nonscript\mskip-\medmuskip}
// \newcommand{\pod}[1]{\allowbreak
//   \if@display\mkern18mu\else\mkern8mu\fi(#1)}
// \renewcommand{\pmod}[1]{\pod{{\operator@font mod}\mkern6mu#1}}
// \newcommand{\mod}[1]{\allowbreak\if@display\mkern18mu
//   \else\mkern12mu\fi{\operator@font mod}\,\,#1}
// TODO: math mode should use \medmuskip = 4mu plus 2mu minus 4mu
defineMacro("\\bmod",
    "\\mathchoice{\\mskip1mu}{\\mskip1mu}{\\mskip5mu}{\\mskip5mu}" +
    "\\mathbin{\\rm mod}" +
    "\\mathchoice{\\mskip1mu}{\\mskip1mu}{\\mskip5mu}{\\mskip5mu}");
defineMacro("\\pod", "\\allowbreak" +
    "\\mathchoice{\\mkern18mu}{\\mkern8mu}{\\mkern8mu}{\\mkern8mu}(#1)");
defineMacro("\\pmod", "\\pod{{\\rm mod}\\mkern6mu#1}");
defineMacro("\\mod", "\\allowbreak" +
    "\\mathchoice{\\mkern18mu}{\\mkern12mu}{\\mkern12mu}{\\mkern12mu}" +
    "{\\rm mod}\\,\\,#1");

// \pmb    --   A simulation of bold.
// It works by typesetting three copies of the argument with small offsets.
// Ref: a rather lengthy macro in ambsy.sty
defineMacro("\\pmb", "\\html@mathml{\\@binrel{#1}{" +
    "\\mathrlap{#1}" +
    "\\mathrlap{\\mkern0.4mu\\raisebox{0.4mu}{$#1$}}" +
    "{\\mkern0.8mu#1}" +
    "}}{\\mathbf{#1}}");

//////////////////////////////////////////////////////////////////////
// LaTeX source2e

// \\ defaults to \newline, but changes to \cr within array environment
defineMacro("\\\\", "\\newline");

// \def\TeX{T\kern-.1667em\lower.5ex\hbox{E}\kern-.125emX\@}
// TODO: Doesn't normally work in math mode because \@ fails.  KaTeX doesn't
// support \@ yet, so that's omitted, and we add \text so that the result
// doesn't look funny in math mode.
defineMacro("\\TeX", "\\textrm{\\html@mathml{" +
    "T\\kern-.1667em\\raisebox{-.5ex}{E}\\kern-.125emX" +
    "}{TeX}}");

// \DeclareRobustCommand{\LaTeX}{L\kern-.36em%
//         {\sbox\z@ T%
//          \vbox to\ht\z@{\hbox{\check@mathfonts
//                               \fontsize\sf@size\z@
//                               \math@fontsfalse\selectfont
//                               A}%
//                         \vss}%
//         }%
//         \kern-.15em%
//         \TeX}
// This code aligns the top of the A with the T (from the perspective of TeX's
// boxes, though visually the A appears to extend above slightly).
// We compute the corresponding \raisebox when A is rendered at \scriptsize,
// which is size3, which has a scale factor of 0.7 (see Options.js).
const latexRaiseA = fontMetricsData['Main-Regular']["T".charCodeAt(0)][1] -
    0.7 * fontMetricsData['Main-Regular']["A".charCodeAt(0)][1] + "em";
defineMacro("\\LaTeX", "\\textrm{\\html@mathml{" +
    `L\\kern-.36em\\raisebox{${latexRaiseA}}{\\scriptsize A}` +
    "\\kern-.15em\\TeX}{LaTeX}}");

// New KaTeX logo based on tweaking LaTeX logo
defineMacro("\\KaTeX", "\\textrm{\\html@mathml{" +
    `K\\kern-.17em\\raisebox{${latexRaiseA}}{\\scriptsize A}` +
    "\\kern-.15em\\TeX}{KaTeX}}");

// \DeclareRobustCommand\hspace{\@ifstar\@hspacer\@hspace}
// \def\@hspace#1{\hskip  #1\relax}
// \def\@hspacer#1{\vrule \@width\z@\nobreak
//                 \hskip #1\hskip \z@skip}
defineMacro("\\hspace", "\\@ifstar\\@hspacer\\@hspace");
defineMacro("\\@hspace", "\\hskip #1\\relax");
defineMacro("\\@hspacer", "\\rule{0pt}{0pt}\\hskip #1\\relax");

//////////////////////////////////////////////////////////////////////
// mathtools.sty

//\providecommand\ordinarycolon{:}
defineMacro("\\ordinarycolon", ":");
//\def\vcentcolon{\mathrel{\mathop\ordinarycolon}}
//TODO(edemaine): Not yet centered. Fix via \raisebox or #726
defineMacro("\\vcentcolon", "\\mathrel{\\mathop\\ordinarycolon}");
// \providecommand*\dblcolon{\vcentcolon\mathrel{\mkern-.9mu}\vcentcolon}
defineMacro("\\dblcolon", "\\html@mathml{" +
    "\\mathrel{\\vcentcolon\\mathrel{\\mkern-.9mu}\\vcentcolon}}" +
    "{\\mathop{\\char\"2237}}");
// \providecommand*\coloneqq{\vcentcolon\mathrel{\mkern-1.2mu}=}
defineMacro("\\coloneqq", "\\html@mathml{" +
    "\\mathrel{\\vcentcolon\\mathrel{\\mkern-1.2mu}=}}" +
    "{\\mathop{\\char\"2254}}"); // ≔
// \providecommand*\Coloneqq{\dblcolon\mathrel{\mkern-1.2mu}=}
defineMacro("\\Coloneqq", "\\html@mathml{" +
    "\\mathrel{\\dblcolon\\mathrel{\\mkern-1.2mu}=}}" +
    "{\\mathop{\\char\"2237\\char\"3d}}");
// \providecommand*\coloneq{\vcentcolon\mathrel{\mkern-1.2mu}\mathrel{-}}
defineMacro("\\coloneq", "\\html@mathml{" +
    "\\mathrel{\\vcentcolon\\mathrel{\\mkern-1.2mu}\\mathrel{-}}}" +
    "{\\mathop{\\char\"3a\\char\"2212}}");
// \providecommand*\Coloneq{\dblcolon\mathrel{\mkern-1.2mu}\mathrel{-}}
defineMacro("\\Coloneq", "\\html@mathml{" +
    "\\mathrel{\\dblcolon\\mathrel{\\mkern-1.2mu}\\mathrel{-}}}" +
    "{\\mathop{\\char\"2237\\char\"2212}}");
// \providecommand*\eqqcolon{=\mathrel{\mkern-1.2mu}\vcentcolon}
defineMacro("\\eqqcolon", "\\html@mathml{" +
    "\\mathrel{=\\mathrel{\\mkern-1.2mu}\\vcentcolon}}" +
    "{\\mathop{\\char\"2255}}"); // ≕
// \providecommand*\Eqqcolon{=\mathrel{\mkern-1.2mu}\dblcolon}
defineMacro("\\Eqqcolon", "\\html@mathml{" +
    "\\mathrel{=\\mathrel{\\mkern-1.2mu}\\dblcolon}}" +
    "{\\mathop{\\char\"3d\\char\"2237}}");
// \providecommand*\eqcolon{\mathrel{-}\mathrel{\mkern-1.2mu}\vcentcolon}
defineMacro("\\eqcolon", "\\html@mathml{" +
    "\\mathrel{\\mathrel{-}\\mathrel{\\mkern-1.2mu}\\vcentcolon}}" +
    "{\\mathop{\\char\"2239}}");
// \providecommand*\Eqcolon{\mathrel{-}\mathrel{\mkern-1.2mu}\dblcolon}
defineMacro("\\Eqcolon", "\\html@mathml{" +
    "\\mathrel{\\mathrel{-}\\mathrel{\\mkern-1.2mu}\\dblcolon}}" +
    "{\\mathop{\\char\"2212\\char\"2237}}");
// \providecommand*\colonapprox{\vcentcolon\mathrel{\mkern-1.2mu}\approx}
defineMacro("\\colonapprox", "\\html@mathml{" +
    "\\mathrel{\\vcentcolon\\mathrel{\\mkern-1.2mu}\\approx}}" +
    "{\\mathop{\\char\"3a\\char\"2248}}");
// \providecommand*\Colonapprox{\dblcolon\mathrel{\mkern-1.2mu}\approx}
defineMacro("\\Colonapprox", "\\html@mathml{" +
    "\\mathrel{\\dblcolon\\mathrel{\\mkern-1.2mu}\\approx}}" +
    "{\\mathop{\\char\"2237\\char\"2248}}");
// \providecommand*\colonsim{\vcentcolon\mathrel{\mkern-1.2mu}\sim}
defineMacro("\\colonsim", "\\html@mathml{" +
    "\\mathrel{\\vcentcolon\\mathrel{\\mkern-1.2mu}\\sim}}" +
    "{\\mathop{\\char\"3a\\char\"223c}}");
// \providecommand*\Colonsim{\dblcolon\mathrel{\mkern-1.2mu}\sim}
defineMacro("\\Colonsim", "\\html@mathml{" +
    "\\mathrel{\\dblcolon\\mathrel{\\mkern-1.2mu}\\sim}}" +
    "{\\mathop{\\char\"2237\\char\"223c}}");

// Some Unicode characters are implemented with macros to mathtools functions.
defineMacro("\u2237", "\\dblcolon");  // ::
defineMacro("\u2239", "\\eqcolon");  // -:
defineMacro("\u2254", "\\coloneqq");  // :=
defineMacro("\u2255", "\\eqqcolon");  // =:
defineMacro("\u2A74", "\\Coloneqq");  // ::=

//////////////////////////////////////////////////////////////////////
// colonequals.sty

// Alternate names for mathtools's macros:
defineMacro("\\ratio", "\\vcentcolon");
defineMacro("\\coloncolon", "\\dblcolon");
defineMacro("\\colonequals", "\\coloneqq");
defineMacro("\\coloncolonequals", "\\Coloneqq");
defineMacro("\\equalscolon", "\\eqqcolon");
defineMacro("\\equalscoloncolon", "\\Eqqcolon");
defineMacro("\\colonminus", "\\coloneq");
defineMacro("\\coloncolonminus", "\\Coloneq");
defineMacro("\\minuscolon", "\\eqcolon");
defineMacro("\\minuscoloncolon", "\\Eqcolon");
// \colonapprox name is same in mathtools and colonequals.
defineMacro("\\coloncolonapprox", "\\Colonapprox");
// \colonsim name is same in mathtools and colonequals.
defineMacro("\\coloncolonsim", "\\Colonsim");

// Additional macros, implemented by analogy with mathtools definitions:
defineMacro("\\simcolon",
    "\\mathrel{\\sim\\mathrel{\\mkern-1.2mu}\\vcentcolon}");
defineMacro("\\simcoloncolon",
    "\\mathrel{\\sim\\mathrel{\\mkern-1.2mu}\\dblcolon}");
defineMacro("\\approxcolon",
    "\\mathrel{\\approx\\mathrel{\\mkern-1.2mu}\\vcentcolon}");
defineMacro("\\approxcoloncolon",
            "\\mathrel{\\approx\\mathrel{\\mkern-1.2mu}\\dblcolon}");

// Present in newtxmath, pxfonts and txfonts
defineMacro("\\notni", "\\html@mathml{\\not\\ni}{\\mathrel{\\char`\u220C}}");
defineMacro("\\limsup", "\\DOTSB\\mathop{\\operatorname{lim\\,sup}}\\limits");
defineMacro("\\liminf", "\\DOTSB\\mathop{\\operatorname{lim\\,inf}}\\limits");

//////////////////////////////////////////////////////////////////////
// MathML alternates for KaTeX glyphs in the Unicode private area
defineMacro("\\gvertneqq", "\\html@mathml{\\@gvertneqq}{\u2269}");
defineMacro("\\lvertneqq", "\\html@mathml{\\@lvertneqq}{\u2268}");
defineMacro("\\ngeqq", "\\html@mathml{\\@ngeqq}{\u2271}");
defineMacro("\\ngeqslant", "\\html@mathml{\\@ngeqslant}{\u2271}");
defineMacro("\\nleqq", "\\html@mathml{\\@nleqq}{\u2270}");
defineMacro("\\nleqslant", "\\html@mathml{\\@nleqslant}{\u2270}");
defineMacro("\\nshortmid", "\\html@mathml{\\@nshortmid}{∤}");
defineMacro("\\nshortparallel", "\\html@mathml{\\@nshortparallel}{∦}");
defineMacro("\\nsubseteqq", "\\html@mathml{\\@nsubseteqq}{\u2288}");
defineMacro("\\nsupseteqq", "\\html@mathml{\\@nsupseteqq}{\u2289}");
defineMacro("\\varsubsetneq", "\\html@mathml{\\@varsubsetneq}{⊊}");
defineMacro("\\varsubsetneqq", "\\html@mathml{\\@varsubsetneqq}{⫋}");
defineMacro("\\varsupsetneq", "\\html@mathml{\\@varsupsetneq}{⊋}");
defineMacro("\\varsupsetneqq", "\\html@mathml{\\@varsupsetneqq}{⫌}");

//////////////////////////////////////////////////////////////////////
// semantic

// The semantic package renders the next two items by calling a glyph from the
// bbold package. Those glyphs do not exist in the KaTeX fonts. Hence the macros.

defineMacro("\u27e6", "\\mathopen{[\\mkern-3.2mu[}");  // blackboard bold [
defineMacro("\u27e7", "\\mathclose{]\\mkern-3.2mu]}"); // blackboard bold ]
defineMacro("\\llbrace", "\\mathopen{\\{\\mkern-3.2mu[}");  // blackboard bold {
defineMacro("\\rrbrace", "\\mathclose{]\\mkern-3.2mu\\}}"); // blackboard bold }

// TODO: Create variable sized versions of the last two items. I believe that
// will require new font glyphs.

//////////////////////////////////////////////////////////////////////
// texvc.sty

// The texvc package contains macros available in mediawiki pages.
// We omit the functions deprecated at
// https://en.wikipedia.org/wiki/Help:Displaying_a_formula#Deprecated_syntax

// We also omit texvc's \O, which conflicts with \text{\O}

defineMacro("\\darr", "\\downarrow");
defineMacro("\\dArr", "\\Downarrow");
defineMacro("\\Darr", "\\Downarrow");
defineMacro("\\lang", "\\langle");
defineMacro("\\rang", "\\rangle");
defineMacro("\\uarr", "\\uparrow");
defineMacro("\\uArr", "\\Uparrow");
defineMacro("\\Uarr", "\\Uparrow");
defineMacro("\\N", "\\mathbb{N}");
defineMacro("\\R", "\\mathbb{R}");
defineMacro("\\Z", "\\mathbb{Z}");
defineMacro("\\alef", "\\aleph");
defineMacro("\\alefsym", "\\aleph");
defineMacro("\\Alpha", "\\mathrm{A}");
defineMacro("\\Beta", "\\mathrm{B}");
defineMacro("\\bull", "\\bullet");
defineMacro("\\Chi", "\\mathrm{X}");
defineMacro("\\clubs", "\\clubsuit");
defineMacro("\\cnums", "\\mathbb{C}");
defineMacro("\\Complex", "\\mathbb{C}");
defineMacro("\\Dagger", "\\ddagger");
defineMacro("\\diamonds", "\\diamondsuit");
defineMacro("\\empty", "\\emptyset");
defineMacro("\\Epsilon", "\\mathrm{E}");
defineMacro("\\Eta", "\\mathrm{H}");
defineMacro("\\exist", "\\exists");
defineMacro("\\harr", "\\leftrightarrow");
defineMacro("\\hArr", "\\Leftrightarrow");
defineMacro("\\Harr", "\\Leftrightarrow");
defineMacro("\\hearts", "\\heartsuit");
defineMacro("\\image", "\\Im");
defineMacro("\\infin", "\\infty");
defineMacro("\\Iota", "\\mathrm{I}");
defineMacro("\\isin", "\\in");
defineMacro("\\Kappa", "\\mathrm{K}");
defineMacro("\\larr", "\\leftarrow");
defineMacro("\\lArr", "\\Leftarrow");
defineMacro("\\Larr", "\\Leftarrow");
defineMacro("\\lrarr", "\\leftrightarrow");
defineMacro("\\lrArr", "\\Leftrightarrow");
defineMacro("\\Lrarr", "\\Leftrightarrow");
defineMacro("\\Mu", "\\mathrm{M}");
defineMacro("\\natnums", "\\mathbb{N}");
defineMacro("\\Nu", "\\mathrm{N}");
defineMacro("\\Omicron", "\\mathrm{O}");
defineMacro("\\plusmn", "\\pm");
defineMacro("\\rarr", "\\rightarrow");
defineMacro("\\rArr", "\\Rightarrow");
defineMacro("\\Rarr", "\\Rightarrow");
defineMacro("\\real", "\\Re");
defineMacro("\\reals", "\\mathbb{R}");
defineMacro("\\Reals", "\\mathbb{R}");
defineMacro("\\Rho", "\\mathrm{P}");
defineMacro("\\sdot", "\\cdot");
defineMacro("\\sect", "\\S");
defineMacro("\\spades", "\\spadesuit");
defineMacro("\\sub", "\\subset");
defineMacro("\\sube", "\\subseteq");
defineMacro("\\supe", "\\supseteq");
defineMacro("\\Tau", "\\mathrm{T}");
defineMacro("\\thetasym", "\\vartheta");
// TODO: defineMacro("\\varcoppa", "\\\mbox{\\coppa}");
defineMacro("\\weierp", "\\wp");
defineMacro("\\Zeta", "\\mathrm{Z}");

//////////////////////////////////////////////////////////////////////
// statmath.sty
// https://ctan.math.illinois.edu/macros/latex/contrib/statmath/statmath.pdf

defineMacro("\\argmin", "\\DOTSB\\mathop{\\operatorname{arg\\,min}}\\limits");
defineMacro("\\argmax", "\\DOTSB\\mathop{\\operatorname{arg\\,max}}\\limits");

// Custom Khan Academy colors, should be moved to an optional package
defineMacro("\\blue", "\\textcolor{##6495ed}{#1}");
defineMacro("\\orange", "\\textcolor{##ffa500}{#1}");
defineMacro("\\pink", "\\textcolor{##ff00af}{#1}");
defineMacro("\\red", "\\textcolor{##df0030}{#1}");
defineMacro("\\green", "\\textcolor{##28ae7b}{#1}");
defineMacro("\\gray", "\\textcolor{gray}{##1}");
defineMacro("\\purple", "\\textcolor{##9d38bd}{#1}");
defineMacro("\\blueA", "\\textcolor{##ccfaff}{#1}");
defineMacro("\\blueB", "\\textcolor{##80f6ff}{#1}");
defineMacro("\\blueC", "\\textcolor{##63d9ea}{#1}");
defineMacro("\\blueD", "\\textcolor{##11accd}{#1}");
defineMacro("\\blueE", "\\textcolor{##0c7f99}{#1}");
defineMacro("\\tealA", "\\textcolor{##94fff5}{#1}");
defineMacro("\\tealB", "\\textcolor{##26edd5}{#1}");
defineMacro("\\tealC", "\\textcolor{##01d1c1}{#1}");
defineMacro("\\tealD", "\\textcolor{##01a995}{#1}");
defineMacro("\\tealE", "\\textcolor{##208170}{#1}");
defineMacro("\\greenA", "\\textcolor{##b6ffb0}{#1}");
defineMacro("\\greenB", "\\textcolor{##8af281}{#1}");
defineMacro("\\greenC", "\\textcolor{##74cf70}{#1}");
defineMacro("\\greenD", "\\textcolor{##1fab54}{#1}");
defineMacro("\\greenE", "\\textcolor{##0d923f}{#1}");
defineMacro("\\goldA", "\\textcolor{##ffd0a9}{#1}");
defineMacro("\\goldB", "\\textcolor{##ffbb71}{#1}");
defineMacro("\\goldC", "\\textcolor{##ff9c39}{#1}");
defineMacro("\\goldD", "\\textcolor{##e07d10}{#1}");
defineMacro("\\goldE", "\\textcolor{##a75a05}{#1}");
defineMacro("\\redA", "\\textcolor{##fca9a9}{#1}");
defineMacro("\\redB", "\\textcolor{##ff8482}{#1}");
defineMacro("\\redC", "\\textcolor{##f9685d}{#1}");
defineMacro("\\redD", "\\textcolor{##e84d39}{#1}");
defineMacro("\\redE", "\\textcolor{##bc2612}{#1}");
defineMacro("\\maroonA", "\\textcolor{##ffbde0}{#1}");
defineMacro("\\maroonB", "\\textcolor{##ff92c6}{#1}");
defineMacro("\\maroonC", "\\textcolor{##ed5fa6}{#1}");
defineMacro("\\maroonD", "\\textcolor{##ca337c}{#1}");
defineMacro("\\maroonE", "\\textcolor{##9e034e}{#1}");
defineMacro("\\purpleA", "\\textcolor{##ddd7ff}{#1}");
defineMacro("\\purpleB", "\\textcolor{##c6b9fc}{#1}");
defineMacro("\\purpleC", "\\textcolor{##aa87ff}{#1}");
defineMacro("\\purpleD", "\\textcolor{##7854ab}{#1}");
defineMacro("\\purpleE", "\\textcolor{##543b78}{#1}");
defineMacro("\\mintA", "\\textcolor{##f5f9e8}{#1}");
defineMacro("\\mintB", "\\textcolor{##edf2df}{#1}");
defineMacro("\\mintC", "\\textcolor{##e0e5cc}{#1}");
defineMacro("\\grayA", "\\textcolor{##f6f7f7}{#1}");
defineMacro("\\grayB", "\\textcolor{##f0f1f2}{#1}");
defineMacro("\\grayC", "\\textcolor{##e3e5e6}{#1}");
defineMacro("\\grayD", "\\textcolor{##d6d8da}{#1}");
defineMacro("\\grayE", "\\textcolor{##babec2}{#1}");
defineMacro("\\grayF", "\\textcolor{##888d93}{#1}");
defineMacro("\\grayG", "\\textcolor{##626569}{#1}");
defineMacro("\\grayH", "\\textcolor{##3b3e40}{#1}");
defineMacro("\\grayI", "\\textcolor{##21242c}{#1}");
defineMacro("\\kaBlue", "\\textcolor{##314453}{#1}");
defineMacro("\\kaGreen", "\\textcolor{##71B307}{#1}");
