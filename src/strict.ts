/* eslint no-console:0 */
import type {Token} from "./Token";
import type {AnyParseNode} from "./types/nodes";
import ParseError from "./ParseError";

export type Strict = boolean | "ignore" | "warn" | "error" | StrictFunction;

export type StrictFunction =
    (errorCode: string, errorMsg: string, token?: Token | AnyParseNode) =>
        (boolean | "ignore" | "warn" | "error") | undefined;

export type StrictParameters<R extends boolean = boolean> = {
    strictSetting: Strict;
    errorCode: string;
    errorMessage: string;
    report: R;
    token?: Token | AnyParseNode;
};

export function handleStrict(params: StrictParameters<true>): void;
export function handleStrict(params: StrictParameters<false>): boolean;
export function handleStrict(params: StrictParameters): void | boolean {
    const {strictSetting, errorCode, errorMessage, token, report} = params;
    let strict: Strict | ReturnType<StrictFunction> = strictSetting;

    if (typeof strictSetting === "function") {
        strict = invokeStrictFunction(strictSetting, errorCode, errorMessage, report, token);
    }

    switch (strict) {
        case true:
        case "error":
            if (report) {
                throw new ParseError(
                    "LaTeX-incompatible input and strict mode is set to 'error': " +
                    `${errorMessage} [${errorCode}]`, token);
            } else {
                return true;
            }
        case "warn":
            typeof console !== "undefined" && console.warn(
                "LaTeX-incompatible input and strict mode is set to 'warn': " +
                `${errorMessage} [${errorCode}]`);

            if (!report) {
                return false;
            }
            break;
        case undefined:
        case false:
        case "ignore":
        default:
            if (!report) {
                return false;
            }
            break;
    }
}

const invokeStrictFunction = (
    strictFn: StrictFunction,
    errorCode: string,
    errorMessage: string,
    report: boolean,
    token?: Token | AnyParseNode
) => {
    if (report) {
        return strictFn(errorCode, errorMessage, token);
    }

    try {
        return strictFn(errorCode, errorMessage, token);
    } catch (error) {
        return "error";
    }
};
