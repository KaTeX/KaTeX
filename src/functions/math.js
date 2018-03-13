import defineFunction from "../defineFunction";
import ParseError from "../ParseError";

// Switching from text mode back to math mode
defineFunction({
    names: ["\\(", "$"],
    props: {
        numArgs: 0,
        allowedInText: true,
        allowedInMath: false,
        consumeMode: "math",
    },
    handler(context, args) {
        const {funcName, parser} = context;
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
            style: "text",
            value: body,
        };
    },
});

// Check for extra closing math delimiters
defineFunction({
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
