const Options = require("./Options");
const Style = require("./Style");

/**
 * This is a module for storing settings passed into KaTeX. It correctly handles
 * default settings.
 */

const utils = require("./utils");

/**
 * The main Settings object
 *
 * The current options stored are:
 *  - displayMode: Whether the expression should be typeset as inline math
 *                 (false, the default), meaning that the math starts in
 *                 \textstyle and is placed in an inline-block); or as display
 *                 math (true), meaning that the math starts in \displaystyle
 *                 and is placed in a block with vertical margin.
 */
function Settings(options) {
    // allow null options
    options = options || {};
    this.displayMode = utils.deflt(options.displayMode, false);
    this.throwOnError = utils.deflt(options.throwOnError, true);
    this.errorColor = utils.deflt(options.errorColor, "#cc0000");
    this.macros = options.macros || {};
    this.colorIsTextColor = utils.deflt(options.colorIsTextColor, false);
}

Settings.prototype.initialOptions = function() {
    let startStyle = Style.TEXT;
    if (this.displayMode) {
        startStyle = Style.DISPLAY;
    }

    // Setup the default options
    const options = new Options({
        style: startStyle,
        size: "size5",
    });

    return options;
};

module.exports = Settings;
