# `math/tex` Custom Script Type Extension

This is an extension to automatically display code inside `script` tags with `type=math/tex` using KaTeX.
This script type is commonly used by MathJax, so this can be used to support compatibility with MathJax.

### Usage

This extension isn't part of KaTeX proper, so the script should be separately
included in the page, in addition to KaTeX.

Load the extension by adding the following line to your HTML file.
This extension should be loaded *after* all `script type=math/tex` blocks that you want to render.

```html
<script src="https://cdn.jsdelivr.net/npm/katex@0.10.0/dist/contrib/mathtex-script-type.min.js" integrity="sha384-zWYbd0NBwgTsgIdFKVprSfTh1mbMPe5Hz1X3yY4Sd1h/K1cQoUe36OGwAGz/PcDy"></script>
```
Note that if the URL above contains `...` in-place of a version string, then this script has not yet
been deployed to the CDN.
You can download the script and use it locally, or from a local KaTeX installation instead.

For example, in the following simple page, we first load KaTeX as usual.
Then, in the body, we use a `math/tex` script to typeset the equation `x+\sqrt{1-x^2}`.
After we're done writing `math/tex` scripts, we load this extension.

```html
<html>
   <head>
       <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.0/dist/katex.min.css" integrity="sha384-9eLZqc9ds8eNjO3TmqPeYcDj8n+Qfa4nuSiGYa6DjLNcv9BtN69ZIulL9+8CqC9Y" crossorigin="anonymous">
       <script src="https://cdn.jsdelivr.net/npm/katex@0.10.0/dist/katex.min.js" integrity="sha384-K3vbOmF2BtaVai+Qk37uypf7VrgBubhQreNQe9aGsz9lB63dIFiQVlJbr92dw2Lx" crossorigin="anonymous"></script>
   </head>
   <body>
      <script type="math/tex">x+\sqrt{1-x^2}</script>
      <script src="https://cdn.jsdelivr.net/npm/katex@0.10.0/dist/contrib/mathtex-script-type.min.js" integrity="sha384-zWYbd0NBwgTsgIdFKVprSfTh1mbMPe5Hz1X3yY4Sd1h/K1cQoUe36OGwAGz/PcDy"></script>
   </body>
</html>
```
