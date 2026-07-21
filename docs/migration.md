---
id: migration
title: Migration Guide
---

## v0.18.0

KaTeX's internal CSS classes are now prefixed with `katex-`. If you apply custom
styles or maintain allowlists (for example, in a content sanitizer) that target
KaTeX's internal classes, you must update your selectors. For example:

|Before   |After          |
|---------|---------------|
|`.base`  |`.katex-base`  |
|`.strut` |`.katex-strut` |
|`.inner` |`.katex-inner` |
|`.tag`   |`.katex-tag`   |
|`.newline`|`.katex-newline`|

## v0.17.0

The internal API for `__defineFunction` changed: properties should no longer be
wrapped in `props`. Move the members of `props` up to the top level of the
definition object. For example:

```js
// Before
katex.__defineFunction({
    type: "overline",
    names: ["\\overline"],
    props: {
        numArgs: 1,
    },
    handler(context, args) { /* ... */ },
});

// After
katex.__defineFunction({
    type: "overline",
    names: ["\\overline"],
    numArgs: 1,
    handler(context, args) { /* ... */ },
});
```

## v0.16.0

The `copy-tex` extension no longer has (or requires) a CSS file. Remove any
import of `copy-tex.css`, such as `require('katex/dist/contrib/copy-tex.css')`
or `<link>`s to it.

## v0.15.0

`\relax` is now implemented as a function. It'll stop expansions and parsing,
so the behavior around `\relax` may change. For example, `\kern2\relax em` will
no longer work.

## v0.14.0

With module loaders that support conditional exports and ECMAScript modules,
`import katex from 'katex';` will import the ECMAScript module.

You can now use:
|Before                                    |After                             |
|------------------------------------------|----------------------------------|
|`require('katex/dist/contrib/[name].js')` | `require('katex/contrib/[name]')`|
|`import katex from 'katex/dist/katex.mjs'`| `import katex from 'katex'`      |
|`import 'katex/dist/contrib/[name].mjs'`  | `import 'katex/contrib/[name]'`  |

## v0.13.0

### Macro arguments
Tokens will not be expanded while parsing a macro argument. For example, `\frac\foo\foo`,
where the `\foo` is defined as `12`, will be parsed as `\frac{12}{12}`, not
`\frac{1}{2}12`. To expand the argument before parsing, `\expandafter` can
be used like `\expandafter\frac\foo\foo`.

### `\def`
`\def` no longer accepts a control sequence enclosed in braces. For example,
`\def{\foo}{}` no longer works and should be changed to `\def\foo{}`.

It also no longer accepts replacement text not enclosed in braces. For example,
`\def\foo1` no longer works and should be changed to `\def\foo{1}`.

### `\newline` and `\cr`
`\newline` and `\cr` no longer takes an optional size argument. To specify vertical
spacing, `\\` should be used.

### `\cfrac`, `\color`, `\textcolor`, `\colorbox`, `\fcolorbox`
They are no longer allowed as an argument to primitive commands, such as `\sqrt`
(without the optional argument) and super/subscript. For example,
`\sqrt\textcolor{red}{x}` no longer works and should be changed to
`\sqrt{\textcolor{red}{x}}`.
