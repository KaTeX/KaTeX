module.exports = api => {
    const isESMBuild = api.env("esm");
    const isFontBuild = api.env("font");

    const presets = [
        ["@babel/env", {
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
    if (!isFontBuild) {
        plugins.push("./lib/removeGlyphTable");
    }

    return {
        presets,
        plugins,
    };
};
