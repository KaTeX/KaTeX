//@flow

import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import {makeText} from "../buildMathML";

// Most relations are handled by symbols.js.
// In this module, we deal with coloneqq and other relations that
// (1) have a Unicode code point, and
// (2) do not have a corresponnding glyph in the KaTeX fonts.
// For HTML, we form a ligature from two glyphs.
// For MathML, we call the appropriate Unicode symbol.

// TODO: Find some way to do ligatures in MathML.

const singleCharRelations = {
    "\u2237": "\\dblcolon",
    "\u2239": "\\eqcolon",
    "\u2254": "\\coloneqq",
    "\u2255": "\\eqqcolon",
};

const eqSequence = {
    coloneqq: [":", -1.2, "="],
    dblcolon: [":", -0.9, ":"],
    eqcolon: ["\u2212", -1.2, ":"],
    eqqcolon: ["=", -1.2, ":"],
};

const eqSymbol = {
    coloneqq: "\u2254",
    dblcolon: "\u2237",
    eqcolon: "\u2239",
    eqqcolon: "\u2255",
};

defineFunction({
    type: "mathrel",
    names: ["\\coloneqq", "\\dblcolon", "\\eqcolon", "\\eqqcolon",
        "\u2237", "\u2239", "\u2254", "\u2255"],
    props: {
        numArgs: 0,
    },

    handler({parser, funcName}) {
        let fName = funcName;
        if (fName.length === 1) {
            fName = singleCharRelations[fName];
        }
        return {
            type: "mathrel",
            mode: parser.mode,
            name: fName.slice(1),
        };
    },

    htmlBuilder(group, options) {
        const sequence = eqSequence[group.name];
        const nodes = [];
        for (let i = 0; i < sequence.length; i += 2) {
            let node = buildCommon.makeSymbol(
                sequence[i], "Main-Regular", "math", options, ["mrel"]
            );

            if (sequence[i] === ":") {
                // Center the colon on the math axis
                const shift = (node.height - node.depth) / 2
                    - options.fontMetrics().axisHeight;
                node = buildCommon.makeVList({
                    positionType: "top",
                    positionData: node.height - shift,
                    children: [{type: "elem", elem: node}],
                }, options);
            }

            nodes.push(node);

            if (i < sequence.length - 2) {
                const horizKern = {number: sequence[i + 1], unit: "mu"};
                const glue = buildCommon.makeGlue(horizKern, options);
                nodes.push(glue);
            }
        }

        return buildCommon.makeSpan(["mrel"], nodes, options);
    },

    mathmlBuilder(group, options) {
        const node = new mathMLTree.MathNode(
            "mo", [makeText(eqSymbol[group.name], group.mode)]);
        return node;
    },
});
