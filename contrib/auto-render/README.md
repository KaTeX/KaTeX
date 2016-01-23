# Auto-render extension

This is an extension to automatically render all of the math inside of text. It
searches all of the text nodes in a given element for the given delimiters, and
renders the math in place.

### Usage

This extension isn't part of KaTeX proper, so the script should be separately
included in the page:

```html
<script src="/path/to/auto-render.min.js"></script>
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

### API

This extension exposes a single function, `window.renderMathInElement`, with
the following API:

```js
function renderMathInElement(elem, options)
```

`elem` is an HTML DOM element. The function will recursively search for text
nodes inside this element and render the math in them.

`options` is an optional object argument with the following keys:

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
