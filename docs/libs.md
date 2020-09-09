---
id: libs
title: Extensions & Libraries
---
## Extensions

These extensions are provided by KaTeX.

- [Auto-render](autorender.md): Automatically renders all of the math inside text
- [Copy-tex](https://github.com/Khan/KaTeX/tree/master/contrib/copy-tex): When selecting and copying KaTeX-rendered elements, copies their LaTeX source to the clipboard
- [`math/tex` Custom Script Type](https://github.com/Khan/KaTeX/tree/master/contrib/mathtex-script-type): Automatically displays LaTeX math inside `script` tags with `type=math/tex`
- [mhchem](https://github.com/Khan/KaTeX/tree/master/contrib/mhchem): Write beautiful chemical equations easily

## Libraries

These libraries are maintained by third-parties.

### Angular2+
- [ng-katex](https://github.com/garciparedes/ng-katex): Angular module to write beautiful math expressions with TeX syntax boosted by KaTeX library

### iOS
- [KaTeX-iOS](https://github.com/ianarawjo/KaTeX-iOS): iOS UIView that renders TeX expressions with KaTeX

### Android
- [KaTeXView](https://github.com/judemanutd/KaTeXView): An android library that uses Khan Academy KaTeX for TeX math rendering.

### React
- [react-latex](https://github.com/zzish/react-latex): React component to render latex strings, based on KaTeX
- [react-katex](https://github.com/talyssonoc/react-katex): React components that use KaTeX to typeset math expressions

### Ruby

- [katex-ruby](https://github.com/glebm/katex-ruby): Provides server-side rendering and integration with popular Ruby web frameworks (Rails, Hanami, and anything that uses Sprockets).

### Rust

- [katex-rs](https://github.com/xu-cheng/katex-rs): Rust bindings to provide server-side rendering.

### Vue
- [vue-katex](https://github.com/lucpotage/vue-katex): Vue plugin to render TeX expressions using KaTeX.

### AsciiMath

If you want to render math written in [AsciiMath](http://asciimath.org/),
you'll need to first convert AsciiMath into LaTeX input, then call KaTeX.

- [asciimath2tex](https://github.com/christianp/asciimath2tex): Converts AsciiMath to TeX, with KaTeX in mind

### Canvas LaTeX

- [canvas-latex](https://github.com/CurriculumAssociates/canvas-latex): Renders mathematical expressions on HTML5's canvas element. Supports popular libraries like: CreateJS, and PIXI.

### Web-Components

- [katex-element](https://github.com/georges-gomes/katex-element): KaTeX wrapped in a custom element. Simply use `<katex-element>` in HTML - framework independent.
- [katex-expression](https://github.com/navsgh/katex-expression): A web component/custom element (built with Stencil) to render KaTeX expressions. Stencil builds web components that run natively or near-natively in all widely used desktop and mobile browsers. Stencil uses a dynamic loader to load the custom elements polyfill only on browsers that need it.
