/* eslint no-console:0 */
/**
 * This is the webpack entry point for the test page.
 */
import katex from '../katex.webpack.js';
import './main.css';

function argumentRegex(keyRegex) {
    return new RegExp(`(?:^\\?|&)(${keyRegex})=([^&]*)`, "g");
}

function argument(keyRegex) {
    return argumentRegex(keyRegex).exec(window.location.search);
}

function init() {
    const input = document.getElementById("input");
    let math = document.getElementById("math");
    const permalink = document.getElementById("permalink");

    input.addEventListener("input", reprocess, false);
    permalink.addEventListener("click", setSearch);

    let match;
    if ((match = argument("text"))) {
        input.value = decodeURIComponent(match[2]);
    }

    const macros = {};
    const options = {displayMode: true};
    const macroRegex = argumentRegex("(?:\\\\|%5[Cc])[A-Za-z]+|.");
    let macroString = "";
    while ((match = macroRegex.exec(window.location.search)) !== null) {
        options.macros = macros;
        macros[match[1].replace(/%5[cC]/, "\\")] = decodeURIComponent(match[2]);
        macroString += "&" + match[0].substr(1);
    }

    // Use `display=0` or `displayMode=0` to turn off displayMode.
    if ((match = argument("display|displayMode"))) {
        if (match[2] === "false" || match[2] === "0" || match[2] === "no") {
            options.displayMode = false;
            macroString += "&" + match[0].substr(1);
        }
    }

    // The `before` search parameter puts normal text before the math.
    // The `after` search parameter puts normal text after the math.
    // Example use: testing baseline alignment.
    if (argument("before|after")) {
        const mathContainer = math;
        mathContainer.id = "math-container";

        if ((match = argument("before"))) {
            const before = document.createTextNode(decodeURIComponent(match[2]));
            mathContainer.appendChild(before);
            macroString += "&" + match[0].substr(1);
        }

        math = document.createElement("span");
        math.id = "math";
        mathContainer.appendChild(math);

        if ((match = argument("after"))) {
            const after = document.createTextNode(decodeURIComponent(match[2]));
            mathContainer.appendChild(after);
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
            if (e.__proto__ === katex.ParseError.prototype) {
                console.error(e);
            } else {
                throw e;
            }
        }
    }

    if (module.hot) {
        module.hot.accept('../katex.webpack.js', reprocess);
    }
}

init();

export default katex;
