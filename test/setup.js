/* global jest: false */
/* global expect: false */

import katex from "../katex";
import Settings from "../src/Settings";
import Warning from "./Warning";

global.console.warn = jest.fn((warning) => {
    throw new Warning(warning);
});

const defaultSettings = new Settings({
    strict: false, // enable dealing with warnings only when needed
});

expect.extend({
    toWarn: function(actual, settings) {
        const usedSettings = settings ? settings : defaultSettings;

        const result = {
            pass: false,
            message: () =>
                `Expected '${actual}' to generate a warning, but it succeeded`,
        };

        try {
            katex.__renderToDomTree(actual, usedSettings);
        } catch (e) {
            if (e instanceof Warning) {
                result.pass = true;
                result.message = () =>
                    `'${actual}' correctly generated warning: ${e.message}`;
            } else {
                result.message = () =>
                    `'${actual}' failed building with unknown error: ${e.message}`;
            }
        }

        return result;
    },
});
