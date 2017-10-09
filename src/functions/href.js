// @flow
import defineFunction, {ordargument} from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";

import * as html from "../buildHTML";
import * as mml from "../buildMathML";

defineFunction({
    type: "href",
    names: ["\\href"],
    props: {
        numArgs: 2,
        argTypes: ["original", "original"],
    },
    handler: (context, args) => {
        const body = args[1];
        const hrs  = args[0].value;
        let href = "";
        for (let i = 0; i < hrs.length; i++) {
            href += hrs[i].value;
        }
        return {
            type: "href",
            href: href,
            body: ordargument(body),
        };
    },
    htmlBuilder: (group, options) => {
        const elements = html.buildExpression(
            group.value.body,
            options,
            false
        );

        const href = group.value.href;

        /**
         * Determining class for anchors.
         * 1. if it has the only element, use its class;
         * 2. if it has more than two elements, and the classes
         *    of its first and last elements coincide, then use it;
         * 3. otherwise, we will inject an empty <span>s at both ends,
         *    with the same classes of both ends of elements.
         */

        let cls = []; // null if the type of both ends differs.
        let fst; // mathtype of the first child
        let lst; // mathtype of the last child
        // Invariants: both fst and lst must be non-null if cls is null.
        if (elements.length === 1) { // Case 1
            cls = elements[0].classes;
        } else if (elements.length >= 2) {
            fst = html.getTypeOfDomTree(elements[0]);
            lst = html.getTypeOfDomTree(elements[elements.length - 1]);
            if (fst === lst) { // Case 2 : type of both ends coincides
                cls = [fst];
            } else { // Case 3: both ends have different types.
                cls = null;
            }
        } else { // No elements at all, just ignore.
            cls = [];
        }
        if (!cls) {
            const anc = buildCommon.makeAnchor(href, [], elements, options);
            const elts = [new buildCommon.makeSpan([fst], [], options),
                anc,
                new buildCommon.makeSpan([lst], [], options),
            ];
            return new buildCommon.makeFragment(elts);
        } else {
            return new buildCommon.makeAnchor(href, cls, elements, options);
        }
    },
    mathmlBuilder: (group, options) => {
        const inner = mml.buildExpression(group.value.body, options);
        const math = new mathMLTree.MathNode("mrow", inner);
        math.setAttribute("href", group.value.href);
        return math;
    },
});
