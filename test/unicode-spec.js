/* eslint max-len:0 */
/* global beforeEach: false */
/* global expect: false */
/* global it: false */
/* global describe: false */
const ParseError = require("../src/ParseError");
const parseTree = require("../src/parseTree");
const Settings = require("../src/Settings");

const defaultSettings = new Settings({});

const parseAndSetResult = function(expr, result, settings) {
    try {
        return parseTree(expr, settings || defaultSettings);
    } catch (e) {
        result.pass = false;
        if (e instanceof ParseError) {
            result.message = "'" + expr + "' failed " +
                "parsing with error: " + e.message;
        } else {
            result.message = "'" + expr + "' failed " +
                "parsing with unknown error: " + e.message;
        }
    }
};

describe("unicode", function() {
    beforeEach(function() {
        expect.extend({

            toParse: function(actual, settings) {
                const usedSettings = settings ? settings : defaultSettings;

                const result = {
                    pass: true,
                    message: "'" + actual + "' succeeded parsing",
                };
                parseAndSetResult(actual, result, usedSettings);
                return result;
            },

            toNotParse: function(actual, settings) {
                const usedSettings = settings ? settings : defaultSettings;

                const result = {
                    pass: false,
                    message: "Expected '" + actual + "' to fail " +
                        "parsing, but it succeeded",
                };

                try {
                    parseTree(actual, usedSettings);
                } catch (e) {
                    if (e instanceof ParseError) {
                        result.pass = true;
                        result.message = "'" + actual + "' correctly " +
                            "didn't parse with error: " + e.message;
                    } else {
                        result.message = "'" + actual + "' failed " +
                            "parsing with unknown error: " + e.message;
                    }
                }

                return result;
            },
        });
    });

    it("should parse Latin-1 inside \\text{}", function() {
        expect('\\text{ÀàÇçÉéÏïÖöÛû}').toParse();
    });

    it("should parse Latin-1 outside \\text{}", function() {
        expect('ÀàÇçÉéÏïÖöÛû').toParse();
    });

    it("should parse Cyrillic inside \\text{}", function() {
        expect('\\text{БГДЖЗЙЛФЦШЫЮЯ}').toParse();
    });

    it("should not parse Cyrillic outside \\text{}", function() {
        expect('БГДЖЗЙЛФЦШЫЮЯ').toNotParse();
    });

    it("should parse CJK inside \\text{}", function() {
        expect('\\text{私はバナナです}').toParse();
        expect('\\text{여보세요}').toParse();
    });

    it("should not parse CJK outside \\text{}", function() {
        expect('私はバナナです。').toNotParse();
        expect('여보세요').toNotParse();
    });
});
