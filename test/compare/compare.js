var fs = require("fs");
var exec = require("child_process").exec;
var Promise = require("bluebird");

var start = Date.now();
var tests = JSON.parse(fs.readFileSync("../huxley/Huxleyfile.json"));

var promise = new Promise(function (resolve, reject) {
    resolve();
});

var failures = [];
var colors = {
    red: "\x1B[31m",
    green: "\x1B[32m",
    none: "\x1B[0m"
};

function print(color, text) {
    process.stdout.write(color + text + colors.none);
}

tests.forEach(function (test) {
    var name = test.name;

    promise = promise.then(function () {
        return new Promise(function (resolve, reject) {
            var huxfile = "../huxley/Huxleyfolder/" + name + ".hux/firefox-1.png";
            var reffile = "images/" + name + ".png";

            var cmd = "compare -metric RMSE -subimage-search" +
                " -dissimilarity-threshold 100% " + huxfile + " " + reffile + " null:";

            exec(cmd, function (err, stdout, stderr) {
                if (err || stderr.toString() !== "0 (0) @ 0,0\n") {
                    failures.push({
                        name: name,
                        error: stderr
                    });
                    print(colors.red, "F");
                } else {
                    print(colors.green, ".");
                }
                resolve();
            });
        });
    });
});

promise.then(function () {
    var elapsed = (Date.now() - start) / 1000;
    var failed = failures.length > 0;

    process.stdout.write("\n");   // skip a line before writing errors

    if (failed) {
        console.log("Failures:");
    }
    failures.forEach(function (failure) {
        console.error("'" + failure.name + "' failed with error: " + failure.error);
    });

    console.log("Finished in " + elapsed + " seconds");
    var message = tests.length + " Tests, " + failures.length + " Failures\n";
    if (failed) {
        print(colors.red, message);
    } else {
        print(colors.green, message);
    }

    process.exit(failed ? 1 : 0);
});
