// rollup.config.js
import flow from 'rollup-plugin-flow';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import {uglify} from 'rollup-plugin-uglify';

export default {
    input: 'katex.js',
    output: {
        file: 'build/bundle.js',
        format: 'umd',
        name: 'katex',
    },
    plugins: [
        json(),
        babel({
            exclude: 'node_modules/**',
            runtimeHelpers: true,
        }),
        flow(),
        resolve(),
        commonjs({
            include: 'node_modules/**',
        }),
        uglify(),
    ],
};
