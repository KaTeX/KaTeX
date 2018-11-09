/**
 * This is the webpack entry point for KaTeX. As ECMAScript, flow[1] and jest[2]
 * doesn't support CSS modules natively, a separate entry point is used and
 * it is not flowtyped.
 *
 * [1] https://gist.github.com/lambdahands/d19e0da96285b749f0ef
 * [2] https://facebook.github.io/jest/docs/en/webpack.html
 */
import './src/katex.less';
import katex from './katex.js';

export default katex;
