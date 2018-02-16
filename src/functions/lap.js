// @flow
// Horizontal overlap functions
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "lap",
    names: ["\\mathllap", "\\mathrlap", "\\mathclap"],
    props: {
        numArgs: 1,
        allowedInText: true,
    },
    handler: (context, args) => {
        const body = args[0];
        return {
            type: "lap",
            alignment: context.funcName.slice(5),
            body: body,
        };
    },
    htmlBuilder: (group, options) => {
        // mathllap, mathrlap, mathclap
        let inner;
        if (group.value.alignment === "clap") {
            // ref: https://www.math.lsu.edu/~aperlis/publications/mathclap/
            inner = buildCommon.makeSpan(
                [], [html.buildGroup(group.value.body, options)]);
            // wrap, since CSS will center a .clap > .inner > span
            inner = buildCommon.makeSpan(["inner"], [inner], options);
        } else {
            inner = buildCommon.makeSpan(
                ["inner"], [html.buildGroup(group.value.body, options)]);
        }
        const fix = buildCommon.makeSpan(["fix"], []);
        let node = buildCommon.makeSpan(
            ["mord", group.value.alignment], [inner, fix], options);

        // At this point, we have correctly set horizontal alignment.
        // Next, use struts to set the height of the HTML bounding box.
        // Otherwise, a tall argument may be misplaced.
        const topStrut = buildCommon.makeSpan(["strut"]);
        const bottomStrut = buildCommon.makeSpan(["strut", "bottom"]);
        topStrut.style.height = node.height + "em";
        bottomStrut.style.height = (node.height + node.depth) + "em";
        bottomStrut.style.verticalAlign = -node.depth + "em";
        node = buildCommon.makeSpan([], [topStrut, bottomStrut, node]);

        // One last step to prevent vertical misplacement when next to
        // something tall.
        return buildCommon.makeVList({
            positionType: "firstBaseline",
            children: [{type: "elem", elem: node}],
        }, options);
    },
    mathmlBuilder: (group, options) => {
        // mathllap, mathrlap, mathclap
        const node = new mathMLTree.MathNode(
            "mpadded", [mml.buildGroup(group.value.body, options)]);

        if (group.value.alignment !== "rlap")    {
            const offset = (group.value.alignment === "llap" ? "-1" : "-0.5");
            node.setAttribute("lspace", offset + "width");
        }
        node.setAttribute("width", "0px");

        return node;
    },
});
