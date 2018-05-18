/* eslint max-len:0 */
/* global expect: false */
/* global it: false */
/* global describe: false */
import Settings from "../src/Settings";
import {scriptFromCodepoint, supportedCodepoint} from "../src/unicodeScripts";
import {strictSettings} from "./helpers";

describe("unicode", function() {
    it("should parse Latin-1 inside \\text{}", function() {
        expect('\\text{ÀÁÂÃÄÅÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåèéêëìíîïñòóôõöùúûüýÿ' +
            'ÆÇÐØÞßæçðøþ}').toParse();
    });

    it("should not parse Latin-1 outside \\text{} with strict", function() {
        const chars = 'ÀÁÂÃÄÅÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåèéêëìíîïñòóôõöùúûüýÿÇÐÞçþ';
        for (const ch of chars) {
            expect(ch).toNotParse(strictSettings);
        }
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

    it("should not parse Cyrillic outside \\text{} with strict", function() {
        expect('БГДЖЗЙЛФЦШЫЮЯ').toNotParse(strictSettings);
    });

    it("should parse CJK inside \\text{}", function() {
        expect('\\text{私はバナナです}').toParse();
        expect('\\text{여보세요}').toParse();
    });

    it("should not parse CJK outside \\text{} with strict", function() {
        expect('私はバナナです。').toNotParse(strictSettings);
        expect('여보세요').toNotParse(strictSettings);
    });

    it("should parse Devangari inside \\text{}", function() {
        expect('\\text{नमस्ते}').toParse();
    });

    it("should not parse Devangari outside \\text{} with strict", function() {
        expect('नमस्ते').toNotParse(strictSettings);
    });

    it("should parse Georgian inside \\text{}", function() {
        expect('\\text{გამარჯობა}').toParse();
    });

    it("should not parse Georgian outside \\text{} with strict", function() {
        expect('გამარჯობა').toNotParse(strictSettings);
    });

    it("should parse extended Latin characters inside \\text{}", function() {
        expect('\\text{ěščřžůřťďňőİı}').toParse();
    });

    it("should not parse extended Latin outside \\text{} with strict", function() {
        expect('ěščřžůřťďňőİı').toNotParse(strictSettings);
    });

    it("should not allow emoji in strict mode", function() {
        expect('✌').toNotParse(strictSettings);
        expect('\\text{✌}').toNotParse(strictSettings);
        const settings = new Settings({
            strict: (errorCode) =>
                (errorCode === "unknownSymbol" ? "error" : "ignore"),
        });
        expect('✌').toNotParse(settings);
        expect('\\text{✌}').toNotParse(settings);
    });

    it("should allow emoji outside strict mode", function() {
        expect('✌').toWarn();
        expect('\\text{✌}').toWarn();
        const settings = new Settings({
            strict: (errorCode) =>
                (errorCode === "unknownSymbol" ? "ignore" : "error"),
        });
        expect('✌').toParse(settings);
        expect('\\text{✌}').toParse(settings);
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
