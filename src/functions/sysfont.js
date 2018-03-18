// @flow
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import * as html from "../buildHTML";
import * as mml from "../buildMathML";

// This little file is here to clean up the mess left when wide-character.js
// was unable to process a wide character in the Unicode range U+1D400 to
// U+1D7FF. Here we execute the fall-back plan, which is to render the
// character in a system font.

const htmlBuilder = (group, options) => {
    const str = group.value.value;
    return buildCommon.makeSymbol(str, "Main-Regular", group.mode, options);
};

const mathmlBuilder = (group, options) => {
    return mml.makeText(group.value.value, group.mode)
};

defineFunction({
    type: "sysfont",
    names: ["\\sysfont"],
    props: {
        numArgs: 1,
        allowedInText: true,
        allowedInMath: true,
    },
    handler: (context, args) => {
        // Function expandWideChar() did not return the wide character.
        // That would have created an infinite loop. Instead, it
        // returned the low surrogate of the wide character.

        // Reconstruct the string character from its low surrogate.
        const valArray = args[0].value;
        let lowSurrogate = "";
        for (let i = 0; i < valArray.length; i++) {
            lowSurrogate += valArray[i].value;
        }
        const str = String.fromCharCode(0xD835, parseInt(lowSurrogate));

        return {
            type: "sysfont",
            value: str,
        };
    },
    htmlBuilder,
    mathmlBuilder,
});
