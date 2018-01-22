#!/usr/bin/env node
// Simple CLI for KaTeX.
// Reads TeX from stdin, outputs HTML to stdout.
/* eslint no-console:0 */

const katex = require("./");
const fs = require("fs");

const options = require("nomnom")
    .option("displayMode", {
        full: "display-mode",
        abbr: "d",
        flag: true,
        default: false,
        help: "If true the math will be rendered in display " +
              "mode, which will put the math in display style " +
              "(so \\int and \\sum are large, for example), and " +
              "will center the math on the page on its own line.",
    })
    .option("throwOnError", {
        full: "no-throw-on-error",
        abbr: "t",
        flag: true,
        default: true,
        transform: function(t) {
            return !t;
        },
        help: "If true, KaTeX will throw a ParseError when it " +
              "encounters an unsupported command. If false, KaTeX " +
              "will render the unsupported command as text in the " +
              "color given by errorColor.",
    })
    .option("errorColor", {
        full: "error-color",
        abbr: "c",
        metavar: "color",
        default: "#cc0000",
        transform: function(color) {
            return "#" + color;
        },
        help: "A color string given in the format 'rgb' or 'rrggbb'. " +
              "This option determines the color which unsupported " +
              "commands are rendered in.",
    })
    .option("colorIsTextColor", {
        full: "color-is-text-color",
        abbr: "b",
        flag: true,
        default: false,
        help: "Restores the old behavior of (pre-0.8.0) KaTeX.",
    })
    .option("maxSize", {
        full: "max-size",
        abbr: "s",
        metavar: "size",
        default: 0,
        help: "If non-zero, all user-specified sizes, e.g. in " +
              "\\rule{500em}{500em}, will be capped to maxSize ems. " +
              "Otherwise, elements and spaces can be arbitrarily large",
    })
    .option("macros", {
        full: "macro",
        abbr: "m",
        metavar: "macro:expansion",
        list: true,
        default: [],
        help: "A custom macro. Each macro is a property with a name " +
              "like \\name which maps to a string that " +
              "describes the expansion of the macro.",
    })
    .option("macroFile", {
        full: "macro-file",
        abbr: "f",
        metavar: "path",
        default: null,
        help: "Read macro definitions from the given file.",
    })
    .option("inputFile", {
        full: "input",
        abbr: "i",
        metavar: "path",
        default: null,
        help: "Read LaTeX input from the given file.",
    })
    .option("outputFile", {
        full: "output",
        abbr: "o",
        metavar: "path",
        default: null,
        help: "Write html output to the given file.",
    })
    .parse();


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
    macroStrings = macroStrings.concat(options.macros);

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

    if (options.inputFile) {
        fs.readFile(options.inputFile, "utf-8", function(err, data) {
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

    if (options.outputFile) {
        fs.writeFile(options.outputFile, output, function(err) {
            if (err) {
                return console.log(err);
            }
        });
    } else {
        console.log(output);
    }
}

readMacros();
