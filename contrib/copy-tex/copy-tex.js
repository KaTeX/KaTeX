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
    katexs.forEach(function(element) {
        const texSource = element.querySelector('annotation');
        if (texSource) {
            element.replaceWith(texSource);
            texSource.innerHTML = copyDelimiters.inline[0] +
                texSource.innerHTML + copyDelimiters.inline[1];
        }
    });
    // Switch display math to display delimiters.
    fragment.querySelectorAll('.katex-display annotation').forEach(
        function(element) {
            element.innerHTML = copyDelimiters.display[0] +
                element.innerHTML.substr(copyDelimiters.inline[0].length,
                    element.innerHTML.length - copyDelimiters.inline[0].length
                    - copyDelimiters.inline[1].length)
                + copyDelimiters.display[1];
        });
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
    event.clipboardData.setData('text/plain',
        window.katexReplaceWithTex(fragment).textContent);
    // Preserve usual HTML copy/paste behavior.
    event.clipboardData.setData('text/html',
        selection.getRangeAt(0).cloneContents());
    // Prevent normal copy handling.
    event.preventDefault();
});
