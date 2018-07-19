// @flow
import buildCommon from "../buildCommon";
import defineFunction from "../defineFunction";
import mathMLTree from "../mathMLTree";
import utils from "../utils";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

import type Options from "../Options";
import type {HtmlBuilder} from "../defineFunction";

export function sizingGroup(value: *, options: Options, baseOptions: Options) {
    const inner = html.buildExpression(value, options, false);
    const multiplier = options.sizeMultiplier / baseOptions.sizeMultiplier;

    // Add size-resetting classes to the inner list and set maxFontSize
    // manually. Handle nested size changes.
    for (let i = 0; i < inner.length; i++) {
        const pos = utils.indexOf(inner[i].classes, "sizing");
        if (pos < 0) {
            Array.prototype.push.apply(inner[i].classes,
                options.sizingClasses(baseOptions));
        } else if (inner[i].classes[pos + 1] === "reset-size" + options.size) {
            // This is a nested size change: e.g., inner[i] is the "b" in
            // `\Huge a \small b`. Override the old size (the `reset-` class)
            // but not the new size.
            inner[i].classes[pos + 1] = "reset-size" + baseOptions.size;
        }

        inner[i].height *= multiplier;
        inner[i].depth *= multiplier;
    }

    return buildCommon.makeFragment(inner);
}

const sizeFuncs = [
    "\\tiny", "\\sixptsize", "\\scriptsize", "\\footnotesize", "\\small",
    "\\normalsize", "\\large", "\\Large", "\\LARGE", "\\huge", "\\Huge",
];

export const htmlBuilder: HtmlBuilder<"sizing"> = (group, options) => {
    // Handle sizing operators like \Huge. Real TeX doesn't actually allow
    // these functions inside of math expressions, so we do some special
    // handling.
    const newOptions = options.havingSize(group.value.size);
    return sizingGroup(group.value.value, newOptions, options);
};

defineFunction({
    type: "sizing",
    names: sizeFuncs,
    props: {
        numArgs: 0,
        allowedInText: true,
    },
    handler: ({breakOnTokenText, funcName, parser}, args) => {
        parser.consumeSpaces();
        const body = parser.parseExpression(false, breakOnTokenText);

        return {
            type: "sizing",
            mode: parser.mode,
            value: {
                type: "sizing",
                // Figure out what size to use based on the list of functions above
                size: utils.indexOf(sizeFuncs, funcName) + 1,
                value: body,
            },
        };
    },
    htmlBuilder,
    mathmlBuilder: (group, options) => {
        const newOptions = options.havingSize(group.value.size);
        const inner = mml.buildExpression(group.value.value, newOptions);

        const node = new mathMLTree.MathNode("mstyle", inner);

        // TODO(emily): This doesn't produce the correct size for nested size
        // changes, because we don't keep state of what style we're currently
        // in, so we can't reset the size to normal before changing it.  Now
        // that we're passing an options parameter we should be able to fix
        // this.
        node.setAttribute("mathsize", newOptions.sizeMultiplier + "em");

        return node;
    },
});
