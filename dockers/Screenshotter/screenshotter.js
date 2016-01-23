/* eslint no-console:0, prefer-spread:0 */
"use strict";

var childProcess = require("child_process");
var fs = require("fs");
var http = require("http");
var jspngopt = require("jspngopt");
var net = require("net");
var pako = require("pako");
var path = require("path");
var selenium = require("selenium-webdriver");
var firefox = require("selenium-webdriver/firefox");

var app = require("../../server");
var data = require("../../test/screenshotter/ss_data");

var dstDir = path.normalize(
    path.join(__dirname, "..", "..", "test", "screenshotter", "images"));

//////////////////////////////////////////////////////////////////////
// Process command line arguments

var opts = require("nomnom")
    .option("browser", {
        abbr: "b",
        "default": "firefox",
        help: "Name of the browser to use",
    })
    .option("container", {
        abbr: "c",
        type: "string",
        help: "Name or ID of a running docker container to contact",
    })
    .option("seleniumURL", {
        full: "selenium-url",
        help: "Full URL of the Selenium web driver",
    })
    .option("seleniumIP", {
        full: "selenium-ip",
        help: "IP address of the Selenium web driver",
    })
    .option("seleniumPort", {
        full: "selenium-port",
        "default": 4444,
        help: "Port number of the Selenium web driver",
    })
    .option("katexURL", {
        full: "katex-url",
        help: "Full URL of the KaTeX development server",
    })
    .option("katexIP", {
        full: "katex-ip",
        "default": "localhost",
        help: "Full URL of the KaTeX development server",
    })
    .option("katexPort", {
        full: "katex-port",
        help: "Port number of the KaTeX development server",
    })
    .option("include", {
        abbr: "i",
        help: "Comma-separated list of test cases to process",
    })
    .option("exclude", {
        abbr: "x",
        help: "Comma-separated list of test cases to exclude",
    })
    .option("verify", {
        flag: true,
        help: "Check whether screenshot matches current file content",
    })
    .parse();

var listOfCases;
if (opts.include) {
    listOfCases = opts.include.split(",");
} else {
    listOfCases = Object.keys(data);
}
if (opts.exclude) {
    var exclude = opts.exclude.split(",");
    listOfCases = listOfCases.filter(function(key) {
        return exclude.indexOf(key) === -1;
    });
}

var seleniumURL = opts.seleniumURL;
var seleniumIP = opts.seleniumIP;
var seleniumPort = opts.seleniumPort;
var katexURL = opts.katexURL;
var katexIP = opts.katexIP;
var katexPort = opts.katexPort;

//////////////////////////////////////////////////////////////////////
// Work out connection to selenium docker container

function check(err) {
    if (!err) {
        return;
    }
    console.error(err);
    console.error(err.stack);
    process.exit(1);
}

function dockerCmd() {
    var args = Array.prototype.slice.call(arguments);
    return childProcess.execFileSync(
        "docker", args, { encoding: "utf-8" }).replace(/\n$/, "");
}

if (!seleniumURL && opts.container) {
    try {
        // When using boot2docker, seleniumIP and katexIP are distinct.
        seleniumIP = childProcess.execFileSync(
            "boot2docker", ["ip"], { encoding: "utf-8" }).replace(/\n$/, "");
        var config = childProcess.execFileSync(
            "boot2docker", ["config"], { encoding: "utf-8" });
        config = (/^HostIP = "(.*)"$/m).exec(config);
        if (!config) {
            console.error("Failed to find HostIP");
            process.exit(2);
        }
        katexIP = config[1];
    } catch (e) {
        seleniumIP = katexIP = dockerCmd(
            "inspect", "-f", "{{.NetworkSettings.Gateway}}", opts.container);
    }
    seleniumPort = dockerCmd("port", opts.container, seleniumPort);
    seleniumPort = seleniumPort.replace(/^.*:/, "");
}
if (!seleniumURL && seleniumIP) {
    seleniumURL = "http://" + seleniumIP + ":" + seleniumPort + "/wd/hub";
}
if (seleniumURL) {
    console.log("Selenium driver at " + seleniumURL);
} else {
    console.log("Selenium driver in local session");
}

process.nextTick(startServer);
var attempts = 0;

//////////////////////////////////////////////////////////////////////
// Start up development server

var devServer = null;
var minPort = 32768;
var maxPort = 61000;

function startServer() {
    if (katexURL || katexPort) {
        process.nextTick(tryConnect);
        return;
    }
    var port = Math.floor(Math.random() * (maxPort - minPort)) + minPort;
    var server = http.createServer(app).listen(port);
    server.once("listening", function() {
        devServer = server;
        katexPort = port;
        attempts = 0;
        process.nextTick(tryConnect);
    });
    server.on("error", function(err) {
        if (devServer !== null) { // error after we started listening
            throw err;
        } else if (++attempts > 50) {
            throw new Error("Failed to start up dev server");
        } else {
            process.nextTick(startServer);
        }
    });
}

//////////////////////////////////////////////////////////////////////
// Wait for container to become ready

function tryConnect() {
    if (!katexURL) {
        katexURL = "http://" + katexIP + ":" + katexPort + "/";
        console.log("KaTeX URL is " + katexURL);
    }
    if (!seleniumIP) {
        process.nextTick(buildDriver);
        return;
    }
    var sock = net.connect({
        host: seleniumIP,
        port: +seleniumPort,
    });
    sock.on("connect", function() {
        sock.end();
        attempts = 0;
        process.nextTick(buildDriver);
    }).on("error", function() {
        if (++attempts > 50) {
            throw new Error("Failed to connect selenium server.");
        }
        setTimeout(tryConnect, 200);
    });
}

//////////////////////////////////////////////////////////////////////
// Build the web driver

var driver;
function buildDriver() {
    var builder = new selenium.Builder().forBrowser(opts.browser);
    var ffProfile = new firefox.Profile();
    ffProfile.setPreference(
        "browser.startup.homepage_override.mstone", "ignore");
    ffProfile.setPreference("browser.startup.page", 0);
    var ffOptions = new firefox.Options().setProfile(ffProfile);
    builder.setFirefoxOptions(ffOptions);
    if (seleniumURL) {
        builder.usingServer(seleniumURL);
    }
    driver = builder.build();
    driver.manage().timeouts().setScriptTimeout(3000).then(function() {
        setSize(targetW, targetH);
    });
}

//////////////////////////////////////////////////////////////////////
// Set the screen size

var targetW = 1024;
var targetH = 768;
function setSize(reqW, reqH) {
    return driver.manage().window().setSize(reqW, reqH).then(function() {
        return driver.takeScreenshot();
    }).then(function(img) {
        img = imageDimensions(img);
        var actualW = img.width;
        var actualH = img.height;
        if (actualW === targetW && actualH === targetH) {
            process.nextTick(takeScreenshots);
            return;
        }
        if (++attempts > 5) {
            throw new Error("Failed to set window size correctly.");
        }
        return setSize(targetW + reqW - actualW, targetH + reqH - actualH);
    }, check);
}

function imageDimensions(img) {
    var buf = new Buffer(img, "base64");
    return {
        buf: buf,
        width: buf.readUInt32BE(16),
        height: buf.readUInt32BE(20),
    };
}

//////////////////////////////////////////////////////////////////////
// Take the screenshots

var countdown = listOfCases.length;

var exitStatus = 0;
var listOfFailed = [];

function takeScreenshots() {
    listOfCases.forEach(takeScreenshot);
}

function takeScreenshot(key) {
    var itm = data[key];
    if (!itm) {
        console.error("Test case " + key + " not known!");
        return;
    }

    var file = path.join(dstDir, key + "-" + opts.browser + ".png");
    var retry = 0;
    var loadExpected = null;
    if (opts.verify) {
        loadExpected = promisify(fs.readFile, file);
    }

    var url = katexURL + "test/screenshotter/test.html?" + itm.query;
    driver.get(url);
    driver.takeScreenshot().then(haveScreenshot).then(function() {
        if (--countdown === 0) {
            if (listOfFailed.length) {
                console.error("Failed: " + listOfFailed.join(" "));
            }
            // devServer.close(cb) will take too long.
            process.exit(exitStatus);
        }
    }, check);

    function haveScreenshot(img) {
        img = imageDimensions(img);
        if (img.width !== targetW || img.height !== targetH) {
            throw new Error("Excpected " + targetW + " x " + targetH +
                            ", got " + img.width + "x" + img.height);
        }
        if (key === "Lap" && opts.browser === "firefox" &&
            img.buf[0x32] === 0xf8) {
            /* There is some strange non-determinism with this case,
             * causing slight vertical shifts.  The first difference
             * is at offset 0x32, where one file has byte 0xf8 and
             * the other has something else.  By using a different
             * output file name for one of these cases, we accept both.
             */
            key += "_alt";
            file = path.join(dstDir, key + "-" + opts.browser + ".png");
            if (loadExpected) {
                loadExpected = promisify(fs.readFile, file);
            }
        }
        var opt = new jspngopt.Optimizer({
            pako: pako,
        });
        var buf = opt.bufferSync(img.buf);
        if (loadExpected) {
            return loadExpected.then(function(expected) {
                if (!buf.equals(expected)) {
                    if (++retry === 5) {
                        console.error("FAIL! " + key);
                        listOfFailed.push(key);
                        exitStatus = 3;
                    } else {
                        console.log("error " + key);
                        driver.get(url);
                        browserSideWait(500 * retry);
                        return driver.takeScreenshot().then(haveScreenshot);
                    }
                } else {
                    console.log("* ok  " + key);
                }
            });
        } else {
            return promisify(fs.writeFile, file, buf).then(function() {
                console.log(key);
            });
        }
    }
}

// Wait using a timeout call in the browser, to ensure that the wait
// time doesn't start before the page has reportedly been loaded.
function browserSideWait(milliseconds) {
    // The last argument (arguments[1] here) is the callback to selenium
    return driver.executeAsyncScript(
        "window.setTimeout(arguments[1], arguments[0]);",
        milliseconds);
}

// Turn node callback style into a call returning a promise,
// like Q.nfcall but using Selenium promises instead of Q ones.
// Second and later arguments are passed to the function named in the
// first argument, and a callback is added as last argument.
function promisify(f) {
    var args = Array.prototype.slice.call(arguments, 1);
    var deferred = new selenium.promise.Deferred();
    args.push(function(err, val) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.fulfill(val);
        }
    });
    f.apply(null, args);
    return deferred.promise;
}
