// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import {SymbolNode} from "../domTree";

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
        return {
            type: "operatorname",
            mode: parser.mode,
            body: ordargument(body),
        };
    },

    htmlBuilder: (group, options) => {
        if (group.body.length > 0) {
            const body = group.body.map(child => {
                // $FlowFixMe: Check if the node has a string `text` property.
                const childText = child.text;
                if (typeof childText === "string") {
                    return {
                        type: "textord",
                        mode: child.mode,
                        text: childText,
                    };
                } else {
                    return child;
                }
            });

            // Consolidate function names into symbol characters.
            const expression = html.buildExpression(
                body, options.withFont("mathrm"), true);

            for (let i = 0; i < expression.length; i++) {
                const child = expression[i];
                if (child instanceof SymbolNode) {
                    // Per amsopn package,
                    // change minus to hyphen and \ast to asterisk
                    child.text = child.text.replace(/\u2212/, "-")
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
            group.body, options.withFont("mathrm"));

        // Is expression a string or has it something like a fraction?
        let isAllString = true;  // default
        for (let i = 0; i < expression.length; i++) {
            const node = expression[i];
            if (node instanceof mathMLTree.SpaceNode) {
                // Do nothing
            } else if (node instanceof mathMLTree.MathNode) {
                switch (node.type) {
                    case "mi":
                    case "mn":
                    case "ms":
                    case "mspace":
                    case "mtext":
                        break;  // Do nothing yet.
                    case "mo": {
                        const child = node.children[0];
                        if (node.children.length === 1 &&
                            child instanceof mathMLTree.TextNode) {
                            child.text =
                                child.text.replace(/\u2212/, "-")
                                    .replace(/\u2217/, "*");
                        } else {
                            isAllString = false;
                        }
                        break;
                    }
                    default:
                        isAllString = false;
                }
            } else {
                isAllString = false;
            }
        }

        if (isAllString) {
            // Write a single TextNode instead of multiple nested tags.
            const word = expression.map(node => node.toText()).join("");
            expression = [new mathMLTree.TextNode(word)];
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
