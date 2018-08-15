import babel from 'rollup-plugin-babel';

process.env.BABEL_ENV = 'esm';

export default {
    input: 'katex.js',
    output: {
        file: 'dist/katex.mjs',
        format: 'es',
    },
    plugins: [
        babel({runtimeHelpers: true}),
    ],
};
