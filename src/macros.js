/**
 * Predefined macros for KaTeX.
 * This can be used to define some commands in terms of others.
 */

// This function might one day accept additional argument and do more things.
function defineMacro(name, body) {
    module.exports[name] = body;
}

//////////////////////////////////////////////////////////////////////
// basics
defineMacro("\\bgroup", "{");
defineMacro("\\egroup", "}");
defineMacro("\\begingroup", "{");
defineMacro("\\endgroup", "}");

//////////////////////////////////////////////////////////////////////
// amsmath.sty

// \def\overset#1#2{\binrel@{#2}\binrel@@{\mathop{\kern\z@#2}\limits^{#1}}}
defineMacro("\\overset", "\\mathop{#2}\\limits^{#1}");
defineMacro("\\underset", "\\mathop{#2}\\limits_{#1}");

// \newcommand{\boxed}[1]{\fbox{\m@th$\displaystyle#1$}}
defineMacro("\\boxed", "\\fbox{\\displaystyle{#1}}");

//TODO: When implementing \dots, should ideally add the \DOTSB indicator
//      into the macro, to indicate these are binary operators.
// \def\iff{\DOTSB\;\Longleftrightarrow\;}
// \def\implies{\DOTSB\;\Longrightarrow\;}
// \def\impliedby{\DOTSB\;\Longleftarrow\;}
defineMacro("\\iff", "\\;\\Longleftrightarrow\\;");
defineMacro("\\implies", "\\;\\Longrightarrow\\;");
defineMacro("\\impliedby", "\\;\\Longleftarrow\\;");

