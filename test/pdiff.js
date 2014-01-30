var fs = require('fs'),
    gm = require('gm'),
    path = require('path');

var original = path.join(__dirname, 'pdiff.png'),
    modified = path.join(__dirname, '../build/pdiff.png'),
    difference = path.join(__dirname, '../build/DIFF.png');

var colors = {
    reset: "\033[0m",
    red: "\033[31m",
    green: "\033[32m"
};

function log(message, color) {
    console.log(color + message + colors.reset);
}

gm.compare(original, modified, /* tolerance */ 0, function(err, isEqual) {
    if (err) {
        console.error(err);
    } else if (isEqual) {
        log("No perceptible differences.", colors.green);
        // Remove any previously generated difference images
        fs.unlink(difference, function() {});
    } else {
        log("Perceptible difference detected! See build/DIFF.png", colors.red);
        // Generate new difference image
        gm.compare(original, modified, {
            /* output */ file: difference
        }, function(err) {
            if (err) {
                console.error(err);
            }
        });
    }
});