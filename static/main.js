window.onload = function() {
    var input = document.getElementById("input");
    var math = document.getElementById("math");

    reprocess();

    if ("oninput" in input) {
        input.addEventListener("input", reprocess, false);
    } else {
        input.attachEvent("onkeyup", reprocess);
    }

    function reprocess() {
        MJLite.process(input.value, math);
    }
};
