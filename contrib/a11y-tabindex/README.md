# A11y Tab Index extension

This extension automatically adds `tabindex="0"` to KaTeX elements that are
scrollable (i.e., their content overflows), making them keyboard-focusable per
[WCAG 2.1 SC 2.1.1](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)
and the axe
[scrollable-region-focusable](https://dequeuniversity.com/rules/axe/4.4/scrollable-region-focusable)
rule. When an element is no longer scrollable (e.g., after a viewport resize),
`tabindex` is automatically removed.

It uses a `ResizeObserver` to track overflow changes and a `MutationObserver`
to handle dynamically added math elements.

## Usage

This extension isn't part of KaTeX proper, so the script should be separately
included in the page, after KaTeX renders math.

```html
<script defer src="https://cdn.jsdelivr.net/npm/katex/dist/contrib/a11y-tabindex.min.js"></script>
```

Works with both `katex.render()` (client-side) and `katex.renderToString()`
(server-side rendering) output.

See [index.html](index.html) for an example.
(To run this example from a clone of the repository, run `yarn start`
in the root KaTeX directory, and then visit
http://localhost:7936/contrib/a11y-tabindex/index.html
with your web browser.)
