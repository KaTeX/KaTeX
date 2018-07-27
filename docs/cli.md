---
id: cli
title: CLI
---

KaTeX installed [using Node.js package managers](node.md) comes with a built-in CLI
which can be used to render TeX to HTML from the command line. By default, CLI will
take the input from `stdin`.

```bash
npx katex
```

> Above uses the `npx` command to run the locally installed executable.
You can execute with the relative path: `./node_modules/.bin/katex`

> To use CLI from local clone, you need to build the project first by
running `npm run dist`

# Usage

## `-d, --display-mode`
If true the math will be rendered in display mode, which will put the math in
display style (so `\int` and `\sum` are large, for example), and will center the
math on the page on its own line.  [false]

## `-t, --no-throw-on-error`
If true, KaTeX will throw a ParseError when it encounters an unsupported command.
If false, KaTeX will render the unsupported command as text in the color given by
errorColor.  [true]

## `-c color, --error-color color`
A color string given in the format 'rgb' or 'rrggbb'. This option determines the
color which unsupported commands are rendered in.  [#cc0000]

## `-b, --color-is-text-color`
Makes \color behave like LaTeX's 2-argument \textcolor, instead of LaTeX's
one-argument \color mode change.  [false]

## `-u, --unicode-text-in-math-mode`
Add support for unicode text characters in math mode.  [false]

## `-s size, --max-size size`
If non-zero, all user-specified sizes, e.g. in \rule{500em}{500em}, will be capped
to maxSize ems. Otherwise, elements and spaces can be arbitrarily large  [0]

## `-m macro:expansion, --macro macro:expansion`
A custom macro. Each macro is a property with a name like \name which maps to a
string that describes the expansion of the macro.  []

## `-f path, --macro-file path`
Read macro definitions from the given file.

## `-i path, --input path`
Read LaTeX input from the given file.

## `-o path, --output path`
Write html output to the given file.
