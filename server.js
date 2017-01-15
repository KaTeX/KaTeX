/* eslint no-console:0 */
const fs = require("fs");
const path = require("path");

const babelify = require("babelify");
const browserify = require("browserify");
const express = require("express");
const glob = require("glob");
const less = require("less");

const app = express();

if (require.main === module) {
    app.use(require("morgan")(
        ":date[iso] :method :url HTTP/:http-version - :status"));
}

function serveBrowserified(file, standaloneName, doBabelify) {
    return function(req, res, next) {
        let files;
        if (Array.isArray(file)) {
            files = file.map(function(f) { return path.join(__dirname, f); });
        } else if (file.indexOf("*") !== -1) {
            files = glob.sync(file, {cwd: __dirname});
        } else {
            files = [path.join(__dirname, file)];
        }

        const options = {};
        if (doBabelify) {
            options.transform = [babelify];
        }
        if (standaloneName) {
            options.standalone = standaloneName;
        }
        const b = browserify(files, options);
        const stream = b.bundle();

        let body = "";
        stream.on("data", function(s) { body += s; });
        stream.on("error", function(e) { next(e); });
        stream.on("end", function() {
            res.setHeader("Content-Type", "text/javascript");
            res.send(body);
        });
    };
}

function twoBrowserified(url, file, standaloneName) {
    app.get(url, serveBrowserified(file, standaloneName, false));
    app.get("/babel" + url, serveBrowserified(file, standaloneName, true));
}

function twoUse(url, handler) {
    app.use(url, handler);
    app.use("/babel" + url, handler);
}

function twoStatic(url, file) {
    twoUse(url, express.static(path.join(__dirname, file)));
}

twoBrowserified("/katex.js", "katex", "katex");
twoUse("/test/jasmine", express.static(path.dirname(
    require.resolve("jasmine-core/lib/jasmine-core/jasmine.js"))));
twoBrowserified("/test/katex-spec.js", "test/*[Ss]pec.js");
twoBrowserified(
    "/contrib/auto-render/auto-render.js",
    "contrib/auto-render/auto-render",
    "renderMathInElement");

twoUse("/katex.css", function(req, res, next) {
    const lessfile = path.join(__dirname, "static", "katex.less");
    fs.readFile(lessfile, {encoding: "utf8"}, function(err, data) {
        if (err) {
            next(err);
            return;
        }

        less.render(data, {
            paths: [path.join(__dirname, "static")],
            filename: "katex.less",
        }, function(err, output) {
            if (err) {
                console.error(String(err));
                next(err);
                return;
            }

            res.setHeader("Content-Type", "text/css");
            res.send(output.css);
        });
    });
});

twoStatic("", "static");
twoStatic("", "build");
twoStatic("/test", "test");
twoStatic("/contrib", "contrib");

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.setHeader("Content-Type", "text/plain");
    res.send(500, err.stack);
});

if (require.main === module) {
    app.listen(7936);
    console.log("Serving on http://0.0.0.0:7936/ ...");
}

module.exports = app;
