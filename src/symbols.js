/**
 * This file holds a list of all no-argument functions and single-character
 * symbols (like 'a' or ';').
 *
 * For each of the symbols, there are three properties they can have:
 * - font (required): the font to be used for this symbol. Either "main" (the
     normal font), or "ams" (the ams fonts).
 * - group (required): the ParseNode group type the symbol should have (i.e.
     "textord", "mathord", etc).
 * - replace: the character that this symbol or function should be
 *   replaced with (i.e. "\phi" has a replace value of "\u03d5", the phi
 *   character in the main font).
 *
 * The outermost map in the table indicates what mode the symbols should be
 * accepted in (e.g. "math" or "text").
 */

module.exports = {
    math: {},
    text: {}
};

function sym(mode, font, group, replace, name) {
    module.exports[mode][name] = {
        font: font,
        group: group,
        replace: replace
    };
}

// (For some reason jshint believes open and close to be global symbols.)
/* globals -open, -close */

// Some abbreviations for commonly used strings.
// This helps minify the code, and also spotting typos using jshint.

// modes:
var math = "math";
var text = "text";

// fonts:
var main = "main";
var ams = "ams";

// groups:
var accent = "accent";
var bin = "bin";
var close = "close";
var inner = "inner";
var mathord = "mathord";
var op = "op";
var open = "open";
var punct = "punct";
var rel = "rel";
var spacing = "spacing";
var textord = "textord";

// Now comes the symbol table

// Relation Symbols
sym(math, main, rel, "\u2261", "\\equiv");
sym(math, main, rel, "\u227a", "\\prec");
sym(math, main, rel, "\u227b", "\\succ");
sym(math, main, rel, "\u223c", "\\sim");
sym(math, main, rel, "\u22a5", "\\perp");
sym(math, main, rel, "\u2aaf", "\\preceq");
sym(math, main, rel, "\u2ab0", "\\succeq");
sym(math, main, rel, "\u2243", "\\simeq");
sym(math, main, rel, "\u2223", "\\mid");
sym(math, main, rel, "\u226a", "\\ll");
sym(math, main, rel, "\u226b", "\\gg");
sym(math, main, rel, "\u224d", "\\asymp");
sym(math, main, rel, "\u2225", "\\parallel");
sym(math, main, rel, "\u22c8", "\\bowtie");
sym(math, main, rel, "\u2323", "\\smile");
sym(math, main, rel, "\u2291", "\\sqsubseteq");
sym(math, main, rel, "\u2292", "\\sqsupseteq");
sym(math, main, rel, "\u2250", "\\doteq");
sym(math, main, rel, "\u2322", "\\frown");
sym(math, main, rel, "\u220b", "\\ni");
sym(math, main, rel, "\u221d", "\\propto");
sym(math, main, rel, "\u22a2", "\\vdash");
sym(math, main, rel, "\u22a3", "\\dashv");
sym(math, main, rel, "\u220b", "\\owns");

// Punctuation
sym(math, main, punct, "\u002e", "\\ldotp");
sym(math, main, punct, "\u22c5", "\\cdotp");

// Misc Symbols
sym(math, main, textord, "\u0023", "\\#");
sym(math, main, textord, "\u0026", "\\&");
sym(math, main, textord, "\u2135", "\\aleph");
sym(math, main, textord, "\u2200", "\\forall");
sym(math, main, textord, "\u210f", "\\hbar");
sym(math, main, textord, "\u2203", "\\exists");
sym(math, main, textord, "\u2207", "\\nabla");
sym(math, main, textord, "\u266d", "\\flat");
sym(math, main, textord, "\u2113", "\\ell");
sym(math, main, textord, "\u266e", "\\natural");
sym(math, main, textord, "\u2663", "\\clubsuit");
sym(math, main, textord, "\u2118", "\\wp");
sym(math, main, textord, "\u266f", "\\sharp");
sym(math, main, textord, "\u2662", "\\diamondsuit");
sym(math, main, textord, "\u211c", "\\Re");
sym(math, main, textord, "\u2661", "\\heartsuit");
sym(math, main, textord, "\u2111", "\\Im");
sym(math, main, textord, "\u2660", "\\spadesuit");

// Math and Text
sym(math, main, textord, "\u2020", "\\dag");
sym(math, main, textord, "\u2021", "\\ddag");

// Large Delimiters
sym(math, main, close, "\u23b1", "\\rmoustache");
sym(math, main, open, "\u23b0", "\\lmoustache");
sym(math, main, close, "\u27ef", "\\rgroup");
sym(math, main, open, "\u27ee", "\\lgroup");

// Binary Operators
sym(math, main, bin, "\u2213", "\\mp");
sym(math, main, bin, "\u2296", "\\ominus");
sym(math, main, bin, "\u228e", "\\uplus");
sym(math, main, bin, "\u2293", "\\sqcap");
sym(math, main, bin, "\u2217", "\\ast");
sym(math, main, bin, "\u2294", "\\sqcup");
sym(math, main, bin, "\u25ef", "\\bigcirc");
sym(math, main, bin, "\u2219", "\\bullet");
sym(math, main, bin, "\u2021", "\\ddagger");
sym(math, main, bin, "\u2240", "\\wr");
sym(math, main, bin, "\u2a3f", "\\amalg");

// Arrow Symbols
sym(math, main, rel, "\u27f5", "\\longleftarrow");
sym(math, main, rel, "\u21d0", "\\Leftarrow");
sym(math, main, rel, "\u27f8", "\\Longleftarrow");
sym(math, main, rel, "\u27f6", "\\longrightarrow");
sym(math, main, rel, "\u21d2", "\\Rightarrow");
sym(math, main, rel, "\u27f9", "\\Longrightarrow");
sym(math, main, rel, "\u2194", "\\leftrightarrow");
sym(math, main, rel, "\u27f7", "\\longleftrightarrow");
sym(math, main, rel, "\u21d4", "\\Leftrightarrow");
sym(math, main, rel, "\u27fa", "\\Longleftrightarrow");
sym(math, main, rel, "\u21a6", "\\mapsto");
sym(math, main, rel, "\u27fc", "\\longmapsto");
sym(math, main, rel, "\u2197", "\\nearrow");
sym(math, main, rel, "\u21a9", "\\hookleftarrow");
sym(math, main, rel, "\u21aa", "\\hookrightarrow");
sym(math, main, rel, "\u2198", "\\searrow");
sym(math, main, rel, "\u21bc", "\\leftharpoonup");
sym(math, main, rel, "\u21c0", "\\rightharpoonup");
sym(math, main, rel, "\u2199", "\\swarrow");
sym(math, main, rel, "\u21bd", "\\leftharpoondown");
sym(math, main, rel, "\u21c1", "\\rightharpoondown");
sym(math, main, rel, "\u2196", "\\nwarrow");
sym(math, main, rel, "\u21cc", "\\rightleftharpoons");

// AMS Negated Binary Relations
sym(math, ams, rel, "\u226e", "\\nless");
sym(math, ams, rel, "\ue010", "\\nleqslant");
sym(math, ams, rel, "\ue011", "\\nleqq");
sym(math, ams, rel, "\u2a87", "\\lneq");
sym(math, ams, rel, "\u2268", "\\lneqq");
sym(math, ams, rel, "\ue00c", "\\lvertneqq");
sym(math, ams, rel, "\u22e6", "\\lnsim");
sym(math, ams, rel, "\u2a89", "\\lnapprox");
sym(math, ams, rel, "\u2280", "\\nprec");
sym(math, ams, rel, "\u22e0", "\\npreceq");
sym(math, ams, rel, "\u22e8", "\\precnsim");
sym(math, ams, rel, "\u2ab9", "\\precnapprox");
sym(math, ams, rel, "\u2241", "\\nsim");
sym(math, ams, rel, "\ue006", "\\nshortmid");
sym(math, ams, rel, "\u2224", "\\nmid");
sym(math, ams, rel, "\u22ac", "\\nvdash");
sym(math, ams, rel, "\u22ad", "\\nvDash");
sym(math, ams, rel, "\u22ea", "\\ntriangleleft");
sym(math, ams, rel, "\u22ec", "\\ntrianglelefteq");
sym(math, ams, rel, "\u228a", "\\subsetneq");
sym(math, ams, rel, "\ue01a", "\\varsubsetneq");
sym(math, ams, rel, "\u2acb", "\\subsetneqq");
sym(math, ams, rel, "\ue017", "\\varsubsetneqq");
sym(math, ams, rel, "\u226f", "\\ngtr");
sym(math, ams, rel, "\ue00f", "\\ngeqslant");
sym(math, ams, rel, "\ue00e", "\\ngeqq");
sym(math, ams, rel, "\u2a88", "\\gneq");
sym(math, ams, rel, "\u2269", "\\gneqq");
sym(math, ams, rel, "\ue00d", "\\gvertneqq");
sym(math, ams, rel, "\u22e7", "\\gnsim");
sym(math, ams, rel, "\u2a8a", "\\gnapprox");
sym(math, ams, rel, "\u2281", "\\nsucc");
sym(math, ams, rel, "\u22e1", "\\nsucceq");
sym(math, ams, rel, "\u22e9", "\\succnsim");
sym(math, ams, rel, "\u2aba", "\\succnapprox");
sym(math, ams, rel, "\u2246", "\\ncong");
sym(math, ams, rel, "\ue007", "\\nshortparallel");
sym(math, ams, rel, "\u2226", "\\nparallel");
sym(math, ams, rel, "\u22af", "\\nVDash");
sym(math, ams, rel, "\u22eb", "\\ntriangleright");
sym(math, ams, rel, "\u22ed", "\\ntrianglerighteq");
sym(math, ams, rel, "\ue018", "\\nsupseteqq");
sym(math, ams, rel, "\u228b", "\\supsetneq");
sym(math, ams, rel, "\ue01b", "\\varsupsetneq");
sym(math, ams, rel, "\u2acc", "\\supsetneqq");
sym(math, ams, rel, "\ue019", "\\varsupsetneqq");
sym(math, ams, rel, "\u22ae", "\\nVdash");
sym(math, ams, rel, "\u2ab5", "\\precneqq");
sym(math, ams, rel, "\u2ab6", "\\succneqq");
sym(math, ams, rel, "\ue016", "\\nsubseteqq");
sym(math, ams, bin, "\u22b4", "\\unlhd");
sym(math, ams, bin, "\u22b5", "\\unrhd");

// AMS Negated Arrows
sym(math, ams, rel, "\u219a", "\\nleftarrow");
sym(math, ams, rel, "\u219b", "\\nrightarrow");
sym(math, ams, rel, "\u21cd", "\\nLeftarrow");
sym(math, ams, rel, "\u21cf", "\\nRightarrow");
sym(math, ams, rel, "\u21ae", "\\nleftrightarrow");
sym(math, ams, rel, "\u21ce", "\\nLeftrightarrow");

// AMS Misc
sym(math, ams, rel, "\u25b3", "\\vartriangle");
sym(math, ams, textord, "\u210f", "\\hslash");
sym(math, ams, textord, "\u25bd", "\\triangledown");
sym(math, ams, textord, "\u25ca", "\\lozenge");
sym(math, ams, textord, "\u24c8", "\\circledS");
sym(math, ams, textord, "\u2221", "\\measuredangle");
sym(math, ams, textord, "\u2204", "\\nexists");
sym(math, ams, textord, "\u2127", "\\mho");
sym(math, ams, textord, "\u2132", "\\Finv");
sym(math, ams, textord, "\u2141", "\\Game");
sym(math, ams, textord, "\u006b", "\\Bbbk");
sym(math, ams, textord, "\u2035", "\\backprime");
sym(math, ams, textord, "\u25b2", "\\blacktriangle");
sym(math, ams, textord, "\u25bc", "\\blacktriangledown");
sym(math, ams, textord, "\u25a0", "\\blacksquare");
sym(math, ams, textord, "\u29eb", "\\blacklozenge");
sym(math, ams, textord, "\u2605", "\\bigstar");
sym(math, ams, textord, "\u2222", "\\sphericalangle");
sym(math, ams, textord, "\u2201", "\\complement");
sym(math, ams, textord, "\u00f0", "\\eth");
sym(math, ams, textord, "\u2571", "\\diagup");
sym(math, ams, textord, "\u2572", "\\diagdown");
sym(math, ams, textord, "\u25a1", "\\square");
sym(math, ams, textord, "\u25a1", "\\Box");
sym(math, ams, textord, "\u25ca", "\\Diamond");
sym(math, ams, textord, "\u00a5", "\\yen");

// AMS Hebrew
sym(math, ams, textord, "\u2136", "\\beth");
sym(math, ams, textord, "\u2138", "\\daleth");
sym(math, ams, textord, "\u2137", "\\gimel");

// AMS Greek
sym(math, ams, textord, "\u03dd", "\\digamma");
sym(math, ams, textord, "\u03f0", "\\varkappa");

// AMS Delimiters
sym(math, ams, textord, "\u250c", "\\ulcorner");
sym(math, ams, textord, "\u2510", "\\urcorner");
sym(math, ams, textord, "\u2514", "\\llcorner");
sym(math, ams, textord, "\u2518", "\\lrcorner");

// AMS Binary Relations
sym(math, ams, rel, "\u2266", "\\leqq");
sym(math, ams, rel, "\u2a7d", "\\leqslant");
sym(math, ams, rel, "\u2a95", "\\eqslantless");
sym(math, ams, rel, "\u2272", "\\lesssim");
sym(math, ams, rel, "\u2a85", "\\lessapprox");
sym(math, ams, rel, "\u224a", "\\approxeq");
sym(math, ams, bin, "\u22d6", "\\lessdot");
sym(math, ams, rel, "\u22d8", "\\lll");
sym(math, ams, rel, "\u2276", "\\lessgtr");
sym(math, ams, rel, "\u22da", "\\lesseqgtr");
sym(math, ams, rel, "\u2a8b", "\\lesseqqgtr");
sym(math, ams, rel, "\u2251", "\\doteqdot");
sym(math, ams, rel, "\u2253", "\\risingdotseq");
sym(math, ams, rel, "\u2252", "\\fallingdotseq");
sym(math, ams, rel, "\u223d", "\\backsim");
sym(math, ams, rel, "\u22cd", "\\backsimeq");
sym(math, ams, rel, "\u2ac5", "\\subseteqq");
sym(math, ams, rel, "\u22d0", "\\Subset");
sym(math, ams, rel, "\u228f", "\\sqsubset");
sym(math, ams, rel, "\u227c", "\\preccurlyeq");
sym(math, ams, rel, "\u22de", "\\curlyeqprec");
sym(math, ams, rel, "\u227e", "\\precsim");
sym(math, ams, rel, "\u2ab7", "\\precapprox");
sym(math, ams, rel, "\u22b2", "\\vartriangleleft");
sym(math, ams, rel, "\u22b4", "\\trianglelefteq");
sym(math, ams, rel, "\u22a8", "\\vDash");
sym(math, ams, rel, "\u22aa", "\\Vvdash");
sym(math, ams, rel, "\u2323", "\\smallsmile");
sym(math, ams, rel, "\u2322", "\\smallfrown");
sym(math, ams, rel, "\u224f", "\\bumpeq");
sym(math, ams, rel, "\u224e", "\\Bumpeq");
sym(math, ams, rel, "\u2267", "\\geqq");
sym(math, ams, rel, "\u2a7e", "\\geqslant");
sym(math, ams, rel, "\u2a96", "\\eqslantgtr");
sym(math, ams, rel, "\u2273", "\\gtrsim");
sym(math, ams, rel, "\u2a86", "\\gtrapprox");
sym(math, ams, bin, "\u22d7", "\\gtrdot");
sym(math, ams, rel, "\u22d9", "\\ggg");
sym(math, ams, rel, "\u2277", "\\gtrless");
sym(math, ams, rel, "\u22db", "\\gtreqless");
sym(math, ams, rel, "\u2a8c", "\\gtreqqless");
sym(math, ams, rel, "\u2256", "\\eqcirc");
sym(math, ams, rel, "\u2257", "\\circeq");
sym(math, ams, rel, "\u225c", "\\triangleq");
sym(math, ams, rel, "\u223c", "\\thicksim");
sym(math, ams, rel, "\u2248", "\\thickapprox");
sym(math, ams, rel, "\u2ac6", "\\supseteqq");
sym(math, ams, rel, "\u22d1", "\\Supset");
sym(math, ams, rel, "\u2290", "\\sqsupset");
sym(math, ams, rel, "\u227d", "\\succcurlyeq");
sym(math, ams, rel, "\u22df", "\\curlyeqsucc");
sym(math, ams, rel, "\u227f", "\\succsim");
sym(math, ams, rel, "\u2ab8", "\\succapprox");
sym(math, ams, rel, "\u22b3", "\\vartriangleright");
sym(math, ams, rel, "\u22b5", "\\trianglerighteq");
sym(math, ams, rel, "\u22a9", "\\Vdash");
sym(math, ams, rel, "\u2223", "\\shortmid");
sym(math, ams, rel, "\u2225", "\\shortparallel");
sym(math, ams, rel, "\u226c", "\\between");
sym(math, ams, rel, "\u22d4", "\\pitchfork");
sym(math, ams, rel, "\u221d", "\\varpropto");
sym(math, ams, rel, "\u25c0", "\\blacktriangleleft");
sym(math, ams, rel, "\u2234", "\\therefore");
sym(math, ams, rel, "\u220d", "\\backepsilon");
sym(math, ams, rel, "\u25b6", "\\blacktriangleright");
sym(math, ams, rel, "\u2235", "\\because");
sym(math, ams, rel, "\u22d8", "\\llless");
sym(math, ams, rel, "\u22d9", "\\gggtr");
sym(math, ams, bin, "\u22b2", "\\lhd");
sym(math, ams, bin, "\u22b3", "\\rhd");
sym(math, ams, rel, "\u2242", "\\eqsim");
sym(math, main, rel, "\u22c8", "\\Join");
sym(math, ams, rel, "\u2251", "\\Doteq");

// AMS Binary Operators
sym(math, ams, bin, "\u2214", "\\dotplus");
sym(math, ams, bin, "\u2216", "\\smallsetminus");
sym(math, ams, bin, "\u22d2", "\\Cap");
sym(math, ams, bin, "\u22d3", "\\Cup");
sym(math, ams, bin, "\u2a5e", "\\doublebarwedge");
sym(math, ams, bin, "\u229f", "\\boxminus");
sym(math, ams, bin, "\u229e", "\\boxplus");
sym(math, ams, bin, "\u22c7", "\\divideontimes");
sym(math, ams, bin, "\u22c9", "\\ltimes");
sym(math, ams, bin, "\u22ca", "\\rtimes");
sym(math, ams, bin, "\u22cb", "\\leftthreetimes");
sym(math, ams, bin, "\u22cc", "\\rightthreetimes");
sym(math, ams, bin, "\u22cf", "\\curlywedge");
sym(math, ams, bin, "\u22ce", "\\curlyvee");
sym(math, ams, bin, "\u229d", "\\circleddash");
sym(math, ams, bin, "\u229b", "\\circledast");
sym(math, ams, bin, "\u22c5", "\\centerdot");
sym(math, ams, bin, "\u22ba", "\\intercal");
sym(math, ams, bin, "\u22d2", "\\doublecap");
sym(math, ams, bin, "\u22d3", "\\doublecup");
sym(math, ams, bin, "\u22a0", "\\boxtimes");

// AMS Arrows
sym(math, ams, rel, "\u21e2", "\\dashrightarrow");
sym(math, ams, rel, "\u21e0", "\\dashleftarrow");
sym(math, ams, rel, "\u21c7", "\\leftleftarrows");
sym(math, ams, rel, "\u21c6", "\\leftrightarrows");
sym(math, ams, rel, "\u21da", "\\Lleftarrow");
sym(math, ams, rel, "\u219e", "\\twoheadleftarrow");
sym(math, ams, rel, "\u21a2", "\\leftarrowtail");
sym(math, ams, rel, "\u21ab", "\\looparrowleft");
sym(math, ams, rel, "\u21cb", "\\leftrightharpoons");
sym(math, ams, rel, "\u21b6", "\\curvearrowleft");
sym(math, ams, rel, "\u21ba", "\\circlearrowleft");
sym(math, ams, rel, "\u21b0", "\\Lsh");
sym(math, ams, rel, "\u21c8", "\\upuparrows");
sym(math, ams, rel, "\u21bf", "\\upharpoonleft");
sym(math, ams, rel, "\u21c3", "\\downharpoonleft");
sym(math, ams, rel, "\u22b8", "\\multimap");
sym(math, ams, rel, "\u21ad", "\\leftrightsquigarrow");
sym(math, ams, rel, "\u21c9", "\\rightrightarrows");
sym(math, ams, rel, "\u21c4", "\\rightleftarrows");
sym(math, ams, rel, "\u21a0", "\\twoheadrightarrow");
sym(math, ams, rel, "\u21a3", "\\rightarrowtail");
sym(math, ams, rel, "\u21ac", "\\looparrowright");
sym(math, ams, rel, "\u21b7", "\\curvearrowright");
sym(math, ams, rel, "\u21bb", "\\circlearrowright");
sym(math, ams, rel, "\u21b1", "\\Rsh");
sym(math, ams, rel, "\u21ca", "\\downdownarrows");
sym(math, ams, rel, "\u21be", "\\upharpoonright");
sym(math, ams, rel, "\u21c2", "\\downharpoonright");
sym(math, ams, rel, "\u21dd", "\\rightsquigarrow");
sym(math, ams, rel, "\u21dd", "\\leadsto");
sym(math, ams, rel, "\u21db", "\\Rrightarrow");
sym(math, ams, rel, "\u21be", "\\restriction");

sym(math, main, textord, "\u2018", "`");
sym(math, main, textord, "$", "\\$");
sym(math, main, textord, "%", "\\%");
sym(math, main, textord, "_", "\\_");
sym(math, main, textord, "\u2220", "\\angle");
sym(math, main, textord, "\u221e", "\\infty");
sym(math, main, textord, "\u2032", "\\prime");
sym(math, main, textord, "\u25b3", "\\triangle");
sym(math, main, textord, "\u0393", "\\Gamma");
sym(math, main, textord, "\u0394", "\\Delta");
sym(math, main, textord, "\u0398", "\\Theta");
sym(math, main, textord, "\u039b", "\\Lambda");
sym(math, main, textord, "\u039e", "\\Xi");
sym(math, main, textord, "\u03a0", "\\Pi");
sym(math, main, textord, "\u03a3", "\\Sigma");
sym(math, main, textord, "\u03a5", "\\Upsilon");
sym(math, main, textord, "\u03a6", "\\Phi");
sym(math, main, textord, "\u03a8", "\\Psi");
sym(math, main, textord, "\u03a9", "\\Omega");
sym(math, main, textord, "\u00ac", "\\neg");
sym(math, main, textord, "\u00ac", "\\lnot");
sym(math, main, textord, "\u22a4", "\\top");
sym(math, main, textord, "\u22a5", "\\bot");
sym(math, main, textord, "\u2205", "\\emptyset");
sym(math, ams, textord, "\u2205", "\\varnothing");
sym(math, main, mathord, "\u03b1", "\\alpha");
sym(math, main, mathord, "\u03b2", "\\beta");
sym(math, main, mathord, "\u03b3", "\\gamma");
sym(math, main, mathord, "\u03b4", "\\delta");
sym(math, main, mathord, "\u03f5", "\\epsilon");
sym(math, main, mathord, "\u03b6", "\\zeta");
sym(math, main, mathord, "\u03b7", "\\eta");
sym(math, main, mathord, "\u03b8", "\\theta");
sym(math, main, mathord, "\u03b9", "\\iota");
sym(math, main, mathord, "\u03ba", "\\kappa");
sym(math, main, mathord, "\u03bb", "\\lambda");
sym(math, main, mathord, "\u03bc", "\\mu");
sym(math, main, mathord, "\u03bd", "\\nu");
sym(math, main, mathord, "\u03be", "\\xi");
sym(math, main, mathord, "o", "\\omicron");
sym(math, main, mathord, "\u03c0", "\\pi");
sym(math, main, mathord, "\u03c1", "\\rho");
sym(math, main, mathord, "\u03c3", "\\sigma");
sym(math, main, mathord, "\u03c4", "\\tau");
sym(math, main, mathord, "\u03c5", "\\upsilon");
sym(math, main, mathord, "\u03d5", "\\phi");
sym(math, main, mathord, "\u03c7", "\\chi");
sym(math, main, mathord, "\u03c8", "\\psi");
sym(math, main, mathord, "\u03c9", "\\omega");
sym(math, main, mathord, "\u03b5", "\\varepsilon");
sym(math, main, mathord, "\u03d1", "\\vartheta");
sym(math, main, mathord, "\u03d6", "\\varpi");
sym(math, main, mathord, "\u03f1", "\\varrho");
sym(math, main, mathord, "\u03c2", "\\varsigma");
sym(math, main, mathord, "\u03c6", "\\varphi");
sym(math, main, bin, "\u2217", "*");
sym(math, main, bin, "+", "+");
sym(math, main, bin, "\u2212", "-");
sym(math, main, bin, "\u22c5", "\\cdot");
sym(math, main, bin, "\u2218", "\\circ");
sym(math, main, bin, "\u00f7", "\\div");
sym(math, main, bin, "\u00b1", "\\pm");
sym(math, main, bin, "\u00d7", "\\times");
sym(math, main, bin, "\u2229", "\\cap");
sym(math, main, bin, "\u222a", "\\cup");
sym(math, main, bin, "\u2216", "\\setminus");
sym(math, main, bin, "\u2227", "\\land");
sym(math, main, bin, "\u2228", "\\lor");
sym(math, main, bin, "\u2227", "\\wedge");
sym(math, main, bin, "\u2228", "\\vee");
sym(math, main, textord, "\u221a", "\\surd");
sym(math, main, open, "(", "(");
sym(math, main, open, "[", "[");
sym(math, main, open, "\u27e8", "\\langle");
sym(math, main, open, "\u2223", "\\lvert");
sym(math, main, close, ")", ")");
sym(math, main, close, "]", "]");
sym(math, main, close, "?", "?");
sym(math, main, close, "!", "!");
sym(math, main, close, "\u27e9", "\\rangle");
sym(math, main, close, "\u2223", "\\rvert");
sym(math, main, rel, "=", "=");
sym(math, main, rel, "<", "<");
sym(math, main, rel, ">", ">");
sym(math, main, rel, ":", ":");
sym(math, main, rel, "\u2248", "\\approx");
sym(math, main, rel, "\u2245", "\\cong");
sym(math, main, rel, "\u2265", "\\ge");
sym(math, main, rel, "\u2265", "\\geq");
sym(math, main, rel, "\u2190", "\\gets");
sym(math, main, rel, "\u2208", "\\in");
sym(math, main, rel, "\u2209", "\\notin");
sym(math, main, rel, "\u2282", "\\subset");
sym(math, main, rel, "\u2283", "\\supset");
sym(math, main, rel, "\u2286", "\\subseteq");
sym(math, main, rel, "\u2287", "\\supseteq");
sym(math, ams, rel, "\u2288", "\\nsubseteq");
sym(math, ams, rel, "\u2289", "\\nsupseteq");
sym(math, main, rel, "\u22a8", "\\models");
sym(math, main, rel, "\u2190", "\\leftarrow");
sym(math, main, rel, "\u2264", "\\le");
sym(math, main, rel, "\u2264", "\\leq");
sym(math, main, rel, "\u2260", "\\ne");
sym(math, main, rel, "\u2260", "\\neq");
sym(math, main, rel, "\u2192", "\\rightarrow");
sym(math, main, rel, "\u2192", "\\to");
sym(math, ams, rel, "\u2271", "\\ngeq");
sym(math, ams, rel, "\u2270", "\\nleq");
sym(math, main, spacing, null, "\\!");
sym(math, main, spacing, "\u00a0", "\\ ");
sym(math, main, spacing, "\u00a0", "~");
sym(math, main, spacing, null, "\\,");
sym(math, main, spacing, null, "\\:");
sym(math, main, spacing, null, "\\;");
sym(math, main, spacing, null, "\\enspace");
sym(math, main, spacing, null, "\\qquad");
sym(math, main, spacing, null, "\\quad");
sym(math, main, spacing, "\u00a0", "\\space");
sym(math, main, punct, ",", ",");
sym(math, main, punct, ";", ";");
sym(math, main, punct, ":", "\\colon");
sym(math, ams, textord, "\u22bc", "\\barwedge");
sym(math, ams, textord, "\u22bb", "\\veebar");
sym(math, main, bin, "\u2299", "\\odot");
sym(math, main, bin, "\u2295", "\\oplus");
sym(math, main, bin, "\u2297", "\\otimes");
sym(math, main, textord, "\u2202", "\\partial");
sym(math, main, bin, "\u2298", "\\oslash");
sym(math, ams, textord, "\u229a", "\\circledcirc");
sym(math, ams, textord, "\u22a1", "\\boxdot");
sym(math, main, bin, "\u25b3", "\\bigtriangleup");
sym(math, main, bin, "\u25bd", "\\bigtriangledown");
sym(math, main, bin, "\u2020", "\\dagger");
sym(math, main, bin, "\u22c4", "\\diamond");
sym(math, main, bin, "\u22c6", "\\star");
sym(math, main, bin, "\u25c3", "\\triangleleft");
sym(math, main, bin, "\u25b9", "\\triangleright");
sym(math, main, open, "{", "\\{");
sym(math, main, close, "}", "\\}");
sym(math, main, open, "{", "\\lbrace");
sym(math, main, close, "}", "\\rbrace");
sym(math, main, open, "[", "\\lbrack");
sym(math, main, close, "]", "\\rbrack");
sym(math, main, open, "\u230a", "\\lfloor");
sym(math, main, close, "\u230b", "\\rfloor");
sym(math, main, open, "\u2308", "\\lceil");
sym(math, main, close, "\u2309", "\\rceil");
sym(math, main, textord, "\\", "\\backslash");
sym(math, main, textord, "\u2223", "|");
sym(math, main, textord, "\u2223", "\\vert");
sym(math, main, textord, "\u2225", "\\|");
sym(math, main, textord, "\u2225", "\\Vert");
sym(math, main, textord, "\u2191", "\\uparrow");
sym(math, main, textord, "\u21d1", "\\Uparrow");
sym(math, main, textord, "\u2193", "\\downarrow");
sym(math, main, textord, "\u21d3", "\\Downarrow");
sym(math, main, textord, "\u2195", "\\updownarrow");
sym(math, main, textord, "\u21d5", "\\Updownarrow");
sym(math, math, op, "\u2210", "\\coprod");
sym(math, math, op, "\u22c1", "\\bigvee");
sym(math, math, op, "\u22c0", "\\bigwedge");
sym(math, math, op, "\u2a04", "\\biguplus");
sym(math, math, op, "\u22c2", "\\bigcap");
sym(math, math, op, "\u22c3", "\\bigcup");
sym(math, math, op, "\u222b", "\\int");
sym(math, math, op, "\u222b", "\\intop");
sym(math, math, op, "\u222c", "\\iint");
sym(math, math, op, "\u222d", "\\iiint");
sym(math, math, op, "\u220f", "\\prod");
sym(math, math, op, "\u2211", "\\sum");
sym(math, math, op, "\u2a02", "\\bigotimes");
sym(math, math, op, "\u2a01", "\\bigoplus");
sym(math, math, op, "\u2a00", "\\bigodot");
sym(math, math, op, "\u222e", "\\oint");
sym(math, math, op, "\u2a06", "\\bigsqcup");
sym(math, math, op, "\u222b", "\\smallint");
sym(math, main, punct, "\u2026", "\\ldots");
sym(math, main, inner, "\u22ef", "\\cdots");
sym(math, main, inner, "\u22f1", "\\ddots");
sym(math, main, textord, "\u22ee", "\\vdots");
sym(math, main, accent, "\u00b4", "\\acute");
sym(math, main, accent, "\u0060", "\\grave");
sym(math, main, accent, "\u00a8", "\\ddot");
sym(math, main, accent, "\u007e", "\\tilde");
sym(math, main, accent, "\u00af", "\\bar");
sym(math, main, accent, "\u02d8", "\\breve");
sym(math, main, accent, "\u02c7", "\\check");
sym(math, main, accent, "\u005e", "\\hat");
sym(math, main, accent, "\u20d7", "\\vec");
sym(math, main, accent, "\u02d9", "\\dot");

sym(text, main, spacing, "\u00a0", "\\ ");
sym(text, main, spacing, "\u00a0", " ");
sym(text, main, spacing, "\u00a0", "~");

// There are lots of symbols which are the same, so we add them in afterwards.

// All of these are textords in math mode
var mathTextSymbols = "0123456789/@.\"";
for (var i = 0; i < mathTextSymbols.length; i++) {
    var ch = mathTextSymbols.charAt(i);
    sym(math, main, textord, ch, ch);
}

// All of these are textords in text mode
var textSymbols = "0123456789`!@*()-=+[]'\";:?/.,";
for (var i = 0; i < textSymbols.length; i++) {
    var ch = textSymbols.charAt(i);
    sym(text, main, textord, ch, ch);
}

// All of these are textords in text mode, and mathords in math mode
var letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
for (var i = 0; i < letters.length; i++) {
    var ch = letters.charAt(i);
    sym(math, main, mathord, ch, ch);
    sym(text, main, textord, ch, ch);
}
