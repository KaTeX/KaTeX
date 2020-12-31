/* eslint max-len:0 */

import buildMathML from "../src/buildMathML";
import buildTree from "../src/buildTree";
import katex from "../katex";
import parseTree from "../src/parseTree";
import Options from "../src/Options";
import Settings from "../src/Settings";
import Style from "../src/Style";
import {
    strictSettings, nonstrictSettings, trustSettings, r,
    getBuilt, getParsed, stripPositions,
} from "./helpers";

const defaultOptions = new Options({
    style: Style.TEXT,
    size: 5,
    maxSize: Infinity,
});

describe("A parser", function() {
    it("should not fail on an empty string", function() {
        expect``.toParse(strictSettings);
    });

    it("should ignore whitespace", function() {
        expect`    x    y    `.toParseLike("xy", strictSettings);
    });

    it("should ignore whitespace in atom", function() {
        expect`    x   ^ y    `.toParseLike("x^y", strictSettings);
    });
});

describe("An ord parser", function() {
    const expression = "1234|/@.\"`abcdefgzABCDEFGZ";

    it("should not fail", function() {
        expect(expression).toParse();
    });

    it("should build a list of ords", function() {
        const parse = getParsed(expression);

        for (let i = 0; i < parse.length; i++) {
            const group = parse[i];
            expect(group.type).toMatch("ord");
        }
    });

    it("should parse the right number of ords", function() {
        const parse = getParsed(expression);

        expect(parse).toHaveLength(expression.length);
    });
});

describe("A bin parser", function() {
    const expression = r`+-*\cdot\pm\div`;

    it("should not fail", function() {
        expect(expression).toParse();
    });

    it("should build a list of bins", function() {
        const parse = getParsed(expression);

        for (let i = 0; i < parse.length; i++) {
            const group = parse[i];
            expect(group.type).toEqual("atom");
            expect(group.family).toEqual("bin");
        }
    });
});

describe("A rel parser", function() {
    const expression = r`=<>\leq\geq\neq\nleq\ngeq\cong`;
    const notExpression = r`\not=\not<\not>\not\leq\not\geq\not\in`;

    it("should not fail", function() {
        expect(expression).toParse();
        expect(notExpression).toParse();
    });

    it("should build a list of rels", function() {
        const parse = getParsed(expression);

        for (let i = 0; i < parse.length; i++) {
            let group = parse[i];
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
        expect("\\frac{x}{y}").toBuild();
        expect("\\dfrac{x}{y}").toBuild();
        expect("\\tfrac{x}{y}").toBuild();
        expect("\\cfrac{x}{y}").toBuild();
        expect("\\genfrac ( ] {0.06em}{0}{a}{b+c}").toBuild();
        expect("\\genfrac ( ] {0.8pt}{}{a}{b+c}").toBuild();
        expect("\\genfrac {} {} {0.8pt}{}{a}{b+c}").toBuild();
        expect("\\genfrac [ {} {0.8pt}{}{a}{b+c}").toBuild();
    });
});

describe("A infix builder", function() {
    it("should not fail", function() {
        expect("a \\over b").toBuild();
        expect("a \\atop b").toBuild();
        expect("a \\choose b").toBuild();
        expect("a \\brace b").toBuild();
        expect("a \\brack b").toBuild();
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
    const spaceTextExpression = r`\text{  a \ }`;
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

        expect(group[0].type).toEqual("spacing");
        expect(group[1].type).toEqual("textord");
        expect(group[2].type).toEqual("spacing");
        expect(group[3].type).toEqual("spacing");
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
});

describe("A texvc builder", function() {
    it("should not fail", function() {
        expect("\\lang\\N\\darr\\R\\dArr\\Z\\Darr\\alef\\rang").toBuild();
        expect("\\alefsym\\uarr\\Alpha\\uArr\\Beta\\Uarr\\Chi").toBuild();
        expect("\\clubs\\diamonds\\hearts\\spades\\cnums\\Complex").toBuild();
        expect("\\Dagger\\empty\\harr\\Epsilon\\hArr\\Eta\\Harr\\exist").toBuild();
        expect("\\image\\larr\\infin\\lArr\\Iota\\Larr\\isin\\Kappa").toBuild();
        expect("\\Mu\\lrarr\\natnums\\lrArr\\Nu\\Lrarr\\Omicron").toBuild();
        expect("\\real\\rarr\\plusmn\\rArr\\reals\\Rarr\\Reals\\Rho").toBuild();
        expect("\\text{\\sect}\\sdot\\sub\\sube\\supe").toBuild();
        expect("\\Tau\\thetasym\\weierp\\Zeta").toBuild();
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
    const mathTie = "a~b";
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
        const abKern = "a\\mkern\t-\r1  \n mu\nb";
        const abParse = getParsed(abKern);

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
    });

    it("should parse an environment with hlines", function() {
        expect`\begin{matrix}\hline a&b\\ \hline c&d\end{matrix}`.toParse();
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

    it("should eat a final newline", function() {
        const m3 = getParsed`\begin{matrix}a&b\\ c&d \\ \end{matrix}`[0];
        expect(m3.body).toHaveLength(2);
    });

    it("should grab \\arraystretch", function() {
        const parse = getParsed`\def\arraystretch{1.5}\begin{matrix}a&b\\c&d\end{matrix}`;
        expect(parse).toMatchSnapshot();
    });

    it("should allow an optional argument in {matrix*} and company.", function() {
        expect("\\begin{matrix*}[r] a & -1 \\\\ -1 & d \\end{matrix*}").toBuild();
        expect("\\begin{pmatrix*}[r] a & -1 \\\\ -1 & d \\end{pmatrix*}").toBuild();
        expect("\\begin{bmatrix*}[r] a & -1 \\\\ -1 & d \\end{bmatrix*}").toBuild();
        expect("\\begin{Bmatrix*}[r] a & -1 \\\\ -1 & d \\end{Bmatrix*}").toBuild();
        expect("\\begin{vmatrix*}[r] a & -1 \\\\ -1 & d \\end{vmatrix*}").toBuild();
        expect("\\begin{Vmatrix*}[r] a & -1 \\\\ -1 & d \\end{Vmatrix*}").toBuild();
        expect("\\begin{matrix*} a & -1 \\\\ -1 & d \\end{matrix*}").toBuild();
        expect("\\begin{matrix*}[] a & -1 \\\\ -1 & d \\end{matrix*}").not.toParse();
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
        expect("\\Large\\sqrt[3]{x}").toBuild();
    });

    it("should expand argument if optional argument doesn't exist", function() {
        expect("\\sqrt\\foo").toParseLike("\\sqrt123",
            new Settings({macros: {"\\foo": "123"}}));
    });

    it("should not expand argument if optional argument exists", function() {
        expect("\\sqrt[2]\\foo").toParseLike("\\sqrt[2]{123}",
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
            // This actually doesn't work in real TeX, but it is suprisingly
            // hard to get this to correctly work. So, we take hit of very small
            // amounts of non-compatiblity in order for the rest of the tests to
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
        expect("\\int_i^n").toBuild();
        expect("\\iint_i^n").toBuild();
        expect("\\iiint_i^n").toBuild();
        expect("\\int\nolimits_i^n").toBuild();
        expect("\\iint\nolimits_i^n").toBuild();
        expect("\\iiint\nolimits_i^n").toBuild();
        expect("\\oint_i^n").toBuild();
        expect("\\oiint_i^n").toBuild();
        expect("\\oiiint_i^n").toBuild();
        expect("\\oint\nolimits_i^n").toBuild();
        expect("\\oiint\nolimits_i^n").toBuild();
        expect("\\oiiint\nolimits_i^n").toBuild();
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
        expect("\\pmb{\\mu}").toBuild();
        expect("\\pmb{=}").toBuild();
        expect("\\pmb{+}").toBuild();
        expect("\\pmb{\\frac{x^2}{x_1}}").toBuild();
        expect("\\pmb{}").toBuild();
        expect("\\def\\x{1}\\pmb{\\x\\def\\x{2}}").toParseLike("\\pmb{1}");
    });
});

describe("A raise parser", function() {
    it("should parse and build text in \\raisebox", function() {
        expect("\\raisebox{5pt}{text}").toBuild(strictSettings);
        expect("\\raisebox{-5pt}{text}").toBuild(strictSettings);
    });

    it("should parse and build math in non-strict \\vcenter", function() {
        expect("\\vcenter{\\frac a b}").toBuild(nonstrictSettings);
    });

    it("should fail to parse math in \\raisebox", function() {
        expect("\\raisebox{5pt}{\\frac a b}").not.toParse(nonstrictSettings);
        expect("\\raisebox{-5pt}{\\frac a b}").not.toParse(nonstrictSettings);
    });

    it("should fail to parse math in an \\hbox", function() {
        expect("\\hbox{\\frac a b}").not.toParse(nonstrictSettings);
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


describe("A MathML font tree-builder", function() {
    const contents = r`Ax2k\omega\Omega\imath+`;

    it("should render " + contents + " with the correct mathvariants", function() {
        const tree = getParsed(contents);
        const markup = buildMathML(tree, contents, defaultOptions).toMarkup();
        expect(markup).toContain("<mi>A</mi>");
        expect(markup).toContain("<mi>x</mi>");
        expect(markup).toContain("<mn>2</mn>");
        expect(markup).toContain("<mi>\u03c9</mi>");   // \omega
        expect(markup).toContain("<mi mathvariant=\"normal\">\u03A9</mi>");   // \Omega
        expect(markup).toContain("<mi mathvariant=\"normal\">\u0131</mi>");   // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathbb{" + contents + "} with the correct mathvariants", function() {
        const tex = `\\mathbb{${contents}}`;
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi mathvariant=\"double-struck\">A</mi>");
        expect(markup).toContain("<mi mathvariant=\"double-struck\">x</mi>");
        expect(markup).toContain("<mn mathvariant=\"double-struck\">2</mn>");
        expect(markup).toContain("<mi mathvariant=\"double-struck\">\u03c9</mi>");  // \omega
        expect(markup).toContain("<mi mathvariant=\"double-struck\">\u03A9</mi>"); // \Omega
        expect(markup).toContain("<mi mathvariant=\"double-struck\">\u0131</mi>");  // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathrm{" + contents + "} with the correct mathvariants", function() {
        const tex = `\\mathrm{${contents}}`;
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi mathvariant=\"normal\">A</mi>");
        expect(markup).toContain("<mi mathvariant=\"normal\">x</mi>");
        expect(markup).toContain("<mn>2</mn>");
        expect(markup).toContain("<mi>\u03c9</mi>");   // \omega
        expect(markup).toContain("<mi mathvariant=\"normal\">\u03A9</mi>");   // \Omega
        expect(markup).toContain("<mi mathvariant=\"normal\">\u0131</mi>");   // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathit{" + contents + "} with the correct mathvariants", function() {
        const tex = `\\mathit{${contents}}`;
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi>A</mi>");
        expect(markup).toContain("<mi>x</mi>");
        expect(markup).toContain("<mn mathvariant=\"italic\">2</mn>");
        expect(markup).toContain("<mi>\u03c9</mi>");   // \omega
        expect(markup).toContain("<mi>\u03A9</mi>");   // \Omega
        expect(markup).toContain("<mi>\u0131</mi>");   // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathnormal{" + contents + "} with the correct mathvariants", function() {
        const tex = `\\mathnormal{${contents}}`;
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi>A</mi>");
        expect(markup).toContain("<mi>x</mi>");
        expect(markup).toContain("<mn>2</mn>");
        expect(markup).toContain("<mi>\u03c9</mi>");   // \omega
        expect(markup).toContain("<mi mathvariant=\"normal\">\u03A9</mi>");   // \Omega
        expect(markup).toContain("<mi mathvariant=\"normal\">\u0131</mi>");   // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathbf{" + contents + "} with the correct mathvariants", function() {
        const tex = `\\mathbf{${contents}}`;
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi mathvariant=\"bold\">A</mi>");
        expect(markup).toContain("<mi mathvariant=\"bold\">x</mi>");
        expect(markup).toContain("<mn mathvariant=\"bold\">2</mn>");
        expect(markup).toContain("<mi mathvariant=\"bold\">\u03c9</mi>");   // \omega
        expect(markup).toContain("<mi mathvariant=\"bold\">\u03A9</mi>");   // \Omega
        expect(markup).toContain("<mi mathvariant=\"bold\">\u0131</mi>");   // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathcal{" + contents + "} with the correct mathvariants", function() {
        const tex = `\\mathcal{${contents}}`;
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

    it("should render \\mathfrak{" + contents + "} with the correct mathvariants", function() {
        const tex = `\\mathfrak{${contents}}`;
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi mathvariant=\"fraktur\">A</mi>");
        expect(markup).toContain("<mi mathvariant=\"fraktur\">x</mi>");
        expect(markup).toContain("<mn mathvariant=\"fraktur\">2</mn>");
        expect(markup).toContain("<mi mathvariant=\"fraktur\">\u03c9</mi>"); // \omega
        expect(markup).toContain("<mi mathvariant=\"fraktur\">\u03A9</mi>"); // \Omega
        expect(markup).toContain("<mi mathvariant=\"fraktur\">\u0131</mi>"); // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathscr{" + contents + "} with the correct mathvariants", function() {
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

    it("should render \\mathsf{" + contents + "} with the correct mathvariants", function() {
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

    it("should render a combination of font and color changes", function() {
        let tex = r`\textcolor{blue}{\mathbb R}`;
        let tree = getParsed(tex);
        let markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        let node = "<mstyle mathcolor=\"blue\">" +
            "<mi mathvariant=\"double-struck\">R</mi>" +
            "</mstyle>";
        expect(markup).toContain(node);

        // reverse the order of the commands
        tex = r`\mathbb{\textcolor{blue}{R}}`;
        tree = getParsed(tex);
        markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        node = "<mstyle mathcolor=\"blue\">" +
            "<mi mathvariant=\"double-struck\">R</mi>" +
            "</mstyle>";
        expect(markup).toContain(node);
    });

    it("should render text as <mtext>", function() {
        const tex = r`\text{for }`;
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mtext>for\u00a0</mtext>");
    });

    it("should render math within text as side-by-side children", function() {
        const tex = r`\text{graph: $y = mx + b$}`;
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mrow><mtext>graph:\u00a0</mtext>");
        expect(markup).toContain(
            "<mi>y</mi><mo>=</mo><mi>m</mi><mi>x</mi><mo>+</mo><mi>b</mi>");
    });
});

describe("An includegraphics builder", function() {
    const img = "\\includegraphics[height=0.9em, totalheight=0.9em, width=0.9em, alt=KA logo]{https://cdn.kastatic.org/images/apple-touch-icon-57x57-precomposed.new.png}";
    it("should not fail", function() {
        expect(img).toBuild(trustSettings);
    });

    it("should produce mords", function() {
        expect(getBuilt(img, trustSettings)[0].classes).toContain("mord");
    });

    it("should not render without trust setting", function() {
        const built = getBuilt(img);
        expect(built).toMatchSnapshot();
    });

    it("should render with trust setting", function() {
        const built = getBuilt(img, trustSettings);
        expect(built).toMatchSnapshot();
    });
});

describe("An HTML extension builder", function() {
    const html =
        "\\htmlId{bar}{x}\\htmlClass{foo}{x}\\htmlStyle{color: red;}{x}\\htmlData{foo=a, bar=b}{x}";
    const trustNonStrictSettings = new Settings({trust: true, strict: false});
    it("should not fail", function() {
        expect(html).toBuild(trustNonStrictSettings);
    });

    it("should set HTML attributes", function() {
        const built = getBuilt(html, trustNonStrictSettings);
        expect(built[0].attributes.id).toMatch("bar");
        expect(built[1].classes).toContain("foo");
        expect(built[2].attributes.style).toMatch("color: red");
        expect(built[3].attributes).toEqual({
            "data-bar": "b",
            "data-foo": "a",
        });
    });

    it("should not affect spacing", function() {
        const built = getBuilt("\\htmlId{a}{x+}y", trustNonStrictSettings);
        expect(built).toMatchSnapshot();
    });

    it("should render with trust and strict setting", function() {
        const built = getBuilt(html, trustNonStrictSettings);
        expect(built).toMatchSnapshot();
    });
});

describe("A bin builder", function() {
    it("should create mbins normally", function() {
        const built = getBuilt`x + y`;

        // we add glue elements around the '+'
        expect(built[2].classes).toContain("mbin");
    });

    it("should create ords when at the beginning of lists", function() {
        const built = getBuilt`+ x`;

        expect(built[0].classes).toContain("mord");
        expect(built[0].classes).not.toContain("mbin");
    });

    it("should create ords after some other objects", function() {
        expect(getBuilt`x + + 2`[4].classes).toContain("mord");
        expect(getBuilt`( + 2`[2].classes).toContain("mord");
        expect(getBuilt`= + 2`[2].classes).toContain("mord");
        expect(getBuilt`\sin + 2`[2].classes).toContain("mord");
        expect(getBuilt`, + 2`[2].classes).toContain("mord");
    });

    it("should correctly interact with color objects", function() {
        expect(getBuilt`\blue{x}+y`[2].classes).toContain("mbin");
        expect(getBuilt`\blue{x+}+y`[2].classes).toContain("mbin");
        expect(getBuilt`\blue{x+}+y`[4].classes).toContain("mord");
    });
});

describe("A \\phantom builder and \\smash builder", function() {
    it("should both build a mord", function() {
        expect(getBuilt`\hphantom{a}`[0].classes).toContain("mord");
        expect(getBuilt`a\hphantom{=}b`[2].classes).toContain("mord");
        expect(getBuilt`a\hphantom{+}b`[2].classes).toContain("mord");
        expect(getBuilt`\smash{a}`[0].classes).toContain("mord");
        expect(getBuilt`\smash{=}`[0].classes).toContain("mord");
        expect(getBuilt`a\smash{+}b`[2].classes).toContain("mord");
    });
});

describe("A markup generator", function() {
    it("marks trees up", function() {
        // Just a few quick sanity checks here...
        const markup = katex.renderToString(r`\sigma^2`);
        expect(markup.indexOf("<span")).toBe(0);
        expect(markup).toContain("\u03c3");  // sigma
        expect(markup).toContain("margin-right");
        expect(markup).not.toContain("marginRight");
    });

    it("generates both MathML and HTML", function() {
        const markup = katex.renderToString("a");

        expect(markup).toContain("<span");
        expect(markup).toContain("<math");
    });
});

describe("A parse tree generator", function() {
    it("generates a tree", function() {
        const tree = stripPositions(getParsed`\sigma^2`);
        expect(tree).toMatchSnapshot();
    });
});

describe("An accent parser", function() {
    it("should not fail", function() {
        expect`\vec{x}`.toParse();
        expect`\vec{x^2}`.toParse();
        expect`\vec{x}^2`.toParse();
        expect`\vec x`.toParse();
        expect("\\underbar{X}").toParse();
    });

    it("should produce accents", function() {
        const parse = getParsed`\vec x`[0];

        expect(parse.type).toEqual("accent");
    });

    it("should be grouped more tightly than supsubs", function() {
        const parse = getParsed`\vec x^2`[0];

        expect(parse.type).toEqual("supsub");
    });

    it("should parse stretchy, shifty accents", function() {
        expect`\widehat{x}`.toParse();
        expect`\widecheck{x}`.toParse();
    });

    it("should parse stretchy, non-shifty accents", function() {
        expect`\overrightarrow{x}`.toParse();
    });
});

describe("An accent builder", function() {
    it("should not fail", function() {
        expect`\vec{x}`.toBuild();
        expect`\vec{x}^2`.toBuild();
        expect`\vec{x}_2`.toBuild();
        expect`\vec{x}_2^2`.toBuild();
    });

    it("should produce mords", function() {
        expect(getBuilt`\vec x`[0].classes).toContain("mord");
        expect(getBuilt`\vec +`[0].classes).toContain("mord");
        expect(getBuilt`\vec +`[0].classes).not.toContain("mbin");
        expect(getBuilt`\vec )^2`[0].classes).toContain("mord");
        expect(getBuilt`\vec )^2`[0].classes).not.toContain("mclose");
    });
});

describe("A stretchy and shifty accent builder", function() {
    it("should not fail", function() {
        expect`\widehat{AB}`.toBuild();
        expect`\widecheck{AB}`.toBuild();
        expect`\widehat{AB}^2`.toBuild();
        expect`\widehat{AB}_2`.toBuild();
        expect`\widehat{AB}_2^2`.toBuild();
    });

    it("should produce mords", function() {
        expect(getBuilt`\widehat{AB}`[0].classes).toContain("mord");
        expect(getBuilt`\widehat +`[0].classes).toContain("mord");
        expect(getBuilt`\widehat +`[0].classes).not.toContain("mbin");
        expect(getBuilt`\widehat )^2`[0].classes).toContain("mord");
        expect(getBuilt`\widehat )^2`[0].classes).not.toContain("mclose");
    });
});

describe("A stretchy and non-shifty accent builder", function() {
    it("should not fail", function() {
        expect`\overrightarrow{AB}`.toBuild();
        expect`\overrightarrow{AB}^2`.toBuild();
        expect`\overrightarrow{AB}_2`.toBuild();
        expect`\overrightarrow{AB}_2^2`.toBuild();
    });

    it("should produce mords", function() {
        expect(getBuilt`\overrightarrow{AB}`[0].classes).toContain("mord");
        expect(getBuilt`\overrightarrow +`[0].classes).toContain("mord");
        expect(getBuilt`\overrightarrow +`[0].classes).not.toContain("mbin");
        expect(getBuilt`\overrightarrow )^2`[0].classes).toContain("mord");
        expect(getBuilt`\overrightarrow )^2`[0].classes).not.toContain("mclose");
    });
});

describe("An under-accent parser", function() {
    it("should not fail", function() {
        expect("\\underrightarrow{x}").toParse();
        expect("\\underrightarrow{x^2}").toParse();
        expect("\\underrightarrow{x}^2").toParse();
        expect("\\underrightarrow x").toParse();
    });

    it("should produce accentUnder", function() {
        const parse = getParsed("\\underrightarrow x")[0];

        expect(parse.type).toEqual("accentUnder");
    });

    it("should be grouped more tightly than supsubs", function() {
        const parse = getParsed("\\underrightarrow x^2")[0];

        expect(parse.type).toEqual("supsub");
    });
});

describe("An under-accent builder", function() {
    it("should not fail", function() {
        expect("\\underrightarrow{x}").toBuild();
        expect("\\underrightarrow{x}^2").toBuild();
        expect("\\underrightarrow{x}_2").toBuild();
        expect("\\underrightarrow{x}_2^2").toBuild();
    });

    it("should produce mords", function() {
        expect(getBuilt("\\underrightarrow x")[0].classes).toContain("mord");
        expect(getBuilt("\\underrightarrow +")[0].classes).toContain("mord");
        expect(getBuilt("\\underrightarrow +")[0].classes).not.toContain("mbin");
        expect(getBuilt("\\underrightarrow )^2")[0].classes).toContain("mord");
        expect(getBuilt("\\underrightarrow )^2")[0].classes).not.toContain("mclose");
    });
});

describe("An extensible arrow parser", function() {
    it("should not fail", function() {
        expect("\\xrightarrow{x}").toParse();
        expect("\\xrightarrow{x^2}").toParse();
        expect("\\xrightarrow{x}^2").toParse();
        expect("\\xrightarrow x").toParse();
        expect("\\xrightarrow[under]{over}").toParse();
    });

    it("should produce xArrow", function() {
        const parse = getParsed("\\xrightarrow x")[0];

        expect(parse.type).toEqual("xArrow");
    });

    it("should be grouped more tightly than supsubs", function() {
        const parse = getParsed("\\xrightarrow x^2")[0];

        expect(parse.type).toEqual("supsub");
    });
});

describe("An extensible arrow builder", function() {
    it("should not fail", function() {
        expect("\\xrightarrow{x}").toBuild();
        expect("\\xrightarrow{x}^2").toBuild();
        expect("\\xrightarrow{x}_2").toBuild();
        expect("\\xrightarrow{x}_2^2").toBuild();
        expect("\\xrightarrow[under]{over}").toBuild();
    });

    it("should produce mrell", function() {
        expect(getBuilt("\\xrightarrow x")[0].classes).toContain("mrel");
        expect(getBuilt("\\xrightarrow [under]{over}")[0].classes).toContain("mrel");
        expect(getBuilt("\\xrightarrow +")[0].classes).toContain("mrel");
        expect(getBuilt("\\xrightarrow +")[0].classes).not.toContain("mbin");
        expect(getBuilt("\\xrightarrow )^2")[0].classes).toContain("mrel");
        expect(getBuilt("\\xrightarrow )^2")[0].classes).not.toContain("mclose");
    });
});

describe("A horizontal brace parser", function() {
    it("should not fail", function() {
        expect`\overbrace{x}`.toParse();
        expect`\overbrace{x^2}`.toParse();
        expect`\overbrace{x}^2`.toParse();
        expect`\overbrace x`.toParse();
        expect("\\underbrace{x}_2").toParse();
        expect("\\underbrace{x}_2^2").toParse();
    });

    it("should produce horizBrace", function() {
        const parse = getParsed`\overbrace x`[0];

        expect(parse.type).toEqual("horizBrace");
    });

    it("should be grouped more tightly than supsubs", function() {
        const parse = getParsed`\overbrace x^2`[0];

        expect(parse.type).toEqual("supsub");
    });
});

describe("A horizontal brace builder", function() {
    it("should not fail", function() {
        expect`\overbrace{x}`.toBuild();
        expect`\overbrace{x}^2`.toBuild();
        expect("\\underbrace{x}_2").toBuild();
        expect("\\underbrace{x}_2^2").toBuild();
    });

    it("should produce mords", function() {
        expect(getBuilt`\overbrace x`[0].classes).toContain("mord");
        expect(getBuilt`\overbrace{x}^2`[0].classes).toContain("mord");
        expect(getBuilt`\overbrace +`[0].classes).toContain("mord");
        expect(getBuilt`\overbrace +`[0].classes).not.toContain("mbin");
        expect(getBuilt`\overbrace )^2`[0].classes).toContain("mord");
        expect(getBuilt`\overbrace )^2`[0].classes).not.toContain("mclose");
    });
});

describe("A boxed parser", function() {
    it("should not fail", function() {
        expect`\boxed{x}`.toParse();
        expect`\boxed{x^2}`.toParse();
        expect`\boxed{x}^2`.toParse();
        expect`\boxed x`.toParse();
    });

    it("should produce enclose", function() {
        const parse = getParsed`\boxed x`[0];

        expect(parse.type).toEqual("enclose");
    });
});

describe("A boxed builder", function() {
    it("should not fail", function() {
        expect`\boxed{x}`.toBuild();
        expect`\boxed{x}^2`.toBuild();
        expect`\boxed{x}_2`.toBuild();
        expect`\boxed{x}_2^2`.toBuild();
    });

    it("should produce mords", function() {
        expect(getBuilt`\boxed x`[0].classes).toContain("mord");
        expect(getBuilt`\boxed +`[0].classes).toContain("mord");
        expect(getBuilt`\boxed +`[0].classes).not.toContain("mbin");
        expect(getBuilt`\boxed )^2`[0].classes).toContain("mord");
        expect(getBuilt`\boxed )^2`[0].classes).not.toContain("mclose");
    });
});

describe("An fbox parser, unlike a boxed parser,", function() {
    it("should fail when given math", function() {
        expect`\fbox{\frac a b}`.not.toParse();
    });
});

describe("A colorbox parser", function() {
    it("should not fail, given a text argument", function() {
        expect`\colorbox{red}{a b}`.toParse();
        expect`\colorbox{red}{x}^2`.toParse();
        expect`\colorbox{red} x`.toParse();
    });

    it("should fail, given a math argument", function() {
        expect`\colorbox{red}{\alpha}`.not.toParse();
        expect`\colorbox{red}{\frac{a}{b}}`.not.toParse();
    });

    it("should parse a color", function() {
        expect`\colorbox{red}{a b}`.toParse();
        expect`\colorbox{#197}{a b}`.toParse();
        expect`\colorbox{#1a9b7c}{a b}`.toParse();
    });

    it("should produce enclose", function() {
        const parse = getParsed`\colorbox{red} x`[0];
        expect(parse.type).toEqual("enclose");
    });
});

describe("A colorbox builder", function() {
    it("should not fail", function() {
        expect`\colorbox{red}{a b}`.toBuild();
        expect`\colorbox{red}{a b}^2`.toBuild();
        expect`\colorbox{red} x`.toBuild();
    });

    it("should produce mords", function() {
        expect(getBuilt`\colorbox{red}{a b}`[0].classes).toContain("mord");
    });
});

describe("An fcolorbox parser", function() {
    it("should not fail, given a text argument", function() {
        expect`\fcolorbox{blue}{yellow}{a b}`.toParse();
        expect`\fcolorbox{blue}{yellow}{x}^2`.toParse();
        expect`\fcolorbox{blue}{yellow} x`.toParse();
    });

    it("should fail, given a math argument", function() {
        expect`\fcolorbox{blue}{yellow}{\alpha}`.not.toParse();
        expect`\fcolorbox{blue}{yellow}{\frac{a}{b}}`.not.toParse();
    });

    it("should parse a color", function() {
        expect`\fcolorbox{blue}{yellow}{a b}`.toParse();
        expect`\fcolorbox{blue}{#197}{a b}`.toParse();
        expect`\fcolorbox{blue}{#1a9b7c}{a b}`.toParse();
    });

    it("should produce enclose", function() {
        const parse = getParsed`\fcolorbox{blue}{yellow} x`[0];
        expect(parse.type).toEqual("enclose");
    });
});

describe("A fcolorbox builder", function() {
    it("should not fail", function() {
        expect`\fcolorbox{blue}{yellow}{a b}`.toBuild();
        expect`\fcolorbox{blue}{yellow}{a b}^2`.toBuild();
        expect`\fcolorbox{blue}{yellow} x`.toBuild();
    });

    it("should produce mords", function() {
        expect(getBuilt`\colorbox{red}{a b}`[0].classes).toContain("mord");
    });
});

describe("A strike-through parser", function() {
    it("should not fail", function() {
        expect`\cancel{x}`.toParse();
        expect`\cancel{x^2}`.toParse();
        expect`\cancel{x}^2`.toParse();
        expect`\cancel x`.toParse();
    });

    it("should produce enclose", function() {
        const parse = getParsed`\cancel x`[0];

        expect(parse.type).toEqual("enclose");
    });

    it("should be grouped more tightly than supsubs", function() {
        const parse = getParsed`\cancel x^2`[0];

        expect(parse.type).toEqual("supsub");
    });
});

describe("A strike-through builder", function() {
    it("should not fail", function() {
        expect`\cancel{x}`.toBuild();
        expect`\cancel{x}^2`.toBuild();
        expect`\cancel{x}_2`.toBuild();
        expect`\cancel{x}_2^2`.toBuild();
        expect`\sout{x}`.toBuild();
        expect`\sout{x}^2`.toBuild();
        expect`\sout{x}_2`.toBuild();
        expect`\sout{x}_2^2`.toBuild();
    });

    it("should produce mords", function() {
        expect(getBuilt`\cancel x`[0].classes).toContain("mord");
        expect(getBuilt`\cancel +`[0].classes).toContain("mord");
        expect(getBuilt`\cancel +`[0].classes).not.toContain("mbin");
        expect(getBuilt`\cancel )^2`[0].classes).toContain("mord");
        expect(getBuilt`\cancel )^2`[0].classes).not.toContain("mclose");
    });
});

describe("A actuarial angle parser", function() {
    it("should not fail in math mode", function() {
        expect`a_{\angl{n}}`.toParse();
    });
    it("should fail in text mode", function() {
        expect`\text{a_{\angl{n}}}`.not.toParse();
    });
});

describe("A actuarial angle builder", function() {
    it("should not fail", function() {
        expect`a_{\angl{n}}`.toBuild();
        expect`a_{\angl{n}i}`.toBuild();
        expect`a_{\angl n}`.toBuild();
        expect`a_\angln`.toBuild();
    });
});

describe("\\phase", function() {
    it("should fail in text mode", function() {
        expect`\text{\phase{-78.2^\circ}}`.not.toParse();
    });
    it("should not fail in math mode", function() {
        expect`\phase{-78.2^\circ}`.toBuild();
    });
});

describe("A phantom parser", function() {
    it("should not fail", function() {
        expect`\phantom{x}`.toParse();
        expect`\phantom{x^2}`.toParse();
        expect`\phantom{x}^2`.toParse();
        expect`\phantom x`.toParse();
        expect`\hphantom{x}`.toParse();
        expect`\hphantom{x^2}`.toParse();
        expect`\hphantom{x}^2`.toParse();
        expect`\hphantom x`.toParse();
    });

    it("should build a phantom node", function() {
        const parse = getParsed`\phantom{x}`[0];

        expect(parse.type).toEqual("phantom");
        expect(parse.body).toBeDefined();
    });
});

describe("A phantom builder", function() {
    it("should not fail", function() {
        expect`\phantom{x}`.toBuild();
        expect`\phantom{x^2}`.toBuild();
        expect`\phantom{x}^2`.toBuild();
        expect`\phantom x`.toBuild();
        expect `\mathstrut`.toBuild();

        expect`\hphantom{x}`.toBuild();
        expect`\hphantom{x^2}`.toBuild();
        expect`\hphantom{x}^2`.toBuild();
        expect`\hphantom x`.toBuild();
    });

    it("should make the children transparent", function() {
        const children = getBuilt`\phantom{x+1}`;
        expect(children[0].style.color).toBe("transparent");
        expect(children[2].style.color).toBe("transparent");
        expect(children[4].style.color).toBe("transparent");
    });

    it("should make all descendants transparent", function() {
        const children = getBuilt`\phantom{x+\blue{1}}`;
        expect(children[0].style.color).toBe("transparent");
        expect(children[2].style.color).toBe("transparent");
        expect(children[4].style.color).toBe("transparent");
    });
});

describe("A smash parser", function() {
    it("should not fail", function() {
        expect`\smash{x}`.toParse();
        expect`\smash{x^2}`.toParse();
        expect`\smash{x}^2`.toParse();
        expect`\smash x`.toParse();

        expect`\smash[b]{x}`.toParse();
        expect`\smash[b]{x^2}`.toParse();
        expect`\smash[b]{x}^2`.toParse();
        expect`\smash[b] x`.toParse();

        expect`\smash[]{x}`.toParse();
        expect`\smash[]{x^2}`.toParse();
        expect`\smash[]{x}^2`.toParse();
        expect`\smash[] x`.toParse();
    });

    it("should build a smash node", function() {
        const parse = getParsed`\smash{x}`[0];

        expect(parse.type).toEqual("smash");
    });
});

describe("A smash builder", function() {
    it("should not fail", function() {
        expect`\smash{x}`.toBuild(nonstrictSettings);
        expect`\smash{x^2}`.toBuild(nonstrictSettings);
        expect`\smash{x}^2`.toBuild(nonstrictSettings);
        expect`\smash x`.toBuild(nonstrictSettings);

        expect`\smash[b]{x}`.toBuild(nonstrictSettings);
        expect`\smash[b]{x^2}`.toBuild(nonstrictSettings);
        expect`\smash[b]{x}^2`.toBuild(nonstrictSettings);
        expect`\smash[b] x`.toBuild(nonstrictSettings);
    });
});

describe("A parser error", function() {
    it("should report the position of an error", function() {
        try {
            parseTree(r`\sqrt}`, new Settings());
        } catch (e) {
            expect(e.position).toEqual(5);
        }
    });
});

describe("An optional argument parser", function() {
    it("should not fail", function() {
        // Note this doesn't actually make an optional argument, but still
        // should work
        expect`\frac[1]{2}{3}`.toParse();

        expect`\rule[0.2em]{1em}{1em}`.toParse();
    });

    it("should work with sqrts with optional arguments", function() {
        expect`\sqrt[3]{2}`.toParse();
    });

    it("should work when the optional argument is missing", function() {
        expect`\sqrt{2}`.toParse();
        expect`\rule{1em}{2em}`.toParse();
    });

    it("should fail when the optional argument is malformed", function() {
        expect`\rule[1]{2em}{3em}`.not.toParse();
    });

    it("should not work if the optional argument isn't closed", function() {
        expect`\sqrt[`.not.toParse();
    });
});

describe("An array environment", function() {

    it("should accept a single alignment character", function() {
        const parse = getParsed`\begin{array}r1\\20\end{array}`;
        expect(parse[0].type).toBe("array");
        expect(parse[0].cols).toEqual([
            {type: "align", align: "r"},
        ]);
    });

    it("should accept vertical separators", function() {
        const parse = getParsed`\begin{array}{|l||c:r::}\end{array}`;
        expect(parse[0].type).toBe("array");
        expect(parse[0].cols).toEqual([
            {type: "separator", separator: "|"},
            {type: "align", align: "l"},
            {type: "separator", separator: "|"},
            {type: "separator", separator: "|"},
            {type: "align", align: "c"},
            {type: "separator", separator: ":"},
            {type: "align", align: "r"},
            {type: "separator", separator: ":"},
            {type: "separator", separator: ":"},
        ]);
    });

});

describe("A subarray environment", function() {

    it("should accept only a single alignment character", function() {
        const parse = getParsed`\begin{subarray}{c}a \\ b\end{subarray}`;
        expect(parse[0].type).toBe("array");
        expect(parse[0].cols).toEqual([
            {type: "align", align: "c"},
        ]);
        expect`\begin{subarray}{cc}a \\ b\end{subarray}`.not.toParse();
        expect`\begin{subarray}{c}a & b \\ c & d\end{subarray}`.not.toParse();
        expect`\begin{subarray}{c}a \\ b\end{subarray}`.toBuild();
    });

});

describe("A substack function", function() {

    it("should build", function() {
        expect`\sum_{\substack{ 0<i<m \\ 0<j<n }}  P(i,j)`.toBuild();
    });
    it("should accommodate spaces in the argument", function() {
        expect`\sum_{\substack{ 0<i<m \\ 0<j<n }}  P(i,j)`.toBuild();
    });
    it("should accommodate macros in the argument", function() {
        expect`\sum_{\substack{ 0<i<\varPi \\ 0<j<\pi }}  P(i,j)`.toBuild();
    });
    it("should accommodate an empty argument", function() {
        expect`\sum_{\substack{}}  P(i,j)`.toBuild();
    });

});

describe("A smallmatrix environment", function() {

    it("should build", function() {
        expect`\begin{smallmatrix} a & b \\ c & d \end{smallmatrix}`.toBuild();
    });

});

describe("A cases environment", function() {

    it("should parse its input", function() {
        expect`f(a,b)=\begin{cases}a+1&\text{if }b\text{ is odd}\\a&\text{if }b=0\\a-1&\text{otherwise}\end{cases}`
            .toParse();
    });

});

describe("An rcases environment", function() {

    it("should build", function() {
        expect`\begin{rcases} a &\text{if } b \\ c &\text{if } d \end{rcases}⇒…`
            .toBuild();
    });

});

describe("An aligned environment", function() {

    it("should parse its input", function() {
        expect`\begin{aligned}a&=b&c&=d\\e&=f\end{aligned}`.toParse();
    });

    it("should allow cells in brackets", function() {
        expect`\begin{aligned}[a]&[b]\\ [c]&[d]\end{aligned}`.toParse();
    });

    it("should forbid cells in brackets without space", function() {
        expect`\begin{aligned}[a]&[b]\\[c]&[d]\end{aligned}`.not.toParse();
    });

    it("should not eat the last row when its first cell is empty", function() {
        const ae = getParsed`\begin{aligned}&E_1 & (1)\\&E_2 & (2)\\&E_3 & (3)\end{aligned}`[0];
        expect(ae.body).toHaveLength(3);
    });
});

describe("AMS environments", function() {
    it("should fail outside display mode", () => {
        expect`\begin{gather}a+b\\c+d\end{gather}`.not.toParse(nonstrictSettings);
        expect`\begin{gather*}a+b\\c+d\end{gather*}`.not.toParse(nonstrictSettings);
        expect`\begin{align}a&=b+c\\d+e&=f\end{align}`.not.toParse(nonstrictSettings);
        expect`\begin{align*}a&=b+c\\d+e&=f\end{align*}`.not.toParse(nonstrictSettings);
        expect`\begin{alignat}{2}10&x+ &3&y = 2\\3&x+&13&y = 4\end{alignat}`.not.toParse(nonstrictSettings);
        expect`\begin{alignat*}{2}10&x+ &3&y = 2\\3&x+&13&y = 4\end{alignat*}`.not.toParse(nonstrictSettings);
        expect`\begin{equation}a=b+c\end{equation}`.not.toParse(nonstrictSettings);
        expect`\begin{split}a &=b+c\\&=e+f\end{split}`.not.toParse(nonstrictSettings);
        expect`\begin{CD}A @>a>> B \\@VbVV @AAcA\\C @= D\end{CD}`.not.toParse(nonstrictSettings);
    });

    const displayMode = new Settings({displayMode: true});
    it("should build if in display mode", () => {
        expect`\begin{gather}a+b\\c+d\end{gather}`.toBuild(displayMode);
        expect`\begin{gather*}a+b\\c+d\end{gather*}`.toBuild(displayMode);
        expect`\begin{align}a&=b+c\\d+e&=f\end{align}`.toBuild(displayMode);
        expect`\begin{align*}a&=b+c\\d+e&=f\end{align*}`.toBuild(displayMode);
        expect`\begin{alignat}{2}10&x+ &3&y = 2\\3&x+&13&y = 4\end{alignat}`.toBuild(displayMode);
        expect`\begin{alignat*}{2}10&x+ &3&y = 2\\3&x+&13&y = 4\end{alignat*}`.toBuild(displayMode);
        expect`\begin{equation}a=b+c\end{equation}`.toBuild(displayMode);
        expect`\begin{equation}\begin{split}a &=b+c\\&=e+f\end{split}\end{equation}`.toBuild(displayMode);
        expect`\begin{split}a &=b+c\\&=e+f\end{split}`.toBuild(displayMode);
        expect`\begin{CD}A @<a<< B @>>b> C @>>> D\\@. @| @AcAA @VVdV \\@. E @= F @>>> G\end{CD}`.toBuild(displayMode);
    });

    it("{equation} should fail if argument contains two rows.", () => {
        expect`\begin{equation}a=\cr b+c\end{equation}`.not.toParse(displayMode);
    });
    it("{equation} should fail if argument contains two columns.", () => {
        expect`\begin{equation}a &=b+c\end{equation}`.not.toBuild(displayMode);
    });
    it("{split} should fail if argument contains three columns.", () => {
        expect`\begin{equation}\begin{split}a &=b &+c\\&=e &+f\end{split}\end{equation}`.not.toBuild(displayMode);
    });
    it("{array} should fail if body contains more columns than specification.", () => {
        expect`\begin{array}{2}a & b & c\\d & e  f\end{array}`.not.toBuild(displayMode);
    });
});

describe("The CD environment", function() {
    it("should fail if not is display mode", function() {
        expect(`\\begin{CD}A @<a<< B @>>b> C @>>> D\\\\@. @| @AcAA @VVdV \\\\@. E @= F @>>> G\\end{CD}`).not.toParse(
            new Settings({displayMode: false})
        );
    });
    const displaySettings = new Settings({displayMode: true});
    it("should fail if the character after '@' is not in <>AV=|.", function() {
        expect(`\\begin{CD}A @X<a<< B @>>b> C @>>> D\\\\@. @| @AcAA @VVdV \\\\@. E @= F @>>> G\\end{CD}`).not.toParse(displaySettings);
    });
    it("should fail if an arrow does not have its final character.", function() {
        expect(`\\begin{CD}A @<a< B @>>b> C @>>> D\\\\@. @| @AcAA @VVdV \\\\@. E @= F @>>> G\\end{CD}`).not.toParse(displaySettings);
        expect(`\\begin{CD}A @<a<< B @>>b C @>>> D\\\\@. @| @AcAA @VVdV \\\\@. E @= F @>>> G\\end{CD}`).not.toParse(displaySettings);
    });
    it("should fail without an \\\\end.", function() {
        expect(`\\begin{CD}A @<a<< B @>>b> C @>>> D\\\\@. @| @AcAA @VVdV \\\\@. E @= F @>>> G`).not.toParse(displaySettings);
    });

    it("should succeed without the flaws noted above.", function() {
        expect(`\\begin{CD}A @<a<< B @>>b> C @>>> D\\\\@. @| @AcAA @VVdV \\\\@. E @= F @>>> G\\end{CD}`).toBuild(displaySettings);
    });
});

describe("operatorname support", function() {
    it("should not fail", function() {
        expect("\\operatorname{x*Π∑\\Pi\\sum\\frac a b}").toBuild();
        expect("\\operatorname*{x*Π∑\\Pi\\sum\\frac a b}").toBuild();
        expect("\\operatorname*{x*Π∑\\Pi\\sum\\frac a b}_y x").toBuild();
        expect("\\operatorname*{x*Π∑\\Pi\\sum\\frac a b}\\limits_y x").toBuild();
    });
});

describe("href and url commands", function() {
    // We can't use raw strings for \url because \u is for Unicode escapes.

    it("should parse its input", function() {
        expect`\href{http://example.com/}{\sin}`.toBuild(trustSettings);
        expect("\\url{http://example.com/}").toBuild(trustSettings);
    });

    it("should allow empty URLs", function() {
        expect`\href{}{example here}`.toBuild(trustSettings);
        expect("\\url{}").toBuild(trustSettings);
    });

    it("should allow single-character URLs", () => {
        expect`\href%end`.toParseLike("\\href{%}end", trustSettings);
        expect("\\url%end").toParseLike("\\url{%}end", trustSettings);
        expect("\\url%%end\n").toParseLike("\\url{%}", trustSettings);
        expect("\\url end").toParseLike("\\url{e}nd", trustSettings);
        expect("\\url%end").toParseLike("\\url {%}end", trustSettings);
    });

    it("should allow spaces single-character URLs", () => {
        expect`\href %end`.toParseLike("\\href{%}end", trustSettings);
        expect("\\url %end").toParseLike("\\url{%}end", trustSettings);
    });

    it("should allow letters [#$%&~_^] without escaping", function() {
        const url = "http://example.org/~bar/#top?foo=$foo&bar=ba^r_boo%20baz";
        const parsed1 = getParsed(`\\href{${url}}{\\alpha}`, trustSettings)[0];
        expect(parsed1.href).toBe(url);
        const parsed2 = getParsed(`\\url{${url}}`, trustSettings)[0];
        expect(parsed2.href).toBe(url);
    });

    it("should allow balanced braces in url", function() {
        const url = "http://example.org/{{}t{oo}}";
        const parsed1 = getParsed(`\\href{${url}}{\\alpha}`, trustSettings)[0];
        expect(parsed1.href).toBe(url);
        const parsed2 = getParsed(`\\url{${url}}`, trustSettings)[0];
        expect(parsed2.href).toBe(url);
    });

    it("should not allow unbalanced brace(s) in url", function() {
        expect`\href{http://example.com/{a}{bar}`.not.toParse();
        expect`\href{http://example.com/}a}{bar}`.not.toParse();
        expect`\\url{http://example.com/{a}`.not.toParse();
        expect`\\url{http://example.com/}a}`.not.toParse();
    });

    it("should allow escape for letters [#$%&~_^{}]", function() {
        const url = "http://example.org/~bar/#top?foo=$}foo{&bar=bar^r_boo%20baz";
        const input = url.replace(/([#$%&~_^{}])/g, '\\$1');
        const parsed1 = getParsed(`\\href{${input}}{\\alpha}`, trustSettings)[0];
        expect(parsed1.href).toBe(url);
        const parsed2 = getParsed(`\\url{${input}}`, trustSettings)[0];
        expect(parsed2.href).toBe(url);
    });

    it("should allow comments after URLs", function() {
        expect("\\url{http://example.com/}%comment\n").toBuild();
    });

    it("should be marked up correctly", function() {
        const markup = katex.renderToString(r`\href{http://example.com/}{example here}`, {trust: true});
        expect(markup).toContain("<a href=\"http://example.com/\">");
    });

    it("should not affect spacing around", function() {
        const built = getBuilt("a\\href{http://example.com/}{+b}", trustSettings);
        expect(built).toMatchSnapshot();
    });

    it("should forbid relative URLs when trust option is false", () => {
        const parsed = getParsed("\\href{relative}{foo}");
        expect(parsed).toMatchSnapshot();
    });

    it("should allow explicitly allowed protocols", () => {
        const parsed = getParsed(
            "\\href{ftp://x}{foo}",
            new Settings({trust: (context) => context.protocol === "ftp"}),
        );
        expect(parsed).toMatchSnapshot();
    });

    it("should allow all protocols when trust option is true", () => {
        const parsed = getParsed("\\href{ftp://x}{foo}", trustSettings);
        expect(parsed).toMatchSnapshot();
    });

    it("should not allow explicitly disallow protocols", () => {
        const parsed = getParsed(
            "\\href{javascript:alert('x')}{foo}",
            new Settings({trust: context => context.protocol !== "javascript"}),
        );
        expect(parsed).toMatchSnapshot();
    });
});

describe("A raw text parser", function() {
    it("should return null for a omitted optional string", function() {
        expect("\\includegraphics{https://cdn.kastatic.org/images/apple-touch-icon-57x57-precomposed.new.png}").toParse();
    });
});


describe("A parser that does not throw on unsupported commands", function() {
    // The parser breaks on unsupported commands unless it is explicitly
    // told not to
    const errorColor = "#933";
    const noThrowSettings = new Settings({
        throwOnError: false,
        errorColor: errorColor,
    });

    it("should still parse on unrecognized control sequences", function() {
        expect`\error`.toParse(noThrowSettings);
    });

    describe("should allow unrecognized controls sequences anywhere, including", function() {
        it("in superscripts and subscripts", function() {
            expect`2_\error`.toBuild(noThrowSettings);
            expect`3^{\error}_\error`.toBuild(noThrowSettings);
            expect`\int\nolimits^\error_\error`.toBuild(noThrowSettings);
        });

        it("in fractions", function() {
            expect`\frac{345}{\error}`.toBuild(noThrowSettings);
            expect`\frac\error{\error}`.toBuild(noThrowSettings);
        });

        it("in square roots", function() {
            expect`\sqrt\error`.toBuild(noThrowSettings);
            expect`\sqrt{234\error}`.toBuild(noThrowSettings);
        });

        it("in text boxes", function() {
            expect`\text{\error}`.toBuild(noThrowSettings);
        });
    });

    it("should produce color nodes with a color value given by errorColor", function() {
        const parsedInput = getParsed(r`\error`, noThrowSettings);
        expect(parsedInput[0].type).toBe("color");
        expect(parsedInput[0].color).toBe(errorColor);
    });

    it("should build katex-error span for other type of KaTeX error", function() {
        const built = getBuilt("2^2^2", noThrowSettings);
        expect(built).toMatchSnapshot();
    });

    it("should properly escape LaTeX in errors", function() {
        const html = katex.renderToString("2^&\"<>", noThrowSettings);
        expect(html).toMatchSnapshot();
    });
});

describe("The symbol table integrity", function() {
    it("should treat certain symbols as synonyms", function() {
        expect`<`.toBuildLike`\lt`;
        expect`>`.toBuildLike`\gt`;
        expect`\left<\frac{1}{x}\right>`.toBuildLike`\left\lt\frac{1}{x}\right\gt`;
    });
});

describe("Symbols", function() {
    it("should support AMS symbols in both text and math mode", function() {
        // These text+math symbols are from Section 6 of
        // http://mirrors.ctan.org/fonts/amsfonts/doc/amsfonts.pdf
        const symbols = r`\yen\checkmark\circledR\maltese`;
        expect(symbols).toBuild();
        expect(`\\text{${symbols}}`).toBuild(strictSettings);
    });
});

describe("A macro expander", function() {
    it("should produce individual tokens", function() {
        expect`e^\foo`.toParseLike("e^1 23",
            new Settings({macros: {"\\foo": "123"}}));
    });

    it("should preserve leading spaces inside macro definition", function() {
        expect`\text{\foo}`.toParseLike(r`\text{ x}`,
            new Settings({macros: {"\\foo": " x"}}));
    });

    it("should preserve leading spaces inside macro argument", function() {
        expect`\text{\foo{ x}}`.toParseLike(r`\text{ x}`,
            new Settings({macros: {"\\foo": "#1"}}));
    });

    it("should ignore expanded spaces in math mode", function() {
        expect`\foo`.toParseLike("x", new Settings({macros: {"\\foo": " x"}}));
    });

    it("should consume spaces after control-word macro", function() {
        expect`\text{\foo }`.toParseLike(r`\text{x}`,
            new Settings({macros: {"\\foo": "x"}}));
    });

    it("should consume spaces after macro with \\relax", function() {
        expect`\text{\foo }`.toParseLike(r`\text{}`,
            new Settings({macros: {"\\foo": "\\relax"}}));
    });

    it("should not consume spaces after control-word expansion", function() {
        expect`\text{\\ }`.toParseLike(r`\text{ }`,
            new Settings({macros: {"\\\\": "\\relax"}}));
    });

    it("should consume spaces after \\relax", function() {
        expect`\text{\relax }`.toParseLike`\text{}`;
    });

    it("should consume spaces after control-word function", function() {
        expect`\text{\KaTeX }`.toParseLike`\text{\KaTeX}`;
    });

    it("should preserve spaces after control-symbol macro", function() {
        expect`\text{\% y}`.toParseLike(r`\text{x y}`,
            new Settings({macros: {"\\%": "x"}}));
    });

    it("should preserve spaces after control-symbol function", function() {
        expect`\text{\' }`.toParse();
    });

    it("should consume spaces between arguments", function() {
        expect`\text{\foo 1 2}`.toParseLike(r`\text{12end}`,
            new Settings({macros: {"\\foo": "#1#2end"}}));
        expect`\text{\foo {1} {2}}`.toParseLike(r`\text{12end}`,
            new Settings({macros: {"\\foo": "#1#2end"}}));
    });

    it("should allow for multiple expansion", function() {
        expect`1\foo2`.toParseLike("1aa2", new Settings({macros: {
            "\\foo": "\\bar\\bar",
            "\\bar": "a",
        }}));
    });

    it("should allow for multiple expansion with argument", function() {
        expect`1\foo2`.toParseLike("12222", new Settings({macros: {
            "\\foo": "\\bar{#1}\\bar{#1}",
            "\\bar": "#1#1",
        }}));
    });

    it("should allow for macro argument", function() {
        expect`\foo\bar`.toParseLike("(xyz)", new Settings({macros: {
            "\\foo": "(#1)",
            "\\bar": "xyz",
        }}));
    });

    it("should allow properly nested group for macro argument", function() {
        expect`\foo{e^{x_{12}+3}}`.toParseLike("(e^{x_{12}+3})",
            new Settings({macros: {"\\foo": "(#1)"}}));
    });

    it("should delay expansion if preceded by \\expandafter", function() {
        expect`\expandafter\foo\bar`.toParseLike("x+y", new Settings({macros: {
            "\\foo": "#1+#2",
            "\\bar": "xy",
        }}));
        expect`\def\foo{x}\def\bar{\def\foo{y}}\expandafter\bar\foo`.toParseLike`x`;
        // \def is not expandable, i.e., \expandafter doesn't define the macro
        expect`\expandafter\foo\def\foo{x}`.not.toParse();
    });

    it("should not expand if preceded by \\noexpand", function() {
        // \foo is not expanded and interpreted as if its meaning were \relax
        expect`\noexpand\foo y`.toParseLike("y",
            new Settings({macros: {"\\foo": "x"}}));
        // \noexpand is expandable, so the second \foo is not expanded
        expect`\expandafter\foo\noexpand\foo`.toParseLike("x",
            new Settings({macros: {"\\foo": "x"}}));
        // \frac is a macro and therefore expandable
        expect`\noexpand\frac xy`.toParseLike`xy`;
        // \def is not expandable, so is not affected by \noexpand
        expect`\noexpand\def\foo{xy}\foo`.toParseLike`xy`;
    });

    it("should allow for space macro argument (text version)", function() {
        expect`\text{\foo\bar}`.toParseLike(r`\text{( )}`, new Settings({macros: {
            "\\foo": "(#1)",
            "\\bar": " ",
        }}));
    });

    it("should allow for space macro argument (math version)", function() {
        expect`\foo\bar`.toParseLike("()", new Settings({macros: {
            "\\foo": "(#1)",
            "\\bar": " ",
        }}));
    });

    it("should allow for space second argument (text version)", function() {
        expect`\text{\foo\bar\bar}`.toParseLike(r`\text{( , )}`, new Settings({macros: {
            "\\foo": "(#1,#2)",
            "\\bar": " ",
        }}));
    });

    it("should allow for space second argument (math version)", function() {
        expect`\foo\bar\bar`.toParseLike("(,)", new Settings({macros: {
            "\\foo": "(#1,#2)",
            "\\bar": " ",
        }}));
    });

    it("should allow for empty macro argument", function() {
        expect`\foo\bar`.toParseLike("()", new Settings({macros: {
            "\\foo": "(#1)",
            "\\bar": "",
        }}));
    });

    it("should allow for space function arguments", function() {
        expect`\frac\bar\bar`.toParseLike(r`\frac{}{}`, new Settings({macros: {
            "\\bar": " ",
        }}));
    });

    it("should build \\overset and \\underset", function() {
        expect`\overset{f}{\rightarrow} Y`.toBuild();
        expect("\\underset{f}{\\rightarrow} Y").toBuild();
    });

    it("should build \\iff, \\implies, \\impliedby", function() {
        expect`X \iff Y`.toBuild();
        expect`X \implies Y`.toBuild();
        expect`X \impliedby Y`.toBuild();
    });

    it("should allow aliasing characters", function() {
        expect`x’=c`.toParseLike("x'=c", new Settings({macros: {
            "’": "'",
        }}));
    });

    it("\\@firstoftwo should consume both, and avoid errors", function() {
        expect`\@firstoftwo{yes}{no}`.toParseLike`yes`;
        expect`\@firstoftwo{yes}{1'_2^3}`.toParseLike`yes`;
    });

    it("\\@ifstar should consume star but nothing else", function() {
        expect`\@ifstar{yes}{no}*!`.toParseLike`yes!`;
        expect`\@ifstar{yes}{no}?!`.toParseLike`no?!`;
    });

    it("\\@ifnextchar should not consume nonspaces", function() {
        expect`\@ifnextchar!{yes}{no}!!`.toParseLike`yes!!`;
        expect`\@ifnextchar!{yes}{no}?!`.toParseLike`no?!`;
    });

    it("\\@ifnextchar should consume spaces", function() {
        expect`\def\x#1{\@ifnextchar x{yes}{no}}\x{}x\x{} x`
            .toParseLike`yesxyesx`;
    });

    it("\\@ifstar should consume star but nothing else", function() {
        expect`\@ifstar{yes}{no}*!`.toParseLike`yes!`;
        expect`\@ifstar{yes}{no}?!`.toParseLike`no?!`;
    });

    it("\\TextOrMath should work immediately", function() {
        expect`\TextOrMath{text}{math}`.toParseLike`math`;
    });

    it("\\TextOrMath should work after other math", function() {
        expect`x+\TextOrMath{text}{math}`.toParseLike`x+math`;
    });

    it("\\TextOrMath should work immediately after \\text", function() {
        expect`\text{\TextOrMath{text}{math}}`.toParseLike`\text{text}`;
    });

    it("\\TextOrMath should work later after \\text", function() {
        expect`\text{hello \TextOrMath{text}{math}}`.toParseLike`\text{hello text}`;
    });

    it("\\TextOrMath should work immediately after \\text ends", function() {
        expect`\text{\TextOrMath{text}{math}}\TextOrMath{text}{math}`
            .toParseLike`\text{text}math`;
    });

    it("\\TextOrMath should work immediately after $", function() {
        expect`\text{$\TextOrMath{text}{math}$}`.toParseLike`\text{$math$}`;
    });

    it("\\TextOrMath should work later after $", function() {
        expect`\text{$x+\TextOrMath{text}{math}$}`.toParseLike`\text{$x+math$}`;
    });

    it("\\TextOrMath should work immediately after $ ends", function() {
        expect`\text{$\TextOrMath{text}{math}$\TextOrMath{text}{math}}`
            .toParseLike`\text{$math$text}`;
    });

    it("\\TextOrMath should work in a macro", function() {
        expect`\mode\text{\mode$\mode$\mode}\mode`
            .toParseLike(r`math\text{text$math$text}math`, new Settings({macros: {
                "\\mode": "\\TextOrMath{text}{math}",
            }}));
    });

    it("\\TextOrMath should work in a macro passed to \\text", function() {
        expect`\text\mode`.toParseLike(r`\text t`, new Settings({macros:
            {"\\mode": "\\TextOrMath{t}{m}"}}));
    });

    it("\\char produces literal characters", () => {
        expect("\\char`a").toParseLike("\\char`\\a");
        expect("\\char`\\%").toParseLike("\\char37");
        expect("\\char`\\%").toParseLike("\\char'45");
        expect("\\char`\\%").toParseLike('\\char"25');
        expect("\\char").not.toParse();
        expect("\\char`").not.toParse();
        expect("\\char'").not.toParse();
        expect('\\char"').not.toParse();
        expect("\\char'a").not.toParse();
        expect('\\char"g').not.toParse();
        expect('\\char"g').not.toParse();
    });

    it("should build Unicode private area characters", function() {
        expect`\gvertneqq\lvertneqq\ngeqq\ngeqslant\nleqq`.toBuild();
        expect`\nleqslant\nshortmid\nshortparallel\varsubsetneq`.toBuild();
        expect`\varsubsetneqq\varsupsetneq\varsupsetneqq`.toBuild();
    });

    it("\\TextOrMath should work in a macro passed to \\text", function() {
        expect`\text\mode`.toParseLike(r`\text{text}`, new Settings({macros:
            {"\\mode": "\\TextOrMath{text}{math}"}}));
    });

    it("\\gdef defines macros", function() {
        expect`\gdef\foo{x^2}\foo+\foo`.toParseLike`x^2+x^2`;
        expect`\gdef\foo{hi}\foo+\text\foo`.toParseLike`hi+\text{hi}`;
        expect`\gdef\foo#1{hi #1}\text{\foo{Alice}, \foo{Bob}}`
            .toParseLike`\text{hi Alice, hi Bob}`;
        expect`\gdef\foo#1#2{(#1,#2)}\foo 1 2+\foo 3 4`.toParseLike`(1,2)+(3,4)`;
        expect`\gdef\foo#2{}`.not.toParse();
        expect`\gdef\foo#a{}`.not.toParse();
        expect`\gdef\foo#1#3{}`.not.toParse();
        expect`\gdef\foo#1#2#3#4#5#6#7#8#9{}`.toParse();
        expect`\gdef\foo#1#2#3#4#5#6#7#8#9#10{}`.not.toParse();
        expect`\gdef\foo1`.not.toParse();
        expect`\gdef{\foo}{}`.not.toParse();
        expect`\gdef\foo\bar`.not.toParse();
        expect`\gdef{\foo\bar}{}`.not.toParse();
        expect`\gdef{}{}`.not.toParse();
    });

    it("\\gdef defines macros with delimited parameter", function() {
        expect`\gdef\foo|#1||{#1}\text{\foo| x y ||}`.toParseLike`\text{ x y }`;
        expect`\gdef\foo#1|#2{#1+#2}\foo 1 2 |34`.toParseLike`12+34`;
        expect`\gdef\foo#1#{#1}\foo1^{23}`.toParseLike`1^{23}`;
        expect`\gdef\foo|{}\foo`.not.toParse();
        expect`\gdef\foo#1|{#1}\foo1`.not.toParse();
        expect`\gdef\foo#1|{#1}\foo1}|`.not.toParse();
    });

    it("\\xdef should expand definition", function() {
        expect`\def\foo{a}\xdef\bar{\foo}\def\foo{}\bar`.toParseLike`a`;
        // \def\noexpand\foo{} expands into \def\foo{}
        expect`\def\foo{a}\xdef\bar{\def\noexpand\foo{}}\foo\bar\foo`.toParseLike`a`;
        // \foo\noexpand\foo expands into a\foo
        expect`\def\foo{a}\xdef\bar{\foo\noexpand\foo}\def\foo{b}\bar`.toParseLike`ab`;
        // \foo is not defined
        expect`\xdef\bar{\foo}`.not.toParse();
    });

    it("\\def should be handled in Parser", () => {
        expect`\gdef\foo{1}`.toParse(new Settings({maxExpand: 0}));
        expect`2^\def\foo{1}2`.not.toParse();
    });

    it("\\def works locally", () => {
        expect("\\def\\x{1}\\x{\\def\\x{2}\\x{\\def\\x{3}\\x}\\x}\\x")
            .toParseLike`1{2{3}2}1`;
        expect("\\def\\x{1}\\x\\def\\x{2}\\x{\\def\\x{3}\\x\\def\\x{4}\\x}\\x")
            .toParseLike`12{34}2`;
    });

    it("\\gdef overrides at all levels", () => {
        expect("\\def\\x{1}\\x{\\def\\x{2}\\x{\\gdef\\x{3}\\x}\\x}\\x")
            .toParseLike`1{2{3}3}3`;
        expect("\\def\\x{1}\\x{\\def\\x{2}\\x{\\global\\def\\x{3}\\x}\\x}\\x")
            .toParseLike`1{2{3}3}3`;
        expect("\\def\\x{1}\\x{\\def\\x{2}\\x{\\gdef\\x{3}\\x\\def\\x{4}\\x}" +
            "\\x\\def\\x{5}\\x}\\x").toParseLike`1{2{34}35}3`;
    });

    it("\\global needs to followed by macro prefixes, \\def or \\edef", () => {
        expect`\global\def\foo{}\foo`.toParseLike``;
        expect`\global\edef\foo{}\foo`.toParseLike``;
        expect`\def\DEF{\def}\global\DEF\foo{}\foo`.toParseLike``;
        expect`\global\global\def\foo{}\foo`.toParseLike``;
        expect`\global\long\def\foo{}\foo`.toParseLike``;
        expect`\global\foo`.not.toParse();
        expect`\global\bar x`.not.toParse();
    });

    it("\\long needs to followed by macro prefixes, \\def or \\edef", () => {
        expect`\long\def\foo{}\foo`.toParseLike``;
        expect`\long\edef\foo{}\foo`.toParseLike``;
        expect`\long\global\def\foo{}\foo`.toParseLike``;
        expect`\long\foo`.not.toParse();
    });

    it("Macro arguments do not generate groups", () => {
        expect("\\def\\x{1}\\x\\def\\foo#1{#1}\\foo{\\x\\def\\x{2}\\x}\\x")
            .toParseLike`1122`;
    });

    it("\\textbf arguments do generate groups", () => {
        expect("\\def\\x{1}\\x\\textbf{\\x\\def\\x{2}\\x}\\x")
            .toParseLike`1\textbf{12}1`;
    });

    it("\\sqrt optional arguments generate groups", () => {
        expect("\\def\\x{1}\\def\\y{1}\\x\\y" +
            "\\sqrt[\\def\\x{2}\\x]{\\def\\y{2}\\y}\\x\\y")
            .toParseLike`11\sqrt[2]{2}11`;
    });

    it("array cells generate groups", () => {
        expect`\def\x{1}\begin{matrix}\x&\def\x{2}\x&\x\end{matrix}\x`
            .toParseLike`\begin{matrix}1&2&1\end{matrix}1`;
        expect`\def\x{1}\begin{matrix}\def\x{2}\x&\x\end{matrix}\x`
            .toParseLike`\begin{matrix}2&1\end{matrix}1`;
    });

    it("\\gdef changes settings.macros", () => {
        const macros = {};
        expect`\gdef\foo{1}`.toParse(new Settings({macros}));
        expect(macros["\\foo"]).toBeTruthy();
    });

    it("\\def doesn't change settings.macros", () => {
        const macros = {};
        expect`\def\foo{1}`.toParse(new Settings({macros}));
        expect(macros["\\foo"]).toBeFalsy();
    });

    it("\\def changes settings.macros with globalGroup", () => {
        const macros = {};
        expect`\gdef\foo{1}`.toParse(new Settings({macros, globalGroup: true}));
        expect(macros["\\foo"]).toBeTruthy();
    });

    it("\\let copies the definition", () => {
        expect`\let\foo=\frac\def\frac{}\foo12`.toParseLike`\frac12`;
        expect`\def\foo{1}\let\bar\foo\def\foo{2}\bar`.toParseLike`1`;
        expect`\let\foo=\kern\edef\bar{\foo1em}\let\kern=\relax\bar`.toParseLike`\kern1em`;
        // \foo = { (left brace)
        expect`\let\foo{\sqrt\foo1}`.toParseLike`\sqrt{1}`;
        // \equals = = (equal sign)
        expect`\let\equals==a\equals b`.toParseLike`a=b`;
        // \foo should not be expandable and not affected by \noexpand or \edef
        expect`\let\foo=x\noexpand\foo`.toParseLike`x`;
        expect`\let\foo=x\edef\bar{\foo}\def\foo{y}\bar`.toParseLike`y`;
    });

    it("\\let should consume one optional space after equals sign", () => {
        // https://tex.stackexchange.com/questions/141166/let-foo-bar-vs-let-foo-bar-let-with-equals-sign
        expect`\def\:{\let\space= }\: \text{\space}`.toParseLike`\text{ }`;
        const tree = getParsed`\def\bold{\bgroup\bf\let\next= }\bold{a}`;
        expect(tree).toMatchSnapshot();
    });

    it("\\futurelet should parse correctly", () => {
        expect`\futurelet\foo\frac1{2+\foo}`.toParseLike`\frac1{2+1}`;
    });

    it("\\newcommand doesn't change settings.macros", () => {
        const macros = {};
        expect`\newcommand\foo{x^2}\foo+\foo`.toParse(new Settings({macros}));
        expect(macros["\\foo"]).toBeFalsy();
    });

    it("\\newcommand changes settings.macros with globalGroup", () => {
        const macros = {};
        expect`\newcommand\foo{x^2}\foo+\foo`.toParse(
            new Settings({macros, globalGroup: true}));
        expect(macros["\\foo"]).toBeTruthy();
    });

    it("\\newcommand defines new macros", () => {
        expect`\newcommand\foo{x^2}\foo+\foo`.toParseLike`x^2+x^2`;
        expect`\newcommand{\foo}{x^2}\foo+\foo`.toParseLike`x^2+x^2`;
        // Function detection
        expect`\newcommand\bar{x^2}\bar+\bar`.not.toParse();
        expect`\newcommand{\bar}{x^2}\bar+\bar`.not.toParse();
        // Symbol detection
        expect`\newcommand\lambda{x^2}\lambda`.not.toParse();
        expect`\newcommand\textdollar{x^2}\textdollar`.not.toParse();
        // Macro detection
        expect`\newcommand{\foo}{1}\foo\newcommand{\foo}{2}\foo`.not.toParse();
        // Implicit detection
        expect`\newcommand\limits{}`.not.toParse();
    });

    it("\\renewcommand redefines macros", () => {
        expect`\renewcommand\foo{x^2}\foo+\foo`.not.toParse();
        expect`\renewcommand{\foo}{x^2}\foo+\foo`.not.toParse();
        expect`\renewcommand\bar{x^2}\bar+\bar`.toParseLike`x^2+x^2`;
        expect`\renewcommand{\bar}{x^2}\bar+\bar`.toParseLike`x^2+x^2`;
        expect`\newcommand{\foo}{1}\foo\renewcommand{\foo}{2}\foo`.toParseLike`12`;
    });

    it("\\providecommand (re)defines macros", () => {
        expect`\providecommand\foo{x^2}\foo+\foo`.toParseLike`x^2+x^2`;
        expect`\providecommand{\foo}{x^2}\foo+\foo`.toParseLike`x^2+x^2`;
        expect`\providecommand\bar{x^2}\bar+\bar`.toParseLike`x^2+x^2`;
        expect`\providecommand{\bar}{x^2}\bar+\bar`.toParseLike`x^2+x^2`;
        expect`\newcommand{\foo}{1}\foo\providecommand{\foo}{2}\foo`
            .toParseLike`12`;
        expect`\providecommand{\foo}{1}\foo\renewcommand{\foo}{2}\foo`
            .toParseLike`12`;
        expect`\providecommand{\foo}{1}\foo\providecommand{\foo}{2}\foo`
            .toParseLike`12`;
    });

    it("\\newcommand is local", () => {
        expect`\newcommand\foo{1}\foo{\renewcommand\foo{2}\foo}\foo`
            .toParseLike`1{2}1`;
    });

    it("\\newcommand accepts number of arguments", () => {
        expect`\newcommand\foo[1]{#1^2}\foo x+\foo{y}`.toParseLike`x^2+y^2`;
        expect`\newcommand\foo[10]{#1^2}\foo 0123456789`.toParseLike`0^2`;
        expect`\newcommand\foo[x]{}`.not.toParse();
        expect`\newcommand\foo[1.5]{}`.not.toParse();
    });

    // This may change in the future, if we support the extra features of
    // \hspace.
    it("should treat \\hspace, \\hskip like \\kern", function() {
        expect`\hspace{1em}`.toParseLike`\kern1em`;
        expect`\hskip{1em}`.toParseLike`\kern1em`;
    });

    it("should expand \\limsup as expected", () => {
        expect`\limsup`.toParseLike`\operatorname*{lim\,sup}`;
    });

    it("should expand \\liminf as expected", () => {
        expect`\liminf`.toParseLike`\operatorname*{lim\,inf}`;
    });

    it("should expand AMS log-like symbols as expected", () => {
        expect`\injlim`.toParseLike`\operatorname*{inj\,lim}`;
        expect`\projlim`.toParseLike`\operatorname*{proj\,lim}`;
        expect`\varlimsup`.toParseLike`\operatorname*{\overline{lim}}`;
        expect`\varliminf`.toParseLike`\operatorname*{\underline{lim}}`;
        expect`\varinjlim`.toParseLike`\operatorname*{\underrightarrow{lim}}`;
        expect`\varinjlim`.toParseLike`\operatorname*{\underrightarrow{lim}}`;
        expect`\varprojlim`.toParseLike`\operatorname*{\underleftarrow{lim}}`;
    });

    it("should expand \\plim as expected", () => {
        expect`\plim`.toParseLike`\mathop{\operatorname{plim}}\limits`;
    });

    it("should expand \\argmin as expected", () => {
        expect`\argmin`.toParseLike`\operatorname*{arg\,min}`;
    });

    it("should expand \\argmax as expected", () => {
        expect`\argmax`.toParseLike`\operatorname*{arg\,max}`;
    });

    it("should expand \\bra as expected", () => {
        expect`\bra{\phi}`.toParseLike`\mathinner{\langle{\phi}|}`;
    });

    it("should expand \\ket as expected", () => {
        expect`\ket{\psi}`.toParseLike`\mathinner{|{\psi}\rangle}`;
    });

    it("should expand \\braket as expected", () => {
        expect`\braket{\phi|\psi}`.toParseLike`\mathinner{\langle{\phi|\psi}\rangle}`;
    });

    it("should expand \\Bra as expected", () => {
        expect`\Bra{\phi}`.toParseLike`\left\langle\phi\right|`;
    });

    it("should expand \\Ket as expected", () => {
        expect`\Ket{\psi}`.toParseLike`\left|\psi\right\rangle`;
    });
});

describe("\\tag support", function() {
    const displayMode = new Settings({displayMode: true});

    it("should fail outside display mode", () => {
        expect`\tag{hi}x+y`.not.toParse();
    });

    it("should fail with multiple tags", () => {
        expect`\tag{1}\tag{2}x+y`.not.toParse(displayMode);
    });

    it("should build", () => {
        expect`\tag{hi}x+y`.toBuild(displayMode);
    });

    it("should ignore location of \\tag", () => {
        expect`\tag{hi}x+y`.toParseLike(r`x+y\tag{hi}`, displayMode);
    });

    it("should handle \\tag* like \\tag", () => {
        expect`\tag{hi}x+y`.toParseLike(r`\tag*{({hi})}x+y`, displayMode);
    });
});

describe("leqno and fleqn rendering options", () => {
    const expr = r`\tag{hi}x+y`;
    for (const opt of ["leqno", "fleqn"]) {
        it(`should not add ${opt} class by default`, () => {
            const settings = new Settings({displayMode: true});
            const built = katex.__renderToDomTree(expr, settings);
            expect(built.classes).not.toContain(opt);
        });
        it(`should not add ${opt} class when false`, () => {
            const settings = new Settings({displayMode: true});
            settings[opt] = false;
            const built = katex.__renderToDomTree(expr, settings);
            expect(built.classes).not.toContain(opt);
        });
        it(`should add ${opt} class when true`, () => {
            const settings = new Settings({displayMode: true});
            settings[opt] = true;
            const built = katex.__renderToDomTree(expr, settings);
            expect(built.classes).toContain(opt);
        });
    }
});

describe("\\@binrel automatic bin/rel/ord", () => {
    it("should generate proper class", () => {
        expect("L\\@binrel+xR").toParseLike("L\\mathbin xR");
        expect("L\\@binrel=xR").toParseLike("L\\mathrel xR");
        expect("L\\@binrel xxR").toParseLike("L\\mathord xR");
        expect("L\\@binrel{+}{x}R").toParseLike("L\\mathbin{x}R");
        expect("L\\@binrel{=}{x}R").toParseLike("L\\mathrel{x}R");
        expect("L\\@binrel{x}{x}R").toParseLike("L\\mathord{x}R");
    });

    it("should base on just first character in group", () => {
        expect("L\\@binrel{+x}xR").toParseLike("L\\mathbin xR");
        expect("L\\@binrel{=x}xR").toParseLike("L\\mathrel xR");
        expect("L\\@binrel{xx}xR").toParseLike("L\\mathord xR");
    });
});

describe("A parser taking String objects", function() {
    it("should not fail on an empty String object", function() {
        expect(new String("")).toParse();
    });

    it("should parse the same as a regular string", function() {
        expect(new String("xy")).toParseLike`xy`;
        expect(new String(r`\div`)).toParseLike`\div`;
        expect(new String(r`\frac 1 2`)).toParseLike`\frac 1 2`;
    });
});

describe("Unicode accents", function() {
    it("should parse Latin-1 letters in math mode", function() {
        // TODO(edemaine): Unsupported Latin-1 letters in math: ÇÐÞçðþ
        expect`ÀÁÂÃÄÅÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåèéêëìíîïñòóôõöùúûüýÿ`
        .toParseLike(
            r`\grave A\acute A\hat A\tilde A\ddot A\mathring A` +
            r`\grave E\acute E\hat E\ddot E` +
            r`\grave I\acute I\hat I\ddot I` +
            r`\tilde N` +
            r`\grave O\acute O\hat O\tilde O\ddot O` +
            r`\grave U\acute U\hat U\ddot U` +
            r`\acute Y` +
            r`\grave a\acute a\hat a\tilde a\ddot a\mathring a` +
            r`\grave e\acute e\hat e\ddot e` +
            r`\grave ı\acute ı\hat ı\ddot ı` +
            r`\tilde n` +
            r`\grave o\acute o\hat o\tilde o\ddot o` +
            r`\grave u\acute u\hat u\ddot u` +
            r`\acute y\ddot y`, nonstrictSettings);
    });

    it("should parse Latin-1 letters in text mode", function() {
        // TODO(edemaine): Unsupported Latin-1 letters in text: ÇÐÞçðþ
        expect`\text{ÀÁÂÃÄÅÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåèéêëìíîïñòóôõöùúûüýÿ}`
        .toParseLike(
            r`\text{\`A\'A\^A\~A\"A\r A` +
            r`\`E\'E\^E\"E` +
            r`\`I\'I\^I\"I` +
            r`\~N` +
            r`\`O\'O\^O\~O\"O` +
            r`\`U\'U\^U\"U` +
            r`\'Y` +
            r`\`a\'a\^a\~a\"a\r a` +
            r`\`e\'e\^e\"e` +
            r`\`ı\'ı\^ı\"ı` +
            r`\~n` +
            r`\`o\'o\^o\~o\"o` +
            r`\`u\'u\^u\"u` +
            r`\'y\"y}`, strictSettings);
    });

    it("should support \\aa in text mode", function() {
        expect`\text{\aa\AA}`.toParseLike(r`\text{\r a\r A}`, strictSettings);
        expect`\aa`.not.toParse(strictSettings);
        expect`\Aa`.not.toParse(strictSettings);
    });

    it("should parse combining characters", function() {
        expect("A\u0301C\u0301").toParseLike(r`Á\acute C`, nonstrictSettings);
        expect("\\text{A\u0301C\u0301}").toParseLike(r`\text{Á\'C}`, strictSettings);
    });

    it("should parse multi-accented characters", function() {
        expect`ấā́ắ\text{ấā́ắ}`.toParse(nonstrictSettings);
        // Doesn't parse quite the same as
        // "\\text{\\'{\\^a}\\'{\\=a}\\'{\\u a}}" because of the ordgroups.
    });

    it("should parse accented i's and j's", function() {
        expect`íȷ́`.toParseLike(r`\acute ı\acute ȷ`, nonstrictSettings);
        expect`ấā́ắ\text{ấā́ắ}`.toParse(nonstrictSettings);
    });
});

describe("Unicode", function() {
    it("should parse negated relations", function() {
        expect`∉∤∦≁≆≠≨≩≮≯≰≱⊀⊁⊈⊉⊊⊋⊬⊭⊮⊯⋠⋡⋦⋧⋨⋩⋬⋭⪇⪈⪉⪊⪵⪶⪹⪺⫋⫌`.toParse(strictSettings);
    });

    it("should build relations", function() {
        expect`∈∋∝∼∽≂≃≅≈≊≍≎≏≐≑≒≓≖≗≜≡≤≥≦≧≪≫≬≳≷≺≻≼≽≾≿∴∵∣≔≕⩴⋘⋙⟂⊨∌`.toBuild(strictSettings);
    });

    it("should parse relations", function() {
        // These characters are not in the KaTeX fonts. So they build with an error message.
        expect`⊶⊷`.toParse();
    });

    it("should build big operators", function() {
        expect`∏∐∑∫∬∭∮⋀⋁⋂⋃⨀⨁⨂⨄⨆`.toBuild(strictSettings);
    });

    it("should build more relations", function() {
        expect`⊂⊃⊆⊇⊏⊐⊑⊒⊢⊣⊩⊪⊸⋈⋍⋐⋑⋔⋛⋞⋟⌢⌣⩾⪆⪌⪕⪖⪯⪰⪷⪸⫅⫆≘≙≚≛≝≞≟≲⩽⪅≶⋚⪋`.toBuild(strictSettings);
    });

    it("should parse symbols", function() {
        expect("£¥ℂℍℑℎℓℕ℘ℙℚℜℝℤℲℵðℶℷℸ⅁∀∁∂∃∇∞∠∡∢♠♡♢♣♭♮♯✓°¬‼⋮\u00B7\u00A9").toBuild(strictSettings);
        expect("\\text{£¥ℂℍℎ\u00A9\u00AE\uFE0F}").toBuild(strictSettings);
    });

    it("should build Greek capital letters", function() {
        expect("\u0391\u0392\u0395\u0396\u0397\u0399\u039A\u039C\u039D" +
                "\u039F\u03A1\u03A4\u03A7\u03DD").toBuild(strictSettings);
    });

    it("should build arrows", function() {
        expect`←↑→↓↔↕↖↗↘↙↚↛↞↠↢↣↦↩↪↫↬↭↮↰↱↶↷↼↽↾↾↿⇀⇁⇂⇃⇄⇆⇇⇈⇉`.toBuild(strictSettings);
    });

    it("should build more arrows", function() {
        expect`⇊⇋⇌⇍⇎⇏⇐⇑⇒⇓⇔⇕⇚⇛⇝⟵⟶⟷⟸⟹⟺⟼`.toBuild(strictSettings);
    });

    it("should build binary operators", function() {
        expect("±×÷∓∔∧∨∩∪≀⊎⊓⊔⊕⊖⊗⊘⊙⊚⊛⊝◯⊞⊟⊠⊡⊺⊻⊼⋇⋉⋊⋋⋌⋎⋏⋒⋓⩞\u22C5").toBuild(strictSettings);
    });

    it("should build delimiters", function() {
        expect("\\left\u230A\\frac{a}{b}\\right\u230B").toBuild();
        expect("\\left\u2308\\frac{a}{b}\\right\u2308").toBuild();
        expect("\\left\u27ee\\frac{a}{b}\\right\u27ef").toBuild();
        expect("\\left\u27e8\\frac{a}{b}\\right\u27e9").toBuild();
        expect("\\left\u23b0\\frac{a}{b}\\right\u23b1").toBuild();
        expect`┌x┐ └x┘`.toBuild();
        expect("\u231Cx\u231D \u231Ex\u231F").toBuild();
        expect("\u27E6x\u27E7").toBuild();
        expect("\\llbracket \\rrbracket").toBuild();
        expect("\\lBrace \\rBrace").toBuild();
    });

    it("should build some surrogate pairs", function() {
        let wideCharStr = "";
        wideCharStr += String.fromCharCode(0xD835, 0xDC00);   // bold A
        wideCharStr += String.fromCharCode(0xD835, 0xDC68);   // bold italic A
        wideCharStr += String.fromCharCode(0xD835, 0xDD04);   // Fraktur A
        wideCharStr += String.fromCharCode(0xD835, 0xDD38);   // double-struck
        wideCharStr += String.fromCharCode(0xD835, 0xDC9C);   // script A
        wideCharStr += String.fromCharCode(0xD835, 0xDDA0);   // sans serif A
        wideCharStr += String.fromCharCode(0xD835, 0xDDD4);   // bold sans A
        wideCharStr += String.fromCharCode(0xD835, 0xDE08);   // italic sans A
        wideCharStr += String.fromCharCode(0xD835, 0xDE70);   // monospace A
        wideCharStr += String.fromCharCode(0xD835, 0xDFCE);   // bold zero
        wideCharStr += String.fromCharCode(0xD835, 0xDFE2);   // sans serif zero
        wideCharStr += String.fromCharCode(0xD835, 0xDFEC);   // bold sans zero
        wideCharStr += String.fromCharCode(0xD835, 0xDFF6);   // monospace zero
        expect(wideCharStr).toBuild(strictSettings);

        let wideCharText = "\text{";
        wideCharText += String.fromCharCode(0xD835, 0xDC00);   // bold A
        wideCharText += String.fromCharCode(0xD835, 0xDC68);   // bold italic A
        wideCharText += String.fromCharCode(0xD835, 0xDD04);   // Fraktur A
        wideCharText += String.fromCharCode(0xD835, 0xDD38);   // double-struck
        wideCharText += String.fromCharCode(0xD835, 0xDC9C);   // script A
        wideCharText += String.fromCharCode(0xD835, 0xDDA0);   // sans serif A
        wideCharText += String.fromCharCode(0xD835, 0xDDD4);   // bold sans A
        wideCharText += String.fromCharCode(0xD835, 0xDE08);   // italic sans A
        wideCharText += String.fromCharCode(0xD835, 0xDE70);   // monospace A
        wideCharText += String.fromCharCode(0xD835, 0xDFCE);   // bold zero
        wideCharText += String.fromCharCode(0xD835, 0xDFE2);   // sans serif zero
        wideCharText += String.fromCharCode(0xD835, 0xDFEC);   // bold sans zero
        wideCharText += String.fromCharCode(0xD835, 0xDFF6);   // monospace zero
        wideCharText += "}";
        expect(wideCharText).toBuild(strictSettings);
    });
});

describe("The maxSize setting", function() {
    const rule = r`\rule{999em}{999em}`;

    it("should clamp size when set", function() {
        const built = getBuilt(rule, new Settings({maxSize: 5}))[0];
        expect(built.style.borderRightWidth).toEqual("5em");
        expect(built.style.borderTopWidth).toEqual("5em");
    });

    it("should not clamp size when not set", function() {
        const built = getBuilt(rule)[0];
        expect(built.style.borderRightWidth).toEqual("999em");
        expect(built.style.borderTopWidth).toEqual("999em");
    });

    it("should make zero-width rules if a negative maxSize is passed", function() {
        const built = getBuilt(rule, new Settings({maxSize: -5}))[0];
        expect(built.style.borderRightWidth).toEqual("0em");
        expect(built.style.borderTopWidth).toEqual("0em");
    });
});

describe("The maxExpand setting", () => {
    it("should prevent expansion", () => {
        expect`\gdef\foo{1}\foo`.toParse();
        expect`\gdef\foo{1}\foo`.toParse(new Settings({maxExpand: 1}));
        expect`\gdef\foo{1}\foo`.not.toParse(new Settings({maxExpand: 0}));
    });

    it("should prevent infinite loops", () => {
        expect`\gdef\foo{\foo}\foo`.not.toParse(
            new Settings({maxExpand: 10}));
    });
});

describe("The \\mathchoice function", function() {
    const cmd = r`\sum_{k = 0}^{\infty} x^k`;

    it("should render as if there is nothing other in display math", function() {
        expect(`\\displaystyle\\mathchoice{${cmd}}{T}{S}{SS}`)
            .toBuildLike(`\\displaystyle${cmd}`);
    });

    it("should render as if there is nothing other in text", function() {
        expect(`\\mathchoice{D}{${cmd}}{S}{SS}`).toBuildLike(cmd);
    });

    it("should render as if there is nothing other in scriptstyle", function() {
        expect(`x_{\\mathchoice{D}{T}{${cmd}}{SS}}`).toBuildLike(`x_{${cmd}}`);
    });

    it("should render  as if there is nothing other in scriptscriptstyle", function() {
        expect(`x_{y_{\\mathchoice{D}{T}{S}{${cmd}}}}`).toBuildLike(`x_{y_{${cmd}}}`);
    });
});

describe("Newlines via \\\\ and \\newline", function() {
    it("should build \\\\ without the optional argument and \\newline the same", () => {
        expect`hello \\ world`.toBuildLike`hello \newline world`;
    });

    it("should not allow \\newline to scan for an optional size argument", () => {
        expect`hello \newline[w]orld`.toBuild();
    });

    it("should not allow \\cr at top level", () => {
        expect`hello \cr world`.not.toBuild();
    });

    it("\\\\ causes newline, even after mrel and mop", () => {
        const markup = katex.renderToString(r`M = \\ a + \\ b \\ c`);
        // Ensure newlines appear outside base spans (because, in this regexp,
        // base span occurs immediately after each newline span).
        expect(markup).toMatch(
            /(<span class="base">.*?<\/span><span class="mspace newline"><\/span>){3}<span class="base">/);
        expect(markup).toMatchSnapshot();
    });
});

describe("Symbols", function() {
    it("should parse \\text{\\i\\j}", () => {
        expect`\text{\i\j}`.toBuild(strictSettings);
    });

    it("should parse spacing functions in math or text mode", () => {
        expect`A\;B\,C\nobreakspace \text{A\;B\,C\nobreakspace}`.toBuild(strictSettings);
    });

    it("should build \\minuso", () => {
        expect`\\minuso`.toBuild(strictSettings);
    });

    it("should render ligature commands like their unicode characters", () => {
        expect`\text{\ae\AE\oe\OE\o\O\ss}`.toBuildLike(r`\text{æÆœŒøØß}`, strictSettings);
    });
});

describe("strict setting", function() {
    it("should allow unicode text when not strict", () => {
        expect`é`.toParse(new Settings(nonstrictSettings));
        expect`試`.toParse(new Settings(nonstrictSettings));
        expect`é`.toParse(new Settings({strict: "ignore"}));
        expect`試`.toParse(new Settings({strict: "ignore"}));
        expect`é`.toParse(new Settings({strict: () => false}));
        expect`試`.toParse(new Settings({strict: () => false}));
        expect`é`.toParse(new Settings({strict: () => "ignore"}));
        expect`試`.toParse(new Settings({strict: () => "ignore"}));
    });

    it("should forbid unicode text when strict", () => {
        expect`é`.not.toParse(new Settings({strict: true}));
        expect`試`.not.toParse(new Settings({strict: true}));
        expect`é`.not.toParse(new Settings({strict: "error"}));
        expect`試`.not.toParse(new Settings({strict: "error"}));
        expect`é`.not.toParse(new Settings({strict: () => true}));
        expect`試`.not.toParse(new Settings({strict: () => true}));
        expect`é`.not.toParse(new Settings({strict: () => "error"}));
        expect`試`.not.toParse(new Settings({strict: () => "error"}));
    });

    it("should warn about unicode text when default", () => {
        expect`é`.toWarn(new Settings());
        expect`試`.toWarn(new Settings());
    });

    it("should always allow unicode text in text mode", () => {
        expect`\text{é試}`.toParse(nonstrictSettings);
        expect`\text{é試}`.toParse(strictSettings);
        expect`\text{é試}`.toParse();
    });

    it("should warn about top-level \\newline in display mode", () => {
        expect`x\\y`.toWarn(new Settings({displayMode: true}));
        expect`x\\y`.toParse(new Settings({displayMode: false}));
    });
});

describe("Internal __* interface", function() {
    const latex = r`\sum_{k = 0}^{\infty} x^k`;
    const rendered = katex.renderToString(latex);

    it("__parse renders same as renderToString", () => {
        const parsed = katex.__parse(latex);
        expect(buildTree(parsed, latex, new Settings()).toMarkup()).toEqual(rendered);
    });

    it("__renderToDomTree renders same as renderToString", () => {
        const tree = katex.__renderToDomTree(latex);
        expect(tree.toMarkup()).toEqual(rendered);
    });

    it("__renderToHTMLTree renders same as renderToString sans MathML", () => {
        const tree = katex.__renderToHTMLTree(latex);
        const renderedSansMathML = rendered.replace(
            /<span class="katex-mathml">.*?<\/span>/, '');
        expect(tree.toMarkup()).toEqual(renderedSansMathML);
    });
});

describe("Extending katex by new fonts and symbols", function() {
    beforeAll(() => {
        const fontName = "mockEasternArabicFont";
        // add eastern arabic numbers to symbols table
        // these symbols are ۰۱۲۳۴۵۶۷۸۹ and ٠١٢٣٤٥٦٧٨٩
        for (let number = 0; number <= 9; number++) {
            const persianNum = String.fromCharCode(0x0660 + number);
            katex.__defineSymbol(
                "math", fontName, "textord", persianNum, persianNum);
            const arabicNum = String.fromCharCode(0x06F0 + number);
            katex.__defineSymbol(
                "math", fontName, "textord", arabicNum, arabicNum);
        }
    });
    it("should throw on rendering new symbols with no font metrics", () => {
        // Lets parse 99^11 in eastern arabic
        const errorMessage = "Font metrics not found for font: mockEasternArabicFont-Regular.";
        expect(() => {
            katex.__renderToDomTree("۹۹^{۱۱}", strictSettings);
        }).toThrow(errorMessage);
    });
    it("should add font metrics to metrics map and render successfully", () => {
        const mockMetrics = {};
        // mock font metrics for the symbols that we added previously
        for (let number = 0; number <= 9; number++) {
            mockMetrics[0x0660 + number] = [-0.00244140625, 0.6875, 0, 0];
            mockMetrics[0x06F0 + number] = [-0.00244140625, 0.6875, 0, 0];
        }
        katex.__setFontMetrics('mockEasternArabicFont-Regular', mockMetrics);
        expect`۹۹^{۱۱}`.toBuild();
    });
    it("Add new font class to new extended symbols", () => {
        expect(katex.renderToString("۹۹^{۱۱}")).toMatchSnapshot();
    });
});

describe("debugging macros", () => {
    describe("message", () => {
        it("should print the argument using console.log", () => {
            jest.spyOn(console, "log").mockImplementation();
            expect`\message{Hello, world}`.toParse();
            // eslint-disable-next-line no-console
            expect(console.log).toHaveBeenCalledWith("Hello, world");
        });
    });

    describe("errmessage", () => {
        it("should print the argument using console.error", () => {
            jest.spyOn(console, "error").mockImplementation();
            expect`\errmessage{Hello, world}`.toParse();
            // eslint-disable-next-line no-console
            expect(console.error).toHaveBeenCalledWith("Hello, world");
        });
    });
});
