# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).


## [v0.9.0] - 2018-02-18
### Added
- Italic Greek capital letters (#1118)
- Add support for `\mathring` (#1125)
- Add support for unicode angle brackets, single vertical bar, double vertical bar (#1123)
- Support Reaction Arrows (#1078)
- Add `\nobreakspace` (#1145)
- Support Unicode colon equals ≔ (#1151)
- Support `\underline` in text mode (#1159)

### Changed
- Enable spacing functions in text mode (#1139)

### Fixes
- Improve JS spacing (#1103)
- Fix handling of Unicode characters ð, Å, å (#1157)
- Padding over `\sqrt` and Paths for frac-line (#1143)


## [v0.9.0-beta1] - 2018-01-28
### Added
- Add support for `\aa`, `\AA`, `\lq`, `\rq`, `\lbrack`, `\rbrack` (#1069)
- Support more scripts in \text{} environments such as Czech, Georgian, Hungarian, Turkish. (#1076)
- add Main-BoldItalic font to allow nesting of `\textit` and `\textbf`
- add `\S` and `\P` (#1110)

### Changed
- Remove symlink to support devs using Windows (#1090)

### Fixed
- Don't inherit SVG style properties from the environment. (#1089)
- Update fonts and metrics so that accents are positioned correctly (#1094)
- Non-portable use of String method `.includes`. Fixes #1093
- Use correct spacing with tight styles. See #1106 for more details.


## [v0.9.0-beta] - 2018-01-14
### Added
- `\kern` fixes and support `\hskip`, `\TeX`, `\LaTeX`, `\KaTeX`. See (#974)
- Support Unicode middle dot and Unicode accents
- Add basic support for Indic scripts in addition to CJK. (#1060)
- Added support for bold italic symbols (#1011)
- add `\ae`, `\AE`, `\oe`, `\OE`, `\o`, `\O`, `\ss` with unicode support for those characters in text mode (#1030)
- add `\i` and `\j` for text mode (#1029)
- Add `buildHTMLTree` (#1022)
- Implement `\TextOrMath`, @secondoftwo (#1024)
- Add a 'common issues' section to the README (#1034)

### Changed
- Make a more working example in README. Fix #1049 (#1050)
- Exposing the build tree. (#1017)
- Change `\xLongequal` to `\xlongequal` (#997)

### Fixed
- Avoid negative space in `\bmod`. (#984)
- Stacking text commands (#1009)
- Fix `\vec` by replacing the combining font glyph with an SVG. (#1018)
- Make accents zero width (#1033)
- Fix frac-line (#1025)
- Implement correct macros for `liminf` and `limsup`. Fixes #111 (#887)
- `\kern` generates right-margin instead of left-margin. Fixes #995 (#1019)


## [v0.9.0-alpha2] - 2017-11-26
### Added
- Added Unicode Relations and Unicode Symbol support. Supports Unicode ∴, ∵, `\mid`, Arrows, Big Operators, Binary Operators, Negated Relations

- Implements the `alignedat` environment for flexible math spacing (#930)
- Implements `\mathchoice` command (#969)
- Implemented `\href` command (#923)
- `\hspace*`, `\@ifstar`, `\@ifnextchar`, `\@firstoftwo` (#975)
- Adds `\notni` character `∌` (#710)
- Added ng-katex link to readme.md (#959)

### Changed
- Single-character macros like active characters (#973)
- Re `@flow`:
  - Port buildTree, katex, mathMLTree, parseTree, stretchy to @flow.

### Fixed
- Fix the spacing between columns in the {aligned} environment (#942)
- Fix issue where the {aligned} environment skips the last line if the first column is empty (#949)
- Append `ApplyFunction` to math functions in MathML (#960)
- Change `\undertilde` to `\utilde` (#948)
- Change `frac-line` from border to full span (#976)


## [v0.9.0-alpha1] - 2017-10-15
### Fixes
- Fix space handling (#912)
- Prevent disappearing fraction lines. (#931)

### Updated
- Edit link to Function Support page (#922)

### Changed
- Re `@flow`:
  - Export svgGeometry to @flow. (#936)
  - Port utils to @flow. (#935)


## [v0.9.0-alpha] - 2017-10-05
### Added
- Added MathJax compatibility script (#680)
- Added a maxSize option to limit user-specified sizes (#803)
- Added `\smash`, laps, spaces, and phantoms (#833)
- Support for `\raisebox`, `\operatorname`, `\And`, `\colorbox`, `\fcolorbox` and `\verb`.
- Added support for comments. Fixes #20 (#884)
- To `@flow`:
  - fontMetrics, fontMetricsData, Token, Lexer, MacroExpander, Options, ParseError, ParseNode, Settings, Style.

### Changed
- Advanced macro support and magic `\dots` (#794)
- Allow sizing commands inside optional groups (#885)
- Upgrade `\sqrt` zoom and width (#890)
- Refactor defineEnvironment to also accept HTML and MathML builders (#875)
- For `@flow`:
  - Port environments.js, functions.js, symbol.js, unit.js
- Separate mandatory and optional arguments in parseArguments (#903)

### Breaking Changes
- Require [text]color HTML colors to be well-formed. See [#827](https://github.com/Khan/KaTeX/pull/827)
- `\llap` and `\rlap` now render contents in math mode. Use `\mathllap` (new) and `\mathrlap` (new) if you need the previous behavior.

### Removed
- Removed the positions array computed by Parser's parseArguments(). (#864)

### Fixed
- Fix exponential behavior in accent production (#834)
- Use mpadded for `\raisebox` MathML (#876)
- Array/Matrix environments do not trim newlines. Fixes #337. PR is #479
- For `@flow`:
  - Correct @flow types. Refactor some Parser code for stricter typing. (#896)
  - Fix match-at flow errors (#847)


## [v0.8.3] - 2017-08-27
### Added
- Add latin-1 letters as math symbols. See [#796](https://github.com/Khan/KaTeX/pull/796)
- Added support for \not (#140)

### Changed
- Support CJK full-width punctuation + Unicode dots. See [#814](https://github.com/Khan/KaTeX/pull/814)
- Support for ```' \` ^ ~ = \u . " \r \H \v``` text-mode accents. See [#802](https://github.com/Khan/KaTeX/pull/802)
- Modernize font creation. See [#624](https://github.com/Khan/KaTeX/pull/624)

### Fixed
- Use inline SVG for stretchy elements (#807)
Improve `\sqrt` #810


## [v0.8.2] - 2017-08-17
### Added
- Accepts all existing Greek letters using unicode characters in math mode. See [#410](https://github.com/Khan/KaTeX/pull/410)

### Fixed
- Fixes MathML output for ' and large operators with limits ([#788](https://github.com/Khan/KaTeX/pull/788))
- Update package.json to point 'main' at dist/katex.js ([#791](https://github.com/Khan/KaTeX/pull/791))
- Fix color support for stretchy, strikethrough, and fbox ([#792](https://github.com/Khan/KaTeX/pull/792))
- Detect attachEvent() support correctly. See [#771](https://github.com/Khan/KaTeX/issues/771) and [#772](https://github.com/Khan/KaTeX/pull/772) for the issue and PR fix respectively

## [v0.8.1] - 2017-08-11
### Changed
- Does not include the SVG images which are necessary for rendering wide and stretchy accents as well as \overbrace and \underbrace. This release corrects that.

### Breaking Changes
- If you're including copies of KaTeX in your web application, you should now include the dist/images directory in addition to the usual the dist/fonts directory.

## [v0.8.0] - 2017-08-11
### Breaking Changes
- Implicit \color, explicitly grouped \textcolor https://github.com/Khan/KaTeX/pull/619

### New Features:
- fixed [#509](https://github.com/Khan/KaTeX/issues/509): added some international operators [#647](https://github.com/Khan/KaTeX/pull/647)
- Old font command support: \rm, \sf, \tt, \bf, \it [#675](https://github.com/Khan/KaTeX/pull/675)
- Builtin macros, macro arguments, \overset and \underset [#605](https://github.com/Khan/KaTeX/pull/605)
- Add \iff, \implies, \impliedby support [#697](https://github.com/Khan/KaTeX/pull/697)
- Support <, >, | and many \text... commands in text mode [#684](https://github.com/Khan/KaTeX/pull/684)
- Implement $...$ via styling node [#637](https://github.com/Khan/KaTeX/pull/637)
- Support Windows high-contrast mode. Fix [#716](https://github.com/Khan/KaTeX/issues/716) [#724](https://github.com/Khan/KaTeX/pull/724)
- Add \jot lineskip to aligned environment, switch contents to displaystyle, and add gathered [#725](https://github.com/Khan/KaTeX/pull/725)
- Fix high contrast mode better, thanks to @GeeLaw [#733](https://github.com/Khan/KaTeX/pull/733)
- Support stretchy wide elements. [#670](https://github.com/Khan/KaTeX/pull/670)
-Implement \coloneqq, \colonequals, etc. based on mathtools and colonequals [#727](https://github.com/Khan/KaTeX/pull/727)
- Add configurable error callback [#658](https://github.com/Khan/KaTeX/pull/658)
- Support absolute TeX units [#732](https://github.com/Khan/KaTeX/pull/732)

### Other changes:
- Revert "Remove trailing commas for IE 9 compatibility" [#622](https://github.com/Khan/KaTeX/pull/622)
- Fix all AMS mathord symbols [#618](https://github.com/Khan/KaTeX/pull/618)
- Fix x'^2 [#636](https://github.com/Khan/KaTeX/pull/636)
- Use utils.deflt for Settings [#649](https://github.com/Khan/KaTeX/pull/649)
- Fix font typo math -> main [#678](https://github.com/Khan/KaTeX/pull/678)
- Fix spaces before \middle [#689](https://github.com/Khan/KaTeX/pull/689)
- Refactor and comment space splicing code [#699](https://github.com/Khan/KaTeX/pull/699)
- Fix [#711](https://github.com/Khan/KaTeX/issues/711) issue with multiple superscripts. [#718](https://github.com/Khan/KaTeX/pull/718)
- Fix interaction between styles and sizes. [#719](https://github.com/Khan/KaTeX/pull/719)
- Vertically center single-character \mathop. [#745](https://github.com/Khan/KaTeX/pull/745)
- Correct handling of unbraced kerns followed by spaces. [#751](https://github.com/Khan/KaTeX/pull/751)
- Associate font metrics with Options, not Style. [#743](https://github.com/Khan/KaTeX/pull/743)
- Upgrade the source to use ES6 syntax including classes, import and static properties [#679](https://github.com/Khan/KaTeX/pull/679)
- Set maxFontSize on rules. [#744](https://github.com/Khan/KaTeX/pull/744)
- Correct computation of TeX sizes. [#755](https://github.com/Khan/KaTeX/pull/755)
- Use \displaystyle within \over/\underbrace [#765](https://github.com/Khan/KaTeX/pull/765)
- Shrinkwrap vlists in table-like CSS. [#768](https://github.com/Khan/KaTeX/pull/768)
- Solve Safari rendering issues with font-size overrides. [#780](https://github.com/Khan/KaTeX/pull/780)
- Improve rule coding, including for \sqrt. [#776](https://github.com/Khan/KaTeX/pull/776)

### Infra Changes:
- Update dependencies to more recent version [#612](https://github.com/Khan/KaTeX/pull/612)
- Use morgan to log requests in the dev server [#625](https://github.com/Khan/KaTeX/pull/625)
- Improve release script and bower support [#615](https://github.com/Khan/KaTeX/pull/615)
- Show compressed sizes correctly [#639](https://github.com/Khan/KaTeX/pull/639)
- Set up a diff attribute and textconv instructions for font files [#635](https://github.com/Khan/KaTeX/pull/635)
- Fix release script after experience from 0.7.1 release [#642](https://github.com/Khan/KaTeX/pull/642)
- Update texcmp to ubuntu 17.04 and avoid mounted host directory [#722](https://github.com/Khan/KaTeX/pull/722)
- Screenshotter: Add --diff and --attempts options. [#736](https://github.com/Khan/KaTeX/pull/736)
- Switch from jasmine to jest [#747](https://github.com/Khan/KaTeX/pull/747)
- Ensure screenshotter runs all tests. [#769](https://github.com/Khan/KaTeX/pull/769)

### Misc:
- Describe using auto renderer in html head [#623](https://github.com/Khan/KaTeX/pull/623)
- README.md - added integrity [#590](https://github.com/Khan/KaTeX/pull/590)
- README.md - added integrity [#591](https://github.com/Khan/KaTeX/pull/591)
- Switch speed test in README [#640](https://github.com/Khan/KaTeX/pull/640)
- Describe site-provided macros in README [#644](https://github.com/Khan/KaTeX/pull/644)
- Fixed missing verb in README [#668](https://github.com/Khan/KaTeX/pull/668)
- Rephrase displayMode description to be clearer [#648](https://github.com/Khan/KaTeX/pull/648)
- Add documentation for how to run auto-render example [#740](https://github.com/Khan/KaTeX/pull/740)
- Mention texcmp in CONTRIBUTING.md [#753](https://github.com/Khan/KaTeX/pull/753)
