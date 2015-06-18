function init() {
    var input = document.getElementById("input");
    var math = document.getElementById("math");
    var ctxt = math.getContext("2d");
    var permalink = document.getElementById("permalink");

    if ("oninput" in input) {
        input.addEventListener("input", reprocess, false);
    } else {
        input.attachEvent("onkeyup", reprocess);
    }

    if ("addEventListener" in permalink) {
        permalink.addEventListener("click", function() {
            window.location.search = "?text=" + encodeURIComponent(input.value);
        });
    } else {
        permalink.attachEvent("click", function() {
            window.location.search = "?text=" + encodeURIComponent(input.value);
        });
    }

    var match = (/(?:^\?|&)text=([^&]*)/).exec(window.location.search);
    if (match) {
        input.value = decodeURIComponent(match[1]);
    }

    reprocess();

    function reprocess() {
        try {
            ctxt.clearRect(0, 0, math.width, math.height);
            var box = katex.canvasBox(input.value, ctxt, {
                fontSize: 74 * 1.21
            })
            var x = 10, y = Math.max(200, box.height);
            ctxt.strokeStyle = "#00ffff";
            ctxt.strokeRect(x, y - box.height, box.width,
                            box.height + box.depth);
            ctxt.beginPath();
            ctxt.moveTo(x, y);
            ctxt.lineTo(x + box.width, y);
            ctxt.stroke();
            box.renderAt(x, y);
        } catch (e) {
            if (e.__proto__ == katex.ParseError.prototype) {
                console.error(e);
            } else {
                throw e;
            }
        }
    }

    // We don't know when all the fonts will have been loaded.
    // http://www.w3.org/TR/css-font-loading-3/ might help one day.
    // http://caniuse.com/#feat=font-loading says support is still wanting.
    setTimeout(reprocess, 10);
    setTimeout(reprocess, 200);
    setTimeout(reprocess, 1000);
}

init();
