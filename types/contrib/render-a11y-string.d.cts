import type {KatexOptions} from "../katex";

declare function renderA11yString(
    text: string,
    settings?: KatexOptions,
): string;

export = renderA11yString;
