window.startup = function() {
    var title = document.getElementById("title");
    katex.process("\\KaTeX", title);

    var example = document.getElementById("example");
    katex.process("\\frac{1}{\\Bigl(\\sqrt{\\phi \\sqrt{5}}-\\phi\\Bigr) e^{\\frac25 \\pi}} = 1+\\frac{e^{-2\\pi}} {1+\\frac{e^{-4\\pi}} {1+\\frac{e^{-6\\pi}} {1+\\frac{e^{-8\\pi}} {1+...} } } }", example);

    var demoInput = document.getElementById("demo-input");
    var demoOutput = document.getElementById("demo");

    function doDemo() {
        katex.process(demoInput.value, demoOutput);
    }

    demoInput.addEventListener("input", function() {
        doDemo();
    });

    doDemo();
};
