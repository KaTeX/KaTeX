// @flow
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import {phasePath} from "../svgGeometry";
import {PathNode, SvgNode} from "../domTree";
import mathMLTree from "../mathMLTree";
import {calculateSize} from "../units";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

import type {ParseNode} from "../parseNode";

// From the steinmetz package

defineFunction({
    type: "phase",
    names: ["\\phase"],
    props: {
        numArgs: 1,
    },
    handler({parser}, args) {
        const body = args[0];
        return {
            type: "phase",
            mode: parser.mode,
            body,
        };
    },
    htmlBuilder(group: ParseNode<"phase">, options) {
        // Build the inner group just like a \sqrt
        const inner = buildCommon.wrapFragment(
            html.buildGroup(group.body, options), options
        );

        // Set a couple of dimensions from the steinmetz package.
        const lineWeight = calculateSize({number: 0.6, unit: "pt"}, options);
        const clearance = calculateSize({number: 0.35, unit: "ex"}, options);

        // Prevent size changes like \Huge from affecting line thickness
        const newOptions = options.havingBaseSizing();
        const sizeMultiplier = options.sizeMultiplier / newOptions.sizeMultiplier;

        const angleHeight = inner.height + inner.depth + lineWeight + clearance;
        // Reserve a left pad for the angle.
        inner.style.paddingLeft = (angleHeight / 2 + lineWeight) + "em";

        // Create an SVG
        const viewBoxHeight = Math.floor(1000 * angleHeight * sizeMultiplier);
        const path = phasePath(viewBoxHeight);
        const svgNode = new SvgNode([new PathNode("phase", path)], {
            "width": "400em",
            "height": `${viewBoxHeight / 1000}em`,
            "viewBox": `0 0 400000 ${viewBoxHeight}`,
            "preserveAspectRatio": "xMinYMin slice",
        });
        // Wrap it in a span with overflow: hidden.
        const img = buildCommon.makeSvgSpan(["hide-tail"], [svgNode], options);
        img.style.height = angleHeight + "em";

        // Overlay the image and the argument.
        const angleShift = inner.depth + lineWeight + clearance;
        const body = buildCommon.makeVList({
            positionType: "individualShift",
            children: [
                {
                    type: "elem",
                    elem: img,
                    wrapperClasses: ["svg-align"],
                    shift: angleShift,
                },
                {type: "elem", elem: inner, shift: 0},
            ],
        }, options);

        return buildCommon.makeSpan(["mord"], [body], options);
    },
    mathmlBuilder(group, options) {
        const node = new mathMLTree.MathNode(
            "menclose", [mml.buildGroup(group.body, options)]
        );
        node.setAttribute("notation", "phase");
        return node;
    },
});
