var nativeIndexOf = Array.prototype.indexOf;
var indexOf = function(list, elem) {
    if (list == null) {
        return -1;
    }
    if (nativeIndexOf && list.indexOf === nativeIndexOf) {
        return list.indexOf(elem);
    }
    var i = 0, l = list.length;
    for (; i < l; i++) {
        if (list[i] === elem) {
            return i;
        }
    }
    return -1;
};

var contains = function(list, elem) {
    return indexOf(list, elem) !== -1;
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
    indexOf: indexOf,
    setTextContent: setTextContent,
    clearNode: clearNode
};
