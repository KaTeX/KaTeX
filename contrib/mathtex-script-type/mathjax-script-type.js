/* global katex */

function replaceMathJaxInline(node) {
    const katexinline = document.createElement("span");
    katexinline.setAttribute("class", "inline-equation");
    katexinline.innerHTML = katex.renderToString(node.text);
    node.parentNode.replaceChild(katexinline, node);
}

function replaceMathJaxDisplay(node) {
    const katexinline = document.createElement("div");
    katexinline.setAttribute("class", "equation");
    katexinline.innerHTML = "\\displaystyle " + katex.renderToString(node.text);
    node.parentNode.replaceChild(katexinline, node);
}

{
    const l = document.scripts.length;
    for (let i = 0; i < l; i++) {
        const s = document.scripts[i];
        if (s.type === "math/tex") {
            replaceMathJaxInline(s);
        }
        if (s.type === "math/tex; display") {
            replaceMathJaxDisplay(s);
        }
    }
}
