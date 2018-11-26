---
id: version-0.10.0-libs
title: Extensions & Libraries
original_id: libs
---
## Extensions

These extensions are provided by KaTeX.

- [Auto-render](autorender.md): Automatically renders all of the math inside text
- [Copy-tex](https://github.com/KaTeX/KaTeX/tree/master/contrib/copy-tex): When selecting and copying KaTeX-rendered elements, copies their LaTeX source to the clipboard
- [`math/tex` Custom Script Type](https://github.com/KaTeX/KaTeX/tree/master/contrib/mathtex-script-type): Automatically displays LaTeX math inside `script` tags with `type=math/tex`

## Libraries

These libraries are maintained by third-parties.

### Angular2+
- [ng-katex](https://github.com/garciparedes/ng-katex): Angular module to write beautiful math expressions with TeX syntax boosted by KaTeX library

### iOS
- [KaTeX-iOS](https://github.com/ianarawjo/KaTeX-iOS): iOS UIView that renders TeX expressions with KaTeX

### React
- [react-latex](https://github.com/zzish/react-latex): React component to render latex strings, based on KaTeX
- [react-katex](https://github.com/talyssonoc/react-katex): React components that use KaTeX to typeset math expressions

### Ruby

- [katex-ruby](https://github.com/glebm/katex-ruby): Provides server-side rendering and integration with popular Ruby web frameworks (Rails, Hanami, and anything that uses Sprockets).

### AsciiMath

If you want to render math written in [AsciiMath](http://asciimath.org/),
you'll need to first convert AsciiMath into LaTeX input, then call KaTeX.

- [asciimath2tex](https://github.com/christianp/asciimath2tex): Converts AsciiMath to TeX, with KaTeX in mind

### Canvas LaTeX

- [canvas-latex](https://github.com/CurriculumAssociates/canvas-latex): Renders mathematical expressions on HTML5's canvas element. Supports popular libraries like: CreateJS, and PIXI.
