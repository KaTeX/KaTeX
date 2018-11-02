---
id: version-0.10.0-font
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

The default build of KaTeX includes each of the needed fonts in three different formats: `ttf`, `woff`, and `woff2`.

- `ttf`s are included to support old versions of Chrome, Safari, Firefox, etc. (Here "old" means Firefox 3.5, Chrome < 5, and Safari <= 5.1, all of which are no longer supported: see [woff](https://caniuse.com/#search=woff) vs. [ttf](https://caniuse.com/#search=ttf)).
- `woff` is the format that is most widely supported (all modern browsers support it), so it probably provides the most benefit to being included.
- `woff2`s are included for very new versions of Chrome, because they are much smaller and faster to load.

Based on this information and what you want to support with your website, you might decide to include different versions of the fonts besides what comes with the standard installation.

For example, if you wanted to create a trimmed down version of KaTeX, you could only include the `woff` files and gain the most support with the least number of files. To do this:

1. Set `@use-ttf`, and `@use-woff2` to `false` at the top of [fonts.less](https://github.com/KaTeX/katex-fonts/blob/master/fonts.less).
2. Rebuild KaTeX by running `yarn build` from the top-level directory.
3. Include only the `build/fonts/*.woff` files in your distribution.

## Location of font files

The default build of KaTeX expects the KaTeX fonts to be located in a directory called `fonts` which is a sibling of the `katex.min.css` stylesheet. This can be changed as follows:

1. At the top of the [fonts.less](https://github.com/KaTeX/katex-fonts/blob/master/fonts.less) file, set `@font-folder` to the location of your fonts. You can use relative or absolute paths, so setting it to `"/fonts"` would cause it to search for the fonts in a root `fonts` folder, while `"../fonts"` would search in a `fonts` directory one level above the `katex.min.css` file.
2. Rebuild KaTeX by running `yarn build` from the top-level directory.
3. Use the newly generated `build/katex.min.css` file, and place the fonts where you indicated.
