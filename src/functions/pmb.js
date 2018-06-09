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

    // The AMS code is in ambsy.sty
    // \def\pmb@#1#2{\setbox8\hbox{$\m@th#1{#2}$}%
    // \setboxz@h{$\m@th#1\mkern.5mu$}\pmbraise@\wdz@
    // \binrel@{#2}%
    // \dimen@-\wd8  %
    // \binrel@@{%
    // \mkern-.8mu\copy8  %
    // \kern\dimen@\mkern.4mu\raise\pmbraise@\copy8  %
    // \kern\dimen@\mkern.4mu\box8  }%
    // }

    const node = html.buildGroup(group.value.body, options);
    const orig = buildCommon.makeSpan([], [node], options);

    const hkern1 = buildCommon.makeGlue({number: 0.4, unit: "mu"}, options);
    const copy1 = buildCommon.makeSpan([], [hkern1, orig], options);

    const hkern2 = buildCommon.makeGlue({number: 0.8, unit: "mu"}, options);
    const copy2 = buildCommon.makeSpan([], [hkern2, orig], options);

    const vshift = calculateSize({number:0.4, unit: "mu"}, options);

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
