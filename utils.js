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
