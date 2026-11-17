import type {KatexOptions} from "../katex";

declare function renderMathInElement(
    elem: HTMLElement,
    options?: renderMathInElement.RenderMathInElementOptions,
): void;

declare namespace renderMathInElement {
    interface DelimiterSpec {
        left: string;
        right: string;
        display: boolean;
    }

    interface RenderMathInElementOptions extends KatexOptions {
        delimiters?: readonly DelimiterSpec[];
        preProcess?: (math: string) => string;
        ignoredTags?: readonly string[];
        ignoredClasses?: readonly string[];
        errorCallback?: (msg: string, err: Error) => void;
        /**
         * Put equation numbers into `\ref` and `\eqref` once the math is
         * rendered, if there are any (see `resolveReferences`).
         *
         * @default true
         */
        resolveReferences?: boolean;
    }

    /**
     * Put equation numbers into the `\ref`s and `\eqref`s in `root` (by
     * default the whole page): an element, a list of elements numbered
     * separately, or a selector for them. Returns the names of the labels
     * that were referred to but not found.
     */
    function resolveReferences(
        root?: ParentNode | Iterable<ParentNode> | string,
    ): string[];
}

export = renderMathInElement;
