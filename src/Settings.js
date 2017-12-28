// @flow
/**
 * This is a module for storing settings passed into KaTeX. It correctly handles
 * default settings.
 */

import utils from "./utils";

import type { MacroMap } from "./macros";

export type SettingsOptions = {
    displayMode?: boolean;
    throwOnError?: boolean;
    errorColor?: string;
    macros?: MacroMap;
    colorIsTextColor?: boolean;
    maxSize?: number;
};

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
    displayMode: boolean;
    throwOnError: boolean;
    errorColor: string;
    macros: MacroMap;
    colorIsTextColor: boolean;
    maxSize: number;

    constructor(options: SettingsOptions) {
        // allow null options
        options = options || {};
        this.displayMode = utils.deflt(options.displayMode, false);
        this.throwOnError = utils.deflt(options.throwOnError, true);
        this.errorColor = utils.deflt(options.errorColor, "#cc0000");
        this.macros = options.macros || {};
        this.colorIsTextColor = utils.deflt(options.colorIsTextColor, false);
        this.maxSize = Math.max(0, utils.deflt(options.maxSize, Infinity));
    }
}

export default Settings;
