// These objects store the data about the DOM nodes we create, as well as some
// extra data. They can then be transformed into real DOM nodes with the toDOM
// function. They are useful for both storing extra properties on the nodes, as
// well as providing a way to easily work with the DOM.

var createClass = function(classes) {
    classes = classes.slice();
    for (var i = classes.length - 1; i >= 0; i--) {
        if (!classes[i]) {
            classes.splice(i, 1);
        }
    }

    return classes.join(" ");
};

function span(classes, children, height, depth, maxFontSize, style) {
    this.classes = classes || [];
    this.children = children || [];
    this.height = height || 0;
    this.depth = depth || 0;
    this.maxFontSize = maxFontSize || 0;
    this.style = style || {};
}

span.prototype.toDOM = function() {
    var span = document.createElement("span");

    span.className = createClass(this.classes);

    for (var style in this.style) {
        if (this.style.hasOwnProperty(style)) {
            span.style[style] = this.style[style];
        }
    }

    for (var i = 0; i < this.children.length; i++) {
        span.appendChild(this.children[i].toDOM());
    }

    return span;
};

function documentFragment(children, height, depth, maxFontSize) {
    this.children = children || [];
    this.height = height || 0;
    this.depth = depth || 0;
    this.maxFontSize = maxFontSize || 0;
}

documentFragment.prototype.toDOM = function() {
    var frag = document.createDocumentFragment();

    for (var i = 0; i < this.children.length; i++) {
        frag.appendChild(this.children[i].toDOM());
    }

    return frag;
};

function symbolNode(value, height, depth, italic, classes, style) {
    this.value = value || "";
    this.height = height || 0;
    this.depth = depth || 0;
    this.italic = italic || 0;
    this.classes = classes || [];
    this.style = style || {};
}

symbolNode.prototype.toDOM = function() {
    var node = document.createTextNode(this.value);
    var span = null;

    if (this.italic > 0) {
        span = document.createElement("span");
        span.style.marginRight = this.italic + "em";
    }

    if (this.classes.length > 0) {
        span = span || document.createElement("span");
        span.className = createClass(this.classes);
    }

    for (var style in this.style) {
        if (this.style.hasOwnProperty(style)) {
            span = span || document.createElement("span");
            span.style[style] = this.style[style];
        }
    }

    if (span) {
        span.appendChild(node);
        return span;
    } else {
        return node;
    }
};

module.exports = {
    span: span,
    documentFragment: documentFragment,
    symbolNode: symbolNode
};
