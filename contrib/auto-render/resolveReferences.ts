/**
 * Equation numbers for \ref and \eqref (#2003).
 *
 * KaTeX renders each formula on its own, so a \ref or \eqref can only show
 * the name of its \label: KaTeX doesn't know the page's equation numbers,
 * which CSS counters draw. Once the page is rendered, this goes through it in
 * order, numbers the equations, and writes each number into the equation
 * (so what's shown no longer depends on the counter) and into the references
 * to it:
 *
 * - an automatically numbered equation: its number, so \ref shows 3 and
 *   \eqref shows (3);
 * - a \tag: the tag's text, without its parentheses, so \tag{A} gives A and
 *   (A), as in LaTeX;
 * - an equation with no number: the reference keeps showing the label's name;
 * - a label that isn't there: ??, as LaTeX shows, with the class
 *   `katex-ref-undefined`.
 *
 * Each root is numbered from 1 on its own, so a page with several documents
 * can number them separately (give each a different `labelPrefix` too).
 * Running it again after more math is rendered numbers everything afresh.
 */

// The zero-width spaces KaTeX puts in its HTML
const ZERO_WIDTH = /\u200b/g;

// The number a \ref to this element shows, or null if it has none
const numberOf = (target: Element): string | null => {
    const eqnNum = target.getAttribute("data-eqn-num");
    if (eqnNum !== null) {
        return eqnNum;
    }
    // a \tag's own text, less the parentheses \tag adds; \tag* adds none, so
    // \tag*{(A)} keeps its own (KaTeX marks which with data-tag-paren)
    const text = (target.textContent ?? "").replace(ZERO_WIDTH, "").trim();
    if (!text) {
        return null;
    }
    const inner = /^\((.*)\)$/s.exec(text);
    return inner && target.hasAttribute("data-tag-paren") ? inner[1] : text;
};

// Show `text` in a reference, in place of what it showed before
const setText = (ref: Element, text: string) => {
    // KaTeX sets the reference as one or more runs of upright text: spans in
    // HTML, <mtext> in MathML
    let runs = Array.from(ref.querySelectorAll(".textrm"))
        .filter((run) => !run.querySelector(".textrm"));
    if (runs.length === 0) {
        runs = Array.from(ref.querySelectorAll("mtext"));
    }
    if (runs.length === 0) {
        ref.textContent = text;
        return;
    }
    runs[0].textContent = text;
    for (const run of runs.slice(1)) {
        run.textContent = "";
    }
};

const resolveRoot = (root: ParentNode, undefinedLabels: Set<string>) => {
    // Number the equations in order, as the CSS counters would: the HTML's,
    // and the MathML's where it's the output on its own (not the hidden copy
    // beside the HTML, whose references take the HTML's numbers)
    const number = (eqnNums: Element[]) => eqnNums.forEach((el, i) =>
        el.setAttribute("data-eqn-num", String(i + 1)));
    number(Array.from(root.querySelectorAll(".eqn-num")));
    number(Array.from(root.querySelectorAll(".mml-eqn-num"))
        .filter((el) => !el.closest(".katex-mathml")));

    // Every id in the root; the first of two alike wins, as in the browser
    const byId = new Map<string, Element>();
    for (const el of Array.from(root.querySelectorAll("[id]"))) {
        if (!byId.has(el.id)) {
            byId.set(el.id, el);
        }
    }

    for (const ref of Array.from(root.querySelectorAll(".katex-ref, .katex-eqref"))) {
        const label = ref.getAttribute("data-label") ?? "";
        const href = ref.getAttribute("href") ?? "";
        let id = href.slice(1);
        try {
            id = decodeURIComponent(id);
        } catch {
            // leave a malformed escape as it is
        }
        const target = byId.get(id);
        const eqref = ref.classList.contains("katex-eqref");
        let text;
        if (!target) {
            undefinedLabels.add(label);
            ref.classList.add("katex-ref-undefined");
            text = "??";
        } else {
            ref.classList.remove("katex-ref-undefined");
            text = numberOf(target) ?? label;
        }
        setText(ref, eqref ? `(${text})` : text);
    }
};

/**
 * Put equation numbers into the references in `root` (by default the whole
 * page): an element, a list of elements numbered separately, or a selector
 * for them. Returns the names of the labels that were referred to but not
 * found.
 */
export default function resolveReferences(
    root?: ParentNode | Iterable<ParentNode> | string,
): string[] {
    let roots: ParentNode[];
    if (root === undefined) {
        roots = [document.body];
    } else if (typeof root === "string") {
        roots = Array.from(document.querySelectorAll(root));
    } else if (root instanceof Node) {
        // (before the list test: a <form>, say, is iterable too)
        roots = [root as ParentNode];
    } else {
        roots = Array.from(root);
    }
    const undefinedLabels = new Set<string>();
    for (const r of roots) {
        resolveRoot(r, undefinedLabels);
    }
    return Array.from(undefinedLabels);
}
