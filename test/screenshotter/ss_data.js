/**
 * Parse and polish the screenshotter data in ss_data.yaml.
 *
 * This module is responsible for reading the file ss_data.yaml,
 * unify syntactic variations (like string vs. dict as test case body)
 * and provide common functionality (like a query string encoded version).
 * The export of this module is simply a dictionary of test cases.
 */

const fs = require("fs");
const jsyaml = require("js-yaml");
const querystring = require("querystring");

const queryKeys = ["tex", "pre", "post", "display", "noThrow", "errorColor"];
let dict = fs.readFileSync(require.resolve("./ss_data.yaml"));
dict = jsyaml.safeLoad(dict);
for (const key in dict) {
    if (dict.hasOwnProperty(key)) {
        let itm = dict[key];
        if (typeof itm === "string") {
            itm = dict[key] = { tex: itm };
        }
        const query = {};
        queryKeys.forEach(function(key) {
            if (itm.hasOwnProperty(key)) {
                query[key] = itm[key];
            }
        });
        itm.query = querystring.stringify(query);
        if (itm.macros) {
            itm.query += "&" + querystring.stringify(itm.macros);
        }
    }
}
module.exports = dict;
