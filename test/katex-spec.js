/* eslint max-len: 0 */

import buildMathML from "../src/buildMathML";
// Removed unused import for 'buildTree'
import katex from "../katex";
// Removed unused import for 'parseTree'
import Options from "../src/Options";
import Settings from "../src/Settings";
import Style from "../src/Style";
import {
    strictSettings, nonstrictSettings, r,
    getBuilt, getParsed, stripPositions,
} from "./helpers";

const defaultOptions = new Options({
    style: Style.TEXT,
    size: 5,
    maxSize: Infinity,
});

describe("A parser", () => {
    it("should not fail on an empty string", () => {
        expect("").toParse(strictSettings);
    });

    it("should ignore whitespace", () => {
        expect("    x    y    ").toParseLike("xy", strictSettings);
    });

    it("should ignore whitespace in atom", () => {
        expect("    x   ^ y    ").toParseLike("x^y", strictSettings);
    });
});

describe("An ord parser", () => {
    const expression = "1234|/@.\"`abcdefgzABCDEFGZ";

    it("should not fail", () => {
        expect(expression).toParse();
    });

    it("should build a list of ords", () => {
        const parse = getParsed(expression);

        for (const group of parse) {
            expect(group.type).toMatch("ord");
        }
    });

    it("should parse the right number of ords", () => {
        const parse = getParsed(expression);
        expect(parse).toHaveLength(expression.length);
    });
});

describe("A bin parser", () => {
    const expression = r`+-*\cdot\pm\div`;

    it("should not fail", () => {
        expect(expression).toParse();
    });

    it("should build a list of bins", () => {
        const parse = getParsed(expression);

        for (const group of parse) {
            expect(group.type).toEqual("atom");
            expect(group.family).toEqual("bin");
        }
    });
});

describe("A rel parser", () => {
    const expression = r`=<>\leq\geq\neq\nleq\ngeq\cong`;
    const notExpression = r`\not=\not<\not>\not\leq\not\geq\not\in`;

    it("should not fail", () => {
        expect(expression).toParse();
        expect(notExpression).toParse();
    });

    it("should build a list of rels", () => {
        const parse = getParsed(expression);

        for (let group of parse) {
            if (group.type === "htmlmathml") {
                expect(group.html).toHaveLength(1);
                group = group.html[0];
            }
            if (group.type === "mclass") {
                expect(group.mclass).toEqual("mrel");
            } else {
                expect(group.type).toEqual("atom");
                expect(group.family).toEqual("rel");
            }
        }
    });
});

describe("A mathinner parser", function() {
    it("should not fail", function() {
        expect`\mathinner{\langle{\psi}\rangle}`.toParse();
        expect`\frac 1 {\mathinner{\langle{\psi}\rangle}}`.toParse();
    });

    it("should return one group, not a fragment", function() {
        const contents = "\\mathinner{\\langle{\\psi}\\rangle}";
        const mml = buildMathML(getParsed(contents), contents, defaultOptions);
        expect(mml.children.length).toEqual(1);
    });
});

describe("A punct parser", function() {
    const expression = ",;";

    it("should not fail", function() {
        expect(expression).toParse(strictSettings);
    });

    it("should build a list of puncts", function() {
        const parse = getParsed(expression);

        for (let i = 0; i < parse.length; i++) {
            const group = parse[i];
            expect(group.type).toEqual("atom");
            expect(group.family).toEqual("punct");
        }
    });
});

describe("An open parser", function() {
    const expression = "([";

    it("should not fail", function() {
        expect(expression).toParse();
    });

    it("should build a list of opens", function() {
        const parse = getParsed(expression);

        for (let i = 0; i < parse.length; i++) {
            const group = parse[i];
            expect(group.type).toEqual("atom");
            expect(group.family).toEqual("open");
        }
    });
});

describe("A close parser", function() {
    const expression = ")]?!";

    it("should not fail", function() {
        expect(expression).toParse();
    });

    it("should build a list of closes", function() {
        const parse = getParsed(expression);

        for (let i = 0; i < parse.length; i++) {
            const group = parse[i];
            expect(group.type).toEqual("atom");
            expect(group.family).toEqual("close");
        }
    });
});

describe("A \\KaTeX parser", function() {
    it("should not fail", function() {
        expect`\KaTeX`.toParse();
    });
});

describe("A subscript and superscript parser", function() {
    it("should not fail on superscripts", function() {
        expect`x^2`.toParse();
    });

    it("should not fail on subscripts", function() {
        expect`x_3`.toParse();
    });

    it("should not fail on both subscripts and superscripts", function() {
        expect`x^2_3`.toParse();

        expect`x_2^3`.toParse();
    });

    it("should not fail when there is no nucleus", function() {
        expect`^3`.toParse();
        expect`^3+`.toParse();
        expect`_2`.toParse();
        expect`^3_2`.toParse();
        expect`_2^3`.toParse();
    });

    it("should produce supsubs for superscript", function() {
        const parse = getParsed`x^2`[0];

        expect(parse.type).toBe("supsub");
        expect(parse.base).toBeDefined();
        expect(parse.sup).toBeDefined();
        expect(parse.sub).toBeUndefined();
    });

    it("should produce supsubs for subscript", function() {
        const parse = getParsed`x_3`[0];

        expect(parse.type).toBe("supsub");
        expect(parse.base).toBeDefined();
        expect(parse.sub).toBeDefined();
        expect(parse.sup).toBeUndefined();
    });

    it("should produce supsubs for ^_", function() {
        const parse = getParsed`x^2_3`[0];

        expect(parse.type).toBe("supsub");
        expect(parse.base).toBeDefined();
        expect(parse.sup).toBeDefined();
        expect(parse.sub).toBeDefined();
    });

    it("should produce supsubs for _^", function() {
        const parse = getParsed`x_3^2`[0];

        expect(parse.type).toBe("supsub");
        expect(parse.base).toBeDefined();
        expect(parse.sup).toBeDefined();
        expect(parse.sub).toBeDefined();
    });

    it("should produce the same thing regardless of order", function() {
        expect`x^2_3`.toParseLike`x_3^2`;
    });

    it("should not parse double subscripts or superscripts", function() {
        expect`x^x^x`.not.toParse();

        expect`x_x_x`.not.toParse();

        expect`x_x^x_x`.not.toParse();

        expect`x_x^x^x`.not.toParse();

        expect`x^x_x_x`.not.toParse();

        expect`x^x_x^x`.not.toParse();
    });

    it("should work correctly with {}s", function() {
        expect`x^{2+3}`.toParse();

        expect`x_{3-2}`.toParse();

        expect`x^{2+3}_3`.toParse();

        expect`x^2_{3-2}`.toParse();

        expect`x^{2+3}_{3-2}`.toParse();

        expect`x_{3-2}^{2+3}`.toParse();

        expect`x_3^{2+3}`.toParse();

        expect`x_{3-2}^2`.toParse();
    });

    it("should work with nested super/subscripts", function() {
        expect`x^{x^x}`.toParse();
        expect`x^{x_x}`.toParse();
        expect`x_{x^x}`.toParse();
        expect`x_{x_x}`.toParse();
    });

    it("should work with Unicode (sub|super)script characters", function() {
        expect`A² + B²⁺³ + ¹²C + E₂³ + F₂₊₃`.toParseLike`A^{2} + B^{2+3} + ^{12}C + E_{2}^{3} + F_{2+3}`;
    });

    it("should not fail if \\relax is in an atom", function() {
        expect`\hskip1em\relax^2`.toParse(strictSettings);
    });

    it("should skip \\relax in super/subscripts", function() {
        expect`x^\relax 2`.toParseLike`x^2`;
        expect`x_\relax 2`.toParseLike`x_2`;
    });
});

describe("A subscript and superscript tree-builder", function() {
    it("should not fail when there is no nucleus", function() {
        expect`^3`.toBuild();
        expect`_2`.toBuild();
        expect`^3_2`.toBuild();
        expect`_2^3`.toBuild();
    });
});

describe("A parser with limit controls", function() {
    it("should fail when the limit control is not preceded by an op node", function() {
        expect`3\nolimits_2^2`.not.toParse();
        expect`\sqrt\limits_2^2`.not.toParse();
        expect`45 +\nolimits 45`.not.toParse();
    });

    it("should parse when the limit control directly follows an op node", function() {
        expect`\int\limits_2^2 3`.toParse();
        expect`\sum\nolimits_3^4 4`.toParse();
    });

    it("should parse when the limit control is in the sup/sub area of an op node", function() {
        expect`\int_2^2\limits`.toParse();
        expect`\int^2\nolimits_2`.toParse();
        expect`\int_2\limits^2`.toParse();
    });

    it("should allow multiple limit controls in the sup/sub area of an op node", function() {
        expect`\int_2\nolimits^2\limits 3`.toParse();
        expect`\int\nolimits\limits_2^2`.toParse();
        expect`\int\limits\limits\limits_2^2`.toParse();
    });

    it("should have the rightmost limit control determine the limits property " +
        "of the preceding op node", function() {

        let parsedInput = getParsed`\int\nolimits\limits_2^2`;
        expect(parsedInput[0].base.limits).toBe(true);

        parsedInput = getParsed`\int\limits_2\nolimits^2`;
        expect(parsedInput[0].base.limits).toBe(false);
    });
});

describe("A group parser", function() {
    it("should not fail", function() {
        expect`{xy}`.toParse();
    });

    it("should produce a single ord", function() {
        const parse = getParsed`{xy}`;

        expect(parse).toHaveLength(1);

        const ord = parse[0];

        expect(ord.type).toMatch("ord");
        expect(ord.body).toBeTruthy();
    });
});

describe("A \\begingroup...\\endgroup parser", function() {
    it("should not fail", function() {
        expect`\begingroup xy \endgroup`.toParse();
    });

    it("should fail when it is mismatched", function() {
        expect`\begingroup xy`.not.toParse();
        expect`\begingroup xy }`.not.toParse();
    });

    it("should produce a semi-simple group", function() {
        const parse = getParsed`\begingroup xy \endgroup`;

        expect(parse).toHaveLength(1);

        const ord = parse[0];

        expect(ord.type).toMatch("ord");
        expect(ord.body).toBeTruthy();
        expect(ord.semisimple).toBeTruthy();
    });

    it("should not affect spacing in math mode", function() {
        expect`\begingroup x+ \endgroup y`.toBuildLike`x+y`;
    });
});

describe("An implicit group parser", function() {
    it("should not fail", function() {
        expect`\Large x`.toParse();
        expect`abc {abc \Large xyz} abc`.toParse();
    });

    it("should produce a single object", function() {
        const parse = getParsed`\Large abc`;

        expect(parse).toHaveLength(1);

        const sizing = parse[0];

        expect(sizing.type).toEqual("sizing");
        expect(sizing.body).toBeTruthy();
        expect(sizing.size).toBeDefined();
    });

    it("should apply only after the function", function() {
        const parse = getParsed`a \Large abc`;

        expect(parse).toHaveLength(2);

        const sizing = parse[1];

        expect(sizing.type).toEqual("sizing");
        expect(sizing.body).toHaveLength(3);
    });

    it("should stop at the ends of groups", function() {
        const parse = getParsed`a { b \Large c } d`;

        const group = parse[1];
        const sizing = group.body[1];

        expect(sizing.type).toEqual("sizing");
        expect(sizing.body).toHaveLength(1);
    });

    describe("within optional groups", () => {
        it("should work with sizing commands: \\sqrt[\\small 3]{x}", () => {
            const tree = stripPositions(getParsed`\sqrt[\small 3]{x}`);
            expect(tree).toMatchSnapshot();
        });

        it("should work with \\color: \\sqrt[\\color{red} 3]{x}", () => {
            const tree = stripPositions(getParsed`\sqrt[\color{red} 3]{x}`);
            expect(tree).toMatchSnapshot();
        });

        it("should work style commands \\sqrt[\\textstyle 3]{x}", () => {
            const tree = stripPositions(getParsed`\sqrt[\textstyle 3]{x}`);
            expect(tree).toMatchSnapshot();
        });

        it("should work with old font functions: \\sqrt[\\tt 3]{x}", () => {
            const tree = stripPositions(getParsed`\sqrt[\tt 3]{x}`);
            expect(tree).toMatchSnapshot();
        });
    });
});

describe("A function parser", function() {
    it("should parse no argument functions", function() {
        expect`\div`.toParse();
    });

    it("should parse 1 argument functions", function() {
        expect`\blue x`.toParse();
    });

    it("should parse 2 argument functions", function() {
        expect`\frac 1 2`.toParse();
    });

    it("should not parse 1 argument functions with no arguments", function() {
        expect`\blue`.not.toParse();
    });

    it("should not parse 2 argument functions with 0 or 1 arguments", function() {
        expect`\frac`.not.toParse();

        expect`\frac 1`.not.toParse();
    });

    it("should not parse a function with text right after it", function() {
        expect`\redx`.not.toParse();
    });

    it("should parse a function with a number right after it", function() {
        expect`\frac12`.toParse();
    });

    it("should parse some functions with text right after it", function() {
        expect`\;x`.toParse();
    });
});

describe("A frac parser", function() {
    const expression = r`\frac{x}{y}`;
    const dfracExpression = r`\dfrac{x}{y}`;
    const tfracExpression = r`\tfrac{x}{y}`;
    const cfracExpression = r`\cfrac{x}{y}`;
    const genfrac1 = r`\genfrac ( ] {0.06em}{0}{a}{b+c}`;
    const genfrac2 = r`\genfrac ( ] {0.8pt}{}{a}{b+c}`;

    it("should not fail", function() {
        expect(expression).toParse();
    });

    it("should produce a frac", function() {
        const parse = getParsed(expression)[0];

        expect(parse.type).toEqual("genfrac");
        expect(parse.numer).toBeDefined();
        expect(parse.denom).toBeDefined();
    });

    it("should also parse cfrac, dfrac, tfrac, and genfrac", function() {
        expect(cfracExpression).toParse();
        expect(dfracExpression).toParse();
        expect(tfracExpression).toParse();
        expect(genfrac1).toParse();
        expect(genfrac2).toParse();
    });

    it("should parse cfrac, dfrac, tfrac, and genfrac as fracs", function() {
        const dfracParse = getParsed(dfracExpression)[0];

        expect(dfracParse.type).toEqual("genfrac");
        expect(dfracParse.numer).toBeDefined();
        expect(dfracParse.denom).toBeDefined();

        const tfracParse = getParsed(tfracExpression)[0];

        expect(tfracParse.type).toEqual("genfrac");
        expect(tfracParse.numer).toBeDefined();
        expect(tfracParse.denom).toBeDefined();

        const cfracParse = getParsed(cfracExpression)[0];

        expect(cfracParse.type).toEqual("genfrac");
        expect(cfracParse.numer).toBeDefined();
        expect(cfracParse.denom).toBeDefined();

        const genfracParse = getParsed(genfrac1)[0];

        expect(genfracParse.type).toEqual("genfrac");
        expect(genfracParse.numer).toBeDefined();
        expect(genfracParse.denom).toBeDefined();
        expect(genfracParse.leftDelim).toBeDefined();
        expect(genfracParse.rightDelim).toBeDefined();
    });

    it("should fail, given math as a line thickness to genfrac", function() {
        const badGenFrac = "\\genfrac ( ] {b+c}{0}{a}{b+c}";
        expect(badGenFrac).not.toParse();
    });

    it("should fail if genfrac is given less than 6 arguments", function() {
        const badGenFrac = "\\genfrac ( ] {0.06em}{0}{a}";
        expect(badGenFrac).not.toParse();
    });

    it("should parse atop", function() {
        const parse = getParsed`x \atop y`[0];

        expect(parse.type).toEqual("genfrac");
        expect(parse.numer).toBeDefined();
        expect(parse.denom).toBeDefined();
        expect(parse.hasBarLine).toEqual(false);
    });
});

describe("An over/brace/brack parser", function() {
    const simpleOver = r`1 \over x`;
    const complexOver = r`1+2i \over 3+4i`;
    const braceFrac = r`a+b \brace c+d`;
    const brackFrac = r`a+b \brack c+d`;

    it("should not fail", function() {
        expect(simpleOver).toParse();
        expect(complexOver).toParse();
        expect(braceFrac).toParse();
        expect(brackFrac).toParse();
    });

    it("should produce a frac", function() {
        let parse;

        parse = getParsed(simpleOver)[0];

        expect(parse.type).toEqual("genfrac");
        expect(parse.numer).toBeDefined();
        expect(parse.denom).toBeDefined();

        parse = getParsed(complexOver)[0];

        expect(parse.type).toEqual("genfrac");
        expect(parse.numer).toBeDefined();
        expect(parse.denom).toBeDefined();

        const parseBraceFrac = getParsed(braceFrac)[0];

        expect(parseBraceFrac.type).toEqual("genfrac");
        expect(parseBraceFrac.numer).toBeDefined();
        expect(parseBraceFrac.denom).toBeDefined();
        expect(parseBraceFrac.leftDelim).toBeDefined();
        expect(parseBraceFrac.rightDelim).toBeDefined();

        const parseBrackFrac = getParsed(brackFrac)[0];

        expect(parseBrackFrac.type).toEqual("genfrac");
        expect(parseBrackFrac.numer).toBeDefined();
        expect(parseBrackFrac.denom).toBeDefined();
        expect(parseBrackFrac.leftDelim).toBeDefined();
        expect(parseBrackFrac.rightDelim).toBeDefined();
    });

    it("should create a numerator from the atoms before \\over", function() {
        const parse = getParsed(complexOver)[0];

        const numer = parse.numer;
        expect(numer.body).toHaveLength(4);
    });

    it("should create a denominator from the atoms after \\over", function() {
        const parse = getParsed(complexOver)[0];

        const denom = parse.denom;
        expect(denom.body).toHaveLength(4);
    });

    it("should handle empty numerators", function() {
        const emptyNumerator = r`\over x`;
        const parse = getParsed(emptyNumerator)[0];
        expect(parse.type).toEqual("genfrac");
        expect(parse.numer).toBeDefined();
        expect(parse.denom).toBeDefined();
    });

    it("should handle empty denominators", function() {
        const emptyDenominator = r`1 \over`;
        const parse = getParsed(emptyDenominator)[0];
        expect(parse.type).toEqual("genfrac");
        expect(parse.numer).toBeDefined();
        expect(parse.denom).toBeDefined();
    });

    it("should handle \\displaystyle correctly", function() {
        const displaystyleExpression = r`\displaystyle 1 \over 2`;
        const parse = getParsed(displaystyleExpression)[0];
        expect(parse.type).toEqual("genfrac");
        expect(parse.numer.body[0].type).toEqual("styling");
        expect(parse.denom).toBeDefined();
    });

    it("should handle \\textstyle correctly", function() {
        expect`\textstyle 1 \over 2`.toParseLike`\frac{\textstyle 1}{2}`;
        expect`{\textstyle 1} \over 2`.toParseLike`\frac{\textstyle 1}{2}`;
    });

    it("should handle nested factions", function() {
        const nestedOverExpression = r`{1 \over 2} \over 3`;
        const parse = getParsed(nestedOverExpression)[0];
        expect(parse.type).toEqual("genfrac");
        expect(parse.numer.body[0].type).toEqual("genfrac");
        expect(parse.numer.body[0].numer.body[0].text).toEqual("1");
        expect(parse.numer.body[0].denom.body[0].text).toEqual("2");
        expect(parse.denom).toBeDefined();
        expect(parse.denom.body[0].text).toEqual("3");
    });

    it("should fail with multiple overs in the same group", function() {
        const badMultipleOvers = r`1 \over 2 + 3 \over 4`;
        expect(badMultipleOvers).not.toParse();

        const badOverChoose = r`1 \over 2 \choose 3`;
        expect(badOverChoose).not.toParse();
    });
});

describe("A genfrac builder", function() {
    it("should not fail", function() {
        expect`\frac{x}{y}`.toBuild();
        expect`\dfrac{x}{y}`.toBuild();
        expect`\tfrac{x}{y}`.toBuild();
        expect`\cfrac{x}{y}`.toBuild();
        expect`\genfrac ( ] {0.06em}{0}{a}{b+c}`.toBuild();
        expect`\genfrac ( ] {0.8pt}{}{a}{b+c}`.toBuild();
        expect`\genfrac {} {} {0.8pt}{}{a}{b+c}`.toBuild();
        expect`\genfrac [ {} {0.8pt}{}{a}{b+c}`.toBuild();
    });
});

describe("A infix builder", function() {
    it("should not fail", function() {
        expect`a \over b`.toBuild();
        expect`a \atop b`.toBuild();
        expect`a \choose b`.toBuild();
        expect`a \brace b`.toBuild();
        expect`a \brack b`.toBuild();
    });
});

describe("A sizing parser", function() {
    const sizeExpression = r`\Huge{x}\small{x}`;

    it("should not fail", function() {
        expect(sizeExpression).toParse();
    });

    it("should produce a sizing node", function() {
        const parse = getParsed(sizeExpression)[0];

        expect(parse.type).toEqual("sizing");
        expect(parse.size).toBeDefined();
        expect(parse.body).toBeDefined();
    });
});

describe("A text parser", function() {
    const textExpression = r`\text{a b}`;
    const noBraceTextExpression = r`\text x`;
    const nestedTextExpression =
        r`\text{a {b} \blue{c} \textcolor{#fff}{x} \llap{x}}`;
    const spaceTextExpression = r`\text{  a \  }`;
    const leadingSpaceTextExpression = r`\text {moo}`;
    const badTextExpression = r`\text{a b%}`;
    const badFunctionExpression = r`\text{\sqrt{x}}`;
    const mathTokenAfterText = r`\text{sin}^2`;

    it("should not fail", function() {
        expect(textExpression).toParse();
    });

    it("should produce a text", function() {
        const parse = getParsed(textExpression)[0];

        expect(parse.type).toEqual("text");
        expect(parse.body).toBeDefined();
    });

    it("should produce textords instead of mathords", function() {
        const parse = getParsed(textExpression)[0];
        const group = parse.body;

        expect(group[0].type).toEqual("textord");
    });

    it("should not parse bad text", function() {
        expect(badTextExpression).not.toParse();
    });

    it("should not parse bad functions inside text", function() {
        expect(badFunctionExpression).not.toParse();
    });

    it("should parse text with no braces around it", function() {
        expect(noBraceTextExpression).toParse();
    });

    it("should parse nested expressions", function() {
        expect(nestedTextExpression).toParse();
    });

    it("should contract spaces", function() {
        const parse = getParsed(spaceTextExpression)[0];
        const group = parse.body;

        expect(group.length).toEqual(4);
        expect(group[0].type).toEqual("spacing");
        expect(group[1].type).toEqual("textord");
        expect(group[2].type).toEqual("spacing");
        expect(group[3].type).toEqual("spacing");
    });

    it("should handle backslash followed by newline", () => {
        expect("\\text{\\ \t\r \n \t\r  }").toParseLike`\text{\ }`;
    });

    it("should accept math mode tokens after its argument", function() {
        expect(mathTokenAfterText).toParse();
    });

    it("should ignore a space before the text group", function() {
        const parse = getParsed(leadingSpaceTextExpression)[0];
        // [m, o, o]
        expect(parse.body).toHaveLength(3);
        expect(parse.body.map(n => n.text).join("")).toBe("moo");
    });

    it("should parse math within text group", function() {
        expect`\text{graph: $y = mx + b$}`.toParse(strictSettings);
        expect`\text{graph: \(y = mx + b\)}`.toParse(strictSettings);
    });

    it("should parse math within text within math within text", function() {
        expect`\text{hello $x + \text{world $y$} + z$}`.toParse(strictSettings);
        expect`\text{hello \(x + \text{world $y$} + z\)}`.toParse(strictSettings);
        expect`\text{hello $x + \text{world \(y\)} + z$}`.toParse(strictSettings);
        expect`\text{hello \(x + \text{world \(y\)} + z\)}`.toParse(strictSettings);
    });

    it("should forbid \\( within math mode", function() {
        expect`\(`.not.toParse();
        expect`\text{$\(x\)$}`.not.toParse();
    });

    it("should forbid $ within math mode", function() {
        expect`$x$`.not.toParse();
        expect`\text{\($x$\)}`.not.toParse();
    });

    it("should detect unbalanced \\)", function() {
        expect`\)`.not.toParse();
        expect`\text{\)}`.not.toParse();
    });

    it("should detect unbalanced $", function() {
        expect`$`.not.toParse();
        expect`\text{$}`.not.toParse();
    });

    it("should not mix $ and \\(..\\)", function() {
        expect`\text{$x\)}`.not.toParse();
        expect`\text{\(x$}`.not.toParse();
    });

    it("should parse spacing functions", function() {
        expect`a b\, \; \! \: \> ~ \thinspace \medspace \quad \ `.toBuild();
        expect`\enspace \thickspace \qquad \space \nobreakspace`.toBuild();
    });

    it("should omit spaces after commands", function() {
        expect`\text{\textellipsis !}`.toParseLike`\text{\textellipsis!}`;
    });

    it("should handle ⋮ and \\vdots", function() {
        expect`\text{a \vdots b ⋮ d}`.toParse();
    });
});

describe("A texvc builder", function() {
    it("should not fail", function() {
        expect`\lang\N\darr\R\dArr\Z\Darr\alef\rang`.toBuild();
        expect(`\\alefsym\\uarr\\Alpha\\uArr\\Beta\\Uarr\\Chi`).toBuild();
        expect`\clubs\diamonds\hearts\spades\cnums\Complex`.toBuild();
        expect`\Dagger\empty\harr\Epsilon\hArr\Eta\Harr\exist`.toBuild();
        expect`\image\larr\infin\lArr\Iota\Larr\isin\Kappa`.toBuild();
        expect`\Mu\lrarr\natnums\lrArr\Nu\Lrarr\Omicron`.toBuild();
        expect`\real\rarr\plusmn\rArr\reals\Rarr\Reals\Rho`.toBuild();
        expect`\text{\sect}\sdot\sub\sube\supe`.toBuild();
        expect`\Tau\thetasym\weierp\Zeta`.toBuild();
    });
});

describe("A color parser", function() {
    const colorExpression = r`\blue{x}`;
    const newColorExpression = r`\redA{x}`;
    const customColorExpression1 = r`\textcolor{#fA6}{x}`;
    const customColorExpression2 = r`\textcolor{#fA6fA6}{x}`;
    const customColorExpression3 = r`\textcolor{fA6fA6}{x}`;
    const badCustomColorExpression1 = r`\textcolor{bad-color}{x}`;
    const badCustomColorExpression2 = r`\textcolor{#fA6f}{x}`;
    const badCustomColorExpression3 = r`\textcolor{#gA6}{x}`;
    const oldColorExpression = r`\color{#fA6}xy`;

    it("should not fail", function() {
        expect(colorExpression).toParse();
    });

    it("should build a color node", function() {
        const parse = getParsed(colorExpression)[0];

        expect(parse.type).toEqual("color");
        expect(parse.color).toBeDefined();
        expect(parse.body).toBeDefined();
    });

    it("should parse a custom color", function() {
        expect(customColorExpression1).toParse();
        expect(customColorExpression2).toParse();
        expect(customColorExpression3).toParse();
    });

    it("should correctly extract the custom color", function() {
        const parse1 = getParsed(customColorExpression1)[0];
        const parse2 = getParsed(customColorExpression2)[0];
        const parse3 = getParsed(customColorExpression3)[0];

        expect(parse1.color).toEqual("#fA6");
        expect(parse2.color).toEqual("#fA6fA6");
        expect(parse3.color).toEqual("#fA6fA6");
    });

    it("should not parse a bad custom color", function() {
        expect(badCustomColorExpression1).not.toParse();
        expect(badCustomColorExpression2).not.toParse();
        expect(badCustomColorExpression3).not.toParse();
    });

    it("should parse new colors from the branding guide", function() {
        expect(newColorExpression).toParse();
    });

    it("should use one-argument \\color by default", function() {
        expect(oldColorExpression).toParseLike`\textcolor{#fA6}{xy}`;
    });

    it("should use one-argument \\color if requested", function() {
        expect(oldColorExpression).toParseLike(r`\textcolor{#fA6}{xy}`, {
            colorIsTextColor: false,
        });
    });

    it("should use two-argument \\color if requested", function() {
        expect(oldColorExpression).toParseLike(r`\textcolor{#fA6}{x}y`, {
            colorIsTextColor: true,
        });
    });

    it("should not define \\color in global context", function() {
        const macros = {};
        expect(oldColorExpression).toParseLike(r`\textcolor{#fA6}{x}y`, {
            colorIsTextColor: true,
            globalGroup: true,
            macros: macros,
        });
        expect(macros).toEqual({});
    });
});

describe("A tie parser", function() {
    const mathTie = `a~b`;
    const textTie = r`\text{a~ b}`;

    it("should parse ties in math mode", function() {
        expect(mathTie).toParse();
    });

    it("should parse ties in text mode", function() {
        expect(textTie).toParse();
    });

    it("should produce spacing in math mode", function() {
        const parse = getParsed(mathTie);

        expect(parse[1].type).toEqual("spacing");
    });

    it("should produce spacing in text mode", function() {
        const text = getParsed(textTie)[0];
        const parse = text.body;

        expect(parse[1].type).toEqual("spacing");
    });

    it("should not contract with spaces in text mode", function() {
        const text = getParsed(textTie)[0];
        const parse = text.body;

        expect(parse[2].type).toEqual("spacing");
    });
});

describe("A delimiter sizing parser", function() {
    const normalDelim = r`\bigl |`;
    const notDelim = r`\bigl x`;
    const bigDelim = r`\Biggr \langle`;

    it("should parse normal delimiters", function() {
        expect(normalDelim).toParse();
        expect(bigDelim).toParse();
    });

    it("should not parse not-delimiters", function() {
        expect(notDelim).not.toParse();
    });

    it("should produce a delimsizing", function() {
        const parse = getParsed(normalDelim)[0];

        expect(parse.type).toEqual("delimsizing");
    });

    it("should produce the correct direction delimiter", function() {
        const leftParse = getParsed(normalDelim)[0];
        const rightParse = getParsed(bigDelim)[0];

        expect(leftParse.mclass).toEqual("mopen");
        expect(rightParse.mclass).toEqual("mclose");
    });

    it("should parse the correct size delimiter", function() {
        const smallParse = getParsed(normalDelim)[0];
        const bigParse = getParsed(bigDelim)[0];

        expect(smallParse.size).toEqual(1);
        expect(bigParse.size).toEqual(4);
    });
});

describe("An overline parser", function() {
    const overline = r`\overline{x}`;

    it("should not fail", function() {
        expect(overline).toParse();
    });

    it("should produce an overline", function() {
        const parse = getParsed(overline)[0];

        expect(parse.type).toEqual("overline");
    });
});

describe("An lap parser", function() {
    it("should not fail on a text argument", function() {
        expect`\rlap{\,/}{=}`.toParse();
        expect`\mathrlap{\,/}{=}`.toParse();
        expect`{=}\llap{/\,}`.toParse();
        expect`{=}\mathllap{/\,}`.toParse();
        expect`\sum_{\clap{ABCDEFG}}`.toParse();
        expect`\sum_{\mathclap{ABCDEFG}}`.toParse();
    });

    it("should not fail if math version is used", function() {
        expect`\mathrlap{\frac{a}{b}}{=}`.toParse();
        expect`{=}\mathllap{\frac{a}{b}}`.toParse();
        expect`\sum_{\mathclap{\frac{a}{b}}}`.toParse();
    });

    it("should fail on math if AMS version is used", function() {
        expect`\rlap{\frac{a}{b}}{=}`.not.toParse();
        expect`{=}\llap{\frac{a}{b}}`.not.toParse();
        expect`\sum_{\clap{\frac{a}{b}}}`.not.toParse();
    });

    it("should produce a lap", function() {
        const parse = getParsed`\mathrlap{\,/}`[0];

        expect(parse.type).toEqual("lap");
    });
});

describe("A rule parser", function() {
    const emRule = r`\rule{1em}{2em}`;
    const exRule = r`\rule{1ex}{2em}`;
    const badUnitRule = r`\rule{1au}{2em}`;
    const noNumberRule = r`\rule{1em}{em}`;
    const incompleteRule = r`\rule{1em}`;
    const hardNumberRule = r`\rule{   01.24ex}{2.450   em   }`;

    it("should not fail", function() {
        expect(emRule).toParse();
        expect(exRule).toParse();
    });

    it("should not parse invalid units", function() {
        expect(badUnitRule).not.toParse();

        expect(noNumberRule).not.toParse();
    });

    it("should not parse incomplete rules", function() {
        expect(incompleteRule).not.toParse();
    });

    it("should produce a rule", function() {
        const parse = getParsed(emRule)[0];

        expect(parse.type).toEqual("rule");
    });

    it("should list the correct units", function() {
        const emParse = getParsed(emRule)[0];
        const exParse = getParsed(exRule)[0];

        expect(emParse.width.unit).toEqual("em");
        expect(emParse.height.unit).toEqual("em");

        expect(exParse.width.unit).toEqual("ex");
        expect(exParse.height.unit).toEqual("em");
    });

    it("should parse the number correctly", function() {
        const hardNumberParse = getParsed(hardNumberRule)[0];

        expect(hardNumberParse.width.number).toBeCloseTo(1.24);
        expect(hardNumberParse.height.number).toBeCloseTo(2.45);
    });

    it("should parse negative sizes", function() {
        const parse = getParsed`\rule{-1em}{- 0.2em}`[0];

        expect(parse.width.number).toBeCloseTo(-1);
        expect(parse.height.number).toBeCloseTo(-0.2);
    });

    it("should parse in text mode", function() {
        expect(r`\text{a\rule{1em}{2em}b}`).toParse();
    });
});

describe("A kern parser", function() {
    const emKern = r`\kern{1em}`;
    const exKern = r`\kern{1ex}`;
    const muKern = r`\mkern{1mu}`;
    const abKern = r`a\kern{1em}b`;
    const badUnitRule = r`\kern{1au}`;
    const noNumberRule = r`\kern{em}`;

    it("should list the correct units", function() {
        const emParse = getParsed(emKern)[0];
        const exParse = getParsed(exKern)[0];
        const muParse = getParsed(muKern)[0];
        const abParse = getParsed(abKern)[1];

        expect(emParse.dimension.unit).toEqual("em");
        expect(exParse.dimension.unit).toEqual("ex");
        expect(muParse.dimension.unit).toEqual("mu");
        expect(abParse.dimension.unit).toEqual("em");
    });

    it("should not parse invalid units", function() {
        expect(badUnitRule).not.toParse();
        expect(noNumberRule).not.toParse();
    });

    it("should parse negative sizes", function() {
        const parse = getParsed`\kern{-1em}`[0];
        expect(parse.dimension.number).toBeCloseTo(-1);
    });

    it("should parse positive sizes", function() {
        const parse = getParsed`\kern{+1em}`[0];
        expect(parse.dimension.number).toBeCloseTo(1);
    });
});

describe("A non-braced kern parser", function() {
    const emKern = r`\kern1em`;
    const exKern = r`\kern 1 ex`;
    const muKern = r`\mkern 1mu`;
    const abKern1 = r`a\mkern1mub`;
    const abKern2 = r`a\mkern-1mub`;
    const abKern3 = r`a\mkern-1mu b`;
    const badUnitRule = r`\kern1au`;
    const noNumberRule = r`\kern em`;

    it("should list the correct units", function() {
        const emParse = getParsed(emKern)[0];
        const exParse = getParsed(exKern)[0];
        const muParse = getParsed(muKern)[0];
        const abParse1 = getParsed(abKern1)[1];
        const abParse2 = getParsed(abKern2)[1];
        const abParse3 = getParsed(abKern3)[1];

        expect(emParse.dimension.unit).toEqual("em");
        expect(exParse.dimension.unit).toEqual("ex");
        expect(muParse.dimension.unit).toEqual("mu");
        expect(abParse1.dimension.unit).toEqual("mu");
        expect(abParse2.dimension.unit).toEqual("mu");
        expect(abParse3.dimension.unit).toEqual("mu");
    });

    it("should parse elements on either side of a kern", function() {
        const abParse1 = getParsed(abKern1);
        const abParse2 = getParsed(abKern2);
        const abParse3 = getParsed(abKern3);

        expect(abParse1).toHaveLength(3);
        expect(abParse1[0].text).toEqual("a");
        expect(abParse1[2].text).toEqual("b");
        expect(abParse2).toHaveLength(3);
        expect(abParse2[0].text).toEqual("a");
        expect(abParse2[2].text).toEqual("b");
        expect(abParse3).toHaveLength(3);
        expect(abParse3[0].text).toEqual("a");
        expect(abParse3[2].text).toEqual("b");
    });

    it("should not parse invalid units", function() {
        expect(badUnitRule).not.toParse();
        expect(noNumberRule).not.toParse();
    });

    it("should parse negative sizes", function() {
        const parse = getParsed`\kern-1em`[0];
        expect(parse.dimension.number).toBeCloseTo(-1);
    });

    it("should parse positive sizes", function() {
        const parse = getParsed`\kern+1em`[0];
        expect(parse.dimension.number).toBeCloseTo(1);
    });

    it("should handle whitespace", function() {
        const abParse = getParsed("a\\mkern\t-\r1  \n mu\nb");

        expect(abParse).toHaveLength(3);
        expect(abParse[0].text).toEqual("a");
        expect(abParse[1].dimension.unit).toEqual("mu");
        expect(abParse[2].text).toEqual("b");
    });
});

describe("A left/right parser", function() {
    const normalLeftRight = r`\left( \dfrac{x}{y} \right)`;
    const emptyRight = r`\left( \dfrac{x}{y} \right.`;

    it("should not fail", function() {
        expect(normalLeftRight).toParse();
    });

    it("should produce a leftright", function() {
        const parse = getParsed(normalLeftRight)[0];

        expect(parse.type).toEqual("leftright");
        expect(parse.left).toEqual("(");
        expect(parse.right).toEqual(")");
    });

    it("should error when it is mismatched", function() {
        const unmatchedLeft = r`\left( \dfrac{x}{y}`;
        const unmatchedRight = r`\dfrac{x}{y} \right)`;

        expect(unmatchedLeft).not.toParse();

        expect(unmatchedRight).not.toParse();
    });

    it("should error when braces are mismatched", function() {
        const unmatched = r`{ \left( \dfrac{x}{y} } \right)`;
        expect(unmatched).not.toParse();
    });

    it("should error when non-delimiters are provided", function() {
        const nonDelimiter = r`\left$ \dfrac{x}{y} \right)`;
        expect(nonDelimiter).not.toParse();
    });

    it("should parse the empty '.' delimiter", function() {
        expect(emptyRight).toParse();
    });

    it("should parse the '.' delimiter with normal sizes", function() {
        const normalEmpty = r`\Bigl .`;
        expect(normalEmpty).toParse();
    });

    it("should handle \\middle", function() {
        const normalMiddle = r`\left( \dfrac{x}{y} \middle| \dfrac{y}{z} \right)`;
        expect(normalMiddle).toParse();
    });

    it("should handle multiple \\middles", function() {
        const multiMiddle = r`\left( \dfrac{x}{y} \middle| \dfrac{y}{z} \middle/ \dfrac{z}{q} \right)`;
        expect(multiMiddle).toParse();
    });

    it("should handle nested \\middles", function() {
        const nestedMiddle = r`\left( a^2 \middle| \left( b \middle/ c \right) \right)`;
        expect(nestedMiddle).toParse();
    });

    it("should error when \\middle is not in \\left...\\right", function() {
        const unmatchedMiddle = r`(\middle|\dfrac{x}{y})`;
        expect(unmatchedMiddle).not.toParse();
    });
});

describe("left/right builder", () => {
    const cases = [
        [r`\left\langle \right\rangle`, r`\left< \right>`],
        [r`\left\langle \right\rangle`, '\\left\u27e8 \\right\u27e9'],
        [r`\left\lparen \right\rparen`, r`\left( \right)`],
    ];

    for (const [actual, expected] of cases) {
        it(`should build "${actual}" like "${expected}"`, () => {
            expect(actual).toBuildLike(expected);
        });
    }
});

describe("A begin/end parser", function() {

    it("should parse a simple environment", function() {
        expect`\begin{matrix}a&b\\c&d\end{matrix}`.toParse();
    });

    it("should parse an environment with argument", function() {
        expect`\begin{array}{cc}a&b\\c&d\end{array}`.toParse();
    });

    it("should parse and build an empty environment", function() {
        expect`\begin{aligned}\end{aligned}`.toBuild();
        expect`\begin{matrix}\end{matrix}`.toBuild();
    });

    it("should parse an environment with hlines", function() {
        expect`\begin{matrix}\hline a&b\\ \hline c&d\end{matrix}`.toParse();
        expect`\begin{matrix}\hline a&b\cr \hline c&d\end{matrix}`.toParse();
        expect`\begin{matrix}\hdashline a&b\\ \hdashline c&d\end{matrix}`.toParse();
    });

    it("should forbid hlines outside array environment", () => {
        expect`\hline`.not.toParse();
    });

    it("should error when name is mismatched", function() {
        expect`\begin{matrix}a&b\\c&d\end{pmatrix}`.not.toParse();
    });

    it("should error when commands are mismatched", function() {
        expect`\begin{matrix}a&b\\c&d\right{pmatrix}`.not.toParse();
    });

    it("should error when end is missing", function() {
        expect`\begin{matrix}a&b\\c&d`.not.toParse();
    });

    it("should error when braces are mismatched", function() {
        expect`{\begin{matrix}a&b\\c&d}\end{matrix}`.not.toParse();
    });

    it("should cooperate with infix notation", function() {
        expect`\begin{matrix}0&1\over2&3\\4&5&6\end{matrix}`.toParse();
    });

    it("should nest", function() {
        const m1 = r`\begin{pmatrix}1&2\\3&4\end{pmatrix}`;
        const m2 = `\\begin{array}{rl}${m1}&0\\\\0&${m1}\\end{array}`;
        expect(m2).toParse();
    });

    it("should allow \\cr and \\\\ as a line terminator", function() {
        expect`\begin{matrix}a&b\cr c&d\end{matrix}`.toParse();
        expect`\begin{matrix}a&b\\c&d\end{matrix}`.toParse();
    });

    it("should not allow \\cr to scan for an optional size argument", function() {
        expect`\begin{matrix}a&b\cr[c]&d\end{matrix}`.toParse();
    });

    it("should not treat [ after space as optional argument to \\\\", function() {
        expect`\begin{matrix}a&b\\ [c]&d\end{matrix}`.toParse();
        expect`a\\ [b]`.toParse();
    });

    it("should eat a final newline", function() {
        const m3 = getParsed`\begin{matrix}a&b\\ c&d \\ \end{matrix}`[0];
        expect(m3.body).toHaveLength(2);
    });

    it("should grab \\arraystretch", function() {
        const parse = getParsed`\def\arraystretch{1.5}\begin{matrix}a&b\\c&d\end{matrix}`;
        expect(parse).toMatchSnapshot();
    });

    it("should allow an optional argument in {matrix*} and company.", function() {
        expect`\begin{matrix*}[r] a & -1 \\ -1 & d \end{matrix*}`.toBuild();
        expect`\begin{pmatrix*}[r] a & -1 \\ -1 & d \end{pmatrix*}`.toBuild();
        expect`\begin{bmatrix*}[r] a & -1 \\ -1 & d \end{bmatrix*}`.toBuild();
        expect`\begin{Bmatrix*}[r] a & -1 \\ -1 & d \end{Bmatrix*}`.toBuild();
        expect`\begin{vmatrix*}[r] a & -1 \\ -1 & d \end{vmatrix*}`.toBuild();
        expect`\begin{Vmatrix*}[r] a & -1 \\ -1 & d \end{Vmatrix*}`.toBuild();
        expect`\begin{matrix*} a & -1 \\ -1 & d \end{matrix*}`.toBuild();
        expect`\begin{matrix*}[] a & -1 \\ -1 & d \end{matrix*}`.not.toParse();
    });

    it("should allow blank columns", () => {
        const parsed = getParsed`\begin{matrix*}[r] a \\ -1 & d \end{matrix*}`;
        expect(parsed[0].cols).toEqual(
            [{type: 'align', align: 'r'},
             {type: 'align', align: 'r'}]);
    });
});

describe("A sqrt parser", function() {
    const sqrt = r`\sqrt{x}`;
    const missingGroup = r`\sqrt`;

    it("should parse square roots", function() {
        expect(sqrt).toParse();
    });

    it("should error when there is no group", function() {
        expect(missingGroup).not.toParse();
    });

    it("should produce sqrts", function() {
        const parse = getParsed(sqrt)[0];

        expect(parse.type).toEqual("sqrt");
    });

    it("should build sized square roots", function() {
        expect`\Large\sqrt[3]{x}`.toBuild();
    });

    it("should expand argument if optional argument doesn't exist", function() {
        expect`\sqrt\foo`.toParseLike("\\sqrt123",
            new Settings({macros: {"\\foo": "123"}}));
    });

    it("should not expand argument if optional argument exists", function() {
        expect`\sqrt[2]\foo`.toParseLike("\\sqrt[2]{123}",
            new Settings({macros: {"\\foo": "123"}}));
    });
});

describe("A TeX-compliant parser", function() {
    it("should work", function() {
        expect`\frac 2 3`.toParse();
    });

    it("should fail if there are not enough arguments", function() {
        const missingGroups = [
            r`\frac{x}`,
            r`\textcolor{#fff}`,
            r`\rule{1em}`,
            r`\llap`,
            r`\bigl`,
            r`\text`,
        ];

        for (let i = 0; i < missingGroups.length; i++) {
            expect(missingGroups[i]).not.toParse();
        }
    });

    it("should fail when there are missing sup/subscripts", function() {
        expect`x^`.not.toParse();
        expect`x_`.not.toParse();
    });

    it("should fail when arguments require arguments", function() {
        const badArguments = [
            r`\frac \frac x y z`,
            r`\frac x \frac y z`,
            r`\frac \sqrt x y`,
            r`\frac x \sqrt y`,
            r`\frac \mathllap x y`,
            r`\frac x \mathllap y`,
            // This actually doesn't work in real TeX, but it is surprisingly
            // hard to get this to correctly work. So, we take hit of very small
            // amounts of non-compatibility in order for the rest of the tests to
            // work
            // r`\llap \frac x y`,
            r`\mathllap \mathllap x`,
            r`\sqrt \mathllap x`,
        ];

        for (let i = 0; i < badArguments.length; i++) {
            expect(badArguments[i]).not.toParse();
        }
    });

    it("should work when the arguments have braces", function() {
        const goodArguments = [
            r`\frac {\frac x y} z`,
            r`\frac x {\frac y z}`,
            r`\frac {\sqrt x} y`,
            r`\frac x {\sqrt y}`,
            r`\frac {\mathllap x} y`,
            r`\frac x {\mathllap y}`,
            r`\mathllap {\frac x y}`,
            r`\mathllap {\mathllap x}`,
            r`\sqrt {\mathllap x}`,
        ];

        for (let i = 0; i < goodArguments.length; i++) {
            expect(goodArguments[i]).toParse();
        }
    });

    it("should fail when sup/subscripts require arguments", function() {
        const badSupSubscripts = [
            r`x^\sqrt x`,
            r`x^\mathllap x`,
            r`x_\sqrt x`,
            r`x_\mathllap x`,
        ];

        for (let i = 0; i < badSupSubscripts.length; i++) {
            expect(badSupSubscripts[i]).not.toParse();
        }
    });

    it("should work when sup/subscripts arguments have braces", function() {
        const goodSupSubscripts = [
            r`x^{\sqrt x}`,
            r`x^{\mathllap x}`,
            r`x_{\sqrt x}`,
            r`x_{\mathllap x}`,
        ];

        for (let i = 0; i < goodSupSubscripts.length; i++) {
            expect(goodSupSubscripts[i]).toParse();
        }
    });

    it("should parse multiple primes correctly", function() {
        expect`x''''`.toParse();
        expect`x_2''`.toParse();
        expect`x''_2`.toParse();
    });

    it("should fail when sup/subscripts are interspersed with arguments", function() {
        expect`\sqrt^23`.not.toParse();
        expect`\frac^234`.not.toParse();
        expect`\frac2^34`.not.toParse();
    });

    it("should succeed when sup/subscripts come after whole functions", function() {
        expect`\sqrt2^3`.toParse();
        expect`\frac23^4`.toParse();
    });

    it("should succeed with a sqrt around a text/frac", function() {
        expect`\sqrt \frac x y`.toParse();
        expect`\sqrt \text x`.toParse();
        expect`x^\frac x y`.toParse();
        expect`x_\text x`.toParse();
    });

    it("should fail when arguments are \\left", function() {
        const badLeftArguments = [
            r`\frac \left( x \right) y`,
            r`\frac x \left( y \right)`,
            r`\mathllap \left( x \right)`,
            r`\sqrt \left( x \right)`,
            r`x^\left( x \right)`,
        ];

        for (let i = 0; i < badLeftArguments.length; i++) {
            expect(badLeftArguments[i]).not.toParse();
        }
    });

    it("should succeed when there are braces around the \\left/\\right", function() {
        const goodLeftArguments = [
            r`\frac {\left( x \right)} y`,
            r`\frac x {\left( y \right)}`,
            r`\mathllap {\left( x \right)}`,
            r`\sqrt {\left( x \right)}`,
            r`x^{\left( x \right)}`,
        ];

        for (let i = 0; i < goodLeftArguments.length; i++) {
            expect(goodLeftArguments[i]).toParse();
        }
    });
});

describe("An op symbol builder", function() {
    it("should not fail", function() {
        expect`\int_i^n`.toBuild();
        expect`\iint_i^n`.toBuild();
        expect`\iiint_i^n`.toBuild();
        expect`\int\nolimits_i^n`.toBuild();
        expect`\iint\nolimits_i^n`.toBuild();
        expect`\iiint\nolimits_i^n`.toBuild();
        expect`\oint_i^n`.toBuild();
        expect`\oiint_i^n`.toBuild();
        expect`\oiiint_i^n`.toBuild();
        expect`\oint\nolimits_i^n`.toBuild();
        expect`\oiint\nolimits_i^n`.toBuild();
        expect`\oiiint\nolimits_i^n`.toBuild();
    });
});

describe("A style change parser", function() {
    it("should not fail", function() {
        expect`\displaystyle x`.toParse();
        expect`\textstyle x`.toParse();
        expect`\scriptstyle x`.toParse();
        expect`\scriptscriptstyle x`.toParse();
    });

    it("should produce the correct style", function() {
        const displayParse = getParsed`\displaystyle x`[0];
        expect(displayParse.style).toEqual("display");

        const scriptscriptParse = getParsed`\scriptscriptstyle x`[0];
        expect(scriptscriptParse.style).toEqual("scriptscript");
    });

    it("should only change the style within its group", function() {
        const text = r`a b { c d \displaystyle e f } g h`;
        const parse = getParsed(text);

        const displayNode = parse[2].body[2];

        expect(displayNode.type).toEqual("styling");

        const displayBody = displayNode.body;

        expect(displayBody).toHaveLength(2);
        expect(displayBody[0].text).toEqual("e");
    });
});

describe("A font parser", function() {
    it("should parse \\mathrm, \\mathbb, \\mathit, and \\mathnormal", function() {
        expect`\mathrm x`.toParse();
        expect`\mathbb x`.toParse();
        expect`\mathit x`.toParse();
        expect`\mathnormal x`.toParse();
        expect`\mathrm {x + 1}`.toParse();
        expect`\mathbb {x + 1}`.toParse();
        expect`\mathit {x + 1}`.toParse();
        expect`\mathnormal {x + 1}`.toParse();
    });

    it("should parse \\mathcal and \\mathfrak", function() {
        expect`\mathcal{ABC123}`.toParse();
        expect`\mathfrak{abcABC123}`.toParse();
    });

    it("should produce the correct fonts", function() {
        const mathbbParse = getParsed`\mathbb x`[0];
        expect(mathbbParse.font).toEqual("mathbb");
        expect(mathbbParse.type).toEqual("font");

        const mathrmParse = getParsed`\mathrm x`[0];
        expect(mathrmParse.font).toEqual("mathrm");
        expect(mathrmParse.type).toEqual("font");

        const mathitParse = getParsed`\mathit x`[0];
        expect(mathitParse.font).toEqual("mathit");
        expect(mathitParse.type).toEqual("font");

        const mathnormalParse = getParsed`\mathnormal x`[0];
        expect(mathnormalParse.font).toEqual("mathnormal");
        expect(mathnormalParse.type).toEqual("font");

        const mathcalParse = getParsed`\mathcal C`[0];
        expect(mathcalParse.font).toEqual("mathcal");
        expect(mathcalParse.type).toEqual("font");

        const mathfrakParse = getParsed`\mathfrak C`[0];
        expect(mathfrakParse.font).toEqual("mathfrak");
        expect(mathfrakParse.type).toEqual("font");
    });

    it("should parse nested font commands", function() {
        const nestedParse = getParsed`\mathbb{R \neq \mathrm{R}}`[0];
        expect(nestedParse.font).toEqual("mathbb");
        expect(nestedParse.type).toEqual("font");

        const bbBody = nestedParse.body.body;
        expect(bbBody).toHaveLength(3);
        expect(bbBody[0].type).toEqual("mathord");
        expect(bbBody[2].type).toEqual("font");
        expect(bbBody[2].font).toEqual("mathrm");
        expect(bbBody[2].type).toEqual("font");
    });

    it("should work with \\textcolor", function() {
        const colorMathbbParse = getParsed`\textcolor{blue}{\mathbb R}`[0];
        expect(colorMathbbParse.type).toEqual("color");
        expect(colorMathbbParse.color).toEqual("blue");
        const body = colorMathbbParse.body;
        expect(body).toHaveLength(1);
        expect(body[0].type).toEqual("font");
        expect(body[0].font).toEqual("mathbb");
    });

    it("should not parse a series of font commands", function() {
        expect`\mathbb \mathrm R`.not.toParse();
    });

    it("should nest fonts correctly", function() {
        const bf = getParsed`\mathbf{a\mathrm{b}c}`[0];
        expect(bf.type).toEqual("font");
        expect(bf.font).toEqual("mathbf");
        expect(bf.body.body).toHaveLength(3);
        expect(bf.body.body[0].text).toEqual("a");
        expect(bf.body.body[1].type).toEqual("font");
        expect(bf.body.body[1].font).toEqual("mathrm");
        expect(bf.body.body[2].text).toEqual("c");
    });

    it("should be allowed in the argument", function() {
        expect`e^\mathbf{x}`.toParse();
    });

    it("\\boldsymbol should inherit mbin/mrel from argument", () => {
        const built = getBuilt`a\boldsymbol{}b\boldsymbol{=}c\boldsymbol{+}d\boldsymbol{++}e\boldsymbol{xyz}f`;
        expect(built).toMatchSnapshot();
    });

    it("old-style fonts work like new-style fonts", () => {
        expect`\rm xyz`.toParseLike`\mathrm{xyz}`;
        expect`\sf xyz`.toParseLike`\mathsf{xyz}`;
        expect`\tt xyz`.toParseLike`\mathtt{xyz}`;
        expect`\bf xyz`.toParseLike`\mathbf{xyz}`;
        expect`\it xyz`.toParseLike`\mathit{xyz}`;
        expect`\cal xyz`.toParseLike`\mathcal{xyz}`;
    });
});

describe("A \\pmb builder", function() {
    it("should not fail", function() {
        expect`\pmb{\mu}`.toBuild();
        expect`\pmb{=}`.toBuild();
        expect`\pmb{+}`.toBuild();
        expect`\pmb{\frac{x^2}{x_1}}`.toBuild();
        expect`\pmb{}`.toBuild();
        expect("\\def\\x{1}\\pmb{\\x\\def\\x{2}}").toParseLike("\\pmb{1}");
    });
});

describe("A raise parser", function() {
    it("should parse and build text in \\raisebox", function() {
        expect`\raisebox{5pt}{text}`.toBuild(strictSettings);
        expect`\raisebox{-5pt}{text}`.toBuild(strictSettings);
    });

    it("should fail to parse math in \\raisebox", function() {
        expect("\\raisebox{5pt}{\\frac a b}").not.toParse(nonstrictSettings);
        expect("\\raisebox{-5pt}{\\frac a b}").not.toParse(nonstrictSettings);
    });

    it("should fail to build, given an unbraced length", function() {
        expect("\\raisebox5pt{text}").not.toBuild(strictSettings);
        expect("\\raisebox-5pt{text}").not.toBuild(strictSettings);
    });

    it("should build math in an hbox when math mode is set", function() {
        expect("a + \\vcenter{\\hbox{$\\frac{\\frac a b}c$}}").toBuild(strictSettings);
    });
});

describe("A comment parser", function() {
    it("should parse comments at the end of a line", () => {
        expect("a^2 + b^2 = c^2 % Pythagoras' Theorem\n").toParse();
    });

    it("should parse comments at the start of a line", () => {
        expect("% comment\n").toParse();
    });

    it("should parse multiple lines of comments in a row", () => {
        expect("% comment 1\n% comment 2\n").toParse();
    });

    it("should parse comments between subscript and superscript", () => {
        expect("x_3 %comment\n^2").toParseLike`x_3^2`;
        expect("x^ %comment\n{2}").toParseLike`x^{2}`;
        expect("x^ %comment\n\\frac{1}{2}").toParseLike`x^\frac{1}{2}`;
    });

    it("should parse comments in size and color groups", () => {
        expect("\\kern{1 %kern\nem}").toParse();
        expect("\\kern1 %kern\nem").toParse();
        expect("\\color{#f00%red\n}").toParse();
    });

    it("should parse comments before an expression", () => {
        expect("%comment\n{2}").toParseLike`{2}`;
    });

    it("should parse comments before and between \\hline", () => {
        expect("\\begin{matrix}a&b\\\\ %hline\n" +
            "\\hline %hline\n" +
            "\\hline c&d\\end{matrix}").toParse();
    });

    it("should parse comments in the macro definition", () => {
        expect("\\def\\foo{1 %}\n2}\n\\foo").toParseLike`12`;
    });

    it("should not expand nor ignore spaces after a command sequence in a comment", () => {
        expect("\\def\\foo{1\n2}\nx %\\foo\n").toParseLike`x`;
    });

    it("should not parse a comment without newline in strict mode", () => {
        expect`x%y`.not.toParse(strictSettings);
        expect`x%y`.toParse(nonstrictSettings);
    });

    it("should not produce or consume space", () => {
        expect("\\text{hello% comment 1\nworld}").toParseLike`\text{helloworld}`;
        expect("\\text{hello% comment\n\nworld}").toParseLike`\text{hello world}`;
    });

    it("should not include comments in the output", () => {
        expect("5 % comment\n").toParseLike`5`;
    });
});

describe("An HTML font tree-builder", function() {
    it("should render \\mathbb{R} with the correct font", function() {
        const markup = katex.renderToString(r`\mathbb{R}`);
        expect(markup).toContain("<span class=\"mord mathbb\">R</span>");
    });

    it("should render \\mathrm{R} with the correct font", function() {
        const markup = katex.renderToString(r`\mathrm{R}`);
        expect(markup).toContain("<span class=\"mord mathrm\">R</span>");
    });

    it("should render \\mathcal{R} with the correct font", function() {
        const markup = katex.renderToString(r`\mathcal{R}`);
        expect(markup).toContain("<span class=\"mord mathcal\">R</span>");
    });

    it("should render \\mathfrak{R} with the correct font", function() {
        const markup = katex.renderToString(r`\mathfrak{R}`);
        expect(markup).toContain("<span class=\"mord mathfrak\">R</span>");
    });

    it("should render \\text{R} with the correct font", function() {
        const markup = katex.renderToString(r`\text{R}`);
        expect(markup).toContain("<span class=\"mord\">R</span>");
    });

    it("should render \\textit{R} with the correct font", function() {
        const markup = katex.renderToString(r`\textit{R}`);
        expect(markup).toContain("<span class=\"mord textit\">R</span>");
    });

    it("should render \\text{\\textit{R}} with the correct font", function() {
        const markup = katex.renderToString(r`\text{\textit{R}}`);
        expect(markup).toContain("<span class=\"mord textit\">R</span>");
    });

    it("should render \\textup{R} with the correct font", function() {
        const markup1 = katex.renderToString(r`\textup{R}`);
        expect(markup1).toContain("<span class=\"mord textup\">R</span>");
        const markup2 = katex.renderToString(r`\textit{\textup{R}}`);
        expect(markup2).toContain("<span class=\"mord textup\">R</span>");
        const markup3 = katex.renderToString(r`\textup{\textit{R}}`);
        expect(markup3).toContain("<span class=\"mord textit\">R</span>");
    });

    it("should render \\text{R\\textit{S}T} with the correct fonts", function() {
        const markup = katex.renderToString(r`\text{R\textit{S}T}`);
        expect(markup).toContain("<span class=\"mord\">R</span>");
        expect(markup).toContain("<span class=\"mord textit\">S</span>");
        expect(markup).toContain("<span class=\"mord\">T</span>");
    });

    it("should render \\textbf{R } with the correct font", function() {
        const markup = katex.renderToString(r`\textbf{R }`);
        expect(markup).toContain("<span class=\"mord textbf\">R\u00a0</span>");
    });

    it("should render \\textmd{R} with the correct font", function() {
        const markup1 = katex.renderToString(r`\textmd{R}`);
        expect(markup1).toContain("<span class=\"mord textmd\">R</span>");
        const markup2 = katex.renderToString(r`\textbf{\textmd{R}}`);
        expect(markup2).toContain("<span class=\"mord textmd\">R</span>");
        const markup3 = katex.renderToString(r`\textmd{\textbf{R}}`);
        expect(markup3).toContain("<span class=\"mord textbf\">R</span>");
    });

    it("should render \\textsf{R} with the correct font", function() {
        const markup = katex.renderToString(r`\textsf{R}`);
        expect(markup).toContain("<span class=\"mord textsf\">R</span>");
    });

    it("should render \\textsf{\\textit{R}G\\textbf{B}} with the correct font", function() {
        const markup = katex.renderToString(r`\textsf{\textit{R}G\textbf{B}}`);
        expect(markup).toContain("<span class=\"mord textsf textit\">R</span>");
        expect(markup).toContain("<span class=\"mord textsf\">G</span>");
        expect(markup).toContain("<span class=\"mord textsf textbf\">B</span>");
    });

    it("should render \\textsf{\\textbf{$\\mathrm{A}$}} with the correct font", function() {
        const markup = katex.renderToString(r`\textsf{\textbf{$\mathrm{A}$}}`);
        expect(markup).toContain("<span class=\"mord mathrm\">A</span>");
    });

    it("should render \\textsf{\\textbf{$\\mathrm{\\textsf{A}}$}} with the correct font", function() {
        const markup = katex.renderToString(r`\textsf{\textbf{$\mathrm{\textsf{A}}$}}`);
        expect(markup).toContain("<span class=\"mord textsf textbf\">A</span>");
    });

    it("should render \\texttt{R} with the correct font", function() {
        const markup = katex.renderToString(r`\texttt{R}`);
        expect(markup).toContain("<span class=\"mord texttt\">R</span>");
    });

    it("should render a combination of font and color changes", function() {
        let markup = katex.renderToString(r`\textcolor{blue}{\mathbb R}`);
        let span = "<span class=\"mord mathbb\" style=\"color:blue;\">R</span>";
        expect(markup).toContain(span);

        markup = katex.renderToString(r`\mathbb{\textcolor{blue}{R}}`);
        span = "<span class=\"mord mathbb\" style=\"color:blue;\">R</span>";
        expect(markup).toContain(span);
    });

    it("should render wide characters with mord and with the correct font", function() {
        const markup = katex.renderToString(String.fromCharCode(0xD835, 0xDC00));
        expect(markup).toContain("<span class=\"mord mathbf\">A</span>");

        expect(String.fromCharCode(0xD835, 0xDC00) +
                " = " + String.fromCharCode(0xD835, 0xDC1A))
            .toBuildLike`\mathbf A = \mathbf a`;
    });

    it("should throw TypeError when the expression is of the wrong type", function() {
        expect(function() {
            katex.renderToString({badInputType: "yes"});
        }).toThrowError(TypeError);
        expect(function() {
            katex.renderToString([1, 2]);
        }).toThrowError(TypeError);
        expect(function() {
            katex.renderToString(undefined);
        }).toThrowError(TypeError);
        expect(function() {
            katex.renderToString(null);
        }).toThrowError(TypeError);
        expect(function() {
            katex.renderToString(1.234);
        }).toThrowError(TypeError);
    });

    it("should not throw TypeError when the expression is a supported type", function() {
        expect(function() {
            katex.renderToString(r`\sqrt{123}`);
        }).not.toThrowError(TypeError);
        expect(function() {
            katex.renderToString(new String(r`\sqrt{123}`));
        }).not.toThrowError(TypeError);
    });
});

describe("A MathML font tree-builder", () => {
    const contents = r`Ax2k\omega\Omega\imath+`;

    it("should render \\mathscr{" + contents + "} with the correct mathvariants", () => {
        const tex = `\\mathscr{${contents}}`;
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi mathvariant=\"script\">A</mi>");
        expect(markup).toContain("<mi mathvariant=\"script\">x</mi>");
        expect(markup).toContain("<mn mathvariant=\"script\">2</mn>");
        expect(markup).toContain("<mi mathvariant=\"script\">\u03c9</mi>"); // \omega
        expect(markup).toContain("<mi mathvariant=\"script\">\u03A9</mi>"); // \Omega
        expect(markup).toContain("<mi mathvariant=\"script\">\u0131</mi>"); // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathsf{" + contents + "} with the correct mathvariants", () => {
        const tex = `\\mathsf{${contents}}`;
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi mathvariant=\"sans-serif\">A</mi>");
        expect(markup).toContain("<mi mathvariant=\"sans-serif\">x</mi>");
        expect(markup).toContain("<mn mathvariant=\"sans-serif\">2</mn>");
        expect(markup).toContain("<mi mathvariant=\"sans-serif\">\u03c9</mi>"); // \omega
        expect(markup).toContain("<mi mathvariant=\"sans-serif\">\u03A9</mi>"); // \Omega
        expect(markup).toContain("<mi mathvariant=\"sans-serif\">\u0131</mi>"); // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathsfit{" + contents + "} with the correct mathvariants", () => {
        const tex = `\\mathsfit{${contents}}`;
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi mathvariant=\"sans-serif-italic\">A</mi>");
        expect(markup).toContain("<mi mathvariant=\"sans-serif-italic\">x</mi>");
        expect(markup).toContain("<mn mathvariant=\"sans-serif-italic\">2</mn>");
        expect(markup).toContain("<mi mathvariant=\"sans-serif-italic\">\u03c9</mi>"); // \omega
        expect(markup).toContain("<mi mathvariant=\"sans-serif-italic\">\u03A9</mi>"); // \Omega
        expect(markup).toContain("<mi mathvariant=\"sans-serif-italic\">\u0131</mi>"); // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render a combination of font and color changes", () => {
        let tex = r`\textcolor{blue}{\mathbb R}`;
        let tree = getParsed(tex);
        let markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        let node = "<mstyle mathcolor=\"blue\">" +
            "<mi mathvariant=\"double-struck\">R</mi>" +
            "</mstyle>";
        expect(markup).toContain(node);

        // Reverse the order of the commands
        tex = r`\mathbb{\textcolor{blue}{R}}`;
        tree = getParsed(tex);
        markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        node = "<mstyle mathcolor=\"blue\">" +
            "<mi mathvariant=\"double-struck\">R</mi>" +
            "</mstyle>";
        expect(markup).toContain(node);
    });

    it("should render text as <mtext>", () => {
        const tex = r`\text{for }`;
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mtext>for\u00a0</mtext>");
    });

    it("should render math within text as side-by-side children", () => {
        const tex = r`\text{graph: $y = mx + b$}`;
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mrow><mtext>graph:\u00a0</mtext>");
        expect(markup).toContain(
            "<mi>y</mi><mo>=</mo><mi>m</mi><mi>x</mi><mo>+</mo><mi>b</mi>"
        );
    });
});
