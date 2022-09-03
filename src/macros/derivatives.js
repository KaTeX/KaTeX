// @flow
/**
 * Macro utilities for assembling derivatives.
 */

import type {MacroContextInterface} from "../defineMacro";

function splitByTopLevelComma(s: string): string[] {
    if (!s || s.length === 0) {
        return [];
    }

    // "1+a,n"         => ["1+a", "n"]
    // "1+a,{n,m}"     => ["1+a", "{n,m}"]
    // "1+a,{n,{p,q}}" => ["1+a", "{n,{p,q}}"]
    // "1+a"           => ["1+a"]
    // "1+a,,n"        => ["1+a", "", "n"]
    // "1+a,,"         => ["1+a", ""]
    // "1+a,"          => ["1+a"]
    // ","             => [""]
    // ""              => []
    const res = [];
    let currentStr = "";
    let braceDepth = 0;
    const isTopLevelDelimiter = (c) => c === "," && braceDepth <= 0;
    for (let i = 0; i < s.length; ++i) {
        const c = s[i];
        if (c === "{") {
            ++braceDepth;
        } else if (c === "}") {
            --braceDepth;
        }
        if (!isTopLevelDelimiter(c)) {
            currentStr += c;
        }
        if (isTopLevelDelimiter(c) || i === s.length - 1) {
            res.push(currentStr);
            currentStr = "";
        }
    }

    return res;
}

const maybeAddBrace = (s: string) => s.length > 1 ? `{${s}}` : s;

function extractArgs(context: MacroContextInterface): {
    func: string,
    vars: string[],
    totalOrders: string[],
    varOrders: string[],
} {
    const optionalArgGroups = [];
    let arg = context.consumeArg().tokens;
    while (arg.length === 1 && arg[0].text === "[") {
        let bracketContent = '';
        let token = context.expandNextToken();
        while (token.text !== "]" && token.text !== "EOF") {
            bracketContent += token.text;
            token = context.expandNextToken();
        }
        optionalArgGroups.push(splitByTopLevelComma(bracketContent).reverse());
        arg = context.consumeArg().tokens;
    }

    const func = arg.reverse().map(
        e => e.text.length > 1 ? `{${e.text}}` : e.text).join("");
    arg = context.consumeArg().tokens;
    const vars = splitByTopLevelComma(arg.reverse().map(
        e => maybeAddBrace(e.text)).join(""));
    const varOrders =
        optionalArgGroups[0] ? optionalArgGroups[0].reverse() : ["1"];
    const totalOrders =
        optionalArgGroups[1] ? optionalArgGroups[1].reverse() : varOrders;

    return {func, vars, totalOrders, varOrders};
}

const PLACEHOLDER = "\\square";

export function assembleDerivativeExpr(
    d: string, context: MacroContextInterface): string {
    const {func, vars, totalOrders, varOrders} = extractArgs(context);
    const numVars = vars.length;
    const numVarOrders = varOrders.length;
    if (numVars > numVarOrders) {
        varOrders.push(...Array(numVars - numVarOrders).fill(PLACEHOLDER));
    } else if (numVarOrders > numVars) {
        vars.push(...Array(numVarOrders - numVars).fill(PLACEHOLDER));
    }

    const makeIndex = (s) => s === "1" ? "" : `^${maybeAddBrace(s)}`;
    const numer = `{${d}}${makeIndex(totalOrders[0] ?? PLACEHOLDER)}{${func}}`;
    const denom = vars.map((variable, i) => {
        const order = varOrders[i];
        return `{${d}}{${variable}}${makeIndex(order)}`;
    }).join("");
    return `\\frac{${numer}}{${denom}}`;
}
