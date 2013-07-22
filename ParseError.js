function ParseError(message) {
    var self = new Error("TeX parse error: " + message);
    self.name = "ParseError";
    self.__proto__ = ParseError.prototype;
    return self;
}

ParseError.prototype.__proto__ = Error.prototype;

module.exports = ParseError;
