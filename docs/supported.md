---
id: supported
title: Supported Functions
---
This is a list of TeX functions supported by KaTeX. It is sorted into logical groups.

For a list of things that are not (yet) in KaTeX, there is a [wiki page](https://github.com/Khan/KaTeX/wiki/Things-that-KaTeX-does-not-%28yet%29-support).

## Accents

||||
|:----------------------------|:----------------------------------------------------|:-----
|$a'$ `a'`                    |$\tilde{a}$ `\tilde{a}`                              |$\mathring{g}$ `\mathring{g}`
|$a''$ `a''`                  |$\widetilde{ac}$ `\widetilde{ac}`                    |$\overgroup{AB}$ `\overgroup{AB}`
|$a^{\prime}$ `a^{\prime}`    |$\utilde{AB}$ `\utilde{AB}`                          |$\undergroup{AB}$ `\undergroup{AB}`
|$\acute{a}$ `\acute{a}`      |$\vec{F}$ `\vec{F}`                                  |$\Overrightarrow{AB}$ `\Overrightarrow{AB}`
|$\bar{y}$ `\bar{y}`          |$\overleftarrow{AB}$ `\overleftarrow{AB}`            |$\overrightarrow{AB}$ `\overrightarrow{AB}`
|$\breve{a}$ `\breve{a}`      |$\underleftarrow{AB}$ `\underleftarrow{AB}`          |$\underrightarrow{AB}$ `\underrightarrow{AB}`
|$\check{a}$ `\check{a}`      |$\overleftharpoon{ac}$ `\overleftharpoon{ac}`        |$\overrightharpoon{ac}$ `\overrightharpoon{ac}`
|$\dot{a}$ `\dot{a}`          |$\overleftrightarrow{AB}$ `\overleftrightarrow{AB}`  |$\overbrace{AB}$ `\overbrace{AB}`
|$\ddot{a}$ `\ddot{a}`        |$\underleftrightarrow{AB}$ `\underleftrightarrow{AB}`|$\underbrace{AB}$ `\underbrace{AB}`
|$\grave{a}$ `\grave{a}`      |$\overline{AB}$ `\overline{AB}`                      |$\overlinesegment{AB}$ `\overlinesegment{AB}`
|$\hat{\theta}$ `\hat{\theta}`|$\underline{AB}$ `\underline{AB}`                    |$\underlinesegment{AB}$ `\underlinesegment{AB}`
|$\widehat{ac}$ `\widehat{ac}`|$\widecheck{ac}$ `\widecheck{ac}`                    |  

***Accent functions inside \\text{…}***

|||||
|:---------------------|:---------------------|:---------------------|:-----
|$\text{\'{a}}$ `\'{a}`|$\text{\~{a}}$ `\~{a}`|$\text{\.{a}}$ `\.{a}`|$\text{\H{a}}$ `\H{a}`
|$\text{\`{a}}$ `\`{a}`|$\text{\={a}}$ `\={a}`|$\text{\"{a}}$ `\"{a}`|$\text{\v{a}}$ `\v{a}`
|$\text{\^{a}}$ `\^{a}`|$\text{\u{a}}$ `\u{a}`|$\text{\r{a}}$ `\r{a}`|

See also [letters]{#letters}

## Delimiters

||||||
|:-----------------------------------|:---------------------------------------|:----------|:-------------------------------------------------------|:-----
|$( )$ `( )`                         |$\lt \gt$ `\lt`<br>`\gt`                |$⌈ ⌉$ `⌈ ⌉`|$\lceil \rceil$ `\lceil`<br>`\rceil`                    |$\uparrow$ `\uparrow`
|$[ ]$ `[ ]`                         |$\lbrack \rbrack$ `\lbrack`<br>`\rbrack`|$⌊ ⌋$ `⌊ ⌋`|$\lfloor \rfloor$ `\lfloor`<br>`\rfloor`                |$\downarrow$ `\downarrow`
|$\{ \}$ `\{ \}`                     |$\lbrace \rbrace$ `\lbrace`<br>`\rbrace`|$⎰⎱$ `⎰⎱`  |$\lmoustache \rmoustache$ `\lmoustache`<br>`\rmoustache`|$\updownarrow$ `\updownarrow`
|$⟨ ⟩$ `⟨ ⟩`                         |$\langle \rangle$ `\langle`<br>`\rangle`|$⟮ ⟯$ `⟮ ⟯`|$\lgroup \rgroup$ `\lgroup`<br>`\rgroup`                |$\Uparrow$ `\Uparrow`
|$|$ `|`                             |$\vert$ `\vert`                         |$┌ ┐$ `┌ ┐`|$\ulcorner \urcorner$ `\ulcorner`<br>`\urcorner`        |$\Downarrow$ `\Downarrow`
|$\|$ `\|`                           |$\Vert$ `\Vert`                         |$└ ┘$ `└ ┘`|$\llcorner \lrcorner$ `\llcorner`<br>`\lrcorner`        |$\Updownarrow$ `\Updownarrow`
|$\lvert \rvert$ `\lvert`<br>`\rvert`|$\lVert \rVert$ `\lVert`<br>`\rVert`    |           |  `\left.`                                       |  `\right.`
|$\backslash$ `\backslash`           |                                        |           |                                                        |

**Delimiter Sizing**

<table>
    <tr>
        <td rowspan="2">$\left(\LARGE{AB}\right)$</td>
        <td rowspan="2" style="border-right: solid 1px;">`\left( \LARGE{AB} \right)`</td>
        <td>`\left`</td>
        <td>`\big`</td>
        <td>`\bigl`</td>
        <td>`\bigr`</td>
    </tr>
    <tr>
        <td>`\middle`</td>
        <td>`\Big`</td>
        <td>`\Bigl`</td>
        <td>`\Bigr`</td>
    </tr>
    <tr>
        <td rowspan="2">$( \big( \Big( \bigg( \Bigg($</td>
        <td rowspan="2" style="border-right: solid 1px;">`( \big( \Big( \bigg( \Bigg(`</td>
        <td>`\right`</td>
        <td>`\bigg`</td>
        <td>`\biggl`</td>
        <td>`\biggr`</td>
    </tr>
    <tr>
        <td></td>
        <td>`\Bigg`</td>
        <td>`\Biggl`</td>
        <td>`\Biggr`</td>
    </tr>
</table>

## Environments

<table class="symbol">
    <tr>
        <td>\(\begin{matrix} a &amp; b \\ c &amp; d \end{matrix}\)</td>
        <td>
            <pre><code>\begin{matrix}
   a &amp; b \\
   c &amp; d
\end{matrix}</code></pre>
        </td>
        <td>\(\begin{array}{cc}a &amp; b\\c &amp; d\end{array}\)</td>
        <td>
            <pre><code>\begin{array}{cc}
   a &amp; b \\
   c &amp; d
\end{array}</code></pre>
        </td>
    </tr>
    <tr>
        <td>\(\begin{pmatrix} a &amp; b \\ c &amp; d \end{pmatrix}\)</td>
        <td>
            <pre><code>\begin{pmatrix}
   a &amp; b \\
   c &amp; d
\end{pmatrix}</code></pre>
        </td>
        <td>\(\begin{bmatrix} a &amp; b \\ c &amp; d \end{bmatrix}\)</td>
        <td>
            <pre><code>\begin{bmatrix}
   a &amp; b \\
   c &amp; d
\end{bmatrix}</code></pre>
        </td>
    </tr>
    <tr>
        <td>\(\begin{vmatrix} a &amp; b \\ c &amp; d \end{vmatrix}\)</td>
        <td>
            <pre><code>\begin{vmatrix}
   a &amp; b \\
   c &amp; d
\end{vmatrix}</code></pre>
        </td>
        <td>\(\begin{Vmatrix} a &amp; b \\ c &amp; d \end{Vmatrix}\)</td>
        <td>
            <pre><code>\begin{Vmatrix}
   a &amp; b \\
   c &amp; d
\end{Vmatrix}</code></pre>
        </td>
    </tr>
    <tr>
        <td>\(\begin{Bmatrix} a &amp; b \\ c &amp; d \end{Bmatrix}\)</td>
        <td>
            <pre><code>\begin{Bmatrix}
   a &amp; b \\
   c &amp; d
\end{Bmatrix}</code></pre>
        </td>
        <td>\(\def\arraystretch{1.5}\begin{array}{c|c:c} a &amp; b &amp; c \\ \hline d &amp; e &amp; f \\ \hdashline g &amp; h &amp; i \end{array}\)</td>
        <td>
            <pre><code>\def\arraystretch{1.5}
\begin{array}{c|c:c}
   a &amp; b &amp; c \\ \hline
   d &amp; e &amp; f \\
   \hdashline
   g &amp; h &amp; i
\end{array}</code></pre>
        </td>
    </tr>
    <tr>
        <td>\(\begin{aligned} a&=b+c \\ d+e&=f \end{aligned}\)</td>
        <td>
            <pre><code>\begin{aligned}
   a&amp;=b+c \\
   d+e&=f
\end{aligned}</code></pre>
        </td>
        <td>\(\begin{alignedat}{2}10&x+&3&y=2\\3&x+&13&y=4\end{alignedat}\)</td>
        <td>
            <pre><code>\begin{alignedat}{2}
   10&x+ &3&y = 2 \\
    3&x+&13&y = 4
\end{alignedat}</code></pre>
        </td>
    </tr>
    <tr>
        <td>\(\begin{gathered} a=b \\ e=b+c \end{gathered}\)</td>
        <td>
            <pre><code>\begin{gathered}
   a=b \\ 
   e=b+c
\end{gathered}</code></pre>
        </td>
        <td>\(x = \begin{cases} a &amp;\text{if } b \\ c &amp;\text{if } d \end{cases}\)</td>
        <td>
            <pre><code>x = \begin{cases}
   a &amp;\text{if } b  \\
   c &amp;\text{if } d
\end{cases}</code></pre>
        </td>
    </tr>
</table>

KaTeX also supports `darray`  and `dcases`.

Acceptable line separators include: `\\`, `\cr`, `\\[distance]`, and `\cr[distance]`. *Distance* can be written with any of the [KaTeX units](#units).

The `{array}` environment supports `|` and `:` vertical separators.

The `{array}` environment does not yet support `\cline` or `\multicolumn`.

## HTML

$\href{https://khan.github.io/KaTeX/}{katex}$ `\href{https://khan.github.io/KaTeX/}{katex}`

## Letters

**Greek Letters**

Direct Input: $Α Β Γ Δ Ε Ζ Η Θ Ι Κ Λ Μ Ν Ξ Ο Π Ρ Σ Τ Υ Φ Χ Ψ Ω$<br>
$α β γ δ ϵ ζ η θ ι κ λ μ ν ξ o π ρ σ τ υ ϕ χ ψ ω ε ϑ ϖ ϱ ς φ$

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
| $\imath$ `imath`    | $\eth$ `\eth`    | $\Im$ `\Im`      | $\text{\aa}$ `\text{\aa}`   | $\text{\o}$ `\text{\o}`  |
| $\jmath$ `\jmath`   | $\Finv$ `\Finv`   | $\Re$ `\Re`      | $\text{\AA}$ `\text{\AA}`   | $\text{\O}$ `\text{\O}`  |
| $\aleph$ `\aleph`   | $\Game$ `\Game`   | $\wp$ `\wp`      | $\text{\ae}$ `\text{\ae}`   | $\text{\ss}$ `\text{\ss}` |
| $\beth$ `\beth`    | $\ell$ `\ell`    | $\partial$ `\partial` | $\text{\AE}$ `\text{\AE}`   | $\text{\i}$ `\text{\i}`  |
| $\gimel$ `\gimel`   | $\hbar$ `\hbar`   | $\nabla$ `\nabla`   | $\text{\oe}$ `\text{\oe}`   | $\text{\j}$ `\text{\j}`  |
| $\daleth$ `\daleth`  | $\hslash$ `\hslash` | $\Bbbk$ `\Bbbk`    | $\text{\OE}$ `\text{\OE}`   |              |

Direct Input: $∂ ð ∇ ℑ Ⅎ ℵ ℶ ℷ ℸ ⅁ ℏ$ <br>
ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖÙÚÛÜÝÞß<br>àáâãäåçèéêëìíîïðñòóôöùúûüýþÿ

## Unicode

| Item         |  Range        |  Item               |  Range        |
|--------------|---------------|---------------------|---------------|
| Bold         |  A-Z a-z 0-9  |  Double-struck      |  A-Z k        |
| Italic       |  A-Z a-z      |  Sans serif         |  A-Z a-z 0-9  |
| Bold Italic  |  A-Z a-z      |  Sans serif bold    |  A-Z a-z 0-9  |
| Script       |  A-Z          |  Sans serif italic  |  A-Z a-z      |
| Fractur      |  A-Z a-z      |  Monospace          |  A-Z a-z 0-9  |

The letters listed above will render in any KaTeX rendering mode.

If the KaTeX rendering mode is set to `strict: false` or `strict:"warn"` (default), then KaTeX will accept all Unicode letters. The letters not listed above will be rendered from system fonts, not KaTeX-supplied fonts, so their typography may clash. They may also cause small vertical alignment issues. KaTeX has detailed metrics for glyphs in Latin, Greek, and Cyrillic, but other glyphs are treated as if they are each as tall as the letter M.

For Persian composite characters, a user-supplied [plug-in](https://github.com/HosseinAgha/persian-katex-plugin) is under development.

## Layout

### Annotation

|||
|:------------------------------|:-----
|$\cancel{5}$ `\cancel{5}`      |$\overbrace{a+b+c}^{\text{note}}$ `\overbrace{a+b+c}^{\text{note}}`
|$\bcancel{5}$ `\bcancel{5}`    |$\underbrace{a+b+c}_{\text{note}}$ `\underbrace{a+b+c}_{\text{note}}`
|$\xcancel{ABC}$ `\xcancel{ABC}`|$\not =$ `\not =`
|$\sout{abc}$ `\sout{abc}`      |$\boxed{\pi=\frac c d}$ `\boxed{\pi=\frac c d}`


`\tag{hi} x+y^{2x}`
$$\tag{hi} x+y^{2x}$$

`\tag*{hi} x+y^{2x}`
$$\tag*{hi} x+y^{2x}$$

### Line Breaks

KaTeX 0.10.0+ will insert automatic line breaks in inline math after relations or binary operators such as “=” or “+”. These can be suppressed by placing math inside a pair of braces, as in `{F=ma}`.

Hard line breaks are `\\` and `\newline`.

In display math, KaTeX does not insert automatic line breaks. It ignores display math hard line breaks when rendering option $strict: true$ `strict: true`.

### Overlap

KaTeX also supports `\llap`, `\rlap`, and `\clap`, but they will take only text, not math, as arguments.

### Spacing

| Function        | Produces           | Function              | Produces                              |
|:----------------|:-------------------|:----------------------|:--------------------------------------|
| `\!`            | – ³∕₁₈ em space    | `\kern{distance}`     | space, width = *distance*             |
| `\,`            | ³∕₁₈ em space      | `\mkern{distance}`    | space, width = *distance*             |
| `\thinspace`    | ³∕₁₈ em space      | `\skip{distance}`     | space, width = *distance*             |
| `\:`            | ⁴∕₁₈ em space      | `\mskip{distance}`    | space, width = *distance*             |
| `\medspace`     | ⁴∕₁₈ em space      | `\hspace{distance}`   | space, width = *distance*             |
| `\;`            | ⁵∕₁₈ em space      | `\hspace\*{distance}` | space, width = *distance*             |
| `\thickspace`   | ⁵∕₁₈ em space      | `\phantom{content}`   | space the width and height of content |
| `\enspace`      | ½ em space         | `\hphantom{content}`  | space the width of content            |
| `\quad`         | 1 em space         | `\vphantom{content}`  | a strut the height of content         |
| `\qquad`        | 2 em space         |                       |                                       |
| `\~`            | non-breaking space |                       |                                       |
| `\space`        |  space             |                       |                                       |
| `\nobreakspace` | non-breaking space |                       |                                       |
| `\space`        |  space             |                       |                                       |

**Notes:**

`distance` will accept any of the [KaTeX units](#units).

`\kern`, `\mkern`, and `\hspace` accept unbraced distances, as in: `\kern1em`.

`\mkern` and `\mskip` will not work in text mode and both will write a console warning for any unit except `mu`.

### Vertical Layout

||||
|:--------------|:----------------------------------------|:-----
|$x_n$ `x_n`    |$\stackrel{!}{=}=!$ `\stackrel{!}{=}=!`  |$a \atop b$ `a \atop b`
|$e^x$ `e^x`    |$\overset{!}{=}=!$ `\overset{!}{=}=!`    |$a\raisebox{0.25em}{b}c$ `a\raisebox{0.25em}{b}c`
|$_u^o $ `_u^o `|$\underset{!}{=}!=$ `\underset{!}{=}!=`|$a\raisebox{0.25em}{$b$}c$ `a\raisebox{0.25em}{$b$}c`


## Logic and Set Theory

|||||
|:--------------------|:--------------------------|:----------------------------------|:-----
|$\forall$ `\forall`  |$\complement$ `\complement`|$\therefore$ `\therefore`          |$\neg$ `\neg` or `\lnot`
|$\exists$ `\exists`  |$\subset$ `\subset`        |$\because$ `\because`              |$\emptyset$ `\emptyset`
|$\nexists$ `\nexists`|$\supset$ `\supset`        |$\mapsto$ `\mapsto`                |$\varnothing$ `\varnothing`
|$\in$ `\in`          |$\mid$ `\mid`              |$\to$ `\to`                        |$\implies$ `\implies`
|$\notin$ `\notin`    |$\land$ `\land`            |$\gets$ `\gets`                    |$\impliedby$ `\impliedby`
|$\ni$ `\ni`          |$\lor$ `\lor`              |$\leftrightarrow$ `\leftrightarrow`|$\iff$ `\iff`
|$\notni$ `\notni`    |                           |                                   |

Direct Input:`∀ ∴ ∁ ∵ ∃ ∣ ∈ ∉ ∋ ⊂ ⊃ ∧ ∨ ↦ → ← ↔ ¬ ℂ ℍ ℕ ℙ ℚ ℝ ℤ`

## Macros

* `\\def\\macroname#1#2…{definition}`
* `\\gdef\\macroname#1#2…{definition}`
* `\\global\\def\\macroname#1#2…{definition}`
* `\\newcommand\\macroname\[numargs]{definition}`
* `\\renewcommand\\macroname\[numargs]{definition}`
* `\\providecommand\\macroname\[numargs]{definition}`

Macros can also be defined in the KaTeX [rendering options](https://github.com/Khan/KaTeX#rendering-options).

Macros accept up to ten arguments: #1, #2, etc.

`\gdef` and `\global\def` macros will persist between math expressions.
Available functions include:

`\mathchoice` `\TextOrMath` `\@ifstar` `\@ifnextchar` `\@firstoftwo` `\@secondoftwo` `\relax`

@ is a valid character for commands, as if `\makeatletter` were in effect.

## Operators

**Big Operators**

|||||
|----------|-------------|-------------|--------------|
| $\sum$ `\sum`     | $\prod$ `\prod`         | $\bigvee$ `\bigvee`     | $\bigotimes$ `\bigotimes`
| $\int$ `\int`     | $\coprod$ `\coprod`     | $\bigwedge$ `\bigwedge` | $\bigoplus$ `\bigoplus`
| $\iint$ `\iint`   | $\intop$ `\intop`       | $\bigcap$ `\bigcap`     | $\bigodot$ `\bigodot`
| $\iiint$ `\iiint` | $\smallint$ `\smallint` | $\bigcup$ `\bigcup`     | $\biguplus$ `\biguplus`
| $\oint$ `\oint`   |                         | $\bigsqcup$ `\bigsqcup` |    

Direct Input: $∫ ∬ ∭ ∮ ∏ ∐ ∑ ⋀ ⋁ ⋂ ⋃ ⨀ ⨁ ⨂ ⨄ ⨆$ 

**Binary Operators**

|||||
|-------------|-------------------|-------------------|--------------------|
| $+$ `+`         | $\cdot$ `\cdot`           | $\gtrdot$ `\gtrdot`         | $x \pmod a$ `x \pmod a`            |
| $-$ `-`         | $\cdotp$ `\cdotp`          | $\intercal$ `\intercal`       | $x \pod a$ `x \pod a`             |
| $/$ `/`         | $\centerdot$ `\centerdot`      | $\land$ `\land`           | $\rhd$ `\rhd`             |
| $*$ `*`         | $\circ$ `\circ`           | $\leftthreetimes$ `\leftthreetimes` | $\rightthreetimes$ `\rightthreetimes` |
| $\amalg$ `\amalg`    | $\circledast$ `\circledast`     | $\ldotp$ `\ldotp`          | $\rtimes$ `\rtimes`          |
| $\And$ `\And`      | $\circledcirc$ `\circledcirc`    | $\lor$ `\lor`            | $\setminus$ `\setminus`        |
| $\ast$ `\ast`      | $\circleddash$ `\circleddash`    | $\lessdot$ `\lessdot`        | $\smallsetminus$ `\smallsetminus`   |
| $\barwedge$ `\barwedge` | $\Cup$ `\Cup`            | $\lhd$ `\lhd`            | $\sqcap$ `\sqcap`           |
| $\bigcirc$ `\bigcirc`  | $\cup$ `\cup`            | $\ltimes$ `\ltimes`         | $\sqcup$ `\sqcup`           |
| $\bmod$ `\bmod`     | $\curlyvee$ `\curlyvee`       | $x \mod a$ `x\mod a`            | $\times$ `\times`           |
| $\boxdot$ `\boxdot`   | $\curlywedge$ `\curlywedge`     | $\mp$ `\mp`             | $\unlhd$ `\unlhd`           |
| $\boxminus$ `\boxminus` | $\div$ `\div`            | $\odot$ `\odot`           | $\unrhd$ `\unrhd`           |
| $\boxplus$ `\boxplus`  | $\divideontimes$ `\divideontimes`  | $\ominus$ `\ominus`         | $\uplus$ `\uplus`           |
| $\boxtimes$ `\boxtimes` | $\dotplus$ `\dotplus`        | $\oplus$ `\oplus`          | $\vee$ `\vee`             |
| $\bullet$ `\bullet`   | $\doublebarwedge$ `\doublebarwedge` | $\otimes$ `\otimes`         | $\veebar$ `\veebar`          |
| $\Cap$ `\Cap`      | $\doublecap$ `\doublecap`      | $\oslash$ `\oslash`         | $\wedge$ `\wedge`           |
| $\cap$ `\cap`      | $\doublecup$ `\doublecup`      | $\pm$ `\pm`             | $\wr$ `\wr`              |

Direct Input: $+ - / * ⋅ ± × ÷ ∓ ∔ ∧ ∨ ∩ ∪ ≀ ⊎ ⊓ ⊔ ⊕ ⊖ ⊗ ⊘ ⊙ ⊚ ⊛ ⊝$

**Binomial Coefficients**

|||
|:------------------------------|:-----
|$\binom{n}{k}$ `\binom{n}{k}`  |$\dbinom{n}{k}$ `\dbinom{n}{k}`
|${n}\choose{k}$ `{n}\choose{k}`|$\tbinom{n}{k}$ `\tbinom{n}{k}`


`\atop` is also useful

**Fractions**

||||
|:--------------------------|:----------------------------|:-----
|$\frac{a}{b}$ `\frac{a}{b}`|$\tfrac{a}{b}$ `\tfrac{a}{b}`|${a}/{b}$ `{a}/{b}`
|${a}\over{b}$ `{a}\over{b}`|$\dfrac{a}{b}$ `\dfrac{a}{b}`|$\cfrac{a}{1 + \cfrac{1}{b}}$ `\cfrac{a}{1 + \cfrac{1}{b}}`


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
| $\cot$ `\cot`    | $\lg$ `\lg`   | $\operatorname{f}$ `\operatorname{f}` |           |

Functions on the right column of this table can take `\limits`.

**sqrt**

$\sqrt{x}$ `\sqrt{x}`
$\sqrt[3]{x}$ `\sqrt[3]{x}`

## Relations

$\stackrel{!}{=}$ `\stackrel{!}{=}`

|||||
|:----------------------------|:--------------------------------|:--------------------------------|:-----
|$=$ `=`                      |$\eqcirc$ `\eqcirc`              |$\lesseqgtr$ `\lesseqgtr`        |$\sqsupset$ `\sqsupset`
|$<$ `<`                      |$\eqcolon$ `\eqcolon`            |$\lesseqqgtr$ `\lesseqqgtr`      |$\sqsupseteq$ `\sqsupseteq`
|$>$ `>`                      |$\Eqcolon$ `\Eqcolon`            |$\lessgtr$ `\lessgtr`            |$\Subset$ `\Subset`
|$:$ `:`                      |$\eqqcolon$ `\eqqcolon`          |$\lesssim$ `\lesssim`            |$\subset$ `\subset`
|$\approx$ `\approx`          |$\Eqqcolon$ `\Eqqcolon`          |$\ll$ `\ll`                      |$\subseteq$ `\subseteq`
|$\approxeq$ `\approxeq`      |$\eqsim$ `\eqsim`                |$\lll$ `\lll`                    |$\subseteqq$ `\subseteqq`
|$\asymp$ `\asymp`            |$\eqslantgtr$ `\eqslantgtr`      |$\llless$ `\llless`              |$\succ$ `\succ`
|$\backepsilon$ `\backepsilon`|$\eqslantless$ `\eqslantless`    |$\lt$ `\lt`                      |$\succapprox$ `\succapprox`
|$\backsim$ `\backsim`        |$\equiv$ `\equiv`                |$\mid$ `\mid`                    |$\succcurlyeq$ `\succcurlyeq`
|$\backsimeq$ `\backsimeq`    |$\fallingdotseq$ `\fallingdotseq`|$\models$ `\models`              |$\succeq$ `\succeq`
|$\between$ `\between`        |$\frown$ `\frown`                |$\multimap$ `\multimap`          |$\succsim$ `\succsim`
|$\bowtie$ `\bowtie`          |$\ge$ `\ge`                      |$\owns$ `\owns`                  |$\Supset$ `\Supset`
|$\bumpeq$ `\bumpeq`          |$\geq$ `\geq`                    |$\parallel$ `\parallel`          |$\supset$ `\supset`
|$\Bumpeq$ `\Bumpeq`          |$\geqq$ `\geqq`                  |$\perp$ `\perp`                  |$\supseteq$ `\supseteq`
|$\circeq$ `\circeq`          |$\geqslant$ `\geqslant`          |$\pitchfork$ `\pitchfork`        |$\supseteqq$ `\supseteqq`
|$\colonapprox$ `\colonapprox`|$\gg$ `\gg`                      |$\prec$ `\prec`                  |$\thickapprox$ `\thickapprox`
|$\Colonapprox$ `\Colonapprox`|$\ggg$ `\ggg`                    |$\precapprox$ `\precapprox`      |$\thicksim$ `\thicksim`
|$\coloneq$ `\coloneq`        |$\gggtr$ `\gggtr`                |$\preccurlyeq$ `\preccurlyeq`    |$\trianglelefteq$ `\trianglelefteq`
|$\Coloneq$ `\Coloneq`        |$\gt$ `\gt`                      |$\preceq$ `\preceq`              |$\triangleq$ `\triangleq`
|$\coloneqq$ `\coloneqq`      |$\gtrapprox$ `\gtrapprox`        |$\precsim$ `\precsim`            |$\trianglerighteq$ `\trianglerighteq`
|$\Coloneqq$ `\Coloneqq`      |$\gtreqless$ `\gtreqless`        |$\propto$ `\propto`              |$\varpropto$ `\varpropto`
|$\colonsim$ `\colonsim`      |$\gtreqqless$ `\gtreqqless`      |$\risingdotseq$ `\risingdotseq`  |$\vartriangle$ `\vartriangle`
|$\Colonsim$ `\Colonsim`      |$\gtrless$ `\gtrless`            |$\shortmid$ `\shortmid`          |$\vartriangleleft$ `\vartriangleleft`
|$\cong$ `\cong`              |$\gtrsim$ `\gtrsim`              |$\shortparallel$ `\shortparallel`|$\vartriangleright$ `\vartriangleright`
|$\curlyeqprec$ `\curlyeqprec`|$\in$ `\in`                      |$\sim$ `\sim`                    |$\vcentcolon$ `\vcentcolon`
|$\curlyeqsucc$ `\curlyeqsucc`|$\Join$ `\Join`                  |$\simeq$ `\simeq`                |$\vdash$ `\vdash`
|$\dashv$ `\dashv`            |$\le$ `\le`                      |$\smallfrown$ `\smallfrown`      |$\vDash$ `\vDash`
|$\dblcolon$ `\dblcolon`      |$\leq$ `\leq`                    |$\smallsmile$ `\smallsmile`      |$\Vdash$ `\Vdash`
|$\doteq$ `\doteq`            |$\leqq$ `\leqq`                  |$\smile$ `\smile`                |$\Vvdash$ `\Vvdash`
|$\Doteq$ `\Doteq`            |$\leqslant$ `\leqslant`          |$\sqsubset$ `\sqsubset`          |
|$\doteqdot$ `\doteqdot`      |$\lessapprox$ `\lessapprox`      |$\sqsubseteq$ `\sqsubseteq`      |


Direct Input: $= \< > : ∈ ∋ ∝ ∼ ∽ ≂ ≃ ≅ ≈ ≊ ≍ ≎ ≏ ≐ ≑ ≒ ≓ ≖ ≗ ≜ ≡ ≤ ≥ ≦ ≧$<br>
$≫ ≬ ≳ ≷ ≺ ≻ ≼ ≽ ≾ ≿ ⊂ ⊃ ⊆ ⊇ ⊏ ⊐ ⊑ ⊒ ⊢ ⊣ ⊩ ⊪ ⊸ ⋈ ⋍ ⋐ ⋑ ⋔ ⋙ ⋛ ⋞ ⋟ ⌢ ⌣$ <br>
$⩾ ⪆ ⪌ ⪕ ⪖ ⪯ ⪰ ⪷ ⪸ ⫅ ⫆ ≲ ⩽ ⪅ ≶ ⋚ ⪋ ⟂ ⊨ ≔ ≕ ⩴$

**Negated Relations**

$\not =$ `\not =`

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

Direct Input: $∉ ∌ ∤ ∦ ≁ ≆ ≠ ≨ ≩ ≮ ≯ ≰ ≱ ⊀ ⊁ ⊈ ⊉ ⊊ ⊋ ⊬ ⊭ ⊮ ⊯ ⋠ ⋡$<br>
$⋦ ⋧ ⋨ ⋩ ⋬ ⋭ ⪇ ⪈ ⪉ ⪊ ⪵ ⪶ ⪹ ⪺ ⫋ ⫌$

## Arrows

||||
|:--------------------------------------|:--------------------------------------------|:-----
|$\circlearrowleft$ `\circlearrowleft`  |$\Leftrightarrow$ `\Leftrightarrow`          |$\rightarrow$ `\rightarrow`
|$\circlearrowright$ `\circlearrowright`|$\leftrightarrows$ `\leftrightarrows`        |$\Rightarrow$ `\Rightarrow`
|$\curvearrowleft$ `\curvearrowleft`    |$\leftrightharpoons$ `\leftrightharpoons`    |$\rightarrowtail$ `\rightarrowtail`
|$\curvearrowright$ `\curvearrowright`  |$\leftrightsquigarrow$ `\leftrightsquigarrow`|$\rightharpoondown$ `\rightharpoondown`
|$\dashleftarrow$ `\dashleftarrow`      |$\Lleftarrow$ `\Lleftarrow`                  |$\rightharpoonup$ `\rightharpoonup`
|$\dashrightarrow$ `\dashrightarrow`    |$\longleftarrow$ `\longleftarrow`            |$\rightleftarrows$ `\rightleftarrows`
|$\downarrow$ `\downarrow`              |$\Longleftarrow$ `\Longleftarrow`            |$\rightleftharpoons$ `\rightleftharpoons`
|$\Downarrow$ `\Downarrow`              |$\longleftrightarrow$ `\longleftrightarrow`  |$\rightrightarrows$ `\rightrightarrows`
|$\downdownarrows$ `\downdownarrows`    |$\Longleftrightarrow$ `\Longleftrightarrow`  |$\rightsquigarrow$ `\rightsquigarrow`
|$\downharpoonleft$ `\downharpoonleft`  |$\longmapsto$ `\longmapsto`                  |$\Rrightarrow$ `\Rrightarrow`
|$\downharpoonright$ `\downharpoonright`|$\longrightarrow$ `\longrightarrow`          |$\Rsh$ `\Rsh`
|$\gets$ `\gets`                        |$\Longrightarrow$ `\Longrightarrow`          |$\searrow$ `\searrow`
|$\hookleftarrow$ `\hookleftarrow`      |$\looparrowleft$ `\looparrowleft`            |$\swarrow$ `\swarrow`
|$\hookrightarrow$ `\hookrightarrow`    |$\looparrowright$ `\looparrowright`          |$\to$ `\to`
|$\iff$ `\iff`                          |$\Lsh$ `\Lsh`                                |$\twoheadleftarrow$ `\twoheadleftarrow`
|$\impliedby$ `\impliedby`              |$\mapsto$ `\mapsto`                          |$\twoheadrightarrow$ `\twoheadrightarrow`
|$\implies$ `\implies`                  |$\nearrow$ `\nearrow`                        |$\uparrow$ `\uparrow`
|$\leadsto$ `\leadsto`                  |$\nleftarrow$ `\nleftarrow`                  |$\Uparrow$ `\Uparrow`
|$\leftarrow$ `\leftarrow`              |$\nLeftarrow$ `\nLeftarrow`                  |$\updownarrow$ `\updownarrow`
|$\Leftarrow$ `\Leftarrow`              |$\nleftrightarrow$ `\nleftrightarrow`        |$\Updownarrow$ `\Updownarrow`
|$\leftarrowtail$ `\leftarrowtail`      |$\nLeftrightarrow$ `\nLeftrightarrow`        |$\upharpoonleft$ `\upharpoonleft`
|$\leftharpoondown$ `\leftharpoondown`  |$\nrightarrow$ `\nrightarrow`                |$\upharpoonright$ `\upharpoonright`
|$\leftharpoonup$ `\leftharpoonup`      |$\nRightarrow$ `\nRightarrow`                |$\upuparrows$ `\upuparrows`
|$\leftleftarrows$ `\leftleftarrows`    |$\nwarrow$ `\nwarrow`                        |
|$\leftrightarrow$ `\leftrightarrow`    |$\restriction$ `\restriction`                |


Direct Input∷ $← ↑ → ↓ ↔ ↕ ↖ ↗ ↘ ↙ ↚ ↛ ↞ ↠ ↢ ↣ ↦ ↩ ↪ ↫ ↬ ↭ ↮ ↰ ↱ ↶ ↷ ↺ ↻ ↼ ↽$  ↽`<br>
$↾ ↾ ↿ ⇀ ⇁ ⇂ ⇃ ⇄ ⇆ ⇇ ⇈ ⇉ ⇊ ⇋ ⇌ ⇍ ⇎ ⇏ ⇐ ⇑ ⇒ ⇓ ⇔ ⇕ ⇚ ⇛ ⇝ ⇠ ⇢ ⟵ ⟶ ⟷ ⟸ ⟹ ⟺ ⟼$

**Extensible Arrows**

||||
|:------------------------------------------------------|:----------------------------------------------|:-----
|$\xrightarrow{over}$ `\xrightarrow{over}`              |$\xRightarrow{abc}$ `\xRightarrow{abc}`        |$\xrightharpoonup{abc}$ `\xrightharpoonup{abc}`
|$\xrightarrow[under]{over}$ `\xrightarrow[under]{over}`|$\xmapsto{abc}$ `\xmapsto{abc}`                |$\xrightharpoondown{abc}$ `\xrightharpoondown{abc}`
|$\xleftarrow{abc}$ `\xleftarrow{abc}`                  |$\xLeftarrow{abc}$ `\xLeftarrow{abc}`          |$\xleftharpoonup{abc}$ `\xleftharpoonup{abc}`
|$\xleftrightarrow{abc}$ `\xleftrightarrow{abc}`        |$\xLeftrightarrow{abc}$ `\xLeftrightarrow{abc}`|$\xleftharpoondown{abc}$ `\xleftharpoondown{abc}`
|$\xhookleftarrow{abc}$ `\xhookleftarrow{abc}`          |$\xhookrightarrow{abc}$ `\xhookrightarrow{abc}`|$\xrightleftharpoons{abc}$ `\xrightleftharpoons{abc}`
|$\xtwoheadrightarrow{abc}$ `\xtwoheadrightarrow{abc}`  |$\xlongequal{abc}$ `\xlongequal{abc}`          |$\xleftrightharpoons{abc}$ `\xleftrightharpoons{abc}`
|$\xtwoheadleftarrow{abc}$ `\xtwoheadleftarrow{abc}`    |$\xtofrom{abc}$ `\xtofrom{abc}`                |


Extensible arrows all can take an optional argument in the same manner as `\xrightarrow[under]{over}`.

## Style and Font

**Class Assignment**

`\mathbin` `\mathclose` `\mathinner` `\mathop`<br>
`\mathopen` `\mathord` `\mathpunct` `\mathrel`

**Color**

$\color{blue} F=ma$  `\color{blue} F=ma`

Note that KaTeX color acts like a switch. This aligns with LaTeX and differs from MathJax.

Other KaTeX color functions expect the content to be a function argument:

$\textcolor{blue}{F=ma}$ `\textcolor{blue}{F=ma}`<br>
$\textcolor{#228B22}{F=ma}$ `\textcolor{#228B22}{F=ma}`<br>
$\colorbox{aqua}{A}$ `\colorbox{aqua}{A}`<br>
$\fcolorbox{red}{aqua}{A}$ `\fcolorbox{red}{aqua}{A}`

For color definition, KaTeX color functions will accept the standard HTML [predefined color names](https://www.w3schools.com/colors/colors-names.asp). They will also accept an RGB argument in CSS hexa­decimal style.

**Font**

||||
|:----------------------------------|:----------------------------------|:-----
|$\mathrm{AB}$ `\mathrm{AB}`        |$\mathbf{AB}$ `\mathbf{AB}`        |$\mathit{AB}$ `\mathit{AB}`
|$\textrm{AB}$ `\textrm{AB}`        |$\textbf{AB}$ `\textbf{AB}`        |$\textit{AB}$ `\textit{AB}`
|$\rm AB$ `\rm AB`                  |$\bf AB$ `\bf AB`                  |$\it AB$ `\it AB`
|$\textnormal{AB}$ `\textnormal{AB}`|$\bold{AB}$ `\bold{AB}`            |$\Bbb{AB}$ `\Bbb{AB}`
|$\text{AB}$ `\text{AB}`            |$\boldsymbol{AB}$ `\boldsymbol{AB}`|$\mathbb{AB}$ `\mathbb{AB}`
|$\mathsf{AB}$ `\mathsf{AB}`        |$\bm{AB}$ `\bm{AB}`                |$\frak{AB}$ `\frak{AB}`
|$\textsf{AB}$ `\textsf{AB}`        |$\mathtt{AB}$ `\mathtt{AB}`        |$\mathfrak{AB}$ `\mathfrak{AB}`
|$\sf AB$ `\sf AB`                  |$\texttt{AB}$ `\texttt{AB}`        |$\mathcal{AB}$ `\mathcal{AB}`
|                                   |$\tt AB$ `\tt AB`                  |$\mathscr{AB}$ `\mathscr{AB}`

One can stack font family, font weight, and font shape by using the `\textXX` versions of the font functions. So `\textsf{\textbf{H}}` will produce $\textsf{\textbf{H}}$. The other versions do not stack, e.g., `\mathsf{\mathbf{H}}` will produce $\mathsf{\mathbf{H}}$.

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
|:-------------------------------------------------------|:-----------
|$\displaystyle\sum_{i=1}^n$ `\displaystyle\sum_{i=1}^n` | 
|$\textstyle\sum_{i=1}^n$ `\textstyle\sum_{i=1}^n`       |
|$\scriptstyle x$ `\scriptstyle x`                       | The size of a first sub/superscript
|$\scriptscriptstyle x$ `\scriptscriptstyle x`           | The size of subsequent sub/superscripts
|$\lim\limits_x$ `\lim\limits_x`                         |
|$\lim\nolimits_x$ `\lim\nolimits_x`                     |
|$\verb!x^2!$ `\verb!x^2!`                               |

`\text{…}` will accept nested `\$…\$` fragments and render them in math mode.

## Symbols

||||
|:------------------------------------------------------|:--------------------------------------------|:-----
|$% comment$ `% comment`                                |$\dots$ `\dots`                              |$\nabla$ `\nabla`
|$\%$ `\%`                                              |$\cdots$ `\cdots`                            |$\infty$ `\infty`
|$\#$ `\#`                                              |$\ddots$ `\ddots`                            |$\checkmark$ `\checkmark`
|$\&$ `\&`                                              |$\ldots$ `\ldots`                            |$\dag$ `\dag`
|$\_$ `\_`                                              |$\vdots$ `\vdots`                            |$\dagger$ `\dagger`
|$\text{\textunderscore}$ `\text{\textunderscore}`      |$\mathellipsis$ `\mathellipsis`              |$\text{\textdagger}$ `\text{\textdagger}`
|$\text{--}$ `\text{--}`                                |$\text{\textellipsis}$ `\text{\textellipsis}`|$\ddag$ `\ddag`
|$\text{\textendash}$ `\text{\textendash}`              |$\Box$ `\Box`                                |$\ddagger$ `\ddagger`
|$\text{---}$ `\text{---}`                              |$\square$ `\square`                          |$\text{\textdaggerdbl}$ `\text{\textdaggerdbl}`
|$\text{\textemdash}$ `\text{\textemdash}`              |$\blacksquare$ `\blacksquare`                |$\angle$ `\angle`
|$\text{\textasciitilde}$ `\text{\textasciitilde}`      |$\triangle$ `\triangle`                      |$\measuredangle$ `\measuredangle`
|$`$ ```                                                |$\triangledown$ `\triangledown`              |$\sphericalangle$ `\sphericalangle`
|$\text{\textquoteleft}$ `\text{\textquoteleft}`        |$\triangleleft$ `\triangleleft`              |$\top$ `\top`
|$\lq$ `\lq`                                            |$\triangleright$ `\triangleright`            |$\bot$ `\bot`
|$\text{\textquoteright}$ `\text{\textquoteright}`      |$\bigtriangledown$ `\bigtriangledown`        |$\$$ `\$`
|$\rq$ `\rq`                                            |$\bigtriangleup$ `\bigtriangleup`            |$\text{\textdollar}$ `\text{\textdollar}`
|$\text{\textquotedblleft}$ `\text{\textquotedblleft}`  |$\blacktriangle$ `\blacktriangle`            |$\pounds$ `\pounds`
|$"$ `"`                                                |$\blacktriangledown$ `\blacktriangledown`    |$\text{\textsterling}$ `\text{\textsterling}`
|$\text{\textquotedblright}$ `\text{\textquotedblright}`|$\blacktriangleleft$ `\blacktriangleleft`    |$\yen$ `\yen`
|$\colon$ `\colon`                                      |$\blacktriangleright$ `\blacktriangleright`  |$\surd$ `\surd`
|$\backprime$ `\backprime`                              |$\diamond$ `\diamond`                        |$\degree$ `\degree`
|$\prime$ `\prime`                                      |$\Diamond$ `\Diamond`                        |$\diagdown$ `\diagdown`
|$\text{\textless}$ `\text{\textless}`                  |$\lozenge$ `\lozenge`                        |$\diagup$ `\diagup`
|$\text{\textgreater}$ `\text{\textgreater}`            |$\blacklozenge$ `\blacklozenge`              |$\flat$ `\flat`
|$\text{\textbar}$ `\text{\textbar}`                    |$\star$ `\star`                              |$\natural$ `\natural`
|$\text{\textbardbl}$ `\text{\textbardbl}`              |$\bigstar$ `\bigstar`                        |$\sharp$ `\sharp`
|$\text{\textbraceleft}$ `\text{\textbraceleft}`        |$\clubsuit$ `\clubsuit`                      |$\copyright$ `\copyright`
|$\text{\textbraceright}$ `\text{\textbraceright}`      |$\diamondsuit$ `\diamondsuit`                |$\circledR$ `\circledR`
|$\text{\P}$ `\text{\P}`                                |$\heartsuit$ `\heartsuit`                    |$\text{\textregistered}$ `\text{\textregistered}`
|$\text{\S}$ `\text{\S}`                                |$\spadesuit$ `\spadesuit`                    |$\circledS$ `\circledS`
|$\maltese$ `\maltese`                                  |$\mho$ `\mho`                                |$\text{\textcircled a}$ `\text{\textcircled a}`

$\KaTeX$ `\KaTeX`  $\LaTeX$ `\LaTeX`   $\TeX$ `\TeX`

Direct Input: $£ ¥ ∇ ∞ · ∠ ∡ ∢ ♠ ♡ ♢ ♣ ♭ ♮ ♯ ✓ …  ⋮  ⋯  ⋱  !$ ‼

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
