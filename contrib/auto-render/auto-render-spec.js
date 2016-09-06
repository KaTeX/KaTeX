/* global beforeEach: false */
/* global jasmine: false */
/* global expect: false */
/* global it: false */
/* global describe: false */

var splitAtDelimiters = require("./splitAtDelimiters");

beforeEach(function() {
    jasmine.addMatchers({
        toSplitInto: function() {
            return {
                compare: function(actual, left, right, result) {
                    var message = {
                        pass: true,
                        message: "'" + actual + "' split correctly",
                    };

                    var startData = [{type: "text", data: actual}];

                    var split =
                        splitAtDelimiters(startData, left, right, false);

                    if (split.length !== result.length) {
                        message.pass = false;
                        message.message = "Different number of splits: " +
                            split.length + " vs. " + result.length + " (" +
                            JSON.stringify(split) + " vs. " +
                            JSON.stringify(result) + ")";
                        return message;
                    }

                    for (var i = 0; i < split.length; i++) {
                        var real = split[i];
                        var correct = result[i];

                        var good = true;
                        var diff;

                        if (real.type !== correct.type) {
                            good = false;
                            diff = "type";
                        } else if (real.data !== correct.data) {
                            good = false;
                            diff = "data";
                        } else if (real.display !== correct.display) {
                            good = false;
                            diff = "display";
                        }

                        if (!good) {
                            message.pass = false;
                            message.message = "Difference at split " +
                                (i + 1) + ": " + JSON.stringify(real) +
                                " vs. " + JSON.stringify(correct) +
                                " (" + diff + " differs)";
                            break;
                        }
                    }

                    return message;
                },
            };
        },
    });
});

describe("A delimiter splitter", function() {
    it("doesn't split when there are no delimiters", function() {
        expect("hello").toSplitInto("(", ")", [{type: "text", data: "hello"}]);
    });

    it("doesn't create a math node with only one left delimiter", function() {
        expect("hello ( world").toSplitInto(
            "(", ")",
            [
                {type: "text", data: "hello "},
                {type: "text", data: "( world"},
            ]);
    });

    it("doesn't split when there's only a right delimiter", function() {
        expect("hello ) world").toSplitInto(
            "(", ")",
            [
                {type: "text", data: "hello ) world"},
            ]);
    });

    it("splits when there are both delimiters", function() {
        expect("hello ( world ) boo").toSplitInto(
            "(", ")",
            [
                {type: "text", data: "hello "},
                {type: "math", data: " world ",
                    rawData: "( world )", display: false},
                {type: "text", data: " boo"},
            ]);
    });

    it("splits on multi-character delimiters", function() {
        expect("hello [[ world ]] boo").toSplitInto(
            "[[", "]]",
            [
                {type: "text", data: "hello "},
                {type: "math", data: " world ",
                    rawData: "[[ world ]]", display: false},
                {type: "text", data: " boo"},
            ]);
    });

    it("splits mutliple times", function() {
        expect("hello ( world ) boo ( more ) stuff").toSplitInto(
            "(", ")",
            [
                {type: "text", data: "hello "},
                {type: "math", data: " world ",
                    rawData: "( world )", display: false},
                {type: "text", data: " boo "},
                {type: "math", data: " more ",
                    rawData: "( more )", display: false},
                {type: "text", data: " stuff"},
            ]);
    });

    it("leaves the ending when there's only a left delimiter", function() {
        expect("hello ( world ) boo ( left").toSplitInto(
            "(", ")",
            [
                {type: "text", data: "hello "},
                {type: "math", data: " world ",
                    rawData: "( world )", display: false},
                {type: "text", data: " boo "},
                {type: "text", data: "( left"},
            ]);
    });

    it("doesn't split when close delimiters are in {}s", function() {
        expect("hello ( world { ) } ) boo").toSplitInto(
            "(", ")",
            [
                {type: "text", data: "hello "},
                {type: "math", data: " world { ) } ",
                    rawData: "( world { ) } )", display: false},
                {type: "text", data: " boo"},
            ]);

        expect("hello ( world { { } ) } ) boo").toSplitInto(
            "(", ")",
            [
                {type: "text", data: "hello "},
                {type: "math", data: " world { { } ) } ",
                    rawData: "( world { { } ) } )", display: false},
                {type: "text", data: " boo"},
            ]);
    });

    it("doesn't split at escaped delimiters", function() {
        expect("hello ( world \\) ) boo").toSplitInto(
            "(", ")",
            [
                {type: "text", data: "hello "},
                {type: "math", data: " world \\) ",
                    rawData: "( world \\) )", display: false},
                {type: "text", data: " boo"},
            ]);

        /* TODO(emily): make this work maybe?
        expect("hello \\( ( world ) boo").toSplitInto(
            "(", ")",
            [
                {type: "text", data: "hello \\( "},
                {type: "math", data: " world ",
                    rawData: "( world )", display: false},
                {type: "text", data: " boo"},
            ]);
        */
    });

    it("splits when the right and left delimiters are the same", function() {
        expect("hello $ world $ boo").toSplitInto(
            "$", "$",
            [
                {type: "text", data: "hello "},
                {type: "math", data: " world ",
                    rawData: "$ world $", display: false},
                {type: "text", data: " boo"},
            ]);
    });

    it("remembers which delimiters are display-mode", function() {
        var startData = [{type: "text", data: "hello ( world ) boo"}];

        expect(splitAtDelimiters(startData, "(", ")", true)).toEqual(
            [
                {type: "text", data: "hello "},
                {type: "math", data: " world ",
                    rawData: "( world )", display: true},
                {type: "text", data: " boo"},
            ]);
    });

    it("works with more than one start datum", function() {
        var startData = [
            {type: "text", data: "hello ( world ) boo"},
            {type: "math", data: "math", rawData: "(math)", display: true},
            {type: "text", data: "hello ( world ) boo"},
        ];

        expect(splitAtDelimiters(startData, "(", ")", false)).toEqual(
            [
                {type: "text", data: "hello "},
                {type: "math", data: " world ",
                    rawData: "( world )", display: false},
                {type: "text", data: " boo"},
                {type: "math", data: "math", rawData: "(math)", display: true},
                {type: "text", data: "hello "},
                {type: "math", data: " world ",
                    rawData: "( world )", display: false},
                {type: "text", data: " boo"},
            ]);
    });

    it("doesn't do splitting inside of math nodes", function() {
        var startData = [
            {type: "text", data: "hello ( world ) boo"},
            {type: "math", data: "hello ( world ) boo",
                rawData: "(hello ( world ) boo)", display: true},
        ];

        expect(splitAtDelimiters(startData, "(", ")", false)).toEqual(
            [
                {type: "text", data: "hello "},
                {type: "math", data: " world ",
                    rawData: "( world )", display: false},
                {type: "text", data: " boo"},
                {type: "math", data: "hello ( world ) boo",
                    rawData: "(hello ( world ) boo)", display: true},
            ]);
    });
});
