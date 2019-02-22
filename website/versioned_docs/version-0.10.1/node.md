---
id: version-0.10.1-node
title: Node.js
original_id: node
---
## Installation
### npm
Install with `npm`:

```bash
npm install katex
# or globally
npm install -g katex
```

### Yarn
Install with `Yarn`:

```bash
yarn add katex
# or globally
yarn global add katex
```

### Building from Source
To build you will need Git, Node.js 6.9 or later, and Yarn.

Clone a copy of the GitHub source repository:
```bash
git clone https://github.com/KaTeX/KaTeX.git
cd KaTeX
```

Then install dependencies and run `build` script:
```bash
yarn
yarn build
```

It will automatically transpile code and include only necessary fonts for
target environments specified by [Browserslist config](https://github.com/browserslist/browserslist#environment-variables).
For example, if you are making a web app for a kiosk with Chrome 68, run
`BROWSERSLIST="Chrome 68" yarn build` and it will produce build with no
transpilation, as it fully supports ES6, and only include WOFF2 fonts.

You can override included fonts using environment variables. Set `USE_(FONT NAME)`
environment variable to `"true"` or `"false"`, to force a font type to be included
or excluded, respectively.`

If you'd like to use the built KaTeX in other projects, install the package by
specifying the path:
```bash
yarn add /path/to/KaTeX
# or using npm
npm install /path/to/KaTeX
```

> You can manually download the package and source code from
[GitHub releases](https://github.com/KaTeX/KaTeX/releases).

## Importing
KaTeX is exported as a CommonJS module, which can be imported using `require`:
```js
const katex = require('katex');
```

If you're using a module loader, transpiler, or bundler that supports interoperability
between ECMAScript module and CommonJS module, you can use `import`:
```js
import katex from 'katex';
```

KaTeX also provides an ECMAScript module:
```js
import katex from 'katex/dist/katex.mjs'
```

> The ES module contains ES6 syntaxes and features, and may need transpiling to
use in old environments:
