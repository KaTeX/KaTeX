const babelConfig = require("./babel.config.js");

module.exports = function(wallaby) {
    const tests = [
        "test/*-spec.ts",
        "contrib/**/test/*-spec.ts",
    ];

    return {
        tests,

        // Wallaby needs to know about all files that may be loaded because
        // of running a test.
        files: [
            "src/**/*.js",
            "src/**/*.ts",
            "test/**/*.ts",
            "contrib/**/*.js",
            "contrib/**/*.ts",
            "katex.ts",

            // These paths are excluded.
            ...tests.map((test) => `!${test}`),
        ],

        // Wallaby does its own compilation of .js files to support its
        // advanced logging features.  Wallaby can't parse the flow and
        // JSX in our source files so need to provide a babel configuration.
        compilers: {
            "**/*.js": wallaby.compilers.babel(babelConfig),
            "**/*.ts": wallaby.compilers.babel(babelConfig),
        },

        env: {
            type: "node",
            runner: "node",
        },

        testFramework: "jest",
    };
};
