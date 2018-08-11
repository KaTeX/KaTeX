module.exports = api => {
    const isTest = api.cache(() => process.env.NODE_ENV === "test");

    const presets = [
        ["@babel/env", {
            modules: isTest && "commonjs",
            loose: true,
        }],
        "@babel/flow",
    ];
    const plugins = [
        ["@babel/transform-runtime", {
            corejs: 2,
            useESModules: !isTest,
        }],
        ["@babel/proposal-class-properties", {
            loose: true,
        }],
        "version-inline",
    ];

    return {
        presets,
        plugins,
    };
};
