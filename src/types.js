// @flow

/**
 * This file consists only of basic flow types used in multiple places.
 * For types with javascript, create separate files by themselves.
 */

export type Mode = "math" | "text";

// LaTeX display style.
export type StyleStr = "text" | "display" | "script" | "scriptscript";

// Allowable token text for "break" arguments in parser.
export type BreakToken = "]" | "}" | "\\endgroup" | "$" | "\\)" | "\\cr";

// Math font variants.
export type FontVariant = "bold" | "bold-italic" | "bold-sans-serif" |
    "double-struck" | "fraktur" | "italic" | "monospace" | "normal" | "sans-serif" |
    "sans-serif-bold-italic" | "sans-serif-italic" | "script";
