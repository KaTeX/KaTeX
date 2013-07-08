var parser = require("./parser.jison");
parser.lexer = require("./lexer");

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
    if (group.type === "ord") {
        return makeSpan("mord", mathit(group.value));
    } else if (group.type === "bin") {
        var className = "mbin";
        if (prev == null || prev.type === "bin" || prev.type === "open") {
            group.type = "ord";
            className = "mord";
        }
        return makeSpan(className, textit(group.value));
    } else if (group.type === "sup") {
        var sup = makeSpan("msup", buildExpression(group.value.sup));
        return makeSpan("mord", buildExpression(group.value.base).concat(sup));
    } else if (group.type === "sub") {
        var sub = makeSpan("msub", buildExpression(group.value.sub, sub));
        return makeSpan("mord", buildExpression(group.value.base).concat(sub));
    } else if (group.type === "supsub") {
        var sup = makeSpan("msup", buildExpression(group.value.sup, sup));
        var sub = makeSpan("msub", buildExpression(group.value.sub, sub));

        var supsub = makeSpan("msupsub", [sup, sub]);

        return makeSpan("mord", buildExpression(group.value.base).concat(supsub));
    } else if (group.type === "open") {
        return makeSpan("mopen", textit(group.value));
    } else if (group.type === "close") {
        return makeSpan("mclose", textit(group.value));
    } else if (group.type === "frac") {
        var numer = makeSpan("mfracnum", buildExpression(group.value.numer, numer));
        var mid = makeSpan("mfracmid", makeSpan());
        var denom = makeSpan("mfracden", buildExpression(group.value.denom, denom));

        return makeSpan("mord mfrac", [numer, mid, denom]);
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
    "\\div": "\u00f7"
};

var textit = function(value) {
    if (value in charLookup) {
        value = charLookup[value];
    }
    return document.createTextNode(value);
};

var mathit = function(value) {
    var text = textit(value);

    if (/[a-zA-Z]/.test(value)) {
        return makeSpan("mathit", text);
    } else {
        return text;
    }
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
