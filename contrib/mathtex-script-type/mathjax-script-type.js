/* global katex */

function replaceMathJaxInline(node) {
    const katexelement = document.createElement("span");
    katexelement.setAttribute("class", "inline-equation");
    katex.render(node.text, katexelement);
    node.parentNode.replaceChild(katexelement, node);
}

function replaceMathJaxDisplay(node) {
    const katexelement = document.createElement("div");
    katexelement.setAttribute("class", "equation");
    katex.render(node.text, katexelement, {displayMode: true});
    node.parentNode.replaceChild(katexelement, node);
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
