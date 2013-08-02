function fastContains(list, elem) {
    return list.indexOf(elem) !== -1;
}

function slowContains(list, elem) {
    for (var i = 0; i < list.length; i++) {
        if (list[i] === elem) {
            return true;
        }
    }
    return false;
}

var contains = Array.prototype.indexOf ? fastContains : slowContains;

function isBuggyWebKit() {
    var userAgent = navigator.userAgent.toLowerCase();

    var webkit = (/applewebkit\/(\d+)\.(\d+)/).exec(userAgent);
    if (!webkit) {
        return false;
    }

    var major = +webkit[1];
    var minor = +webkit[2];

    // 537.1 is last buggy, according to Chrome's bisect-builds.py which says:
    //
    // You are probably looking for a change made after 137695 (known bad), but
    // no later than 137702 (first known good).
    // CHANGELOG URL:
    //   http://build.chromium.org/f/chromium/perf/dashboard/ui/changelog.html?url=/trunk/src&range=137695%3A137702
    //
    // Downloading these two builds:
    //   http://commondatastorage.googleapis.com/chromium-browser-snapshots/Mac/137695/chrome-mac.zip
    //   http://commondatastorage.googleapis.com/chromium-browser-snapshots/Mac/137702/chrome-mac.zip
    // verifies this claim. The respective WebKit versions (r117232 and
    // r117456) both are called 537.1 so let's throw out 537.1 as well as
    // everything older.
    //
    // The responsible WebKit changeset appears to be this one:
    //   http://trac.webkit.org/changeset/117339/
    return major < 537 || (major == 537 && minor <= 1);
}

module.exports = {
    contains: contains,
    isBuggyWebKit: isBuggyWebKit()
};
