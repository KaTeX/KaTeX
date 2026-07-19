---
id: browser
title: Browser
---
> KaTeX supports all major browsers, including Chrome, Safari, Firefox, Opera, and Edge.

## Starter template

```html
<!DOCTYPE html>
<!-- KaTeX requires the use of the HTML5 doctype. Without it, KaTeX may not render properly -->
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.18.1/dist/katex.min.css" integrity="sha384-1vdNCNel6Tx/NQa8IR1mGOGKsbGreCkOPfbtPPnUURJ5Tu2PRVfQ/7KLZC+Pi1p1" crossorigin="anonymous">

    <!-- The loading of KaTeX is deferred to speed up page rendering -->
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.18.1/dist/katex.min.js" integrity="sha384-ycJ6GAwiS15LoUPipwJOrWTvkUHl/YqELValBwI5I4awP1EeEQJYarj+w85ntcz7" crossorigin="anonymous"></script>

    <!-- To automatically render math in text elements, include the auto-render extension: -->
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.18.1/dist/contrib/auto-render.min.js" integrity="sha384-bjyGPfbij8/NDKJhSGZNP/khQVgtHUE5exjm4Ydllo42FwIgYsdLO2lXGmRBf5Mz" crossorigin="anonymous"
        onload="renderMathInElement(document.body);"></script>
  </head>
  ...
</html>
```

## Loading as Global
If you include the `katex.js` directly, the `katex` object will be available as
a global variable.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.18.1/dist/katex.css" integrity="sha384-mDwgJf4fSdy1cuCt6ndTf3KcFEfjEDEZHEcauMU2t/mKKJMnmFyp8ktdfhShQkrj" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.18.1/dist/katex.js" integrity="sha384-eKx3OjqiLq9Hfcx4y8jmJjbCLML1+NbIhzNFI0GWgXLI6NbTOEuLtylAIghSq9Du" crossorigin="anonymous"></script>
```

KaTeX also provides minified versions:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.18.1/dist/katex.min.css" integrity="sha384-1vdNCNel6Tx/NQa8IR1mGOGKsbGreCkOPfbtPPnUURJ5Tu2PRVfQ/7KLZC+Pi1p1" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.18.1/dist/katex.min.js" integrity="sha384-ycJ6GAwiS15LoUPipwJOrWTvkUHl/YqELValBwI5I4awP1EeEQJYarj+w85ntcz7" crossorigin="anonymous"></script>
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
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.18.1/dist/katex-swap.min.css" integrity="sha384-K1TI7Ktijrt7j4OXUE01l7B+930e+/TANYDr7BOcY1nzek+4rm/Bew0vPAFebOVV" crossorigin="anonymous">
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
        "https://cdn.jsdelivr.net/npm/katex@0.18.1/dist/katex.js",
    ], katex => {
        ...
    });
</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.18.1/dist/katex.css" integrity="sha384-mDwgJf4fSdy1cuCt6ndTf3KcFEfjEDEZHEcauMU2t/mKKJMnmFyp8ktdfhShQkrj" crossorigin="anonymous">
```

### ECMAScript module
```html
<script type="module" type="text/javascript">
    import katex from 'https://cdn.jsdelivr.net/npm/katex@0.18.1/dist/katex.mjs';
    ...
</script>
<script nomodule defer src="https://cdn.jsdelivr.net/npm/katex@0.18.1/dist/katex.js" integrity="sha384-eKx3OjqiLq9Hfcx4y8jmJjbCLML1+NbIhzNFI0GWgXLI6NbTOEuLtylAIghSq9Du" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.18.1/dist/katex.css" integrity="sha384-mDwgJf4fSdy1cuCt6ndTf3KcFEfjEDEZHEcauMU2t/mKKJMnmFyp8ktdfhShQkrj" crossorigin="anonymous">
```

> Use [`nomodule` attribute](https://developer.mozilla.org/en/HTML/Element/script#Attributes)
to provide a fallback for older browsers that do not support ES modules.

## Bundler
[Use Node.js package managers to install KaTeX and import it](node.md) in your
project. Then bundle using bundlers like [webpack](https://webpack.js.org/) or
[rollup.js](https://rollupjs.org/). Note that you have to bundle the stylesheet
(`katex.css`) or include it manually.

## Download & Host Things Yourself
If you do not want to rely on a CDN, you can serve KaTeX from your own
infrastructure. There are two ways to get a release:

### Option 1: Pre-built release from GitHub

Each release ships pre-built `katex.tar.gz` and `katex.zip` archives.
Download one from the [KaTeX releases page](https://github.com/KaTeX/KaTeX/releases) —
look under **Assets** for `katex.tar.gz` or `katex.zip`, *not* the
auto-generated "Source code" download, which only contains the repo
source tree without the built files.

After extracting, you will get a `katex/` folder containing every file you need:

```
katex/
├── README.md
├── katex.js              # unminified UMD build
├── katex.min.js          # minified UMD build (recommended for production)
├── katex.mjs             # ES module build
├── katex.css             # stylesheet (font-display: block)
├── katex.min.css         # minified stylesheet
├── katex-swap.css        # stylesheet variant (font-display: swap)
├── katex-swap.min.css
├── contrib/              # optional extensions (each shipped as .js, .min.js, and .mjs)
│   ├── auto-render.js
│   ├── auto-render.min.js
│   ├── auto-render.mjs
│   ├── copy-tex.js
│   ├── copy-tex.min.js
│   ├── copy-tex.mjs
│   ├── mathtex-script-type.js
│   ├── mathtex-script-type.min.js
│   ├── mathtex-script-type.mjs
│   ├── mhchem.js
│   ├── mhchem.min.js
│   ├── mhchem.mjs
│   ├── render-a11y-string.js
│   ├── render-a11y-string.min.js
│   └── render-a11y-string.mjs
└── fonts/                # WOFF2/WOFF/TTF font files (required)
```

### Option 2: npm

```bash
npm install katex
# or
yarn add katex
# or
pnpm add katex
```

After installing, the files you want for hosting live under
`node_modules/katex/dist/` — same layout as the `katex/` folder above.

> The npm package also ships the unbuilt TypeScript source (`node_modules/katex/src/`,
> `node_modules/katex/contrib/`, `node_modules/katex/katex.ts`) for
> bundler users. Do not link those from your HTML — only the files
> under `dist/` are meant to be served as-is.

### Serving the files

Copy the entire folder (or just the pieces you need plus `fonts/`) into
your web server's static directory. **The `fonts/` directory must stay
alongside the CSS file** — `katex.css` references the fonts using
relative URLs (e.g. `url("fonts/KaTeX_AMS-Regular.woff2")`), so moving
or renaming `fonts/` will break math rendering.

Assuming you copied `katex/` to the root of your site, the following
HTML will load KaTeX with auto-rendering enabled:

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="/katex/katex.min.css">

    <!-- The loading of KaTeX is deferred to speed up page rendering -->
    <script defer src="/katex/katex.min.js"></script>

    <!-- To automatically render math in text elements, include the auto-render extension: -->
    <script defer src="/katex/contrib/auto-render.min.js"
        onload="renderMathInElement(document.body);"></script>
  </head>
  <body>
    ...
  </body>
</html>
```

Adjust the `/katex/` prefix to match wherever you placed the files. If
you only need to render math via the JavaScript API (and not the
auto-render extension), you can omit the `auto-render.min.js` script.
Swap `katex.min.css`, `katex.min.js`, and `contrib/auto-render.min.js`
for the unminified `katex.css`, `katex.js`, and `contrib/auto-render.js`
if you prefer readable files for debugging.

### Keeping your copy up to date

Every release publishes the same file names at the same paths, so
updating is a drop-in replace. To update:

1. Get the new release files:
   - **Archive:** download a fresh `katex.tar.gz` (or `katex.zip`) and
     extract it.
   - **npm:** run `npm install katex@latest` (or `yarn upgrade katex@latest`). The new
     files appear in `node_modules/katex/dist/`.
2. Replace the `katex/` directory on your web server with the new
   files — extracted from the archive, or copied from
   `node_modules/katex/dist/`. Keep the same folder name so existing
   HTML keeps working.
3. Skim the [CHANGELOG](https://github.com/KaTeX/KaTeX/blob/main/CHANGELOG.md)
   for any breaking changes between your old version and the new one.

You can also build from source. See [Building from Source](node.md#building-from-source)
for more details.
