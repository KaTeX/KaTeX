// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
        if ( this === undefined || this === null ) {
            throw new TypeError( '"this" is null or not defined' );
        }

        var length = this.length >>> 0; // Hack to convert object.length to a UInt32

        fromIndex = +fromIndex || 0;

        if (Math.abs(fromIndex) === Infinity) {
            fromIndex = 0;
        }

        if (fromIndex < 0) {
            fromIndex += length;
            if (fromIndex < 0) {
                fromIndex = 0;
            }
        }

        for (;fromIndex < length; fromIndex++) {
            if (this[fromIndex] === searchElement) {
                return fromIndex;
            }
        }

        return -1;
    };
}

var contains = function(list, elem) {
    return list.indexOf(elem) !== -1;
};

var setTextContent;

var testNode = document.createElement("span");
if ("textContent" in testNode) {
    setTextContent = function(node, text) {
        node.textContent = text;
    };
} else {
    setTextContent = function(node, text) {
        node.innerText = text;
    };
}

function clearNode(node) {
    setTextContent(node, "");
}

module.exports = {
    contains: contains,
    setTextContent: setTextContent,
    clearNode: clearNode
};
