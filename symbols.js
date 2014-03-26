/* This file holds a list of all no-argument functions and single-character
 * symbols (like 'a' or ';'). For each of the symbols, there are three
 * properties they can have:
 * - font (required): the font to be used for this * symbol. Either "main" (the
     normal font), or "ams" (the ams fonts)
 * - group (required): the ParseNode group type the symbol should have (i.e.
     "textord" or "mathord" or
 * - replace (optiona): the character that this symbol or function should be
 *   replaced with (i.e. "\phi" has a replace value of "\u03d5", the phi
 *   character in the main font)
 */

var symbols = {
    "`": {
        font: "main",
        group: "textord",
        replace: "\u2018"
    },
    "\\$": {
        font: "main",
        group: "textord",
        replace: "$"
    },
    "\\%": {
        font: "main",
        group: "textord",
        replace: "%"
    },
    "\\angle": {
        font: "main",
        group: "textord",
        replace: "\u2220"
    },
    "\\infty": {
        font: "main",
        group: "textord",
        replace: "\u221e"
    },
    "\\prime": {
        font: "main",
        group: "textord",
        replace: "\u2032"
    },
    "\\triangle": {
        font: "main",
        group: "textord",
        replace: "\u25b3"
    },
    "\\Gamma": {
        font: "main",
        group: "textord",
        replace: "\u0393"
    },
    "\\Delta": {
        font: "main",
        group: "textord",
        replace: "\u0394"
    },
    "\\Theta": {
        font: "main",
        group: "textord",
        replace: "\u0398"
    },
    "\\Lambda": {
        font: "main",
        group: "textord",
        replace: "\u039b"
    },
    "\\Xi": {
        font: "main",
        group: "textord",
        replace: "\u039e"
    },
    "\\Pi": {
        font: "main",
        group: "textord",
        replace: "\u03a0"
    },
    "\\Sigma": {
        font: "main",
        group: "textord",
        replace: "\u03a3"
    },
    "\\Upsilon": {
        font: "main",
        group: "textord",
        replace: "\u03a5"
    },
    "\\Phi": {
        font: "main",
        group: "textord",
        replace: "\u03a6"
    },
    "\\Psi": {
        font: "main",
        group: "textord",
        replace: "\u03a8"
    },
    "\\Omega": {
        font: "main",
        group: "textord",
        replace: "\u03a9"
    },
    "\\alpha": {
        font: "main",
        group: "mathord",
        replace: "\u03b1"
    },
    "\\beta": {
        font: "main",
        group: "mathord",
        replace: "\u03b2"
    },
    "\\gamma": {
        font: "main",
        group: "mathord",
        replace: "\u03b3"
    },
    "\\delta": {
        font: "main",
        group: "mathord",
        replace: "\u03b4"
    },
    "\\epsilon": {
        font: "main",
        group: "mathord",
        replace: "\u03f5"
    },
    "\\zeta": {
        font: "main",
        group: "mathord",
        replace: "\u03b6"
    },
    "\\eta": {
        font: "main",
        group: "mathord",
        replace: "\u03b7"
    },
    "\\theta": {
        font: "main",
        group: "mathord",
        replace: "\u03b8"
    },
    "\\iota": {
        font: "main",
        group: "mathord",
        replace: "\u03b9"
    },
    "\\kappa": {
        font: "main",
        group: "mathord",
        replace: "\u03ba"
    },
    "\\lambda": {
        font: "main",
        group: "mathord",
        replace: "\u03bb"
    },
    "\\mu": {
        font: "main",
        group: "mathord",
        replace: "\u03bc"
    },
    "\\nu": {
        font: "main",
        group: "mathord",
        replace: "\u03bd"
    },
    "\\xi": {
        font: "main",
        group: "mathord",
        replace: "\u03be"
    },
    "\\omicron": {
        font: "main",
        group: "mathord",
        replace: "o"
    },
    "\\pi": {
        font: "main",
        group: "mathord",
        replace: "\u03c0"
    },
    "\\rho": {
        font: "main",
        group: "mathord",
        replace: "\u03c1"
    },
    "\\sigma": {
        font: "main",
        group: "mathord",
        replace: "\u03c3"
    },
    "\\tau": {
        font: "main",
        group: "mathord",
        replace: "\u03c4"
    },
    "\\upsilon": {
        font: "main",
        group: "mathord",
        replace: "\u03c5"
    },
    "\\phi": {
        font: "main",
        group: "mathord",
        replace: "\u03d5"
    },
    "\\chi": {
        font: "main",
        group: "mathord",
        replace: "\u03c7"
    },
    "\\psi": {
        font: "main",
        group: "mathord",
        replace: "\u03c8"
    },
    "\\omega": {
        font: "main",
        group: "mathord",
        replace: "\u03c9"
    },
    "\\varepsilon": {
        font: "main",
        group: "mathord",
        replace: "\u03b5"
    },
    "\\vartheta": {
        font: "main",
        group: "mathord",
        replace: "\u03d1"
    },
    "\\varpi": {
        font: "main",
        group: "mathord",
        replace: "\u03d6"
    },
    "\\varrho": {
        font: "main",
        group: "mathord",
        replace: "\u03f1"
    },
    "\\varsigma": {
        font: "main",
        group: "mathord",
        replace: "\u03c2"
    },
    "\\varphi": {
        font: "main",
        group: "mathord",
        replace: "\u03c6"
    },
    "*": {
        font: "main",
        group: "bin",
        replace: "\u2217"
    },
    "+": {
        font: "main",
        group: "bin"
    },
    "-": {
        font: "main",
        group: "bin",
        replace: "\u2212"
    },
    "\\cdot": {
        font: "main",
        group: "bin",
        replace: "\u22c5"
    },
    "\\circ": {
        font: "main",
        group: "bin",
        replace: "\u2218"
    },
    "\\div": {
        font: "main",
        group: "bin",
        replace: "\u00f7"
    },
    "\\pm": {
        font: "main",
        group: "bin",
        replace: "\u00b1"
    },
    "\\times": {
        font: "main",
        group: "bin",
        replace: "\u00d7"
    },
    "(": {
        font: "main",
        group: "open"
    },
    "[": {
        font: "main",
        group: "open"
    },
    "\\langle": {
        font: "main",
        group: "open",
        replace: "\u27e8"
    },
    "\\lvert": {
        font: "main",
        group: "open",
        replace: "|"
    },
    ")": {
        font: "main",
        group: "close"
    },
    "]": {
        font: "main",
        group: "close"
    },
    "?": {
        font: "main",
        group: "close"
    },
    "!": {
        font: "main",
        group: "close"
    },
    "\\rangle": {
        font: "main",
        group: "close",
        replace: "\u27e9"
    },
    "\\rvert": {
        font: "main",
        group: "close",
        replace: "|"
    },
    "=": {
        font: "main",
        group: "rel"
    },
    "<": {
        font: "main",
        group: "rel"
    },
    ">": {
        font: "main",
        group: "rel"
    },
    ":": {
        font: "main",
        group: "rel"
    },
    "\\approx": {
        font: "main",
        group: "rel",
        replace: "\u2248"
    },
    "\\cong": {
        font: "main",
        group: "rel",
        replace: "\u2245"
    },
    "\\ge": {
        font: "main",
        group: "rel",
        replace: "\u2265"
    },
    "\\geq": {
        font: "main",
        group: "rel",
        replace: "\u2265"
    },
    "\\gets": {
        font: "main",
        group: "rel",
        replace: "\u2190"
    },
    "\\in": {
        font: "main",
        group: "rel",
        replace: "\u2208"
    },
    "\\leftarrow": {
        font: "main",
        group: "rel",
        replace: "\u2190"
    },
    "\\le": {
        font: "main",
        group: "rel",
        replace: "\u2264"
    },
    "\\leq": {
        font: "main",
        group: "rel",
        replace: "\u2264"
    },
    "\\ne": {
        font: "main",
        group: "rel",
        replace: "\u2260"
    },
    "\\neq": {
        font: "main",
        group: "rel",
        replace: "\u2260"
    },
    "\\rightarrow": {
        font: "main",
        group: "rel",
        replace: "\u2192"
    },
    "\\to": {
        font: "main",
        group: "rel",
        replace: "\u2192"
    },
    "\\ngeq": {
        font: "ams",
        group: "rel",
        replace: "\u2271"
    },
    "\\nleq": {
        font: "ams",
        group: "rel",
        replace: "\u2270"
    },
    "\\!": {
        font: "main",
        group: "spacing"
    },
    "\\ ": {
        font: "main",
        group: "spacing",
        replace: "\u00a0"
    },
    "\\,": {
        font: "main",
        group: "spacing"
    },
    "\\:": {
        font: "main",
        group: "spacing"
    },
    "\\;": {
        font: "main",
        group: "spacing"
    },
    "\\enspace": {
        font: "main",
        group: "spacing"
    },
    "\\qquad": {
        font: "main",
        group: "spacing"
    },
    "\\quad": {
        font: "main",
        group: "spacing"
    },
    "\\space": {
        font: "main",
        group: "spacing",
        replace: "\u00a0"
    },
    ",": {
        font: "main",
        group: "punct"
    },
    ";": {
        font: "main",
        group: "punct"
    },
    "\\colon": {
        font: "main",
        group: "punct",
        replace: ":"
    },
    "\\barwedge": {
        font: "ams",
        group: "textord",
        replace: "\u22bc"
    },
    "\\veebar": {
        font: "ams",
        group: "textord",
        replace: "\u22bb"
    },
    "\\odot": {
        font: "main",
        group: "textord",
        replace: "\u2299"
    },
    "\\oplus": {
        font: "main",
        group: "textord",
        replace: "\u2295"
    },
    "\\otimes": {
        font: "main",
        group: "textord",
        replace: "\u2297"
    },
    "\\oslash": {
        font: "main",
        group: "textord",
        replace: "\u2298"
    },
    "\\circledcirc": {
        font: "ams",
        group: "textord",
        replace: "\u229a"
    },
    "\\boxdot": {
        font: "ams",
        group: "textord",
        replace: "\u22a1"
    },
    "\\bigtriangleup": {
        font: "main",
        group: "textord",
        replace: "\u25b3"
    },
    "\\bigtriangledown": {
        font: "main",
        group: "textord",
        replace: "\u25bd"
    },
    "\\dagger": {
        font: "main",
        group: "textord",
        replace: "\u2020"
    },
    "\\diamond": {
        font: "main",
        group: "textord",
        replace: "\u22c4"
    },
    "\\star": {
        font: "main",
        group: "textord",
        replace: "\u22c6"
    },
    "\\triangleleft": {
        font: "main",
        group: "textord",
        replace: "\u25c3"
    },
    "\\triangleright": {
        font: "main",
        group: "textord",
        replace: "\u25b9"
    }
};

var textSymbols = "0123456789/|@.\"";
for (var i = 0; i < textSymbols.length; i++) {
    var ch = textSymbols.charAt(i);
    symbols[ch] = {
        font: "main",
        group: "textord"
    };
}

var mathSymbols = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
for (var i = 0; i < mathSymbols.length; i++) {
    var ch = mathSymbols.charAt(i);
    symbols[ch] = {
        font: "main",
        group: "mathord"
    };
}

module.exports = symbols;
