module.exports = api => {
    const isESMBuild = api.env("esm");

    const presets = [
        ["@babel/env", {
            debug: true,
            loose: true,
        }],
        "@babel/flow",
    ];
    if (isESMBuild) {
        presets[0][1].targets = {
            esmodules: true,
        };
    }
    const plugins = [
        "@babel/transform-runtime",
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
