/* eslint-disable no-var */
// Inspired by ScrollSpy as in e.g. Bootstrap

(function() {
    var OFFSET = 10;
    var timer;

    var headingsCache;
    function findHeadings() {
        return headingsCache ? headingsCache :
            document.querySelectorAll('.toc-headings > li > a');
    }

    function onScroll() {
        if (timer) {  // throttle
            return;
        }
        timer = setTimeout(function() {
            timer = null;
            var found = false;
            var headings = findHeadings();
            for (var i = 0; i < headings.length; i++) {
                // if !found and i is the last element, highlight the last
                var current = !found;
                if (!found && i < headings.length - 1) {
                    var next = headings[i + 1].href.split('#')[1];
                    var nextHeader = document.getElementById(next);
                    var top = nextHeader.getBoundingClientRect().top;
                    // The following tests whether top + scrollTop
                    // (the top of the header) is greater than scrollTop
                    // (where scrollTop = window.pageYOffset, the top of
                    // the window), with OFFSET pixels of slop.
                    current = top > OFFSET;
                }
                if (current) {
                    found = true;
                    headings[i].className = "active";
                } else {
                    headings[i].className = "";
                }
            }
        }, 100);
    }

    document.addEventListener('scroll', onScroll);
    document.addEventListener('resize', onScroll);
    document.addEventListener('DOMContentLoaded', function() {
        // Cache the headings once the page has fully loaded.
        headingsCache = findHeadings();
        onScroll();
    });
})();
