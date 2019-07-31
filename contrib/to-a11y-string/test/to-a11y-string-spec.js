/* eslint-disable max-len */
// @flow
import {renderString} from "../to-a11y-string";

describe("renderString", () => {
    describe("basic expressions", () => {
        test("simple addition", () => {
            const result = renderString("1 + 2");
            expect(result).toMatchInlineSnapshot(`"1, plus, 2"`);
        });
    });

    describe("accent", () => {
        test("\\vec", () => {
            const result = renderString("\\vec{a}");
            expect(result).toMatchInlineSnapshot(`"a, with, vector, on top"`);
        });

        test("\\hat{a}", () => {
            const result = renderString("\\hat{a}");
            expect(result).toMatchInlineSnapshot(`"a, with, hat, on top"`);
        });
    });

    describe("accentUnder", () => {
        test("\\underleftarrow", () => {
            const result = renderString("\\underleftarrow{1+2}");
            expect(result).toMatchInlineSnapshot(
                `"1, plus, 2, with, left arrow, underneath"`,
            );
        });

        test("\\underlinesegment", () => {
            const result = renderString("\\underlinesegment{1+2}");
            expect(result).toMatchInlineSnapshot(
                `"1, plus, 2, with, line segment, underneath"`,
            );
        });
    });

    describe("color", () => {
        test("\\color{red}", () => {
            const result = renderString("\\color{red}1+2");
            expect(result).toMatchInlineSnapshot(
                `"start color red, 1, end color red, plus, 2"`,
            );
        });

        test("\\textcolor{red}", () => {
            const result = renderString("\\textcolor{red}1+2");
            expect(result).toMatchInlineSnapshot(
                `"start color red, 1, end color red, plus, 2"`,
            );
        });
    });

    describe("delimiters", () => {
        test("simple parens", () => {
            const result = renderString("(1 + 3)");
            expect(result).toMatchInlineSnapshot(
                `"left parenthesis, 1, plus, 3, right parenthesis"`,
            );
        });

        test("simple brackets", () => {
            const result = renderString("[1 + 3]");
            expect(result).toMatchInlineSnapshot(
                `"open bracket, 1, plus, 3, close bracket"`,
            );
        });

        test("nested parens", () => {
            const result = renderString("(a + (b + c))");
            expect(result).toMatchInlineSnapshot(
                `"left parenthesis, a, plus, left parenthesis, b, plus, c, right parenthesis, right parenthesis"`,
            );
        });

        test("stretchy parens around fractions", () => {
            const result = renderString("\\left(\\frac{1}{x}\\right)");
            expect(result).toMatchInlineSnapshot(
                `"left parenthesis, start fraction, 1, divided by, x, end fraction, right parenthesis"`,
            );
        });
    });

    describe("enclose", () => {
        test("\\cancel", () => {
            const result = renderString("\\cancel{a}");
            expect(result).toMatchInlineSnapshot(
                `"start cancel, a, end cancel"`,
            );
        });

        test("\\fbox", () => {
            const result = renderString("\\fbox{a}");
            expect(result).toMatchInlineSnapshot(`"start box, a, end box"`);
        });

        test("\\sout", () => {
            const result = renderString("\\sout{a}");
            expect(result).toMatchInlineSnapshot(`"start strikeout, a, end strikeout"`);
        });
    });

    describe("exponents", () => {
        test("simple exponent", () => {
            const result = renderString("e^x");
            expect(result).toMatchInlineSnapshot(
                `"e, start superscript, x, end superscript"`,
            );
        });

        test("^{\\circ} => degrees", () => {
            const result = renderString("90^{\\circ}");
            expect(result).toMatchInlineSnapshot(`"90, degrees"`);
        });

        test("^{\\degree} => degrees", () => {
            const result = renderString("90^{\\degree}");
            expect(result).toMatchInlineSnapshot(`"90, degrees"`);
        });

        test("^{\\prime} => prime", () => {
            const result = renderString("f^{\\prime}");
            expect(result).toMatchInlineSnapshot(`"f, prime"`);
        });

        test("^2 => squared", () => {
            const result = renderString("x^2");
            expect(result).toMatchInlineSnapshot(`"x, squared"`);
        });

        test("^3 => cubed", () => {
            const result = renderString("x^3");
            expect(result).toMatchInlineSnapshot(`"x, cubed"`);
        });

        test("log_2", () => {
            const result = renderString("\\log_2{x+1}");
            expect(result).toMatchInlineSnapshot(
                `"log, start subscript, 2, end subscript, x, plus, 1"`,
            );
        });
    });

    describe("genfrac", () => {
        test("simple fractions", () => {
            const result = renderString("\\frac{2}{3}");
            expect(result).toMatchInlineSnapshot(
                `"start fraction, 2, divided by, 3, end fraction"`,
            );
        });

        test("nested fractions", () => {
            const result = renderString("\\frac{1}{1+\\frac{1}{x}}");
            // TODO: this result is ambiguous, we need to fix this
            expect(result).toMatchInlineSnapshot(
                `"start fraction, 1, divided by, 1, plus, start fraction, 1, divided by, x, end fraction, end fraction"`,
            );
        });

        test("binomials", () => {
            const result = renderString("\\binom{n}{k}");
            expect(result).toMatchInlineSnapshot(
                `"start binomial, left parenthesis, n, over, k, right parenthesis, end binomial"`,
            );
        });
    });

    describe("horizBrace", () => {
        test("\\overbrace", () => {
            const result = renderString("\\overbrace{1+2}");
            expect(result).toMatchInlineSnapshot(
                `"start overbrace, 1, plus, 2, end overbrace"`,
            );
        });

        test("\\underbrace", () => {
            const result = renderString("\\underbrace{1+2}");
            expect(result).toMatchInlineSnapshot(
                `"start underbrace, 1, plus, 2, end underbrace"`,
            );
        });
    });

    describe("infix", () => {
        test("\\over", () => {
            const result = renderString("a \\over b");
            expect(result).toMatchInlineSnapshot(
                `"start fraction, a, divided by, b, end fraction"`,
            );
        });

        test("\\choose", () => {
            const result = renderString("a \\choose b");
            expect(result).toMatchInlineSnapshot(
                `"start binomial, left parenthesis, a, over, b, right parenthesis, end binomial"`,
            );
        });

        test("\\above", () => {
            const result = renderString("a \\above{2pt} b");
            expect(result).toMatchInlineSnapshot(
                `"start fraction, a, divided by, b, end fraction"`,
            );
        });
    });

    describe("mod", () => {
        test("\\mod", () => {
            const result = renderString("\\mod{23}");
            // TODO: drop the "space"
            // TODO: collate m, o, d... we should fix this inside of KaTeX since
            // this affects the HTML and MathML output as well
            expect(result).toMatchInlineSnapshot(`"space, m, o, d, 23"`);
        });
    });

    describe("overline", () => {
        test("\\overline", () => {
            const result = renderString("\\overline{1+2}");
            expect(result).toMatchInlineSnapshot(
                `"start overline, 1, plus, 2, end overline"`,
            );
        });
    });

    describe("relations", () => {
        test("1 \\neq 2", () => {
            const result = renderString("1 \\neq 2");
            expect(result).toMatchInlineSnapshot(`"1, does not equal, 2"`);
        });

        test("1 \\ne 2", () => {
            const result = renderString("1 \\neq 2");
            expect(result).toMatchInlineSnapshot(`"1, does not equal, 2"`);
        });

        test("1 \\geq 2", () => {
            const result = renderString("1 \\geq 2");
            expect(result).toMatchInlineSnapshot(
                `"1, is greater than or equal to, 2"`,
            );
        });

        test("1 \\ge 2", () => {
            const result = renderString("1 \\ge 2");
            expect(result).toMatchInlineSnapshot(
                `"1, is greater than or equal to, 2"`,
            );
        });

        test("1 \\leq 2", () => {
            const result = renderString("1 \\leq 3");
            expect(result).toMatchInlineSnapshot(
                `"1, is less than or equal to, 3"`,
            );
        });

        test("1 \\le 2", () => {
            const result = renderString("1 \\leq 3");
            expect(result).toMatchInlineSnapshot(
                `"1, is less than or equal to, 3"`,
            );
        });
    });

    describe("rule", () => {
        test("\\rule", () => {
            const result = renderString("\\rule{1em}{1em}");
            expect(result).toMatchInlineSnapshot(`"rule"`);
        });
    });

    describe("smash", () => {
        test("1 + \\smash{2}", () => {
            const result = renderString("1 + \\smash{2}");
            expect(result).toMatchInlineSnapshot(`"1, plus, 2"`);
        });
    });

    describe("sqrt", () => {
        test("square root", () => {
            const result = renderString("\\sqrt{x + 1}");
            expect(result).toMatchInlineSnapshot(
                `"square root of, x, plus, 1, end square root"`,
            );
        });

        test("nest square root", () => {
            const result = renderString("\\sqrt{x + \\sqrt{y}}");
            // TODO: this sounds ambiguous as well... we should probably say "start square root"
            expect(result).toMatchInlineSnapshot(
                `"square root of, x, plus, square root of, y, end square root, end square root"`,
            );
        });

        test("cube root", () => {
            const result = renderString("\\sqrt[3]{x + 1}");
            expect(result).toMatchInlineSnapshot(
                `"cube root of, x, plus, 1, end cube root"`,
            );
        });

        test("nth root", () => {
            const result = renderString("\\sqrt[n]{x + 1}");
            expect(result).toMatchInlineSnapshot(
                `"root, start index, n, end index"`,
            );
        });
    });

    describe("sizing", () => {
        test("\\Huge is ignored", () => {
            const result = renderString("\\Huge{a+b}");
            expect(result).toMatchInlineSnapshot(`"a, plus, b"`);
        });

        test("\\small is ignored", () => {
            const result = renderString("\\small{a+b}");
            expect(result).toMatchInlineSnapshot(`"a, plus, b"`);
        });

        // We don't need to test all sizing commands since all style
        // nodes are treated in the same way.
    });

    describe("styling", () => {
        test("\\displaystyle is ignored", () => {
            const result = renderString("\\displaystyle{a+b}");
            expect(result).toMatchInlineSnapshot(`"a, plus, b"`);
        });

        test("\\textstyle is ignored", () => {
            const result = renderString("\\textstyle{a+b}");
            expect(result).toMatchInlineSnapshot(`"a, plus, b"`);
        });

        // We don't need to test all styling commands since all style
        // nodes are treated in the same way.
    });

    describe("text", () => {
        test("\\text", () => {
            const result = renderString("\\text{hello}");
            expect(result).toMatchInlineSnapshot(
                `"start text, h, e, l, l, o, end text"`,
            );
        });

        test("\\textbf", () => {
            const result = renderString("\\textbf{hello}");
            expect(result).toMatchInlineSnapshot(
                `"start bold text, h, e, l, l, o, end bold text"`,
            );
        });
    });

    describe("underline", () => {
        test("\\underline", () => {
            const result = renderString("\\underline{1+2}");
            expect(result).toMatchInlineSnapshot(
                `"start underline, 1, plus, 2, end underline"`,
            );
        });
    });
});
