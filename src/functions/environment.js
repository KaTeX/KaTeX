// @flow
import defineFunction from "../defineFunction";
import ParseError from "../ParseError";
import {assertNodeType} from "../parseNode";

// Environment delimiters. HTML/MathML rendering is defined in the corresponding
// defineEnvironment definitions.
defineFunction({
    type: "environment",
    names: ["\\begin", "\\end"],
    props: {
        numArgs: 1,
        argTypes: ["text"],
    },
    handler({parser}, args) {
        const nameGroup = args[0];
        if (nameGroup.type !== "ordgroup") {
            throw new ParseError("Invalid environment name", nameGroup);
        }
        let name = "";
        for (let i = 0; i < nameGroup.body.length; ++i) {
            name += assertNodeType(nameGroup.body[i], "textord").text;
        }
        return {
            type: "environment",
            mode: parser.mode,
            name,
            nameGroup,
        };
    },
});
