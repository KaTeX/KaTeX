// modules implementing an extension should require this module and push their
// extension on exts.

var functions = require("./functions");
var buildTree = require("./buildTree");

var extensions = [];

/**
 * Registers an extension by copy entries to functions.funcs and
 * buildTree.groupTypes.
 *
 * @param extension
 */
function register(extension) {
    // copy functions from the extension into the global "functions" dictionary
    Object.keys(extension.funcs).forEach(function (funcName) {
        if (!functions.hasOwnProperty(funcName)) {
            functions.funcs[funcName] = extension.funcs[funcName];
        } else {
            throw Error("extension tried to overwrite existing function");
        }
    });

    Object.keys(extension.groupTypes).forEach(function (groupName) {
        if (!buildTree.groupTypes.hasOwnProperty(groupName)) {
            buildTree.groupTypes[groupName] = extension.groupTypes[groupName];
        }
    });

    extensions.push(extension);
}

module.exports = {
    exts: extensions,
    register: register
};
