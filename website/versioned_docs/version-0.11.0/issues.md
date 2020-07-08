---
id: version-0.11.0-issues
title: Common Issues
original_id: issues
---
- Be sure to include `<!DOCTYPE html>` at the top of your HTML file, as
  otherwise your browser will render in "[quirks mode](https://developer.mozilla.org/en-US/docs/Web/HTML/Quirks_Mode_and_Standards_Mode)"
  which can cause KaTeX to sometimes render incorrectly.
  This header is needed even inside `<iframe>`s
  (which don't inherit the parent document's doctype).
- Many Markdown preprocessors, such as the one that Jekyll and GitHub Pages use,
  have a "smart quotes" feature.  This changes `'` to `’` which is an issue for
  math containing primes, e.g. `f'`.  This can be worked around by defining a
  single character macro which changes them back, e.g. `{"’", "'"}`.
- KaTeX follows LaTeX's rendering of `aligned` and `matrix` environments unlike
  MathJax.  When displaying fractions one above another in these vertical
  layouts there may not be enough space between rows for people who are used to
  MathJax's rendering.  The distance between rows can be adjusted by using
  `\\[0.1em]` instead of the standard line separator distance.
- KaTeX does not support the `align` environment because LaTeX doesn't support
  `align` in math mode.  The `aligned` environment offers the same functionality
  but in math mode, so use that instead.
- MathJax defines `\color` to be like `\textcolor` by default; set KaTeX's
  `colorIsTextColor` option to `true` for this behavior.  KaTeX's default
  behavior matches MathJax with its `color.js` extension enabled.

## Troubleshooting

To check the stylesheet (katex.css) is properly loaded, add following code to
anywhere in the document:

```html
<style>
  .katex-version {display: none;}
  .katex-version::after {content:"0.10.2 or earlier";}
</style>
<span class="katex">
  <span class="katex-mathml">The KaTeX stylesheet is not loaded!</span>
  <span class="katex-version rule">KaTeX stylesheet version: </span>
</span>
```

If it is loaded properly, it'll show its version. Make sure its version matches
the version of the JavaScript file (katex.js), which is defined in `katex.version`.
If it is not loaded properly, it'll show:

> The KaTeX stylesheet is not loaded!
