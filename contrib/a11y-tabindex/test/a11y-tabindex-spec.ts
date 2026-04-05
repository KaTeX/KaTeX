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

import {updateTabIndex} from "../a11y-tabindex";

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
        it("adds tabindex when overflowing", () => {
            const el = createKatexEl({overflows: true});
            updateTabIndex(el);
            expect(el.getAttribute("tabindex")).toBe("0");
        });

        it("skips tabindex when not overflowing", () => {
            const el = createKatexEl({overflows: false});
            updateTabIndex(el);
            expect(el.getAttribute("tabindex")).toBe(null);
        });

        it("removes tabindex when element stops overflowing", () => {
            const el = createKatexEl({overflows: true});
            updateTabIndex(el);

            setOverflow(el, false);
            updateTabIndex(el);
            expect(el.hasAttribute("tabindex")).toBe(false);
        });
    });

    describe("SPA lifecycle (memory leak prevention via MutationObserver)", () => {
        // The `import` at the top of this file is hoisted above the
        // ResizeObserver mock, so init() never ran (its typeof guard
        // saw undefined).  We use require() here so the module loads
        // AFTER the mock is in place, giving us a live MutationObserver.

        /** Flush jsdom's MutationObserver queue. */
        const flushMutations = () =>
            new Promise<void>((r) => { setTimeout(r, 0); });

        beforeEach(() => {
            observed.clear();
            // Re-require the module so init() runs with the mock active.
            jest.isolateModules(() => {
                require("../a11y-tabindex");
            });
        });

        it("observes added .katex and unobserves removed ones", async() => {
            const el = createKatexEl({overflows: true});

            document.body.appendChild(el);
            await flushMutations();

            expect(observed.has(el)).toBe(true);
            expect(el.getAttribute("tabindex")).toBe("0");

            document.body.removeChild(el);
            await flushMutations();

            expect(observed.has(el)).toBe(false);
            expect(el.hasAttribute("tabindex")).toBe(false);
        });

        it("handles nested .katex inside a wrapper div", async() => {
            const wrapper = document.createElement("div");
            const el1 = createKatexEl({overflows: true});
            const el2 = createKatexEl({overflows: true});
            wrapper.appendChild(el1);
            wrapper.appendChild(el2);

            document.body.appendChild(wrapper);
            await flushMutations();
            expect(observed.has(el1)).toBe(true);
            expect(observed.has(el2)).toBe(true);

            document.body.removeChild(wrapper);
            await flushMutations();
            expect(observed.has(el1)).toBe(false);
            expect(observed.has(el2)).toBe(false);
        });

        it("ignores text-node mutations (non-Element nodes)", async() => {
            const text = document.createTextNode("hello");
            document.body.appendChild(text);
            await flushMutations();
            // No error and no observed entries for text nodes
            expect(observed.size).toBe(0);
            document.body.removeChild(text);
            await flushMutations();
        });

        it("observes pre-existing .katex elements at init time", async() => {
            // Place a .katex element in the DOM before re-requiring the module
            const el = createKatexEl({overflows: true});
            document.body.appendChild(el);

            observed.clear();
            jest.isolateModules(() => {
                require("../a11y-tabindex");
            });
            await flushMutations();

            expect(observed.has(el)).toBe(true);
            expect(el.getAttribute("tabindex")).toBe("0");

            document.body.removeChild(el);
            await flushMutations();
        });

        it("ResizeObserver callback updates tabindex on observed elements",
            async() => {
                // Capture the ResizeObserver callback
                let resizeCallback:
                    ((entries: {target: Element}[]) => void) | null = null;
                const origObserve = global.ResizeObserver;
                global.ResizeObserver = class {
                    constructor(cb: (entries: {target: Element}[]) => void) {
                        resizeCallback = cb;
                    }
                    observe(el: Element) { observed.add(el); }
                    unobserve(el: Element) { observed.delete(el); }
                    disconnect() { observed.clear(); }
                } as unknown as typeof ResizeObserver;

                jest.isolateModules(() => {
                    require("../a11y-tabindex");
                });

                const el = createKatexEl({overflows: true});
                document.body.appendChild(el);
                await flushMutations();

                // Simulate a resize that makes the element no longer overflow
                setOverflow(el, false);
                resizeCallback!([{target: el}]);
                expect(el.hasAttribute("tabindex")).toBe(false);

                document.body.removeChild(el);
                await flushMutations();
                global.ResizeObserver = origObserve;
            });

        it("repeated add/remove cycles don't accumulate entries", async() => {
            for (let i = 0; i < 20; i++) {
                const el = createKatexEl({overflows: true});
                document.body.appendChild(el);
                await flushMutations();

                document.body.removeChild(el);
                await flushMutations();
            }
            expect(observed.size).toBe(0);
        });
    });
});
