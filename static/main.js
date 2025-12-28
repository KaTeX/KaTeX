/* eslint no-console:0 */
/**
 * This is the webpack entry point for the test page.
 */
import katex from '../katex.webpack.js';
import './main.css';

function init() {
    const input = document.getElementById("input");
    const math = document.getElementById("math");
    const gearIcon = document.querySelector('#options-panel img');
    const optionsPanel = document.getElementById('options-panel');
    const beforeContentElement = document.getElementById("before-content");
    const afterContentElement = document.getElementById("after-content");

    const options = {
        displayMode: true,
        leqno: false,
        fleqn: false,
        throwOnError: true,
        strict: 'warn',
        output: 'htmlAndMathml',
        trust: true,
        macros: {},
        before: '',
        after: '',
    };

    let permalinkData = {};

    gearIcon.addEventListener('click', function() {
        gearIcon.classList.toggle('rotated');
        optionsPanel.classList.toggle('collapsed');
    });
    input.addEventListener("input", reprocess, options);

    function updatePermalink() {
        const data = Object.assign({}, options, {code: input.value});
        const encodedData = encodeURIComponent(JSON.stringify(data));
        window.history.replaceState({}, '', `?data=${encodedData}`);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('data');

    if (data) {
        try {
            permalinkData = JSON.parse(data);
        } catch (e) {
            console.warn(e);
        }
    }

    if (permalinkData.code) {
        input.value = permalinkData.code;
    }

    for (const id in options) {
        if (!options.hasOwnProperty(id)) {
            continue;
        }

        const element = document.getElementById(id);

        if (element.type === "checkbox") {
            element.addEventListener('change', function() {
                const key = this.id;
                options[key] = this.checked;
            });
            element.checked = permalinkData[id] ?? options[id];
            options[id] = element.checked;
        }

        if (element.type === "select-one") {
            element.addEventListener('change', function() {
                const key = this.id;
                options[key] = this.value;
            });
            element.value = permalinkData[id] ?? options[id];
            options[id] = element.value;
        }

        if (element.type === "textarea") {
            if (permalinkData[id]) {
                element.value = JSON.stringify(permalinkData[id], null, 4);
                options[id] = permalinkData[id];
            } else {
                id === 'macros' ?
                    options[id] = JSON.parse(element.value)
                    : options[id] = element.value;
            }

            element.addEventListener('change', function() {
                const key = this.id;
                key === 'macros' ?
                    options[key] = JSON.parse(this.value)
                    : options[key] = this.value;
            });
        }

        element.addEventListener("change", reprocess);
    }

    if (permalinkData.before) {
        beforeContentElement.innerText = permalinkData.before;
        options.before = permalinkData.before;
    }

    if (permalinkData.after) {
        afterContentElement.innerText = permalinkData.after;
        options.after = permalinkData.after;
    }

    reprocess();

    function reprocess() {
        try {
            katex.render(input.value, math, options);
            beforeContentElement.innerText = options.before || '';
            afterContentElement.innerText = options.after || '';
        } catch (e) {
            if (e.__proto__ === katex.ParseError.prototype) {
                console.error(e);
            } else {
                throw e;
            }
        }

        updatePermalink();
    }

    if (module.hot) {
        module.hot.accept('../katex.webpack.js', reprocess);
    }
}

init();

export default katex;
