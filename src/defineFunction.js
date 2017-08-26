// @flow
import functions from "./functions";
import {groupTypes as htmlGroupTypes} from "./buildHTML";
import {groupTypes as mathmlGroupTypes} from "./buildMathML";

// TODO(kevinb) use flow to define a proper type for Options
type Options = any;

type FunctionSpec<T> = {
    // Unique string to differentiate parse nodes.
    type: string,

    // The first argument to defineFunction is a single name or a list of names.
    // All functions named in such a list will share a single implementation.
    names: Array<string>,

    // Properties that control how the functions are parsed.
    props: {
        // The number of arguments the function takes.
        numArgs?: number,

        // An array corresponding to each argument of the function, giving the
        // type of argument that should be parsed. Its length should be equal
        // to `numArgs + numOptionalArgs`. Valid types:
        //   - "size": A size-like thing, such as "1em" or "5ex"
        //   - "color": An html color, like "#abc" or "blue"
        //   - "original": The same type as the environment that the
        //                 function being parsed is in (e.g. used for the
        //                 bodies of functions like \textcolor where the
        //                 first argument is special and the second
        //                 argument is parsed normally)
        argTypes?: "color" | "size" | "original",

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
    },

    // The handler is called to handle these functions and their arguments.
    // It receives two arguments:
    //   - context contains information and references provided by the parser
    //   - args is an array of arguments obtained from TeX input
    // The context contains the following properties:
    //   - funcName: the text (i.e. name) of the function, including \
    //   - parser: the parser object
    //   - lexer: the lexer object
    //   - positions: the positions in the overall string of the function
    //               and the arguments.
    // The latter three should only be used to produce error messages.
    //
    // The function should return an object with the following keys:
    //   - type: The type of element that this is. This is then used in
    //          buildHTML/buildMathML to determine which function
    //          should be called to build this node into a DOM node
    // Any other data can be added to the object, which will be passed
    // in to the function in buildHTML/buildMathML as `group.value`.
    handler: (context: any, args: any) => T,

    // This function returns an object representing the DOM structure to be
    // created when rendering the defined LaTeX function.
    htmlBuilder: (group: T, options: Options) => any,

    // This function returns an object representing the MathML structure to be
    // created when rendering the defined LaTeX function.
    mathmlBuilder: (group: T, options: Options) => any,
}

export default function defineFunction({
    type,
    names,
    props,
    handler,
    htmlBuilder,
    mathmlBuilder,
}: FunctionSpec<*>) {
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
export const ordargument = function(arg: any) {
    if (arg.type === "ordgroup") {
        return arg.value;
    } else {
        return [arg];
    }
};
