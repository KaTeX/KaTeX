// @flow
import ParseError from "../ParseError";

import type {NumericParseNode} from "../parseNode";
import type {Measurement} from "../units";

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
