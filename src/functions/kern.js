//@flow
// Horizontal spacing commands

import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import {calculateSize} from "../units";
import {assertNodeType} from "../parseNode";

const handler = ({parser, funcName}, args) => {
    const size = assertNodeType(args[0], "dimen");
    return {
        type: "kern",
        mode: parser.mode,
        dimension: size.value,
    };
};

defineFunction({
    type: "kern",
    names: ["\\kern"],
    props: {
        numArgs: 1,
        argTypes: ["dimen"],
        primitive: true,
        allowedInText: true,
    },
    handler,
    htmlBuilder(group, options) {
        return buildCommon.makeGlue(group.dimension, options);
    },
    mathmlBuilder(group, options) {
        const dimension = calculateSize(group.dimension, options);
        return new mathMLTree.SpaceNode(dimension);
    },
});

defineFunction({
    type: "kern",
    names: ["\\mkern"],
    props: {
        numArgs: 1,
        argTypes: ["mudimen"],
    },
    handler,
});

// TODO: \hskip and \mskip should support stretch and shrink
// (plus and minus in lengths)
const glueHandler = ({parser, funcName}, args) => {
    const size = assertNodeType(args[0], "glue");
    return {
        type: "kern",
        mode: parser.mode,
        dimension: size.value,
    };
};

defineFunction({
    type: "kern",
    names: ["\\hskip"],
    props: {
        numArgs: 1,
        argTypes: ["glue"],
        allowedInText: true,
    },
    handler: glueHandler,
});

defineFunction({
    type: "kern",
    names: ["\\mskip"],
    props: {
        numArgs: 1,
        argTypes: ["muglue"],
    },
    handler: glueHandler,
});
