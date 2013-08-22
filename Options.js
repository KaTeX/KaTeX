function Options(style, size, color, depth, parentStyle, parentSize) {
    this.style = style;
    this.color = color;
    this.size = size;

    // TODO(emily): Get rid of depth when we can actually use sizing everywhere
    if (!depth) {
        depth = 0;
    }
    this.depth = depth;

    if (!parentStyle) {
        parentStyle = style;
    }
    this.parentStyle = parentStyle;

    if (!parentSize) {
        parentSize = size;
    }
    this.parentSize = parentSize;
}

Options.prototype.withStyle = function(style) {
    return new Options(style, this.size, this.color, this.depth + 1,
        this.style, this.size);
};

Options.prototype.withSize = function(size) {
    return new Options(this.style, size, this.color, this.depth + 1,
        this.style, this.size);
};

Options.prototype.withColor = function(color) {
    return new Options(this.style, this.size, color, this.depth + 1,
        this.style, this.size);
};

Options.prototype.reset = function() {
    return new Options(this.style, this.size, this.color, this.depth + 1,
        this.style, this.size);
};

module.exports = Options;
