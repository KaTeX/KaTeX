import defineFunction from "../defineFunction";

// Switching from text mode back to math mode
defineFunction({
    names: ["\\(", "$"],
    props: {
        numArgs: 0,
        allowedInText: true,
        allowedInMath: false,
        modeSwitch: "math",
    },
    handler(context, args) {
        const {funcName, parser, oldMode} = context;
        const close = (funcName === "\\(" ? "\\)" : "$");
        const body = parser.parseExpression(false, close);
        // We can't expand the next symbol after the closing $ until after
        // switching modes back.  So don't consume within expect.
        parser.expect(close, false);
        if (oldMode) { // should always be defined for a modeSwitch function
            parser.switchMode(oldMode);
        }
        parser.consume();
        return {
            type: "styling",
            style: "text",
            value: body,
        };
    },
});

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
