/* global beforeEach: false */
/* global expect: false */
/* global it: false */
/* global describe: false */

import parseTree from "../src/parseTree";
import Settings from "../src/Settings";

const defaultSettings = new Settings({});

beforeEach(function() {
    const prefix = "KaTeX parse error: ";

    expect.extend({
        toFailWithParseError: function(actual, expected) {
            try {
                parseTree(actual, defaultSettings);
                return {
                    pass: false,
                    message: "'" + actual + "' parsed without error",
                };
            } catch (e) {
                if (expected === undefined) {
                    return {
                        pass: true,
                        message: "'" + actual + "' parsed with error",
                    };
                }
                const msg = e.message;
                const exp = prefix + expected;
                if (msg === exp) {
                    return {
                        pass: true,
                        message: "'" + actual + "'" +
                            " parsed with error '" + expected + "'",
                    };
                } else if (msg.slice(0, 19) === prefix) {
                    return {
                        pass: false,
                        message: "'" + actual + "'" +
                            " parsed with error '" + msg.slice(19) +
                            "' but expected '" + expected + "'",
                    };
                } else {
                    return {
                        pass: false,
                        message: "'" + actual + "'" +
                            " caused error '" + msg +
                            "' but expected '" + exp + "'",
                    };
                }
            }
        },
    });
});

describe("Parser:", function() {

    describe("#handleInfixNodes", function() {
        it("rejects repeated infix operators", function() {
            expect("1\\over 2\\over 3").toFailWithParseError(
                   "only one infix operator per group at position 9: " +
                   "1\\over 2\\̲o̲v̲e̲r̲ 3");
        });
        it("rejects conflicting infix operators", function() {
            expect("1\\over 2\\choose 3").toFailWithParseError(
                   "only one infix operator per group at position 9: " +
                   "1\\over 2\\̲c̲h̲o̲o̲s̲e̲ 3");
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
        it("rejects \\limits without operator", function() {
            expect("\\alpha\\limits\\omega").toFailWithParseError(
                   "Limit controls must follow a math operator" +
                   " at position 7: \\alpha\\̲l̲i̲m̲i̲t̲s̲\\omega");
        });
        it("rejects \\limits at the beginning of the input", function() {
            expect("\\limits\\omega").toFailWithParseError(
                   "Limit controls must follow a math operator" +
                   " at position 1: \\̲l̲i̲m̲i̲t̲s̲\\omega");
        });
        it("rejects double superscripts", function() {
            expect("1^2^3").toFailWithParseError(
                   "Double superscript at position 4: 1^2^̲3");
            expect("1^{2+3}_4^5").toFailWithParseError(
                   "Double superscript at position 10: 1^{2+3}_4^̲5");
        });
        it("rejects double superscripts involving primes", function() {
            expect("1'_2^3").toFailWithParseError(
                   "Double superscript at position 5: 1'_2^̲3");
            expect("1^2'").toFailWithParseError(
                   "Double superscript at position 4: 1^2'̲");
            expect("1^2_3'").toFailWithParseError(
                   "Double superscript at position 6: 1^2_3'̲");
            expect("1'_2'").toFailWithParseError(
                   "Double superscript at position 5: 1'_2'̲");
        });
        it("rejects double subscripts", function() {
            expect("1_2_3").toFailWithParseError(
                   "Double subscript at position 4: 1_2_̲3");
            expect("1_{2+3}^4_5").toFailWithParseError(
                   "Double subscript at position 10: 1_{2+3}^4_̲5");
        });
    });

    describe("#parseImplicitGroup", function() {
        it("reports unknown environments", function() {
            expect("\\begin{foo}bar\\end{foo}").toFailWithParseError(
                   "No such environment: foo at position 7:" +
                   " \\begin{̲f̲o̲o̲}̲bar\\end{foo}");
        });
        it("reports mismatched environments", function() {
            expect("\\begin{pmatrix}1&2\\\\3&4\\end{bmatrix}+5")
                .toFailWithParseError(
                   "Mismatch: \\begin{pmatrix} matched by \\end{bmatrix}" +
                   " at position 24: …matrix}1&2\\\\3&4\\̲e̲n̲d̲{bmatrix}+5");
        });
    });

    describe("#parseFunction", function() {
        it("rejects math-mode functions in text mode", function() {
            expect("\\text{\\sqrt2 is irrational}").toFailWithParseError(
                "Can't use function '\\sqrt' in text mode" +
                " at position 7: \\text{\\̲s̲q̲r̲t̲2 is irrational…");
        });
        it("rejects text-mode-only functions in math mode", function() {
            expect("\\'echec").toFailWithParseError(
                "Can't use function '\\'' in math mode" +
                " at position 1: \\̲'̲echec");
        });
    });

    describe("#parseArguments", function() {
        it("complains about missing argument at end of input", function() {
            expect("2\\sqrt").toFailWithParseError(
                   "Expected group after '\\sqrt' at end of input: 2\\sqrt");
        });
        it("complains about missing argument at end of group", function() {
            expect("1^{2\\sqrt}").toFailWithParseError(
                   "Expected group after '\\sqrt'" +
                   " at position 10: 1^{2\\sqrt}̲");
        });
        it("complains about functions as arguments to others", function() {
            // TODO: The position looks pretty wrong here
            expect("\\sqrt\\over2").toFailWithParseError(
                   "Got function '\\over' as argument to '\\sqrt'" +
                   " at position 6: \\sqrt\\̲o̲v̲e̲r̲2");
        });
    });

    describe("#parseArguments", function() {
        it("complains about missing argument at end of input", function() {
            expect("2\\sqrt").toFailWithParseError(
                   "Expected group after '\\sqrt' at end of input: 2\\sqrt");
        });
        it("complains about missing argument at end of group", function() {
            expect("1^{2\\sqrt}").toFailWithParseError(
                   "Expected group after '\\sqrt'" +
                   " at position 10: 1^{2\\sqrt}̲");
        });
        it("complains about functions as arguments to others", function() {
            // TODO: The position looks pretty wrong here
            expect("\\sqrt\\over2").toFailWithParseError(
                   "Got function '\\over' as argument to '\\sqrt'" +
                   " at position 6: \\sqrt\\̲o̲v̲e̲r̲2");
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
                   "Expected 'EOF', got '\\end' at position 2:" +
                   " x\\̲e̲n̲d̲{matrix}");
        });
        it("complains about top-level \\\\", function() {
            expect("1\\\\2").toFailWithParseError(
                   "Expected 'EOF', got '\\\\' at position 2: 1\\̲\\̲2");
        });
        it("complains about top-level &", function() {
            expect("1&2").toFailWithParseError(
                   "Expected 'EOF', got '&' at position 2: 1&̲2");
        });
    });

    describe("#parseImplicitGroup expecting \\right", function() {
        it("rejects missing \\right", function() {
            expect("\\left(1+2)").toFailWithParseError(
                   "Expected '\\right', got 'EOF' at end of input:" +
                   " \\left(1+2)");
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
            expect("\\textcolor#ffffff{text}").toFailWithParseError(
                   "Expected '{', got '#' at position 11:" +
                   " \\textcolor#̲ffffff{text}");
        });
        it("complains about missing { for size", function() {
            expect("\\rule{1em}[2em]").toFailWithParseError(
                   "Invalid size: '[' at position 11: \\rule{1em}[̲2em]");
        });
        // Can't test for the [ of an optional group since it's optional
        it("complains about missing } for color", function() {
            expect("\\textcolor{#ffffff{text}").toFailWithParseError(
                   "Invalid color: '#ffffff{text' at position 12:" +
                   " \\textcolor{#̲f̲f̲f̲f̲f̲f̲{̲t̲e̲x̲t̲}");
        });
        it("complains about missing ] for size", function() {
            expect("\\rule[1em{2em}{3em}").toFailWithParseError(
                   "Unexpected end of input in size" +
                   " at position 7: \\rule[1̲e̲m̲{̲2̲e̲m̲}̲{̲3̲e̲m̲}̲");
        });
        it("complains about missing ] for size at end of input", function() {
            expect("\\rule[1em").toFailWithParseError(
                   "Unexpected end of input in size" +
                   " at position 7: \\rule[1̲e̲m̲");
        });
        it("complains about missing } for color at end of input", function() {
            expect("\\textcolor{#123456").toFailWithParseError(
                   "Unexpected end of input in color" +
                   " at position 12: \\textcolor{#̲1̲2̲3̲4̲5̲6̲");
        });
    });

    describe("#parseGroup expecting }", function() {
        it("at end of file", function() {
            expect("\\sqrt{2").toFailWithParseError(
                   "Expected '}', got 'EOF' at end of input: \\sqrt{2");
        });
    });

    describe("#parseOptionalGroup expecting ]", function() {
        it("at end of file", function() {
            expect("\\sqrt[3").toFailWithParseError(
                   "Expected ']', got 'EOF' at end of input: \\sqrt[3");
        });
        it("before group", function() {
            expect("\\sqrt[3{2}").toFailWithParseError(
                   "Expected ']', got 'EOF' at end of input: \\sqrt[3{2}");
        });
    });

});

describe("environments.js:", function() {

    describe("parseArray", function() {
        it("rejects missing \\end", function() {
            expect("\\begin{matrix}1").toFailWithParseError(
                   "Expected & or \\\\ or \\end at end of input:" +
                   " \\begin{matrix}1");
        });
        it("rejects incorrectly scoped \\end", function() {
            expect("{\\begin{matrix}1}\\end{matrix}").toFailWithParseError(
                   "Expected & or \\\\ or \\end at position 17:" +
                   " …\\begin{matrix}1}̲\\end{matrix}");
        });
    });

    describe("array environment", function() {
        it("rejects unknown column types", function() {
            // TODO: The error position here looks strange
            expect("\\begin{array}{cba}\\end{array}").toFailWithParseError(
                   "Unknown column alignment: b at position 16:" +
                   " \\begin{array}{cb̲a}\\end{array}");
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
            expect("\\begin x\\end y").toFailWithParseError(
                   "Invalid environment name at position 8: \\begin x̲\\end y");
        });
    });

});

describe("Lexer:", function() {

    describe("#_innerLex", function() {
        it("rejects lone surrogate char", function() {
            expect("\udcba").toFailWithParseError(
                   "Unexpected character: '\udcba' at position 1:" +
                    " \udcba\u0332");
        });
        it("rejects lone backslash at end of input", function() {
            expect("\\").toFailWithParseError(
                   "Unexpected character: '\\' at position 1: \\̲");
        });
    });

    describe("#_innerLexColor", function() {
        it("reject hex notation without #", function() {
            expect("\\textcolor{1a2b3c}{foo}").toFailWithParseError(
                   "Invalid color: '1a2b3c'" +
                   " at position 12: \\textcolor{1̲a̲2̲b̲3̲c̲}{foo}");
        });
    });

    describe("#_innerLexSize", function() {
        it("reject size without unit", function() {
            expect("\\rule{0}{2em}").toFailWithParseError(
                   "Invalid size: '0' at position 7: \\rule{0̲}{2em}");
        });
        it("reject size with bogus unit", function() {
            expect("\\rule{1au}{2em}").toFailWithParseError(
                   "Invalid unit: 'au' at position 7: \\rule{1̲a̲u̲}{2em}");
        });
        it("reject size without number", function() {
            expect("\\rule{em}{2em}").toFailWithParseError(
                   "Invalid size: 'em' at position 7: \\rule{e̲m̲}{2em}");
        });
    });

});
