## Parsing

There are general steps KaTeX takes when processing an input into
HTML and MathML.

1. Take input string and convert to a "tree".  This is somewhat of an
   intermediate abstract syntex tree and has the form of a `Array(ParseNode)`.
   These will be described below.
2. Take the `Array(ParseNode)` and convert to MathML.
3. Take the `Array(ParseNode)` and convert to HTML.

There is one somewhat important intermediate step taking in steps 2 and 3, which
is that KaTeX first takes this array of `ParseNode`s and converts it into
a an object wich represents the tree of markup that will be converted into actual
markup.  The reason this is somewhat of an important intermediate step is that this
"markup tree" found in the middle of step 3 is the closest thing that you will find
to an actual TeX abstract syntex tree.  Mostly since both TeX and HTML both like to
think of everything as boxes and how these boxes should interact with eachother.

We will first spend some time trying to understand this first step.  The intermediate
syntax tree which is simply an array of `ParseNode`s.

## ParseNodes

The folowing is a list of currently implemented ParseNodes.  They can roughly
categorized into four different groups.

1. [Symbols](#Symbols)
2. [Math Lists](#Math-Lists)
3. [Functions](#Functions)
4. [Wrappers](#Wrappers)

### Symbols

Symbols are the easiest of the four groups in that they have a minimal structure.
A typical example is the following:

```
type: "bin"
value: "+"
mode: "math"
```
Any token that can be found in `symbols.js` will have this structure.  It can occur
in either `math` mode or `text` mode, and the type can be any of the basic `atom`
types defined in TeX--accent, bin, close, inner, mathord, op, open, punct, rel--but
also include two special cases: spacing, textord.  The value is simply the unicode
character corresponding to the given symbol, for example `\u222b` is the symbol
corresponding to the integration operator `\int`; this is the `replace` field in the
definition of a symbol, and is not included in the `ParseNode`. The file `symbols.js`
also contains information about which font the unicode symbol is placed in.

### Math Lists

Math lists are supposed to be like a new list of `ParseNodes`, but these are wrapped
in an atomic type: accent, bin, op, rel, ord, etc.  As of right now there is only
one example, the `ordgroup`, but once `\mathord`, `\mathop`, and friends are
implemented there will be a few more that have this structure.
The definine characteristic of these nodes is that the `value` is an
array of `ParseNode`s.  The structure of an `ordgroup` is:

```
type: "ordgroup"
value: Array(ParseNode)
mode: "math"
```

Functions in `functions.js` will _always_ get this kind of node when the parameters
of the argument are enclosed in brackets `{` and `}`.  For instance, if you call
`\sqrt 2`, then the function `\sqrt` will get a single _symbol_ `ParseNode` with
a `value` of `2`.  In contrast if you call `\sqrt{2}`, then `\sqrt` will be passed
a single _ordgroup_ `ParseNode` with a `value` being a list containing a single
symbol parse node `[ ParseNode("mathord", "2", "math") ]`.  And of course if you called
`\sqrt{2+1}` then you would also get an _ordgroup_ `ParseNode` with a `value` of a list
containing three `ParseNode`s, one for each symbol in the arguments.

### Functions

Functions for our purposes are _most_ things that can be found in `functions.js`.
These _usually_ aren't the kind of tokens that you would see in a reference
implementation of TeX, but are more of a hard-coded shortcut of _most_ of the
commands that people find useful while using TeX.  Perhaps one of the easiest
examples is the `\sqrt` function.  The `\sqrt` function will have a `ParseNode`
that looks like this:

```
type: "\\sqrt"
value:
    type: "\\sqrt"
    body: PaseNode("ordgroup") \\ or a symbol ParseNode
mode: "math"
```

We have already discussed in the previous section why we will _usually_ expect a
`ParseNode("ordgroup")` in the value, but we also know that is not always the case.
It could simply be a symbol `ParseNode`.  But functions to use their arguments to
construct a richer structure which could be useful for processing later one.
On exmaple comes from the generalized fractions: `\frac`, `\dfrac`, `\binom`, etc.
These usually generate a structure that looks like:

```
type: "genfrac"
value:
    type: "genfrac"
    numer:
        type: "ordgroup"        // Always wrapped in single ordgroup
        value: Array(ParseNode)
        mode: "math"
    denom:
        type: "ordgroup"        // Always wrapped in single ordgroup
        value: Array(ParseNode)
        mode: "math"
    hasBarLine: <Bool>
    leftDelim: "("
    rightDelim: ")"
    size: "display"/"auto"/"text"
mode: "math"
```
In contrast to most functions, these will _always_ have `ordgroup`s in their `numer`
and `denom`, but this has more to do with how infix operators are parsed in general
than with whether or not we use braces to enclose our arguments.

One thing to keep in mind with functions is that they may have additional information
as shown in the `genfrac` type above that is expected from the parser.  One last
example, which is quite common, is the `subsup` node:

```
type: "supsub"
value:
    base: ParseNode  //either a symbol or ordgroup
    sup:  ParseNode  //either a symbol or ordgroup
    sub:  ParseNode  //either a symbol or ordgroup
mode: "math"
```

### Wrappers

These nodes are essentially how KaTeX handles parser variable scoping at the moment.
They are simply designed to wrap a list of `ParseNode`s and inform the renderer
that the following list of nodes should follow the following styles.  While this is
not how most reference TeX implementations will parse their input, this method
most easily translates for how this information will be processed by css when rendered.

You can find this type of nodes in

 - `\text`, `\phantom`, `\color`
 - Styling: `\displaystyle`, `\textstyle`, etc.
 - Sizing: `\Large`, `\huge`, `\tiny`, etc.
 - Font Changes: `\mathit`, `\mathbb`, `\mathrm`, etc.


 These are desgined to be as transparent as possible when being passed to the the renderer
 and so these usually have the structure of something like this (this particular example is
 for `\Large`):

```
type: "styling"
value:
    type: "size7"
    value: Array(ParseNode)
mode: "math"
```

The defining characteristic is the `Array(ParseNode)` in the `value.value`.  This is
to allow for an easy recursion when rendering, but also, and more importantly,
the need to avoid `ordgroup` types since these will impose additional structure to the
rendering and may interfere with spacing in the end result.