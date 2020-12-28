import buildMathML from "../src/buildMathML";
import parseTree from "../src/parseTree";
import Options from "../src/Options";
import Settings from "../src/Settings";
import Style from "../src/Style";

const getMathML = function(expr, settings = new Settings()) {
    let startStyle = Style.TEXT;
    if (settings.displayMode) {
        startStyle = Style.DISPLAY;
    }

    // Setup the default options
    const options = new Options({
        style: startStyle,
        maxSize: Infinity,
    });

    const built = buildMathML(parseTree(expr, settings), expr, options,
        settings.displayMode);

    // Strip off the surrounding <span>
    return built.children[0].toMarkup();
};

describe("A MathML builder", function() {
    it('should generate the right types of nodes', () => {
        expect(getMathML("\\sin{x}+1\\;\\text{a}")).toMatchSnapshot();
    });

    it('should concatenate digits into single <mn>', () => {
        expect(getMathML("\\sin{\\alpha}=0.34")).toMatchSnapshot();
    });

    it('should make prime operators into <mo> nodes', () => {
        expect(getMathML("f'")).toMatchSnapshot();
    });

    it('should generate <mphantom> nodes for \\phantom', () => {
        expect(getMathML("\\phantom{x}")).toMatchSnapshot();
    });

    it('should use <munderover> for large operators', () => {
        expect(getMathML("\\displaystyle\\sum_a^b")).toMatchSnapshot();
    });

    it('should use <msupsub> for integrals', () => {
        expect(getMathML("\\displaystyle\\int_a^b + " +
            "\\oiint_a^b + \\oiiint_a^b")).toMatchSnapshot();
    });

    it('should use <msupsub> for regular operators', () => {
        expect(getMathML("\\textstyle\\sum_a^b")).toMatchSnapshot();
    });

    it("should output \\limsup_{x \\rightarrow \\infty} correctly in " +
            "\\textstyle", () => {
        const mathml = getMathML("\\limsup_{x \\rightarrow \\infty}");
        expect(mathml).toMatchSnapshot();
    });

    it("should output \\limsup_{x \\rightarrow \\infty} in " +
            "displaymode correctly", () => {
        const settings = new Settings({displayMode: true});
        const mathml = getMathML("\\limsup_{x \\rightarrow \\infty}", settings);
        expect(mathml).toMatchSnapshot();
    });

    it('should use <mpadded> for raisebox', () => {
        expect(getMathML("\\raisebox{0.25em}{b}")).toMatchSnapshot();
    });

    it('should size delimiters correctly', () => {
        expect(getMathML("(M) \\big(M\\big) \\Big(M\\Big) \\bigg(M\\bigg)" +
        " \\Bigg(M\\Bigg)")).toMatchSnapshot();
    });

    it('should use <menclose> for colorbox', () => {
        expect(getMathML("\\colorbox{red}{b}")).toMatchSnapshot();
    });

    it('should build the CD environment properly', () => {
        const displaySettings = new Settings({displayMode: true, strict: false});
        const mathml = getMathML("\\begin{CD} A @>a>> B\\\\ @VVbV @VVcV\\\\" +
            " C @>d>> D \\end{CD}", displaySettings);
        expect(mathml).toMatchSnapshot();
    });

    it('should set href attribute for href appropriately', () => {
        expect(
            getMathML("\\href{http://example.org}{\\alpha}", new Settings({trust: true})),
        ).toMatchSnapshot();
        expect(getMathML("p \\Vdash \\beta \\href{http://example.org}{+ \\alpha} \\times \\gamma"));
    });

    it('should render mathchoice as if there was nothing', () => {
        const cmd = "\\sum_{k = 0}^{\\infty} x^k";
        expect(getMathML(`\\displaystyle\\mathchoice{${cmd}}{T}{S}{SS}`))
            .toMatchSnapshot();
        expect(getMathML(`\\mathchoice{D}{${cmd}}{S}{SS}`))
            .toMatchSnapshot();
        expect(getMathML(`x_{\\mathchoice{D}{T}{${cmd}}{SS}}`))
            .toMatchSnapshot();
        expect(getMathML(`x_{y_{\\mathchoice{D}{T}{S}{${cmd}}}}`))
            .toMatchSnapshot();
    });

    it("should render boldsymbol with the correct mathvariants", () => {
        expect(getMathML(`\\boldsymbol{Ax2k\\omega\\Omega\\imath+}`))
            .toMatchSnapshot();
    });

    it('accents turn into <mover accent="true"> in MathML', () => {
        expect(getMathML("über fiancée", {unicodeTextInMathMode: true}))
            .toMatchSnapshot();
    });

    it('tags use <mlabeledtr>', () => {
        expect(getMathML("\\tag{hi} x+y^2", {displayMode: true}))
            .toMatchSnapshot();
    });

    it('normal spaces render normally', function() {
        expect(getMathML("\\kern1em\\kern1ex")).toMatchSnapshot();
    });
    it('special spaces render specially', function() {
        expect(getMathML(
            "\\,\\thinspace\\:\\>\\medspace\\;\\thickspace" +
            "\\!\\negthinspace\\negmedspace\\negthickspace" +
            "\\mkern1mu\\mkern3mu\\mkern4mu\\mkern5mu" +
            "\\mkern-1mu\\mkern-3mu\\mkern-4mu\\mkern-5mu")).toMatchSnapshot();
    });

    it('ligatures render properly', () => {
        expect(getMathML("\\text{```Hi----'''}--" +
                         "\\texttt{```Hi----'''}" +
                         "\\text{\\tt ```Hi----'''}")).toMatchSnapshot();
    });

    it('\\text fonts become mathvariant', () => {
        expect(getMathML("\\text{" +
            "roman\\textit{italic\\textbf{bold italic}}\\textbf{bold}" +
            "\\textsf{ss\\textit{italic\\textbf{bold italic}}\\textbf{bold}}" +
            "\\texttt{tt\\textit{italic\\textbf{bold italic}}\\textbf{bold}}}"))
            .toMatchSnapshot();
    });

    it('\\html@mathml makes clean symbols', () => {
        expect(getMathML("\\copyright\\neq\\notin\u2258\\KaTeX"))
            .toMatchSnapshot();
    });
});
