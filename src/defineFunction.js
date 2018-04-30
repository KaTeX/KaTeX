// @flow
import {groupTypes as htmlGroupTypes} from "./buildHTML";
import {groupTypes as mathmlGroupTypes} from "./buildMathML";
import {checkNodeType} from "./ParseNode";

import type Parser from "./Parser";
import type ParseNode from "./ParseNode";
import type {NodeType, NodeValue} from "./ParseNode";
import type Options from "./Options";
import type {ArgType, BreakToken, Mode} from "./types";
import type {Token} from "./Token";

/** Context provided to function handlers for error messages. */
export type FunctionContext = {|
    funcName: string,
    parser: Parser,
    token?: Token,
    breakOnTokenText?: BreakToken,
|};

export type FunctionHandler<NODETYPE: NodeType> = (
    context: FunctionContext,
    args: ParseNode<*>[],
    optArgs: (?ParseNode<*>)[],
) => NodeValue<NODETYPE>;

export type FunctionPropSpec = {
    // The number of arguments the function takes.
    numArgs: number,

    // An array corresponding to each argument of the function, giving the
    // type of argument that should be parsed. Its length should be equal
    // to `numOptionalArgs + numArgs`, and types for optional arguments
    // should appear before types for mandatory arguments.
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

    // Switch to the specified mode while consuming the command token.
    // This is useful for commands that switch between math and text mode,
    // for making sure that a switch happens early enough.  Note that the
    // mode is switched immediately back to its original value after consuming
    // the command token, so that the argument parsing and/or function handler
    // can easily access the old mode while doing their own mode switching.
    consumeMode?: ?Mode,
};

type FunctionDefSpec<NODETYPE: NodeType> = {|
    // Unique string to differentiate parse nodes.
    // Also determines the type of the value returned by `handler`.
    type: NODETYPE,

    // The first argument to defineFunction is a single name or a list of names.
    // All functions named in such a list will share a single implementation.
    names: Array<string>,

    // Properties that control how the functions are parsed.
    props: FunctionPropSpec,

    // The handler is called to handle these functions and their arguments.
    // The function should return an object with the following keys:
    //   - type: The type of element that this is. This is then used in
    //          buildHTML/buildMathML to determine which function
    //          should be called to build this node into a DOM node
    // Any other data can be added to the object, which will be passed
    // in to the function in buildHTML/buildMathML as `group.value`.
    handler: ?FunctionHandler<NODETYPE>,

    // This function returns an object representing the DOM structure to be
    // created when rendering the defined LaTeX function.
    // TODO: Change make return type explicit.
    htmlBuilder?: (group: ParseNode<NODETYPE>, options: Options) => *,

    // This function returns an object representing the MathML structure to be
    // created when rendering the defined LaTeX function.
    // TODO: Change make return type explicit.
    mathmlBuilder?: (group: ParseNode<NODETYPE>, options: Options) => *,
|};

/**
 * Final function spec for use at parse time.
 * This is almost identical to `FunctionPropSpec`, except it
 * 1. includes the function handler, and
 * 2. requires all arguments except argTypes.
 * It is generated by `defineFunction()` below.
 */
export type FunctionSpec<NODETYPE: NodeType> = {|
    type: NODETYPE, // Need to use the type to avoid error. See NOTES below.
    numArgs: number,
    argTypes?: ArgType[],
    greediness: number,
    allowedInText: boolean,
    allowedInMath: boolean,
    numOptionalArgs: number,
    infix: boolean,
    consumeMode: ?Mode,

    // FLOW TYPE NOTES: Doing either one of the following two
    //
    // - removing the NODETYPE type parameter in FunctionSpec above;
    // - using ?FunctionHandler<NODETYPE> below;
    //
    // results in a confusing flow typing error:
    //   "string literal `styling`. This type is incompatible with..."
    // pointing to the definition of `defineFunction` and finishing with
    //   "some incompatible instantiation of `NODETYPE`"
    //
    // Having FunctionSpec<NODETYPE> above and FunctionHandler<*> below seems to
    // circumvent this error. This is not harmful for catching errors since
    // _functions is typed FunctionSpec<*> (it stores all TeX function specs).

    // Must be specified unless it's handled directly in the parser.
    handler: ?FunctionHandler<*>,
|};

/**
 * All registered functions.
 * `functions.js` just exports this same dictionary again and makes it public.
 * `Parser.js` requires this dictionary.
 */
export const _functions: {[string]: FunctionSpec<*>} = {};

export default function defineFunction<NODETYPE: NodeType>({
    type,
    nodeType,
    names,
    props,
    handler,
    htmlBuilder,
    mathmlBuilder,
}: FunctionDefSpec<NODETYPE>) {
    // Set default values of functions
    const data = {
        type,
        numArgs: props.numArgs,
        argTypes: props.argTypes,
        greediness: (props.greediness === undefined) ? 1 : props.greediness,
        allowedInText: !!props.allowedInText,
        allowedInMath: (props.allowedInMath === undefined)
            ? true
            : props.allowedInMath,
        numOptionalArgs: props.numOptionalArgs || 0,
        infix: !!props.infix,
        consumeMode: props.consumeMode,
        handler: handler,
    };
    for (let i = 0; i < names.length; ++i) {
        _functions[names[i]] = data;
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
export const ordargument = function(arg: ParseNode<*>): ParseNode<*>[] {
    const node = checkNodeType(arg, "ordgroup");
    return node ? node.value : [arg];
};
