export {};

const data: Record<string, ScreenshotterItem> = require("./screenshotter/ss_data.js");

interface ScreenshotterItem {
    tex: string;
    macros?: Record<string, string>;
    display?: boolean;
    noThrow?: boolean;
    errorColor?: string;
}

describe("Screenshotter item", function() {
    for (const item of Object.values(data)) {
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
});
