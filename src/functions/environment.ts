import defineFunction from "../defineFunction";
import ParseError from "../ParseError";
import {assertNodeType} from "../parseNode";
import environments from "../environments";

import type {ParseNode} from "../parseNode";

// Environment delimiters. HTML/MathML rendering is defined in the corresponding
// defineEnvironment definitions.
defineFunction({
    type: "environment",
    names: ["\\begin", "\\end"],
    props: {
        numArgs: 1,
        argTypes: ["text"],
    },
    handler({parser, funcName}, args) {
        const nameGroup = args[0];
        if (nameGroup.type !== "ordgroup") {
            throw new ParseError("Invalid environment name", nameGroup);
        }
        let envName = "";
        for (let i = 0; i < nameGroup.body.length; ++i) {
            envName += assertNodeType(nameGroup.body[i], "textord").text;
        }

        if (funcName === "\\begin") {
            // begin...end is similar to left...right
            if (!environments.hasOwnProperty(envName)) {
                throw new ParseError(
                    "No such environment: " + envName, nameGroup);
            }
            // Build the environment object. Arguments and other information will
            // be made available to the begin and end methods using properties.
            const env = environments[envName];
            const {args, optArgs} =
                parser.parseArguments("\\begin{" + envName + "}", env);
            const context = {
                mode: parser.mode,
                envName,
                parser,
            };
            const result = env.handler(context, args, optArgs);
            parser.expect("\\end", false);
            const endNameToken = parser.nextToken;
            const end = assertNodeType(parser.parseFunction(), "environment");
            if (end.name !== envName) {
                throw new ParseError(
                    `Mismatch: \\begin{${envName}} matched by \\end{${end.name}}`,
                    endNameToken);
            }
            // The environment handler returns the parse node for the specific
            // environment type (e.g. ParseNode<"array">), not ParseNode<"environment">.
            // This is by design: \begin{array} produces an "array" node directly.
            return result as unknown as ParseNode<"environment">;
        }

        return {
            type: "environment",
            mode: parser.mode,
            name: envName,
            nameGroup,
        };
    },
});
