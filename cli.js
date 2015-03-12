#!/usr/bin/env node
// Simple CLI for KaTeX.
// Reads TeX from stdin, outputs HTML to stdout.
//
minimist = require("minimist");
Settings = require("./src/Settings");
var args = minimist(process.argv.slice(2));

var settings = new Settings({
  displayMode: args.d || args.display,
});

var katex = require("./");
var input = "";

process.stdin.on("data", function(chunk) {
  input += chunk.toString();
});

process.stdin.on("end", function() {
  var output = katex.renderToString(input, settings);
  console.log(output);
});
