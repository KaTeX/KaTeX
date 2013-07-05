var doParse = function(toparse, baseelem) {
    var makeex = function(ex, base) {
        for (var i = 0; i < ex.length; i++) {
            var prev = i > 0 ? ex[i-1] : null;
            var group = makegroup(ex[i], prev);
            base.appendChild(group);
        }

        return base;
    };

    var makegroup = function(group, prev) {
        if (group.type === "ord") {
            var elem = document.createElement("span");
            elem.className = "mord";
            elem.appendChild(mathit(group.value));
            return elem;
        } else if (group.type === "bin") {
            var elem = document.createElement("span");
            if (prev == null || prev.type === "bin" || prev.type === "open") {
                group.type = "ord";
                elem.className = "mord";
            } else {
                elem.className = "mbin";
            }
            elem.appendChild(mathit(group.value));
            return elem;
        } else if (group.type === "sup") {
            var elem = document.createElement("span");
            elem.className = "mord";
            makeex(group.value.base, elem);

            var sup = document.createElement("span");
            sup.className = "msup";
            makeex(group.value.sup, sup);

            elem.appendChild(sup);

            return elem;
        } else if (group.type === "sub") {
            var elem = document.createElement("span");
            elem.className = "mord";
            makeex(group.value.base, elem);

            var sub = document.createElement("span");
            sub.className = "msub";
            makeex(group.value.sub, sub);

            elem.appendChild(sub);

            return elem;
        } else if (group.type === "supsub") {
            var elem = document.createElement("span");
            elem.className = "mord";
            makeex(group.value.base, elem);

            var supsub = document.createElement("span");
            supsub.className = "msupsub";

            var sup = document.createElement("span");
            sup.className = "msup";
            makeex(group.value.sup, sup);

            var sub = document.createElement("span");
            sub.className = "msub";
            makeex(group.value.sub, sub);

            supsub.appendChild(sup);
            supsub.appendChild(sub);

            elem.appendChild(supsub);

            return elem;
        } else if (group.type === "open") {
            var elem = document.createElement("span");
            elem.className = "mopen";
            elem.appendChild(mathit(group.value));
            return elem;
        } else if (group.type === "close") {
            var elem = document.createElement("span");
            elem.className = "mclose";
            elem.appendChild(mathit(group.value));
            return elem;
        } else if (group.type === "cdot") {
            var elem = document.createElement("span");
            elem.className = "mbin";
            elem.appendChild(textit('\u22C5'));
            return elem;
        } else if (group.type === "frac") {
            var frac = document.createElement("span");
            frac.className = "mord mfrac";

            var numer = document.createElement("span");
            numer.className = "mfracnum";
            makeex(group.value.numer, numer);

            var mid = document.createElement("span");
            mid.className = "mfracmid";
            mid.appendChild(document.createElement("span"));

            var denom = document.createElement("span");
            denom.className = "mfracden";
            makeex(group.value.denom, denom);

            frac.appendChild(numer);
            frac.appendChild(mid);
            frac.appendChild(denom);

            return frac;
        } else {
            console.log(group.type);
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
            var elem = document.createElement("span");
            elem.className = "mathit";
            elem.appendChild(text);
            return elem;
        } else {
            return text;
        }
    };

    var tree = parser.parse(toparse);
    clearNode(baseelem);
    makeex(tree, baseelem);
};

var clearNode = function(node) {
    var children = node.childNodes;
    for (var i = children.length - 1; i >= 0; i--) {
        console.log(children[i]);
        node.removeChild(children[i]);
    }
};

window.onload = function() {
    var input = document.getElementById("input");
    var math = document.getElementById("math");

    doParse(input.value, math);

    input.oninput = function() {
        doParse(input.value, math);
    };
};
