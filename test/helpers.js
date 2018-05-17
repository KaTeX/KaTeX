/* global expect: false */

import katex from "../katex";
import ParseError from "../src/ParseError";
import parseTree from "../src/parseTree";
import Settings from "../src/Settings";

export const defaultSettings = new Settings({
    strict: false, // deal with warnings only when desired
});
export const strictSettings = new Settings({strict: true});

export const _getBuilt = function(expr, settings = defaultSettings) {
    const rootNode = katex.__renderToDomTree(expr, settings);

    if (rootNode.classes.indexOf('katex-error') >= 0) {
        return rootNode;
    }

    // grab the root node of the HTML rendering
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
export const getBuilt = function(expr, settings = defaultSettings) {
    expect(expr).toBuild(settings);
    return _getBuilt(expr, settings);
};

/**
 * Return the root node of the parse tree.
 * @param expr
 * @param settings
 * @returns {Object}
 */
export const getParsed = function(expr, settings = defaultSettings) {
    expect(expr).toParse(settings);
    return parseTree(expr, settings);
};

export const stripPositions = function(expr) {
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

export const parseAndSetResult = function(expr, result,
                                          settings = defaultSettings) {
    try {
        return parseTree(expr, settings);
    } catch (e) {
        result.pass = false;
        if (e instanceof ParseError) {
            result.message = () => "'" + expr + "' failed " +
                "parsing with error: " + e.message;
        } else {
            result.message = () => "'" + expr + "' failed " +
                "parsing with unknown error: " + e.message;
        }
    }
};

export const buildAndSetResult = function(expr, result,
                                          settings = defaultSettings) {
    try {
        return _getBuilt(expr, settings);
    } catch (e) {
        result.pass = false;
        if (e instanceof ParseError) {
            result.message = () => "'" + expr + "' failed " +
                "building with error: " + e.message;
        } else {
            result.message = () => "'" + expr + "' failed " +
                "building with unknown error: " + e.message;
        }
    }
};
