// Set these to how you want inline and display math to be delimited.
const copyDelimiters = {
    inline: ['$', '$'],    // alternative: ['\(', '\)']
    display: ['$$', '$$'], // alternative: ['\[', '\]']
};

// Replace .katex elements with their TeX source (<annotation> element).
// Modifies fragment in-place.  Useful for writing your own 'copy' handler.
window.katexReplaceWithTex = function(fragment) {
    const katexs = fragment.querySelectorAll('.katex');
    // Replace .katex elements with their annotation (TeX source) descendant,
    // with inline delimiters.
    for (let i = 0; i < katexs.length; i++) {
        const element = katexs[i];
        const texSource = element.querySelector('annotation');
        if (texSource) {
            if (element.replaceWith) {
                element.replaceWith(texSource);
            } else {
                element.parentNode.replaceChild(texSource, element);
            }
            texSource.innerHTML = copyDelimiters.inline[0] +
                texSource.innerHTML + copyDelimiters.inline[1];
        }
    }
    // Switch display math to display delimiters.
    const displays = fragment.querySelectorAll('.katex-display annotation');
    for (let i = 0; i < displays.length; i++) {
        const element = displays[i];
        element.innerHTML = copyDelimiters.display[0] +
            element.innerHTML.substr(copyDelimiters.inline[0].length,
                element.innerHTML.length - copyDelimiters.inline[0].length
                - copyDelimiters.inline[1].length)
            + copyDelimiters.display[1];
    }
    return fragment;
};

// Global copy handler to modify behavior on .katex elements.
document.addEventListener('copy', function(event) {
    const selection = window.getSelection();
    if (selection.isCollapsed) {
        return;  // default action OK if selection is empty
    }
    const fragment = selection.getRangeAt(0).cloneContents();
    if (!fragment.querySelector('.katex')) {
        return;  // default action OK if no .katex elements
    }
    // Preserve usual HTML copy/paste behavior.
    const html = [];
    for (let i = 0; i < fragment.childNodes.length; i++) {
        html.push(fragment.childNodes[i].outerHTML);
    }
    event.clipboardData.setData('text/html', html.join(''));
    // Rewrite plain-text version.
    event.clipboardData.setData('text/plain',
        window.katexReplaceWithTex(fragment).textContent);
    // Prevent normal copy handling.
    event.preventDefault();
});
