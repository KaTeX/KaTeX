/**
 * This is a module for storing settings passed into KaTeX. It correctly handles
 * default settings.
 */

const utils = require("./utils");

/**
 * The main Settings object
 *
 * The current options stored are:
 *  - displayMode: Whether the expression should be typeset by default in
 *                 textstyle or displaystyle (default false)
 */
function Settings(options) {
    // allow null options
    options = options || {};
    this.displayMode = utils.deflt(options.displayMode, false);
    this.throwOnError = utils.deflt(options.throwOnError, true);
    this.errorColor = utils.deflt(options.errorColor, "#cc0000");
    this.macros = options.macros || {};
}

module.exports = Settings;
