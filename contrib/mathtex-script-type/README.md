# `math/tex` Custom Script Type Extension

This is an extension to automatically display code inside `script` tags with `type=math/tex` using KaTeX.
This script type is commonly used by MathJax, so this can be used to support compatibility with MathJax.

### Usage

This extension isn't part of KaTeX proper, so the script should be separately
included in the page.
This include should be loaded after all `script` blocks you want to render.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/contrib/mathtex-script-type.min.js" integrity="sha384-o+v+EkJWQmZj7XwHBxehTGJKE18182WyyN2glZMTPw9g5XxjN1uwrquNuMX/NJiF"></script>
```

That's it.
