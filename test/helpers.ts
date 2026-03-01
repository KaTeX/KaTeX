import katex from "../katex";
import ParseError from "../src/ParseError";
import parseTree from "../src/parseTree";
import Settings from "../src/Settings";

import {diff} from 'jest-diff';
import {RECEIVED_COLOR, printReceived, printExpected} from 'jest-matcher-utils';
import {formatStackTrace, separateMessageFromStack} from 'jest-message-util';

export class ConsoleWarning extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ConsoleWarning";
    }
}

/**
 * Return the first raw string if x is tagged literal. Otherwise return x.
 */
export const r = (x: any): any =>
    x != null && Object.prototype.hasOwnProperty.call(x, 'raw')
    ? (x as {raw: string[]}).raw[0] : x;

/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This function is from https://github.com/facebook/jest/blob/9867e16e518d50c79
 * 492f7f0d2bc1ef8dff37db4/packages/expect/src/to_throw_matchers.js and licensed
 * under the MIT license found in the https://github.com/facebook/jest/blob/master/LICENSE.
 */
const printActualErrorMessage = (error: any) => {
    if (error) {
        const {message, stack} = separateMessageFromStack(error.stack);
        return (
            'Instead, it threw:\n' +
            /* eslint-disable-next-line new-cap */
            RECEIVED_COLOR(
                `  ${message}` +
                formatStackTrace(
                    // remove KaTeX internal stack entries
                    stack.split('\n')
                        .filter((line: string) => !line.includes('new ParseError'))
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

const printExpectedResult = (mode: any, isNot: any, expectedError: any) => expectedError == null
    ? (isNot ? 'fail ' : 'success ') + mode
    : (isNot ? 'not throw a ' : `fail ${mode} with a `) +
        (expectedError.name || `ParseError matching "${expectedError}"`);

export const nonstrictSettings = new Settings({strict: false});
export const strictSettings = new Settings({strict: true});
export const trustSettings = new Settings({trust: true});

/**
 * Return the root node of the rendered HTML.
 * @param expr
 * @param settings
 * @returns {Object}
 */
export function getBuilt(expr: any, settings: any = new Settings()): any {
    expr = r(expr); // support tagging literals
    let rootNode: any = katex.__renderToDomTree(expr, settings);

    if (rootNode.classes.includes('katex-error')) {
        return rootNode;
    }

    if (rootNode.classes.includes('katex-display')) {
        rootNode = rootNode.children[0];
    }

    // grab the root node of the HTML rendering
    // rootNode.children[0] is the MathML rendering
    const builtHTML: any = rootNode.children[1];

    // combine the non-strut children of all base spans
    const children = [];
    for (let i = 0; i < builtHTML.children.length; i++) {
        children.push(...builtHTML.children[i].children.filter(
            (node: {classes: string[]}) => !node.classes.includes("strut")));
    }
    return children;
}

/**
 * Return the root node of the parse tree.
 * @param expr
 * @param settings
 * @returns {Object}
 */
export function getParsed(expr: any, settings: any = new Settings()): any {
    expr = r(expr); // support tagging literals
    return parseTree(expr, settings);
}

export const stripPositions = (expr: any): any => {
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
        apply: getParsed,
        noun: 'parsing',
        Verb: 'Parse',
    },
    BUILD: {
        apply: getBuilt,
        noun: 'building',
        Verb: 'Build',
    },
};

export const expectKaTeX = (expr: any, settings?: any, mode?: any, isNot?: any, expectedError?: any) => {
    let pass = expectedError == null;
    let error: unknown;
    try {
        mode.apply(expr, settings);
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
    return {
        pass,
        message: () => 'Expected the expression to ' +
            printExpectedResult(mode.noun, isNot, expectedError) +
            `:\n  ${printReceived(r(expr))}\n` +
            printActualErrorMessage(error),
    };
};

export const expectEquivalent = (actual: any, expected: any, settings: any, mode: any, expand: any) => {
    const actualTree = stripPositions(mode.apply(actual, settings));
    const expectedTree = stripPositions(mode.apply(expected, settings));
    const pass = JSON.stringify(actualTree) === JSON.stringify(expectedTree);

    return {
        pass,
        message: pass
            ? () =>
                `${mode.Verb} trees of ${printReceived(r(actual))} and ` +
                `${printExpected(r(expected))} are equivalent`
            : () => {
                const diffString = diff(expectedTree, actualTree, {
                    expand,
                });

                return `${mode.Verb} trees of ${printReceived(r(actual))} and ` +
                `${printExpected(r(expected))} are not equivalent` +
                (diffString ? `:\n\n${diffString}` : '');
            },
    };
};
