// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

// \operatorname
// amsopn.dtx: \mathop{#1\kern\z@\operator@font#3}\newmcodes@
defineFunction({
    type: "opNameMain",
    names: ["\\opNameMain"],
    props: {
        numArgs: 1,
    },
    handler: (context, args) => {
        const body = args[0];
        return {
            type: "opNameMain",
            value: ordargument(body),
        };
    },

    htmlBuilder: (group, options) => {
        const output = [];
        if (group.value.value.length > 0) {
            let letter = "";
            let mode = "";

            // Consolidate Greek letter function names into symbol characters.
            const temp = html.buildExpression(group.value.value, options, true);

            // All we want from temp are the letters. With them, we'll
            // create a text operator similar to \tan or \cos.
            for (let i = 0; i < temp.length; i++) {
                letter = temp[i].value;

                // In the amsopn package, \newmcodes@ changes four
                // characters, *-/:’, from math operators back into text.
                // Given what is in temp, we have to address two of them.
                letter = letter.replace(/\u2212/, "-");   // minus => hyphen
                letter = letter.replace(/\u2217/, "*");

                // Use math mode for Greek letters
                mode = (/[\u0391-\u03D7]/.test(letter) ? "math" : "text");
                output.push(buildCommon.mathsym(letter, mode));
            }
        }
        return buildCommon.makeSpan(["mop"], output, options);
    },

    mathmlBuilder: (group, options) => {
        // The steps taken here are similar to the html version.
        let output = [];
        if (group.value.value.length > 0) {
            let temp = mml.buildExpression(group.value.value, options);

            let word = "";
            for (let i = 0; i < temp.length; i++) {
                word += temp[i].children[0].text;;
            }
            word = word.replace(/\u2212/g, "-");
            word = word.replace(/\u2217/g, "*");
            output = [new mathMLTree.TextNode(word)];
        }
        const node = new mathMLTree.MathNode("mi", output);
        node.setAttribute("mathvariant", "normal");
        return node;
        // See defineFunction below.
    },
});

defineFunction({
    type: "functionapply",

    // The \operatorname macro expands as: \opNameMain{#1}\functionapply
    // By that means, we append an <mo>&ApplyFunction;</mo> to the MathML.
    // ref: https://www.w3.org/TR/REC-MathML/chap3_2.html#sec3.2.2

    names: ["\\functionapply"],
    props: {
        numArgs: 0,
    },
    handler: (context, args) => {
        return {
            type: "functionapply",
        };
    },
    htmlBuilder: (group, options) => {
        // Return a null. This is all about the MathML.
        return buildCommon.makeFragment(null);
    },
    mathmlBuilder: (group, options) => {
        return new mathMLTree.MathNode("mo",
            [mml.makeText("&ApplyFunction;", "text")]);
    },
});
