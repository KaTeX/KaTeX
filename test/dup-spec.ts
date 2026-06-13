import symbols from '../src/symbols';
import macros from '../src/macros';

describe("Symbols and macros", () => {
    for (const macro in macros) {
        if (!Object.hasOwn(macros, macro)) {
            continue;
        }
        it(`macro ${macro} should not shadow a symbol`, () => {
            for (const kind in symbols) {
                if (!Object.hasOwn(symbols, kind)) {
                    continue;
                }
                const mode = kind as keyof typeof symbols;
                expect(symbols[mode][macro]).toBeFalsy();
            }
        });
    }
});
