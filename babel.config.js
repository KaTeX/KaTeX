module.exports = api => {
    const isESMBuild = api.env("esm");

    const presets = [
        ["@babel/env", {
            targets: {
                esmodules: isESMBuild,
            },
            loose: true,
        }],
        "@babel/flow",
    ];
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
