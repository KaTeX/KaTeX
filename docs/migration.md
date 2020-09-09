---
id: migration
title: Migration Guide
---

As of KaTeX 1.0, we've changed how MacroExpander and Parser work in order to close
some gaps between KaTeX and LaTeX and therefore there may be breaking changes.

## Macro arguments
Tokens will not be expanded while parsing a macro argument. For example, `\frac\foo\foo`,
where the `\foo` is defined as `12`, will be parsed as `\frac{12}{12}`, not
`\frac{1}{2}12`. To expand the argument before parsing, `\expandafter` can
be used like `\expandafter\frac\foo\foo`.

## `\def`
`\def` no longer accepts a control sequence enclosed in braces. For example,
`\def{\foo}{}` no longer works and should be changed to `\def\foo{}`.

It also no longer accepts replacement text not enclosed in braces. For example,
`\def\foo1` no longer works and should be changed to `\def\foo{1}`.

## `\newline` and `\cr`
`\newline` and `\cr` no longer takes an optional size argument. To specify vertical
spacing, `\\` should be used.

## `\cfrac`, `\color`, `\textcolor`, `\colorbox`, `\fcolorbox`
They are no longer allowed as an argument to primitive commands, such as `\sqrt`
(without the optional argument) and super/subscript. For example,
`\sqrt\textcolor{red}{x}` no longer works and should be changed to
`\sqrt{\textcolor{red}{x}}`.
