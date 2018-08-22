// Inspired by ScrollSpy as in e.g. Bootstrap

(function() {
    const OFFSET = 10;
    let timer;
    let headingsCache;
    const findHeadings = () => headingsCache ? headingsCache :
        document.querySelectorAll('.toc-headings > li > a');
    const onScroll = () => {
        if (timer) {  // throttle
            return;
        }
        timer = setTimeout(() => {
            timer = null;
            let found = false;
            const headings = findHeadings();
            Array.prototype.forEach.call(headings, function(heading, i) {
                // if !found and i is the last element, highlight the last
                let current = !found;
                if (!found && i < headings.length - 1) {
                    const next = headings[i + 1].href.split('#')[1];
                    const nextHeader = document.getElementById(next);
                    const top = nextHeader.getBoundingClientRect().top;
                    // The following tests whether top + scrollTop
                    // (the top of the header) is greater than scrollTop
                    // (where scrollTop = window.pageYOffset, the top of
                    // the window), with OFFSET pixels of slop.
                    current = top > OFFSET;
                }
                if (current) {
                    found = true;
                    heading.className = "active";
                } else {
                    heading.className = "";
                }
            });
        }, 100);
    };
    document.addEventListener('scroll', onScroll);
    document.addEventListener('resize', onScroll);
    document.addEventListener('DOMContentLoaded', () => {
        // Cache the headings once the page has fully loaded.
        headingsCache = findHeadings();
        onScroll();
    });
})();
