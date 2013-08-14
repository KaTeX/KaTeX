function Options(style, color, parentStyle) {
    this.style = style;
    this.color = color;

    if (!parentStyle) {
        parentStyle = style;
    }
    this.parentStyle = parentStyle;
}

Options.prototype.withStyle = function(style) {
    return new Options(style, this.color, this.style);
};

Options.prototype.withColor = function(color) {
    return new Options(this.style, color, this.style);
};

Options.prototype.reset = function() {
    return new Options(this.style, this.color, this.style);
};

module.exports = Options;
