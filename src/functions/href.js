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
        argTypes: ["url", "original"],
    },
    handler: (context, args) => {
        const body = args[1];
        const href  = args[0].value;
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
         *    with the same classes of both ends of elements, with the
         *    first span having the same class as the first element of body,
         *    and the second one the same as the last.
         */

        let classes = []; // Default behaviour for Case 3.
        let first; // mathtype of the first child
        let last;  // mathtype of the last child
        // Invariants: both first and last must be non-null if classes is null.
        if (elements.length === 1) { // Case 1
            classes = elements[0].classes;
        } else if (elements.length >= 2) {
            first = html.getTypeOfDomTree(elements[0]) || 'mord';
            last = html.getTypeOfDomTree(elements[elements.length - 1]) || 'mord';
            if (first === last) { // Case 2 : type of both ends coincides
                classes = [first];
            } else { // Case 3: both ends have different types.
                const anc = buildCommon.makeAnchor(href, [], elements, options);
                return new buildCommon.makeFragment([
                    new buildCommon.makeSpan([first], [], options),
                    anc,
                    new buildCommon.makeSpan([last], [], options),
                ]);
            }
        }
        return new buildCommon.makeAnchor(href, classes, elements, options);
    },
    mathmlBuilder: (group, options) => {
        const inner = mml.buildExpression(group.value.body, options);
        const math = new mathMLTree.MathNode("mrow", inner);
        math.setAttribute("href", group.value.href);
        return math;
    },
});
