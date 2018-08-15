module.exports = api => {
    const nodeEnv = api.cache(() => {
        switch (process.env.NODE_ENV) {
            case "esm":
                return 2;
            case "test":
                return 1;
            default:
                return 0;
        }
    });

    const presets = [
        nodeEnv !== 2 && ["@babel/env", {
            modules: nodeEnv === 1 && "commonjs",
            loose: true,
        }],
        "@babel/flow",
    ].filter(Boolean);
    const plugins = [
        ["@babel/transform-runtime", {
            corejs: 2,
            useESModules: nodeEnv !== 1,
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
