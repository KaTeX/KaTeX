// @flow
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import ParseError from "../ParseError";

defineFunction({
    type: "verb",
    names: ["\\verb"],
    props: {
        numArgs: 0,
        allowedInText: true,
    },
    handler(context, args, optArgs) {
        // \verb and \verb* are dealt with directly in Parser.js.
        // If we end up here, it's because of a failure to match the two delimiters
        // in the regex in Lexer.js.  LaTeX raises the following error when \verb is
        // terminated by end of line (or file).
        throw new ParseError(
            "\\verb ended by end of line instead of matching delimiter");
    },
    htmlBuilder(group, options) {
        const text = buildCommon.makeVerb(group, options);
        const body = [];
        // \verb enters text mode and therefore is sized like \textstyle
        const newOptions = options.havingStyle(options.style.text());
        for (let i = 0; i < text.length; i++) {
            let c = text[i];
            if (c === '~') {
                c = '\\textasciitilde';
            }
            body.push(buildCommon.makeSymbol(c, "Typewriter-Regular",
                group.mode, newOptions, ["mord", "texttt"]));
        }
        buildCommon.tryCombineChars(body);
        return buildCommon.makeSpan(
            ["mord", "text"].concat(newOptions.sizingClasses(options)),
            body, newOptions);
    },
    mathmlBuilder(group, options) {
        const text = new mathMLTree.TextNode(buildCommon.makeVerb(group, options));
        const node = new mathMLTree.MathNode("mtext", [text]);
        node.setAttribute("mathvariant", "monospace");
        return node;
    },
});
