# [<img src="https://cdn.rawgit.com/Khan/KaTeX/84189cd3adae24d92e766d14eb80d6e54f3c7dca/katex-logo.svg" width="130" alt="KaTeX">](https://katex.org/)
[![npm](https://img.shields.io/npm/v/katex.svg)](https://www.npmjs.com/package/katex)
[![CircleCI](https://circleci.com/gh/Khan/KaTeX.svg?style=shield)](https://circleci.com/gh/Khan/KaTeX)
[![codecov](https://codecov.io/gh/Khan/KaTeX/branch/master/graph/badge.svg)](https://codecov.io/gh/Khan/KaTeX)
[![Join the chat at https://gitter.im/Khan/KaTeX](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Khan/KaTeX?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Greenkeeper badge](https://badges.greenkeeper.io/Khan/KaTeX.svg)](https://greenkeeper.io/)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/katex/badge?style=rounded)](https://www.jsdelivr.com/package/npm/katex)
![](https://img.badgesize.io/Khan/KaTeX/v0.10.0/dist/katex.min.js?compression=gzip)

KaTeX is a fast, easy-to-use JavaScript library for TeX math rendering on the web.

 * **Fast:** KaTeX renders its math synchronously and doesn't need to reflow the page. See how it compares to a competitor in [this speed test](http://www.intmath.com/cg5/katex-mathjax-comparison.php).
 * **Print quality:** KaTeX’s layout is based on Donald Knuth’s TeX, the gold standard for math typesetting.
 * **Self contained:** KaTeX has no dependencies and can easily be bundled with your website resources.
 * **Server side rendering:** KaTeX produces the same output regardless of browser or environment, so you can pre-render expressions using Node.js and send them as plain HTML.

KaTeX is compatible with all major browsers, including Chrome, Safari, Firefox, Opera, Edge, and IE 9–11.

KaTeX supports much (but not all) of LaTeX and many LaTeX packages. See the [list of supported functions](https://katex.org/docs/supported.html).

Try out KaTeX [on the demo page](https://katex.org/#demo)!

## Getting started

### Starter template

```html
<!DOCTYPE html>
<!-- KaTeX requires the use of the HTML5 doctype. Without it, KaTeX may not render properly -->
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.0/dist/katex.min.css" integrity="sha384-9eLZqc9ds8eNjO3TmqPeYcDj8n+Qfa4nuSiGYa6DjLNcv9BtN69ZIulL9+8CqC9Y" crossorigin="anonymous">

    <!-- The loading of KaTeX is deferred to speed up page rendering -->
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.10.0/dist/katex.min.js" integrity="sha384-K3vbOmF2BtaVai+Qk37uypf7VrgBubhQreNQe9aGsz9lB63dIFiQVlJbr92dw2Lx" crossorigin="anonymous"></script>

    <!-- To automatically render math in text elements, include the auto-render extension: -->
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.10.0/dist/contrib/auto-render.min.js" integrity="sha384-kmZOZB5ObwgQnS/DuDg6TScgOiWWBiVt0plIRkZCmE6rDZGrEOQeHM5PcHi+nyqe" crossorigin="anonymous"
        onload="renderMathInElement(document.body);"></script>
  </head>
  ...
</html>
```

You can also [download KaTeX](https://github.com/khan/katex/releases) and host it yourself.

For details on how to configure auto-render extension, refer to [the documentation](https://katex.org/docs/autorender.html).

### API

Call `katex.render` to render a TeX expression directly into a DOM element.
For example:

```js
katex.render("c = \\pm\\sqrt{a^2 + b^2}", element, {
    throwOnError: false
});
```

Call `katex.renderToString` to generate an HTML string of the rendered math,
e.g., for server-side rendering.  For example:

```js
var html = katex.renderToString("c = \\pm\\sqrt{a^2 + b^2}", {
    throwOnError: false
});
// '<span class="katex">...</span>'
```

Make sure to include the CSS and font files in both cases.
If you are doing all rendering on the server, there is no need to include the
JavaScript on the client.

The examples above use the `throwOnError: false` option, which renders invalid
inputs as the TeX source code in red (by default), with the error message as
hover text.  For other available options, see the
[API documentation](https://katex.org/docs/api.html),
[options documentation](https://katex.org/docs/options.html), and
[handling errors documentation](https://katex.org/docs/error.html).

## Demo and Documentation

Learn more about using KaTeX [on the website](https://katex.org)!

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

KaTeX is licensed under the [MIT License](http://opensource.org/licenses/MIT).
