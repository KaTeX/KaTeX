import symbols from '../src/symbols';
import macros from '../src/macros';

describe("Symbols and macros", () => {
    for (const macro of Object.keys(macros)) {
        it(`macro ${macro} should not shadow a symbol`, () => {
            for (const kind of Object.keys(symbols)) {
                const mode = kind as keyof typeof symbols;
                expect(symbols[mode][macro]).toBeFalsy();
            }
        });
    }
});
