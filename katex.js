var Style = require("./Style");
var ParseError = require("./ParseError");

var parseTree = require("./parseTree");
var utils = require("./utils");

var buildExpression = function(style, color, expression, prev) {
    var groups = [];
    for (var i = 0; i < expression.length; i++) {
        var group = expression[i];
        groups.push(buildGroup(style, color, group, prev));
        prev = group;
    };
    return groups;
};

var makeSpan = function(className, children) {
    var span = document.createElement("span");
    span.className = className || "";

    if (children) {
        for (var i = 0; i < children.length; i++) {
            span.appendChild(children[i]);
        }
    }

    return span;
};

var buildGroup = function(style, color, group, prev) {
    if (!group) {
        return makeSpan();
    }

    if (group.type === "mathord") {
        return makeSpan("mord" + color, [mathit(group.value)]);
    } else if (group.type === "textord") {
        return makeSpan("mord" + color, [textit(group.value)]);
    } else if (group.type === "bin") {
        var className = "mbin";
        var prevAtom = prev;
        while (prevAtom && prevAtom.type == "color") {
            var atoms = prevAtom.value.value;
            prevAtom = atoms[atoms.length - 1];
        }
        if (!prev || utils.contains(["bin", "open", "rel"], prevAtom.type)) {
            group.type = "ord";
            className = "mord";
        }
        return makeSpan(className + color, [textit(group.value)]);
    } else if (group.type === "rel") {
        return makeSpan("mrel" + color, [textit(group.value)]);
    } else if (group.type === "sup") {
        var sup = makeSpan("msup " + style.cls(), [
            makeSpan(style.sup().cls(), [
                buildGroup(style.sup(), color, group.value.sup)
            ])
        ]);
        return makeSpan("mord", [
            buildGroup(style, color, group.value.base), sup
        ]);
    } else if (group.type === "sub") {
        var sub = makeSpan("msub " + style.cls(), [
            makeSpan(style.sub().cls(), [
                buildGroup(style.sub(), color, group.value.sub)
            ])
        ]);
        return makeSpan("mord", [
            buildGroup(style, color, group.value.base), sub
        ]);
    } else if (group.type === "supsub") {
        var sup = makeSpan("msup " + style.sup().cls(), [
            buildGroup(style.sup(), color, group.value.sup)
        ]);
        var sub = makeSpan("msub " + style.sub().cls(), [
            buildGroup(style.sub(), color, group.value.sub)
        ]);

        var supsub = makeSpan("msupsub " + style.cls(), [sup, sub]);

        return makeSpan("mord", [
            buildGroup(style, color, group.value.base), supsub
        ]);
    } else if (group.type === "open") {
        return makeSpan("mopen" + color, [textit(group.value)]);
    } else if (group.type === "close") {
        return makeSpan("mclose" + color, [textit(group.value)]);
    } else if (group.type === "frac") {
        var fstyle = style;
        if (group.value.size === "dfrac") {
            fstyle = Style.DISPLAY;
        } else if (group.value.size === "tfrac") {
            fstyle = Style.TEXT;
        }

        var nstyle = fstyle.fracNum();
        var dstyle = fstyle.fracDen();

        var numer = makeSpan("mfracnum " + nstyle.cls(), [
            makeSpan("", [buildGroup(nstyle, color, group.value.numer)])
        ]);
        var mid = makeSpan("mfracmid");
        var denom = makeSpan("mfracden " + dstyle.cls(), [
            makeSpan("", [buildGroup(dstyle, color, group.value.denom)])
        ]);

        return makeSpan("minner mfrac " + fstyle.cls() + color, [
            numer, mid, denom
        ]);
    } else if (group.type === "color") {
        var frag = document.createDocumentFragment();
        var els = buildExpression(
            style,
            " " + group.value.color,
            group.value.value,
            prev
        );
        for (var i = 0; i < els.length; i++) {
            frag.appendChild(els[i]);
        }
        return frag;
    } else if (group.type === "spacing") {
        if (group.value === "\\ " || group.value === "\\space") {
            return makeSpan("mord mspace", [textit(group.value)]);
        } else {
            var spacingClassMap = {
                "\\qquad": "qquad",
                "\\quad": "quad",
                "\\;": "thickspace",
                "\\:": "mediumspace",
                "\\,": "thinspace"
            };

            return makeSpan("mord mspace " + spacingClassMap[group.value]);
        }
    } else if (group.type === "llap") {
        var inner = makeSpan("", [buildGroup(style, color, group.value)]);
        return makeSpan("llap " + style.cls(), [inner]);
    } else if (group.type === "rlap") {
        var inner = makeSpan("", [buildGroup(style, color, group.value)]);
        return makeSpan("rlap " + style.cls(), [inner]);
    } else if (group.type === "punct") {
        return makeSpan("mpunct" + color, [textit(group.value)]);
    } else if (group.type === "ordgroup") {
        return makeSpan("mord " + style.cls(),
            buildExpression(style, color, group.value)
        );
    } else if (group.type === "namedfn") {
        return makeSpan("mop" + color, [textit(group.value.slice(1))]);
    } else {
        throw "Lex error: Got group of unknown type: '" + group.type + "'";
    }
};

var charLookup = {
    "*": "\u2217",
    "-": "\u2212",
    "`": "\u2018",
    "\\ ": "\u00a0",
    "\\$": "$",
    "\\angle": "\u2220",
    "\\cdot": "\u22c5",
    "\\circ": "\u2218",
    "\\colon": ":",
    "\\div": "\u00f7",
    "\\geq": "\u2265",
    "\\gets": "\u2190",
    "\\infty": "\u221e",
    "\\leftarrow": "\u2190",
    "\\leq": "\u2264",
    "\\lvert": "|",
    "\\neq": "\u2260",
    "\\ngeq": "\u2271",
    "\\nleq": "\u2270",
    "\\pm": "\u00b1",
    "\\prime": "\u2032",
    "\\rightarrow": "\u2192",
    "\\rvert": "|",
    "\\space": "\u00a0",
    "\\times": "\u00d7",
    "\\to": "\u2192",

    "\\alpha": "\u03b1",
    "\\beta": "\u03b2",
    "\\gamma": "\u03b3",
    "\\delta": "\u03b4",
    "\\epsilon": "\u03f5",
    "\\zeta": "\u03b6",
    "\\eta": "\u03b7",
    "\\theta": "\u03b8",
    "\\iota": "\u03b9",
    "\\kappa": "\u03ba",
    "\\lambda": "\u03bb",
    "\\mu": "\u03bc",
    "\\nu": "\u03bd",
    "\\xi": "\u03be",
    "\\omicron": "\u03bf",
    "\\pi": "\u03c0",
    "\\rho": "\u03c1",
    "\\sigma": "\u03c3",
    "\\tau": "\u03c4",
    "\\upsilon": "\u03c5",
    "\\phi": "\u03d5",
    "\\chi": "\u03c7",
    "\\psi": "\u03c8",
    "\\omega": "\u03c9",
    "\\varepsilon": "\u03b5",
    "\\vartheta": "\u03d1",
    "\\varpi": "\u03d6",
    "\\varrho": "\u03f1",
    "\\varsigma": "\u03c2",
    "\\varphi": "\u03c6",

    "\\Gamma": "\u0393",
    "\\Delta": "\u0394",
    "\\Theta": "\u0398",
    "\\Lambda": "\u039b",
    "\\Xi": "\u039e",
    "\\Pi": "\u03a0",
    "\\Sigma": "\u03a3",
    "\\Upsilon": "\u03a5",
    "\\Phi": "\u03a6",
    "\\Psi": "\u03a8",
    "\\Omega": "\u03a9"
};

var textit = function(value) {
    if (value in charLookup) {
        value = charLookup[value];
    }
    return document.createTextNode(value);
};

var mathit = function(value) {
    return makeSpan("mathit", [textit(value)]);
};

var clearNode = function(node) {
    if ("textContent" in node) {
        node.textContent = "";
    } else {
        node.innerText = "";
    }
};

var process = function(toParse, baseNode) {
    clearNode(baseNode);
    var tree = parseTree(toParse);

    var style = Style.TEXT;
    var expression = buildExpression(style, /* color: */ "", tree);
    var span = makeSpan(style.cls(), expression);
    var katexNode = makeSpan("katex", [span]);

    baseNode.appendChild(katexNode);
};

module.exports = {
    process: process,
    ParseError: ParseError
};
