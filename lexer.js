var DEFAULT_STATE = 0,
    FUNC_STATE = 1;

function Lexer() {
};

var funcs = [
    'cdot', 'frac', 'lvert', 'rvert', 'pm', 'div'
];

var normals = [
    [/^[/|a-zA-Z0-9.]/, 'ORD'],
    [/^[*+-]/, 'BIN'],
    [/^\^/, '^'],
    [/^_/, '_'],
    [/^{/, '{'],
    [/^}/, '}'],
    [/^[(\[]/, 'OPEN'],
    [/^[)\]]/, 'CLOSE']
];

Lexer.prototype.doMatch = function(match) {
    this.yytext = match;
    this.yyleng = match.length;

    this.yylloc.first_column = this._pos;
    this.yylloc.last_column = this._pos + match.length;

    this._pos += match.length;
};

Lexer.prototype.lex = function() {
    // Get rid of whitespace
    var whitespace = this._input.substr(this._pos).match(/^\s*/)[0];
    this._pos += whitespace.length;

    if (this._pos >= this._input.length) {
        return 'EOF';
    }

    var toMatch = this._input.substr(this._pos);

    if (this.state === DEFAULT_STATE) {
        if (/^\\/.test(toMatch)) {
            this.state = FUNC_STATE;
            this.doMatch('\\');
            return '\\';
        } else {
            for (var i = 0; i < normals.length; i++) {
                var normal = normals[i];

                var match = toMatch.match(normal[0]);
                if (match) {
                    this.doMatch(match[0]);
                    return normal[1];
                }
            }
        }
    } else if (this.state === FUNC_STATE) {
        for (var i = 0; i < funcs.length; i++) {
            var func = funcs[i];

            var regex = new RegExp('^' + func + '(?!a-zA-Z)');

            var match = toMatch.match(regex);
            if (match) {
                this.doMatch(match[0]);
                this.state = DEFAULT_STATE;
                return func;
            }
        }
    }

    throw "Unexpected character: '" + toMatch[0] + "' at position " + this._pos;
};

Lexer.prototype.setInput = function(input) {
    this._input = input;
    this._pos = 0;

    this.yyleng = 0;
    this.yytext = "";
    this.yylineno = 0;
    this.yylloc = {
        first_line: 1,
        first_column: 0,
        last_line: 1,
        last_column: 0
    };

    this.state = DEFAULT_STATE;
};

module.exports = new Lexer();
