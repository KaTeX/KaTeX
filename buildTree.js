var Options = require("./Options");
var ParseError = require("./ParseError");
var Style = require("./Style");

var domTree = require("./domTree");
var fontMetrics = require("./fontMetrics");
var parseTree = require("./parseTree");
var utils = require("./utils");

var buildExpression = function(expression, options, prev) {
    var groups = [];
    for (var i = 0; i < expression.length; i++) {
        var group = expression[i];
        groups.push(buildGroup(group, options, prev));
        prev = group;
    }
    return groups;
};

var makeSpan = function(classes, children) {
    var height = 0;
    var depth = 0;

    if (children) {
        for (var i = 0; i < children.length; i++) {
            if (children[i].height > height) {
                height = children[i].height;
            }
            if (children[i].depth > depth) {
                depth = children[i].depth;
            }
        }
    }

    return new domTree.span(classes, children, height, depth);
};

var groupToType = {
    mathord: "mord",
    textord: "mord",
    bin: "mbin",
    rel: "mrel",
    amsrel: "mrel",
    open: "mopen",
    close: "mclose",
    frac: "minner",
    spacing: "mord",
    punct: "mpunct",
    ordgroup: "mord",
    namedfn: "mop",
    katex: "mord",
};

var getTypeOfGroup = function(group) {
    if (group.type === "supsub") {
        return getTypeOfGroup(group.value.base);
    } else if (group.type === "llap" || group.type === "rlap") {
        return getTypeOfGroup(group.value);
    } else if (group.type === "color") {
        return getTypeOfGroup(group.value.value);
    } else {
        return groupToType[group.type];
    }
};

var groupTypes = {
    mathord: function(group, options, prev) {
        return makeSpan(["mord", options.color], [mathit(group.value)]);
    },

    textord: function(group, options, prev) {
        return makeSpan(["mord", options.color], [mathrm(group.value)]);
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
        return makeSpan([className, options.color], [mathrm(group.value)]);
    },

    rel: function(group, options, prev) {
        return makeSpan(["mrel", options.color], [mathrm(group.value)]);
    },

    amsrel: function(group, options, prev) {
        return makeSpan(["mrel", options.color], [amsrm(group.value)]);
    },

    supsub: function(group, options, prev) {
        var base = buildGroup(group.value.base, options.reset());

        if (group.value.sup) {
            var sup = buildGroup(group.value.sup,
                    options.withStyle(options.style.sup()));
            var supmid = makeSpan(
                    [options.style.reset(), options.style.sup().cls()], [sup]);
            var supwrap = makeSpan(["msup", options.style.reset()], [supmid]);
        }

        if (group.value.sub) {
            var sub = buildGroup(group.value.sub,
                    options.withStyle(options.style.sub()));
            var submid = makeSpan(
                    [options.style.reset(), options.style.sub().cls()], [sub]);
            var subwrap = makeSpan(["msub"], [submid]);
        }

        var u = base.height - fontMetrics.metrics.supDrop;
        var v = base.depth + fontMetrics.metrics.subDrop;

        var p;
        if (options.style === Style.DISPLAY) {
            p = fontMetrics.metrics.sup1;
        } else if (options.style.cramped) {
            p = fontMetrics.metrics.sup3;
        } else {
            p = fontMetrics.metrics.sup2;
        }

        var supsub;

        if (!group.value.sup) {
            v = Math.max(v, fontMetrics.metrics.sub1,
                sub.height - 0.8 * fontMetrics.metrics.xHeight);

            subwrap.style.top = v + "em";

            subwrap.depth = subwrap.depth + v;
            subwrap.height = 0;

            supsub = makeSpan(["msupsub"], [subwrap]);
        } else if (!group.value.sub) {
            u = Math.max(u, p,
                sup.depth + 0.25 * fontMetrics.metrics.xHeight);

            supwrap.style.top = -u + "em";

            supwrap.height = supwrap.height + u;
            supwrap.depth = 0;

            supsub = makeSpan(["msupsub"], [supwrap]);
        } else {
            u = Math.max(u, p,
                sup.depth + 0.25 * fontMetrics.metrics.xHeight);
            v = Math.max(v, fontMetrics.metrics.sub2);

            var theta = fontMetrics.metrics.defaultRuleThickness;

            if ((u - sup.depth) - (sub.height - v) < 4 * theta) {
                v = 4 * theta - (u - sup.depth) + sub.height;
                var psi = 0.8 * fontMetrics.metrics.xHeight - (u - sup.depth);
                if (psi > 0) {
                    u += psi;
                    v -= psi;
                }
            }

            supwrap.style.top = -u + "em";
            subwrap.style.top = v + "em";

            supwrap.height = supwrap.height + u;
            supwrap.depth = 0;

            subwrap.height = 0;
            subwrap.depth = subwrap.depth + v;

            supsub = makeSpan(["msupsub"], [supwrap, subwrap]);
        }

        return makeSpan([getTypeOfGroup(group.value.base)], [base, supsub]);
    },

    open: function(group, options, prev) {
        return makeSpan(["mopen", options.color], [mathrm(group.value)]);
    },

    close: function(group, options, prev) {
        return makeSpan(["mclose", options.color], [mathrm(group.value)]);
    },

    frac: function(group, options, prev) {
        var fstyle = options.style;
        if (group.value.size === "dfrac") {
            fstyle = Style.DISPLAY;
        } else if (group.value.size === "tfrac") {
            fstyle = Style.TEXT;
        }

        var nstyle = fstyle.fracNum();
        var dstyle = fstyle.fracDen();

        var numer = buildGroup(group.value.numer, options.withStyle(nstyle));
        var numernumer = makeSpan([fstyle.reset(), nstyle.cls()], [numer]);
        var numerrow = makeSpan(["mfracnum"], [numernumer]);

        var mid = makeSpan(["mfracmid"], [makeSpan()]);

        var denom = buildGroup(group.value.denom, options.withStyle(dstyle));
        var denomdenom = makeSpan([fstyle.reset(), dstyle.cls()], [denom])
        var denomrow = makeSpan(["mfracden"], [denomdenom]);

        var theta = fontMetrics.metrics.defaultRuleThickness;

        var u, v, phi;
        if (fstyle.size === Style.DISPLAY.size) {
            u = fontMetrics.metrics.num1;
            v = fontMetrics.metrics.denom1;
            phi = 3 * theta;
        } else {
            u = fontMetrics.metrics.num2;
            v = fontMetrics.metrics.denom2;
            phi = theta;
        }

        var a = fontMetrics.metrics.axisHeight;

        if ((u - numer.depth) - (a + 0.5 * theta) < phi) {
            u += phi - ((u - numer.depth) - (a + 0.5 * theta));
        }

        if ((a - 0.5 * theta) - (denom.height - v) < phi) {
            v += phi - ((a - 0.5 * theta) - (denom.height - v));
        }

        numerrow.style.top = -u + "em";
        mid.style.top = -(a - 0.5 * theta) + "em";
        denomrow.style.top = v + "em";

        numerrow.height = numerrow.height + u;
        numerrow.depth = 0;

        denomrow.height = 0;
        denomrow.depth = denomrow.depth + v;

        var frac = makeSpan([], [numerrow, mid, denomrow]);

        frac.height *= fstyle.sizeMultiplier / options.style.sizeMultiplier;
        frac.depth *= fstyle.sizeMultiplier / options.style.sizeMultiplier;

        var wrap = makeSpan([options.style.reset(), fstyle.cls()], [frac]);

        return makeSpan(["minner", options.color], [
            makeSpan(["mfrac"], [wrap])
        ]);
    },

    color: function(group, options, prev) {
        var els = buildExpression(
            group.value.value,
            options.withColor(group.value.color),
            prev
        );

        var height = 0;
        var depth = 0;

        for (var i = 0; i < els.length; i++) {
            if (els[i].height > height) {
                var height = els[i].height;
            }
            if (els[i].depth > depth) {
                var depth = els[i].depth;
            }
        }

        return new domTree.documentFragment(els, height, depth);
    },

    spacing: function(group, options, prev) {
        if (group.value === "\\ " || group.value === "\\space") {
            return makeSpan(["mord", "mspace"], [mathrm(group.value)]);
        } else {
            var spacingClassMap = {
                "\\qquad": "qquad",
                "\\quad": "quad",
                "\\;": "thickspace",
                "\\:": "mediumspace",
                "\\,": "thinspace"
            };

            return makeSpan(["mord", "mspace", spacingClassMap[group.value]]);
        }
    },

    llap: function(group, options, prev) {
        var inner = makeSpan([], [buildGroup(group.value, options.reset())]);
        return makeSpan(["llap", options.style.cls()], [inner]);
    },

    rlap: function(group, options, prev) {
        var inner = makeSpan([], [buildGroup(group.value, options.reset())]);
        return makeSpan(["rlap", options.style.cls()], [inner]);
    },

    punct: function(group, options, prev) {
        return makeSpan(["mpunct", options.color], [mathrm(group.value)]);
    },

    ordgroup: function(group, options, prev) {
        return makeSpan(["mord", options.style.cls()],
            buildExpression(group.value, options.reset())
        );
    },

    namedfn: function(group, options, prev) {
        var chars = [];
        for (var i = 1; i < group.value.length; i++) {
            chars.push(mathrm(group.value[i]));
        }

        return makeSpan(["mop", options.color], chars);
    },

    katex: function(group, options, prev) {
        var k = makeSpan(["k"], [mathrm("K")]);
        var a = makeSpan(["a"], [mathrm("A")]);

        a.height = (a.height + 0.2) * 0.75;
        a.depth = (a.height - 0.2) * 0.75;

        var t = makeSpan(["t"], [mathrm("T")]);
        var e = makeSpan(["e"], [mathrm("E")]);

        e.height = (e.height - 0.2155);
        e.depth = (e.depth + 0.2155);

        var x = makeSpan(["x"], [mathrm("X")]);

        return makeSpan(["katex-logo", options.color], [k, a, t, e, x]);
    }
};

var buildGroup = function(group, options, prev) {
    if (!group) {
        return makeSpan();
    }

    if (groupTypes[group.type]) {
        var groupNode = groupTypes[group.type](group, options, prev);

        if (options.style !== options.parentStyle) {
            var multiplier = options.style.sizeMultiplier /
                    options.parentStyle.sizeMultiplier;

            if (multiplier > 1) {
                throw new ParseError(
                    "Error: Can't go from small to large style");
            }

            groupNode.height *= multiplier;
            groupNode.depth *= multiplier;
        }

        return groupNode;
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
    "\\omicron": "o",
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

var makeText = function(value, style) {
    if (value in charLookup) {
        value = charLookup[value];
    }

    var metrics = fontMetrics.getCharacterMetrics(value, style);

    if (metrics) {
        var textNode = new domTree.textNode(value, metrics.height,
            metrics.depth);
        if (metrics.italic > 0) {
            var span = makeSpan([], [textNode]);
            span.style["margin-right"] = metrics.italic + "em";

            return span;
        } else {
            return textNode;
        }
    } else {
        console && console.warn("No character metrics for '" + value +
            "' in style '" + style + "'");
        return new domTree.textNode(value, 0, 0);
    }
};

var mathit = function(value) {
    return makeSpan(["mathit"], [makeText(value, "math-italic")]);
};

var mathrm = function(value) {
    return makeText(value, "main-regular");
};

var amsrm = function(value) {
    return makeSpan(["amsrm"], [makeText(value, "ams-regular")]);
};

var buildTree = function(tree) {
    // Setup the default options
    var options = new Options(Style.TEXT, "");

    var expression = buildExpression(tree, options);
    var span = makeSpan(["base", options.style.cls()], expression);
    var topStrut = makeSpan(["strut"]);
    var bottomStrut = makeSpan(["strut", "bottom"]);

    topStrut.style.height = span.height + "em";
    bottomStrut.style.height = (span.height + span.depth) + "em";

    var katexNode = makeSpan(["katex"], [topStrut, bottomStrut, span]);

    return katexNode.toDOM();
};

module.exports = buildTree;
