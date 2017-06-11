/* eslint-env node, es6 */
/* eslint-disable no-console */
"use strict";

const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");
const Q = require("q"); // To debug, pass Q_DEBUG=1 in the environment
const pngparse = require("pngparse");
const fft = require("ndarray-fft");
const ndarray = require("ndarray");

const data = require("../../test/screenshotter/ss_data");

// Adapt node functions to Q promises
const readFile = Q.denodeify(fs.readFile);
const writeFile = Q.denodeify(fs.writeFile);
const mkdir = Q.denodeify(fs.mkdir);

let todo;
if (process.argv.length > 2) {
    todo = process.argv.slice(2);
} else {
    todo = Object.keys(data).filter(function(key) {
        return !data[key].nolatex;
    });
}

// Dimensions used when we do the FFT-based alignment computation
const alignWidth = 2048; // should be at least twice the width resp. height
const alignHeight = 2048; // of the screenshots, and a power of two.

// Compute required resolution to match test.html. 16px default font,
// scaled to 4em in test.html, and to 1.21em in katex.css. Corresponding
// LaTeX font size is 10pt. There are 72.27pt per inch.
const pxPerEm = 16 * 4 * 1.21;
const pxPerPt = pxPerEm / 10;
const dpi = pxPerPt * 72.27;

const tmpDir = "/tmp/texcmp";
const ssDir = path.normalize(
    path.join(__dirname, "..", "..", "test", "screenshotter"));
const imagesDir = path.join(ssDir, "images");
const teximgDir = path.join(ssDir, "tex");
const diffDir = path.join(ssDir, "diff");
let template;

Q.all([
    readFile(path.join(ssDir, "test.tex"), "utf-8"),
    ensureDir(tmpDir),
    ensureDir(teximgDir),
    ensureDir(diffDir),
]).spread(function(data) {
    template = data;
    // dirs have been created, template has been read, now rasterize.
    return Q.all(todo.map(processTestCase));
}).done();

// Process a single test case: rasterize, then create diff
function processTestCase(key) {
    const itm = data[key];
    let tex = "$" + itm.tex + "$";
    if (itm.display) {
        tex = "\\[" + itm.tex + "\\]";
    }
    if (itm.pre) {
        tex = itm.pre.replace("<br>", "\\\\") + tex;
    }
    if (itm.post) {
        tex = tex + itm.post.replace("<br>", "\\\\");
    }
    if (itm.macros) {
        tex = Object.keys(itm.macros).map(name => {
            const expansion = itm.macros[name];
            let numArgs = 0;
            if (expansion.indexOf("#") !== -1) {
                const stripped = expansion.replace(/##/g, "");
                while (stripped.indexOf("#" + (numArgs + 1)) !== -1) {
                    ++numArgs;
                }
            }
            let args = "";
            for (let i = 1; i <= numArgs; ++i) {
                args += "#" + i;
            }
            return "\\def" + name + args + "{" + expansion + "}\n";
        }).join("") + tex;
    }
    tex = template.replace(/\$.*\$/, tex.replace(/\$/g, "$$$$"));
    const texFile = path.join(tmpDir, key + ".tex");
    const pdfFile = path.join(tmpDir, key + ".pdf");
    const pngFile = path.join(teximgDir, key + "-pdflatex.png");
    const browserFile = path.join(imagesDir, key + "-firefox.png");
    const diffFile = path.join(diffDir, key + ".png");

    // Step 1: write key.tex file
    const fftLatex = writeFile(texFile, tex).then(function() {
        // Step 2: call "pdflatex key" to create key.pdf
        return execFile("pdflatex", [
            "-interaction", "nonstopmode", key,
        ], {cwd: tmpDir});
    }).then(function() {
        console.log("Typeset " + key);
        // Step 3: call "convert ... key.pdf key.png" to create key.png
        return execFile("convert", [
            "-density", dpi, "-units", "PixelsPerInch", "-flatten",
            "-depth", "8", pdfFile, pngFile,
        ]);
    }).then(function() {
        console.log("Rasterized " + key);
        // Step 4: apply FFT to that
        return readPNG(pngFile).then(fftImage);
    });
    // Step 5: apply FFT to reference image as well
    const fftBrowser = readPNG(browserFile).then(fftImage);

    return Q.all([fftBrowser, fftLatex]).spread(function(browser, latex) {
        // Now we have the FFT result from both
        // Step 6: find alignment which maximizes overlap.
        // This uses a FFT-based correlation computation.
        let x;
        let y;
        const real = createMatrix();
        const imag = createMatrix();

        // Step 6a: (real + i*imag) = latex * conjugate(browser)
        for (y = 0; y < alignHeight; ++y) {
            for (x = 0; x < alignWidth; ++x) {
                const br = browser.real.get(y, x);
                const bi = browser.imag.get(y, x);
                const lr = latex.real.get(y, x);
                const li = latex.imag.get(y, x);
                real.set(y, x, br * lr + bi * li);
                imag.set(y, x, br * li - bi * lr);
            }
        }

        // Step 6b: (real + i*imag) = inverseFFT(real + i*imag)
        fft(-1, real, imag);

        // Step 6c: find position where the (squared) absolute value is maximal
        let offsetX = 0;
        let offsetY = 0;
        let maxSquaredNorm = -1; // any result is greater than initial value
        for (y = 0; y < alignHeight; ++y) {
            for (x = 0; x < alignWidth; ++x) {
                const or = real.get(y, x);
                const oi = imag.get(y, x);
                const squaredNorm = or * or + oi * oi;
                if (maxSquaredNorm < squaredNorm) {
                    maxSquaredNorm = squaredNorm;
                    offsetX = x;
                    offsetY = y;
                }
            }
        }

        // Step 6d: Treat negative offsets in a non-cyclic way
        if (offsetY > (alignHeight / 2)) {
            offsetY -= alignHeight;
        }
        if (offsetX > (alignWidth / 2)) {
            offsetX -= alignWidth;
        }
        console.log("Positioned " + key + ": " + offsetX + ", " + offsetY);

        // Step 7: use these offsets to compute difference illustration
        const bx = Math.max(offsetX, 0); // browser left padding
        const by = Math.max(offsetY, 0); // browser top padding
        const lx = Math.max(-offsetX, 0); // latex left padding
        const ly = Math.max(-offsetY, 0); // latex top padding
        const uw = Math.max(browser.width + bx, latex.width + lx); // union w.
        const uh = Math.max(browser.height + by, latex.height + ly); // u. h.
        return execFile("convert", [
            // First image: latex rendering, converted to grayscale and padded
            "(", pngFile, "-colorspace", "Gray",
            "-extent", uw + "x" + uh + "-" + lx + "-" + ly,
            ")",
            // Second image: browser screenshot, to grayscale and padded
            "(", browserFile, "-colorspace", "Gray",
            "-extent", uw + "x" + uh + "-" + bx + "-" + by,
            ")",
            // Third image: the per-pixel minimum of the first two images
            "(", "-clone", "0-1", "-compose", "darken", "-composite", ")",
            // First image is red, second green, third blue channel of result
            "-channel", "RGB", "-combine",
            "-trim",  // remove everything with the same color as the corners
            diffFile, // output file name
        ]);
    }).then(function() {
        console.log("Compared " + key);
    });
}

// Create a directory, but ignore error if the directory already exists.
function ensureDir(dir) {
    return mkdir(dir).fail(function(err) {
        if (err.code !== "EEXIST") {
            throw err;
        }
    });
}

// Execute a given command, and return a promise to its output.
// Don't denodeify here, since fail branch needs access to stderr.
function execFile(cmd, args, opts) {
    const deferred = Q.defer();
    childProcess.execFile(cmd, args, opts, function(err, stdout, stderr) {
        if (err) {
            console.error("Error executing " + cmd + " " + args.join(" "));
            console.error(stdout + stderr);
            err.stdout = stdout;
            err.stderr = stderr;
            deferred.reject(err);
        } else {
            deferred.resolve(stdout);
        }
    });
    return deferred.promise;
}

// Read given file and parse it as a PNG file.
function readPNG(file) {
    const deferred = Q.defer();
    const onerror = deferred.reject.bind(deferred);
    const stream = fs.createReadStream(file);
    stream.on("error", onerror);
    pngparse.parseStream(stream, function(err, image) {
        if (err) {
            console.log("Failed to load " + file);
            onerror(err);
            return;
        }
        deferred.resolve(image);
    });
    return deferred.promise;
}

// Take a parsed image data structure and apply FFT transformation to it
function fftImage(image) {
    const real = createMatrix();
    const imag = createMatrix();
    let idx = 0;
    const nchan = image.channels;
    const alphachan = 1 - (nchan % 2);
    const colorchan = nchan - alphachan;
    for (let y = 0; y < image.height; ++y) {
        for (let x = 0; x < image.width; ++x) {
            let v = 0;
            for (let c = 0; c < colorchan; ++c) {
                v += 255 - image.data[idx++];
            }
            for (let c = 0; c < alphachan; ++c) {
                v += image.data[idx++];
            }
            real.set(y, x, v);
        }
    }
    fft(1, real, imag);
    return {
        real: real,
        imag: imag,
        width: image.width,
        height: image.height,
    };
}

// Create a new matrix of preconfigured dimensions, initialized to zero
function createMatrix() {
    const array = new Float64Array(alignWidth * alignHeight);
    return new ndarray(array, [alignWidth, alignHeight]);
}
