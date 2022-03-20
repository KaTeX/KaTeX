import katexReplaceWithTex from './katex2tex';

document.addEventListener('copy', function (event) {
    const selection = window.getSelection();
    if (selection.isCollapsed) {
        return; // default action OK if selection is empty
    }
    const range = selection.getRangeAt(0);

    const sel_parent = range.commonAncestorContainer;
    if (!(sel_parent instanceof Element)) {
        return;
    }
    const closest_katex = sel_parent.closest('.katex');

    let fragment, html_contents;

    if (closest_katex) {
        // Then we are fully inside an equation. We expand the selection to be the entire equation.

        fragment = /** @type Element */ (closest_katex.cloneNode(true));

        if (!fragment.querySelector('.katex-mathml')) {
            return; // default action OK if no .katex-mathml elements
        }
        html_contents = fragment.innerHTML;
    } else {
        fragment = range.cloneContents();
        if (!fragment.querySelector('.katex-mathml')) {
            return; // default action OK if no .katex-mathml elements
        }
        html_contents = Array.prototype.map.call(fragment.childNodes, (el) => (el instanceof Text ? el.textContent : el.outerHTML)).join('');
    }

    // Preserve usual HTML copy/paste behavior.
    event.clipboardData.setData('text/html', html_contents);
    // Rewrite plain-text version.
    event.clipboardData.setData('text/plain', katexReplaceWithTex(fragment).textContent);
    // Prevent normal copy handling.
    event.preventDefault();
});
