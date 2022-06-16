import {renderToString} from "react-dom/server";
import katex from "../katex";

describe("A react builder", function () {
    it("should generate react", () => {
        const markup = katex.renderToReact(String.raw`1`);
        expect(renderToString(markup)).toEqual(
            katex.renderToString(String.raw`1`).replace(";", ""),
        );
    });
});
