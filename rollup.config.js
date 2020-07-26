import babel from '@rollup/plugin-babel';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';

const {extensions, targets} = require('./webpack.common');

process.env.NODE_ENV = 'esm';

export default targets.map(({name, entry}) => ({
    input: entry.replace('katex.webpack.js', 'katex.ts')
        .replace('.webpack.js', '.js'),
    output: {
        file: `dist/${name}.mjs`,
        format: 'es',
    },
    plugins: [
        resolve({extensions}),
        babel({
            babelHelpers: 'runtime',
            extensions,
        }),
        alias({
            entries: [
                {find: 'katex', replacement: '../katex.mjs'},
            ],
        }),
    ],
    external: '../katex.mjs',
}));
