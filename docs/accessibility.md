---
id: accessibility
title: Accessibility
---
KaTeX renders math accessibly by default, and ships an extension for
plain-text alternatives. This page summarizes both.

## MathML output (default)

The default [`output`](options.md) setting, `htmlAndMathml`, renders visual
HTML *and* a MathML copy of the expression (with the TeX source in an
`<annotation>` element). Assistive technologies can use the MathML copy,
so keep this default when your math has human readers.

If you set `output: "html"`, no MathML is emitted. Only do this when you
provide an alternative yourself (see below), since screen readers then have
no structured math to work with. Note that the
[copy-tex extension](https://github.com/KaTeX/KaTeX/tree/main/contrib/copy-tex)
also depends on the MathML `<annotation>` element, so it stops working with
`output: "html"`.

## `render-a11y-string` extension

The `render-a11y-string` extension converts a TeX expression into a spoken-style
string, e.g. `renderA11yString("\\frac{1}{2}")` returns
`"start fraction, 1, divided by, 2, end fraction"`. Use it to fill in an
`aria-label` on a math wrapper:

```js
import renderA11yString from "katex/contrib/render-a11y-string";

const tex = "f(x) = x^2";
element.setAttribute("aria-label", renderA11yString(tex));
katex.render(tex, element);
```

The function signature is `renderA11yString(tex, settings)`, where the
optional second argument accepts the same [options](options.md) as
`katex.render` (so `strict`, `macros`, and friends behave the same way).

These strings are approximations of the math's meaning, not a full semantic
representation: a screen reader reads the commas as brief pauses. Prefer the
default MathML output when it is available, and use this extension for
contexts where MathML is not (custom widgets, canvas fallbacks, test
fixtures).

## Color and error readability

Invalid LaTeX rendered with `throwOnError: false` appears in `errorColor`
(default `#cc0000`) with the error as hover text. Hover text is not available
to keyboard or screen-reader users, so for user-supplied input, surface the
[`ParseError` message](error.md) as real text near the expression instead of
relying on the title tooltip alone.
