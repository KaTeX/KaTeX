import defineFunction from "../defineFunction";
import {makeSpan} from "../buildCommon";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "reflectbox",
    names: ["\\reflectbox"],
    numArgs: 1,
    argTypes: ["hbox"],
    allowedInText: true,

    handler: ({parser}, args) => ({
        type: "reflectbox",
        mode: parser.mode,
        body: args[0],
    }),

    htmlBuilder(group, options) {
        return makeSpan(
            ["reflectbox"],
            [html.buildGroup(group.body, options)],
            options,
        );
    },
    mathmlBuilder(group, options) {
        return mml.buildGroup(group.body, options);
    },
});
