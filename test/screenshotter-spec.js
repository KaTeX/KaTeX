const data = require("./screenshotter/ss_data");

describe("Screenshotter item", function() {
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const item = data[key];
            it(`"${item.tex}" should build successfully`, function() {
                expect(item.tex).toBuild({
                    macros: item.macros,
                    displayMode: item.display,
                    throwOnError: !item.noThrow,
                    errorColor: item.errorColor,
                    strict: false,
                    trust: true,  // trust test inputs
                });
            });
        }
    }
});
