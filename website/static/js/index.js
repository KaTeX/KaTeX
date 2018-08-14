/* eslint-disable no-var */
/* global katex: false */
/* global ClipboardJS: false */
(function() {
    var tex = document.getElementsByClassName("tex");
    Array.prototype.forEach.call(tex, function(el) {
        katex.render(el.getAttribute("data-expr"), el);
    });

    var demo = document.getElementById("demo");
    var demoInput = document.getElementById("demo-input");
    var demoOutput = document.getElementById("demo-output");
    var overlay = document.getElementById("overlay");
    var optionsButton = document.getElementById("options");
    var optionsPanel = document.getElementById("options-panel");
    var maximize = document.getElementById("maximize");
    var copyCode = document.getElementById("code");
    var copyPermalink = document.getElementById("permalink");

    var match = window.location.search.match(/[?&]data=([^&#]*)/);
    var data = {};
    if (match) {
        try {
            data = JSON.parse(decodeURIComponent(match[1]));
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn(e);
        }
    }

    if (data.code) {
        demoInput.value = data.code;
    }

    var katexOptions = ["displayMode", "throwOnError", "errorColor", "strict",
        "macros"].map(function(id) {
            var el = document.getElementById(id);
            if (el.type === "checkbox") {
                if (typeof data[id] === "boolean") {
                    el.checked = data[id];
                }
            } else if (data[id]) {
                if (el.placeholder === "JSON") {
                    el.value = JSON.stringify(data[id]);
                } else {
                    el.value = data[id];
                }
            }
            return el;
        });

    function getOptions(withCode) {
        var options = katexOptions.reduce(function(options, el) {
            var val;
            if (el.type === "checkbox") {
                val = el.checked;
            } else if (el.placeholder === "JSON") {
                val = el.value ? JSON.parse(el.value) : undefined;
            } else {
                val = el.value;
            }
            options[el.id] = val;
            return options;
        }, {});
        if (withCode) {
            options.code = demoInput.value;
        }
        return options;
    }

    function doDemo() {
        try {
            katex.render(demoInput.value, demoOutput, getOptions());
        } catch (err) {
            while (demoOutput.lastChild) {
                demoOutput.removeChild(demoOutput.lastChild);
            }
            var msg = document.createTextNode(err.message);
            var span = document.createElement("span");
            span.appendChild(msg);
            demoOutput.appendChild(span);
            span.setAttribute("class", "errorMessage");
        }
    }

    demoInput.addEventListener("input", doDemo);

    optionsButton.addEventListener("click", function() {
        document.body.classList.add("overlayed");
    });

    overlay.addEventListener("click", function() {
        document.body.classList.remove("overlayed");
        demoInput.focus();
    });

    optionsPanel.addEventListener("click", function(e) {
        e.stopPropagation();
    });

    maximize.addEventListener("click", function() {
        if (!demo.classList.contains("maximized")) {
            demo.insertBefore(optionsPanel, demo.childNodes[0]);
            demo.classList.add("maximized");
            maximize.innerHTML = 'Minimize editor';
        } else {
            overlay.appendChild(optionsPanel);
            demo.classList.remove("maximized");
            maximize.innerHTML = 'Maximize editor';
        }
    });

    katexOptions.map(function(el) {
        el.addEventListener("input", doDemo);
    });

    // eslint-disable-next-line no-new
    new ClipboardJS(copyCode, {
        text: function() {
            return `katex.render(${JSON.stringify(demoInput.value)
                }, /* element */, ${JSON.stringify(getOptions())})`;
        },
        container: optionsPanel,
    });

    // eslint-disable-next-line no-new
    new ClipboardJS(copyPermalink, {
        text: function() {
            return `${location.href}?data=${
                encodeURIComponent(JSON.stringify(getOptions(true)))}`;
        },
    });

    doDemo();
})();
