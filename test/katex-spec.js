/* eslint max-len:0 */
/* global beforeEach: false */
/* global expect: false */
/* global it: false */
/* global describe: false */

import buildMathML from "../src/buildMathML";
import buildTree from "../src/buildTree";
import katex from "../katex";
import ParseError from "../src/ParseError";
import parseTree from "../src/parseTree";
import Options from "../src/Options";
import Settings from "../src/Settings";
import Style from "../src/Style";

const defaultSettings = new Settings({});
const defaultOptions = new Options({
    style: Style.TEXT,
    size: 5,
});

const _getBuilt = function(expr, settings) {
    const usedSettings = settings ? settings : defaultSettings;
    const parsedTree = parseTree(expr, usedSettings);
    const rootNode = buildTree(parsedTree, expr, usedSettings);

    // grab the root node of the HTML rendering
    const builtHTML = rootNode.children[1];

    // Remove the outer .katex and .katex-inner layers
    return builtHTML.children[2].children;
};

/**
 * Return the root node of the rendered HTML.
 * @param expr
 * @param settings
 * @returns {Object}
 */
const getBuilt = function(expr, settings) {
    const usedSettings = settings ? settings : defaultSettings;
    expect(expr).toBuild(usedSettings);
    return _getBuilt(expr, settings);
};

/**
 * Return the root node of the parse tree.
 * @param expr
 * @param settings
 * @returns {Object}
 */
const getParsed = function(expr, settings) {
    const usedSettings = settings ? settings : defaultSettings;

    expect(expr).toParse(usedSettings);
    return parseTree(expr, usedSettings);
};

const stripPositions = function(expr) {
    if (typeof expr !== "object" || expr === null) {
        return expr;
    }
    if (expr.lexer && typeof expr.start === "number") {
        delete expr.lexer;
        delete expr.start;
        delete expr.end;
    }
    Object.keys(expr).forEach(function(key) {
        stripPositions(expr[key]);
    });
    return expr;
};

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

        toBuild: function(actual, settings) {
            const usedSettings = settings ? settings : defaultSettings;

            const result = {
                pass: true,
                message: "'" + actual + "' succeeded in building",
            };

            expect(actual).toParse(usedSettings);

            try {
                _getBuilt(actual, settings);
            } catch (e) {
                result.pass = false;
                if (e instanceof ParseError) {
                    result.message = "'" + actual + "' failed to " +
                        "build with error: " + e.message;
                } else {
                    result.message = "'" + actual + "' failed " +
                        "building with unknown error: " + e.message;
                }
            }

            return result;
        },

        toParseLike: function(actual, expected, settings) {
            const usedSettings = settings ? settings : defaultSettings;

            const result = {
                pass: true,
                message: "Parse trees of '" + actual +
                    "' and '" + expected + "' are equivalent",
            };

            const actualTree = parseAndSetResult(actual, result,
                usedSettings);
            if (!actualTree) {
                return result;
            }
            const expectedTree = parseAndSetResult(expected, result,
                usedSettings);
            if (!expectedTree) {
                return result;
            }

            stripPositions(actualTree);
            stripPositions(expectedTree);

            if (JSON.stringify(actualTree) !== JSON.stringify(expectedTree)) {
                result.pass = false;
                result.message = "Parse trees of '" + actual +
                    "' and '" + expected + "' are not equivalent";
            }
            return result;
        },
    });
});

describe("A parser", function() {
    it("should not fail on an empty string", function() {
        expect("").toParse();
    });

    it("should ignore whitespace", function() {
        const parseA = stripPositions(getParsed("    x    y    "));
        const parseB = stripPositions(getParsed("xy"));
        expect(parseA).toEqual(parseB);
    });
});

describe("An ord parser", function() {
    const expression = "1234|/@.\"`abcdefgzABCDEFGZ";

    it("should not fail", function() {
        expect(expression).toParse();
    });

    it("should build a list of ords", function() {
        const parse = getParsed(expression);

        expect(parse).toBeTruthy();

        for (let i = 0; i < parse.length; i++) {
            const group = parse[i];
            expect(group.type).toMatch("ord");
        }
    });

    it("should parse the right number of ords", function() {
        const parse = getParsed(expression);

        expect(parse.length).toBe(expression.length);
    });
});

describe("A bin parser", function() {
    const expression = "+-*\\cdot\\pm\\div";

    it("should not fail", function() {
        expect(expression).toParse();
    });

    it("should build a list of bins", function() {
        const parse = getParsed(expression);
        expect(parse).toBeTruthy();

        for (let i = 0; i < parse.length; i++) {
            const group = parse[i];
            expect(group.type).toEqual("bin");
        }
    });
});

describe("A rel parser", function() {
    const expression = "=<>\\leq\\geq\\neq\\nleq\\ngeq\\cong";
    const notExpression = "\\not=\\not<\\not>\\not\\leq\\not\\geq\\not\\in";

    it("should not fail", function() {
        expect(expression).toParse();
        expect(notExpression).toParse();
    });

    it("should build a list of rels", function() {
        const parse = getParsed(expression);
        expect(parse).toBeTruthy();

        for (let i = 0; i < parse.length; i++) {
            const group = parse[i];
            expect(group.type).toEqual("rel");
        }
    });
});

describe("A punct parser", function() {
    const expression = ",;\\colon";

    it("should not fail", function() {
        expect(expression).toParse();
    });

    it("should build a list of puncts", function() {
        const parse = getParsed(expression);
        expect(parse).toBeTruthy();

        for (let i = 0; i < parse.length; i++) {
            const group = parse[i];
            expect(group.type).toEqual("punct");
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
        expect(parse).toBeTruthy();

        for (let i = 0; i < parse.length; i++) {
            const group = parse[i];
            expect(group.type).toEqual("open");
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
        expect(parse).toBeTruthy();

        for (let i = 0; i < parse.length; i++) {
            const group = parse[i];
            expect(group.type).toEqual("close");
        }
    });
});

describe("A \\KaTeX parser", function() {
    it("should not fail", function() {
        expect("\\KaTeX").toParse();
    });
});

describe("A subscript and superscript parser", function() {
    it("should not fail on superscripts", function() {
        expect("x^2").toParse();
    });

    it("should not fail on subscripts", function() {
        expect("x_3").toParse();
    });

    it("should not fail on both subscripts and superscripts", function() {
        expect("x^2_3").toParse();

        expect("x_2^3").toParse();
    });

    it("should not fail when there is no nucleus", function() {
        expect("^3").toParse();
        expect("_2").toParse();
        expect("^3_2").toParse();
        expect("_2^3").toParse();
    });

    it("should produce supsubs for superscript", function() {
        const parse = getParsed("x^2")[0];

        expect(parse.type).toBe("supsub");
        expect(parse.value.base).toBeDefined();
        expect(parse.value.sup).toBeDefined();
        expect(parse.value.sub).toBeUndefined();
    });

    it("should produce supsubs for subscript", function() {
        const parse = getParsed("x_3")[0];

        expect(parse.type).toBe("supsub");
        expect(parse.value.base).toBeDefined();
        expect(parse.value.sub).toBeDefined();
        expect(parse.value.sup).toBeUndefined();
    });

    it("should produce supsubs for ^_", function() {
        const parse = getParsed("x^2_3")[0];

        expect(parse.type).toBe("supsub");
        expect(parse.value.base).toBeDefined();
        expect(parse.value.sup).toBeDefined();
        expect(parse.value.sub).toBeDefined();
    });

    it("should produce supsubs for _^", function() {
        const parse = getParsed("x_3^2")[0];

        expect(parse.type).toBe("supsub");
        expect(parse.value.base).toBeDefined();
        expect(parse.value.sup).toBeDefined();
        expect(parse.value.sub).toBeDefined();
    });

    it("should produce the same thing regardless of order", function() {
        const parseA = stripPositions(getParsed("x^2_3"));
        const parseB = stripPositions(getParsed("x_3^2"));

        expect(parseA).toEqual(parseB);
    });

    it("should not parse double subscripts or superscripts", function() {
        expect("x^x^x").toNotParse();

        expect("x_x_x").toNotParse();

        expect("x_x^x_x").toNotParse();

        expect("x_x^x^x").toNotParse();

        expect("x^x_x_x").toNotParse();

        expect("x^x_x^x").toNotParse();
    });

    it("should work correctly with {}s", function() {
        expect("x^{2+3}").toParse();

        expect("x_{3-2}").toParse();

        expect("x^{2+3}_3").toParse();

        expect("x^2_{3-2}").toParse();

        expect("x^{2+3}_{3-2}").toParse();

        expect("x_{3-2}^{2+3}").toParse();

        expect("x_3^{2+3}").toParse();

        expect("x_{3-2}^2").toParse();
    });

    it("should work with nested super/subscripts", function() {
        expect("x^{x^x}").toParse();
        expect("x^{x_x}").toParse();
        expect("x_{x^x}").toParse();
        expect("x_{x_x}").toParse();
    });
});

describe("A subscript and superscript tree-builder", function() {
    it("should not fail when there is no nucleus", function() {
        expect("^3").toBuild();
        expect("_2").toBuild();
        expect("^3_2").toBuild();
        expect("_2^3").toBuild();
    });
});

describe("A parser with limit controls", function() {
    it("should fail when the limit control is not preceded by an op node", function() {
        expect("3\\nolimits_2^2").toNotParse();
        expect("\\sqrt\\limits_2^2").toNotParse();
        expect("45 +\\nolimits 45").toNotParse();
    });

    it("should parse when the limit control directly follows an op node", function() {
        expect("\\int\\limits_2^2 3").toParse();
        expect("\\sum\\nolimits_3^4 4").toParse();
    });

    it("should parse when the limit control is in the sup/sub area of an op node", function() {
        expect("\\int_2^2\\limits").toParse();
        expect("\\int^2\\nolimits_2").toParse();
        expect("\\int_2\\limits^2").toParse();
    });

    it("should allow multiple limit controls in the sup/sub area of an op node", function() {
        expect("\\int_2\\nolimits^2\\limits 3").toParse();
        expect("\\int\\nolimits\\limits_2^2").toParse();
        expect("\\int\\limits\\limits\\limits_2^2").toParse();
    });

    it("should have the rightmost limit control determine the limits property " +
        "of the preceding op node", function() {

        let parsedInput = getParsed("\\int\\nolimits\\limits_2^2");
        expect(parsedInput[0].value.base.value.limits).toBe(true);

        parsedInput = getParsed("\\int\\limits_2\\nolimits^2");
        expect(parsedInput[0].value.base.value.limits).toBe(false);
    });
});

describe("A group parser", function() {
    it("should not fail", function() {
        expect("{xy}").toParse();
    });

    it("should produce a single ord", function() {
        const parse = getParsed("{xy}");

        expect(parse.length).toBe(1);

        const ord = parse[0];

        expect(ord.type).toMatch("ord");
        expect(ord.value).toBeTruthy();
    });
});

describe("An implicit group parser", function() {
    it("should not fail", function() {
        expect("\\Large x").toParse();
        expect("abc {abc \\Large xyz} abc").toParse();
    });

    it("should produce a single object", function() {
        const parse = getParsed("\\Large abc");

        expect(parse.length).toBe(1);

        const sizing = parse[0];

        expect(sizing.type).toEqual("sizing");
        expect(sizing.value).toBeTruthy();
    });

    it("should apply only after the function", function() {
        const parse = getParsed("a \\Large abc");

        expect(parse.length).toBe(2);

        const sizing = parse[1];

        expect(sizing.type).toEqual("sizing");
        expect(sizing.value.value.length).toBe(3);
    });

    it("should stop at the ends of groups", function() {
        const parse = getParsed("a { b \\Large c } d");

        const group = parse[1];
        const sizing = group.value[1];

        expect(sizing.type).toEqual("sizing");
        expect(sizing.value.value.length).toBe(1);
    });
});

describe("A function parser", function() {
    it("should parse no argument functions", function() {
        expect("\\div").toParse();
    });

    it("should parse 1 argument functions", function() {
        expect("\\blue x").toParse();
    });

    it("should parse 2 argument functions", function() {
        expect("\\frac 1 2").toParse();
    });

    it("should not parse 1 argument functions with no arguments", function() {
        expect("\\blue").toNotParse();
    });

    it("should not parse 2 argument functions with 0 or 1 arguments", function() {
        expect("\\frac").toNotParse();

        expect("\\frac 1").toNotParse();
    });

    it("should not parse a function with text right after it", function() {
        expect("\\redx").toNotParse();
    });

    it("should parse a function with a number right after it", function() {
        expect("\\frac12").toParse();
    });

    it("should parse some functions with text right after it", function() {
        expect("\\;x").toParse();
    });
});

describe("A frac parser", function() {
    const expression = "\\frac{x}{y}";
    const dfracExpression = "\\dfrac{x}{y}";
    const tfracExpression = "\\tfrac{x}{y}";

    it("should not fail", function() {
        expect(expression).toParse();
    });

    it("should produce a frac", function() {
        const parse = getParsed(expression)[0];

        expect(parse.type).toEqual("genfrac");
        expect(parse.value.numer).toBeDefined();
        expect(parse.value.denom).toBeDefined();
    });

    it("should also parse dfrac and tfrac", function() {
        expect(dfracExpression).toParse();

        expect(tfracExpression).toParse();
    });

    it("should parse dfrac and tfrac as fracs", function() {
        const dfracParse = getParsed(dfracExpression)[0];

        expect(dfracParse.type).toEqual("genfrac");
        expect(dfracParse.value.numer).toBeDefined();
        expect(dfracParse.value.denom).toBeDefined();

        const tfracParse = getParsed(tfracExpression)[0];

        expect(tfracParse.type).toEqual("genfrac");
        expect(tfracParse.value.numer).toBeDefined();
        expect(tfracParse.value.denom).toBeDefined();
    });

    it("should parse atop", function() {
        const parse = getParsed("x \\atop y")[0];

        expect(parse.type).toEqual("genfrac");
        expect(parse.value.numer).toBeDefined();
        expect(parse.value.denom).toBeDefined();
        expect(parse.value.hasBarLine).toEqual(false);
    });
});

describe("An over parser", function() {
    const simpleOver = "1 \\over x";
    const complexOver = "1+2i \\over 3+4i";

    it("should not fail", function() {
        expect(simpleOver).toParse();
        expect(complexOver).toParse();
    });

    it("should produce a frac", function() {
        let parse;

        parse = getParsed(simpleOver)[0];

        expect(parse.type).toEqual("genfrac");
        expect(parse.value.numer).toBeDefined();
        expect(parse.value.denom).toBeDefined();

        parse = getParsed(complexOver)[0];

        expect(parse.type).toEqual("genfrac");
        expect(parse.value.numer).toBeDefined();
        expect(parse.value.denom).toBeDefined();
    });

    it("should create a numerator from the atoms before \\over", function() {
        const parse = getParsed(complexOver)[0];

        const numer = parse.value.numer;
        expect(numer.value.length).toEqual(4);
    });

    it("should create a demonimator from the atoms after \\over", function() {
        const parse = getParsed(complexOver)[0];

        const denom = parse.value.numer;
        expect(denom.value.length).toEqual(4);
    });

    it("should handle empty numerators", function() {
        const emptyNumerator = "\\over x";
        const parse = getParsed(emptyNumerator)[0];
        expect(parse.type).toEqual("genfrac");
        expect(parse.value.numer).toBeDefined();
        expect(parse.value.denom).toBeDefined();
    });

    it("should handle empty denominators", function() {
        const emptyDenominator = "1 \\over";
        const parse = getParsed(emptyDenominator)[0];
        expect(parse.type).toEqual("genfrac");
        expect(parse.value.numer).toBeDefined();
        expect(parse.value.denom).toBeDefined();
    });

    it("should handle \\displaystyle correctly", function() {
        const displaystyleExpression = "\\displaystyle 1 \\over 2";
        const parse = getParsed(displaystyleExpression)[0];
        expect(parse.type).toEqual("genfrac");
        expect(parse.value.numer.value[0].type).toEqual("styling");
        expect(parse.value.denom).toBeDefined();
    });

    it("should handle \\textstyle correctly", function() {
        expect("\\textstyle 1 \\over 2")
            .toParseLike("\\frac{\\textstyle 1}{2}");
        expect("{\\textstyle 1} \\over 2")
            .toParseLike("\\frac{\\textstyle 1}{2}");
    });

    it("should handle nested factions", function() {
        const nestedOverExpression = "{1 \\over 2} \\over 3";
        const parse = getParsed(nestedOverExpression)[0];
        expect(parse.type).toEqual("genfrac");
        expect(parse.value.numer.value[0].type).toEqual("genfrac");
        expect(parse.value.numer.value[0].value.numer.value[0].value).toEqual("1");
        expect(parse.value.numer.value[0].value.denom.value[0].value).toEqual("2");
        expect(parse.value.denom).toBeDefined();
        expect(parse.value.denom.value[0].value).toEqual("3");
    });

    it("should fail with multiple overs in the same group", function() {
        const badMultipleOvers = "1 \\over 2 + 3 \\over 4";
        expect(badMultipleOvers).toNotParse();

        const badOverChoose = "1 \\over 2 \\choose 3";
        expect(badOverChoose).toNotParse();
    });
});

describe("A sizing parser", function() {
    const sizeExpression = "\\Huge{x}\\small{x}";

    it("should not fail", function() {
        expect(sizeExpression).toParse();
    });

    it("should produce a sizing node", function() {
        const parse = getParsed(sizeExpression)[0];

        expect(parse.type).toEqual("sizing");
        expect(parse.value).toBeDefined();
    });
});

describe("A text parser", function() {
    const textExpression = "\\text{a b}";
    const noBraceTextExpression = "\\text x";
    const nestedTextExpression =
        "\\text{a {b} \\blue{c} \\textcolor{#fff}{x} \\llap{x}}";
    const spaceTextExpression = "\\text{  a \\ }";
    const leadingSpaceTextExpression = "\\text {moo}";
    const badTextExpression = "\\text{a b%}";
    const badFunctionExpression = "\\text{\\sqrt{x}}";
    const mathTokenAfterText = "\\text{sin}^2";
    const textWithEmbeddedMath = "\\text{graph: $y = mx + b$}";

    it("should not fail", function() {
        expect(textExpression).toParse();
    });

    it("should produce a text", function() {
        const parse = getParsed(textExpression)[0];

        expect(parse.type).toEqual("text");
        expect(parse.value).toBeDefined();
    });

    it("should produce textords instead of mathords", function() {
        const parse = getParsed(textExpression)[0];
        const group = parse.value.body;

        expect(group[0].type).toEqual("textord");
    });

    it("should not parse bad text", function() {
        expect(badTextExpression).toNotParse();
    });

    it("should not parse bad functions inside text", function() {
        expect(badFunctionExpression).toNotParse();
    });

    it("should parse text with no braces around it", function() {
        expect(noBraceTextExpression).toParse();
    });

    it("should parse nested expressions", function() {
        expect(nestedTextExpression).toParse();
    });

    it("should contract spaces", function() {
        const parse = getParsed(spaceTextExpression)[0];
        const group = parse.value.body;

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
        expect(parse.value.body.length).toBe(3);
        expect(
            parse.value.body.map(function(n) { return n.value; }).join("")
        ).toBe("moo");
    });

    it("should parse math within text group", function() {
        expect(textWithEmbeddedMath).toParse();
    });

    it("should omit spaces after commands", function() {
        expect("\\text{\\textellipsis !}")
            .toParseLike("\\text{\\textellipsis!}");
    });
});

describe("A color parser", function() {
    const colorExpression = "\\blue{x}";
    const newColorExpression = "\\redA{x}";
    const customColorExpression1 = "\\textcolor{#fA6}{x}";
    const customColorExpression2 = "\\textcolor{#fA6fA6}{x}";
    const badCustomColorExpression1 = "\\textcolor{bad-color}{x}";
    const badCustomColorExpression2 = "\\textcolor{#fA6f}{x}";
    const badCustomColorExpression3 = "\\textcolor{#gA6}{x}";
    const oldColorExpression = "\\color{#fA6}xy";

    it("should not fail", function() {
        expect(colorExpression).toParse();
    });

    it("should build a color node", function() {
        const parse = getParsed(colorExpression)[0];

        expect(parse.type).toEqual("color");
        expect(parse.value.color).toBeDefined();
        expect(parse.value.value).toBeDefined();
    });

    it("should parse a custom color", function() {
        expect(customColorExpression1).toParse();
        expect(customColorExpression2).toParse();
    });

    it("should correctly extract the custom color", function() {
        const parse1 = getParsed(customColorExpression1)[0];
        const parse2 = getParsed(customColorExpression2)[0];

        expect(parse1.value.color).toEqual("#fA6");
        expect(parse2.value.color).toEqual("#fA6fA6");
    });

    it("should not parse a bad custom color", function() {
        expect(badCustomColorExpression1).toNotParse();
        expect(badCustomColorExpression2).toNotParse();
        expect(badCustomColorExpression3).toNotParse();
    });

    it("should parse new colors from the branding guide", function() {
        expect(newColorExpression).toParse();
    });

    it("should have correct greediness", function() {
        expect("\\textcolor{red}a").toParse();
        expect("\\textcolor{red}{\\text{a}}").toParse();
        expect("\\textcolor{red}\\text{a}").toNotParse();
        expect("\\textcolor{red}\\frac12").toNotParse();
    });

    it("should use one-argument \\color by default", function() {
        expect(oldColorExpression).toParseLike("\\textcolor{#fA6}{xy}");
    });

    it("should use one-argument \\color if requested", function() {
        expect(oldColorExpression).toParseLike("\\textcolor{#fA6}{xy}", {
            colorIsTextColor: false,
        });
    });

    it("should use two-argument \\color if requested", function() {
        expect(oldColorExpression).toParseLike("\\textcolor{#fA6}{x}y", {
            colorIsTextColor: true,
        });
    });
});

describe("A tie parser", function() {
    const mathTie = "a~b";
    const textTie = "\\text{a~ b}";

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
        const parse = text.value.body;

        expect(parse[1].type).toEqual("spacing");
    });

    it("should not contract with spaces in text mode", function() {
        const text = getParsed(textTie)[0];
        const parse = text.value.body;

        expect(parse[2].type).toEqual("spacing");
    });
});

describe("A delimiter sizing parser", function() {
    const normalDelim = "\\bigl |";
    const notDelim = "\\bigl x";
    const bigDelim = "\\Biggr \\langle";

    it("should parse normal delimiters", function() {
        expect(normalDelim).toParse();
        expect(bigDelim).toParse();
    });

    it("should not parse not-delimiters", function() {
        expect(notDelim).toNotParse();
    });

    it("should produce a delimsizing", function() {
        const parse = getParsed(normalDelim)[0];

        expect(parse.type).toEqual("delimsizing");
    });

    it("should produce the correct direction delimiter", function() {
        const leftParse = getParsed(normalDelim)[0];
        const rightParse = getParsed(bigDelim)[0];

        expect(leftParse.value.mclass).toEqual("mopen");
        expect(rightParse.value.mclass).toEqual("mclose");
    });

    it("should parse the correct size delimiter", function() {
        const smallParse = getParsed(normalDelim)[0];
        const bigParse = getParsed(bigDelim)[0];

        expect(smallParse.value.size).toEqual(1);
        expect(bigParse.value.size).toEqual(4);
    });
});

describe("An overline parser", function() {
    const overline = "\\overline{x}";

    it("should not fail", function() {
        expect(overline).toParse();
    });

    it("should produce an overline", function() {
        const parse = getParsed(overline)[0];

        expect(parse.type).toEqual("overline");
    });
});

describe("A rule parser", function() {
    const emRule = "\\rule{1em}{2em}";
    const exRule = "\\rule{1ex}{2em}";
    const badUnitRule = "\\rule{1au}{2em}";
    const noNumberRule = "\\rule{1em}{em}";
    const incompleteRule = "\\rule{1em}";
    const hardNumberRule = "\\rule{   01.24ex}{2.450   em   }";

    it("should not fail", function() {
        expect(emRule).toParse();
        expect(exRule).toParse();
    });

    it("should not parse invalid units", function() {
        expect(badUnitRule).toNotParse();

        expect(noNumberRule).toNotParse();
    });

    it("should not parse incomplete rules", function() {
        expect(incompleteRule).toNotParse();
    });

    it("should produce a rule", function() {
        const parse = getParsed(emRule)[0];

        expect(parse.type).toEqual("rule");
    });

    it("should list the correct units", function() {
        const emParse = getParsed(emRule)[0];
        const exParse = getParsed(exRule)[0];

        expect(emParse.value.width.unit).toEqual("em");
        expect(emParse.value.height.unit).toEqual("em");

        expect(exParse.value.width.unit).toEqual("ex");
        expect(exParse.value.height.unit).toEqual("em");
    });

    it("should parse the number correctly", function() {
        const hardNumberParse = getParsed(hardNumberRule)[0];

        expect(hardNumberParse.value.width.number).toBeCloseTo(1.24);
        expect(hardNumberParse.value.height.number).toBeCloseTo(2.45);
    });

    it("should parse negative sizes", function() {
        const parse = getParsed("\\rule{-1em}{- 0.2em}")[0];

        expect(parse.value.width.number).toBeCloseTo(-1);
        expect(parse.value.height.number).toBeCloseTo(-0.2);
    });
});

describe("A kern parser", function() {
    const emKern = "\\kern{1em}";
    const exKern = "\\kern{1ex}";
    const muKern = "\\kern{1mu}";
    const abKern = "a\\kern{1em}b";
    const badUnitRule = "\\kern{1au}";
    const noNumberRule = "\\kern{em}";

    it("should list the correct units", function() {
        const emParse = getParsed(emKern)[0];
        const exParse = getParsed(exKern)[0];
        const muParse = getParsed(muKern)[0];
        const abParse = getParsed(abKern)[1];

        expect(emParse.value.dimension.unit).toEqual("em");
        expect(exParse.value.dimension.unit).toEqual("ex");
        expect(muParse.value.dimension.unit).toEqual("mu");
        expect(abParse.value.dimension.unit).toEqual("em");
    });

    it("should not parse invalid units", function() {
        expect(badUnitRule).toNotParse();
        expect(noNumberRule).toNotParse();
    });

    it("should parse negative sizes", function() {
        const parse = getParsed("\\kern{-1em}")[0];
        expect(parse.value.dimension.number).toBeCloseTo(-1);
    });

    it("should parse positive sizes", function() {
        const parse = getParsed("\\kern{+1em}")[0];
        expect(parse.value.dimension.number).toBeCloseTo(1);
    });
});

describe("A non-braced kern parser", function() {
    const emKern = "\\kern1em";
    const exKern = "\\kern 1 ex";
    const muKern = "\\kern 1mu";
    const abKern1 = "a\\mkern1mub";
    const abKern2 = "a\\kern-1mub";
    const abKern3 = "a\\kern-1mu b";
    const badUnitRule = "\\kern1au";
    const noNumberRule = "\\kern em";

    it("should list the correct units", function() {
        const emParse = getParsed(emKern)[0];
        const exParse = getParsed(exKern)[0];
        const muParse = getParsed(muKern)[0];
        const abParse1 = getParsed(abKern1)[1];
        const abParse2 = getParsed(abKern2)[1];
        const abParse3 = getParsed(abKern3)[1];

        expect(emParse.value.dimension.unit).toEqual("em");
        expect(exParse.value.dimension.unit).toEqual("ex");
        expect(muParse.value.dimension.unit).toEqual("mu");
        expect(abParse1.value.dimension.unit).toEqual("mu");
        expect(abParse2.value.dimension.unit).toEqual("mu");
        expect(abParse3.value.dimension.unit).toEqual("mu");
    });

    it("should parse elements on either side of a kern", function() {
        const abParse1 = getParsed(abKern1);
        const abParse2 = getParsed(abKern2);
        const abParse3 = getParsed(abKern3);

        expect(abParse1.length).toEqual(3);
        expect(abParse1[0].value).toEqual("a");
        expect(abParse1[2].value).toEqual("b");
        expect(abParse2.length).toEqual(3);
        expect(abParse2[0].value).toEqual("a");
        expect(abParse2[2].value).toEqual("b");
        expect(abParse3.length).toEqual(3);
        expect(abParse3[0].value).toEqual("a");
        expect(abParse3[2].value).toEqual("b");
    });

    it("should not parse invalid units", function() {
        expect(badUnitRule).toNotParse();
        expect(noNumberRule).toNotParse();
    });

    it("should parse negative sizes", function() {
        const parse = getParsed("\\kern-1em")[0];
        expect(parse.value.dimension.number).toBeCloseTo(-1);
    });

    it("should parse positive sizes", function() {
        const parse = getParsed("\\kern+1em")[0];
        expect(parse.value.dimension.number).toBeCloseTo(1);
    });

    it("should handle whitespace", function() {
        const abKern = "a\\kern\t-\r1  \n mu\nb";
        const abParse = getParsed(abKern);

        expect(abParse.length).toEqual(3);
        expect(abParse[0].value).toEqual("a");
        expect(abParse[1].value.dimension.unit).toEqual("mu");
        expect(abParse[2].value).toEqual("b");
    });
});

describe("A left/right parser", function() {
    const normalLeftRight = "\\left( \\dfrac{x}{y} \\right)";
    const emptyRight = "\\left( \\dfrac{x}{y} \\right.";

    it("should not fail", function() {
        expect(normalLeftRight).toParse();
    });

    it("should produce a leftright", function() {
        const parse = getParsed(normalLeftRight)[0];

        expect(parse.type).toEqual("leftright");
        expect(parse.value.left).toEqual("(");
        expect(parse.value.right).toEqual(")");
    });

    it("should error when it is mismatched", function() {
        const unmatchedLeft = "\\left( \\dfrac{x}{y}";
        const unmatchedRight = "\\dfrac{x}{y} \\right)";

        expect(unmatchedLeft).toNotParse();

        expect(unmatchedRight).toNotParse();
    });

    it("should error when braces are mismatched", function() {
        const unmatched = "{ \\left( \\dfrac{x}{y} } \\right)";
        expect(unmatched).toNotParse();
    });

    it("should error when non-delimiters are provided", function() {
        const nonDelimiter = "\\left$ \\dfrac{x}{y} \\right)";
        expect(nonDelimiter).toNotParse();
    });

    it("should parse the empty '.' delimiter", function() {
        expect(emptyRight).toParse();
    });

    it("should parse the '.' delimiter with normal sizes", function() {
        const normalEmpty = "\\Bigl .";
        expect(normalEmpty).toParse();
    });

    it("should handle \\middle", function() {
        const normalMiddle = "\\left( \\dfrac{x}{y} \\middle| \\dfrac{y}{z} \\right)";
        expect(normalMiddle).toParse();
    });

    it("should handle multiple \\middles", function() {
        const multiMiddle = "\\left( \\dfrac{x}{y} \\middle| \\dfrac{y}{z} \\middle/ \\dfrac{z}{q} \\right)";
        expect(multiMiddle).toParse();
    });

    it("should handle nested \\middles", function() {
        const nestedMiddle = "\\left( a^2 \\middle| \\left( b \\middle/ c \\right) \\right)";
        expect(nestedMiddle).toParse();
    });

    it("should error when \\middle is not in \\left...\\right", function() {
        const unmatchedMiddle = "(\\middle|\\dfrac{x}{y})";
        expect(unmatchedMiddle).toNotParse();
    });
});

describe("A begin/end parser", function() {

    it("should parse a simple environment", function() {
        expect("\\begin{matrix}a&b\\\\c&d\\end{matrix}").toParse();
    });

    it("should parse an environment with argument", function() {
        expect("\\begin{array}{cc}a&b\\\\c&d\\end{array}").toParse();
    });

    it("should error when name is mismatched", function() {
        expect("\\begin{matrix}a&b\\\\c&d\\end{pmatrix}").toNotParse();
    });

    it("should error when commands are mismatched", function() {
        expect("\\begin{matrix}a&b\\\\c&d\\right{pmatrix}").toNotParse();
    });

    it("should error when end is missing", function() {
        expect("\\begin{matrix}a&b\\\\c&d").toNotParse();
    });

    it("should error when braces are mismatched", function() {
        expect("{\\begin{matrix}a&b\\\\c&d}\\end{matrix}").toNotParse();
    });

    it("should cooperate with infix notation", function() {
        expect("\\begin{matrix}0&1\\over2&3\\\\4&5&6\\end{matrix}").toParse();
    });

    it("should nest", function() {
        const m1 = "\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}";
        const m2 = "\\begin{array}{rl}" + m1 + "&0\\\\0&" + m1 + "\\end{array}";
        expect(m2).toParse();
    });

    it("should allow \\cr as a line terminator", function() {
        expect("\\begin{matrix}a&b\\cr c&d\\end{matrix}").toParse();
    });
});

describe("A sqrt parser", function() {
    const sqrt = "\\sqrt{x}";
    const missingGroup = "\\sqrt";

    it("should parse square roots", function() {
        expect(sqrt).toParse();
    });

    it("should error when there is no group", function() {
        expect(missingGroup).toNotParse();
    });

    it("should produce sqrts", function() {
        const parse = getParsed(sqrt)[0];

        expect(parse.type).toEqual("sqrt");
    });
});

describe("A TeX-compliant parser", function() {
    it("should work", function() {
        expect("\\frac 2 3").toParse();
    });

    it("should fail if there are not enough arguments", function() {
        const missingGroups = [
            "\\frac{x}",
            "\\textcolor{#fff}",
            "\\rule{1em}",
            "\\llap",
            "\\bigl",
            "\\text",
        ];

        for (let i = 0; i < missingGroups.length; i++) {
            expect(missingGroups[i]).toNotParse();
        }
    });

    it("should fail when there are missing sup/subscripts", function() {
        expect("x^").toNotParse();
        expect("x_").toNotParse();
    });

    it("should fail when arguments require arguments", function() {
        const badArguments = [
            "\\frac \\frac x y z",
            "\\frac x \\frac y z",
            "\\frac \\sqrt x y",
            "\\frac x \\sqrt y",
            "\\frac \\mathllap x y",
            "\\frac x \\mathllap y",
            // This actually doesn't work in real TeX, but it is suprisingly
            // hard to get this to correctly work. So, we take hit of very small
            // amounts of non-compatiblity in order for the rest of the tests to
            // work
            // "\\llap \\frac x y",
            "\\mathllap \\mathllap x",
            "\\sqrt \\mathllap x",
        ];

        for (let i = 0; i < badArguments.length; i++) {
            expect(badArguments[i]).toNotParse();
        }
    });

    it("should work when the arguments have braces", function() {
        const goodArguments = [
            "\\frac {\\frac x y} z",
            "\\frac x {\\frac y z}",
            "\\frac {\\sqrt x} y",
            "\\frac x {\\sqrt y}",
            "\\frac {\\mathllap x} y",
            "\\frac x {\\mathllap y}",
            "\\mathllap {\\frac x y}",
            "\\mathllap {\\mathllap x}",
            "\\sqrt {\\mathllap x}",
        ];

        for (let i = 0; i < goodArguments.length; i++) {
            expect(goodArguments[i]).toParse();
        }
    });

    it("should fail when sup/subscripts require arguments", function() {
        const badSupSubscripts = [
            "x^\\sqrt x",
            "x^\\mathllap x",
            "x_\\sqrt x",
            "x_\\mathllap x",
        ];

        for (let i = 0; i < badSupSubscripts.length; i++) {
            expect(badSupSubscripts[i]).toNotParse();
        }
    });

    it("should work when sup/subscripts arguments have braces", function() {
        const goodSupSubscripts = [
            "x^{\\sqrt x}",
            "x^{\\mathllap x}",
            "x_{\\sqrt x}",
            "x_{\\mathllap x}",
        ];

        for (let i = 0; i < goodSupSubscripts.length; i++) {
            expect(goodSupSubscripts[i]).toParse();
        }
    });

    it("should parse multiple primes correctly", function() {
        expect("x''''").toParse();
        expect("x_2''").toParse();
        expect("x''_2").toParse();
    });

    it("should fail when sup/subscripts are interspersed with arguments", function() {
        expect("\\sqrt^23").toNotParse();
        expect("\\frac^234").toNotParse();
        expect("\\frac2^34").toNotParse();
    });

    it("should succeed when sup/subscripts come after whole functions", function() {
        expect("\\sqrt2^3").toParse();
        expect("\\frac23^4").toParse();
    });

    it("should succeed with a sqrt around a text/frac", function() {
        expect("\\sqrt \\frac x y").toParse();
        expect("\\sqrt \\text x").toParse();
        expect("x^\\frac x y").toParse();
        expect("x_\\text x").toParse();
    });

    it("should fail when arguments are \\left", function() {
        const badLeftArguments = [
            "\\frac \\left( x \\right) y",
            "\\frac x \\left( y \\right)",
            "\\mathllap \\left( x \\right)",
            "\\sqrt \\left( x \\right)",
            "x^\\left( x \\right)",
        ];

        for (let i = 0; i < badLeftArguments.length; i++) {
            expect(badLeftArguments[i]).toNotParse();
        }
    });

    it("should succeed when there are braces around the \\left/\\right", function() {
        const goodLeftArguments = [
            "\\frac {\\left( x \\right)} y",
            "\\frac x {\\left( y \\right)}",
            "\\mathllap {\\left( x \\right)}",
            "\\sqrt {\\left( x \\right)}",
            "x^{\\left( x \\right)}",
        ];

        for (let i = 0; i < goodLeftArguments.length; i++) {
            expect(goodLeftArguments[i]).toParse();
        }
    });
});

describe("A style change parser", function() {
    it("should not fail", function() {
        expect("\\displaystyle x").toParse();
        expect("\\textstyle x").toParse();
        expect("\\scriptstyle x").toParse();
        expect("\\scriptscriptstyle x").toParse();
    });

    it("should produce the correct style", function() {
        const displayParse = getParsed("\\displaystyle x")[0];
        expect(displayParse.value.style).toEqual("display");

        const scriptscriptParse = getParsed("\\scriptscriptstyle x")[0];
        expect(scriptscriptParse.value.style).toEqual("scriptscript");
    });

    it("should only change the style within its group", function() {
        const text = "a b { c d \\displaystyle e f } g h";
        const parse = getParsed(text);

        const displayNode = parse[2].value[2];

        expect(displayNode.type).toEqual("styling");

        const displayBody = displayNode.value.value;

        expect(displayBody.length).toEqual(2);
        expect(displayBody[0].value).toEqual("e");
    });
});

describe("A font parser", function() {
    it("should parse \\mathrm, \\mathbb, and \\mathit", function() {
        expect("\\mathrm x").toParse();
        expect("\\mathbb x").toParse();
        expect("\\mathit x").toParse();
        expect("\\mathrm {x + 1}").toParse();
        expect("\\mathbb {x + 1}").toParse();
        expect("\\mathit {x + 1}").toParse();
    });

    it("should parse \\mathcal and \\mathfrak", function() {
        expect("\\mathcal{ABC123}").toParse();
        expect("\\mathfrak{abcABC123}").toParse();
    });

    it("should produce the correct fonts", function() {
        const mathbbParse = getParsed("\\mathbb x")[0];
        expect(mathbbParse.value.font).toEqual("mathbb");
        expect(mathbbParse.value.type).toEqual("font");

        const mathrmParse = getParsed("\\mathrm x")[0];
        expect(mathrmParse.value.font).toEqual("mathrm");
        expect(mathrmParse.value.type).toEqual("font");

        const mathitParse = getParsed("\\mathit x")[0];
        expect(mathitParse.value.font).toEqual("mathit");
        expect(mathitParse.value.type).toEqual("font");

        const mathcalParse = getParsed("\\mathcal C")[0];
        expect(mathcalParse.value.font).toEqual("mathcal");
        expect(mathcalParse.value.type).toEqual("font");

        const mathfrakParse = getParsed("\\mathfrak C")[0];
        expect(mathfrakParse.value.font).toEqual("mathfrak");
        expect(mathfrakParse.value.type).toEqual("font");
    });

    it("should parse nested font commands", function() {
        const nestedParse = getParsed("\\mathbb{R \\neq \\mathrm{R}}")[0];
        expect(nestedParse.value.font).toEqual("mathbb");
        expect(nestedParse.value.type).toEqual("font");

        expect(nestedParse.value.body.value.length).toEqual(3);
        const bbBody = nestedParse.value.body.value;
        expect(bbBody[0].type).toEqual("mathord");
        expect(bbBody[1].type).toEqual("rel");
        expect(bbBody[2].type).toEqual("font");
        expect(bbBody[2].value.font).toEqual("mathrm");
        expect(bbBody[2].value.type).toEqual("font");
    });

    it("should work with \\textcolor", function() {
        const colorMathbbParse = getParsed("\\textcolor{blue}{\\mathbb R}")[0];
        expect(colorMathbbParse.value.type).toEqual("color");
        expect(colorMathbbParse.value.color).toEqual("blue");
        const body = colorMathbbParse.value.value;
        expect(body.length).toEqual(1);
        expect(body[0].value.type).toEqual("font");
        expect(body[0].value.font).toEqual("mathbb");
    });

    it("should not parse a series of font commands", function() {
        expect("\\mathbb \\mathrm R").toNotParse();
    });

    it("should nest fonts correctly", function() {
        const bf = getParsed("\\mathbf{a\\mathrm{b}c}")[0];
        expect(bf.value.type).toEqual("font");
        expect(bf.value.font).toEqual("mathbf");
        expect(bf.value.body.value.length).toEqual(3);
        expect(bf.value.body.value[0].value).toEqual("a");
        expect(bf.value.body.value[1].value.type).toEqual("font");
        expect(bf.value.body.value[1].value.font).toEqual("mathrm");
        expect(bf.value.body.value[2].value).toEqual("c");
    });

    it("should have the correct greediness", function() {
        expect("e^\\mathbf{x}").toParse();
    });
});

describe("An HTML font tree-builder", function() {
    it("should render \\mathbb{R} with the correct font", function() {
        const markup = katex.renderToString("\\mathbb{R}");
        expect(markup).toContain("<span class=\"mord mathbb\">R</span>");
    });

    it("should render \\mathrm{R} with the correct font", function() {
        const markup = katex.renderToString("\\mathrm{R}");
        expect(markup).toContain("<span class=\"mord mathrm\">R</span>");
    });

    it("should render \\mathcal{R} with the correct font", function() {
        const markup = katex.renderToString("\\mathcal{R}");
        expect(markup).toContain("<span class=\"mord mathcal\">R</span>");
    });

    it("should render \\mathfrak{R} with the correct font", function() {
        const markup = katex.renderToString("\\mathfrak{R}");
        expect(markup).toContain("<span class=\"mord mathfrak\">R</span>");
    });

    it("should render \\text{R} with the correct font", function() {
        const markup = katex.renderToString("\\text{R}");
        expect(markup).toContain("<span class=\"mord mathrm\">R</span>");
    });

    it("should render \\textit{R} with the correct font", function() {
        const markup = katex.renderToString("\\textit{R}");
        expect(markup).toContain("<span class=\"mord textit\">R</span>");
    });

    it("should render \\text{\\textit{R}} with the correct font", function() {
        const markup = katex.renderToString("\\text{\\textit{R}}");
        expect(markup).toContain("<span class=\"mord textit\">R</span>");
    });

    it("should render \\text{R\\textit{S}T} with the correct fonts", function() {
        const markup = katex.renderToString("\\text{R\\textit{S}T}");
        expect(markup).toContain("<span class=\"mord mathrm\">R</span>");
        expect(markup).toContain("<span class=\"mord textit\">S</span>");
        expect(markup).toContain("<span class=\"mord mathrm\">T</span>");
    });

    it("should render \\textbf{R} with the correct font", function() {
        const markup = katex.renderToString("\\textbf{R}");
        expect(markup).toContain("<span class=\"mord mathbf\">R</span>");
    });

    it("should render \\textsf{R} with the correct font", function() {
        const markup = katex.renderToString("\\textsf{R}");
        expect(markup).toContain("<span class=\"mord mathsf\">R</span>");
    });

    it("should render \\texttt{R} with the correct font", function() {
        const markup = katex.renderToString("\\texttt{R}");
        expect(markup).toContain("<span class=\"mord mathtt\">R</span>");
    });

    it("should render a combination of font and color changes", function() {
        let markup = katex.renderToString("\\textcolor{blue}{\\mathbb R}");
        let span = "<span class=\"mord mathbb\" style=\"color:blue;\">R</span>";
        expect(markup).toContain(span);

        markup = katex.renderToString("\\mathbb{\\textcolor{blue}{R}}");
        span = "<span class=\"mord mathbb\" style=\"color:blue;\">R</span>";
        expect(markup).toContain(span);
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
            katex.renderToString("\\sqrt{123}");
        }).not.toThrowError(TypeError);
        expect(function() {
            katex.renderToString(new String("\\sqrt{123}"));
        }).not.toThrowError(TypeError);
    });
});


describe("A MathML font tree-builder", function() {
    const contents = "Ax2k\\omega\\Omega\\imath+";

    it("should render " + contents + " with the correct mathvariants", function() {
        const tree = getParsed(contents);
        const markup = buildMathML(tree, contents, defaultOptions).toMarkup();
        expect(markup).toContain("<mi>A</mi>");
        expect(markup).toContain("<mi>x</mi>");
        expect(markup).toContain("<mn>2</mn>");
        expect(markup).toContain("<mi>\u03c9</mi>");   // \omega
        expect(markup).toContain("<mi mathvariant=\"normal\">\u03A9</mi>");   // \Omega
        expect(markup).toContain("<mi>\u0131</mi>");   // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathbb{" + contents + "} with the correct mathvariants", function() {
        const tex = "\\mathbb{" + contents + "}";
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi mathvariant=\"double-struck\">A</mi>");
        expect(markup).toContain("<mi>x</mi>");
        expect(markup).toContain("<mn>2</mn>");
        expect(markup).toContain("<mi>\u03c9</mi>");                        // \omega
        expect(markup).toContain("<mi mathvariant=\"normal\">\u03A9</mi>"); // \Omega
        expect(markup).toContain("<mi>\u0131</mi>");                        // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathrm{" + contents + "} with the correct mathvariants", function() {
        const tex = "\\mathrm{" + contents + "}";
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi mathvariant=\"normal\">A</mi>");
        expect(markup).toContain("<mi mathvariant=\"normal\">x</mi>");
        expect(markup).toContain("<mn>2</mn>");
        expect(markup).toContain("<mi>\u03c9</mi>");   // \omega
        expect(markup).toContain("<mi mathvariant=\"normal\">\u03A9</mi>");   // \Omega
        expect(markup).toContain("<mi>\u0131</mi>");   // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathit{" + contents + "} with the correct mathvariants", function() {
        const tex = "\\mathit{" + contents + "}";
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

    it("should render \\mathbf{" + contents + "} with the correct mathvariants", function() {
        const tex = "\\mathbf{" + contents + "}";
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi mathvariant=\"bold\">A</mi>");
        expect(markup).toContain("<mi mathvariant=\"bold\">x</mi>");
        expect(markup).toContain("<mn mathvariant=\"bold\">2</mn>");
        expect(markup).toContain("<mi>\u03c9</mi>");                        // \omega
        expect(markup).toContain("<mi mathvariant=\"bold\">\u03A9</mi>");   // \Omega
        expect(markup).toContain("<mi>\u0131</mi>");                        // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathcal{" + contents + "} with the correct mathvariants", function() {
        const tex = "\\mathcal{" + contents + "}";
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi mathvariant=\"script\">A</mi>");
        expect(markup).toContain("<mi>x</mi>");                             // script is caps only
        expect(markup).toContain("<mn mathvariant=\"script\">2</mn>");
        // MathJax marks everything below as "script" except \omega
        // We don't have these glyphs in "caligraphic" and neither does MathJax
        expect(markup).toContain("<mi>\u03c9</mi>");                        // \omega
        expect(markup).toContain("<mi mathvariant=\"normal\">\u03A9</mi>"); // \Omega
        expect(markup).toContain("<mi>\u0131</mi>");                        // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathfrak{" + contents + "} with the correct mathvariants", function() {
        const tex = "\\mathfrak{" + contents + "}";
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi mathvariant=\"fraktur\">A</mi>");
        expect(markup).toContain("<mi mathvariant=\"fraktur\">x</mi>");
        expect(markup).toContain("<mn mathvariant=\"fraktur\">2</mn>");
        // MathJax marks everything below as "fraktur" except \omega
        // We don't have these glyphs in "fraktur" and neither does MathJax
        expect(markup).toContain("<mi>\u03c9</mi>");                        // \omega
        expect(markup).toContain("<mi mathvariant=\"normal\">\u03A9</mi>"); // \Omega
        expect(markup).toContain("<mi>\u0131</mi>");                        // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathscr{" + contents + "} with the correct mathvariants", function() {
        const tex = "\\mathscr{" + contents + "}";
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi mathvariant=\"script\">A</mi>");
        // MathJax marks everything below as "script" except \omega
        // We don't have these glyphs in "script" and neither does MathJax
        expect(markup).toContain("<mi>x</mi>");
        expect(markup).toContain("<mn>2</mn>");
        expect(markup).toContain("<mi>\u03c9</mi>");                        // \omega
        expect(markup).toContain("<mi mathvariant=\"normal\">\u03A9</mi>"); // \Omega
        expect(markup).toContain("<mi>\u0131</mi>");                        // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathsf{" + contents + "} with the correct mathvariants", function() {
        const tex = "\\mathsf{" + contents + "}";
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi mathvariant=\"sans-serif\">A</mi>");
        expect(markup).toContain("<mi mathvariant=\"sans-serif\">x</mi>");
        expect(markup).toContain("<mn mathvariant=\"sans-serif\">2</mn>");
        expect(markup).toContain("<mi>\u03c9</mi>");                            // \omega
        expect(markup).toContain("<mi mathvariant=\"sans-serif\">\u03A9</mi>"); // \Omega
        expect(markup).toContain("<mi>\u0131</mi>");                            // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render a combination of font and color changes", function() {
        let tex = "\\textcolor{blue}{\\mathbb R}";
        let tree = getParsed(tex);
        let markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        let node = "<mstyle mathcolor=\"blue\">" +
            "<mi mathvariant=\"double-struck\">R</mi>" +
            "</mstyle>";
        expect(markup).toContain(node);

        // reverse the order of the commands
        tex = "\\mathbb{\\textcolor{blue}{R}}";
        tree = getParsed(tex);
        markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        node = "<mstyle mathcolor=\"blue\">" +
            "<mi mathvariant=\"double-struck\">R</mi>" +
            "</mstyle>";
        expect(markup).toContain(node);
    });

    it("should render text as <mtext>", function() {
        const tex = "\\text{for }";
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mtext>for\u00a0</mtext>");
    });

    it("should render math within text as side-by-side children", function() {
        const tex = "\\text{graph: $y = mx + b$}";
        const tree = getParsed(tex);
        const markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mrow><mtext>graph:\u00a0</mtext>");
        expect(markup).toContain(
            "<mi>y</mi><mo>=</mo><mi>m</mi><mi>x</mi><mo>+</mo><mi>b</mi>");
    });
});

describe("A bin builder", function() {
    it("should create mbins normally", function() {
        const built = getBuilt("x + y");

        expect(built[1].classes).toContain("mbin");
    });

    it("should create ords when at the beginning of lists", function() {
        const built = getBuilt("+ x");

        expect(built[0].classes).toContain("mord");
        expect(built[0].classes).not.toContain("mbin");
    });

    it("should create ords after some other objects", function() {
        expect(getBuilt("x + + 2")[2].classes).toContain("mord");
        expect(getBuilt("( + 2")[1].classes).toContain("mord");
        expect(getBuilt("= + 2")[1].classes).toContain("mord");
        expect(getBuilt("\\sin + 2")[1].classes).toContain("mord");
        expect(getBuilt(", + 2")[1].classes).toContain("mord");
    });

    it("should correctly interact with color objects", function() {
        expect(getBuilt("\\blue{x}+y")[1].classes).toContain("mbin");
        expect(getBuilt("\\blue{x+}+y")[1].classes).toContain("mbin");
        expect(getBuilt("\\blue{x+}+y")[2].classes).toContain("mord");
    });
});

describe("A markup generator", function() {
    it("marks trees up", function() {
        // Just a few quick sanity checks here...
        const markup = katex.renderToString("\\sigma^2");
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
        const tree = stripPositions(katex.__parse("\\sigma^2"));
        expect(JSON.stringify(tree)).toEqual(JSON.stringify([
            {
                "type": "supsub",
                "value": {
                    "base": {
                        "type": "mathord",
                        "value": "\\sigma",
                        "mode": "math",
                    },
                    "sup": {
                        "type": "textord",
                        "value": "2",
                        "mode": "math",
                    },
                    "sub": undefined,
                },
                "mode": "math",
            },
        ]));
    });
});

describe("An accent parser", function() {
    it("should not fail", function() {
        expect("\\vec{x}").toParse();
        expect("\\vec{x^2}").toParse();
        expect("\\vec{x}^2").toParse();
        expect("\\vec x").toParse();
    });

    it("should produce accents", function() {
        const parse = getParsed("\\vec x")[0];

        expect(parse.type).toEqual("accent");
    });

    it("should be grouped more tightly than supsubs", function() {
        const parse = getParsed("\\vec x^2")[0];

        expect(parse.type).toEqual("supsub");
    });

    it("should parse stretchy, shifty accents", function() {
        expect("\\widehat{x}").toParse();
    });

    it("should parse stretchy, non-shifty accents", function() {
        expect("\\overrightarrow{x}").toParse();
    });
});

describe("An accent builder", function() {
    it("should not fail", function() {
        expect("\\vec{x}").toBuild();
        expect("\\vec{x}^2").toBuild();
        expect("\\vec{x}_2").toBuild();
        expect("\\vec{x}_2^2").toBuild();
    });

    it("should produce mords", function() {
        expect(getBuilt("\\vec x")[0].classes).toContain("mord");
        expect(getBuilt("\\vec +")[0].classes).toContain("mord");
        expect(getBuilt("\\vec +")[0].classes).not.toContain("mbin");
        expect(getBuilt("\\vec )^2")[0].classes).toContain("mord");
        expect(getBuilt("\\vec )^2")[0].classes).not.toContain("mclose");
    });
});

describe("A stretchy and shifty accent builder", function() {
    it("should not fail", function() {
        expect("\\widehat{AB}").toBuild();
        expect("\\widehat{AB}^2").toBuild();
        expect("\\widehat{AB}_2").toBuild();
        expect("\\widehat{AB}_2^2").toBuild();
    });

    it("should produce mords", function() {
        expect(getBuilt("\\widehat{AB}")[0].classes).toContain("mord");
        expect(getBuilt("\\widehat +")[0].classes).toContain("mord");
        expect(getBuilt("\\widehat +")[0].classes).not.toContain("mbin");
        expect(getBuilt("\\widehat )^2")[0].classes).toContain("mord");
        expect(getBuilt("\\widehat )^2")[0].classes).not.toContain("mclose");
    });
});

describe("A stretchy and non-shifty accent builder", function() {
    it("should not fail", function() {
        expect("\\overrightarrow{AB}").toBuild();
        expect("\\overrightarrow{AB}^2").toBuild();
        expect("\\overrightarrow{AB}_2").toBuild();
        expect("\\overrightarrow{AB}_2^2").toBuild();
    });

    it("should produce mords", function() {
        expect(getBuilt("\\overrightarrow{AB}")[0].classes).toContain("mord");
        expect(getBuilt("\\overrightarrow +")[0].classes).toContain("mord");
        expect(getBuilt("\\overrightarrow +")[0].classes).not.toContain("mbin");
        expect(getBuilt("\\overrightarrow )^2")[0].classes).toContain("mord");
        expect(getBuilt("\\overrightarrow )^2")[0].classes).not.toContain("mclose");
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
        expect("\\overbrace{x}").toParse();
        expect("\\overbrace{x^2}").toParse();
        expect("\\overbrace{x}^2").toParse();
        expect("\\overbrace x").toParse();
        expect("\\underbrace{x}_2").toParse();
        expect("\\underbrace{x}_2^2").toParse();
    });

    it("should produce horizBrace", function() {
        const parse = getParsed("\\overbrace x")[0];

        expect(parse.type).toEqual("horizBrace");
    });

    it("should be grouped more tightly than supsubs", function() {
        const parse = getParsed("\\overbrace x^2")[0];

        expect(parse.type).toEqual("supsub");
    });
});

describe("A horizontal brace builder", function() {
    it("should not fail", function() {
        expect("\\overbrace{x}").toBuild();
        expect("\\overbrace{x}^2").toBuild();
        expect("\\underbrace{x}_2").toBuild();
        expect("\\underbrace{x}_2^2").toBuild();
    });

    it("should produce mords", function() {
        expect(getBuilt("\\overbrace x")[0].classes).toContain("mord");
        expect(getBuilt("\\overbrace{x}^2")[0].classes).toContain("mord");
        expect(getBuilt("\\overbrace +")[0].classes).toContain("mord");
        expect(getBuilt("\\overbrace +")[0].classes).not.toContain("mbin");
        expect(getBuilt("\\overbrace )^2")[0].classes).toContain("mord");
        expect(getBuilt("\\overbrace )^2")[0].classes).not.toContain("mclose");
    });
});

describe("A boxed parser", function() {
    it("should not fail", function() {
        expect("\\boxed{x}").toParse();
        expect("\\boxed{x^2}").toParse();
        expect("\\boxed{x}^2").toParse();
        expect("\\boxed x").toParse();
    });

    it("should produce enclose", function() {
        const parse = getParsed("\\boxed x")[0];

        expect(parse.type).toEqual("enclose");
    });
});

describe("A boxed builder", function() {
    it("should not fail", function() {
        expect("\\boxed{x}").toBuild();
        expect("\\boxed{x}^2").toBuild();
        expect("\\boxed{x}_2").toBuild();
        expect("\\boxed{x}_2^2").toBuild();
    });

    it("should produce mords", function() {
        expect(getBuilt("\\boxed x")[0].classes).toContain("mord");
        expect(getBuilt("\\boxed +")[0].classes).toContain("mord");
        expect(getBuilt("\\boxed +")[0].classes).not.toContain("mbin");
        expect(getBuilt("\\boxed )^2")[0].classes).toContain("mord");
        expect(getBuilt("\\boxed )^2")[0].classes).not.toContain("mclose");
    });
});

describe("A strike-through parser", function() {
    it("should not fail", function() {
        expect("\\cancel{x}").toParse();
        expect("\\cancel{x^2}").toParse();
        expect("\\cancel{x}^2").toParse();
        expect("\\cancel x").toParse();
    });

    it("should produce enclose", function() {
        const parse = getParsed("\\cancel x")[0];

        expect(parse.type).toEqual("enclose");
    });

    it("should be grouped more tightly than supsubs", function() {
        const parse = getParsed("\\cancel x^2")[0];

        expect(parse.type).toEqual("supsub");
    });
});

describe("A strike-through builder", function() {
    it("should not fail", function() {
        expect("\\cancel{x}").toBuild();
        expect("\\cancel{x}^2").toBuild();
        expect("\\cancel{x}_2").toBuild();
        expect("\\cancel{x}_2^2").toBuild();
        expect("\\sout{x}").toBuild();
        expect("\\sout{x}^2").toBuild();
        expect("\\sout{x}_2").toBuild();
        expect("\\sout{x}_2^2").toBuild();
    });

    it("should produce mords", function() {
        expect(getBuilt("\\cancel x")[0].classes).toContain("mord");
        expect(getBuilt("\\cancel +")[0].classes).toContain("mord");
        expect(getBuilt("\\cancel +")[0].classes).not.toContain("mbin");
        expect(getBuilt("\\cancel )^2")[0].classes).toContain("mord");
        expect(getBuilt("\\cancel )^2")[0].classes).not.toContain("mclose");
    });
});

describe("A phantom parser", function() {
    it("should not fail", function() {
        expect("\\phantom{x}").toParse();
        expect("\\phantom{x^2}").toParse();
        expect("\\phantom{x}^2").toParse();
        expect("\\phantom x").toParse();
        expect("\\hphantom{x}").toParse();
        expect("\\hphantom{x^2}").toParse();
        expect("\\hphantom{x}^2").toParse();
        expect("\\hphantom x").toParse();
    });

    it("should build a phantom node", function() {
        const parse = getParsed("\\phantom{x}")[0];

        expect(parse.type).toEqual("phantom");
        expect(parse.value.value).toBeDefined();
    });
});

describe("A phantom builder", function() {
    it("should not fail", function() {
        expect("\\phantom{x}").toBuild();
        expect("\\phantom{x^2}").toBuild();
        expect("\\phantom{x}^2").toBuild();
        expect("\\phantom x").toBuild();

        expect("\\hphantom{x}").toBuild();
        expect("\\hphantom{x^2}").toBuild();
        expect("\\hphantom{x}^2").toBuild();
        expect("\\hphantom x").toBuild();
    });

    it("should make the children transparent", function() {
        const children = getBuilt("\\phantom{x+1}");
        expect(children[0].style.color).toBe("transparent");
        expect(children[1].style.color).toBe("transparent");
        expect(children[2].style.color).toBe("transparent");
    });

    it("should make all descendants transparent", function() {
        const children = getBuilt("\\phantom{x+\\blue{1}}");
        expect(children[0].style.color).toBe("transparent");
        expect(children[1].style.color).toBe("transparent");
        expect(children[2].style.color).toBe("transparent");
    });
});

describe("A smash parser", function() {
    it("should not fail", function() {
        expect("\\smash{x}").toParse();
        expect("\\smash{x^2}").toParse();
        expect("\\smash{x}^2").toParse();
        expect("\\smash x").toParse();

        expect("\\smash[b]{x}").toParse();
        expect("\\smash[b]{x^2}").toParse();
        expect("\\smash[b]{x}^2").toParse();
        expect("\\smash[b] x").toParse();

        expect("\\smash[]{x}").toParse();
        expect("\\smash[]{x^2}").toParse();
        expect("\\smash[]{x}^2").toParse();
        expect("\\smash[] x").toParse();
    });

    it("should build a smash node", function() {
        const parse = getParsed("\\smash{x}")[0];

        expect(parse.type).toEqual("smash");
    });
});

describe("A smash builder", function() {
    it("should not fail", function() {
        expect("\\smash{x}").toBuild();
        expect("\\smash{x^2}").toBuild();
        expect("\\smash{x}^2").toBuild();
        expect("\\smash x").toBuild();

        expect("\\smash[b]{x}").toBuild();
        expect("\\smash[b]{x^2}").toBuild();
        expect("\\smash[b]{x}^2").toBuild();
        expect("\\smash[b] x").toBuild();
    });
});

describe("A parser error", function() {
    it("should report the position of an error", function() {
        try {
            parseTree("\\sqrt}", defaultSettings);
        } catch (e) {
            expect(e.position).toEqual(5);
        }
    });
});

describe("An optional argument parser", function() {
    it("should not fail", function() {
        // Note this doesn't actually make an optional argument, but still
        // should work
        expect("\\frac[1]{2}{3}").toParse();

        expect("\\rule[0.2em]{1em}{1em}").toParse();
    });

    it("should work with sqrts with optional arguments", function() {
        expect("\\sqrt[3]{2}").toParse();
    });

    it("should work when the optional argument is missing", function() {
        expect("\\sqrt{2}").toParse();
        expect("\\rule{1em}{2em}").toParse();
    });

    it("should fail when the optional argument is malformed", function() {
        expect("\\rule[1]{2em}{3em}").toNotParse();
    });

    it("should not work if the optional argument isn't closed", function() {
        expect("\\sqrt[").toNotParse();
    });
});

describe("An array environment", function() {

    it("should accept a single alignment character", function() {
        const parse = getParsed("\\begin{array}r1\\\\20\\end{array}");
        expect(parse[0].type).toBe("array");
        expect(parse[0].value.cols).toEqual([
            { type: "align", align: "r" },
        ]);
    });

    it("should accept vertical separators", function() {
        const parse = getParsed("\\begin{array}{|l||c|}\\end{array}");
        expect(parse[0].type).toBe("array");
        expect(parse[0].value.cols).toEqual([
            { type: "separator", separator: "|" },
            { type: "align", align: "l" },
            { type: "separator", separator: "|" },
            { type: "separator", separator: "|" },
            { type: "align", align: "c" },
            { type: "separator", separator: "|" },
        ]);
    });

});

describe("A cases environment", function() {

    it("should parse its input", function() {
        expect("f(a,b)=\\begin{cases}a+1&\\text{if }b\\text{ is odd}\\\\" +
               "a&\\text{if }b=0\\\\a-1&\\text{otherwise}\\end{cases}")
            .toParse();
    });

});

describe("An aligned environment", function() {

    it("should parse its input", function() {
        expect("\\begin{aligned}a&=b&c&=d\\\\e&=f\\end{aligned}")
            .toParse();
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
        expect("\\error").toParse(noThrowSettings);
    });

    describe("should allow unrecognized controls sequences anywhere, including", function() {
        it("in superscripts and subscripts", function() {
            expect("2_\\error").toBuild(noThrowSettings);
            expect("3^{\\error}_\\error").toBuild(noThrowSettings);
            expect("\\int\\nolimits^\\error_\\error").toBuild(noThrowSettings);
        });

        it("in fractions", function() {
            expect("\\frac{345}{\\error}").toBuild(noThrowSettings);
            expect("\\frac\\error{\\error}").toBuild(noThrowSettings);
        });

        it("in square roots", function() {
            expect("\\sqrt\\error").toBuild(noThrowSettings);
            expect("\\sqrt{234\\error}").toBuild(noThrowSettings);
        });

        it("in text boxes", function() {
            expect("\\text{\\error}").toBuild(noThrowSettings);
        });
    });

    it("should produce color nodes with a color value given by errorColor", function() {
        const parsedInput = getParsed("\\error", noThrowSettings);
        expect(parsedInput[0].type).toBe("color");
        expect(parsedInput[0].value.color).toBe(errorColor);
    });
});

describe("The symbol table integraty", function() {
    it("should treat certain symbols as synonyms", function() {
        expect(getBuilt("<")).toEqual(getBuilt("\\lt"));
        expect(getBuilt(">")).toEqual(getBuilt("\\gt"));
        expect(getBuilt("\\left<\\frac{1}{x}\\right>"))
            .toEqual(getBuilt("\\left\\lt\\frac{1}{x}\\right\\gt"));
    });
});

describe("A macro expander", function() {

    const compareParseTree = function(actual, expected, macros) {
        const settings = new Settings({macros: macros});
        actual = stripPositions(parseTree(actual, settings));
        expected = stripPositions(parseTree(expected, defaultSettings));
        expect(actual).toEqual(expected);
    };

    it("should produce individual tokens", function() {
        compareParseTree("e^\\foo", "e^1 23", {"\\foo": "123"});
    });

    it("should preserve leading spaces inside macro definition", function() {
        compareParseTree("\\text{\\foo}", "\\text{ x}", {"\\foo": " x"});
    });

    it("should preserve leading spaces inside macro argument", function() {
        compareParseTree("\\text{\\foo{ x}}", "\\text{ x}", {"\\foo": "#1"});
    });

    it("should ignore expanded spaces in math mode", function() {
        compareParseTree("\\foo", "x", {"\\foo": " x"});
    });

    it("should consume spaces after macro", function() {
        compareParseTree("\\text{\\foo }", "\\text{x}", {"\\foo": "x"});
    });

    it("should consume spaces between arguments", function() {
        compareParseTree("\\text{\\foo 1 2}", "\\text{12end}", {"\\foo": "#1#2end"});
        compareParseTree("\\text{\\foo {1} {2}}", "\\text{12end}", {"\\foo": "#1#2end"});
    });

    it("should allow for multiple expansion", function() {
        compareParseTree("1\\foo2", "1aa2", {
            "\\foo": "\\bar\\bar",
            "\\bar": "a",
        });
    });

    it("should allow for multiple expansion with argument", function() {
        compareParseTree("1\\foo2", "12222", {
            "\\foo": "\\bar{#1}\\bar{#1}",
            "\\bar": "#1#1",
        });
    });

    it("should allow for macro argument", function() {
        compareParseTree("\\foo\\bar", "(x)", {
            "\\foo": "(#1)",
            "\\bar": "x",
        });
    });

    it("should allow for space macro argument (text version)", function() {
        compareParseTree("\\text{\\foo\\bar}", "\\text{( )}", {
            "\\foo": "(#1)",
            "\\bar": " ",
        });
    });

    it("should allow for space macro argument (math version)", function() {
        compareParseTree("\\foo\\bar", "()", {
            "\\foo": "(#1)",
            "\\bar": " ",
        });
    });

    it("should allow for empty macro argument", function() {
        compareParseTree("\\foo\\bar", "()", {
            "\\foo": "(#1)",
            "\\bar": "",
        });
    });

    it("should expand the \\overset macro as expected", function() {
        expect("\\overset?=").toParseLike("\\mathop{=}\\limits^{?}");
        expect("\\overset{x=y}{\sqrt{ab}}")
            .toParseLike("\\mathop{\sqrt{ab}}\\limits^{x=y}");
        expect("\\overset {?} =").toParseLike("\\mathop{=}\\limits^{?}");
    });

    it("should build \\iff, \\implies, \\impliedby", function() {
        expect("X \\iff Y").toBuild();
        expect("X \\implies Y").toBuild();
        expect("X \\impliedby Y").toBuild();
    });
});

describe("A parser taking String objects", function() {
    it("should not fail on an empty String object", function() {
        expect(new String("")).toParse();
    });

    it("should parse the same as a regular string", function() {
        expect(new String("xy")).toParseLike("xy");
        expect(new String("\\div")).toParseLike("\\div");
        expect(new String("\\frac 1 2")).toParseLike("\\frac 1 2");
    });
});

describe("Unicode", function() {
    it("should parse all lower case Greek letters", function() {
        expect("αβγδεϵζηθϑικλμνξοπϖρϱςστυφϕχψω").toParse();
    });

    it("should parse 'ΓΔΘΞΠΣΦΨΩ'", function() {
        expect("ΓΔΘΞΠΣΦΨΩ").toParse();
    });
});

describe("The maxSize setting", function() {
    const rule = "\\rule{999em}{999em}";

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
