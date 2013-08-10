var Style = require("./Style");

var parseTree = require("./parseTree");
var utils = require("./utils");

var ParseError = require("./ParseError");

function Options(style, color) {
    this.style = style;
    this.color = color;
}

Options.prototype.withStyle = function(style) {
    return new Options(style, this.color);
}

Options.prototype.withColor = function(color) {
    return new Options(this.style, color);
}

var buildExpression = function(expression, options, prev) {
    var groups = [];
    for (var i = 0; i < expression.length; i++) {
        var group = expression[i];
        groups.push(buildGroup(group, options, prev));
        prev = group;
    }
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

var groupTypes = {
    mathord: function(group, options, prev) {
        return makeSpan("mord" + options.color, [mathit(group.value)]);
    },

    textord: function(group, options, prev) {
        return makeSpan("mord" + options.color, [textit(group.value)]);
    },

    bin: function(group, options, prev) {
        var className = "mbin";
        var prevAtom = prev;
        while (prevAtom && prevAtom.type == "color") {
            var atoms = prevAtom.value.value;
            prevAtom = atoms[atoms.length - 1];
        }
        if (!prev || utils.contains(["bin", "open", "rel", "op", "punct"],
                prevAtom.type)) {
            group.type = "ord";
            className = "mord";
        }
        return makeSpan(className + options.color, [textit(group.value)]);
    },

    rel: function(group, options, prev) {
        return makeSpan("mrel" + options.color, [textit(group.value)]);
    },

    sup: function(group, options, prev) {
        var sup = makeSpan("msup " + options.style.cls(), [
            makeSpan(options.style.sup().cls(), [
                buildGroup(group.value.sup,
                    options.withStyle(options.style.sup()))
            ])
        ]);
        return makeSpan("mord", [
            buildGroup(group.value.base, options), sup
        ]);
    },

    sub: function(group, options, prev) {
        var sub = makeSpan("msub " + options.style.cls(), [
            makeSpan(options.style.sub().cls(), [
                buildGroup(group.value.sub,
                    options.withStyle(options.style.sub()))
            ])
        ]);
        return makeSpan("mord", [
            buildGroup(group.value.base, options), sub
        ]);
    },

    supsub: function(group, options, prev) {
        var sup = makeSpan("msup " + options.style.sup().cls(), [
            buildGroup(group.value.sup, options.withStyle(options.style.sup()))
        ]);
        var sub = makeSpan("msub " + options.style.sub().cls(), [
            buildGroup(group.value.sub, options.withStyle(options.style.sub()))
        ]);

        var supsub = makeSpan("msupsub " + options.style.cls(), [sup, sub]);

        return makeSpan("mord", [
            buildGroup(group.value.base, options), supsub
        ]);
    },

    open: function(group, options, prev) {
        return makeSpan("mopen" + options.color, [textit(group.value)]);
    },

    close: function(group, options, prev) {
        return makeSpan("mclose" + options.color, [textit(group.value)]);
    },

    frac: function(group, options, prev) {
        if (utils.isBuggyWebKit) {
            throw new ParseError(
                    "KaTeX fractions don't work in WebKit <= 537.1");
        }

        var fstyle = options.style;
        if (group.value.size === "dfrac") {
            fstyle = Style.DISPLAY;
        } else if (group.value.size === "tfrac") {
            fstyle = Style.TEXT;
        }

        var nstyle = fstyle.fracNum();
        var dstyle = fstyle.fracDen();

        var numer = makeSpan("mfracnum " + nstyle.cls(), [
            makeSpan("", [
                buildGroup(group.value.numer, options.withStyle(nstyle))
            ])
        ]);
        var mid = makeSpan("mfracmid");
        var denom = makeSpan("mfracden " + dstyle.cls(), [
            makeSpan("", [
                buildGroup(group.value.denom, options.withStyle(dstyle))
            ])
        ]);

        return makeSpan("minner mfrac " + fstyle.cls() + options.color, [
            numer, mid, denom
        ]);
    },

    color: function(group, options, prev) {
        var frag = document.createDocumentFragment();
        var els = buildExpression(
            group.value.value,
            options.withColor(" " + group.value.color),
            prev
        );
        for (var i = 0; i < els.length; i++) {
            frag.appendChild(els[i]);
        }
        return frag;
    },

    spacing: function(group, options, prev) {
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
    },

    llap: function(group, options, prev) {
        var inner = makeSpan("", [buildGroup(group.value, options)]);
        return makeSpan("llap " + options.style.cls(), [inner]);
    },

    rlap: function(group, options, prev) {
        var inner = makeSpan("", [buildGroup(group.value, options)]);
        return makeSpan("rlap " + options.style.cls(), [inner]);
    },

    punct: function(group, options, prev) {
        return makeSpan("mpunct" + options.color, [textit(group.value)]);
    },

    ordgroup: function(group, options, prev) {
        return makeSpan("mord " + options.style.cls(),
            buildExpression(group.value, options)
        );
    },

    namedfn: function(group, options, prev) {
        return makeSpan("mop" + options.color, [textit(group.value.slice(1))]);
    },

    katex: function(group, options, prev) {
        return makeSpan("katex-logo", [
            makeSpan("k", [textit("K")]),
            makeSpan("a", [textit("A")]),
            makeSpan("t", [textit("T")]),
            makeSpan("e", [textit("E")]),
            makeSpan("x", [textit("X")])
        ]);
    }
};

var buildGroup = function(group, options, prev) {
    if (!group) {
        return makeSpan();
    }

    if (groupTypes[group.type]) {
        return groupTypes[group.type](group, options, prev);
    } else {
        throw new ParseError(
            "Lex error: Got group of unknown type: '" + group.type + "'");
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

var buildTree = function(tree) {
    var options = new Options(Style.TEXT, "");

    var expression = buildExpression(tree, options);
    var span = makeSpan(options.style.cls(), expression);
    var katexNode = makeSpan("katex", [span]);

    return katexNode;
};

module.exports = buildTree;
