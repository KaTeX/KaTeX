(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.renderMathInElement = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _katex2tex = require('./katex2tex');

var _katex2tex2 = _interopRequireDefault(_katex2tex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Global copy handler to modify behavior on .katex elements.
document.addEventListener('copy', function (event) {
    var selection = window.getSelection();
    if (selection.isCollapsed) {
        return; // default action OK if selection is empty
    }
    var fragment = selection.getRangeAt(0).cloneContents();
    if (!fragment.querySelector('.katex-mathml')) {
        return; // default action OK if no .katex-mathml elements
    }
    // Preserve usual HTML copy/paste behavior.
    var html = [];
    for (var i = 0; i < fragment.childNodes.length; i++) {
        html.push(fragment.childNodes[i].outerHTML);
    }
    event.clipboardData.setData('text/html', html.join(''));
    // Rewrite plain-text version.
    event.clipboardData.setData('text/plain', (0, _katex2tex2.default)(fragment).textContent);
    // Prevent normal copy handling.
    event.preventDefault();
});

},{"./katex2tex":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
// Set these to how you want inline and display math to be delimited.
var defaultCopyDelimiters = exports.defaultCopyDelimiters = {
    inline: ['$', '$'], // alternative: ['\(', '\)']
    display: ['$$', '$$'] // alternative: ['\[', '\]']
};

// Replace .katex elements with their TeX source (<annotation> element).
// Modifies fragment in-place.  Useful for writing your own 'copy' handler,
// as in copy-tex.js.
var katexReplaceWithTex = exports.katexReplaceWithTex = function katexReplaceWithTex(fragment) {
    var copyDelimiters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultCopyDelimiters;

    // Remove .katex-html blocks that are preceded by .katex-mathml blocks
    // (which will get replaced below).
    var katexHtml = fragment.querySelectorAll('.katex-mathml + .katex-html');
    for (var i = 0; i < katexHtml.length; i++) {
        var element = katexHtml[i];
        if (element.remove) {
            element.remove(null);
        } else {
            element.parentNode.removeChild(element);
        }
    }
    // Replace .katex-mathml elements with their annotation (TeX source)
    // descendant, with inline delimiters.
    var katexMathml = fragment.querySelectorAll('.katex-mathml');
    for (var _i = 0; _i < katexMathml.length; _i++) {
        var _element = katexMathml[_i];
        var texSource = _element.querySelector('annotation');
        if (texSource) {
            if (_element.replaceWith) {
                _element.replaceWith(texSource);
            } else {
                _element.parentNode.replaceChild(texSource, _element);
            }
            texSource.innerHTML = copyDelimiters.inline[0] + texSource.innerHTML + copyDelimiters.inline[1];
        }
    }
    // Switch display math to display delimiters.
    var displays = fragment.querySelectorAll('.katex-display annotation');
    for (var _i2 = 0; _i2 < displays.length; _i2++) {
        var _element2 = displays[_i2];
        _element2.innerHTML = copyDelimiters.display[0] + _element2.innerHTML.substr(copyDelimiters.inline[0].length, _element2.innerHTML.length - copyDelimiters.inline[0].length - copyDelimiters.inline[1].length) + copyDelimiters.display[1];
    }
    return fragment;
};

exports.default = katexReplaceWithTex;

},{}]},{},[1])(1)
});