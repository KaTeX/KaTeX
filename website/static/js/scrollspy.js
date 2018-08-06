const epsilon = 10;
let timer;
const onScroll = () => {
    if (timer) {  // throttle
        return;
    }
    timer = setTimeout(() => {
        let found = false;
        const headings = document.querySelectorAll('.toc-headings > li > a');
        const scrollTop = document.documentElement.scrollTop ||
            document.body.scrollTop;
        const scrollBottom = scrollTop + window.innerHeight;
        for (let i = 0; i < headings.length; i++) {
            // if !found and i is the last element, highlight the last
            let current = !found;
            if (!found && i < headings.length - 1) {
                const next = headings[i + 1].href.split('#')[1];
                const nextHeader = document.getElementById(next);
                const top = nextHeader.getBoundingClientRect().top + scrollTop;
                current = top > scrollTop + epsilon;
            }
            if (current) {
                found = true;
                headings[i].className = "active";
            } else {
                headings[i].className = "";
            }
        }
        timer = null;
    }, 50);
};
document.addEventListener('scroll', onScroll);
document.addEventListener('resize', onScroll);
document.addEventListener('ready', onScroll);
onScroll();
