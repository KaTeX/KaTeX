function init() {
    var input = document.getElementById("input");
    var math = document.getElementById("math");
    var permalink = document.getElementById("permalink");

    if ("oninput" in input) {
        input.addEventListener("input", reprocess, false);
    } else if (input.attachEvent) {
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
    var macroRegex = /(?:^\?|&)(?:\\|%5[Cc])([A-Za-z]+)=([^&]*)/g;
    var macroString = "";
    while ((match = macroRegex.exec(window.location.search)) !== null) {
        options.macros = macros;
        macros["\\" + match[1]] = decodeURIComponent(match[2]);
        macroString += "&" + match[0].substr(1);
    }

    // The `before` search parameter puts normal text before the math.
    // The `after` search parameter puts normal text after the math.
    // Example use: testing baseline alignment.
    if (/(?:^\?|&)(?:before|after)=/.test(window.location.search)) {
        var mathContainer = math;
        mathContainer.id = "math-container";

        if ((match = /(?:^\?|&)before=([^&]*)/.exec(window.location.search))) {
            var child = document.createTextNode(decodeURIComponent(match[1]));
            mathContainer.appendChild(child);
            macroString += "&" + match[0].substr(1);
        }

        math = document.createElement("span");
        math.id = "math";
        mathContainer.appendChild(math);

        if ((match = /(?:^\?|&)after=([^&]*)/.exec(window.location.search))) {
            var child = document.createTextNode(decodeURIComponent(match[1]));
            mathContainer.appendChild(child);
            macroString += "&" + match[0].substr(1);
        }
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
