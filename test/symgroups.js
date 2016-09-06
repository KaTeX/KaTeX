/* eslint no-console:0 */
"use strict";

var fs = require("fs");
var childProcess = require("child_process");

var opts = require("nomnom")
    .option("spacing", {
        flag: true,
        help: "Print mismatches involving spacing commands",
    })
    .parse();

var symbols = require("../src/symbols");
var keys = Object.keys(symbols.math);
keys.sort();
var types = [
    "mathord", "op", "bin", "rel", "open", "close", "punct", "inner",
    "spacing", "accent", "textord",
];

process.nextTick(writeTexFile);

function writeTexFile() {
    var tex = fs.createWriteStream("symgroups.tex");
    tex.on("finish", typeset);
    tex.write("\\documentclass{article}\n" +
              "\\usepackage{textcomp,amsmath,amssymb,gensymb}\n" +
              "\\begin{document}\n" +
              "\\showboxbreadth=\\maxdimen\\showboxdepth=\\maxdimen\n\n");
    keys.forEach(function(key, idx) {
        var sym = symbols.math[key];
        var type = types.indexOf(sym.group) + 1;
        tex.write("$" + idx + "+" + key + "+" + type + "\\showlists$\n\n");
    });
    tex.end("\\end{document}\n");
}

function typeset() {
    var proc = childProcess.spawn(
        "pdflatex", ["--interaction=nonstopmode", "symgroups"],
        {stdio: "ignore"});
    proc.on("exit", function(code, signal) {
        if (signal) {
            throw new Error("pdflatex terminated by signal " + signal);
        }
        fs.readFile("symgroups.log", "ascii", evaluate);
    }).on("error", function(err) {
        throw err;
    });
}

/* Consider the symbol "\sim" as an example. At the time of this
 * writing, it has index 431 in our list, and is of group "rel" which
 * is the fourth of the types listed above. So we construct an input line
 * $431+\sim+4\showlists$ and receive corresponding output
 *
 * ### math mode entered at line 870
 * \mathord
 * .\fam0 4
 * \mathord
 * .\fam0 3
 * \mathord
 * .\fam0 2
 * \mathbin
 * .\fam0 +
 * \mathrel
 * .\fam2 '
 * \mathbin
 * .\fam0 +
 * \mathord
 * .\fam0 4
 * ### horizontal mode entered at line 870
 *
 * This is what we parse, using some regular expressions.
 */

// Extract individual blocks, from switch to math mode up to switch back.
var reMM = /^### math mode entered.*\n([^]*?)###/mg;

// Identify the parts separated by the plus signs
var reParts = /([^]*^\.\\fam0 \+\n)([^]+)(\\mathbin\n\.+\\fam0 \+[^]*)/m;

// Variation of the above in case we have nothing between the plus signs
var reEmpty = /^\.\\fam0 \+\n\\mathbin\n\.\\fam0 \+/m;

// Match any printed digit in the first or last of these parts
var reDigit = /^\.\\fam0 ([0-9])/mg;

// Match the atom type, i.e. "\mathrel" in the above example
var reAtom = /\\([a-z]+)/;

function evaluate(err, log) {
    if (err) {
        throw err;
    }

    var match;
    var nextIndex = 0;
    while ((match = reMM.exec(log)) !== null) {
        var list = match[1];
        match = reParts.exec(list);
        if (!match) {
            match = reEmpty.exec(list);
            if (match) {
                console.log(keys[nextIndex] + " (index " + nextIndex +
                            ") in LaTeX apparently " +
                            "doesn't contribute to the output.\n");
                nextIndex++;
                continue;
            }
            console.error("Can't split this into parts:");
            console.error(list);
            process.exit(2);
        }
        var idx = extractDigits(match[1]);
        var atom = match[2];
        var katexType = types[extractDigits(match[3]) - 1] || "???";
        match = reAtom.exec(atom);
        if (!match) {
            console.error("Failed to find atom type");
            console.error(atom);
            console.error(list);
            process.exit(3);
        }
        var latexType = match[1];
        if (katexType !== latexType && "math" + katexType !== latexType &&
            (katexType !== "textord" || latexType !== "mathord") &&
            (katexType !== "spacing" || opts.spacing)) {
            console.log(keys[idx] + " (index " + idx + ") has '" + katexType +
                        "' in KaTeX, but LaTeX uses '" + latexType + "':");
            console.log(atom);
        }
        if (nextIndex !== idx) {
            console.error("Index " + nextIndex + " not found in log");
            process.exit(4);
        }
        nextIndex = idx + 1;
    }
    if (nextIndex !== keys.length) {
        console.error("Processed " + nextIndex +
                      " out of " + keys.length + " symbols");
        process.exit(4);
    }
}

function extractDigits(str) {
    var match;
    var res = "";
    while ((match = reDigit.exec(str)) !== null) {
        res += match[1];
    }
    return +res;
}
