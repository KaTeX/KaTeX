// @flow
import functions from "./functions";
import {groupTypes as htmlGroupTypes} from "./buildHTML";
import {groupTypes as mathmlGroupTypes} from "./buildMathML";

import type ParseNode from "./ParseNode" ;
import type Options from "./Options";
import type {ArgType} from "./types" ;
import type {Parser} from "./Parser" ;
import type {Token} from "./Token" ;

/** Context provided to function handlers for error messages. */
export type FunctionContext = {|
    funcName: string,
    parser: Parser,
    token?: Token,
|};

// TODO: Enumerate all allowed output types.
export type FunctionHandler = (context: FunctionContext, args: ParseNode[]) => *;

export type FunctionPropSpec = {
    // The number of arguments the function takes.
    numArgs: number,

    // An array corresponding to each argument of the function, giving the
    // type of argument that should be parsed. Its length should be equal
    // to `numArgs + numOptionalArgs`.
    argTypes?: ArgType[],

    // The greediness of the function to use ungrouped arguments.
    //
    // E.g. if you have an expression
    //   \sqrt \frac 1 2
    // since \frac has greediness=2 vs \sqrt's greediness=1, \frac
    // will use the two arguments '1' and '2' as its two arguments,
    // then that whole function will be used as the argument to
    // \sqrt. On the other hand, the expressions
    //   \frac \frac 1 2 3
    // and
    //   \frac \sqrt 1 2
    // will fail because \frac and \frac have equal greediness
    // and \sqrt has a lower greediness than \frac respectively. To
    // make these parse, we would have to change them to:
    //   \frac {\frac 1 2} 3
    // and
    //   \frac {\sqrt 1} 2
    //
    // The default value is `1`
    greediness?: number,

    // Whether or not the function is allowed inside text mode
    // (default false)
    allowedInText?: boolean,

    // Whether or not the function is allowed inside text mode
    // (default true)
    allowedInMath?: boolean,

    // (optional) The number of optional arguments the function
    // should parse. If the optional arguments aren't found,
    // `null` will be passed to the handler in their place.
    // (default 0)
    numOptionalArgs?: number,

    // Must be true if the function is an infix operator.
    infix?: boolean,
};

type FunctionDefSpec = {|
    // Unique string to differentiate parse nodes.
    type?: string,

    // The first argument to defineFunction is a single name or a list of names.
    // All functions named in such a list will share a single implementation.
    names: Array<string>,

    // Properties that control how the functions are parsed.
    props: FunctionPropSpec,

    // The handler is called to handle these functions and their arguments.
    //
    // The function should return an object with the following keys:
    //   - type: The type of element that this is. This is then used in
    //          buildHTML/buildMathML to determine which function
    //          should be called to build this node into a DOM node
    // Any other data can be added to the object, which will be passed
    // in to the function in buildHTML/buildMathML as `group.value`.
    handler: FunctionHandler,

    // This function returns an object representing the DOM structure to be
    // created when rendering the defined LaTeX function.
    // TODO: Port buildHTML to flow and make the group and return types explicit.
    htmlBuilder?: (group: *, options: Options) => *,

    // This function returns an object representing the MathML structure to be
    // created when rendering the defined LaTeX function.
    // TODO: Port buildMathML to flow and make the group and return types explicit.
    mathmlBuilder?: (group: *, options: Options) => *,
|};

export default function defineFunction({
    type,
    names,
    props,
    handler,
    htmlBuilder,
    mathmlBuilder,
}: FunctionDefSpec) {
    // Set default values of functions
    const data = {
        numArgs: props.numArgs,
        argTypes: props.argTypes,
        greediness: (props.greediness === undefined) ? 1 : props.greediness,
        allowedInText: !!props.allowedInText,
        allowedInMath: (props.allowedInMath === undefined)
            ? true
            : props.allowedInMath,
        numOptionalArgs: props.numOptionalArgs || 0,
        infix: !!props.infix,
        handler: handler,
    };
    for (let i = 0; i < names.length; ++i) {
        functions[names[i]] = data;
    }
    if (type) {
        if (htmlBuilder) {
            htmlGroupTypes[type] = htmlBuilder;
        }
        if (mathmlBuilder) {
            mathmlGroupTypes[type] = mathmlBuilder;
        }
    }
}

// Since the corresponding buildHTML/buildMathML function expects a
// list of elements, we normalize for different kinds of arguments
export const ordargument = function(arg: ParseNode) {
    if (arg.type === "ordgroup") {
        return arg.value;
    } else {
        return [arg];
    }
};
