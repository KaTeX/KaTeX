/* eslint no-console:0, prefer-spread:0 */
"use strict";

const childProcess = require("child_process");
const fs = require("fs");
const http = require("http");
const jspngopt = require("jspngopt");
const net = require("net");
const os = require("os");
const pako = require("pako");
const path = require("path");
const selenium = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");

const app = require("../../server");
const data = require("../../test/screenshotter/ss_data");

const dstDir = path.normalize(
    path.join(__dirname, "..", "..", "test", "screenshotter", "images"));
const diffDir = path.normalize(
    path.join(__dirname, "..", "..", "test", "screenshotter", "diff"));

//////////////////////////////////////////////////////////////////////
// Process command line arguments

const opts = require("nomnom")
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
    .option("reload", {
        flag: true,
        help: "Reload page for each test",
    })
    .option("verify", {
        flag: true,
        help: "Check whether screenshot matches current file content",
    })
    .option("diff", {
        flag: true,
        help: "With `--verify`, produce image diffs when match fails",
    })
    .option("attempts", {
        help: "Retry this many times before reporting failure",
        "default": 5,
    })
    .option("wait", {
        help: "Wait this many seconds between page load and screenshot",
    })
    .parse();

let listOfCases;
if (opts.include) {
    listOfCases = opts.include.split(",");
} else {
    listOfCases = Object.keys(data);
}
if (opts.exclude) {
    const exclude = opts.exclude.split(",");
    listOfCases = listOfCases.filter(function(key) {
        return exclude.indexOf(key) === -1;
    });
}

let seleniumURL = opts.seleniumURL;
let seleniumIP = opts.seleniumIP;
let seleniumPort = opts.seleniumPort;
let katexURL = opts.katexURL;
let katexIP = opts.katexIP;
let katexPort = opts.katexPort;

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

function cmd() {
    const args = Array.prototype.slice.call(arguments);
    const cmd = args.shift();
    return childProcess.execFileSync(
        cmd, args, { encoding: "utf-8" }).replace(/\n$/, "");
}

function guessDockerIPs() {
    if (process.env.DOCKER_MACHINE_NAME) {
        const machine = process.env.DOCKER_MACHINE_NAME;
        seleniumIP = seleniumIP || cmd("docker-machine", "ip", machine);
        katexIP = katexIP || cmd("docker-machine", "ssh", machine,
            "echo ${SSH_CONNECTION%% *}");
        return;
    }
    try {
        // When using boot2docker, seleniumIP and katexIP are distinct.
        seleniumIP = seleniumIP || cmd("boot2docker", "ip");
        let config = cmd("boot2docker", "config");
        config = (/^HostIP = "(.*)"$/m).exec(config);
        if (!config) {
            console.error("Failed to find HostIP");
            process.exit(2);
        }
        katexIP = katexIP || config[1];
        return;
    } catch (e) {
        // Apparently no boot2docker, continue
    }
    if (!process.env.DOCKER_HOST && os.type() === "Darwin") {
        // Docker for Mac
        seleniumIP = seleniumIP || "localhost";
        katexIP = katexIP || "*any*"; // see findHostIP
        return;
    }
    // Native Docker on Linux or remote Docker daemon or similar
    const gatewayIP = cmd("docker", "inspect",
      "-f", "{{.NetworkSettings.Gateway}}", opts.container);
    seleniumIP = seleniumIP || gatewayIP;
    katexIP = katexIP || gatewayIP;
}

if (!seleniumURL && opts.container) {
    if (!seleniumIP || !katexIP) {
        guessDockerIPs();
    }
    seleniumPort = cmd("docker", "port", opts.container, seleniumPort);
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
let attempts = 0;

//////////////////////////////////////////////////////////////////////
// Start up development server

let devServer = null;
const minPort = 32768;
const maxPort = 61000;

function startServer() {
    if (katexURL || katexPort) {
        process.nextTick(tryConnect);
        return;
    }
    const port = Math.floor(Math.random() * (maxPort - minPort)) + minPort;
    const server = http.createServer(app).listen(port);
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
    if (!seleniumIP) {
        process.nextTick(buildDriver);
        return;
    }
    const sock = net.connect({
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

let driver;
let driverReady = false;
function buildDriver() {
    const builder = new selenium.Builder().forBrowser(opts.browser);
    const ffProfile = new firefox.Profile();
    ffProfile.setPreference(
        "browser.startup.homepage_override.mstone", "ignore");
    ffProfile.setPreference("browser.startup.page", 0);
    const ffOptions = new firefox.Options().setProfile(ffProfile);
    builder.setFirefoxOptions(ffOptions);
    if (seleniumURL) {
        builder.usingServer(seleniumURL);
    }
    driver = builder.build();
    driver.manage().timeouts().setScriptTimeout(3000).then(function() {
        let html = '<!DOCTYPE html>' +
            '<html><head><style type="text/css">html,body{' +
            'width:100%;height:100%;margin:0;padding:0;overflow:hidden;' +
            '}</style></head><body><p>Test</p></body></html>';
        html = "data:text/html," + encodeURIComponent(html);
        return driver.get(html);
    }).then(function() {
        setSize(targetW, targetH);
    });
}

//////////////////////////////////////////////////////////////////////
// Set the screen size

const targetW = 1024;
const targetH = 768;
function setSize(reqW, reqH) {
    return driver.manage().window().setSize(reqW, reqH).then(function() {
        return driver.takeScreenshot();
    }).then(function(img) {
        img = imageDimensions(img);
        const actualW = img.width;
        const actualH = img.height;
        if (actualW === targetW && actualH === targetH) {
            findHostIP();
            return;
        }
        if (++attempts > opts.attempts) {
            throw new Error("Failed to set window size correctly.");
        }
        return setSize(targetW + reqW - actualW, targetH + reqH - actualH);
    }, check);
}

function imageDimensions(img) {
    const buf = new Buffer(img, "base64");
    return {
        buf: buf,
        width: buf.readUInt32BE(16),
        height: buf.readUInt32BE(20),
    };
}

//////////////////////////////////////////////////////////////////////
// Work out how to connect to host KaTeX server

function findHostIP() {
    if (!katexIP) {
        katexIP = "localhost";
    }
    if (katexIP !== "*any*" || katexURL) {
        if (!katexURL) {
            katexURL = "http://" + katexIP + ":" + katexPort + "/";
            console.log("KaTeX URL is " + katexURL);
        }
        process.nextTick(takeScreenshots);
        return;
    }

    // Now we need to find an IP the container can connect to.
    // First, install a server component to get notified of successful connects
    app.get("/ss-connect.js", function(req, res, next) {
        if (!katexURL) {
            katexIP = req.query.ip;
            katexURL = "http://" + katexIP + ":" + katexPort + "/";
            console.log("KaTeX URL is " + katexURL);
            process.nextTick(takeScreenshots);
        }
        res.setHeader("Content-Type", "text/javascript");
        res.send("//OK");
    });

    // Next, enumerate all network addresses
    const ips = [];
    const devs = os.networkInterfaces();
    for (const dev in devs) {
        if (devs.hasOwnProperty(dev)) {
            const addrs = devs[dev];
            for (let i = 0; i < addrs.length; ++i) {
                let addr = addrs[i].address;
                if (/:/.test(addr)) {
                    addr = "[" + addr + "]";
                }
                ips.push(addr);
            }
        }
    }
    console.log("Looking for host IP among " + ips.join(", "));

    // Load a data: URI document which attempts to contact each of these IPs
    let html = "<!doctype html>\n<html><body>\n";
    html += ips.map(function(ip) {
        return '<script src="http://' + ip + ':' + katexPort +
            '/ss-connect.js?ip=' + encodeURIComponent(ip) +
            '" defer></script>';
    }).join("\n");
    html += "\n</body></html>";
    html = "data:text/html," + encodeURIComponent(html);
    driver.get(html);
}

//////////////////////////////////////////////////////////////////////
// Take the screenshots

let countdown = listOfCases.length;

let exitStatus = 0;
const listOfFailed = [];

function takeScreenshots() {
    listOfCases.forEach(takeScreenshot);
}

function takeScreenshot(key) {
    const itm = data[key];
    if (!itm) {
        console.error("Test case " + key + " not known!");
        listOfFailed.push(key);
        if (exitStatus === 0) {
            exitStatus = 1;
        }
        oneDone();
        return;
    }

    let file = path.join(dstDir, key + "-" + opts.browser + ".png");
    let retry = 0;
    let loadExpected = null;
    if (opts.verify) {
        loadExpected = promisify(fs.readFile, file);
    }

    const url = katexURL + "test/screenshotter/test.html?" + itm.query;
    driver.call(loadMath);

    function loadMath() {
        if (!opts.reload && driverReady) {
            driver.executeAsyncScript(
                    "var callback = arguments[arguments.length - 1]; " +
                    "handle_search_string(" +
                    JSON.stringify("?" + itm.query) + ", callback);")
                .then(waitThenScreenshot);
        } else {
            driver.get(url).then(waitThenScreenshot);
        }
    }

    function waitThenScreenshot() {
        driverReady = true;
        if (opts.wait) {
            browserSideWait(1000 * opts.wait);
        }
        const promise = driver.takeScreenshot().then(haveScreenshot);
        if (retry === 0) {
            // The `oneDone` promise remains outstanding if we retry, so
            // don't re-add it
            promise.then(oneDone, check);
        }
    }

    function haveScreenshot(img) {
        img = imageDimensions(img);
        if (img.width !== targetW || img.height !== targetH) {
            throw new Error("Expected " + targetW + " x " + targetH +
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
        const opt = new jspngopt.Optimizer({
            pako: pako,
        });
        const buf = opt.bufferSync(img.buf);
        if (loadExpected) {
            return loadExpected.then(function(expected) {
                if (!buf.equals(expected)) {
                    if (++retry >= opts.attempts) {
                        console.error("FAIL! " + key);
                        listOfFailed.push(key);
                        exitStatus = 3;
                        if (opts.diff) {
                            return saveScreenshotDiff(key, buf);
                        }
                    } else {
                        console.log("error " + key);
                        browserSideWait(300 * retry);
                        if (retry > 1) {
                            driverReady = false; // reload fully
                        }
                        return driver.call(loadMath);
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

    function saveScreenshotDiff(key, buf) {
        const filenamePrefix = key + "-" + opts.browser;
        const baseFile = path.join(dstDir, filenamePrefix + ".png");
        const diffFile = path.join(diffDir, filenamePrefix + "-diff.png");
        const bufFile = path.join(diffDir, filenamePrefix + "-fail.png");

        return promisify(fs.mkdir, diffDir)
            .then(null, function() { }) /* Ignore EEXIST error (XXX & others) */
            .then(function() {
                return promisify(fs.writeFile, bufFile, buf);
            })
            .then(function() {
                return execFile("convert", [
                    "-fill", "white",
                    // First image: saved screenshot in red
                    "(", baseFile, "-colorize", "100,0,0", ")",
                    // Second image: new screenshot in green
                    "(", bufFile, "-colorize", "0,80,0", ")",
                    // Composite them
                    "-compose", "darken", "-composite",
                    "-trim",  // remove everything with the same color as the
                              // corners
                    diffFile, // output file name
                ]);
            })
            .then(function() {
                return promisify(fs.unlink, bufFile);
            });
    }

    function oneDone() {
        if (--countdown === 0) {
            if (listOfFailed.length) {
                console.error("Failed: " + listOfFailed.join(" "));
            }
            // devServer.close(cb) will take too long.
            process.exit(exitStatus);
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
    const args = Array.prototype.slice.call(arguments, 1);
    const deferred = new selenium.promise.Deferred();
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

// Execute a given command, and return a promise to its output.
// Don't denodeify here, since fail branch needs access to stderr.
function execFile(cmd, args, opts) {
    const deferred = new selenium.promise.Deferred();
    childProcess.execFile(cmd, args, opts, function(err, stdout, stderr) {
        if (err) {
            console.error("Error executing " + cmd + " " + args.join(" "));
            console.error(stdout + stderr);
            err.stdout = stdout;
            err.stderr = stderr;
            deferred.reject(err);
        } else {
            deferred.fulfill(stdout);
        }
    });
    return deferred.promise;
}
