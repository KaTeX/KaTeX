---
id: version-0.11.0-font
title: Font
original_id: font
---
By changing the variables in the `fonts.less` file at the [katex-fonts submodule](https://github.com/KaTeX/katex-fonts/),
several properties of the way fonts are used can be changed.

## Font size and lengths
By default, KaTeX math is rendered in a 1.21× larger font than the surrounding
context, which makes super- and subscripts easier to read. You can control
this using CSS, for example, to set to 1.1×:

```css
.katex { font-size: 1.1em; }
```

KaTeX supports all TeX units, including absolute units like `cm` and `in`.
Absolute units are currently scaled relative to the default TeX font size of
10pt, so that `\kern1cm` produces the same results as `\kern2.845275em`.
As a result, relative and absolute units are both uniformly scaled relative
to LaTeX with a 10pt font; for example, the rectangle `\rule{1cm}{1em}` has
the same aspect ratio in KaTeX as in LaTeX.  However, because most browsers
default to a larger font size, this typically means that a 1cm kern in KaTeX
will appear larger than 1cm in browser units.

## Kinds of fonts used

KaTeX provides fonts in three different formats: `ttf`, `woff`, and `woff2`.

- `ttf`s are included to support very old browsers and local installation. [Browser support](https://caniuse.com/#feat=ttf)
- `woff` is the format that is most widely supported (all modern browsers support it), so it probably provides the most benefit to being included. [Browser support](https://caniuse.com/#feat=woff)
- `woff2`s are included for modern browsers, because they are much smaller and faster to load. [Browser support](https://caniuse.com/#feat=woff2)

KaTeX will automatically include only necessary fonts for target environments
specified by [Browserslist config](https://github.com/browserslist/browserslist#queries).

To force a font type to be included or excluded, set `USE_(FONT NAME)` environment
variable to `"true"` or `"false"`, respectively.`

## Location of font files

The default build of KaTeX expects the KaTeX fonts to be located in a directory called `fonts` which is a sibling of the `katex.min.css` stylesheet. This can be changed as follows:

1. At the top of the [fonts.less](https://github.com/KaTeX/katex-fonts/blob/master/fonts.less) file, set `@font-folder` to the location of your fonts. You can use relative or absolute paths, so setting it to `"/fonts"` would cause it to search for the fonts in a root `fonts` folder, while `"../fonts"` would search in a `fonts` directory one level above the `katex.min.css` file.
2. Rebuild KaTeX by running `yarn build` from the top-level directory.
3. Use the newly generated `dist/katex.min.css` file, and place the fonts where you indicated.
