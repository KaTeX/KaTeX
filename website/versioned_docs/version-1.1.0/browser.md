---
id: version-1.1.0-browser
title: Browser
original_id: browser
---
> KaTeX supports all major browsers, including Chrome, Safari, Firefox, Opera, Edge, and IE 9–11.

## CDN (Content Delivery Network)
Use CDN to deliver KaTeX to your project:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@1.1.0/dist/katex.css" integrity="sha384-uayAVT74OKnJRynMT7ZCp9xwD2vaZgfeRZie6NhTqlu0eLPogAg14A4dlnCcuuMy" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@1.1.0/dist/katex.js" integrity="sha384-IsQHATGRdh1udSST2JDWHPm8JRnP+h378YNJQWCrUhQKlbPGukYhN8uWN9brnJtl" crossorigin="anonymous"></script>
```

KaTeX also provides minified versions:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@1.1.0/dist/katex.min.css" integrity="sha384-V2aA1l0T0v8Xc49/G/99lnQINjPV395WcAUNy16CyJ3CkhWeaed8RjR/VVpSB9nL" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@1.1.0/dist/katex.min.js" integrity="sha384-zsocTD8Agk2odAyI6q4R5AkfcZXO/riE8nRW5DrYDJ8NrwAmX6rptoT7VyErPtoY" crossorigin="anonymous"></script>
```

> The loading of scripts are [deferred using `defer` attribute](https://developer.mozilla.org/en/HTML/Element/script#Attributes)
to speed up page rendering. The `katex` object will be available after
[`DOMContentLoaded` event is fired on the `document`](https://developer.mozilla.org/ko/docs/Web/Reference/Events/DOMContentLoaded).
If you do not use `defer`, `katex` object will be available after corresponding
`script` tag.

> If KaTeX is not used immediately or not critical, it is possible to load KaTeX
asynchronously. Add [`async` attribute](https://developer.mozilla.org/en/HTML/Element/script#Attributes)
to `script` and use [`rel="preload"` and `onload` attribute](https://github.com/filamentgroup/loadCSS)
on `link`.

> You can prefetch KaTeX fonts to prevent FOUT or FOIT. Use [Web Font Loader](https://github.com/typekit/webfontloader)
or add [`<link rel="preload" href=(path to WOFF2 font) as="font" type="font/woff2" crossorigin="anonymous">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content)
to `head`. (Note that only few browsers [support `rel="preload"`](https://caniuse.com/#feat=link-rel-preload)
and they all support WOFF2 so preloading WOFF2 fonts is enough.) You can use
Chrome DevTools Network panel or similar to find out which fonts are used.

## Download & Host Things Yourself
Download a [KaTeX release](https://github.com/Khan/KaTeX/releases),
copy `katex.js`, `katex.css`
(or `katex.min.js` and `katex.min.css` to use minified versions),
and the `fonts` directory, and include like above.

You can also build from source. See [Building from Source](node.md#building-from-source)
for more details.

## Bundler
Use [Node.js package managers](node.md) to install KaTeX and require it in your
project. Then bundle using bundlers like [webpack](https://webpack.js.org/) or
[rollup.js](https://rollupjs.org/). Note that you have to bundle the stylesheet
(`katex.css`) or include it manually.
