var Options = require("./Options");
var ParseError = require("./ParseError");
var Style = require("./Style");

var domTree = require("./domTree");
var fontMetrics = require("./fontMetrics");
var parseTree = require("./parseTree");
var utils = require("./utils");
var symbols = require("./symbols");

var buildExpression = function(expression, options, prev) {
    var groups = [];
    for (var i = 0; i < expression.length; i++) {
        var group = expression[i];
        groups.push(buildGroup(group, options, prev));
        prev = group;
    }
    return groups;
};

var makeSpan = function(classes, children, color) {
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

    var span = new domTree.span(classes, children, height, depth);

    if (color) {
        span.style.color = color;
    }

    return span;
};

var groupToType = {
    mathord: "mord",
    textord: "mord",
    bin: "mbin",
    rel: "mrel",
    text: "mord",
    open: "mopen",
    close: "mclose",
    frac: "minner",
    spacing: "mord",
    punct: "mpunct",
    ordgroup: "mord",
    namedfn: "mop",
    katex: "mord"
};

var getTypeOfGroup = function(group) {
    if (group == null) {
        // Like when typesetting $^3$
        return groupToType.mathord;
    } else if (group.type === "supsub") {
        return getTypeOfGroup(group.value.base);
    } else if (group.type === "llap" || group.type === "rlap") {
        return getTypeOfGroup(group.value);
    } else if (group.type === "color") {
        return getTypeOfGroup(group.value.value);
    } else if (group.type === "sizing") {
        return getTypeOfGroup(group.value.value);
    } else {
        return groupToType[group.type];
    }
};

var groupTypes = {
    mathord: function(group, options, prev) {
        return makeSpan(
            ["mord"],
            [mathit(group.value, group.mode)],
            options.getColor()
        );
    },

    textord: function(group, options, prev) {
        return makeSpan(
            ["mord"],
            [mathrm(group.value, group.mode)],
            options.getColor()
        );
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
        return makeSpan(
            [className],
            [mathrm(group.value, group.mode)],
            options.getColor()
        );
    },

    rel: function(group, options, prev) {
        return makeSpan(
            ["mrel"],
            [mathrm(group.value, group.mode)],
            options.getColor()
        );
    },

    text: function(group, options, prev) {
        return makeSpan(["text mord", options.style.cls()],
            [buildGroup(group.value, options.reset())]
        );
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
        var fixIE = makeSpan(["fix-ie"], []);

        if (!group.value.sup) {
            v = Math.max(v, fontMetrics.metrics.sub1,
                sub.height - 0.8 * fontMetrics.metrics.xHeight);

            subwrap.style.top = v + "em";

            subwrap.depth = subwrap.depth + v;
            subwrap.height = 0;

            supsub = makeSpan(["msupsub"], [subwrap, fixIE]);
        } else if (!group.value.sub) {
            u = Math.max(u, p,
                sup.depth + 0.25 * fontMetrics.metrics.xHeight);

            supwrap.style.top = -u + "em";

            supwrap.height = supwrap.height + u;
            supwrap.depth = 0;

            supsub = makeSpan(["msupsub"], [supwrap, fixIE]);
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

            supsub = makeSpan(["msupsub"], [supwrap, subwrap, fixIE]);
        }

        return makeSpan([getTypeOfGroup(group.value.base)], [base, supsub]);
    },

    open: function(group, options, prev) {
        return makeSpan(
            ["mopen"],
            [mathrm(group.value, group.mode)],
            options.getColor()
        );
    },

    close: function(group, options, prev) {
        return makeSpan(
            ["mclose"],
            [mathrm(group.value, group.mode)],
            options.getColor()
        );
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

        var fixIE = makeSpan(["fix-ie"], []);

        var frac = makeSpan([], [numerrow, mid, denomrow, fixIE]);

        frac.height *= fstyle.sizeMultiplier / options.style.sizeMultiplier;
        frac.depth *= fstyle.sizeMultiplier / options.style.sizeMultiplier;

        var wrap = makeSpan([options.style.reset(), fstyle.cls()], [frac]);

        return makeSpan(["minner"], [
            makeSpan(["mfrac"], [wrap])
        ], options.getColor());
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
        if (group.value === "\\ " || group.value === "\\space" ||
            group.value === " " || group.value === "~") {
            return makeSpan(
                ["mord", "mspace"],
                [mathrm(group.value, group.mode)]
            );
        } else {
            var spacingClassMap = {
                "\\qquad": "qquad",
                "\\quad": "quad",
                "\\enspace": "enspace",
                "\\;": "thickspace",
                "\\:": "mediumspace",
                "\\,": "thinspace",
                "\\!": "negativethinspace"
            };

            return makeSpan(["mord", "mspace", spacingClassMap[group.value]]);
        }
    },

    llap: function(group, options, prev) {
        var inner = makeSpan(
            ["inner"], [buildGroup(group.value, options.reset())]);
        var fix = makeSpan(["fix"], []);
        return makeSpan(["llap", options.style.cls()], [inner, fix]);
    },

    rlap: function(group, options, prev) {
        var inner = makeSpan(
            ["inner"], [buildGroup(group.value, options.reset())]);
        var fix = makeSpan(["fix"], []);
        return makeSpan(["rlap", options.style.cls()], [inner, fix]);
    },

    punct: function(group, options, prev) {
        return makeSpan(
            ["mpunct"],
            [mathrm(group.value, group.mode)],
            options.getColor()
        );
    },

    ordgroup: function(group, options, prev) {
        return makeSpan(
            ["mord", options.style.cls()],
            buildExpression(group.value, options.reset())
        );
    },

    namedfn: function(group, options, prev) {
        var chars = [];
        for (var i = 1; i < group.value.length; i++) {
            chars.push(mathrm(group.value[i], group.mode));
        }

        return makeSpan(["mop"], chars, options.getColor());
    },

    katex: function(group, options, prev) {
        var k = makeSpan(["k"], [mathrm("K", group.mode)]);
        var a = makeSpan(["a"], [mathrm("A", group.mode)]);

        a.height = (a.height + 0.2) * 0.75;
        a.depth = (a.height - 0.2) * 0.75;

        var t = makeSpan(["t"], [mathrm("T", group.mode)]);
        var e = makeSpan(["e"], [mathrm("E", group.mode)]);

        e.height = (e.height - 0.2155);
        e.depth = (e.depth + 0.2155);

        var x = makeSpan(["x"], [mathrm("X", group.mode)]);

        return makeSpan(["katex-logo"], [k, a, t, e, x], options.getColor());
    },

    sizing: function(group, options, prev) {
        var inner = buildGroup(group.value.value,
                options.withSize(group.value.size), prev);

        return makeSpan(
            ["sizing", "reset-" + options.size, group.value.size,
                getTypeOfGroup(group.value.value)],
            [inner]);
    }
};

var sizingMultiplier = {
    size1: 0.5,
    size2: 0.7,
    size3: 0.8,
    size4: 0.9,
    size5: 1.0,
    size6: 1.2,
    size7: 1.44,
    size8: 1.73,
    size9: 2.07,
    size10: 2.49
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

            groupNode.height *= multiplier;
            groupNode.depth *= multiplier;
        }

        if (options.size !== options.parentSize) {
            var multiplier = sizingMultiplier[options.size] /
                    sizingMultiplier[options.parentSize];

            if (options.depth > 1) {
                throw new ParseError(
                    "Can't use sizing outside of the root node");
            }

            groupNode.height *= multiplier;
            groupNode.depth *= multiplier;
        }

        return groupNode;
    } else {
        throw new ParseError(
            "Got group of unknown type: '" + group.type + "'");
    }
};

var makeText = function(value, style, mode) {
    if (symbols[mode][value].replace) {
        value = symbols[mode][value].replace;
    }

    var metrics = fontMetrics.getCharacterMetrics(value, style);

    if (metrics) {
        var textNode = new domTree.textNode(value, metrics.height,
            metrics.depth);
        if (metrics.italic > 0) {
            var span = makeSpan([], [textNode]);
            span.style.marginRight = metrics.italic + "em";

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

var mathit = function(value, mode) {
    return makeSpan(["mathit"], [makeText(value, "math-italic", mode)]);
};

var mathrm = function(value, mode) {
    if (symbols[mode][value].font === "main") {
        return makeText(value, "main-regular", mode);
    } else {
        return makeSpan(["amsrm"], [makeText(value, "ams-regular", mode)]);
    }
};

var buildTree = function(tree) {
    // Setup the default options
    var options = new Options(Style.TEXT, "size5", "");

    var expression = buildExpression(tree, options);
    var span = makeSpan(["base", options.style.cls()], expression);
    var topStrut = makeSpan(["strut"]);
    var bottomStrut = makeSpan(["strut", "bottom"]);

    topStrut.style.height = span.height + "em";
    bottomStrut.style.height = (span.height + span.depth) + "em";

    var katexNode = makeSpan(["katex"], [
        makeSpan(["katex-inner"], [topStrut, bottomStrut, span])
    ]);

    return katexNode.toDOM();
};

module.exports = buildTree;
