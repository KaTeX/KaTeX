/* eslint max-len:0 */
/* global beforeEach: false */
/* global expect: false */
/* global it: false */
/* global describe: false */
import ParseError from "../src/ParseError";
import parseTree from "../src/parseTree";
import Settings from "../src/Settings";
import {scriptFromCodepoint, supportedCodepoint} from "../src/unicodeScripts";

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
        expect('\\text{ÀÁÂÃÄÅÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåèéêëìíîïñòóôõöùúûüýÿ' +
            'ÆÇÐØÞßæçðøþ}').toParse();
    });

    it("should parse Latin-1 outside \\text{}", function() {
        expect('ÀÁÂÃÄÅÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåèéêëìíîïñòóôõöùúûüýÿ' +
            'ÇÐÞçðþ').toParse();
    });

    it("should parse all lower case Greek letters", function() {
        expect("αβγδεϵζηθϑικλμνξοπϖρϱςστυφϕχψω").toParse();
    });

    it("should parse math upper case Greek letters", function() {
        expect("ΓΔΘΛΞΠΣΥΦΨΩ").toParse();
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

    it("should parse Devangari inside \\text{}", function() {
        expect('\\text{नमस्ते}').toParse();
    });

    it("should not parse Devangari outside \\text{}", function() {
        expect('नमस्ते').toNotParse();
    });
});

describe("unicodeScripts", () => {
    const cjkRE = /[\u3000-\u30FF\u4E00-\u9FAF\uFF00-\uFF60]/;
    const hangulRE = /[\uAC00-\uD7AF]/;
    const brahmicRE = /[\u0900-\u109F]/;
    const allRE =
        /[\u3000-\u30FF\u4E00-\u9FAF\uFF00-\uFF60\uAC00-\uD7AF\u0900-\u109F]/;

    it("supportedCodepoint() should return the correct values", () => {
        for (let codepoint = 0; codepoint <= 0xffff; codepoint++) {
            expect(supportedCodepoint(codepoint)).toBe(
                allRE.test(String.fromCharCode(codepoint))
            );
        }
    });

    it("scriptFromCodepoint() should return correct values", () => {
        for (let codepoint = 0; codepoint <= 0xffff; codepoint++) {
            const character = String.fromCharCode(codepoint);
            const script = scriptFromCodepoint(codepoint);

            if (cjkRE.test(character)) {
                expect(script).toEqual('cjk');
            } else if (hangulRE.test(character)) {
                expect(script).toEqual('hangul');
            } else if (brahmicRE.test(character)) {
                expect(script).toEqual('brahmic');
            } else {
                expect(script).toBe(null);
                expect(supportedCodepoint(codepoint)).toBe(false);
            }
        }
    });
});
