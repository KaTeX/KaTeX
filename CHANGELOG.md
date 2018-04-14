# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [v0.8.0] - 2017-07-11
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