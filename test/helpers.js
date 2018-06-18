/* global expect: false */

import katex from "../katex";
import ParseError from "../src/ParseError";
import parseTree from "../src/parseTree";
import Settings from "../src/Settings";

import diff from 'jest-diff';
import {RECEIVED_COLOR, printReceived, printExpected} from 'jest-matcher-utils';
import {formatStackTrace, separateMessageFromStack} from 'jest-message-util';

export function ConsoleWarning(message) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
}
Object.setPrototypeOf(ConsoleWarning.prototype, Error.prototype);

/**
 * Return the first raw string if x is tagged literal. Otherwise return x.
 */
export const r = x => x != null && x.hasOwnProperty('raw') ? x.raw[0] : x;

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
            'Instead, it threw:\n' +
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
    return 'But it didn\'t throw anything.';
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

export const expectKaTeX = (expr, settings = new Settings(), mode, isNot,
                            expectedError) => {
    expr = r(expr); // support tagging literals
    let pass = expectedError == null;
    let _tree;
    let error;
    try {
        _tree = mode.apply(expr, settings);
    } catch (e) {
        error = e;
        if (e instanceof ParseError) {
            pass = expectedError === ParseError || (typeof expectedError ===
                "string" && e.message === `KaTeX parse error: ${expectedError}`);
        } else if (e instanceof ConsoleWarning) {
            pass = expectedError === ConsoleWarning;
        } else {
            pass = !!isNot; // always fail
        }
    }

    let expected;
    if (expectedError == null) {
        expected = (isNot ? 'fail ' : 'success ') + mode.noun;
    } else {
        expected = (isNot ? 'not throw a ' : `fail ${mode.noun} with a `) +
            (expectedError.name || `ParseError matching "${expectedError}"`);
    }
    return {
        pass,
        message: () => 'Expected the expression to ' + expected +
            `:\n  ${printReceived(expr)}\n` +
            printActualErrorMessage(error),
        _tree, // jest allows the return value of matcher to have custom properties
    };
};

export const expectEquivalent = (actual, expected, settings, mode, expand) => {
    const actualTree = stripPositions(getTree(actual, settings, mode));
    const expectedTree = stripPositions(getTree(expected, settings, mode));
    const pass = JSON.stringify(actualTree) === JSON.stringify(expectedTree);

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
