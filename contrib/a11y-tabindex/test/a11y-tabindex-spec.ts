/**
 * @jest-environment jsdom
 */

import {
    updateTabIndex,
    ensureAccessibleName,
    removeAccessibleName,
    A11Y_ADDED,
} from "../a11y-tabindex";

/** Create a mock .katex element with optional TeX annotation and overflow. */
function createKatexEl(
    {tex, overflows}: {tex?: string, overflows?: boolean} = {},
): HTMLElement {
    const el = document.createElement("span");
    el.classList.add("katex");
    if (tex) {
        const annotation = document.createElement("annotation");
        annotation.setAttribute("encoding", "application/x-tex");
        annotation.textContent = tex;
        el.appendChild(annotation);
    }
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
        it.each([
            [true, "0"],
            [false, null],
        ])("overflows=%s → tabindex=%s", (overflows, expected) => {
            const el = createKatexEl({tex: "x^2", overflows});
            updateTabIndex(el);
            expect(el.getAttribute("tabindex")).toBe(expected);
        });

        it("removes tabindex when element stops overflowing", () => {
            const el = createKatexEl({tex: "x^2", overflows: true});
            updateTabIndex(el);
            expect(el.getAttribute("tabindex")).toBe("0");

            setOverflow(el, false);
            updateTabIndex(el);
            expect(el.hasAttribute("tabindex")).toBe(false);
        });

        it.each([
            ["role", "math"],
            ["aria-label", "x^2"],
        ])("overflowing element gets %s=%s", (attr, value) => {
            const el = createKatexEl({tex: "x^2", overflows: true});
            updateTabIndex(el);
            expect(el.getAttribute(attr)).toBe(value);
        });

        it.each([
            ["role"],
            ["aria-label"],
        ])("removes %s when element stops overflowing", (attr) => {
            const el = createKatexEl({tex: "x^2", overflows: true});
            updateTabIndex(el);

            setOverflow(el, false);
            updateTabIndex(el);
            expect(el.hasAttribute(attr)).toBe(false);
        });
    });

    describe("ensureAccessibleName", () => {
        it("adds role and aria-label from MathML annotation", () => {
            const el = createKatexEl({tex: "\\frac{1}{2}"});
            ensureAccessibleName(el);
            expect(el.getAttribute("role")).toBe("math");
            expect(el.getAttribute("aria-label")).toBe("\\frac{1}{2}");
            expect(el.getAttribute(A11Y_ADDED)).toBe("role aria-label");
        });

        it.each([
            ["role", "math", "aria-label"],
            ["aria-label", "existing label", "role"],
        ])("does not overwrite existing %s", (attr, value, expectedAdded) => {
            const el = createKatexEl({tex: "x"});
            el.setAttribute(attr, value);
            ensureAccessibleName(el);
            expect(el.getAttribute(attr)).toBe(value);
            expect(el.getAttribute(A11Y_ADDED)).toBe(expectedAdded);
        });

        it("does not add aria-label without annotation", () => {
            const el = createKatexEl();
            ensureAccessibleName(el);
            expect(el.getAttribute("role")).toBe("math");
            expect(el.hasAttribute("aria-label")).toBe(false);
            expect(el.getAttribute(A11Y_ADDED)).toBe("role");
        });
    });

    describe("removeAccessibleName", () => {
        it("removes only attributes added by ensureAccessibleName", () => {
            const el = createKatexEl({tex: "x"});
            el.setAttribute("role", "math"); // pre-existing (core set)
            ensureAccessibleName(el);

            removeAccessibleName(el);
            expect(el.hasAttribute("aria-label")).toBe(false);
            expect(el.getAttribute("role")).toBe("math"); // preserved
            expect(el.hasAttribute(A11Y_ADDED)).toBe(false);
        });

        it("is a no-op when nothing was added", () => {
            const el = createKatexEl({tex: "x"});
            el.setAttribute("role", "math");
            el.setAttribute("aria-label", "x");
            removeAccessibleName(el);
            expect(el.getAttribute("role")).toBe("math");
            expect(el.getAttribute("aria-label")).toBe("x");
        });
    });
});
