---
id: error
title: Handling Errors
---
If KaTeX encounters an error (invalid or unsupported LaTeX) and `throwOnError`
hasn't been set to `false`, then it will throw an exception of type
`ParseError`.  The message in this error includes some of the LaTeX
source code, so needs to be escaped if you want to render it to HTML.

In particular, you should convert `&`, `<`, `>` characters to
`&amp;`, `&lt;`, `&gt;` (e.g., using `_.escape`)
before including either LaTeX source code or exception messages in your
HTML/DOM.  (Failure to escape in this way makes a `<script>` injection
attack possible if your LaTeX source is untrusted.)

Alternatively, you can set `throwOnError` to `false` to use built-in behavior
of rendering the LaTeX source code with hover text stating the error.
