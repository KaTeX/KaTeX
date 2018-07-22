import babel from 'rollup-plugin-babel';

process.env.BABEL_ENV = 'esm';

export default {
    input: 'katex.js',
    output: {
        file: 'build/katex.mjs',
        format: 'es',
    },
    plugins: [
        babel(),
    ],
};
