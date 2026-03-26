/**
 * @jest-environment jsdom
 */

// jsdom does not provide ResizeObserver.  The module guards init() behind
// `typeof ResizeObserver !== "undefined"`, but we stub it here anyway so
// tests that call updateTabIndex on real elements work correctly.
global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
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
});
