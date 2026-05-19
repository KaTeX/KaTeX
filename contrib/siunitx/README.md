# siunitx extension

This extension adds siunitx-compatible commands to KaTeX, including:
`\sisetup`, `\num`, `\si`, `\unit`, `\SI`, `\qty`, `\ang`, and related list/range forms.

## Usage

This extension is not part of core KaTeX and must be loaded separately.

### Browser

Load it after `katex.js`:

```html
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.45/dist/katex.min.js" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.45/dist/contrib/siunitx.min.js" crossorigin="anonymous"></script>
```

### Node / bundlers

```js
const katex = require("katex");
require("katex/contrib/siunitx");
```

Or with ESM:

```js
import katex from "katex";
import "katex/contrib/siunitx";
```

## Notes

- The `siunitx` render option (for example `siunitx: "group-separator={,}"`) requires this extension to be loaded first.
- The extension registers its commands on the KaTeX instance when imported.
- KaTeX exposes `__siunitxInternals` so this extension can register into core internals. This is an unstable internal bridge for `contrib/siunitx` only, not a public/general extension API.
