#!/usr/bin/env node
// Simple CLI for KaTeX.
// Reads TeX from stdin, outputs HTML to stdout.
/* eslint no-console:0 */

const katex = require("./");
const fs = require('fs');

// Skip the first two args, which are just "node" and "cli.js"
const args = process.argv.slice(2);

if (args.indexOf("--help") !== -1) {
    console.log(process.argv[0] + " " + process.argv[1] +
                " [ --help ]" +
                " [ --display-mode ]" +
                " [ --throw-on-error ]" +
                " [ --error-color color ]" +
                " [ --max-size size ]" +
                " [ --input inputFile ]" +
                " [ --output outputFile ]"
               );

    console.log("\n" +
                "Options:");
    console.log("  --help              Display this help message");
    console.log("  --display-mode      Render in display mode (not inline mode)");
    console.log("  --no-throw-on-error Render unsupported commands as text");
    console.log("  --error-color       Color unsupported commands are rendered in");
    console.log("  --max-size          User-specified sizes are capped to maxSize");
    console.log("  --input file        Read from given file");
    console.log("  --output file       Write to given file");
    process.exit();
}

function getOptions(args) {

    const options = {
        displayMode: args.indexOf("--display-mode") !== -1,
        throwOnError: args.indexOf("--no-throw-on-error") === -1 };

    const indexErrorColor = args.indexOf("--error-color");
    if (indexErrorColor !== -1) {
        options['errorColor'] = '#' + args[indexErrorColor + 1];
    }
    const indexMaxSize = args.indexOf("--max-size");
    if (indexMaxSize !== -1) {
        options['maxSize'] = args[indexMaxSize + 1];
    }

    return options;
}

function render(input) {
    const options = getOptions(args);
    const output = katex.renderToString(input, options);
    return output;
}

function readInput() {
    let input = "";
    const readFromFile = args.indexOf("--input");
    if (readFromFile !== -1) {
        const inputfile = args[args.indexOf("--input") + 1];

        fs.readFile(inputfile, 'utf-8', function(err, data) {
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
    const output = render(input) + '\n';

    const writeToFile = args.indexOf("--output");
    if (writeToFile !== -1) {
        const outputfile = args[args.indexOf("--output") + 1];

        fs.writeFile(outputfile, output, function(err) {
            if (err) {
                return console.log(err);
            }
        });
    } else {
        console.log(output);
    }
}

readInput();
