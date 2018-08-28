/* eslint-disable no-console */
/**
 * Performance Tests
 *
 * This file measures the performance of renderToString using a number of strings
 * from ss_data.yaml.
 *
 * TODO:
 * - allow users to specify a different key or keys from ss_data.yaml
 * - allow users to specify a different string or strings
 * - provide a way to test the performance against different branches
 */
const Benchmark = require('benchmark');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const filename = path.resolve(__dirname, 'screenshotter/ss_data.yaml');
const data = yaml.load(fs.readFileSync(filename, 'utf-8'));

console.log('compiling katex...');
require('@babel/register');
const katex = require('../katex').default;
console.log('');

// Benchmark is a performancing testing library.  It allows you to define a
// suite of tests.  After adding tests to the suite with the .add() method they
// can be run by calling the .run() method.  See https://benchmarkjs.com.
const suite = new Benchmark.Suite;

const testsToRun = [
    "AccentsText",
    "ArrayMode",
    "GroupMacros",
    "MathBb",
    "SqrtRoot",
    "StretchyAccent",
    "Units",
];

for (const key of testsToRun) {
    const value = data[key];
    if (typeof value === "string") {
        suite.add(key, () => katex.renderToString(value));
    } else {
        const options = {
            macros: value.macros,
        };
        suite.add(key, () => katex.renderToString(value.tex, options));
    }
}

// Print out the ops/sec for each test
suite.on('cycle', function(event) {
    console.log(String(event.target));
});

const config = {};
suite.run(config);
