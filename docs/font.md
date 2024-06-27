---
id: font
title: Font
---
By changing the variables in the `src/styles/fonts.scss` file,
you can change several properties of how KaTeX uses fonts.

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
variable to `"true"` or `"false"`, respectively, during the build process.

Alternatively, if you use [Sass](https://sass-lang.com/), you can include `src/styles/katex.scss` directly with variable overrides:

```scss
@use 'node_modules/katex/src/styles/katex' with (
  $use-ttf: false;
  $use-woff: false;
  $use-woff2: true;
);
```

## Location of font files

The default build of KaTeX expects the KaTeX fonts to be located in a directory called `fonts` which is a sibling of the `katex.min.css` stylesheet. This can be changed as follows:

1. Find the `sassVariables` variable in `webpack.common.js`. This is a string, and you add at the start or end of it `$font-folder: "${fontLocation}";\n`, with `fontLocation` pointing to the location of your fonts. Alternatively you can replace value in `src/styles/fonts.scss` file.  It is possible to use relative or absolute paths, so setting it to `"/fonts"` would cause it to search for the fonts in a root `fonts` folder, while `"../fonts"` would search in a `fonts` directory one level above the `katex.min.css` file.
2. Rebuild KaTeX by running `yarn build` from the top-level directory.
3. Use the newly generated `dist/katex.min.css` file, and place the fonts where you indicated.

Alternatively, if you use [Sass](https://sass-lang.com/), you can include `src/styles/katex.scss` directly with a variable override:

```scss
@use 'node_modules/katex/src/styles/katex' with (
  $font-folder: "path/to/fonts"
);
```
