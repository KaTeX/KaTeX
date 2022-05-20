// @flow

import katexReplaceWithTex from './katex2tex';

// Global copy handler to modify behavior on/within .katex elements.
document.addEventListener('copy', function(event: ClipboardEvent) {
    const selection = window.getSelection();
    if (selection.isCollapsed || !event.clipboardData) {
        return; // default action OK if selection is empty or unchangeable
    }
    const clipboardData = event.clipboardData;
    const range = selection.getRangeAt(0);

    const selParent = range.commonAncestorContainer;
    if (!(selParent instanceof Element)) {
        return;
    }
    const closestKatex = selParent.closest('.katex');

    let fragment: Element | DocumentFragment;
    let htmlContents: string;

    if (closestKatex) {
        // When fully inside an equation, expand selection to entire equation.
        fragment = closestKatex.cloneNode(true);
    } else {
        fragment = range.cloneContents();
    }

    if (!fragment.querySelector('.katex-mathml')) {
        return; // default action OK if no .katex-mathml elements
    }

    if (fragment instanceof DocumentFragment) {
        htmlContents = Array.prototype.map.call(fragment.childNodes,
          (el) => (el instanceof Text ? el.textContent : el.outerHTML)
        ).join('');
    } else {
        htmlContents = fragment.outerHTML;
    }

    // Preserve usual HTML copy/paste behavior.
    clipboardData.setData('text/html', htmlContents);
    // Rewrite plain-text version.
    clipboardData.setData('text/plain',
        katexReplaceWithTex(fragment).textContent);
    // Prevent normal copy handling.
    event.preventDefault();
});
