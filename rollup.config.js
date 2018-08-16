import babel from 'rollup-plugin-babel';
import alias from 'rollup-plugin-alias';

const {targets} = require('./webpack.common');

process.env.BABEL_ENV = 'esm';

export default targets.map(({name, entry}) => ({
    input: entry.replace('.webpack', ''),
    output: {
        file: `dist/${name}.mjs`,
        format: 'es',
    },
    plugins: [
        babel(),
        alias({
            katex: '../katex.mjs',
        }),
    ],
    external: '../katex.mjs',
}));
