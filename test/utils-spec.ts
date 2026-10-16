import {escape, hyphenate} from "../src/utils";

describe("escape", function() {
    it("should escape each special character", function() {
        expect(escape("&")).toBe("&amp;");
        expect(escape(">")).toBe("&gt;");
        expect(escape("<")).toBe("&lt;");
        expect(escape("\"")).toBe("&quot;");
        expect(escape("'")).toBe("&#x27;");
    });

    it("should escape every occurrence, including adjacent ones", function() {
        expect(escape("a<b>&\"c'd'")).toBe("a&lt;b&gt;&amp;&quot;c&#x27;d&#x27;");
        expect(escape("<<&&")).toBe("&lt;&lt;&amp;&amp;");
    });

    it("should not double-escape on repeated calls", function() {
        // Guards against regex state (lastIndex) leaking between calls.
        for (let i = 0; i < 3; i++) {
            expect(escape("x<y")).toBe("x&lt;y");
            expect(escape("clean")).toBe("clean");
            expect(escape("&")).toBe("&amp;");
        }
    });

    it("should leave strings with nothing to escape unchanged", function() {
        expect(escape("")).toBe("");
        expect(escape("mord mtight")).toBe("mord mtight");
        expect(escape("height:0.6944em;vertical-align:-0.0833em;"))
            .toBe("height:0.6944em;vertical-align:-0.0833em;");
        expect(escape("日本語 é 😀")).toBe("日本語 é 😀");
    });

    it("should not touch text that is already escaped", function() {
        expect(escape("&amp;")).toBe("&amp;amp;");
    });

    it("should coerce non-string input like String() does", function() {
        expect(escape(42)).toBe("42");
        expect(escape(null)).toBe("null");
        expect(escape(undefined)).toBe("undefined");
        expect(escape(["a", "<"])).toBe("a,&lt;");
        expect(escape({toString: () => "<x>"})).toBe("&lt;x&gt;");
    });
});

describe("hyphenate", function() {
    it("should convert camelCase to kebab-case", function() {
        expect(hyphenate("verticalAlign")).toBe("vertical-align");
        expect(hyphenate("borderBottomWidth")).toBe("border-bottom-width");
        expect(hyphenate("backgroundColor")).toBe("background-color");
    });

    it("should leave lowercase names unchanged", function() {
        expect(hyphenate("color")).toBe("color");
        expect(hyphenate("width")).toBe("width");
        expect(hyphenate("")).toBe("");
    });

    it("should lowercase uppercase letters", function() {
        expect(hyphenate("A")).toBe("-a");
        expect(hyphenate("ABC")).toBe("-a-b-c");
    });

    it("should return the same result on repeated calls", function() {
        for (let i = 0; i < 3; i++) {
            expect(hyphenate("marginLeft")).toBe("margin-left");
            expect(hyphenate("top")).toBe("top");
        }
    });

    it("should not confuse names that differ only in case", function() {
        // Preventing case-insensitive cache keys.
        expect(hyphenate("foobar")).toBe("foobar");
        expect(hyphenate("fooBar")).toBe("foo-bar");
        expect(hyphenate("FooBar")).toBe("-foo-bar");
        expect(hyphenate("foobar")).toBe("foobar");
    });

    it("should handle names that match Object.prototype members", function() {
        expect(hyphenate("constructor")).toBe("constructor");
        expect(hyphenate("toString")).toBe("to-string");
        expect(hyphenate("__proto__")).toBe("__proto__");
        expect(hyphenate("hasOwnProperty")).toBe("has-own-property");
    });
});
