---
id: browser
title: Browser
---
> KaTeX supports all major browsers, including Chrome, Safari, Firefox, Opera, Edge, and IE 9–11.

## CDN (Content Delivery Network)
Use CDN to deliver KaTeX to your project:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.0-beta/dist/katex.css" integrity="sha256-T4bfkilI7rlQXG1R8kqn+FGhe56FhZmqmp9x75Lw4s8=" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.10.0-beta/dist/katex.js" integrity="sha256-9uW7yW4EwdUyWU2PHu+Ccek7+xbQpDTDS5OBP0qDrTM=" crossorigin="anonymous"></script>
```

KaTeX also provides minified versions:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.0-beta/dist/katex.min.css" integrity="sha256-sI/DdD47R/Sa54XZDNFjRWlS+Dv8MC5xfkqQLRh0Jes=" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.10.0-beta/dist/katex.min.js" integrity="sha256-mxaM9VWtRj1wBtn50/EDUUe4m3t39ExE+xEPyrxVB8I=" crossorigin="anonymous"></script>
```

> The loading of scripts are [deferred using `defer` attribute](https://developer.mozilla.org/en/HTML/Element/script#Attributes).
to speed up page rendering. The `katex` object will be available after
[`DOMContentLoaded` event is fired on the `document`](https://developer.mozilla.org/ko/docs/Web/Reference/Events/DOMContentLoaded).
If you do not use `defer`, `katex` object will be available after corresponding
`script` tag.

## Download & Host Things Yourself
Download a [KaTeX release](https://github.com/Khan/KaTeX/releases),
copy `katex.js`, `katex.css`
(or `katex.min.js` and `katex.min.css` to use minified versions),
and the `fonts` directory, and include like above.

You can also build from source. See [Building from Source](node.md#building-from-source)
for more details.

## Bundler
Use [Node.js package managers](node.md) to install KaTeX and require it in your
project. Then bundle using bundlers like [webpack](https://webpack.js.org/) or
[rollup.js](https://rollupjs.org/). Note that you have to bundle the stylesheet
(`katex.css`) or include it manually.
