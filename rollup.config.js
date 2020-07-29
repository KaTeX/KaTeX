import babel from '@rollup/plugin-babel';
import alias from '@rollup/plugin-alias';

const {targets} = require('./webpack.common');

process.env.NODE_ENV = 'esm';

export default targets.map(({name, entry}) => ({
    input: entry.replace('.webpack', ''),
    output: {
        file: `dist/${name}.mjs`,
        format: 'es',
    },
    plugins: [
        babel({babelHelpers: 'runtime'}),
        alias({
            entries: [
                {find: 'katex', replacement: '../katex.mjs'},
            ],
        }),
    ],
    external: '../katex.mjs',
}));
