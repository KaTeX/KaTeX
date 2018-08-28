module.exports = api => {
    const isESMBuild = api.cache(() => process.env.NODE_ENV === "esm");

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
        ["@babel/transform-runtime", {
            corejs: 2,
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
