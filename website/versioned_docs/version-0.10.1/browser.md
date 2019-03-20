---
id: version-0.10.1-browser
title: Browser
original_id: browser
---
> KaTeX supports all major browsers, including Chrome, Safari, Firefox, Opera, Edge, and IE 9–11.

## Global
If you include the `katex.js` directly, the `katex` object will be available as
a global variable.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.1/dist/katex.css" integrity="sha384-b/NoaeRXkMxyKcrDw2KtVtYKkVg3dA0rTRgLoV7W2df3MzeR1eHLTi+l4//4fMwk" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.10.1/dist/katex.js" integrity="sha384-ern5NCRqs6nJ/a4Ik0nB9hnKVH5HwV2XRUYdQl09OB/vvd1Lmmqbg1Mh+mYUclXx" crossorigin="anonymous"></script>
```

KaTeX also provides minified versions:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.1/dist/katex.min.css" integrity="sha384-dbVIfZGuN1Yq7/1Ocstc1lUEm+AT+/rCkibIcC/OmWo5f0EA48Vf8CytHzGrSwbQ" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.10.1/dist/katex.min.js" integrity="sha384-2BKqo+exmr9su6dir+qCw08N2ZKRucY4PrGQPPWU1A7FtlCGjmEGFqXCv5nyM5Ij" crossorigin="anonymous"></script>
```

The loading of scripts are [deferred using `defer` attribute](https://developer.mozilla.org/en/HTML/Element/script#Attributes)
to speed up page rendering. The `katex` object will be available after
[`DOMContentLoaded` event is fired on the `document`](https://developer.mozilla.org/ko/docs/Web/Reference/Events/DOMContentLoaded).
If you do not use `defer`, `katex` object will be available after corresponding
`script` tag.

If KaTeX is not used immediately or not critical, it is possible to load KaTeX
asynchronously. Add [`async` attribute](https://developer.mozilla.org/en/HTML/Element/script#Attributes)
to `script` and use [`rel="preload"` and `onload` attribute](https://github.com/filamentgroup/loadCSS)
on `link`.

You can prefetch KaTeX fonts to prevent FOUT or FOIT. Use [Web Font Loader](https://github.com/typekit/webfontloader)
or add [`<link rel="preload" href=(path to WOFF2 font) as="font" type="font/woff2" crossorigin="anonymous">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content)
to `head`. (Note that only few browsers [support `rel="preload"`](https://caniuse.com/#feat=link-rel-preload)
and they all support WOFF2 so preloading WOFF2 fonts is enough.) You can use
Chrome DevTools Network panel or similar to find out which fonts are used.

## Module Loaders
### AMD
```html
<script type="text/javascript">
    require([
        "https://cdn.jsdelivr.net/npm/katex@0.10.1/dist/katex.js",
    ], katex => {
        ...
    });
</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.1/dist/katex.css" integrity="sha384-b/NoaeRXkMxyKcrDw2KtVtYKkVg3dA0rTRgLoV7W2df3MzeR1eHLTi+l4//4fMwk" crossorigin="anonymous">
```

### ECMAScript module
```html
<script type="module" type="text/javascript">
    import katex from 'https://cdn.jsdelivr.net/npm/katex@0.10.1/dist/katex.mjs';
    ...
</script>
<script nomodule defer src="https://cdn.jsdelivr.net/npm/katex@0.10.1/dist/katex.js" integrity="sha384-ern5NCRqs6nJ/a4Ik0nB9hnKVH5HwV2XRUYdQl09OB/vvd1Lmmqbg1Mh+mYUclXx" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.1/dist/katex.css" integrity="sha384-b/NoaeRXkMxyKcrDw2KtVtYKkVg3dA0rTRgLoV7W2df3MzeR1eHLTi+l4//4fMwk" crossorigin="anonymous">
```

> Use [`nomodule` attribute](https://developer.mozilla.org/en/HTML/Element/script#Attributes)
to provide a fallback for older browsers that do not support ES modules.

## Download & Host Things Yourself
Download a [KaTeX release](https://github.com/KaTeX/KaTeX/releases),
copy `katex.js`, `katex.css`
(or `katex.min.js` and `katex.min.css` to use minified versions),
and the `fonts` directory, and include or import it like above.

You can also build from source. See [Building from Source](node.md#building-from-source)
for more details.

## Bundler
[Use Node.js package managers to install KaTeX and import it](node.md) in your
project. Then bundle using bundlers like [webpack](https://webpack.js.org/) or
[rollup.js](https://rollupjs.org/). Note that you have to bundle the stylesheet
(`katex.css`) or include it manually.
