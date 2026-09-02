/**
 * @jest-environment jsdom
 */
import katex from "katex";

// Importing the module installs its global 'copy' handler.
import "../copy-tex";

// "first $x^2$ second <unselectable> third", the markup from
// https://github.com/KaTeX/KaTeX/issues/3812.
const buildDocument = () => {
    document.body.innerHTML =
        "first " + katex.renderToString("x^2", {}) + " second " +
        '<span style="user-select: none">unselectable</span> third';
    const nodes = document.body.childNodes;
    return {
        beforeGap: nodes[2] as Text,  // " second "
        afterGap: nodes[4] as Text,   // " third"
    };
};

const rangeOver = (start: Node, end: Node) => {
    const range = document.createRange();
    range.setStart(start, 0);
    range.setEnd(end, end.textContent!.length);
    return range;
};

// Dispatch a copy event over a selection holding the given ranges, and
// return what the handler wrote to the clipboard.
const copy = (ranges: Range[]) => {
    const written: Record<string, string> = {};
    const setData = (format: string, data: string) => {
        written[format] = data;
    };
    jest.spyOn(window, "getSelection").mockReturnValue({
        isCollapsed: false,
        rangeCount: ranges.length,
        getRangeAt: (i: number) => ranges[i],
    } as unknown as Selection);

    const event = new Event("copy", {bubbles: true, cancelable: true});
    Object.defineProperty(event, "clipboardData", {value: {setData}});
    document.dispatchEvent(event);

    return written["text/plain"];
};

afterEach(() => {
    jest.restoreAllMocks();
});

describe("copy-tex", () => {
    it("replaces math with its TeX source", () => {
        const {beforeGap} = buildDocument();
        const text = copy([rangeOver(document.body.firstChild!, beforeGap)]);

        expect(text).toBe("first $x^2$ second ");
    });

    it("copies every range of a multi-range selection", () => {
        const {beforeGap, afterGap} = buildDocument();
        const text = copy([
            rangeOver(document.body.firstChild!, beforeGap),
            rangeOver(afterGap, afterGap),
        ]);

        // Two spaces: the source has one on either side of the span, and
        // only the span itself is skipped.
        expect(text).toBe("first $x^2$ second  third");
    });

    it("does not repeat a formula covered by two ranges", () => {
        buildDocument();
        const math = document.querySelector(".katex")!;
        const parts = [
            math.querySelector(".katex-mathml")!,
            math.querySelector(".katex-html")!,
        ];

        const text = copy(parts.map((part) => {
            const range = document.createRange();
            range.selectNodeContents(part);
            return range;
        }));

        expect(text).toBe("$x^2$");
    });
});
