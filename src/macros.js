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

// We don't distinguish between math and nonmath kerns.
// (In TeX, the mu unit works only with \mkern.)
defineMacro("\\mkern", "\\kern");

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

//////////////////////////////////////////////////////////////////////
// mathtools.sty

//\providecommand\ordinarycolon{:}
defineMacro("\\ordinarycolon", ":");
//\def\vcentcolon{\mathrel{\mathop\ordinarycolon}}
//TODO(edemaine): Not yet centered. Fix via \raisebox or #726
defineMacro("\\vcentcolon", "\\mathrel{\\mathop\\ordinarycolon}");
// \providecommand*\dblcolon{\vcentcolon\mathrel{\mkern-.9mu}\vcentcolon}
defineMacro("\\dblcolon", "\\vcentcolon\\mathrel{\\mkern-.9mu}\\vcentcolon");
// \providecommand*\coloneqq{\vcentcolon\mathrel{\mkern-1.2mu}=}
defineMacro("\\coloneqq", "\\vcentcolon\\mathrel{\\mkern-1.2mu}=");
// \providecommand*\Coloneqq{\dblcolon\mathrel{\mkern-1.2mu}=}
defineMacro("\\Coloneqq", "\\dblcolon\\mathrel{\\mkern-1.2mu}=");
// \providecommand*\coloneq{\vcentcolon\mathrel{\mkern-1.2mu}\mathrel{-}}
defineMacro("\\coloneq", "\\vcentcolon\\mathrel{\\mkern-1.2mu}\\mathrel{-}");
// \providecommand*\Coloneq{\dblcolon\mathrel{\mkern-1.2mu}\mathrel{-}}
defineMacro("\\Coloneq", "\\dblcolon\\mathrel{\\mkern-1.2mu}\\mathrel{-}");
// \providecommand*\eqqcolon{=\mathrel{\mkern-1.2mu}\vcentcolon}
defineMacro("\\eqqcolon", "=\\mathrel{\\mkern-1.2mu}\\vcentcolon");
// \providecommand*\Eqqcolon{=\mathrel{\mkern-1.2mu}\dblcolon}
defineMacro("\\Eqqcolon", "=\\mathrel{\\mkern-1.2mu}\\dblcolon");
// \providecommand*\eqcolon{\mathrel{-}\mathrel{\mkern-1.2mu}\vcentcolon}
defineMacro("\\eqcolon", "\\mathrel{-}\\mathrel{\\mkern-1.2mu}\\vcentcolon");
// \providecommand*\Eqcolon{\mathrel{-}\mathrel{\mkern-1.2mu}\dblcolon}
defineMacro("\\Eqcolon", "\\mathrel{-}\\mathrel{\\mkern-1.2mu}\\dblcolon");
// \providecommand*\colonapprox{\vcentcolon\mathrel{\mkern-1.2mu}\approx}
defineMacro("\\colonapprox", "\\vcentcolon\\mathrel{\\mkern-1.2mu}\\approx");
// \providecommand*\Colonapprox{\dblcolon\mathrel{\mkern-1.2mu}\approx}
defineMacro("\\Colonapprox", "\\dblcolon\\mathrel{\\mkern-1.2mu}\\approx");
// \providecommand*\colonsim{\vcentcolon\mathrel{\mkern-1.2mu}\sim}
defineMacro("\\colonsim", "\\vcentcolon\\mathrel{\\mkern-1.2mu}\\sim");
// \providecommand*\Colonsim{\dblcolon\mathrel{\mkern-1.2mu}\sim}
defineMacro("\\Colonsim", "\\dblcolon\\mathrel{\\mkern-1.2mu}\\sim");

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
defineMacro("\\simcolon", "\\sim\\mathrel{\\mkern-1.2mu}\\vcentcolon");
defineMacro("\\simcoloncolon", "\\sim\\mathrel{\\mkern-1.2mu}\\dblcolon");
defineMacro("\\approxcolon", "\\approx\\mathrel{\\mkern-1.2mu}\\vcentcolon");
defineMacro("\\approxcoloncolon",
            "\\approx\\mathrel{\\mkern-1.2mu}\\dblcolon");
