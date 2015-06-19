"use strict";

var align = { left: 0, center: 0.5, right: 1 };

var sizes = [
    null, 0.5, 0.7, 0.8, 0.9, 1.0, 1.2, 1.44, 1.73, 2.07, 2.49
];

function CanvasState(orig) {
    for (var key in orig) {
        if (orig.hasOwnProperty(key)) {
            this[key] = orig[key];
        }
    }
}

CanvasState.prototype.sizeChanged = function() {
    this.em = this.baseSize * sizes[this.sizeIndex] * this.styleFactor;
    this.fontChanged();
};

CanvasState.prototype.fontChanged = function() {
    this.font = this.variant + this.weight + this.em + "px " + this.family;
};

CanvasState.prototype.withStyle = function(styleFactor) {
    var res = new CanvasState(this);
    res.styleFactor = styleFactor;
    res.sizeChanged();
    return res;
};

CanvasState.prototype.withSize = function(sizeIndex) {
    var res = new CanvasState(this);
    res.sizeIndex = sizeIndex;
    res.sizeChanged();
    return res;
};

CanvasState.prototype.withFace = function(variant, family) {
    var res = new CanvasState(this);
    res.variant = variant;
    res.family = family;
    res.fontChanged();
    return res;
};

CanvasState.prototype.withYShift = function(y) {
    var res = new CanvasState(this);
    res.ypos += y * res.em;
    return res;
};

CanvasState.prototype.withHAlign = function(halign) {
    var res = new CanvasState(this);
    res.halign = halign;
    return res;
};

CanvasState.prototype.withColor = function(color) {
    var res = new CanvasState(this);
    res.color = color;
    return res;
};

function CanvasRenderer(ctxt, options) {
    this.ctxt = ctxt;
    this.fontSize = 16; // px
    this.left = Infinity;
    this.top = Infinity;
    this.right = -Infinity;
    this.bottom = -Infinity;
    this.x = 0;
    this.outList = [];
    this.horizontalLines = [];
    this.prevClass = "";
    this.baseSize = options.fontSize || (16 * 1.21);
    this.state = new CanvasState({
        baseSize: this.baseSize,
        sizeIndex: 5,
        styleFactor: 1,
        variant: "",
        weight: "",
        family: "KaTeX_Main",
        color: null,
        ypos: 0,
        halign: options.halign || align.left
    });
    this.state.sizeChanged();
}

var thinspace = 0.16667;
var mediumspace = 0.22222;
var thickspace = 0.27778;
var spacePairsTextStyle = {
    "mord_mop": thinspace,
    "mord_mbin": mediumspace,
    "mord_mrel": thickspace,
    "mord_minner": thinspace,
    "mop_mord": thinspace,
    "mop_mop": thinspace,
    "mop_mrel": thickspace,
    "mop_minner": thinspace,
    "mbin_mord": mediumspace,
    "mbin_mop": mediumspace,
    "mbin_mopen": mediumspace,
    "mbin_minner": mediumspace,
    "mrel_mord": thickspace,
    "mrel_mop": thickspace,
    "mrel_mopen": thickspace,
    "mrel_minner": thickspace,
    "mclose_mop": thinspace,
    "mclose_mbin": mediumspace,
    "mclose_mrel": thickspace,
    "mclose_minner": thinspace,
    "mpunct_mord": thinspace,
    "mpunct_mop": thinspace,
    "mpunct_mrel": thinspace,
    "mpunct_mopen": thinspace,
    "mpunct_mclose": thinspace,
    "mpunct_mpunct": thinspace,
    "mpunct_minner": thinspace,
    "minner_mord": thinspace,
    "minner_mop": thinspace,
    "minner_mbin": mediumspace,
    "minner_mrel": thickspace,
    "minner_mopen": thinspace,
    "minner_mpunct": thinspace,
    "minner_minner": thinspace
};
var spacePairs = {
    "mord_mop": thinspace,
    "mop_mord": thinspace,
    "mop_mop": thinspace,
    "mclose_mop": thinspace,
    "minner_mop": thinspace
};

CanvasRenderer.prototype.prepare = function(node) {
    var prevState = this.state;

    var classes = !node.classes ? "" : node.classes.filter(function(className) {
        return className !== null;
    }).join(" ");
    if (classes === "") {
        classes = [];
    } else {
        classes = classes.split(" ");
    }

    var key, val, i, size = null;
    function findSize() {
        if (size === null) {
            var j = i - 1;
            while (j-- > 0) {
                var className = classes[j];
                if (!className) {
                    continue;
                }
                if (className.substr(4) === "size") {
                    size = +className.substr(4);
                    break;
                }
            }
        }
        return size;
    }

    var isVlist = false;
    var nodeClass = "";
    var marginLeft = null;
    var marginRight = 0;
    var resetX = null;
    var lap = null;
    i = classes.length;
    while (i--) {
        var className = classes[i];
        switch(className) {
        case "delimsizing":
            if (findSize() !== null) {
                this.state = this.state.withFace("", "KaTeX_Size" + size);
            }
            break;
        case "delim-size1":
        case "small-op":
            this.state = this.state.withFace("", "KaTeX_Size1");
            break;
        case "large-op":
            this.state = this.state.withFace("", "KaTeX_Size2");
            break;
        case "delim-size4":
            this.state = this.state.withFace("", "KaTeX_Size4");
            break;
        case "delimsizing":
            if (findSize() !== null) {
                this.state = this.state.withFace("", "KaTeX_Size" + size);
            }
            break;

        case "fontsize-ensurer":
        case "sizing":
            if (findSize() !== null) {
                this.state = this.state.withSize(size);
            }
            break;

        case "frac-line":
        case "sqrt-line":
        case "overline-line":
            this.horizontalLines.push({
                y: this.state.ypos,
                height: Math.max(1, 0.04 * this.state.em),
                color: this.state.color
            });
            break;
        case "mfrac":
        case "accent":
        case "op-limits":
        case "col-align-c":
            this.state = this.state.withHAlign(align.center);
            break;
        case "root":
            marginLeft = 5/18;
            marginRight = -10/18;
            break;
        case "accent-vec":
            marginLeft += 0.326;
            break;
        case "accent-body":
            resetX = this.x;
            break;

        case "mathit":
            this.state = this.state.withFace("italic ", "KaTeX_Math");
            break;

        case "mord":
        case "mop":
        case "mbin":
        case "mrel":
        case "mopen":
        case "mclose":
        case "minner":
        case "mpunct":
        case "minner":
            nodeClass = className;
            break;

        case "msupsub":
        case "col-align-l":
            this.state = this.state.withHAlign(align.left);
            break;
        case "col-align-r":
            this.state = this.state.withHAlign(align.right);
            break;

        case "scriptscriptstyle":
            this.state = this.state.withStyle(0.5);
            break;
        case "scriptstyle":
            this.state = this.state.withStyle(0.7);
            break;
        case "textstyle":
            this.state = this.state.withStyle(1.0);
            break;

        case "size1":
        case "size2":
        case "size3":
        case "size4":
        case "size5":
        case "size6":
        case "size7":
        case "size8":
        case "size9":
        case "size10":
            size = +className.substr(4);
            break;

        case "negativethinspace":
            marginRight += -thinspace;
            break;
        case "thinspace":
            marginRight += thinspace;
            break;
        case "mediumspace":
            marginRight += mediumspace;
            break;
        case "thickspace":
            marginRight += thickspace;
            break;
        case "enspace":
            marginRight += 0.5;
            break;
        case "quad":
            marginRight += 1;
            break;
        case "qquad":
            marginRight += 2;
            break;

        case "k":
            break;
        case "a":
            this.state = this.state.withStyle(0.75).withYShift(-0.2);
            marginLeft = -0.32;
            break;
        case "t":
            marginLeft = -0.23;
            break;
        case "e":
            this.state = this.state.withYShift(0.2155);
            marginLeft = -0.1667;
            break;
        case "x":
            marginLeft = -0.125;
            break;

        case "vlist":
            isVlist = true;
            break;
        case "llap":
        case "rlap":
            lap = className;
            break;

        case "arraycolsep":
        case "base":
        case "baseline-fix":
        case "bottom":
        case "cramped":
        case "delimsizinginner":
        case "displaystyle":
        case "katex-logo":
        case "katex-html":
        case "mspace":
        case "mtable":
        case "mult":
        case "op-symbol":
        case "overline":
        case "reset-scriptscriptstyle":
        case "reset-scriptstyle":
        case "reset-size1":
        case "reset-size2":
        case "reset-size3":
        case "reset-size4":
        case "reset-size5":
        case "reset-size6":
        case "reset-size7":
        case "reset-size8":
        case "reset-size9":
        case "reset-size10":
        case "reset-textstyle":
        case "sqrt":
        case "sqrt-sign":
        case "strut":
        case "style-wrap":
        case "text":
        case "uncramped":
            // Not special handling (yet?)
            break;

        default:
            // TODO: should throw an exception here one day
            console.log("Don't know how to handle class " + className);
        }
    }
    for (key in node.style) {
        val = node.style[key];
        switch(key) {
        case "top":
            if (val.substr(val.length - 2) !== "em") {
                throw new Error("em is the only supported unit.");
            }
            val = +val.substr(0, val.length - 2);
            this.state = this.state.withYShift(val);
            break;
        case "fontSize":
            if (val === "0em") {
                // makeFontSizer sometimes builds these
                return;
            }
            // TODO: Handle font-sizer for non-zero font size
            break;
        case "marginLeft":
            if (val.substr(val.length - 2) !== "em") {
                throw new Error("em is the only supported unit.");
            }
            marginLeft = +val.substr(0, val.length - 2);
            break;
        case "marginRight":
        case "width":
            if (val.substr(val.length - 2) !== "em") {
                throw new Error("em is the only supported unit.");
            }
            marginRight = +val.substr(0, val.length - 2);
            break;
        case "color":
            this.state = this.state.withColor(val);
            break;
        case "height":
        case "verticalAlign":
            // These two usually are for struts
            break;
        default:
            // TODO: should throw an exception here one day
            console.log("Don't know how to handle style " + key);
        }
    }
    for (key in node.attributes) {
        val = node.attributes[key];
        switch(key) {
        case "aria-hidden":
            // ignore
            break;
        default:
            // TODO: should throw an exception here one day
            console.log("Don't know how to handle attribute " + key);
        }
    }

    var classPair = this.prevClass + "_" + nodeClass;
    if (marginLeft === null) {
        marginLeft = spacePairs[classPair];
        if (marginLeft === undefined && this.state.styleFactor === 1) {
            marginLeft = spacePairsTextStyle[classPair];
        }
    }
    if (marginLeft) {
        this.x += marginLeft * this.state.em;
    }
    if (isVlist) {
        this.halign(node.children, this.state.halign);
    } else if (lap) {
        this.lap(lap, node.children);
    } else if (node.children) {
        node.children.forEach(this.prepare.bind(this));
    } else {
        this.ctxt.font = this.state.font;
        var text = node.value;
        var measurement = this.ctxt.measureText(text);
        var width = measurement.width;
        if (node.italic) {
            marginRight += node.italic;
        }
        if (text !== "" && text !== "\u200b") {
            var atom = {
                x: this.x,
                y: this.state.ypos,
                font: this.state.font,
                color: this.state.color,
                text: text
            };
            this.outList.push(atom);
        }
        this.x += width;
    }
    this.x += marginRight * this.state.em;
    if (resetX !== null) {
        this.x = resetX;
    }
    this.state = prevState;
    this.prevClass = nodeClass;
};

// Align a list of children to a common vertical axis.
// Alignment is one of 0 (left), 0.5 (centered) or 1 (right).
CanvasRenderer.prototype.halign = function(children, alignment) {
    var i, shift;
    var oldLines = this.horizontalLines;
    this.horizontalLines = [];
    var outList = this.outList;
    var oldX = this.x;
    var mark1 = outList.length;
    var maxWidth = 0;
    for (i = 0; i < children.length; ++i) {
        var mark2 = outList.length;
        this.x = 0;
        this.prepare(children[i]);
        var width = this.x;
        if (maxWidth < width) {
            maxWidth = width;
        }
        shift = alignment * width;
        while (mark2 < outList.length) {
            outList[mark2++].x -= shift;
        }
    }
    shift = alignment * maxWidth + oldX;
    while (mark1 < outList.length) {
        outList[mark1++].x += shift;
    }
    for (i = 0; i < this.horizontalLines.length; ++i) {
        var fracLine = this.horizontalLines[i];
        fracLine.x = oldX;
        fracLine.width = maxWidth;
        outList.push(fracLine);
    }
    this.x = oldX + maxWidth;
    this.horizontalLines = oldLines;
};

CanvasRenderer.prototype.lap = function(lap, children) {
    var child = children[0];
    var oldX = this.x;
    var outList = this.outList;
    var mark = outList.length;
    this.prepare(child);
    var width = this.x - oldX;
    this.x = oldX;
    if (lap == "llap") {
        while (mark < outList.length) {
            outList[mark++].x -= width;
        }
    }
};

function backupCanvasState(canvas, callback) {
    var ctxt = canvas.getContext ? canvas.getContext("2d") : canvas;
    var oldFont = ctxt.font;
    var oldFill = ctxt.fillStyle;
    try {
        var res = callback(ctxt);
        ctxt.font = oldFont;
        ctxt.fillStyle = oldFill;
        return res;
    } catch (e) {
        ctxt.font = oldFont;
        ctxt.fillStyle = oldFill;
        throw e;
    }
}

function PreparedBox(canvas, atoms, xshift) {
    this.renderAt = function(x, y) {
        x -= xshift;
        backupCanvasState(canvas, function(ctxt) {
            var initialColor = ctxt.fillStyle;
            for (var i = 0; i < atoms.length; ++i) {
                var atom = atoms[i];
                ctxt.fillStyle =
                    (atom.color === null ? initialColor : atom.color);
                if (atom.text) {
                    ctxt.font = atom.font;
                    ctxt.fillText(atom.text, atom.x + x, atom.y + y);
                } else if (atom.width || atom.height) {
                    ctxt.fillRect(atom.x + x, atom.y + y - atom.height,
                                  atom.width, atom.height);
                }
            }
        });
    };
}

function prepare(dom, canvas, options) {
    return backupCanvasState(canvas, function(ctxt) {
        var halign = options.halign || align.left;
        var renderer = new CanvasRenderer(ctxt, options);
        renderer.prepare(dom);
        var em = renderer.state.em;
        var xshift = renderer.x * halign;
        var box = new PreparedBox(ctxt, renderer.outList, xshift);
        box.width = renderer.x;
        box.depth = dom.depth * em;
        box.height = dom.height * em;
        return box;
    });
}

function render(dom, canvas, x, y, options) {
    prepare(dom, canvas, options).renderAt(x, y);
}

module.exports = {
    prepare: prepare,
    render: render
};
