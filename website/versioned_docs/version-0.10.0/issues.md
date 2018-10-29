---
id: version-0.10.0-issues
title: Common Issues
original_id: issues
---
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
