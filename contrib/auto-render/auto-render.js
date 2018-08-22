/* eslint no-console:0 */

import katex from "katex";
import splitAtDelimiters from "./splitAtDelimiters";

const splitWithDelimiters = function(text, delimiters) {
    let data = [{type: "text", data: text}];
    delimiters.forEach((delimiter) => {
        data = splitAtDelimiters(
            data, delimiter.left, delimiter.right,
            delimiter.display || false);
    });
    return data;
};

/* Note: optionsCopy is mutated by this method. If it is ever exposed in the
 * API, we should copy it before mutating.
 */
const renderMathInText = function(text, optionsCopy) {
    const data = splitWithDelimiters(text, optionsCopy.delimiters);
    const fragment = document.createDocumentFragment();

    data.forEach((datum) => {
        if (datum.type === "text") {
            fragment.appendChild(document.createTextNode(datum.data));
        } else {
            const span = document.createElement("span");
            const math = datum.data;
            // Override any display mode defined in the settings with that
            // defined by the text itself
            optionsCopy.displayMode = datum.display;
            try {
                katex.render(math, span, optionsCopy);
            } catch (e) {
                if (!(e instanceof katex.ParseError)) {
                    throw e;
                }
                optionsCopy.errorCallback(
                    "KaTeX auto-render: Failed to parse `" + datum.data +
                    "` with ",
                    e
                );
                fragment.appendChild(document.createTextNode(datum.rawData));
                return;
            }
            fragment.appendChild(span);
        }
    });

    return fragment;
};

const renderElem = function(elem, optionsCopy) {
    Array.prototype.forEach.call(elem.childNodes, function(childNode, i) {
        if (childNode.nodeType === 3) {
            // Text node
            const frag = renderMathInText(childNode.textContent, optionsCopy);
            i += frag.childNodes.length - 1;
            elem.replaceChild(frag, childNode);
        } else if (childNode.nodeType === 1) {
            // Element node
            const className = ' ' + childNode.className + ' ';
            const shouldRender = optionsCopy.ignoredTags.indexOf(
                childNode.nodeName.toLowerCase()) === -1 &&
                    optionsCopy.ignoredClasses.every(
                        x => className.indexOf(' ' + x + ' ') === -1);

            if (shouldRender) {
                renderElem(childNode, optionsCopy);
            }
        }
        // Otherwise, it's something else, and ignore it.
    });
};

const renderMathInElement = function(elem, options) {
    if (!elem) {
        throw new Error("No element provided to render");
    }

    const optionsCopy = {};

    // Object.assign(optionsCopy, option)
    for (const option in options) {
        if (options.hasOwnProperty(option)) {
            optionsCopy[option] = options[option];
        }
    }

    // default options
    optionsCopy.delimiters = optionsCopy.delimiters || [
        {left: "$$", right: "$$", display: true},
        {left: "\\(", right: "\\)", display: false},
        // LaTeX uses $…$, but it ruins the display of normal `$` in text:
        // {left: "$", right: "$", display: false},

        //  \[…\] must come last in this array. Otherwise, renderMathInElement
        //  will search for \[ before it searches for $$ or  \(
        // That makes it susceptible to finding a \\[0.3em] row delimiter and
        // treating it as if it were the start of a KaTeX math zone.
        {left: "\\[", right: "\\]", display: true},
    ];
    optionsCopy.ignoredTags = optionsCopy.ignoredTags || [
        "script", "noscript", "style", "textarea", "pre", "code",
    ];
    optionsCopy.ignoredClasses = optionsCopy.ignoredClasses || [];
    optionsCopy.errorCallback = optionsCopy.errorCallback || console.error;

    // Enable sharing of global macros defined via `\gdef` between different
    // math elements within a single call to `renderMathInElement`.
    optionsCopy.macros = optionsCopy.macros || {};

    renderElem(elem, optionsCopy);
};

export default renderMathInElement;
