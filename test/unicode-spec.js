/* eslint max-len:0 */
/* global expect: false */
/* global it: false */
/* global describe: false */
import Settings from "../src/Settings";
import {scriptFromCodepoint, supportedCodepoint} from "../src/unicodeScripts";
import {strictSettings, nonstrictSettings} from "./helpers";

describe("unicode", function() {
    it("should parse Latin-1 inside \\text{}", function() {
        expect`\text{ÀÁÂÃÄÅÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåèéêëìíîïñòóôõöùúûüýÿÆÇÐØÞßæçðøþ}`
            .toBuild();
    });

    it("should not parse Latin-1 outside \\text{} with strict", function() {
        const chars = 'ÀÁÂÃÄÅÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåèéêëìíîïñòóôõöùúûüýÿÇÐÞçþ';
        for (const ch of chars) {
            expect(ch).not.toParse(strictSettings);
        }
    });

    it("should parse Latin-1 outside \\text{}", function() {
        expect`ÀÁÂÃÄÅÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåèéêëìíîïñòóôõöùúûüýÿÇÐÞçðþ`
            .toBuild(nonstrictSettings);
    });

    it("should parse all lower case Greek letters", function() {
        expect`αβγδεϵζηθϑικλμνξοπϖρϱςστυφϕχψω`.toBuild();
    });

    it("should parse math upper case Greek letters", function() {
        expect`ΓΔΘΛΞΠΣΥΦΨΩ`.toBuild();
    });

    it("should parse Cyrillic inside \\text{}", function() {
        expect`\text{БГДЖЗЙЛФЦШЫЮЯ}`.toBuild();
    });

    it("should parse Cyrillic outside \\text{}", function() {
        expect`БГДЖЗЙЛФЦШЫЮЯ`.toBuild(nonstrictSettings);
    });

    it("should not parse Cyrillic outside \\text{} with strict", function() {
        expect`БГДЖЗЙЛФЦШЫЮЯ`.not.toParse(strictSettings);
    });

    it("should parse CJK inside \\text{}", function() {
        expect`\text{私はバナナです}`.toBuild();
        expect`\text{여보세요}`.toBuild();
    });

    it("should parse CJK outside \\text{}", function() {
        expect`私はバナナです`.toBuild(nonstrictSettings);
        expect`여보세요`.toBuild(nonstrictSettings);
    });

    it("should not parse CJK outside \\text{} with strict", function() {
        expect`私はバナナです。`.not.toParse(strictSettings);
        expect`여보세요`.not.toParse(strictSettings);
    });

    it("should parse Devangari inside \\text{}", function() {
        expect`\text{नमस्ते}`.toBuild();
    });

    it("should parse Devangari outside \\text{}", function() {
        expect`नमस्ते`.toBuild(nonstrictSettings);
    });

    it("should not parse Devangari outside \\text{} with strict", function() {
        expect`नमस्ते`.not.toParse(strictSettings);
    });

    it("should parse Georgian inside \\text{}", function() {
        expect`\text{გამარჯობა}`.toBuild();
    });

    it("should parse Georgian outside \\text{}", function() {
        expect`გამარჯობა`.toBuild(nonstrictSettings);
    });

    it("should not parse Georgian outside \\text{} with strict", function() {
        expect`გამარჯობა`.not.toParse(strictSettings);
    });

    it("should parse extended Latin characters inside \\text{}", function() {
        expect`\text{ěščřžůřťďňőİı}`.toBuild();
    });

    it("should not parse extended Latin outside \\text{} with strict", function() {
        expect`ěščřžůřťďňőİı`.not.toParse(strictSettings);
    });

    it("should not allow emoji in strict mode", function() {
        expect`✌`.not.toParse(strictSettings);
        expect`\text{✌}`.not.toParse(strictSettings);
        const settings = new Settings({
            strict: (errorCode) =>
                (errorCode === "unknownSymbol" ? "error" : "ignore"),
        });
        expect`✌`.not.toParse(settings);
        expect`\text{✌}`.not.toParse(settings);
    });

    it("should allow emoji outside strict mode", function() {
        expect`✌`.toWarn();
        expect`\text{✌}`.toWarn();
        const settings = new Settings({
            strict: (errorCode) =>
                (errorCode === "unknownSymbol" ? "ignore" : "error"),
        });
        expect`✌`.toParse(settings);
        expect`\text{✌}`.toParse(settings);
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
        scriptNames.map(script => scriptRegExps[script].source).join('|')
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
