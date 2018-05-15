// @flow
/* eslint no-console:0 */
/**
 * This is a module for storing settings passed into KaTeX. It correctly handles
 * default settings.
 */

import utils from "./utils";
import ParseError from "./ParseError.js";
import ParseNode from "./ParseNode";
import {Token} from "./Token";

import type { MacroMap } from "./macros";

export type StrictFunction =
    (errorCode: string, errorMsg: string, token?: Token | ParseNode<*>) =>
    ?(boolean | string);

export type SettingsOptions = {
    displayMode?: boolean;
    throwOnError?: boolean;
    errorColor?: string;
    macros?: MacroMap;
    colorIsTextColor?: boolean;
    strict?: boolean | "ignore" | "warn" | "error" | StrictFunction;
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
    strict: boolean | "ignore" | "warn" | "error" | StrictFunction;
    maxSize: number;

    constructor(options: SettingsOptions) {
        // allow null options
        options = options || {};
        this.displayMode = utils.deflt(options.displayMode, false);
        this.throwOnError = utils.deflt(options.throwOnError, true);
        this.errorColor = utils.deflt(options.errorColor, "#cc0000");
        this.macros = options.macros || {};
        this.colorIsTextColor = utils.deflt(options.colorIsTextColor, false);
        this.strict = utils.deflt(options.strict, "warn");
        this.maxSize = Math.max(0, utils.deflt(options.maxSize, Infinity));
    }

    /**
     * Report nonstrict (non-LaTeX-compatible) input.
     * Can safely not be called if `this.strict` is false in JavaScript.
     */
    nonstrict(errorCode: string, errorMsg: string, token?: Token | ParseNode<*>) {
        let strict = this.strict;
        if (typeof strict === "function") {
            // Allow return value of strict function to be boolean or string
            // (or null/undefined, meaning no further processing).
            strict = strict(errorCode, errorMsg, token);
        }
        if (!strict || strict === "ignore") {
            return;
        } else if (strict === true || strict === "error") {
            throw new ParseError(
                "LaTeX-incompatible input and strict mode is set to 'error': " +
                `${errorMsg} [${errorCode}]`, token);
        } else if (strict === "warn") {
            typeof console !== "undefined" && console.warn(
                "LaTeX-incompatible input and strict mode is set to 'warn': " +
                `${errorMsg} [${errorCode}]`);
        } else {  // won't happen in type-safe code
            typeof console !== "undefined" && console.warn(
                "LaTeX-incompatible input and strict mode is set to " +
                `unrecognized '${strict}': ${errorMsg} [${errorCode}]`);
        }
    }
}

export default Settings;
