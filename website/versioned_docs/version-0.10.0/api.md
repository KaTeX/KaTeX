---
id: version-0.10.0-api
title: API
original_id: api
---
## In-browser rendering
Call `katex.render` with a TeX expression and a DOM element to render into:

```js
katex.render("c = \\pm\\sqrt{a^2 + b^2}", element, {
    throwOnError: false
});
```

To avoid escaping the backslash (double backslash), you can use
[`String.raw`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/raw)
(but beware that `${`, `\u` and `\x` may still need escaping):
```js
katex.render(String.raw`c = \pm\sqrt{a^2 + b^2}`, element, {
    throwOnError: false
});
```

## Server-side rendering or rendering to a string
To generate HTML on the server or to generate an HTML string of the rendered math, you can use `katex.renderToString`:

```js
var html = katex.renderToString("c = \\pm\\sqrt{a^2 + b^2}", {
    throwOnError: false
});
// '<span class="katex">...</span>'
```

## Handling errors

The examples above use the `throwOnError: false` option, which renders invalid
inputs as the TeX source code in red (by default), with the error message as
hover text.  Without this option, invalid LaTeX will cause a
`katex.ParseError` exception to be thrown.  See [handling errors](error.md).

## Configuring KaTeX

The last argument to `katex.render` and `katex.renderToString` can contain
[a variety of rendering options](options.md).
