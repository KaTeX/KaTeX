// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import type {AnyParseNode} from "../parseNode";
import {MathNode} from "../mathMLTree";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

import type {ParseNode} from "../parseNode";

const makeSpan = buildCommon.makeSpan;

function htmlBuilder(group: ParseNode<"mclass">, options) {
    const elements = html.buildExpression(group.body, options, true);
    return makeSpan([group.mclass], elements, options);
}

function mathmlBuilder(group: ParseNode<"mclass">, options) {
    const inner = mml.buildExpression(group.body, options);
    switch (group.mclass) {
        case "minner":
            return mathMLTree.newDocumentFragment(inner);
        case "mord":
            return new mathMLTree.MathNode("mi", inner);
        default:
            const node = new mathMLTree.MathNode("mo", inner);
            // Set spacing based on what is the most likely adjacent atom type.
            // See TeXbook p170.
            if (group.mclass === "mbin") {
                node.setAttribute("lspace", "0.22em"); // medium space
                node.setAttribute("rspace", "0.22em");
            } else if (group.mclass === "mpunct") {
                node.setAttribute("lspace", "0em");
                node.setAttribute("rspace", "0.17em"); // thinspace
            } else if (group.mclass === "mopen" || group.mclass === "mclose") {
                node.setAttribute("lspace", "0em");
                node.setAttribute("rspace", "0em");
            }
            // MathML <mo> default space is 5/18 em, so <mrel> needs no action.
            // Ref: https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mo
            return node;
    }
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
            mclass: "m" + funcName.substr(5),
            body: ordargument(body),
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
    const atom = (arg.type === "ordgroup" && arg.body.length ? arg.body[0] : arg);
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
            mclass: binrelClass(args[0]),
            body: [args[1]],
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
            parentIsSupSub: false,
            symbol: false,
            suppressBaseShift: funcName !== "\\stackrel",
            body: ordargument(baseArg),
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
            mclass,
            body: [supsub],
        };
    },
    htmlBuilder,
    mathmlBuilder,
});

