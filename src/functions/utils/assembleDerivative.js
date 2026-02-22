// @flow

import {assertNodeType} from "../../parseNode";

import type {AnyParseNode, ParseNode} from "../../parseNode";
import type {FunctionContext} from "../../defineFunction";

const groupByComma = (node: AnyParseNode): AnyParseNode[][] => {
    if (node.type !== "ordgroup") {
        return [[node]];
    }

    // Dives into the body list of this ParseNode<"ordgroup">, then groups the
    // member nodes using comma as the delimiter:
    // ["1", "+", "a", ",", "n"] => [ ["1", "+", "a" ], ["n"] ]
    const nodesArr = assertNodeType(node, "ordgroup").body;
    const res = [];
    let currentChunk: AnyParseNode[] = [];
    for (let i = 0; i < nodesArr.length; ++i) {
        const e: AnyParseNode = nodesArr[i];
        const isDelimiter = e.type === "atom" && e.text === ",";
        if (!isDelimiter) {
            currentChunk.push(e);
        }
        if (isDelimiter || i === nodesArr.length - 1) {
            res.push(currentChunk);
            currentChunk = [];
        }
    }
    return res;
};

const MATH_ONE: ParseNode<"textord"> = {
    type: "textord",
    mode: "math",
    text: "1",
};
const PLACEHOLDER: ParseNode<"textord"> = {
    type: "textord",
    mode: "math",
    text: "\\square",
};

export function derivativeHandler(
    {parser, funcName}: FunctionContext,
    args: AnyParseNode[],
    optArgs: (?AnyParseNode)[],
): ParseNode<"genfrac"> {
    const makeOrdGroup =
        (bodyArr: AnyParseNode[]): ParseNode<"ordgroup"> => ({
            type: "ordgroup",
            mode: parser.mode,
            body: bodyArr,
        });

    const func = args[0];
    const vars = args[1];

    const lowerDiffOrder: AnyParseNode =
        optArgs[0] ?? makeOrdGroup([MATH_ONE]);
    const totalDiffOrder: AnyParseNode =
        optArgs[1] ?? lowerDiffOrder;

    let symbol;
    switch (funcName) {
        case "\\dv":
        case "\\odv":
            symbol = "d";
            break;
        case "\\pdv":
            symbol = "\\partial";
            break;
        default:
            throw new Error("Unrecognized differential command");
    }

    const dVars = groupByComma(vars);
    const numVar = dVars.length;
    const dIndices = groupByComma(lowerDiffOrder);
    const numIndices = dIndices.length;

    if (numVar < numIndices) {
        dVars.push(...Array(numIndices - numVar).fill([PLACEHOLDER]));
    } else if (numVar > numIndices) {
        dIndices.push(...Array(numVar - numIndices).fill([PLACEHOLDER]));
    }

    const makeDGroup = (base, sup) => {
        if (!sup) {
            return base;
        }
        if (sup.type === "ordgroup") {
            const supBody = ((sup: any): ParseNode<"ordgroup">).body;
            if (supBody.length === 0) {
                supBody.push(PLACEHOLDER);
            } else if (supBody.length === 1
                && supBody[0].mode === "math"
                && supBody[0].text === "1") {
                return base;  // Omit the index if derivative order is 1.
            }
        }
        return {
            type: "supsub",
            mode: parser.mode,
            base,
            sup,
        };
    };
    const d = {
        type: "textord",
        mode: parser.mode,
        text: symbol,
    };

    const numer = makeOrdGroup([
        makeDGroup(d, totalDiffOrder), func]);
    const denom = makeOrdGroup(dVars.map((variable: AnyParseNode[], i) => {
        const index: AnyParseNode[] = dIndices[i];
        return makeDGroup(
            makeOrdGroup([d].concat(makeOrdGroup(variable))),
            makeOrdGroup(index),
        );
    }));

    return {
        type: "genfrac",
        mode: parser.mode,
        continued: false,
        numer,
        denom,
        hasBarLine: true,
        leftDelim: null,
        rightDelim: null,
        size: "auto",
        barSize: null,
    };
}
