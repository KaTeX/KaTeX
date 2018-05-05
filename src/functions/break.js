// @flow
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import { groupTypes } from "../buildHTML";
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
            value: context.funcName,
        };
    },
    htmlBuilder(group, options) {
        let span;
        if (group.value.value !== "\\nobreak") {
            span = groupTypes.spacing({
                mode: group.mode,
                value: group.value.value,
            }, options);
            span.classes.push("nobreak");
        } else {
            span = buildCommon.makeSpan(["mspace", "nobreak"], [], options);
        }
        return span;
    },
    mathmlBuilder(group, options) {
        let text = "";
        if (group.value.value !== "\\nobreak") {
            text = "\u00a0";
        }
        return new mathMLTree.TextNode(text);
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
        return new mathMLTree.TextNode(text);
    },
});
