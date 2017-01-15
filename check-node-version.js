"use strict";

var v = process.version;
v = v.replace(/^v/,"");
v = v.split(".");
v = v.map(function(s){
    return parseInt(s);
});
var a = v[0], b = v[1], c = v[2];
if (a < 6 || (a == 6 && b < 5)) {
    console.error("Node 6.5 or later required for development. " +
                  "Version " + process.version + " found");
    process.exit(1);
} else {
    console.log("OK");
}
