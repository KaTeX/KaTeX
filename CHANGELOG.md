# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).


## [v0.9.0] - 2018-02-18
### Added
- Italic Greek capital letters [#1118](https://github.com/Khan/KaTeX/pull/1103)
- Added support for `\mathring` [#1125](https://github.com/Khan/KaTeX/pull/1125)
- Added support for unicode angle brackets, single vertical bar, double vertical bar [#1123](https://github.com/Khan/KaTeX/pull/1123)
- Added support for Reaction Arrows [#1078](https://github.com/Khan/KaTeX/pull/1078)
- Added `\nobreakspace` [#1145](https://github.com/Khan/KaTeX/pull/1145)
- Added support for Unicode colon equals ≔ [#1151](https://github.com/Khan/KaTeX/pull/1151)
- Added support for `\underline` in text mode [#1159](https://github.com/Khan/KaTeX/pull/1159)

### Changed
- Enable spacing functions in text mode [#1139](https://github.com/Khan/KaTeX/pull/1139)

### Fixes
- Improved JS spacing [#1103](https://github.com/Khan/KaTeX/pull/1103)
- Fixed handling of Unicode characters ð, Å, å [#1157](https://github.com/Khan/KaTeX/pull/1157)
- Padding over `\sqrt` and Paths for frac-line [#1143](https://github.com/Khan/KaTeX/pull/1143)


## [v0.9.0-beta1] - 2018-01-28
### Added
- Added support for `\aa`, `\AA`, `\lq`, `\rq`, `\lbrack`, `\rbrack` [#1069](https://github.com/Khan/KaTeX/pull/1069)
- Added support for more scripts in `\text{}` environments such as Czech, Georgian, Hungarian, Turkish. [#1076](https://github.com/Khan/KaTeX/pull/1076)
- add Main-BoldItalic font to allow nesting of `\textit` and `\textbf`
- Added `\S` and `\P` [#1110](https://github.com/Khan/KaTeX/pull/1110)

### Changed
- Remove symlink to support devs using Windows [#1090](https://github.com/Khan/KaTeX/pull/1090)

### Fixed
- Do not inherit SVG style properties from the environment. [#1089](https://github.com/Khan/KaTeX/pull/1089)
- Update fonts and metrics so that accents are positioned correctly [#1094](https://github.com/Khan/KaTeX/pull/1094)
- Non-portable use of String method `.includes`. Fixes [#1093](https://github.com/Khan/KaTeX/issues/1093)
- Use correct spacing with tight styles. See [#1106](https://github.com/Khan/KaTeX/pull/1106) for more details.


## [v0.9.0-beta] - 2018-01-14
### Added
- `\kern` fixes and support `\hskip`, `\TeX`, `\LaTeX`, `\KaTeX`. See [#974](https://github.com/Khan/KaTeX/pull/974)
- Supported Unicode middle dot and Unicode accents.
- Added basic support for Indic scripts in addition to CJK. [#1060](https://github.com/Khan/KaTeX/pull/1060)
- Added support for bold italic symbols. [#1011](https://github.com/Khan/KaTeX/pull/1011)
- add `\ae`, `\AE`, `\oe`, `\OE`, `\o`, `\O`, `\ss` with unicode support for those characters in text mode. [#1030](https://github.com/Khan/KaTeX/pull/1030)
- Added `\i` and `\j` for text mode. [#1029](https://github.com/Khan/KaTeX/pull/1029)
- Added `buildHTMLTree`. [#1022](https://github.com/Khan/KaTeX/pull/1022)
- Implemented `\TextOrMath`, @secondoftwo. [#1024](https://github.com/Khan/KaTeX/pull/1024)
- Added a 'common issues' section to the `README.md`. [#1034](https://github.com/Khan/KaTeX/pull/1034)

### Changed
- Made a more working example in README.md. Fixed [#1049](https://github.com/Khan/KaTeX/issues/1049) PR is [#1050](https://github.com/Khan/KaTeX/pull/1050)
- Exposing the build tree. [#1017](https://github.com/Khan/KaTeX/pull/1017)
- Changed `\xLongequal` to `\xlongequal`. [#997](https://github.com/Khan/KaTeX/pull/997)

### Fixed
- Avoid negative space in `\bmod`. [#984](https://github.com/Khan/KaTeX/pull/984)
- Stacking text commands. [#1009](https://github.com/Khan/KaTeX/pull/1009)
- Fixed `\vec` by replacing the combining font glyph with an SVG. [#1018](https://github.com/Khan/KaTeX/pull/1018)
- Made accents zero width. [#1033](https://github.com/Khan/KaTeX/pull/1033)
- Fixed frac-line. [#1025](https://github.com/Khan/KaTeX/pull/1025)
- Implemented correct macros for `liminf` and `limsup`. Fixed [#111](https://github.com/Khan/KaTeX/issues/111)
- `\kern` generates right-margin instead of left-margin. Fixed [#995](https://github.com/Khan/KaTeX/issues/995)


## [v0.9.0-alpha2] - 2017-11-26
### Added
- Added Unicode Relations and Unicode Symbol support. Supports Unicode ∴, ∵, `\mid`, Arrows, Big Operators, Binary Operators, Negated Relations.
- Implemented the `alignedat` environment for flexible math spacing. [#930](https://github.com/Khan/KaTeX/pull/930)
- Implemented `\mathchoice` command. [#969](https://github.com/Khan/KaTeX/pull/969)
- Implemented `\href` command. [#923](https://github.com/Khan/KaTeX/pull/923)
- `\hspace*`, `\@ifstar`, `\@ifnextchar`, `\@firstoftwo` (#975)
- Added `\notni` character `∌`. [#710](https://github.com/Khan/KaTeX/pull/710)
- Added ng-katex link to README.md. [#959](https://github.com/Khan/KaTeX/pull/959)

### Changed
- Single-character macros like active characters. [#973](https://github.com/Khan/KaTeX/pull/973)
- Re `@flow`:
  - Port buildTree, katex, mathMLTree, parseTree, stretchy to @flow.

### Fixed
- Fixed the spacing between columns in the {aligned} environment. [#942](https://github.com/Khan/KaTeX/pull/942)
- Fixed issue where the {aligned} environment skips the last line if the first column is empty. [#949](https://github.com/Khan/KaTeX/pull/949)
- Appended `ApplyFunction` to math functions in MathML. [#960](https://github.com/Khan/KaTeX/pull/960)
- Changed `\undertilde` to `\utilde`. [#948](https://github.com/Khan/KaTeX/pull/948)
- Changed `frac-line` from border to full span. [#976](https://github.com/Khan/KaTeX/pull/976)


## [v0.9.0-alpha1] - 2017-10-15
### Fixes
- Fixed space handling. [#912](https://github.com/Khan/KaTeX/pull/912)
- Prevents disappearing fraction lines. [#931](https://github.com/Khan/KaTeX/pull/931)

### Updated
- Edit link to Function Support page. [#922](https://github.com/Khan/KaTeX/pull/922)

### Changed
- Re `@flow`:
  - Exported svgGeometry to @flow. [#936](https://github.com/Khan/KaTeX/pull/936)
  - Ported utils to @flow. [#935](https://github.com/Khan/KaTeX/pull/935)


## [v0.9.0-alpha] - 2017-10-05
### Added
- Added MathJax compatibility script. [#680](https://github.com/Khan/KaTeX/pull/680)
- Added a maxSize option to limit user-specified sizes. [#803](https://github.com/Khan/KaTeX/pull/803)
- Added `\smash`, laps, spaces, and phantoms. [#833](https://github.com/Khan/KaTeX/pull/833)
- Support for `\raisebox`, `\operatorname`, `\And`, `\colorbox`, `\fcolorbox` and `\verb`.
- Added support for comments. Fixes [#20](https://github.com/Khan/KaTeX/issues/20)
- To `@flow`:
  - fontMetrics, fontMetricsData, Token, Lexer, MacroExpander, Options, ParseError, ParseNode, Settings, Style.

### Changed
- Advanced macro support and magic `\dots`. [#794](https://github.com/Khan/KaTeX/pull/794)
- Allow sizing commands inside optional groups. [#885](https://github.com/Khan/KaTeX/pull/885)
- Upgraded `\sqrt` zoom and width. [#890](https://github.com/Khan/KaTeX/pull/890)
- Refactored defineEnvironment to also accept HTML and MathML builders. [#875](https://github.com/Khan/KaTeX/pull/875)
- For `@flow`:
  - Ported environments.js, functions.js, symbol.js, unit.js.
- Separated mandatory and optional arguments in parseArguments. [#903](https://github.com/Khan/KaTeX/pull/903)

### Breaking Changes
- Require [text]color HTML colors to be well-formed. See [#827](https://github.com/Khan/KaTeX/pull/827)
- `\llap` and `\rlap` now render contents in math mode. Use `\mathllap` (new) and `\mathrlap` (new) if you need the previous behavior.

### Removed
- Removed the positions array computed by Parser's parseArguments(). [#864](https://github.com/Khan/KaTeX/pull/864)

### Fixed
- Fixed exponential behavior in accent production. [#834](https://github.com/Khan/KaTeX/pull/834)
- Use mpadded for `\raisebox` MathML. [#876](https://github.com/Khan/KaTeX/pull/876)
- Array/Matrix environments do not trim newlines. Fixes [#337](https://github.com/Khan/KaTeX/issues/337). PR is [#479](https://github.com/Khan/KaTeX/pull/479).
- For `@flow`:
  - Corrected @flow types. Refactor some Parser code for stricter typing. [#896](https://github.com/Khan/KaTeX/pull/896)
  - Fixed match-at flow errors. [#847](https://github.com/Khan/KaTeX/pull/847)


## [v0.8.3] - 2017-08-27
### Added
- Added latin-1 letters as math symbols. See [#796](https://github.com/Khan/KaTeX/pull/796)
- Added support for `\not`. [#140](https://github.com/Khan/KaTeX/pull/140)

### Changed
- Support CJK full-width punctuation + Unicode dots. See [#814](https://github.com/Khan/KaTeX/pull/814)
- Support for ```' \` ^ ~ = \u . " \r \H \v``` text-mode accents. See [#802](https://github.com/Khan/KaTeX/pull/802)
- Modernized font creation. See [#624](https://github.com/Khan/KaTeX/pull/624)

### Fixed
- Use inline SVG for stretchy elements. [#807](https://github.com/Khan/KaTeX/pull/807)
- Improve `\sqrt`. [#810](https://github.com/Khan/KaTeX/issues/810)


## [v0.8.2] - 2017-08-17
### Added
- Accepts all existing Greek letters using unicode characters in math mode. See [#410](https://github.com/Khan/KaTeX/pull/410)

### Fixed
- Fixes MathML output for ' and large operators with limits. [#788](https://github.com/Khan/KaTeX/pull/788)
- Updated package.json to point 'main' at dist/katex.js. [#791](https://github.com/Khan/KaTeX/pull/791)
- Fixed color support for stretchy, strikethrough, and fbox. [#792](https://github.com/Khan/KaTeX/pull/792)
- Detect attachEvent() support correctly. See [#771](https://github.com/Khan/KaTeX/issues/771) and [#772](https://github.com/Khan/KaTeX/pull/772) for the issue and PR fix respectively.

## [v0.8.1] - 2017-08-11
### Fixed
- Note: The v0.8.0 release did not include the SVG images which are necessary for rendering wide and stretchy accents as well as `\overbrace` and `\underbrace`. This release corrects that.

- Note that if you're including copies of KaTeX in your web application, you should now include the dist/images directory in addition to the usual the dist/fonts directory.

## [v0.8.0] - 2017-08-11
### Breaking Changes
- Implicit `\color`, explicitly grouped `\textcolor`. See [#619](https://github.com/Khan/KaTeX/pull/619)

### Added
- Added some international operators. See [#509](https://github.com/Khan/KaTeX/issues/509)
- Old font command support: `\rm`, `\sf`, `\tt`, `\bf`, `\it`. [#675](https://github.com/Khan/KaTeX/pull/675)
- Builtin macros, macro arguments, `\overset` and `\underset`. [#605](https://github.com/Khan/KaTeX/pull/605)
- Added `\iff`, `\implies`, `\impliedby` support. [#697](https://github.com/Khan/KaTeX/pull/697)
- Support <, >, | and many `\text`... commands in text mode. [#684](https://github.com/Khan/KaTeX/pull/684)
- Implemented $...$ via styling node. [#637](https://github.com/Khan/KaTeX/pull/637)
- Added `\jot` lineskip to aligned environment, switch contents to displaystyle, and add gathered. [#725](https://github.com/Khan/KaTeX/pull/725)
- Support stretchy wide elements. [#670](https://github.com/Khan/KaTeX/pull/670)
- Set maxFontSize on rules. [#744](https://github.com/Khan/KaTeX/pull/744)


### Changes
- Added support for Windows high-contrast mode. Fixed [#716](https://github.com/Khan/KaTeX/issues/716)  [#724](https://github.com/Khan/KaTeX/pull/724)
-Implemented `\coloneqq`, `\colonequals`, etc. based on mathtools and colonequals. [#727](https://github.com/Khan/KaTeX/pull/727)
- Added configurable error callback. [#658](https://github.com/Khan/KaTeX/pull/658)
- Added support for absolute TeX units. [#732](https://github.com/Khan/KaTeX/pull/732)
- Revert "Remove trailing commas for IE 9 compatibility". [#622](https://github.com/Khan/KaTeX/pull/622)
- Use utils.deflt for Settings. [#649](https://github.com/Khan/KaTeX/pull/649)
- Refactored and commented space splicing code. [#699](https://github.com/Khan/KaTeX/pull/699)
- Vertically center single-character `\mathop`. [#745](https://github.com/Khan/KaTeX/pull/745)
- Associate font metrics with Options, not Style. [#743](https://github.com/Khan/KaTeX/pull/743)
- Upgraded the source to use ES6 syntax including classes, import and static properties.
[#679](https://github.com/Khan/KaTeX/pull/679)
- Use `\displaystyle` within `\over/\underbrace`. [#765](https://github.com/Khan/KaTeX/pull/765)
- Shrinkwrap vlists in table-like CSS. [#768](https://github.com/Khan/KaTeX/pull/768)
- Improve rule coding, including for `\sqrt`. [#776](https://github.com/Khan/KaTeX/pull/776)


### Fixed
- Fixed high contrast mode better. [#733](https://github.com/Khan/KaTeX/pull/733)
- Fixed all AMS mathord symbols. [#618](https://github.com/Khan/KaTeX/pull/618)
- Fixed x'^2 [#636](https://github.com/Khan/KaTeX/pull/636)
- Fixed font typo math -> main. [#678](https://github.com/Khan/KaTeX/pull/678)
- Fixed spaces before `\middle`. [#689](https://github.com/Khan/KaTeX/pull/689)
- Fixed [#711](https://github.com/Khan/KaTeX/issues/711) issue with multiple superscripts.  [#718](https://github.com/Khan/KaTeX/pull/718)
- Fixed interaction between styles and sizes. [#719](https://github.com/Khan/KaTeX/pull/719)
- Correct handling of unbraced kerns followed by spaces. [#751](https://github.com/Khan/KaTeX/pull/751)
- Corrected computation of TeX sizes. [#755](https://github.com/Khan/KaTeX/pull/755)
- Solved Safari rendering issues with font-size overrides. [#780](https://github.com/Khan/KaTeX/pull/780)
