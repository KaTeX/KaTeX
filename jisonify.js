var ebnfParser = require("ebnf-parser");
var jison = require("jison");
var through = require("through");

module.exports = function(file) {
    if (!(/\.jison$/).test(file)) {
        return through();
    }

    var data = '';
    return through(write, end);

    function write(buf) {
        data += buf;
    }

    function end() {
        try {
            var grammar = ebnfParser.parse(data);
            var parser = new jison.Parser(grammar);
            var js = parser.generate({moduleType: "js"});
            js += "\nmodule.exports = parser;";

            this.queue(js);
            this.queue(null);
        } catch (e) {
            // TODO(alpert): Does this do anything? (Is it useful?)
            this.emit("error", e);
        }
    }
};
