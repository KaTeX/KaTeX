import {renderToString} from "react-dom/server";
import {parseFragment, serialize} from "parse5";
import katex from "../katex";

describe("A react builder", function () {
    function expectReactToMatchKatex(string) {
        const actual = renderToString(katex.renderToReact(string));
        const expected = katex.renderToString(string);

        function formateTree(node) {
            node.childNodes?.map(formateTree);

            node.attrs = node.attrs
                ?.sort((a, b) => {
                    if (a.name > b.name) {
                        return 1;
                    }
                    if (a.name < b.name) {
                        return -1;
                    }
                    return 0;
                })
                .map((attr) => {
                    return {...attr, value: attr.value.replace(/;/g, "")};
                });

            return node;
        }

        const dom1 = serialize(formateTree(parseFragment(actual)));
        const dom2 = serialize(formateTree(parseFragment(expected)));

        expect(dom1).toEqual(dom2);
    }

    it("should render basic katex to react", () => {
        expectReactToMatchKatex("1");
        expectReactToMatchKatex("\\frac{a}{b}");
    });

    it("should render accents to react", () => {
        expectReactToMatchKatex("\\widetilde{ac}");
        expectReactToMatchKatex("a'");
    });

    it("should render delimiters react", () => {
        expectReactToMatchKatex(String.raw`\left(\LARGE{AB}\right)`);
    });

    it("should render basic katex to react", () => {
        expectReactToMatchKatex(String.raw`
\begin{aligned}
a & = b + c \\
& = d - c \\
\end{aligned}
    `);
    });

    it("should render katex anchors to react", () => {
        expectReactToMatchKatex("\\href{http://example.com/}{\\sin}");
        expectReactToMatchKatex("\\url{http://example.com/}");
        expectReactToMatchKatex("\\href{}{sin}");
        expectReactToMatchKatex("\\url{}{sin}");
    });

    it("should render katex svgs to react", () => {
        expectReactToMatchKatex("\\sqrt{a}");
    });

    it("should render images to react", () => {
        expectReactToMatchKatex(
            "\\includegraphics[height=0.9em, totalheight=0.9em, width=0.9em, alt=KA logo]{https://cdn.kastatic.org/images/apple-touch-icon-57x57-precomposed.new.png}",
        );
    });
});
