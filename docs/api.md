---
id: api
title: API
---
## In-browser rendering
Call `katex.render` with a TeX expression and a DOM element to render into:

```js
katex.render("c = \\pm\\sqrt{a^2 + b^2}", element);
```

To avoid escaping the backslash (double backslash), you can use
[`String.raw`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/raw)
(but beware that `${`, `\u` and `\x` may still need escaping):
```js
katex.render(String.raw`c = \pm\sqrt{a^2 + b^2}`, element);
```

If KaTeX can't parse the expression, it throws a `katex.ParseError` by default.
See [handling errors](error.md) for configuring how to handle errors.

## Server side rendering or rendering to a string
To generate HTML on the server or to generate an HTML string of the rendered math, you can use `katex.renderToString`:

```js
var html = katex.renderToString("c = \\pm\\sqrt{a^2 + b^2}");
// '<span class="katex">...</span>'
```
