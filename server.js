var fs = require("fs");
var path = require("path");

var browserify = require("browserify");
var express = require("express");
var less = require("less");

var app = express();

app.use(express.logger());

app.get("/katex.js", function(req, res, next) {
    var b = browserify();
    b.add("./katex");

    var stream = b.bundle({standalone: "katex"});

    var body = "";
    stream.on("data", function(s) { body += s; });
    stream.on("error", function(e) { next(e); });
    stream.on("end", function() {
        res.setHeader("Content-Type", "text/javascript");
        res.send(body);
    });
});

app.get("/katex.css", function(req, res, next) {
    fs.readFile("static/katex.less", {encoding: "utf8"}, function(err, data) {
        if (err) {
            next(err);
            return;
        }

        var parser = new less.Parser({
            paths: ["./static"],
            filename: "katex.less"
        });

        parser.parse(data, function(err, tree) {
            if (err) {
                next(err);
                return;
            }

            res.setHeader("Content-Type", "text/css");
            res.send(tree.toCSS());
        });
    });
});

app.get("/test/katex-spec.js", function(req, res, next) {
    var b = browserify();
    b.add("./test/katex-spec");

    var stream = b.bundle({});

    var body = "";
    stream.on("data", function(s) { body += s; });
    stream.on("error", function(e) { next(e); });
    stream.on("end", function() {
        res.setHeader("Content-Type", "text/javascript");
        res.send(body);
    });
});

app.use(express.static(path.join(__dirname, "static")));
app.use(express.static(path.join(__dirname, "build")));
app.use("/test", express.static(path.join(__dirname, "test")));

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.setHeader("Content-Type", "text/plain");
    res.send(500, err.stack);
});

app.listen(7936);
console.log("Serving on http://0.0.0.0:7936/ ...");
