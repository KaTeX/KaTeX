// @flow
import {defineFunctionBuilders} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import ParseError from "../ParseError";

// ParseNode<"spacing"> created in Parser.js from the "spacing" symbol Groups in
// src/symbols.js.
defineFunctionBuilders({
    type: "spacing",
    htmlBuilder(group, options) {
        if (buildCommon.regularSpace.hasOwnProperty(group.text)) {
            const className = buildCommon.regularSpace[group.text].className || "";
            // Spaces are generated by adding an actual space. Each of these
            // things has an entry in the symbols table, so these will be turned
            // into appropriate outputs.
            if (group.mode === "text") {
                const ord = buildCommon.makeOrd(group, options, "textord");
                ord.classes.push(className);
                return ord;
            } else {
                return buildCommon.makeSpan(["mspace", className],
                    [buildCommon.mathsym(group.text, group.mode, options)],
                    options);
            }
        } else if (buildCommon.cssSpace.hasOwnProperty(group.text)) {
            // Spaces based on just a CSS class.
            return buildCommon.makeSpan(
                ["mspace", buildCommon.cssSpace[group.text]],
                [], options);
        } else {
            throw new ParseError(`Unknown type of space "${group.text}"`);
        }
    },
    mathmlBuilder(group, options) {
        let node;

        if (buildCommon.regularSpace.hasOwnProperty(group.text)) {
            node = new mathMLTree.MathNode(
                "mtext", [new mathMLTree.TextNode("\u00a0")]);
        } else if (buildCommon.cssSpace.hasOwnProperty(group.text)) {
            // CSS-based MathML spaces (\nobreak, \allowbreak) are ignored
            return new mathMLTree.MathNode("mspace");
        } else {
            throw new ParseError(`Unknown type of space "${group.text}"`);
        }

        return node;
    },
});
