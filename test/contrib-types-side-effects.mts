import "katex/contrib/copy-tex";
import "katex/contrib/mathtex-script-type";
import "katex/contrib/mhchem";

// @ts-expect-error Side-effect modules do not have default exports.
import copyTex from "katex/contrib/copy-tex";
// @ts-expect-error Side-effect modules do not have default exports.
import mathtexScriptType from "katex/contrib/mathtex-script-type";
// @ts-expect-error Side-effect modules do not have default exports.
import mhchem from "katex/contrib/mhchem";

void copyTex;
void mathtexScriptType;
void mhchem;
