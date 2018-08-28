---
id: node
title: Node.js
---
## npm
Install with `npm`:

```bash
npm install katex
# or globally
npm install -g katex
```

## Yarn
Install with `Yarn`:

```bash
yarn add katex
# or globally
yarn global add katex
```

## Building from Source

To build you will need Git, Node.js 6.9 or later, and Yarn.

Clone a copy of the GitHub source repository:
```bash
git clone https://github.com/Khan/KaTeX.git
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

> You can manually download the package and source code from
[GitHub releases](https://github.com/Khan/KaTeX/releases).
