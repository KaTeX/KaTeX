var buildTree = require("../buildTree");
var parseTree = require("../parseTree");

describe("A parser", function() {
    it("should not fail on an empty string", function() {
        expect(function() {
            parseTree("");
        }).not.toThrow();
    });

    it("should ignore whitespace", function() {
        var parseA = parseTree("    x    y    ");
        var parseB = parseTree("xy");
        expect(parseA).toEqual(parseB);
    });
});

describe("An ord parser", function() {
    var expression = "1234|/@.\"`abcdefgzABCDEFGZ";

    it("should not fail", function() {
        expect(function() {
            parseTree(expression);
        }).not.toThrow();
    });

    it("should build a list of ords", function() {
        var parse = parseTree(expression);

        expect(parse).toBeTruthy();

        for (var i = 0; i < parse.length; i++) {
            var group = parse[i];
            expect(group.type).toMatch("ord");
        }
    });

    it("should parse the right number of ords", function() {
        var parse = parseTree(expression);

        expect(parse.length).toBe(expression.length);
    });
});

describe("A bin parser", function() {
    var expression = "+-*\\cdot\\pm\\div";

    it("should not fail", function() {
        expect(function() {
            parseTree(expression);
        }).not.toThrow();
    });

    it("should build a list of bins", function() {
        var parse = parseTree(expression);
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
        expect(function() {
            parseTree(expression);
        }).not.toThrow();
    });

    it("should build a list of rels", function() {
        var parse = parseTree(expression);
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
        expect(function() {
            parseTree(expression);
        }).not.toThrow();
    });

    it("should build a list of puncts", function() {
        var parse = parseTree(expression);
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
        expect(function() {
            parseTree(expression);
        }).not.toThrow();
    });

    it("should build a list of opens", function() {
        var parse = parseTree(expression);
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
        expect(function() {
            parseTree(expression);
        }).not.toThrow();
    });

    it("should build a list of closes", function() {
        var parse = parseTree(expression);
        expect(parse).toBeTruthy();

        for (var i = 0; i < parse.length; i++) {
            var group = parse[i];
            expect(group.type).toMatch("close");
        }
    });
});

describe("A subscript and superscript parser", function() {
    it("should not fail on superscripts", function() {
        expect(function() {
            parseTree("x^2");
        }).not.toThrow();
    });

    it("should not fail on subscripts", function() {
        expect(function() {
            parseTree("x_3");
        }).not.toThrow();
    });

    it("should not fail on both subscripts and superscripts", function() {
        expect(function() {
            parseTree("x^2_3");
        }).not.toThrow();

        expect(function() {
            parseTree("x_2^3");
        }).not.toThrow();
    });

    it("should not fail when there is no nucleus", function() {
        expect(function() {
            parseTree("^3");
        }).not.toThrow();

        expect(function() {
            parseTree("_2");
        }).not.toThrow();

        expect(function() {
            parseTree("^3_2");
        }).not.toThrow();

        expect(function() {
            parseTree("_2^3");
        }).not.toThrow();
    });

    it("should produce supsubs for superscript", function() {
        var parse = parseTree("x^2")[0];

        expect(parse.type).toBe("supsub");
        expect(parse.value.base).toBeDefined();
        expect(parse.value.sup).toBeDefined();
        expect(parse.value.sub).toBeUndefined();
    });

    it("should produce supsubs for subscript", function() {
        var parse = parseTree("x_3")[0];

        expect(parse.type).toBe("supsub");
        expect(parse.value.base).toBeDefined();
        expect(parse.value.sub).toBeDefined();
        expect(parse.value.sup).toBeUndefined();
    });

    it("should produce supsubs for ^_", function() {
        var parse = parseTree("x^2_3")[0];

        expect(parse.type).toBe("supsub");
        expect(parse.value.base).toBeDefined();
        expect(parse.value.sup).toBeDefined();
        expect(parse.value.sub).toBeDefined();
    });

    it("should produce supsubs for _^", function() {
        var parse = parseTree("x_3^2")[0];

        expect(parse.type).toBe("supsub");
        expect(parse.value.base).toBeDefined();
        expect(parse.value.sup).toBeDefined();
        expect(parse.value.sub).toBeDefined();
    });

    it("should produce the same thing regardless of order", function() {
        var parseA = parseTree("x^2_3");
        var parseB = parseTree("x_3^2");

        expect(parseA).toEqual(parseB);
    });

    it("should not parse double subscripts or superscripts", function() {
        expect(function() {
            parseTree("x^x^x");
        }).toThrow();

        expect(function() {
            parseTree("x_x_x");
        }).toThrow();

        expect(function() {
            parseTree("x_x^x_x");
        }).toThrow();

        expect(function() {
            parseTree("x_x^x^x");
        }).toThrow();

        expect(function() {
            parseTree("x^x_x_x");
        }).toThrow();

        expect(function() {
            parseTree("x^x_x^x");
        }).toThrow();
    });

    it("should work correctly with {}s", function() {
        expect(function() {
            parseTree("x^{2+3}");
        }).not.toThrow();

        expect(function() {
            parseTree("x_{3-2}");
        }).not.toThrow();

        expect(function() {
            parseTree("x^{2+3}_3");
        }).not.toThrow();

        expect(function() {
            parseTree("x^2_{3-2}");
        }).not.toThrow();

        expect(function() {
            parseTree("x^{2+3}_{3-2}");
        }).not.toThrow();

        expect(function() {
            parseTree("x_{3-2}^{2+3}");
        }).not.toThrow();

        expect(function() {
            parseTree("x_3^{2+3}");
        }).not.toThrow();

        expect(function() {
            parseTree("x_{3-2}^2");
        }).not.toThrow();
    });
});

describe("A subscript and superscript tree-builder", function() {
    it("should not fail when there is no nucleus", function() {
        expect(function() {
            buildTree(parseTree("^3"));
        }).not.toThrow();

        expect(function() {
            buildTree(parseTree("_2"));
        }).not.toThrow();

        expect(function() {
            buildTree(parseTree("^3_2"));
        }).not.toThrow();

        expect(function() {
            buildTree(parseTree("_2^3"));
        }).not.toThrow();
    });
});

describe("A group parser", function() {
    it("should not fail", function() {
        expect(function() {
            parseTree("{xy}");
        }).not.toThrow();
    });

    it("should produce a single ord", function() {
        var parse = parseTree("{xy}");

        expect(parse.length).toBe(1);

        var ord = parse[0];

        expect(ord.type).toMatch("ord");
        expect(ord.value).toBeTruthy();
    });
});

describe("An implicit group parser", function() {
    it("should not fail", function() {
        expect(function() {
            parseTree("\\Large x");
            parseTree("abc {abc \Large xyz} abc");
        }).not.toThrow();
    });

    it("should produce a single object", function() {
        var parse = parseTree("\\Large abc");

        expect(parse.length).toBe(1);

        var sizing = parse[0];

        expect(sizing.type).toMatch("sizing");
        expect(sizing.value).toBeTruthy();
    });

    it("should apply only after the function", function() {
        var parse = parseTree("a \\Large abc");

        expect(parse.length).toBe(2);

        var sizing = parse[1];

        expect(sizing.type).toMatch("sizing");
        expect(sizing.value.value.value.length).toBe(3);
    });

    it("should stop at the ends of groups", function() {
        var parse = parseTree("a { b \\Large c } d");

        var group = parse[1];
        var sizing = group.value[1];

        expect(sizing.type).toMatch("sizing");
        expect(sizing.value.value.value.length).toBe(1);
    });
});

describe("A function parser", function() {
    it("should parse no argument functions", function() {
        expect(function() {
            parseTree("\\div");
        }).not.toThrow();
    });

    it("should parse 1 argument functions", function() {
        expect(function() {
            parseTree("\\blue x");
        }).not.toThrow();
    });

    it("should parse 2 argument functions", function() {
        expect(function() {
            parseTree("\\frac 1 2");
        }).not.toThrow();
    });

    it("should not parse 1 argument functions with no arguments", function() {
        expect(function() {
            parseTree("\\blue");
        }).toThrow();
    });

    it("should not parse 2 argument functions with 0 or 1 arguments", function() {
        expect(function() {
            parseTree("\\frac");
        }).toThrow();

        expect(function() {
            parseTree("\\frac 1");
        }).toThrow();
    });

    it("should not parse a function with text right after it", function() {
        expect(function() {
            parseTree("\\redx");
        }).toThrow();
    });

    it("should parse a function with a number right after it", function() {
        expect(function() {
            parseTree("\\frac12");
        }).not.toThrow();
    });

    it("should parse some functions with text right after it", function() {
        expect(function() {
            parseTree("\\;x");
        }).not.toThrow();
    });
});

describe("A frac parser", function() {
    var expression = "\\frac{x}{y}";
    var dfracExpression = "\\dfrac{x}{y}";
    var tfracExpression = "\\tfrac{x}{y}";

    it("should not fail", function() {
        expect(function() {
            parseTree(expression);
        }).not.toThrow();
    });

    it("should produce a frac", function() {
        var parse = parseTree(expression)[0];

        expect(parse.type).toMatch("frac");
        expect(parse.value.numer).toBeDefined();
        expect(parse.value.denom).toBeDefined();
    });

    it("should also parse dfrac and tfrac", function() {
        expect(function() {
            parseTree(dfracExpression);
        }).not.toThrow();

        expect(function() {
            parseTree(tfracExpression);
        }).not.toThrow();
    });

    it("should parse dfrac and tfrac as fracs", function() {
        var dfracParse = parseTree(dfracExpression)[0];

        expect(dfracParse.type).toMatch("frac");
        expect(dfracParse.value.numer).toBeDefined();
        expect(dfracParse.value.denom).toBeDefined();

        var tfracParse = parseTree(tfracExpression)[0];

        expect(tfracParse.type).toMatch("frac");
        expect(tfracParse.value.numer).toBeDefined();
        expect(tfracParse.value.denom).toBeDefined();
    });
});

describe("A sizing parser", function() {
    var sizeExpression = "\\Huge{x}\\small{x}";
    var nestedSizeExpression = "\\Huge{\\small{x}}";

    it("should not fail", function() {
        expect(function() {
            parseTree(sizeExpression);
        }).not.toThrow();
    });

    it("should produce a sizing node", function() {
        var parse = parseTree(sizeExpression)[0];

        expect(parse.type).toMatch("sizing");
        expect(parse.value).toBeDefined();
    });

    it("should not parse a nested size expression", function() {
        expect(function() {
            parseExpression(nestedSizeExpression);
        }).toThrow();
    });
});

describe("A text parser", function() {
    var textExpression = "\\text{a b}";
    var badTextExpression = "\\text{a b%}";
    var badTextExpression2 = "\\text x";
    var nestedTextExpression = "\\text{a {b} \\blue{c}}";
    var spaceTextExpression = "\\text{  a \\ }";
    var leadingSpaceTextExpression = "\\text {moo}";

    it("should not fail", function() {
        expect(function() {
            parseTree(textExpression);
        }).not.toThrow();
    });

    it("should produce a text", function() {
        var parse = parseTree(textExpression)[0];

        expect(parse.type).toMatch("text");
        expect(parse.value).toBeDefined();
    });

    it("should produce textords instead of mathords", function() {
        var parse = parseTree(textExpression)[0];
        var group = parse.value.value;

        expect(group[0].type).toMatch("textord");
    });

    it("should not parse bad text", function() {
        expect(function() {
            parseTree(badTextExpression);
        }).toThrow();
        expect(function() {
            parseTree(badTextExpression2);
        }).toThrow();
    });

    it("should parse nested expressions", function() {
        expect(function() {
            parseTree(nestedTextExpression);
        }).not.toThrow();
    });

    it("should contract spaces", function() {
        var parse = parseTree(spaceTextExpression)[0];
        var group = parse.value.value;

        expect(group[0].type).toMatch("spacing");
        expect(group[1].type).toMatch("textord");
        expect(group[2].type).toMatch("spacing");
        expect(group[3].type).toMatch("spacing");
    });

    it("should ignore a space before the text group", function() {
        var parse = parseTree(leadingSpaceTextExpression)[0];
        // [m, o, o]
        expect(parse.value.value.length).toBe(3);
        expect(
            parse.value.value.map(function(n) { return n.value; }).join("")
        ).toBe("moo");
    });
});

describe("A color parser", function() {
    var colorExpression = "\\blue{x}";
    var customColorExpression = "\\color{#fA6}{x}";
    var badCustomColorExpression = "\\color{bad-color}{x}";

    it("should not fail", function() {
        expect(function() {
            parseTree(colorExpression);
        }).not.toThrow();
    });

    it("should build a color node", function() {
        var parse = parseTree(colorExpression)[0];

        expect(parse.type).toMatch("color");
        expect(parse.value.color).toBeDefined();
        expect(parse.value.value).toBeDefined();
    });

    it("should parse a custom color", function() {
        expect(function() {
            parseTree(customColorExpression);
        }).not.toThrow();
    });

    it("should correctly extract the custom color", function() {
        var parse = parseTree(customColorExpression)[0];

        expect(parse.value.color).toMatch("#fA6");
    });

    it("should not parse a bad custom color", function() {
        expect(function() {
            parseTree(badCustomColorExpression);
        }).toThrow();
    });
});

describe("A tie parser", function() {
    var mathTie = "a~b";
    var textTie = "\\text{a~ b}";

    it("should parse ties in math mode", function() {
        expect(function() {
            parseTree(mathTie);
        }).not.toThrow();
    });

    it("should parse ties in text mode", function() {
        expect(function() {
            parseTree(textTie);
        }).not.toThrow();
    });

    it("should produce spacing in math mode", function() {
        var parse = parseTree(mathTie);

        expect(parse[1].type).toMatch("spacing");
    });

    it("should produce spacing in text mode", function() {
        var text = parseTree(textTie)[0];
        var parse = text.value.value;

        expect(parse[1].type).toMatch("spacing");
    });

    it("should not contract with spaces in text mode", function() {
        var text = parseTree(textTie)[0];
        var parse = text.value.value;

        expect(parse[2].type).toMatch("spacing");
    });
});

describe("A delimiter sizing parser", function() {
    var normalDelim = "\\bigl |";
    var notDelim = "\\bigl x";
    var bigDelim = "\\Biggr \\langle";

    it("should parse normal delimiters", function() {
        expect(function() {
            parseTree(normalDelim);
            parseTree(bigDelim);
        }).not.toThrow();
    });

    it("should not parse not-delimiters", function() {
        expect(function() {
            parseTree(notDelim);
        }).toThrow();
    });

    it("should produce a delimsizing", function() {
        var parse = parseTree(normalDelim)[0];

        expect(parse.type).toMatch("delimsizing");
    });

    it("should produce the correct direction delimiter", function() {
        var leftParse = parseTree(normalDelim)[0];
        var rightParse = parseTree(bigDelim)[0];

        expect(leftParse.value.type).toMatch("open");
        expect(rightParse.value.type).toMatch("close");
    });

    it("should parse the correct size delimiter", function() {
        var smallParse = parseTree(normalDelim)[0];
        var bigParse = parseTree(bigDelim)[0];

        expect(smallParse.value.size).toEqual(1);
        expect(bigParse.value.size).toEqual(4);
    });
});

describe("An overline parser", function() {
    var overline = "\\overline{x}";

    it("should not fail", function() {
        expect(function() {
            parseTree(overline);
        }).not.toThrow();
    });

    it("should produce an overline", function() {
        var parse = parseTree(overline)[0];

        expect(parse.type).toMatch("overline");
    });
});
