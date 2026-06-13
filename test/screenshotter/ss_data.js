/**
 * Parse and polish the screenshotter data in ss_data.yaml.
 *
 * This module is responsible for reading the file ss_data.yaml,
 * unify syntactic variations (like string vs. dict as test case body)
 * and provide common functionality (like a query string encoded version).
 * The export of this module is simply a dictionary of test cases.
 */

"use strict";
const fs = require("fs");
const jsyaml = require("js-yaml");
const querystring = require("querystring");

const queryKeys = [
    "tex", "pre", "post", "display", "noThrow", "errorColor", "styles",
];
const dict = jsyaml.load(fs.readFileSync(require.resolve("./ss_data.yaml")));

for (const [key, value] of Object.entries(dict)) {
    let item = value;
    if (typeof item === "string") {
        item = dict[key] = {tex: item};
    }
    const query = {};
    for (const key of queryKeys) {
        if (key in item) {
            query[key] = item[key];
        }
    }
    item.query = querystring.stringify(query);
    if (item.macros) {
        item.query += "&" + querystring.stringify(item.macros);
    }
}
module.exports = dict;
