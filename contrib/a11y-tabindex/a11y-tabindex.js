// Automatically adds tabindex="0" to KaTeX elements that overflow
// (are scrollable), satisfying WCAG 2.1 SC 2.1.1 and the axe
// scrollable-region-focusable rule.  Removes tabindex when the
// element is no longer scrollable (e.g. after a viewport resize).
//
// Usage:
//   <script defer src="https://cdn.jsdelivr.net/npm/katex/dist/contrib/a11y-tabindex.min.js"></script>

export const A11Y_ADDED = "data-a11y-tabindex-added";

export function ensureAccessibleRole(el) {
    // When we make a .katex element focusable, it must have role="math"
    // so it is not an unnamed focusable element (WCAG 4.1.2).
    // We track what we add so removeAccessibleRole() can clean up without
    // removing attributes that core KaTeX set.
    if (!el.hasAttribute("role")) {
        el.setAttribute("role", "math");
        el.setAttribute(A11Y_ADDED, "role");
    }
}

export function removeAccessibleRole(el) {
    const added = el.getAttribute(A11Y_ADDED);
    if (added) {
        added.split(" ").forEach((attr) => {
            el.removeAttribute(attr);
        });
        el.removeAttribute(A11Y_ADDED);
    }
}

export function updateTabIndex(el) {
    if (el instanceof HTMLElement) {
        if (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight) {
            el.setAttribute("tabindex", "0");
            ensureAccessibleRole(el);
        } else {
            el.removeAttribute("tabindex");
            removeAccessibleRole(el);
        }
    }
}

function observeKatex(el, resizeObserver) {
    updateTabIndex(el);
    resizeObserver.observe(el);
}

function init() {
    // Re-check on resize since overflow can change with viewport width.
    const resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
            updateTabIndex(entry.target);
        });
    });

    // Handle all existing .katex elements.
    document.querySelectorAll(".katex").forEach(
        (el) => observeKatex(el, resizeObserver));

    // Watch for new .katex elements added to the DOM.
    new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            Array.from(mutation.addedNodes).forEach((node) => {
                if (node instanceof Element) {
                    if (node.classList.contains("katex")) {
                        observeKatex(node, resizeObserver);
                    } else {
                        node.querySelectorAll(".katex").forEach(
                            (el) => observeKatex(el, resizeObserver));
                    }
                }
            });
        });
    }).observe(document.body, {childList: true, subtree: true});
}

if (typeof document !== "undefined" && typeof ResizeObserver !== "undefined") {
    if (document.readyState !== "loading") {
        init();
    } else {
        document.addEventListener("DOMContentLoaded", init);
    }
}
