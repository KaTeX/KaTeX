// @flow
import defineFunction from "../defineFunction";
import ParseError from "../ParseError";

// Environment delimiters. HTML/MathML rendering is defined in the corresponding
// defineEnvironment definitions.
defineFunction({
    type: "environment",
    names: ["\\begin", "\\end"],
    props: {
        numArgs: 1,
        argTypes: ["text"],
    },
    handler(context, args) {
        const nameGroup = args[0];
        if (nameGroup.type !== "ordgroup") {
            throw new ParseError("Invalid environment name", nameGroup);
        }
        let name = "";
        for (let i = 0; i < nameGroup.value.length; ++i) {
            name += nameGroup.value[i].value;
        }
        return {
            type: "environment",
            name: name,
            nameGroup: nameGroup,
        };
    },
});
