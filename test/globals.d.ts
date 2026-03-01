declare const describe: any;
declare const it: any;
declare const test: any;
declare const expect: any;
declare const beforeAll: any;
declare const beforeEach: any;
declare const afterAll: any;
declare const afterEach: any;
declare const jest: any;

declare interface NodeRequire {
    (name: string): any;
    resolve(name: string): string;
}

declare const require: NodeRequire;
declare const process: any;
declare const __dirname: string;
declare const global: any;
declare const module: any;

declare module "json-stable-stringify" {
    const stringify: any;
    export default stringify;
}

declare module "jest-diff" {
    export const diff: any;
}

declare module "jest-matcher-utils" {
    export const RECEIVED_COLOR: any;
    export const printReceived: any;
    export const printExpected: any;
}

declare module "jest-message-util" {
    export const formatStackTrace: any;
    export const separateMessageFromStack: any;
}
