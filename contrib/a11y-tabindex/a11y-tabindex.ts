// Automatically adds tabindex="0" to KaTeX elements that overflow
// (are scrollable), satisfying WCAG 2.1 SC 2.1.1 and the axe
// scrollable-region-focusable rule.  Removes tabindex when the
// element is no longer scrollable (e.g. after a viewport resize).
//
// Usage:
//   <script defer src="https://cdn.jsdelivr.net/npm/katex/dist/contrib/a11y-tabindex.min.js"></script>

const A11Y_ADDED = "data-a11y-tabindex-added";

function ensureAccessibleName(el: HTMLElement): void {
    // In combined HTML+MathML mode, the .katex span has no role or
    // aria-label.  When we make it focusable we must also give it an
    // accessible name so it is not an unnamed focusable element (WCAG 4.1.2).
    // We track what we add so removeAccessibleName() can clean up without
    // removing attributes that core KaTeX set.
    const added: string[] = [];
    if (!el.hasAttribute("role")) {
        el.setAttribute("role", "math");
        added.push("role");
    }
    if (!el.hasAttribute("aria-label")) {
        const annotation =
            el.querySelector("annotation[encoding='application/x-tex']");
        if (annotation?.textContent) {
            el.setAttribute("aria-label", annotation.textContent);
            added.push("aria-label");
        }
    }
    if (added.length > 0) {
        el.setAttribute(A11Y_ADDED, added.join(" "));
    }
}

function removeAccessibleName(el: HTMLElement): void {
    const added = el.getAttribute(A11Y_ADDED);
    if (added) {
        for (const attr of added.split(" ")) {
            el.removeAttribute(attr);
        }
        el.removeAttribute(A11Y_ADDED);
    }
}

function updateTabIndex(el: Element): void {
    if (el instanceof HTMLElement) {
        if (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight) {
            el.setAttribute("tabindex", "0");
            ensureAccessibleName(el);
        } else {
            el.removeAttribute("tabindex");
            removeAccessibleName(el);
        }
    }
}

function observeKatex(el: Element, resizeObserver: ResizeObserver): void {
    updateTabIndex(el);
    resizeObserver.observe(el);
}

function init(): void {
    // Re-check on resize since overflow can change with viewport width.
    const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            updateTabIndex(entry.target);
        }
    });

    // Handle all existing .katex elements.
    document.querySelectorAll(".katex").forEach(
        (el) => observeKatex(el, resizeObserver));

    // Watch for new .katex elements added to the DOM.
    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            const nodes = Array.from(mutation.addedNodes);
            for (const node of nodes) {
                if (node instanceof Element) {
                    if (node.classList.contains("katex")) {
                        observeKatex(node, resizeObserver);
                    } else {
                        node.querySelectorAll(".katex").forEach(
                            (el) => observeKatex(el, resizeObserver));
                    }
                }
            }
        }
    }).observe(document.body, {childList: true, subtree: true});
}

if (document.readyState !== "loading") {
    init();
} else {
    document.addEventListener("DOMContentLoaded", init);
}
