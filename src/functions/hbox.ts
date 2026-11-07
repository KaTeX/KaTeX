import defineFunction, {ordargument} from "../defineFunction";
import type {FunctionHandler} from "../defineFunction";
import {makeFragment} from "../buildCommon";
import {MathNode} from "../mathMLTree";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

// \hbox is provided for compatibility with LaTeX \vcenter.
// In LaTeX, \vcenter can act only on a box, as in
// \vcenter{\hbox{$\frac{a+b}{\dfrac{c}{d}}$}}
// This function by itself doesn't do anything but prevent a soft line break.

const handler: FunctionHandler<"hbox"> = ({parser}, args) => ({
    type: "hbox",
    mode: parser.mode,
    body: ordargument(args[0]),
});

defineFunction({
    type: "hbox",
    names: ["\\hbox"],
    numArgs: 1,
    argTypes: ["text"],
    allowedInText: true,
    primitive: true,

    handler,

    htmlBuilder(group, options) {
        const elements = html.buildExpression(group.body, options.withFont(''), false);
        return makeFragment(elements);
    },
    mathmlBuilder(group, options) {
        return new MathNode(
          "mrow", mml.buildExpression(group.body, options.withFont(''))
        );
    },
});

// LaTeX defines \mbox{#1} as \leavevmode\hbox{#1}. The hbox argument type
// resets to \textstyle, so \mbox keeps full size in sub/superscripts.
defineFunction({
    type: "hbox",
    names: ["\\mbox"],
    numArgs: 1,
    argTypes: ["hbox"],
    allowedInText: true,
    handler,
});
