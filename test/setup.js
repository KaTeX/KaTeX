/* global jest: false */
/* global expect: false */

import katex from "../katex";
import Settings from "../src/Settings";
import Warning from "./Warning";
import stringify from 'json-stable-stringify';

// Serializer support

const typeFirstCompare = (a, b) => {
    if (a.key === 'type') {
        return -1;
    } else if (b.key === 'type') {
        return 1;
    } else {
        return a.key < b.key ? -1 : 1;
    }
};

const serializer = {
    print(val) {
        return stringify(val, {cmp: typeFirstCompare, space: '  '});
    },
    test() {
        return true;
    },
};

expect.addSnapshotSerializer(serializer);

// Turn warnings into errors

global.console.warn = jest.fn((warning) => {
    throw new Warning(warning);
});

const defaultSettings = new Settings({
    strict: false, // enable dealing with warnings only when needed
});

// Expect extensions

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
