/**
 * renderA11yString returns a readable string.
 *
 * In some cases the string will have the proper semantic math
 * meaning,:
 *   renderA11yString("\\frac{1}{2}"")
 *   -> "start fraction, 1, divided by, 2, end fraction"
 *
 * However, other cases do not:
 *   renderA11yString("f(x) = x^2")
 *   -> "f, left parenthesis, x, right parenthesis, equals, x, squared"
 *
 * The commas in the string aim to increase ease of understanding
 * when read by a screenreader.
 */

import type {SettingsOptions} from "../../src/Settings";
import katex from "katex";

const renderA11yString = function(
    text: string,
    settings?: SettingsOptions,
): string {
    const tree = katex.__parse(text, settings);
    const a11yStrings = katex.__buildA11yStrings(tree, [], "normal");

    return katex.__flattenA11yStrings(a11yStrings).join(", ");
};

export default renderA11yString;
