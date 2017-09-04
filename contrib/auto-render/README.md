# Auto-render extension

This is an extension to automatically render all of the math inside of text. It
searches all of the text nodes in a given element for the given delimiters, and
renders the math in place.

### Usage

This extension isn't part of KaTeX proper, so the script should be separately
included in the page:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.8.3/contrib/auto-render.min.js" integrity="sha384-RkgGHBDdR8eyBOoWeZ/vpGg1cOvSAJRflCUDACusAAIVwkwPrOUYykglPeqWakZu" crossorigin="anonymous"></script>
```

Then, call the exposed `renderMathInElement` function in a script tag
before the close body tag:

```html
<body>
  ...
  <script>
    renderMathInElement(document.body);
  </script>
</body>
```

See [index.html](index.html) for an example.
(To run this example from a clone of the repository, run `make serve`
in the root KaTeX directory, and then visit
http://0.0.0.0:7936/contrib/auto-render/index.html
with your web browser.)

If you prefer to have all your setup inside the html `<head>`,
you can use the following script there
(instead of the one above at the end of the `<body>`):

```html
<head>
  ...
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      renderMathInElement(document.body);
    });
  </script>
  ...
</head>
```

### API

This extension exposes a single function, `window.renderMathInElement`, with
the following API:

```js
function renderMathInElement(elem, options)
```

`elem` is an HTML DOM element. The function will recursively search for text
nodes inside this element and render the math in them.

`options` is an optional object argument that can have the same keys as [the 
object passed to `katex.render`](https://github.com/Khan/KaTeX/#rendering-options),
in addition to two auto-render-specific keys:

- `delimiters`: This is a list of delimiters to look for math. Each delimiter
  has three properties:

    - `left`: A string which starts the math expression (i.e. the left delimiter).
    - `right`: A string which ends the math expression (i.e. the right delimiter).
    - `display`: A boolean of whether the math in the expression should be
      rendered in display mode or not.

  The default value is:
   
  ```js
  [
    {left: "$$", right: "$$", display: true},
    {left: "\\[", right: "\\]", display: true},
    {left: "\\(", right: "\\)", display: false}
  ]
  ```

- `ignoredTags`: This is a list of DOM node types to ignore when recursing
  through. The default value is
  `["script", "noscript", "style", "textarea", "pre", "code"]`. 
  
- `errorCallback`: A callback method returning a message and an error stack
  in case of an critical error during rendering. The default uses `console.error`.

Note that the `displayMode` property of the options object is ignored, and is 
instead taken from the `display` key of the corresponding entry in the 
`delimiters` key.