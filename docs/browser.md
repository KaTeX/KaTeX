---
id: browser
title: Browser
---
> KaTeX supports all major browsers, including Chrome, Safari, Firefox, Opera, Edge, and IE 11.

## Starter template

```html
<!DOCTYPE html>
<!-- KaTeX requires the use of the HTML5 doctype. Without it, KaTeX may not render properly -->
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.min.css" integrity="sha384-Pu5+C18nP5dwykLJOhd2U4Xen7rjScHN/qusop27hdd2drI+lL5KvX7YntvT8yew" crossorigin="anonymous">

    <!-- The loading of KaTeX is deferred to speed up page rendering -->
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.min.js" integrity="sha384-2B8pfmZZ6JlVoScJm/5hQfNS2TI/6hPqDZInzzPc8oHpN5SgeNOf4LzREO6p5YtZ" crossorigin="anonymous"></script>

    <!-- To automatically render math in text elements, include the auto-render extension: -->
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/contrib/auto-render.min.js" integrity="sha384-hCXGrW6PitJEwbkoStFjeJxv+fSOOQKOPbJxSfM6G5sWZjAyWhXiTIIAmQqnlLlh" crossorigin="anonymous"
        onload="renderMathInElement(document.body);"></script>
  </head>
  ...
</html>
```

## Loading as Global
If you include the `katex.js` directly, the `katex` object will be available as
a global variable.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.css" integrity="sha384-m7LqaUc4JRc2uA7D4zSVUs/sgkYhmOOe9+Gd8DFmmAXH8vzs15fmw05YXvpxsoQB" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.js" integrity="sha384-AKU9UZNxGoZDdbOuPirAjp5YAJHaXdiML6REmjU5jqb7ctYZwQ2ExOONIkLwo8U2" crossorigin="anonymous"></script>
```

KaTeX also provides minified versions:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.min.css" integrity="sha384-Pu5+C18nP5dwykLJOhd2U4Xen7rjScHN/qusop27hdd2drI+lL5KvX7YntvT8yew" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.min.js" integrity="sha384-2B8pfmZZ6JlVoScJm/5hQfNS2TI/6hPqDZInzzPc8oHpN5SgeNOf4LzREO6p5YtZ" crossorigin="anonymous"></script>
```

The examples above load the script [deferred using the `defer` attribute](https://developer.mozilla.org/en/HTML/Element/script#Attributes)
to speed up page rendering. The `katex` object will be available after
[`DOMContentLoaded` event is fired on the `document`](https://developer.mozilla.org/ko/docs/Web/Reference/Events/DOMContentLoaded).
If you do not use `defer`, `katex` object will be available after the corresponding
`script` tag.

If KaTeX is not used immediately or not critical, it is possible to load KaTeX
asynchronously. Add [`async` attribute](https://developer.mozilla.org/en/HTML/Element/script#Attributes)
to `script` and use [`rel="preload"` and `onload` attribute](https://github.com/filamentgroup/loadCSS)
on `link`.

By default, KaTeX fonts use `font-display: block` to prevent
[Flash of Unstyled Text (FOUT)](https://css-tricks.com/fout-foit-foft/).
If you would rather use `font-display: swap` to prevent
[Flash of Invisible Text (FOIT)](https://css-tricks.com/fout-foit-foft/),
include `katex-swap.css` or `katex-swap.min.css`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex-swap.min.css" integrity="sha384-TmCphkQRJZ6h5e3VPBmWxyG5KVl/1N27oPYDX+Qsu0H8tPq7vHsJphjzvK9Gxwls" crossorigin="anonymous">
```

To prevent both FOUT and FOIT, you can prefetch KaTeX fonts.
Use [Font Loading API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API)
or [Web Font Loader](https://github.com/typekit/webfontloader):

```html
<script>
  window.WebFontConfig = {
    custom: {
      families: ['KaTeX_AMS', 'KaTeX_Caligraphic:n4,n7', 'KaTeX_Fraktur:n4,n7',
        'KaTeX_Main:n4,n7,i4,i7', 'KaTeX_Math:i4,i7', 'KaTeX_Script',
        'KaTeX_SansSerif:n4,n7,i4', 'KaTeX_Size1', 'KaTeX_Size2', 'KaTeX_Size3',
        'KaTeX_Size4', 'KaTeX_Typewriter'],
    },
  };
</script>
<script defer src="https://cdn.jsdelivr.net/npm/webfontloader@1.6.28/webfontloader.js" integrity="sha256-4O4pS1SH31ZqrSO2A/2QJTVjTPqVe+jnYgOWUVr7EEc=" crossorigin="anonymous"></script>
```

You can also use [`rel="preload"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content).
Add `<link rel="preload" href=(path to WOFF2 font) as="font" type="font/woff2" crossorigin="anonymous">`
to `head`. Note that [only few browsers support it](https://caniuse.com/#feat=link-rel-preload)
and they all support WOFF2 so preloading WOFF2 fonts is enough.

See [Google Web Fundamentals - Web Font Optimization](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/webfont-optimization)
for more detail.

## Module Loaders
### AMD
```html
<script type="text/javascript">
    require([
        "https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.js",
    ], katex => {
        ...
    });
</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.css" integrity="sha384-m7LqaUc4JRc2uA7D4zSVUs/sgkYhmOOe9+Gd8DFmmAXH8vzs15fmw05YXvpxsoQB" crossorigin="anonymous">
```

### ECMAScript module
```html
<script type="module" type="text/javascript">
    import katex from 'https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.mjs';
    ...
</script>
<script nomodule defer src="https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.js" integrity="sha384-AKU9UZNxGoZDdbOuPirAjp5YAJHaXdiML6REmjU5jqb7ctYZwQ2ExOONIkLwo8U2" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.css" integrity="sha384-m7LqaUc4JRc2uA7D4zSVUs/sgkYhmOOe9+Gd8DFmmAXH8vzs15fmw05YXvpxsoQB" crossorigin="anonymous">
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
