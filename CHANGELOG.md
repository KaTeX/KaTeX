# Changelog
All notable changes to this project will be documented in this file. This CHANGELOG roughly follows the guidelines from [www.keepachangelog.com](https://keepachangelog.com/en/1.0.0/).

## [v0.10.1]
### Added
- ECMAScript module for contrib (#1624)
- mhchem extension (#1436)
- auto-render: optional pre-process callback (#1784)
- \argmax and \argmin (#1820)
- \textbackslash and \textasciicircum (#1839)
- leqno and fleqn support (#1814)

### Changed
- Include only necessary fonts for target environment specified by Browserslist (#1674)

### Fixed
- Support blackboard bold in text mode (#1757)
- Fix spacings in semisimple groups (#1706)
- Fix parsing comments (#1789)
- Fix \\ and \newline after operator (#1796)
- Fix \hphantom width (#1809)
- Remove double encoding in MathML (#1813)
- Fix Unicode bigcup (#1836)
- Fix \genfrac w/ empty delimiter arguments (#1816)
- \fbox inherits default color (#1847)
- Fix \not and \neq on Chrome 72 (#1852)


## [v0.10.0]
### Added
- Unicode: °, delimiters, 1D400-1D7FF, \ll, \lll, ≘≙≚≛≝≞≟, Unicode Mathematical Alphanumeric Symbols, ⟂ ¬ ⊨ ‼ ∌ ≲ ⩽ ⪅ ≶ ⋚ ⪋, corner, ⟦⟧ (#1203, #1207, #1260, #1273, #1274, #1232, #1377, #1389, #1459, #1750)
- \yen support on text mode (#1208)
- `\(` (#1213)
- Add defineSymbol to the main katex object (#1263)
- Capital Greek letters (#1283, #1285)
- Add version to katex object (#1279, #1475)
- \copyright, \textregistered, \textcircled (#1073)
- Tilde \textasciitilde (#1286)
- Line breaks for inline formulas (#1287)
- \hline (#1306)
- Top-level \newline and `\\` in inline math (#1298)
- Strict mode, unicode text in math mode (#1117, #1278)
- Strict setting for \newline display-mode behavior (#1314)
- Allow all Unicode symbols in nonstrict mode (#1217)
- \tag, \tag*, and \gdef (#1309)
- \def, \gdef, and \global\def (#1348, #1425)
- Change default maxExpand limit to 1000 (#1383)
- \cfrac (#1392)
- \arraystretch as a macro definition (#1381)
- Add ability to create a dashed vertical line in arrays, using ':' (#1395)
- \widecheck (#1406)
- \hdashline (#1407)
- \newcommand, \renewcommand, \providecommand (#1382)
- Add a utility function (setFontMetrics) to extend builtin fontMetrics (#1269)
- \oiint and \oiiint (#1430)
- Remove `match-at` dependency, use RegExp for lexer (#1447)
- \brace and \brack (#1453)
- Allow only allowed protocols in \href (#1440)
  - **BREAKING CHANGE:** Only "http", "https", "mailto", and relative URLs are allowed in \href and \url by default.
- \genfrac and \above (#1455, #1458)
- \char character escaping and nicer MathML via \html@mathml (#1454)
- \@binrel (#1487)
- \pmb (#1418)
- KaTeX website & documentation (#1484, #1515, #1518, #1514, #1526, #1516, #1519, #1527, #1564, #1566, #1584, #1571, #1642, #1680, #1683, #1688, #1631, #1727)
- Improve supported functions documentation (#1511, #1517, #1532, #1533, #1576, #1556, #1580, #1602)
- Alpha sorted function support page (#1536)
- MediaWiki (texvc) (#1558)
- Add ignore option for class names in auto-render (#1555)
- ScrollSpy for table of contents in the documentation (#1557, #1567, #1568)
- Build ECMAScript modules (#1479, #1622, #1653)
- Enable environment variable USE_TTF to disable bundling TTF fonts (#1600)
- List of KaTeX users (#1569, #1579)
- Browserslist (#1662)
- 6-digit color without # (#1690)
- \mathnormal (#1700)
- \lparen and \rparen (#1741)
- `\>` (#1752)

### Changed
- Port to @flow: delimiter, spacingData, unicodeSymbols, buildHTML, buildMathML, parseNode, defineFunction, CssStyle (#1177, #1195, #1206, #1239, #1247, #1276, #1312, #1324, #1361, #1373, #1393, #1386, #1387, #1408, #1478, #1486, #1534, #1541, #1542, #1551, #1552, #1554, #1559, #1606, #1609, #1612, #1637, #1684)
- Online screenshot diff/generation using CircleCI (#1187)
- Add display/displayMode toggle on test page (#1193)
- Change CDN links (#1243)
- Changelog for KaTeX (#1322)
- Move test helpers into common modules (#1318)
- Move function handlers to functions/ (#1323, #1325, #1328, #1329, #1331, #1327, #1334, #1339, #1349, #1359, #1332, #1335)
- Improve screenshotter (#1220, #1644, #1643)
- Upgrade to webpack 4 (#1337, #1435)
- Automatic submodule updating via husky tool (#1391)
- Refactor test helpers (#1336)
- Change build directory to `dist` and cleanup NPM scripts (#1500, #1610)
- Switch from nomnom to commander (#1496)
- Add test job to CircleCI (#1235, #1658)
- Switch npm to Yarn (#1522, #1528)
- Improve release script & enable versioning documentation (#1521, #1603, #1660, #1665)
- Enable stylelint-config-standard, lint CSS files (#1575)
- Rename Screenshotter -> screenshotter (#1573)
- Refactor buildCommon (#1633, #1640)
- Upgrade to Babel 7 (#1595)
- Refactor Parser (#1711, #1723)

### Fixed
- Fix nested math mode in non-default text mode (#1111)
- Fix contenteditable mode (#1179)
- Work around negative space bug in Chrome (#1194)
- Fix \nobreakspace (#1200)
- Fix instant mode switching for $, \(, \text (#1213)
- Add metrics for \S and \P (#1224)
- Fix anchor.toMarkup (#1246)
- Specify height for SVG elements (#1252)
- Include Bold-Italic fonts for \boldsymbol (#1257)
- Fix space width in \texttt (#1261)
- Fix \underset (#1277)
- Remove special \verb space handling now that space is in Typewriter-Regular (#1258)
- Switch makeGlue from .mord .rule to .mspace (#1295)
- Fix ~ in \verb (#1286)
- Stop throwing ParseError when throwOnError is false (#1169, #1302, #1308)
- Fix extensible arrow sup vertical alignment (#1256)
- Adjust \underset alignment and spacing (#1290)
- Revert frac-lines and \rule to borders (min-height) (#1249, #1417, #1594)
- Fix vertical alignment of \underbrace (#1304)
- Use one strut instead of two (#1307)
- Fix MacroExpander space handling (#1314)
- Cleanup MathML `<mrow>`, `<mtext>`, `<mn>` (#1338)
- Fix lap vertical alignment. (#1162)
- Fix nested \tfrac (#1370)
- Fix \coloneq etc (#1372)
- Fix wide character spacing (#1371)
- Fix auto-render \\[…] bug (#1375)
- Rewrite spacing commands as macros (#1156)
- Enable output modules to be used in browser or Node (#1401)
- Add vertical kern to \vdots (#1402)
- Implement \neq and \notin via macros like LaTeX's (#1400, #1499)
- Improve \cancel (#1398)
- Fix ligatures vs. \tt (#1379)
- Implement \colon as amsmath does (#1410)
- Automatic mrel/mbin spacing for \boldsymbol (#1388)
- Phantom text (#1449)
- Fix arrowheads for mhchem <--> (#1451)
- Set `documentFragment.style` to empty object (#1471)
- Remove tree cloning before building HTML (#1470)
- Fix \operatorname to support general math functions (#1461)
- Use \not character without left side-bearing correction (#1267)
- Remove codes that require expensive polyfill (#1469, #1563, #1591, #1597)
- Fix \not vertical alignment (#1497)
- Comments without terminating newlines, \href fixes, \url support (#1529)
- Fix \textdaggerdbl (#1539)
- Fix \neq (#1548, #1574)
- Fix wide characters (#1549)
- Fix \fbox (#1550)
- Fix \Large roots (#1485)
- index.html: replace font, make responsive, improve demo (#1547, #1577, #1615, #1601)
- Remove duplicate defineFunction invocation for \mathop (#1701)
- Fix tag positioning to live within katex-html parent (#1721)
- Fix \mathit font and italic correction (#1700)


## [v0.9.0] - 2018-02-18
### Added
- Italic Greek capital letters [#1118](https://github.com/KaTeX/KaTeX/pull/1103)
- Added support for `\mathring` [#1125](https://github.com/KaTeX/KaTeX/pull/1125)
- Added support for unicode angle brackets, single vertical bar, double vertical bar [#1123](https://github.com/KaTeX/KaTeX/pull/1123)
- Added support for Reaction Arrows [#1078](https://github.com/KaTeX/KaTeX/pull/1078)
- Added `\nobreakspace` [#1145](https://github.com/KaTeX/KaTeX/pull/1145)
- Added support for Unicode colon equals ≔ [#1151](https://github.com/KaTeX/KaTeX/pull/1151)
- Added support for `\underline` in text mode [#1159](https://github.com/KaTeX/KaTeX/pull/1159)

### Changed
- Enable spacing functions in text mode [#1139](https://github.com/KaTeX/KaTeX/pull/1139)

### Fixed
- Improved JS spacing [#1103](https://github.com/KaTeX/KaTeX/pull/1103)
- Fixed handling of Unicode characters ð, Å, å [#1157](https://github.com/KaTeX/KaTeX/pull/1157)
- Padding over `\sqrt` and Paths for frac-line [#1143](https://github.com/KaTeX/KaTeX/pull/1143)


## [v0.9.0-beta1] - 2018-01-28
### Added
- Added support for `\aa`, `\AA`, `\lq`, `\rq`, `\lbrack`, `\rbrack` [#1069](https://github.com/KaTeX/KaTeX/pull/1069)
- Added support for more scripts in `\text{}` environments such as Czech, Georgian, Hungarian, Turkish. [#1076](https://github.com/KaTeX/KaTeX/pull/1076)
- add Main-BoldItalic font to allow nesting of `\textit` and `\textbf`
- Added `\S` and `\P` [#1110](https://github.com/KaTeX/KaTeX/pull/1110)

### Changed
- Remove symlink to support devs using Windows [#1090](https://github.com/KaTeX/KaTeX/pull/1090)

### Fixed
- Do not inherit SVG style properties from the environment. [#1089](https://github.com/KaTeX/KaTeX/pull/1089)
- Update fonts and metrics so that accents are positioned correctly [#1094](https://github.com/KaTeX/KaTeX/pull/1094)
- Non-portable use of String method `.includes`. Fixed [#1093](https://github.com/KaTeX/KaTeX/issues/1093)
- Use correct spacing with tight styles. See [#1106](https://github.com/KaTeX/KaTeX/pull/1106) for more details.


## [v0.9.0-beta] - 2018-01-14
### Added
- `\kern` fixed and support `\hskip`, `\TeX`, `\LaTeX`, `\KaTeX`. See [#974](https://github.com/KaTeX/KaTeX/pull/974)
- Supported Unicode middle dot and Unicode accents.
- Added basic support for Indic scripts in addition to CJK. [#1060](https://github.com/KaTeX/KaTeX/pull/1060)
- Added support for bold italic symbols. [#1011](https://github.com/KaTeX/KaTeX/pull/1011)
- add `\ae`, `\AE`, `\oe`, `\OE`, `\o`, `\O`, `\ss` with unicode support for those characters in text mode. [#1030](https://github.com/KaTeX/KaTeX/pull/1030)
- Added `\i` and `\j` for text mode. [#1029](https://github.com/KaTeX/KaTeX/pull/1029)
- Added `buildHTMLTree`. [#1022](https://github.com/KaTeX/KaTeX/pull/1022)
- Implemented `\TextOrMath`, @secondoftwo. [#1024](https://github.com/KaTeX/KaTeX/pull/1024)
- Added a 'common issues' section to the `README.md`. [#1034](https://github.com/KaTeX/KaTeX/pull/1034)

### Changed
- Made a more working example in README.md. Fixed [#1049](https://github.com/KaTeX/KaTeX/issues/1049) PR is [#1050](https://github.com/KaTeX/KaTeX/pull/1050)
- Exposing the build tree. [#1017](https://github.com/KaTeX/KaTeX/pull/1017)
- Changed `\xLongequal` to `\xlongequal`. [#997](https://github.com/KaTeX/KaTeX/pull/997)

### Fixed
- Avoid negative space in `\bmod`. [#984](https://github.com/KaTeX/KaTeX/pull/984)
- Stacking text commands. [#1009](https://github.com/KaTeX/KaTeX/pull/1009)
- Fixed `\vec` by replacing the combining font glyph with an SVG. [#1018](https://github.com/KaTeX/KaTeX/pull/1018)
- Made accents zero width. [#1033](https://github.com/KaTeX/KaTeX/pull/1033)
- Fixed frac-line. [#1025](https://github.com/KaTeX/KaTeX/pull/1025)
- Implemented correct macros for `liminf` and `limsup`. Fixed [#111](https://github.com/KaTeX/KaTeX/issues/111)
- `\kern` generates right-margin instead of left-margin. Fixed [#995](https://github.com/KaTeX/KaTeX/issues/995)


## [v0.9.0-alpha2] - 2017-11-26
### Added
- Added Unicode Relations and Unicode Symbol support. Supports Unicode ∴, ∵, `\mid`, Arrows, Big Operators, Binary Operators, Negated Relations.
- Implemented the `alignedat` environment for flexible math spacing. [#930](https://github.com/KaTeX/KaTeX/pull/930)
- Implemented `\mathchoice` command. [#969](https://github.com/KaTeX/KaTeX/pull/969)
- Implemented `\href` command. [#923](https://github.com/KaTeX/KaTeX/pull/923)
- `\hspace*`, `\@ifstar`, `\@ifnextchar`, `\@firstoftwo` (#975)
- Added `\notni` character `∌`. [#710](https://github.com/KaTeX/KaTeX/pull/710)
- Added ng-katex link to README.md. [#959](https://github.com/KaTeX/KaTeX/pull/959)

### Changed
- Single-character macros like active characters. [#973](https://github.com/KaTeX/KaTeX/pull/973)
- Re `@flow`:
  - Port buildTree, katex, mathMLTree, parseTree, stretchy to @flow.

### Fixed
- Fixed the spacing between columns in the {aligned} environment. [#942](https://github.com/KaTeX/KaTeX/pull/942)
- Fixed issue where the {aligned} environment skips the last line if the first column is empty. [#949](https://github.com/KaTeX/KaTeX/pull/949)
- Appended `ApplyFunction` to math functions in MathML. [#960](https://github.com/KaTeX/KaTeX/pull/960)
- Changed `\undertilde` to `\utilde`. [#948](https://github.com/KaTeX/KaTeX/pull/948)
- Changed `frac-line` from border to full span. [#976](https://github.com/KaTeX/KaTeX/pull/976)


## [v0.9.0-alpha1] - 2017-10-15
### Changed
- Edited link to Function Support page. [#922](https://github.com/KaTeX/KaTeX/pull/922)
- Re `@flow`:
  - Exported svgGeometry to @flow. [#936](https://github.com/KaTeX/KaTeX/pull/936)
  - Ported utils to @flow. [#935](https://github.com/KaTeX/KaTeX/pull/935)

### Fixed
- Fixed space handling. [#912](https://github.com/KaTeX/KaTeX/pull/912)
- Prevents disappearing fraction lines. [#931](https://github.com/KaTeX/KaTeX/pull/931)


## [v0.9.0-alpha] - 2017-10-05
### Added
- Added MathJax compatibility script. [#680](https://github.com/KaTeX/KaTeX/pull/680)
- Added a maxSize option to limit user-specified sizes. [#803](https://github.com/KaTeX/KaTeX/pull/803)
- Added `\smash`, laps, spaces, and phantoms. [#833](https://github.com/KaTeX/KaTeX/pull/833)
- Support for `\raisebox`, `\operatorname`, `\And`, `\colorbox`, `\fcolorbox` and `\verb`.
- Added support for comments. Fixed [#20](https://github.com/KaTeX/KaTeX/issues/20)
- To `@flow`:
  - fontMetrics, fontMetricsData, Token, Lexer, MacroExpander, Options, ParseError, ParseNode, Settings, Style.

### Removed
- Removed the positions array computed by Parser's parseArguments(). [#864](https://github.com/KaTeX/KaTeX/pull/864)

### Changed
- Advanced macro support and magic `\dots`. [#794](https://github.com/KaTeX/KaTeX/pull/794)
- Allow sizing commands inside optional groups. [#885](https://github.com/KaTeX/KaTeX/pull/885)
- Upgraded `\sqrt` zoom and width. [#890](https://github.com/KaTeX/KaTeX/pull/890)
- Refactored defineEnvironment to also accept HTML and MathML builders. [#875](https://github.com/KaTeX/KaTeX/pull/875)
- For `@flow`:
  - Ported environments.js, functions.js, symbol.js, unit.js.
- Separated mandatory and optional arguments in parseArguments. [#903](https://github.com/KaTeX/KaTeX/pull/903)

### Breaking Changes
- Require [text]color HTML colors to be well-formed. See [#827](https://github.com/KaTeX/KaTeX/pull/827)
- `\llap` and `\rlap` now render contents in math mode. Use `\mathllap` (new) and `\mathrlap` (new) if you need the previous behavior.

### Fixed
- Fixed exponential behavior in accent production. [#834](https://github.com/KaTeX/KaTeX/pull/834)
- Use mpadded for `\raisebox` MathML. [#876](https://github.com/KaTeX/KaTeX/pull/876)
- Array/Matrix environments do not trim newlines. Fixed [#337](https://github.com/KaTeX/KaTeX/issues/337). PR is [#479](https://github.com/KaTeX/KaTeX/pull/479).
- For `@flow`:
  - Corrected @flow types. Refactor some Parser code for stricter typing. [#896](https://github.com/KaTeX/KaTeX/pull/896)
  - Fixed match-at flow errors. [#847](https://github.com/KaTeX/KaTeX/pull/847)


## [v0.8.3] - 2017-08-27
### Added
- Added latin-1 letters as math symbols. See [#796](https://github.com/KaTeX/KaTeX/pull/796)
- Added support for `\not`. [#140](https://github.com/KaTeX/KaTeX/pull/140)

### Changed
- Support CJK full-width punctuation + Unicode dots. See [#814](https://github.com/KaTeX/KaTeX/pull/814)
- Support for ```' \` ^ ~ = \u . " \r \H \v``` text-mode accents. See [#802](https://github.com/KaTeX/KaTeX/pull/802)
- Modernized font creation. See [#624](https://github.com/KaTeX/KaTeX/pull/624)

### Fixed
- Use inline SVG for stretchy elements. [#807](https://github.com/KaTeX/KaTeX/pull/807)
- Improve `\sqrt`. [#810](https://github.com/KaTeX/KaTeX/issues/810)


## [v0.8.2] - 2017-08-17
### Added
- Accepts all existing Greek letters using unicode characters in math mode. See [#410](https://github.com/KaTeX/KaTeX/pull/410)

### Fixed
- Fixed MathML output for ' and large operators with limits. [#788](https://github.com/KaTeX/KaTeX/pull/788)
- Updated package.json to point 'main' at dist/katex.js. [#791](https://github.com/KaTeX/KaTeX/pull/791)
- Fixed color support for stretchy, strikethrough, and fbox. [#792](https://github.com/KaTeX/KaTeX/pull/792)
- Detect attachEvent() support correctly. See [#771](https://github.com/KaTeX/KaTeX/issues/771) and [#772](https://github.com/KaTeX/KaTeX/pull/772) for the issue and PR fix respectively.

## [v0.8.1] - 2017-08-11
### Fixed
- Note: The v0.8.0 release did not include the SVG images which are necessary for rendering wide and stretchy accents as well as `\overbrace` and `\underbrace`. This release corrects that.

- Note that if you're including copies of KaTeX in your web application, you should now include the dist/images directory in addition to the usual the dist/fonts directory.

## [v0.8.0] - 2017-08-11
### Added
- Added some international operators. See [#509](https://github.com/KaTeX/KaTeX/issues/509)
- Old font command support: `\rm`, `\sf`, `\tt`, `\bf`, `\it`. [#675](https://github.com/KaTeX/KaTeX/pull/675)
- Builtin macros, macro arguments, `\overset` and `\underset`. [#605](https://github.com/KaTeX/KaTeX/pull/605)
- Added `\iff`, `\implies`, `\impliedby` support. [#697](https://github.com/KaTeX/KaTeX/pull/697)
- Support <, >, | and many `\text`... commands in text mode. [#684](https://github.com/KaTeX/KaTeX/pull/684)
- Implemented $...$ via styling node. [#637](https://github.com/KaTeX/KaTeX/pull/637)
- Added `\jot` lineskip to aligned environment, switch contents to displaystyle, and add gathered. [#725](https://github.com/KaTeX/KaTeX/pull/725)
- Support stretchy wide elements. [#670](https://github.com/KaTeX/KaTeX/pull/670)
- Set maxFontSize on rules. [#744](https://github.com/KaTeX/KaTeX/pull/744)


### Changes
- Added support for Windows high-contrast mode. Fixed [#716](https://github.com/KaTeX/KaTeX/issues/716)  [#724](https://github.com/KaTeX/KaTeX/pull/724)
-Implemented `\coloneqq`, `\colonequals`, etc. based on mathtools and colonequals. [#727](https://github.com/KaTeX/KaTeX/pull/727)
- Added configurable error callback. [#658](https://github.com/KaTeX/KaTeX/pull/658)
- Added support for absolute TeX units. [#732](https://github.com/KaTeX/KaTeX/pull/732)
- Revert "Remove trailing commas for IE 9 compatibility". [#622](https://github.com/KaTeX/KaTeX/pull/622)
- Use utils.deflt for Settings. [#649](https://github.com/KaTeX/KaTeX/pull/649)
- Refactored and commented space splicing code. [#699](https://github.com/KaTeX/KaTeX/pull/699)
- Vertically center single-character `\mathop`. [#745](https://github.com/KaTeX/KaTeX/pull/745)
- Associate font metrics with Options, not Style. [#743](https://github.com/KaTeX/KaTeX/pull/743)
- Upgraded the source to use ES6 syntax including classes, import and static properties.
[#679](https://github.com/KaTeX/KaTeX/pull/679)
- Use `\displaystyle` within `\over/\underbrace`. [#765](https://github.com/KaTeX/KaTeX/pull/765)
- Shrinkwrap vlists in table-like CSS. [#768](https://github.com/KaTeX/KaTeX/pull/768)
- Improve rule coding, including for `\sqrt`. [#776](https://github.com/KaTeX/KaTeX/pull/776)

### Breaking Changes
- Implicit `\color`, explicitly grouped `\textcolor`. See [#619](https://github.com/KaTeX/KaTeX/pull/619)

### Fixed
- Fixed high contrast mode better. [#733](https://github.com/KaTeX/KaTeX/pull/733)
- Fixed all AMS mathord symbols. [#618](https://github.com/KaTeX/KaTeX/pull/618)
- Fixed x'^2 [#636](https://github.com/KaTeX/KaTeX/pull/636)
- Fixed font typo math -> main. [#678](https://github.com/KaTeX/KaTeX/pull/678)
- Fixed spaces before `\middle`. [#689](https://github.com/KaTeX/KaTeX/pull/689)
- Fixed [#711](https://github.com/KaTeX/KaTeX/issues/711) issue with multiple superscripts.  [#718](https://github.com/KaTeX/KaTeX/pull/718)
- Fixed interaction between styles and sizes. [#719](https://github.com/KaTeX/KaTeX/pull/719)
- Correct handling of unbraced kerns followed by spaces. [#751](https://github.com/KaTeX/KaTeX/pull/751)
- Corrected computation of TeX sizes. [#755](https://github.com/KaTeX/KaTeX/pull/755)
- Solved Safari rendering issues with font-size overrides. [#780](https://github.com/KaTeX/KaTeX/pull/780)


## [v0.7.1] - 2017-01-21
### Fixed
- Restored creation of dist directory during release process.


## [v0.7.0] - 2017-01-08
### Added
- Added `\atop`, `\bmod`, `\degree`, `\kern`, `\ldots`, `\maltese`, `\mathbin`, `\mathclose`, `\mathellipsis`, `\mathop`, `\mathopen`, `\mathord`, `\mathpunct`, `\mathrel`, `\middle`, `\mod`, `\pod`, `\pounds`, `\pmod`, `\stackre`, `\textbf`, `\textellipsis`, `\textit`, `\textnormal`, `\textrm`, `\textsf`, `\texttt`, `--`, `---`, `'''`, `'`, `` ``​ and `""`.
- Added `\#`, `\&`, `\$`, `\%`, `\_`, `\{`, and `\}` in text mode.

### Changed
- Allow specifying macros (without arguments) in the settings object.
- Combine adjacent spans in text mode.

### Fixed
- Do not apply italic correction in text mode.
- Fixed the MathML fence attribute on delimiters.
- Fixed converting bins to ords.
- Made `\llap` and `\rlap` produce ords.
- Fixed spacing around `\color`, `\mathbf`, and in other places.
- Added per-style font metrics.
- Complain when trying to render a non-string.
- Fixed subscript positioning with changed-font bases.
- Fixed superscript/subscript centering in fractions.


## [v0.6.0] - 2016-04-15
### Added
- Added  `\gt`, `\lt` and `\underline` support.
- Introduced the aligned environment.

### Removed
- Removed 3px border around rules.

### Changed
- Bundle CSS and fonts in npm package.

### Fixed
- Fixed sub- and super-scripts not being centered inside of math display.
- Set the greediness of font functions to 2 so that `e^\mathbf{x}` will parse.


## [v0.5.1] - 2015-09-01
### Added
- Added the font changing functions `\mathrm`, `\mathit`, `\mathbf`, `\mathbb`, `\mathcal`, `\mathfrak`, `\mathscr`, `\mathsf`, `\mathtt`, `\Bbb`, `\bold`, and `\frak`.
- Added the `\limits` and `\nolimits` functions.
- Added a throwOnError option to allow generating red error text when rendering invalid commands instead of throwing errors, and a corresponding errorColor option to decide the color of invalid commands.
- Added support for `|` column delimiters in the array environment.
- Added `\lVert` and `\rVert` symbols.

### Changed
- Allow `\lvert`, `\rvert`, `\lVert`, `\rVert`, `\lgroup`, `\rgroup`, `\lmoustache`, and `\rmoustache` in delimiters.

### Fixed
- Fix the spacing of the `\ulcorner`, `\urcorner`, `\llcorner`, `\lrcorner`, `\barwedge`, `\veebar`, `\circledcirc`, `\boxdot`, `\uparrow`, `\Uparrow`, `\downarrow`, `\Downarrow`, `\updownarrow`, `\Updownarrow`, and `\ldots` symbols.


## [v0.5.0] - 2015-07-16
### Added
- Added the cases and Bmatrix environments.
- Added `\checkmark` and `\circledR` symbols.

### Changed
- Ran `ttfautohint` on our fonts to produce better results at small font sizes.
- Improved the spacing inside fractions.
- Correctly set environments to the ord type.


## [v0.4.3] - 2015-06-20
### Fixed
- Fixed bower.json to include a "main" entry


## [v0.4.0] - 2015-06-18
### Added
- Added support for some `\begin`/`\end` environments, including support for `array`, `matrix`, `pmatrix`, `bmatrix`, `vmatrix`, and `Vmatrix`.
- Added support for optional `\sqrt` arguments, e.g. `\sqrt[3]{x}`.
- Bower package is now available: run `bower install katex` to download the built files.


### Changed
- Added a display mode flag to the cli.
- Exposed an unstable `__parse` method for retrieving the parse tree.
- Prevent elements from inheriting `text-indent`.


## [v0.3.0] - 2015-04-01
### Added
- Added an auto-render extension for automatically rendering math on a page.
- Added support for `\phantom`.
- Added `\#`, `\&`.

### Removed
- Removed `!important` from MathML hiding rules, so they can be overridden.

### Breaking Changes
- The greediness of the `\color` function has changed to maintain compatibility with MathJax, so expressions like `\color{red}\text{a}` will no longer work and instead need to be rewritten as `\color{red}{\text{a}}`.

### Fixed
- Fixed spacing for `\odot`, `\oplus`, `\otimes`, `\oslash`, `\bigtriangleup`, `\bigtriangledown`, `\dagger`, `\diamond`, `\star`, `\triangleleft`, `\triangleright`.
- Fixed MathML handling of text operators.


## [v0.2.0] - 2015-03-02
### Added
- Added accessibility through the use of MathML.
- Added the ability to render math in display mode, centered on a single line in display style.
- Added support for new symbols: `\aleph`, `\amalg`, `\approxeq`, `\ast`, `\asymp`, `\backepsilon`, `\backprime`, `\backsim`, `\backsimeq`, `\Bbbk`, `\because`, `\beth`, `\between`, `\bigcirc`, `\bigstar`, `\blacklozenge`, `\blacksquare`, `\blacktriangle`, `\blacktriangledown`, `\blacktriangleleft`, `\blacktriangleright`, `\bowtie`, `\Box`, `\boxminus`, `\boxplus`, `\boxtimes`, `\bullet`, `\bumpeq`, `\Bumpeq`, `\Cap`, `\cdotp`, `\centerdot`, `\circeq`, `\circlearrowleft`, `\circlearrowright`, `\circledast`, `\circleddash`, `\circledS`, `\clubsuit`, `\complement`, `\Cup`, `\curlyeqprec`, `\curlyeqsucc`, `\curlyvee`, `\curlywedge`, `\curvearrowleft`, `\curvearrowright`, `\dag`, `\daleth`, `\dashleftarrow`, `\dashrightarrow`, `\dashv`, `\ddag`, `\ddagger`, `\diagdown`, `\diagup`, `\Diamond`, `\diamondsuit`, `\digamma`, `\divideontimes`, `\doteq`, `\Doteq`, `\doteqdot`, `\dotplus`, `\doublebarwedge`, `\doublecap`, `\doublecup`, `\downdownarrows`, `\downharpoonleft`, `\downharpoonright`, `\ell`, `\eqcirc`, `\eqsim`, `\eqslantgtr`, `\eqslantless`, `\equiv`, `\eth, `\exists, `\fallingdotseq`, `\Finv`, `\flat`, `\forall`, `\frown`, `\Game`, `\geqq`, `\geqslant`, `\gg`, `\ggg`, `\gggtr`, `\gimel`, `\gnapprox`, `\gneq`, `\gneqq`, `\gnsim`, `\gtrapprox`, `\gtrdot`, `\gtreqless`, `\gtreqqless`, `\gtrless`, `\gtrsim`, `\gvertneqq`, `\hbar`, `\heartsuit`, `\hookleftarrow`, `\hookrightarrow`, `\hslash`, `\Im`, `\intercal`, `\Join`, `\ldotp`, `\leadsto`, `\Leftarrow`, `\leftarrowtail`, `\leftharpoondown`, `\leftharpoonup`, `\leftleftarrows`, `\leftrightarrow`, `\Leftrightarrow`, `\leftrightarrows`, `\leftrightharpoons`, `\leftrightsquigarrow`, `\leftthreetimes`, `\leqq`, `\leqslant`, `\lessapprox`, `\lessdot`, `\lesseqgtr`, `\lesseqqgtr`, `\lessgtr`, `\lesssim`, `\lgroup`, `\lhd`, `\ll`, `\llcorner`, `\Lleftarrow`, `\lll`, `\llless`, `\lmoustache`, `\lnapprox`, `\lneq`, `\lneqq`, `\lnsim`, `\longleftarrow`, `\Longleftarrow`, `\longleftrightarrow`, `\Longleftrightarrow`, `\longmapsto`, `\longrightarrow`, `\Longrightarrow`, `\looparrowleft`, `\looparrowright`, `\lozenge`, `\lrcorner`, `\Lsh`, `\ltimes`, `\lvertneqq`, `\mapsto`, `\measuredangle`, `\mho`, `\mid`, `\mp`, `\multimap`, `\nabla`, `\natural`, `\ncong`, `\nearrow`, `\nexists`, `\ngeqq`, `\ngeqslant`, `\ngtr`, `\ni`, `\nleftarrow`, `\nLeftarrow`, `\nleftrightarrow`, `\nLeftrightarrow`, `\nleqq`, `\nleqslant`, `\nless`, `\nmid`, `\nparallel`, `\nprec`, `\npreceq`, `\nrightarrow`, `\nRightarrow`, `\nshortmid`, `\nshortparallel`, `\nsim`, `\nsubseteqq`, `\nsucc`, `\nsucceq`, `\nsupseteqq`, `\ntriangleleft`, `\ntrianglelefteq`, `\ntriangleright`, `\ntrianglerighteq`, `\nvdash`, `\nvDash`, `\nVdash`, `\nVDash`, `\nwarrow`, `\ominus`, `\owns`, `\parallel`, `\perp`, `\pitchfork`, `\prec`, `\precapprox`, `\preccurlyeq`, `\preceq`, `\precnapprox`, `\precneqq`, `\precnsim`, `\precsim`, `\propto`, `\Re`, `\restriction`, `\rgroup`, `\rhd`, `\Rightarrow`, `\rightarrowtail`, `\rightharpoondown`, `\rightharpoonup`, `\rightleftarrows`, `\rightleftharpoons`, `\rightrightarrows`, `\rightsquigarrow`, `\rightthreetimes`, `\risingdotseq`, `\rmoustache`, `\Rrightarrow`, `\Rsh`, `\rtimes`, `\searrow`, `\sharp`, `\shortmid`, `\shortparallel`, `\sim`, `\simeq`, `\smallfrown`, `\smallsetminus`, `\smallsmile`, `\smile`, `\spadesuit`, `\sphericalangle`, `\sqcap`, `\sqcup`, `\sqsubset`, `\sqsubseteq`, `\sqsupset`, `\sqsupseteq`, `\square`, `\Subset`, `\subseteqq`, `\subsetneq`, `\subsetneqq`, `\succ`, `\succapprox`, `\succcurlyeq`, `\succeq`, `\succnapprox`, `\succneqq`, `\succnsim`, `\succsim`, `\Supset`, `\supseteqq`, `\supsetneq`, `\supsetneqq`, `\swarrow`, `\therefore`, `\thickapprox`, `\thicksim`, `\triangledown`, `\trianglelefteq`, `\triangleq`, `\trianglerighteq`, `\twoheadleftarrow`, `\twoheadrightarrow`, `\ulcorner`, `\unlhd`, `\unrhd`, `\upharpoonleft`, `\upharpoonright`, `\uplus`, `\upuparrows`, `\urcorner`, `\varkappa`, `\varpropto`, `\varsubsetneq`, `\varsubsetneqq`, `\varsupsetneq` `\varsupsetneqq`, `\vartriangle`, `\vartriangleleft`, `\vartriangleright`, `\vdash`, `\vDash`, `\Vdash`, `\Vvdash`, `\wp`, `\wr`, `\yen`.

### Removed
- Removed unused greek fonts.


## [v0.1.1] - 2014-10-15
### Added
- Added support for `\binom`
- Added support for `\over` and `\choose`
- Added `\partial`, `\subset`, `\supset`, `\subseteq`, `\supseteq`, `\cap`, `\cup`, `\setminus`, `\neg`, `\lnot`, `\top`, `\bot`, `\emptyset`, `\varnothing`, `\land`, `\lor`, `\wedge`, `\vee`, `\notin`, `\nsubseteq`, `\nsupseteq`, `\models`.
- Added simple `katex` command-line binary to convert TeX to HTML on the server.
- Added WOFF2 fonts for faster downloads in Chrome and Opera.

### Changed
- Correctly throws on `\sqrt[3]{x}` to indicate lack of support.
- Warn when in quirks mode (i.e., missing a `<!DOCTYPE html>` declaration).
- Built files now only use ASCII characters to avoid character encoding problems.

### Fixed
- Fixed spacing for `\iint` and `\iiint`.


## [v0.1.0] - 2014-09-15
Initial Public Release
