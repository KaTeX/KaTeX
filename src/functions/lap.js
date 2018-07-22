// @flow
// Horizontal overlap functions
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import ParseNode from "../ParseNode";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "lap",
    names: ["\\mathllap", "\\mathrlap", "\\mathclap"],
    props: {
        numArgs: 1,
        allowedInText: true,
    },
    handler: ({parser, funcName}, args) => {
        const body = args[0];
        return new ParseNode("lap", {
            type: "lap",
            alignment: funcName.slice(5),
            body: body,
        }, parser.mode);
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
            [group.value.alignment], [inner, fix], options);

        // At this point, we have correctly set horizontal alignment of the
        // two items involved in the lap.
        // Next, use a strut to set the height of the HTML bounding box.
        // Otherwise, a tall argument may be misplaced.
        const strut = buildCommon.makeSpan(["strut"]);
        strut.style.height = (node.height + node.depth) + "em";
        strut.style.verticalAlign = -node.depth + "em";
        node.children.unshift(strut);

        // Next, prevent vertical misplacement when next to something tall.
        node = buildCommon.makeVList({
            positionType: "firstBaseline",
            children: [{type: "elem", elem: node}],
        }, options);

        // Get the horizontal spacing correct relative to adjacent items.
        return buildCommon.makeSpan(["mord"], [node], options);
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
