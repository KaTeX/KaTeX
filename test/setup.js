import stringify from 'json-stable-stringify';
import Lexer from "../src/Lexer";
import ParseError from "../src/ParseError";
import {
    Mode, ConsoleWarning,
    expectKaTeX, expectEquivalent,
} from "./helpers";

// JSON serializer

const typeFirstCompare = (a, b) => {
    if (a.key === 'type') {
        return -1;
    } else if (b.key === 'type') {
        return 1;
    } else {
        return a.key < b.key ? -1 : 1;
    }
};

const replacer = (key, value) => {
    if (value instanceof Lexer) {
        return {
            input: value.input,
            // omit value.settings
            lastIndex: value.tokenRegex.lastIndex,
        };
    } else {
        return value;
    }
};

const serializer = {
    print(val) {
        return stringify(val, {
            cmp: typeFirstCompare,
            space: '  ',
            replacer: replacer,
        });
    },
    test(val) {
        // Leave strings (e.g. XML) to other serializers
        return typeof val !== "string";
    },
};

expect.addSnapshotSerializer(serializer);

// Mock console.warn to throw an error
global.console.warn = x => { throw new ConsoleWarning(x); };

// Expect extensions

expect.extend({
    toParse(expr, settings) {
        return expectKaTeX(expr, settings, Mode.PARSE, this.isNot);
    },

    toFailWithParseError: function(expr, expected = ParseError) {
        return expectKaTeX(expr, undefined, Mode.PARSE, this.isNot, expected);
    },

    toBuild(expr, settings) {
        return expectKaTeX(expr, settings, Mode.BUILD, this.isNot);
    },

    toWarn(expr, settings) {
        return expectKaTeX(expr, settings, Mode.BUILD, this.isNot, ConsoleWarning);
    },

    toParseLike(expr, expected, settings) {
        return expectEquivalent(expr, expected, settings, Mode.PARSE, this.expand);
    },

    toBuildLike(expr, expected, settings) {
        return expectEquivalent(expr, expected, settings, Mode.BUILD, this.expand);
    },
});
