var parseTree = require("./parseTree");

var utils = require("./utils");

var buildExpression = function(expression) {
    var groups = [];
    for (var i = 0; i < expression.length; i++) {
        var group = expression[i];
        var prev = i > 0 ? expression[i-1] : null;

        groups.push(buildGroup(group, prev));
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

var buildGroup = function(group, prev) {
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
        var sup = makeSpan("msup", [buildGroup(group.value.sup)]);
        return makeSpan("mord", [buildGroup(group.value.base), sup]);
    } else if (group.type === "sub") {
        var sub = makeSpan("msub", [buildGroup(group.value.sub)]);
        return makeSpan("mord", [buildGroup(group.value.base), sub]);
    } else if (group.type === "supsub") {
        var sup = makeSpan("msup", [buildGroup(group.value.sup)]);
        var sub = makeSpan("msub", [buildGroup(group.value.sub)]);

        var supsub = makeSpan("msupsub", [sup, sub]);

        return makeSpan("mord", [buildGroup(group.value.base), supsub]);
    } else if (group.type === "open") {
        return makeSpan("mopen", [textit(group.value)]);
    } else if (group.type === "close") {
        return makeSpan("mclose", [textit(group.value)]);
    } else if (group.type === "dfrac") {
        var numer = makeSpan("mfracnum", [makeSpan("", [buildGroup(group.value.numer)])]);
        var mid = makeSpan("mfracmid", [makeSpan()]);
        var denom = makeSpan("mfracden", [buildGroup(group.value.denom)]);

        return makeSpan("minner mfrac", [numer, mid, denom]);
    } else if (group.type === "color") {
        return makeSpan("mord " + group.value.color, [buildGroup(group.value.value)]);
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
        var inner = makeSpan("", buildExpression(group.value));
        return makeSpan("llap", [inner]);
    } else if (group.type === "rlap") {
        var inner = makeSpan("", buildExpression(group.value));
        return makeSpan("rlap", [inner]);
    } else if (group.type === "punct") {
        return makeSpan("mpunct", [textit(group.value)]);
    } else if (group.type === "ordgroup") {
        return makeSpan("mord", buildExpression(group.value));
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
    clearNode(baseElem);
    var expression = buildExpression(tree);
    for (var i = 0; i < expression.length; i++) {
        baseElem.appendChild(expression[i]);
    }
    return true;
};

module.exports = {
    process: process
};
