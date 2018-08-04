// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import type {AnyParseNode} from "../parseNode";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

const makeSpan = buildCommon.makeSpan;

function htmlBuilder(group, options) {
    const elements = html.buildExpression(group.value.value, options, true);
    return makeSpan([group.value.mclass], elements, options);
}

function mathmlBuilder(group, options) {
    const inner = mml.buildExpression(group.value.value, options);
    return mathMLTree.newDocumentFragment(inner);
}

// Math class commands except \mathop
defineFunction({
    type: "mclass",
    names: [
        "\\mathord", "\\mathbin", "\\mathrel", "\\mathopen",
        "\\mathclose", "\\mathpunct", "\\mathinner",
    ],
    props: {
        numArgs: 1,
    },
    handler({parser, funcName}, args) {
        const body = args[0];
        return {
            type: "mclass",
            mode: parser.mode,
            value: {
                type: "mclass",
                mclass: "m" + funcName.substr(5),
                value: ordargument(body),
            },
        };
    },
    htmlBuilder,
    mathmlBuilder,
});

export const binrelClass = (arg: AnyParseNode): string => {
    // \binrel@ spacing varies with (bin|rel|ord) of the atom in the argument.
    // (by rendering separately and with {}s before and after, and measuring
    // the change in spacing).  We'll do roughly the same by detecting the
    // atom type directly.
    const atom = (arg.type === "ordgroup" && arg.value.length ? arg.value[0] : arg);
    if (atom.type === "atom" && (atom.family === "bin" || atom.family === "rel")) {
        return "m" + atom.family;
    } else {
        return "mord";
    }
};

// \@binrel{x}{y} renders like y but as mbin/mrel/mord if x is mbin/mrel/mord.
// This is equivalent to \binrel@{x}\binrel@@{y} in AMSTeX.
defineFunction({
    type: "mclass",
    names: ["\\@binrel"],
    props: {
        numArgs: 2,
    },
    handler({parser}, args) {
        return {
            type: "mclass",
            mode: parser.mode,
            value: {
                type: "mclass",
                mclass: binrelClass(args[0]),
                value: [args[1]],
            },
        };
    },
});

// Build a relation or stacked op by placing one symbol on top of another
defineFunction({
    type: "mclass",
    names: ["\\stackrel", "\\overset", "\\underset"],
    props: {
        numArgs: 2,
    },
    handler({parser, funcName}, args) {
        const baseArg = args[1];
        const shiftedArg = args[0];

        let mclass;
        if (funcName !== "\\stackrel") {
            // LaTeX applies \binrel spacing to \overset and \underset.
            mclass = binrelClass(baseArg);
        } else {
            mclass = "mrel";  // for \stackrel
        }

        const baseOp = {
            type: "op",
            mode: baseArg.mode,
            limits: true,
            alwaysHandleSupSub: true,
            symbol: false,
            suppressBaseShift: funcName !== "\\stackrel",
            value: ordargument(baseArg),
        };

        const supsub = {
            type: "supsub",
            mode: shiftedArg.mode,
            base: baseOp,
            sup: funcName === "\\underset" ? null : shiftedArg,
            sub: funcName === "\\underset" ? shiftedArg : null,
        };

        return {
            type: "mclass",
            mode: parser.mode,
            value: {
                type: "mclass",
                mclass: mclass,
                value: [supsub],
            },
        };
    },
    htmlBuilder,
    mathmlBuilder,
});

