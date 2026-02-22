// TODO: remove after migration ParseError to TypeScript
declare class ParseError extends Error {
    constructor(message: string);
}

export default ParseError;
