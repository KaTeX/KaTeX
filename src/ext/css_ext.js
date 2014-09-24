var Token = require("./../Token");
var ParseError = require("./../ParseError");
var Parser = require("./../Parser");
var buildTree = require("./../buildTree");
var buildCommon = require("./../buildCommon");

var ParseNode = Parser.ParseNode;
var ParseResult = Parser.ParseResult;
var ParseFuncOrArgument = Parser.ParseFuncOrArgument;
var buildExpression = buildTree.buildExpression;

var cssIdRegex = /^([a-z\-\_][a-z0-9\-\_]*)/i;
var whitespaceRegex = /^\s*/;

var CssExtension = {
    // TODO: make "modes" a list of mode objects which this extension provides
    // each "mode" object contains a lexer and a parseSpecialGroup parser
    mode: "css", // used for both \class and \cssId
    lexer: function (pos) {
        var input = this._input.slice(pos);

        // Ignore whitespace
        var whitespace = input.match(whitespaceRegex)[0];
        pos += whitespace.length;
        input = input.slice(whitespace.length);

        var match;
        if ((match = input.match(cssIdRegex))) {
            return new Token("cssId", match[0], pos + match[0].length);
        } else {
            throw new ParseError("Invalid id", this, pos);
        }
    },
    // Note: mode = argType
    parseSpecialGroup: function (pos, mode, outerMode) {
        var openBrace = this.lexer.lex(pos, outerMode);
        this.expect(openBrace, "{");
        var inner = this.lexer.lex(openBrace.position, mode);
        var closeBrace = this.lexer.lex(inner.position, outerMode);
        this.expect(closeBrace, "}");
        return new ParseFuncOrArgument(
            new ParseResult(
                new ParseNode("color", inner.text, outerMode),
                closeBrace.position),
            false);
    },
    funcs: {
        "\\cssId": {
            numArgs: 2,
            argTypes: ["css", "original"],
            handler: function(func, id, body) {
                // Normalize the different kinds of bodies (see \text above)
                var inner;
                if (body.type === "ordgroup") {
                    inner = body.value;
                } else {
                    inner = [body];
                }

                return {
                    type: "cssId",
                    id: id.value,
                    value: inner
                };
            }
        },
        "\\class": {
            numArgs: 2,
            argTypes: ["css", "original"],
            handler: function(func, id, body) {
                // Normalize the different kinds of bodies (see \text above)
                var inner;
                if (body.type === "ordgroup") {
                    inner = body.value;
                } else {
                    inner = [body];
                }

                return {
                    type: "class",
                    className: id.value,
                    value: inner
                };
            }
        }
    },
    groupTypes: {
        cssId: function(group, options, prev) {
            var elements = buildExpression(
                group.value.value,
                options,
                prev
            );

            if (elements.length === 1) {
                elements[0].id = group.value.id;
                return elements[0];
            } else {
                var classes = [];
                if (elements.length > 1) {
                    var lastChild = elements[elements.length - 1];
                    classes = lastChild.classes.slice(0);
                }
                classes.push(options.style.cls());
                return buildCommon.makeSpanWithId(classes, elements, group.value.id);
            }
        },
        "class": function(group, options, prev) {
            var elements = buildExpression(
                group.value.value,
                options,
                prev
            );

            if (elements.length === 1) {
                elements[0].classes.push(group.value.className);
                return elements[0];
            } else {
                var classes = [];
                if (elements.length > 1) {
                    var lastChild = elements[elements.length - 1];
                    classes = lastChild.classes.slice(0);
                }
                classes.push(options.style.cls());
                classes.push(group.value.className);
                return buildCommon.makeSpan(classes, elements);
            }
        }
    }
};

module.exports = CssExtension;
