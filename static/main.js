function init() {
    var input = document.getElementById("input");
    var math = document.getElementById("math");
    var permalink = document.getElementById("permalink");

    if ("oninput" in input) {
        input.addEventListener("input", reprocess, false);
    } else {
        input.attachEvent("onkeyup", reprocess);
    }

    permalink.addEventListener("click", function() {
        window.location.search = "?text=" + encodeURIComponent(input.value);
    });

    var match = (/(?:^\?|&)text=([^&]+)/).exec(window.location.search);
    if (match) {
        input.value = decodeURIComponent(match[1]);
    }

    reprocess();

    function reprocess() {
        katex.process(input.value, math);
    }
}

init();
