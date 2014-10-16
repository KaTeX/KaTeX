window.startup = function() {
    var tex = document.getElementsByClassName("tex");
    Array.prototype.forEach.call(tex, function(el) {
        katex.render(el.getAttribute("data-expr"), el);
    });

    var demoInput = document.getElementById("demo-input");
    var demoOutput = document.getElementById("demo-output");

    function doDemo() {
        katex.render("\\displaystyle{" + demoInput.value + "}", demoOutput);
    }

    demoInput.addEventListener("input", function() {
        doDemo();
    });

    doDemo();
};
