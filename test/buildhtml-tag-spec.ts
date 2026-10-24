import katex from "../katex";
import Settings from "../src/Settings";

const displaySettings = new Settings({displayMode: true});

/**
 * Build `expr` and return the .katex-html node of the rendered tree.
 */
function buildHtmlNode(expr: string): any {
    let root: any = katex.__renderToDomTree(expr, displaySettings);
    if (root.classes.includes("katex-display")) {
        root = root.children[0];
    }
    const htmlNode = root.children.find(
        (child: any) => child.classes && child.classes.includes("katex-html"));
    if (!htmlNode) {
        throw new Error(`no .katex-html node built for ${expr}`);
    }
    return htmlNode;
}

function htmlChildClasses(expr: string): string[][] {
    return buildHtmlNode(expr).children.map(
        (child: any) => child.classes || []);
}

function hasDirectTagChild(expr: string): boolean {
    return htmlChildClasses(expr).some(
        (classes) => classes.includes("katex-tag"));
}

describe("buildHTML equation tag placement", function() {
    it("lifts the tag of a lone numbered environment", () => {
        // The case that has always worked: the environment's fragment
        // is the whole expression, [table, tag].
        expect(hasDirectTagChild("\\begin{gather}a=b\\end{gather}")).toBe(true);
        expect(hasDirectTagChild("\\begin{align}a&=b\\end{align}")).toBe(true);
    });

    it("lifts the tag when other content precedes the environment", () => {
        // Regression test for #4281: the root expression has more
        // than two elements and the tag is last. The number used to be
        // dropped silently because buildHTML only recognized the
        // exactly-two-elements shape.
        expect(hasDirectTagChild("x=\\begin{align}a&=b\\end{align}")).toBe(true);
        expect(hasDirectTagChild("x+y+\\begin{gather}a=b\\end{gather}"))
            .toBe(true);
    });

    it("keeps the tag as the final child of .katex-html", () => {
        const children = htmlChildClasses("x=\\begin{align}a&=b\\end{align}");
        expect(children[children.length - 1]).toContain("katex-tag");
    });

    it("does not lift a tag that is not the last root element", () => {
        // Content after the environment: the tag belongs to the
        // environment's own fragment, not to the root, so it must not
        // be promoted to a direct child of .katex-html.
        expect(hasDirectTagChild("\\begin{gather}a=b\\end{gather}z"))
            .toBe(false);
    });

    it("does not invent a tag for unnumbered environments", () => {
        expect(hasDirectTagChild("\\begin{gather*}a=b\\end{gather*}"))
            .toBe(false);
        expect(hasDirectTagChild("x=\\begin{align*}a&=b\\end{align*}"))
            .toBe(false);
    });

    it("still renders the equation number itself", () => {
        // The number is an .eqn-num span whose "(n)" text comes from
        // a CSS counter; check both markers are present in the tag.
        const markup = buildHtmlNode("x=\\begin{align}a&=b\\end{align}")
            .toMarkup();
        expect(markup).toContain("katex-tag");
        expect(markup).toContain("eqn-num");
    });
});
