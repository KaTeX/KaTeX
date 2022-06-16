import katex from "../katex";

describe("A react builder", function () {
    it("should generate react", () => {
        const markup = katex.renderToReact(String.raw`1`);
        expect(markup).toEqual('')
    });
});
