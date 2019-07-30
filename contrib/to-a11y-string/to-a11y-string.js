// @noflow
/**
 * KaTeX A11y
 * A library for converting KaTeX math into readable strings.
 */

// NOTE(jeresig): We need to keep this file as pure ES5 to avoid import
// problems into webapp.
// NOTE(jeresig): This probably isn't true anymore, we can probably update it!
/* eslint-disable no-var */

var katex = require("katex");

var stringMap = {
    "(": "left parenthesis",
    ")": "right parenthesis",
    "[": "open bracket",
    "]": "close bracket",
    "\\{": "left brace",
    "\\}": "right brace",
    "\\lvert": "open vertical bar",
    "\\rvert": "close vertical bar",
    "|": "vertical bar",
    "\\uparrow": "up arrow",
    "\\Uparrow": "up arrow",
    "\\downarrow": "down arrow",
    "\\Downarrow": "down arrow",
    "\\updownarrow": "up down arrow",
    "\\leftarrow": "left arrow",
    "\\Leftarrow": "left arrow",
    "\\rightarrow": "right arrow",
    "\\Rightarrow": "right arrow",
    "\\langle": "open angle",
    "\\rangle": "close angle",
    "\\lfloor": "open floor",
    "\\rfloor": "close floor",
    "\\int": "integral",
    "\\intop": "integral",
    "\\lim": "limit",
    "\\ln": "natural log",
    "\\log": "log",
    "\\sin": "sine",
    "\\cos": "cosine",
    "\\tan": "tangent",
    "\\cot": "cotangent",
    "\\sum": "sum",
    "/": "slash",
    ",": "comma",
    ".": "point",
    "-": "negative",
    "+": "plus",
    "~": "tilde",
    ":": "colon",
    "?": "question mark",
    "'": "apostrophe",
    "\\%": "percent",
    " ": "space",
    "\\ ": "space",
    "\\$": "dollar sign",
    "\\angle": "angle",
    "\\degree": "degree",
    "\\circ": "circle",
    "\\vec": "vector",
    "\\triangle": "triangle",
    "\\pi": "pi",
    "\\prime": "prime",
    "\\infty": "infinity",
    "\\alpha": "alpha",
    "\\beta": "beta",
    "\\gamma": "gamma",
    "\\omega": "omega",
    "\\theta": "theta",
    "\\sigma": "sigma",
    "\\lambda": "lambda",
    "\\tau": "tau",
    "\\Delta": "delta",
    "\\delta": "delta",
    "\\mu": "mu",
    "\\rho": "rho",
    "\\nabla": "del",
    "\\ell": "ell",
    "\\ldots": "dots",
};

var powerMap = {
    "\\prime": "prime",
    "\\degree": "degree",
    "\\circ": "degree",
};

var openMap = {
    "|": "open vertical bar",
    ".": "",
};

var closeMap = {
    "|": "close vertical bar",
    ".": "",
};

var binMap = {
    "+": "plus",
    "-": "minus",
    "\\pm": "plus minus",
    "\\cdot": "dot",
    "*": "times",
    "/": "divided by",
    "\\times": "times",
    "\\div": "divided by",
    "\\circ": "circle",
    "\\bullet": "bullet",
};

var relMap = {
    "=": "equals",
    "\\approx": "approximately equals",
    "\\neq": "does not equal",
    "\\ne": "does not equal",
    "\\geq": "is greater than or equal to",
    "\\ge": "is greater than or equal to",
    "\\leq": "is less than or equal to",
    "\\le": "is less than or equal to",
    ">": "is greater than",
    "<": "is less than",
    "\\leftarrow": "left arrow",
    "\\Leftarrow": "left arrow",
    "\\rightarrow": "right arrow",
    "\\Rightarrow": "right arrow",
    ":": "colon",
};

var buildString = function(str, type, a11yStrings) {
    if (!str) {
        return;
    }

    var ret;

    if (type === "open") {
        ret = str in openMap ? openMap[str] : stringMap[str] || str;
    } else if (type === "close") {
        ret = str in closeMap ? closeMap[str] : stringMap[str] || str;
    } else if (type === "bin") {
        ret = binMap[str] || str;
    } else if (type === "rel") {
        ret = relMap[str] || str;
    } else {
        ret = stringMap[str] || str;
    }

    // If nothing was found and it's not a plain string or number
    if (ret === str && !/^\w+$/.test(str)) {
        // This is likely a case that we'll need to handle
        throw new Error("KaTeX a11y " + type + " string not found: " + str);
    }

    // If the text to add is a number and there is already a string
    // in the list and the last string is a number then we should
    // combine them into a single number
    if (
        /^\d+$/.test(ret) &&
        a11yStrings.length > 0 &&
        /^\d+$/.test(a11yStrings[a11yStrings.length - 1])
    ) {
        a11yStrings[a11yStrings.length - 1] += ret;
    } else if (ret) {
        a11yStrings.push(ret);
    }
};

var buildRegion = function(a11yStrings, callback) {
    var region = [];
    a11yStrings.push(region);
    callback(region);
};

var typeHandlers = {
    accent: function(tree, a11yStrings) {
        buildRegion(a11yStrings, function(a11yStrings) {
            buildA11yStrings(tree.value.base, a11yStrings);
            a11yStrings.push("with");
            buildA11yStrings(tree.value.label, a11yStrings);
            a11yStrings.push("on top");
        });
    },

    bin: function(tree, a11yStrings) {
        buildString(tree.value, "bin", a11yStrings);
    },

    close: function(tree, a11yStrings) {
        buildString(tree.value, "close", a11yStrings);
    },

    color: function(tree, a11yStrings) {
        var color = tree.value.color.replace(/katex-/, "");

        buildRegion(a11yStrings, function(a11yStrings) {
            a11yStrings.push("start color " + color);
            buildA11yStrings(tree.value.value, a11yStrings);
            a11yStrings.push("end color " + color);
        });
    },

    delimsizing: function(tree, a11yStrings) {
        if (tree.value.value && tree.value.value !== ".") {
            buildString(tree.value.value, "normal", a11yStrings);
        }
    },

    genfrac: function(tree, a11yStrings) {
        buildRegion(a11yStrings, function(a11yStrings) {
            // NOTE: Not sure if this is a safe assumption
            // hasBarLine true -> fraction, false -> binomial
            if (tree.value.hasBarLine) {
                a11yStrings.push("start fraction");
                buildString(tree.value.leftDelim, "open", a11yStrings);
                buildA11yStrings(tree.value.numer, a11yStrings);
                a11yStrings.push("divided by");
                buildA11yStrings(tree.value.denom, a11yStrings);
                buildString(tree.value.rightDelim, "close", a11yStrings);
                a11yStrings.push("end fraction");
            } else {
                a11yStrings.push("start binomial");
                buildString(tree.value.leftDelim, "open", a11yStrings);
                buildA11yStrings(tree.value.numer, a11yStrings);
                a11yStrings.push("over");
                buildA11yStrings(tree.value.denom, a11yStrings);
                buildString(tree.value.rightDelim, "close", a11yStrings);
                a11yStrings.push("end binomial");
            }
        });
    },

    inner: function(tree, a11yStrings) {
        buildA11yStrings(tree.value, a11yStrings);
    },

    katex: function(tree, a11yStrings) {
        a11yStrings.push("KaTeX");
    },

    kern: function(tree, a11yStrings) {
        // No op: we don't attempt to present kerning information
        // to the screen reader.
    },

    leftright: function(tree, a11yStrings) {
        buildRegion(a11yStrings, function(a11yStrings) {
            buildString(tree.value.left, "open", a11yStrings);
            buildA11yStrings(tree.value.body, a11yStrings);
            buildString(tree.value.right, "close", a11yStrings);
        });
    },

    lap: function(tree, a11yStrings) {
        buildA11yStrings(tree.value.body, a11yStrings);
    },

    mathord: function(tree, a11yStrings) {
        buildA11yStrings(tree.value, a11yStrings);
    },

    op: function(tree, a11yStrings) {
        buildString(tree.value.body, "normal", a11yStrings);
    },

    open: function(tree, a11yStrings) {
        buildString(tree.value, "open", a11yStrings);
    },

    ordgroup: function(tree, a11yStrings) {
        buildA11yStrings(tree.value, a11yStrings);
    },

    overline: function(tree, a11yStrings) {
        buildRegion(a11yStrings, function(a11yStrings) {
            a11yStrings.push("start overline");
            buildA11yStrings(tree.value.body, a11yStrings);
            a11yStrings.push("end overline");
        });
    },

    phantom: function(tree, a11yStrings) {
        a11yStrings.push("empty space");
    },

    punct: function(tree, a11yStrings) {
        buildString(tree.value, "punct", a11yStrings);
    },

    raisebox: function(tree, a11yStrings) {
        buildA11yStrings(tree.value, a11yStrings);
    },

    rel: function(tree, a11yStrings) {
        buildString(tree.value, "rel", a11yStrings);
    },

    rlap: function(tree, a11yStrings) {
        buildA11yStrings(tree.value.body, a11yStrings);
    },

    rule: function(tree, a11yStrings) {
        // NOTE: Is there something more useful that we can put here?
        a11yStrings.push("rule");
    },

    sizing: function(tree, a11yStrings) {
        buildA11yStrings(tree.value.value, a11yStrings);
    },

    spacing: function(tree, a11yStrings) {
        a11yStrings.push("space");
    },

    styling: function(tree, a11yStrings) {
        // We ignore the styling and just pass through the contents
        buildA11yStrings(tree.value.value, a11yStrings);
    },

    sqrt: function(tree, a11yStrings) {
        buildRegion(a11yStrings, function(a11yStrings) {
            if (tree.value.index) {
                a11yStrings.push("root");
                a11yStrings.push("start index");
                buildA11yStrings(tree.value.index, a11yStrings);
                a11yStrings.push("end index");
            }

            a11yStrings.push("square root of");
            buildA11yStrings(tree.value.body, a11yStrings);
            a11yStrings.push("end square root");
        });
    },

    supsub: function(tree, a11yStrings) {
        if (tree.value.base) {
            buildA11yStrings(tree.value.base, a11yStrings);
        }

        if (tree.value.sub) {
            buildRegion(a11yStrings, function(a11yStrings) {
                a11yStrings.push("start subscript");
                buildA11yStrings(tree.value.sub, a11yStrings);
                a11yStrings.push("end subscript");
            });
        }

        var sup = tree.value.sup;

        if (sup) {
            // There are some cases that just read better if we don't have
            // the extra start/end baggage, so we skip the extra text
            var newPower = powerMap[sup];
            var supValue = sup.value;

            // The value stored inside the sup property is not always
            // consistent. It could be a string (handled above), an object
            // with a string property in value, or an array of objects that
            // have a value property.
            if (!newPower && supValue) {
                // If supValue is an object and it has a length of 1 we assume
                // it's an array that has only a single item in it. This is the
                // case that we care about and we only check that one value.
                if (typeof supValue === "object" && supValue.length === 1) {
                    newPower = powerMap[supValue[0].value];

                    // This is the case where it's a string in the value property
                } else {
                    newPower = powerMap[supValue];
                }
            }

            buildRegion(a11yStrings, function(a11yStrings) {
                if (newPower) {
                    a11yStrings.push(newPower);
                    return;
                }

                a11yStrings.push("start superscript");
                buildA11yStrings(tree.value.sup, a11yStrings);
                a11yStrings.push("end superscript");
            });
        }
    },

    text: function(tree, a11yStrings) {
        if (typeof tree.value !== "string") {
            buildA11yStrings(tree.value.body, a11yStrings);
        } else {
            buildString(tree, "normal", a11yStrings);
        }
    },

    textord: function(tree, a11yStrings) {
        buildA11yStrings(tree.value, a11yStrings);
    },
};

var buildA11yStrings = function(tree, a11yStrings) {
    a11yStrings = a11yStrings || [];

    // Handle strings
    if (typeof tree === "string") {
        buildString(tree, "normal", a11yStrings);

        // Handle arrays
    } else if (tree.constructor === Array) {
        for (var i = 0; i < tree.length; i++) {
            buildA11yStrings(tree[i], a11yStrings);
        }

        // Everything else is assumed to be an object...
    } else {
        if (!tree.type || !(tree.type in typeHandlers)) {
            throw new Error("KaTeX a11y un-recognized type: " + tree.type);
        } else {
            typeHandlers[tree.type](tree, a11yStrings);
        }
    }

    return a11yStrings;
};

var renderStrings = function(a11yStrings, a11yNode) {
    var doc = a11yNode.ownerDocument;

    for (var i = 0; i < a11yStrings.length; i++) {
        var a11yString = a11yStrings[i];

        if (i > 0) {
            // Note: We insert commas in (not just spaces) to provide
            // screen readers with some "breathing room". When inserting the
            // commas the screen reader knows to pause slightly and it provides
            // an overall better listening experience.
            a11yNode.appendChild(doc.createTextNode(", "));
        }

        if (typeof a11yString === "string") {
            a11yNode.appendChild(doc.createTextNode(a11yString));
        } else {
            var newBaseNode = doc.createElement("span");
            // NOTE(jeresig): We may want to add in a tabIndex property
            // to the node here, in order to support keyboard navigation.
            a11yNode.appendChild(newBaseNode);
            renderStrings(a11yString, newBaseNode);
        }
    }
};

var flattenStrings = function(a11yStrings, results) {
    if (!results) {
        results = [];
    }

    for (var i = 0; i < a11yStrings.length; i++) {
        var a11yString = a11yStrings[i];

        if (typeof a11yString === "string") {
            results.push(a11yString);
        } else {
            flattenStrings(a11yString, results);
        }
    }

    return results;
};

var parseMath = function(text) {
    // colorIsTextColor is an option added in KaTeX 0.9.0 for backward
    // compatibility. It makes \color parse like \textcolor. We use it
    // in the KA webapp, and need it here because the tests are written
    // assuming it is set.
    return katex.__parse(text, {colorIsTextColor: true});
};

var render = function(text, a11yNode) {
    var tree = parseMath(text);
    var a11yStrings = buildA11yStrings(tree);
    renderStrings(a11yStrings, a11yNode);
};

var flatten = function(array) {
    var result = [];

    array.forEach(function(item) {
        if (Array.isArray(item)) {
            result = result.concat(flatten(item));
        } else {
            result.push(item);
        }
    });

    return result;
};

var renderString = function(text) {
    var tree = parseMath(text);
    var a11yStrings = buildA11yStrings(tree);
    return flatten(a11yStrings).join(", ");
};

if (typeof module !== "undefined") {
    module.exports = {
        render: render,
        renderString: renderString,
        parseMath: parseMath,
    };
} else {
    this.katexA11yRender = render;
}
