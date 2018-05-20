// @flow
/** Include this to ensure that all functions are defined. */
import {_functions} from "./defineFunction";

// WARNING: New functions should be added to src/functions and imported here.

const functions = _functions;
export default functions;

// TODO(kevinb): have functions return an object and call defineFunction with
// that object in this file instead of relying on side-effects.
import "./functions/sqrt";

import "./functions/color";

import "./functions/text";

import "./functions/math";

import "./functions/enclose";

import "./functions/overline";

import "./functions/underline";

import "./functions/rule";

import "./functions/kern";

import "./functions/phantom";

import "./functions/mclass";

import "./functions/mod";

import "./functions/op";

import "./functions/operatorname";

import "./functions/genfrac";

import "./functions/lap";

import "./functions/smash";

import "./functions/delimsizing";

import "./functions/sizing";

import "./functions/styling";

import "./functions/font";

import "./functions/accent";

// Horizontal stretchy braces
import "./functions/horizBrace";

// Stretchy accents under the body
import "./functions/accentunder";

// Stretch arrows
import "./functions/arrow";

// Row and line breaks
import "./functions/cr";

// Environment delimiters
import "./functions/environment";

// Box manipulation
import "./functions/raisebox";

import "./functions/verb";

// Hyperlinks
import "./functions/href";

// MathChoice
import "./functions/mathchoice";
