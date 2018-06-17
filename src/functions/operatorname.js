// @flow
import ParseNode from "../ParseNode";
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import domTree from "../domTree";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

// \operatorname
// amsopn.dtx: \mathop{#1\kern\z@\operator@font#3}\newmcodes@
defineFunction({
    type: "operatorname",
    names: ["\\operatorname"],
    props: {
        numArgs: 1,
    },
    handler: ({parser}, args) => {
        const body = args[0];
        return new ParseNode("operatorname", {
            type: "operatorname",
            value: ordargument(body),
        }, parser.mode);
    },

    htmlBuilder: (group, options) => {
        const output = [];
        if (group.value.value.length > 0) {
            let letter = "";
            let mode = "";

            const groupValue = group.value.value.map(child => {
                const childValue = child.value;
                // In the amsopn package, \newmcodes@ changes four
                // characters, *-/:’, from math operators back into text.
                if (typeof childValue === "string" &&
                    "*-/:".indexOf(childValue) !== -1) {
                    return new ParseNode("textord", childValue, child.mode);
                } else {
                    return child;
                }
            });

            // Consolidate Greek letter function names into symbol characters.
            const temp = html.buildExpression(
                groupValue, options.withFont("mathrm"), true);

            // All we want from temp are the letters. With them, we'll
            // create a text operator similar to \tan or \cos.
            for (const child of temp) {
                if (child instanceof domTree.symbolNode) {
                    letter = child.value;

                    // In the amsopn package, \newmcodes@ changes four
                    // characters, *-/:’, from math operators back into text.
                    // Given what is in temp, we have to address two of them.
                    letter = letter.replace(/\u2212/, "-");   // minus => hyphen
                    letter = letter.replace(/\u2217/, "*");

                    // Use math mode for Greek letters
                    mode = (/[\u0391-\u03D7]/.test(letter) ? "math" : "text");
                    output.push(buildCommon.mathsym(letter, mode));
                } else {
                    output.push(child);
                }
            }
        }
        return buildCommon.makeSpan(["mop"], output, options);
    },

    mathmlBuilder: (group, options) => {
        // The steps taken here are similar to the html version.
        let output = [];
        if (group.value.value.length > 0) {
            const temp = mml.buildExpression(
                group.value.value, options.withFont("mathrm"));

            let word = temp.map(node => node.toText()).join("");
            word = word.replace(/\u2212/g, "-");
            word = word.replace(/\u2217/g, "*");
            // word has already been escaped by `node.toText()`
            output = [new mathMLTree.TextNode(word, false)];
        }
        const identifier = new mathMLTree.MathNode("mi", output);
        identifier.setAttribute("mathvariant", "normal");

        // \u2061 is the same as &ApplyFunction;
        // ref: https://www.w3schools.com/charsets/ref_html_entities_a.asp
        const operator = new mathMLTree.MathNode("mo",
            [mml.makeText("\u2061", "text")]);

        return new domTree.documentFragment([identifier, operator]);
    },
});
