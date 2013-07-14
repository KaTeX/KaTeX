var Style = require("./Style");

var parseTree = require("./parseTree");
var utils = require("./utils");

var buildExpression = function(style, expression) {
    var groups = [];
    for (var i = 0; i < expression.length; i++) {
        var group = expression[i];
        var prev = i > 0 ? expression[i-1] : null;

        groups.push(buildGroup(style, group, prev));
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

var buildGroup = function(style, group, prev) {
    if (group.type === "mathord") {
        return makeSpan("mord", [mathit(group.value)]);
    } else if (group.type === "textord") {
        return makeSpan("mord", [textit(group.value)]);
    } else if (group.type === "bin") {
        var className = "mbin";
        if (prev == null || utils.contains(["bin", "open", "rel"], prev.type)) {
            group.type = "ord";
            className = "mord";
        }
        return makeSpan(className, [textit(group.value)]);
    } else if (group.type === "rel") {
        return makeSpan("mrel", [textit(group.value)]);
    } else if (group.type === "sup") {
        var sup = makeSpan("msup " + style.cls(), [
            makeSpan(style.sup().cls(), [
                buildGroup(style.sup(), group.value.sup)
            ])
        ]);
        return makeSpan("mord", [buildGroup(style, group.value.base), sup]);
    } else if (group.type === "sub") {
        var sub = makeSpan("msub " + style.cls(), [
            makeSpan(style.sub().cls(), [
                buildGroup(style.sub(), group.value.sub)
            ])
        ]);
        return makeSpan("mord", [buildGroup(style, group.value.base), sub]);
    } else if (group.type === "supsub") {
        var sup = makeSpan("msup " + style.sup().cls(), [
            buildGroup(style.sup(), group.value.sup)
        ]);
        var sub = makeSpan("msub " + style.sub().cls(), [
            buildGroup(style.sub(), group.value.sub)
        ]);

        var supsub = makeSpan("msupsub " + style.cls(), [sup, sub]);

        return makeSpan("mord", [buildGroup(style, group.value.base), supsub]);
    } else if (group.type === "open") {
        return makeSpan("mopen", [textit(group.value)]);
    } else if (group.type === "close") {
        return makeSpan("mclose", [textit(group.value)]);
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
            makeSpan("", [buildGroup(nstyle, group.value.numer)])
        ]);
        var mid = makeSpan("mfracmid", [makeSpan()]);
        var denom = makeSpan("mfracden " + dstyle.cls(), [
            makeSpan("", [buildGroup(dstyle, group.value.denom)])
        ]);

        return makeSpan("minner mfrac " + fstyle.cls(), [numer, mid, denom]);
    } else if (group.type === "color") {
        return makeSpan("mord " + group.value.color, [buildGroup(style, group.value.value)]);
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
        var inner = makeSpan("", buildExpression(style, group.value));
        return makeSpan("llap " + style.cls(), [inner]);
    } else if (group.type === "rlap") {
        var inner = makeSpan("", buildExpression(style, group.value));
        return makeSpan("rlap " + style.cls(), [inner]);
    } else if (group.type === "punct") {
        return makeSpan("mpunct", [textit(group.value)]);
    } else if (group.type === "ordgroup") {
        return makeSpan("mord " + style.cls(), buildExpression(style, group.value));
    } else if (group.type === "namedfn") {
        return makeSpan("mop", [textit(group.value.slice(1))]);
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
    var expression = buildExpression(style, tree);
    var span = makeSpan(style.cls(), expression);

    clearNode(baseElem);
    baseElem.appendChild(span);
    return true;
};

module.exports = {
    process: process
};
