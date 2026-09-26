/* eslint no-console:0 */
import type {Token} from "./Token";
import type {AnyParseNode} from "./types/nodes";
import ParseError from "./ParseError";

export type Strict = boolean | "ignore" | "warn" | "error" | StrictFunction;

export type StrictFunction =
    (errorCode: string, errorMsg: string, token?: Token | AnyParseNode) =>
        Exclude<Strict, StrictFunction>;

export type StrictParameters<R extends boolean = boolean> = {
    strict: Strict;
    errorCode: string;
    errorMsg: string;
    report: R;
    token?: Token | AnyParseNode;
};

/**
 * Dispatch LaTeX-incompatible (nonstrict) input according to the `strict`
 * setting.  Can safely not be called if `strict` is `false`.
 *
 * With `report: true`, reports the transgression and returns nothing:
 * `"error"`/`true` throws a `ParseError`, `"warn"` warns via `console.warn`,
 * and `"ignore"`/`false` does nothing.  An exception thrown by a `strict`
 * callback propagates to the caller.
 *
 * With `report: false`, checks whether to apply strict (LaTeX-adhering)
 * behavior for unusual input (like `\\`) and never throws: `"error"`/`true`
 * returns `true`, `"ignore"`/`false` returns `false`, and `"warn"` warns and
 * returns `false`.  An exception thrown by a `strict` callback is treated as
 * `"error"`.  This is for the second category of `errorCode`s listed in
 * `docs/options.md`.
 */
export function handleStrict(params: StrictParameters<true>): void;
export function handleStrict(params: StrictParameters<false>): boolean;
export function handleStrict(params: StrictParameters): void | boolean {
    const {strict, errorCode, errorMsg, token, report} = params;
    let behavior: Strict | ReturnType<StrictFunction> = strict;

    if (typeof strict === "function") {
        if (report) {
            behavior = strict(errorCode, errorMsg, token);
        } else {
            try {
                behavior = strict(errorCode, errorMsg, token);
            } catch (error) {
                behavior = "error";
            }
        }
    }

    switch (behavior) {
        case true:
        case "error":
            if (report) {
                throw new ParseError(
                    "LaTeX-incompatible input and strict mode is set to 'error': " +
                    `${errorMsg} [${errorCode}]`, token);
            } else {
                return true;
            }
        case false:
        case "ignore":
            if (!report) {
                return false;
            }
            break;
        case "warn":
        default:
            typeof console !== "undefined" && console.warn(
                "LaTeX-incompatible input and strict mode is set to 'warn': " +
                `${errorMsg} [${errorCode}]`);

            if (!report) {
                return false;
            }
            break;
    }
}
