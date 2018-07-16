# [<img src="https://khan.github.io/KaTeX/katex-logo.svg" width="130" alt="KaTeX">](https://khan.github.io/KaTeX/)
[![Build Status](https://travis-ci.org/Khan/KaTeX.svg?branch=master)](https://travis-ci.org/Khan/KaTeX)
[![codecov](https://codecov.io/gh/Khan/KaTeX/branch/master/graph/badge.svg)](https://codecov.io/gh/Khan/KaTeX)
[![Join the chat at https://gitter.im/Khan/KaTeX](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Khan/KaTeX?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Greenkeeper badge](https://badges.greenkeeper.io/Khan/KaTeX.svg)](https://greenkeeper.io/)
![](https://img.badgesize.io/Khan/KaTeX/v0.10.0-beta/dist/katex.min.js?compression=gzip)

KaTeX is a fast, easy-to-use JavaScript library for TeX math rendering on the web.

 * **Fast:** KaTeX renders its math synchronously and doesn't need to reflow the page. See how it compares to a competitor in [this speed test](http://www.intmath.com/cg5/katex-mathjax-comparison.php).
 * **Print quality:** KaTeX’s layout is based on Donald Knuth’s TeX, the gold standard for math typesetting.
 * **Self contained:** KaTeX has no dependencies and can easily be bundled with your website resources.
 * **Server side rendering:** KaTeX produces the same output regardless of browser or environment, so you can pre-render expressions using Node.js and send them as plain HTML.

KaTeX supports all major browsers, including Chrome, Safari, Firefox, Opera, Edge, and IE 9 - IE 11. More information can be found on the [list of supported commands](https://khan.github.io/KaTeX/function-support.html) and on the [wiki](https://github.com/khan/katex/wiki).

## Getting started

[Download KaTeX](https://github.com/khan/katex/releases) and host it on your server or include the `katex.min.js` and `katex.min.css` files on your page directly from a CDN:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.0-beta/dist/katex.min.css" integrity="sha384-9tPv11A+glH/on/wEu99NVwDPwkMQESOocs/ZGXPoIiLE8MU/qkqUcZ3zzL+6DuH" crossorigin="anonymous">
<script src="https://cdn.jsdelivr.net/npm/katex@0.10.0-beta/dist/katex.min.js" integrity="sha384-U8Vrjwb8fuHMt6ewaCy8uqeUXv4oitYACKdB0VziCerzt011iQ/0TqlSlv8MReCm" crossorigin="anonymous"></script>
```

#### In-browser rendering

Call `katex.render` with a TeX expression and a DOM element to render into:

```js
katex.render("c = \\pm\\sqrt{a^2 + b^2}", element);
```

To avoid escaping the backslash (double backslash), you can use
[`String.raw`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/raw)
(but beware that `${`, `\u` and `\x` may still need escaping):
```js
katex.render(String.raw`c = \pm\sqrt{a^2 + b^2}`, element);
```

If KaTeX can't parse the expression, it throws a `katex.ParseError` error.

#### Server side rendering or rendering to a string

To generate HTML on the server or to generate an HTML string of the rendered math, you can use `katex.renderToString`:

```js
var html = katex.renderToString("c = \\pm\\sqrt{a^2 + b^2}");
// '<span class="katex">...</span>'
```

Make sure to include the CSS and font files, but there is no need to include the JavaScript. Like `render`, `renderToString` throws if it can't parse the expression.

## Documentation

Learn more about using KaTeX [on the website](https://khan.github.io/KaTeX)!

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

KaTeX is licensed under the [MIT License](http://opensource.org/licenses/MIT).
