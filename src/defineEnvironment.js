// @flow
import {groupTypes as htmlGroupTypes} from "./buildHTML";
import {groupTypes as mathmlGroupTypes} from "./buildMathML";

import Options from "./Options";
import ParseNode from "./ParseNode";

import type Parser from "./Parser";
import type {ArgType, Mode} from "./types";
import type {HtmlDomNode} from "./domTree";
import type {NodeType} from "./ParseNode";
import type {MathNode} from "./mathMLTree";

/**
 * The context contains the following properties:
 *  - mode: current parsing mode.
 *  - envName: the name of the environment, one of the listed names.
 *  - parser: the parser object.
 */
type EnvContext = {|
    mode: Mode,
    envName: string,
    parser: Parser,
|};

/**
 *  - context: information and references provided by the parser
 *  - args: an array of arguments passed to \begin{name}
 *  - optArgs: an array of optional arguments passed to \begin{name}
 */
type EnvHandler<NODETYPE: NodeType> = (
    context: EnvContext,
    args: ParseNode<*>[],
    optArgs: (?ParseNode<*>)[],
) => ParseNode<NODETYPE>;

/**
 *  - numArgs: (default 0) The number of arguments after the \begin{name} function.
 *  - argTypes: (optional) Just like for a function
 *  - allowedInText: (default false) Whether or not the environment is allowed
 *                   inside text mode (not enforced yet).
 *  - numOptionalArgs: (default 0) Just like for a function
 */
type EnvProps = {
    numArgs: number,
};

/**
 * Final enviornment spec for use at parse time.
 * This is almost identical to `EnvDefSpec`, except it
 * 1. includes the function handler
 * 2. requires all arguments except argType
 * It is generated by `defineEnvironment()` below.
 */
export type EnvSpec<NODETYPE: NodeType> = {|
    type: NODETYPE, // Need to use the type to avoid error. See NOTES below.
    numArgs: number,
    argTypes?: ArgType[],
    greediness: number,
    allowedInText: boolean,
    numOptionalArgs: number,
    // FLOW TYPE NOTES: Same issue as the notes on the handler of FunctionSpec
    // in defineFunction.
    handler: EnvHandler<*>,
|};

/**
 * All registered environments.
 * `environments.js` exports this same dictionary again and makes it public.
 * `Parser.js` requires this dictionary via `environments.js`.
 */
export const _environments: {[string]: EnvSpec<*>} = {};

type EnvDefSpec<NODETYPE: NodeType> = {|
    // Unique string to differentiate parse nodes.
    type: NODETYPE,

    // List of functions which use the give handler, htmlBuilder,
    // and mathmlBuilder.
    names: Array<string>,

    // Properties that control how the environments are parsed.
    props: EnvProps,

    handler: EnvHandler<NODETYPE>,

    // This function returns an object representing the DOM structure to be
    // created when rendering the defined LaTeX function.
    htmlBuilder: (group: ParseNode<NODETYPE>, options: Options) => HtmlDomNode,

    // This function returns an object representing the MathML structure to be
    // created when rendering the defined LaTeX function.
    mathmlBuilder: (group: ParseNode<NODETYPE>, options: Options) => MathNode,
|};

export default function defineEnvironment<NODETYPE: NodeType>({
    type,
    names,
    props,
    handler,
    htmlBuilder,
    mathmlBuilder,
}: EnvDefSpec<NODETYPE>) {
    // Set default values of environments.
    const data = {
        type,
        numArgs: props.numArgs || 0,
        greediness: 1,
        allowedInText: false,
        numOptionalArgs: 0,
        handler,
    };
    for (let i = 0; i < names.length; ++i) {
        _environments[names[i]] = data;
    }
    if (htmlBuilder) {
        htmlGroupTypes[type] = htmlBuilder;
    }
    if (mathmlBuilder) {
        mathmlGroupTypes[type] = mathmlBuilder;
    }
}
