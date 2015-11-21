/* global beforeEach: false */
/* global jasmine: false */
/* global expect: false */
/* global it: false */
/* global describe: false */

var parseTree = require("../src/parseTree");
var Settings = require("../src/Settings");

var defaultSettings = new Settings({});

beforeEach(function() {
    jasmine.addMatchers({
        toFailWithParseError: function(util, customEqualityTesters) {
            var prefix = "KaTeX parse error: ";
            return {
                compare: function(actual, expected) {
                    try {
                        parseTree(actual, defaultSettings);
                        return {
                            pass: false,
                            message: "'" + actual + "' parsed without error"
                        };
                    } catch (e) {
                        if (expected === undefined) {
                            return {
                                pass: true,
                                message: "'" + actual + "' parsed with error"
                            };
                        }
                        var msg = e.message;
                        var exp = prefix + expected;
                        if (msg === exp) {
                            return {
                                pass: true,
                                message: "'" + actual + "'" +
                                    " parsed with error '" + expected + "'"
                            };
                        } else if (msg.slice(0, 19) === prefix) {
                            return {
                                pass: false,
                                message: "'" + actual + "'" +
                                    " parsed with error '" + msg.slice(19) +
                                    "' but expected '" + expected + "'"
                            };
                        } else {
                            return {
                                pass: false,
                                message: "'" + actual + "'" +
                                    " caused error '" + msg +
                                    "' but expected '" + exp + "'"
                            };
                        }
                    }
                }
            };
        }
    });
});

describe("Parser:", function() {

    describe("#handleInfixNodes", function() {
        // TODO: The position information here is broken, should be fixed.
        it("rejects repeated infix operators", function() {
            expect("1\\over 2\\over 3").toFailWithParseError(
                   "only one infix operator per group at position -1: " +
                   "1\\over 2\\over ");
        });
        it("rejects conflicting infix operators", function() {
            expect("1\\over 2\\choose 3").toFailWithParseError(
                   "only one infix operator per group at position -1: " +
                   "1\\over 2\\choos");
        });
    });

    describe("#handleSupSubscript", function() {
        it("rejects ^ at end of group", function() {
            expect("{1^}").toFailWithParseError(
                   "Expected group after '^' at position 3: {1^̲}");
        });
        it("rejects _ at end of input", function() {
            expect("1_").toFailWithParseError(
                   "Expected group after '_' at position 2: 1_̲");
        });
        it("rejects \\sqrt as argument to ^", function() {
            expect("1^\\sqrt{2}").toFailWithParseError(
                   "Got function '\\sqrt' with no arguments as superscript" +
                   " at position 2: 1^̲\\sqrt{2}");
        });
    });

    describe("#parseAtom", function() {
        // TODO: The positions in the following error messages appear to be
        // off by one, i.e. they should be one character later.
        it("rejects \\limits without operator", function() {
            expect("\\alpha\\limits\\omega").toFailWithParseError(
                   "Limit controls must follow a math operator" +
                   " at position 6: \\alpha̲\\limits\\omega");
        });
        it("rejects \\limits at the beginning of the input", function() {
            expect("\\limits\\omega").toFailWithParseError(
                   "Limit controls must follow a math operator" +
                   " at position 0: ̲\\limits\\omega");
        });
        it("rejects double superscripts", function() {
            expect("1^2^3").toFailWithParseError(
                   "Double superscript at position 3: 1^2̲^3");
            expect("1^{2+3}_4^5").toFailWithParseError(
                   "Double superscript at position 9: 1^{2+3}_4̲^5");
        });
        it("rejects double subscripts", function() {
            expect("1_2_3").toFailWithParseError(
                   "Double subscript at position 3: 1_2̲_3");
            expect("1_{2+3}^4_5").toFailWithParseError(
                   "Double subscript at position 9: 1_{2+3}^4̲_5");
        });
    });

    describe("#parseImplicitGroup", function() {
        it("reports unknown environments", function() {
            expect("\\begin{foo}bar\\end{foo}").toFailWithParseError(
                   "No such environment: foo at position 11:" +
                   " \\begin{foo}̲bar\\end{foo}");
        });
        it("reports mismatched environments", function() {
            expect("\\begin{pmatrix}1&2\\\\3&4\\end{bmatrix}+5")
                .toFailWithParseError(
                   "Mismatch: \\begin{pmatrix} matched by \\end{bmatrix}");
        });
    });

    describe("#parseFunction", function() {
        it("rejects math-mode functions in text mode", function() {
            // TODO: The position info is missing here
            expect("\\text{\\sqrt2 is irrational}").toFailWithParseError(
                   "Can't use function '\\sqrt' in text mode");
        });
    });

    describe("#parseArguments", function() {
        it("complains about missing argument at end of input", function() {
            expect("2\\sqrt").toFailWithParseError(
                   "Expected group after '\\sqrt' at position 6: 2\\sqrt̲");
        });
        it("complains about missing argument at end of group", function() {
            expect("1^{2\\sqrt}").toFailWithParseError(
                   "Expected group after '\\sqrt' at position 9: 1^{2\\sqrt̲}");
        });
        it("complains about functions as arguments to others", function() {
            // TODO: The position looks pretty wrong here
            expect("\\sqrt\\over2").toFailWithParseError(
                   "Got function '\\over' as argument to '\\sqrt'" +
                   " at position 9: \\sqrt\\ove̲r2");
        });
    });

    describe("#parseArguments", function() {
        it("complains about missing argument at end of input", function() {
            expect("2\\sqrt").toFailWithParseError(
                   "Expected group after '\\sqrt' at position 6: 2\\sqrt̲");
        });
        it("complains about missing argument at end of group", function() {
            expect("1^{2\\sqrt}").toFailWithParseError(
                   "Expected group after '\\sqrt' at position 9: 1^{2\\sqrt̲}");
        });
        it("complains about functions as arguments to others", function() {
            // TODO: The position looks pretty wrong here
            expect("\\sqrt\\over2").toFailWithParseError(
                   "Got function '\\over' as argument to '\\sqrt'" +
                   " at position 9: \\sqrt\\ove̲r2");
        });
    });

});

describe("Parser.expect calls:", function() {

    describe("#parseInput expecting EOF", function() {
        it("complains about extra }", function() {
            expect("{1+2}}").toFailWithParseError(
                   "Expected 'EOF', got '}' at position 6: {1+2}}̲");
        });
        it("complains about extra \\end", function() {
            expect("x\\end{matrix}").toFailWithParseError(
                   "Expected 'EOF', got '\\end' at position 5:" +
                   " x\\end̲{matrix}");
        });
        it("complains about top-level \\\\", function() {
            expect("1\\\\2").toFailWithParseError(
                   "Expected 'EOF', got '\\\\' at position 3: 1\\\\̲2");
        });
        it("complains about top-level &", function() {
            expect("1&2").toFailWithParseError(
                   "Expected 'EOF', got '&' at position 2: 1&̲2");
        });
    });

    describe("#parseImplicitGroup expecting \\right", function() {
        it("rejects missing \\right", function() {
            expect("\\left(1+2)").toFailWithParseError(
                   "Expected '\\right', got 'EOF' at position 10:" +
                   " \\left(1+2)̲");
        });
        it("rejects incorrectly scoped \\right", function() {
            expect("{\\left(1+2}\\right)").toFailWithParseError(
                   "Expected '\\right', got '}' at position 11:" +
                   " {\\left(1+2}̲\\right)");
        });
    });

    // Can't test the expectation for \end after an environment
    // since all existing arrays use parseArray which has its own expectation.

    describe("#parseSpecialGroup expecting braces", function() {
        it("complains about missing { for color", function() {
            expect("\\color#ffffff{text}").toFailWithParseError(
                   "Expected '{', got '#' at position 7:" +
                   " \\color#̲ffffff{text}");
        });
        it("complains about missing { for size", function() {
            expect("\\rule{1em}[2em]").toFailWithParseError(
                   "Expected '{', got '[' at position 11: \\rule{1em}[̲2em]");
        });
        // Can't test for the [ of an optional group since it's optional
        it("complains about missing } for color", function() {
            expect("\\color{#ffffff {text}").toFailWithParseError(
                   "Expected '}', got '{' at position 16:" +
                   " color{#ffffff {̲text}");
        });
        it("complains about missing ] for size", function() {
            expect("\\rule[1em{2em}{3em}").toFailWithParseError(
                   "Expected ']', got '{' at position 10:" +
                   " \\rule[1em{̲2em}{3em}");
        });
    });

    describe("#parseGroup expecting }", function() {
        it("at end of file", function() {
            expect("\\sqrt{2").toFailWithParseError(
                   "Expected '}', got 'EOF' at position 7: \\sqrt{2̲");
        });
    });

    describe("#parseOptionalGroup expecting ]", function() {
        it("at end of file", function() {
            expect("\\sqrt[3").toFailWithParseError(
                   "Expected ']', got 'EOF' at position 7: \\sqrt[3̲");
        });
        it("before group", function() {
            expect("\\sqrt[3{2}").toFailWithParseError(
                   "Expected ']', got 'EOF' at position 10: \\sqrt[3{2}̲");
        });
    });

});

describe("environments.js:", function() {

    describe("parseArray", function() {
        it("rejects missing \\end", function() {
            expect("\\begin{matrix}1").toFailWithParseError(
                   "Expected & or \\\\ or \\end at position 15:" +
                   " \\begin{matrix}1̲");
        });
        it("rejects incorrectly scoped \\end", function() {
            expect("{\\begin{matrix}1}\\end{matrix}").toFailWithParseError(
                   "Expected & or \\\\\ or \\end at position 17:" + 
                   " begin{matrix}1}̲\\end{matrix}");
        });
    });

    describe("array environment", function() {
        it("rejects unknown column types", function() {
            // TODO: The error position here looks strange
            expect("\\begin{array}{cba}\\end{array}").toFailWithParseError(
                   "Unknown column alignment: b at position 18:" +
                   " gin{array}{cba}̲\\end{array}");
        });
    });

});

describe("functions.js:", function() {

    describe("delimiter functions", function() {
        it("reject invalid opening delimiters", function() {
            expect("\\bigl 1 + 2 \\bigr").toFailWithParseError(
                   "Invalid delimiter: '1' after '\\bigl' at position 7:" +
                   " \\bigl 1̲ + 2 \\bigr");
        });
        it("reject invalid closing delimiters", function() {
            expect("\\bigl(1+2\\bigr=3").toFailWithParseError(
                   "Invalid delimiter: '=' after '\\bigr' at position 15:" +
                   " \\bigl(1+2\\bigr=̲3");
        });
    });

    describe("\\begin and \\end", function() {
        it("reject invalid environment names", function() {
            expect("\\begin{foobar}\\end{foobar}").toFailWithParseError(
                   "No such environment: foobar at position 14:" +
                   " \\begin{foobar}̲\\end{foobar}");
        });
    });

});

describe("Lexer:", function() {

    describe("#_innerLex", function() {
        it("rejects lone surrogate char", function() {
            expect("\udcba").toFailWithParseError(
                   "Unexpected character: '\udcba' at position 0:" +
                    " \u0332\udcba");
        });
        it("rejects lone backslash at end of input", function() {
            expect("\\").toFailWithParseError(
                   "Unexpected character: '\\' at position 0: ̲\\");
        });
    });

    describe("#_innerLexColor", function() {
        it("reject hex notation without #", function() {
            expect("\\color{1a2b3c}{foo}").toFailWithParseError(
                   "Invalid color at position 7: \\color{̲1a2b3c}{foo}");
        });
    });

    describe("#_innerLexSize", function() {
        it("reject size without unit", function() {
            expect("\\rule{0}{2em}").toFailWithParseError(
                   "Invalid size at position 6: \\rule{̲0}{2em}");
        });
        it("reject size with bogus unit", function() {
            expect("\\rule{1au}{2em}").toFailWithParseError(
                   "Invalid unit: 'au' at position 6: \\rule{̲1au}{2em}");
        });
        it("reject size without number", function() {
            expect("\\rule{em}{2em}").toFailWithParseError(
                   "Invalid size at position 6: \\rule{̲em}{2em}");
        });
    });

});
