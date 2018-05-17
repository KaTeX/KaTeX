/* global jest: false */
/* global expect: false */

import katex from "../katex";
import ParseError from "../src/ParseError";
import parseTree from "../src/parseTree";
import Warning from "./Warning";
import stringify from 'json-stable-stringify';
import {
    defaultSettings,
    _getBuilt, buildAndSetResult, parseAndSetResult, stripPositions,
} from "./helpers";

// Serializer support

const typeFirstCompare = (a, b) => {
    if (a.key === 'type') {
        return -1;
    } else if (b.key === 'type') {
        return 1;
    } else {
        return a.key < b.key ? -1 : 1;
    }
};

const serializer = {
    print(val) {
        return stringify(val, {cmp: typeFirstCompare, space: '  '});
    },
    test(val) {
        // Leave strings (e.g. XML) to other serializers
        return typeof val !== "string";
    },
};

expect.addSnapshotSerializer(serializer);

// Turn warnings into errors

global.console.warn = jest.fn((warning) => {
    throw new Warning(warning);
});

// Expect extensions

expect.extend({
    toParse: function(actual, settings = defaultSettings) {
        const result = {
            pass: true,
            message: () => "'" + actual + "' succeeded parsing",
        };
        parseAndSetResult(actual, result, settings);
        return result;
    },

    toNotParse: function(actual, settings = defaultSettings) {
        const result = {
            pass: false,
            message: () => "Expected '" + actual + "' to fail " +
                "parsing, but it succeeded",
        };

        try {
            parseTree(actual, settings);
        } catch (e) {
            if (e instanceof ParseError) {
                result.pass = true;
                result.message = () => "'" + actual + "' correctly " +
                    "didn't parse with error: " + e.message;
            } else {
                result.message = () => "'" + actual + "' failed " +
                    "parsing with unknown error: " + e.message;
            }
        }

        return result;
    },

    toFailWithParseError: function(actual, expected) {
        const prefix = "KaTeX parse error: ";
        try {
            parseTree(actual, defaultSettings);
            return {
                pass: false,
                message: () => "'" + actual + "' parsed without error",
            };
        } catch (e) {
            if (expected === undefined) {
                return {
                    pass: true,
                    message: () => "'" + actual + "' parsed with error",
                };
            }
            const msg = e.message;
            const exp = prefix + expected;
            if (msg === exp) {
                return {
                    pass: true,
                    message: () => "'" + actual + "'" +
                        " parsed with error '" + expected + "'",
                };
            } else if (msg.slice(0, 19) === prefix) {
                return {
                    pass: false,
                    message: () => "'" + actual + "'" +
                        " parsed with error '" + msg.slice(19) +
                        "' but expected '" + expected + "'",
                };
            } else {
                return {
                    pass: false,
                    message: () => "'" + actual + "'" +
                        " caused error '" + msg +
                        "' but expected '" + exp + "'",
                };
            }
        }
    },

    toBuild: function(actual, settings = defaultSettings) {
        const result = {
            pass: true,
            message: () => "'" + actual + "' succeeded in building",
        };

        expect(actual).toParse(settings);

        try {
            _getBuilt(actual, settings);
        } catch (e) {
            result.pass = false;
            if (e instanceof ParseError) {
                result.message = () => "'" + actual + "' failed to " +
                    "build with error: " + e.message;
            } else {
                result.message = () => "'" + actual + "' failed " +
                    "building with unknown error: " + e.message;
            }
        }

        return result;
    },

    toNotBuild: function(actual, settings = defaultSettings) {
        const result = {
            pass: false,
            message: () => "Expected '" + actual + "' to fail " +
                "building, but it succeeded",
        };

        try {
            _getBuilt(actual, settings);
        } catch (e) {
            if (e instanceof ParseError) {
                result.pass = true;
                result.message = () => "'" + actual + "' correctly " +
                    "didn't build with error: " + e.message;
            } else {
                result.message = () => "'" + actual + "' failed " +
                    "building with unknown error: " + e.message;
            }
        }

        return result;
    },

    toParseLike: function(actual, expected, settings = defaultSettings) {
        const result = {
            pass: true,
            message: () => "Parse trees of '" + actual +
                "' and '" + expected + "' are equivalent",
        };

        const actualTree = parseAndSetResult(actual, result, settings);
        if (!actualTree) {
            return result;
        }
        const expectedTree = parseAndSetResult(expected, result, settings);
        if (!expectedTree) {
            return result;
        }

        stripPositions(actualTree);
        stripPositions(expectedTree);

        if (JSON.stringify(actualTree) !== JSON.stringify(expectedTree)) {
            result.pass = false;
            result.message = () => "Parse trees of '" + actual +
                "' and '" + expected + "' are not equivalent";
        }
        return result;
    },

    toBuildLike: function(actual, expected, settings = defaultSettings) {
        const result = {
            pass: true,
            message: () => "Build trees of '" + actual +
                "' and '" + expected + "' are equivalent",
        };

        const actualTree = buildAndSetResult(actual, result, settings);
        if (!actualTree) {
            return result;
        }
        const expectedTree = buildAndSetResult(expected, result, settings);
        if (!expectedTree) {
            return result;
        }

        stripPositions(actualTree);
        stripPositions(expectedTree);

        if (JSON.stringify(actualTree) !== JSON.stringify(expectedTree)) {
            result.pass = false;
            result.message = () => "Parse trees of '" + actual +
                "' and '" + expected + "' are not equivalent";
        }
        return result;
    },

    toWarn: function(actual, settings = defaultSettings) {
        const result = {
            pass: false,
            message: () =>
                `Expected '${actual}' to generate a warning, but it succeeded`,
        };

        try {
            katex.__renderToDomTree(actual, settings);
        } catch (e) {
            if (e instanceof Warning) {
                result.pass = true;
                result.message = () =>
                    `'${actual}' correctly generated warning: ${e.message}`;
            } else {
                result.message = () =>
                    `'${actual}' failed building with unknown error: ${e.message}`;
            }
        }

        return result;
    },
});
