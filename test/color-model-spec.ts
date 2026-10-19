/* eslint max-len:0 */

import {getParsed, r} from "./helpers";

describe("A color model parser", function() {
    it("should parse the example from the xcolor package", function() {
        const parse = getParsed(r`\color[rgb]{0.7,0,0}\times`)[0];
        expect(parse.type).toEqual("color");
        expect(parse.color).toEqual("#b30000");
        expect(r`\color[rgb]{0.7,0,0}\times`).toBuild();
    });

    it("should convert rgb and RGB specifications", function() {
        const parse1 = getParsed(r`\textcolor[rgb]{1,0,0}{x}`)[0];
        const parse2 = getParsed(r`\textcolor[RGB]{255,128,0}{x}`)[0];
        expect(parse1.color).toEqual("#ff0000");
        expect(parse2.color).toEqual("#ff8000");
    });

    it("should convert an HTML specification", function() {
        const parse = getParsed(r`\textcolor[HTML]{FF8000}{x}`)[0];
        expect(parse.color).toEqual("#FF8000");
    });

    it("should convert cmy and cmyk specifications", function() {
        const parse1 = getParsed(r`\textcolor[cmy]{1,0,0}{x}`)[0];
        const parse2 = getParsed(r`\textcolor[cmyk]{0,1,1,0}{x}`)[0];
        expect(parse1.color).toEqual("#00ffff");
        expect(parse2.color).toEqual("#ff0000");
    });

    it("should convert gray and Gray specifications", function() {
        const parse1 = getParsed(r`\textcolor[gray]{0.5}{x}`)[0];
        const parse2 = getParsed(r`\textcolor[Gray]{15}{x}`)[0];
        expect(parse1.color).toEqual("#808080");
        expect(parse2.color).toEqual("#ffffff");
    });

    it("should convert an hsb specification", function() {
        const parse = getParsed(r`\textcolor[hsb]{0.5,1,1}{x}`)[0];
        expect(parse.color).toEqual("#00ffff");
    });

    it("should allow spaces in a specification", function() {
        const parse = getParsed(r`\textcolor[rgb]{ 1 , 0 , 0 }{x}`)[0];
        expect(parse.color).toEqual("#ff0000");
    });

    it("should apply the model to every color of \\fcolorbox", function() {
        expect(r`\fcolorbox[rgb]{1,0,0}{0,0,1}{x}`).toParse();
        expect(r`\fcolorbox[rgb]{1,0,0}{0,0,1}{x}`).toBuild();
        expect(r`\colorbox[cmyk]{0,0,0,0.5}{x}`).toBuild();
    });

    it("should not leak the model into nested commands", function() {
        expect(r`\textcolor[rgb]{1,0,0}{\color{blue}x}`)
            .toParseLike(r`\textcolor{#ff0000}{\color{blue}x}`);
    });

    it("should not parse a bad color model specification", function() {
        expect(r`\textcolor[foo]{1,0,0}{x}`).not.toParse();
        expect(r`\textcolor[rgb2]{1,0,0}{x}`).not.toParse();
        expect(r`\textcolor[rgb{1,0,0}{x}`).not.toParse();
        expect(r`\textcolor[rgb]{1,0}{x}`).not.toParse();
        expect(r`\textcolor[rgb]{1,0,0,0}{x}`).not.toParse();
        expect(r`\textcolor[rgb]{2,0,0}{x}`).not.toParse();
        expect(r`\textcolor[rgb]{a,b,c}{x}`).not.toParse();
        expect(r`\textcolor[HTML]{FF80}{x}`).not.toParse();
        expect(r`\textcolor[gray]{-0.5}{x}`).not.toParse();
    });
});
