var path = require("path");

var browserify = require("browserify");
var express = require("express");

var jisonify = require("./jisonify");

var app = express();

app.use(express.logger());

app.get("/MJLite.js", function(req, res) {
    var b = browserify();
    b.add("./MJLite");
    b.transform(jisonify);

    var stream = b.bundle({standalone: "MJLite"});
    var body = "";
    stream.on("data", function(s) { body += s; });
    stream.on("end", function() {
        res.setHeader("Content-Type", "text/javascript");
        res.send(body);
    });
});

app.use(express.static(path.join(__dirname, 'static')));

app.listen(7936);
console.log("Serving on http://0.0.0.0:7936/ ...");
