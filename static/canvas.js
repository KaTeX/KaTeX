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
    var size = 74 * 1.21;
    match = (/(?:^\?|&)size=([^&]*)/).exec(window.location.search);
    console.log(match);
    if (match && isFinite(+match[1]) && +match[1] > 0) {
        size = +match[1];
    }

    reprocess();

    function reprocess() {
        try {
            // Prepare box to get its dimensions
            var box = katex.canvasBox(input.value, ctxt, {
                fontSize: size,
            })
            var padding = 4;
            var x = padding, y = box.height + padding;

            // Deal with HiDPI or zoom. The following is thanks to Paul Lewis,
            // http://www.html5rocks.com/en/tutorials/canvas/hidpi/
            var devicePixelRatio = window.devicePixelRatio || 1;
            var backingStoreRatio = ctxt.webkitBackingStorePixelRatio ||
                ctxt.mozBackingStorePixelRatio ||
                ctxt.msBackingStorePixelRatio ||
                ctxt.oBackingStorePixelRatio ||
                ctxt.backingStorePixelRatio || 1;
            var ratio = devicePixelRatio / backingStoreRatio;

            // Resize canvas to fit the math box with padding
            var w = box.width + 2 * padding;
            var h = (box.height + box.depth) + 2 * padding;
            math.style.width = w + "px";
            math.style.height = h + "px";
            math.width = w * ratio;
            math.height = h * ratio;
            ctxt.clearRect(0, 0, math.width, math.height);
            ctxt.setTransform(ratio, 0, 0, ratio, 0, 0);

            // Draw enclosing box and baseline, for reference
            ctxt.strokeStyle = "#00ffff";
            ctxt.strokeRect(x, y - box.height, box.width,
                            box.height + box.depth);
            ctxt.beginPath();
            ctxt.moveTo(x, y);
            ctxt.lineTo(x + box.width, y);
            ctxt.stroke();

            // Render the actual math
            box.renderAt(x, y);
        } catch (e) {
            ctxt.clearRect(0, 0, math.width, math.height);
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
