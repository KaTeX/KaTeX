# `math/tex` Custom Script Type Extension

This is an extension to automatically display code inside `script` tags with `type=math/tex` using KaTeX.
This script type is commonly used by MathJax, so this can be used to support compatibility with MathJax.

### Usage

This extension isn't part of KaTeX proper, so the script should be separately
included in the page, in addition to KaTeX.

Load the extension by adding the following line to your HTML file.

```html
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.13/dist/contrib/mathtex-script-type.min.js" integrity="sha384-sg4gBRJTqTCyzYbB7e72xGs3dA2LK994XRZS6urZW6Uh6Mu3j2JJ3YG2s9HALO8U" crossorigin="anonymous"></script>
```
You can download the script and use it locally, or from a local KaTeX installation instead.

For example, in the following simple page, we first load KaTeX as usual.
Then, in the body, we use a `math/tex` script to typeset the equation `x+\sqrt{1-x^2}`.


```html
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.13/dist/katex.min.css" integrity="sha384-zbfIHNuzh376xnNwg57dvZ5Efh5rIH7XhUz6oXBlVORc5vofb/+XJagCnNy5t4OV" crossorigin="anonymous">
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.13/dist/katex.min.js" integrity="sha384-hJogzKcXN+eoavCV4I7R4pxsAyyTn1Pb5B5+ivCOZn3w2SxZrgGvXmcCia0jnt6N" crossorigin="anonymous"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.13/dist/contrib/mathtex-script-type.min.js" integrity="sha384-sg4gBRJTqTCyzYbB7e72xGs3dA2LK994XRZS6urZW6Uh6Mu3j2JJ3YG2s9HALO8U" crossorigin="anonymous"></script>
    </head>
    <body>
        <script type="math/tex">x+\sqrt{1-x^2}</script>
    </body>
</html>
```

ECMAScript module is also available:
```html
<script type="module" src="https://cdn.jsdelivr.net/npm/katex@0.16.13/dist/contrib/mathtex-script-type.mjs" integrity="sha384-4EJvC5tvqq9XJxXvdD4JutBokuFw/dCe2AB4gZ9sRpwFFXECpL3qT43tmE0PkpVg" crossorigin="anonymous"></script>
