---
id: api
title: API
---
## In-browser rendering
Call `katex.render` with a TeX expression and a DOM element to render into:

```js
katex.render("c = \\pm\\sqrt{a^2 + b^2}", element, {
    throwOnError: false
});
```

To avoid escaping the backslash (double backslash), you can use
[`String.raw`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/raw)
(but beware that escaping `${` and backtick is not possible while using `String.raw`).
```js
katex.render(String.raw`c = \pm\sqrt{a^2 + b^2}`, element, {
    throwOnError: false
});
```

## Server-side rendering or rendering to a string
To generate HTML on the server or to generate an HTML string of the rendered math, you can use `katex.renderToString`:

```js
var html = katex.renderToString("c = \\pm\\sqrt{a^2 + b^2}", {
    throwOnError: false
});
// '<span class="katex">...</span>'
```

## Handling errors

The examples above use the `throwOnError: false` option, which renders invalid
inputs as the TeX source code in red (by default), with the error message as
hover text.  Without this option, invalid LaTeX will cause a
`katex.ParseError` exception to be thrown.  See [handling errors](error.md).

## Configuring KaTeX

The last argument to `katex.render` and `katex.renderToString` can contain
[a variety of rendering options](options.md).

## Persistent Macros

KaTeX’s [macro documentation](supported.html#gdef) tells the author that `\gdef` will create a macro that persists between KaTeX elements. In order to enable that persistence, you must create one shared `macros` object that you pass into every call to `katex.render` or `katex.renderToString`. (Do not create a fresh `macros` object for each call.)

For example, suppose that you have an array `mathElements` of DOM elements that contain math. Then you could write this code:

```js
const macros = {};
for (let element of mathElements) {
    katex.render(element.textContent, element, {
        throwOnError: false,
        macros
    };
}
```

Notice that you create the `macros` object outside the loop. If an author uses `\gdef`, KaTeX will insert that macro definition into the `macros` object and since `macros` continues to exist between calls to `katex.render`, `\gdef` macros will persist between `mathElements`.

### Security of Persistent Macros

Persistent macros can change the behavior of KaTeX (e.g. redefining standard commands), so for security, such a setup should be used only for multiple elements of common trust.  For example, you might enable persistent macros within a message posted by a single user (by creating a `macros` object for that message), but you probably should not enable persistent macros across multiple messages posted by multiple users.

## Extension APIs

KaTeX provides APIs for extending its functionality with custom macros, symbols, and functions.

### `katex.defineMacro`

Registers a macro that expands to a LaTeX string. This is the simplest way to extend KaTeX.

```js
// Simple string replacement
katex.defineMacro("\\RR", "\\mathbb{R}");

// Function-based macro with access to the token stream
katex.defineMacro("\\bold", function(context) {
    // consumeArgs returns Token[][]; [0] gets the first argument's tokens.
    // Tokens are in reverse order (stack), so reverse before joining.
    const arg = context.consumeArgs(1)[0];
    return "\\mathbf{" + arg.reverse().map(t => t.text).join("") + "}";
});
```

### `katex.defineSymbol`

Registers a symbol that maps a LaTeX command to a unicode character with a specified atom type and font.

```js
// Register a custom relation symbol
katex.defineSymbol(
    "math",     // mode: "math" or "text"
    "main",     // font: "main" or "ams"
    "rel",      // group: atom type for spacing (e.g. "rel", "bin", "mathord")
    "\u2A75",   // unicode replacement character (U+2A75: two consecutive equals signs)
    "\\emark",  // LaTeX command name
    true        // also accept the unicode character as input
);
```

The `group` parameter determines spacing around the symbol. Common values:
- `"rel"`: relation (like `=`), `"bin"`: binary operator (like `+`), `"mathord"`: ordinary symbol, `"open"`/`"close"`: delimiters, `"punct"`: punctuation

> **Note:** The replacement character must have metrics in KaTeX's font files for
> correct rendering. Characters not covered by KaTeX's fonts will render but may
> produce warnings or incorrect sizing.

### `katex.defineFunction`

Registers a custom LaTeX command with full control over parsing and rendering. This is an advanced API — it requires returning internal DOM tree nodes from the builder functions.

```js
katex.defineFunction({
    type: "myFunc",           // unique parse node type
    names: ["\\myFunc"],      // LaTeX command name(s)
    props: { numArgs: 1 },    // parsing properties
    handler: ({parser}, args) => {
        return {
            type: "myFunc",
            mode: parser.mode,
            body: args[0],
        };
    },
    // htmlBuilder and mathmlBuilder must return internal KaTeX DOM nodes
    // (see katex.__domTree). If a builder is omitted, KaTeX will throw
    // when rendering in the corresponding output mode.
});
```

The `props` object supports:
- `numArgs`: Number of required arguments
- `numOptionalArgs`: Number of optional arguments (default `0`)
- `argTypes`: Array of argument types (e.g. `"color"`, `"size"`, `"url"`)
- `allowedInText`: Whether the function is allowed in text mode (default `false`)
- `allowedInMath`: Whether the function is allowed in math mode (default `true`)

For simple extensions, prefer `defineMacro`. Use `defineFunction` only when you need custom argument parsing or rendering with access to KaTeX's internal DOM tree builders (`__domTree`).
