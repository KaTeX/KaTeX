import babel from '@rollup/plugin-babel';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import fs from 'fs';

const {targets} = require('./webpack.common');

process.env.NODE_ENV = 'esm';

export default targets
.filter(({entry}) => entry.endsWith('js') || entry.endsWith('ts'))
.map(({name, entry}) => {
    const input = entry.replace('.webpack', '');
    const tsInput = input.replace(/\.js$/, '.ts');
    return {
        input: !fs.existsSync(input) && fs.existsSync(tsInput) ? tsInput : input,
        output: {
            file: `dist/${name}.mjs`,
            format: 'es',
        },
        plugins: [
            typescript(),
            commonjs(),
            babel({babelHelpers: 'runtime'}),
            alias({
                entries: [
                    {find: 'katex', replacement: '../katex.mjs'},
                ],
            }),
        ],
        external: '../katex.mjs',
    };
});
