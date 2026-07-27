import type {KatexOptions} from "../katex";

export interface DelimiterSpec {
    left: string;
    right: string;
    display: boolean;
}

export interface RenderMathInElementOptions extends KatexOptions {
    delimiters?: readonly DelimiterSpec[];
    preProcess?: (math: string) => string;
    ignoredTags?: readonly string[];
    ignoredClasses?: readonly string[];
    errorCallback?: (msg: string, err: Error) => void;
}

export default function renderMathInElement(
    elem: HTMLElement,
    options?: RenderMathInElementOptions,
): void;

declare global {
    function renderMathInElement(
        elem: HTMLElement,
        options?: RenderMathInElementOptions,
    ): void;
}
