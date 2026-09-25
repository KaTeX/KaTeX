import defineFunction from "../defineFunction";
import type {FunctionHandler} from "../defineFunction";
import {makeSpan} from "../buildCommon";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

const handler: FunctionHandler<"reflectbox"> = ({parser}, args) => ({
    type: "reflectbox",
    mode: parser.mode,
    body: args[0],
});

defineFunction({
    type: "reflectbox",
    names: ["\\reflectbox"],
    numArgs: 1,
    argTypes: ["hbox"],
    allowedInText: true,

    handler,

    htmlBuilder(group, options) {
        return makeSpan(
            ["mord", "reflectbox"],
            [html.buildGroup(group.body, options)],
            options,
        );
    },
    mathmlBuilder(group, options) {
        return mml.buildGroup(group.body, options);
    },
});

// Parse math directly so the shared builders inherit the surrounding style.
// \reflectbox instead uses an hbox argument for LaTeX's text-box behavior.
defineFunction({
    type: "reflectbox",
    names: ["\\mathreflectbox"],
    numArgs: 1,
    argTypes: ["math"],
    handler,
});
