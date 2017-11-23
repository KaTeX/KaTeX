// @flow
// smash, with optional [tb], as in AMS
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "smash",
    names: ["\\smash"],
    props: {
        numArgs: 1,
        numOptionalArgs: 1,
        allowedInText: true,
    },
    handler: (context, args, optArgs) => {
        let smashHeight = false;
        let smashDepth = false;
        const tbArg = optArgs[0];
        if (tbArg) {
            // Optional [tb] argument is engaged.
            // ref: amsmath: \renewcommand{\smash}[1][tb]{%
            //               def\mb@t{\ht}\def\mb@b{\dp}\def\mb@tb{\ht\z@\z@\dp}%
            let letter = "";
            for (let i = 0; i < tbArg.value.length; ++i) {
                letter = tbArg.value[i].value;
                if (letter === "t") {
                    smashHeight = true;
                } else if (letter === "b") {
                    smashDepth = true;
                } else {
                    smashHeight = false;
                    smashDepth = false;
                    break;
                }
            }
        } else {
            smashHeight = true;
            smashDepth = true;
        }

        const body = args[0];
        return {
            type: "smash",
            body: body,
            smashHeight: smashHeight,
            smashDepth: smashDepth,
        };
    },
    htmlBuilder: (group, options) => {
        const node = buildCommon.makeSpan(
            ["mord"], [html.buildGroup(group.value.body, options)]);

        if (!group.value.smashHeight && !group.value.smashDepth) {
            return node;
        }

        if (group.value.smashHeight) {
            node.height = 0;
            // In order to influence makeVList, we have to reset the children.
            if (node.children) {
                for (let i = 0; i < node.children.length; i++) {
                    node.children[i].height = 0;
                }
            }
        }

        if (group.value.smashDepth) {
            node.depth = 0;
            if (node.children) {
                for (let i = 0; i < node.children.length; i++) {
                    node.children[i].depth = 0;
                }
            }
        }

        // At this point, we've reset the TeX-like height and depth values.
        // But the span still has an HTML line height.
        // makeVList applies "display: table-cell", which prevents the browser
        // from acting on that line height. So we'll call makeVList now.

        return buildCommon.makeVList({
            positionType: "firstBaseline",
            children: [{type: "elem", elem: node}],
        }, options);
    },
    mathmlBuilder: (group, options) => {
        const node = new mathMLTree.MathNode(
            "mpadded", [mml.buildGroup(group.value.body, options)]);

        if (group.value.smashHeight) {
            node.setAttribute("height", "0px");
        }

        if (group.value.smashDepth) {
            node.setAttribute("depth", "0px");
        }

        return node;
    },
});
