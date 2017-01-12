/* eslint no-console:0 */
var fs = require("fs");
var path = require("path");

var browserify = require("browserify");
var express = require("express");
var glob = require("glob");
var less = require("less");

var app = express();

if (require.main === module) {
    app.use(require("morgan")(
        ":date[iso] :method :url HTTP/:http-version - :status"));
}

var serveBrowserified = function(file, standaloneName) {
    return function(req, res, next) {
        var files;
        if (Array.isArray(file)) {
            files = file.map(function(f) { return path.join(__dirname, f); });
        } else if (file.indexOf("*") !== -1) {
            files = glob.sync(file, {cwd: __dirname});
        } else {
            files = [path.join(__dirname, file)];
        }

        var options = {};
        if (standaloneName) {
            options.standalone = standaloneName;
        }
        var b = browserify(files, options);
        var stream = b.bundle();

        var body = "";
        stream.on("data", function(s) { body += s; });
        stream.on("error", function(e) { next(e); });
        stream.on("end", function() {
            res.setHeader("Content-Type", "text/javascript");
            res.send(body);
        });
    };
};

app.get("/katex.js", serveBrowserified("katex", "katex"));
app.use("/test/jasmine",
    express["static"](
        path.dirname(
            require.resolve("jasmine-core/lib/jasmine-core/jasmine.js")
        )
    )
);
app.get("/test/katex-spec.js", serveBrowserified("test/*[Ss]pec.js"));
app.get("/contrib/auto-render/auto-render.js",
        serveBrowserified("contrib/auto-render/auto-render",
                          "renderMathInElement"));

app.get("/katex.css", function(req, res, next) {
    var lessfile = path.join(__dirname, "static", "katex.less");
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

app.use(express["static"](path.join(__dirname, "static")));
app.use(express["static"](path.join(__dirname, "build")));
app.use("/test", express["static"](path.join(__dirname, "test")));
app.use("/contrib", express["static"](path.join(__dirname, "contrib")));
// app.use("/unicode-fonts",
//     express["static"](path.join(__dirname, "static", "unicode-fonts")));

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
