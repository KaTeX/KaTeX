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

function isSafari() {
    var userAgent = navigator.userAgent.toLowerCase();

    // Steal these regexes from jQuery migrate for browser detection
    var webkit = /(webkit)[ \/]([\w.]+)/.exec(userAgent);
    var chrome = /(chrome)[ \/]([\w.]+)/.exec(userAgent);

    return webkit && !chrome;
}

module.exports = {
    contains: contains,
    isSafari: isSafari()
};
