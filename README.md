# [<img src="https://khan.github.io/KaTeX/katex-logo.svg" width="130" alt="KaTeX">](https://khan.github.io/KaTeX/) [![Build Status](https://travis-ci.org/Khan/KaTeX.svg?branch=master)](https://travis-ci.org/Khan/KaTeX)

[![Join the chat at https://gitter.im/Khan/KaTeX](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Khan/KaTeX?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

KaTeX is a fast, easy-to-use JavaScript library for TeX math rendering on the web.

 * **Fast:** KaTeX renders its math synchronously and doesn't need to reflow the page. See how it compares to a competitor in [this speed test](http://www.intmath.com/cg5/katex-mathjax-comparison.php).
 * **Print quality:** KaTeX’s layout is based on Donald Knuth’s TeX, the gold standard for math typesetting.
 * **Self contained:** KaTeX has no dependencies and can easily be bundled with your website resources.
 * **Server side rendering:** KaTeX produces the same output regardless of browser or environment, so you can pre-render expressions using Node.js and send them as plain HTML.

KaTeX supports all major browsers, including Chrome, Safari, Firefox, Opera, Edge, and IE 9 - IE 11. More information can be found on the [list of supported commands](https://khan.github.io/KaTeX/function-support.html) and on the [wiki](https://github.com/khan/katex/wiki).

## Usage

You can [download KaTeX](https://github.com/khan/katex/releases) and host it on your server or include the `katex.min.js` and `katex.min.css` files on your page directly from a CDN:

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0-alpha2/katex.min.css" integrity="sha384-exe4Ak6B0EoJI0ogGxjJ8rn+RN3ftPnEQrGwX59KTCl5ybGzvHGKjhPKk/KC3abb" crossorigin="anonymous">
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0-alpha2/katex.min.js" integrity="sha384-OMvkZ24ANLwviZR2lVq8ujbE/bUO8IR1FdBrKLQBI14Gq5Xp/lksIccGkmKL8m+h" crossorigin="anonymous"></script>
```

#### In-browser rendering

Call `katex.render` with a TeX expression and a DOM element to render into:

```js
katex.render("c = \\pm\\sqrt{a^2 + b^2}", element);
```

If KaTeX can't parse the expression, it throws a `katex.ParseError` error.

#### Server side rendering or rendering to a string

To generate HTML on the server or to generate an HTML string of the rendered math, you can use `katex.renderToString`:

```js
var html = katex.renderToString("c = \\pm\\sqrt{a^2 + b^2}");
// '<span class="katex">...</span>'
```

Make sure to include the CSS and font files, but there is no need to include the JavaScript. Like `render`, `renderToString` throws if it can't parse the expression.

#### Rendering options

You can provide an object of options as the last argument to `katex.render` and `katex.renderToString`. Available options are:

- `displayMode`: `boolean`. If `true` the math will be rendered in display mode, which will put the math in display style (so `\int` and `\sum` are large, for example), and will center the math on the page on its own line. If `false` the math will be rendered in inline mode. (default: `false`)
- `throwOnError`: `boolean`. If `true`, KaTeX will throw a `ParseError` when it encounters an unsupported command. If `false`, KaTeX will render the unsupported command as text in the color given by `errorColor`. (default: `true`)
- `errorColor`: `string`. A color string given in the format `"#XXX"` or `"#XXXXXX"`. This option determines the color which unsupported commands are rendered in. (default: `#cc0000`)
- `macros`: `object`. A collection of custom macros. Each macro is a property with a name like `\name` (written `"\\name"` in JavaScript) which maps to a string that describes the expansion of the macro. Single-character keys can also be included in which case the character will be redefined as the given macro (similar to TeX active characters).
- `colorIsTextColor`: `boolean`. If `true`, `\color` will work like LaTeX's `\textcolor`, and take two arguments (e.g., `\color{blue}{hello}`), which restores the old behavior of KaTeX (pre-0.8.0). If `false` (the default), `\color` will work like LaTeX's `\color`, and take one argument (e.g., `\color{blue}hello`).  In both cases, `\textcolor` works as in LaTeX (e.g., `\textcolor{blue}{hello}`).
- `maxSize`: `number`. If non-zero, all user-specified sizes, e.g. in `\rule{500em}{500em}`, will be capped to `maxSize` ems. Otherwise, users can make elements and spaces arbitrarily large (the default behavior).

For example:

```js
katex.render("c = \\pm\\sqrt{a^2 + b^2}\\in\\RR", element, {
  displayMode: true,
  macros: {
    "\\RR": "\\mathbb{R}"
  }
});
```

#### Automatic rendering of math on a page

Math on the page can be automatically rendered using the auto-render extension. See [the Auto-render README](contrib/auto-render/README.md) for more information.

#### Font size and lengths

By default, KaTeX math is rendered in a 1.21× larger font than the surrounding
context, which makes super- and subscripts easier to read. You can control
this using CSS, for example:

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

## Libraries

### Angular2+
- [ng-katex](https://github.com/garciparedes/ng-katex) Angular module to write beautiful math expressions with TeX syntax boosted by KaTeX library


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

KaTeX is licensed under the [MIT License](http://opensource.org/licenses/MIT).
