// @flow
import defineFunction from "../defineFunction";
import {assertNodeType} from "../parseNode";
import {convertSize} from "../units";
import ParseError from "../ParseError";

import type {NumericParseNode} from "../parseNode";
import type {Measurement} from "../units";

const addSize = (s1: Measurement, s2: Measurement): Measurement => {
    if (s1.unit.length < s2.unit.length) {
        const temp = s1;
        s1 = s2;
        s2 = temp;
    }
    let number = s1.number;
    if (s1.unit === s2.unit) {
        number += s2.number;
    } else if (s1.unit.length === 2) {
        number += convertSize(s2, s1.unit);
    }
    return {number, unit: s1.unit};
};

export const multiplySize = (size: Measurement, number: number): Measurement => {
    return {number: size.number * number, unit: size.unit};
};

export const multiply = (
    value: NumericParseNode,
    number: number,
): NumericParseNode => {
    switch (value.type) {
        case "integer":
            return {
                type: "integer",
                mode: "text",
                // Division of a positive integer by a positive integer discards
                // the remainder, and the sign of the result changes if you change
                // the sign of either operand.
                value: value.value * number | 0,
            };
        case "dimen":
            return {
                type: "dimen",
                mode: "text",
                value: multiplySize(value.value, number),
            };
        case "glue":
            return {
                type: "glue",
                mode: value.mode,
                value: multiplySize(value.value, number),
                stretch: multiplySize(value.stretch, number),
                shrink: multiplySize(value.shrink, number),
            };
        default:
            throw new ParseError("Unknown parseNode type");
    }
};

const add = (
    v1: NumericParseNode,
    v2: NumericParseNode,
): NumericParseNode => {
    switch (v1.type) {
        case "integer":
            v2 = assertNodeType(v2, v1.type);
            return {
                type: "integer",
                mode: "text",
                value: v1.value + v2.value,
            };
        case "dimen":
            v2 = assertNodeType(v2, v1.type);
            return {
                type: "dimen",
                mode: "text",
                value: addSize(v1.value, v2.value),
            };
        case "glue":
            v2 = assertNodeType(v2, v1.type);
            return {
                type: "glue",
                mode: v1.mode,
                value: addSize(v1.value, v2.value),
                stretch: addSize(v1.stretch, v2.stretch),
                shrink: addSize(v1.shrink, v2.shrink),
            };
        default:
            throw new ParseError("Unknown parseNode type");
    }
};

defineFunction({
    type: "internal",
    names: [
        "\\advance", "\\multiply", "\\divide",
        // following can’t be entered directly
        "\\\\globaladvance", "\\\\globalmultiply", "\\\\globaldivide",
    ],
    props: {
        numArgs: 0,
        allowedInText: true,
    },
    handler({parser, funcName}) {
        const variable = parser.getVariable();
        if (variable == null)  {
            throw new ParseError("Expected a variable");
        }
        parser.consumeKeyword(["by"]); // consume optional by
        const varType = variable.type;
        const varValue = variable.value;
        const global = funcName.indexOf("global") >= 0;
        funcName = funcName.replace("\\global", "");

        let value;
        if (varType === "integer" || funcName !== "\\advance") {
            const number = assertNodeType(
                parser.parseIntegerOrVariable(), "integer");
            switch (funcName) {
                case "\\advance": // varType === "integer"
                    value = add(varValue, number);
                    break;
                case "\\multiply":
                    value = multiply(varValue, number.value);
                    break;
                case "\\divide":
                    value = multiply(varValue, 1 / number.value);
                    break;
                default:
                    throw new ParseError("Unknown arithmetic function");
            }
        } else if (variable.type === "dimen") {
            value = add(varValue, parser.parseDimenOrVariable());
        } else {
            value = add(varValue, parser.parseGlue(varType));
        }
        parser.gullet.macros.set(variable.name, value, global);
        return {
            type: "internal",
            mode: parser.mode,
        };
    },
});
