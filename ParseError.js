function ParseError(message) {
    this.message = "TeX parse error: " + message;
}

ParseError.prototype = Error.prototype;

module.exports = ParseError;
