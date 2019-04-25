import symbols from '../src/symbols.js';
import macros from '../src/macros.js';

describe("Symbols and macros", () => {
    for (let macro in macros) {
        it(`macro ${macro} should not shadow a symbol`, () => {
            for (let kind in symbols) {
                expect(symbols[kind][macro]).toBeFalsy();
            }
        });
    }
});
