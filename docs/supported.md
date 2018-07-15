---
id: supported
title: Supported Functions
---
This is a list of TeX functions supported by KaTeX. It is sorted into logical groups.

There is another version of this page, [with working examples](https://khan.github.io/KaTeX/function-support.html).

For a list of things that are not (yet) in KaTeX, there is a [wiki page](https://github.com/Khan/KaTeX/wiki/Things-that-KaTeX-does-not-%28yet%29-support).

## Accents

|||||
|:-------------|:-------------|:-----------------------|:--------------------|
| $'$ $'$ `'`         | $\grave$ `\grave`     | $\overleftarrow$ `\overleftarrow`       | $\overrightarrow$ `\overrightarrow`   |
| $''$ `''`        | $\hat$ `\hat`       | $\underleftarrow$ `\underleftarrow`      | $\underrightarrow$ `\underrightarrow`  |
| $^{\prime}$ `^{\prime}` | $\widehat$ `\widehat`   | $\overleftrightarrow$ `\overleftrightarrow`  | $\overbrace$ `\overbrace`        |
| $\acute$ `\acute`     | $\mathring$ `\mathring`  | $\underleftrightarrow$ `\underleftrightarrow` | $\underbrace$ `\underbrace`       |
| $\bar$ `\bar`       | $\tilde$ `\tilde`     | $\overgroup$ `\overgroup`           | $\overlinesegment$ `\overlinesegment`  |
| $\breve$ `\breve`     | $\widetilde$ `\widetilde` | $\undergroup$ `\undergroup`          | $\underlinesegment$ `\underlinesegment` |
| $\check$ `\check`     | $\vec$ `\vec`       | $\overleftharpoon$ `\overleftharpoon`     | $\overrightharpoon$ `\overrightharpoon` |
| $\dot$ `\dot`       | $\overline$ `\overline`  | $\Overrightarrow$ `\Overrightarrow`      | $\utilde$ `\utilde`           |
| $\ddot$ `\ddot`      | $\underline$ `\underline` | $\widecheck$ `\widecheck`           |                     |

***Accent functions inside \\text{…}***

$\'$ `\'`  $\~$ `\~` $\.$ `\.` $\H$ `\H` $\=$ `\=`  $\"$ `\"` $\v$ `\v` $\^$ `\^` $\u$ `\u`  $\r$ `\r`

## Delimiters

|||||
|----------------------|------------------------|--------------------------------|----------------|
| $( )$ `( )`                | $\lgroup$ `\lgroup`<br>$\rgroup$ `\rgroup` | $\lceil$ `\lceil`<br>$\rceil$ `\rceil`           | $\uparrow$ `\uparrow`     |
| $[ ]$ `[ ]`                | $\lbrack$ `\lbrack`<br>$\rbrack$ `\rbrack` | $\lfloor$ `\lfloor`<br>$\rfloor$ `\rfloor`         | $\downarrow$ `\downarrow`   |
| ${ }$ `{ }`                | $\lbrace$ `\lbrace`<br>$\rbrace$ `\rbrace` | $\lmoustache$ `\lmoustache`<br>$\rmoustache$ `\rmoustache` | $\updownarrow$ `\updownarrow` |
| $⟨ ⟩$ `⟨ ⟩`                 | $\langle$ `\langle`<br>$\rangle$ `\rangle` | $\lt$ `\lt`<br>$\gt$ `\gt`                 | $\Uparrow$ `\Uparrow`     |
| $\|$ `\|`                 | $\vert$ `\vert`                | $\ulcorner$ `\ulcorner`<br>$\urcorner$ `\urcorner`     | $\Downarrow$ `\Downarrow`   |
| $\\|$ `\\|`                | $\Vert$ `\Vert`                | $\llcorner$ `\llcorner`<br>$\lrcorner$ `\lrcorner`     | $\Updownarrow$ `\Updownarrow` |
| $\lvert$ `\lvert`<br>$\rvert$ `\rvert` | $\lVert$ `\lVert`<br>$\rVert$ `\rVert`   | $\left.$ `\left.`                       | $\right.$ `\right.`      |
| $\backslash$ `\backslash`         |                        |                                |                |

**Delimiter Sizing**

|||||
|-----------|---------|----------|----------|
| $\left$ `\left`   | $\big$ `\big`  | $\bigl$ `\bigl`  | $\bigr$ `\bigr`  |
| $\middle$ `\middle` | $\Big$ `\Big`  | $\Bigl$ `\Bigl`  | $\Bigr$ `\Bigr`  |
| $\right$ `\right`  | $\bigg$ `\bigg` | $\biggl$ `\biggl` | $\biggr$ `\biggr` |
|           | $\Bigg$ `\Bigg` | $\Biggl$ `\Biggl` | $\Biggr$ `\Biggr` |

## Environments

$array$ `array` $matrix$ `matrix` $bmatrix$ `bmatrix` $Bmatrix$ `Bmatrix` $pmatrix$ `pmatrix` $vmatrix$ `vmatrix` $Vmatrix$ `Vmatrix` <br>
$aligned$ `aligned` $alignedat$ `alignedat` $gathered$ `gathered` $cases$ `cases` $darray$ `darray` $dcases$ `dcases`

Acceptable line separators include: $\\$ `\\`, $\cr$ `\cr`, $\\[distance]$ `\\[distance]`, and $\cr[distance]$ `\cr[distance]`. *Distance* can be written with any of the [KaTeX units](#units). $\hline$ `\hline` and $\hdashline$ `\hdashline` are supported.

The ${array}$ `{array}` environment supports $|$ `|` and $:$ `:` vertical separators.

The ${array}$ `{array}` environment does not yet support $\cline$ `\cline` or $\multicolumn$ `\multicolumn`.

## HTML

\\href{https://khan.github.io/KaTeX/}{katex}

## Letters

**Greek Letters**

Direct Input: $Α Β Γ Δ Ε Ζ Η Θ Ι Κ Λ Μ Ν Ξ Ο Π Ρ Σ Τ Υ Φ Χ Ψ Ω$ `Α Β Γ Δ Ε Ζ Η Θ Ι Κ Λ Μ Ν Ξ Ο Π Ρ Σ Τ Υ Φ Χ Ψ Ω`<br>
$α β γ δ ϵ ζ η θ ι κ λ μ ν ξ o π ρ σ τ υ ϕ χ ψ ω ε ϑ ϖ ϱ ς φ$ `α β γ δ ϵ ζ η θ ι κ λ μ ν ξ o π ρ σ τ υ ϕ χ ψ ω ε ϑ ϖ ϱ ς φ`

|||||
|---------------|-------------|-------------|---------------|
| $\Gamma$ `\Gamma`      | $\Delta$ `\Delta`    | $\Theta$ `\Theta`    | $\Lambda$ `\Lambda`     |
| $\Xi$ `\Xi`         | $\Pi$ `\Pi`       | $\Sigma$ `\Sigma`    | $\Upsilon$ `\Upsilon`    |
| $\Phi$ `\Phi`        | $\Psi$ `\Psi`      | $\Omega$ `\Omega`    |               |
| $\varGamma$ `\varGamma`   | $\varDelta$ `\varDelta` | $\varTheta$ `\varTheta` | $\varLambda$ `\varLambda`  |
| $\varXi$ `\varXi`      | $\varPi$ `\varPi`    | $\varSigma$ `\varSigma` | $\varUpsilon$ `\varUpsilon` |
| $\varPhi$ `\varPhi`     | $\varPsi$ `\varPsi`   | $\varOmega$ `\varOmega` |               |
| $\alpha$ `\alpha`      | $\beta$ `\beta`     | $\gamma$ `\gamma`    | $\delta$ `\delta`      |
| $\epsilon$ `\epsilon`    | $\zeta$ `\zeta`     | $\eta$ `\eta`      | $\theta$ `\theta`      |
| $\iota$ `\iota`       | $\kappa$ `\kappa`    | $\lambda$ `\lambda`   | $\mu$ `\mu`         |
| $\nu$ `\nu`         | $\xi$ `\xi`       | $\omicron$ `\omicron`  | $\pi$ `\pi`         |
| $\rho$ `\rho`        | $\sigma$ `\sigma`    | $\tau$ `\tau`      | $\upsilon$ `\upsilon`    |
| $\phi$ `\phi`        | $\chi$ `\chi`      | $\psi$ `\psi`      | $\omega$ `\omega`      |
| $\varepsilon$ `\varepsilon` | $\varkappa$ `\varkappa` | $\vartheta$ `\vartheta` | $\varpi$ `\varpi`      |
| $\varrho$ `\varrho`     | $\varsigma$ `\varsigma` | $\varphi$ `\varphi`   | $\digamma $ `\digamma `   |

**Other Letters**

||||||
|------------|-----------|----------|---------|----------|
| $imath$ `imath`    | $\eth$ `\eth`    | $\Im$ `\Im`      | $\text{\aa}$ `\text{\aa}`   | $\text{\o}$ `\text{\o}`  |
| $\jmath$ `\jmath`   | $\Finv$ `\Finv`   | $\Re$ `\Re`      | $\text{\AA}$ `\text{\AA}`   | $\text{\O}$ `\text{\O}`  |
| $\aleph$ `\aleph`   | $\Game$ `\Game`   | $\wp$ `\wp`      | $\text{\ae}$ `\text{\ae}`   | $\text{\ss}$ `\text{\ss}` |
| $\beth$ `\beth`    | $\ell$ `\ell`    | $\partial$ `\partial` | $\text{\AE}$ `\text{\AE}`   | $\text{\i}$ `\text{\i}`  |
| $\gimel$ `\gimel`   | $\hbar$ `\hbar`   | $\nabla$ `\nabla`   | $\text{\oe}$ `\text{\oe}`   | $\text{\j}$ `\text{\j}`  |
| $\daleth$ `\daleth`  | $\hslash$ `\hslash` | $\Bbbk$ `\Bbbk`    | $\text{\OE}$ `\text{\OE}`   |              |

Direct Input: $ℂ ℍ ℕ ℙ ℚ ℝ ℤ ∂ ð ∇ ℑ ℓ ℘ ℜ Ⅎ ℵ ℶ ℷ ℸ ⅁$ `ℂ ℍ ℕ ℙ ℚ ℝ ℤ ∂ ð ∇ ℑ ℓ ℘ ℜ Ⅎ ℵ ℶ ℷ ℸ ⅁`<br>
$ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖÙÚÛÜÝÞß<br>àáâãäåçèéêëìíîïðñòóôöùúûüýþÿ$ `ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖÙÚÛÜÝÞß<br>àáâãäåçèéêëìíîïðñòóôöùúûüýþÿ`

**Unicode Mathematical Alphanumeric Symbols**

| Item         |  Range        |  Item               |  Range        |
|--------------|---------------|---------------------|---------------|
| Bold         |  A-Z a-z 0-9  |  Double-struck      |  A-Z k        |
| Italic       |  A-Z a-z      |  Sans serif         |  A-Z a-z 0-9  |
| Bold Italic  |  A-Z a-z      |  Sans serif bold    |  A-Z a-z 0-9  |
| Script       |  A-Z          |  Sans serif italic  |  A-Z a-z      |
| Fractur      |  A-Z a-z      |  Monospace          |  A-Z a-z 0-9  |

## Unicode

The letters listed above will render in any KaTeX rendering mode.

If the KaTeX rendering mode is set to $strict: false$ `strict: false` or $strict:"warn"$ `strict:"warn"` (default), then KaTeX will accept all Unicode letters. The letters not listed above will be rendered from system fonts, not KaTeX-supplied fonts, so their typography may clash. They may also cause small vertical alignment issues. KaTeX has detailed metrics for glyphs in Latin, Greek, and Cyrillic, but other glyphs are treated as if they are each as tall as the letter M.

For Persian composite characters, a user-supplied [plug-in](https://github.com/HosseinAgha/persian-katex-plugin) is under development.

## Annotation

$\cancel$ `\cancel` $\bcancel$ `\bcancel` $\xcancel$ `\xcancel` $\sout$ `\sout` $\overbrace$ `\overbrace` $\underbrace$ `\underbrace` $\boxed$ `\boxed` $\not$ `\not` $\tag$ `\tag` $tag*$ `tag*`

## Line Breaks

KaTeX 0.10.0+ will insert automatic line breaks in inline math after relations or binary operators such as “=” or “+”. These can be suppressed by placing math inside a pair of braces, as in ${F=ma}$ `{F=ma}`.

Hard line breaks are $\\$ `\\` and $\newline$ `\newline`.

In display math, KaTeX does not insert automatic line breaks. It ignores display math hard line breaks when rendering option $strict: true$ `strict: true`.

## Overlap

$\mathllap$ `\mathllap` $\mathrlap$ `\mathrlap` $\mathclap$ `\mathclap` $\llap$ `\llap` $\rlap$ `\rlap` $\clap$ `\clap` $\smash$ `\smash`

## Spacing

| Function        | Produces           | Function              | Produces                              |
|:----------------|:-------------------|:----------------------|:--------------------------------------|
| $\!$ `\!`            | – ³∕₁₈ em space    | $\kern{distance}$ `\kern{distance}`     | space, width = *distance*             |
| $\,$ `\,`            | ³∕₁₈ em space      | $\mkern{distance}$ `\mkern{distance}`    | space, width = *distance*             |
| $\thinspace$ `\thinspace`    | ³∕₁₈ em space      | $\skip{distance}$ `\skip{distance}`     | space, width = *distance*             |
| $\:$ `\:`            | ⁴∕₁₈ em space      | $\mskip{distance}$ `\mskip{distance}`    | space, width = *distance*             |
| $\medspace$ `\medspace`     | ⁴∕₁₈ em space      | $\hspace{distance}$ `\hspace{distance}`   | space, width = *distance*             |
| $\;$ `\;`            | ⁵∕₁₈ em space      | $\hspace\*{distance}$ `\hspace\*{distance}` | space, width = *distance*             |
| $\thickspace$ `\thickspace`   | ⁵∕₁₈ em space      | $\phantom{content}$ `\phantom{content}`   | space the width and height of content |
| $\enspace$ `\enspace`      | ½ em space         | $\hphantom{content}$ `\hphantom{content}`  | space the width of content            |
| $\quad$ `\quad`         | 1 em space         | $\vphantom{content}$ `\vphantom{content}`  | a strut the height of content         |
| $\qquad$ `\qquad`        | 2 em space         |                       |                                       |
| $\~$ `\~`            | non-breaking space |                       |                                       |
| $\space$ `\space`        |  space             |                       |                                       |
| $\nobreakspace$ `\nobreakspace` | non-breaking space |                       |                                       |
| $\space$ `\space`        |  space             |                       |                                       |

**Notes:**

$distance$ `distance` will accept any of the [KaTeX units](#units).

$\kern$ `\kern`, $\mkern$ `\mkern`, and $\hspace$ `\hspace` accept unbraced distances, as in: $\kern1em$ `\kern1em`.

$\mkern$ `\mkern` and $\mskip$ `\mskip` will not work in text mode and both will write a console warning for any unit except $mu$ `mu`.

## Vertical Layout

$x_n$ `x_n` $e^x$ `e^x` $_u^o$ `_u^o` $\atop$ `\atop` $\stackrel$ `\stackrel` $\overset$ `\overset` $\underset$ `\underset` $\raisebox$ `\raisebox`

## Logic and Set Theory

|||||
|------------|---------------|-------------------|------------------------------|
| $\forall$ `\forall`  | $\complement$ `\complement` | $\therefore$ `\therefore`      | $\neg$ `\neg` or $\lnot$ `\lnot`            |
| $\exists$ `\exists`  | $\subset$ `\subset`     | $\because$ `\because`        | $\emptyset$ `\emptyset` or $\varnothing$ `\varnothing` |
| $\nexists$ `\nexists` | $\supset$ `\supset`     | $\mapsto$ `\mapsto`         |                              |
| $\in$ `\in`      | $\mid$ `\mid`        | $\to$ `\to`             | $\implies$ `\implies`                   |
| $\notin$ `\notin`   | $\land$ `\land`       | $\gets$ `\gets`           | $\impliedby$ `\impliedby`                 |
| $\ni$ `\ni`      | $\lor$ `\lor`        | $\leftrightarrow$ `\leftrightarrow` | $\iff$ `\iff`                       |
| $\notni$ `\notni`   |               |                   |                              |

Direct Input: $∀ ∴ ∁ ∵ ∃ ∣ ∈ ∉ ∋ ⊂ ⊃ ∧ ∨ ↦ → ← ↔ ¬ ℂ ℍ ℕ ℙ ℚ ℝ ℤ$ `∀ ∴ ∁ ∵ ∃ ∣ ∈ ∉ ∋ ⊂ ⊃ ∧ ∨ ↦ → ← ↔ ¬ ℂ ℍ ℕ ℙ ℚ ℝ ℤ`

## Macros

* $\\def\\macroname#1#2…{definition}$ `\\def\\macroname#1#2…{definition}`
* $\\gdef\\macroname#1#2…{definition}$ `\\gdef\\macroname#1#2…{definition}`
* $\\global\\def\\macroname#1#2…{definition}$ `\\global\\def\\macroname#1#2…{definition}`
* $\\newcommand\\macroname\[numargs]{definition}$ `\\newcommand\\macroname\[numargs]{definition}`
* $\\renewcommand\\macroname\[numargs]{definition}$ `\\renewcommand\\macroname\[numargs]{definition}`
* $\\providecommand\\macroname\[numargs]{definition}$ `\\providecommand\\macroname\[numargs]{definition}`

Macros can also be defined in the KaTeX [rendering options](https://github.com/Khan/KaTeX#rendering-options).

Macros accept up to ten arguments: #1, #2, etc.

$\gdef$ `\gdef` and $\global\def$ `\global\def` macros will persist between math expressions.
Available functions include:

$\mathchoice$ `\mathchoice` $\TextOrMath$ `\TextOrMath` $\@ifstar$ `\@ifstar` $\@ifnextchar$ `\@ifnextchar` $\@firstoftwo$ `\@firstoftwo` $\@secondoftwo$ `\@secondoftwo` $\relax$ `\relax`

@ is a valid character for commands, as if $\makeatletter$ `\makeatletter` were in effect.

## Operators

**Big Operators**

|||||
|----------|-------------|-------------|--------------|
| $\sum$ `\sum`   | $\prod$ `\prod`     | $\bigvee$ `\bigvee`   | $\bigotimes$ `\bigotimes` |
| $\int$ `\int`   | $\coprod$ `\coprod`   | $\bigwedge$ `\bigwedge` | $\bigoplus$ `\bigoplus`  |
| $\iint$ `\iint`  | $\intop$ `\intop`    | $\bigcap$ `\bigcap`   | $\bigodot$ `\bigodot`   |
| $\iiint$ `\iiint` | $\smallint$ `\smallint` | $\bigcup$ `\bigcup`   | $\biguplus$ `\biguplus`  |
| $\oint$ `\oint`  |             | $\bigsqcup$ `\bigsqcup` |              |

Direct Input: $∫ ∬ ∭ ∮ ∏ ∐ ∑ ⋀ ⋁ ⋂ ⋃ ⨀ ⨁ ⨂ ⨄ ⨆$ `∫ ∬ ∭ ∮ ∏ ∐ ∑ ⋀ ⋁ ⋂ ⋃ ⨀ ⨁ ⨂ ⨄ ⨆`

**Binary Operators**

|||||
|-------------|-------------------|-------------------|--------------------|
| $+$ `+`         | $\cdot$ `\cdot`           | $\gtrdot$ `\gtrdot`         | $\pmod$ `\pmod`            |
| $-$ `-`         | $\cdotp$ `\cdotp`          | $\intercal$ `\intercal`       | $\pod$ `\pod`             |
| $/$ `/`         | $\centerdot$ `\centerdot`      | $\land$ `\land`           | $\rhd$ `\rhd`             |
| $*$ `*`         | $\circ$ `\circ`           | $\leftthreetimes$ `\leftthreetimes` | $\rightthreetimes$ `\rightthreetimes` |
| $\amalg$ `\amalg`    | $\circledast$ `\circledast`     | $\ldotp$ `\ldotp`          | $\rtimes$ `\rtimes`          |
| $\And$ `\And`      | $\circledcirc$ `\circledcirc`    | $\lor$ `\lor`            | $\setminus$ `\setminus`        |
| $\ast$ `\ast`      | $\circleddash$ `\circleddash`    | $\lessdot$ `\lessdot`        | $\smallsetminus$ `\smallsetminus`   |
| $\barwedge$ `\barwedge` | $\Cup$ `\Cup`            | $\lhd$ `\lhd`            | $\sqcap$ `\sqcap`           |
| $\bigcirc$ `\bigcirc`  | $\cup$ `\cup`            | $\ltimes$ `\ltimes`         | $\sqcup$ `\sqcup`           |
| $\bmod$ `\bmod`     | $\curlyvee$ `\curlyvee`       | $\mod$ `\mod`            | $\times$ `\times`           |
| $\boxdot$ `\boxdot`   | $\curlywedge$ `\curlywedge`     | $\mp$ `\mp`             | $\unlhd$ `\unlhd`           |
| $\boxminus$ `\boxminus` | $\div$ `\div`            | $\odot$ `\odot`           | $\unrhd$ `\unrhd`           |
| $\boxplus$ `\boxplus`  | $\divideontimes$ `\divideontimes`  | $\ominus$ `\ominus`         | $\uplus$ `\uplus`           |
| $\boxtimes$ `\boxtimes` | $\dotplus$ `\dotplus`        | $\oplus$ `\oplus`          | $\vee$ `\vee`             |
| $\bullet$ `\bullet`   | $\doublebarwedge$ `\doublebarwedge` | $\otimes$ `\otimes`         | $\veebar$ `\veebar`          |
| $\Cap$ `\Cap`      | $\doublecap$ `\doublecap`      | $\oslash$ `\oslash`         | $\wedge$ `\wedge`           |
| $\cap$ `\cap`      | $\doublecup$ `\doublecup`      | $\pm$ `\pm`             | $\wr$ `\wr`              |

Direct Input: $+ - / \* ⋅ ± × ÷ ∓ ∔ ∧ ∨ ∩ ∪ ≀ ⊎ ⊓ ⊔ ⊕ ⊖ ⊗ ⊘ ⊙ ⊚ ⊛ ⊝$ `+ - / \* ⋅ ± × ÷ ∓ ∔ ∧ ∨ ∩ ∪ ≀ ⊎ ⊓ ⊔ ⊕ ⊖ ⊗ ⊘ ⊙ ⊚ ⊛ ⊝`<br>
$⊞ ⊟ ⊠ ⊡ ⊺ ⊻ ⊼ ⋇ ⋉ ⋊ ⋋ ⋌ ⋎ ⋏ ⋒ ⋓ ⩞$ `⊞ ⊟ ⊠ ⊡ ⊺ ⊻ ⊼ ⋇ ⋉ ⋊ ⋋ ⋌ ⋎ ⋏ ⋒ ⋓ ⩞`

**Binomial Coefficients**

$\binom$ `\binom` $\dbinom$ `\dbinom` $\tbinom$ `\tbinom` $\choose$ `\choose`

$\atop$ `\atop` is also useful

**Fractions**

$\frac$ `\frac` $\dfrac$ `\dfrac` $\tfrac$ `\tfrac` $\cfrac$ `\cfrac` $\over$ `\over` $/$ `/`

**Math Operators**

|||||
|-----------|---------|-----------------|-----------|
| $\arcsin$ `\arcsin` | $\cotg$ `\cotg` | $\ln$ `\ln`           | $\det$ `\det`    |
| $\arccos$ `\arccos` | $\coth$ `\coth` | $\log$ `\log`          | $\gcd$ `\gcd`    |
| $\arctan$ `\arctan` | $\csc$ `\csc`  | $\sec$ `\sec`          | $\inf$ `\inf`    |
| $\arctg$ `\arctg`  | $\ctg$ `\ctg`  | $\sin$ `\sin`          | $\lim$ `\lim`    |
| $\arcctg$ `\arcctg` | $\cth$ `\cth`  | $\sinh$ `\sinh`         | $\liminf$ `\liminf` |
| $\arg$ `\arg`    | $\deg$ `\deg`  | $\sh$ `\sh`           | $\limsup$ `\limsup` |
| $\ch$ `\ch`     | $\dim$ `\dim`  | $\tan$ `\tan`          | $\max$ `\max`    |
| $\cos$ `\cos`    | $\exp$ `\exp`  | $\tanh$ `\tanh`         | $\min$ `\min`    |
| $\cosec$ `\cosec`  | $\hom$ `\hom`  | $\tg$ `\tg`           | $\Pr$ `\Pr`     |
| $\cosh$ `\cosh`   | $\ker$ `\ker`  | $\th$ `\th`           | $\sup$ `\sup`    |
| $\cot$ `\cot`    | $\lg$ `\lg`   | $\operatorname$ `\operatorname` |           |

Functions on the right side of this table can take $\limits$ `\limits`.

**sqrt**

$\sqrt$ `\sqrt`

## Relations

$\stackrel$ `\stackrel`

||||||
|----------------|------------------|---------------|------------------|---------------------|
| $=$ `=`            | $\curlyeqsucc$ `\curlyeqsucc`   | $\gtrapprox$ `\gtrapprox`  | $\perp$ `\perp`          | $\succapprox$ `\succapprox`       |
| $\<$ `\<`           | $\dashv$ `\dashv`         | $\gtreqless$ `\gtreqless`  | $\pitchfork$ `\pitchfork`     | $\succcurlyeq$ `\succcurlyeq`      |
| $>$ `>`            | $\dblcolon$ `\dblcolon`      | $\gtreqqless$ `\gtreqqless` | $\prec$ `\prec`          | $\succeq$ `\succeq`           |
| $:$ `:`            | $\doteq$ `\doteq`         | $\gtrless$ `\gtrless`    | $\precapprox$ `\precapprox`    | $\succsim$ `\succsim`          |
| $\approx$ `\approx`      | $\Doteq$ `\Doteq`         | $\gtrsim$ `\gtrsim`     | $\preccurlyeq$ `\preccurlyeq`   | $\Supset$ `\Supset`           |
| $\approxeq$ `\approxeq`    | $\doteqdot$ `\doteqdot`      | $\in$ `\in`         | $\preceq$ `\preceq`        | $\supset$ `\supset`           |
| $\asymp$ `\asymp`       | $\eqcirc$ `\eqcirc`        | $\Join$ `\Join`       | $\precsim$ `\precsim`       | $\supseteq$ `\supseteq`         |
| $\backepsilon$ `\backepsilon` | $\eqcolon$ `\eqcolon`       | $\le$ `\le`         | $\propto$ `\propto`        | $\supseteqq$ `\supseteqq`        |
| $\backsim$ `\backsim`     | $\Eqcolon$ `\Eqcolon`       | $\leq$ `\leq`        | $\risingdotseq$ `\risingdotseq`  | $\thickapprox$ `\thickapprox`      |
| $\backsimeq$ `\backsimeq`   | $\eqqcolon$ `\eqqcolon`      | $\leqq$ `\leqq`       | $\shortmid$ `\shortmid`      | $\thicksim$ `\thicksim`         |
| $\between$ `\between`     | $\Eqqcolon$ `\Eqqcolon`      | $\leqslant$ `\leqslant`   | $\shortparallel$ `\shortparallel` | $\trianglelefteq$ `\trianglelefteq`   |
| $\bowtie$ `\bowtie`      | $\eqsim$ `\eqsim`         | $\lessapprox$ `\lessapprox` | $\sim$ `\sim`           | $\triangleq$ `\triangleq`        |
| $\bumpeq$ `\bumpeq`      | $\eqslantgtr$ `\eqslantgtr`    | $\lesseqgtr$ `\lesseqgtr`  | $\simeq$ `\simeq`         | $\trianglerighteq$ `\trianglerighteq`  |
| $\Bumpeq$ `\Bumpeq`      | $\eqslantless$ `\eqslantless`   | $\lesseqqgtr$ `\lesseqqgtr` | $\smallfrown$ `\smallfrown`    | $\varpropto$ `\varpropto`        |
| $\circeq$ `\circeq`      | $\equiv$ `\equiv`         | $\lessgtr$ `\lessgtr`    | $\smallsmile$ `\smallsmile`    | $\vartriangle$ `\vartriangle`      |
| $\colonapprox$ `\colonapprox` | $\fallingdotseq$ `\fallingdotseq` | $\lesssim$ `\lesssim`    | $\smile$ `\smile`         | $\vartriangleleft$ `\vartriangleleft`  |
| $\Colonapprox$ `\Colonapprox` | $\frown$ `\frown`         | $\ll$ `\ll`         | $\sqsubset$ `\sqsubset`      | $\vartriangleright$ `\vartriangleright` |
| $\coloneq$ `\coloneq`     | $\ge$ `\ge`            | $\lll$ `\lll`        | $\sqsubseteq$ `\sqsubseteq`    | $\vcentcolon$ `\vcentcolon`       |
| $\Coloneq$ `\Coloneq`     | $\geq$ `\geq`           | $\llless$ `\llless`     | $\sqsupset$ `\sqsupset`      | $\vdash$ `\vdash`            |
| $\coloneqq$ `\coloneqq`    | $\geqq$ `\geqq`          | $\lt$ `\lt`         | $\sqsupseteq$ `\sqsupseteq`    | $\vDash$ `\vDash`            |
| $\Coloneqq$ `\Coloneqq`    | $\geqslant$ `\geqslant`      | $\mid$ `\mid`        | $\Subset$ `\Subset`        | $\Vdash$ `\Vdash`            |
| $\colonsim$ `\colonsim`    | $\gg$ `\gg`            | $\models$ `\models`     | $\subset$ `\subset`        | $\Vvdash$ `\Vvdash`           |
| $\Colonsim$ `\Colonsim`    | $\ggg$ `\ggg`           | $\multimap$ `\multimap`   | $\subseteq$ `\subseteq`      |                     |
| $\cong$ `\cong`        | $\gggtr$ `\gggtr`         | $\owns$ `\owns`       | $\subseteqq$ `\subseteqq`     |                     |
| $\curlyeqprec$ `\curlyeqprec` | $\gt$ `\gt`            | $\parallel$ `\parallel`   | $\succ$ `\succ`          |                     |

Direct Input: $= \< > : ∈ ∋ ∝ ∼ ∽ ≂ ≃ ≅ ≈ ≊ ≍ ≎ ≏ ≐ ≑ ≒ ≓ ≖ ≗ ≜ ≡ ≤ ≥ ≦ ≧$ `= \< > : ∈ ∋ ∝ ∼ ∽ ≂ ≃ ≅ ≈ ≊ ≍ ≎ ≏ ≐ ≑ ≒ ≓ ≖ ≗ ≜ ≡ ≤ ≥ ≦ ≧`<br>
$≫ ≬ ≳ ≷ ≺ ≻ ≼ ≽ ≾ ≿ ⊂ ⊃ ⊆ ⊇ ⊏ ⊐ ⊑ ⊒ ⊢ ⊣ ⊩ ⊪ ⊸ ⋈ ⋍ ⋐ ⋑ ⋔ ⋙ ⋛ ⋞ ⋟ ⌢ ⌣$ `≫ ≬ ≳ ≷ ≺ ≻ ≼ ≽ ≾ ≿ ⊂ ⊃ ⊆ ⊇ ⊏ ⊐ ⊑ ⊒ ⊢ ⊣ ⊩ ⊪ ⊸ ⋈ ⋍ ⋐ ⋑ ⋔ ⋙ ⋛ ⋞ ⋟ ⌢ ⌣`<br>
$⩾ ⪆ ⪌ ⪕ ⪖ ⪯ ⪰ ⪷ ⪸ ⫅ ⫆ ≲ ⩽ ⪅ ≶ ⋚ ⪋ ⟂ ⊨ ≔ ≕ ⩴$ `⩾ ⪆ ⪌ ⪕ ⪖ ⪯ ⪰ ⪷ ⪸ ⫅ ⫆ ≲ ⩽ ⪅ ≶ ⋚ ⪋ ⟂ ⊨ ≔ ≕ ⩴`

**Negated Relations**

$\not$ `\not`

|||||
|--------------|-------------------|---------------------|------------------|
| $\gnapprox$ `\gnapprox`  | $\ngeqslant$ `\ngeqslant`      | $\nsubseteq$ `\nsubseteq`        | $\precneqq$ `\precneqq`      |
| $\gneq$ `\gneq`      | $\ngtr$ `\ngtr`           | $\nsubseteqq$ `\nsubseteqq`       | $\precnsim$ `\precnsim`      |
| $\gneqq$ `\gneqq`     | $\nleq$ `\nleq`           | $\nsucc$ `\nsucc`            | $\subsetneq$ `\subsetneq`     |
| $\gnsim$ `\gnsim`     | $\nleqq$ `\nleqq`          | $\nsucceq$ `\nsucceq`          | $\subsetneqq$ `\subsetneqq`    |
| $\gvertneqq$ `\gvertneqq` | $\nleqslant$ `\nleqslant`      | $\nsupseteq$ `\nsupseteq`        | $\succnapprox$ `\succnapprox`   |
| $\lnapprox$ `\lnapprox`  | $\nless$ `\nless`          | $\nsupseteqq$ `\nsupseteqq`       | $\succneqq$ `\succneqq`      |
| $\lneq$ `\lneq`      | $\nmid$ `\nmid`           | $\ntriangleleft$ `\ntriangleleft`    | $\succnsim$ `\succnsim`      |
| $\lneqq$ `\lneqq`     | $\notin$ `\notin`          | $\ntrianglelefteq$ `\ntrianglelefteq`  | $\supsetneq$ `\supsetneq`     |
| $\lnsim$ `\lnsim`     | $\notni$ `\notni`          | $\ntriangleright$ `\ntriangleright`   | $\supsetneqq$ `\supsetneqq`    |
| $\lvertneqq$ `\lvertneqq` | $\nparallel$ `\nparallel`      | $\ntrianglerighteq$ `\ntrianglerighteq` | $\varsubsetneq$ `\varsubsetneq`  |
| $\ncong$ `\ncong`     | $\nprec$ `\nprec`          | $\nvdash$ `\nvdash`           | $\varsubsetneqq$ `\varsubsetneqq` |
| $\ne$ `\ne`        | $\npreceq$ `\npreceq`        | $\nvDash$ `\nvDash`           | $\varsupsetneq$ `\varsupsetneq`  |
| $\neq$ `\neq`       | $\nshortmid$ `\nshortmid`      | $\nVDash$ `\nVDash`           | $\varsupsetneqq$ `\varsupsetneqq` |
| $\ngeq$ `\ngeq`      | $\nshortparallel$ `\nshortparallel` | $\nVdash$ `\nVdash`           |                  |
| $\ngeqq$ `\ngeqq`     | $\nsim$ `\nsim`           | $\precnapprox$ `\precnapprox`      |                  |

Direct Input: $∉ ∌ ∤ ∦ ≁ ≆ ≠ ≨ ≩ ≮ ≯ ≰ ≱ ⊀ ⊁ ⊈ ⊉ ⊊ ⊋ ⊬ ⊭ ⊮ ⊯ ⋠ ⋡$ `∉ ∌ ∤ ∦ ≁ ≆ ≠ ≨ ≩ ≮ ≯ ≰ ≱ ⊀ ⊁ ⊈ ⊉ ⊊ ⊋ ⊬ ⊭ ⊮ ⊯ ⋠ ⋡`<br>
$⋦ ⋧ ⋨ ⋩ ⋬ ⋭ ⪇ ⪈ ⪉ ⪊ ⪵ ⪶ ⪹ ⪺ ⫋ ⫌$ `⋦ ⋧ ⋨ ⋩ ⋬ ⋭ ⪇ ⪈ ⪉ ⪊ ⪵ ⪶ ⪹ ⪺ ⫋ ⫌`

## Arrows

|||||
|---------------------|------------------------|----------------------|----------------------|
| $\circlearrowleft$ `\circlearrowleft`  | $\Leftarrow $ `\Leftarrow `          | $\looparrowright$ `\looparrowright`    | $\rightrightarrows$ `\rightrightarrows`  |
| $\circlearrowright$ `\circlearrowright` | $\leftarrowtail$ `\leftarrowtail`       | $\Lsh$ `\Lsh`               | $\rightsquigarrow$ `\rightsquigarrow`   |
| $\curvearrowleft$ `\curvearrowleft`   | $\leftharpoondown$ `\leftharpoondown`     | $\mapsto$ `\mapsto`            | $\Rrightarrow$ `\Rrightarrow`       |
| $\curvearrowright$ `\curvearrowright`  | $\leftharpoonup$ `\leftharpoonup`       | $\nearrow$ `\nearrow`           | $\Rsh$ `\Rsh`               |
| $\dashleftarrow$ `\dashleftarrow`    | $\leftleftarrows$ `\leftleftarrows`      | $\nleftarrow$ `\nleftarrow`        | $\searrow$ `\searrow`           |
| $\dashrightarrow$ `\dashrightarrow`   | $\leftrightarrow$ `\leftrightarrow`      | $\nLeftarrow$ `\nLeftarrow`        | $\swarrow$ `\swarrow`           |
| $\downarrow$ `\downarrow`        | $\Leftrightarrow$ `\Leftrightarrow`      | $\nleftrightarrow$ `\nleftrightarrow`   | $\to$ `\to`                |
| $\Downarrow$ `\Downarrow`        | $\leftrightarrows$ `\leftrightarrows`     | $\nLeftrightarrow$ `\nLeftrightarrow`   | $\twoheadleftarrow$ `\twoheadleftarrow`  |
| $\downdownarrows$ `\downdownarrows`   | $\leftrightharpoons$ `\leftrightharpoons`   | $\nrightarrow$ `\nrightarrow`       | $\twoheadrightarrow$ `\twoheadrightarrow` |
| $\downharpoonleft$ `\downharpoonleft`  | $\leftrightsquigarrow$ `\leftrightsquigarrow` | $\nRightarrow$ `\nRightarrow`       | $\uparrow$ `\uparrow`           |
| $\downharpoonright$ `\downharpoonright` | $\Lleftarrow$ `\Lleftarrow`          | $\nwarrow$ `\nwarrow`           | $\Uparrow$ `\Uparrow`           |
| $\gets$ `\gets`             | $\longleftarrow$ `\longleftarrow`       | $\restriction$ `\restriction`       | $\updownarrow$ `\updownarrow`       |
| $\hookleftarrow$ `\hookleftarrow`    | $\Longleftarrow$ `\Longleftarrow`       | $\rightarrow$ `\rightarrow`        | $\Updownarrow$ `\Updownarrow`       |
| $\hookrightarrow$ `\hookrightarrow`   | $\longleftrightarrow$ `\longleftrightarrow`  | $\Rightarrow$ `\Rightarrow`        | $\upharpoonleft$ `\upharpoonleft`     |
| $\iff$ `\iff`              | $\Longleftrightarrow$ `\Longleftrightarrow`  | $\rightarrowtail$ `\rightarrowtail`    | $\upharpoonright$ `\upharpoonright`    |
| $\impliedby$ `\impliedby`        | $\longmapsto$ `\longmapsto`          | $\rightharpoondown$ `\rightharpoondown`  | $\upuparrows$ `\upuparrows`        |
| $\implies$ `\implies`          | $\longrightarrow$ `\longrightarrow`      | $\rightharpoonu$ `\rightharpoonu`p    |                       |
| $\leadsto$ `\leadsto`          | $\Longrightarrow$ `\Longrightarrow`      | $\rightleftarrows$ `\rightleftarrows`   |                       |
| $\leftarrow$ `\leftarrow`        | $\looparrowleft$ `\looparrowleft`       | $\rightleftharpoons$ `\rightleftharpoons` |                       |

Direct Input∷ $← ↑ → ↓ ↔ ↕ ↖ ↗ ↘ ↙ ↚ ↛ ↞ ↠ ↢ ↣ ↦ ↩ ↪ ↫ ↬ ↭ ↮ ↰ ↱ ↶ ↷ ↺ ↻ ↼ ↽$ `← ↑ → ↓ ↔ ↕ ↖ ↗ ↘ ↙ ↚ ↛ ↞ ↠ ↢ ↣ ↦ ↩ ↪ ↫ ↬ ↭ ↮ ↰ ↱ ↶ ↷ ↺ ↻ ↼ ↽`<br>
$↾ ↾ ↿ ⇀ ⇁ ⇂ ⇃ ⇄ ⇆ ⇇ ⇈ ⇉ ⇊ ⇋ ⇌ ⇍ ⇎ ⇏ ⇐ ⇑ ⇒ ⇓ ⇔ ⇕ ⇚ ⇛ ⇝ ⇠ ⇢ ⟵ ⟶ ⟷ ⟸ ⟹ ⟺ ⟼$ `↾ ↾ ↿ ⇀ ⇁ ⇂ ⇃ ⇄ ⇆ ⇇ ⇈ ⇉ ⇊ ⇋ ⇌ ⇍ ⇎ ⇏ ⇐ ⇑ ⇒ ⇓ ⇔ ⇕ ⇚ ⇛ ⇝ ⇠ ⇢ ⟵ ⟶ ⟷ ⟸ ⟹ ⟺ ⟼`

**Extensible Arrows**

||||
|-----------------------|--------------------|-----------------------|
| $\xrightarrow$ `\xrightarrow`        | $\xRightarrow$ `\xRightarrow`     | $\xrightharpoonup$ `\xrightharpoonup`    |
| $\xrightarrow$ `\xrightarrow`        | $\xmapsto$ `\xmapsto`         | $\xrightharpoondown$ `\xrightharpoondown`  |
| $\xleftarrow$ `\xleftarrow`         | $\xLeftarrow$ `\xLeftarrow`      | $\xleftharpoonup$ `\xleftharpoonup`     |
| $\xleftrightarrow$ `\xleftrightarrow`    | $\xLeftrightarrow$ `\xLeftrightarrow` | $\xleftharpoondown$ `\xleftharpoondown`   |
| $\xhookleftarrow$ `\xhookleftarrow`     | $\xhookrightarrow$ `\xhookrightarrow` | $\xrightleftharpoons$ `\xrightleftharpoons` |
| $\xtwoheadrightarrow$ `\xtwoheadrightarrow` | $\xlongequal$ `\xlongequal`      | $\xleftrightharpoons$ `\xleftrightharpoons` |
| $\xtwoheadleftarrow$ `\xtwoheadleftarrow`  | $\xtofrom$ `\xtofrom`         |                       |

Extensible arrows all can take an optional argument.

## Style

**Class Assignment**

$\mathbin$ `\mathbin` $\mathclose$ `\mathclose` $\mathinner$ `\mathinner` $\mathop$ `\mathop`
$\mathopen$ `\mathopen` $\mathord$ `\mathord` $\mathpunct$ `\mathpunct` $\mathrel$ `\mathrel`

**Color**

$\color$ `\color` $\textcolor$ `\textcolor` $\colorbox$ `\colorbox`

For color definition, KaTeX color functions will accept the standard HTML [predefined color names](https://www.w3schools.com/colors/colors-names.asp). They will also accept an RGB argument in CSS hexa­decimal style.

**Font**

||||||
|---------------|---------------|-----------|------------|-------------|
| $\mathrm$ `\mathrm`     | $\mathbf$ `\mathbf`     | $\mathit$ `\mathit` | $\mathsf$ `\mathsf`  | $\mathtt$ `\mathtt`   |
| $\textrm$ `\textrm`     | $\textbf$ `\textbf`     | $\textit$ `\textit` | $\textsf$ `\textsf`  | $\texttt$ `\texttt`   |
| $\rm$ `\rm`         | $\bf$ `\bf`         | $\it$ `\it`     | $\sf$ `\sf`      | $\tt$ `\tt`       |
| $\textnormal$ `\textnormal` | $\bold$ `\bold`       | $\Bbb$ `\Bbb`    | $\mathcal$ `\mathcal` | $\frak$ `\frak`     |
| $\text$ `\text`       | $\boldsymbol$ `\boldsymbol` | $\mathbb$ `\mathbb` | $\mathscr$ `\mathscr` | $\mathfrak$ `\mathfrak` |
|               | $\bm$ `\bm`         |           |            |             |

One can stack font family, font weight, and font shape by using the $\textXX$ `\textXX` versions of the font functions. 

**Size**

$\Huge$ `\Huge` $\huge$ `\huge` $\LARGE$ `\LARGE` $\Large$ `\Large` $\large$ `\large` $\normalsize$ `\normalsize` $\small$ `\small` $\footnotesize$ `\footnotesize` $\scriptsize$ `\scriptsize` $\tiny$ `\tiny`

**Style**

$\displaystyle$ `\displaystyle` $\textstyle$ `\textstyle` $\scriptstyle$ `\scriptstyle` $\scriptscriptstyle$ `\scriptscriptstyle` $\limits$ `\limits` $\nolimits$ `\nolimits` $\verb$ `\verb` $\text$ `\text`

$\text{…}$ `\text{…}` will accept nested $\$…\$$ `\$…\$` fragments and render them in math mode.

## Symbols and Punctuation

|||||
|----------------------|-----------------------|-------------------|------------------|
| $%$ `%` comment          | $\Box$ `\Box`                | $\dots$ `\dots`           | $\checkmark$ `\checkmark`     |
| $%$ `%`                  | $\square$ `\square`             | $\cdots$ `\cdots`          | $\dag$ `\dag`           |
| $#$ `#`                  | $\blacksquare$ `\blacksquare`        | $\ddots$ `\ddots`          | $\dagger$ `\dagger`        |
| $\&$ `\&`                 | $\triangle$ `\triangle`           | $\ldots$ `\ldots`          | $\textdagger$ `\textdagger`    |
| $\_$ `\_`                 | $\triangledown$ `\triangledown`       | $\vdots$ `\vdots`          | $\ddag$ `\ddag`          |
| $\textunderscore$ `\textunderscore`    | $\triangleleft$ `\triangleleft`       | $\mathellipsis$ `\mathellipsis`   | $\ddagger$ `\ddagger`       |
| $--$ `--`                 | $\triangleright$ `\triangleright`      | $\textellipsis$ `\textellipsis`   | $\textdaggerdbl$ `\textdaggerdbl` |
| $\textendash$ `\textendash`        | $\bigtriangledown$ `\bigtriangledown`    | $\flat$ `\flat`           | $\\$$ `\\$`            |
| $---$ `---`                | $\bigtriangleup$ `\bigtriangleup`      | $\natural$ `\natural`        | $\textdollar$ `\textdollar`    |
| $\textemdash$ `\textemdash`        | $\blacktriangle$ `\blacktriangle`      | $\sharp$ `\sharp`          | $\pounds$ `\pounds`        |
| $a$ `a`                 | $\blacktriangledown$ `\blacktriangledown`  | $\circledR$ `\circledR`       | $\textsterling$ `\textsterling`  |
| $\textquoteleft$ `\textquoteleft`     | $\blacktriangleleft$ `\blacktriangleleft`  | $\circledS$ `\circledS`       | $\yen$ `\yen`           |
| $\text{\lq}$ `\text{\lq}`         | $\blacktriangleright$ `\blacktriangleright` | $\clubsuit$ `\clubsuit`       | $\surd$ `\surd`          |
| $\textquoteright$ `\textquoteright`    | $\diamond$ `\diamond`            | $\diamondsuit$ `\diamondsuit`    | $\degree$ `\degree`        |
| $\text{\rq}$ `\text{\rq}`         | $\Diamond$ `\Diamond`            | $\heartsuit$ `\heartsuit`      | $\diagdown$ `\diagdown`      |
| $\textquotedblleft$ `\textquotedblleft`  | $\lozenge$ `\lozenge`            | $\spadesuit$ `\spadesuit`      | $\diagup$ `\diagup`        |
| $"$ `"`                  | $\blacklozenge$ `\blacklozenge`       | $\angle$ `\angle`          | $\mho$ `\mho`           |
| $\textquotedblright$ `\textquotedblright` | $\star$ `\star`               | $\measuredangle$ `\measuredangle`  | $\maltese$ `\maltese`       |
| $\colon$ `\colon`             | $\bigstar$ `\bigstar`            | $\sphericalangle$ `\sphericalangle` | $\text{\P}$ `\text{\P}`      |
| $\backprime$ `\backprime`         | $\textbar$ `\textbar`            | $\top$ `\top`            | $\text{\S}$ `\text{\S}`      |
| $\prime$ `\prime`             | $\textbardbl$ `\textbardbl`         | $\bot$ `\bot`            | $\nabla$ `\nabla`         |
| $\textless$ `\textless`          | $\textbraceleft$ `\textbraceleft`      | $\textbraceright$ `\textbraceright` | $\infty$ `\infty`         |
| $\textgreater$ `\textgreater`       | $\KaTeX$ `\KaTeX`              | $\LaTeX$ `\LaTeX`          | $\TeX$ `\TeX`           |

Direct Input: $£ ¥ ∇ ∞ · ∠ ∡ ∢ ♠ ♡ ♢ ♣ ♭ ♮ ♯ ✓ …  ⋮  ⋯  ⋱  ! ‼$ `£ ¥ ∇ ∞ · ∠ ∡ ∢ ♠ ♡ ♢ ♣ ♭ ♮ ♯ ✓ …  ⋮  ⋯  ⋱  ! ‼`

## Units

In KaTeX, units are proportioned as they are in TeX.<br>
KaTeX units are different than CSS units.

|  KaTeX Unit    | Value                   | KaTeX Unit     | Value              |
|:--------------:|:------------------------|:--------------:|:--------------------|
| em             | CSS em                  | bp             | 1/72​ inch × F × G   |
| ex             | CSS ex                  | pc             | 12 KaTeX pt         |
| mu             | 1/18 CSS em             | dd             | 1238/1157​ KaTeX pt  |
| pt             | 1/72.27 inch × F × G    | cc             | 14856/1157 KaTeX pt |
| mm             | 1 mm × F × G            | nd             | 685/642 KaTeX pt    |
| cm             | 1 cm × F × G            | nc             | 1370/107​ KaTeX pt   |
| in             | 1 inch × F × G          | sp             | 1/65536 KaTeX pt    |

where:

F = (font size of surrounding HTML text)/(10 pt)

G = 1.21 by default, because KaTeX font-size is normally 1.21 × the surrounding font size. This value [can be over-ridden](https://github.com/Khan/KaTeX/wiki/Font-Options#user-content-font-size) by the CSS of an HTML page.
