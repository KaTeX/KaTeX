# Copy-tex extension

This extension modifies the copy/paste behavior in any browser supporting the
[Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/ClipboardEvent)
so that, when selecting and copying whole KaTeX-rendered elements, the text
content of the resulting clipboard renders KaTeX elements as their LaTeX source
surrounded by specified delimiters.  (The HTML content of the resulting
clipboard remains the selected HTML content, as it normally would.)
The default delimiters are `$...$` for inline math and `$$...$$` for display
math, but you can easy switch them to e.g. `\(...\)` and `\[...\]` by
modifying `copyDelimiters` in [the source code](copy-tex.js).

### Usage

This extension isn't part of KaTeX proper, so the script should be separately
included in the page.  It also provides *optional* custom CSS that
defines KaTeX equations as
[`user-select: all`](https://developer.mozilla.org/en-US/docs/Web/CSS/user-select)
so that they get selected all-or-nothing (and thus trigger the good behavior
provided by this extension).  Without this CSS, partially selected equations
will just get the usual HTML copy/paste behavior.

```html
<link href="https://cdn.jsdelivr.net/npm/katex@0.13.18/dist/contrib/copy-tex.css" rel="stylesheet" type="text/css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.13.18/dist/contrib/copy-tex.min.js" integrity="sha384-Ep9Es0VCjVn9dFeaN2uQxgGcGmG+pfZ4eBaHxUpxXDORrrVACZVOpywyzvFRGbmv" crossorigin="anonymous"></script>
```

See [index.html](index.html) for an example.
(To run this example from a clone of the repository, run `yarn start`
in the root KaTeX directory, and then visit
http://localhost:7936/contrib/copy-tex/index.html
with your web browser.)

If you want to build your own custom copy handler based on this one,
copy the `copy-tex.js` into your codebase and replace the `require`
statement with `require('katex/contrib/copy-tex/katex2tex.js')`.

ECMAScript module is also available:
```html
<script type="module" src="https://cdn.jsdelivr.net/npm/katex@0.13.18/dist/contrib/copy-tex.mjs" integrity="sha384-+gSYJ3yzY30+a6FGYJXOx9swmWs5oPKEi1AeCsAxsLexABlUXgHXkOkEZCj0Lz8U" crossorigin="anonymous"></script>
```

### Known Issues

This extension has been tested on Chrome, Firefox, Edge, and Safari.

Safari copies correctly, but the selection rectangle renders strangely
(too big) when interacting with display math
(because of the `user-select: all` CSS).
