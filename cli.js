#!/usr/bin/env node
// Simple CLI for KaTeX.
// Reads TeX from stdin, outputs HTML to stdout.

var katex = require("./");
var input = "";

process.stdin.on("data", function(chunk) {
  input += chunk.toString();
});

process.stdin.on("end", function() {
  var output = katex.renderToString(input);
  console.log(output);
});
