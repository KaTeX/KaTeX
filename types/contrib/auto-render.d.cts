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
    }
}

export = renderMathInElement;
