"use strict";

var childProcess = require("child_process");
var fs = require("fs");
var path = require("path");
var Q = require("q"); // To debug, pass Q_DEBUG=1 in the environment
var pngparse = require("pngparse");
var fft = require("ndarray-fft");
var Ndarray = require("ndarray-fft/node_modules/ndarray");

var data = require("../../test/screenshotter/ss_data");

// Adapt node functions to Q promises
var readFile = Q.denodeify(fs.readFile);
var writeFile = Q.denodeify(fs.writeFile);
var mkdir = Q.denodeify(fs.mkdir);

var todo;
if (process.argv.length > 2) {
    todo = process.argv.slice(2);
} else {
    todo = Object.keys(data).filter(function(key) {
        return !data[key].nolatex;
    });
}

// Dimensions used when we do the FFT-based alignment computation
var alignWidth = 2048; // should be at least twice the width resp. height
var alignHeight = 2048; // of the screenshots, and a power of two.

// Compute required resolution to match test.html. 16px default font,
// scaled to 4em in test.html, and to 1.21em in katex.css. Corresponding
// LaTeX font size is 10pt. There are 72.27pt per inch.
var pxPerEm = 16 * 4 * 1.21;
var pxPerPt = pxPerEm / 10;
var dpi = pxPerPt * 72.27;

var tmpDir = "/tmp/texcmp";
var ssDir = path.normalize(
    path.join(__dirname, "..", "..", "test", "screenshotter"));
var imagesDir = path.join(ssDir, "images");
var teximgDir = path.join(ssDir, "tex");
var diffDir = path.join(ssDir, "diff");
var template;

Q.all([
    readFile(path.join(ssDir, "test.tex"), "utf-8"),
    ensureDir(tmpDir),
    ensureDir(teximgDir),
    ensureDir(diffDir)
]).spread(function(data) {
    template = data;
    // dirs have been created, template has been read, now rasterize.
    return Q.all(todo.map(processTestCase));
}).done();

// Process a single test case: rasterize, then create diff
function processTestCase(key) {
    var itm = data[key];
    var tex = "$" + itm.tex + "$";
    if (itm.display) {
        tex = "\\[" + itm.tex + "\\]";
    }
    if (itm.pre) {
        tex = itm.pre.replace("<br>", "\\\\") + tex;
    }
    if (itm.post) {
        tex = tex + itm.post.replace("<br>", "\\\\");
    }
    tex = template.replace(/\$.*\$/, tex.replace(/\$/g, "$$$$"));
    var texFile = path.join(tmpDir, key + ".tex");
    var pdfFile = path.join(tmpDir, key + ".pdf");
    var pngFile = path.join(teximgDir, key + "-pdflatex.png");
    var browserFile = path.join(imagesDir, key + "-firefox.png");
    var diffFile = path.join(diffDir, key + ".png");

    // Step 1: write key.tex file
    var fftLatex = writeFile(texFile, tex).then(function() {
        // Step 2: call "pdflatex key" to create key.pdf
        return execFile("pdflatex", [
            "-interaction", "nonstopmode", key
        ], {cwd: tmpDir});
    }).then(function() {
        console.log("Typeset " + key);
        // Step 3: call "convert ... key.pdf key.png" to create key.png
        return execFile("convert", [
            "-density", dpi, "-units", "PixelsPerInch", "-flatten",
            pdfFile, pngFile
        ]);
    }).then(function() {
        console.log("Rasterized " + key);
        // Step 4: apply FFT to that
        return readPNG(pngFile).then(fftImage);
    });
    // Step 5: apply FFT to reference image as well
    var fftBrowser = readPNG(browserFile).then(fftImage);

    return Q.all([fftBrowser, fftLatex]).spread(function(browser, latex) {
        // Now we have the FFT result from both 
        // Step 6: find alignment which maximizes overlap.
        // This uses a FFT-based correlation computation.
        var x, y;
        var real = createMatrix();
        var imag = createMatrix();

        // Step 6a: (real + i*imag) = latex * conjugate(browser)
        for (y = 0; y < alignHeight; ++y) {
            for (x = 0; x < alignWidth; ++x) {
                var br = browser.real.get(y, x);
                var bi = browser.imag.get(y, x);
                var lr = latex.real.get(y, x);
                var li = latex.imag.get(y, x);
                real.set(y, x, br * lr + bi * li);
                imag.set(y, x, br * li - bi * lr);
            }
        }

        // Step 6b: (real + i*imag) = inverseFFT(real + i*imag)
        fft(-1, real, imag);

        // Step 6c: find position where the (squared) absolute value is maximal
        var offsetX = 0;
        var offsetY = 0;
        var maxSquaredNorm = -1; // any result is greater than initial value
        for (y = 0; y < alignHeight; ++y) {
            for (x = 0; x < alignWidth; ++x) {
                var or = real.get(y, x);
                var oi = imag.get(y, x);
                var squaredNorm = or * or + oi * oi;
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
        var bx = Math.max(offsetX, 0); // browser left padding
        var by = Math.max(offsetY, 0); // browser top padding
        var lx = Math.max(-offsetX, 0); // latex left padding
        var ly = Math.max(-offsetY, 0); // latex top padding
        var uw = Math.max(browser.width + bx, latex.width + lx); // union width
        var uh = Math.max(browser.height + by, latex.height + ly); // u. height
        return execFile("convert", [
            // First image: latex rendering, converted to grayscale and padded
            "(", pngFile, "-grayscale", "Rec709Luminance",
            "-extent", uw + "x" + uh + "-" + lx + "-" + ly,
            ")",
            // Second image: browser screenshot, to grayscale and padded
            "(", browserFile, "-grayscale", "Rec709Luminance",
            "-extent", uw + "x" + uh + "-" + bx + "-" + by,
            ")",
            // Third image: the per-pixel minimum of the first two images
            "(", "-clone", "0-1", "-compose", "darken", "-composite", ")",
            // First image is red, second green, third blue channel of result
            "-channel", "RGB", "-combine",
            "-trim", // remove everything that has the same color as the corners
            diffFile // output file name
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
    var deferred = Q.defer();
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
    var deferred = Q.defer();
    var onerror = deferred.reject.bind(deferred);
    var stream = fs.createReadStream(file);
    stream.on("error", onerror);
    pngparse.parseStream(stream, function(err, image) {
        if (err) {
            onerror(err);
            return;
        }
        deferred.resolve(image);
    });
    return deferred.promise;
}

// Take a parsed image data structure and apply FFT transformation to it
function fftImage(image) {
    var real = createMatrix();
    var imag = createMatrix();
    var idx = 0;
    var nchan = image.channels;
    var alphachan = 1 - (nchan % 2);
    var colorchan = nchan - alphachan;
    for (var y = 0; y < image.height; ++y) {
        for (var x = 0; x < image.width; ++x) {
            var c;
            var v = 0;
            for (c = 0; c < colorchan; ++c) {
                v += 255 - image.data[idx++];
            }
            for (c = 0; c < alphachan; ++c) {
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
        height: image.height
    };
}

// Create a new matrix of preconfigured dimensions, initialized to zero
function createMatrix() {
    var array = new Float64Array(alignWidth * alignHeight);
    return new Ndarray(array, [alignWidth, alignHeight]);
}
