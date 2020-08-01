---
id: options
title: Options
---
You can provide an object of options as the last argument to [`katex.render` and `katex.renderToString`](api.md). Available options are:

- `displayMode`: `boolean`. If `true` the math will be rendered in display mode, which will put the math in display style (so `\int` and `\sum` are large, for example), and will center the math on the page on its own line. If `false` the math will be rendered in inline mode. (default: `false`)
- `output`: `string`. Determines the markup language of the output. The valid choices are:
  - `html`: Outputs KaTeX in HTML only.
  - `mathml`: Outputs KaTeX in MathML only.
  - `htmlAndMathml`: Outputs HTML for visual rendering and includes MathML for accessibility. This is the default.
- `leqno`: `boolean`. If `true`, display math has `\tag`s rendered on the left instead of the right, like `\usepackage[leqno]{amsmath}` in LaTeX.
- `fleqn`: `boolean`. If `true`, display math renders flush left with a `2em` left margin, like `\documentclass[fleqn]` in LaTeX with the `amsmath` package.
- `throwOnError`: `boolean`. If `true` (the default), KaTeX will throw a `ParseError` when it encounters an unsupported command or invalid LaTeX. If `false`, KaTeX will render unsupported commands as text, and render invalid LaTeX as its source code with hover text giving the error, in the color given by `errorColor`.
- `errorColor`: `string`. A color string given in the format `"#XXX"` or `"#XXXXXX"`. This option determines the color that unsupported commands and invalid LaTeX are rendered in when `throwOnError` is set to `false`. (default: `#cc0000`)
- `macros`: `object`. A collection of custom macros. Each macro is a property with a name like `\name` (written `"\\name"` in JavaScript) which maps to a string that describes the expansion of the macro, or a function that accepts an instance of `MacroExpander` as first argument and returns the expansion as a string. `MacroExpander` is an internal API and subject to non-backwards compatible changes. See [`src/macros.js`](https://github.com/KaTeX/KaTeX/blob/master/src/macros.js) for its usage. Single-character keys can also be included in which case the character will be redefined as the given macro (similar to TeX active characters). *This object will be modified* if the LaTeX code defines its own macros via `\gdef`, which enables consecutive calls to KaTeX to share state.
- `minRuleThickness`: `number`. Specifies a minimum thickness, in ems, for fraction lines, `\sqrt` top lines, `{array}` vertical lines, `\hline`, `\hdashline`, `\underline`, `\overline`, and the borders of `\fbox`, `\boxed`, and `\fcolorbox`. The usual value for these items is `0.04`, so for `minRuleThickness` to be effective it should probably take a value slightly above `0.04`, say `0.05` or `0.06`. Negative values will be ignored.
- `colorIsTextColor`: `boolean`. In early versions of both KaTeX (<0.8.0) and MathJax, the `\color` function expected the content to be a function argument, as in `\color{blue}{hello}`. In current KaTeX, `\color` is a switch, as in `\color{blue} hello`. This matches LaTeX behavior. If you want the old `\color` behavior, set option `colorIsTextColor` to true.
- `maxSize`: `number`. All user-specified sizes, e.g. in `\rule{500em}{500em}`, will be capped to `maxSize` ems. If set to `Infinity` (the default), users can make elements and spaces arbitrarily large.
- `maxExpand`: `number`. Limit the number of macro expansions to the specified number, to prevent e.g. infinite macro loops. If set to `Infinity`, the macro expander will try to fully expand as in LaTeX. (default: 1000)
- `strict`: `boolean` or `string` or `function` (default: `"warn"`). If `false` or `"ignore`", allow features that make writing LaTeX convenient but are not actually supported by (Xe)LaTeX (similar to MathJax). If `true` or `"error"` (LaTeX faithfulness mode), throw an error for any such transgressions. If `"warn"` (the default), warn about such behavior via `console.warn`. Provide a custom function `handler(errorCode, errorMsg, token)` to customize behavior depending on the type of transgression (summarized by the string code `errorCode` and detailed in `errorMsg`); this function can also return `"ignore"`, `"error"`, or `"warn"` to use a built-in behavior.  A list of such features and their `errorCode`s:

  - `"unknownSymbol"`: Use of unknown Unicode symbol, which will likely also
    lead to warnings about missing character metrics, and layouts may be
    incorrect (especially in terms of vertical heights).
  - `"unicodeTextInMathMode"`: Use of Unicode text characters in math mode.
  - `"mathVsTextUnits"`: Mismatch of math vs. text commands and units/mode.
  - `"commentAtEnd"`: Use of `%` comment without a terminating newline.
    LaTeX would thereby comment out the end of math mode (e.g. `$`),
    causing an error.
  - `"htmlExtension"`: Use of HTML extension (`\html`-prefixed) commands,
    which are provieded for HTML manipulation.

  A second category of `errorCode`s never throw errors, but their strictness
  affects the behavior of KaTeX:

  - `"newLineInDisplayMode"`: Use of `\\` or `\newline` in display mode
    (outside an array/tabular environment).  In strict mode, no line break
    results, as in LaTeX.

- `trust`: `boolean` or `function` (default: `false`). If `false` (do not trust input), prevent any commands like `\includegraphics` that could enable adverse behavior, rendering them instead in `errorColor`. If `true` (trust input), allow all such commands. Provide a custom function `handler(context)` to customize behavior depending on the context (command, arguments e.g. a URL, etc.).  A list of possible contexts:

  - `{command: "\\url", url, protocol}`
  - `{command: "\\href", url, protocol}`
  - `{command: "\\includegraphics", url, protocol}`
  - `{command: "\\htmlClass", class}`
  - `{command: "\\htmlId", id}`
  - `{command: "\\htmlStyle", style}`
  - `{command: "\\htmlData", attributes}`

  Here are some sample trust settings:

  - Forbid specific command: `trust: (context) => context.command !== '\\includegraphics'`
  - Allow specific command: `trust: (context) => context.command === '\\url'`
  - Allow multiple specific commands: `trust: (context) => ['\\url', '\\href'].includes(context.command)`
  - Allow all commands with a specific protocol: `trust: (context) => context.protocol === 'http'`
  - Allow all commands with specific protocols: `trust: (context) => ['http', 'https', '_relative'].includes(context.protocol)`
  - Allow all commands but forbid specific protocol: `trust: (context) => context.protocol !== 'file'`
  - Allow certain commands with specific protocols: `trust: (context) => ['\\url', '\\href'].includes(context.command) && ['http', 'https', '_relative'].includes(context.protocol)`
- `globalGroup`: `boolean`  (default: `false`). Place KaTeX code in the global group. As a consequence, `\def` and `\newcommand` persist in `macros` across render calls. In LaTeX, constructs such as `\begin{equation}` and `$$` create a local group and prevent definitions from becoming visible outside of those blocks.

For example:

```js
katex.render("c = \\pm\\sqrt{a^2 + b^2}\\in\\RR", element, {
  displayMode: true,
  macros: {
    "\\RR": "\\mathbb{R}"
  }
});
```
