import type { TrustContext, KatexOptions, render as renderType, renderToString as renderToStringType, ParseError } from "./katex.d.ts";

export {TrustContext, KatexOptions}

declare const katex: {
    version: string;
    render: typeof renderType;
    renderToString: typeof renderToStringType;
    ParseError: typeof ParseError;
};

export default katex;
