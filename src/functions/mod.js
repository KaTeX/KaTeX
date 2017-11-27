// @flow
// \mod-type functions
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import Style from "../Style";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

const htmlModBuilder = (group, options) => {
    const inner = [];

    if (group.value.modType === "bmod") {
        // “\nonscript\mskip-\medmuskip\mkern5mu”, where \medmuskip is
        // 4mu plus 2mu minus 1mu, translates to 1mu space in
        // display/textstyle and 5mu space in script/scriptscriptstyle.
        if (!options.style.isTight()) {
            inner.push(buildCommon.makeSpan(
                ["mspace", "muspace"], [], options));
        } else {
            inner.push(buildCommon.makeSpan(
                ["mspace", "thickspace"], [], options));
        }
    } else if (options.style.size === Style.DISPLAY.size) {
        inner.push(buildCommon.makeSpan(["mspace", "quad"], [], options));
    } else if (group.value.modType === "mod") {
        inner.push(
            buildCommon.makeSpan(["mspace", "twelvemuspace"], [], options));
    } else {
        inner.push(
            buildCommon.makeSpan(["mspace", "eightmuspace"], [], options));
    }

    if (group.value.modType === "pod" || group.value.modType === "pmod") {
        inner.push(buildCommon.mathsym("(", group.mode));
    }

    if (group.value.modType !== "pod") {
        const modInner = [
            buildCommon.mathsym("m", group.mode),
            buildCommon.mathsym("o", group.mode),
            buildCommon.mathsym("d", group.mode)];
        if (group.value.modType === "bmod") {
            inner.push(buildCommon.makeSpan(["mbin"], modInner, options));
            // “\mkern5mu\nonscript\mskip-\medmuskip” as above
            if (!options.style.isTight()) {
                inner.push(buildCommon.makeSpan(
                    ["mspace", "muspace"], [], options));
            } else {
                inner.push(buildCommon.makeSpan(
                    ["mspace", "thickspace"], [], options));
            }
        } else {
            Array.prototype.push.apply(inner, modInner);
            inner.push(
                buildCommon.makeSpan(["mspace", "sixmuspace"], [], options));
        }
    }

    if (group.value.value) {
        Array.prototype.push.apply(inner,
            html.buildExpression(group.value.value, options, false));
    }

    if (group.value.modType === "pod" || group.value.modType === "pmod") {
        inner.push(buildCommon.mathsym(")", group.mode));
    }

    return buildCommon.makeFragment(inner);
};

const mmlModBuilder = (group, options) => {
    let inner = [];

    if (group.value.modType === "pod" || group.value.modType === "pmod") {
        inner.push(new mathMLTree.MathNode(
            "mo", [mml.makeText("(", group.mode)]));
    }
    if (group.value.modType !== "pod") {
        inner.push(new mathMLTree.MathNode(
            "mo", [mml.makeText("mod", group.mode)]));
    }
    if (group.value.value) {
        const space = new mathMLTree.MathNode("mspace");
        space.setAttribute("width", "0.333333em");
        inner.push(space);
        inner = inner.concat(mml.buildExpression(group.value.value, options));
    }
    if (group.value.modType === "pod" || group.value.modType === "pmod") {
        inner.push(new mathMLTree.MathNode(
            "mo", [mml.makeText(")", group.mode)]));
    }

    return new mathMLTree.MathNode("mo", inner);
};

defineFunction({
    type: "mod",
    names: ["\\bmod"],
    props: {
        numArgs: 0,
    },
    handler: (context, args) => {
        return {
            type: "mod",
            modType: "bmod",
            value: null,
        };
    },
    htmlBuilder: htmlModBuilder,
    mathmlBuilder: mmlModBuilder,
});

// Note: calling defineFunction with a type that's already been defined only
// works because the same htmlBuilder and mathmlBuilder are being used.
defineFunction({
    type: "mod",
    names: ["\\pod", "\\pmod", "\\mod"],
    props: {
        numArgs: 1,
    },
    handler: (context, args) => {
        const body = args[0];
        return {
            type: "mod",
            modType: context.funcName.substr(1),
            value: ordargument(body),
        };
    },
    htmlBuilder: htmlModBuilder,
    mathmlBuilder: mmlModBuilder,
});
