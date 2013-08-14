// These objects store the data about the DOM nodes we create, as well as some
// extra data. They can then be transformed into real DOM nodes with the toDOM
// function. They are useful for both storing extra properties on the nodes, as
// well as providing a way to easily work with the DOM.

function span(classes, children, height, depth, style) {
    this.classes = classes || [];
    this.children = children || [];
    this.height = height || 0;
    this.depth = depth || 0;
    this.style = style || {};
}

span.prototype.toDOM = function() {
    var span = document.createElement("span");

    var classes = this.classes.slice();
    for (var i = classes.length - 1; i >= 0; i--) {
        if (!classes[i]) {
            classes.splice(i, 1);
        }
    }

    span.className = classes.join(" ");

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

function documentFragment(children, height, depth) {
    this.children = children || [];
    this.height = height || 0;
    this.depth = depth || 0;
}

documentFragment.prototype.toDOM = function() {
    var frag = document.createDocumentFragment();

    for (var i = 0; i < this.children.length; i++) {
        frag.appendChild(this.children[i].toDOM());
    }

    return frag;
};

function textNode(value, height, depth) {
    this.value = value || "";
    this.height = height || 0;
    this.depth = depth || 0;
}

textNode.prototype.toDOM = function() {
    return document.createTextNode(this.value);
};

module.exports = {
    span: span,
    documentFragment: documentFragment,
    textNode: textNode
};
