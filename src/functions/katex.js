// @flow
// A KaTeX logo
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";

defineFunction({
    type: "katex",
    names: ["\\KaTeX"],
    props: {
        numArgs: 0,
        allowedInText: true,
    },
    handler: (context, args) => {
        return {
            type: "katex",
        };
    },
    htmlBuilder: (group, options) => {
        // The KaTeX logo. The offsets for the K and a were chosen to look
        // good, but the offsets for the T, E, and X were taken from the
        // definition of \TeX in TeX (see TeXbook pg. 356)
        const k = buildCommon.makeSpan(
            ["k"], [buildCommon.mathsym("K", group.mode)], options);
        const a = buildCommon.makeSpan(
            ["a"], [buildCommon.mathsym("A", group.mode)], options);

        a.height = (a.height + 0.2) * 0.75;
        a.depth = (a.height - 0.2) * 0.75;

        const t = buildCommon.makeSpan(
            ["t"], [buildCommon.mathsym("T", group.mode)], options);
        const e = buildCommon.makeSpan(
            ["e"], [buildCommon.mathsym("E", group.mode)], options);

        e.height = (e.height - 0.2155);
        e.depth = (e.depth + 0.2155);

        const x = buildCommon.makeSpan(
            ["x"], [buildCommon.mathsym("X", group.mode)], options);

        return buildCommon.makeSpan(
            ["mord", "katex-logo"], [k, a, t, e, x], options);
    },
    mathmlBuilder: (group, options) => {
        const node = new mathMLTree.MathNode(
            "mtext", [new mathMLTree.TextNode("KaTeX")]);

        return node;
    },
});
