window.onload = function() {
    var input = document.getElementById("input");
    var math = document.getElementById("math");

    if ("oninput" in input) {
        input.addEventListener("input", reprocess, false);
    } else {
        input.attachEvent("onkeyup", reprocess);
    }

    reprocess();

    function reprocess() {
        katex.process(input.value, math);
    }
};
