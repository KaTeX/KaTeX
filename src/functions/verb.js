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
            if (text[i] === '\xA0') {  // spaces appear as nonbreaking space
                // The space character isn't in the Typewriter-Regular font,
                // so we implement it as a kern of the same size as a character.
                // 0.525 is the width of a texttt character in LaTeX.
                // It automatically gets scaled by the font size.
                const rule = buildCommon.makeSpan(["mord", "rule"], [], newOptions);
                rule.style.marginLeft = "0.525em";
                body.push(rule);
            } else {
                body.push(buildCommon.makeSymbol(text[i], "Typewriter-Regular",
                    group.mode, newOptions, ["mathtt"]));
            }
        }
        buildCommon.tryCombineChars(body);
        return buildCommon.makeSpan(
            ["mord", "text"].concat(newOptions.sizingClasses(options)),
            // tryCombinChars expects CombinableDomNode[] while makeSpan expects
            // DomChildNode[].
            // $FlowFixMe: CombinableDomNode[] is not compatible with DomChildNode[]
            body, newOptions);
    },
    mathmlBuilder(group, options) {
        const text = new mathMLTree.TextNode(buildCommon.makeVerb(group, options));
        const node = new mathMLTree.MathNode("mtext", [text]);
        node.setAttribute("mathvariant", buildCommon.fontMap["mathtt"].variant);
        return node;
    },
});
