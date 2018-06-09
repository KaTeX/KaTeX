// @flow
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import ParseNode from "../ParseNode";
import {calculateSize} from "../units";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

const htmlBuilder = (group, options) => {
    // \pmb works by typesetting three copies of
    // the given argument with small offsets.
    const node = html.buildGroup(group.value.body, options);
    const orig = buildCommon.makeSpan([], [node], options);

    let copy1 = buildCommon.makeSpan([], [node], options);
    const hkern1 = buildCommon.makeGlue({number: 0.4, unit: "mu"}, options);
    copy1 = buildCommon.makeSpan([], [hkern1, copy1], options);

    let copy2 = buildCommon.makeSpan([], [node], options);
    const hkern2 = buildCommon.makeGlue({number: 0.8, unit: "mu"}, options);
    copy2 = buildCommon.makeSpan([], [hkern2, copy2], options);

    const vshift = calculateSize({number:0.4, unit: "mu"}, options);;

    const mclass = group.value.mclass;

    const vlist = buildCommon.makeVList({
        positionType: "individualShift",
        children: [
            {type: "elem", elem: orig, shift: 0},
            {type: "elem", elem: copy1, shift: vshift},
            {type: "elem", elem: copy2, shift: 0},
        ],
    }, options);
    return buildCommon.makeSpan([mclass], [vlist], options);
};

const mathmlBuilder = (group, options) => {
    return mml.buildGroup(group.value.body, options.withFont("mathbf"));
};

defineFunction({
    type: "pmb",
    names: ["\\pmb"],
    props: {
        numArgs: 1,
        allowedInText: true,
    },
    handler({parser, funcName}, args) {
        const body = args[0];
        // amsbsy.sty's \pmb inherits the argument's bin|rel|ord status
        // (similar to \stackrel in functions/mclass.js)
        let mclass = "mord";
        if (body.value.length) {
            const atomType = (body.type === "ordgroup" ?
                // $FlowFixMe
                body.value[0].type : body.type);
            if (/^(bin|rel)$/.test(atomType)) {
                mclass = "m" + atomType;
            }
        }
        return new ParseNode("pmb", {
            type: "pmb",
            mclass: mclass,
            body: body,
        }, parser.mode);
    },
    htmlBuilder,
    mathmlBuilder,
});
