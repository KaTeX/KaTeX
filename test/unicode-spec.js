/* eslint max-len:0 */
/* global beforeEach: false */
/* global jasmine: false */
/* global expect: false */
/* global it: false */
/* global describe: false */
var ParseError = require("../src/ParseError");
var parseTree = require("../src/parseTree");
var Settings = require("../src/Settings");

var defaultSettings = new Settings({});

var parseAndSetResult = function(expr, result, settings) {
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
        jasmine.addMatchers({

            toParse: function() {
                return {
                    compare: function(actual, settings) {
                        var usedSettings = settings ? settings : defaultSettings;

                        var result = {
                            pass: true,
                            message: "'" + actual + "' succeeded parsing",
                        };
                        parseAndSetResult(actual, result, usedSettings);
                        return result;
                    },
                };
            },

            toNotParse: function() {
                return {
                    compare: function(actual, settings) {
                        var usedSettings = settings ? settings : defaultSettings;

                        var result = {
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
                };
            },
        });
    });

    it("should parse Latin-1 inside \\text{}", function() {
        expect('\\text{ÀàÇçÉéÏïÖöÛû}').toParse();
    });

    it("should not parse Latin-1 outside \\text{}", function() {
        expect('ÀàÇçÉéÏïÖöÛû').toNotParse();
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
