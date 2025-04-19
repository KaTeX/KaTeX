/**
 * @jest-environment jsdom
 */
import splitAtDelimiters from "../splitAtDelimiters";
import renderMathInElement from "../auto-render";

beforeEach(() => {
    expect.extend({
        toSplitInto(actual, result, delimiters) {
            const split = splitAtDelimiters(actual, delimiters);

            if (split.length !== result.length) {
                return {
                    pass: false,
                    message: () =>
                        `Different number of splits: ${split.length} vs. ` +
                        `${result.length} (${JSON.stringify(split)} vs. ` +
                        `${JSON.stringify(result)})`,
                };
            }

            for (let i = 0; i < split.length; i++) {
                const real = split[i];
                const correct = result[i];

                if (
                    real.type !== correct.type ||
                    real.data !== correct.data ||
                    real.display !== correct.display
                ) {
                    return {
                        pass: false,
                        message: () =>
                            `Difference at split ${i + 1}: ` +
                            `${JSON.stringify(real)} vs. ` +
                            `${JSON.stringify(correct)}`,
                    };
                }
            }

            return {
                pass: true,
                message: () => `'${actual}' split correctly`,
            };
        },
    });
});

describe("A delimiter splitter", () => {
    it("doesn't split when there are no delimiters", () => {
        expect("hello").toSplitInto(
            [{type: "text", data: "hello"}],
            [{left: "(", right: ")", display: false}]
        );
    });

    it("doesn't create a math node with only one left delimiter", () => {
        expect("hello ( world").toSplitInto(
            [
                {type: "text", data: "hello "},
                {type: "text", data: "( world"},
            ],
            [{left: "(", right: ")", display: false}]
        );
    });

    it("doesn't split when there's only a right delimiter", () => {
        expect("hello ) world").toSplitInto(
            [{type: "text", data: "hello ) world"}],
            [{left: "(", right: ")", display: false}]
        );
    });

    it("splits when there are both delimiters", () => {
        expect("hello ( world ) boo").toSplitInto(
            [
                {type: "text", data: "hello "},
                {
                    type: "math",
                    data: " world ",
                    rawData: "( world )",
                    display: false,
                },
                {type: "text", data: " boo"},
            ],
            [{left: "(", right: ")", display: false}]
        );
    });

    it("splits on multi-character delimiters", () => {
        expect("hello [[ world ]] boo").toSplitInto(
            [
                {type: "text", data: "hello "},
                {
                    type: "math",
                    data: " world ",
                    rawData: "[[ world ]]",
                    display: false,
                },
                {type: "text", data: " boo"},
            ],
            [{left: "[[", right: "]]", display: false}]
        );
    });

    it("splits multiple times", () => {
        expect("hello ( world ) boo ( more ) stuff").toSplitInto(
            [
                {type: "text", data: "hello "},
                {
                    type: "math",
                    data: " world ",
                    rawData: "( world )",
                    display: false,
                },
                {type: "text", data: " boo "},
                {
                    type: "math",
                    data: " more ",
                    rawData: "( more )",
                    display: false,
                },
                {type: "text", data: " stuff"},
            ],
            [{left: "(", right: ")", display: false}]
        );
    });

    it("leaves the ending when there's only a left delimiter", () => {
        expect("hello ( world ) boo ( left").toSplitInto(
            [
                {type: "text", data: "hello "},
                {
                    type: "math",
                    data: " world ",
                    rawData: "( world )",
                    display: false,
                },
                {type: "text", data: " boo "},
                {type: "text", data: "( left"},
            ],
            [{left: "(", right: ")", display: false}]
        );
    });

    it("doesn't split when close delimiters are in {}s", () => {
        expect("hello ( world { ) } ) boo").toSplitInto(
            [
                {type: "text", data: "hello "},
                {
                    type: "math",
                    data: " world { ) } ",
                    rawData: "( world { ) } )",
                    display: false,
                },
                {type: "text", data: " boo"},
            ],
            [{left: "(", right: ")", display: false}]
        );
    });

    it("correctly processes sequences of $..$", () => {
        expect("$hello$$world$$boo$").toSplitInto(
            [
                {
                    type: "math",
                    data: "hello",
                    rawData: "$hello$",
                    display: false,
                },
                {
                    type: "math",
                    data: "world",
                    rawData: "$world$",
                    display: false,
                },
                {
                    type: "math",
                    data: "boo",
                    rawData: "$boo$",
                    display: false,
                },
            ],
            [{left: "$", right: "$", display: false}]
        );
    });

    it("doesn't split at escaped delimiters", () => {
        expect("hello ( world \\) ) boo").toSplitInto(
            [
                {type: "text", data: "hello "},
                {
                    type: "math",
                    data: " world \\) ",
                    rawData: "( world \\) )",
                    display: false,
                },
                {type: "text", data: " boo"},
            ],
            [{left: "(", right: ")", display: false}]
        );
    });

    it("splits when the right and left delimiters are the same", () => {
        expect("hello $ world $ boo").toSplitInto(
            [
                {type: "text", data: "hello "},
                {
                    type: "math",
                    data: " world ",
                    rawData: "$ world $",
                    display: false,
                },
                {type: "text", data: " boo"},
            ],
            [{left: "$", right: "$", display: false}]
        );
    });

    it("remembers which delimiters are display-mode", () => {
        const startData = "hello ( world ) boo";

        expect(
            splitAtDelimiters(startData, [
                {left: "(", right: ")", display: true},
            ])
        ).toEqual([
            {type: "text", data: "hello "},
            {
                type: "math",
                data: " world ",
                rawData: "( world )",
                display: true,
            },
            {type: "text", data: " boo"},
        ]);
    });
});

describe("Pre-process callback", () => {
    it("replace `-squared` with `^2 `", () => {
        const el1 = document.createElement("div");
        el1.textContent =
            "Circle equation: $x-squared + y-squared = r-squared$.";
        const el2 = document.createElement("div");
        el2.textContent = "Circle equation: $x^2 + y^2 = r^2$.";
        const delimiters = [{left: "$", right: "$", display: false}];
        renderMathInElement(el1, {
            delimiters,
            preProcess: (math) => math.replace(/-squared/g, "^2"),
        });
        renderMathInElement(el2, {delimiters});
        expect(el1.innerHTML).toEqual(el2.innerHTML);
    });
});

describe("Parse adjacent text nodes", () => {
    it("parse adjacent text nodes with math", () => {
        const textNodes = ["\\[", "x^2 + y^2 = r^2", "\\]"];
        const el = document.createElement("div");
        for (let i = 0; i < textNodes.length; i++) {
            const txt = document.createTextNode(textNodes[i]);
            el.appendChild(txt);
        }
        const el2 = document.createElement("div");
        const txt = document.createTextNode(textNodes.join(""));
        el2.appendChild(txt);
        const delimiters = [{left: "\\[", right: "\\]", display: true}];
        renderMathInElement(el, {delimiters});
        renderMathInElement(el2, {delimiters});
        expect(el).toStrictEqual(el2);
    });

    it("parse adjacent text nodes without math", () => {
        const textNodes = [
            "Lorem ipsum dolor",
            "sit amet",
            "consectetur adipiscing elit",
        ];
        const el = document.createElement("div");
        for (let i = 0; i < textNodes.length; i++) {
            const txt = document.createTextNode(textNodes[i]);
            el.appendChild(txt);
        }
        const el2 = document.createElement("div");
        for (let i = 0; i < textNodes.length; i++) {
            const txt = document.createTextNode(textNodes[i]);
            el2.appendChild(txt);
        }
        const delimiters = [{left: "\\[", right: "\\]", display: true}];
        renderMathInElement(el, {delimiters});
        expect(el).toStrictEqual(el2);
    });
});
