function init() {
    var input = document.getElementById("input");
    var math = document.getElementById("math");
    var permalink = document.getElementById("permalink");

    if ("oninput" in input) {
        input.addEventListener("input", reprocess, false);
    } else {
        input.attachEvent("onkeyup", reprocess);
    }

    if ("addEventListener" in permalink) {
        permalink.addEventListener("click", setSearch);
    } else {
        permalink.attachEvent("click", setSearch);
    }

    var match = (/(?:^\?|&)text=([^&]*)/).exec(window.location.search);
    if (match) {
        input.value = decodeURIComponent(match[1]);
    }

    var macros = {};
    var options = {};
    var reMacro = /(?:^\?|&)(?:\\|%5[Cc])([A-Za-z]+)=([^&]*)/g;
    var macroString = "";
    while ((match = reMacro.exec(window.location.search)) !== null) {
        options.macros = macros;
        macros["\\" + match[1]] = decodeURIComponent(match[2]);
        macroString += "&" + match[0].substr(1);
    }

    reprocess();

    function setSearch() {
        window.location.search =
            "?text=" + encodeURIComponent(input.value) + macroString;
    }

    function reprocess() {
        try {
            katex.render(input.value, math, options);
        } catch (e) {
            if (e.__proto__ == katex.ParseError.prototype) {
                console.error(e);
            } else {
                throw e;
            }
        }
    }
}

init();
