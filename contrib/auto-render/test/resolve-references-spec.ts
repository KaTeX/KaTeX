/**
 * @jest-environment jsdom
 */
import katex from "katex";
import renderMathInElement, {resolveReferences} from "../auto-render";

// A page of paragraphs, each rendered by KaTeX: [tex, displayMode]
const page = (...parts: [string, boolean?][]) => {
    document.body.innerHTML = "";
    const root = document.createElement("div");
    for (const [tex, display = true] of parts) {
        const p = document.createElement("p");
        katex.render(tex, p, {displayMode: display});
        root.appendChild(p);
    }
    document.body.appendChild(root);
    return root;
};

// What each reference in `root` shows
const refs = (root: ParentNode = document.body) =>
    Array.from(root.querySelectorAll(".katex-ref, .katex-eqref"))
        .map((ref) => ref.textContent);

// The numbers given to the equations in `root`
const numbers = (root: ParentNode = document.body) =>
    Array.from(root.querySelectorAll(".eqn-num"))
        .map((el) => el.getAttribute("data-eqn-num"));

describe("resolveReferences", () => {
    it("numbers the equations in order and fills in \\ref and \\eqref", () => {
        page(
            [String.raw`\begin{equation}a=b\label{first}\end{equation}`],
            [String.raw`\begin{align}c&=d\label{second}\\e&=f\nonumber\\g&=h\label{third}\end{align}`],
            [String.raw`\text{by }\eqref{first}, \ref{second}, \eqref{third}`, false],
        );
        expect(resolveReferences()).toEqual([]);
        expect(numbers()).toEqual(["1", "2", "3"]);
        expect(refs()).toEqual(["(1)", "2", "(3)"]);
    });

    it("refers forward as well as back", () => {
        page(
            [String.raw`\text{see }\eqref{later}`, false],
            [String.raw`\begin{equation}x\end{equation}`],
            [String.raw`\begin{equation}y\label{later}\end{equation}`],
        );
        resolveReferences();
        expect(refs()).toEqual(["(2)"]);
    });

    it("shows a \\tag's text, as LaTeX does", () => {
        page(
            [String.raw`x\tag{A}\label{a}`],
            [String.raw`y\tag*{B.1}\label{b}`],
            [String.raw`\begin{align}z\tag{C}\label{c}\end{align}`],
            [String.raw`\ref{a} \eqref{a} \ref{b} \eqref{b} \ref{c}`, false],
        );
        resolveReferences();
        expect(refs()).toEqual(["A", "(A)", "B.1", "(B.1)", "C"]);
    });

    it("leaves the label's name for an equation without a number", () => {
        page(
            [String.raw`\begin{align*}x\label{star}\end{align*}`],
            [String.raw`y\label{plain}`],
            [String.raw`\ref{star} \eqref{plain}`, false],
        );
        resolveReferences();
        expect(refs()).toEqual(["star", "(plain)"]);
    });

    it("shows ?? for a label that isn't there, and returns its name", () => {
        page([String.raw`\ref{nowhere} \eqref{nowhere}`, false]);
        expect(resolveReferences()).toEqual(["nowhere"]);
        expect(refs()).toEqual(["??", "(??)"]);
        expect(document.querySelectorAll(".katex-ref-undefined")).toHaveLength(2);
    });

    it("numbers each root on its own", () => {
        const one = page(
            [String.raw`\begin{equation}a\label{x}\end{equation}`],
            [String.raw`\eqref{x}`, false],
        );
        const two = one.cloneNode(true) as HTMLElement;
        document.body.appendChild(two);
        resolveReferences([one, two]);
        expect(numbers(one)).toEqual(["1"]);
        expect(numbers(two)).toEqual(["1"]);
        expect(refs()).toEqual(["(1)", "(1)"]);
    });

    it("takes a selector for its roots", () => {
        const root = page(
            [String.raw`\begin{equation}a\label{x}\end{equation}`],
            [String.raw`\eqref{x}`, false],
        );
        root.className = "doc";
        resolveReferences(".doc");
        expect(refs()).toEqual(["(1)"]);
    });

    it("numbers afresh when run again", () => {
        const root = page(
            [String.raw`\begin{equation}a\label{x}\end{equation}`],
            [String.raw`\eqref{x} \ref{y}`, false],
        );
        resolveReferences();
        expect(refs()).toEqual(["(1)", "??"]);

        // an equation added before the first, and the missing label
        const p = document.createElement("p");
        katex.render(String.raw`\begin{equation}b\label{y}\end{equation}`, p,
            {displayMode: true});
        root.prepend(p);
        resolveReferences();
        expect(numbers()).toEqual(["1", "2"]);
        expect(refs()).toEqual(["(2)", "1"]);
        expect(document.querySelectorAll(".katex-ref-undefined")).toHaveLength(0);
    });

    it("finds labels made with a labelPrefix", () => {
        document.body.innerHTML = "";
        for (const tex of [String.raw`\begin{equation}a\label{x}\end{equation}`,
            String.raw`\eqref{x}`]) {
            const p = document.createElement("p");
            katex.render(tex, p, {displayMode: true, labelPrefix: "doc1-"});
            document.body.appendChild(p);
        }
        expect(resolveReferences()).toEqual([]);
        expect(refs()).toEqual(["(1)"]);
    });
});

describe("renderMathInElement and references", () => {
    const html = String.raw`<p>$$a=b \tag{1.1}$$</p>
        <p>\begin{equation}E=mc^2\label{energy}\end{equation}</p>
        <p>By \(\eqref{energy}\).</p>`;

    it("fills in the numbers once the math is rendered", () => {
        document.body.innerHTML = html;
        renderMathInElement(document.body);
        expect(refs()).toEqual(["(1)"]);
    });

    it("can be told not to", () => {
        document.body.innerHTML = html;
        renderMathInElement(document.body, {resolveReferences: false});
        expect(refs()).toEqual(["(energy)"]);
    });

    it("offers resolveReferences for pages that render math another way", () => {
        expect(renderMathInElement.resolveReferences).toBe(resolveReferences);
    });
});
