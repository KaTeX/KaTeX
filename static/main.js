/* eslint no-console:0 */
/**
 * This is the webpack entry point for the test page.
 */
import katex from '../katex.webpack.js';
import './main.css';

function init() {
    const input = document.getElementById("input");
    let math = document.getElementById("math");
    const permalink = document.getElementById("permalink");

    input.addEventListener("input", reprocess, false);
    permalink.addEventListener("click", setSearch);

    let match = (/(?:^\?|&)text=([^&]*)/).exec(window.location.search);
    if (match) {
        input.value = decodeURIComponent(match[1]);
    }

    const macros = {};
    // TODO: Add toggle for displayMode.
    // https://github.com/Khan/KaTeX/issues/1035
    const options = {displayMode: true, throwOnError: false};
    const macroRegex = /(?:^\?|&)(?:\\|%5[Cc])([A-Za-z]+)=([^&]*)/g;
    let macroString = "";
    while ((match = macroRegex.exec(window.location.search)) !== null) {
        options.macros = macros;
        macros["\\" + match[1]] = decodeURIComponent(match[2]);
        macroString += "&" + match[0].substr(1);
    }

    // The `before` search parameter puts normal text before the math.
    // The `after` search parameter puts normal text after the math.
    // Example use: testing baseline alignment.
    if (/(?:^\?|&)(?:before|after)=/.test(window.location.search)) {
        const mathContainer = math;
        mathContainer.id = "math-container";

        if ((match = /(?:^\?|&)before=([^&]*)/.exec(window.location.search))) {
            const before = document.createTextNode(decodeURIComponent(match[1]));
            mathContainer.appendChild(before);
            macroString += "&" + match[0].substr(1);
        }

        math = document.createElement("span");
        math.id = "math";
        mathContainer.appendChild(math);

        if ((match = /(?:^\?|&)after=([^&]*)/.exec(window.location.search))) {
            const after = document.createTextNode(decodeURIComponent(match[1]));
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
