/* eslint-disable no-var */
/* global katex: false */
window.startup = function() {
    var tex = document.getElementsByClassName("tex");
    Array.prototype.forEach.call(tex, function(el) {
        katex.render(el.getAttribute("data-expr"), el);
    });

    var demoInput = document.getElementById("demo-input");
    var demoOutput = document.getElementById("demo-output");

    function doDemo() {
        try {
            katex.render(demoInput.value, demoOutput, {
                displayMode: true,
            });
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

    demoInput.addEventListener("input", function() {
        doDemo();
    });

    doDemo();
};
