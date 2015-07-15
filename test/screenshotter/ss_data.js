/**
 * Parse and polish the screenshotter data in ss_data.yaml.
 *
 * This module is responsible for reading the file ss_data.yaml,
 * unify syntactic variations (like string vs. dict as test case body)
 * and provide common functionality (like a query string encoded version).
 * The export of this module is simply a dictionary of test cases.
 */

var fs = require("fs");
var jsyaml = require("js-yaml");
var querystring = require("querystring");

var dict = fs.readFileSync(require.resolve("./ss_data.yaml"));
dict = jsyaml.safeLoad(dict);
for (var key in dict) {
    var itm = dict[key];
    if (typeof itm === "string") {
        itm = dict[key] = { tex: itm };
    }
    itm.query = querystring.stringify(itm);
}
module.exports = dict;
