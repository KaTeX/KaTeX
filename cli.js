#!/usr/bin/env node
// Simple CLI for KaTeX.
// Reads TeX from stdin, outputs HTML to stdout.
// To run this from the repository, you must first build KaTeX by running
// `npm install` and `npm run dist`.

/* eslint no-console:0 */

let katex;
try {
    katex = require("./");
} catch (e) {
    console.log("KaTeX not found, likely because dist/katex.js is missing.");
    console.log("Please run 'npm install' and 'npm run dist' before running");
    console.log("cli.js from the KaTeX repository.");
    return;
}
const {version} = require("./package.json");
const fs = require("fs");

const options = require("commander")
    .version(version)
    .option("-d, --display-mode",
        "Render math in display mode, which puts the math in display style " +
        "(so \\int and \\sum are large, for example), and centers the math " +
        "on the page on its own line.")
    .option("-t, --no-throw-on-error",
        "Render errors (in the color given by errorColor) instead of " +
        "throwing a ParseError exception when encountering an error.")
    .option("-c, --error-color <color>",
        "A color string given in the format 'rgb' or 'rrggbb' (no #). " +
        "This option determines the color of errors rendered by the -t option",
        "#cc0000",
        (color) => "#" + color)
    .option("-b, --color-is-text-color",
        "Makes \\color behave like LaTeX's 2-argument \\textcolor, " +
        "instead of LaTeX's one-argument \\color mode change.")
    .option("-s, --strict",
        "Turn on strict / LaTeX faithfulness mode, which throws an error " +
        "if the input uses features that are not supported by LaTeX")
    .option("-s, --max-size <n>",
        "If non-zero, all user-specified sizes, e.g. in " +
        "\\rule{500em}{500em}, will be capped to maxSize ems. " +
        "Otherwise, elements and spaces can be arbitrarily large",
        parseInt)
    .option("-e, --max-expand <n>",
        "Limit the number of macro expansions to the specified number, to " +
        "prevent e.g. infinite macro loops.  If set to Infinity, the macro " +
        "expander will try to fully expand as in LaTeX.",
        (n) => (n === "Infinity" ? Infinity : parseInt(n)))
    .option("-m, --macros <defs>",
        "Custom macros of the form '\\foo:expansion', separated by ';'",
        (defs) => defs.split(";"))
    .option("-f, --macro-file <path>",
        "Read macro definitions, one per line, from the given file")
    .option("-i, --input <path>", "Read LaTeX input from the given file.")
    .option("-o, --output <path>", "Write html output to the given file.")
    .parse(process.argv);


function readMacros() {
    if (options.macroFile) {
        fs.readFile(options.macroFile, "utf-8", function(err, data) {
            if (err) {throw err;}
            splitMacros(data.toString().split('\n'));
        });
    } else {
        splitMacros([]);
    }
}

function splitMacros(macroStrings) {
    // Override macros from macro file (if any)
    // with macros from command line (if any)
    if (options.macros) {
        macroStrings = macroStrings.concat(options.macros);
    }

    const macros = {};

    for (const m of macroStrings) {
        const i = m.search(":");
        if (i !== -1) {
            macros[m.substring(0, i).trim()] = m.substring(i + 1).trim();
        }
    }

    options.macros = macros;
    readInput();
}

function readInput() {
    let input = "";

    if (options.input) {
        fs.readFile(options.input, "utf-8", function(err, data) {
            if (err) {throw err;}
            input = data.toString();
            writeOutput(input);
        });
    } else {
        process.stdin.on("data", function(chunk) {
            input += chunk.toString();
        });

        process.stdin.on("end", function() {
            writeOutput(input);
        });
    }
}

function writeOutput(input) {
    const output = katex.renderToString(input, options) + "\n";

    if (options.output) {
        fs.writeFile(options.output, output, function(err) {
            if (err) {
                return console.log(err);
            }
        });
    } else {
        console.log(output);
    }
}

readMacros();
