/* global expect: false */

import stringify from 'json-stable-stringify';
import {
    Mode,
    expectKaTeX, expectEquivalent, expectToWarn,
} from "./helpers";

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
    test(val) {
        // Leave strings (e.g. XML) to other serializers
        return typeof val !== "string";
    },
};

expect.addSnapshotSerializer(serializer);

// Expect extensions

expect.extend({
    toHavePassed: result => result,

    toParse(expr, settings) {
        return expectKaTeX(expr, settings, Mode.PARSE, this.isNot);
    },

    toFailWithParseError: function(expr, expected) {
        const result = expectKaTeX(expr, undefined, Mode.PARSE, !this.isNot,
                                   expected);
        result.pass = !result.pass; // expectKaTeX.pass is true if succeeded
        return result;
    },

    toBuild(expr, settings) {
        return expectKaTeX(expr, settings, Mode.BUILD, this.isNot);
    },

    toParseLike(expr, expected, settings) {
        return expectEquivalent(expr, expected, settings, Mode.PARSE, this.expand);
    },

    toBuildLike(expr, expected, settings) {
        return expectEquivalent(expr, expected, settings, Mode.BUILD, this.expand);
    },

    toWarn: (expr, settings) => expectToWarn(expr, settings),
});
