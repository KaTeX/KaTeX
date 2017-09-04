declare module 'match-at' {
    declare module.exports: (re: RegExp, str: string, pos: number) => (Array<string>|null);
}
