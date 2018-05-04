// @flow
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";

// \nobreak and \allowbreak turn into special types of span with class
// "nobreak" and "allowbreak" that get handled when constructing body spans
// in buildHTML.js's buildHTML.  In addition, they have a first class of
// "mspace" which causes them to get ignored when applying the spacing rules
// in buildHTML.js's buildExpression.

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
        return buildCommon.makeSpan(["mspace", "nobreak"], [], options);
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
        return buildCommon.makeSpan(["mspace", "allowbreak"], [], options);
    },
    mathmlBuilder(group, options) {
        const node = new mathMLTree.MathNode("mspace");
        node.setAttribute("width", 0);
        return node;
    },
});
