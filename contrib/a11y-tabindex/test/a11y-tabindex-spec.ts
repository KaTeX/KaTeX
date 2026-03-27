/**
 * @jest-environment jsdom
 */

// jsdom does not provide ResizeObserver.  The module guards init() behind
// `typeof ResizeObserver !== "undefined"`, but we stub it here anyway so
// tests that call updateTabIndex on real elements work correctly.
const observed = new Set<Element>();
global.ResizeObserver = class {
    observe(el: Element) { observed.add(el); }
    unobserve(el: Element) { observed.delete(el); }
    disconnect() { observed.clear(); }
} as unknown as typeof ResizeObserver;

import {
    updateTabIndex,
    ensureAccessibleRole,
    removeAccessibleRole,
    A11Y_ADDED,
} from "../a11y-tabindex";

/** Create a mock .katex element with optional overflow. */
function createKatexEl(
    {overflows}: {overflows?: boolean} = {},
): HTMLElement {
    const el = document.createElement("span");
    el.classList.add("katex");
    if (overflows !== undefined) {
        setOverflow(el, overflows);
    }
    return el;
}

function setOverflow(el: HTMLElement, overflows: boolean) {
    const wide = overflows ? 500 : 300;
    Object.defineProperty(el, "scrollWidth", {value: wide, configurable: true});
    Object.defineProperty(el, "clientWidth", {value: 300, configurable: true});
}

describe("a11y-tabindex", () => {
    describe("updateTabIndex", () => {
        it("adds tabindex and role when overflowing", () => {
            const el = createKatexEl({overflows: true});
            updateTabIndex(el);
            expect(el.getAttribute("tabindex")).toBe("0");
            expect(el.getAttribute("role")).toBe("math");
        });

        it("skips tabindex and role when not overflowing", () => {
            const el = createKatexEl({overflows: false});
            updateTabIndex(el);
            expect(el.getAttribute("tabindex")).toBe(null);
            expect(el.getAttribute("role")).toBe(null);
        });

        it("removes tabindex and role when element stops overflowing", () => {
            const el = createKatexEl({overflows: true});
            updateTabIndex(el);

            setOverflow(el, false);
            updateTabIndex(el);
            expect(el.hasAttribute("tabindex")).toBe(false);
            expect(el.hasAttribute("role")).toBe(false);
        });
    });

    describe("ensureAccessibleRole", () => {
        it("adds role=math", () => {
            const el = createKatexEl();
            ensureAccessibleRole(el);
            expect(el.getAttribute("role")).toBe("math");
            expect(el.getAttribute(A11Y_ADDED)).toBe("role");
        });

        it("does not overwrite existing role", () => {
            const el = createKatexEl();
            el.setAttribute("role", "math");
            ensureAccessibleRole(el);
            expect(el.getAttribute("role")).toBe("math");
            expect(el.hasAttribute(A11Y_ADDED)).toBe(false);
        });

        it("does not add role when .katex-mathml child is present (combined mode)", () => {
            const el = createKatexEl();
            const mathml = document.createElement("span");
            mathml.classList.add("katex-mathml");
            el.appendChild(mathml);
            ensureAccessibleRole(el);
            expect(el.hasAttribute("role")).toBe(false);
            expect(el.hasAttribute(A11Y_ADDED)).toBe(false);
        });
    });

    describe("updateTabIndex – combined mode (screen reader simulation)", () => {
        it("does NOT add role to overflowing .katex with .katex-mathml child", () => {
            // Simulates default KaTeX output: combined HTML + MathML.
            // A screen reader sees <math> inside .katex-mathml, which
            // already has implicit role="math".  Adding role="math" to
            // the outer .katex wrapper would cause a double announcement.
            const el = createKatexEl({overflows: true});
            const mathml = document.createElement("span");
            mathml.classList.add("katex-mathml");
            mathml.innerHTML = '<math xmlns="http://www.w3.org/1998/Math/MathML"><mi>x</mi></math>';
            el.appendChild(mathml);

            updateTabIndex(el);

            // tabindex is still added so the scrollable region is focusable
            expect(el.getAttribute("tabindex")).toBe("0");
            // but role="math" is NOT added — the inner <math> provides it
            expect(el.hasAttribute("role")).toBe(false);

            // Screen reader sees: one "math" role from <math>, no duplicate
            const mathRoles = [el, ...Array.from(el.querySelectorAll("*"))]
                .filter((n) => {
                    if (n instanceof HTMLElement) {
                        return n.getAttribute("role") === "math";
                    }
                    // <math> element has implicit role="math"
                    return n.tagName === "math";
                });
            expect(mathRoles).toHaveLength(1);
        });

        it("DOES add role to overflowing .katex in HTML-only mode", () => {
            // Simulates output: "html" — no .katex-mathml child.
            // The wrapper needs role="math" for screen readers.
            const el = createKatexEl({overflows: true});
            const htmlSpan = document.createElement("span");
            htmlSpan.classList.add("katex-html");
            el.appendChild(htmlSpan);

            updateTabIndex(el);

            expect(el.getAttribute("tabindex")).toBe("0");
            expect(el.getAttribute("role")).toBe("math");
        });
    });

    describe("removeAccessibleRole", () => {
        it("removes only attributes added by ensureAccessibleRole", () => {
            const el = createKatexEl();
            ensureAccessibleRole(el);

            removeAccessibleRole(el);
            expect(el.hasAttribute("role")).toBe(false);
            expect(el.hasAttribute(A11Y_ADDED)).toBe(false);
        });

        it.each([
            ["after ensureAccessibleRole", true],
            ["without ensureAccessibleRole", false],
        ])("preserves pre-existing role (%s)", (_label: string, callEnsure: boolean) => {
            const el = createKatexEl();
            el.setAttribute("role", "math");
            if (callEnsure) {
                ensureAccessibleRole(el);
            }
            removeAccessibleRole(el);
            expect(el.getAttribute("role")).toBe("math");
        });
    });

    describe("SPA lifecycle simulation (memory leak prevention)", () => {
        beforeEach(() => observed.clear());

        it("unobserve is called when elements are removed via MutationObserver", () => {
            // Simulate: add element, observe it, then remove it.
            // Before the fix, removedNodes were ignored and
            // ResizeObserver held references to detached DOM nodes.
            const el = createKatexEl({overflows: true});

            // Simulate observeKatex (what init() does for added nodes)
            updateTabIndex(el);
            observed.add(el);
            expect(observed.has(el)).toBe(true);
            expect(el.getAttribute("tabindex")).toBe("0");

            // Simulate unobserveKatex (what the fixed MutationObserver
            // does for removed nodes)
            observed.delete(el);
            el.removeAttribute("tabindex");
            removeAccessibleRole(el);

            expect(observed.has(el)).toBe(false);
            expect(el.hasAttribute("tabindex")).toBe(false);
            expect(el.hasAttribute("role")).toBe(false);
        });

        it("repeated add/remove cycles don't accumulate observer entries", () => {
            // Simulates an SPA re-rendering math on every state change.
            for (let i = 0; i < 100; i++) {
                const el = createKatexEl({overflows: true});
                updateTabIndex(el);
                observed.add(el);

                // "remove" the element
                observed.delete(el);
                el.removeAttribute("tabindex");
                removeAccessibleRole(el);
            }
            // All elements cleaned up — nothing lingering in the observer
            expect(observed.size).toBe(0);
        });
    });
});
