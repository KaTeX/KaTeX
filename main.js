window.onload = function() {
    var input = document.getElementById("input");
    var math = document.getElementById("math");

    MJLite.process(input.value, math);

    input.oninput = function() {
        MJLite.process(input.value, math);
    };
};
