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
    //
    // In combined HTML+MathML mode the inner <math> element already
    // provides role="math" semantics.  Adding it to the .katex wrapper
    // would cause double announcements in some screen readers (see
    // buildTree.ts).  Detect combined mode by the presence of the
    // .katex-mathml child.
    if (!el.hasAttribute("role") && !el.querySelector(".katex-mathml")) {
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

function unobserveKatex(el, resizeObserver) {
    resizeObserver.unobserve(el);
    el.removeAttribute("tabindex");
    removeAccessibleRole(el);
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

    // Apply fn to every .katex element in a NodeList.
    function forEachKatex(nodes, fn) {
        Array.from(nodes).forEach((node) => {
            if (!(node instanceof Element)) {
                return;
            }
            if (node.classList.contains("katex")) {
                fn(node);
            } else {
                node.querySelectorAll(".katex").forEach(fn);
            }
        });
    }

    // Watch for .katex elements added to / removed from the DOM.
    new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            forEachKatex(mutation.addedNodes,
                (el) => observeKatex(el, resizeObserver));
            forEachKatex(mutation.removedNodes,
                (el) => unobserveKatex(el, resizeObserver));
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
