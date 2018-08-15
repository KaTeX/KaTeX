// @flow
import defineFunction from "../defineFunction";
import type {Measurement} from "../units";
import buildCommon from "../buildCommon";
import {calculateSize, validUnit} from "../units";
import domTree from "../domTree";
import mathMLTree from "../mathMLTree";

const stringFromParseGroup = function(textArray: [ParseNode<"textord">]): string {
    let str = "";
    for (let i = 0; i < textArray.length; i++) {
        str += textArray[i].text;
    }
    return str;
};

const sizeData = function(str: string): Measurement {
    if (/^[-+]? *(\d+(\.\d*)?|\.\d+)$/.test(str)) {
        // str is a number with no unit specified.
        // default unit is bp, per graphix package.
        return {number: +str, unit: "bp"};
    } else {
        const match = (/([-+]?) *(\d+(?:\.\d*)?|\.\d+) *([a-z]{2})/).exec(str);
        if (!match) {
            throw "KaTeX parse error: Invalid size in \\includegraphics: '" + str + "'";
        }
        const data = {
            number: +(match[1] + match[2]), // sign + magnitude, cast to number
            unit: match[3],
        };
        if (!validUnit(data)) {
            throw "KaTeX parse error: Invalid unit in \\includegraphics: '" + str + "'";
        }
        return data;
    }
};

defineFunction({
    type: "includegraphics",
    names: ["\\includegraphics"],
    props: {
        numArgs: 1,
        numOptionalArgs: 1,
        argTypes: ["text", "text"],
        allowedInText: false,
    },
    handler: ({parser}, args, optArgs) => {
        let width = {number: 0, unit: "em"};
        let height = {number: 0.9, unit: "em"};    // sorta character sized.
        let totalheight = {number: 0, unit: "em"};
        let alt = "";

        if (optArgs[0]) {
            const attributeStr = stringFromParseGroup(optArgs[0].body);
            // Parser.js does not parse key/value pairs. We get a string.
            const attributes = attributeStr.split(",");
            for (const attr of attributes) {
                const keyVal = attr.split("=");
                if (keyVal.length = 2) {
                    const str = keyVal[1].trim();
                    switch (keyVal[0].trim()) {
                        case "alt":
                            alt = str;
                            break;
                        case "width":
                            width = sizeData(str);
                            break;
                        case "height":
                            height = sizeData(str);
                            break;
                        case "totalheight":
                            totalheight = sizeData(str);
                        default:
                            // Do nothing.
                    }
                }
            }
        }

        let src = stringFromParseGroup(args[0].body);

        if (alt === "") {
            // No alt given. Use the file name. Strip away the path.
            alt = src;
            alt = alt.replace(/^.*[\\\/]/, '')
            alt = alt.substring(0, alt.lastIndexOf('.'));
        }

        return {
            type: "includegraphics",
            mode: parser.mode,
            alt: alt,
            width: width,
            height: height,
            totalheight: totalheight,
            src: src,
        };
    },
    htmlBuilder: (group, options) => {
        const height = calculateSize(group.height, options);
        let depth = 0;

        if (group.totalheight.number > 0) {
            depth = calculateSize(group.totalheight, options) - height;
        }

        let width = 0;
        if (group.width.number > 0) {
            width = calculateSize(group.width, options);
        }

        const style = {height: height + depth + "em"};
        if (width > 0) {
            style.width = width + "em";
        }
        if (depth > 0) {
            style.verticalAlign = -depth + "em";
        }

        let node = new domTree.img(group.src, group.alt, style);
        node.height = height;
        node.depth = depth;

        return node;
    },
    mathmlBuilder: (group, options) => {
        const node = new mathMLTree.MathNode("mglyph", []);
        node.setAttribute("alt", group.alt);

        const height = calculateSize(group.height, options);
        let depth = 0;
        if (group.totalheight.number > 0) {
            depth = calculateSize(group.totalheight, options) - height;
            node.setAttribute("valign", "-" + depth + "em");
        }
        node.setAttribute("height", height + depth + "em");

        if (group.width.number > 0) {
            const width = calculateSize(group.width, options);
            node.setAttribute("width", width + "em");
        }
        node.setAttribute("src", group.path);
        return node;
    },
});
