(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__copy_tex_css__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__copy_tex_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__copy_tex_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__katex2tex__ = __webpack_require__(2);



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
    event.clipboardData.setData('text/plain', Object(__WEBPACK_IMPORTED_MODULE_1__katex2tex__["a" /* default */])(fragment).textContent);
    // Prevent normal copy handling.
    event.preventDefault();
});

/***/ }),
/* 1 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export defaultCopyDelimiters */
/* unused harmony export katexReplaceWithTex */
// Set these to how you want inline and display math to be delimited.
var defaultCopyDelimiters = {
    inline: ['$', '$'], // alternative: ['\(', '\)']
    display: ['$$', '$$'] // alternative: ['\[', '\]']
};

// Replace .katex elements with their TeX source (<annotation> element).
// Modifies fragment in-place.  Useful for writing your own 'copy' handler,
// as in copy-tex.js.
var katexReplaceWithTex = function katexReplaceWithTex(fragment) {
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

/* harmony default export */ __webpack_exports__["a"] = (katexReplaceWithTex);

/***/ })
/******/ ])["default"];
});