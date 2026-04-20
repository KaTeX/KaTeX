import defineFunction from "../defineFunction";
import {makeSpan} from "../buildCommon";
import {MathNode} from "../mathMLTree";
import ParseError from "../ParseError";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

import type Options from "../Options";
import type Parser from "../Parser";
import type {AnyParseNode, ParseNode} from "../parseNode";

/**
 * Practical siunitx-compatible support for:
 *   - \sisetup{...}
 *   - \num{...}
 *   - \numlist{...}
 *   - \numproduct{...}
 *   - \duration{...}
 *   - \complexnum{...}
 *   - \si{...}
 *   - \unit{...}
 *   - \SI{...}{...}
 *   - \qty{...}{...}
 *   - \complexqty{...}{...}
 *   - \qtylist{...}{...}
 *   - \qtyproduct{...}{...}
 *   - \ang{...}
 *   - \numrange{...}{...}
 *   - \SIrange{...}{...}{...}
 *   - \qtyrange{...}{...}{...}
 */

type SiunitxNode = ParseNode<"siunitx">;

// -----------------------------
// Option parsing / state
// -----------------------------

type PerMode =
    "power" |
    "power-positive-first" |
    "symbol" |
    "repeated-symbol" |
    "single-symbol" |
    "fraction" |
    "reciprocal";
type StylePerMode =
    "auto" |
    "power" |
    "power-positive-first" |
    "symbol" |
    "repeated-symbol" |
    "single-symbol" |
    "fraction";
type ScientificNotation = "auto" | "fixed" | "engineering";
type ExponentMode = "input" | "fixed" | "engineering" | "scientific" | "threshold";
type ProductMode = "symbol" | "phrase";
type ProductUnitsMode = "single" | "repeat" | "bracket" | "power" |
    "bracket-power";
type ComplexMode = "input" | "cartesian" | "polar";
type ComplexRootPosition = "before-number" | "after-number";
type ComplexAngleUnit = "degrees" | "radians";
type RoundMode = "off" | "places";
type AngleMode = "input" | "arc" | "decimal";
type DurationMode = "input" | "component" | "decimal";
type QualifierMode = "subscript" | "bracket";
type PrefixMode = "input" | "combine-exponent" | "extract-exponent";
type DeclaredUnit = {
    symbol: string;
    options: string;
};
type DeclaredPrefix = {
    symbol: string;
    exponent: number;
};

type SiunitxOptions = {
    "detect-all": boolean;
    "separate-uncertainty": boolean;
    "input-open-uncertainty": string;
    "input-close-uncertainty": string;
    "input-uncertainty-signs": string[];
    "input-uncertainty-divider": string;
    "input-digits": string[];
    "group-digits": boolean;
    "group-separator": string;
    "group-minimum-digits": number;
    "input-decimal-markers": string[];
    "output-decimal-marker": string;
    "exponent-product": string;
    "retain-explicit-decimal-marker": boolean;
    "retain-explicit-plus": boolean;
    "retain-zero-uncertainty": boolean;
    "retain-negative-zero": boolean;
    "evaluate-expression": boolean;
    "expression": string;
    "exponent-mode": ExponentMode;
    "fixed-exponent": number;
    "scientific-notation": ScientificNotation;
    "per-mode": PerMode;
    "display-per-mode": StylePerMode;
    "inline-per-mode": StylePerMode;
    "per-symbol": string;
    "fraction-command": string;
    "bracket-unit-denominator": boolean;
    "sticky-per": boolean;
    "per-symbol-script-correction": string;
    "multi-part-units": "brackets" | "single";
    "inter-unit-product": string;
    "number-unit-separator": string;
    "range-units": "single" | "repeat" | "bracket";
    "range-phrase": string;
    "forbid-literal-units": boolean;
    "list-separator": string;
    "list-pair-separator": string;
    "list-final-separator": string;
    "product-mode": ProductMode;
    "product-units": ProductUnitsMode;
    "product-symbol": string;
    "product-phrase": string;
    "list-units": "single" | "repeat" | "bracket";
    "complex-mode": ComplexMode;
    "complex-root-position": ComplexRootPosition;
    "complex-angle-unit": ComplexAngleUnit;
    "complex-symbol-degree": string;
    "complex-phase-command": string;
    "input-complex-root": string;
    "output-complex-root": string;
    "print-complex-unity": boolean;
    "round-mode": RoundMode;
    "round-precision": number;
    "angle-mode": AngleMode;
    "fill-angle-degrees": boolean;
    "fill-angle-minutes": boolean;
    "fill-angle-seconds": boolean;
    "duration-mode": DurationMode;
    "duration-separator": string;
    "fill-duration-hours": boolean;
    "fill-duration-minutes": boolean;
    "fill-duration-seconds": boolean;
    "duration-unit-hour": string;
    "duration-unit-minute": string;
    "duration-unit-second": string;
    "parse-numbers": boolean;
    "parse-units": boolean;
    "qualifier-mode": QualifierMode;
    "qualifier-phrase": string;
    "power-half-as-sqrt": boolean;
    "prefix-mode": PrefixMode;
    "extract-mass-in-kilograms": boolean;
    "__declared-units__"?: Record<string, DeclaredUnit>;
    "__declared-prefixes__"?: Record<string, DeclaredPrefix>;
    "__declared-powers-before__"?: Record<string, string>;
    "__declared-powers-after__"?: Record<string, string>;
    "__declared-qualifiers__"?: Record<string, string>;
};

const DEFAULT_OPTIONS: SiunitxOptions = {
    "detect-all": false,
    "separate-uncertainty": false,
    "input-open-uncertainty": "(",
    "input-close-uncertainty": ")",
    "input-uncertainty-signs": ["+-", "\\pm", "±"],
    "input-uncertainty-divider": ":",
    "input-digits": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    "group-digits": true,
    "group-separator": " ",
    "group-minimum-digits": 5,
    "input-decimal-markers": [".", ","],
    "output-decimal-marker": ".",
    "exponent-product": "×",
    "retain-explicit-decimal-marker": false,
    "retain-explicit-plus": false,
    "retain-zero-uncertainty": false,
    "retain-negative-zero": false,
    "evaluate-expression": false,
    "expression": "#1",
    "exponent-mode": "input",
    "fixed-exponent": 0,
    "scientific-notation": "auto",
    "per-mode": "power",
    "display-per-mode": "auto",
    "inline-per-mode": "auto",
    "per-symbol": "/",
    "fraction-command": "\\frac",
    "bracket-unit-denominator": true,
    "sticky-per": false,
    "per-symbol-script-correction": "\\!",
    "multi-part-units": "single",
    "inter-unit-product": " ",
    "number-unit-separator": " ",
    "range-units": "single",
    "range-phrase": "-",
    "forbid-literal-units": false,
    "list-separator": ", ",
    "list-pair-separator": " and ",
    "list-final-separator": " and ",
    "product-mode": "symbol",
    "product-units": "repeat",
    "product-symbol": "×",
    "product-phrase": " by ",
    "list-units": "single",
    "complex-mode": "input",
    "complex-root-position": "after-number",
    "complex-angle-unit": "degrees",
    "complex-symbol-degree": "\\degree",
    "complex-phase-command": "\\angle",
    "input-complex-root": "ij",
    "output-complex-root": "\\mathrm{i}",
    "print-complex-unity": false,
    "round-mode": "off",
    "round-precision": 2,
    "angle-mode": "input",
    "fill-angle-degrees": false,
    "fill-angle-minutes": false,
    "fill-angle-seconds": false,
    "duration-mode": "input",
    "duration-separator": " ",
    "fill-duration-hours": false,
    "fill-duration-minutes": false,
    "fill-duration-seconds": false,
    "duration-unit-hour": "h",
    "duration-unit-minute": "min",
    "duration-unit-second": "s",
    "parse-numbers": true,
    "parse-units": true,
    "qualifier-mode": "subscript",
    "qualifier-phrase": " ",
    "power-half-as-sqrt": false,
    "prefix-mode": "input",
    "extract-mass-in-kilograms": true,
    "__declared-units__": {},
    "__declared-prefixes__": {},
    "__declared-powers-before__": {},
    "__declared-powers-after__": {},
    "__declared-qualifiers__": {},
};

const SIUNITX_OPTIONS_MACRO = "\\@siunitx@options";
const QUALIFIER_MARKER = "__SIQ__";
const SQRT_MARKER = "__SISQRT__";
const POWER_MARKER = "__SIPOW__";
const POWER_FRAC_MARKER = "__SIPOWFRAC__";
const ASYM_UNCERT_MARKER = "__SIASYM__";
const DIGIT_PI_MARKER = "__SIDIGPI__";
const DIGIT_DOTS_MARKER = "__SIDIGDOTS__";

const parseBoolean = (v: string): boolean => {
    const x = v.trim().toLowerCase();
    if (x === "true" || x === "t" || x === "yes" || x === "y" || x === "on") {
        return true;
    }
    if (x === "false" || x === "f" || x === "no" || x === "n" || x === "off") {
        return false;
    }
    throw new Error(`Invalid boolean "${v}"`);
};

const splitOptionItems = (src: string): string[] => {
    const items: string[] = [];
    let depth = 0;
    let start = 0;

    for (let i = 0; i < src.length; i++) {
        const ch = src[i];
        if (ch === "{") {
            depth++;
        } else if (ch === "}") {
            depth = Math.max(0, depth - 1);
        } else if (ch === "," && depth === 0) {
            items.push(src.slice(start, i).trim());
            start = i + 1;
        }
    }
    items.push(src.slice(start).trim());
    return items.filter(Boolean);
};

const splitListItems = (src: string): string[] => {
    const parts = src.split(";").map((item) => item.trim());
    if (parts.length <= 1) {
        return src.trim() ? [src.trim()] : [];
    }
    return parts.filter(Boolean);
};

const unwrapBraces = (value: string): string => {
    let s = value.trim();
    while (s.startsWith("{") && s.endsWith("}")) {
        let depth = 0;
        let wrapsWholeString = true;
        for (let i = 0; i < s.length; i++) {
            if (s[i] === "{") {
                depth++;
            } else if (s[i] === "}") {
                depth--;
            }
            if (depth === 0 && i < s.length - 1) {
                wrapsWholeString = false;
                break;
            }
            if (depth < 0) {
                wrapsWholeString = false;
                break;
            }
        }
        if (!wrapsWholeString) {
            break;
        }
        // Preserve interior spaces (e.g. "{\\ }" control-space option values).
        s = s.slice(1, -1);
    }
    return s;
};

const parseTextLikeOption = (value: string): string => {
    let out = value;
    // Convert common TeX-ish spacing/markup commands used in siunitx setup.
    out = out.replace(/\\allowbreak/g, "");
    out = out.replace(/\\mskip\+?3mu\\relax/g, " ");
    out = out.replace(/\\ensuremath\{([^}]*)\}/g, "$1");
    out = out.replace(/\\text\{([^}]*)\}/g, "$1");
    out = out.replace(/\\mathrm\{([^}]*)\}/g, "$1");
    out = out.replace(/\\cdot/g, "⋅");
    out = out.replace(/\\times/g, "×");
    out = out.replace(/\\,/g, " ");
    // TeX control-space means a non-breaking space in rendered output.
    out = out.replace(/\\ /g, "\u00A0");
    out = out.replace(/\{\}/g, "");
    out = out.replace(/[{}]/g, "");
    return out.replace(/[ \t\r\n]+/g, " ");
};

const parseInputDecimalMarkers = (value: string): string[] => {
    const cleaned = parseTextLikeOption(value).trim();
    if (!cleaned) {
        return [".", ","];
    }
    const out: string[] = [];
    for (const ch of cleaned) {
        if ((ch === "." || ch === ",") && !out.includes(ch)) {
            out.push(ch);
        }
    }
    return out.length > 0 ? out : ["."];
};

const parseInputDigits = (value: string): string[] => {
    const cleaned = value.replace(/\s+/g, "");
    if (!cleaned) {
        return ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    }
    const tokens: string[] = cleaned.match(/\\[a-zA-Z@]+|\\.|./g) || [];
    if (tokens.includes("\\dots") && !tokens.includes("\\ldots")) {
        tokens.push("\\ldots");
    }
    return tokens.length > 0
        ? tokens
        : ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
};

const parsePerMode = (value: string, keyName: string): PerMode => {
    const v = value as PerMode;
    if (
        v !== "power" &&
        v !== "power-positive-first" &&
        v !== "symbol" &&
        v !== "repeated-symbol" &&
        v !== "single-symbol" &&
        v !== "fraction" &&
        v !== "reciprocal"
    ) {
        throw new Error(`Invalid ${keyName} "${value}"`);
    }
    return v;
};

const parseStylePerMode = (value: string, keyName: string): StylePerMode => {
    if (value === "auto") {
        return "auto";
    }
    const parsed = parsePerMode(value, keyName);
    return parsed === "reciprocal" ? "power" : parsed;
};

const parseOptions = (src: string, base?: SiunitxOptions): SiunitxOptions => {
    const opts: SiunitxOptions = Object.assign({}, base || DEFAULT_OPTIONS);
    const s = (src || "").trim();
    if (!s) {
        return opts;
    }

    const items = splitOptionItems(s);

    for (const item of items) {
        const eq = item.indexOf("=");
        const key = (eq >= 0 ? item.slice(0, eq) : item).trim();
        const rawValue = unwrapBraces(
            (eq >= 0 ? item.slice(eq + 1) : "true").trim(),
        );

        switch (key) {
            case "detect-all":
                opts["detect-all"] = parseBoolean(rawValue);
                break;
            case "separate-uncertainty":
                opts["separate-uncertainty"] = parseBoolean(rawValue);
                break;
            case "input-open-uncertainty":
                opts["input-open-uncertainty"] = parseTextLikeOption(rawValue) || "(";
                break;
            case "input-close-uncertainty":
                opts["input-close-uncertainty"] = parseTextLikeOption(rawValue) || ")";
                break;
            case "input-uncertainty-signs": {
                const parsed = parseTextLikeOption(rawValue).trim();
                const signs = parsed
                    ? parsed.split(/\s+/).filter(Boolean)
                    : ["+-", "\\pm", "±"];
                opts["input-uncertainty-signs"] = signs;
                break;
            }
            case "input-uncertainty-divider":
                opts["input-uncertainty-divider"] =
                    parseTextLikeOption(rawValue) || ":";
                break;
            case "input-digits":
                opts["input-digits"] = parseInputDigits(rawValue);
                break;
            case "group-digits":
                opts["group-digits"] = parseBoolean(rawValue);
                break;
            case "group-separator":
                opts["group-separator"] = parseTextLikeOption(rawValue);
                break;
            case "group-minimum-digits": {
                const n = Number(rawValue);
                if (!Number.isFinite(n) || n < 1) {
                    throw new Error(
                        `Invalid group-minimum-digits "${rawValue}"`,
                    );
                }
                opts["group-minimum-digits"] = Math.floor(n);
                break;
            }
            case "input-decimal-markers":
                opts["input-decimal-markers"] = parseInputDecimalMarkers(rawValue);
                break;
            case "output-decimal-marker":
                opts["output-decimal-marker"] = rawValue || ".";
                break;
            case "exponent-product":
                opts["exponent-product"] = parseTextLikeOption(rawValue) || "×";
                break;
            case "retain-explicit-decimal-marker":
                opts["retain-explicit-decimal-marker"] = parseBoolean(rawValue);
                break;
            case "retain-explicit-plus":
                opts["retain-explicit-plus"] = parseBoolean(rawValue);
                break;
            case "retain-zero-uncertainty":
                opts["retain-zero-uncertainty"] = parseBoolean(rawValue);
                break;
            case "retain-negative-zero":
                opts["retain-negative-zero"] = parseBoolean(rawValue);
                break;
            case "evaluate-expression":
                opts["evaluate-expression"] = parseBoolean(rawValue);
                break;
            case "expression":
                opts["expression"] = rawValue || "#1";
                break;
            case "exponent-mode": {
                const v = rawValue as ExponentMode;
                if (
                    v !== "input" &&
                    v !== "fixed" &&
                    v !== "engineering" &&
                    v !== "scientific" &&
                    v !== "threshold"
                ) {
                    throw new Error(`Invalid exponent-mode "${rawValue}"`);
                }
                opts["exponent-mode"] = v;
                break;
            }
            case "fixed-exponent": {
                const n = Number(rawValue);
                if (!Number.isFinite(n)) {
                    throw new Error(`Invalid fixed-exponent "${rawValue}"`);
                }
                opts["fixed-exponent"] = Math.trunc(n);
                break;
            }
            case "scientific-notation": {
                const v = rawValue as ScientificNotation;
                if (v !== "auto" && v !== "fixed" && v !== "engineering") {
                    throw new Error(
                        `Invalid scientific-notation "${rawValue}"`,
                    );
                }
                opts["scientific-notation"] = v;
                break;
            }
            case "per-mode": {
                opts["per-mode"] = parsePerMode(rawValue, "per-mode");
                break;
            }
            case "display-per-mode": {
                opts["display-per-mode"] =
                    parseStylePerMode(rawValue, "display-per-mode");
                break;
            }
            case "inline-per-mode": {
                opts["inline-per-mode"] =
                    parseStylePerMode(rawValue, "inline-per-mode");
                break;
            }
            case "per-symbol":
                opts["per-symbol"] = parseTextLikeOption(rawValue) || "/";
                break;
            case "fraction-command":
                opts["fraction-command"] = rawValue || "\\frac";
                break;
            case "bracket-unit-denominator":
                opts["bracket-unit-denominator"] = parseBoolean(rawValue);
                break;
            case "sticky-per":
                opts["sticky-per"] = parseBoolean(rawValue);
                break;
            case "per-symbol-script-correction":
                opts["per-symbol-script-correction"] = rawValue || "\\!";
                break;
            case "multi-part-units":
                opts["multi-part-units"] = rawValue === "brackets"
                    ? "brackets"
                    : "single";
                break;
            case "inter-unit-product":
                opts["inter-unit-product"] = parseTextLikeOption(rawValue);
                break;
            case "quantity-product":
            case "number-unit-product":
            case "number-unit-separator":
                opts["number-unit-separator"] = parseTextLikeOption(rawValue);
                break;
            case "range-units":
                opts["range-units"] = rawValue === "repeat"
                    ? "repeat"
                    : rawValue === "bracket"
                    ? "bracket"
                    : "single";
                break;
            case "range-phrase":
            case "range-phrase-text":
                opts["range-phrase"] = parseTextLikeOption(rawValue) || "-";
                break;
            case "forbid-literal-units":
                opts["forbid-literal-units"] = parseBoolean(rawValue);
                break;
            case "parse-numbers":
                opts["parse-numbers"] = parseBoolean(rawValue);
                break;
            case "parse-units":
                opts["parse-units"] = parseBoolean(rawValue);
                break;
            case "list-separator":
                opts["list-separator"] = parseTextLikeOption(rawValue) || ", ";
                break;
            case "list-pair-separator":
                opts["list-pair-separator"] =
                    parseTextLikeOption(rawValue) || " and ";
                break;
            case "list-final-separator":
                opts["list-final-separator"] =
                    parseTextLikeOption(rawValue) || " and ";
                break;
            case "product-mode": {
                const v = rawValue as ProductMode;
                if (v !== "symbol" && v !== "phrase") {
                    throw new Error(`Invalid product-mode "${rawValue}"`);
                }
                opts["product-mode"] = v;
                break;
            }
            case "product-units":
                opts["product-units"] =
                    rawValue === "repeat"
                        ? "repeat"
                        : rawValue === "bracket"
                        ? "bracket"
                        : rawValue === "power"
                        ? "power"
                        : rawValue === "bracket-power"
                        ? "bracket-power"
                        : "single";
                break;
            case "product-symbol":
                opts["product-symbol"] = parseTextLikeOption(rawValue) || "×";
                break;
            case "product-phrase":
                opts["product-phrase"] = parseTextLikeOption(rawValue) || " by ";
                break;
            case "list-units":
                opts["list-units"] = rawValue === "repeat"
                    ? "repeat"
                    : rawValue === "bracket"
                    ? "bracket"
                    : "single";
                break;
            case "complex-mode": {
                const v = rawValue as ComplexMode;
                if (v !== "input" && v !== "cartesian" && v !== "polar") {
                    throw new Error(`Invalid complex-mode "${rawValue}"`);
                }
                opts["complex-mode"] = v;
                break;
            }
            case "complex-root-position":
                opts["complex-root-position"] =
                    rawValue === "before-number" ? "before-number" : "after-number";
                break;
            case "complex-angle-unit":
                opts["complex-angle-unit"] =
                    rawValue === "radians" ? "radians" : "degrees";
                break;
            case "complex-symbol-degree":
                opts["complex-symbol-degree"] = rawValue || "\\degree";
                break;
            case "complex-phase-command":
                opts["complex-phase-command"] = rawValue || "\\angle";
                break;
            case "input-complex-root":
                opts["input-complex-root"] =
                    parseTextLikeOption(rawValue).replace(/\s+/g, "") || "ij";
                break;
            case "output-complex-root":
                opts["output-complex-root"] = rawValue || "\\mathrm{i}";
                break;
            case "print-complex-unity":
                opts["print-complex-unity"] = parseBoolean(rawValue);
                break;
            case "round-mode":
                opts["round-mode"] = rawValue === "places" ? "places" : "off";
                break;
            case "round-precision": {
                const n = Number(rawValue);
                if (!Number.isFinite(n) || n < 0) {
                    throw new Error(`Invalid round-precision "${rawValue}"`);
                }
                opts["round-precision"] = Math.floor(n);
                break;
            }
            case "angle-mode": {
                const v = rawValue as AngleMode;
                if (v !== "input" && v !== "arc" && v !== "decimal") {
                    throw new Error(`Invalid angle-mode "${rawValue}"`);
                }
                opts["angle-mode"] = v;
                break;
            }
            case "fill-angle-degrees":
                opts["fill-angle-degrees"] = parseBoolean(rawValue);
                break;
            case "fill-angle-minutes":
                opts["fill-angle-minutes"] = parseBoolean(rawValue);
                break;
            case "fill-angle-seconds":
                opts["fill-angle-seconds"] = parseBoolean(rawValue);
                break;
            case "duration-mode": {
                const v = rawValue as DurationMode;
                if (v !== "input" && v !== "component" && v !== "decimal") {
                    throw new Error(`Invalid duration-mode "${rawValue}"`);
                }
                opts["duration-mode"] = v;
                break;
            }
            case "duration-separator":
                opts["duration-separator"] = parseTextLikeOption(rawValue) || " ";
                break;
            case "fill-duration-hours":
                opts["fill-duration-hours"] = parseBoolean(rawValue);
                break;
            case "fill-duration-minutes":
                opts["fill-duration-minutes"] = parseBoolean(rawValue);
                break;
            case "fill-duration-seconds":
                opts["fill-duration-seconds"] = parseBoolean(rawValue);
                break;
            case "duration-unit-hour":
                opts["duration-unit-hour"] = parseTextLikeOption(rawValue) || "h";
                break;
            case "duration-unit-minute":
                opts["duration-unit-minute"] = parseTextLikeOption(rawValue) || "min";
                break;
            case "duration-unit-second":
                opts["duration-unit-second"] = parseTextLikeOption(rawValue) || "s";
                break;
            case "qualifier-mode":
                opts["qualifier-mode"] = rawValue === "bracket"
                    ? "bracket"
                    : "subscript";
                break;
            case "qualifier-phrase":
                opts["qualifier-phrase"] = parseTextLikeOption(rawValue) || " ";
                break;
            case "power-half-as-sqrt":
                opts["power-half-as-sqrt"] = parseBoolean(rawValue);
                break;
            case "prefix-mode":
                opts["prefix-mode"] = rawValue === "combine-exponent"
                    ? "combine-exponent"
                    : rawValue === "extract-exponent"
                    ? "extract-exponent"
                    : "input";
                break;
            case "extract-mass-in-kilograms":
                opts["extract-mass-in-kilograms"] = parseBoolean(rawValue);
                break;
            default:
                // Unknown keys are ignored for robustness.
                break;
        }
    }

    return opts;
};

const getCurrentOptions = (parser: Parser): SiunitxOptions => {
    const data = parser.gullet.macros.get(SIUNITX_OPTIONS_MACRO);
    if (typeof data !== "string") {
        return Object.assign({}, DEFAULT_OPTIONS);
    }

    try {
        return parseOptions("", JSON.parse(data) as SiunitxOptions);
    } catch {
        return Object.assign({}, DEFAULT_OPTIONS);
    }
};

const setCurrentOptions = (parser: Parser, options: SiunitxOptions) => {
    parser.gullet.macros.set(SIUNITX_OPTIONS_MACRO, JSON.stringify(options), true);
};

const parseControlSequenceName = (raw: string, command: string, label: string): string => {
    const s = raw.trim();
    if (!s.startsWith("\\") || /^\\[{}]$/u.test(s)) {
        throw new Error(`${command} ${label} must be a control sequence`);
    }
    return s.slice(1);
};

const normalizeDeclaredUnitSymbol = (raw: string): string => {
    return raw
        .replace(/\\text\s*\{\s*\\textdegree\s*\}/gu, "°")
        .replace(/\\textdegree/gu, "°")
        .trim();
};

const canonicalOptionKey = (key: string): string => {
    switch (key) {
        case "number-unit-product":
        case "quantity-product":
            return "number-unit-separator";
        case "range-phrase-text":
            return "range-phrase";
        default:
            return key;
    }
};

const extractOptionKeys = (src: string): Set<string> => {
    const keys = new Set<string>();
    const s = (src || "").trim();
    if (!s) {
        return keys;
    }
    for (const item of splitOptionItems(s)) {
        const eq = item.indexOf("=");
        const key = canonicalOptionKey((eq >= 0 ? item.slice(0, eq) : item).trim());
        if (key) {
            keys.add(key);
        }
    }
    return keys;
};

const parseLiteralNumberBody = (
    parser: Parser,
    raw: string,
    command: string,
): AnyParseNode[] => {
    try {
        const ParserCtor = parser.constructor as {
            new(input: string, settings: Parser["settings"]): {parse: () => AnyParseNode[]};
        };
        return new ParserCtor(raw, parser.settings).parse();
    } catch (e) {
        throw new ParseError(
            `Invalid ${command} number when parse-numbers=false: ` +
                `${(e as Error).message}`,
            parser.gullet.future(),
        );
    }
};

const resolvePerModeByStyle = (opts: SiunitxOptions, options: Options): SiunitxOptions => {
    const isDisplayStyle = options.style.id <= 1;
    const stylePerMode = isDisplayStyle
        ? opts["display-per-mode"]
        : opts["inline-per-mode"];
    if (stylePerMode === "auto") {
        return opts;
    }
    return Object.assign({}, opts, {"per-mode": stylePerMode});
};

// -----------------------------
// Number formatting
// -----------------------------

const groupDigits = (digits: string, sep: string): string => {
    let out = "";
    for (let i = 0; i < digits.length; i++) {
        const fromEnd = digits.length - i;
        out += digits[i];
        if (fromEnd > 1 && fromEnd % 3 === 1) {
            out += sep;
        }
    }
    return out;
};

const groupFractionDigits = (digits: string, sep: string): string => {
    let out = "";
    for (let i = 0; i < digits.length; i++) {
        out += digits[i];
        if (i < digits.length - 1 && (i + 1) % 3 === 0) {
            out += sep;
        }
    }
    return out;
};

const renderInputDigitToken = (token: string): string => {
    if (token === "\\pi") {
        return DIGIT_PI_MARKER;
    }
    if (token === "\\dots" || token === "\\ldots") {
        return DIGIT_DOTS_MARKER;
    }
    return token;
};

const tokenizeInputDigits = (
    src: string,
    inputDigits: string[],
): string[] | null => {
    if (src === "") {
        return [];
    }
    const ordered = [...inputDigits].sort((a, b) => b.length - a.length);
    const out: string[] = [];
    let i = 0;
    while (i < src.length) {
        let matched: string | null = null;
        for (const token of ordered) {
            if (!token) {
                continue;
            }
            if (src.startsWith(token, i)) {
                matched = token;
                break;
            }
        }
        if (!matched) {
            return null;
        }
        out.push(matched);
        i += matched.length;
    }
    return out;
};

const groupDigitTokens = (tokens: string[], sep: string): string => {
    let out = "";
    for (let i = 0; i < tokens.length; i++) {
        const fromEnd = tokens.length - i;
        out += renderInputDigitToken(tokens[i]);
        if (fromEnd > 1 && fromEnd % 3 === 1) {
            out += sep;
        }
    }
    return out;
};

const groupFractionDigitTokens = (tokens: string[], sep: string): string => {
    let out = "";
    for (let i = 0; i < tokens.length; i++) {
        out += renderInputDigitToken(tokens[i]);
        if (i < tokens.length - 1 && (i + 1) % 3 === 0) {
            out += sep;
        }
    }
    return out;
};

const normalizeScientific = (
    raw: string,
): {mantissa: string; exponent?: string} => {
    const trimmed = raw.trim();
    const exponentOnly = trimmed.match(/^([+-]?)?[eEdD]\s*([+-]?\d+)$/);
    if (exponentOnly) {
        const sign = exponentOnly[1] || "";
        return {mantissa: `${sign}1`, exponent: exponentOnly[2]};
    }
    // e.g. 1e3, -1.2E+03, 3.1d-2
    const m = trimmed.match(/^(.+?)\s*[eEdD]\s*([+-]?\d+)$/);
    if (!m) {
        return {mantissa: trimmed};
    }
    return {
        mantissa: m[1].trim(),
        exponent: m[2],
    };
};

const normalizeExponent = (expRaw: string, opts: SiunitxOptions): string => {
    let exp = expRaw.trim();
    if (exp.startsWith("+")) {
        exp = opts["retain-explicit-plus"] ? exp : exp.slice(1);
    }
    // Normalize leading zeros in exponent
    const m = exp.match(/^([+-]?)(\d+)$/);
    if (!m) {
        return expRaw;
    }
    const sign = m[1] || "";
    const digits = m[2].replace(/^0+(?=\d)/, "");
    return `${sign}${digits}`;
};

const SUPERSCRIPT_MAP: Record<string, string> = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
    "+": "⁺",
    "-": "⁻",
};

const SUPERSCRIPT_REVERSE_MAP: Record<string, string> = Object.keys(
    SUPERSCRIPT_MAP,
).reduce((acc, key) => {
    acc[SUPERSCRIPT_MAP[key]] = key;
    return acc;
}, {} as Record<string, string>);

const toSuperscript = (value: string): string => {
    let out = "";
    for (const ch of value) {
        out += SUPERSCRIPT_MAP[ch] || ch;
    }
    return out;
};

const splitTrailingSuperscript = (
    token: string,
): {base: string; exponent?: string} => {
    let i = token.length;
    while (i > 0) {
        const ch = token[i - 1];
        if (!SUPERSCRIPT_REVERSE_MAP[ch]) {
            break;
        }
        i--;
    }
    if (i === token.length) {
        return {base: token};
    }
    const sup = token.slice(i);
    let exponent = "";
    for (const ch of sup) {
        exponent += SUPERSCRIPT_REVERSE_MAP[ch] || "";
    }
    return {base: token.slice(0, i), exponent};
};

const escapeRegex = (value: string): string => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const parseDecimalLiteral = (
    value: string,
    opts: SiunitxOptions,
): {num: number; frac: number; normalized: string} | null => {
    const normalized = opts["input-decimal-markers"]
        .reduce(
            (acc, marker) => marker === "." ? acc : acc.split(marker).join("."),
            value.trim(),
        );
    if (!/^[-+]?(?:\d+|\d*\.\d+)$/.test(normalized)) {
        return null;
    }
    const n = Number(normalized);
    if (!Number.isFinite(n)) {
        return null;
    }
    const frac = (normalized.split(".")[1] || "").length;
    return {num: n, frac, normalized};
};

const parseExplicitUncertainty = (
    raw: string,
    opts: SiunitxOptions,
): {baseRaw: string; components: string[]; kind: "paren" | "sign"} | null => {
    const open = opts["input-open-uncertainty"] || "(";
    const close = opts["input-close-uncertainty"] || ")";
    const firstOpen = raw.indexOf(open);
    if (firstOpen > 0) {
        const baseRaw = raw.slice(0, firstOpen).trim();
        const components: string[] = [];
        let i = firstOpen;
        let ok = !!baseRaw;
        while (ok && i < raw.length) {
            while (i < raw.length && /\s/.test(raw[i])) {
                i++;
            }
            if (!raw.startsWith(open, i)) {
                ok = false;
                break;
            }
            const bodyStart = i + open.length;
            const closeIndex = raw.indexOf(close, bodyStart);
            if (closeIndex < 0) {
                ok = false;
                break;
            }
            const body = raw.slice(bodyStart, closeIndex).trim();
            if (!body) {
                ok = false;
                break;
            }
            components.push(body);
            i = closeIndex + close.length;
        }
        while (i < raw.length && /\s/.test(raw[i])) {
            i++;
        }
        if (ok && i === raw.length && components.length > 0) {
            return {baseRaw, components, kind: "paren"};
        }
    }
    const signs = opts["input-uncertainty-signs"] || ["+-", "\\pm", "±"];
    const signAlternation = signs.map(escapeRegex).join("|");
    const hasSign = signAlternation &&
        new RegExp(`(?:${signAlternation})`).test(raw);
    if (hasSign) {
        const splitRegex = new RegExp(`\\s*(?:${signAlternation})\\s*`);
        const tokens = raw.split(splitRegex).map((token) => token.trim());
        if (tokens.length >= 2 && tokens.every((token) => token.length > 0)) {
            const [baseRaw, ...components] = tokens;
            return {baseRaw, components, kind: "sign"};
        }
    }
    return null;
};

const toBracketUncertainty = (
    baseRaw: string,
    uncertaintyRaw: string,
    opts: SiunitxOptions,
): string | null => {
    const base = parseDecimalLiteral(baseRaw, opts);
    const unc = parseDecimalLiteral(uncertaintyRaw, opts);
    if (!base || !unc) {
        return null;
    }
    const targetFrac = Math.max(base.frac, unc.frac);
    const baseFixed = base.num.toFixed(targetFrac);
    const uncScaled = Math.round(Math.abs(unc.num) * (10 ** targetFrac));
    let baseOut = baseFixed;
    if (opts["output-decimal-marker"] !== ".") {
        baseOut = baseOut.replace(".", opts["output-decimal-marker"]);
    }
    return `${formatNum(baseOut, opts)}(${uncScaled})`;
};

const toAsymmetricUncertaintyValues = (
    baseRaw: string,
    uncertaintyRaw: string,
    opts: SiunitxOptions,
): {plus: string; minus: string} | null => {
    const divider = opts["input-uncertainty-divider"] || ":";
    const dividerIndex = uncertaintyRaw.indexOf(divider);
    if (dividerIndex <= 0 ||
        dividerIndex !== uncertaintyRaw.lastIndexOf(divider)) {
        return null;
    }
    const plusRaw = uncertaintyRaw.slice(0, dividerIndex).trim();
    const minusRaw = uncertaintyRaw.slice(dividerIndex + divider.length).trim();
    if (!plusRaw || !minusRaw) {
        return null;
    }
    const baseLiteral = parseDecimalLiteral(baseRaw, opts);
    if (!baseLiteral) {
        return null;
    }
    const integerPair = /^\d+$/.test(plusRaw) && /^\d+$/.test(minusRaw);
    if (integerPair) {
        const fracDigits = baseLiteral.frac;
        const plusNum = Number(plusRaw) / (10 ** fracDigits);
        const minusNum = Number(minusRaw) / (10 ** fracDigits);
        const plusText = fracDigits > 0
            ? plusNum.toFixed(fracDigits)
            : String(plusNum);
        const minusText = fracDigits > 0
            ? minusNum.toFixed(fracDigits)
            : String(minusNum);
        return {
            plus: formatNum(plusText, opts),
            minus: formatNum(minusText, opts),
        };
    }
    const plusLiteral = parseDecimalLiteral(plusRaw, opts);
    const minusLiteral = parseDecimalLiteral(minusRaw, opts);
    if (!plusLiteral || !minusLiteral) {
        return null;
    }
    return {
        plus: formatNum(plusLiteral.normalized, opts),
        minus: formatNum(minusLiteral.normalized, opts),
    };
};

const toCompactSymmetricUncertaintyValue = (
    baseRaw: string,
    uncertaintyRaw: string,
    opts: SiunitxOptions,
): string | null => {
    const token = uncertaintyRaw.trim();
    if (/^\d+$/.test(token)) {
        const base = parseDecimalLiteral(baseRaw, opts);
        if (!base) {
            return null;
        }
        const fracDigits = base.frac;
        const u = Number(token) / (10 ** fracDigits);
        const val = fracDigits > 0 ? u.toFixed(fracDigits) : String(u);
        return formatNum(val, opts);
    }
    const parsed = parseDecimalLiteral(token, opts);
    if (!parsed) {
        return null;
    }
    return formatNum(parsed.normalized, opts);
};

const evaluateExpressionInput = (
    rawInput: string,
    opts: SiunitxOptions,
): string | null => {
    if (!opts["evaluate-expression"]) {
        return rawInput;
    }
    const template = opts["expression"] || "#1";
    const expressionSource = template.includes("#1")
        ? template.split("#1").join(rawInput)
        : template;
    const normalized = opts["input-decimal-markers"]
        .reduce(
            (acc, marker) => marker === "." ? acc : acc.split(marker).join("."),
            expressionSource,
        );
    type ExprToken = {type: "num"; value: number} | {
        type: "op";
        value: "+" | "-" | "*" | "/" | "(" | ")";
    };
    const tokens: ExprToken[] = [];
    let i = 0;
    while (i < normalized.length) {
        const ch = normalized[i];
        if (/\s/.test(ch)) {
            i++;
            continue;
        }
        if (/[()+\-*/]/.test(ch)) {
            tokens.push({type: "op", value: ch as "+" | "-" | "*" | "/" | "(" | ")"});
            i++;
            continue;
        }
        if (/\d|\./.test(ch)) {
            const start = i;
            let hasDot = false;
            while (i < normalized.length) {
                const c = normalized[i];
                if (c === ".") {
                    if (hasDot) {
                        break;
                    }
                    hasDot = true;
                    i++;
                    continue;
                }
                if (!/\d/.test(c)) {
                    break;
                }
                i++;
            }
            if (i < normalized.length && /[eE]/.test(normalized[i])) {
                let j = i + 1;
                if (j < normalized.length && /[+-]/.test(normalized[j])) {
                    j++;
                }
                const expStart = j;
                while (j < normalized.length && /\d/.test(normalized[j])) {
                    j++;
                }
                if (j > expStart) {
                    i = j;
                }
            }
            const piece = normalized.slice(start, i);
            if (!/^\d*\.?\d+(?:[eE][+-]?\d+)?$/.test(piece)) {
                return null;
            }
            const value = Number(piece);
            if (!Number.isFinite(value)) {
                return null;
            }
            tokens.push({type: "num", value});
            continue;
        }
        return null;
    }
    let index = 0;
    const parseExpr = (): number | null => {
        let value = parseTerm();
        if (value == null) {
            return null;
        }
        while (index < tokens.length &&
            tokens[index].type === "op" &&
            (tokens[index].value === "+" || tokens[index].value === "-")) {
            const op = tokens[index].value;
            index++;
            const rhs = parseTerm();
            if (rhs == null) {
                return null;
            }
            value = op === "+" ? value + rhs : value - rhs;
        }
        return value;
    };
    const parseTerm = (): number | null => {
        let value = parseFactor();
        if (value == null) {
            return null;
        }
        while (index < tokens.length &&
            tokens[index].type === "op" &&
            (tokens[index].value === "*" || tokens[index].value === "/")) {
            const op = tokens[index].value;
            index++;
            const rhs = parseFactor();
            if (rhs == null) {
                return null;
            }
            value = op === "*" ? value * rhs : value / rhs;
        }
        return Number.isFinite(value) ? value : null;
    };
    const parseFactor = (): number | null => {
        if (index >= tokens.length) {
            return null;
        }
        const tok = tokens[index];
        if (tok.type === "op" && (tok.value === "+" || tok.value === "-")) {
            index++;
            const rhs = parseFactor();
            if (rhs == null) {
                return null;
            }
            return tok.value === "-" ? -rhs : rhs;
        }
        if (tok.type === "num") {
            index++;
            return tok.value;
        }
        if (tok.type === "op" && tok.value === "(") {
            index++;
            const inner = parseExpr();
            if (inner == null ||
                index >= tokens.length ||
                tokens[index].type !== "op" ||
                tokens[index].value !== ")") {
                return null;
            }
            index++;
            return inner;
        }
        return null;
    };
    const value = parseExpr();
    if (value == null || index !== tokens.length || !Number.isFinite(value)) {
        return null;
    }
    const compact = Number(value.toPrecision(15));
    return String(compact);
};

const applyExponentMode = (
    mantissaRaw: string,
    exponentRaw: string | undefined,
    opts: SiunitxOptions,
): {mantissa: string; exponent?: string} | null => {
    let mode: ExponentMode = opts["exponent-mode"];
    if (mode === "input" && opts["scientific-notation"] !== "auto") {
        mode = opts["scientific-notation"] === "fixed"
            ? "fixed"
            : opts["scientific-notation"] === "engineering"
            ? "engineering"
            : "input";
    }
    if (mode === "input" || mode === "threshold") {
        return {mantissa: mantissaRaw, exponent: exponentRaw};
    }
    const mantissa = mantissaRaw.trim();
    const sign = mantissa.startsWith("-") ? "-" : mantissa.startsWith("+")
        ? "+"
        : "";
    const unsignedMantissa = sign ? mantissa.slice(1) : mantissa;
    if (!/^\d*\.?\d*$/.test(unsignedMantissa) || unsignedMantissa === "") {
        return null;
    }
    const digitsAll = unsignedMantissa.replace(".", "");
    const firstNonZero = digitsAll.search(/[1-9]/);
    const inputExponent = exponentRaw == null ? 0 : Number(exponentRaw);
    if (!Number.isFinite(inputExponent)) {
        return null;
    }
    if (firstNonZero < 0) {
        if (mode === "fixed" && opts["fixed-exponent"] === 0) {
            return {mantissa: `${sign}0`};
        }
        return {
            mantissa: `${sign}0`,
            exponent: mode === "fixed" ? String(opts["fixed-exponent"]) : "0",
        };
    }
    const fracLen = (unsignedMantissa.split(".")[1] || "").length;
    const sigDigits = digitsAll.slice(firstNonZero);
    const expScientific = inputExponent - fracLen + (sigDigits.length - 1);
    let exponentOut = expScientific;
    if (mode === "engineering") {
        exponentOut = Math.floor(expScientific / 3) * 3;
    } else if (mode === "fixed") {
        exponentOut = opts["fixed-exponent"];
    }
    const shift = expScientific - exponentOut;
    const decimalIndex = 1 + shift;
    let integerPart = "";
    let fractionPart = "";
    if (decimalIndex <= 0) {
        integerPart = "0";
        fractionPart = `${"0".repeat(-decimalIndex)}${sigDigits}`;
    } else if (decimalIndex >= sigDigits.length) {
        integerPart = `${sigDigits}${"0".repeat(decimalIndex - sigDigits.length)}`;
        fractionPart = "";
    } else {
        integerPart = sigDigits.slice(0, decimalIndex);
        fractionPart = sigDigits.slice(decimalIndex);
    }
    const mantissaOut = fractionPart.length > 0
        ? `${sign}${integerPart}.${fractionPart}`
        : `${sign}${integerPart}`;
    if (mode === "fixed" && exponentOut === 0) {
        return {mantissa: mantissaOut};
    }
    return {mantissa: mantissaOut, exponent: String(exponentOut)};
};

const formatNum = (rawInput: string, opts: SiunitxOptions): string => {
    const raw = rawInput.trim();
    if (!raw) {
        return "";
    }
    if (!opts["parse-numbers"]) {
        return rawInput;
    }

    const evaluated = evaluateExpressionInput(raw, opts);
    if (evaluated == null) {
        return rawInput;
    }
    if (evaluated !== raw) {
        return formatNum(
            evaluated,
            Object.assign({}, opts, {"evaluate-expression": false}),
        );
    }

    const explicitUncertainty = parseExplicitUncertainty(raw, opts);
    if (explicitUncertainty) {
        const base = formatNum(explicitUncertainty.baseRaw, opts);
        const components = explicitUncertainty.components;
        if (explicitUncertainty.kind === "paren" && components.length > 1) {
            if (!opts["separate-uncertainty"]) {
                return `${base}${components
                    .map((component) => `(${component.trim()})`)
                    .join("")}`;
            }
            const entries = components.map((component) => {
                const asym = toAsymmetricUncertaintyValues(
                    explicitUncertainty.baseRaw,
                    component,
                    opts,
                );
                if (asym) {
                    return {kind: "asym" as const, plus: asym.plus, minus: asym.minus};
                }
                const sym = toCompactSymmetricUncertaintyValue(
                    explicitUncertainty.baseRaw,
                    component,
                    opts,
                );
                return sym == null ? null : {kind: "sym" as const, value: sym};
            });
            if (entries.some((entry) => entry == null)) {
                return rawInput;
            }
            const typed = entries as Array<
                {kind: "asym"; plus: string; minus: string} |
                {kind: "sym"; value: string}
            >;
            let out = base;
            for (const entry of typed) {
                if (entry.kind === "sym") {
                    out += ` ± ${entry.value}`;
                } else {
                    out = `${ASYM_UNCERT_MARKER}{${out}}{${entry.plus}}` +
                        `{${entry.minus}}`;
                }
            }
            return out;
        }
        if (explicitUncertainty.kind === "sign" && components.length > 1) {
            if (!opts["separate-uncertainty"]) {
                const baseParsed = parseDecimalLiteral(
                    explicitUncertainty.baseRaw,
                    opts,
                );
                const parsedComponents = components.map((component) =>
                    parseDecimalLiteral(component, opts));
                if (!baseParsed || parsedComponents.some((entry) => entry == null)) {
                    return rawInput;
                }
                const typed = parsedComponents as Array<{
                    num: number;
                    frac: number;
                    normalized: string;
                }>;
                const targetFrac = Math.max(
                    baseParsed.frac,
                    ...typed.map((entry) => entry.frac),
                );
                let baseOut = baseParsed.num.toFixed(targetFrac);
                if (opts["output-decimal-marker"] !== ".") {
                    baseOut = baseOut.replace(".", opts["output-decimal-marker"]);
                }
                const compactParts = typed.map((entry) => {
                    const scaled = Math.round(Math.abs(entry.num) * (10 ** targetFrac));
                    return `(${scaled})`;
                });
                return `${formatNum(baseOut, opts)}${compactParts.join("")}`;
            }
            const longSymmetric = components.map((component) => {
                const parsed = parseDecimalLiteral(component, opts);
                return parsed ? formatNum(parsed.normalized, opts) : null;
            });
            if (longSymmetric.some((entry) => entry == null)) {
                return rawInput;
            }
            return `${base}${(longSymmetric as string[])
                .map((entry) => ` ± ${entry}`)
                .join("")}`;
        }
        const uncertaintyRaw = components[0];
        const asymSingle = explicitUncertainty.kind === "paren"
            ? toAsymmetricUncertaintyValues(
                explicitUncertainty.baseRaw,
                uncertaintyRaw,
                opts,
            )
            : null;
        if (asymSingle) {
            return `${ASYM_UNCERT_MARKER}{${base}}{${asymSingle.plus}}` +
                `{${asymSingle.minus}}`;
        }
        const bracketed = explicitUncertainty.kind === "paren"
            ? `${base}(${uncertaintyRaw})`
            : toBracketUncertainty(
                explicitUncertainty.baseRaw,
                uncertaintyRaw,
                opts,
            );
        const uncertaintyMatch = (bracketed || "").match(/^(.+)\((\d+)\)$/);
        if (!uncertaintyMatch) {
            return rawInput;
        }
        const baseSingle = formatNum(uncertaintyMatch[1], opts);
        if (
            !opts["retain-zero-uncertainty"] &&
            /^0+$/.test(uncertaintyMatch[2])
        ) {
            return baseSingle;
        }
        if (!opts["separate-uncertainty"]) {
            return `${baseSingle}(${uncertaintyMatch[2]})`;
        }
        const mantissa = normalizeScientific(uncertaintyMatch[1]).mantissa;
        const fracDigits = (mantissa.split(".")[1] || "").length;
        let uncertainty = uncertaintyMatch[2];
        if (fracDigits > 0) {
            const u = Number(uncertainty) / (10 ** fracDigits);
            uncertainty = u.toFixed(fracDigits);
            if (opts["output-decimal-marker"] !== ".") {
                uncertainty = uncertainty.replace(".", opts["output-decimal-marker"]);
            }
        }
        return `${baseSingle} ± ${uncertainty}`;
    }

    const normalizedInput = opts["input-decimal-markers"]
        .reduce(
            (acc, marker) => marker === "." ? acc : acc.split(marker).join("."),
            raw,
        );

    const sci = normalizeScientific(normalizedInput);
    const exponentAdjusted = applyExponentMode(sci.mantissa, sci.exponent, opts);
    if (!exponentAdjusted) {
        return rawInput;
    }
    let body = exponentAdjusted.mantissa.trim();
    const hasExplicitTrailingDecimal = body.endsWith(".");
    let sign = "";
    if (body.startsWith("+") || body.startsWith("-")) {
        sign = body[0];
        body = body.slice(1);
    }

    const [rawIntPart, fracPart] = body.split(".");
    let intTokens = tokenizeInputDigits(
        rawIntPart || opts["input-digits"][0] || "0",
        opts["input-digits"],
    );
    const fracTokens = fracPart == null
        ? null
        : tokenizeInputDigits(fracPart, opts["input-digits"]);
    if (!intTokens || (fracPart != null && !fracTokens)) {
        return rawInput;
    }
    if (intTokens.length === 0) {
        intTokens = [opts["input-digits"][0] || "0"];
    }

    if (
        opts["group-digits"] &&
        intTokens.length >= opts["group-minimum-digits"]
    ) {
        // Keep tokenized custom digits grouped by token count.
        // This allows inputs like \pi or \dots to participate in grouping.
        const grouped = groupDigitTokens(intTokens, opts["group-separator"]);
        intTokens = [grouped];
    }

    const hasFraction = fracPart != null && fracTokens != null && fracTokens.length > 0;
    const showTrailingDecimalMarker = !!(
        opts["retain-explicit-decimal-marker"] &&
        fracPart != null &&
        fracPart.length === 0 &&
        hasExplicitTrailingDecimal
    );
    let frac = hasFraction ? fracTokens.map(renderInputDigitToken).join("") : "";
    if (
        hasFraction &&
        opts["group-digits"] &&
        fracTokens != null &&
        fracTokens.length >= opts["group-minimum-digits"]
    ) {
        frac = groupFractionDigitTokens(fracTokens, opts["group-separator"]);
    }
    const decimalMarker = (hasFraction || showTrailingDecimalMarker)
        ? opts["output-decimal-marker"]
        : "";
    const zeroToken = opts["input-digits"][0] || "0";
    const unsignedZero = intTokens.every((tok) => tok === zeroToken || tok === renderInputDigitToken(zeroToken)) &&
        (fracPart == null || /^0*$/.test(fracPart));
    let normalizedSign =
        sign === "+" && !opts["retain-explicit-plus"] ? "" : sign;
    if (
        normalizedSign === "-" &&
        unsignedZero &&
        !opts["retain-negative-zero"]
    ) {
        normalizedSign = "";
    }

    const intPart = intTokens.length === 1 && intTokens[0].includes(opts["group-separator"])
        ? intTokens[0]
        : intTokens.map(renderInputDigitToken).join("");
    let out = `${normalizedSign}${intPart}${decimalMarker}${frac}`;

    if (exponentAdjusted.exponent != null) {
        const exp = normalizeExponent(exponentAdjusted.exponent, opts);
        out += ` ${opts["exponent-product"]} 10${toSuperscript(exp)}`;
    }

    return out;
};

const formatNumRange = (a: string, b: string, opts: SiunitxOptions): string => {
    const lhs = formatNum(a, opts);
    const rhs = formatNum(b, opts);
    const sep = opts["range-phrase"] || "\u2013";
    return `${lhs}${sep}${rhs}`;
};

const formatNumList = (raw: string, opts: SiunitxOptions): string => {
    const items = splitListItems(raw);
    if (items.length === 0) {
        return "";
    }
    const formatted = items.map((item) => formatNum(item, opts));
    if (formatted.length === 1) {
        return formatted[0];
    }
    if (formatted.length === 2) {
        return `${formatted[0]}${opts["list-pair-separator"]}${formatted[1]}`;
    }
    return (
        formatted.slice(0, -1).join(opts["list-separator"]) +
        opts["list-final-separator"] +
        formatted[formatted.length - 1]
    );
};

const joinNumParts = (parts: string[], opts: SiunitxOptions): string => {
    if (parts.length === 0) {
        return "";
    }
    if (parts.length === 1) {
        return parts[0];
    }
    if (parts.length === 2) {
        return `${parts[0]}${opts["list-pair-separator"]}${parts[1]}`;
    }
    return (
        parts.slice(0, -1).join(opts["list-separator"]) +
        opts["list-final-separator"] +
        parts[parts.length - 1]
    );
};

const splitProductItems = (raw: string): string[] => {
    return raw.includes(";")
        ? splitListItems(raw)
        : raw.split(/\s*[xX×]\s*/).map((item) => item.trim()).filter(Boolean);
};

const formatNumProduct = (raw: string, opts: SiunitxOptions): string => {
    const items = splitProductItems(raw);
    if (items.length === 0) {
        return "";
    }
    let joiner = opts["product-mode"] === "phrase"
        ? opts["product-phrase"]
        : opts["product-symbol"];
    if (opts["product-mode"] === "symbol" && !/[ \u00A0]/.test(joiner)) {
        joiner = ` ${joiner} `;
    }
    return items.map((item) => formatNum(item, opts)).join(joiner);
};

type DurationValue = {
    type: "decimal";
    hours: number;
} | {
    type: "component";
    hours?: number;
    minutes?: number;
    seconds?: number;
};

const parseDurationInput = (raw: string, opts: SiunitxOptions): DurationValue | null => {
    const s = raw.trim();
    if (!s) {
        return null;
    }
    if (!s.includes(";")) {
        const hours = parseNumericValue(s, opts);
        if (hours == null) {
            return null;
        }
        return {type: "decimal", hours};
    }
    const parts = s.split(";");
    if (parts.length > 3) {
        return null;
    }
    const [hRaw = "", mRaw = "", sRaw = ""] = parts.map((x) => x.trim());
    const parsed = (value: string): number | undefined | null => {
        if (!value) {
            return undefined;
        }
        const n = parseNumericValue(value, opts);
        return n == null ? null : n;
    };
    const hours = parsed(hRaw);
    const minutes = parsed(mRaw);
    const seconds = parsed(sRaw);
    if (hours === null || minutes === null || seconds === null) {
        return null;
    }
    return {type: "component", hours, minutes, seconds};
};

const durationDecimalToComponents = (hours: number): {
    hours: number;
    minutes: number;
    seconds: number;
} => {
    const sign = hours < 0 ? -1 : 1;
    let abs = Math.abs(hours);
    let h = Math.floor(abs);
    abs = (abs - h) * 60;
    let m = Math.floor(abs);
    let s = (abs - m) * 60;
    s = Math.round(s * 1e12) / 1e12;
    if (Math.abs(s - Math.round(s)) < 1e-9) {
        s = Math.round(s);
    }
    if (s >= 60) {
        s -= 60;
        m += 1;
    }
    if (m >= 60) {
        m -= 60;
        h += 1;
    }
    return {
        hours: sign * h,
        minutes: sign * m,
        seconds: sign * s,
    };
};

const formatDurationComponent = (
    input: DurationValue,
    opts: SiunitxOptions,
): string => {
    let h: number | undefined;
    let m: number | undefined;
    let s: number | undefined;
    if (input.type === "decimal") {
        const converted = durationDecimalToComponents(input.hours);
        h = converted.hours;
        m = converted.minutes;
        s = converted.seconds;
    } else {
        h = input.hours;
        m = input.minutes;
        s = input.seconds;
    }

    if (opts["fill-duration-hours"] && h == null && (m != null || s != null)) {
        h = 0;
    }
    if (opts["fill-duration-minutes"] && m == null && (h != null || s != null)) {
        m = 0;
    }
    if (opts["fill-duration-seconds"] && s == null && (h != null || m != null)) {
        s = 0;
    }

    const parts: string[] = [];
    if (h != null) {
        parts.push(`${formatNum(String(h), opts)} ${opts["duration-unit-hour"]}`);
    }
    if (m != null) {
        parts.push(`${formatNum(String(m), opts)} ${opts["duration-unit-minute"]}`);
    }
    if (s != null) {
        parts.push(`${formatNum(String(s), opts)} ${opts["duration-unit-second"]}`);
    }
    return parts.join(opts["duration-separator"] || " ");
};

const formatDurationDecimal = (
    input: DurationValue,
    opts: SiunitxOptions,
): string => {
    let hoursValue = 0;
    if (input.type === "decimal") {
        hoursValue = input.hours;
    } else {
        const h = input.hours || 0;
        const m = input.minutes || 0;
        const s = input.seconds || 0;
        const sign = h < 0 || (h === 0 && (m < 0 || s < 0)) ? -1 : 1;
        hoursValue = sign * (
            Math.abs(h) + Math.abs(m) / 60 + Math.abs(s) / 3600
        );
    }
    let repr = hoursValue.toFixed(15).replace(/0+$/u, "").replace(/\.$/u, "");
    if (!repr) {
        repr = "0";
    }
    return `${formatNum(repr, opts)} ${opts["duration-unit-hour"]}`;
};

const formatDuration = (raw: string, opts: SiunitxOptions): string => {
    const parsed = parseDurationInput(raw, opts);
    if (!parsed) {
        return raw.trim();
    }
    const mode = opts["duration-mode"];
    if (mode === "component") {
        return formatDurationComponent(parsed, opts);
    }
    if (mode === "decimal") {
        return formatDurationDecimal(parsed, opts);
    }
    // input mode: preserve style based on input shape.
    if (parsed.type === "component") {
        return formatDurationComponent(parsed, opts);
    }
    return formatDurationDecimal(parsed, opts);
};

type ComplexValue = {
    type: "cartesian";
    real: number;
    imag: number;
} | {
    type: "polar";
    magnitude: number;
    phase: number;
};

const normalizeNumericInput = (raw: string, opts: SiunitxOptions): string => {
    return opts["input-decimal-markers"].reduce(
        (acc, marker) => marker === "." ? acc : acc.split(marker).join("."),
        raw.trim(),
    );
};

const parseNumericValue = (raw: string, opts: SiunitxOptions): number | null => {
    const normalized = normalizeNumericInput(raw, opts);
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
};

const roundNumberForOutput = (value: number, opts: SiunitxOptions): number => {
    if (opts["round-mode"] !== "places") {
        return value;
    }
    const places = Math.max(0, opts["round-precision"]);
    const factor = 10 ** places;
    return Math.round(value * factor) / factor;
};

const formatConvertedNumber = (value: number, opts: SiunitxOptions): string => {
    let v = roundNumberForOutput(value, opts);
    if (Object.is(v, -0)) {
        v = 0;
    }
    let repr = v.toPrecision(16);
    if (repr.includes("e") || repr.includes("E")) {
        repr = String(v);
    }
    repr = repr
        .replace(/(\.\d*?[1-9])0+$/u, "$1")
        .replace(/\.0+$/u, "");
    if (repr === "-0") {
        repr = "0";
    }
    return formatNum(repr, opts);
};

const getComplexInputRoots = (opts: SiunitxOptions): string[] => {
    const cleaned = (opts["input-complex-root"] || "ij")
        .replace(/[^A-Za-z]/g, "");
    return Array.from(new Set((cleaned || "ij").split("")));
};

const parseImagTerm = (
    rawTerm: string,
    opts: SiunitxOptions,
    roots: string[],
): number | null => {
    if (!rawTerm) {
        return null;
    }
    let term = rawTerm;
    let sign = 1;
    if (term[0] === "+" || term[0] === "-") {
        sign = term[0] === "-" ? -1 : 1;
        term = term.slice(1);
    }
    for (const root of roots) {
        if (term === root) {
            return sign;
        }
        if (term.startsWith(root)) {
            const coeff = term.slice(root.length);
            if (!coeff || coeff.includes(root)) {
                return null;
            }
            const value = parseNumericValue(coeff, opts);
            return value == null ? null : sign * value;
        }
        if (term.endsWith(root)) {
            const coeff = term.slice(0, term.length - root.length);
            if (!coeff || coeff.includes(root)) {
                return null;
            }
            const value = parseNumericValue(coeff, opts);
            return value == null ? null : sign * value;
        }
    }
    return null;
};

const parseComplexInput = (raw: string, opts: SiunitxOptions): ComplexValue | null => {
    const s = raw.trim();
    if (!s) {
        return null;
    }
    if (s.includes(":")) {
        const parts = s.split(":").map((x) => x.trim());
        if (parts.length !== 2 || !parts[0] || !parts[1]) {
            return null;
        }
        const magnitude = parseNumericValue(parts[0], opts);
        const phase = parseNumericValue(parts[1], opts);
        if (magnitude == null || phase == null) {
            return null;
        }
        return {type: "polar", magnitude, phase};
    }

    const compact = s.replace(/\s+/g, "");
    const roots = getComplexInputRoots(opts);
    const hasRoot = roots.some((root) => compact.includes(root));
    if (!hasRoot) {
        const realOnly = parseNumericValue(compact, opts);
        return realOnly == null ? null : {type: "cartesian", real: realOnly, imag: 0};
    }

    let splitIndex = -1;
    for (let i = 1; i < compact.length; i++) {
        const ch = compact[i];
        const prev = compact[i - 1];
        if ((ch === "+" || ch === "-") && !/[eEdD]/.test(prev)) {
            splitIndex = i;
        }
    }

    if (splitIndex >= 0) {
        const realRaw = compact.slice(0, splitIndex);
        const imagRaw = compact.slice(splitIndex);
        const real = parseNumericValue(realRaw, opts);
        const imag = parseImagTerm(imagRaw, opts, roots);
        if (real == null || imag == null) {
            return null;
        }
        return {type: "cartesian", real, imag};
    }

    const imagOnly = parseImagTerm(compact, opts, roots);
    if (imagOnly == null) {
        return null;
    }
    return {type: "cartesian", real: 0, imag: imagOnly};
};

const formatComplexRootOutput = (opts: SiunitxOptions): string => {
    const ctx = getUnitRuntimeContext(opts);
    const out = parseTextLikeOption(opts["output-complex-root"]).trim();
    if (!out) {
        return "i";
    }
    if (out.startsWith("\\")) {
        const rendered = renderUnitToken(out, ctx);
        return rendered || out.slice(1);
    }
    return out;
};

const formatComplexPhaseSymbol = (opts: SiunitxOptions): string => {
    const raw = opts["complex-phase-command"].trim();
    if (!raw || raw === "\\phase") {
        return " ";
    }
    if (raw === "\\angle") {
        return "∠";
    }
    return parseTextLikeOption(raw).trim() || " ";
};

const formatComplexDegreeSymbol = (opts: SiunitxOptions): string => {
    const ctx = getUnitRuntimeContext(opts);
    const raw = opts["complex-symbol-degree"].trim() || "\\degree";
    if (raw.startsWith("\\")) {
        const rendered = renderUnitToken(raw, ctx);
        return rendered || "°";
    }
    return parseTextLikeOption(raw) || "°";
};

const formatComplexCartesian = (
    real: number,
    imag: number,
    opts: SiunitxOptions,
): string => {
    const realRounded = roundNumberForOutput(real, opts);
    const imagRounded = roundNumberForOutput(imag, opts);
    if (Math.abs(imagRounded) < 1e-15) {
        return formatConvertedNumber(realRounded, opts);
    }

    const root = formatComplexRootOutput(opts);
    const imagAbs = Math.abs(imagRounded);
    const printUnity = opts["print-complex-unity"] || Math.abs(imagAbs - 1) > 1e-15;
    const imagCoeff = printUnity ? formatConvertedNumber(imagAbs, opts) : "";
    const imagTerm = opts["complex-root-position"] === "before-number"
        ? `${root}${imagCoeff}`
        : `${imagCoeff}${root}`;

    if (Math.abs(realRounded) < 1e-15) {
        return `${imagRounded < 0 ? "-" : ""}${imagTerm}`;
    }
    const sign = imagRounded < 0 ? " - " : " + ";
    return `${formatConvertedNumber(realRounded, opts)}${sign}${imagTerm}`;
};

const formatComplexPolar = (
    magnitude: number,
    phase: number,
    opts: SiunitxOptions,
): string => {
    const mag = formatConvertedNumber(magnitude, opts);
    const angle = formatConvertedNumber(phase, opts);
    const phaseSymbol = formatComplexPhaseSymbol(opts);
    const rawAngleUnit = opts["complex-angle-unit"] === "degrees"
        ? formatComplexDegreeSymbol(opts)
        : "";
    const angleUnit = rawAngleUnit && /^[A-Za-z]/.test(rawAngleUnit)
        ? ` ${rawAngleUnit}`
        : rawAngleUnit;
    if (phaseSymbol === " ") {
        return `${mag} ${angle}${angleUnit}`.trim();
    }
    return `${mag}${phaseSymbol}${angle}${angleUnit}`;
};

const formatComplexNum = (raw: string, opts: SiunitxOptions): string => {
    const parsed = parseComplexInput(raw, opts);
    if (!parsed) {
        return raw.trim();
    }

    if (opts["complex-mode"] === "input") {
        return parsed.type === "polar"
            ? formatComplexPolar(parsed.magnitude, parsed.phase, opts)
            : formatComplexCartesian(parsed.real, parsed.imag, opts);
    }

    if (opts["complex-mode"] === "cartesian") {
        if (parsed.type === "cartesian") {
            return formatComplexCartesian(parsed.real, parsed.imag, opts);
        }
        const phaseRad = opts["complex-angle-unit"] === "degrees"
            ? parsed.phase * Math.PI / 180
            : parsed.phase;
        return formatComplexCartesian(
            parsed.magnitude * Math.cos(phaseRad),
            parsed.magnitude * Math.sin(phaseRad),
            opts,
        );
    }

    if (parsed.type === "polar") {
        return formatComplexPolar(parsed.magnitude, parsed.phase, opts);
    }
    const magnitude = Math.hypot(parsed.real, parsed.imag);
    const phaseRad = Math.atan2(parsed.imag, parsed.real);
    const phase = opts["complex-angle-unit"] === "degrees"
        ? phaseRad * 180 / Math.PI
        : phaseRad;
    return formatComplexPolar(magnitude, phase, opts);
};

const formatComplexQty = (raw: string, unit: string, opts: SiunitxOptions): string => {
    return `${formatComplexNum(raw, opts)}${opts["number-unit-separator"]}${
        formatUnit(unit, opts)
    }`;
};

const formatQtyList = (rawNumbers: string, rawUnit: string, opts: SiunitxOptions): string => {
    const items = splitListItems(rawNumbers);
    if (items.length === 0) {
        return "";
    }
    const unit = formatUnit(rawUnit, opts);
    if (opts["list-units"] === "repeat") {
        const withUnits = items.map(
            (item) => `${formatNum(item, opts)}${opts["number-unit-separator"]}${unit}`,
        );
        return joinNumParts(withUnits, opts);
    }
    if (opts["list-units"] === "bracket") {
        return `(${formatNumList(rawNumbers, opts)})` +
            `${opts["number-unit-separator"]}${unit}`;
    }
    return `${formatNumList(rawNumbers, opts)}${opts["number-unit-separator"]}${unit}`;
};

const formatQtyProduct = (
    rawNumbers: string,
    rawUnit: string,
    opts: SiunitxOptions,
): string => {
    const items = splitProductItems(rawNumbers);
    if (items.length === 0) {
        return "";
    }
    let joiner = opts["product-mode"] === "phrase"
        ? opts["product-phrase"]
        : opts["product-symbol"];
    if (opts["product-mode"] === "symbol" && !/[ \u00A0]/.test(joiner)) {
        joiner = ` ${joiner} `;
    }
    const unit = formatUnit(rawUnit, opts);
    const mode = opts["product-units"];
    if (mode === "repeat") {
        return items.map(
            (item) => `${formatNum(item, opts)}${opts["number-unit-separator"]}${unit}`,
        ).join(joiner);
    }
    if (mode === "bracket") {
        return `(${items.map((item) => formatNum(item, opts)).join(joiner)})` +
            `${opts["number-unit-separator"]}${unit}`;
    }
    if (mode === "power" || mode === "bracket-power") {
        const unitPower = formatUnit(rawUnit, opts, items.length);
        const product = items.map((item) => formatNum(item, opts)).join(joiner);
        if (mode === "bracket-power") {
            return `(${product})${opts["number-unit-separator"]}${unitPower}`;
        }
        return `${product}${opts["number-unit-separator"]}${unitPower}`;
    }
    return `${items.map((item) => formatNum(item, opts)).join(joiner)}` +
        `${opts["number-unit-separator"]}${unit}`;
};

// -----------------------------
// Unit parsing / formatting
// -----------------------------

const UNIT_MACRO_MAP: Record<string, string> = {
    // Base units
    m: "m",
    meter: "m",
    metre: "m",
    s: "s",
    second: "s",
    sec: "s",
    kg: "kg",
    kilogram: "kg",
    g: "g",
    gram: "g",
    A: "A",
    ampere: "A",
    K: "K",
    kelvin: "K",
    mol: "mol",
    mole: "mol",
    cd: "cd",
    candela: "cd",

    // Common derived
    Hz: "Hz",
    hertz: "Hz",
    N: "N",
    newton: "N",
    Pa: "Pa",
    pascal: "Pa",
    J: "J",
    joule: "J",
    W: "W",
    watt: "W",
    C: "C",
    coulomb: "C",
    V: "V",
    volt: "V",
    F: "F",
    farad: "F",
    ohm: "Ω",
    S: "S",
    siemens: "S",
    Wb: "Wb",
    weber: "Wb",
    T: "T",
    tesla: "T",
    H: "H",
    henry: "H",
    lm: "lm",
    lumen: "lm",
    lx: "lx",
    lux: "lx",
    Bq: "Bq",
    becquerel: "Bq",
    Gy: "Gy",
    gray: "Gy",
    Sv: "Sv",
    sievert: "Sv",
    kat: "kat",
    katal: "kat",

    // Non-SI commonly accepted
    au: "au",
    astronomicalunit: "au",
    B: "B",
    bel: "B",
    dB: "dB",
    decibel: "dB",
    ha: "ha",
    hectare: "ha",
    Np: "Np",
    neper: "Np",
    l: "L",
    liter: "L",
    litre: "L",
    L: "L",
    min: "min",
    minute: "min",
    arcminute: "′",
    arcsecond: "″",
    h: "h",
    hour: "h",
    d: "d",
    day: "d",
    eV: "eV",
    electronvolt: "eV",
    t: "t",
    tonne: "t",
    Da: "Da",
    dalton: "Da",
    u: "u",

    // Abbreviated siunitx unit commands
    fg: "fg",
    pg: "pg",
    ng: "ng",
    ug: "μg",
    mg: "mg",
    pm: "pm",
    nm: "nm",
    um: "μm",
    mm: "mm",
    cm: "cm",
    dm: "dm",
    km: "km",
    as: "as",
    fs: "fs",
    ps: "ps",
    ns: "ns",
    us: "μs",
    ms: "ms",
    fmol: "fmol",
    pmol: "pmol",
    nmol: "nmol",
    umol: "μmol",
    mmol: "mmol",
    kmol: "kmol",
    pA: "pA",
    nA: "nA",
    uA: "μA",
    mA: "mA",
    kA: "kA",
    ul: "μL",
    ml: "mL",
    hl: "hL",
    uL: "μL",
    mL: "mL",
    hL: "hL",
    mHz: "mHz",
    kHz: "kHz",
    MHz: "MHz",
    GHz: "GHz",
    THz: "THz",
    mN: "mN",
    kN: "kN",
    MN: "MN",
    kPa: "kPa",
    MPa: "MPa",
    GPa: "GPa",
    mohm: "mΩ",
    kohm: "kΩ",
    Mohm: "MΩ",
    pV: "pV",
    nV: "nV",
    uV: "μV",
    mV: "mV",
    kV: "kV",
    nW: "nW",
    uW: "μW",
    mW: "mW",
    kW: "kW",
    MW: "MW",
    GW: "GW",
    uJ: "μJ",
    mJ: "mJ",
    kJ: "kJ",
    meV: "meV",
    keV: "keV",
    MeV: "MeV",
    GeV: "GeV",
    TeV: "TeV",
    kWh: "kW h",
    fF: "fF",
    pF: "pF",
    nF: "nF",
    uF: "μF",
    mF: "mF",
    fH: "fH",
    pH: "pH",
    nH: "nH",
    mH: "mH",
    uH: "μH",
    nC: "nC",
    mC: "mC",
    uC: "μC",
    mT: "mT",
    uT: "μT",

    // Symbols / helpers
    degree: "°",
    celsius: "°C",
    degreeCelsius: "°C",
    percent: "%",
    permyriad: "‰",
};

const UNIT_PREFIX_MAP: Record<string, string> = {
    Q: "Q",
    R: "R",
    Y: "Y",
    Z: "Z",
    E: "E",
    P: "P",
    T: "T",
    G: "G",
    M: "M",
    k: "k",
    h: "h",
    da: "da",
    d: "d",
    c: "c",
    m: "m",
    u: "μ",
    n: "n",
    p: "p",
    f: "f",
    a: "a",
    z: "z",
    y: "y",
    r: "r",
    q: "q",

    // Spelled-out SI prefixes used by siunitx macros
    quetta: "Q",
    ronna: "R",
    yotta: "Y",
    zetta: "Z",
    exa: "E",
    peta: "P",
    tera: "T",
    giga: "G",
    mega: "M",
    kilo: "k",
    hecto: "h",
    deca: "da",
    deci: "d",
    centi: "c",
    milli: "m",
    micro: "μ",
    nano: "n",
    pico: "p",
    femto: "f",
    atto: "a",
    zepto: "z",
    yocto: "y",
    ronto: "r",
    quecto: "q",
};

type UnitRuntimeContext = {
    unitMap: Record<string, string>;
    prefixMap: Record<string, string>;
    prefixExponentByMacro: Record<string, number>;
    prefixMacroByExponent: Record<number, string>;
    declaredUnits: Record<string, DeclaredUnit>;
    declaredPowersBefore: Record<string, string>;
    declaredPowersAfter: Record<string, string>;
    declaredQualifiers: Record<string, string>;
};

const getUnitRuntimeContext = (opts: SiunitxOptions): UnitRuntimeContext => {
    const declaredUnits = opts["__declared-units__"] || {};
    const declaredPrefixes = opts["__declared-prefixes__"] || {};
    const unitMap = Object.assign({}, UNIT_MACRO_MAP);
    const prefixMap = Object.assign({}, UNIT_PREFIX_MAP);
    const prefixExponentByMacro = Object.assign({}, PREFIX_EXPONENT_BY_MACRO);
    const prefixMacroByExponent = Object.assign({}, PREFIX_MACRO_BY_EXPONENT);
    for (const name of Object.keys(declaredUnits)) {
        if (name) {
            unitMap[name] = declaredUnits[name].symbol;
        }
    }
    for (const name of Object.keys(declaredPrefixes)) {
        if (!name) {
            continue;
        }
        const entry = declaredPrefixes[name];
        prefixMap[name] = entry.symbol;
        prefixExponentByMacro[name] = entry.exponent;
        if (prefixMacroByExponent[entry.exponent] == null) {
            prefixMacroByExponent[entry.exponent] = `\\${name}`;
        }
    }
    return {
        unitMap,
        prefixMap,
        prefixExponentByMacro,
        prefixMacroByExponent,
        declaredUnits,
        declaredPowersBefore: Object.assign({}, opts["__declared-powers-before__"] || {}),
        declaredPowersAfter: Object.assign({}, opts["__declared-powers-after__"] || {}),
        declaredQualifiers: Object.assign({}, opts["__declared-qualifiers__"] || {}),
    };
};

const renderUnitToken = (
    token: string,
    ctx: UnitRuntimeContext,
): string => {
    if (!token.startsWith("\\")) {
        return token;
    }

    const name = token.slice(1);

    if (name === "per") {
        return "/";
    }

    if (ctx.unitMap[name]) {
        return ctx.unitMap[name];
    }

    // Prefix+unit shorthand support e.g. \km \ms etc.
    for (const p of Object.keys(ctx.prefixMap).sort(
        (a, b) => b.length - a.length,
    )) {
        if (name.startsWith(p) && name.length > p.length) {
            const rest = name.slice(p.length);
            if (ctx.unitMap[rest]) {
                return `${ctx.prefixMap[p]}${ctx.unitMap[rest]}`;
            }
        }
    }

    // Unknown control sequence: keep visible fallback.
    return name;
};

const tokenizeUnitInput = (raw: string): string[] => {
    const tokens: string[] = [];
    const re = /\\[A-Za-z]+|\/|\*|\^|\{|\}|\(|\)|[+-]?\d+|[^\s]/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(raw)) != null) {
        tokens.push(m[0]);
    }
    return tokens;
};

const splitFractionUnitParts = (
    raw: string,
    opts: SiunitxOptions,
    ctx: UnitRuntimeContext,
): {
    numeratorRaw: string;
    denominatorRaw: string;
    numeratorCount: number;
    denominatorCount: number;
} | null => {
    const tokens = tokenizeUnitInput(raw.trim());
    const hasPer = tokens.some((tk) => tk === "/" || tk === "\\per");
    if (!hasPer) {
        return null;
    }
    const isPurePrefixToken = (token: string): boolean => {
        if (!token.startsWith("\\")) {
            return false;
        }
        const name = token.slice(1);
        return !!ctx.prefixMap[name] && !ctx.unitMap[name];
    };
    const readToThePower = (
        start: number,
    ): {power: string; end: number} => {
        let i = start;
        if (i >= tokens.length) {
            return {power: "", end: i};
        }
        if (tokens[i] === "{") {
            let depth = 1;
            const parts: string[] = [];
            i++;
            while (i < tokens.length && depth > 0) {
                const part = tokens[i];
                if (part === "{") {
                    depth++;
                    parts.push(part);
                } else if (part === "}") {
                    depth--;
                    if (depth > 0) {
                        parts.push(part);
                    }
                } else {
                    parts.push(part);
                }
                i++;
            }
            return {power: parts.join("").trim(), end: i};
        }
        return {power: tokens[i], end: i + 1};
    };
    const consumeUnitItem = (start: number): {raw: string; end: number} => {
        const itemTokens: string[] = [];
        let i = start;
        if (isPurePrefixToken(tokens[i]) && i + 1 < tokens.length) {
            itemTokens.push(tokens[i]);
            i++;
        }
        itemTokens.push(tokens[i]);
        i++;

        while (i < tokens.length) {
            const tk = tokens[i];
            if (tk === "\\squared" || tk === "\\cubed") {
                itemTokens.push(tk);
                i++;
                continue;
            }
            if (tk === "^") {
                itemTokens.push(tk);
                i++;
                if (i >= tokens.length) {
                    break;
                }
                if (tokens[i] === "{") {
                    let depth = 0;
                    while (i < tokens.length) {
                        const part = tokens[i];
                        itemTokens.push(part);
                        if (part === "{") {
                            depth++;
                        } else if (part === "}") {
                            depth--;
                            if (depth === 0) {
                                i++;
                                break;
                            }
                        }
                        i++;
                    }
                } else {
                    itemTokens.push(tokens[i]);
                    i++;
                }
                continue;
            }
            if (tk === "\\tothe") {
                itemTokens.push(tk);
                const parsed = readToThePower(i + 1);
                if (tokens[i + 1] === "{") {
                    itemTokens.push("{");
                    if (parsed.power) {
                        itemTokens.push(parsed.power);
                    }
                    itemTokens.push("}");
                } else if (parsed.power) {
                    itemTokens.push(parsed.power);
                }
                i = parsed.end;
                continue;
            }
            if (tk === "\\of") {
                itemTokens.push(tk);
                i++;
                if (i < tokens.length && tokens[i] === "{") {
                    let depth = 0;
                    while (i < tokens.length) {
                        const part = tokens[i];
                        itemTokens.push(part);
                        if (part === "{") {
                            depth++;
                        } else if (part === "}") {
                            depth--;
                            if (depth === 0) {
                                i++;
                                break;
                            }
                        }
                        i++;
                    }
                } else if (i < tokens.length) {
                    itemTokens.push(tokens[i]);
                    i++;
                }
                continue;
            }
            if (tk.startsWith("\\")) {
                const name = tk.slice(1);
                if (ctx.declaredQualifiers[name] ||
                    ctx.declaredPowersBefore[name] ||
                    ctx.declaredPowersAfter[name]) {
                    itemTokens.push(tk);
                    i++;
                    continue;
                }
            }
            break;
        }

        return {raw: itemTokens.join(" "), end: i};
    };

    const numeratorItems: string[] = [];
    const denominatorItems: string[] = [];
    let pendingPer = false;
    let stickyPerActive = false;
    let i = 0;
    while (i < tokens.length) {
        const tk = tokens[i];
        if (tk === "/" || tk === "\\per") {
            pendingPer = true;
            if (opts["sticky-per"]) {
                stickyPerActive = true;
            }
            i++;
            continue;
        }
        if (tk === "*") {
            i++;
            continue;
        }

        const consumed = consumeUnitItem(i);
        const target = (pendingPer || (opts["sticky-per"] && stickyPerActive))
            ? denominatorItems
            : numeratorItems;
        target.push(consumed.raw);
        pendingPer = false;
        i = consumed.end;
    }
    if (denominatorItems.length === 0) {
        return null;
    }
    const numeratorRaw = numeratorItems.length > 0 ? numeratorItems.join(" ") : "1";
    const denominatorRaw = denominatorItems.join(" ");
    return {
        numeratorRaw,
        denominatorRaw,
        numeratorCount: numeratorItems.length,
        denominatorCount: denominatorItems.length,
    };
};

const PREFIX_EXPONENT_BY_MACRO: Record<string, number> = {
    quecto: -30, ronto: -27, yocto: -24, zepto: -21, atto: -18, femto: -15,
    pico: -12, nano: -9, micro: -6, milli: -3, centi: -2, deci: -1,
    deca: 1, hecto: 2, kilo: 3, mega: 6, giga: 9, tera: 12, peta: 15,
    exa: 18, zetta: 21, yotta: 24, ronna: 27, quetta: 30,
    q: -30, r: -27, y: -24, z: -21, a: -18, f: -15, p: -12, n: -9,
    u: -6, m: -3, c: -2, d: -1, da: 1, h: 2, k: 3, M: 6, G: 9,
    T: 12, P: 15, E: 18, Z: 21, Y: 24, R: 27, Q: 30,
};

const PREFIX_MACRO_BY_EXPONENT: Record<number, string> = {
    [-30]: "\\quecto",
    [-27]: "\\ronto",
    [-24]: "\\yocto",
    [-21]: "\\zepto",
    [-18]: "\\atto",
    [-15]: "\\femto",
    [-12]: "\\pico",
    [-9]: "\\nano",
    [-6]: "\\micro",
    [-3]: "\\milli",
    [-2]: "\\centi",
    [-1]: "\\deci",
    0: "",
    1: "\\deca",
    2: "\\hecto",
    3: "\\kilo",
    6: "\\mega",
    9: "\\giga",
    12: "\\tera",
    15: "\\peta",
    18: "\\exa",
    21: "\\zetta",
    24: "\\yotta",
    27: "\\ronna",
    30: "\\quetta",
};

const getCombinedPrefixBase = (
    token: string,
    ctx: UnitRuntimeContext,
): {prefixExp: number; baseToken: string} | null => {
    if (!token.startsWith("\\")) {
        return null;
    }
    const name = token.slice(1);
    for (const key of Object.keys(ctx.prefixExponentByMacro).sort(
        (a, b) => b.length - a.length,
    )) {
        if (name.startsWith(key) && name.length > key.length) {
            const rest = name.slice(key.length);
            if (ctx.unitMap[rest]) {
                return {
                    prefixExp: ctx.prefixExponentByMacro[key],
                    baseToken: `\\${rest}`,
                };
            }
        }
    }
    return null;
};

const parsePowerScalar = (rawPower: string, opts: SiunitxOptions): number | null => {
    const compact = rawPower.replace(/\s+/g, "");
    const frac = compact.match(/^([+-]?\d+)\/([+-]?\d+)$/u);
    if (frac) {
        const den = Number(frac[2]);
        if (den !== 0) {
            return Number(frac[1]) / den;
        }
        return null;
    }
    let normalized = compact;
    const markers = new Set([...opts["input-decimal-markers"], ","]);
    for (const marker of markers) {
        if (marker !== ".") {
            normalized = normalized.split(marker).join(".");
        }
    }
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
};

const readUnitPowerAfterToken = (
    tokens: string[],
    start: number,
    opts: SiunitxOptions,
): {power: number; end: number} => {
    if (start >= tokens.length) {
        return {power: 1, end: start};
    }
    const tk = tokens[start];
    if (tk === "\\squared") {
        return {power: 2, end: start + 1};
    }
    if (tk === "\\cubed") {
        return {power: 3, end: start + 1};
    }
    if (tk !== "\\tothe") {
        return {power: 1, end: start};
    }
    if (tokens[start + 1] === "{") {
        let j = start + 2;
        let depth = 1;
        const parts: string[] = [];
        while (j < tokens.length && depth > 0) {
            const part = tokens[j];
            if (part === "{") {
                depth++;
            } else if (part === "}") {
                depth--;
                if (depth === 0) {
                    j++;
                    break;
                }
            }
            if (depth > 0) {
                parts.push(part);
            }
            j++;
        }
        return {power: parsePowerScalar(parts.join("").trim(), opts) ?? 1, end: j};
    }
    const value = tokens[start + 1] || "";
    return {power: parsePowerScalar(value, opts) ?? 1, end: start + 2};
};

const parseNumberMantissaExponent = (
    rawNumber: string,
    opts: SiunitxOptions,
): {mantissa: string; exponent: number} | null => {
    const normalizedInput = opts["input-decimal-markers"]
        .reduce(
            (acc, marker) => marker === "." ? acc : acc.split(marker).join("."),
            rawNumber.trim(),
        );
    const sci = normalizeScientific(normalizedInput);
    const mantissa = sci.mantissa.trim();
    if (!/^[-+]?(?:\d+|\d*\.\d+)$/u.test(mantissa)) {
        return null;
    }
    const exponent = sci.exponent != null ? Number(normalizeExponent(sci.exponent, opts)) : 0;
    if (!Number.isFinite(exponent)) {
        return null;
    }
    return {mantissa, exponent: Math.trunc(exponent)};
};

const applyPrefixModeToQuantity = (
    rawNumber: string,
    rawUnit: string,
    opts: SiunitxOptions,
    ctx: UnitRuntimeContext,
): {number: string; unit: string} => {
    if (opts["prefix-mode"] === "input" || !rawUnit.trim()) {
        return {number: rawNumber, unit: rawUnit};
    }
    const parsed = parseNumberMantissaExponent(rawNumber, opts);
    const tokens = tokenizeUnitInput(rawUnit.trim());
    if (tokens.length === 0) {
        return {number: rawNumber, unit: rawUnit};
    }

    if (opts["prefix-mode"] === "combine-exponent") {
        if (!parsed || parsed.exponent === 0) {
            return {number: rawNumber, unit: rawUnit};
        }
        let pendingPrefixIndex = -1;
        let pendingPrefixExp = 0;
        for (let i = 0; i < tokens.length; i++) {
            const tk = tokens[i];
            if (!tk.startsWith("\\")) {
                continue;
            }
            const name = tk.slice(1);
            if (ctx.prefixExponentByMacro[name] != null && !ctx.unitMap[name]) {
                pendingPrefixIndex = i;
                pendingPrefixExp = ctx.prefixExponentByMacro[name];
                continue;
            }
            if (name === "per" || name === "of" || name === "squared" ||
                name === "cubed" || name === "tothe") {
                continue;
            }
            const combined = getCombinedPrefixBase(tk, ctx);
            const currentPrefix = combined ? combined.prefixExp : pendingPrefixExp;
            const nextPrefix = currentPrefix + parsed.exponent;
            const newPrefixToken = ctx.prefixMacroByExponent[nextPrefix];
            if (newPrefixToken == null) {
                break;
            }
            if (pendingPrefixIndex >= 0) {
                if (newPrefixToken) {
                    tokens[pendingPrefixIndex] = newPrefixToken;
                } else {
                    tokens.splice(pendingPrefixIndex, 1);
                }
            } else if (newPrefixToken) {
                tokens.splice(i, 0, newPrefixToken);
            }
            return {
                number: parsed.mantissa,
                unit: tokens.join(" "),
            };
        }
        return {number: rawNumber, unit: rawUnit};
    }

    // extract-exponent
    let extractedExp = 0;
    const outTokens: string[] = [];
    let pendingPrefixExp = 0;
    let pendingPrefixActive = false;
    for (let i = 0; i < tokens.length; i++) {
        const tk = tokens[i];
        if (tk.startsWith("\\")) {
            const name = tk.slice(1);
            if (ctx.prefixExponentByMacro[name] != null && !ctx.unitMap[name]) {
                pendingPrefixExp = ctx.prefixExponentByMacro[name];
                pendingPrefixActive = true;
                continue;
            }
        }
        if (!tk.startsWith("\\")) {
            outTokens.push(tk);
            continue;
        }
        const name = tk.slice(1);
        if (name === "per" || name === "of" || name === "squared" ||
            name === "cubed" || name === "tothe") {
            outTokens.push(tk);
            continue;
        }
        const combined = getCombinedPrefixBase(tk, ctx);
        const combinedExp = combined ? combined.prefixExp : 0;
        const baseToken = combined ? combined.baseToken : tk;
        const totalPrefixExp = (pendingPrefixActive ? pendingPrefixExp : 0) + combinedExp;
        pendingPrefixExp = 0;
        pendingPrefixActive = false;

        const parsedPower = readUnitPowerAfterToken(tokens, i + 1, opts);
        const unitPower = parsedPower.power;
        const baseName = baseToken.slice(1);
        if ((baseName === "gram" || baseName === "g") &&
            opts["extract-mass-in-kilograms"]) {
            extractedExp += (totalPrefixExp - 3) * unitPower;
            outTokens.push("\\kilo");
            outTokens.push("\\gram");
        } else {
            extractedExp += totalPrefixExp * unitPower;
            outTokens.push(baseToken);
        }
    }
    const baseNumber = parsed ?? parseNumberMantissaExponent(rawNumber, opts);
    if (!baseNumber) {
        return {number: rawNumber, unit: outTokens.join(" ")};
    }
    const newExp = baseNumber.exponent + extractedExp;
    const adjustedNumber = newExp === 0
        ? baseNumber.mantissa
        : `${baseNumber.mantissa}e${newExp}`;
    return {number: adjustedNumber, unit: outTokens.join(" ")};
};

const normalizePerMode = (
    mode: PerMode,
): "power" | "power-positive-first" | "symbol" | "repeated-symbol" |
    "single-symbol" | "fraction" => {
    return mode === "reciprocal" ? "power" : mode;
};

const isUnitLikeToken = (token: string): boolean => {
    return token !== " " &&
        token !== "*" &&
        token !== "/" &&
        token !== "^" &&
        token !== "{" &&
        token !== "}" &&
        token !== "(" &&
        token !== ")" &&
        token !== "·" &&
        !/^[+-]?\d+$/.test(token);
};

const resolveSingleSymbolPerMode = (
    raw: string,
    opts: SiunitxOptions,
): "power" | "symbol" => {
    const tokens = tokenizeUnitInput(raw.trim());
    let pendingPer = false;
    let stickyActive = false;
    let hasPositive = false;
    let negativeCount = 0;
    for (const tk of tokens) {
        if (tk === "/" || tk === "\\per") {
            pendingPer = true;
            if (opts["sticky-per"]) {
                stickyActive = true;
            }
            continue;
        }
        if (tk === "*" || tk === "^" || tk === "\\squared" || tk === "\\cubed") {
            continue;
        }
        if (!isUnitLikeToken(tk)) {
            continue;
        }
        const isNegative = pendingPer || (opts["sticky-per"] && stickyActive);
        if (isNegative) {
            negativeCount++;
        } else {
            hasPositive = true;
        }
        pendingPer = false;
    }
    return hasPositive && negativeCount === 1 ? "symbol" : "power";
};

const reorderPowerPositiveFirst = (formatted: string): string => {
    const terms = formatted.trim().split(/\s+/).filter(Boolean);
    if (terms.length <= 1) {
        return formatted;
    }
    const positive: string[] = [];
    const negative: string[] = [];
    for (const term of terms) {
        const split = splitTrailingSuperscript(term);
        if (split.exponent != null && split.exponent.startsWith("-")) {
            negative.push(term);
        } else {
            positive.push(term);
        }
    }
    return [...positive, ...negative].join(" ");
};

const formatUnitInternal = (
    raw: string,
    opts: SiunitxOptions,
    powerFactor: number,
    ctx: UnitRuntimeContext,
    lockedOptionKeys: Set<string>,
    recursionDepth = 0,
    allowLiteralUnits = false,
): string => {
    if (recursionDepth > 8) {
        return raw.replace(/\\/g, "").replace(/[{}]/g, "").replace(/\s+/g, " ").trim();
    }
    if (!opts["parse-units"]) {
        return raw.replace(/\\/g, "").replace(/[{}]/g, "").replace(/\s+/g, " ").trim();
    }
    let perMode = normalizePerMode(opts["per-mode"]);
    if (perMode === "single-symbol") {
        perMode = resolveSingleSymbolPerMode(raw, opts);
    }
    if (perMode === "symbol") {
        const parts = splitFractionUnitParts(raw, opts, ctx);
        if (parts) {
            const baseOpts: SiunitxOptions = Object.assign(
                {},
                opts,
                {"per-mode": "power" as PerMode},
            );
            const numerator = formatUnitInternal(
                parts.numeratorRaw,
                baseOpts,
                powerFactor,
                ctx,
                lockedOptionKeys,
                recursionDepth,
                allowLiteralUnits,
            );
            const denominator = formatUnitInternal(
                parts.denominatorRaw,
                baseOpts,
                powerFactor,
                ctx,
                lockedOptionKeys,
                recursionDepth,
                allowLiteralUnits,
            );
            const perSymbol = opts["per-symbol"] || "/";
            const wrappedDenominator = (opts["bracket-unit-denominator"] &&
                parts.denominatorCount > 1)
                ? `(${denominator})`
                : denominator;
            return `${numerator}${perSymbol}${wrappedDenominator}`;
        }
    }
    if (perMode === "fraction") {
        const parts = splitFractionUnitParts(raw, opts, ctx);
        if (parts) {
            const baseOpts: SiunitxOptions = Object.assign(
                {},
                opts,
                {"per-mode": "symbol" as PerMode},
            );
            // Real fractions are built in the builder path; text fallback should
            // stay readable and never emit dash separators.
            return formatUnitInternal(
                raw,
                baseOpts,
                powerFactor,
                ctx,
                lockedOptionKeys,
                recursionDepth,
                allowLiteralUnits,
            );
        }
    }

    const tokens = tokenizeUnitInput(raw.trim());
    if (tokens.length === 0) {
        return "";
    }

    const out: string[] = [];
    let pendingPer = false;
    let stickyPerActive = false;
    let denominatorStart = -1;
    let denominatorTokenCount = 0;
    let pendingPrefix: string | null = null;
    let pendingLeadingPower: string | null = null;
    const mergeBracketDenominator =
        perMode === "symbol" && opts["bracket-unit-denominator"];
    const perSymbol = opts["per-symbol"] || "/";
    const interUnitProduct = (() => {
        const rawProduct = opts["inter-unit-product"] || " ";
        if (!rawProduct.trim()) {
            return " ";
        }
        return /\s/.test(rawProduct) ? rawProduct : ` ${rawProduct} `;
    })();
    const appendPowerToLastUnit = (power: string): boolean => {
        const parsePowerFraction = (
            rawPower: string,
        ): {numerator: string; denominator: string} | null => {
            const compact = rawPower.replace(/\s+/g, "");
            const frac = compact.match(
                /^([+-]?\d+(?:[.,]\d+)?)\/([+-]?\d+(?:[.,]\d+)?)$/u,
            );
            if (!frac) {
                return null;
            }
            return {numerator: frac[1], denominator: frac[2]};
        };
        const parsePowerNumber = (rawPower: string): number | null => {
            const compact = rawPower.replace(/\s+/g, "");
            const frac = compact.match(/^([+-]?\d+)\/(\d+)$/u);
            if (frac) {
                const den = Number(frac[2]);
                if (den !== 0) {
                    return Number(frac[1]) / den;
                }
            }
            let normalized = compact;
            const markers = new Set([...opts["input-decimal-markers"], ","]);
            for (const marker of markers) {
                if (marker !== ".") {
                    normalized = normalized.split(marker).join(".");
                }
            }
            const n = Number(normalized);
            return Number.isFinite(n) ? n : null;
        };
        const powerNumParsed = parsePowerNumber(power);
        const powerNum = powerNumParsed == null ? NaN : powerNumParsed;
        const powerFrac = parsePowerFraction(power);
        const formatPowerSuffix = (value: string): string => {
            return /^[-+]?\d+$/u.test(value)
                ? toSuperscript(value)
                : `${POWER_MARKER}{${formatNum(value, opts)}}`;
        };
        for (let j = out.length - 1; j >= 0; j--) {
            const token = out[j];
            if (token === " " || token === "/" || token === "(" || token === ")" ||
                token === "·") {
                continue;
            }
            const split = splitTrailingSuperscript(token);
            const currentExpNum = split.exponent != null ? Number(split.exponent) : NaN;
            if (
                opts["power-half-as-sqrt"] &&
                Number.isFinite(powerNum) &&
                Math.abs(powerNum - 0.5) < 1e-12 &&
                (!Number.isFinite(currentExpNum) || currentExpNum === 1)
            ) {
                out[j] = `${SQRT_MARKER}{${split.base}}`;
                return true;
            }
            if (Number.isFinite(currentExpNum) && Number.isFinite(powerNum)) {
                const scaled = String(currentExpNum * powerNum);
                out[j] = `${split.base}${formatPowerSuffix(scaled)}`;
            } else if (powerFrac) {
                const numText = formatNum(powerFrac.numerator, opts);
                const denText = formatNum(powerFrac.denominator, opts);
                out[j] = `${token}${POWER_FRAC_MARKER}{${numText}}{${denText}}`;
            } else {
                out[j] = `${token}${formatPowerSuffix(power)}`;
            }
            return true;
        }
        return false;
    };
    const appendQualifierToLastUnit = (qualifier: string): boolean => {
        for (let j = out.length - 1; j >= 0; j--) {
            const token = out[j];
            if (token === " " || token === "/" || token === "(" || token === ")" ||
                token === "·") {
                continue;
            }
            if (opts["qualifier-mode"] === "bracket") {
                out[j] = `${token}(${qualifier})`;
            } else {
                out[j] = `${token}${QUALIFIER_MARKER}{${qualifier}}`;
            }
            return true;
        }
        return false;
    };
    const multiplyRenderedUnitPower = (renderedToken: string): string => {
        if (powerFactor <= 1) {
            return renderedToken;
        }
        const split = splitTrailingSuperscript(renderedToken);
        const currentExpNum = split.exponent != null ? Number(split.exponent) : 1;
        if (!Number.isFinite(currentExpNum)) {
            return renderedToken;
        }
        const scaled = currentExpNum * powerFactor;
        return scaled === 1 ? split.base : `${split.base}${toSuperscript(String(scaled))}`;
    };
    const applyReciprocalPower = (renderedToken: string): string => {
        const split = splitTrailingSuperscript(renderedToken);
        const currentExpNum = split.exponent != null ? Number(split.exponent) : 1;
        if (!Number.isFinite(currentExpNum)) {
            return `${renderedToken}${toSuperscript("-1")}`;
        }
        return `${split.base}${toSuperscript(String(-currentExpNum))}`;
    };

    for (let i = 0; i < tokens.length; i++) {
        const tk = tokens[i];

        if (tk === "/" || tk === "\\per") {
            pendingPer = true;
            if (opts["sticky-per"]) {
                stickyPerActive = true;
            }
            if (perMode === "symbol" || perMode === "repeated-symbol") {
                if (denominatorStart < 0) {
                    denominatorStart = out.length;
                } else if (mergeBracketDenominator) {
                    // Merge repeated denominator groups: a/b/c -> a/(bc)
                    continue;
                }
                out.push(perSymbol);
            }
            continue;
        }

        if (tk === "*") {
            out.push(interUnitProduct);
            continue;
        }
        if (tk === "\\squared") {
            appendPowerToLastUnit("2");
            continue;
        }
        if (tk === "\\cubed") {
            appendPowerToLastUnit("3");
            continue;
        }
        if (tk === "\\tothe") {
            let power = "";
            if (tokens[i + 1] === "{") {
                let j = i + 2;
                let depth = 1;
                const parts: string[] = [];
                while (j < tokens.length && depth > 0) {
                    const part = tokens[j];
                    if (part === "{") {
                        depth++;
                    } else if (part === "}") {
                        depth--;
                        if (depth === 0) {
                            j++;
                            break;
                        }
                    }
                    if (depth > 0) {
                        parts.push(part);
                    }
                    j++;
                }
                power = parts.join("").trim();
                i = j - 1;
            } else if (tokens[i + 1]) {
                power = tokens[i + 1];
                i += 1;
            }
            if (power) {
                appendPowerToLastUnit(power);
            }
            continue;
        }
        if (tk === "\\of") {
            let qualifier = "";
            if (tokens[i + 1] === "{") {
                let j = i + 2;
                let depth = 1;
                const parts: string[] = [];
                while (j < tokens.length && depth > 0) {
                    const part = tokens[j];
                    if (part === "{") {
                        depth++;
                    } else if (part === "}") {
                        depth--;
                        if (depth === 0) {
                            j++;
                            break;
                        }
                    }
                    if (depth > 0) {
                        parts.push(part);
                    }
                    j++;
                }
                qualifier = parts.join("").trim();
                i = j - 1;
            } else if (tokens[i + 1]) {
                qualifier = tokens[i + 1].replace(/^\\/u, "");
                i += 1;
            }
            if (qualifier) {
                appendQualifierToLastUnit(qualifier);
            }
            continue;
        }

        if (tk.startsWith("\\")) {
            const name = tk.slice(1);
            if (ctx.declaredPowersBefore[name]) {
                pendingLeadingPower = ctx.declaredPowersBefore[name];
                continue;
            }
            if (ctx.declaredPowersAfter[name]) {
                appendPowerToLastUnit(ctx.declaredPowersAfter[name]);
                continue;
            }
            if (ctx.declaredQualifiers[name]) {
                appendQualifierToLastUnit(ctx.declaredQualifiers[name]);
                continue;
            }
            if (ctx.prefixMap[name] && !ctx.unitMap[name]) {
                pendingPrefix = ctx.prefixMap[name];
                continue;
            }
        }

        let rendered = renderUnitToken(tk, ctx);
        if (tk.startsWith("\\")) {
            const name = tk.slice(1);
            const declaredUnit = ctx.declaredUnits[name];
            if (declaredUnit) {
                const localOpts = declaredUnit.options
                    ? parseOptions(declaredUnit.options, opts)
                    : opts;
                for (const key of lockedOptionKeys) {
                    if ((opts as unknown as Record<string, unknown>)[key] != null) {
                        (localOpts as unknown as Record<string, unknown>)[key] =
                            (opts as unknown as Record<string, unknown>)[key];
                    }
                }
                rendered = formatUnitInternal(
                    declaredUnit.symbol,
                    localOpts,
                    1,
                    ctx,
                    lockedOptionKeys,
                    recursionDepth + 1,
                    true,
                );
            }
        }
        if (pendingPrefix) {
            if (tk.startsWith("\\") && !!ctx.unitMap[tk.slice(1)]) {
                rendered = `${pendingPrefix}${rendered}`;
            } else if (rendered.length > 0 && rendered !== "/" && rendered !== "^") {
                rendered = `${pendingPrefix}${rendered}`;
            }
            pendingPrefix = null;
        }
        if (opts["forbid-literal-units"] &&
            !allowLiteralUnits &&
            !tk.startsWith("\\") &&
            /[A-Za-z]/.test(tk)) {
            throw new Error(`Literal unit token "${tk}" is forbidden`);
        }
        if (denominatorStart >= 0 && isUnitLikeToken(rendered)) {
            denominatorTokenCount++;
        }

        const usePowerPerMode = perMode === "power" || perMode === "power-positive-first";
        const shouldReciprocate =
            usePowerPerMode &&
            (pendingPer || (opts["sticky-per"] && stickyPerActive));
        if (shouldReciprocate) {
            rendered = applyReciprocalPower(rendered);
        }
        pendingPer = false;
        if (isUnitLikeToken(rendered) && tk !== "^") {
            rendered = multiplyRenderedUnitPower(rendered);
        }

        if (out.length > 0) {
            const prev = out[out.length - 1];
            if (
                prev !== "/" &&
                prev !== "^" &&
                prev !== "{" &&
                prev !== "(" &&
                prev !== "·" &&
                rendered !== "}" &&
                rendered !== ")" &&
                rendered !== "^"
            ) {
                out.push(interUnitProduct);
            }
        }

        out.push(rendered);
        if (pendingLeadingPower && isUnitLikeToken(rendered)) {
            appendPowerToLastUnit(pendingLeadingPower);
            pendingLeadingPower = null;
        }
    }

    if (mergeBracketDenominator &&
        denominatorStart >= 0 &&
        denominatorTokenCount > 1) {
        out.splice(denominatorStart + 1, 0, "(");
        out.push(")");
    }

    let formatted = out.join("").replace(/\s+/g, " ").trim();
    if (perMode === "power-positive-first") {
        formatted = reorderPowerPositiveFirst(formatted);
    }
    return formatted;
};

const formatUnit = (
    raw: string,
    opts: SiunitxOptions,
    powerFactor = 1,
    lockedOptionKeys?: Set<string>,
): string => {
    const ctx = getUnitRuntimeContext(opts);
    return formatUnitInternal(
        raw,
        opts,
        powerFactor,
        ctx,
        lockedOptionKeys || new Set<string>(),
    );
};

const resolveUnitScopedOptions = (
    rawUnit: string,
    opts: SiunitxOptions,
    lockedOptionKeys: Set<string>,
): SiunitxOptions => {
    const tokens = tokenizeUnitInput((rawUnit || "").trim());
    if (tokens.length !== 1 || !tokens[0].startsWith("\\")) {
        return opts;
    }
    const name = tokens[0].slice(1);
    const declared = (opts["__declared-units__"] || {})[name];
    if (!declared || !declared.options) {
        return opts;
    }
    const resolved = parseOptions(declared.options, opts);
    for (const key of lockedOptionKeys) {
        if ((opts as unknown as Record<string, unknown>)[key] != null) {
            (resolved as unknown as Record<string, unknown>)[key] =
                (opts as unknown as Record<string, unknown>)[key];
        }
    }
    return resolved;
};

const validateUnitInput = (raw: string, opts: SiunitxOptions) => {
    if (!opts["parse-units"] || !opts["forbid-literal-units"]) {
        return;
    }
    const tokens = tokenizeUnitInput(raw.trim());
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token === "\\of") {
            i++;
            if (i < tokens.length && tokens[i] === "{") {
                let depth = 1;
                while (i + 1 < tokens.length && depth > 0) {
                    i++;
                    if (tokens[i] === "{") {
                        depth++;
                    } else if (tokens[i] === "}") {
                        depth--;
                    }
                }
            }
            continue;
        }
        if (!token.startsWith("\\") && /[A-Za-z]/.test(token)) {
            throw new Error(`Literal unit token "${token}" is forbidden`);
        }
    }
};

// -----------------------------
// Angle formatting
// -----------------------------

const formatAng = (raw: string, opts: SiunitxOptions): string => {
    const s = raw.trim();
    if (!s) {
        return "";
    }
    const rawParts = s.split(/[;,]/).map((x) => x.trim());
    const hasStructuredInput = rawParts.length > 1;
    const mode = opts["angle-mode"];
    const n = (x: string): number | null => {
        const parsed = parseNumericValue(x, opts);
        return parsed == null || !Number.isFinite(parsed) ? null : parsed;
    };
    const toArc = (degValue: number): string => {
        const sign = degValue < 0 ? "−" : "";
        let abs = Math.abs(degValue);
        const deg = Math.floor(abs);
        abs = (abs - deg) * 60;
        const min = Math.floor(abs);
        let sec = (abs - min) * 60;
        sec = Math.round(sec * 1e12) / 1e12;
        let outDeg = deg;
        let outMin = min;
        let outSec = sec;
        if (outSec >= 60) {
            outSec -= 60;
            outMin += 1;
        }
        if (outMin >= 60) {
            outMin -= 60;
            outDeg += 1;
        }
        const secStr = Number.isInteger(outSec)
            ? String(Math.trunc(outSec))
            : String(outSec).replace(/(\.\d*?[1-9])0+$/u, "$1").replace(/\.0+$/u, "");
        return `${sign}${outDeg}°${outMin}'${secStr}"`;
    };
    const toDecimal = (deg: number, min: number, sec: number): string => {
        const sign = deg < 0 ? -1 : 1;
        const absDeg = Math.abs(deg) + min / 60 + sec / 3600;
        const v = sign * absDeg;
        const repr = v.toFixed(15).replace(/0+$/u, "").replace(/\.$/u, "");
        return `${formatNum(repr, opts)}°`;
    };
    const formatArcParts = (degPart: string, minPart: string, secPart: string): string => {
        const parts = [degPart, minPart, secPart];
        const firstPresent = parts.findIndex((p) => p !== "");
        if (firstPresent < 0) {
            return "";
        }
        let sign = "";
        const lead = parts[firstPresent];
        if (lead.startsWith("-") || lead.startsWith("+")) {
            sign = lead[0] === "-" ? "−" : "+";
            parts[firstPresent] = lead.slice(1);
        }

        if (opts["fill-angle-degrees"] && parts[0] === "" &&
            (parts[1] !== "" || parts[2] !== "")) {
            parts[0] = "0";
        }
        if (opts["fill-angle-minutes"] && parts[1] === "" &&
            (parts[0] !== "" || parts[2] !== "")) {
            parts[1] = "0";
        }
        if (opts["fill-angle-seconds"] && parts[2] === "" &&
            (parts[0] !== "" || parts[1] !== "")) {
            parts[2] = "0";
        }

        const firstRendered = parts.findIndex((p) => p !== "");
        if (firstRendered >= 0 && sign) {
            parts[firstRendered] = `${sign}${parts[firstRendered]}`;
        }

        const out: string[] = [];
        if (parts[0]) {
            out.push(`${parts[0]}°`);
        }
        if (parts[1]) {
            out.push(`${parts[1]}'`);
        }
        if (parts[2]) {
            out.push(`${parts[2]}"`);
        }
        return out.join("");
    };

    if (mode === "arc") {
        if (!hasStructuredInput) {
            const degValue = n(s);
            return degValue == null ? `${s}°` : toArc(degValue);
        }
        const degPart = rawParts[0] || "";
        const minPart = rawParts[1] || "";
        const secPart = rawParts[2] || "";
        return formatArcParts(degPart, minPart, secPart);
    }

    if (mode === "decimal") {
        if (!hasStructuredInput) {
            return `${s}°`;
        }
        const deg = n(rawParts[0] || "0");
        const min = n(rawParts[1] || "0");
        const sec = n(rawParts[2] || "0");
        if (deg == null || min == null || sec == null) {
            return `${s}°`;
        }
        return toDecimal(deg, min, sec);
    }

    // input mode
    if (hasStructuredInput) {
        const degPart = rawParts[0] || "";
        const minPart = rawParts[1] || "";
        const secPart = rawParts[2] || "";
        return formatArcParts(degPart, minPart, secPart);
    }
    return `${s}°`;
};

// -----------------------------
// Shared rendering helpers
// -----------------------------

const textToMathNodesWithMode = (
    text: string,
    mode: "math" | "text",
): AnyParseNode[] => {
    const nodes: AnyParseNode[] = [];
    const isBoundary = (ch: string): boolean => /[\s/()·]/.test(ch);
    let i = 0;
    while (i < text.length) {
        if (text.startsWith(DIGIT_PI_MARKER, i)) {
            nodes.push({
                type: "mathord",
                mode: "math",
                text: "\\pi",
            });
            i += DIGIT_PI_MARKER.length;
            continue;
        }
        if (text.startsWith(DIGIT_DOTS_MARKER, i)) {
            nodes.push({
                type: "mathord",
                mode: "math",
                text: "\\ldots",
            });
            i += DIGIT_DOTS_MARKER.length;
            continue;
        }
        if (text.startsWith(ASYM_UNCERT_MARKER, i)) {
            const baseStart = i + ASYM_UNCERT_MARKER.length;
            if (text[baseStart] === "{") {
                let j = baseStart + 1;
                let depth = 1;
                while (j < text.length && depth > 0) {
                    if (text[j] === "{") {
                        depth++;
                    } else if (text[j] === "}") {
                        depth--;
                    }
                    j++;
                }
                if (depth === 0 && text[j] === "{") {
                    const baseText = text.slice(baseStart + 1, j - 1);
                    const plusStart = j;
                    j = plusStart + 1;
                    depth = 1;
                    while (j < text.length && depth > 0) {
                        if (text[j] === "{") {
                            depth++;
                        } else if (text[j] === "}") {
                            depth--;
                        }
                        j++;
                    }
                    if (depth === 0 && text[j] === "{") {
                        const plusText = text.slice(plusStart + 1, j - 1);
                        const minusStart = j;
                        j = minusStart + 1;
                        depth = 1;
                        while (j < text.length && depth > 0) {
                            if (text[j] === "{") {
                                depth++;
                            } else if (text[j] === "}") {
                                depth--;
                            }
                            j++;
                        }
                        if (depth === 0) {
                            const minusText = text.slice(minusStart + 1, j - 1);
                            nodes.push({
                                type: "supsub",
                                mode,
                                base: {
                                    type: "ordgroup",
                                    mode,
                                    body: textToMathNodesWithMode(baseText, mode),
                                },
                                sup: {
                                    type: "ordgroup",
                                    mode,
                                    body: [
                                        {type: "textord", mode, text: "+"},
                                        ...textToMathNodesWithMode(plusText, mode),
                                    ],
                                },
                                sub: {
                                    type: "ordgroup",
                                    mode,
                                    body: [
                                        {type: "textord", mode, text: "−"},
                                        ...textToMathNodesWithMode(minusText, mode),
                                    ],
                                },
                            });
                            i = j;
                            continue;
                        }
                    }
                }
            }
        }
        if (text.startsWith(POWER_FRAC_MARKER, i)) {
            const firstStart = i + POWER_FRAC_MARKER.length;
            if (text[firstStart] === "{") {
                let j = firstStart + 1;
                let depth = 1;
                while (j < text.length && depth > 0) {
                    if (text[j] === "{") {
                        depth++;
                    } else if (text[j] === "}") {
                        depth--;
                    }
                    j++;
                }
                if (depth === 0 && text[j] === "{") {
                    const numeratorText = text.slice(firstStart + 1, j - 1);
                    const secondStart = j;
                    j = secondStart + 1;
                    depth = 1;
                    while (j < text.length && depth > 0) {
                        if (text[j] === "{") {
                            depth++;
                        } else if (text[j] === "}") {
                            depth--;
                        }
                        j++;
                    }
                    if (depth === 0) {
                        const denominatorText = text.slice(secondStart + 1, j - 1);
                        const fracNode: ParseNode<"genfrac"> = {
                            type: "genfrac",
                            mode,
                            continued: false,
                            numer: {
                                type: "ordgroup",
                                mode,
                                body: textToMathNodesWithMode(numeratorText, mode),
                            },
                            denom: {
                                type: "ordgroup",
                                mode,
                                body: textToMathNodesWithMode(denominatorText, mode),
                            },
                            hasBarLine: true,
                            leftDelim: null,
                            rightDelim: null,
                            barSize: null,
                        };
                        const last = nodes[nodes.length - 1];
                        if (last && last.type === "supsub") {
                            const supGroup: ParseNode<"ordgroup"> = last.sup &&
                                    last.sup.type === "ordgroup"
                                ? last.sup
                                : {
                                    type: "ordgroup",
                                    mode,
                                    body: [],
                                };
                            supGroup.body.push(fracNode);
                            last.sup = supGroup;
                            i = j;
                            continue;
                        }
                        const baseNodes: ParseNode<"textord">[] = [];
                        while (nodes.length > 0) {
                            const prev = nodes[nodes.length - 1];
                            if (prev.type !== "textord" || isBoundary(prev.text)) {
                                break;
                            }
                            baseNodes.unshift(nodes.pop() as ParseNode<"textord">);
                        }
                        if (baseNodes.length > 0) {
                            nodes.push({
                                type: "supsub",
                                mode,
                                base: {
                                    type: "ordgroup",
                                    mode,
                                    body: baseNodes,
                                },
                                sup: {
                                    type: "ordgroup",
                                    mode,
                                    body: [fracNode],
                                },
                            });
                            i = j;
                            continue;
                        }
                    }
                }
            }
        }
        if (text.startsWith(POWER_MARKER, i)) {
            const bodyStart = i + POWER_MARKER.length;
            if (text[bodyStart] === "{") {
                let j = bodyStart + 1;
                let depth = 1;
                while (j < text.length && depth > 0) {
                    if (text[j] === "{") {
                        depth++;
                    } else if (text[j] === "}") {
                        depth--;
                    }
                    j++;
                }
                if (depth === 0) {
                    const powerText = text.slice(bodyStart + 1, j - 1);
                    const supBody: ParseNode<"textord">[] = Array.from(powerText).map((ch) => ({
                        type: "textord",
                        mode,
                        text: ch,
                    }));
                    const last = nodes[nodes.length - 1];
                    if (last && last.type === "supsub") {
                        const supGroup: ParseNode<"ordgroup"> = last.sup &&
                                last.sup.type === "ordgroup"
                            ? last.sup
                            : {
                                type: "ordgroup",
                                mode,
                                body: [],
                            };
                        supGroup.body.push(...supBody);
                        last.sup = supGroup;
                        i = j;
                        continue;
                    }
                    const baseNodes: ParseNode<"textord">[] = [];
                    while (nodes.length > 0) {
                        const prev = nodes[nodes.length - 1];
                        if (prev.type !== "textord" || isBoundary(prev.text)) {
                            break;
                        }
                        baseNodes.unshift(nodes.pop() as ParseNode<"textord">);
                    }
                    if (baseNodes.length > 0) {
                        nodes.push({
                            type: "supsub",
                            mode,
                            base: {
                                type: "ordgroup",
                                mode,
                                body: baseNodes,
                            },
                            sup: {
                                type: "ordgroup",
                                mode,
                                body: supBody,
                            },
                        });
                        i = j;
                        continue;
                    }
                }
            }
        }
        if (text.startsWith(SQRT_MARKER, i)) {
            const bodyStart = i + SQRT_MARKER.length;
            if (text[bodyStart] === "{") {
                let j = bodyStart + 1;
                let depth = 1;
                while (j < text.length && depth > 0) {
                    if (text[j] === "{") {
                        depth++;
                    } else if (text[j] === "}") {
                        depth--;
                    }
                    j++;
                }
                if (depth === 0) {
                    const radicandText = text.slice(bodyStart + 1, j - 1);
                    nodes.push({
                        type: "sqrt",
                        mode,
                        body: {
                            type: "ordgroup",
                            mode,
                            body: textToMathNodesWithMode(radicandText, mode),
                        },
                        index: null,
                    });
                    i = j;
                    continue;
                }
            }
        }
        if (SUPERSCRIPT_REVERSE_MAP[text[i]]) {
            const last = nodes[nodes.length - 1];
            if (last && last.type === "supsub") {
                let j = i;
                let exponent = "";
                while (j < text.length && SUPERSCRIPT_REVERSE_MAP[text[j]]) {
                    exponent += SUPERSCRIPT_REVERSE_MAP[text[j]];
                    j++;
                }
                if (exponent) {
                    const supGroup: ParseNode<"ordgroup"> = last.sup &&
                            last.sup.type === "ordgroup"
                        ? last.sup
                        : {
                            type: "ordgroup",
                            mode,
                            body: [],
                        };
                    supGroup.body.push(
                        ...Array.from(exponent).map((ch) => ({
                            type: "textord" as const,
                            mode,
                            text: ch,
                        })),
                    );
                    last.sup = supGroup;
                    i = j;
                    continue;
                }
            }
        }
        if (text.startsWith(QUALIFIER_MARKER, i)) {
            const bodyStart = i + QUALIFIER_MARKER.length;
            if (text[bodyStart] === "{") {
                let j = bodyStart + 1;
                let depth = 1;
                while (j < text.length && depth > 0) {
                    if (text[j] === "{") {
                        depth++;
                    } else if (text[j] === "}") {
                        depth--;
                    }
                    j++;
                }
                if (depth === 0) {
                    const qualifier = text.slice(bodyStart + 1, j - 1);
                    const subGroup: ParseNode<"ordgroup"> = {
                        type: "ordgroup",
                        mode,
                        body: Array.from(qualifier).map((ch) => ({
                            type: "textord" as const,
                            mode,
                            text: ch,
                        })),
                    };
                    const last = nodes[nodes.length - 1];
                    if (last && last.type === "supsub") {
                        last.sub = subGroup;
                        i = j;
                        continue;
                    }
                    const baseNodes: ParseNode<"textord">[] = [];
                    while (nodes.length > 0) {
                        const prev = nodes[nodes.length - 1];
                        if (prev.type !== "textord" || isBoundary(prev.text)) {
                            break;
                        }
                        baseNodes.unshift(nodes.pop() as ParseNode<"textord">);
                    }
                    if (baseNodes.length > 0) {
                        nodes.push({
                            type: "supsub",
                            mode,
                            base: {
                                type: "ordgroup",
                                mode,
                                body: baseNodes,
                            },
                            sub: subGroup,
                        });
                        i = j;
                        continue;
                    }
                    i = j;
                    continue;
                }
            }
        }
        nodes.push({type: "textord", mode, text: text[i]});
        i++;
    }
    return nodes;
};

const buildTextLikeSpan = (content: string, options: Options) => {
    const nodes = html.buildExpression(
        textToMathNodesWithMode(content, "text"),
        options,
        true,
    );
    return makeSpan(["mord", "text", "siunitx"], nodes, options);
};

const buildTextLikeMathML = (content: string, options: Options) => {
    const nodes = mml.buildExpression(
        textToMathNodesWithMode(content, "math"),
        options,
        true,
    );
    return nodes.length === 1 ? nodes[0] : new MathNode("mrow", nodes);
};

const buildFractionNode = (
    numerator: string,
    denominator: string,
): ParseNode<"genfrac"> => {
    return {
        type: "genfrac",
        mode: "math",
        continued: false,
        numer: {
            type: "ordgroup",
            mode: "math",
            body: textToMathNodesWithMode(numerator, "math"),
        },
        denom: {
            type: "ordgroup",
            mode: "math",
            body: textToMathNodesWithMode(denominator, "math"),
        },
        hasBarLine: true,
        leftDelim: null,
        rightDelim: null,
        barSize: null,
    };
};

type FractionPiece = {numerator: string; denominator: string};
type ContentPiece = string | FractionPiece;

const joinPieceLists = (
    itemPieces: ContentPiece[][],
    opts: SiunitxOptions,
): ContentPiece[] => {
    if (itemPieces.length === 0) {
        return [];
    }
    if (itemPieces.length === 1) {
        return itemPieces[0];
    }
    const out: ContentPiece[] = [];
    for (let i = 0; i < itemPieces.length; i++) {
        if (i > 0) {
            const sep = i === itemPieces.length - 1
                ? (itemPieces.length === 2
                    ? opts["list-pair-separator"]
                    : opts["list-final-separator"])
                : opts["list-separator"];
            out.push(sep);
        }
        out.push(...itemPieces[i]);
    }
    return out;
};

const getFractionUnitPiece = (
    rawUnit: string,
    opts: SiunitxOptions,
    ctx: UnitRuntimeContext,
    powerFactor = 1,
): FractionPiece | null => {
    const parts = splitFractionUnitParts(rawUnit || "", opts, ctx);
    if (!parts) {
        return null;
    }
    const baseOpts: SiunitxOptions = Object.assign(
        {},
        opts,
        {"per-mode": "symbol" as PerMode},
    );
    return {
        numerator: formatUnitInternal(
            parts.numeratorRaw,
            baseOpts,
            powerFactor,
            ctx,
            new Set<string>(),
        ),
        denominator: formatUnitInternal(
            parts.denominatorRaw,
            baseOpts,
            powerFactor,
            ctx,
            new Set<string>(),
        ),
    };
};

const maybeGetFractionContentPieces = (
    group: SiunitxNode,
): ContentPiece[] | null => {
    if (group.options["per-mode"] !== "fraction") {
        return null;
    }
    const ctx = getUnitRuntimeContext(group.options);
    const sep = group.options["number-unit-separator"];
    const unit = group.unit || "";
    const adjustedSingle = applyPrefixModeToQuantity(
        group.number || "",
        unit,
        group.options,
        ctx,
    );
    const fractionUnit = getFractionUnitPiece(adjustedSingle.unit, group.options, ctx);
    if (!fractionUnit &&
        group.command !== "\\qtylist" &&
        group.command !== "\\qtyproduct" &&
        group.command !== "\\SIrange" &&
        group.command !== "\\qtyrange") {
        return null;
    }
    switch (group.command) {
        case "\\si":
        case "\\unit":
            return fractionUnit ? [fractionUnit] : null;
        case "\\SI":
        case "\\qty":
            return fractionUnit
                ? [`${formatNum(adjustedSingle.number, group.options)}${sep}`, fractionUnit]
                : null;
        case "\\complexqty":
            return fractionUnit
                ? [`${formatComplexNum(group.number || "", group.options)}${sep}`, fractionUnit]
                : null;
        case "\\qtylist": {
            const items = splitListItems(group.number || "");
            if (items.length === 0) {
                return null;
            }
            const mode = group.options["list-units"];
            if (mode === "repeat") {
                const repeatedUnit = fractionUnit;
                if (!repeatedUnit) {
                    return null;
                }
                const itemPieces = items.map((item) => [
                    `${formatNum(item, group.options)}${sep}`,
                    repeatedUnit,
                ] as ContentPiece[]);
                return joinPieceLists(itemPieces, group.options);
            }
            if (!fractionUnit) {
                return null;
            }
            const numbers = formatNumList(group.number || "", group.options);
            const prefix = mode === "bracket"
                ? `(${numbers})${sep}`
                : `${numbers}${sep}`;
            return [prefix, fractionUnit];
        }
        case "\\qtyproduct": {
            const items = splitProductItems(group.number || "");
            if (items.length === 0) {
                return null;
            }
            let joiner = group.options["product-mode"] === "phrase"
                ? group.options["product-phrase"]
                : group.options["product-symbol"];
            if (group.options["product-mode"] === "symbol" && !/[ \u00A0]/.test(joiner)) {
                joiner = ` ${joiner} `;
            }
            const numbers = items.map((item) => formatNum(item, group.options)).join(joiner);
            const mode = group.options["product-units"];
            if (mode === "repeat") {
                const repeatedUnit = fractionUnit;
                if (!repeatedUnit) {
                    return null;
                }
                return items
                    .map((item, idx) => {
                        const prefix = `${formatNum(item, group.options)}${sep}`;
                        return idx === 0
                            ? ([prefix, repeatedUnit] as ContentPiece[])
                            : ([joiner, prefix, repeatedUnit] as ContentPiece[]);
                    })
                    .flat();
            }
            if (mode === "bracket") {
                return fractionUnit ? [`(${numbers})${sep}`, fractionUnit] : null;
            }
            if (mode === "power" || mode === "bracket-power") {
                const poweredUnit = getFractionUnitPiece(
                    unit,
                    group.options,
                    ctx,
                    items.length,
                );
                if (!poweredUnit) {
                    return null;
                }
                const prefix = mode === "bracket-power"
                    ? `(${numbers})${sep}`
                    : `${numbers}${sep}`;
                return [prefix, poweredUnit];
            }
            return fractionUnit ? [`${numbers}${sep}`, fractionUnit] : null;
        }
        case "\\SIrange":
        case "\\qtyrange": {
            const rangeUnit = fractionUnit;
            if (!rangeUnit) {
                return null;
            }
            const n1 = formatNum(group.number || "", group.options);
            const n2 = formatNum(group.numberB || "", group.options);
            const phraseDefault = group.command === "\\qtyrange" ? " to " : "-";
            const phrase = group.options["range-phrase"] === "-"
                ? phraseDefault
                : group.options["range-phrase"] || phraseDefault;
            const n = `${n1}${phrase}${n2}`;
            if (group.options["range-units"] === "repeat") {
                return [`${n1}${sep}`, rangeUnit, `${phrase}${n2}${sep}`, rangeUnit];
            }
            const prefix = group.options["range-units"] === "bracket"
                ? `(${n})${sep}`
                : `${n}${sep}`;
            return [prefix, rangeUnit];
        }
        default:
            return null;
    }
};

const maybeBuildFractionUnitHtml = (group: SiunitxNode, options: Options) => {
    const pieces = maybeGetFractionContentPieces(group);
    if (!pieces) {
        return null;
    }
    const nodes = [] as ReturnType<typeof html.buildExpression>;
    for (const piece of pieces) {
        if (typeof piece === "string") {
            if (piece) {
                nodes.push(...html.buildExpression(
                    textToMathNodesWithMode(piece, "text"),
                    options,
                    true,
                ));
            }
        } else {
            nodes.push(html.buildGroup(
                buildFractionNode(piece.numerator, piece.denominator),
                options,
                options,
            ));
        }
    }
    return makeSpan(["mord", "siunitx"], nodes, options);
};

const maybeBuildFractionUnitMathML = (group: SiunitxNode, options: Options) => {
    const pieces = maybeGetFractionContentPieces(group);
    if (!pieces) {
        return null;
    }
    if (pieces.length === 1 && typeof pieces[0] !== "string") {
        return mml.buildGroup(
            buildFractionNode(pieces[0].numerator, pieces[0].denominator),
            options,
        );
    }
    const children: MathNode[] = [];
    for (const piece of pieces) {
        if (typeof piece === "string") {
            if (piece) {
                children.push(buildTextLikeMathML(piece, options));
            }
        } else {
            children.push(
                mml.buildGroup(
                    buildFractionNode(piece.numerator, piece.denominator),
                    options,
                ),
            );
        }
    }
    return new MathNode("mrow", children);
};

const formatContent = (group: SiunitxNode): string => {
    switch (group.command) {
        case "\\num":
            return formatNum(group.number || "", group.options);
        case "\\numlist":
            return formatNumList(group.number || "", group.options);
        case "\\numproduct":
            return formatNumProduct(group.number || "", group.options);
        case "\\duration":
            return formatDuration(group.number || "", group.options);
        case "\\complexnum":
            return formatComplexNum(group.number || "", group.options);
        case "\\si":
        case "\\unit":
            return formatUnit(
                group.unit || "",
                group.options,
                1,
                new Set(group.optionKeys || []),
            );
        case "\\SI":
        case "\\qty": {
            const lockedOptionKeys = new Set(group.optionKeys || []);
            const effectiveOptions = resolveUnitScopedOptions(
                group.unit || "",
                group.options,
                lockedOptionKeys,
            );
            const ctx = getUnitRuntimeContext(effectiveOptions);
            const adjusted = applyPrefixModeToQuantity(
                group.number || "",
                group.unit || "",
                effectiveOptions,
                ctx,
            );
            const n = formatNum(adjusted.number, effectiveOptions);
            const u = formatUnit(
                adjusted.unit,
                effectiveOptions,
                1,
                lockedOptionKeys,
            );
            return `${n}${effectiveOptions["number-unit-separator"]}${u}`;
        }
        case "\\qtylist":
            return formatQtyList(
                group.number || "",
                group.unit || "",
                group.options,
            );
        case "\\qtyproduct":
            return formatQtyProduct(
                group.number || "",
                group.unit || "",
                group.options,
            );
        case "\\complexqty":
            return formatComplexQty(
                group.number || "",
                group.unit || "",
                group.options,
            );
        case "\\numrange":
            return formatNumRange(
                group.number || "",
                group.numberB || "",
                group.options,
            );
        case "\\SIrange":
        case "\\qtyrange": {
            const n1 = formatNum(group.number || "", group.options);
            const n2 = formatNum(group.numberB || "", group.options);
            const phraseDefault = group.command === "\\qtyrange" ? " to " : "-";
            const phrase = group.options["range-phrase"] === "-"
                ? phraseDefault
                : group.options["range-phrase"] || phraseDefault;
            const n = `${n1}${phrase}${n2}`;
            const u = formatUnit(group.unit || "", group.options);
            const sep = group.options["number-unit-separator"];
            if (group.options["range-units"] === "repeat") {
                return `${n1}${sep}${u}${phrase}${n2}${sep}${u}`;
            }
            if (group.options["range-units"] === "bracket") {
                return `(${n})${sep}${u}`;
            }
            return `${n}${sep}${u}`;
        }
        case "\\ang":
            return formatAng(group.angle || "", group.options);
        case "\\sisetup":
        default:
            return "";
    }
};

const getNoParseNumberNodes = (
    group: SiunitxNode,
    mode: "math" | "text",
): AnyParseNode[] | null => {
    if (group.options["parse-numbers"] || !group.body) {
        return null;
    }
    if (group.command === "\\num") {
        return group.body;
    }
    if (group.command === "\\SI" || group.command === "\\qty") {
        const lockedOptionKeys = new Set(group.optionKeys || []);
        const effectiveOptions = resolveUnitScopedOptions(
            group.unit || "",
            group.options,
            lockedOptionKeys,
        );
        const u = formatUnit(group.unit || "", effectiveOptions, 1, lockedOptionKeys);
        const sep = effectiveOptions["number-unit-separator"];
        return [
            ...group.body,
            ...textToMathNodesWithMode(`${sep}${u}`, mode),
        ];
    }
    return null;
};

const siunitxHtmlBuilder = (group: SiunitxNode, options: Options) => {
    const resolvedGroup: SiunitxNode = Object.assign(
        {},
        group,
        {options: resolvePerModeByStyle(group.options, options)},
    );
    const literalNumberNodes = getNoParseNumberNodes(resolvedGroup, "math");
    if (literalNumberNodes) {
        const nodes = html.buildExpression(literalNumberNodes, options, true);
        return makeSpan(["mord", "siunitx"], nodes, options);
    }
    const fraction = maybeBuildFractionUnitHtml(resolvedGroup, options);
    if (fraction) {
        return fraction;
    }
    return buildTextLikeSpan(formatContent(resolvedGroup), options);
};

const siunitxMathmlBuilder = (group: SiunitxNode, options: Options) => {
    const resolvedGroup: SiunitxNode = Object.assign(
        {},
        group,
        {options: resolvePerModeByStyle(group.options, options)},
    );
    const literalNumberNodes = getNoParseNumberNodes(resolvedGroup, "math");
    if (literalNumberNodes) {
        const nodes = mml.buildExpression(literalNumberNodes, options, true);
        return nodes.length === 1 ? nodes[0] : new MathNode("mrow", nodes);
    }
    const fraction = maybeBuildFractionUnitMathML(resolvedGroup, options);
    if (fraction) {
        return fraction;
    }
    return buildTextLikeMathML(formatContent(resolvedGroup), options);
};

// -----------------------------
// Command definitions
// -----------------------------

defineFunction({
    type: "siunitx",
    names: ["\\sisetup"],
    props: {
        numArgs: 1,
        argTypes: ["raw"],
        allowedInText: true,
        primitive: true,
    },
    handler: ({parser}, args) => {
        const raw = (args[0] as ParseNode<"raw">).string;
        const baseOptions = getCurrentOptions(parser);
        let options: SiunitxOptions;
        try {
            options = parseOptions(raw, baseOptions);
        } catch (e) {
            throw new ParseError(
                `Invalid \\sisetup options: ${(e as Error).message}`,
                parser.gullet.future(),
            );
        }
        parser.gullet.macros.set(SIUNITX_OPTIONS_MACRO, JSON.stringify(options));

        const node: SiunitxNode = {
            type: "siunitx",
            mode: parser.mode,
            command: "\\sisetup",
            options,
            body: [],
        };
        return node;
    },
    htmlBuilder: siunitxHtmlBuilder,
    mathmlBuilder: siunitxMathmlBuilder,
});

defineFunction({
    type: "siunitx",
    names: ["\\DeclareSIUnit"],
    props: {
        numArgs: 2,
        numOptionalArgs: 1,
        argTypes: ["raw", "raw", "raw"],
        allowedInText: true,
        primitive: true,
    },
    handler: ({parser}, args, optArgs) => {
        const opt = optArgs[0] ? (optArgs[0] as ParseNode<"raw">).string : "";
        const unitRaw = (args[0] as ParseNode<"raw">).string;
        const symbolRaw = (args[1] as ParseNode<"raw">).string;
        const options = getCurrentOptions(parser);
        try {
            const unitName = parseControlSequenceName(unitRaw, "\\DeclareSIUnit", "unit");
            // Validate unit-level options at declaration time.
            parseOptions(opt || "", options);
            options["__declared-units__"] = Object.assign(
                {},
                options["__declared-units__"],
                {
                    [unitName]: {
                        symbol: normalizeDeclaredUnitSymbol(symbolRaw),
                        options: opt || "",
                    },
                },
            );
            setCurrentOptions(parser, options);
        } catch (e) {
            throw new ParseError(
                `Invalid \\DeclareSIUnit arguments: ${(e as Error).message}`,
                parser.gullet.future(),
            );
        }
        return {
            type: "siunitx",
            mode: parser.mode,
            command: "\\DeclareSIUnit",
            options,
            body: [],
        };
    },
    htmlBuilder: siunitxHtmlBuilder,
    mathmlBuilder: siunitxMathmlBuilder,
});

defineFunction({
    type: "siunitx",
    names: ["\\DeclareSIPrefix"],
    props: {
        numArgs: 0,
        allowedInText: true,
        primitive: true,
    },
    handler: ({parser}) => {
        const options = getCurrentOptions(parser);
        try {
            const prefixArg = parser.parseStringGroup("raw", false);
            const symbolArg = parser.parseStringGroup("raw", false);
            const exponentArg = parser.parseStringGroup("raw", false);
            const name = parseControlSequenceName(
                prefixArg ? prefixArg.text : "",
                "\\DeclareSIPrefix",
                "prefix",
            );
            const symbol = parseTextLikeOption(symbolArg ? symbolArg.text : "");
            const exponent = Math.trunc(Number((exponentArg ? exponentArg.text : "").trim()));
            if (!Number.isFinite(exponent)) {
                throw new Error("prefix exponent must be a number");
            }
            options["__declared-prefixes__"] = Object.assign(
                {},
                options["__declared-prefixes__"],
                {[name]: {symbol, exponent}},
            );
            setCurrentOptions(parser, options);
        } catch (e) {
            throw new ParseError(
                `Invalid \\DeclareSIPrefix arguments: ${(e as Error).message}`,
                parser.gullet.future(),
            );
        }
        return {
            type: "siunitx",
            mode: parser.mode,
            command: "\\DeclareSIPrefix",
            options,
            body: [],
        };
    },
    htmlBuilder: siunitxHtmlBuilder,
    mathmlBuilder: siunitxMathmlBuilder,
});

defineFunction({
    type: "siunitx",
    names: ["\\DeclareSIPower"],
    props: {
        numArgs: 0,
        allowedInText: true,
        primitive: true,
    },
    handler: ({parser}) => {
        const options = getCurrentOptions(parser);
        try {
            const beforeArg = parser.parseStringGroup("raw", false);
            const afterArg = parser.parseStringGroup("raw", false);
            const powerArg = parser.parseStringGroup("raw", false);
            const beforeName = parseControlSequenceName(
                beforeArg ? beforeArg.text : "",
                "\\DeclareSIPower",
                "symbol-before",
            );
            const afterName = parseControlSequenceName(
                afterArg ? afterArg.text : "",
                "\\DeclareSIPower",
                "symbol-after",
            );
            const power = (powerArg ? powerArg.text : "").trim();
            if (!power) {
                throw new Error("power must be non-empty");
            }
            options["__declared-powers-before__"] = Object.assign(
                {},
                options["__declared-powers-before__"],
                {[beforeName]: power},
            );
            options["__declared-powers-after__"] = Object.assign(
                {},
                options["__declared-powers-after__"],
                {[afterName]: power},
            );
            setCurrentOptions(parser, options);
        } catch (e) {
            throw new ParseError(
                `Invalid \\DeclareSIPower arguments: ${(e as Error).message}`,
                parser.gullet.future(),
            );
        }
        return {
            type: "siunitx",
            mode: parser.mode,
            command: "\\DeclareSIPower",
            options,
            body: [],
        };
    },
    htmlBuilder: siunitxHtmlBuilder,
    mathmlBuilder: siunitxMathmlBuilder,
});

defineFunction({
    type: "siunitx",
    names: ["\\DeclareSIQualifier"],
    props: {
        numArgs: 0,
        allowedInText: true,
        primitive: true,
    },
    handler: ({parser}) => {
        const options = getCurrentOptions(parser);
        try {
            const qualifierArg = parser.parseStringGroup("raw", false);
            const symbolArg = parser.parseStringGroup("raw", false);
            const name = parseControlSequenceName(
                qualifierArg ? qualifierArg.text : "",
                "\\DeclareSIQualifier",
                "qualifier",
            );
            options["__declared-qualifiers__"] = Object.assign(
                {},
                options["__declared-qualifiers__"],
                {[name]: parseTextLikeOption(symbolArg ? symbolArg.text : "")},
            );
            setCurrentOptions(parser, options);
        } catch (e) {
            throw new ParseError(
                `Invalid \\DeclareSIQualifier arguments: ${(e as Error).message}`,
                parser.gullet.future(),
            );
        }
        return {
            type: "siunitx",
            mode: parser.mode,
            command: "\\DeclareSIQualifier",
            options,
            body: [],
        };
    },
    htmlBuilder: siunitxHtmlBuilder,
    mathmlBuilder: siunitxMathmlBuilder,
});

defineFunction({
    type: "siunitx",
    names: ["\\num"],
    props: {
        numArgs: 1,
        numOptionalArgs: 1,
        argTypes: ["raw", "raw"],
        allowedInText: true,
    },
    handler: ({parser}, args, optArgs) => {
        const opt = optArgs[0] ? (optArgs[0] as ParseNode<"raw">).string : "";
        const n = (args[0] as ParseNode<"raw">).string;

        let options: SiunitxOptions;
        try {
            options = parseOptions(opt || "", getCurrentOptions(parser));
        } catch (e) {
            throw new ParseError(
                `Invalid \\num options: ${(e as Error).message}`,
                parser.gullet.future(),
            );
        }

        const node: SiunitxNode = {
            type: "siunitx",
            mode: parser.mode,
            command: "\\num",
            options,
            number: n,
            body: !options["parse-numbers"]
                ? parseLiteralNumberBody(parser, n, "\\num")
                : undefined,
        };
        return node;
    },
    htmlBuilder: siunitxHtmlBuilder,
    mathmlBuilder: siunitxMathmlBuilder,
});

defineFunction({
    type: "siunitx",
    names: ["\\numlist"],
    props: {
        numArgs: 1,
        numOptionalArgs: 1,
        argTypes: ["raw", "raw"],
        allowedInText: true,
    },
    handler: ({parser}, args, optArgs) => {
        const opt = optArgs[0] ? (optArgs[0] as ParseNode<"raw">).string : "";
        const numbers = (args[0] as ParseNode<"raw">).string;

        let options: SiunitxOptions;
        try {
            options = parseOptions(opt || "", getCurrentOptions(parser));
        } catch (e) {
            throw new ParseError(
                `Invalid \\numlist options: ${(e as Error).message}`,
                parser.gullet.future(),
            );
        }

        const node: SiunitxNode = {
            type: "siunitx",
            mode: parser.mode,
            command: "\\numlist",
            options,
            number: numbers,
        };
        return node;
    },
    htmlBuilder: siunitxHtmlBuilder,
    mathmlBuilder: siunitxMathmlBuilder,
});

defineFunction({
    type: "siunitx",
    names: ["\\numproduct"],
    props: {
        numArgs: 1,
        numOptionalArgs: 1,
        argTypes: ["raw", "raw"],
        allowedInText: true,
    },
    handler: ({parser}, args, optArgs) => {
        const opt = optArgs[0] ? (optArgs[0] as ParseNode<"raw">).string : "";
        const numbers = (args[0] as ParseNode<"raw">).string;

        let options: SiunitxOptions;
        try {
            options = parseOptions(opt || "", getCurrentOptions(parser));
        } catch (e) {
            throw new ParseError(
                `Invalid \\numproduct options: ${(e as Error).message}`,
                parser.gullet.future(),
            );
        }

        const node: SiunitxNode = {
            type: "siunitx",
            mode: parser.mode,
            command: "\\numproduct",
            options,
            number: numbers,
        };
        return node;
    },
    htmlBuilder: siunitxHtmlBuilder,
    mathmlBuilder: siunitxMathmlBuilder,
});

defineFunction({
    type: "siunitx",
    names: ["\\duration"],
    props: {
        numArgs: 1,
        numOptionalArgs: 1,
        argTypes: ["raw", "raw"],
        allowedInText: true,
    },
    handler: ({parser}, args, optArgs) => {
        const opt = optArgs[0] ? (optArgs[0] as ParseNode<"raw">).string : "";
        const duration = (args[0] as ParseNode<"raw">).string;

        let options: SiunitxOptions;
        try {
            options = parseOptions(opt || "", getCurrentOptions(parser));
            if (!parseDurationInput(duration, options)) {
                throw new Error(`Invalid duration "${duration}"`);
            }
        } catch (e) {
            throw new ParseError(
                `Invalid \\duration options/input: ${(e as Error).message}`,
                parser.gullet.future(),
            );
        }

        const node: SiunitxNode = {
            type: "siunitx",
            mode: parser.mode,
            command: "\\duration",
            options,
            number: duration,
        };
        return node;
    },
    htmlBuilder: siunitxHtmlBuilder,
    mathmlBuilder: siunitxMathmlBuilder,
});

defineFunction({
    type: "siunitx",
    names: ["\\complexnum"],
    props: {
        numArgs: 1,
        numOptionalArgs: 1,
        argTypes: ["raw", "raw"],
        allowedInText: true,
    },
    handler: ({parser}, args, optArgs) => {
        const opt = optArgs[0] ? (optArgs[0] as ParseNode<"raw">).string : "";
        const n = (args[0] as ParseNode<"raw">).string;

        let options: SiunitxOptions;
        try {
            options = parseOptions(opt || "", getCurrentOptions(parser));
            if (!parseComplexInput(n, options)) {
                throw new Error(`Invalid complex number "${n}"`);
            }
        } catch (e) {
            throw new ParseError(
                `Invalid \\complexnum options/input: ${(e as Error).message}`,
                parser.gullet.future(),
            );
        }

        const node: SiunitxNode = {
            type: "siunitx",
            mode: parser.mode,
            command: "\\complexnum",
            options,
            number: n,
        };
        return node;
    },
    htmlBuilder: siunitxHtmlBuilder,
    mathmlBuilder: siunitxMathmlBuilder,
});

defineFunction({
    type: "siunitx",
    names: ["\\si", "\\unit"],
    props: {
        numArgs: 1,
        numOptionalArgs: 1,
        argTypes: ["raw", "raw"],
        allowedInText: true,
    },
    handler: ({parser, funcName}, args, optArgs) => {
        const opt = optArgs[0] ? (optArgs[0] as ParseNode<"raw">).string : "";
        const u = (args[0] as ParseNode<"raw">).string;
        const optionKeys = extractOptionKeys(opt);

        let options: SiunitxOptions;
        try {
            options = parseOptions(opt || "", getCurrentOptions(parser));
            validateUnitInput(u, options);
        } catch (e) {
            throw new ParseError(
                `Invalid \\si options: ${(e as Error).message}`,
                parser.gullet.future(),
            );
        }

        const node: SiunitxNode = {
            type: "siunitx",
            mode: parser.mode,
            command: (funcName as "\\si" | "\\unit") || "\\si",
            options,
            unit: u,
            optionKeys: Array.from(optionKeys),
        };
        return node;
    },
    htmlBuilder: siunitxHtmlBuilder,
    mathmlBuilder: siunitxMathmlBuilder,
});

defineFunction({
    type: "siunitx",
    names: ["\\complexqty"],
    props: {
        numArgs: 2,
        numOptionalArgs: 1,
        argTypes: ["raw", "raw", "raw"],
        allowedInText: true,
    },
    handler: ({parser}, args, optArgs) => {
        const opt = optArgs[0] ? (optArgs[0] as ParseNode<"raw">).string : "";
        const n = (args[0] as ParseNode<"raw">).string;
        const u = (args[1] as ParseNode<"raw">).string;

        let options: SiunitxOptions;
        try {
            options = parseOptions(opt || "", getCurrentOptions(parser));
            validateUnitInput(u, options);
            if (!parseComplexInput(n, options)) {
                throw new Error(`Invalid complex number "${n}"`);
            }
        } catch (e) {
            throw new ParseError(
                `Invalid \\complexqty options/input: ${(e as Error).message}`,
                parser.gullet.future(),
            );
        }

        const node: SiunitxNode = {
            type: "siunitx",
            mode: parser.mode,
            command: "\\complexqty",
            options,
            number: n,
            unit: u,
        };
        return node;
    },
    htmlBuilder: siunitxHtmlBuilder,
    mathmlBuilder: siunitxMathmlBuilder,
});

defineFunction({
    type: "siunitx",
    names: ["\\SI", "\\qty"],
    props: {
        numArgs: 2,
        numOptionalArgs: 1,
        argTypes: ["raw", "raw", "raw"],
        allowedInText: true,
    },
    handler: ({parser, funcName}, args, optArgs) => {
        const opt = optArgs[0] ? (optArgs[0] as ParseNode<"raw">).string : "";
        const n = (args[0] as ParseNode<"raw">).string;
        const u = (args[1] as ParseNode<"raw">).string;
        const optionKeys = extractOptionKeys(opt);

        let options: SiunitxOptions;
        try {
            options = parseOptions(opt || "", getCurrentOptions(parser));
            validateUnitInput(u, options);
        } catch (e) {
            throw new ParseError(
                `Invalid ${funcName} options: ${(e as Error).message}`,
                parser.gullet.future(),
            );
        }

        const command = (funcName as "\\SI" | "\\qty") || "\\SI";

        const node: SiunitxNode = {
            type: "siunitx",
            mode: parser.mode,
            command,
            options,
            number: n,
            unit: u,
            body: !options["parse-numbers"]
                ? parseLiteralNumberBody(parser, n, command)
                : undefined,
            optionKeys: Array.from(optionKeys),
        };
        return node;
    },
    htmlBuilder: siunitxHtmlBuilder,
    mathmlBuilder: siunitxMathmlBuilder,
});

defineFunction({
    type: "siunitx",
    names: ["\\qtylist", "\\qtyproduct"],
    props: {
        numArgs: 2,
        numOptionalArgs: 1,
        argTypes: ["raw", "raw", "raw"],
        allowedInText: true,
    },
    handler: ({parser, funcName}, args, optArgs) => {
        const opt = optArgs[0] ? (optArgs[0] as ParseNode<"raw">).string : "";
        const numbers = (args[0] as ParseNode<"raw">).string;
        const unit = (args[1] as ParseNode<"raw">).string;

        let options: SiunitxOptions;
        try {
            options = parseOptions(opt || "", getCurrentOptions(parser));
            validateUnitInput(unit, options);
        } catch (e) {
            throw new ParseError(
                `Invalid ${funcName} options: ${(e as Error).message}`,
                parser.gullet.future(),
            );
        }
        const hasSetupDefaults =
            typeof parser.gullet.macros.get(SIUNITX_OPTIONS_MACRO) === "string";
        if (!opt && !hasSetupDefaults && funcName === "\\qtylist") {
            options["list-units"] = "repeat";
        }

        const command = (funcName as "\\qtylist" | "\\qtyproduct") || "\\qtylist";

        const node: SiunitxNode = {
            type: "siunitx",
            mode: parser.mode,
            command,
            options,
            number: numbers,
            unit,
        };
        return node;
    },
    htmlBuilder: siunitxHtmlBuilder,
    mathmlBuilder: siunitxMathmlBuilder,
});

defineFunction({
    type: "siunitx",
    names: ["\\numrange"],
    props: {
        numArgs: 2,
        numOptionalArgs: 1,
        argTypes: ["raw", "raw", "raw"],
        allowedInText: true,
    },
    handler: ({parser}, args, optArgs) => {
        const opt = optArgs[0] ? (optArgs[0] as ParseNode<"raw">).string : "";
        const n1 = (args[0] as ParseNode<"raw">).string;
        const n2 = (args[1] as ParseNode<"raw">).string;

        let options: SiunitxOptions;
        try {
            options = parseOptions(opt || "", getCurrentOptions(parser));
        } catch (e) {
            throw new ParseError(
                `Invalid \\numrange options: ${(e as Error).message}`,
                parser.gullet.future(),
            );
        }

        const node: SiunitxNode = {
            type: "siunitx",
            mode: parser.mode,
            command: "\\numrange",
            options,
            number: n1,
            numberB: n2,
        };
        return node;
    },
    htmlBuilder: siunitxHtmlBuilder,
    mathmlBuilder: siunitxMathmlBuilder,
});

defineFunction({
    type: "siunitx",
    names: ["\\SIrange", "\\qtyrange"],
    props: {
        numArgs: 3,
        numOptionalArgs: 1,
        argTypes: ["raw", "raw", "raw", "raw"],
        allowedInText: true,
    },
    handler: ({parser, funcName}, args, optArgs) => {
        const opt = optArgs[0] ? (optArgs[0] as ParseNode<"raw">).string : "";
        const n1 = (args[0] as ParseNode<"raw">).string;
        const n2 = (args[1] as ParseNode<"raw">).string;
        const u = (args[2] as ParseNode<"raw">).string;

        let options: SiunitxOptions;
        try {
            options = parseOptions(opt || "", getCurrentOptions(parser));
            validateUnitInput(u, options);
        } catch (e) {
            throw new ParseError(
                `Invalid ${funcName} options: ${(e as Error).message}`,
                parser.gullet.future(),
            );
        }
        const hasSetupDefaults =
            typeof parser.gullet.macros.get(SIUNITX_OPTIONS_MACRO) === "string";
        if (!opt && !hasSetupDefaults && funcName === "\\qtyrange") {
            options["range-units"] = "repeat";
        }

        const command = (funcName as "\\SIrange" | "\\qtyrange") || "\\SIrange";

        const node: SiunitxNode = {
            type: "siunitx",
            mode: parser.mode,
            command,
            options,
            number: n1,
            numberB: n2,
            unit: u,
        };
        return node;
    },
    htmlBuilder: siunitxHtmlBuilder,
    mathmlBuilder: siunitxMathmlBuilder,
});

defineFunction({
    type: "siunitx",
    names: ["\\ang"],
    props: {
        numArgs: 1,
        numOptionalArgs: 1,
        argTypes: ["raw", "raw"],
        allowedInText: true,
    },
    handler: ({parser}, args, optArgs) => {
        const opt = optArgs[0] ? (optArgs[0] as ParseNode<"raw">).string : "";
        const a = (args[0] as ParseNode<"raw">).string;

        let options: SiunitxOptions;
        try {
            options = parseOptions(opt || "", getCurrentOptions(parser));
        } catch (e) {
            throw new ParseError(
                `Invalid \\ang options: ${(e as Error).message}`,
                parser.gullet.future(),
            );
        }

        const node: SiunitxNode = {
            type: "siunitx",
            mode: parser.mode,
            command: "\\ang",
            options,
            angle: a,
        };
        return node;
    },
    htmlBuilder: siunitxHtmlBuilder,
    mathmlBuilder: siunitxMathmlBuilder,
});
