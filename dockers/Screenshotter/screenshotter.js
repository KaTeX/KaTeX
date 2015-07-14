"use strict";

var childProcess = require("child_process");
var fs = require("fs");
var path = require("path");
var net = require("net");
var selenium = require("selenium-webdriver");

var data = require("../../test/screenshotter/ss_data.json");

var dstDir = path.normalize(
    path.join(__dirname, "..", "..", "test", "screenshotter", "images"));

//////////////////////////////////////////////////////////////////////
// Process command line arguments

var opts = require("nomnom")
    .option("browser", {
        abbr: "b",
        "default": "firefox",
        help: "Name of the browser to use"
    })
    .option("container", {
        abbr: "c",
        type: "string",
        help: "Name or ID of a running docker container to contact"
    })
    .option("seleniumURL", {
        full: "selenium-url",
        help: "Full URL of the Selenium web driver"
    })
    .option("seleniumIP", {
        full: "selenium-ip",
        help: "IP address of the Selenium web driver"
    })
    .option("seleniumPort", {
        full: "selenium-port",
        "default": 4444,
        help: "Port number of the Selenium web driver"
    })
    .option("katexURL", {
        full: "katex-url",
        help: "Full URL of the KaTeX development server"
    })
    .option("katexIP", {
        full: "katex-ip",
        "default": "localhost",
        help: "Full URL of the KaTeX development server"
    })
    .option("katexPort", {
        full: "katex-port",
        "default": 7936,
        help: "Port number of the KaTeX development server"
    })
    .option("include", {
        abbr: "i",
        help: "Comma-separated list of test cases to process"
    })
    .option("exclude", {
        abbr: "x",
        help: "Comma-separated list of test cases to exclude"
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
var katexURL = opts.katexURL;
var seleniumIP = opts.seleniumIP;
var seleniumPort = opts.seleniumPort;
var katexIP = opts.katexIP;

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
    } catch(e) {
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

if (!katexURL) {
    katexURL = "http://" + katexIP + ":" + opts.katexPort + "/";
}
var toStrip = "http://localhost:7936/"; // remove this from testcase URLs

//////////////////////////////////////////////////////////////////////
// Wait for container to become ready

var attempts = 0;
process.nextTick(seleniumIP ? tryConnect : buildDriver);
function tryConnect() {
    var sock = net.connect({
        host: seleniumIP,
        port: +seleniumPort
    });
    sock.on("connect", function() {
        sock.end();
        attempts = 0;
        setTimeout(buildDriver, 0);
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
    if (seleniumURL) {
        builder.usingServer(seleniumURL);
    }
    driver = builder.build();
    setSize(targetW, targetH);
}

//////////////////////////////////////////////////////////////////////
// Set the screen size

var targetW = 1024, targetH = 768;
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
        height: buf.readUInt32BE(20)
    };
}

//////////////////////////////////////////////////////////////////////
// Take the screenshots

function takeScreenshots() {
    listOfCases.forEach(takeScreenshot);
}

function takeScreenshot(key) {
    var url = data[key];
    if (!url) {
        console.error("Test case " + key + " not known!");
        return;
    }
    url = katexURL + url.substr(toStrip.length);
    driver.get(url);
    driver.takeScreenshot().then(function haveScreenshot(img) {
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
        }
        var file = path.join(dstDir, key + "-" + opts.browser + ".png");
        fs.writeFile(file, img.buf, check);
        console.log(key);
    }, check);
}
