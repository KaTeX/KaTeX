var Options = require("./Options");
var ParseError = require("./ParseError");
var Style = require("./Style");

var buildCommon = require("./buildCommon");
var delimiter = require("./delimiter");
var domTree = require("./domTree");
var fontMetrics = require("./fontMetrics");
var parseTree = require("./parseTree");
var symbols = require("./symbols");
var utils = require("./utils");

var makeSpan = buildCommon.makeSpan;

var buildExpression = function(expression, options, prev) {
    var groups = [];
    for (var i = 0; i < expression.length; i++) {
        var group = expression[i];
        groups.push(buildGroup(group, options, prev));
        prev = group;
    }
    return groups;
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
    rule: "mord",
    leftright: "minner",
    sqrt: "mord"
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
    } else if (group.type === "styling") {
        return getTypeOfGroup(group.value.value);
    } else if (group.type === "delimsizing") {
        return groupToType[group.value.delimType];
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
            [buildCommon.mathit(group.value, group.mode)],
            options.getColor()
        );
    },

    textord: function(group, options, prev) {
        return makeSpan(
            ["mord"],
            [buildCommon.mathrm(group.value, group.mode)],
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
        if (!prev || utils.contains(["mbin", "mopen", "mrel", "mop", "mpunct"],
                getTypeOfGroup(prevAtom))) {
            group.type = "ord";
            className = "mord";
        }
        return makeSpan(
            [className],
            [buildCommon.mathrm(group.value, group.mode)],
            options.getColor()
        );
    },

    rel: function(group, options, prev) {
        return makeSpan(
            ["mrel"],
            [buildCommon.mathrm(group.value, group.mode)],
            options.getColor()
        );
    },

    text: function(group, options, prev) {
        return makeSpan(["text mord", options.style.cls()],
            buildExpression(group.value.body, options.reset()));
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
        var scriptspace =
            (0.5 / fontMetrics.metrics.ptPerEm) / multiplier + "em";

        var supsub;

        if (!group.value.sup) {
            var fontSizer = buildCommon.makeFontSizer(options, submid.maxFontSize);
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
            var fontSizer = buildCommon.makeFontSizer(options, supmid.maxFontSize);
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
            var fontSizer = buildCommon.makeFontSizer(options,
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

        return makeSpan([getTypeOfGroup(group.value.base)],
            [base, supsub]);
    },

    open: function(group, options, prev) {
        return makeSpan(
            ["mopen"],
            [buildCommon.mathrm(group.value, group.mode)],
            options.getColor()
        );
    },

    close: function(group, options, prev) {
        return makeSpan(
            ["mclose"],
            [buildCommon.mathrm(group.value, group.mode)],
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

        var fontSizer = buildCommon.makeFontSizer(options,
            Math.max(numer.maxFontSize, denom.maxFontSize));

        var line = makeSpan([options.style.reset(), Style.TEXT.cls(), "line"]);

        var numerrow = makeSpan(["mfracnum"], [fontSizer, numernumer]);
        var mid = makeSpan(["mfracmid"], [fontSizer, line]);
        var denomrow = makeSpan(["mfracden"], [fontSizer, denomdenom]);

        var theta = fontMetrics.metrics.defaultRuleThickness / options.style.sizeMultiplier;

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

        var wrap = makeSpan(
                [options.style.reset(), fstyle.cls()], [frac]);

        return makeSpan(["minner"], [
            makeSpan(["mfrac"], [wrap])
        ], options.getColor());
    },

    color: function(group, options, prev) {
        var elements = buildExpression(
            group.value.value,
            options.withColor(group.value.color),
            prev
        );

        return new buildCommon.makeFragment(elements);
    },

    spacing: function(group, options, prev) {
        if (group.value === "\\ " || group.value === "\\space" ||
            group.value === " " || group.value === "~") {
            return makeSpan(
                ["mord", "mspace"],
                [buildCommon.mathrm(group.value, group.mode)]
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

            return makeSpan(
                ["mord", "mspace", spacingClassMap[group.value]]);
        }
    },

    llap: function(group, options, prev) {
        var inner = makeSpan(
            ["inner"], [buildGroup(group.value.body, options.reset())]);
        var fix = makeSpan(["fix"], []);
        return makeSpan(
            ["llap", options.style.cls()], [inner, fix]);
    },

    rlap: function(group, options, prev) {
        var inner = makeSpan(
            ["inner"], [buildGroup(group.value.body, options.reset())]);
        var fix = makeSpan(["fix"], []);
        return makeSpan(
            ["rlap", options.style.cls()], [inner, fix]);
    },

    punct: function(group, options, prev) {
        return makeSpan(
            ["mpunct"],
            [buildCommon.mathrm(group.value, group.mode)],
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
        for (var i = 1; i < group.value.body.length; i++) {
            chars.push(buildCommon.mathrm(group.value.body[i], group.mode));
        }

        return makeSpan(["mop"], chars, options.getColor());
    },

    katex: function(group, options, prev) {
        var k = makeSpan(
            ["k"], [buildCommon.mathrm("K", group.mode)]);
        var a = makeSpan(
            ["a"], [buildCommon.mathrm("A", group.mode)]);

        a.height = (a.height + 0.2) * 0.75;
        a.depth = (a.height - 0.2) * 0.75;

        var t = makeSpan(
            ["t"], [buildCommon.mathrm("T", group.mode)]);
        var e = makeSpan(
            ["e"], [buildCommon.mathrm("E", group.mode)]);

        e.height = (e.height - 0.2155);
        e.depth = (e.depth + 0.2155);

        var x = makeSpan(
            ["x"], [buildCommon.mathrm("X", group.mode)]);

        return makeSpan(
            ["katex-logo"], [k, a, t, e, x], options.getColor());
    },

    sqrt: function(group, options, prev) {
        var innerGroup = buildGroup(group.value.body,
                options.withStyle(options.style.cramp()));

        var fontSizer = buildCommon.makeFontSizer(
            options, Math.max(innerGroup.maxFontSize, 1.0));

        // The theta variable in the TeXbook
        var lineWidth = fontMetrics.metrics.defaultRuleThickness;

        var lineInner =
            makeSpan([options.style.reset(), Style.TEXT.cls(), "line"]);
        lineInner.maxFontSize = 1.0;
        var line = makeSpan(["sqrt-line"], [fontSizer, lineInner]);

        var inner = makeSpan(["sqrt-inner"], [fontSizer, innerGroup]);
        var fixIE = makeSpan(
            ["fix-ie"], [fontSizer, new domTree.textNode("\u00a0")]);

        var theta = fontMetrics.metrics.defaultRuleThickness /
            options.style.sizeMultiplier;
        var phi = theta;
        if (options.style.id < Style.TEXT.id) {
            phi = fontMetrics.metrics.xHeight;
        }

        var psi = theta + phi / 4;

        var innerHeight =
            (inner.height + inner.depth) * options.style.sizeMultiplier;
        var minDelimiterHeight = innerHeight + psi + theta;

        var delim = makeSpan(["sqrt-sign"], [
            delimiter.customSizedDelim("\\surd", minDelimiterHeight,
                                       false, options, group.mode)]);

        var delimDepth = delim.height + delim.depth;

        if (delimDepth > inner.height + inner.depth + psi) {
            psi = (psi + delimDepth - inner.height - inner.depth) / 2;
        }

        delim.style.top = (-inner.height - psi + delim.height - theta) + "em";

        line.style.top = (-inner.height - psi) + "em";
        line.height = inner.height + psi + 2 * theta;

        // We add a special case here, because even when `inner` is empty, we
        // still get a line. So, we use a simple heuristic to decide if we
        // should omit the body entirely. (note this doesn't work for something
        // like `\sqrt{\rlap{x}}`, but if someone is doing that they deserve for
        // it not to work.
        var body;
        if (inner.height === 0 && inner.depth === 0) {
            body = makeSpan();
        } else {
            body = makeSpan(["sqrt-body"], [line, inner, fixIE]);
        }

        return makeSpan(["sqrt", "mord"], [delim, body]);
    },

    overline: function(group, options, prev) {
        var innerGroup = buildGroup(group.value.body,
                options.withStyle(options.style.cramp()));

        var fontSizer = buildCommon.makeFontSizer(options, innerGroup.maxFontSize);

        // The theta variable in the TeXbook
        var lineWidth = fontMetrics.metrics.defaultRuleThickness /
            options.style.sizeMultiplier;

        var line = makeSpan(
            ["overline-line"], [fontSizer, makeSpan([options.style.reset(), Style.TEXT.cls(), "line"])]);
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
        var inner = buildExpression(group.value.value,
                options.withSize(group.value.size), prev);

        var span = makeSpan(["mord"],
            [makeSpan(["sizing", "reset-" + options.size, group.value.size,
                       options.style.cls()],
                      inner)]);

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

    styling: function(group, options, prev) {
        var style = {
            "display": Style.DISPLAY,
            "text": Style.TEXT,
            "script": Style.SCRIPT,
            "scriptscript": Style.SCRIPTSCRIPT
        };

        var newStyle = style[group.value.style];

        var inner = buildExpression(
            group.value.value, options.withStyle(newStyle), prev);

        return makeSpan([options.style.reset(), newStyle.cls()], inner);
    },

    delimsizing: function(group, options, prev) {
        var delim = group.value.value;

        if (delim === ".") {
            return makeSpan([groupToType[group.value.delimType]]);
        }

        return makeSpan(
            [groupToType[group.value.delimType]],
            [delimiter.sizedDelim(
                delim, group.value.size, options, group.mode)]);
    },

    leftright: function(group, options, prev) {
        var inner = buildExpression(group.value.body, options.reset());

        var innerHeight = 0;
        var innerDepth = 0;

        for (var i = 0; i < inner.length; i++) {
            innerHeight = Math.max(inner[i].height, innerHeight);
            innerDepth = Math.max(inner[i].depth, innerDepth);
        }

        innerHeight *= options.style.sizeMultiplier;
        innerDepth *= options.style.sizeMultiplier;

        var leftDelim;
        if (group.value.left === ".") {
            leftDelim = makeSpan(["nulldelimiter"]);
        } else {
            leftDelim = delimiter.leftRightDelim(
                group.value.left, innerHeight, innerDepth, options,
                group.mode);
        }
        inner.unshift(leftDelim);

        var rightDelim;
        if (group.value.right === ".") {
            rightDelim = makeSpan(["nulldelimiter"]);
        } else {
            rightDelim = delimiter.leftRightDelim(
                group.value.right, innerHeight, innerDepth, options,
                group.mode);
        }
        inner.push(rightDelim);

        return makeSpan(["minner"], inner, options.getColor());
    },

    rule: function(group, options, prev) {
        // Make an empty span for the rule
        var rule = makeSpan(["mord", "rule"], [], options.getColor());

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
