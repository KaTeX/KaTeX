/* global beforeEach: false */
/* global jasmine: false */
/* global expect: false */
/* global it: false */
/* global describe: false */

var buildMathML = require("../src/buildMathML");
var buildTree = require("../src/buildTree");
var katex = require("../katex");
var ParseError = require("../src/ParseError");
var parseTree = require("../src/parseTree");
var Options = require("../src/Options");
var Settings = require("../src/Settings");
var Style = require("../src/Style");

var defaultSettings = new Settings({});
var defaultOptions = new Options({
    style: Style.TEXT,
    size: "size5"
});

var _getBuilt = function(expr, settings) {
    var usedSettings = settings ? settings : defaultSettings;
    var parsedTree = parseTree(expr, usedSettings);
    var rootNode = buildTree(parsedTree, expr, usedSettings);

    // grab the root node of the HTML rendering
    var builtHTML = rootNode.children[1];

    // Remove the outer .katex and .katex-inner layers
    return builtHTML.children[2].children;
};

/**
 * Return the root node of the rendered HTML.
 * @param expr
 * @param settings
 * @returns {Object}
 */
var getBuilt = function(expr, settings) {
    var usedSettings = settings ? settings : defaultSettings;
    expect(expr).toBuild(usedSettings);
    return _getBuilt(expr, settings);
};

/**
 * Return the root node of the parse tree.
 * @param expr
 * @param settings
 * @returns {Object}
 */
var getParsed = function(expr, settings) {
    var usedSettings = settings ? settings : defaultSettings;

    expect(expr).toParse(usedSettings);
    return parseTree(expr, usedSettings);
};

beforeEach(function() {
    jasmine.addMatchers({
        toParse: function() {
            return {
                compare: function(actual, settings) {
                    var usedSettings = settings ? settings : defaultSettings;

                    var result = {
                        pass: true,
                        message: "'" + actual + "' succeeded parsing"
                    };

                    try {
                        parseTree(actual, usedSettings);
                    } catch (e) {
                        result.pass = false;
                        if (e instanceof ParseError) {
                            result.message = "'" + actual + "' failed " +
                                "parsing with error: " + e.message;
                        } else {
                            result.message = "'" + actual + "' failed " +
                                "parsing with unknown error: " + e.message;
                        }
                    }

                    return result;
                }
            };
        },

        toNotParse: function() {
            return {
                compare: function(actual, settings) {
                    var usedSettings = settings ? settings : defaultSettings;

                    var result = {
                        pass: false,
                        message: "Expected '" + actual + "' to fail " +
                            "parsing, but it succeeded"
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
                }
            };
        },

        toBuild: function() {
            return {
                compare: function(actual, settings) {
                    var usedSettings = settings ? settings : defaultSettings;

                    var result = {
                        pass: true,
                        message: "'" + actual + "' succeeded in building"
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
                }
            };
        }
    });
});

describe("A parser", function() {
    it("should not fail on an empty string", function() {
        expect("").toParse();
    });

    it("should ignore whitespace", function() {
        var parseA = getParsed("    x    y    ");
        var parseB = getParsed("xy");
        expect(parseA).toEqual(parseB);
    });
});

describe("An ord parser", function() {
    var expression = "1234|/@.\"`abcdefgzABCDEFGZ";

    it("should not fail", function() {
        expect(expression).toParse();
    });

    it("should build a list of ords", function() {
        var parse = getParsed(expression);

        expect(parse).toBeTruthy();

        for (var i = 0; i < parse.length; i++) {
            var group = parse[i];
            expect(group.type).toMatch("ord");
        }
    });

    it("should parse the right number of ords", function() {
        var parse = getParsed(expression);

        expect(parse.length).toBe(expression.length);
    });
});

describe("A bin parser", function() {
    var expression = "+-*\\cdot\\pm\\div";

    it("should not fail", function() {
        expect(expression).toParse();
    });

    it("should build a list of bins", function() {
        var parse = getParsed(expression);
        expect(parse).toBeTruthy();

        for (var i = 0; i < parse.length; i++) {
            var group = parse[i];
            expect(group.type).toMatch("bin");
        }
    });
});

describe("A rel parser", function() {
    var expression = "=<>\\leq\\geq\\neq\\nleq\\ngeq\\cong";

    it("should not fail", function() {
        expect(expression).toParse();
    });

    it("should build a list of rels", function() {
        var parse = getParsed(expression);
        expect(parse).toBeTruthy();

        for (var i = 0; i < parse.length; i++) {
            var group = parse[i];
            expect(group.type).toMatch("rel");
        }
    });
});

describe("A punct parser", function() {
    var expression = ",;\\colon";

    it("should not fail", function() {
        expect(expression).toParse();
    });

    it("should build a list of puncts", function() {
        var parse = getParsed(expression);
        expect(parse).toBeTruthy();

        for (var i = 0; i < parse.length; i++) {
            var group = parse[i];
            expect(group.type).toMatch("punct");
        }
    });
});

describe("An open parser", function() {
    var expression = "([";

    it("should not fail", function() {
        expect(expression).toParse();
    });

    it("should build a list of opens", function() {
        var parse = getParsed(expression);
        expect(parse).toBeTruthy();

        for (var i = 0; i < parse.length; i++) {
            var group = parse[i];
            expect(group.type).toMatch("open");
        }
    });
});

describe("A close parser", function() {
    var expression = ")]?!";

    it("should not fail", function() {
        expect(expression).toParse();
    });

    it("should build a list of closes", function() {
        var parse = getParsed(expression);
        expect(parse).toBeTruthy();

        for (var i = 0; i < parse.length; i++) {
            var group = parse[i];
            expect(group.type).toMatch("close");
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
        var parse = getParsed("x^2")[0];

        expect(parse.type).toBe("supsub");
        expect(parse.value.base).toBeDefined();
        expect(parse.value.sup).toBeDefined();
        expect(parse.value.sub).toBeUndefined();
    });

    it("should produce supsubs for subscript", function() {
        var parse = getParsed("x_3")[0];

        expect(parse.type).toBe("supsub");
        expect(parse.value.base).toBeDefined();
        expect(parse.value.sub).toBeDefined();
        expect(parse.value.sup).toBeUndefined();
    });

    it("should produce supsubs for ^_", function() {
        var parse = getParsed("x^2_3")[0];

        expect(parse.type).toBe("supsub");
        expect(parse.value.base).toBeDefined();
        expect(parse.value.sup).toBeDefined();
        expect(parse.value.sub).toBeDefined();
    });

    it("should produce supsubs for _^", function() {
        var parse = getParsed("x_3^2")[0];

        expect(parse.type).toBe("supsub");
        expect(parse.value.base).toBeDefined();
        expect(parse.value.sup).toBeDefined();
        expect(parse.value.sub).toBeDefined();
    });

    it("should produce the same thing regardless of order", function() {
        var parseA = getParsed("x^2_3");
        var parseB = getParsed("x_3^2");

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
            var parsedInput = getParsed("\\int\\nolimits\\limits_2^2");
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
        var parse = getParsed("{xy}");

        expect(parse.length).toBe(1);

        var ord = parse[0];

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
        var parse = getParsed("\\Large abc");

        expect(parse.length).toBe(1);

        var sizing = parse[0];

        expect(sizing.type).toMatch("sizing");
        expect(sizing.value).toBeTruthy();
    });

    it("should apply only after the function", function() {
        var parse = getParsed("a \\Large abc");

        expect(parse.length).toBe(2);

        var sizing = parse[1];

        expect(sizing.type).toMatch("sizing");
        expect(sizing.value.value.length).toBe(3);
    });

    it("should stop at the ends of groups", function() {
        var parse = getParsed("a { b \\Large c } d");

        var group = parse[1];
        var sizing = group.value[1];

        expect(sizing.type).toMatch("sizing");
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
    var expression = "\\frac{x}{y}";
    var dfracExpression = "\\dfrac{x}{y}";
    var tfracExpression = "\\tfrac{x}{y}";

    it("should not fail", function() {
        expect(expression).toParse();
    });

    it("should produce a frac", function() {
        var parse = getParsed(expression)[0];

        expect(parse.type).toMatch("frac");
        expect(parse.value.numer).toBeDefined();
        expect(parse.value.denom).toBeDefined();
    });

    it("should also parse dfrac and tfrac", function() {
        expect(dfracExpression).toParse();

        expect(tfracExpression).toParse();
    });

    it("should parse dfrac and tfrac as fracs", function() {
        var dfracParse = getParsed(dfracExpression)[0];

        expect(dfracParse.type).toMatch("frac");
        expect(dfracParse.value.numer).toBeDefined();
        expect(dfracParse.value.denom).toBeDefined();

        var tfracParse = getParsed(tfracExpression)[0];

        expect(tfracParse.type).toMatch("frac");
        expect(tfracParse.value.numer).toBeDefined();
        expect(tfracParse.value.denom).toBeDefined();
    });
});

describe("An over parser", function() {
    var simpleOver = "1 \\over x";
    var complexOver = "1+2i \\over 3+4i";

    it("should not fail", function () {
        expect(simpleOver).toParse();
        expect(complexOver).toParse();
    });

    it("should produce a frac", function() {
        var parse;

        parse = getParsed(simpleOver)[0];

        expect(parse.type).toMatch("frac");
        expect(parse.value.numer).toBeDefined();
        expect(parse.value.denom).toBeDefined();

        parse = getParsed(complexOver)[0];

        expect(parse.type).toMatch("frac");
        expect(parse.value.numer).toBeDefined();
        expect(parse.value.denom).toBeDefined();
    });

    it("should create a numerator from the atoms before \\over", function () {
        var parse = getParsed(complexOver)[0];

        var numer = parse.value.numer;
        expect(numer.value.length).toEqual(4);
    });

    it("should create a demonimator from the atoms after \\over", function () {
        var parse = getParsed(complexOver)[0];

        var denom = parse.value.numer;
        expect(denom.value.length).toEqual(4);
    });

    it("should handle empty numerators", function () {
        var emptyNumerator = "\\over x";
        var parse = getParsed(emptyNumerator)[0];
        expect(parse.type).toMatch("frac");
        expect(parse.value.numer).toBeDefined();
        expect(parse.value.denom).toBeDefined();
    });

    it("should handle empty denominators", function () {
        var emptyDenominator = "1 \\over";
        var parse = getParsed(emptyDenominator)[0];
        expect(parse.type).toMatch("frac");
        expect(parse.value.numer).toBeDefined();
        expect(parse.value.denom).toBeDefined();
    });

    it("should handle \\displaystyle correctly", function () {
        var displaystyleExpression = "\\displaystyle 1 \\over 2";
        var parse = getParsed(displaystyleExpression)[0];
        expect(parse.type).toMatch("frac");
        expect(parse.value.numer.value[0].type).toMatch("styling");
        expect(parse.value.denom).toBeDefined();
    });

    it("should handle nested factions", function () {
        var nestedOverExpression = "{1 \\over 2} \\over 3";
        var parse = getParsed(nestedOverExpression)[0];
        expect(parse.type).toMatch("frac");
        expect(parse.value.numer.value[0].type).toMatch("frac");
        expect(parse.value.numer.value[0].value.numer.value[0].value).toMatch(1);
        expect(parse.value.numer.value[0].value.denom.value[0].value).toMatch(2);
        expect(parse.value.denom).toBeDefined();
        expect(parse.value.denom.value[0].value).toMatch(3);
    });

    it("should fail with multiple overs in the same group", function () {
        var badMultipleOvers = "1 \\over 2 + 3 \\over 4";
        expect(badMultipleOvers).toNotParse();

        var badOverChoose = "1 \\over 2 \\choose 3";
        expect(badOverChoose).toNotParse();
    });
});

describe("A sizing parser", function() {
    var sizeExpression = "\\Huge{x}\\small{x}";

    it("should not fail", function() {
        expect(sizeExpression).toParse();
    });

    it("should produce a sizing node", function() {
        var parse = getParsed(sizeExpression)[0];

        expect(parse.type).toMatch("sizing");
        expect(parse.value).toBeDefined();
    });
});

describe("A text parser", function() {
    var textExpression = "\\text{a b}";
    var noBraceTextExpression = "\\text x";
    var nestedTextExpression =
        "\\text{a {b} \\blue{c} \\color{#fff}{x} \\llap{x}}";
    var spaceTextExpression = "\\text{  a \\ }";
    var leadingSpaceTextExpression = "\\text {moo}";
    var badTextExpression = "\\text{a b%}";
    var badFunctionExpression = "\\text{\\sqrt{x}}";

    it("should not fail", function() {
        expect(textExpression).toParse();
    });

    it("should produce a text", function() {
        var parse = getParsed(textExpression)[0];

        expect(parse.type).toMatch("text");
        expect(parse.value).toBeDefined();
    });

    it("should produce textords instead of mathords", function() {
        var parse = getParsed(textExpression)[0];
        var group = parse.value.body;

        expect(group[0].type).toMatch("textord");
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
        var parse = getParsed(spaceTextExpression)[0];
        var group = parse.value.body;

        expect(group[0].type).toMatch("spacing");
        expect(group[1].type).toMatch("textord");
        expect(group[2].type).toMatch("spacing");
        expect(group[3].type).toMatch("spacing");
    });

    it("should ignore a space before the text group", function() {
        var parse = getParsed(leadingSpaceTextExpression)[0];
        // [m, o, o]
        expect(parse.value.body.length).toBe(3);
        expect(
            parse.value.body.map(function(n) { return n.value; }).join("")
        ).toBe("moo");
    });
});

describe("A color parser", function() {
    var colorExpression = "\\blue{x}";
    var newColorExpression = "\\redA{x}";
    var customColorExpression = "\\color{#fA6}{x}";
    var badCustomColorExpression = "\\color{bad-color}{x}";

    it("should not fail", function() {
        expect(colorExpression).toParse();
    });

    it("should build a color node", function() {
        var parse = getParsed(colorExpression)[0];

        expect(parse.type).toMatch("color");
        expect(parse.value.color).toBeDefined();
        expect(parse.value.value).toBeDefined();
    });

    it("should parse a custom color", function() {
        expect(customColorExpression).toParse();
    });

    it("should correctly extract the custom color", function() {
        var parse = getParsed(customColorExpression)[0];

        expect(parse.value.color).toMatch("#fA6");
    });

    it("should not parse a bad custom color", function() {
        expect(badCustomColorExpression).toNotParse();
    });

    it("should parse new colors from the branding guide", function(){
        expect(newColorExpression).toParse();
    });

    it("should have correct greediness", function() {
        expect("\\color{red}a").toParse();
        expect("\\color{red}{\\text{a}}").toParse();
        expect("\\color{red}\\text{a}").toNotParse();
        expect("\\color{red}\\frac12").toNotParse();
    });
});

describe("A tie parser", function() {
    var mathTie = "a~b";
    var textTie = "\\text{a~ b}";

    it("should parse ties in math mode", function() {
        expect(mathTie).toParse();
    });

    it("should parse ties in text mode", function() {
        expect(textTie).toParse();
    });

    it("should produce spacing in math mode", function() {
        var parse = getParsed(mathTie);

        expect(parse[1].type).toMatch("spacing");
    });

    it("should produce spacing in text mode", function() {
        var text = getParsed(textTie)[0];
        var parse = text.value.body;

        expect(parse[1].type).toMatch("spacing");
    });

    it("should not contract with spaces in text mode", function() {
        var text = getParsed(textTie)[0];
        var parse = text.value.body;

        expect(parse[2].type).toMatch("spacing");
    });
});

describe("A delimiter sizing parser", function() {
    var normalDelim = "\\bigl |";
    var notDelim = "\\bigl x";
    var bigDelim = "\\Biggr \\langle";

    it("should parse normal delimiters", function() {
        expect(normalDelim).toParse();
        expect(bigDelim).toParse();
    });

    it("should not parse not-delimiters", function() {
        expect(notDelim).toNotParse();
    });

    it("should produce a delimsizing", function() {
        var parse = getParsed(normalDelim)[0];

        expect(parse.type).toMatch("delimsizing");
    });

    it("should produce the correct direction delimiter", function() {
        var leftParse = getParsed(normalDelim)[0];
        var rightParse = getParsed(bigDelim)[0];

        expect(leftParse.value.delimType).toMatch("open");
        expect(rightParse.value.delimType).toMatch("close");
    });

    it("should parse the correct size delimiter", function() {
        var smallParse = getParsed(normalDelim)[0];
        var bigParse = getParsed(bigDelim)[0];

        expect(smallParse.value.size).toEqual(1);
        expect(bigParse.value.size).toEqual(4);
    });
});

describe("An overline parser", function() {
    var overline = "\\overline{x}";

    it("should not fail", function() {
        expect(overline).toParse();
    });

    it("should produce an overline", function() {
        var parse = getParsed(overline)[0];

        expect(parse.type).toMatch("overline");
    });
});

describe("A rule parser", function() {
    var emRule = "\\rule{1em}{2em}";
    var exRule = "\\rule{1ex}{2em}";
    var badUnitRule = "\\rule{1px}{2em}";
    var noNumberRule = "\\rule{1em}{em}";
    var incompleteRule = "\\rule{1em}";
    var hardNumberRule = "\\rule{   01.24ex}{2.450   em   }";

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
        var parse = getParsed(emRule)[0];

        expect(parse.type).toMatch("rule");
    });

    it("should list the correct units", function() {
        var emParse = getParsed(emRule)[0];
        var exParse = getParsed(exRule)[0];

        expect(emParse.value.width.unit).toMatch("em");
        expect(emParse.value.height.unit).toMatch("em");

        expect(exParse.value.width.unit).toMatch("ex");
        expect(exParse.value.height.unit).toMatch("em");
    });

    it("should parse the number correctly", function() {
        var hardNumberParse = getParsed(hardNumberRule)[0];

        expect(hardNumberParse.value.width.number).toBeCloseTo(1.24);
        expect(hardNumberParse.value.height.number).toBeCloseTo(2.45);
    });

    it("should parse negative sizes", function() {
        var parse = getParsed("\\rule{-1em}{- 0.2em}")[0];

        expect(parse.value.width.number).toBeCloseTo(-1);
        expect(parse.value.height.number).toBeCloseTo(-0.2);
    });
});

describe("A left/right parser", function() {
    var normalLeftRight = "\\left( \\dfrac{x}{y} \\right)";
    var emptyRight = "\\left( \\dfrac{x}{y} \\right.";

    it("should not fail", function() {
        expect(normalLeftRight).toParse();
    });

    it("should produce a leftright", function() {
        var parse = getParsed(normalLeftRight)[0];

        expect(parse.type).toMatch("leftright");
        expect(parse.value.left).toMatch("\\(");
        expect(parse.value.right).toMatch("\\)");
    });

    it("should error when it is mismatched", function() {
        var unmatchedLeft = "\\left( \\dfrac{x}{y}";
        var unmatchedRight = "\\dfrac{x}{y} \\right)";

        expect(unmatchedLeft).toNotParse();

        expect(unmatchedRight).toNotParse();
    });

    it("should error when braces are mismatched", function() {
        var unmatched = "{ \\left( \\dfrac{x}{y} } \\right)";
        expect(unmatched).toNotParse();
    });

    it("should error when non-delimiters are provided", function() {
        var nonDelimiter = "\\left$ \\dfrac{x}{y} \\right)";
        expect(nonDelimiter).toNotParse();
    });

    it("should parse the empty '.' delimiter", function() {
        expect(emptyRight).toParse();
    });

    it("should parse the '.' delimiter with normal sizes", function() {
        var normalEmpty = "\\Bigl .";
        expect(normalEmpty).toParse();
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
        var m1 = "\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}";
        var m2 = "\\begin{array}{rl}" + m1 + "&0\\\\0&" + m1 + "\\end{array}";
        expect(m2).toParse();
    });

    it("should allow \\cr as a line terminator", function() {
        expect("\\begin{matrix}a&b\\cr c&d\\end{matrix}").toParse();
    });
});

describe("A sqrt parser", function() {
    var sqrt = "\\sqrt{x}";
    var missingGroup = "\\sqrt";

    it("should parse square roots", function() {
        expect(sqrt).toParse();
    });

    it("should error when there is no group", function() {
        expect(missingGroup).toNotParse();
    });

    it("should produce sqrts", function() {
        var parse = getParsed(sqrt)[0];

        expect(parse.type).toMatch("sqrt");
    });
});

describe("A TeX-compliant parser", function() {
    it("should work", function() {
        expect("\\frac 2 3").toParse();
    });

    it("should fail if there are not enough arguments", function() {
        var missingGroups = [
            "\\frac{x}",
            "\\color{#fff}",
            "\\rule{1em}",
            "\\llap",
            "\\bigl",
            "\\text"
        ];

        for (var i = 0; i < missingGroups.length; i++) {
            expect(missingGroups[i]).toNotParse();
        }
    });

    it("should fail when there are missing sup/subscripts", function() {
        expect("x^").toNotParse();
        expect("x_").toNotParse();
    });

    it("should fail when arguments require arguments", function() {
        var badArguments = [
            "\\frac \\frac x y z",
            "\\frac x \\frac y z",
            "\\frac \\sqrt x y",
            "\\frac x \\sqrt y",
            "\\frac \\llap x y",
            "\\frac x \\llap y",
            // This actually doesn't work in real TeX, but it is suprisingly
            // hard to get this to correctly work. So, we take hit of very small
            // amounts of non-compatiblity in order for the rest of the tests to
            // work
            // "\\llap \\frac x y",
            "\\llap \\llap x",
            "\\sqrt \\llap x"
        ];

        for (var i = 0; i < badArguments.length; i++) {
            expect(badArguments[i]).toNotParse();
        }
    });

    it("should work when the arguments have braces", function() {
        var goodArguments = [
            "\\frac {\\frac x y} z",
            "\\frac x {\\frac y z}",
            "\\frac {\\sqrt x} y",
            "\\frac x {\\sqrt y}",
            "\\frac {\\llap x} y",
            "\\frac x {\\llap y}",
            "\\llap {\\frac x y}",
            "\\llap {\\llap x}",
            "\\sqrt {\\llap x}"
        ];

        for (var i = 0; i < goodArguments.length; i++) {
            expect(goodArguments[i]).toParse();
        }
    });

    it("should fail when sup/subscripts require arguments", function() {
        var badSupSubscripts = [
            "x^\\sqrt x",
            "x^\\llap x",
            "x_\\sqrt x",
            "x_\\llap x"
        ];

        for (var i = 0; i < badSupSubscripts.length; i++) {
            expect(badSupSubscripts[i]).toNotParse();
        }
    });

    it("should work when sup/subscripts arguments have braces", function() {
        var goodSupSubscripts = [
            "x^{\\sqrt x}",
            "x^{\\llap x}",
            "x_{\\sqrt x}",
            "x_{\\llap x}"
        ];

        for (var i = 0; i < goodSupSubscripts.length; i++) {
            expect(goodSupSubscripts[i]).toParse();
        }
    });

    it("should parse multiple primes correctly", function() {
        expect("x''''").toParse();
        expect("x_2''").toParse();
        expect("x''_2").toParse();
        expect("x'_2'").toParse();
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
        var badLeftArguments = [
            "\\frac \\left( x \\right) y",
            "\\frac x \\left( y \\right)",
            "\\llap \\left( x \\right)",
            "\\sqrt \\left( x \\right)",
            "x^\\left( x \\right)"
        ];

        for (var i = 0; i < badLeftArguments.length; i++) {
            expect(badLeftArguments[i]).toNotParse();
        }
    });

    it("should succeed when there are braces around the \\left/\\right", function() {
        var goodLeftArguments = [
            "\\frac {\\left( x \\right)} y",
            "\\frac x {\\left( y \\right)}",
            "\\llap {\\left( x \\right)}",
            "\\sqrt {\\left( x \\right)}",
            "x^{\\left( x \\right)}"
        ];

        for (var i = 0; i < goodLeftArguments.length; i++) {
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
        var displayParse = getParsed("\\displaystyle x")[0];
        expect(displayParse.value.style).toMatch("display");

        var scriptscriptParse = getParsed("\\scriptscriptstyle x")[0];
        expect(scriptscriptParse.value.style).toMatch("scriptscript");
    });

    it("should only change the style within its group", function() {
        var text = "a b { c d \\displaystyle e f } g h";
        var parse = getParsed(text);

        var displayNode = parse[2].value[2];

        expect(displayNode.type).toMatch("styling");

        var displayBody = displayNode.value.value;

        expect(displayBody.length).toEqual(2);
        expect(displayBody[0].value).toMatch("e");
    });
});

describe("A font parser", function () {
    it("should parse \\mathrm, \\mathbb, and \\mathit", function () {
        expect("\\mathrm x").toParse();
        expect("\\mathbb x").toParse();
        expect("\\mathit x").toParse();
        expect("\\mathrm {x + 1}").toParse();
        expect("\\mathbb {x + 1}").toParse();
        expect("\\mathit {x + 1}").toParse();
    });

    it("should parse \\mathcal and \\mathfrak", function () {
        expect("\\mathcal{ABC123}").toParse();
        expect("\\mathfrak{abcABC123}").toParse();
    });

    it("should produce the correct fonts", function () {
        var mathbbParse = getParsed("\\mathbb x")[0];
        expect(mathbbParse.value.font).toMatch("mathbb");
        expect(mathbbParse.value.type).toMatch("font");

        var mathrmParse = getParsed("\\mathrm x")[0];
        expect(mathrmParse.value.font).toMatch("mathrm");
        expect(mathrmParse.value.type).toMatch("font");

        var mathitParse = getParsed("\\mathit x")[0];
        expect(mathitParse.value.font).toMatch("mathit");
        expect(mathitParse.value.type).toMatch("font");

        var mathcalParse = getParsed("\\mathcal C")[0];
        expect(mathcalParse.value.font).toMatch("mathcal");
        expect(mathcalParse.value.type).toMatch("font");

        var mathfrakParse = getParsed("\\mathfrak C")[0];
        expect(mathfrakParse.value.font).toMatch("mathfrak");
        expect(mathfrakParse.value.type).toMatch("font");
    });

    it("should parse nested font commands", function () {
        var nestedParse = getParsed("\\mathbb{R \\neq \\mathrm{R}}")[0];
        expect(nestedParse.value.font).toMatch("mathbb");
        expect(nestedParse.value.type).toMatch("font");

        expect(nestedParse.value.body.value.length).toMatch(3);
        var bbBody = nestedParse.value.body.value;
        expect(bbBody[0].type).toMatch("mathord");
        expect(bbBody[1].type).toMatch("rel");
        expect(bbBody[2].type).toMatch("font");
        expect(bbBody[2].value.font).toMatch("mathrm");
        expect(bbBody[2].value.type).toMatch("font");
    });

    it("should work with \\color", function () {
        var colorMathbbParse = getParsed("\\color{blue}{\\mathbb R}")[0];
        expect(colorMathbbParse.value.type).toMatch("color");
        expect(colorMathbbParse.value.color).toMatch("blue");
        var body = colorMathbbParse.value.value;
        expect(body.length).toMatch(1);
        expect(body[0].value.type).toMatch("font");
        expect(body[0].value.font).toMatch("mathbb");
    });

    it("should not parse a series of font commands", function () {
        expect("\\mathbb \\mathrm R").toNotParse();
    });
    
    it("should nest fonts correctly", function () {
        var bf = getParsed("\\mathbf{a\\mathrm{b}c}")[0];
        expect(bf.value.type).toMatch("font");
        expect(bf.value.font).toMatch("mathbf");
        expect(bf.value.body.value.length).toMatch(3);
        expect(bf.value.body.value[0].value).toMatch("a");
        expect(bf.value.body.value[1].value.type).toMatch("font");
        expect(bf.value.body.value[1].value.font).toMatch("mathrm");
        expect(bf.value.body.value[2].value).toMatch("c");
    });
    
    it("should have the correct greediness", function() {
        expect("e^\\mathbf{x}").toParse();
    });
});

describe("An HTML font tree-builder", function () {
    it("should render \\mathbb{R} with the correct font", function () {
        var markup = katex.renderToString("\\mathbb{R}");
        expect(markup).toContain("<span class=\"mord mathbb\">R</span>");
    });

    it("should render \\mathrm{R} with the correct font", function () {
        var markup = katex.renderToString("\\mathrm{R}");
        expect(markup).toContain("<span class=\"mord mathrm\">R</span>");
    });

    it("should render \\mathcal{R} with the correct font", function () {
        var markup = katex.renderToString("\\mathcal{R}");
        expect(markup).toContain("<span class=\"mord mathcal\">R</span>");
    });

    it("should render \\mathfrak{R} with the correct font", function () {
        var markup = katex.renderToString("\\mathfrak{R}");
        expect(markup).toContain("<span class=\"mord mathfrak\">R</span>");
    });

    it("should render a combination of font and color changes", function () {
        var markup = katex.renderToString("\\color{blue}{\\mathbb R}");
        var span = "<span class=\"mord mathbb\" style=\"color:blue;\">R</span>";
        expect(markup).toContain(span);

        markup = katex.renderToString("\\mathbb{\\color{blue}{R}}");
        span = "<span class=\"mord mathbb\" style=\"color:blue;\">R</span>";
        expect(markup).toContain(span);
    });
});


describe("A MathML font tree-builder", function () {
    var contents = "Ax2k\\omega\\Omega\\imath+";

    it("should render " + contents + " with the correct mathvariants", function () {
        var tree = getParsed(contents);
        var markup = buildMathML(tree, contents, defaultOptions).toMarkup();
        expect(markup).toContain("<mi>A</mi>");
        expect(markup).toContain("<mi>x</mi>");
        expect(markup).toContain("<mn>2</mn>");
        expect(markup).toContain("<mi>\u03c9</mi>");   // \omega
        expect(markup).toContain("<mi mathvariant=\"normal\">\u03A9</mi>");   // \Omega
        expect(markup).toContain("<mi>\u0131</mi>");   // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathbb{" + contents + "} with the correct mathvariants", function () {
        var tex = "\\mathbb{" + contents + "}";
        var tree = getParsed(tex);
        var markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi mathvariant=\"double-struck\">A</mi>");
        expect(markup).toContain("<mi>x</mi>");
        expect(markup).toContain("<mn mathvariant=\"normal\">2</mn>");
        expect(markup).toContain("<mi>\u03c9</mi>");                        // \omega
        expect(markup).toContain("<mi mathvariant=\"normal\">\u03A9</mi>"); // \Omega
        expect(markup).toContain("<mi>\u0131</mi>");                        // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathrm{" + contents + "} with the correct mathvariants", function () {
        var tex = "\\mathrm{" + contents + "}";
        var tree = getParsed(tex);
        var markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi mathvariant=\"normal\">A</mi>");
        expect(markup).toContain("<mi mathvariant=\"normal\">x</mi>");
        expect(markup).toContain("<mn mathvariant=\"normal\">2</mn>");
        expect(markup).toContain("<mi>\u03c9</mi>");   // \omega
        expect(markup).toContain("<mi mathvariant=\"normal\">\u03A9</mi>");   // \Omega
        expect(markup).toContain("<mi>\u0131</mi>");   // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathit{" + contents + "} with the correct mathvariants", function () {
        var tex = "\\mathit{" + contents + "}";
        var tree = getParsed(tex);
        var markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi mathvariant=\"italic\">A</mi>");
        expect(markup).toContain("<mi mathvariant=\"italic\">x</mi>");
        expect(markup).toContain("<mn mathvariant=\"italic\">2</mn>");
        expect(markup).toContain("<mi mathvariant=\"italic\">\u03c9</mi>");   // \omega
        expect(markup).toContain("<mi mathvariant=\"italic\">\u03A9</mi>");   // \Omega
        expect(markup).toContain("<mi mathvariant=\"italic\">\u0131</mi>");   // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathbf{" + contents + "} with the correct mathvariants", function () {
        var tex = "\\mathbf{" + contents + "}";
        var tree = getParsed(tex);
        var markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi mathvariant=\"bold\">A</mi>");
        expect(markup).toContain("<mi mathvariant=\"bold\">x</mi>");
        expect(markup).toContain("<mn mathvariant=\"bold\">2</mn>");
        expect(markup).toContain("<mi>\u03c9</mi>");                        // \omega
        expect(markup).toContain("<mi mathvariant=\"bold\">\u03A9</mi>");   // \Omega
        expect(markup).toContain("<mi>\u0131</mi>");                        // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathcal{" + contents + "} with the correct mathvariants", function () {
        var tex = "\\mathcal{" + contents + "}";
        var tree = getParsed(tex);
        var markup = buildMathML(tree, tex, defaultOptions).toMarkup();
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

    it("should render \\mathfrak{" + contents + "} with the correct mathvariants", function () {
        var tex = "\\mathfrak{" + contents + "}";
        var tree = getParsed(tex);
        var markup = buildMathML(tree, tex, defaultOptions).toMarkup();
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

    it("should render \\mathscr{" + contents + "} with the correct mathvariants", function () {
        var tex = "\\mathscr{" + contents + "}";
        var tree = getParsed(tex);
        var markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi mathvariant=\"script\">A</mi>");
        // MathJax marks everything below as "script" except \omega
        // We don't have these glyphs in "script" and neither does MathJax
        expect(markup).toContain("<mi>x</mi>");
        expect(markup).toContain("<mn mathvariant=\"normal\">2</mn>");
        expect(markup).toContain("<mi>\u03c9</mi>");                        // \omega
        expect(markup).toContain("<mi mathvariant=\"normal\">\u03A9</mi>"); // \Omega
        expect(markup).toContain("<mi>\u0131</mi>");                        // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render \\mathsf{" + contents + "} with the correct mathvariants", function () {
        var tex = "\\mathsf{" + contents + "}";
        var tree = getParsed(tex);
        var markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        expect(markup).toContain("<mi mathvariant=\"sans-serif\">A</mi>");
        expect(markup).toContain("<mi mathvariant=\"sans-serif\">x</mi>");
        expect(markup).toContain("<mn mathvariant=\"sans-serif\">2</mn>");
        expect(markup).toContain("<mi>\u03c9</mi>");                            // \omega
        expect(markup).toContain("<mi mathvariant=\"sans-serif\">\u03A9</mi>"); // \Omega
        expect(markup).toContain("<mi>\u0131</mi>");                            // \imath
        expect(markup).toContain("<mo>+</mo>");
    });

    it("should render a combination of font and color changes", function () {
        var tex = "\\color{blue}{\\mathbb R}";
        var tree = getParsed(tex);
        var markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        var node = "<mstyle mathcolor=\"blue\">" +
            "<mi mathvariant=\"double-struck\">R</mi>" +
            "</mstyle>";
        expect(markup).toContain(node);

        // reverse the order of the commands
        tex = "\\mathbb{\\color{blue}{R}}";
        tree = getParsed(tex);
        markup = buildMathML(tree, tex, defaultOptions).toMarkup();
        node = "<mstyle mathcolor=\"blue\">" +
            "<mi mathvariant=\"double-struck\">R</mi>" +
            "</mstyle>";
        expect(markup).toContain(node);
    });
});

describe("A bin builder", function() {
    it("should create mbins normally", function() {
        var built = getBuilt("x + y");

        expect(built[1].classes).toContain("mbin");
    });

    it("should create ords when at the beginning of lists", function() {
        var built = getBuilt("+ x");

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
        expect(getBuilt("\\blue{x+}+y")[1].classes).toContain("mord");
    });
});

describe("A markup generator", function() {
    it("marks trees up", function() {
        // Just a few quick sanity checks here...
        var markup = katex.renderToString("\\sigma^2");
        expect(markup.indexOf("<span")).toBe(0);
        expect(markup).toContain("\u03c3");  // sigma
        expect(markup).toContain("margin-right");
        expect(markup).not.toContain("marginRight");
    });

    it("generates both MathML and HTML", function() {
        var markup = katex.renderToString("a");

        expect(markup).toContain("<span");
        expect(markup).toContain("<math");
    });
});

describe("A parse tree generator", function() {
    it("generates a tree", function() {
        var tree = katex.__parse("\\sigma^2");
        expect(JSON.stringify(tree)).toEqual(JSON.stringify([
            {
                "type": "supsub",
                "value": {
                    "base": {
                        "type": "mathord",
                        "value": "\\sigma",
                        "mode": "math"
                    },
                    "sup": {
                        "type": "textord",
                        "value": "2",
                        "mode": "math"
                    },
                    "sub": undefined
                },
                "mode": "math"
            }
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
        var parse = getParsed("\\vec x")[0];

        expect(parse.type).toMatch("accent");
    });

    it("should be grouped more tightly than supsubs", function() {
        var parse = getParsed("\\vec x^2")[0];

        expect(parse.type).toMatch("supsub");
    });

    it("should not parse expanding accents", function() {
        expect("\\widehat{x}").toNotParse();
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

describe("A phantom parser", function() {
    it("should not fail", function() {
        expect("\\phantom{x}").toParse();
        expect("\\phantom{x^2}").toParse();
        expect("\\phantom{x}^2").toParse();
        expect("\\phantom x").toParse();
    });

    it("should build a phantom node", function() {
        var parse = getParsed("\\phantom{x}")[0];

        expect(parse.type).toMatch("phantom");
        expect(parse.value.value).toBeDefined();
    });
});

describe("A phantom builder", function() {
    it("should not fail", function() {
        expect("\\phantom{x}").toBuild();
        expect("\\phantom{x^2}").toBuild();
        expect("\\phantom{x}^2").toBuild();
        expect("\\phantom x").toBuild();
    });

    it("should make the children transparent", function() {
        var children = getBuilt("\\phantom{x+1}")[0].children;
        expect(children[0].style.color).toBe("transparent");
        expect(children[1].style.color).toBe("transparent");
        expect(children[2].style.color).toBe("transparent");
    });

    it("should make all descendants transparent", function() {
        var children = getBuilt("\\phantom{x+\\blue{1}}")[0].children;
        expect(children[0].style.color).toBe("transparent");
        expect(children[1].style.color).toBe("transparent");
        expect(children[2].children[0].style.color).toBe("transparent");
    });
});

describe("A parser error", function () {
    it("should report the position of an error", function () {
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
        var parse = getParsed("\\begin{array}r1\\\\20\\end{array}");
        expect(parse[0].type).toBe("array");
        expect(parse[0].value.cols).toEqual([
            { type: "align", align: "r" }
        ]);
    });

    it("should accept vertical separators", function() {
        var parse = getParsed("\\begin{array}{|l||c|}\\end{array}");
        expect(parse[0].type).toBe("array");
        expect(parse[0].value.cols).toEqual([
            { type: "separator", separator: "|" },
            { type: "align", align: "l" },
            { type: "separator", separator: "|" },
            { type: "separator", separator: "|" },
            { type: "align", align: "c" },
            { type: "separator", separator: "|" }
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

var getMathML = function(expr, settings) {
    var usedSettings = settings ? settings : defaultSettings;

    expect(expr).toParse(usedSettings);

    var built = buildMathML(parseTree(expr, usedSettings), expr, usedSettings);

    // Strip off the surrounding <span>
    return built.children[0];
};

describe("A MathML builder", function() {
    it("should generate math nodes", function() {
        var node = getMathML("x^2");

        expect(node.type).toEqual("math");
    });

    it("should generate appropriate MathML types", function() {
        var identifier = getMathML("x").children[0].children[0];
        expect(identifier.children[0].type).toEqual("mi");

        var number = getMathML("1").children[0].children[0];
        expect(number.children[0].type).toEqual("mn");

        var operator = getMathML("+").children[0].children[0];
        expect(operator.children[0].type).toEqual("mo");

        var space = getMathML("\\;").children[0].children[0];
        expect(space.children[0].type).toEqual("mspace");

        var text = getMathML("\\text{a}").children[0].children[0];
        expect(text.children[0].type).toEqual("mtext");

        var textop = getMathML("\\sin").children[0].children[0];
        expect(textop.children[0].type).toEqual("mi");
    });

    it("should generate a <mphantom> node for \\phantom", function() {
        var phantom = getMathML("\\phantom{x}").children[0].children[0];
        expect(phantom.children[0].type).toEqual("mphantom");
    });
});

describe("A parser that does not throw on unsupported commands", function() {
    // The parser breaks on unsupported commands unless it is explicitly
    // told not to
    var errorColor = "#933";
    var noThrowSettings = new Settings({
        throwOnError: false,
        errorColor: errorColor
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
        var parsedInput = getParsed("\\error", noThrowSettings);
        expect(parsedInput[0].type).toBe("color");
        expect(parsedInput[0].value.color).toBe(errorColor);
    });
});
