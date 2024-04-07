/* eslint-disable linebreak-style */
/* eslint-disable no-var */
/* global katex: false */
/* global ClipboardJS: false */

// load fonts
window.WebFontConfig = {
    custom: {
        families: ['KaTeX_AMS', 'KaTeX_Caligraphic:n4,n7', 'KaTeX_Fraktur:n4,n7',
            'KaTeX_Main:n4,n7,i4,i7', 'KaTeX_Math:i4,i7', 'KaTeX_Script',
            'KaTeX_SansSerif:n4,n7,i4', 'KaTeX_Size1', 'KaTeX_Size2', 'KaTeX_Size3',
            'KaTeX_Size4', 'KaTeX_Typewriter'],
    },
};

(function() {
    var tex = document.getElementsByClassName("tex");
    Array.prototype.forEach.call(tex, function(el) {
        katex.render(el.getAttribute("data-expr"), el);
    });

    var demoInput = document.getElementById("demo-input");
    var demoOutput = document.getElementById("demo-output");
    var optionsButton = document.getElementById("options");
    var optionsPanel = document.getElementById("options-panel");
    var maximize = document.getElementById("maximize");
    var copyCode = document.getElementById("code");
    var copyPermalink = document.getElementById("permalink");

    if (window.location.hash === '#demo') {
        optionsPanel.classList.add('opened');
        document.body.classList.add("maximized");
        maximize.innerHTML = 'Minimize editor';
    }

    var match = window.location.search.match(/[?&]data=([^&]*)/);
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

    var katexOptions = ["displayMode", "leqno", "fleqn", "throwOnError",
        "errorColor", "strict", "output", "trust", "macros"].map(function(id) {
            var el = document.getElementById(id);
            if (el.type === "checkbox") {
                if (typeof data[id] === "boolean" && !(id === "trust" && data[id] &&
                        // eslint-disable-next-line no-alert, max-len
                        !confirm("Enable 'trust' setting? Don't enable if you don't trust the source."))) {
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
        if (!optionsPanel.classList.contains('opened')) {
            optionsPanel.classList.remove('closed');
            optionsPanel.classList.add('opened');
        } else {
            optionsPanel.classList.remove('opened');
            optionsPanel.classList.add('closed');
        }
    });

    maximize.addEventListener("click", function() {
        if (!document.body.classList.contains("maximized")) {
            document.body.classList.add("maximized");
            maximize.innerHTML = 'Minimize editor';
        } else {
            document.body.classList.remove("maximized");
            maximize.innerHTML = 'Maximize editor';
        }
    });

    katexOptions.map(function(el) {
        el.addEventListener("change", doDemo);
    });

    // eslint-disable-next-line no-new
    new ClipboardJS(copyCode, {
        text: function() {
            return 'katex.render(' + JSON.stringify(demoInput.value) +
                ', /* element */, ' + JSON.stringify(getOptions()) + ')';
        },
    });

    // eslint-disable-next-line no-new
    new ClipboardJS(copyPermalink, {
        text: function() {
            return location.protocol + '//' + location.host + location.pathname +
                '?data=' + encodeURIComponent(JSON.stringify(getOptions(true)));
        },
    });

    doDemo();
})();
