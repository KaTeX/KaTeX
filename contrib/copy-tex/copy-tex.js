import './copy-tex.css';
import katexReplaceWithTex from './katex2tex';

// Global copy handler to modify behavior on .katex elements.
document.addEventListener('copy', function(event) {
    const selection = window.getSelection();
    if (selection.isCollapsed) {
        return;  // default action OK if selection is empty
    }
    const fragment = selection.getRangeAt(0).cloneContents();
    if (!fragment.querySelector('.katex-mathml')) {
        return;  // default action OK if no .katex-mathml elements
    }
    // Preserve usual HTML copy/paste behavior.
    const html = [];
    Array.prototype.forEach.call(fragment.childNodes, function (item) {
        html.push(item.outerHTML);
    });
    event.clipboardData.setData('text/html', html.join(''));
    // Rewrite plain-text version.
    event.clipboardData.setData('text/plain',
        katexReplaceWithTex(fragment).textContent);
    // Prevent normal copy handling.
    event.preventDefault();
});
