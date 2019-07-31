const babelConfig = require("./babel.config.js");

module.exports = function(wallaby) {
    const tests = [
        // "test/*-spec.js",
        "contrib/**/test/*-spec.js",
    ];

    return {
        tests,

        // Wallaby needs to know about all files that may be loaded because
        // of running a test.
        files: [
            "src/**/*.js",
            "test/**/*.js",
            "contrib/**/*.js",
            "submodules/**/*.js",
            "katex.js",

            // These paths are excluded.
            ...tests.map((test) => `!${test}`),
        ],

        // Wallaby does its own compilation of .js files to support its
        // advanced logging features.  Wallaby can't parse the flow and
        // JSX in our source files so need to provide a babel configuration.
        compilers: {
            "**/*.js": wallaby.compilers.babel(babelConfig),
        },

        env: {
            type: "node",
            runner: "node",
        },

        testFramework: "jest",

        // setup: function(wallaby) {
        //     // We require "path" here because this setup function is run
        //     // in a different context and does not have access to variables
        //     // from its closure.
        //     const path = require("path");

        //     const jestConfig = {
        //         collectCoverageFrom: [
        //             "src/**/*.js",
        //             "contrib/**/*.js",
        //             "!src/unicodeMake.js",
        //             "!contrib/mhchem/**",
        //         ],
        //         setupFilesAfterEnv: [
        //             path.join(wallaby.localProjectDir, "test/setup.js"),
        //         ],
        //         snapshotSerializers: [
        //             "jest-serializer-html",
        //         ],
        //         testMatch: [
        //             "**/test/*-spec.js",
        //         ],
        //         testURL: "http://localhost/",
        //         // Prevent our jest configuration from re-compiling the files
        //         // since wallaby has already done that.
        //         transform: {
        //             "^.+\\.js$": "babel-jest",
        //         },
        //         moduleNameMapper: {
        //             "^katex$": "<rootDir>/katex.js",
        //         },
        //     };

        //     wallaby.testFramework.configure(jestConfig);
        // },

        // Uncomment to only run tests for files that have been changed.
        // Coverage reports on http://wallabyjs.com/app will be incomplete
        // but initial start will be faster.
        // automaticTestFileSelection: false,

        // Uncomment to only run tests/suites using .only().
        // Coverage reports on http://wallabyjs.com/app will be incomplete
        // but initial start will be faster.
        // runSelectedTestsOnly: true,

        // Uncomment to get additional debug information in the wallaby
        // console when running testts.
        // debug: true,
    };
};
