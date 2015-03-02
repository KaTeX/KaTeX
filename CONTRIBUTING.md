# Contributing to KaTeX

We welcome pull requests to KaTeX. If you'd like to add a new symbol, or try to
tackle adding a larger feature, keep reading. If you have any questions, or want
help solving a problem, feel free to stop by the [#katex room on
freenode](http://webchat.freenode.net/?channels=katex).

## Helpful contributions

If you'd like to contribute, try contributing new symbols or functions that
KaTeX doesn't currently support. The wiki has a page which lists [all of the
supported
functions](https://github.com/Khan/KaTeX/wiki/Function-Support-in-KaTeX). You
can check there to see if we don't support a function you like, or try your
function in the interactive demo at
[http://khan.github.io/KaTeX/](http://khan.github.io/KaTeX/).

#### Single symbols

There are many individual symbols that KaTeX doesn't yet support. Read through
the [symbols.js](src/symbols.js) file for more information on how to add a
symbol.

To figure out the unicode symbol for the symbol you are trying to add, try using
the symbol in MathJax to see what unicode symbol it outputs. An interactive
MathJax shell can be found [here](http://fiddle.jshell.net/YpqVp/41/show/).

To figure out what group your symbol falls into, look through the symbols list
to find other symbols of a similar kind. (e.g. if you were adding `\neq`, look
for `=`). If you cannot find anything similar, or are unsure, you can try using
your symbol in TeX surrounded by other different kinds of symbols, and seeing
whether your spacing matches the spacing that TeX produces.

Once your symbol works, check the JavaScript console to make sure you don't get
a message like "Can't find character metrics for _" when you render your symbol.
If you do, check out [extract_ttfs.py](metrics/extract_ttfs.py).

#### Adding new functions

Most functions are handled in the [functions.js](src/functions.js) file. Read
the comments in there to get started. If the function you want to add has
similar output to an existing function, see if you can add a new line to that
file to get it to work.

If your function isn't similar to an existing function, you'll need to add a
line to `functions.js` as well as adding an output function in
[buildHTML.js](src/buildHTML.js) and [buildMathML.js](src/buildMathML.js).

## Testing

Local testing can be done by running the node server in `server.js`. Run `make
setup` to install dependencies, and then `make serve` to start the server.

This will host an interactive editor at
[http://localhost:7936/](http://localhost:7936/) to play around with and test
changes.

#### Jasmine tests

The JavaScript parser and some of the tree
builder is tested with Jasmine. These tests can be run either using node with
`make test`, or in the browser by visiting
[http://localhost:7936/test/test.html](http://localhost:7936/test/test.html).

The Jasmine tests should be run after every change, even the addition of small
symbols. However, [Travis](https://travis-ci.org/Khan/KaTeX/) will run these
tests when you submit a pull request, in case you forget.

If you make any changes to Parser.js, add Jasmine tests to ensure they work.

#### Huxley tests

To ensure the final output looks good, we use
[Huxley](https://github.com/chenglou/node-huxley) tests, which screenshot
different expressions. These tests can be run by using the [Huxley
docker](https://github.com/Khan/KaTeX/tree/master/dockers/HuxleyTests).

The Huxley tests should be run if you add anything more significant than
individual symbols. These tests are not automatically run, so please remember!
If the new images are different (meaning they are not byte-by-byte the same as
the old ones), inspect them visually. If there are no visible changes, that is
okay. If things change in a way consistent with your additions, explain what
changed and why. Otherwise, figure out what is causing the changes and fix it!

If you add a feature that is dependent on the final output looking the way you
created it, add a huxley test. See
[Huxleyfile.json](test/huxley/Huxleyfile.json).

#### Testing in other browsers

KaTeX supports all major browsers, including IE 8 and newer. Unfortunately, it
is hard to test new changes in many browsers. If you can, please test your
changes in as many browsers as possible. In particular, if you make CSS changes,
try to test in IE 8, using [modern.ie](http://modern.ie) VMs.

## Style guide

Code

 - 4 spaces for indentation
 - 80 character line length
 - commas last
 - declare variables in the outermost scope that they are used

In general, try to make your code blend in with the surrounding code.

## CLA

In order to contribute to KaTeX, you must first sign the CLA, found at www.khanacademy.org/r/cla

## License

KaTeX is licenced under the [MIT License](http://opensource.org/licenses/MIT).
