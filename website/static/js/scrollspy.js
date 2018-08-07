// Inspired by ScrollSpy as in e.g. Bootstrap

(function () {
    const OFFSET = 10;
    let timer;
    let headingsCache;
    const findHeadings = () => headingsCache ? headingsCache :
        document.querySelectorAll('.toc-headings > li > a');
    const onScroll = () => {
        if (timer) {  // throttle
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            let found = false;
            let headings = findHeadings();
            const scrollTop = window.pageYOffset;
            for (let i = 0; i < headings.length; i++) {
                // if !found and i is the last element, highlight the last
                let current = !found;
                if (!found && i < headings.length - 1) {
                    const next = headings[i + 1].href.split('#')[1];
                    const nextHeader = document.getElementById(next);
                    const top = nextHeader.getBoundingClientRect().top;
                    current = top > OFFSET;
                }
                if (current) {
                    found = true;
                    headings[i].className = "active";
                } else {
                    headings[i].className = "";
                }
            }
            timer = null;
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
