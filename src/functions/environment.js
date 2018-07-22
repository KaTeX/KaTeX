// @flow
import defineFunction from "../defineFunction";
import ParseError from "../ParseError";
import ParseNode, {assertNodeType} from "../ParseNode";

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
        for (let i = 0; i < nameGroup.value.length; ++i) {
            name += assertNodeType(nameGroup.value[i], "textord").value;
        }
        return new ParseNode("environment", {
            type: "environment",
            name: name,
            nameGroup: nameGroup,
        }, parser.mode);
    },
});
