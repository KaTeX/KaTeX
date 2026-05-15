# `math/tex` Custom Script Type Extension

This is an extension to automatically display code inside `script` tags with `type=math/tex` using KaTeX.
This script type is commonly used by MathJax, so this can be used to support compatibility with MathJax.

### Usage

This extension isn't part of KaTeX proper, so the script should be separately
included in the page, in addition to KaTeX.

Load the extension by adding the following line to your HTML file.

```html
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.46/dist/contrib/mathtex-script-type.min.js" integrity="sha384-W8gaN87yMtPe/iAcxlyIDA8OVOzZvVD4c/HEE6QHhIyo8yHnVSXLzzy+eNWwpivm" crossorigin="anonymous"></script>
```
You can download the script and use it locally, or from a local KaTeX installation instead.

For example, in the following simple page, we first load KaTeX as usual.
Then, in the body, we use a `math/tex` script to typeset the equation `x+\sqrt{1-x^2}`.


```html
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.46/dist/katex.min.css" integrity="sha384-hW6ZmmePRD2f/9cuxGE6C9faGprtIBOme5OLUiEjtRKMTN67tY23ur9eAi21H8De" crossorigin="anonymous">
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.46/dist/katex.min.js" integrity="sha384-FVvsvR4UzyIP8Y5hVvHjOfjVh+LWV78ll63SYx1t+nuuMPGMAihB8dJ2YsYyg1Wb" crossorigin="anonymous"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.46/dist/contrib/mathtex-script-type.min.js" integrity="sha384-W8gaN87yMtPe/iAcxlyIDA8OVOzZvVD4c/HEE6QHhIyo8yHnVSXLzzy+eNWwpivm" crossorigin="anonymous"></script>
    </head>
    <body>
        <script type="math/tex">x+\sqrt{1-x^2}</script>
    </body>
</html>
```

ECMAScript module is also available:
```html
<script type="module" src="https://cdn.jsdelivr.net/npm/katex@0.16.46/dist/contrib/mathtex-script-type.mjs" integrity="sha384-4pY6Hczg2Rj0O1719BbDGKN5JSkitfLp1BU8Jke61b3VKMgoKu1lE6al9tMzy3q2" crossorigin="anonymous"></script>
