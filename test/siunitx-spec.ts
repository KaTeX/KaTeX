/* eslint max-len:0 */

import "../contrib/siunitx/siunitx";
import katexOrig from "../katex";
import {r} from "./helpers";

const katex: any = katexOrig;

describe("siunitx-compatible commands", function() {
    it("should report invalid settings.siunitx brace balance clearly", function() {
        expect(() => katex.renderToString(
            String.raw`\num{1}`,
            {siunitx: "group-separator={,}}"},
        )).toThrow(
            "Invalid `siunitx` option: unbalanced braces in settings.siunitx.",
        );
    });

    it("should allow escaped braces in settings.siunitx values", function() {
        expect(() => katex.renderToString(
            String.raw`\num{12345}`,
            {siunitx: String.raw`group-separator={\}},group-minimum-digits=4`},
        )).not.toThrow();
    });

    it("should strip injected \\sisetup node from parse tree", function() {
        const tree = katex.__parse(
            String.raw`\num{12345}`,
            {siunitx: "group-separator={,},group-minimum-digits=4"},
        );
        expect(tree.length).toBeGreaterThan(0);
        expect(tree[0].type).toBe("siunitx");
        expect(tree[0].command).toBe("\\num");
    });

    it("should keep parse tree when injected \\sisetup is macro-overridden", function() {
        const tree = katex.__parse(
            String.raw`x`,
            {
                siunitx: "group-separator={,}",
                macros: {"\\sisetup": "#1"},
            },
        );
        expect(tree.length).toBeGreaterThan(0);
        expect(tree[0].type).not.toBe("siunitx");
    });

    it("should parse basic siunitx commands", function() {
        expect`\num{12345}`.toParse();
        expect`\numlist{1;2;3}`.toParse();
        expect`\numproduct{2;3;4}`.toParse();
        expect`\duration{8.56}`.toParse();
        expect`\complexnum{1+i}`.toParse();
        expect`\si{\km\per\s}`.toParse();
        expect`\unit{\km\per\s}`.toParse();
        expect`\SI{12.3}{\m}`.toParse();
        expect`\qty{4.5}{\kg}`.toParse();
        expect`\complexqty{1+i}{\ohm}`.toParse();
        expect`\qtylist{1;2;3}{\m}`.toParse();
        expect`\qtyproduct{2;3;4}{\m}`.toParse();
        expect`\ang{12;34;56}`.toParse();
        expect`\numrange{1}{10}`.toParse();
        expect`\SIrange{1}{10}{\m}`.toParse();
        expect`\qtyrange{2}{8}{\s}`.toParse();
        expect`\DeclareSIUnit[quantity-product={}]{\degree}{\text{\textdegree}}`.toParse();
        expect`\DeclareSIPrefix\kilo{k}{3}`.toParse();
        expect`\DeclareSIPower\quartic\tothefourth{4}`.toParse();
        expect`\DeclareSIQualifier\polymer{pol}`.toParse();
    });

    it("should build basic siunitx commands", function() {
        expect`\num{12345}`.toBuild();
        expect`\numlist{1;2;3}`.toBuild();
        expect`\numproduct{2;3;4}`.toBuild();
        expect`\duration{8;33;36}`.toBuild();
        expect`\complexnum{1+i}`.toBuild();
        expect`\si{\km\per\s}`.toBuild();
        expect`\unit{\km\per\s}`.toBuild();
        expect`\SI{12.3}{\m}`.toBuild();
        expect`\qty{4.5}{\kg}`.toBuild();
        expect`\complexqty{1+i}{\ohm}`.toBuild();
        expect`\qtylist{1;2;3}{\m}`.toBuild();
        expect`\qtyproduct{2;3;4}{\m}`.toBuild();
        expect`\ang{12;34;56}`.toBuild();
        expect`\numrange{1}{10}`.toBuild();
        expect`\SIrange{1}{10}{\m}`.toBuild();
        expect`\qtyrange{2}{8}{\s}`.toBuild();
        expect`\DeclareSIUnit[quantity-product={}]{\degree}{\text{\textdegree}}`.toBuild();
        expect`\DeclareSIPrefix\kilo{k}{3}`.toBuild();
        expect`\DeclareSIPower\quartic\tothefourth{4}`.toBuild();
        expect`\DeclareSIQualifier\polymer{pol}`.toBuild();
    });

    it("should support optional siunitx command options", function() {
        expect`\num[group-separator={,},group-minimum-digits=4]{12345}`.toParse();
        expect`\num[retain-explicit-decimal-marker]{10.}`.toParse();
        expect`\num[input-digits={0123456789\pi}]{4\pi e-7}`.toParse();
        expect`\num[exponent-mode=scientific]{1200}`.toParse();
        expect`\num[exponent-mode=fixed,fixed-exponent=2]{1200}`.toParse();
        expect`\qty[evaluate-expression]{2 + 4 * 3}{\joule}`.toParse();
        expect`\qty[evaluate-expression,expression={10 * (#1)}]{2 + 4 * 3}{\joule}`.toParse();
        expect`\num[retain-zero-uncertainty]{12.3(0)}`.toParse();
        expect`\num[retain-negative-zero]{-0}`.toParse();
        expect`\si[per-mode=reciprocal]{\m\per\s}`.toParse();
        expect`\si[per-mode=power]{\m\per\s}`.toParse();
        expect`\si[per-mode=power-positive-first]{\ampere\per\mole\second}`.toParse();
        expect`\si[per-mode=repeated-symbol]{\joule\per\mole\per\kelvin}`.toParse();
        expect`\si[per-mode=single-symbol]{\metre\per\second}`.toParse();
        expect`\si[display-per-mode=fraction,inline-per-mode=symbol]{\joule\per\mole\per\kelvin}`.toParse();
        expect`\si[per-symbol={\text{ div }},bracket-unit-denominator=false]{\joule\per\mole\per\kelvin}`.toParse();
        expect`\si[sticky-per]{\pascal\per\gray\henry}`.toParse();
        expect`\num[parse-numbers=false]{\sqrt{2}}`.toParse();
        expect`\qty[parse-units=false]{300}{\MHz}`.toParse();
        expect`\unit[forbid-literal-units=true]{\kilogram\of{pol}\per\mole\of{cat}}`.toParse();
        expect`\unit[qualifier-mode=bracket]{\kilogram\of{pol}}`.toParse();
        expect`\unit[power-half-as-sqrt]{\Hz\tothe{0.5}}`.toParse();
        expect`\qty[prefix-mode=combine-exponent]{1e3}{\metre\second}`.toParse();
        expect`\qty[prefix-mode=extract-exponent]{7.5}{\gram}`.toParse();
        expect`\SI[number-unit-separator={~}]{1e3}{\m}`.toParse();
        expect`\numrange[range-phrase={ to }]{1}{5}`.toParse();
        expect`\SIrange[range-phrase={ to }]{1}{5}{\kg}`.toParse();
        expect`\ang[output-decimal-marker={,}]{12,5}`.toParse();
        expect`\ang[angle-mode=arc]{2.67}`.toParse();
        expect`\ang[angle-mode=decimal]{2;3;4}`.toParse();
        expect`\duration[duration-mode=component]{8.56}`.toParse();
    });

    it("should allow \\sisetup before other siunitx commands", function() {
        expect`\sisetup{group-separator={,},group-minimum-digits=4}\num{12345}`.toParse();
        expect`\sisetup{per-mode=reciprocal}\si{\m\per\s}`.toBuild();
    });

    it("should support additional siunitx-style options", function() {
        expect`\num[input-decimal-markers={,.},output-decimal-marker={,}]{12,34}`.toBuild();
        expect`\num[separate-uncertainty=true]{1.23(45)}`.toBuild();
        expect`\num[exponent-product={\cdot}]{1.2e3}`.toBuild();
        expect`\num[exponent-product={\cdot}]{1.2D3}`.toBuild();
        expect`\num[exponent-product={\cdot}]{d-6}`.toBuild();
        expect`\numlist[list-pair-separator={ and },list-final-separator={, and }]{1;2;3}`.toBuild();
        expect`\numproduct[product-symbol={\ensuremath{\cdot}}]{5 x 100 x 2}`.toBuild();
        expect`\numproduct[product-mode=phrase,product-phrase={ by }]{5 x 100 x 2}`.toBuild();
        expect`\duration{8.56}`.toBuild();
        expect`\duration{8;33;36}`.toBuild();
        expect`\duration[duration-mode=component]{8.56}`.toBuild();
        expect`\duration[duration-mode=decimal]{8;33;36}`.toBuild();
        expect`\duration[duration-separator={, }]{6;7;6.5}`.toBuild();
        expect`\duration{1;;}`.toBuild();
        expect`\duration{;2;}`.toBuild();
        expect`\duration{;;3}`.toBuild();
        expect`\sisetup{fill-duration-hours}\duration{;2;}`.toBuild();
        expect`\sisetup{fill-duration-hours}\duration{;;3}`.toBuild();
        expect`\sisetup{fill-duration-minutes}\duration{1;;}`.toBuild();
        expect`\sisetup{fill-duration-minutes}\duration{;;3}`.toBuild();
        expect`\sisetup{fill-duration-seconds}\duration{1;;}`.toBuild();
        expect`\sisetup{fill-duration-seconds}\duration{;2;}`.toBuild();
        expect`\sisetup{duration-unit-hour=d,duration-unit-minute=m,duration-unit-second=s}\duration{1;3;4.5}`.toBuild();
        expect`\complexnum{9.99 + 88.8i}`.toBuild();
        expect`\complexnum{9.99 + i88.8}`.toBuild();
        expect`\complexnum[complex-mode=polar]{1 + i}`.toBuild();
        expect`\complexnum[complex-mode=cartesian,round-mode=places]{1:45}`.toBuild();
        expect`\complexqty[complex-angle-unit=radians]{1:1}{\ohm}`.toBuild();
        expect`\complexqty[complex-symbol-degree=d]{1:1}{\ohm}`.toBuild();
        expect`\complexqty[complex-phase-command=\phase]{1:1}{\ohm}`.toBuild();
        expect`\complexqty[output-complex-root=j]{1+2i}{\ohm}`.toBuild();
        expect`\complexqty[complex-root-position=before-number]{67-0.9i}{\ohm}`.toBuild();
        expect`\complexqty[print-complex-unity]{1i}{\ohm}`.toBuild();
        expect`\ang{2.67}`.toBuild();
        expect`\ang{2;3;4}`.toBuild();
        expect`\ang[angle-mode=arc]{2.67}`.toBuild();
        expect`\ang[angle-mode=arc]{2;3;4}`.toBuild();
        expect`\ang[angle-mode=decimal]{2.67}`.toBuild();
        expect`\ang[angle-mode=decimal]{2;3;4}`.toBuild();
        expect`\ang{-1;;}`.toBuild();
        expect`\ang{;-2;}`.toBuild();
        expect`\ang{;;-3}`.toBuild();
        expect`\sisetup{fill-angle-degrees}\ang{;-2;}`.toBuild();
        expect`\sisetup{fill-angle-degrees}\ang{;;-3}`.toBuild();
        expect`\sisetup{fill-angle-minutes}\ang{-1;;}`.toBuild();
        expect`\sisetup{fill-angle-minutes}\ang{;;-3}`.toBuild();
        expect`\sisetup{fill-angle-seconds}\ang{-1;;}`.toBuild();
        expect`\sisetup{fill-angle-seconds}\ang{;-2;}`.toBuild();
        expect`\qtylist[list-units=repeat]{1;2;3}{\m}`.toBuild();
        expect`\qtyproduct[product-mode=phrase]{5 x 100 x 2}{\m}`.toBuild();
        expect`\qtyproduct[product-units=bracket-power]{2 x 4}{\metre}`.toBuild();
        expect`\qtyproduct[product-units=power]{2 x 4}{\metre}`.toBuild();
        expect`\qtyproduct[product-units=bracket-power]{2 x 4 x 5}{\metre\squared\per\second\newton\cubed}`.toBuild();
        expect`\qtylist{2;4;6;8}{\tesla}`.toBuild();
        expect`\qtylist[list-units=bracket]{2;4;6;8}{\tesla}`.toBuild();
        expect`\qtylist[list-units=single]{2;4;6;8}{\tesla}`.toBuild();
        expect`\qtyrange{2}{4}{\degreeCelsius}`.toBuild();
        expect`\qtyrange[range-units=bracket]{2}{4}{\degreeCelsius}`.toBuild();
        expect`\qtyrange[range-units=single]{2}{4}{\degreeCelsius}`.toBuild();
        expect`\si[multi-part-units=brackets]{\J\per\mol\K}`.toBuild();
        expect`\SIrange[range-units=repeat]{1}{5}{\m}`.toBuild();
        expect`\si[forbid-literal-units=true]{m/s}`.not.toParse();
    });

    it("should render per-mode=symbol using slash notation", function() {
        const markup = katex.renderToString(
            r`\unit[multi-part-units=brackets,per-mode=symbol]{\kJ\per\kg\K}`,
        ).replace(/\u00a0/g, " ");
        expect(markup).toContain("kJ K/kg");
    });

    it("should merge repeated per terms in SI output", function() {
        const markup = katex.renderToString(
            r`\SI[per-mode=symbol]{4180}{\kilo\joule\per\kilogram\per\kelvin}`,
        ).replace(/\u00a0/g, " ");
        expect(markup).toContain("4180 kJ/(kg K)");
    });

    it("should support repeated-symbol and per-symbol options", function() {
        const repeated = katex.renderToString(
            r`\unit[per-mode=repeated-symbol]{\joule\per\mole\per\kelvin}`,
        );
        expect(repeated).toContain("J/mol/K");

        const custom = katex.renderToString(
            r`\unit[per-mode=symbol,per-symbol={\text{ div }},bracket-unit-denominator=false]{\joule\per\mole\per\kelvin}`,
        ).replace(/\u00a0/g, " ");
        expect(custom).toContain("J div mol K");
    });

    it("should support single-symbol and style-specific per-mode", function() {
        const single = katex.renderToString(
            r`\unit[per-mode=single-symbol]{\metre\per\second}`,
        );
        expect(single).toContain("m/s");

        const inline = katex.renderToString(
            r`\unit[display-per-mode=fraction,inline-per-mode=symbol]{\joule\per\mole\per\kelvin}`,
        ).replace(/\u00a0/g, " ");
        expect(inline).toContain("J/(mol K)");

        const display = katex.renderToString(
            r`\unit[display-per-mode=fraction,inline-per-mode=symbol]{\joule\per\mole\per\kelvin}`,
            {displayMode: true},
        );
        expect(display).toContain("<mfrac>");
    });

    it("should render real fractions for qty-like commands", function() {
        const si = katex.renderToString(
            r`\SI[per-mode=fraction]{4180}{\kilo\joule\per\kilogram\per\kelvin}`,
        );
        expect(si).toContain("<mfrac>");
        expect(si).not.toContain("---");

        const qty = katex.renderToString(
            r`\qty[per-mode=fraction]{20}{\joule\per\mole\per\kelvin}`,
        );
        expect(qty).toContain("<mfrac>");
        expect(qty).not.toContain("---");

        const scopedPer = katex.renderToString(
            r`\SI[per-mode=fraction]{4180}{\kilo\joule\per\kilogram\per\kelvin\per\newton\second}`,
        );
        expect(scopedPer).toContain("<mfrac>");
        expect(scopedPer).toContain("kJ s");
        expect(scopedPer).toContain("kg K N");
    });

    it("should avoid dashed fallback in non-fraction-builder paths", function() {
        const list = katex.renderToString(
            r`\qtylist[per-mode=fraction]{2;4;6}{\joule\per\mole\per\kelvin}`,
        );
        expect(list).toContain("<mfrac>");
        expect(list).not.toContain("---");

        const product = katex.renderToString(
            r`\qtyproduct[per-mode=fraction]{2 x 4}{\joule\per\mole\per\kelvin}`,
        );
        expect(product).toContain("<mfrac>");
        expect(product).not.toContain("---");
    });

    it("should keep trailing positive units in numerator for symbol mode", function() {
        const markup = katex.renderToString(
            r`\SI[per-mode=symbol]{4180}{\metre\per\second\per\newton\kelvin}`,
        );
        expect(markup).toContain("4180 m K/(s N)");
    });

    it("should render raw TeX numbers when parse-numbers=false", function() {
        const num = katex.renderToString(
            r`\num[parse-numbers=false]{\sqrt{2}}`,
            {output: "mathml"},
        );
        expect(num).toContain("<msqrt>");
        expect(num).toContain("<mn>2</mn>");

        const qty = katex.renderToString(
            r`\qty[parse-numbers=false]{\sqrt{3}}{\metre}`,
            {output: "mathml"},
        );
        expect(qty).toContain("<msqrt>");
        expect(qty).toContain("<mn>3</mn>");
        expect(qty).toContain("mathvariant=\"normal\">m");
    });

    it("should support explicit marker/sign/zero retention options", function() {
        expect(katex.renderToString(r`\num{10.}`)).toContain(">10<");
        expect(
            katex.renderToString(
                r`\num[retain-explicit-decimal-marker]{10.}`,
            ),
        ).toContain(">10.<");

        expect(katex.renderToString(r`\num{+345}`)).toContain(">345<");
        expect(
            katex.renderToString(r`\num[retain-explicit-plus]{+345}`),
        ).toContain(">+345<");

        expect(katex.renderToString(r`\num{-0}`)).toContain(">0<");
        expect(
            katex.renderToString(r`\num[retain-negative-zero]{-0}`),
        ).toContain(">-0<");

        expect(katex.renderToString(r`\num{12.3(0)}`)).toContain(">12.3<");
        expect(
            katex.renderToString(r`\num[retain-zero-uncertainty]{12.3(0)}`),
        ).toContain(">12.3(0)<");
    });

    it("should support declared SI units, prefixes, powers, and qualifiers", function() {
        const degree = katex.renderToString(
            String.raw`\DeclareSIUnit[quantity-product={}]{\degree}{\text{\textdegree}}\qty{3.1415}{\degree}`,
        );
        expect(degree).toContain("3.1415°");

        const degreeOverride = katex.renderToString(
            String.raw`\DeclareSIUnit[quantity-product={}]{\degree}{\text{\textdegree}}\qty[quantity-product={x}]{67890}{\degree}`,
        );
        expect(degreeOverride).toContain("67");
        expect(degreeOverride).toContain("890x°");

        const prefixed = katex.renderToString(
            String.raw`\DeclareSIPrefix\mykilo{k}{3}\unit{\mykilo\gram}`,
        );
        expect(prefixed).toContain("kg");

        const powers = katex.renderToString(
            String.raw`\DeclareSIPower\quartic\tothefourth{4}\unit{\kilogram\tothefourth}\ \unit{\quartic\metre}`,
            {output: "mathml"},
        );
        expect(powers).toContain("<mn>4</mn>");

        const qualified = katex.renderToString(
            String.raw`\DeclareSIQualifier\polymer{pol}\DeclareSIQualifier\catalyst{cat}\qty{1.234}{\gram\polymer\per\mole\catalyst\per\hour}`,
            {output: "mathml"},
        );
        expect(qualified).toContain("pol");
        expect(qualified).toContain("cat");
    });

    it("should keep declared qualifiers in denominator units", function() {
        const markup = katex.renderToString(
            String.raw`\DeclareSIQualifier\cat{cat}\unit[per-mode=symbol]{\gram\per\mole\cat\per\hour}`,
        );
        expect(markup).toContain("g/(");
        expect(markup).toContain("h)");
        expect(markup).toContain("cat");
        expect(markup).not.toMatch(/g(?:\u00a0| )cat/u);
    });

    it("should allow declared unit literal symbols when literals are forbidden", function() {
        const markup = katex.renderToString(
            String.raw`\sisetup{forbid-literal-units=true}\DeclareSIUnit\foo{f}\unit{\foo}`,
        );
        expect(markup).toContain(">f<");
    });

    it("should parse literal siunitx unit syntax with ., ~, _ and ^", function() {
        const one = katex.renderToString(
            String.raw`\unit{kg.m/s^2}`,
            {output: "mathml"},
        );
        expect(one).toContain("kg");
        expect(one).toContain("m");
        expect(one).toContain("s");
        expect(one).toContain("^");
        expect(one).toContain("<mn>2</mn>");

        const two = katex.renderToString(
            String.raw`\unit{g_{polymer}~mol_{cat}.s^{-1}}`,
            {output: "mathml"},
        );
        expect(two).toContain("polymer");
        expect(two).toContain("cat");
        expect(two).toContain("<msub>");
        expect(two).toContain("−");
        expect(two).not.toContain("nobreakspace");
    });

    it("should evaluate expressions when enabled", function() {
        const direct = katex.renderToString(
            r`\qty[evaluate-expression]{2 + 4 * 3}{\joule}`,
        );
        expect(direct).toContain("14");
        expect(direct).toContain("J");

        const wrapped = katex.renderToString(
            r`\qty[evaluate-expression,expression={10 * (#1)}]{2 + 4 * 3}{\joule}`,
        );
        expect(wrapped).toContain("140");
        expect(wrapped).toContain("J");
    });

    it("should support exponent-mode formatting options", function() {
        const scientific = katex.renderToString(
            r`\num[exponent-mode=scientific]{0.0100}`,
            {output: "mathml"},
        );
        expect(scientific).toContain("<mn>1.00</mn>");
        expect(scientific).toContain("<mn>10</mn>");
        expect(scientific).toContain("−");
        expect(scientific).toContain("<mn>2</mn>");

        const engineering = katex.renderToString(
            r`\num[exponent-mode=engineering]{0.0100}`,
            {output: "mathml"},
        );
        expect(engineering).toContain("<mn>10.0</mn>");
        expect(engineering).toContain("<mn>10</mn>");
        expect(engineering).toContain("−");
        expect(engineering).toContain("<mn>3</mn>");

        const fixed = katex.renderToString(
            r`\num[exponent-mode=fixed,fixed-exponent=2]{1200}`,
            {output: "mathml"},
        );
        expect(fixed).toContain("<mn>12.00</mn>");
        expect(fixed).toContain("<mn>10</mn>");
        expect(fixed).toContain("<mn>2</mn>");

        const removeSci = katex.renderToString(
            r`\num[exponent-mode=fixed,fixed-exponent=0]{1.23e4}`,
            {output: "mathml"},
        );
        expect(removeSci).toContain("<mn>12</mn>");
        expect(removeSci).toContain("<mn>300</mn>");
        expect(removeSci).not.toContain("10");
    });

    it("should support custom input-digits tokens", function() {
        const piDigits = katex.renderToString(
            r`\sisetup{input-digits = 0123456789\pi}\num{4\pi e-7}`,
            {output: "mathml"},
        );
        expect(piDigits).toContain("<mn>4</mn>");
        expect(piDigits).toContain("π");
        expect(piDigits).toContain("<mn>10</mn>");
        expect(piDigits).toContain("−");
        expect(piDigits).toContain("<mn>7</mn>");

        const dotsDigits = katex.renderToString(
            r`\sisetup{input-digits = 0123456789\dots}\qty{0,4066\dots}{\metre\squared}`,
            {output: "mathml"},
        );
        expect(dotsDigits).toContain("<mn>0.406</mn>");
        expect(dotsDigits).toContain("<mn>6</mn>");
        expect(dotsDigits).toContain("…");
        expect(dotsDigits).toContain("mathvariant=\"normal\">m");
        expect(dotsDigits).toContain("<mn>2</mn>");
    });

    it("should render \\of qualifiers as subscripts", function() {
        const qualifier = katex.renderToString(
            r`\unit[per-mode=symbol]{\kilogram\of{pol}\per\mole\of{cat}\per\hour}`,
        );
        expect(qualifier).toContain("<msub>");
        expect(qualifier).toContain("pol");
        expect(qualifier).toContain("cat");
    });

    it("should align power and qualifier on same unit base", function() {
        const qualifierPower = katex.renderToString(
            r`\unit[per-mode=symbol]{\kilogram\of{pol}\squared\per\mole\of{cat}\per\hour}`,
            {output: "mathml"},
        );
        expect(qualifierPower).toContain("<msub>");
        expect(qualifierPower).toContain("mathvariant=\"normal\">k");
        expect(qualifierPower).toContain("mathvariant=\"normal\">g");
        expect(qualifierPower).toContain("pol");
        expect(qualifierPower).toContain("<msubsup>");
        expect(qualifierPower).toContain("<mn>2</mn>");
    });

    it("should support bracket qualifier mode", function() {
        const qualifierBracket = katex.renderToString(
            r`\unit[qualifier-mode=bracket]{\kilogram\of{pol}\mole\of{cat}}`,
        );
        expect(qualifierBracket).toContain("kg(pol)");
        expect(qualifierBracket).toContain("mol(cat)");
    });

    it("should support \\tothe and sqrt-half power option", function() {
        const explicitPower = katex.renderToString(
            r`\unit{\Hz\tothe{0.5}}`,
        );
        expect(explicitPower).toContain("<msup>");
        expect(explicitPower).toContain("0.5");

        const explicitPowerComma = katex.renderToString(
            r`\unit[output-decimal-marker={,}]{\Hz\tothe{0.5}}`,
        );
        expect(explicitPowerComma).toContain("<msup>");
        expect(explicitPowerComma).toContain("0,5");

        const explicitPowerFraction = katex.renderToString(
            r`\unit{\Hz\tothe{1/2}}`,
        );
        expect(explicitPowerFraction).toContain("<msup>");
        expect(explicitPowerFraction).toContain("<mfrac>");

        const sqrtPower = katex.renderToString(
            r`\unit[power-half-as-sqrt]{\Hz\tothe{0.5}}`,
        );
        expect(sqrtPower).toContain("<msqrt>");

        const sqrtPowerComma = katex.renderToString(
            r`\unit[power-half-as-sqrt]{\Hz\tothe{0,5}}`,
        );
        expect(sqrtPowerComma).toContain("<msqrt>");

        const sqrtPowerFraction = katex.renderToString(
            r`\unit[power-half-as-sqrt]{\Hz\tothe{1/2}}`,
        );
        expect(sqrtPowerFraction).toContain("<msqrt>");

        const disabledLocal = katex.renderToString(
            r`\unit[power-half-as-sqrt=false]{\Hz\tothe{0.5}}`,
        );
        expect(disabledLocal).toContain("<msup>");
        expect(disabledLocal).toContain("0.5");
        expect(disabledLocal).not.toContain("<msqrt>");

        const disabledAfterSetup = katex.renderToString(
            r`\sisetup{power-half-as-sqrt}\unit[power-half-as-sqrt=false]{\Hz\tothe{0.5}}`,
        );
        expect(disabledAfterSetup).toContain("<msup>");
        expect(disabledAfterSetup).toContain("0.5");
        expect(disabledAfterSetup).not.toContain("<msqrt>");

        const disabledFraction = katex.renderToString(
            r`\unit[power-half-as-sqrt=false]{\Hz\tothe{1/2}}`,
        );
        expect(disabledFraction).toContain("<msup>");
        expect(disabledFraction).toContain("<mfrac>");
        expect(disabledFraction).not.toContain("<msqrt>");

        const fractionThenQualifier = katex.renderToString(
            r`\unit{\kilogram\tothe{1/2}\of{pol}}`,
        );
        expect(fractionThenQualifier).toContain("<msubsup>");
        expect(fractionThenQualifier).toContain("<mfrac>");
        expect(fractionThenQualifier).not.toContain("__SIQ__");
    });

    it("should support prefix-mode transformations", function() {
        const combine = katex.renderToString(
            r`\qty[prefix-mode=combine-exponent]{1e3}{\metre\second}`,
            {output: "mathml"},
        );
        expect(combine).toContain(
            "mathvariant=\"normal\">k</mi><mi mathvariant=\"normal\">m",
        );
        expect(combine).toContain("s");

        const extractKg = katex.renderToString(
            r`\qty[prefix-mode=extract-exponent]{7.5}{\gram}`,
            {output: "mathml"},
        );
        expect(extractKg).toContain(
            "mathvariant=\"normal\">k</mi><mi mathvariant=\"normal\">g",
        );

        const extractG = katex.renderToString(
            r`\qty[prefix-mode=extract-exponent,extract-mass-in-kilograms=false]{7.5}{\gram}`,
            {output: "mathml"},
        );
        expect(extractG).toContain("<mn>7.5</mn>");
        expect(extractG).toContain("mathvariant=\"normal\">g");
    });

    it("should normalize uncertainty sign input to bracket form", function() {
        const bracket = katex.renderToString(r`\num{9.99(9)}`);
        expect(bracket).toContain("9.99(9)");

        const plusMinus = katex.renderToString(r`\num{9.99 +- 0.09}`);
        expect(plusMinus).toContain("9.99(9)");

        const pmCommand = katex.renderToString(r`\num{9.99 \pm 0.09}`);
        expect(pmCommand).toContain("9.99(9)");

        const integerBase = katex.renderToString(r`\num{123 +- 4.5}`);
        expect(integerBase).toContain("123.0(45)");

        const decimalBase = katex.renderToString(r`\num{12.3 +- 6}`);
        expect(decimalBase).toContain("12.3(60)");
    });

    it("should support asymmetric compact uncertainties", function() {
        const compactInteger = katex.renderToString(
            r`\num{10.56(12:34)}`,
            {output: "mathml"},
        );
        expect(compactInteger).toContain("<msubsup>");
        expect(compactInteger).toContain("<mn>10.56</mn>");
        expect(compactInteger).toContain("<mn>0.12</mn>");
        expect(compactInteger).toContain("<mn>0.34</mn>");

        const compactDecimal = katex.renderToString(
            r`\num{123.4(4.6:7.8)}`,
            {output: "mathml"},
        );
        expect(compactDecimal).toContain("<msubsup>");
        expect(compactDecimal).toContain("<mn>123.4</mn>");
        expect(compactDecimal).toContain("<mn>4.6</mn>");
        expect(compactDecimal).toContain("<mn>7.8</mn>");
    });

    it("should support multiple symmetric and mixed uncertainties", function() {
        const compactByDefault = katex.renderToString(
            r`\num{6.45(2)(3:4)}`,
        );
        expect(compactByDefault).toContain("6.45(2)(3:4)");

        const compactLongDefault = katex.renderToString(
            r`\num{123.4 \pm 1.2 \pm 4.5}`,
        );
        expect(compactLongDefault).toContain("123.4(12)(45)");

        const multipleShort = katex.renderToString(
            r`\num[separate-uncertainty=true]{123.4(12)(45)}`,
            {output: "mathml"},
        );
        expect(multipleShort).toContain("<mn>123.4</mn>");
        expect(multipleShort).toContain("±");
        expect(multipleShort).toContain("<mn>1.2</mn>");
        expect(multipleShort).toContain("<mn>4.5</mn>");

        const multipleLong = katex.renderToString(
            r`\num[separate-uncertainty=true]{123.4 \pm 1.2 \pm 4.5}`,
            {output: "mathml"},
        );
        expect(multipleLong).toContain("<mn>123.4</mn>");
        expect(multipleLong).toContain("±");
        expect(multipleLong).toContain("<mn>1.2</mn>");
        expect(multipleLong).toContain("<mn>4.5</mn>");

        const mixedA = katex.renderToString(
            r`\num[separate-uncertainty=true]{10.56(1:2)(3)}`,
            {output: "mathml"},
        );
        expect(mixedA).toContain("<msubsup>");
        expect(mixedA).toContain("<mn>10.56</mn>");
        expect(mixedA).toContain("<mn>0.01</mn>");
        expect(mixedA).toContain("<mn>0.02</mn>");
        expect(mixedA).toContain("±");
        expect(mixedA).toContain("<mn>0.03</mn>");

        const mixedB = katex.renderToString(
            r`\num[separate-uncertainty=true]{6.45(2)(3:4)}`,
            {output: "mathml"},
        );
        expect(mixedB).toContain("<msubsup>");
        expect(mixedB).toContain("<mn>6.45</mn>");
        expect(mixedB).toContain("<mn>0.03</mn>");
        expect(mixedB).toContain("<mn>0.04</mn>");
        expect(mixedB).toContain("±");
        expect(mixedB).toContain("<mn>0.02</mn>");
        expect(mixedB.indexOf("<mn>0.02</mn>")).toBeLessThan(
            mixedB.indexOf("<mn>0.03</mn>"),
        );
    });
});
