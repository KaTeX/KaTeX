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

## Usage

### `-V, --version`
Output the version number

### `-d, --display-mode`
Render math in display mode, which puts the math in display style (so \int and \sum are large, for example), and centers the math on the page on its own line.

### `-t, --no-throw-on-error`
Render errors (in the color given by --error-color) instead of throwing a ParseError exception when encountering an error.

### `-c, --error-color <color>`
A color string given in the format 'rgb' or 'rrggbb' (no #). This option determines the color of errors rendered by the -t option. (default: #cc0000)

### `-b, --color-is-text-color`
Makes \color behave like LaTeX's 2-argument \textcolor, instead of LaTeX's one-argument \color mode change.

### `-S, --strict`
Turn on strict / LaTeX faithfulness mode, which throws an error if the input uses features that are not supported by LaTeX

### `-s, --max-size <n>`
If non-zero, all user-specified sizes, e.g. in \rule{500em}{500em}, will be capped to maxSize ems. Otherwise, elements and spaces can be arbitrarily large (default: 0)

### `-e, --max-expand <n>`
Limit the number of macro expansions to the specified number, to prevent e.g. infinite macro loops.  If set to Infinity, the macro expander will try to fully expand as in LaTeX.

### `-m, --macro <def>`
Define custom macro of the form '\foo:expansion' (use multiple -m arguments for multiple macros).

### `-f, --macro-file <path>`
Read macro definitions, one per line, from the given file.

### `-i, --input <path>`
Read LaTeX input from the given file.

### `-o, --output <path>`
Write html output to the given file.

### `-h, --help`
Output usage information
