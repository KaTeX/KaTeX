import {renderToString} from "react-dom/server";
import katex from "../katex";

describe("A react builder", function () {
    function expectReactToMatchKatex(string) {
        function normalize(string) {
            // Yes this is ugly and hacky but works for now
            return string
                .replace(/;/g, "")
                .replace(/\'/g, '"')
                .replace(/\>\<\/path>/g, "/>");
        }

        expect(normalize(renderToString(katex.renderToReact(string)))).toEqual(
            normalize(katex.renderToString(string)),
        );
    }

    it("should render basic katex to react", () => {
        expectReactToMatchKatex("1");
        expectReactToMatchKatex("\\frac{a}{b}");
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
