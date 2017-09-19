// @flow

/**
 * This file consists only of basic flow types used in multiple places.
 * For types with javascript, create separate files by themselves.
 */

export type Mode = "math" | "text";

// LaTeX argument type.
//   - "size": A size-like thing, such as "1em" or "5ex"
//   - "color": An html color, like "#abc" or "blue"
//   - "original": The same type as the environment that the
//                 function being parsed is in (e.g. used for the
//                 bodies of functions like \textcolor where the
//                 first argument is special and the second
//                 argument is parsed normally)
//   - "text": Node group parsed as in text mode.
export type ArgType = "color" | "size" | "original" | "text";

// LaTeX display style.
export type StyleStr = "text" | "display";
