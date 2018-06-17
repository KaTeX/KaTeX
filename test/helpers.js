/* global expect: false */
/* global jest: false */

import katex from "../katex";
import ParseError from "../src/ParseError";
import parseTree from "../src/parseTree";
import Settings from "../src/Settings";

import diff from 'jest-diff';
import {RECEIVED_COLOR, printReceived, printExpected} from 'jest-matcher-utils';
import {formatStackTrace, separateMessageFromStack} from 'jest-message-util';

/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This function is from https://github.com/facebook/jest/blob/9867e16e518d50c79
 * 492f7f0d2bc1ef8dff37db4/packages/expect/src/to_throw_matchers.js and licensed
 * under the MIT license found in the https://github.com/facebook/jest/blob/master/LICENSE.
 */
const printActualErrorMessage = error => {
    if (error) {
        const {message, stack} = separateMessageFromStack(error.stack);
        return (
            `Instead, it threw:\n` +
            RECEIVED_COLOR(
                `  ${message}` +
                formatStackTrace(
                    // remove KaTeX internal stack entries
                    stack.split('\n')
                        .filter(line => line.indexOf('new ParseError') === -1)
                        .join('\n'),
                    {
                        rootDir: process.cwd(),
                        testMatch: [],
                    },
                    {
                        noStackTrace: false,
                    },
                ),
            )
        );
    }
    return `But it didn't throw anything.`;
};

export const nonstrictSettings = new Settings({strict: false});
export const strictSettings = new Settings({strict: true});

const _getBuilt = (expr, settings) => {
    let rootNode = katex.__renderToDomTree(expr, settings);

    if (rootNode.classes.indexOf('katex-error') >= 0) {
        return rootNode;
    }

    if (rootNode.classes.indexOf('katex-display') >= 0) {
        rootNode = rootNode.children[0];
    }

    // grab the root node of the HTML rendering
    // rootNode.children[0] is the MathML rendering
    const builtHTML = rootNode.children[1];

    // combine the non-strut children of all base spans
    const children = [];
    for (let i = 0; i < builtHTML.children.length; i++) {
        children.push(...builtHTML.children[i].children.filter(
            (node) => node.classes.indexOf("strut") < 0));
    }
    return children;
};

/**
 * Return the root node of the rendered HTML.
 * @param expr
 * @param settings
 * @returns {Object}
 */
export const getBuilt = (expr, settings) => getTree(expr, settings, Mode.BUILD);

/**
 * Return the root node of the parse tree.
 * @param expr
 * @param settings
 * @returns {Object}
 */
export const getParsed = (expr, settings) => getTree(expr, settings, Mode.PARSE);

export const stripPositions = expr => {
    if (typeof expr !== "object" || expr === null) {
        return expr;
    }
    if (expr.loc && expr.loc.lexer && typeof expr.loc.start === "number") {
        delete expr.loc;
    }
    Object.keys(expr).forEach(function(key) {
        stripPositions(expr[key]);
    });
    return expr;
};

export const Mode = {
    PARSE: {
        apply: parseTree,
        get: getParsed,
        noun: 'parsing',
        Verb: 'Parse',
    },
    BUILD: {
        apply: _getBuilt,
        get: getBuilt,
        noun: 'building',
        Verb: 'Build',
    },
};

const getTree = (expr, settings, mode) => {
    const result = expectKaTeX(expr, settings, mode);
    try {
        expect(result).toHavePassed();
    } catch (e) {
        Error.captureStackTrace(e, mode.get); // remove helpers in stack entries
        throw e;
    }
    return result._tree;
};

export const expectKaTeX = (expr, settings = new Settings(), mode,
                            expectFail, expected) => {
    let pass = true; // whether succeeded
    let _tree;
    let error;
    try {
        _tree = mode.apply(expr, settings);
    } catch (e) {
        error = e;
        if (e instanceof ParseError) {
            pass = expected !== undefined &&
                e.message !== `KaTeX parse error: ${expected}`;
        } else {
            pass = !!expectFail; // always fail if error is not ParserError
        }
    }

    return {
        pass,
        message: expectFail
            ? () =>
                `Expected the expression to fail ${mode.noun} with ParseError` +
                (expected ? ` matching ${printExpected(expected)}` : '') +
                `:\n  ${printReceived(expr)}\n` +
                printActualErrorMessage(error)
            : () =>
                `Expected the expression to ` + (expected
                    ? `not throw ParserError matching ${printExpected(expected)}`
                    : `success ${mode.noun}`) +
                `:\n  ${printReceived(expr)}\n` +
                printActualErrorMessage(error),
        _tree, // jest allows the return value of matcher to have custom properties
    };
};

export const expectEquivalent = (actual, expected, settings, mode, expand) => {
    const actualTree = getTree(actual, settings, mode);
    const expectedTree = getTree(expected, settings, mode);
    const pass = JSON.stringify(stripPositions(actualTree)) ===
        JSON.stringify(stripPositions(expectedTree));

    return {
        pass,
        message: pass
            ? () =>
                `${mode.Verb} trees of ${printReceived(actual)} and ` +
                `${printExpected(expected)} are equivalent`
            : () => {
                const diffString = diff(expectedTree, actualTree, {
                    expand,
                });

                return `${mode.Verb} trees of ${printReceived(actual)} and ` +
                `${printExpected(expected)} are not equivalent` +
                (diffString ? `:\n\n${diffString}` : '');
            },
    };
};

export const expectToWarn = (expr, settings) => {
    const oldConsoleWarn = global.console.warn;
    const mockConsoleWarn = jest.fn();

    global.console.warn = mockConsoleWarn;
    expect(expr).toBuild(settings);
    global.console.warn = oldConsoleWarn;
    const length = mockConsoleWarn.mock.calls.length;

    return {
        pass: length > 0,
        message: length > 0
            ? () => {
                let warnings = '';
                for (let i = 0; i < length; i++) {
                    warnings += `  ${mockConsoleWarn.mock.calls[i][0]}`;
                    if (i !== length - 1) {
                        warnings += '\n';
                    }
                }

                return `Expected the expression to not generate a warning:\n` +
                    `  ${printReceived(expr)}\n` +
                    `Instead, it generated:\n` +
                    RECEIVED_COLOR(warnings);
            }
            : () =>
                `Expected the expression to generate a warning:\n` +
                `  ${printReceived(expr)}\n` +
                `But it didn't generate any warning.`,
    };
};
