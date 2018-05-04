// @flow
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";

defineFunction({
    type: "nobreak",
    names: ["\\nobreak"],
    props: {
        numArgs: 0,
        allowedInText: true,
    },
    handler(context, args, optArgs) {
        return {
            type: "nobreak",
        };
    },
    htmlBuilder(group, options) {
        return buildCommon.makeSpan(["nobreak"], [], options);
    },
    mathmlBuilder(group, options) {
        const node = new mathMLTree.MathNode("mspace");
        node.setAttribute("width", 0);
        return node;
    },
});

defineFunction({
    type: "allowbreak",
    names: ["\\allowbreak"],
    props: {
        numArgs: 0,
        allowedInText: true,
    },
    handler(context, args, optArgs) {
        return {
            type: "allowbreak",
        };
    },
    htmlBuilder(group, options) {
        return buildCommon.makeSpan(["allowbreak"], [], options);
    },
    mathmlBuilder(group, options) {
        const node = new mathMLTree.MathNode("mspace");
        node.setAttribute("width", 0);
        return node;
    },
});
