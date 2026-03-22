/**
 * @jest-environment jsdom
 */

import {
    updateTabIndex,
    ensureAccessibleName,
    removeAccessibleName,
    A11Y_ADDED,
} from "../a11y-tabindex";

/** Create a mock .katex element with optional inner MathML annotation. */
function createKatexEl(texSource?: string): HTMLElement {
    const el = document.createElement("span");
    el.classList.add("katex");
    if (texSource) {
        // Simulate the MathML annotation that KaTeX generates.
        const annotation = document.createElement("annotation");
        annotation.setAttribute("encoding", "application/x-tex");
        annotation.textContent = texSource;
        el.appendChild(annotation);
    }
    return el;
}

/** Make an element appear to overflow horizontally. */
function simulateOverflow(el: HTMLElement) {
    Object.defineProperty(el, "scrollWidth", {value: 500, configurable: true});
    Object.defineProperty(el, "clientWidth", {value: 300, configurable: true});
}

/** Make an element appear to NOT overflow. */
function simulateNoOverflow(el: HTMLElement) {
    Object.defineProperty(el, "scrollWidth", {value: 300, configurable: true});
    Object.defineProperty(el, "clientWidth", {value: 300, configurable: true});
}

describe("a11y-tabindex", () => {
    describe("updateTabIndex", () => {
        it("adds tabindex='0' when element overflows", () => {
            const el = createKatexEl("x^2");
            simulateOverflow(el);
            updateTabIndex(el);
            expect(el.getAttribute("tabindex")).toBe("0");
        });

        it("does not add tabindex when element does not overflow", () => {
            const el = createKatexEl("x^2");
            simulateNoOverflow(el);
            updateTabIndex(el);
            expect(el.hasAttribute("tabindex")).toBe(false);
        });

        it("removes tabindex when element stops overflowing", () => {
            const el = createKatexEl("x^2");

            // First overflow
            simulateOverflow(el);
            updateTabIndex(el);
            expect(el.getAttribute("tabindex")).toBe("0");

            // Then stop overflowing
            simulateNoOverflow(el);
            updateTabIndex(el);
            expect(el.hasAttribute("tabindex")).toBe(false);
        });

        it("adds accessible name when element overflows", () => {
            const el = createKatexEl("x^2");
            simulateOverflow(el);
            updateTabIndex(el);
            expect(el.getAttribute("role")).toBe("math");
            expect(el.getAttribute("aria-label")).toBe("x^2");
        });

        it("removes accessible name when element stops overflowing", () => {
            const el = createKatexEl("x^2");

            simulateOverflow(el);
            updateTabIndex(el);
            expect(el.getAttribute("role")).toBe("math");

            simulateNoOverflow(el);
            updateTabIndex(el);
            expect(el.hasAttribute("role")).toBe(false);
            expect(el.hasAttribute("aria-label")).toBe(false);
        });
    });

    describe("ensureAccessibleName", () => {
        it("adds role and aria-label from MathML annotation", () => {
            const el = createKatexEl("\\frac{1}{2}");
            ensureAccessibleName(el);
            expect(el.getAttribute("role")).toBe("math");
            expect(el.getAttribute("aria-label")).toBe("\\frac{1}{2}");
            expect(el.getAttribute(A11Y_ADDED)).toBe("role aria-label");
        });

        it("does not overwrite existing role", () => {
            const el = createKatexEl("x");
            el.setAttribute("role", "math");
            ensureAccessibleName(el);
            // role was already present, so only aria-label should be tracked
            expect(el.getAttribute(A11Y_ADDED)).toBe("aria-label");
        });

        it("does not overwrite existing aria-label", () => {
            const el = createKatexEl("x");
            el.setAttribute("aria-label", "existing label");
            ensureAccessibleName(el);
            expect(el.getAttribute("aria-label")).toBe("existing label");
            expect(el.getAttribute(A11Y_ADDED)).toBe("role");
        });

        it("does not add aria-label without annotation", () => {
            const el = createKatexEl(); // no TeX source
            ensureAccessibleName(el);
            expect(el.getAttribute("role")).toBe("math");
            expect(el.hasAttribute("aria-label")).toBe(false);
            expect(el.getAttribute(A11Y_ADDED)).toBe("role");
        });
    });

    describe("removeAccessibleName", () => {
        it("removes only attributes that were added by ensureAccessibleName", () => {
            const el = createKatexEl("x");
            el.setAttribute("role", "math"); // pre-existing (core set)
            ensureAccessibleName(el);
            // Only aria-label was added by ensureAccessibleName
            expect(el.getAttribute(A11Y_ADDED)).toBe("aria-label");

            removeAccessibleName(el);
            // aria-label removed, but core-set role preserved
            expect(el.hasAttribute("aria-label")).toBe(false);
            expect(el.getAttribute("role")).toBe("math");
            expect(el.hasAttribute(A11Y_ADDED)).toBe(false);
        });

        it("is a no-op when nothing was added", () => {
            const el = createKatexEl("x");
            el.setAttribute("role", "math");
            el.setAttribute("aria-label", "x");
            removeAccessibleName(el);
            // Everything should remain
            expect(el.getAttribute("role")).toBe("math");
            expect(el.getAttribute("aria-label")).toBe("x");
        });
    });
});
