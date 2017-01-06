/**
 * Predefined macros for KaTeX.
 * This can be used to define some commands in terms of others.
 */

module.exports = {

    //////////////////////////////////////////////////////////////////////
    // amsmath.sty

    // \def\overset#1#2{\binrel@{#2}\binrel@@{\mathop{\kern\z@#2}\limits^{#1}}}
    "\\overset": "\\mathop{#2}\\limits^{#1}",
    "\\underset": "\\mathop{#2}\\limits_{#1}",

};
