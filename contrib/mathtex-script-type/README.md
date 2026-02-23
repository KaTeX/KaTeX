# `math/tex` Custom Script Type Extension

This is an extension to automatically display code inside `script` tags with `type=math/tex` using KaTeX.
This script type is commonly used by MathJax, so this can be used to support compatibility with MathJax.

### Usage

This extension isn't part of KaTeX proper, so the script should be separately
included in the page, in addition to KaTeX.

Load the extension by adding the following line to your HTML file.

```html
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.33/dist/contrib/mathtex-script-type.min.js" integrity="sha384-Va76RKpsqLRTaW8meIebMfcIo7cxNDc0uKaZNSuZzckwzNtDa3Xf77LciJ0CAjIC" crossorigin="anonymous"></script>
```
You can download the script and use it locally, or from a local KaTeX installation instead.

For example, in the following simple page, we first load KaTeX as usual.
Then, in the body, we use a `math/tex` script to typeset the equation `x+\sqrt{1-x^2}`.


```html
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.33/dist/katex.min.css" integrity="sha384-fgYS3VC1089n2J3rVcEbXDHlnDLQ9B2Y1hvpQ720q1NvxCduQqT4JoGc4u2QCnzE" crossorigin="anonymous">
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.33/dist/katex.min.js" integrity="sha384-YPHNAPyrxGS8BNnA7Q4ommqra8WQPEjooVSLzFgwgs8OXJBvadbyvx4QpfiFurGr" crossorigin="anonymous"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.33/dist/contrib/mathtex-script-type.min.js" integrity="sha384-Va76RKpsqLRTaW8meIebMfcIo7cxNDc0uKaZNSuZzckwzNtDa3Xf77LciJ0CAjIC" crossorigin="anonymous"></script>
    </head>
    <body>
        <script type="math/tex">x+\sqrt{1-x^2}</script>
    </body>
</html>
```

ECMAScript module is also available:
```html
<script type="module" src="https://cdn.jsdelivr.net/npm/katex@0.16.33/dist/contrib/mathtex-script-type.mjs" integrity="sha384-4EJvC5tvqq9XJxXvdD4JutBokuFw/dCe2AB4gZ9sRpwFFXECpL3qT43tmE0PkpVg" crossorigin="anonymous"></script>
