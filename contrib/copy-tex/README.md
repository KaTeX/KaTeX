# Copy-tex extension

This extension modifes the copy/paste behavior in any browser supporting the
[Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/ClipboardEvent)
so that, when selecting and copying whole KaTeX-rendered elements, the text
content of the resulting clipboard renders KaTeX elements as their LaTeX source
surrounded by specified delimiters.  (The HTML content remains unchanged.)
The default delimiters are `$...$` for inline math and `$$...$$` for display
math, but you can easy switch them to e.g. `\(...\)` and `\[...\]` by
modifying `copyDelimiters` in [the source code](copy-tex.js).

### Usage

This extension isn't part of KaTeX proper, so the script should be separately
included in the page:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.8.3/contrib/copy-tex.min.js" integrity="sha384-RkgGHBDdR8eyBOoWeZ/vpGg1cOvSAJRflCUDACusAAIVwkwPrOUYykglPeqWakZu" crossorigin="anonymous"></script>
```

See [index.html](index.html) for an example.
(To run this example from a clone of the repository, run `make serve`
in the root KaTeX directory, and then visit
http://0.0.0.0:7936/contrib/copy-tex/index.html
with your web browser.)
