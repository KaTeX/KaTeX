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

    it("should parse Georgian inside \\text{}", function() {
        expect('\\text{გამარჯობა}').toParse();
    });

    it("should not parse Georgian outside \\text{}", function() {
        expect('გამარჯობა').toNotParse();
    });

    it("should parse extended Latin characters inside \\text{}", function() {
        expect('\\text{ěščřžůřťďňőİı}').toParse();
    });

    it("should not parse extended Latin outside \\text{}", function() {
        expect('ěščřžůřťďňőİı').toNotParse();
    });

});

describe("unicodeScripts", () => {
    const scriptRegExps = {
        latin: /[\u0100-\u024f\u0300-\u036f]/,
        cyrillic: /[\u0400-\u04ff]/,
        brahmic: /[\u0900-\u109F]/,
        georgian: /[\u10a0-\u10ff]/,
        cjk: /[\u3000-\u30FF\u4E00-\u9FAF\uFF00-\uFF60]/,
        hangul: /[\uAC00-\uD7AF]/,
    };

    const scriptNames = Object.keys(scriptRegExps);

    const allRegExp = new RegExp(
        Object.values(scriptRegExps).map(re => re.source).join('|')
    );

    it("supportedCodepoint() should return the correct values", () => {
        for (let codepoint = 0; codepoint <= 0xffff; codepoint++) {
            expect(supportedCodepoint(codepoint)).toBe(
                allRegExp.test(String.fromCharCode(codepoint))
            );
        }
    });

    it("scriptFromCodepoint() should return correct values", () => {
        outer: for (let codepoint = 0; codepoint <= 0xffff; codepoint++) {
            const character = String.fromCharCode(codepoint);
            const script = scriptFromCodepoint(codepoint);

            for (const scriptName of scriptNames) {
                if (scriptRegExps[scriptName].test(character)) {
                    expect(script).toEqual(scriptName);
                    continue outer;
                }
            }

            expect(script).toBe(null);
            expect(supportedCodepoint(codepoint)).toBe(false);
        }
    });
});
