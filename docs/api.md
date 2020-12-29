---
id: api
title: API
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

## Persistent Macros

KaTeX’s [macro documentation](supported.html#gdef) tells the author that `\gdef` will create a macro that persists between KaTeX elements. In order to enable that persistence, you must create one shared `macros` object that you pass into every call to `katex.render` or `katex.renderToString`. (Do not create a fresh `macros` object for each call.)

For example, suppose that you have an array `mathElements` of DOM elements that contain math. Then you could write this code:

```js
const macros = {};
for (let element of mathElements) {
    katex.render(element.textContent, element, {
        throwOnError: false,
        macros
    };
}
```

Notice that you create the `macros` object outside the loop. If an author uses `\gdef`, KaTeX will insert that macro definition into the `macros` object and since `macros` continues to exist between calls to `katex.render`, `\gdef` macros will persist between `mathElements`.

### Security of Persistent Macros

Persistent macros can change the behavior of KaTeX (e.g. redefining standard commands), so for security, such a setup should be used only for multiple elements of common trust.  For example, you might enable persistent macros within a message posted by a single user (by creating a `macros` object for that message), but you probably should not enable persistent macros across multiple messages posted by multiple users.
