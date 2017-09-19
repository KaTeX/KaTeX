/* global expect: false */
/* global it: false */
/* global describe: false */

import buildMathML from "../src/buildMathML";
import parseTree from "../src/parseTree";
import Options from "../src/Options";
import Settings from "../src/Settings";
import Style from "../src/Style";

const defaultSettings = new Settings({});

const getMathML = function(expr, settings) {
    const usedSettings = settings ? settings : defaultSettings;

    let startStyle = Style.TEXT;
    if (usedSettings.displayMode) {
        startStyle = Style.DISPLAY;
    }

    // Setup the default options
    const options = new Options({
        style: startStyle,
        maxSize: Infinity,
    });

    const built = buildMathML(parseTree(expr, usedSettings), expr, options);

    // Strip off the surrounding <span>
    return built.children[0].toMarkup();
};

describe("A MathML builder", function() {
    it('should generate the right types of nodes', () => {
        expect(getMathML("\\sin{x}+1\\;\\text{a}")).toMatchSnapshot();
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

    it('should use <msupsub> for regular operators', () => {
        expect(getMathML("\\textstyle\\sum_a^b")).toMatchSnapshot();
    });

    it('should use <mpadded> for raisebox', () => {
        expect(getMathML("\\raisebox{0.25em}{b}")).toMatchSnapshot();
    });

    it('should use <menclose> for colorbox', () => {
        expect(getMathML("\\colorbox{red}{b}")).toMatchSnapshot();
    });
});
