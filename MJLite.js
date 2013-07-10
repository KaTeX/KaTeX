var parser = require("./parser.jison");
parser.lexer = require("./lexer");
parser.yy = {
    parseError: function(str) {
        throw new Error(str);
    }
};

var buildExpression = function(expression) {
    return _.map(expression, function(ex, i) {
        var prev = i > 0 ? expression[i-1] : null;

        return buildGroup(ex, prev);
    });
};

var makeSpan = function(className, children) {
    var span = document.createElement("span");
    span.className = className || "";

    if (_.isArray(children)) {
        _.each(children, function(v) {
            span.appendChild(v);
        });
    } else if (children) {
        span.appendChild(children);
    }

    return span;
};

var buildGroup = function(group, prev) {
    if (group.type === "mathord") {
        return makeSpan("mord", mathit(group.value));
    } else if (group.type === "textord") {
        return makeSpan("mord", textit(group.value));
    } else if (group.type === "bin") {
        var className = "mbin";
        if (prev == null || _.contains(["bin", "open", "rel"], prev.type)) {
            group.type = "ord";
            className = "mord";
        }
        return makeSpan(className, textit(group.value));
    } else if (group.type === "rel") {
        return makeSpan("mrel", textit(group.value));
    } else if (group.type === "sup") {
        var sup = makeSpan("msup", buildExpression(group.value.sup));
        return makeSpan("mord", buildExpression(group.value.base).concat(sup));
    } else if (group.type === "sub") {
        var sub = makeSpan("msub", buildExpression(group.value.sub));
        return makeSpan("mord", buildExpression(group.value.base).concat(sub));
    } else if (group.type === "supsub") {
        var sup = makeSpan("msup", buildExpression(group.value.sup));
        var sub = makeSpan("msub", buildExpression(group.value.sub));

        var supsub = makeSpan("msupsub", [sup, sub]);

        return makeSpan("mord", buildExpression(group.value.base).concat(supsub));
    } else if (group.type === "open") {
        return makeSpan("mopen", textit(group.value));
    } else if (group.type === "close") {
        return makeSpan("mclose", textit(group.value));
    } else if (group.type === "dfrac") {
        var numer = makeSpan("mfracnum", makeSpan("", buildExpression(group.value.numer)));
        var mid = makeSpan("mfracmid", makeSpan());
        var denom = makeSpan("mfracden", buildExpression(group.value.denom));

        return makeSpan("minner mfrac", [numer, mid, denom]);
    } else if (group.type === "color") {
        return makeSpan("mord " + group.value.color, buildExpression(group.value.value));
    } else if (group.type === "spacing") {
        if (group.value === "\\ " || group.value === "\\space") {
            return makeSpan("mord mspace", textit(group.value));
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
        return makeSpan("llap", inner);
    } else if (group.type === "rlap") {
        var inner = makeSpan("", buildExpression(group.value));
        return makeSpan("rlap", inner);
    } else if (group.type === "punct") {
        return makeSpan("mpunct", textit(group.value));
    } else if (group.type === "ordgroup") {
        return makeSpan("mord", buildExpression(group.value));
    } else if (group.type === "namedfn") {
        return makeSpan("mop", textit(group.value.slice(1)));
    } else {
        console.log("Unknown type:", group.type);
    }
};

var charLookup = {
    "*": "\u2217",
    "-": "\u2212",
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
    return makeSpan("mathit", textit(value));
};

var clearNode = function(node) {
    if ("textContent" in node) {
        node.textContent = "";
    } else {
        node.innerText = "";
    }
};

var process = function(toParse, baseElem) {
    var tree = parser.parse(toParse);
    clearNode(baseElem);
    _.each(buildExpression(tree), function(elem) {
        baseElem.appendChild(elem);
    });
};

module.exports = {
    process: process
};
