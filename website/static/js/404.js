/* eslint-disable no-var */
/* global katex: false */
(function() {
    var tex = document.getElementsByClassName("tex");
    Array.prototype.forEach.call(tex, function(el) {
        katex.render(el.getAttribute("data-expr"), el);
    });
})();
