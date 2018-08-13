---
id: error
title: Handling Errors
---
If KaTeX encounters an error (invalid or unsupported LaTeX) and `throwOnError`
hasn't been set to `false`, then `katex.render` and `katex.renderToString`
will throw an exception of type `katex.ParseError`.
The message in this error includes some of the LaTeX source code,
so needs to be escaped if you want to render it to HTML.  For example:

```js
try {
    var html = katex.renderToString(texString);
    // '<span class="katex">...</span>'
} catch (e) {
    if (e instanceof katex.ParseError) {
        // KaTeX can't parse the expression
        html = ("Error in LaTeX '" + texString + "': " + e.message)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    } else {
        throw e;  // other error
    }
}
```

In particular, you should convert `&`, `<`, `>` characters to
`&amp;`, `&lt;`, `&gt;` before including either LaTeX source code or
exception messages in your HTML/DOM.
(This can also be done using `_.escape`.)
Failure to escape in this way makes a `<script>` injection attack possible
if your LaTeX source is untrusted.

Alternatively, you can set `throwOnError` to `false` to use built-in behavior
of rendering the LaTeX source code with hover text stating the error.
See [rendering options](options.md).
