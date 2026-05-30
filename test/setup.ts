import stringify from 'json-stable-stringify';
import Lexer from "../src/Lexer";
import ParseError from "../src/ParseError";
import {
    Mode, ConsoleWarning,
    expectKaTeX, expectEquivalent,
} from "./helpers";

// JSON serializer

const typeFirstCompare = (a: {key: string}, b: {key: string}) => {
    if (a.key === 'type') {
        return -1;
    } else if (b.key === 'type') {
        return 1;
    } else {
        return a.key < b.key ? -1 : 1;
    }
};

const replacer = (key: string, value: unknown) => {
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
    print(val: unknown) {
        return stringify(val, {
            cmp: typeFirstCompare,
            space: '  ',
            replacer: replacer,
        });
    },
    test(val: unknown) {
        // Leave strings (e.g. XML) to other serializers
        return typeof val !== "string";
    },
};

expect.addSnapshotSerializer(serializer);

// Mock console.warn to throw an error
global.console.warn = (x: unknown) => { throw new ConsoleWarning(String(x)); };

// Expect extensions

expect.extend({
    toParse(this: {isNot: boolean}, expr: unknown, settings?: unknown) {
        return expectKaTeX(expr, settings, Mode.PARSE, this.isNot);
    },

    toFailWithParseError: function(
        this: {isNot: boolean},
        expr: unknown,
        expected: unknown = ParseError,
        settings?: unknown,
    ) {
        return expectKaTeX(expr, settings, Mode.PARSE, this.isNot, expected);
    },

    toBuild(this: {isNot: boolean}, expr: unknown, settings?: unknown) {
        return expectKaTeX(expr, settings, Mode.BUILD, this.isNot);
    },

    toWarn(this: {isNot: boolean}, expr: unknown, settings?: unknown) {
        return expectKaTeX(expr, settings, Mode.BUILD, this.isNot, ConsoleWarning);
    },

    toParseLike(this: {expand: boolean}, expr: unknown, expected: unknown, settings?: unknown) {
        return expectEquivalent(expr, expected, settings, Mode.PARSE, this.expand);
    },

    toBuildLike(this: {expand: boolean}, expr: unknown, expected: unknown, settings?: unknown) {
        return expectEquivalent(expr, expected, settings, Mode.BUILD, this.expand);
    },
});
