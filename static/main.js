/* eslint no-console:0 */
/**
 * This is the webpack entry point for the test page.
 */
import katex from '../katex.webpack.js';
import './main.css';
import queryString from 'query-string';

function init() {
    const input = document.getElementById("input");
    let math = document.getElementById("math");
    const permalink = document.getElementById("permalink");

    input.addEventListener("input", reprocess, false);
    permalink.addEventListener("click", setSearch);

    const options = {displayMode: true, throwOnError: true, trust: true};
    const macros = {};
    const query = queryString.parse(window.location.search);

    if (query.text) {
        input.value = query.text;
    }

    // Use `display=0` or `displayMode=0` (or `=f`/`=false`/`=n`/`=no`)
    // to turn off displayMode (which is on by default).
    const displayQuery = (query.displayMode || query.display);
    if (displayQuery && displayQuery.match(/^(0|f|n)/)) {
        options.displayMode = false;
    }

    // Use `leqno=1` (or `=t`/`=true`/`=y`/`=yes`) to put tags on left side.
    if (query.leqno && query.leqno.match(/^(1|t|y)/)) {
        options.leqno = true;
    }

    // Use `fleqn=1` (or `=t`/`=true`/`=y`/`=yes`) to put tags on left side.
    if (query.fleqn && query.fleqn.match(/^(1|t|y)/)) {
        options.fleqn = true;
    }

    // Use `strict=warn` for warning strict mode or `strict=error`
    // (or `=1`/`=t`/`=true`/`=y`/`=yes`)
    // to turn off displayMode (which is on by default).
    if (query.strict) {
        if (query.strict.match(/^(1|t|y|e)/)) {
            options.strict = "error";
        } if (query.strict && query.strict.match(/^(w)/)) {
            options.strict = "warn";
        }
    }

    // Use `trust=0` (or `=f`/`=false`/`=n`/`=no`) to not trust input.
    if (query.trust && query.trust.match(/^(0|f|n)/)) {
        options.trust = false;
    }

    // The `before` or `pre` search parameter puts normal text before the math.
    // The `after` or `post` search parameter puts normal text after the math.
    // Example use: testing baseline alignment.
    if (query.before || query.after || query.pre || query.post) {
        const mathContainer = math;
        mathContainer.id = "math-container";

        if (query.before || query.pre) {
            const before = document.createTextNode(query.before || query.pre);
            mathContainer.appendChild(before);
        }

        math = document.createElement("span");
        math.id = "math";
        mathContainer.appendChild(math);

        if (query.after || query.post) {
            const after = document.createTextNode(query.after || query.post);
            mathContainer.appendChild(after);
        }
    }

    // Macros can be specified via `\command=expansion` or single-character
    // `c=expansion`.
    Object.getOwnPropertyNames(query).forEach((key) => {
        if (key.match(/^\\|^[^]$/)) {
            macros[key] = query[key];
        }
    });

    reprocess();

    function setSearch() {
        const query = queryString.parse(window.location.search);
        query.text = input.value;
        window.location.search = queryString.stringify(query);
    }

    function reprocess() {
        // Ignore changes to global macros caused by the expression
        options.macros = Object.assign({}, macros);
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
