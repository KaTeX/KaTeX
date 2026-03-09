// Automatically adds tabindex="0" to KaTeX elements that overflow
// (are scrollable), satisfying WCAG 2.1 SC 2.1.1 and the axe
// scrollable-region-focusable rule.  Removes tabindex when the
// element is no longer scrollable (e.g. after a viewport resize).
//
// Usage:
//   <script defer src="https://cdn.jsdelivr.net/npm/katex/dist/contrib/a11y-tabindex.min.js"></script>

function updateTabIndex(el: Element): void {
    if (el instanceof HTMLElement) {
        if (el.scrollWidth > el.clientWidth) {
            el.setAttribute("tabindex", "0");
        } else {
            el.removeAttribute("tabindex");
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
                    }
                    node.querySelectorAll(".katex").forEach(
                        (el) => observeKatex(el, resizeObserver));
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
