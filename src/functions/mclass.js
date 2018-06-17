// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import ParseNode from "../ParseNode";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

const makeSpan = buildCommon.makeSpan;

function htmlBuilder(group, options) {
    const elements = html.buildExpression(group.value.value, options, true);
    return makeSpan([group.value.mclass], elements, options);
}

function mathmlBuilder(group, options) {
    const inner = mml.buildExpression(group.value.value, options);
    return new mathMLTree.MathNode("mstyle", inner);
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
        return new ParseNode("mclass", {
            type: "mclass",
            mclass: "m" + funcName.substr(5),
            value: ordargument(body),
        }, parser.mode);
    },
    htmlBuilder,
    mathmlBuilder,
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

        let mclass = "mrel";  // default. May change below.
        if (funcName !== "\\stackrel") {
            // LaTeX applies \binrel spacing to \overset and \underset. \binrel
            // spacing varies with (bin|rel|ord) of the atom in the argument.
            // We'll do the same.
            const atomType = (baseArg.type === "ordgroup" &&
                baseArg.value.length ? baseArg.value[0].type : baseArg.type);
            if (/^(bin|rel)$/.test(atomType)) {
                mclass = "m" + atomType;
            } else {
                // This may capture some instances in which the baseArg is more
                // than just a single symbol. Say a \overset inside an \overset.
                // TODO: A more comprehensive way to determine the baseArg type.
                mclass = "mord";
            }
        }

        const baseOp = new ParseNode("op", {
            type: "op",
            limits: true,
            alwaysHandleSupSub: true,
            symbol: false,
            suppressBaseShift: funcName !== "\\stackrel",
            value: ordargument(baseArg),
        }, baseArg.mode);

        const supsub = new ParseNode("supsub", {
            type: "supsub",
            base: baseOp,
            sup: funcName === "\\underset" ? null : shiftedArg,
            sub: funcName === "\\underset" ? shiftedArg : null,
        }, shiftedArg.mode);

        return new ParseNode("mclass", {
            type: "mclass",
            mclass: mclass,
            value: [supsub],
        }, parser.mode);
    },
    htmlBuilder,
    mathmlBuilder,
});

