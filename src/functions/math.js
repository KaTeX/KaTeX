// @flow
import defineFunction from "../defineFunction";
import ParseError from "../ParseError";

// Switching from text mode back to math mode
defineFunction({
    type: "styling",
    names: ["\\(", "$"],
    props: {
        numArgs: 0,
        allowedInText: true,
        allowedInMath: false,
        consumeMode: "math",
    },
    handler({funcName, parser}, args) {
        const outerMode = parser.mode;
        parser.switchMode("math");
        const close = (funcName === "\\(" ? "\\)" : "$");
        const body = parser.parseExpression(false, close);
        // We can't expand the next symbol after the closing $ until after
        // switching modes back.  So don't consume within expect.
        parser.expect(close, false);
        parser.switchMode(outerMode);
        parser.consume();
        return {
            type: "styling",
            mode: parser.mode,
            style: "text",
            body,
        };
    },
});

// Check for extra closing math delimiters
defineFunction({
    type: "text", // Doesn't matter what this is.
    names: ["\\)", "\\]"],
    props: {
        numArgs: 0,
        allowedInText: true,
        allowedInMath: false,
    },
    handler(context, args) {
        throw new ParseError(`Mismatched ${context.funcName}`);
    },
});
