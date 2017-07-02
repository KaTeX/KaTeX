/**
 * This is a module for storing settings passed into KaTeX. It correctly handles
 * default settings.
 */

import utils from "./utils";

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
class Settings {
    constructor(options) {
        // allow null options
        options = options || {};
        this.displayMode = utils.deflt(options.displayMode, false);
        this.throwOnError = utils.deflt(options.throwOnError, true);
        this.errorColor = utils.deflt(options.errorColor, "#cc0000");
        this.macros = options.macros || {};
        this.colorIsTextColor = utils.deflt(options.colorIsTextColor, false);
    }
}

module.exports = Settings;
