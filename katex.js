var Style = require("./Style");

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
        var mid = makeSpan("mfracmid", [makeSpan()]);
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
        var inner = makeSpan("", buildExpression(style, color, group.value));
        return makeSpan("llap " + style.cls(), [inner]);
    } else if (group.type === "rlap") {
        var inner = makeSpan("", buildExpression(style, color, group.value));
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
    "\\cdot": "\u22C5",
    "\\lvert": "|",
    "\\rvert": "|",
    "\\pm": "\u00b1",
    "\\div": "\u00f7",
    "\\leq": "\u2264",
    "\\geq": "\u2265",
    "\\neq": "\u2260",
    "\\nleq": "\u2270",
    "\\ngeq": "\u2271",
    "\\ ": "\u00a0",
    "\\space": "\u00a0",
    "\\colon": ":"
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

var process = function(toParse, baseElem) {
    try {
        var tree = parseTree(toParse);
    } catch (e) {
        console.error(e);
        return false;
    }

    var style = Style.TEXT;
    var expression = buildExpression(style, /* color: */ "", tree);
    var span = makeSpan(style.cls(), expression);

    clearNode(baseElem);
    baseElem.appendChild(span);
    return true;
};

module.exports = {
    process: process
};
