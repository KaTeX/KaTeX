/* eslint no-console:0 */
const fs = require('fs');
const path = require('path');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const moveFile = util.promisify(fs.rename);
const execFile = util.promisify(require('child_process').execFile);
const readline = require('readline');

process.env.NODE_ENV = 'font';
require('@babel/register');
const GlyphTable = require('../src/symbols').GlyphTable;

process.chdir(__dirname);

// from highest to lowest priority
const GLYPH_LISTS = ["texglyphlist.txt", "glyphlist.txt"];
const GlyphList = []; // sparse array

const TeXFontTable = {cmr: [], cmbx: [], cmti: [], cmbxti: [], cmmi: [], cmmib: [],
    cmsy: [], cmex: [], cmbsy: [], cmss: [], cmssbx: [], cmssi: [], cmtt: [],
    msam: [], msbm: [], rsfs: [], eufm: [], eufb: []}; // sparse arrays

const TeXMetrics = {cmr: [], cmbx: [], cmti: [], cmbxti: [], cmmi: [], cmmib: [],
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

const NUMERAL = [0x30, 0x39];
const UPPER = [0x41, 0x5A];
const LOWER = [0x61, 0x7A];

// The first element is used to indicate the ranges of glyphs to include,
// from highest to lowest priority (we don't have a null character (U+0000))
// cmex gets special treatment by handleMathExtension.
const FontTable = {
    "Caligraphic-Regular": {cmsy: [[UPPER]], extra: []},
    "Caligraphic-Bold": {cmbsy: [[UPPER]], extra: []},
    "Math-Italic": {cmmi: [[[0x00, 0x27], NUMERAL, UPPER, LOWER]], extra: []},
    "Math-BoldItalic": {cmmib: [[[0x00, 0x27], NUMERAL, UPPER, LOWER]], extra: []},
    "Main-Regular": {cmr: [], cmmi: [], cmsy: [], extra: []},
    "Main-Bold": {cmbx: [], cmmib: [], cmbsy: [], extra: []},
    "Main-Italic": {cmti: [], extra: []},
    "Main-BoldItalic": {cmbxti: [], extra: []},
    AMS: {msam: [], msbm: [], extra: []},
    Size1: {cmex: [], extra: []},
    Size2: {cmex: [], extra: []},
    Size3: {cmex: [], extra: []},
    Size4: {cmex: [], extra: []},
    "SansSerif-Regular": {cmss: [], extra: []},
    "SansSerif-Italic": {cmssi: [], extra: []},
    "SansSerif-Bold": {cmssbx: [], extra: []},
    Typewriter: {cmtt: [], extra: []},
    "Fraktur-Regular": {eufm: [], extra: []},
    "Fraktur-Bold": {eufb: [], extra: []},
    Script: {rsfs: [], extra: []},
}; // sparse arrays except extra
const FontMetrics = {};

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

async function mftrace(font) {
    const result = await execFile("mftrace", ["--simplify", `${font}10`]);
    await moveFile(`${font}10.pfa`, path.join('pfa', `${font}10.pfa`));
}

async function makeFF(font) {
    let fontName = `KaTeX_${font}`;
    //
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
        let idx;
        if (!code || !name || !isValidIndex((idx = parseInt(code[1])))) {
            continue;
        }
        TeXFontTable[font][idx] = name[1];
    }
}

function readFixWord(buffer, offset) {
    return buffer.readInt32BE(offset) / (1 << 20);
}

/** Read font metrics from an TFM (TeX font metrics) file. */
async function readTFM(font) {
    const tfm = await readFile(await findFile(`${font}10.tfm`));

    let offset = 0;
    const header = [];
    for (; offset < 24; offset += 2) {
        header.push(tfm.readUInt16BE(offset));
    }
    offset += 4 * header[1]; // header_size

    const charInfo = [];
    for (let ch = header[2]; ch <= header[3]; ch++) {
        const w = tfm.readUInt8(offset++);
        const hd = tfm.readUInt8(offset++);
        const h = hd >> 4;
        const d = (hd & 0x0f);
        const it = tfm.readUInt8(offset++);
        const i = it >> 2;
        const t = (it & 0x03);
        const r = tfm.readUInt8(offset++);
        charInfo[ch] = [w, h, d, i, t, r];
    }
    charInfo.forEach(([w, h, d, i, t, r], ch) => {
        let start = offset;
        const width = Math.round(100000 * readFixWord(tfm, start + 4 * w)) / 100000;
        start += 4 * header[4];
        const height = Math.round(100000 * readFixWord(tfm, start + 4 * h)) / 100000;
        start += 4 * header[5];
        const depth = Math.round(100000 * readFixWord(tfm, start + 4 * d)) / 100000;
        start += 4 * header[6];
        const italic = Math.round(100000 * readFixWord(tfm, start + 4 * i)) / 100000;
        const skew = 0;
        TeXMetrics[font][ch] = [depth, height, italic, skew, width];
    });
    // const buf = Buffer.alloc(4);
    //
    // try {
    //     console.log(await read(tfm, buf, 0, 1)); // file length
    // } catch (e) {
    //     console.log(e);
    // } finally {
    //     console.log('X');
    // }
    // const headerLength = (await read(afm, buf, 0, 2)).buffer;
    // console.log(headerLength);
    // await close(afm);
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

function isValidIndex(idx) {
    return idx >= 0 && idx <= 0x7F;
}

/** Handle cmex (math extensions) glyph */
function handleMathExtension(ch, name, prop) {
    const size = CMEX_SIZES.find(size => isValidIndex(TeXFontTable.cmex.indexOf(
        name + Object.keys(size)[0])));
    if (size == null) {
        return false;
    }
    Object.keys(size).forEach((s, i) => {
        const idx = TeXFontTable.cmex.indexOf(name + s);
        if (isValidIndex(idx)) {
            const p = Array.isArray(prop) ? prop.slice(2 * i, 2 * i + 2) : size[s];
            FontTable[`Size${(i + 1)}`].cmex[ch] = p && p.length
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
            if (handleMathExtension(ch, nm, prop)) {
                found = true;
            }
            continue;
        }

        const idx = TeXFontTable[tf].indexOf(nm);
        if (!isValidIndex(idx)) {
            continue;
        }
        for (const f in FontTable) {
            if (FontTable[f][tf]) {
                const ranges = FontTable[f][tf][0];
                if (!ranges || ranges.some(r => (r[0] <= idx) && (idx <= r[1]))) {
                    found = true;
                    FontTable[f][tf][ch] = prop ? {idx, prop} : idx;
                    break;
                }
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
        // await mftrace(font);
        await readAFM(font);
        await readTFM(font);
    }
    // TeX encodings disagree with Unicode and the Adobe glyph list; in TeX,
    // the "straight" form of phi takes the name "phi", whereas the more-common
    // "loopy" form of phi, \varphi, takes the name "phi1".
    GlyphList[0x3C6] = ["phi1"];

    GlyphTable.forEach(addGlyph);

    for (const f of Object.keys(FontTable)) {
        console.log(f);
        for (const tf of Object.keys(FontTable[f])) {
            if (tf === "extra") {
                continue;
            }
            const table = FontTable[f][tf];
            console.log(`  ${tf}`);
            const idxSorted = Object.keys(FontTable[f][tf]).filter(x => x !== "0")
                .sort((x, y) => (table[x].idx != null ? table[x].idx : table[x]) - (table[y].idx != null ? table[y].idx : table[y]));
            for (const i of idxSorted) {
                const entry = table[i];
                const idx = entry.idx != null ? entry.idx : entry;
                console.log(`    ${idx.toString(16)}: ${parseInt(i).toString(16)}${entry.prop != null ? ", " + entry.prop : ""}`);
            }
        }
    }

    const metricsData = {};
    for (const f of Object.keys(FontTable)) {
        await makeFF(f);
        metricsData[f] = {};
        for (const tf of Object.keys(FontTable[f])) {
            if (tf === "extra") {
                continue;
            }
            for (const i in FontTable[f][tf]) {
                if (i === "0") {
                    continue;
                }
                const entry = FontTable[f][tf][i];
                metricsData[f][i] = TeXMetrics[tf][
                    entry.idx != null ? entry.idx : entry];
            }
        }
    }
    /*console.log(JSON.stringify(metricsData, function(k, v) {
        if (v instanceof Array) {
            return "[" + v.join(", ") + "]";
        }
        return v;
    }, 4).replace(/\\/g, '')
        .replace(/"\[/g, '[')
        .replace(/\]"/g, ']')
        .replace(/"\{/g, '{')
        .replace(/\}"/g, '}'));*/
})();
