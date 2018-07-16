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
        if (group.value.value.length > 0) {
            const groupValue = group.value.value.map(child => {
                const childValue = child.value;
                if (typeof childValue === "string") {
                    return new ParseNode("textord", childValue, child.mode);
                } else {
                    return child;
                }
            });

            // Consolidate function names into symbol characters.
            const expression = html.buildExpression(
                groupValue, options.withFont("mathrm"), true);

            for (let i = 0; i < expression.length; i++) {
                const child = expression[i];
                if (child instanceof domTree.symbolNode) {
                    // Per amsopn package,
                    // change minus to hyphen and \ast to asterisk
                    child.value = child.value.replace(/\u2212/, "-")
                        .replace(/\u2217/, "*");
                }
            }
            return buildCommon.makeSpan(["mop"], expression, options);
        } else {
            return buildCommon.makeSpan(["mop"], [], options);
        }
    },

    mathmlBuilder: (group, options) => {
        // The steps taken here are similar to the html version.
        let expression = mml.buildExpression(
            group.value.value, options.withFont("mathrm"));

        // Is expression a string or has it something like a fraction?
        let isAllString = true;  // default
        for (let i = 0; i < expression.length; i++) {
            const node = expression[i];
            if (node instanceof mathMLTree.SpaceNode) {
                // Do nothing
            } else {
                switch (node.type) {
                    case "mi":
                    case "mn":
                    case "ms":
                    case "mspace":
                    case "mtext":
                        break;  // Do nothing yet.
                    case "mo":
                        if (node.children.length === 1) {
                            if (node.children[0] instanceof mathMLTree.TextNode ===
                                false) {
                                isAllString = false;
                            } else {
                                node.children[0].text =
                                    node.children[0].text.replace(/\u2212/, "-")
                                    .replace(/\u2217/, "*");
                            }
                        } else {
                            isAllString = false;
                        }
                        break;
                    default:
                        isAllString = false;
                }
            }
        }

        if (isAllString) {
            // Write a single TextNode instead of multiple nested tags.
            const word = expression.map(node => node.toText()).join("");
            // word has already been escaped by `node.toText()`
            expression = [new mathMLTree.TextNode(word, false)];
        }

        const identifier = new mathMLTree.MathNode("mi", expression);
        identifier.setAttribute("mathvariant", "normal");

        // \u2061 is the same as &ApplyFunction;
        // ref: https://www.w3schools.com/charsets/ref_html_entities_a.asp
        const operator = new mathMLTree.MathNode("mo",
            [mml.makeText("\u2061", "text")]);

        return mathMLTree.newDocumentFragment([identifier, operator]);
    },
});
