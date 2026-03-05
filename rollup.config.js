import babel from '@rollup/plugin-babel';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import fs from 'fs';
import path from 'path';

const {targets} = require('./webpack.common');

process.env.NODE_ENV = 'esm';

export default targets
.filter(({entry}) => entry.endsWith('js') || entry.endsWith('ts'))
.map(({name, entry}) => {
    const input = entry.replace('.webpack', '');
    const tsInput = input.replace(/\.js$/, '.ts');
    const outputFile = `dist/${name}.mjs`;
    return {
        input: !fs.existsSync(input) && fs.existsSync(tsInput) ? tsInput : input,
        output: {
            file: outputFile,
            format: 'es',
        },
        plugins: [
            typescript({
                compilerOptions: {
                    noEmit: false,
                    outDir: path.dirname(outputFile),
                },
            }),
            commonjs(),
            babel({
                babelHelpers: 'runtime',
                extensions: ['.js', '.mjs', '.cjs', '.ts'],
            }),
            alias({
                entries: [
                    {find: 'katex', replacement: '../katex.mjs'},
                ],
            }),
        ],
        external: '../katex.mjs',
    };
});
