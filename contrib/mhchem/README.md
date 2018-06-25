# mhchem extension

This extension adds to KaTeX the `\ce` and `\pu` functions from the [mhchem](https://mhchem.github.io/MathJax-mhchem/) package.

### Usage

This extension isn't part of core KaTeX, so the script should be separately included. Write the following line into the page’s `<head>`. Place it *after* the line that points to `katex.js`.

```html
<script src="https://cdn.jsdelivr.net/npm/katex@0.10.0-beta/dist/contrib/mhchem.min.js"></script>
```

See [index.html](index.html) for an example. To test the example, place `index.html`,  and `mhchem.js` into the same folder, and run `index.html` with your web browser.

### Browser Support

This extension has been tested on Chrome, Firefox, Opera, and Edge.
