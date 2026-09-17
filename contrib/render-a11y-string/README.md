# `render-a11y-string` extension

This extension converts a TeX expression into a spoken-style string, e.g.
`renderA11yString("\\frac{1}{2}")` returns
`"start fraction, 1, divided by, 2, end fraction"`.
Use it to fill in an `aria-label` on a math wrapper. See
[Accessibility](https://katex.org/docs/accessibility) for details.

## Usage

This extension isn't part of KaTeX proper. Import the default export:

```js
import renderA11yString from "katex/contrib/render-a11y-string";

const tex = "f(x) = x^2";
element.setAttribute("aria-label", renderA11yString(tex));
katex.render(tex, element);
```

The function signature is `renderA11yString(tex, settings)`, where the
optional second argument accepts the same options as `katex.render`.

These strings approximate the math's meaning; prefer the default MathML
output when available. See
[Accessibility](https://katex.org/docs/accessibility) for details.
