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
    var maxFontSize = 0;

    if (children) {
        for (var i = 0; i < children.length; i++) {
            if (children[i].height > height) {
                height = children[i].height;
            }
            if (children[i].depth > depth) {
                depth = children[i].depth;
            }
            if (children[i].maxFontSize > maxFontSize) {
                maxFontSize = children[i].maxFontSize;
            }
        }
    }

    var span = new domTree.span(
        classes, children, height, depth, maxFontSize);

    if (color) {
        span.style.color = color;
    }

    return span;
};

var makeFontSizer = function(options, fontSize) {
    var fontSizeInner = makeSpan([], [new domTree.textNode("\u200b")]);
    fontSizeInner.style.fontSize = (fontSize / options.style.sizeMultiplier) + "em";

    var fontSizer = makeSpan(
        ["fontsize-ensurer", "reset-" + options.size, "size5"],
        [fontSizeInner]);

    return fontSizer;
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
    katex: "mord",
    overline: "mord",
    rule: "mord"
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
    } else if (group.type === "delimsizing") {
        return group.value.type;
    } else {
        return groupToType[group.type];
    }
};

var isCharacterBox = function(group) {
    if (group == null) {
        return false;
    } else if (group.type === "mathord" ||
               group.type === "textord" ||
               group.type === "bin" ||
               group.type === "rel" ||
               group.type === "open" ||
               group.type === "close" ||
               group.type === "punct") {
        return true;
    } else if (group.type === "ordgroup") {
        return group.value.length === 1 && isCharacterBox(group.value[0]);
    } else {
        return false;
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
        }

        if (group.value.sub) {
            var sub = buildGroup(group.value.sub,
                    options.withStyle(options.style.sub()));
            var submid = makeSpan(
                    [options.style.reset(), options.style.sub().cls()], [sub]);
        }

        if (isCharacterBox(group.value.base)) {
            var u = 0;
            var v = 0;
        } else {
            var u = base.height - fontMetrics.metrics.supDrop;
            var v = base.depth + fontMetrics.metrics.subDrop;
        }

        var p;
        if (options.style === Style.DISPLAY) {
            p = fontMetrics.metrics.sup1;
        } else if (options.style.cramped) {
            p = fontMetrics.metrics.sup3;
        } else {
            p = fontMetrics.metrics.sup2;
        }

        var multiplier = Style.TEXT.sizeMultiplier *
                options.style.sizeMultiplier;
        // \scriptspace is 0.5pt = 0.05em * 10pt/em
        var scriptspace = 0.05 / multiplier + "em";

        var supsub;

        if (!group.value.sup) {
            var fontSizer = makeFontSizer(options, submid.maxFontSize);
            var subwrap = makeSpan(["msub"], [fontSizer, submid]);

            v = Math.max(v, fontMetrics.metrics.sub1,
                sub.height - 0.8 * fontMetrics.metrics.xHeight);

            subwrap.style.top = v + "em";
            subwrap.style.marginRight = scriptspace;

            subwrap.depth = subwrap.depth + v;
            subwrap.height = 0;

            var fixIE = makeSpan(["fix-ie"], [fontSizer, new domTree.textNode("\u00a0")]);

            supsub = makeSpan(["msupsub"], [subwrap, fixIE]);
        } else if (!group.value.sub) {
            var fontSizer = makeFontSizer(options, supmid.maxFontSize);
            var supwrap = makeSpan(["msup"], [fontSizer, supmid]);

            u = Math.max(u, p,
                sup.depth + 0.25 * fontMetrics.metrics.xHeight);

            supwrap.style.top = -u + "em";
            supwrap.style.marginRight = scriptspace;

            supwrap.height = supwrap.height + u;
            supwrap.depth = 0;

            var fixIE = makeSpan(["fix-ie"], [fontSizer, new domTree.textNode("\u00a0")]);

            supsub = makeSpan(["msupsub"], [supwrap, fixIE]);
        } else {
            var fontSizer = makeFontSizer(options,
                Math.max(submid.maxFontSize, supmid.maxFontSize));
            var subwrap = makeSpan(["msub"], [fontSizer, submid]);
            var supwrap = makeSpan(["msup"], [fontSizer, supmid]);

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

            supwrap.style.marginRight = scriptspace;
            subwrap.style.marginRight = scriptspace;

            supwrap.height = supwrap.height + u;
            supwrap.depth = 0;

            subwrap.height = 0;
            subwrap.depth = subwrap.depth + v;

            var fixIE = makeSpan(["fix-ie"], [fontSizer, new domTree.textNode("\u00a0")]);

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

        var denom = buildGroup(group.value.denom, options.withStyle(dstyle));
        var denomdenom = makeSpan([fstyle.reset(), dstyle.cls()], [denom])

        var fontSizer = makeFontSizer(options,
            Math.max(numer.maxFontSize, denom.maxFontSize));

        var numerrow = makeSpan(["mfracnum"], [fontSizer, numernumer]);
        var mid = makeSpan(["mfracmid"], [fontSizer, makeSpan(["line"])]);
        var denomrow = makeSpan(["mfracden"], [fontSizer, denomdenom]);

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

        var fixIE = makeSpan(["fix-ie"], [
            fontSizer, new domTree.textNode("\u00a0")]);

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

    overline: function(group, options, prev) {
        var innerGroup = buildGroup(group.value.result,
                options.withStyle(options.style.cramp()));

        var fontSizer = makeFontSizer(options, innerGroup.maxFontSize);

        // The theta variable in the TeXbook
        var lineWidth = fontMetrics.metrics.defaultRuleThickness;

        var line = makeSpan(
            ["overline-line"], [fontSizer, makeSpan(["line"])]);
        var inner = makeSpan(["overline-inner"], [fontSizer, innerGroup]);
        var fixIE = makeSpan(
            ["fix-ie"], [fontSizer, new domTree.textNode("\u00a0")]);

        line.style.top = (-inner.height - 3 * lineWidth) + "em";
        // The line is supposed to have 1 extra line width above it in height
        // (TeXbook pg. 443, nr. 9)
        line.height = inner.height + 5 * lineWidth;

        return makeSpan(["overline", "mord"], [
            line, inner, fixIE
        ], options.getColor());
    },

    sizing: function(group, options, prev) {
        var inner = buildGroup(group.value.value,
                options.withSize(group.value.size), prev);

        var span = makeSpan([getTypeOfGroup(group.value.value)],
            [makeSpan(["sizing", "reset-" + options.size, group.value.size],
                      [inner])]);

        var sizeToFontSize = {
            "size1": 0.5,
            "size2": 0.7,
            "size3": 0.8,
            "size4": 0.9,
            "size5": 1.0,
            "size6": 1.2,
            "size7": 1.44,
            "size8": 1.73,
            "size9": 2.07,
            "size10": 2.49
        };

        var fontSize = sizeToFontSize[group.value.size];
        span.maxFontSize = fontSize * options.style.sizeMultiplier;

        return span;
    },

    delimsizing: function(group, options, prev) {
        var normalDelimiters = [
            "(", ")", "[", "\\lbrack", "]", "\\rbrack",
            "\\{", "\\lbrace", "\\}", "\\rbrace",
            "\\lfloor", "\\rfloor", "\\lceil", "\\rceil",
            "<", ">", "\\langle", "\\rangle", "/", "\\backslash"
        ];

        var stackDelimiters = [
            "\\uparrow", "\\downarrow", "\\updownarrow",
            "\\Uparrow", "\\Downarrow", "\\Updownarrow",
            "|", "\\|", "\\vert", "\\Vert"
        ];

        // Metrics of the different sizes. Found by looking at TeX's output of
        // $\bigl| \Bigl| \biggl| \Biggl| \showlists$
        var sizeToMetrics = {
            1: {height: .85, depth: .35},
            2: {height: 1.15, depth: .65},
            3: {height: 1.45, depth: .95},
            4: {height: 1.75, depth: 1.25}
        };

        // Make an inner span with the given offset and in the given font
        var makeInner = function(symbol, offset, font) {
            var sizeClass;
            if (font === "Size1-Regular") {
                sizeClass = "size1";
            }

            var inner = makeSpan(
                ["delimsizinginner", sizeClass],
                [makeSpan([], [makeText(symbol, font, group.mode)])]);

            inner.style.top = offset + "em";
            inner.height -= offset;
            inner.depth += offset;

            return inner;
        };

        // Get the metrics for a given symbol and font, after transformation
        var getMetrics = function(symbol, font) {
            if (symbols["math"][symbol] && symbols["math"][symbol].replace) {
                return fontMetrics.getCharacterMetrics(
                    symbols["math"][symbol].replace, font);
            } else {
                return fontMetrics.getCharacterMetrics(
                    symbol, font);
            }
        };

        var original = group.value.value;

        if (utils.contains(normalDelimiters, original)) {
            // These delimiters can be created by simply using the size1-size4
            // fonts, so they don't require special treatment
            if (original === "<") {
                original = "\\langle";
            } else if (original === ">") {
                original = "\\rangle";
            }

            var size = "size" + group.value.size;
            var inner = mathrmSize(
                original, group.value.size, group.mode);

            var node = makeSpan(
                [options.style.reset(), Style.TEXT.cls(),
                 groupToType[group.value.type]],
                [makeSpan(
                    ["delimsizing", size, groupToType[group.value.type]],
                    [inner], options.getColor())]);

            var multiplier = Style.TEXT.sizeMultiplier /
                    options.style.sizeMultiplier;

            node.height *= multiplier;
            node.depth *= multiplier;
            node.maxFontSize = 1.0;

            return node;
        } else if (utils.contains(stackDelimiters, original)) {
            // These delimiters can be created by stacking other delimiters on
            // top of each other to create the correct size

            // There are three parts, the top, a repeated middle, and a bottom.
            var top = middle = bottom = original;
            var font = "Size1-Regular";
            var overlap = false;

            // We set the parts and font based on the symbol. Note that we use
            // '\u23d0' instead of '|' and '\u2016' instead of '\\|' for the
            // middles of the arrows
            if (original === "\\uparrow") {
                middle = bottom = "\u23d0";
            } else if (original === "\\Uparrow") {
                middle = bottom = "\u2016";
            } else if (original === "\\downarrow") {
                top = middle = "\u23d0";
            } else if (original === "\\Downarrow") {
                top = middle = "\u2016";
            } else if (original === "\\updownarrow") {
                top = "\\uparrow";
                middle = "\u23d0";
                bottom = "\\downarrow";
            } else if (original === "\\Updownarrow") {
                top = "\\Uparrow";
                middle = "\u2016";
                bottom = "\\Downarrow";
            } else if (original === "|" || original === "\\vert") {
                overlap = true;
            } else if (original === "\\|" || original === "\\Vert") {
                overlap = true;
            }

            // Get the metrics of the final symbol
            var metrics = sizeToMetrics[group.value.size];
            var heightTotal = metrics.height + metrics.depth;

            // Get the metrics of the three sections
            var topMetrics = getMetrics(top, font);
            var topHeightTotal = topMetrics.height + topMetrics.depth;
            var middleMetrics = getMetrics(middle, font);
            var middleHeightTotal = middleMetrics.height + middleMetrics.depth;
            var bottomMetrics = getMetrics(bottom, font);
            var bottomHeightTotal = bottomMetrics.height + bottomMetrics.depth;

            var middleHeight = heightTotal - topHeightTotal - bottomHeightTotal;
            var symbolCount = Math.ceil(middleHeight / middleHeightTotal);

            if (overlap) {
                // 2 * overlapAmount + middleHeight =
                // (symbolCount - 1) * (middleHeightTotal - overlapAmount) +
                //     middleHeightTotal
                var overlapAmount = (symbolCount * middleHeightTotal -
                                     middleHeight) / (symbolCount + 1);
            } else {
                var overlapAmount = 0;
            }

            // Keep a list of the inner spans
            var inners = [];

            // Add the top symbol
            inners.push(
                makeInner(top, topMetrics.height - metrics.height, font));

            // Add middle symbols until there's only space for the bottom symbol
            var curr_height = metrics.height - topHeightTotal + overlapAmount;
            for (var i = 0; i < symbolCount; i++) {
                inners.push(
                    makeInner(middle, middleMetrics.height - curr_height, font));
                curr_height -= middleHeightTotal - overlapAmount;
            }

            // Add the bottom symbol
            inners.push(
                makeInner(bottom, metrics.depth - bottomMetrics.depth, font));

            var fixIE = makeSpan(["fix-ie"], [new domTree.textNode("\u00a0")]);
            inners.push(fixIE);

            var node = makeSpan(
                [options.style.reset(), Style.TEXT.cls(),
                 groupToType[group.value.type]],
                [makeSpan(["delimsizing", "mult"],
                          inners, options.getColor())]);

            var multiplier = Style.TEXT.sizeMultiplier /
                    options.style.sizeMultiplier;

            node.height *= multiplier;
            node.depth *= multiplier;
            node.maxFontSize = 1.0;

            return node;
        } else {
            throw new ParseError("Illegal delimiter: '" + original + "'");
        }
    },

    rule: function(group, options, prev) {
        // Make an empty span for the rule
        var rule = makeSpan(["mord", "rule"], []);

        var width = group.value.width.number;
        if (group.value.width.unit === "ex") {
            width *= fontMetrics.metrics.xHeight;
        }

        var height = group.value.height.number;
        if (group.value.height.unit === "ex") {
            height *= fontMetrics.metrics.xHeight;
        }

        width /= options.style.sizeMultiplier;
        height /= options.style.sizeMultiplier;

        // Style the rule to the right size
        rule.style.borderRightWidth = width + "em";
        rule.style.borderTopWidth = height + "em";

        // Record the height and width
        rule.width = width;
        rule.height = height;

        return rule;
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
    if (symbols[mode][value] && symbols[mode][value].replace) {
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
    return makeSpan(["mathit"], [makeText(value, "Math-Italic", mode)]);
};

var mathrm = function(value, mode) {
    if (symbols[mode][value].font === "main") {
        return makeText(value, "Main-Regular", mode);
    } else {
        return makeSpan(["amsrm"], [makeText(value, "AMS-Regular", mode)]);
    }
};

var mathrmSize = function(value, size, mode) {
    return makeText(value, "Size" + size + "-Regular", mode);
}

var buildTree = function(tree) {
    // Setup the default options
    var options = new Options(Style.TEXT, "size5", "");

    var expression = buildExpression(tree, options);
    var span = makeSpan(["base", options.style.cls()], expression);
    var topStrut = makeSpan(["strut"]);
    var bottomStrut = makeSpan(["strut", "bottom"]);

    topStrut.style.height = span.height + "em";
    bottomStrut.style.height = (span.height + span.depth) + "em";
    // We'd like to use `vertical-align: top` but in IE 9 this lowers the
    // baseline of the box to the bottom of this strut (instead staying in the
    // normal place) so we use an absolute value for vertical-align instead
    bottomStrut.style.verticalAlign = -span.depth + "em";

    var katexNode = makeSpan(["katex"], [
        makeSpan(["katex-inner"], [topStrut, bottomStrut, span])
    ]);

    return katexNode.toDOM();
};

module.exports = buildTree;
