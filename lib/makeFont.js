/* eslint no-console:0 */
const fs = require('fs');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const readline = require('readline');

process.env.NODE_ENV = 'font';
require('@babel/register');
const GlyphTable = require('../src/symbols').GlyphTable;

// from highest to lowest priority
const GLYPH_LISTS = ["texglyphlist.txt", "glyphlist.txt"];
const GlyphList = []; // sparse array

const TeXFontTable = {cmr: [], cmbx: [], cmti: [], cmbxti: [], cmmi: [], cmmib: [],
    cmsy: [], cmex: [], cmbsy: [], cmss: [], cmssbx: [], cmssi: [], cmtt: [],
    msam: [], msbm: [], rsfs: [], eufm: [], eufb: []}; // sparse arrays

// Size suffixes and their shift amount for cmex (math extensions)
const CMEX_SIZES = [{
    big: [0, 810],
    Big: [0, 1110],
    bigg: [0, 1410],
    Bigg: [0, 1710],
}, {
    text: [0, 750],
    display: [0, 950],
}, {
    wide: null,
    wider: null,
    widest: null,
}, {
    '': null,
}];

const FontTable = {
    "Main-Regular": {cmr: [], cmmi: [], cmsy: [], extra: []},
    "Main-Bold": {cmbx: [], cmmib: [], cmbsy: [], extra: []},
    "Main-Italic": {cmti: [], extra: []},
    "Main-BoldItalic": {cmbxti: [], extra: []},
    "Math-Italic": {cmmi: [], extra: []},
    "Math-BoldItalic": {cmmib: [], extra: []},
    AMS: {msam: [], msbm: [], extra: []},
    Size1: {cmex: [], extra: []},
    Size2: {cmex: [], extra: []},
    Size3: {cmex: [], extra: []},
    Size4: {cmex: [], extra: []},
    "Caligraphic-Regular": {cmmi: [], cmsy: [], extra: []},
    "Caligraphic-Bold": {cmmib: [], cmbsy: [], extra: []},
    "SansSerif-Regular": {cmss: [], extra: []},
    "SansSerif-Italic": {cmssi: [], extra: []},
    "SansSerif-Bold": {cmssbx: [], extra: []},
    Typewriter: {cmtt: [], extra: []},
    "Fraktur-Regular": {eufm: [], extra: []},
    "Fraktur-Bold": {eufb: [], extra: []},
    Script: {rsfs: [], extra: []},
}; // sparse arrays except extra

/** Find the file using kpsewhich. */
async function findFile(name) {
    const kpsewhich = await execFile("kpsewhich", [name]);
    return kpsewhich.stdout.trim();
}

/** Read a glyph list file in Adobe Glyph List format. */
async function readGlyphList(filename) {
    const list = fs.createReadStream(await findFile(filename));
    const rl = readline.createInterface({input: list, crlfDelay: Infinity});

    for await (let line of rl) {
        line = line.trim();
        if (!line || line[0] === "#") { // empty or comment
            continue;
        }
        // notprecedesoreql;2AAF 0338,22E0
        const [name, codes] = line.split(";");
        codes.split(",").forEach(code => {
            // discard multiple Unicode values
            if (code.length !== 4 || !(code = parseInt(code, 16))) {
                return;
            }
            if (!GlyphList[code]) {
                GlyphList[code] = [];
            }
            GlyphList[code].push(name);
        });
    }
}

/** Read character names from an AFM (Adobe font metrics) file. */
async function readAFM(font) {
    const afm = fs.createReadStream(await findFile(`${font}10.afm`));
    const rl = readline.createInterface({input: afm, crlfDelay: Infinity});

    let inCharMetrics = false;
    for await (const line of rl) {
        if (/^StartCharMetrics/.test(line)) {
            inCharMetrics = true;
            continue;
        } else if (!inCharMetrics) {
            continue;
        } else if (/^EndCharMetrics/.test(line)) {
            break;
        }
        // C 0 ; WX 625 ; N Gamma ; B 33 0 582 680 ;
        const code = line.match(/C (\d+)/);
        const name = line.match(/N (\w+)/);
        if (!code || !name) {
            continue;
        }
        TeXFontTable[font][parseInt(code[1])] = name[1];
    }
}

/** Find TeX character name from candidates of names. */
function findGlyphName(names) {
    if (typeof names === "string") {
        names = [names];
    } else if (typeof names === "number") {
        names = GlyphList[names]; // lookup
    }
    if (names == null) {
        return "";
    }
    for (let i = 0; i < names.length; i++) {
        for (const tf in TeXFontTable) {
            if (TeXFontTable[tf].indexOf(names[i]) >= 0) {
                return names[i];
            }
        }
    }
    console.warn(`Couldn't find in TeX, using ${names[0]}`);
    return names[0];
}

/** Handle cmex (math extensions) glyph */
function handleMathExtension(ch, tf, name, prop) {
    const size = CMEX_SIZES.find(size =>
        TeXFontTable[tf].indexOf(name + Object.keys(size)[0]) >= 0);
    if (size == null) {
        return false;
    }
    Object.keys(size).forEach((s, i) => {
        const idx = TeXFontTable[tf].indexOf(name + s);
        if (idx !== -1) {
            const p = Array.isArray(prop) ? prop.slice(2 * i, 2 * i + 2) : size[s];
            FontTable[`Size${(i + 1)}`][tf][ch] = p && p.length
                ? {idx, prop: p} : idx;
        }
    });
    return true;
}

/** Add an entry to FontTable for the given glyph. */
function addGlyph(glyph, ch) {
    let found = false;
    let property;
    if (typeof glyph === "object") {
        for (const font in glyph) {
            if (glyph.hasOwnProperty(font) && FontTable[font]) {
                // FontForge commands to generate the glyph
                found = true;
                FontTable[font].extra.push(glyph[font]);
            }
        }
        property = glyph;
        glyph = glyph.name || ch; // fall back to its code point
    }
    const name = findGlyphName(glyph);

    for (const tf of Object.keys(TeXFontTable)) {
        let nm = name;
        let prop = property && property[tf];
        if (Array.isArray(prop)) {
            if (prop[0] != null) {
                nm = prop[0];
            }
            prop = prop.slice(1);
        } else if (prop != null) {
            nm = prop;
            prop = null;
        }

        if (tf === "cmex") {
            if (handleMathExtension(ch, tf, nm, prop)) {
                found = true;
            }
            continue;
        }

        const idx = TeXFontTable[tf].indexOf(nm);
        if (idx === -1) {
            continue;
        }
        for (const f in FontTable) {
            if (FontTable[f][tf]) {
                found = true;
                FontTable[f][tf][ch] = prop ? {idx, prop} : idx;
            }
        }
    }
    if (!found) {
        console.warn(`No action for ${String.fromCharCode(ch)}`);
    }
}

(async function() {
    for (let i = 0; i < GLYPH_LISTS.length; i++) {
        await readGlyphList(GLYPH_LISTS[i]);
    }
    for (const font of Object.keys(TeXFontTable)) {
        await readAFM(font);
    }

    GlyphTable.forEach(addGlyph);

    console.log(FontTable);
})();
