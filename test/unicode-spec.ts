/* eslint max-len:0 */
import katex from "../katex";
import Settings from "../src/Settings";
import {getFontGlyphCharacter, setFontMetrics} from "../src/fontMetrics";
import {scriptFromCodepoint, supportedCodepoint} from "../src/unicodeScripts";
import {strictSettings, nonstrictSettings} from "./helpers";

describe("unicode", function() {
    it("should build Latin-1 inside \\text{}", function() {
        expect`\text{ÀÁÂÃÄÅÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåèéêëìíîïñòóôõöùúûüýÿÆÇÐØÞßæçðøþ}`
            .toBuild();
    });

    it("should build middle dot inside \\text{}", function() {
        expect`\text{eV·nm}`.toBuild();
    });

    it("should build middle dot like \\cdotp in math mode", function() {
        expect`x·y`.toBuildLike`x\cdotp y`;
    });

    it("should not build \\cdotp in text mode", function() {
        expect`\text{\cdotp}`.not.toBuild();
    });

    it("should parse middle dot in math mode with strict", function() {
        expect`·`.toParse(strictSettings);
    });

    it("should build Latin-1 inside \\text{} like accent commands", function() {
        expect`\text{ÀÁÂÃÄÅÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåèéêëìíîïñòóôõöùúûüýÿÇç}`
            .toParseLike`\text{\`A\'A\^A\~A\"A\r A\`E\'E\^E\"E\`I\'I\^I\"I\~N\`O\'O\^O\~O\"O\`U\'U\^U\"U\'Y\`a\'a\^a\~a\"a\r a\`e\'e\^e\"e\`ı\'ı\^ı\"ı\~n\`o\'o\^o\~o\"o\`u\'u\^u\"u\'y\"y\c C\c c}`;
        // TODO(edemaine): A few characters don't have analogs yet.
    });

    it("should not parse Latin-1 outside \\text{} with strict", function() {
        const chars = 'ÀÁÂÃÄÅÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåèéêëìíîïñòóôõöùúûüýÿÇÐÞçþ';
        for (const ch of chars) {
            expect(ch).not.toParse(strictSettings);
        }
    });

    it("should build Latin-1 outside \\text{}", function() {
        expect`ÀÁÂÃÄÅÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåèéêëìíîïñòóôõöùúûüýÿÇÐÞçðþ`
            .toBuild(nonstrictSettings);
    });

    it("should build all lower case Greek letters", function() {
        expect`αβγδεϵζηθϑικλμνξοπϖρϱςστυφϕχψω`.toBuild();
    });

    it("should build math upper case Greek letters", function() {
        expect`ΓΔΘΛΞΠΣΥΦΨΩ`.toBuild();
    });

    it("should build Cyrillic inside \\text{}", function() {
        expect`\text{БГДЖЗЙЛФЦШЫЮЯ}`.toBuild();
    });

    it("should build Cyrillic outside \\text{}", function() {
        expect`БГДЖЗЙЛФЦШЫЮЯ`.toBuild(nonstrictSettings);
    });

    it("should not parse Cyrillic outside \\text{} with strict", function() {
        expect`БГДЖЗЙЛФЦШЫЮЯ`.not.toParse(strictSettings);
    });

    it("should build CJK inside \\text{}", function() {
        expect`\text{私はバナナです}`.toBuild();
        expect`\text{여보세요}`.toBuild();
    });

    it("should build CJK outside \\text{}", function() {
        expect`私はバナナです`.toBuild(nonstrictSettings);
        expect`여보세요`.toBuild(nonstrictSettings);
    });

    it("should not parse CJK outside \\text{} with strict", function() {
        expect`私はバナナです。`.not.toParse(strictSettings);
        expect`여보세요`.not.toParse(strictSettings);
    });

    it("should build Devanagari inside \\text{}", function() {
        expect`\text{नमस्ते}`.toBuild();
    });

    it("should build Devanagari outside \\text{}", function() {
        expect`नमस्ते`.toBuild(nonstrictSettings);
    });

    it("should not parse Devanagari outside \\text{} with strict", function() {
        expect`नमस्ते`.not.toParse(strictSettings);
    });

    it("should build Georgian inside \\text{}", function() {
        expect`\text{გამარჯობა}`.toBuild();
    });

    it("should build Georgian outside \\text{}", function() {
        expect`გამარჯობა`.toBuild(nonstrictSettings);
    });

    it("should not parse Georgian outside \\text{} with strict", function() {
        expect`გამარჯობა`.not.toParse(strictSettings);
    });

    it("should build Armenian both inside and outside \\text{}", function() {
        expect`ԱԲԳաբգ`.toBuild(nonstrictSettings);
        expect`\text{ԱԲԳաբգ}`.toBuild(nonstrictSettings);
    });

    it("should build extended Latin characters inside \\text{}", function() {
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
    const scriptRegExps: Record<string, RegExp> = {
        // eslint-disable-next-line no-misleading-character-class
        latin: /[\u0100-\u024f\u0300-\u036f]/,
        cyrillic: /[\u0400-\u04ff]/,
        armenian: /[\u0530-\u058F]/,
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

describe("glyph substitution", () => {
    it("renders \\perp in HTML with the U+22A5 glyph, keeping U+27C2 in MathML", () => {
        // U+27C2 PERPENDICULAR is absent from the KaTeX fonts but is the same
        // glyph as U+22A5 UP TACK, which they carry. Only the HTML output
        // substitutes; MathML keeps U+27C2 so copy/paste and assistive
        // technology still read the character the author wrote.
        const html = katex.renderToString("x \\perp y", {});
        const visible = html.match(/katex-html"[^>]*>([\s\S]*)<\/span><\/span>$/);
        expect(visible).not.toBeNull();
        expect(visible![1]).toContain("⊥");
        expect(visible![1]).not.toContain("⟂");
        expect(html).toContain("⟂");
    });

    // The positive direction above is covered end-to-end, reaching
    // getFontGlyphCharacter through buildCommon's lookupSymbol -- its only call
    // site. What an output-layer test cannot cover is the negative direction:
    // the lookalike entries in extraCharacterMap must NOT be substituted, and
    // only \perp is ever rendered by those tests.
    it("does not substitute characters that only borrow metrics", () => {
        // Contract: only genuine glyph equivalences may be substituted. Every
        // character below is absent from Main-Regular and has a lookalike in
        // extraCharacterMap ('Ш'->'W', 'Ð'->'D', 'Þ'->'o'), which exists to borrow
        // *metrics* only. Substituting them would change the visible text, so
        // getFontGlyphCharacter must return them unchanged -- whether by
        // consulting extraCharacterMap again or by admitting a lookalike into
        // glyphSubstitutionMap.
        //
        // These assertions pass by construction today: glyphSubstitutionMap holds
        // one entry, so all eight characters hit the `substitute === undefined`
        // early return. That is the point -- the test pins the construction. Wiring
        // the metrics map back in as a rendering fallback,
        //     glyphSubstitutionMap[c] ?? extraCharacterMap[c]
        // fails 8 of 8 assertions here while leaving \perp correct, so every
        // \perp-based test in this file and in mathml-spec.ts stays green. This is
        // the only guard on "metrics fallback must not become rendering fallback".
        for (const ch of ["\u0428", "\u0414", "\u0416", "\u0413"]) {
            expect(getFontGlyphCharacter(ch, "Main-Regular")).toBe(ch);
        }
        for (const ch of ["\u00C5", "\u00D0", "\u00DE", "\u00E5"]) {
            expect(getFontGlyphCharacter(ch, "Main-Regular")).toBe(ch);
        }
    });

    it("substitutes in math mode only, so text mode can fall back to system fonts", () => {
        // The substitution hook is gated on mode === "math" in buildCommon. In text
        // mode a character absent from the KaTeX fonts must be left alone, so the
        // browser can fall back (Cyrillic, CJK) instead of showing a Latin lookalike.
        // Without that gate, \text{U+27C2} would silently render as U+22A5.
        expect(() => katex.renderToString("\\text{\\char\"27C2}", nonstrictSettings))
            .toThrow(/No character metrics/);

        // Math mode is the arm that does substitute, so the pair distinguishes the
        // gate from "U+27C2 never renders anywhere".
        expect(katex.renderToString("\\char\"27C2", nonstrictSettings))
            .toContain("\u22A5");
    });

    it("leaves the character alone when the font does carry it", () => {
        // getFontGlyphCharacter substitutes only when the font genuinely lacks the
        // original. A font that carries U+27C2 must render U+27C2, not the U+22A5
        // stand-in -- otherwise the substitution is unconditional and a font
        // shipping the real glyph would never be used.
        expect(getFontGlyphCharacter("\u27C2", "Main-Regular")).toBe("\u22A5");

        const pluginFont = "PerpCarryingFont";
        setFontMetrics(pluginFont, {0x27C2: [0.5, 0.5, 0, 0, 0.5]});
        expect(getFontGlyphCharacter("\u27C2", pluginFont)).toBe("\u27C2");
    });
});
