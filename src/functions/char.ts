import defineFunction from "../defineFunction";
import ParseError from "../ParseError";
import {assertCharacterGroup, assertNodeType} from "../parseNode";

// A code point inside the Unicode codespace is not necessarily one the output
// may contain.  Of those rejected below, the C0 controls, the surrogates and
// U+FFFE/U+FFFF are outside XML's Char production, so emitting one would make
// the MathML ill-formed; the rest are legal XML but are HTML parse errors.
const isForbiddenInOutput = (code: number): boolean =>
    // C0 controls; form feed is not exempted because it is not valid XML
    (code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) ||
    // DEL and the C1 controls
    (code >= 0x7f && code <= 0x9f) ||
    // surrogates
    (code >= 0xd800 && code <= 0xdfff) ||
    // noncharacters; the second test covers U+nFFFE and U+nFFFF in any plane
    (code >= 0xfdd0 && code <= 0xfdef) ||
    (code & 0xfffe) === 0xfffe;

// \@char is an internal function that takes a grouped decimal argument like
// {123} and converts into symbol with code 123.  It is used by the *macro*
// \char defined in macros.js.
defineFunction({
    type: "textord",
    names: ["\\@char"],
    numArgs: 1,
    allowedInText: true,

    handler({parser}, args) {
        const arg = assertNodeType(args[0], "ordgroup");
        const number = assertCharacterGroup(
            arg, "\\@char has non-numeric argument");
        let code = parseInt(number);
        let text;
        if (isNaN(code)) {
            throw new ParseError(`\\@char has non-numeric argument ${number}`);
        // If we drop IE support, the following code could be replaced with
        // text = String.fromCodePoint(code)
        } else if (code < 0 || code > 0x10ffff) {
            throw new ParseError(`\\@char with invalid code point ${number}`);
        } else if (isForbiddenInOutput(code)) {
            throw new ParseError(
                `\\@char code point ${number} is not allowed in the output`);
        } else if (code <= 0xffff) {
            text = String.fromCharCode(code);
        } else { // Astral code point; split into surrogate halves
            code -= 0x10000;
            text = String.fromCharCode((code >> 10) + 0xd800,
                                       (code & 0x3ff) + 0xdc00);
        }
        return {
            type: "textord",
            mode: parser.mode,
            text: text,
        };
    },
});
