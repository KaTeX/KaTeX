var MJLite = (function() {

    var buildExpression = function(expression) {
        return _.map(expression, function(ex, i) {
            var prev = i > 0 ? expression[i-1] : null;

            return buildGroup(ex, prev);
        });
    };

    var makeSpan = function(className, children) {
        var span = document.createElement("span");
        span.className = className;

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
                elem.className = "mord";
            }
            return makeSpan(className, mathit(group.value));
        } else if (group.type === "sup") {
            var sup = makeSpan("msup", buildExpression(group.value.sup));
            return makeSpan("mord", buildExpression(group.value.base).concat(sup));
        } else if (group.type === "sub") {
            var sub = makeSpan("msub", buildExpression(group.value.sub, sub));
            return makeSpan("mord", buildExpression(group.value.base, elem).concat(sub));
        } else if (group.type === "supsub") {
            var sup = makeSpan("msup", buildExpression(group.value.sup, sup));
            var sub = makeSpan("msub", buildExpression(group.value.sub, sub));

            var supsub = makeSpan("msupsub", [sup, sub]);

            return makeSpan("mord", buildExpression(group.value.base, elem).concat(supsub));
        } else if (group.type === "open") {
            return makeSpan("mopen", mathit(group.value));
        } else if (group.type === "close") {
            return makeSpan("mclose", mathit(group.value));
        } else if (group.type === "cdot") {
            return makeSpan("mbin", textit("cdot"));
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
        '*': '\u2217',
        '-': '\u2212',
        'cdot': '\u22C5'
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
        var children = node.childNodes;
        for (var i = children.length - 1; i >= 0; i--) {
            node.removeChild(children[i]);
        }
    };

    var process = function(toParse, baseElem) {
        var tree = parser.parse(toParse);
        clearNode(baseElem);
        _.each(buildExpression(tree), function(elem) {
            baseElem.appendChild(elem);
        });
    };

    return {
        process: process
    };

})();
