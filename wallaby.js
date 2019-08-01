const babelConfig = require("./babel.config.js");

module.exports = function(wallaby) {
    const tests = [
        "test/*-spec.js",
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
    };
};
