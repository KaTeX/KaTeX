---
id: supported
title: Supported Functions
---
<style>
p {overflow-wrap: break-word;}
table tr, 
table td {
    vertical-align: middle;
    overflow-wrap: break-word;
}
</style>
This is a list of TeX functions supported by KaTeX. It is sorted into logical groups.

There is a similar [Support Table](./support_table.md), sorted alphabetically, that lists both supported and un-supported functions.

<div class="katex-hopscotch">

## Accents

||||
|:----------------------------|:----------------------------------------------------|:-----
|$a'$ `a'`  |$\tilde{a}$ `\tilde{a}`|$\mathring{g}$ `\mathring{g}`
|$a''$ `a''`|$\widetilde{ac}$ `\widetilde{ac}`  |$\overgroup{AB}$ `\overgroup{AB}`
|$a^{\prime}$ `a^{\prime}` |$\utilde{AB}$ `\utilde{AB}`  |$\undergroup{AB}$ `\undergroup{AB}`
|$\acute{a}$ `\acute{a}`|$\vec{F}$ `\vec{F}` |$\Overrightarrow{AB}$ `\Overrightarrow{AB}`
|$\bar{y}$ `\bar{y}` |$\overleftarrow{AB}$ `\overleftarrow{AB}`|$\overrightarrow{AB}$ `\overrightarrow{AB}`
|$\breve{a}$ `\breve{a}`|$\underleftarrow{AB}$ `\underleftarrow{AB}` |$\underrightarrow{AB}$ `\underrightarrow{AB}`
|$\check{a}$ `\check{a}`|$\overleftharpoon{ac}$ `\overleftharpoon{ac}`  |$\overrightharpoon{ac}$ `\overrightharpoon{ac}`
|$\dot{a}$ `\dot{a}` |$\overleftrightarrow{AB}$ `\overleftrightarrow{AB}`  |$\overbrace{AB}$ `\overbrace{AB}`
|$\ddot{a}$ `\ddot{a}`  |$\underleftrightarrow{AB}$ `\underleftrightarrow{AB}`|$\underbrace{AB}$ `\underbrace{AB}`
|$\grave{a}$ `\grave{a}`|$\overline{AB}$ `\overline{AB}` |$\overlinesegment{AB}$ `\overlinesegment{AB}`
|$\hat{\theta}$ `\hat{\theta}`|$\underline{AB}$ `\underline{AB}`  |$\underlinesegment{AB}$ `\underlinesegment{AB}`
|$\widehat{ac}$ `\widehat{ac}`|$\widecheck{ac}$ `\widecheck{ac}`  |  

***Accent functions inside \\text{…}***

|||||
|:---------------------|:---------------------|:---------------------|:-----
|$\text{\'{a}}$ `\'{a}`|$\text{\~{a}}$ `\~{a}`|$\text{\.{a}}$ `\.{a}`|$\text{\H{a}}$ `\H{a}`
|$\text{\`{a}}$ <code>\\`{a}</code>|$\text{\={a}}$ `\={a}`|$\text{\"{a}}$ `\"{a}`|$\text{\v{a}}$ `\v{a}`
|$\text{\^{a}}$ `\^{a}`|$\text{\u{a}}$ `\u{a}`|$\text{\r{a}}$ `\r{a}`|

See also [letters](#letters)

## Delimiters

||||||
|:-----------------------------------|:---------------------------------------|:----------|:-------------------------------------------------------|:-----
|$( )$ `( )` |$\lt~\gt$ `\lt \gt` |$⌈~⌉$ `⌈ ⌉`|$\lceil~\rceil$ `\lceil`<br>$~~~~~$`\rceil`  |$\uparrow$ `\uparrow`
|$[ ]$ `[ ]` |$\lbrack~\rbrack$ `\lbrack`<br>$~~~~$`\rbrack`|$⌊~⌋$ `⌊ ⌋`|$\lfloor~\rfloor$ `\lfloor`<br>$~~~~~$`\rfloor` |$\downarrow$ `\downarrow`
|$\{ \}$ `\{ \}`|$\lbrace \rbrace$ `\lbrace`<br>$~~~~$`\rbrace`|$⎰⎱$ `⎰⎱`  |$\lmoustache \rmoustache$ `\lmoustache`<br>$~~~~$`\rmoustache`|$\updownarrow$ `\updownarrow`
|$⟨~⟩$ `⟨ ⟩` |$\langle~\rangle$ `\langle`<br>$~~~~$`\rangle`|$⟮~⟯$ `⟮ ⟯`|$\lgroup~\rgroup$ `\lgroup`<br>$~~~~~$`\rgroup` |$\Uparrow$ `\Uparrow`
|$\vert$ <code>&#124;</code> |$\vert$ `\vert` |$┌ ┐$ `┌ ┐`|$\ulcorner \urcorner$ `\ulcorner`<br>$~~~~$`\urcorner`  |$\Downarrow$ `\Downarrow`
|$\Vert$ <code>&#92;&#124;</code> |$\Vert$ `\Vert` |$└ ┘$ `└ ┘`|$\llcorner \lrcorner$ `\llcorner`<br>$~~~~$`\lrcorner`  |$\Updownarrow$ `\Updownarrow`
|$\lvert~\rvert$ `\lvert`<br>$~~~~$`\rvert`|$\lVert~\rVert$ `\lVert`<br>$~~~~~$`\rVert` |`\left.`|  `\right.` |$\backslash$ `\backslash`

**Delimiter Sizing**

$\left(\LARGE{AB}\right)$ `\left(\LARGE{AB}\right)`

$( \big( \Big( \bigg( \Bigg($ `( \big( \Big( \bigg( \Bigg(`

||||||
|:--------|:------|:--------|:-------|:------|
|`\left`  |`\big` |`\bigl`  |`\bigm` |`\bigr`
|`\middle`|`\Big` |`\Bigl`  |`\Bigm` | `\Bigr`
|`\right` |`\bigg`|`\biggl` |`\biggm`|`\biggr`
|         |`\Bigg`|`\Biggl` |`\Biggm`|`\Biggr`

</div>

## Environments

<div class="katex-cards" id="environments">

|||||
|:---------------------|:---------------------|:---------------------|:--------
|$\begin{matrix} a & b \\ c & d \end{matrix}$ | `\begin{matrix}`<br>&nbsp;&nbsp;&nbsp;`a & b \\`<br>&nbsp;&nbsp;&nbsp;`c & d`<br>`\end{matrix}` |$\begin{array}{cc}a & b\\c & d\end{array}$ | `\begin{array}{cc}`<br>&nbsp;&nbsp;&nbsp;`a & b \\`<br>&nbsp;&nbsp;&nbsp;`c & d`<br>`\end{array}`
|$\begin{pmatrix} a & b \\ c & d \end{pmatrix}$ |`\begin{pmatrix}`<br>&nbsp;&nbsp;&nbsp;`a & b \\`<br>&nbsp;&nbsp;&nbsp;`c & d`<br>`\end{pmatrix}` |$\begin{bmatrix} a & b \\ c & d \end{bmatrix}$ | `\begin{bmatrix}`<br>&nbsp;&nbsp;&nbsp;`a & b \\`<br>&nbsp;&nbsp;&nbsp;`c & d`<br>`\end{bmatrix}`
|$\begin{vmatrix} a & b \\ c & d \end{vmatrix}$ |`\begin{vmatrix}`<br>&nbsp;&nbsp;&nbsp;`a & b \\`<br>&nbsp;&nbsp;&nbsp;`c & d`<br>`\end{vmatrix}` |$\begin{Vmatrix} a & b \\ c & d \end{Vmatrix}$ |`\begin{Vmatrix}`<br>&nbsp;&nbsp;&nbsp;`a & b \\`<br>&nbsp;&nbsp;&nbsp;`c & d`<br>`\end{Vmatrix}`
|$\begin{Bmatrix} a & b \\ c & d \end{Bmatrix}$ |`\begin{Bmatrix}`<br>&nbsp;&nbsp;&nbsp;`a & b \\`<br>&nbsp;&nbsp;&nbsp;`c & d`<br>`\end{Bmatrix}`|$\def\arraystretch{1.5}\begin{array}{c:c:c} a & b & c \\ \hline d & e & f \\ \hdashline g & h & i \end{array}$|`\def\arraystretch{1.5}`<br>&nbsp;&nbsp;&nbsp;`\begin{array}{c:c:c}`<br>&nbsp;&nbsp;&nbsp;`a & b & c \\ \hline`<br>&nbsp;&nbsp;&nbsp;`d & e & f \\`<br>&nbsp;&nbsp;&nbsp;`\hdashline`<br>&nbsp;&nbsp;&nbsp;`g & h & i`<br>`\end{array}`
|$\begin{aligned} a&=b+c \\ d+e&=f \end{aligned}$ |`\begin{aligned}`<br>&nbsp;&nbsp;&nbsp;`a&=b+c \\`<br>&nbsp;&nbsp;&nbsp;`d+e&=f`<br>`\end{aligned}`|$\begin{alignedat}{2}10&x+&3&y=2\\3&x+&13&y=4\end{alignedat}$ |`\begin{alignedat}{2}`<br>&nbsp;&nbsp;&nbsp;`10&x+ &3&y = 2 \\`<br>&nbsp;&nbsp;&nbsp;` 3&x+&13&y = 4`<br>`\end{alignedat}`
|$\begin{gathered} a=b \\ e=b+c \end{gathered}$ |`\begin{gathered}`<br>&nbsp;&nbsp;&nbsp;`a=b \\ `<br>&nbsp;&nbsp;&nbsp;`e=b+c`<br>`\end{gathered}`|$x = \begin{cases} a &\text{if } b \\ c &\text{if } d \end{cases}$ |`x = \begin{cases}`<br>&nbsp;&nbsp;&nbsp;`a &\text{if } b  \\`<br>&nbsp;&nbsp;&nbsp;`c &\text{if } d`<br>`\end{cases}`

</div>

KaTeX also supports `darray`  and `dcases`.

Acceptable line separators include: `\\`, `\cr`, `\\[distance]`, and `\cr[distance]`. *Distance* can be written with any of the [KaTeX units](#units).

The `{array}` environment supports `|` and `:` vertical separators.

The `{array}` environment does not yet support `\cline` or `\multicolumn`.

<div class="katex-hopscotch">

## HTML

|||
|:----------------|:-------------------|
| $\href{https://khan.github.io/KaTeX/}{\KaTeX}$ | `\href{https://khan.github.io/KaTeX/}{\KaTeX}` |
| $\url{https://khan.github.io/KaTeX/}$ | `\url{https://khan.github.io/KaTeX/}` |

## Letters and Unicode

**Greek Letters**

Direct Input: $Α Β Γ Δ Ε Ζ Η Θ$ $Ι Κ Λ Μ Ν Ξ Ο Π Ρ Σ Τ Υ Φ Χ Ψ Ω$  
$α β γ δ ϵ ζ η θ ι κ λ μ ν ξ o$ $π ρ σ τ υ ϕ χ ψ ω ε ϑ ϖ ϱ ς φ$

|||||
|---------------|-------------|-------------|---------------|
| $\Gamma$ `\Gamma`| $\Delta$ `\Delta` | $\Theta$ `\Theta` | $\Lambda$ `\Lambda`  |
| $\Xi$ `\Xi`| $\Pi$ `\Pi` | $\Sigma$ `\Sigma` | $\Upsilon$ `\Upsilon` |
| $\Phi$ `\Phi`  | $\Psi$ `\Psi`| $\Omega$ `\Omega` ||
| $\varGamma$ `\varGamma`| $\varDelta$ `\varDelta` | $\varTheta$ `\varTheta` | $\varLambda$ `\varLambda`  |
| $\varXi$ `\varXi`| $\varPi$ `\varPi` | $\varSigma$ `\varSigma` | $\varUpsilon$ `\varUpsilon` |
| $\varPhi$ `\varPhi`  | $\varPsi$ `\varPsi`| $\varOmega$ `\varOmega` ||
| $\alpha$ `\alpha`| $\beta$ `\beta`  | $\gamma$ `\gamma` | $\delta$ `\delta`|
| $\epsilon$ `\epsilon` | $\zeta$ `\zeta`  | $\eta$ `\eta`| $\theta$ `\theta`|
| $\iota$ `\iota` | $\kappa$ `\kappa` | $\lambda$ `\lambda`| $\mu$ `\mu`|
| $\nu$ `\nu`| $\xi$ `\xi` | $\omicron$ `\omicron`  | $\pi$ `\pi`|
| $\rho$ `\rho`  | $\sigma$ `\sigma` | $\tau$ `\tau`| $\upsilon$ `\upsilon` |
| $\phi$ `\phi`  | $\chi$ `\chi`| $\psi$ `\psi`| $\omega$ `\omega`|
| $\varepsilon$ `\varepsilon` | $\varkappa$ `\varkappa` | $\vartheta$ `\vartheta` | $\varpi$ `\varpi`|
| $\varrho$ `\varrho`  | $\varsigma$ `\varsigma` | $\varphi$ `\varphi`| $\digamma $ `\digamma `|

**Other Letters**

||||||
|------------|-----------|----------|---------|----------|
| $\imath$ `imath` | $\eth$ `\eth` | $\Im$ `\Im`| $\text{\aa}$ `\text{\aa}`| $\text{\o}$ `\text{\o}`  |
| $\jmath$ `\jmath`| $\Finv$ `\Finv`| $\Re$ `\Re`| $\text{\AA}$ `\text{\AA}`| $\text{\O}$ `\text{\O}`  |
| $\aleph$ `\aleph`| $\Game$ `\Game`| $\wp$ `\wp`| $\text{\ae}$ `\text{\ae}`| $\text{\ss}$ `\text{\ss}` |
| $\beth$ `\beth` | $\ell$ `\ell` | $\partial$ `\partial` | $\text{\AE}$ `\text{\AE}`| $\text{\i}$ `\text{\i}`  |
| $\gimel$ `\gimel`| $\hbar$ `\hbar`| $\nabla$ `\nabla`| $\text{\oe}$ `\text{\oe}`| $\text{\j}$ `\text{\j}`  |
| $\daleth$ `\daleth`  | $\hslash$ `\hslash` | $\Bbbk$ `\Bbbk` | $\text{\OE}$ `\text{\OE}`|

Direct Input: $∂ ∇ ℑ Ⅎ ℵ ℶ ℷ ℸ ⅁ ℏ ð$ 
ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖÙÚÛÜÝÞßàáâãäåçèéêëìíîïðñòóôöùúûüýþÿ

</div>
<div class="katex-cards" id="math-alpha">

**Unicode Mathematical Alphanumeric Symbols**

| Item        |  Range              |  Item             |  Range  |
|-------------|---------------------|-------------------|---------------|
| Bold        | $\text{𝐀-𝐙 𝐚-𝐳 𝟎-𝟗}$  | Double-struck     | $\text{𝔸-}ℤ\ 𝕜$
| Italic      | $\text{𝐴-𝑍 𝑎-𝑧}$      | Sans serif        | $\text{𝖠-𝖹 𝖺-𝗓 𝟢-𝟫}$
| Bold Italic | $\text{𝑨-𝒁 𝒂-𝒛}$      | Sans serif bold   | $\text{𝗔-𝗭 𝗮-𝘇 𝟬-𝟵}$
| Script      | $\text{𝒜-𝒵}$         | Sans serif italic | $\text{𝘈-𝘡 𝘢-𝘻}$
|  Fractur    | $\text{𝔄-}ℨ\text{ 𝔞-𝔷}$| Monospace        | $\text{𝙰-𝚉 𝚊-𝚣 𝟶-𝟿}$

</div>
<div class="katex-hopscotch">

**Unicode**

The letters listed above will render in any KaTeX rendering mode.

If the KaTeX rendering mode is set to `strict: false` or `strict:"warn"` (default), then KaTeX will accept all Unicode letters. The letters not listed above will be rendered from system fonts, not KaTeX-supplied fonts, so their typography may clash. They may also cause small vertical alignment issues. KaTeX has detailed metrics for glyphs in Latin, Greek, and Cyrillic, but other glyphs are treated as if they are each as tall as the letter M.

For Persian composite characters, a user-supplied [plug-in](https://github.com/HosseinAgha/persian-katex-plugin) is under development.

## Layout

### Annotation

|||
|:------------------------------|:-----
|$\cancel{5}$ `\cancel{5}`|$\overbrace{a+b+c}^{\text{note}}$ `\overbrace{a+b+c}^{\text{note}}`
|$\bcancel{5}$ `\bcancel{5}` |$\underbrace{a+b+c}_{\text{note}}$ `\underbrace{a+b+c}_{\text{note}}`
|$\xcancel{ABC}$ `\xcancel{ABC}`|$\not =$ `\not =`
|$\sout{abc}$ `\sout{abc}`|$\boxed{\pi=\frac c d}$ `\boxed{\pi=\frac c d}`


`\tag{hi} x+y^{2x}`
$$\tag{hi} x+y^{2x}$$

`\tag*{hi} x+y^{2x}`
$$\tag*{hi} x+y^{2x}$$

### Line Breaks and Vertical Layout

KaTeX 0.10.0+ will insert automatic line breaks in inline math after relations or binary operators such as “=” or “+”. These can be suppressed by placing math inside a pair of braces, as in `{F=ma}`.

Hard line breaks are `\\` and `\newline`.

In display math, KaTeX does not insert automatic line breaks. It ignores display math hard line breaks when rendering option `strict: true`.

**Vertical Layout**

||||
|:--------------|:----------------------------------------|:-----
|$x_n$ `x_n` |$\stackrel{!}{=}$ `\stackrel{!}{=}`  |$a \atop b$ `a \atop b`
|$e^x$ `e^x` |$\overset{!}{=}$ `\overset{!}{=}` |$a\raisebox{0.25em}{b}c$ `a\raisebox{0.25em}{b}c`
|$_u^o $ `_u^o `|$\underset{!}{=}$ `\underset{!}{=}`| $~$

The second argument of `\raisebox` can contain math if it is nested within `$…$` delimiters, as in `\raisebox{0.25em}{$\frac a b$}`

### Overlap and Spacing

|||
|:-------|:-------|
|${=}\mathllap{/\,}$ `{=}\mathllap{/\,}` | $\left(x^{\smash{2}}\right)$ `\left(x^{\smash{2}}\right)`
|$\mathrlap{\,/}{=}$ `\mathrlap{\,/}{=}` | $\sqrt{\smash[b]{y}}$ `\sqrt{\smash[b]{y}} `

$\displaystyle\sum_{\mathclap{1\le i\le j\le n}} x_{ij}$ `\sum_{\mathclap{1\le i\le j\le n}} x_{ij}`

KaTeX also supports `\llap`, `\rlap`, and `\clap`, but they will take only text, not math, as arguments.

</div>
<div class="katex-cards" id="spacing-tbl">

**Spacing**

| Function        | Produces           | Function             | Produces|
|:----------------|:-------------------|:---------------------|:--------------------------------------|
| `\,`            | ³∕₁₈ em space      | `\kern{distance}`    | space, width = *distance*
| `\thinspace`    | ³∕₁₈ em space      | `\mkern{distance}`   | space, width = *distance*
| `\:`            | ⁴∕₁₈ em space      | `\mskip{distance}`   | space, width = *distance*
| `\medspace`     | ⁴∕₁₈ em space      | `\hskip{distance}`   | space, width = *distance*
| `\;`            | ⁵∕₁₈ em space      | `\hspace{distance}`  | space, width = *distance*
| `\thickspace`   | ⁵∕₁₈ em space      | `\hspace*{distance}` | space, width = *distance*
| `\enspace`      | ½ em space         | `\phantom{content}`  | space the width and height of content
| `\quad`         | 1 em space         | `\hphantom{content}` | space the width of content
| `\qquad`        | 2 em space         | `\vphantom{content}` | a strut the height of content
| `~`             | non-breaking space | `\!`                 | – ³∕₁₈ em space
| `\<space>`      | space              | `\negthinspace`      | – ³∕₁₈ em space
| `\nobreakspace` | non-breaking space | `\negmedspace`       | – ⁴∕₁₈ em space
| `\space`        | space              | `\negthickspace`     | – ⁵∕₁₈ em space

</div>

**Notes:**

`distance` will accept any of the [KaTeX units](#units).

`\kern`, `\mkern`, `\mskip`, and `\hspace` accept unbraced distances, as in: `\kern1em`.

`\mkern` and `\mskip` will not work in text mode and both will write a console warning for any unit except `mu`.

<div class="katex-hopscotch">

## Logic and Set Theory

|||||
|:--------------------|:--------------------------|:----------------------------------|:-----
|$\forall$ `\forall`  |$\complement$ `\complement`|$\therefore$ `\therefore` |$\neg$ `\neg` or `\lnot`
|$\exists$ `\exists`  |$\subset$ `\subset`  |$\because$ `\because`  |$\emptyset$ `\emptyset`
|$\nexists$ `\nexists`|$\supset$ `\supset`  |$\mapsto$ `\mapsto` |$\varnothing$ `\varnothing`
|$\in$ `\in` |$\mid$ `\mid`  |$\to$ `\to`|$\implies$ `\implies`
|$\notin$ `\notin` |$\land$ `\land`|$\gets$ `\gets`  |$\impliedby$ `\impliedby`
|$\ni$ `\ni` |$\lor$ `\lor`  |$\leftrightarrow$ `\leftrightarrow`|$\iff$ `\iff`
|$\notni$ `\notni` |

Direct Input: $∀ ∴ ∁ ∵ ∃ ∣ ∈ ∉ ∋ ⊂ ⊃ ∧ ∨ ↦ → ← ↔ ¬$ ℂ ℍ ℕ ℙ ℚ ℝ

## Macros

|||
|:-------------------------------------|:------
|$\def\foo{x^2} \foo + \foo$           | `\def\foo{x^2} \foo + \foo`
|$\gdef\bar#1{#1^2} \bar{y} + \bar{y}$ | `\gdef\bar#1{#1^2} \bar{y} + \bar{y}`
|                                      | `\global\def\macroname#1#2…{definition}`
|                                      | `\newcommand\macroname[numargs]{definition}`
|                                      | `\renewcommand\macroname[numargs]{definition}`
|                                      | `\providecommand\macroname[numargs]{definition}`

Macros can also be defined in the KaTeX [rendering options](options.md).

Macros accept up to ten arguments: #1, #2, etc.

`\gdef` and `\global\def` macros will persist between math expressions.

Available functions include:

`\mathchoice` `\TextOrMath` `\@ifstar` `\@ifnextchar` `\@firstoftwo` `\@secondoftwo` `\relax` `\allowbreak` `\nobreak`

@ is a valid character for commands, as if `\makeatletter` were in effect.

## Operators

### Big Operators

|||||
|------------------|-------------------------|--------------------------|--------------|
| $\sum$ `\sum`    | $\prod$ `\prod`         | $\bigotimes$ `\bigotimes`| $\bigvee$ `\bigvee`
| $\int$ `\int`    | $\coprod$ `\coprod`     | $\bigoplus$ `\bigoplus`  | $\bigwedge$ `\bigwedge`
| $\iint$ `\iint`  | $\intop$ `\intop`       | $\bigodot$ `\bigodot`    | $\bigcap$ `\bigcap`
| $\iiint$ `\iiint`| $\smallint$ `\smallint` | $\biguplus$ `\biguplus`  | $\bigcup$ `\bigcup`  
| $\oint$ `\oint`  | $\oiint$ `\oiint`       | $\oiiint$ `\oiiint`      | $\bigsqcup$ `\bigsqcup`

Direct Input: $∫ ∬ ∭ ∮ ∏ ∐ ∑ ⋀ ⋁ ⋂ ⋃ ⨀ ⨁ ⨂ ⨄ ⨆$

### Binary Operators

|||||
|-------------|-------------------|-------------------|--------------------|
| $+$ `+`| $\cdot$ `\cdot`  | $\gtrdot$ `\gtrdot`| $x \pmod a$ `x \pmod a`|
| $-$ `-`| $\cdotp$ `\cdotp` | $\intercal$ `\intercal` | $x \pod a$ `x \pod a` |
| $/$ `/`| $\centerdot$ `\centerdot`| $\land$ `\land`  | $\rhd$ `\rhd` |
| $*$ `*`| $\circ$ `\circ`  | $\leftthreetimes$ `\leftthreetimes` | $\rightthreetimes$ `\rightthreetimes` |
| $\amalg$ `\amalg` | $\circledast$ `\circledast`  | $\ldotp$ `\ldotp` | $\rtimes$ `\rtimes` |
| $\And$ `\And`| $\circledcirc$ `\circledcirc` | $\lor$ `\lor`| $\setminus$ `\setminus`  |
| $\ast$ `\ast`| $\circleddash$ `\circleddash` | $\lessdot$ `\lessdot`  | $\smallsetminus$ `\smallsetminus`|
| $\barwedge$ `\barwedge` | $\Cup$ `\Cup`| $\lhd$ `\lhd`| $\sqcap$ `\sqcap`  |
| $\bigcirc$ `\bigcirc`  | $\cup$ `\cup`| $\ltimes$ `\ltimes`| $\sqcup$ `\sqcup`  |
| $\bmod$ `\bmod`  | $\curlyvee$ `\curlyvee` | $x \mod a$ `x\mod a`| $\times$ `\times`  |
| $\boxdot$ `\boxdot`| $\curlywedge$ `\curlywedge`  | $\mp$ `\mp` | $\unlhd$ `\unlhd`  |
| $\boxminus$ `\boxminus` | $\div$ `\div`| $\odot$ `\odot`  | $\unrhd$ `\unrhd`  |
| $\boxplus$ `\boxplus`  | $\divideontimes$ `\divideontimes`  | $\ominus$ `\ominus`| $\uplus$ `\uplus`  |
| $\boxtimes$ `\boxtimes` | $\dotplus$ `\dotplus`  | $\oplus$ `\oplus` | $\vee$ `\vee` |
| $\bullet$ `\bullet`| $\doublebarwedge$ `\doublebarwedge` | $\otimes$ `\otimes`| $\veebar$ `\veebar` |
| $\Cap$ `\Cap`| $\doublecap$ `\doublecap`| $\oslash$ `\oslash`| $\wedge$ `\wedge`  |
| $\cap$ `\cap`| $\doublecup$ `\doublecup`| $\pm$ `\pm` | $\wr$ `\wr`  |

Direct Input: $+ - / * ⋅ ± × ÷ ∓ ∔ ∧ ∨ ∩ ∪ ≀ ⊎ ⊓ ⊔ ⊕ ⊖ ⊗ ⊘ ⊙ ⊚ ⊛ ⊝$

### Fractions and Binomials

||||
|:--------------------------|:----------------------------|:-----
|$\frac{a}{b}$ `\frac{a}{b}`|$\tfrac{a}{b}$ `\tfrac{a}{b}`|$\genfrac ( ] {2pt}{1}a{a+1}$ `\genfrac ( ] {2pt}{1}a{a+1}`
|${a \over b}$ `{a \over b}`|$\dfrac{a}{b}$ `\dfrac{a}{b}`|${a \above{2pt} b+1}$ `{a \above{2pt} b+1}`
|$a/b$ `a/b`                |  |$\cfrac{a}{1 + \cfrac{1}{b}}$ `\cfrac{a}{1 + \cfrac{1}{b}}`

||||
|:------------------------------|:------------------------------|:--------
|$\binom{n}{k}$ `\binom{n}{k}`  |$\dbinom{n}{k}$ `\dbinom{n}{k}`|${n\brace k}$ `{n\brace k}`
|${n \choose k}$ `{n \choose k}`|$\tbinom{n}{k}$ `\tbinom{n}{k}`|${n\brack k}$ `{n\brack k}`

### Math Operators

|||||
|-----------|---------|-----------------|-----------|
| $\arcsin$ `\arcsin` | $\cotg$ `\cotg` | $\ln$ `\ln`  | $\det$ `\det` |
| $\arccos$ `\arccos` | $\coth$ `\coth` | $\log$ `\log` | $\gcd$ `\gcd` |
| $\arctan$ `\arctan` | $\csc$ `\csc`  | $\sec$ `\sec` | $\inf$ `\inf` |
| $\arctg$ `\arctg`  | $\ctg$ `\ctg`  | $\sin$ `\sin` | $\lim$ `\lim` |
| $\arcctg$ `\arcctg` | $\cth$ `\cth`  | $\sinh$ `\sinh`| $\liminf$ `\liminf` |
| $\arg$ `\arg` | $\deg$ `\deg`  | $\sh$ `\sh`  | $\limsup$ `\limsup` |
| $\ch$ `\ch`  | $\dim$ `\dim`  | $\tan$ `\tan` | $\max$ `\max` |
| $\cos$ `\cos` | $\exp$ `\exp`  | $\tanh$ `\tanh`| $\min$ `\min` |
| $\cosec$ `\cosec`  | $\hom$ `\hom`  | $\tg$ `\tg`  | $\Pr$ `\Pr`  |
| $\cosh$ `\cosh`| $\ker$ `\ker`  | $\th$ `\th`  | $\sup$ `\sup` |
| $\cot$ `\cot` | $\lg$ `\lg`| $\operatorname{f}$ `\operatorname{f}` |

Functions on the right column of this table can take `\limits`.

### \sqrt

$\sqrt{x}$ `\sqrt{x}`

$\sqrt[3]{x}$ `\sqrt[3]{x}`

## Relations

$\stackrel{!}{=}$ `\stackrel{!}{=}`

|||||
|:----------------------------|:--------------------------------|:--------------------------------|:-----
|$=$ `=` |$\eqcirc$ `\eqcirc`  |$\lesseqgtr$ `\lesseqgtr`  |$\sqsupset$ `\sqsupset`
|$<$ `<` |$\eqcolon$ `\eqcolon`|$\lesseqqgtr$ `\lesseqqgtr`|$\sqsupseteq$ `\sqsupseteq`
|$>$ `>` |$\Eqcolon$ `\Eqcolon`|$\lessgtr$ `\lessgtr`|$\Subset$ `\Subset`
|$:$ `:` |$\eqqcolon$ `\eqqcolon` |$\lesssim$ `\lesssim`|$\subset$ `\subset`
|$\approx$ `\approx` |$\Eqqcolon$ `\Eqqcolon` |$\ll$ `\ll` |$\subseteq$ `\subseteq`
|$\approxeq$ `\approxeq`|$\eqsim$ `\eqsim` |$\lll$ `\lll`  |$\subseteqq$ `\subseteqq`
|$\asymp$ `\asymp`|$\eqslantgtr$ `\eqslantgtr`|$\llless$ `\llless`  |$\succ$ `\succ`
|$\backepsilon$ `\backepsilon`|$\eqslantless$ `\eqslantless` |$\lt$ `\lt` |$\succapprox$ `\succapprox`
|$\backsim$ `\backsim`  |$\equiv$ `\equiv` |$\mid$ `\mid`  |$\succcurlyeq$ `\succcurlyeq`
|$\backsimeq$ `\backsimeq` |$\fallingdotseq$ `\fallingdotseq`|$\models$ `\models`  |$\succeq$ `\succeq`
|$\between$ `\between`  |$\frown$ `\frown` |$\multimap$ `\multimap` |$\succsim$ `\succsim`
|$\bowtie$ `\bowtie` |$\ge$ `\ge` |$\owns$ `\owns`|$\Supset$ `\Supset`
|$\bumpeq$ `\bumpeq` |$\geq$ `\geq`  |$\parallel$ `\parallel` |$\supset$ `\supset`
|$\Bumpeq$ `\Bumpeq` |$\geqq$ `\geqq`|$\perp$ `\perp`|$\supseteq$ `\supseteq`
|$\circeq$ `\circeq` |$\geqslant$ `\geqslant` |$\pitchfork$ `\pitchfork`  |$\supseteqq$ `\supseteqq`
|$\colonapprox$ `\colonapprox`|$\gg$ `\gg` |$\prec$ `\prec`|$\thickapprox$ `\thickapprox`
|$\Colonapprox$ `\Colonapprox`|$\ggg$ `\ggg`  |$\precapprox$ `\precapprox`|$\thicksim$ `\thicksim`
|$\coloneq$ `\coloneq`  |$\gggtr$ `\gggtr` |$\preccurlyeq$ `\preccurlyeq` |$\trianglelefteq$ `\trianglelefteq`
|$\Coloneq$ `\Coloneq`  |$\gt$ `\gt` |$\preceq$ `\preceq`  |$\triangleq$ `\triangleq`
|$\coloneqq$ `\coloneqq`|$\gtrapprox$ `\gtrapprox`  |$\precsim$ `\precsim`|$\trianglerighteq$ `\trianglerighteq`
|$\Coloneqq$ `\Coloneqq`|$\gtreqless$ `\gtreqless`  |$\propto$ `\propto`  |$\varpropto$ `\varpropto`
|$\colonsim$ `\colonsim`|$\gtreqqless$ `\gtreqqless`|$\risingdotseq$ `\risingdotseq`  |$\vartriangle$ `\vartriangle`
|$\Colonsim$ `\Colonsim`|$\gtrless$ `\gtrless`|$\shortmid$ `\shortmid` |$\vartriangleleft$ `\vartriangleleft`
|$\cong$ `\cong`  |$\gtrsim$ `\gtrsim`  |$\shortparallel$ `\shortparallel`|$\vartriangleright$ `\vartriangleright`
|$\curlyeqprec$ `\curlyeqprec`|$\in$ `\in` |$\sim$ `\sim`  |$\vcentcolon$ `\vcentcolon`
|$\curlyeqsucc$ `\curlyeqsucc`|$\Join$ `\Join`|$\simeq$ `\simeq` |$\vdash$ `\vdash`
|$\dashv$ `\dashv`|$\le$ `\le` |$\smallfrown$ `\smallfrown`|$\vDash$ `\vDash`
|$\dblcolon$ `\dblcolon`|$\leq$ `\leq`  |$\smallsmile$ `\smallsmile`|$\Vdash$ `\Vdash`
|$\doteq$ `\doteq`|$\leqq$ `\leqq`|$\smile$ `\smile` |$\Vvdash$ `\Vvdash`
|$\Doteq$ `\Doteq`|$\leqslant$ `\leqslant` |$\sqsubset$ `\sqsubset` |
|$\doteqdot$ `\doteqdot`|$\lessapprox$ `\lessapprox`|$\sqsubseteq$ `\sqsubseteq`|


Direct Input: $= < > : ∈ ∋ ∝ ∼ ∽ ≂ ≃ ≅ ≈ ≊ ≍ ≎ ≏ ≐ ≑ ≒ ≓ ≖ ≗ ≜ ≡ ≤ ≥ ≦ ≧ ≫ ≬ ≳ ≷ ≺ ≻ ≼ ≽ ≾ ≿ ⊂ ⊃ ⊆ ⊇ ⊏ ⊐ ⊑ ⊒ ⊢ ⊣ ⊩ ⊪ ⊸ ⋈ ⋍ ⋐ ⋑ ⋔ ⋙ ⋛ ⋞ ⋟ ⌢ ⌣ ⩾ ⪆ ⪌ ⪕ ⪖ ⪯ ⪰ ⪷ ⪸ ⫅ ⫆ ≲ ⩽ ⪅ ≶ ⋚ ⪋ ⟂ ⊨$ `≔ ≕ ⩴`

### Negated Relations

$\not =$ `\not =`

|||||
|--------------|-------------------|---------------------|------------------|
| $\gnapprox$ `\gnapprox`  | $\ngeqslant$ `\ngeqslant`| $\nsubseteq$ `\nsubseteq`  | $\precneqq$ `\precneqq`|
| $\gneq$ `\gneq`| $\ngtr$ `\ngtr`  | $\nsubseteqq$ `\nsubseteqq` | $\precnsim$ `\precnsim`|
| $\gneqq$ `\gneqq`  | $\nleq$ `\nleq`  | $\nsucc$ `\nsucc`| $\subsetneq$ `\subsetneq`  |
| $\gnsim$ `\gnsim`  | $\nleqq$ `\nleqq` | $\nsucceq$ `\nsucceq` | $\subsetneqq$ `\subsetneqq` |
| $\gvertneqq$ `\gvertneqq` | $\nleqslant$ `\nleqslant`| $\nsupseteq$ `\nsupseteq`  | $\succnapprox$ `\succnapprox`|
| $\lnapprox$ `\lnapprox`  | $\nless$ `\nless` | $\nsupseteqq$ `\nsupseteqq` | $\succneqq$ `\succneqq`|
| $\lneq$ `\lneq`| $\nmid$ `\nmid`  | $\ntriangleleft$ `\ntriangleleft` | $\succnsim$ `\succnsim`|
| $\lneqq$ `\lneqq`  | $\notin$ `\notin` | $\ntrianglelefteq$ `\ntrianglelefteq`  | $\supsetneq$ `\supsetneq`  |
| $\lnsim$ `\lnsim`  | $\notni$ `\notni` | $\ntriangleright$ `\ntriangleright`| $\supsetneqq$ `\supsetneqq` |
| $\lvertneqq$ `\lvertneqq` | $\nparallel$ `\nparallel`| $\ntrianglerighteq$ `\ntrianglerighteq` | $\varsubsetneq$ `\varsubsetneq`  |
| $\ncong$ `\ncong`  | $\nprec$ `\nprec` | $\nvdash$ `\nvdash`  | $\varsubsetneqq$ `\varsubsetneqq` |
| $\ne$ `\ne`  | $\npreceq$ `\npreceq`  | $\nvDash$ `\nvDash`  | $\varsupsetneq$ `\varsupsetneq`  |
| $\neq$ `\neq` | $\nshortmid$ `\nshortmid`| $\nVDash$ `\nVDash`  | $\varsupsetneqq$ `\varsupsetneqq` |
| $\ngeq$ `\ngeq`| $\nshortparallel$ `\nshortparallel` | $\nVdash$ `\nVdash`  |
| $\ngeqq$ `\ngeqq`  | $\nsim$ `\nsim`  | $\precnapprox$ `\precnapprox`|

Direct Input: $∉ ∌ ∤ ∦ ≁ ≆ ≠ ≨ ≩ ≮ ≯ ≰ ≱ ⊀ ⊁ ⊈ ⊉ ⊊ ⊋ ⊬ ⊭ ⊮ ⊯ ⋠ ⋡ ⋦ ⋧ ⋨ ⋩ ⋬ ⋭ ⪇ ⪈ ⪉ ⪊ ⪵ ⪶ ⪹ ⪺ ⫋ ⫌$

### Arrows

||||
|:--------------------------------------|:--------------------------------------------|:-----
|$\circlearrowleft$ `\circlearrowleft`  |$\Leftrightarrow$ `\Leftrightarrow` |$\rightarrow$ `\rightarrow`
|$\circlearrowright$ `\circlearrowright`|$\leftrightarrows$ `\leftrightarrows`  |$\Rightarrow$ `\Rightarrow`
|$\curvearrowleft$ `\curvearrowleft` |$\leftrightharpoons$ `\leftrightharpoons` |$\rightarrowtail$ `\rightarrowtail`
|$\curvearrowright$ `\curvearrowright`  |$\leftrightsquigarrow$ `\leftrightsquigarrow`|$\rightharpoondown$ `\rightharpoondown`
|$\dashleftarrow$ `\dashleftarrow`|$\Lleftarrow$ `\Lleftarrow`|$\rightharpoonup$ `\rightharpoonup`
|$\dashrightarrow$ `\dashrightarrow` |$\longleftarrow$ `\longleftarrow`|$\rightleftarrows$ `\rightleftarrows`
|$\downarrow$ `\downarrow`  |$\Longleftarrow$ `\Longleftarrow`|$\rightleftharpoons$ `\rightleftharpoons`
|$\Downarrow$ `\Downarrow`  |$\longleftrightarrow$ `\longleftrightarrow`  |$\rightrightarrows$ `\rightrightarrows`
|$\downdownarrows$ `\downdownarrows` |$\Longleftrightarrow$ `\Longleftrightarrow`  |$\rightsquigarrow$ `\rightsquigarrow`
|$\downharpoonleft$ `\downharpoonleft`  |$\longmapsto$ `\longmapsto`|$\Rrightarrow$ `\Rrightarrow`
|$\downharpoonright$ `\downharpoonright`|$\longrightarrow$ `\longrightarrow` |$\Rsh$ `\Rsh`
|$\gets$ `\gets`|$\Longrightarrow$ `\Longrightarrow` |$\searrow$ `\searrow`
|$\hookleftarrow$ `\hookleftarrow`|$\looparrowleft$ `\looparrowleft`|$\swarrow$ `\swarrow`
|$\hookrightarrow$ `\hookrightarrow` |$\looparrowright$ `\looparrowright` |$\to$ `\to`
|$\iff$ `\iff`  |$\Lsh$ `\Lsh`  |$\twoheadleftarrow$ `\twoheadleftarrow`
|$\impliedby$ `\impliedby`  |$\mapsto$ `\mapsto`  |$\twoheadrightarrow$ `\twoheadrightarrow`
|$\implies$ `\implies`|$\nearrow$ `\nearrow`|$\uparrow$ `\uparrow`
|$\leadsto$ `\leadsto`|$\nleftarrow$ `\nleftarrow`|$\Uparrow$ `\Uparrow`
|$\leftarrow$ `\leftarrow`  |$\nLeftarrow$ `\nLeftarrow`|$\updownarrow$ `\updownarrow`
|$\Leftarrow$ `\Leftarrow`  |$\nleftrightarrow$ `\nleftrightarrow`  |$\Updownarrow$ `\Updownarrow`
|$\leftarrowtail$ `\leftarrowtail`|$\nLeftrightarrow$ `\nLeftrightarrow`  |$\upharpoonleft$ `\upharpoonleft`
|$\leftharpoondown$ `\leftharpoondown`  |$\nrightarrow$ `\nrightarrow` |$\upharpoonright$ `\upharpoonright`
|$\leftharpoonup$ `\leftharpoonup`|$\nRightarrow$ `\nRightarrow` |$\upuparrows$ `\upuparrows`
|$\leftleftarrows$ `\leftleftarrows` |$\nwarrow$ `\nwarrow`|
|$\leftrightarrow$ `\leftrightarrow` |$\restriction$ `\restriction` |


Direct Input: $← ↑ → ↓ ↔ ↕ ↖ ↗ ↘ ↙ ↚ ↛ ↞ ↠ ↢ ↣ ↦ ↩ ↪ ↫ ↬ ↭ ↮ ↰ ↱↶ ↷ ↺ ↻ ↼ ↽ ↾ ↾ ↿ ⇀ ⇁ ⇂ ⇃ ⇄ ⇆ ⇇ ⇈ ⇉ ⇊ ⇋ ⇌⇍ ⇎ ⇏ ⇐ ⇑ ⇒ ⇓ ⇔ ⇕ ⇚ ⇛ ⇝ ⇠ ⇢ ⟵ ⟶ ⟷ ⟸ ⟹ ⟺ ⟼$ ↽

**Extensible Arrows**

|||
|:----------------------------------------------------|:-----
|$\xleftarrow{abc}$ `\xleftarrow{abc}`                |$\xrightarrow[under]{over}$ `\xrightarrow[under]{over}`
|$\xLeftarrow{abc}$ `\xLeftarrow{abc}`                |$\xRightarrow{abc}$ `\xRightarrow{abc}`
|$\xleftrightarrow{abc}$ `\xleftrightarrow{abc}`      |$\xLeftrightarrow{abc}$ `\xLeftrightarrow{abc}`
|$\xhookleftarrow{abc}$ `\xhookleftarrow{abc}`        |$\xhookrightarrow{abc}$ `\xhookrightarrow{abc}`
|$\xtwoheadleftarrow{abc}$ `\xtwoheadleftarrow{abc}`  |$\xtwoheadrightarrow{abc}$ `\xtwoheadrightarrow{abc}`
|$\xleftharpoonup{abc}$ `\xleftharpoonup{abc}`        |$\xrightharpoonup{abc}$ `\xrightharpoonup{abc}`
|$\xleftharpoondown{abc}$ `\xleftharpoondown{abc}`    |$\xrightharpoondown{abc}$ `\xrightharpoondown{abc}`
|$\xleftrightharpoons{abc}$ `\xleftrightharpoons{abc}`|$\xrightleftharpoons{abc}$ `\xrightleftharpoons{abc}`
|$\xtofrom{abc}$ `\xtofrom{abc}`                      |$\xmapsto{abc}$ `\xmapsto{abc}`
|$\xlongequal{abc}$ `\xlongequal{abc}`

Extensible arrows all can take an optional argument in the same manner<br>as `\xrightarrow[under]{over}`.

## Style, Color, Size, and Font

**Class Assignment**

`\mathbin` `\mathclose` `\mathinner` `\mathop`<br>
`\mathopen` `\mathord` `\mathpunct` `\mathrel`

**Color**

$\color{blue} F=ma$  `\color{blue} F=ma`

Note that KaTeX `\color` acts like a switch. This aligns with LaTeX and differs from MathJax.
Other KaTeX color functions expect the content to be a function argument:

$\textcolor{blue}{F=ma}$ `\textcolor{blue}{F=ma}`<br>
$\textcolor{#228B22}{F=ma}$ `\textcolor{#228B22}{F=ma}`<br>
$\colorbox{aqua}{A}$ `\colorbox{aqua}{A}`<br>
$\fcolorbox{red}{aqua}{A}$ `\fcolorbox{red}{aqua}{A}`

For color definition, KaTeX color functions will accept the standard HTML [predefined color names](https://www.w3schools.com/colors/colors_names.asp). They will also accept an RGB argument in CSS hexa­decimal style.

**Font**

||||
|:------------------------------|:------------------------------|:-----
|$\mathrm{Ab0}$ `\mathrm{Ab0}`  |$\mathbf{Ab0}$ `\mathbf{Ab0}`  |$\mathit{Ab}$ `\mathit{Ab}`
|$\textrm{Ab0}$ `\textrm{Ab0}`  |$\textbf{Ab0}$ `\textbf{Ab0}`  |$\textit{Ab}$ `\textit{Ab}`
|$\rm Ab0$ `\rm Ab0`            |$\bf Ab0$ `\bf Ab0`            |$\it Ab$ `\it Ab`
|$\textnormal{Ab0}$ `\textnormal{Ab0}`|$\bold{Ab0}$ `\bold{Ab0}`|$\Bbb{AB}$ `\Bbb{AB}`
|$\text{Ab0}$ `\text{Ab0}`      |$\boldsymbol{Ab}$ `\boldsymbol{Ab}`|$\mathbb{AB}$ `\mathbb{AB}`
|$\mathsf{Ab0}$ `\mathsf{Ab0}`  |$\bm{Ab}$ `\bm{Ab}`            |$\frak{Ab0}$ `\frak{Ab0}`
|$\textsf{Ab0}$ `\textsf{Ab0}`  |$\mathtt{Ab0}$ `\mathtt{Ab0}`  |$\mathfrak{Ab0}$ `\mathfrak{Ab0}`
|$\sf Ab0$ `\sf Ab0`            |$\texttt{Ab0}$ `\texttt{Ab0}`  |$\mathcal{AB0}$ `\mathcal{AB0}`
|                               |$\tt Ab0$ `\tt Ab0`            |$\mathscr{AB}$ `\mathscr{AB}`

One can stack font family, font weight, and font shape by using the `\textXX` versions of the font functions. So `\textsf{\textbf{H}}` will produce $\textsf{\textbf{H}}$. The other versions do not stack, e.g., `\mathsf{\mathbf{H}}` will produce $\mathsf{\mathbf{H}}$.

In cases where KaTeX fonts do not have a bold glyph, `\pmb` can simulate one. For example, `\pmb{\mu}` renders as : $\pmb{\mu}$ 

**Size**

|||
|:----------------------|:-----
|$\Huge AB$ `\Huge AB`  |$\normalsize AB$ `\normalsize AB`
|$\huge AB$ `\huge AB`  |$\small AB$ `\small AB`
|$\LARGE AB$ `\LARGE AB`|$\footnotesize AB$ `\footnotesize AB`
|$\Large AB$ `\Large AB`|$\scriptsize AB$ `\scriptsize AB`
|$\large AB$ `\large AB`|$\tiny AB$ `\tiny AB`


**Style**

||
|:-------------------------------------------------------|
|$\displaystyle\sum_{i=1}^n$ `\displaystyle\sum_{i=1}^n`
|$\textstyle\sum_{i=1}^n$ `\textstyle\sum_{i=1}^n`
|$\scriptstyle x$ `\scriptstyle x` &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(The size of a first sub/superscript)
|$\scriptscriptstyle x$ `\scriptscriptstyle x` (The size of subsequent sub/superscripts)
|$\lim\limits_x$ `\lim\limits_x`
|$\lim\nolimits_x$ `\lim\nolimits_x`
|$\verb!x^2!$ `\verb!x^2!`

`\text{…}` will accept nested `$…$` fragments and render them in math mode.

## Symbols and Punctuation

||||
|:----------|:----------|:----------|
|`% comment`|$\dots$ `\dots`|$ \KaTeX$ ` \KaTeX`
|$\%$ `\%`|$\cdots$ `\cdots`|$ \LaTeX$ ` \LaTeX`
|$\#$ `\#`|$\ddots$ `\ddots`|$ \TeX$ ` \TeX`
|$\&$ `\&`|$\ldots$ `\ldots`|$\nabla$ `\nabla`
|$\_$ `\_`|$\vdots$ `\vdots`|$\infty$ `\infty`
|$\text{\textunderscore}$ `\text{\textunderscore}`|$\dotsb$ `\dotsb`|$\checkmark$ `\checkmark`
|$\text{--}$ `\text{--}`|$\dotsc$ `\dotsc`|$\dag$ `\dag`
|$\text{\textendash}$ `\text{\textendash}`|$\dotsi$ `\dotsi`|$\dagger$ `\dagger`
|$\text{---}$ `\text{---}`|$\dotsm$ `\dotsm`|$ \text{\textdagger}$ ` \text{\textdagger}`
|$\text{\textemdash}$ `\text{\textemdash}`|$\dotso$ `\dotso`|$\ddag$ `\ddag`
|$ \text{\textasciitilde}$ ` \text{\textasciitilde}`|$\mathellipsis$ `\mathellipsis`|$\ddagger$ `\ddagger`
|$`$ <code>`</code>|$\text{\textellipsis}$ `\text{\textellipsis}`|$\text{\textdaggerdbl}$ `\text{\textdaggerdbl}`
|$\text{\textquoteleft}$ `text{\textquoteleft}`|$\Box$ `\Box`|$\angle$ `\angle`
|$\lq$ `\lq`|$\square$ `\square`|$\measuredangle$ `\measuredangle`
|$\text{\textquoteright}$ `\text{\textquoteright}`|$\blacksquare$ `\blacksquare`|$\sphericalangle$ `\sphericalangle`
|$\rq$ `\rq`|$\triangle$ `\triangle`|$\top$ `\top`
|$\text{\textquotedblleft}$ `\text{\textquotedblleft}`|$\triangledown$ `\triangledown`|$\bot$ `\bot`
|$"$ `"`|$\triangleleft$ `\triangleleft`|$\text{\textdollar}$ <code>\\$</code>
|$\text{\textquotedblright}$ `\text{\textquotedblright}`|$\triangleright$ `\triangleright`|$\text{\textdollar}$ `\text{\textdollar}`
|$\colon$ `\colon`|$\bigtriangledown$ `\bigtriangledown`|$\pounds$ `\pounds`
|$\backprime$ `\backprime`|$\bigtriangleup$ `\bigtriangleup`|$\mathsterling$ `\mathsterling`
|$\prime$ `\prime`|$\blacktriangle$ `\blacktriangle`|$\text{\textsterling}$ `\text{\textsterling}`
|$\text{\textless}$ `\text{\textless}`|$\blacktriangledown$ `\blacktriangledown`|$\yen$ `\yen`
|$\text{\textgreater}$ `\text{\textgreater}`|$\blacktriangleleft$ `\blacktriangleleft`|$\surd$ `\surd`
|$\text{\textbar}$ `\text{\textbar}`|$\blacktriangleright$ `\blacktriangleright`|$\degree$ `\degree`
|$\text{\textbardbl}$ `\text{\textbardbl}`|$\diamond$ `\diamond`|$\text{\textdegree}$ `\text{\textdegree}`
|$\text{\textbraceleft}$ `\text{\textbraceleft}`|$\Diamond$ `\Diamond`|$\mho$ `\mho`
|$\text{\textbraceright}$ `\text{\textbraceright}`|$\lozenge$ `\lozenge`|$\diagdown$ `\diagdown`
|$\text{\P}$ `\text{\P}`|$\blacklozenge$ `\blacklozenge`|$\diagup$ `\diagup`
|$\text{\S}$ `\text{\S}`|$\star$ `\star`|$\maltese$ `\maltese`
|$\copyright$ `\copyright`|$\bigstar$ `\bigstar`|$\flat$ `\flat`
|$\circledR$ `\circledR`|$\clubsuit$ `\clubsuit`|$\natural$ `\natural`
|$\text{\textregistered}$ `\text{\textregistered}`|$\diamondsuit$ `\diamondsuit`|$\sharp$ `\sharp`
|$\circledS$ `\circledS`|$\heartsuit$ `\heartsuit`
|$\text{\textcircled a}$ `\text{\textcircled a}`|$\spadesuit$ `\spadesuit`

Direct Input: $£ ¥ ∇ ∞ · ∠ ∡ ∢ ♠ ♡ ♢ ♣ ♭ ♮ ♯ ✓ …  ⋮  ⋯  ⋱  !$ ‼

## Units

In KaTeX, units are proportioned as they are in TeX.<br>
KaTeX units are different than CSS units.

</div>
<div class="katex-cards" id="unit-tbl">

|  KaTeX Unit | Value       | KaTeX Unit  | Value  |
|:---|:---------------------|:---|:----------------|
| em | CSS em               | bp | 1/72​ inch × F × G|
| ex | CSS ex               | pc | 12 KaTeX pt|
| mu | 1/18 CSS em          | dd | 1238/1157​ KaTeX pt  |
| pt | 1/72.27 inch × F × G | cc | 14856/1157 KaTeX pt |
| mm | 1 mm × F × G         | nd | 685/642 KaTeX pt |
| cm | 1 cm × F × G         | nc | 1370/107​ KaTeX pt|
| in | 1 inch × F × G       | sp | 1/65536 KaTeX pt |

</div>

where:

<div style="margin-left: 1.5em;">

F = (font size of surrounding HTML text)/(10 pt)

G = 1.21 by default, because KaTeX font-size is normally 1.21 × the surrounding font size. This value [can be over-ridden](font.md#font-size-and-lengths) by the CSS of an HTML page.

</div>

The effect of style and size:

|  Unit  |     textstyle     | scriptscript |  huge  |
|:-------|:-----------------:|:------------:|:------:|
|em or ex|$\rule{1em}{1em}$  |$\scriptscriptstyle\rule{1em}{1em}$  |$\huge\rule{1em}{1em}$
| mu     |$\rule{18mu}{18mu}$|$\scriptscriptstyle\rule{18mu}{18mu}$|$\huge\rule{18mu}{18mu}$
| others |$\rule{10pt}{10pt}$|$\scriptscriptstyle\rule{10pt}{10pt}$|$\huge\rule{10pt}{10pt}$


