"use strict";

var fs = require("fs");
var assert = require("assert");

var re = /^ *(> |& \+ |)\.([a-z]+) \{(?: margin-left: @(.*space);)?/mg;

var data = fs.readFileSync("static/katex.less", "utf-8");
var match;
var level1 = null, level2 = null, level3 = null;

var res2 = [];
var res3 = {};

while (match = re.exec(data)) {
    if (match[1] === "") {
        level1 = match[2];
        level2 = null;
    } else if (match[1] === "> ") {
        level2 = match[2];
    } else if (match[1] === "& + " && match[3]) {
        level3 = match[2];
        if (level2) {
            res3[level1] = res3[level1] || [];
            res3[level1].push('"' + level2 + '_' + level3 + '": ' + match[3]);
        } else {
            res2.push('"' + level1 + '_' + level3 + '": ' + match[3]);
        }
    }
}

process.stdout.write("var spacePairs = {\n    " +
                     res2.join(",\n    ") + "\n};\n");
for (level1 in res3) {
    process.stdout.write("var spacePairs_" + level1 + " = {\n    " +
                         res3[level1].join(",\n    ") + "\n};\n");
}
