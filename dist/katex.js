(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.katex = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _ParseError = require("./src/ParseError");

var _ParseError2 = _interopRequireDefault(_ParseError);

var _Settings = require("./src/Settings");

var _Settings2 = _interopRequireDefault(_Settings);

var _buildTree = require("./src/buildTree");

var _parseTree = require("./src/parseTree");

var _parseTree2 = _interopRequireDefault(_parseTree);

var _utils = require("./src/utils");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Parse and build an expression, and place that expression in the DOM node
 * given.
 */
var render = function render(expression, baseNode, options) {
    _utils2.default.clearNode(baseNode);
    var node = renderToDomTree(expression, options).toNode();
    baseNode.appendChild(node);
};

// KaTeX's styles don't work properly in quirks mode. Print out an error, and
// disable rendering.

/* eslint no-console:0 */
/**
 * This is the main entry point for KaTeX. Here, we expose functions for
 * rendering expressions either to DOM nodes or to markup strings.
 *
 * We also expose the ParseError class to check if errors thrown from KaTeX are
 * errors in the expression, or errors in javascript handling.
 */

if (typeof document !== "undefined") {
    if (document.compatMode !== "CSS1Compat") {
        typeof console !== "undefined" && console.warn("Warning: KaTeX doesn't work in quirks mode. Make sure your " + "website has a suitable doctype.");

        render = function render() {
            throw new _ParseError2.default("KaTeX doesn't work in quirks mode.");
        };
    }
}

/**
 * Parse and build an expression, and return the markup for that.
 */
var renderToString = function renderToString(expression, options) {
    var markup = renderToDomTree(expression, options).toMarkup();
    return markup;
};

/**
 * Parse an expression and return the parse tree.
 */
var generateParseTree = function generateParseTree(expression, options) {
    var settings = new _Settings2.default(options);
    return (0, _parseTree2.default)(expression, settings);
};

/**
 * Generates and returns the katex build tree. This is used for advanced
 * use cases (like rendering to custom output).
 */
var renderToDomTree = function renderToDomTree(expression, options) {
    var settings = new _Settings2.default(options);
    var tree = (0, _parseTree2.default)(expression, settings);
    return (0, _buildTree.buildTree)(tree, expression, settings);
};

/**
 * Generates and returns the katex build tree, with just HTML (no MathML).
 * This is used for advanced use cases (like rendering to custom output).
 */
var renderToHTMLTree = function renderToHTMLTree(expression, options) {
    var settings = new _Settings2.default(options);
    var tree = (0, _parseTree2.default)(expression, settings);
    return (0, _buildTree.buildHTMLTree)(tree, expression, settings);
};

module.exports = {
    /**
     * Renders the given LaTeX into an HTML+MathML combination, and adds
     * it as a child to the specified DOM node.
     */
    render: render,
    /**
     * Renders the given LaTeX into an HTML+MathML combination string,
     * for sending to the client.
     */
    renderToString: renderToString,
    /**
     * KaTeX error, usually during parsing.
     */
    ParseError: _ParseError2.default,
    /**
     * Parses the given LaTeX into KaTeX's internal parse tree structure,
     * without rendering to HTML or MathML.
     *
     * NOTE: This method is not currently recommended for public use.
     * The internal tree representation is unstable and is very likely
     * to change. Use at your own risk.
     */
    __parse: generateParseTree,
    /**
     * Renders the given LaTeX into an HTML+MathML internal DOM tree
     * representation, without flattening that representation to a string.
     *
     * NOTE: This method is not currently recommended for public use.
     * The internal tree representation is unstable and is very likely
     * to change. Use at your own risk.
     */
    __renderToDomTree: renderToDomTree,
    /**
     * Renders the given LaTeX into an HTML internal DOM tree representation,
     * without MathML and without flattening that representation to a string.
     *
     * NOTE: This method is not currently recommended for public use.
     * The internal tree representation is unstable and is very likely
     * to change. Use at your own risk.
     */
    __renderToHTMLTree: renderToHTMLTree
};

},{"./src/ParseError":84,"./src/Settings":87,"./src/buildTree":94,"./src/parseTree":125,"./src/utils":133}],2:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/array/from"), __esModule: true };
},{"core-js/library/fn/array/from":12}],3:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":13}],4:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/is-iterable"), __esModule: true };
},{"core-js/library/fn/is-iterable":14}],5:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/json/stringify"), __esModule: true };
},{"core-js/library/fn/json/stringify":15}],6:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":16}],7:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/freeze"), __esModule: true };
},{"core-js/library/fn/object/freeze":17}],8:[function(require,module,exports){
"use strict";

exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
},{}],9:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = require("../core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
},{"../core-js/object/define-property":6}],10:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _isIterable2 = require("../core-js/is-iterable");

var _isIterable3 = _interopRequireDefault(_isIterable2);

var _getIterator2 = require("../core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = (0, _getIterator3.default)(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if ((0, _isIterable3.default)(Object(arr))) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();
},{"../core-js/get-iterator":3,"../core-js/is-iterable":4}],11:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _from = require("../core-js/array/from");

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  } else {
    return (0, _from2.default)(arr);
  }
};
},{"../core-js/array/from":2}],12:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/es6.array.from');
module.exports = require('../../modules/_core').Array.from;
},{"../../modules/_core":24,"../../modules/es6.array.from":73,"../../modules/es6.string.iterator":77}],13:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.get-iterator');
},{"../modules/core.get-iterator":71,"../modules/es6.string.iterator":77,"../modules/web.dom.iterable":78}],14:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.is-iterable');
},{"../modules/core.is-iterable":72,"../modules/es6.string.iterator":77,"../modules/web.dom.iterable":78}],15:[function(require,module,exports){
var core  = require('../../modules/_core')
  , $JSON = core.JSON || (core.JSON = {stringify: JSON.stringify});
module.exports = function stringify(it){ // eslint-disable-line no-unused-vars
  return $JSON.stringify.apply($JSON, arguments);
};
},{"../../modules/_core":24}],16:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc){
  return $Object.defineProperty(it, key, desc);
};
},{"../../modules/_core":24,"../../modules/es6.object.define-property":75}],17:[function(require,module,exports){
require('../../modules/es6.object.freeze');
module.exports = require('../../modules/_core').Object.freeze;
},{"../../modules/_core":24,"../../modules/es6.object.freeze":76}],18:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],19:[function(require,module,exports){
module.exports = function(){ /* empty */ };
},{}],20:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./_is-object":40}],21:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject')
  , toLength  = require('./_to-length')
  , toIndex   = require('./_to-index');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};
},{"./_to-index":62,"./_to-iobject":64,"./_to-length":65}],22:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof')
  , TAG = require('./_wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./_cof":23,"./_wks":69}],23:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],24:[function(require,module,exports){
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],25:[function(require,module,exports){
'use strict';
var $defineProperty = require('./_object-dp')
  , createDesc      = require('./_property-desc');

module.exports = function(object, index, value){
  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};
},{"./_object-dp":50,"./_property-desc":56}],26:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./_a-function":18}],27:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],28:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_fails":32}],29:[function(require,module,exports){
var isObject = require('./_is-object')
  , document = require('./_global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./_global":33,"./_is-object":40}],30:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],31:[function(require,module,exports){
var global    = require('./_global')
  , core      = require('./_core')
  , ctx       = require('./_ctx')
  , hide      = require('./_hide')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , IS_WRAP   = type & $export.W
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE]
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
    , key, own, out;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function(C){
      var F = function(a, b, c){
        if(this instanceof C){
          switch(arguments.length){
            case 0: return new C;
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if(IS_PROTO){
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;
},{"./_core":24,"./_ctx":26,"./_global":33,"./_hide":35}],32:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],33:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],34:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],35:[function(require,module,exports){
var dP         = require('./_object-dp')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_descriptors":28,"./_object-dp":50,"./_property-desc":56}],36:[function(require,module,exports){
module.exports = require('./_global').document && document.documentElement;
},{"./_global":33}],37:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function(){
  return Object.defineProperty(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_descriptors":28,"./_dom-create":29,"./_fails":32}],38:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./_cof":23}],39:[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./_iterators')
  , ITERATOR   = require('./_wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./_iterators":46,"./_wks":69}],40:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],41:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./_an-object":20}],42:[function(require,module,exports){
'use strict';
var create         = require('./_object-create')
  , descriptor     = require('./_property-desc')
  , setToStringTag = require('./_set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./_hide":35,"./_object-create":49,"./_property-desc":56,"./_set-to-string-tag":58,"./_wks":69}],43:[function(require,module,exports){
'use strict';
var LIBRARY        = require('./_library')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , hide           = require('./_hide')
  , has            = require('./_has')
  , Iterators      = require('./_iterators')
  , $iterCreate    = require('./_iter-create')
  , setToStringTag = require('./_set-to-string-tag')
  , getPrototypeOf = require('./_object-gpo')
  , ITERATOR       = require('./_wks')('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"./_export":31,"./_has":34,"./_hide":35,"./_iter-create":42,"./_iterators":46,"./_library":47,"./_object-gpo":52,"./_redefine":57,"./_set-to-string-tag":58,"./_wks":69}],44:[function(require,module,exports){
var ITERATOR     = require('./_wks')('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ return {done: safe = true}; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./_wks":69}],45:[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],46:[function(require,module,exports){
module.exports = {};
},{}],47:[function(require,module,exports){
module.exports = true;
},{}],48:[function(require,module,exports){
var META     = require('./_uid')('meta')
  , isObject = require('./_is-object')
  , has      = require('./_has')
  , setDesc  = require('./_object-dp').f
  , id       = 0;
var isExtensible = Object.isExtensible || function(){
  return true;
};
var FREEZE = !require('./_fails')(function(){
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function(it){
  setDesc(it, META, {value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  }});
};
var fastKey = function(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add metadata
    if(!create)return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function(it, create){
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return true;
    // not necessary to add metadata
    if(!create)return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function(it){
  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY:      META,
  NEED:     false,
  fastKey:  fastKey,
  getWeak:  getWeak,
  onFreeze: onFreeze
};
},{"./_fails":32,"./_has":34,"./_is-object":40,"./_object-dp":50,"./_uid":68}],49:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject    = require('./_an-object')
  , dPs         = require('./_object-dps')
  , enumBugKeys = require('./_enum-bug-keys')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , Empty       = function(){ /* empty */ }
  , PROTOTYPE   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe')
    , i      = enumBugKeys.length
    , lt     = '<'
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty;
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":20,"./_dom-create":29,"./_enum-bug-keys":30,"./_html":36,"./_object-dps":51,"./_shared-key":59}],50:[function(require,module,exports){
var anObject       = require('./_an-object')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , toPrimitive    = require('./_to-primitive')
  , dP             = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"./_an-object":20,"./_descriptors":28,"./_ie8-dom-define":37,"./_to-primitive":67}],51:[function(require,module,exports){
var dP       = require('./_object-dp')
  , anObject = require('./_an-object')
  , getKeys  = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
  return O;
};
},{"./_an-object":20,"./_descriptors":28,"./_object-dp":50,"./_object-keys":54}],52:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has         = require('./_has')
  , toObject    = require('./_to-object')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function(O){
  O = toObject(O);
  if(has(O, IE_PROTO))return O[IE_PROTO];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};
},{"./_has":34,"./_shared-key":59,"./_to-object":66}],53:[function(require,module,exports){
var has          = require('./_has')
  , toIObject    = require('./_to-iobject')
  , arrayIndexOf = require('./_array-includes')(false)
  , IE_PROTO     = require('./_shared-key')('IE_PROTO');

module.exports = function(object, names){
  var O      = toIObject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};
},{"./_array-includes":21,"./_has":34,"./_shared-key":59,"./_to-iobject":64}],54:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = require('./_object-keys-internal')
  , enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};
},{"./_enum-bug-keys":30,"./_object-keys-internal":53}],55:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export')
  , core    = require('./_core')
  , fails   = require('./_fails');
module.exports = function(KEY, exec){
  var fn  = (core.Object || {})[KEY] || Object[KEY]
    , exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
};
},{"./_core":24,"./_export":31,"./_fails":32}],56:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],57:[function(require,module,exports){
module.exports = require('./_hide');
},{"./_hide":35}],58:[function(require,module,exports){
var def = require('./_object-dp').f
  , has = require('./_has')
  , TAG = require('./_wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./_has":34,"./_object-dp":50,"./_wks":69}],59:[function(require,module,exports){
var shared = require('./_shared')('keys')
  , uid    = require('./_uid');
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};
},{"./_shared":60,"./_uid":68}],60:[function(require,module,exports){
var global = require('./_global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./_global":33}],61:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , defined   = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./_defined":27,"./_to-integer":63}],62:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./_to-integer":63}],63:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],64:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject')
  , defined = require('./_defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./_defined":27,"./_iobject":38}],65:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./_to-integer":63}],66:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./_defined":27}],67:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"./_is-object":40}],68:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],69:[function(require,module,exports){
var store      = require('./_shared')('wks')
  , uid        = require('./_uid')
  , Symbol     = require('./_global').Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;
},{"./_global":33,"./_shared":60,"./_uid":68}],70:[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./_classof":22,"./_core":24,"./_iterators":46,"./_wks":69}],71:[function(require,module,exports){
var anObject = require('./_an-object')
  , get      = require('./core.get-iterator-method');
module.exports = require('./_core').getIterator = function(it){
  var iterFn = get(it);
  if(typeof iterFn != 'function')throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};
},{"./_an-object":20,"./_core":24,"./core.get-iterator-method":70}],72:[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').isIterable = function(it){
  var O = Object(it);
  return O[ITERATOR] !== undefined
    || '@@iterator' in O
    || Iterators.hasOwnProperty(classof(O));
};
},{"./_classof":22,"./_core":24,"./_iterators":46,"./_wks":69}],73:[function(require,module,exports){
'use strict';
var ctx            = require('./_ctx')
  , $export        = require('./_export')
  , toObject       = require('./_to-object')
  , call           = require('./_iter-call')
  , isArrayIter    = require('./_is-array-iter')
  , toLength       = require('./_to-length')
  , createProperty = require('./_create-property')
  , getIterFn      = require('./core.get-iterator-method');

$export($export.S + $export.F * !require('./_iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = toObject(arrayLike)
      , C       = typeof this == 'function' ? this : Array
      , aLen    = arguments.length
      , mapfn   = aLen > 1 ? arguments[1] : undefined
      , mapping = mapfn !== undefined
      , index   = 0
      , iterFn  = getIterFn(O)
      , length, result, step, iterator;
    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for(result = new C(length); length > index; index++){
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"./_create-property":25,"./_ctx":26,"./_export":31,"./_is-array-iter":39,"./_iter-call":41,"./_iter-detect":44,"./_to-length":65,"./_to-object":66,"./core.get-iterator-method":70}],74:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables')
  , step             = require('./_iter-step')
  , Iterators        = require('./_iterators')
  , toIObject        = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"./_add-to-unscopables":19,"./_iter-define":43,"./_iter-step":45,"./_iterators":46,"./_to-iobject":64}],75:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', {defineProperty: require('./_object-dp').f});
},{"./_descriptors":28,"./_export":31,"./_object-dp":50}],76:[function(require,module,exports){
// 19.1.2.5 Object.freeze(O)
var isObject = require('./_is-object')
  , meta     = require('./_meta').onFreeze;

require('./_object-sap')('freeze', function($freeze){
  return function freeze(it){
    return $freeze && isObject(it) ? $freeze(meta(it)) : it;
  };
});
},{"./_is-object":40,"./_meta":48,"./_object-sap":55}],77:[function(require,module,exports){
'use strict';
var $at  = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./_iter-define":43,"./_string-at":61}],78:[function(require,module,exports){
require('./es6.array.iterator');
var global        = require('./_global')
  , hide          = require('./_hide')
  , Iterators     = require('./_iterators')
  , TO_STRING_TAG = require('./_wks')('toStringTag');

for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
  var NAME       = collections[i]
    , Collection = global[NAME]
    , proto      = Collection && Collection.prototype;
  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}
},{"./_global":33,"./_hide":35,"./_iterators":46,"./_wks":69,"./es6.array.iterator":74}],79:[function(require,module,exports){
function getRelocatable(re) {
  // In the future, this could use a WeakMap instead of an expando.
  if (!re.__matchAtRelocatable) {
    // Disjunctions are the lowest-precedence operator, so we can make any
    // pattern match the empty string by appending `|()` to it:
    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-patterns
    var source = re.source + '|()';

    // We always make the new regex global.
    var flags = 'g' + (re.ignoreCase ? 'i' : '') + (re.multiline ? 'm' : '') + (re.unicode ? 'u' : '')
    // sticky (/.../y) doesn't make sense in conjunction with our relocation
    // logic, so we ignore it here.
    ;

    re.__matchAtRelocatable = new RegExp(source, flags);
  }
  return re.__matchAtRelocatable;
}

function matchAt(re, str, pos) {
  if (re.global || re.sticky) {
    throw new Error('matchAt(...): Only non-global regexes are supported');
  }
  var reloc = getRelocatable(re);
  reloc.lastIndex = pos;
  var match = reloc.exec(str);
  // Last capturing group is our sentinel that indicates whether the regex
  // matched at the given location.
  if (match[match.length - 1] == null) {
    // Original regex matched.
    match.length = match.length - 1;
    return match;
  } else {
    return null;
  }
}

module.exports = matchAt;
},{}],80:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],81:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.controlWordRegex = exports.combiningDiacriticalMarksEndRegex = undefined;

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _matchAt = require("match-at");

var _matchAt2 = _interopRequireDefault(_matchAt);

var _ParseError = require("./ParseError");

var _ParseError2 = _interopRequireDefault(_ParseError);

var _SourceLocation = require("./SourceLocation");

var _SourceLocation2 = _interopRequireDefault(_SourceLocation);

var _Token = require("./Token");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* The following tokenRegex
 * - matches typical whitespace (but not NBSP etc.) using its first group
 * - matches comments (must have trailing newlines)
 * - does not match any control character \x00-\x1f except whitespace
 * - does not match a bare backslash
 * - matches any ASCII character except those just mentioned
 * - does not match the BMP private use area \uE000-\uF8FF
 * - does not match bare surrogate code units
 * - matches any BMP character except for those just described
 * - matches any valid Unicode surrogate pair
 * - matches a backslash followed by one or more letters
 * - matches a backslash followed by any BMP character, including newline
 * Just because the Lexer matches something doesn't mean it's valid input:
 * If there is no matching function or symbol definition, the Parser will
 * still reject the input.
 */

/**
 * The Lexer class handles tokenizing the input in various ways. Since our
 * parser expects us to be able to backtrack, the lexer allows lexing from any
 * given starting point.
 *
 * Its main exposed function is the `lex` function, which takes a position to
 * lex from and a type of token to lex. It defers to the appropriate `_innerLex`
 * function.
 *
 * The various `_innerLex` functions perform the actual lexing of different
 * kinds.
 */

var commentRegexString = "%[^\n]*[\n]";
var controlWordRegexString = "\\\\[a-zA-Z@]+";
var controlSymbolRegexString = "\\\\[^\uD800-\uDFFF]";
var combiningDiacriticalMarkString = "[\u0300-\u036F]";
var combiningDiacriticalMarksEndRegex = exports.combiningDiacriticalMarksEndRegex = new RegExp(combiningDiacriticalMarkString + "+$");
var tokenRegex = new RegExp("([ \r\n\t]+)|" + ( // whitespace
"(" + commentRegexString) + // comments
"|[!-\\[\\]-\u2027\u202A-\uD7FF\uF900-\uFFFF]" + ( // single codepoint
combiningDiacriticalMarkString + "*") + // ...plus accents
"|[\uD800-\uDBFF][\uDC00-\uDFFF]" + ( // surrogate pair
combiningDiacriticalMarkString + "*") + // ...plus accents
"|\\\\verb\\*([^]).*?\\3" + // \verb*
"|\\\\verb([^*a-zA-Z]).*?\\4" + ( // \verb unstarred
"|" + controlWordRegexString) + ( // \macroName
"|" + controlSymbolRegexString) + // \\, \', etc.
")");

// tokenRegex has no ^ marker, as required by matchAt.
// These regexs are for matching results from tokenRegex,
// so they do have ^ markers.
var controlWordRegex = exports.controlWordRegex = new RegExp("^" + controlWordRegexString);
var commentRegex = new RegExp("^" + commentRegexString);

/** Main Lexer class */

var Lexer = function () {
    function Lexer(input) {
        (0, _classCallCheck3.default)(this, Lexer);

        // Separate accents from characters
        this.input = input;
        this.pos = 0;
    }

    /**
     * This function lexes a single token.
     */


    (0, _createClass3.default)(Lexer, [{
        key: "lex",
        value: function lex() {
            var input = this.input;
            var pos = this.pos;
            if (pos === input.length) {
                return new _Token.Token("EOF", new _SourceLocation2.default(this, pos, pos));
            }
            var match = (0, _matchAt2.default)(tokenRegex, input, pos);
            if (match === null) {
                throw new _ParseError2.default("Unexpected character: '" + input[pos] + "'", new _Token.Token(input[pos], new _SourceLocation2.default(this, pos, pos + 1)));
            }
            var text = match[2] || " ";
            var start = this.pos;
            this.pos += match[0].length;
            var end = this.pos;

            if (commentRegex.test(text)) {
                return this.lex();
            } else {
                return new _Token.Token(text, new _SourceLocation2.default(this, start, end));
            }
        }
    }]);
    return Lexer;
}();

exports.default = Lexer;

},{"./ParseError":84,"./SourceLocation":88,"./Token":90,"babel-runtime/helpers/classCallCheck":8,"babel-runtime/helpers/createClass":9,"match-at":79}],82:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _Lexer = require("./Lexer");

var _Lexer2 = _interopRequireDefault(_Lexer);

var _Token = require("./Token");

var _macros = require("./macros");

var _macros2 = _interopRequireDefault(_macros);

var _ParseError = require("./ParseError");

var _ParseError2 = _interopRequireDefault(_ParseError);

var _objectAssign = require("object-assign");

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MacroExpander = function () {
    function MacroExpander(input, macros, mode) {
        (0, _classCallCheck3.default)(this, MacroExpander);

        this.lexer = new _Lexer2.default(input);
        this.macros = (0, _objectAssign2.default)({}, _macros2.default, macros);
        this.mode = mode;
        this.stack = []; // contains tokens in REVERSE order
    }

    /**
     * Switches between "text" and "math" modes.
     */


    (0, _createClass3.default)(MacroExpander, [{
        key: "switchMode",
        value: function switchMode(newMode) {
            this.mode = newMode;
        }

        /**
         * Returns the topmost token on the stack, without expanding it.
         * Similar in behavior to TeX's `\futurelet`.
         */

    }, {
        key: "future",
        value: function future() {
            if (this.stack.length === 0) {
                this.pushToken(this.lexer.lex());
            }
            return this.stack[this.stack.length - 1];
        }

        /**
         * Remove and return the next unexpanded token.
         */

    }, {
        key: "popToken",
        value: function popToken() {
            this.future(); // ensure non-empty stack
            return this.stack.pop();
        }

        /**
         * Add a given token to the token stack.  In particular, this get be used
         * to put back a token returned from one of the other methods.
         */

    }, {
        key: "pushToken",
        value: function pushToken(token) {
            this.stack.push(token);
        }

        /**
         * Append an array of tokens to the token stack.
         */

    }, {
        key: "pushTokens",
        value: function pushTokens(tokens) {
            var _stack;

            (_stack = this.stack).push.apply(_stack, (0, _toConsumableArray3.default)(tokens));
        }

        /**
         * Consume all following space tokens, without expansion.
         */

    }, {
        key: "consumeSpaces",
        value: function consumeSpaces() {
            for (;;) {
                var token = this.future();
                if (token.text === " ") {
                    this.stack.pop();
                } else {
                    break;
                }
            }
        }

        /**
         * Consume the specified number of arguments from the token stream,
         * and return the resulting array of arguments.
         */

    }, {
        key: "consumeArgs",
        value: function consumeArgs(numArgs) {
            var args = [];
            // obtain arguments, either single token or balanced {…} group
            for (var i = 0; i < numArgs; ++i) {
                this.consumeSpaces(); // ignore spaces before each argument
                var startOfArg = this.popToken();
                if (startOfArg.text === "{") {
                    var arg = [];
                    var depth = 1;
                    while (depth !== 0) {
                        var tok = this.popToken();
                        arg.push(tok);
                        if (tok.text === "{") {
                            ++depth;
                        } else if (tok.text === "}") {
                            --depth;
                        } else if (tok.text === "EOF") {
                            throw new _ParseError2.default("End of input in macro argument", startOfArg);
                        }
                    }
                    arg.pop(); // remove last }
                    arg.reverse(); // like above, to fit in with stack order
                    args[i] = arg;
                } else if (startOfArg.text === "EOF") {
                    throw new _ParseError2.default("End of input expecting macro argument");
                } else {
                    args[i] = [startOfArg];
                }
            }
            return args;
        }

        /**
         * Expand the next token only once if possible.
         *
         * If the token is expanded, the resulting tokens will be pushed onto
         * the stack in reverse order and will be returned as an array,
         * also in reverse order.
         *
         * If not, the next token will be returned without removing it
         * from the stack.  This case can be detected by a `Token` return value
         * instead of an `Array` return value.
         *
         * In either case, the next token will be on the top of the stack,
         * or the stack will be empty.
         *
         * Used to implement `expandAfterFuture` and `expandNextToken`.
         *
         * At the moment, macro expansion doesn't handle delimited macros,
         * i.e. things like those defined by \def\foo#1\end{…}.
         * See the TeX book page 202ff. for details on how those should behave.
         */

    }, {
        key: "expandOnce",
        value: function expandOnce() {
            var topToken = this.popToken();
            var name = topToken.text;
            var isMacro = name.charAt(0) === "\\";
            if (isMacro && _Lexer.controlWordRegex.test(name)) {
                // Consume all spaces after \macro (but not \\, \', etc.)
                this.consumeSpaces();
            }
            if (!this.macros.hasOwnProperty(name)) {
                // Fully expanded
                this.pushToken(topToken);
                return topToken;
            }

            var _getExpansion2 = this._getExpansion(name),
                tokens = _getExpansion2.tokens,
                numArgs = _getExpansion2.numArgs;

            var expansion = tokens;
            if (numArgs) {
                var args = this.consumeArgs(numArgs);
                // paste arguments in place of the placeholders
                expansion = expansion.slice(); // make a shallow copy
                for (var i = expansion.length - 1; i >= 0; --i) {
                    var tok = expansion[i];
                    if (tok.text === "#") {
                        if (i === 0) {
                            throw new _ParseError2.default("Incomplete placeholder at end of macro body", tok);
                        }
                        tok = expansion[--i]; // next token on stack
                        if (tok.text === "#") {
                            // ## → #
                            expansion.splice(i + 1, 1); // drop first #
                        } else if (/^[1-9]$/.test(tok.text)) {
                            var _expansion;

                            // replace the placeholder with the indicated argument
                            (_expansion = expansion).splice.apply(_expansion, [i, 2].concat((0, _toConsumableArray3.default)(args[+tok.text - 1])));
                        } else {
                            throw new _ParseError2.default("Not a valid argument number", tok);
                        }
                    }
                }
            }
            // Concatenate expansion onto top of stack.
            this.pushTokens(expansion);
            return expansion;
        }

        /**
         * Expand the next token only once (if possible), and return the resulting
         * top token on the stack (without removing anything from the stack).
         * Similar in behavior to TeX's `\expandafter\futurelet`.
         * Equivalent to expandOnce() followed by future().
         */

    }, {
        key: "expandAfterFuture",
        value: function expandAfterFuture() {
            this.expandOnce();
            return this.future();
        }

        /**
         * Recursively expand first token, then return first non-expandable token.
         */

    }, {
        key: "expandNextToken",
        value: function expandNextToken() {
            for (;;) {
                var expanded = this.expandOnce();
                // expandOnce returns Token if and only if it's fully expanded.
                if (expanded instanceof _Token.Token) {
                    // \relax stops the expansion, but shouldn't get returned (a
                    // null return value couldn't get implemented as a function).
                    if (expanded.text === "\\relax") {
                        this.stack.pop();
                    } else {
                        return this.stack.pop(); // === expanded
                    }
                }
            }

            // Flow unable to figure out that this pathway is impossible.
            // https://github.com/facebook/flow/issues/4808
            throw new Error(); // eslint-disable-line no-unreachable
        }

        /**
         * Returns the expanded macro as a reversed array of tokens and a macro
         * argument count.
         * Caches macro expansions for those that were defined simple TeX strings.
         */

    }, {
        key: "_getExpansion",
        value: function _getExpansion(name) {
            var definition = this.macros[name];
            var expansion = typeof definition === "function" ? definition(this) : definition;
            if (typeof expansion === "string") {
                var numArgs = 0;
                if (expansion.indexOf("#") !== -1) {
                    var stripped = expansion.replace(/##/g, "");
                    while (stripped.indexOf("#" + (numArgs + 1)) !== -1) {
                        ++numArgs;
                    }
                }
                var bodyLexer = new _Lexer2.default(expansion);
                var tokens = [];
                var tok = bodyLexer.lex();
                while (tok.text !== "EOF") {
                    tokens.push(tok);
                    tok = bodyLexer.lex();
                }
                tokens.reverse(); // to fit in with stack using push and pop
                var expanded = { tokens: tokens, numArgs: numArgs };
                // Cannot cache a macro defined using a function since it relies on
                // parser context.
                if (typeof definition !== "function") {
                    this.macros[name] = expanded;
                }
                return expanded;
            }

            return expansion;
        }
    }]);
    return MacroExpander;
}();
/**
 * This file contains the “gullet” where macros are expanded
 * until only non-macro tokens remain.
 */

exports.default = MacroExpander;

},{"./Lexer":81,"./ParseError":84,"./Token":90,"./macros":123,"babel-runtime/helpers/classCallCheck":8,"babel-runtime/helpers/createClass":9,"babel-runtime/helpers/toConsumableArray":11,"object-assign":80}],83:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _fontMetrics2 = require("./fontMetrics");

var _fontMetrics3 = _interopRequireDefault(_fontMetrics2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sizeStyleMap = [
// Each element contains [textsize, scriptsize, scriptscriptsize].
// The size mappings are taken from TeX with \normalsize=10pt.
[1, 1, 1], // size1: [5, 5, 5]              \tiny
[2, 1, 1], // size2: [6, 5, 5]
[3, 1, 1], // size3: [7, 5, 5]              \scriptsize
[4, 2, 1], // size4: [8, 6, 5]              \footnotesize
[5, 2, 1], // size5: [9, 6, 5]              \small
[6, 3, 1], // size6: [10, 7, 5]             \normalsize
[7, 4, 2], // size7: [12, 8, 6]             \large
[8, 6, 3], // size8: [14.4, 10, 7]          \Large
[9, 7, 6], // size9: [17.28, 12, 10]        \LARGE
[10, 8, 7], // size10: [20.74, 14.4, 12]     \huge
[11, 10, 9]];
/**
 * This file contains information about the options that the Parser carries
 * around with it while parsing. Data is held in an `Options` object, and when
 * recursing, a new `Options` object can be created with the `.with*` and
 * `.reset` functions.
 */

var sizeMultipliers = [
// fontMetrics.js:getFontMetrics also uses size indexes, so if
// you change size indexes, change that function.
0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.2, 1.44, 1.728, 2.074, 2.488];

var sizeAtStyle = function sizeAtStyle(size, style) {
    return style.size < 2 ? size : sizeStyleMap[size - 1][style.size - 1];
};

/**
 * This is the main options class. It contains the current style, size, color,
 * and font.
 *
 * Options objects should not be modified. To create a new Options with
 * different properties, call a `.having*` method.
 */
var Options = function () {
    function Options(data) {
        (0, _classCallCheck3.default)(this, Options);

        this.style = data.style;
        this.color = data.color;
        this.size = data.size || Options.BASESIZE;
        this.textSize = data.textSize || this.size;
        this.phantom = !!data.phantom;
        this.fontFamily = data.fontFamily;
        this.fontWeight = data.fontWeight || '';
        this.fontShape = data.fontShape || '';
        this.sizeMultiplier = sizeMultipliers[this.size - 1];
        this.maxSize = data.maxSize;
        this._fontMetrics = undefined;
    }

    /**
     * Returns a new options object with the same properties as "this".  Properties
     * from "extension" will be copied to the new options object.
     */


    /**
     * The base size index.
     */


    (0, _createClass3.default)(Options, [{
        key: "extend",
        value: function extend(extension) {
            var data = {
                style: this.style,
                size: this.size,
                textSize: this.textSize,
                color: this.color,
                phantom: this.phantom,
                fontFamily: this.fontFamily,
                fontWeight: this.fontWeight,
                fontShape: this.fontShape,
                maxSize: this.maxSize
            };

            for (var key in extension) {
                if (extension.hasOwnProperty(key)) {
                    data[key] = extension[key];
                }
            }

            return new Options(data);
        }

        /**
         * Return an options object with the given style. If `this.style === style`,
         * returns `this`.
         */

    }, {
        key: "havingStyle",
        value: function havingStyle(style) {
            if (this.style === style) {
                return this;
            } else {
                return this.extend({
                    style: style,
                    size: sizeAtStyle(this.textSize, style)
                });
            }
        }

        /**
         * Return an options object with a cramped version of the current style. If
         * the current style is cramped, returns `this`.
         */

    }, {
        key: "havingCrampedStyle",
        value: function havingCrampedStyle() {
            return this.havingStyle(this.style.cramp());
        }

        /**
         * Return an options object with the given size and in at least `\textstyle`.
         * Returns `this` if appropriate.
         */

    }, {
        key: "havingSize",
        value: function havingSize(size) {
            if (this.size === size && this.textSize === size) {
                return this;
            } else {
                return this.extend({
                    style: this.style.text(),
                    size: size,
                    textSize: size
                });
            }
        }

        /**
         * Like `this.havingSize(BASESIZE).havingStyle(style)`. If `style` is omitted,
         * changes to at least `\textstyle`.
         */

    }, {
        key: "havingBaseStyle",
        value: function havingBaseStyle(style) {
            style = style || this.style.text();
            var wantSize = sizeAtStyle(Options.BASESIZE, style);
            if (this.size === wantSize && this.textSize === Options.BASESIZE && this.style === style) {
                return this;
            } else {
                return this.extend({
                    style: style,
                    size: wantSize
                });
            }
        }

        /**
         * Create a new options object with the given color.
         */

    }, {
        key: "withColor",
        value: function withColor(color) {
            return this.extend({
                color: color
            });
        }

        /**
         * Create a new options object with "phantom" set to true.
         */

    }, {
        key: "withPhantom",
        value: function withPhantom() {
            return this.extend({
                phantom: true
            });
        }

        /**
         * Create a new options objects with the give font.
         */

    }, {
        key: "withFontFamily",
        value: function withFontFamily(fontFamily) {
            return this.extend({
                fontFamily: fontFamily || this.fontFamily
            });
        }

        /**
         * Creates a new options object with the given font weight
         */

    }, {
        key: "withFontWeight",
        value: function withFontWeight(fontWeight) {
            return this.extend({
                fontWeight: fontWeight
            });
        }

        /**
         * Creates a new options object with the given font weight
         */

    }, {
        key: "withFontShape",
        value: function withFontShape(fontShape) {
            return this.extend({
                fontShape: fontShape
            });
        }

        /**
         * Return the CSS sizing classes required to switch from enclosing options
         * `oldOptions` to `this`. Returns an array of classes.
         */

    }, {
        key: "sizingClasses",
        value: function sizingClasses(oldOptions) {
            if (oldOptions.size !== this.size) {
                return ["sizing", "reset-size" + oldOptions.size, "size" + this.size];
            } else {
                return [];
            }
        }

        /**
         * Return the CSS sizing classes required to switch to the base size. Like
         * `this.havingSize(BASESIZE).sizingClasses(this)`.
         */

    }, {
        key: "baseSizingClasses",
        value: function baseSizingClasses() {
            if (this.size !== Options.BASESIZE) {
                return ["sizing", "reset-size" + this.size, "size" + Options.BASESIZE];
            } else {
                return [];
            }
        }

        /**
         * Return the font metrics for this size.
         */

    }, {
        key: "fontMetrics",
        value: function fontMetrics() {
            if (!this._fontMetrics) {
                this._fontMetrics = _fontMetrics3.default.getFontMetrics(this.size);
            }
            return this._fontMetrics;
        }

        /**
         * A map of color names to CSS colors.
         * TODO(emily): Remove this when we have real macros
         */

    }, {
        key: "getColor",


        /**
         * Gets the CSS color of the current options object, accounting for the
         * `colorMap`.
         */
        value: function getColor() {
            if (this.phantom) {
                return "transparent";
            } else if (this.color != null && Options.colorMap.hasOwnProperty(this.color)) {
                return Options.colorMap[this.color];
            } else {
                return this.color;
            }
        }
    }]);
    return Options;
}();

Options.BASESIZE = 6;
Options.colorMap = {
    "katex-blue": "#6495ed",
    "katex-orange": "#ffa500",
    "katex-pink": "#ff00af",
    "katex-red": "#df0030",
    "katex-green": "#28ae7b",
    "katex-gray": "gray",
    "katex-purple": "#9d38bd",
    "katex-blueA": "#ccfaff",
    "katex-blueB": "#80f6ff",
    "katex-blueC": "#63d9ea",
    "katex-blueD": "#11accd",
    "katex-blueE": "#0c7f99",
    "katex-tealA": "#94fff5",
    "katex-tealB": "#26edd5",
    "katex-tealC": "#01d1c1",
    "katex-tealD": "#01a995",
    "katex-tealE": "#208170",
    "katex-greenA": "#b6ffb0",
    "katex-greenB": "#8af281",
    "katex-greenC": "#74cf70",
    "katex-greenD": "#1fab54",
    "katex-greenE": "#0d923f",
    "katex-goldA": "#ffd0a9",
    "katex-goldB": "#ffbb71",
    "katex-goldC": "#ff9c39",
    "katex-goldD": "#e07d10",
    "katex-goldE": "#a75a05",
    "katex-redA": "#fca9a9",
    "katex-redB": "#ff8482",
    "katex-redC": "#f9685d",
    "katex-redD": "#e84d39",
    "katex-redE": "#bc2612",
    "katex-maroonA": "#ffbde0",
    "katex-maroonB": "#ff92c6",
    "katex-maroonC": "#ed5fa6",
    "katex-maroonD": "#ca337c",
    "katex-maroonE": "#9e034e",
    "katex-purpleA": "#ddd7ff",
    "katex-purpleB": "#c6b9fc",
    "katex-purpleC": "#aa87ff",
    "katex-purpleD": "#7854ab",
    "katex-purpleE": "#543b78",
    "katex-mintA": "#f5f9e8",
    "katex-mintB": "#edf2df",
    "katex-mintC": "#e0e5cc",
    "katex-grayA": "#f6f7f7",
    "katex-grayB": "#f0f1f2",
    "katex-grayC": "#e3e5e6",
    "katex-grayD": "#d6d8da",
    "katex-grayE": "#babec2",
    "katex-grayF": "#888d93",
    "katex-grayG": "#626569",
    "katex-grayH": "#3b3e40",
    "katex-grayI": "#21242c",
    "katex-kaBlue": "#314453",
    "katex-kaGreen": "#71B307"
};
exports.default = Options;

},{"./fontMetrics":101,"babel-runtime/helpers/classCallCheck":8,"babel-runtime/helpers/createClass":9}],84:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _ParseNode = require("./ParseNode");

var _ParseNode2 = _interopRequireDefault(_ParseNode);

var _Token = require("./Token");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This is the ParseError class, which is the main error thrown by KaTeX
 * functions when something has gone wrong. This is used to distinguish internal
 * errors from errors in the expression that the user provided.
 *
 * If possible, a caller should provide a Token or ParseNode with information
 * about where in the source string the problem occurred.
 */
var ParseError =
// Error position based on passed-in Token or ParseNode.

function ParseError(message, // The error message
token) // An object providing position information
{
    (0, _classCallCheck3.default)(this, ParseError);

    var error = "KaTeX parse error: " + message;
    var start = void 0;

    var loc = token && token.loc;
    if (loc && loc.start <= loc.end) {
        // If we have the input and a position, make the error a bit fancier

        // Get the input
        var input = loc.lexer.input;

        // Prepend some information
        start = loc.start;
        var end = loc.end;
        if (start === input.length) {
            error += " at end of input: ";
        } else {
            error += " at position " + (start + 1) + ": ";
        }

        // Underline token in question using combining underscores
        var underlined = input.slice(start, end).replace(/[^]/g, "$&\u0332");

        // Extract some context from the input and add it to the error
        var left = void 0;
        if (start > 15) {
            left = "…" + input.slice(start - 15, start);
        } else {
            left = input.slice(0, start);
        }
        var right = void 0;
        if (end + 15 < input.length) {
            right = input.slice(end, end + 15) + "…";
        } else {
            right = input.slice(end);
        }
        error += left + underlined + right;
    }

    // Some hackery to make ParseError a prototype of Error
    // See http://stackoverflow.com/a/8460753
    var self = new Error(error);
    self.name = "ParseError";
    // $FlowFixMe
    self.__proto__ = ParseError.prototype;
    // $FlowFixMe
    self.position = start;
    return self;
};

// $FlowFixMe More hackery


ParseError.prototype.__proto__ = Error.prototype;

exports.default = ParseError;

},{"./ParseNode":85,"./Token":90,"babel-runtime/helpers/classCallCheck":8}],85:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _SourceLocation = require("./SourceLocation");

var _SourceLocation2 = _interopRequireDefault(_SourceLocation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The resulting parse tree nodes of the parse tree.
 *
 * It is possible to provide position information, so that a `ParseNode` can
 * fulfill a role similar to a `Token` in error reporting.
 * For details on the corresponding properties see `Token` constructor.
 * Providing such information can lead to better error reporting.
 */
var ParseNode = function ParseNode(type, // type of node, like e.g. "ordgroup"
value, // type-specific representation of the node
mode, // parse mode in action for this node, "math" or "text"
first, // first token or node of the input for
last) // last token or node of the input for this
// node, will default to firstToken if unset
{
    (0, _classCallCheck3.default)(this, ParseNode);

    this.type = type;
    this.value = value;
    this.mode = mode;
    this.loc = _SourceLocation2.default.range(first, last);
};

exports.default = ParseNode;

},{"./SourceLocation":88,"babel-runtime/helpers/classCallCheck":8}],86:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _functions = require("./functions");

var _functions2 = _interopRequireDefault(_functions);

var _environments = require("./environments");

var _environments2 = _interopRequireDefault(_environments);

var _MacroExpander = require("./MacroExpander");

var _MacroExpander2 = _interopRequireDefault(_MacroExpander);

var _symbols = require("./symbols");

var _symbols2 = _interopRequireDefault(_symbols);

var _utils = require("./utils");

var _utils2 = _interopRequireDefault(_utils);

var _units = require("./units");

var _unicodeScripts = require("./unicodeScripts");

var _unicodeAccents = require("./unicodeAccents");

var _unicodeAccents2 = _interopRequireDefault(_unicodeAccents);

var _unicodeSymbols = require("./unicodeSymbols");

var _unicodeSymbols2 = _interopRequireDefault(_unicodeSymbols);

var _ParseNode = require("./ParseNode");

var _ParseNode2 = _interopRequireDefault(_ParseNode);

var _ParseError = require("./ParseError");

var _ParseError2 = _interopRequireDefault(_ParseError);

var _Lexer = require("./Lexer.js");

var _Settings = require("./Settings");

var _Settings2 = _interopRequireDefault(_Settings);

var _Token = require("./Token");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This file contains the parser used to parse out a TeX expression from the
 * input. Since TeX isn't context-free, standard parsers don't work particularly
 * well.
 *
 * The strategy of this parser is as such:
 *
 * The main functions (the `.parse...` ones) take a position in the current
 * parse string to parse tokens from. The lexer (found in Lexer.js, stored at
 * this.lexer) also supports pulling out tokens at arbitrary places. When
 * individual tokens are needed at a position, the lexer is called to pull out a
 * token, which is then used.
 *
 * The parser has a property called "mode" indicating the mode that
 * the parser is currently in. Currently it has to be one of "math" or
 * "text", which denotes whether the current environment is a math-y
 * one or a text-y one (e.g. inside \text). Currently, this serves to
 * limit the functions which can be used in text mode.
 *
 * The main functions then return an object which contains the useful data that
 * was parsed at its given point, and a new position at the end of the parsed
 * data. The main functions can call each other and continue the parsing by
 * using the returned position as a new starting point.
 *
 * There are also extra `.handle...` functions, which pull out some reused
 * functionality into self-contained functions.
 *
 * The earlier functions return ParseNodes.
 * The later functions (which are called deeper in the parse) sometimes return
 * ParsedFuncOrArgOrDollar, which contain a ParseNode as well as some data about
 * whether the parsed object is a function which is missing some arguments, or a
 * standalone object which can be used as an argument to another function.
 */

/* eslint no-constant-condition:0 */
/* eslint no-console:0 */
function newArgument(result, token) {
    return { type: "arg", result: result, token: token };
}

function newFunction(token) {
    return { type: "fn", result: token.text, token: token };
}

function newDollar(token) {
    return { type: "$", result: "$", token: token };
}

function assertFuncOrArg(parsed) {
    if (parsed.type === "$") {
        throw new _ParseError2.default("Unexpected $", parsed.token);
    }
    return parsed;
}

var Parser = function () {
    function Parser(input, settings) {
        (0, _classCallCheck3.default)(this, Parser);

        // Start in math mode
        this.mode = "math";
        // Create a new macro expander (gullet) and (indirectly via that) also a
        // new lexer (mouth) for this parser (stomach, in the language of TeX)
        this.gullet = new _MacroExpander2.default(input, settings.macros, this.mode);
        // Use old \color behavior (same as LaTeX's \textcolor) if requested.
        // We do this after the macros object has been copied by MacroExpander.
        if (settings.colorIsTextColor) {
            this.gullet.macros["\\color"] = "\\textcolor";
        }
        // Store the settings for use in parsing
        this.settings = settings;
        // Count leftright depth (for \middle errors)
        this.leftrightDepth = 0;
    }

    /**
     * Checks a result to make sure it has the right type, and throws an
     * appropriate error otherwise.
     */


    (0, _createClass3.default)(Parser, [{
        key: "expect",
        value: function expect(text) {
            var consume = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            if (this.nextToken.text !== text) {
                throw new _ParseError2.default("Expected '" + text + "', got '" + this.nextToken.text + "'", this.nextToken);
            }
            if (consume) {
                this.consume();
            }
        }

        /**
         * Considers the current look ahead token as consumed,
         * and fetches the one after that as the new look ahead.
         */

    }, {
        key: "consume",
        value: function consume() {
            this.nextToken = this.gullet.expandNextToken();
        }

        /**
         * Switches between "text" and "math" modes.
         */

    }, {
        key: "switchMode",
        value: function switchMode(newMode) {
            this.mode = newMode;
            this.gullet.switchMode(newMode);
        }

        /**
         * Main parsing function, which parses an entire input.
         */

    }, {
        key: "parse",
        value: function parse() {
            // Try to parse the input
            this.consume();
            var parse = this.parseInput();
            return parse;
        }

        /**
         * Parses an entire input tree.
         */

    }, {
        key: "parseInput",
        value: function parseInput() {
            // Parse an expression
            var expression = this.parseExpression(false);
            // If we succeeded, make sure there's an EOF at the end
            this.expect("EOF", false);
            return expression;
        }
    }, {
        key: "parseExpression",


        /**
         * Parses an "expression", which is a list of atoms.
         *
         * `breakOnInfix`: Should the parsing stop when we hit infix nodes? This
         *                 happens when functions have higher precendence han infix
         *                 nodes in implicit parses.
         *
         * `breakOnTokenText`: The text of the token that the expression should end
         *                     with, or `null` if something else should end the
         *                     expression.
         */
        value: function parseExpression(breakOnInfix, breakOnTokenText) {
            var body = [];
            // Keep adding atoms to the body until we can't parse any more atoms (either
            // we reached the end, a }, or a \right)
            while (true) {
                // Ignore spaces in math mode
                if (this.mode === "math") {
                    this.consumeSpaces();
                }
                var lex = this.nextToken;
                if (Parser.endOfExpression.indexOf(lex.text) !== -1) {
                    break;
                }
                if (breakOnTokenText && lex.text === breakOnTokenText) {
                    break;
                }
                if (breakOnInfix && _functions2.default[lex.text] && _functions2.default[lex.text].infix) {
                    break;
                }
                var atom = this.parseAtom(breakOnTokenText);
                if (!atom) {
                    if (!this.settings.throwOnError && lex.text[0] === "\\") {
                        var errorNode = this.handleUnsupportedCmd();
                        body.push(errorNode);
                        continue;
                    }

                    break;
                }
                body.push(atom);
            }
            return this.handleInfixNodes(body);
        }

        /**
         * Rewrites infix operators such as \over with corresponding commands such
         * as \frac.
         *
         * There can only be one infix operator per group.  If there's more than one
         * then the expression is ambiguous.  This can be resolved by adding {}.
         */

    }, {
        key: "handleInfixNodes",
        value: function handleInfixNodes(body) {
            var overIndex = -1;
            var funcName = void 0;

            for (var i = 0; i < body.length; i++) {
                var node = body[i];
                if (node.type === "infix") {
                    if (overIndex !== -1) {
                        throw new _ParseError2.default("only one infix operator per group", node.value.token);
                    }
                    overIndex = i;
                    funcName = node.value.replaceWith;
                }
            }

            if (overIndex !== -1 && funcName) {
                var numerNode = void 0;
                var denomNode = void 0;

                var numerBody = body.slice(0, overIndex);
                var denomBody = body.slice(overIndex + 1);

                if (numerBody.length === 1 && numerBody[0].type === "ordgroup") {
                    numerNode = numerBody[0];
                } else {
                    numerNode = new _ParseNode2.default("ordgroup", numerBody, this.mode);
                }

                if (denomBody.length === 1 && denomBody[0].type === "ordgroup") {
                    denomNode = denomBody[0];
                } else {
                    denomNode = new _ParseNode2.default("ordgroup", denomBody, this.mode);
                }

                var value = this.callFunction(funcName, [numerNode, denomNode], []);
                return [new _ParseNode2.default(value.type, value, this.mode)];
            } else {
                return body;
            }
        }

        // The greediness of a superscript or subscript

    }, {
        key: "handleSupSubscript",


        /**
         * Handle a subscript or superscript with nice errors.
         */
        value: function handleSupSubscript(name) {
            var symbolToken = this.nextToken;
            var symbol = symbolToken.text;
            this.consume();
            this.consumeSpaces(); // ignore spaces before sup/subscript argument
            var group = this.parseGroup();

            if (!group) {
                if (!this.settings.throwOnError && this.nextToken.text[0] === "\\") {
                    return this.handleUnsupportedCmd();
                } else {
                    throw new _ParseError2.default("Expected group after '" + symbol + "'", symbolToken);
                }
            }

            var arg = assertFuncOrArg(group);
            if (arg.type === "fn") {
                // ^ and _ have a greediness, so handle interactions with functions'
                // greediness
                var funcGreediness = _functions2.default[arg.result].greediness;
                if (funcGreediness > Parser.SUPSUB_GREEDINESS) {
                    return this.parseGivenFunction(group);
                } else {
                    throw new _ParseError2.default("Got function '" + arg.result + "' with no arguments " + "as " + name, symbolToken);
                }
            } else {
                return arg.result;
            }
        }

        /**
         * Converts the textual input of an unsupported command into a text node
         * contained within a color node whose color is determined by errorColor
         */

    }, {
        key: "handleUnsupportedCmd",
        value: function handleUnsupportedCmd() {
            var text = this.nextToken.text;
            var textordArray = [];

            for (var i = 0; i < text.length; i++) {
                textordArray.push(new _ParseNode2.default("textord", text[i], "text"));
            }

            var textNode = new _ParseNode2.default("text", {
                body: textordArray,
                type: "text"
            }, this.mode);

            var colorNode = new _ParseNode2.default("color", {
                color: this.settings.errorColor,
                value: [textNode],
                type: "color"
            }, this.mode);

            this.consume();
            return colorNode;
        }

        /**
         * Parses a group with optional super/subscripts.
         */

    }, {
        key: "parseAtom",
        value: function parseAtom(breakOnTokenText) {
            // The body of an atom is an implicit group, so that things like
            // \left(x\right)^2 work correctly.
            var base = this.parseImplicitGroup(breakOnTokenText);

            // In text mode, we don't have superscripts or subscripts
            if (this.mode === "text") {
                return base;
            }

            // Note that base may be empty (i.e. null) at this point.

            var superscript = void 0;
            var subscript = void 0;
            while (true) {
                // Guaranteed in math mode, so eat any spaces first.
                this.consumeSpaces();

                // Lex the first token
                var lex = this.nextToken;

                if (lex.text === "\\limits" || lex.text === "\\nolimits") {
                    // We got a limit control
                    if (!base || base.type !== "op") {
                        throw new _ParseError2.default("Limit controls must follow a math operator", lex);
                    } else {
                        var limits = lex.text === "\\limits";
                        base.value.limits = limits;
                        base.value.alwaysHandleSupSub = true;
                    }
                    this.consume();
                } else if (lex.text === "^") {
                    // We got a superscript start
                    if (superscript) {
                        throw new _ParseError2.default("Double superscript", lex);
                    }
                    superscript = this.handleSupSubscript("superscript");
                } else if (lex.text === "_") {
                    // We got a subscript start
                    if (subscript) {
                        throw new _ParseError2.default("Double subscript", lex);
                    }
                    subscript = this.handleSupSubscript("subscript");
                } else if (lex.text === "'") {
                    // We got a prime
                    if (superscript) {
                        throw new _ParseError2.default("Double superscript", lex);
                    }
                    var prime = new _ParseNode2.default("textord", "\\prime", this.mode);

                    // Many primes can be grouped together, so we handle this here
                    var primes = [prime];
                    this.consume();
                    // Keep lexing tokens until we get something that's not a prime
                    while (this.nextToken.text === "'") {
                        // For each one, add another prime to the list
                        primes.push(prime);
                        this.consume();
                    }
                    // If there's a superscript following the primes, combine that
                    // superscript in with the primes.
                    if (this.nextToken.text === "^") {
                        primes.push(this.handleSupSubscript("superscript"));
                    }
                    // Put everything into an ordgroup as the superscript
                    superscript = new _ParseNode2.default("ordgroup", primes, this.mode);
                } else {
                    // If it wasn't ^, _, or ', stop parsing super/subscripts
                    break;
                }
            }

            if (superscript || subscript) {
                // If we got either a superscript or subscript, create a supsub
                return new _ParseNode2.default("supsub", {
                    base: base,
                    sup: superscript,
                    sub: subscript
                }, this.mode);
            } else {
                // Otherwise return the original body
                return base;
            }
        }

        // A list of the size-changing functions, for use in parseImplicitGroup


        // A list of the style-changing functions, for use in parseImplicitGroup


        // Old font functions

    }, {
        key: "parseImplicitGroup",


        /**
         * Parses an implicit group, which is a group that starts at the end of a
         * specified, and ends right before a higher explicit group ends, or at EOL. It
         * is used for functions that appear to affect the current style, like \Large or
         * \textrm, where instead of keeping a style we just pretend that there is an
         * implicit grouping after it until the end of the group. E.g.
         *   small text {\Large large text} small text again
         * It is also used for \left and \right to get the correct grouping.
         */
        value: function parseImplicitGroup(breakOnTokenText) {
            var start = this.parseSymbol();

            if (start == null) {
                // If we didn't get anything we handle, fall back to parseFunction
                return this.parseFunction();
            } else if (start.type === "arg") {
                // Defer to parseGivenFunction if it's not a function we handle
                return this.parseGivenFunction(start);
            }

            var func = start.result;

            if (func === "$") {
                if (this.mode === "math") {
                    throw new _ParseError2.default("$ within math mode");
                }
                var outerMode = this.mode;
                this.switchMode("math");
                // Expand next symbol now that we're in math mode.
                this.consume();
                var body = this.parseExpression(false, "$");
                // We can't expand the next symbol after the $ until after
                // switching modes back.  So don't consume within expect.
                this.expect("$", false);
                this.switchMode(outerMode);
                this.consume();
                return new _ParseNode2.default("styling", {
                    style: "text",
                    value: body
                }, "math");
            } else if (func === "\\left") {
                // If we see a left:
                // Parse the entire left function (including the delimiter)
                var left = this.parseGivenFunction(start);
                // Parse out the implicit body
                ++this.leftrightDepth;
                var _body = this.parseExpression(false);
                --this.leftrightDepth;
                // Check the next token
                this.expect("\\right", false);
                var right = this.parseFunction();
                if (!right) {
                    throw new _ParseError2.default('failed to parse function after \\right');
                }
                return new _ParseNode2.default("leftright", {
                    body: _body,
                    left: left.value.value,
                    right: right.value.value
                }, this.mode);
            } else if (func === "\\begin") {
                // begin...end is similar to left...right
                var begin = this.parseGivenFunction(start);
                var envName = begin.value.name;
                if (!_environments2.default.hasOwnProperty(envName)) {
                    throw new _ParseError2.default("No such environment: " + envName, begin.value.nameGroup);
                }
                // Build the environment object. Arguments and other information will
                // be made available to the begin and end methods using properties.
                var env = _environments2.default[envName];

                var _parseArguments = this.parseArguments("\\begin{" + envName + "}", env),
                    args = _parseArguments.args,
                    optArgs = _parseArguments.optArgs;

                var context = {
                    mode: this.mode,
                    envName: envName,
                    parser: this
                };
                var _result = env.handler(context, args, optArgs);
                this.expect("\\end", false);
                var endNameToken = this.nextToken;
                var end = this.parseFunction();
                if (!end) {
                    throw new _ParseError2.default("failed to parse function after \\end");
                } else if (end.value.name !== envName) {
                    throw new _ParseError2.default("Mismatch: \\begin{" + envName + "} matched " + "by \\end{" + end.value.name + "}", endNameToken);
                }
                return _result;
            } else if (_utils2.default.contains(Parser.sizeFuncs, func)) {
                // If we see a sizing function, parse out the implicit body
                this.consumeSpaces();
                var _body2 = this.parseExpression(false, breakOnTokenText);
                return new _ParseNode2.default("sizing", {
                    // Figure out what size to use based on the list of functions above
                    size: _utils2.default.indexOf(Parser.sizeFuncs, func) + 1,
                    value: _body2
                }, this.mode);
            } else if (_utils2.default.contains(Parser.styleFuncs, func)) {
                // If we see a styling function, parse out the implicit body
                this.consumeSpaces();
                var _body3 = this.parseExpression(true, breakOnTokenText);
                return new _ParseNode2.default("styling", {
                    // Figure out what style to use by pulling out the style from
                    // the function name
                    style: func.slice(1, func.length - 5),
                    value: _body3
                }, this.mode);
            } else if (func in Parser.oldFontFuncs) {
                var style = Parser.oldFontFuncs[func];
                // If we see an old font function, parse out the implicit body
                this.consumeSpaces();
                var _body4 = this.parseExpression(true, breakOnTokenText);
                if (style.slice(0, 4) === 'text') {
                    return new _ParseNode2.default("text", {
                        style: style,
                        body: new _ParseNode2.default("ordgroup", _body4, this.mode)
                    }, this.mode);
                } else {
                    return new _ParseNode2.default("font", {
                        font: style,
                        body: new _ParseNode2.default("ordgroup", _body4, this.mode)
                    }, this.mode);
                }
            } else if (func === "\\color") {
                // If we see a styling function, parse out the implicit body
                var color = this.parseColorGroup(false);
                if (!color) {
                    throw new _ParseError2.default("\\color not followed by color");
                }
                var _body5 = this.parseExpression(true, breakOnTokenText);
                return new _ParseNode2.default("color", {
                    type: "color",
                    color: color.result.value,
                    value: _body5
                }, this.mode);
            } else {
                // Defer to parseGivenFunction if it's not a function we handle
                return this.parseGivenFunction(start);
            }
        }

        /**
         * Parses an entire function, including its base and all of its arguments.
         * It also handles the case where the parsed node is not a function.
         */

    }, {
        key: "parseFunction",
        value: function parseFunction() {
            var baseGroup = this.parseGroup();
            return baseGroup ? this.parseGivenFunction(baseGroup) : null;
        }

        /**
         * Same as parseFunction(), except that the base is provided, guaranteeing a
         * non-nullable result.
         */

    }, {
        key: "parseGivenFunction",
        value: function parseGivenFunction(baseGroup) {
            baseGroup = assertFuncOrArg(baseGroup);
            if (baseGroup.type === "fn") {
                var func = baseGroup.result;
                var funcData = _functions2.default[func];
                if (this.mode === "text" && !funcData.allowedInText) {
                    throw new _ParseError2.default("Can't use function '" + func + "' in text mode", baseGroup.token);
                } else if (this.mode === "math" && funcData.allowedInMath === false) {
                    throw new _ParseError2.default("Can't use function '" + func + "' in math mode", baseGroup.token);
                }

                var _parseArguments2 = this.parseArguments(func, funcData),
                    args = _parseArguments2.args,
                    optArgs = _parseArguments2.optArgs;

                var _token = baseGroup.token;
                var _result2 = this.callFunction(func, args, optArgs, _token);
                return new _ParseNode2.default(_result2.type, _result2, this.mode);
            } else {
                return baseGroup.result;
            }
        }

        /**
         * Call a function handler with a suitable context and arguments.
         */

    }, {
        key: "callFunction",
        value: function callFunction(name, args, optArgs, token) {
            var context = {
                funcName: name,
                parser: this,
                token: token
            };
            var func = _functions2.default[name];
            if (func && func.handler) {
                return func.handler(context, args, optArgs);
            } else {
                throw new _ParseError2.default("No function handler for " + name);
            }
        }

        /**
         * Parses the arguments of a function or environment
         */

    }, {
        key: "parseArguments",
        value: function parseArguments(func, // Should look like "\name" or "\begin{name}".
        funcData) {
            var totalArgs = funcData.numArgs + funcData.numOptionalArgs;
            if (totalArgs === 0) {
                return { args: [], optArgs: [] };
            }

            var baseGreediness = funcData.greediness;
            var args = [];
            var optArgs = [];

            for (var i = 0; i < totalArgs; i++) {
                var argType = funcData.argTypes && funcData.argTypes[i];
                var isOptional = i < funcData.numOptionalArgs;
                // Ignore spaces between arguments.  As the TeXbook says:
                // "After you have said ‘\def\row#1#2{...}’, you are allowed to
                //  put spaces between the arguments (e.g., ‘\row x n’), because
                //  TeX doesn’t use single spaces as undelimited arguments."
                if (i > 0 && !isOptional) {
                    this.consumeSpaces();
                }
                // Also consume leading spaces in math mode, as parseSymbol
                // won't know what to do with them.  This can only happen with
                // macros, e.g. \frac\foo\foo where \foo expands to a space symbol.
                // In LaTeX, the \foo's get treated as (blank) arguments).
                // In KaTeX, for now, both spaces will get consumed.
                // TODO(edemaine)
                if (i === 0 && !isOptional && this.mode === "math") {
                    this.consumeSpaces();
                }
                var nextToken = this.nextToken;
                var arg = argType ? this.parseGroupOfType(argType, isOptional) : this.parseGroup(isOptional);
                if (!arg) {
                    if (isOptional) {
                        optArgs.push(null);
                        continue;
                    }
                    if (!this.settings.throwOnError && this.nextToken.text[0] === "\\") {
                        arg = newArgument(this.handleUnsupportedCmd(), nextToken);
                    } else {
                        throw new _ParseError2.default("Expected group after '" + func + "'", nextToken);
                    }
                }
                var argNode = void 0;
                arg = assertFuncOrArg(arg);
                if (arg.type === "fn") {
                    var argGreediness = _functions2.default[arg.result].greediness;
                    if (argGreediness > baseGreediness) {
                        argNode = this.parseGivenFunction(arg);
                    } else {
                        throw new _ParseError2.default("Got function '" + arg.result + "' as " + "argument to '" + func + "'", nextToken);
                    }
                } else {
                    argNode = arg.result;
                }
                (isOptional ? optArgs : args).push(argNode);
            }

            return { args: args, optArgs: optArgs };
        }

        /**
         * Parses a group when the mode is changing.
         */

    }, {
        key: "parseGroupOfType",
        value: function parseGroupOfType(type, // Used to describe the mode in error messages.
        optional) {
            // Handle `original` argTypes
            if (type === "original") {
                type = this.mode;
            }

            if (type === "color") {
                return this.parseColorGroup(optional);
            }
            if (type === "size") {
                return this.parseSizeGroup(optional);
            }
            if (type === "url") {
                return this.parseUrlGroup(optional);
            }

            // By the time we get here, type is one of "text" or "math".
            // Specify this as mode to parseGroup.
            return this.parseGroup(optional, type);
        }
    }, {
        key: "consumeSpaces",
        value: function consumeSpaces() {
            while (this.nextToken.text === " ") {
                this.consume();
            }
        }

        /**
         * Parses a group, essentially returning the string formed by the
         * brace-enclosed tokens plus some position information.
         */

    }, {
        key: "parseStringGroup",
        value: function parseStringGroup(modeName, // Used to describe the mode in error messages.
        optional) {
            if (optional && this.nextToken.text !== "[") {
                return null;
            }
            var outerMode = this.mode;
            this.mode = "text";
            this.expect(optional ? "[" : "{");
            var str = "";
            var firstToken = this.nextToken;
            var lastToken = firstToken;
            while (this.nextToken.text !== (optional ? "]" : "}")) {
                if (this.nextToken.text === "EOF") {
                    throw new _ParseError2.default("Unexpected end of input in " + modeName, firstToken.range(this.nextToken, str));
                }
                lastToken = this.nextToken;
                str += lastToken.text;
                this.consume();
            }
            this.mode = outerMode;
            this.expect(optional ? "]" : "}");
            return firstToken.range(lastToken, str);
        }

        /**
         * Parses a group, essentially returning the string formed by the
         * brace-enclosed tokens plus some position information, possibly
         * with nested braces.
         */

    }, {
        key: "parseStringGroupWithBalancedBraces",
        value: function parseStringGroupWithBalancedBraces(modeName, // Used to describe the mode in error messages.
        optional) {
            if (optional && this.nextToken.text !== "[") {
                return null;
            }
            var outerMode = this.mode;
            this.mode = "text";
            this.expect(optional ? "[" : "{");
            var str = "";
            var nest = 0;
            var firstToken = this.nextToken;
            var lastToken = firstToken;
            while (nest > 0 || this.nextToken.text !== (optional ? "]" : "}")) {
                if (this.nextToken.text === "EOF") {
                    throw new _ParseError2.default("Unexpected end of input in " + modeName, firstToken.range(this.nextToken, str));
                }
                lastToken = this.nextToken;
                str += lastToken.text;
                if (lastToken.text === "{") {
                    nest += 1;
                } else if (lastToken.text === "}") {
                    if (nest <= 0) {
                        throw new _ParseError2.default("Unbalanced brace of input in " + modeName, firstToken.range(this.nextToken, str));
                    } else {
                        nest -= 1;
                    }
                }
                this.consume();
            }
            this.mode = outerMode;
            this.expect(optional ? "]" : "}");
            return firstToken.range(lastToken, str);
        }

        /**
         * Parses a regex-delimited group: the largest sequence of tokens
         * whose concatenated strings match `regex`. Returns the string
         * formed by the tokens plus some position information.
         */

    }, {
        key: "parseRegexGroup",
        value: function parseRegexGroup(regex, modeName) {
            var outerMode = this.mode;
            this.mode = "text";
            var firstToken = this.nextToken;
            var lastToken = firstToken;
            var str = "";
            while (this.nextToken.text !== "EOF" && regex.test(str + this.nextToken.text)) {
                lastToken = this.nextToken;
                str += lastToken.text;
                this.consume();
            }
            if (str === "") {
                throw new _ParseError2.default("Invalid " + modeName + ": '" + firstToken.text + "'", firstToken);
            }
            this.mode = outerMode;
            return firstToken.range(lastToken, str);
        }

        /**
         * Parses a color description.
         */

    }, {
        key: "parseColorGroup",
        value: function parseColorGroup(optional) {
            var res = this.parseStringGroup("color", optional);
            if (!res) {
                return null;
            }
            var match = /^(#[a-f0-9]{3}|#[a-f0-9]{6}|[a-z]+)$/i.exec(res.text);
            if (!match) {
                throw new _ParseError2.default("Invalid color: '" + res.text + "'", res);
            }
            return newArgument(new _ParseNode2.default("color", match[0], this.mode), res);
        }

        /**
         * Parses a url string.
         */

    }, {
        key: "parseUrlGroup",
        value: function parseUrlGroup(optional) {
            var res = this.parseStringGroupWithBalancedBraces("url", optional);
            if (!res) {
                return null;
            }
            var raw = res.text;
            // hyperref package allows backslashes alone in href, but doesn't generate
            // valid links in such cases; we interpret this as "undefiend" behaviour,
            // and keep them as-is. Some browser will replace backslashes with
            // forward slashes.
            var url = raw.replace(/\\([#$%&~_^{}])/g, '$1');
            return newArgument(new _ParseNode2.default("url", url, this.mode), res);
        }

        /**
         * Parses a size specification, consisting of magnitude and unit.
         */

    }, {
        key: "parseSizeGroup",
        value: function parseSizeGroup(optional) {
            var res = void 0;
            if (!optional && this.nextToken.text !== "{") {
                res = this.parseRegexGroup(/^[-+]? *(?:$|\d+|\d+\.\d*|\.\d*) *[a-z]{0,2} *$/, "size");
            } else {
                res = this.parseStringGroup("size", optional);
            }
            if (!res) {
                return null;
            }
            var match = /([-+]?) *(\d+(?:\.\d*)?|\.\d+) *([a-z]{2})/.exec(res.text);
            if (!match) {
                throw new _ParseError2.default("Invalid size: '" + res.text + "'", res);
            }
            var data = {
                number: +(match[1] + match[2]), // sign + magnitude, cast to number
                unit: match[3]
            };
            if (!(0, _units.validUnit)(data)) {
                throw new _ParseError2.default("Invalid unit: '" + data.unit + "'", res);
            }
            return newArgument(new _ParseNode2.default("size", data, this.mode), res);
        }

        /**
         * If `optional` is false or absent, this parses an ordinary group,
         * which is either a single nucleus (like "x") or an expression
         * in braces (like "{x+y}").
         * If `optional` is true, it parses either a bracket-delimited expression
         * (like "[x+y]") or returns null to indicate the absence of a
         * bracket-enclosed group.
         * If `mode` is present, switches to that mode while parsing the group,
         * and switches back after.
         */

    }, {
        key: "parseGroup",
        value: function parseGroup(optional, mode) {
            var outerMode = this.mode;
            var firstToken = this.nextToken;
            // Try to parse an open brace
            if (this.nextToken.text === (optional ? "[" : "{")) {
                // Switch to specified mode before we expand symbol after brace
                if (mode) {
                    this.switchMode(mode);
                }
                // If we get a brace, parse an expression
                this.consume();
                var expression = this.parseExpression(false, optional ? "]" : "}");
                var lastToken = this.nextToken;
                // Switch mode back before consuming symbol after close brace
                if (mode) {
                    this.switchMode(outerMode);
                }
                // Make sure we get a close brace
                this.expect(optional ? "]" : "}");
                if (mode === "text") {
                    this.formLigatures(expression);
                }
                return newArgument(new _ParseNode2.default("ordgroup", expression, this.mode, firstToken, lastToken), firstToken.range(lastToken, firstToken.text));
            } else {
                // Otherwise, just return a nucleus, or nothing for an optional group
                if (mode) {
                    this.switchMode(mode);
                }
                var _result3 = optional ? null : this.parseSymbol();
                if (mode) {
                    this.switchMode(outerMode);
                }
                return _result3;
            }
        }

        /**
         * Form ligature-like combinations of characters for text mode.
         * This includes inputs like "--", "---", "``" and "''".
         * The result will simply replace multiple textord nodes with a single
         * character in each value by a single textord node having multiple
         * characters in its value.  The representation is still ASCII source.
         * The group will be modified in place.
         */

    }, {
        key: "formLigatures",
        value: function formLigatures(group) {
            var n = group.length - 1;
            for (var i = 0; i < n; ++i) {
                var a = group[i];
                var v = a.value;
                if (v === "-" && group[i + 1].value === "-") {
                    if (i + 1 < n && group[i + 2].value === "-") {
                        group.splice(i, 3, new _ParseNode2.default("textord", "---", "text", a, group[i + 2]));
                        n -= 2;
                    } else {
                        group.splice(i, 2, new _ParseNode2.default("textord", "--", "text", a, group[i + 1]));
                        n -= 1;
                    }
                }
                if ((v === "'" || v === "`") && group[i + 1].value === v) {
                    group.splice(i, 2, new _ParseNode2.default("textord", v + v, "text", a, group[i + 1]));
                    n -= 1;
                }
            }
        }

        /**
         * Parse a single symbol out of the string. Here, we handle both the functions
         * we have defined, as well as the single character symbols
         */

    }, {
        key: "parseSymbol",
        value: function parseSymbol() {
            var nucleus = this.nextToken;
            var text = nucleus.text;

            if (_functions2.default[text]) {
                this.consume();
                // If there exists a function with this name, we return the function and
                // say that it is a function.
                return newFunction(nucleus);
            } else if (/^\\verb[^a-zA-Z]/.test(text)) {
                this.consume();
                var arg = text.slice(5);
                var star = arg.charAt(0) === "*";
                if (star) {
                    arg = arg.slice(1);
                }
                // Lexer's tokenRegex is constructed to always have matching
                // first/last characters.
                if (arg.length < 2 || arg.charAt(0) !== arg.slice(-1)) {
                    throw new _ParseError2.default("\\verb assertion failed --\n                    please report what input caused this bug");
                }
                arg = arg.slice(1, -1); // remove first and last char
                return newArgument(new _ParseNode2.default("verb", {
                    body: arg,
                    star: star
                }, "text"), nucleus);
            } else if (text === "$") {
                return newDollar(nucleus);
            }
            // At this point, we should have a symbol, possibly with accents.
            // First expand any accented base symbol according to unicodeSymbols.
            if (_unicodeSymbols2.default.hasOwnProperty(text[0]) && !_symbols2.default[this.mode][text[0]]) {
                text = _unicodeSymbols2.default[text[0]] + text.substr(1);
            }
            // Strip off any combining characters
            var match = _Lexer.combiningDiacriticalMarksEndRegex.exec(text);
            if (match) {
                text = text.substring(0, match.index);
                if (text === 'i') {
                    text = "\u0131"; // dotless i, in math and text mode
                } else if (text === 'j') {
                    text = "\u0237"; // dotless j, in math and text mode
                }
            }
            // Recognize base symbol
            var symbol = null;
            if (_symbols2.default[this.mode][text]) {
                symbol = new _ParseNode2.default(_symbols2.default[this.mode][text].group, text, this.mode, nucleus);
            } else if (this.mode === "text" && (0, _unicodeScripts.supportedCodepoint)(text.charCodeAt(0))) {
                symbol = new _ParseNode2.default("textord", text, this.mode, nucleus);
            } else {
                return null; // EOF, ^, _, {, }, etc.
            }
            this.consume();
            // Transform combining characters into accents
            if (match) {
                for (var i = 0; i < match[0].length; i++) {
                    var accent = match[0][i];
                    if (!_unicodeAccents2.default[accent]) {
                        throw new _ParseError2.default("Unknown accent ' " + accent + "'", nucleus);
                    }
                    var command = _unicodeAccents2.default[accent][this.mode];
                    if (!command) {
                        throw new _ParseError2.default("Accent " + accent + " unsupported in " + this.mode + " mode", nucleus);
                    }
                    symbol = new _ParseNode2.default("accent", {
                        type: "accent",
                        label: command,
                        isStretchy: false,
                        isShifty: true,
                        base: symbol
                    }, this.mode, nucleus);
                }
            }
            return newArgument(symbol, nucleus);
        }
    }]);
    return Parser;
}();

Parser.endOfExpression = ["}", "\\end", "\\right", "&", "\\\\", "\\cr"];
Parser.SUPSUB_GREEDINESS = 1;
Parser.sizeFuncs = ["\\tiny", "\\sixptsize", "\\scriptsize", "\\footnotesize", "\\small", "\\normalsize", "\\large", "\\Large", "\\LARGE", "\\huge", "\\Huge"];
Parser.styleFuncs = ["\\displaystyle", "\\textstyle", "\\scriptstyle", "\\scriptscriptstyle"];
Parser.oldFontFuncs = {
    "\\rm": "mathrm",
    "\\sf": "mathsf",
    "\\tt": "mathtt",
    "\\bf": "mathbf",
    "\\it": "mathit"
    //"\\sl": "textsl",
    //"\\sc": "textsc",
};
exports.default = Parser;

},{"./Lexer.js":81,"./MacroExpander":82,"./ParseError":84,"./ParseNode":85,"./Settings":87,"./Token":90,"./environments":99,"./functions":103,"./symbols":128,"./unicodeAccents":129,"./unicodeScripts":130,"./unicodeSymbols":131,"./units":132,"./utils":133,"babel-runtime/helpers/classCallCheck":8,"babel-runtime/helpers/createClass":9}],87:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _utils = require("./utils");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The main Settings object
 *
 * The current options stored are:
 *  - displayMode: Whether the expression should be typeset as inline math
 *                 (false, the default), meaning that the math starts in
 *                 \textstyle and is placed in an inline-block); or as display
 *                 math (true), meaning that the math starts in \displaystyle
 *                 and is placed in a block with vertical margin.
 */
var Settings = function Settings(options) {
    (0, _classCallCheck3.default)(this, Settings);

    // allow null options
    options = options || {};
    this.displayMode = _utils2.default.deflt(options.displayMode, false);
    this.throwOnError = _utils2.default.deflt(options.throwOnError, true);
    this.errorColor = _utils2.default.deflt(options.errorColor, "#cc0000");
    this.macros = options.macros || {};
    this.colorIsTextColor = _utils2.default.deflt(options.colorIsTextColor, false);
    this.maxSize = Math.max(0, _utils2.default.deflt(options.maxSize, Infinity));
};
/**
 * This is a module for storing settings passed into KaTeX. It correctly handles
 * default settings.
 */

exports.default = Settings;

},{"./utils":133,"babel-runtime/helpers/classCallCheck":8}],88:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _freeze = require("babel-runtime/core-js/object/freeze");

var _freeze2 = _interopRequireDefault(_freeze);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Lexing or parsing positional information for error reporting.
 * This object is immutable.
 */
var SourceLocation = function () {
    // End offset, zero-based exclusive.

    // Lexer holding the input string.
    function SourceLocation(lexer, start, end) {
        (0, _classCallCheck3.default)(this, SourceLocation);

        this.lexer = lexer;
        this.start = start;
        this.end = end;
        (0, _freeze2.default)(this); // Immutable to allow sharing in range().
    }

    /**
     * Merges two `SourceLocation`s from location providers, given they are
     * provided in order of appearance.
     * - Returns the first one's location if only the first is provided.
     * - Returns a merged range of the first and the last if both are provided
     *   and their lexers match.
     * - Otherwise, returns null.
     */
    // Start offset, zero-based inclusive.


    (0, _createClass3.default)(SourceLocation, null, [{
        key: "range",
        value: function range(first, second) {
            if (!second) {
                return first && first.loc;
            } else if (!first || !first.loc || !second.loc || first.loc.lexer !== second.loc.lexer) {
                return null;
            } else {
                return new SourceLocation(first.loc.lexer, first.loc.start, second.loc.end);
            }
        }
    }]);
    return SourceLocation;
}();

exports.default = SourceLocation;

},{"babel-runtime/core-js/object/freeze":7,"babel-runtime/helpers/classCallCheck":8,"babel-runtime/helpers/createClass":9}],89:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This file contains information and classes for the various kinds of styles
 * used in TeX. It provides a generic `Style` class, which holds information
 * about a specific style. It then provides instances of all the different kinds
 * of styles possible, and provides functions to move between them and get
 * information about them.
 */

/**
 * The main style class. Contains a unique id for the style, a size (which is
 * the same for cramped and uncramped version of a style), and a cramped flag.
 */
var Style = function () {
    function Style(id, size, cramped) {
        (0, _classCallCheck3.default)(this, Style);

        this.id = id;
        this.size = size;
        this.cramped = cramped;
    }

    /**
     * Get the style of a superscript given a base in the current style.
     */


    (0, _createClass3.default)(Style, [{
        key: "sup",
        value: function sup() {
            return styles[_sup[this.id]];
        }

        /**
         * Get the style of a subscript given a base in the current style.
         */

    }, {
        key: "sub",
        value: function sub() {
            return styles[_sub[this.id]];
        }

        /**
         * Get the style of a fraction numerator given the fraction in the current
         * style.
         */

    }, {
        key: "fracNum",
        value: function fracNum() {
            return styles[_fracNum[this.id]];
        }

        /**
         * Get the style of a fraction denominator given the fraction in the current
         * style.
         */

    }, {
        key: "fracDen",
        value: function fracDen() {
            return styles[_fracDen[this.id]];
        }

        /**
         * Get the cramped version of a style (in particular, cramping a cramped style
         * doesn't change the style).
         */

    }, {
        key: "cramp",
        value: function cramp() {
            return styles[_cramp[this.id]];
        }

        /**
         * Get a text or display version of this style.
         */

    }, {
        key: "text",
        value: function text() {
            return styles[_text[this.id]];
        }

        /**
         * Return true if this style is tightly spaced (scriptstyle/scriptscriptstyle)
         */

    }, {
        key: "isTight",
        value: function isTight() {
            return this.size >= 2;
        }
    }]);
    return Style;
}();

// Export an interface for type checking, but don't expose the implementation.
// This way, no more styles can be generated.


// IDs of the different styles
var D = 0;
var Dc = 1;
var T = 2;
var Tc = 3;
var S = 4;
var Sc = 5;
var SS = 6;
var SSc = 7;

// Instances of the different styles
var styles = [new Style(D, 0, false), new Style(Dc, 0, true), new Style(T, 1, false), new Style(Tc, 1, true), new Style(S, 2, false), new Style(Sc, 2, true), new Style(SS, 3, false), new Style(SSc, 3, true)];

// Lookup tables for switching from one style to another
var _sup = [S, Sc, S, Sc, SS, SSc, SS, SSc];
var _sub = [Sc, Sc, Sc, Sc, SSc, SSc, SSc, SSc];
var _fracNum = [T, Tc, S, Sc, SS, SSc, SS, SSc];
var _fracDen = [Tc, Tc, Sc, Sc, SSc, SSc, SSc, SSc];
var _cramp = [Dc, Dc, Tc, Tc, Sc, Sc, SSc, SSc];
var _text = [D, Dc, T, Tc, T, Tc, T, Tc];

// We only export some of the styles.
exports.default = {
    DISPLAY: styles[D],
    TEXT: styles[T],
    SCRIPT: styles[S],
    SCRIPTSCRIPT: styles[SS]
};

},{"babel-runtime/helpers/classCallCheck":8,"babel-runtime/helpers/createClass":9}],90:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Token = undefined;

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _SourceLocation = require("./SourceLocation");

var _SourceLocation2 = _interopRequireDefault(_SourceLocation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The resulting token returned from `lex`.
 *
 * It consists of the token text plus some position information.
 * The position information is essentially a range in an input string,
 * but instead of referencing the bare input string, we refer to the lexer.
 * That way it is possible to attach extra metadata to the input string,
 * like for example a file name or similar.
 *
 * The position information is optional, so it is OK to construct synthetic
 * tokens if appropriate. Not providing available position information may
 * lead to degraded error reporting, though.
 */


/**
 * Interface required to break circular dependency between Token, Lexer, and
 * ParseError.
 */
var Token = exports.Token = function () {
    function Token(text, // the text of this token
    loc) {
        (0, _classCallCheck3.default)(this, Token);

        this.text = text;
        this.loc = loc;
    }

    /**
     * Given a pair of tokens (this and endToken), compute a `Token` encompassing
     * the whole input range enclosed by these two.
     */


    (0, _createClass3.default)(Token, [{
        key: "range",
        value: function range(endToken, // last token of the range, inclusive
        text) // the text of the newly constructed token
        {
            return new Token(text, _SourceLocation2.default.range(this, endToken));
        }
    }]);
    return Token;
}();

},{"./SourceLocation":88,"babel-runtime/helpers/classCallCheck":8,"babel-runtime/helpers/createClass":9}],91:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _domTree = require("./domTree");

var _domTree2 = _interopRequireDefault(_domTree);

var _fontMetrics = require("./fontMetrics");

var _fontMetrics2 = _interopRequireDefault(_fontMetrics);

var _symbols = require("./symbols");

var _symbols2 = _interopRequireDefault(_symbols);

var _utils = require("./utils");

var _utils2 = _interopRequireDefault(_utils);

var _stretchy = require("./stretchy");

var _stretchy2 = _interopRequireDefault(_stretchy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// The following have to be loaded from Main-Italic font, using class mainit
var mainitLetters = ["\\imath", "ı", // dotless i
"\\jmath", "ȷ", // dotless j
"\\pounds", "\\mathsterling", "\\textsterling", "£"];

/**
 * Looks up the given symbol in fontMetrics, after applying any symbol
 * replacements defined in symbol.js
 */

/* eslint no-console:0 */
/**
 * This module contains general functions that can be used for building
 * different kinds of domTree nodes in a consistent manner.
 */

var lookupSymbol = function lookupSymbol(value,
// TODO(#963): Use a union type for this.
fontFamily, mode) {
    // Replace the value with its replaced value from symbol.js
    if (_symbols2.default[mode][value] && _symbols2.default[mode][value].replace) {
        value = _symbols2.default[mode][value].replace;
    }
    return {
        value: value,
        metrics: _fontMetrics2.default.getCharacterMetrics(value, fontFamily)
    };
};

/**
 * Makes a symbolNode after translation via the list of symbols in symbols.js.
 * Correctly pulls out metrics for the character, and optionally takes a list of
 * classes to be attached to the node.
 *
 * TODO: make argument order closer to makeSpan
 * TODO: add a separate argument for math class (e.g. `mop`, `mbin`), which
 * should if present come first in `classes`.
 * TODO(#953): Make `options` mandatory and always pass it in.
 */
var makeSymbol = function makeSymbol(value, fontFamily, mode, options, classes) {
    var lookup = lookupSymbol(value, fontFamily, mode);
    var metrics = lookup.metrics;
    value = lookup.value;

    var symbolNode = void 0;
    if (metrics) {
        var italic = metrics.italic;
        if (mode === "text") {
            italic = 0;
        }
        symbolNode = new _domTree2.default.symbolNode(value, metrics.height, metrics.depth, italic, metrics.skew, metrics.width, classes);
    } else {
        // TODO(emily): Figure out a good way to only print this in development
        typeof console !== "undefined" && console.warn("No character metrics for '" + value + "' in style '" + fontFamily + "'");
        symbolNode = new _domTree2.default.symbolNode(value, 0, 0, 0, 0, 0, classes);
    }

    if (options) {
        symbolNode.maxFontSize = options.sizeMultiplier;
        if (options.style.isTight()) {
            symbolNode.classes.push("mtight");
        }
        var color = options.getColor();
        if (color) {
            symbolNode.style.color = color;
        }
    }

    return symbolNode;
};

/**
 * Makes a symbol in Main-Regular or AMS-Regular.
 * Used for rel, bin, open, close, inner, and punct.
 *
 * TODO(#953): Make `options` mandatory and always pass it in.
 */
var mathsym = function mathsym(value, mode, options) {
    var classes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

    // Decide what font to render the symbol in by its entry in the symbols
    // table.
    // Have a special case for when the value = \ because the \ is used as a
    // textord in unsupported command errors but cannot be parsed as a regular
    // text ordinal and is therefore not present as a symbol in the symbols
    // table for text, as well as a special case for boldsymbol because it
    // can be used for bold + and -
    if (options && options.fontFamily && options.fontFamily === "boldsymbol" && lookupSymbol(value, "Main-Bold", mode).metrics) {
        return makeSymbol(value, "Main-Bold", mode, options, classes.concat(["mathbf"]));
    } else if (value === "\\" || _symbols2.default[mode][value].font === "main") {
        return makeSymbol(value, "Main-Regular", mode, options, classes);
    } else {
        return makeSymbol(value, "AMS-Regular", mode, options, classes.concat(["amsrm"]));
    }
};

/**
 * Makes a symbol in the default font for mathords and textords.
 */
var mathDefault = function mathDefault(value, mode, options, classes, type) {
    if (type === "mathord") {
        var fontLookup = mathit(value, mode, options, classes);
        return makeSymbol(value, fontLookup.fontName, mode, options, classes.concat([fontLookup.fontClass]));
    } else if (type === "textord") {
        var font = _symbols2.default[mode][value] && _symbols2.default[mode][value].font;
        if (font === "ams") {
            var _fontName = retrieveTextFontName("amsrm", options.fontWeight, options.fontShape);
            return makeSymbol(value, _fontName, mode, options, classes.concat("amsrm", options.fontWeight, options.fontShape));
        } else {
            // if (font === "main") {
            var _fontName2 = retrieveTextFontName("textrm", options.fontWeight, options.fontShape);
            return makeSymbol(value, _fontName2, mode, options, classes.concat(options.fontWeight, options.fontShape));
        }
    } else {
        throw new Error("unexpected type: " + type + " in mathDefault");
    }
};

/**
 * Determines which of the two font names (Main-Italic and Math-Italic) and
 * corresponding style tags (mainit or mathit) to use for font "mathit",
 * depending on the symbol.  Use this function instead of fontMap for font
 * "mathit".
 */
var mathit = function mathit(value, mode, options, classes) {
    if (/[0-9]/.test(value.charAt(0)) ||
    // glyphs for \imath and \jmath do not exist in Math-Italic so we
    // need to use Main-Italic instead
    _utils2.default.contains(mainitLetters, value)) {
        return {
            fontName: "Main-Italic",
            fontClass: "mainit"
        };
    } else {
        return {
            fontName: "Math-Italic",
            fontClass: "mathit"
        };
    }
};

/**
 * Determines which of the two font names (Main-Bold and Math-BoldItalic) and
 * corresponding style tags (mathbf or boldsymbol) to use for font "boldsymbol",
 * depending on the symbol.  Use this function instead of fontMap for font
 * "boldsymbol".
 */
var boldsymbol = function boldsymbol(value, mode, options, classes) {
    if (lookupSymbol(value, "Math-BoldItalic", mode).metrics) {
        return {
            fontName: "Math-BoldItalic",
            fontClass: "boldsymbol"
        };
    } else {
        // Some glyphs do not exist in Math-BoldItalic so we need to use
        // Main-Bold instead.
        return {
            fontName: "Main-Bold",
            fontClass: "mathbf"
        };
    }
};

/**
 * Makes either a mathord or textord in the correct font and color.
 */
var makeOrd = function makeOrd(group, options, type) {
    var mode = group.mode;
    var value = group.value;

    var classes = ["mord"];

    var fontFamily = options.fontFamily;
    if (fontFamily) {
        var _fontName3 = void 0;
        var fontClasses = void 0;
        if (fontFamily === "boldsymbol") {
            var fontData = boldsymbol(value, mode, options, classes);
            _fontName3 = fontData.fontName;
            fontClasses = [fontData.fontClass];
        } else if (fontFamily === "mathit" || _utils2.default.contains(mainitLetters, value)) {
            var _fontData = mathit(value, mode, options, classes);
            _fontName3 = _fontData.fontName;
            fontClasses = [_fontData.fontClass];
        } else if (fontFamily.includes("math") || mode === "math") {
            // To support old font functions (i.e. \rm \sf etc.) or math mode.
            _fontName3 = fontMap[fontFamily].fontName;
            fontClasses = [fontFamily];
        } else {
            _fontName3 = retrieveTextFontName(fontFamily, options.fontWeight, options.fontShape);
            fontClasses = [fontFamily, options.fontWeight, options.fontShape];
        }
        if (lookupSymbol(value, _fontName3, mode).metrics) {
            return makeSymbol(value, _fontName3, mode, options, classes.concat(fontClasses));
        } else {
            return mathDefault(value, mode, options, classes, type);
        }
    } else {
        return mathDefault(value, mode, options, classes, type);
    }
};

/**
 * Combine as many characters as possible in the given array of characters
 * via their tryCombine method.
 */
var tryCombineChars = function tryCombineChars(chars) {
    for (var i = 0; i < chars.length - 1; i++) {
        if (chars[i].tryCombine(chars[i + 1])) {
            chars.splice(i + 1, 1);
            i--;
        }
    }
    return chars;
};

/**
 * Calculate the height, depth, and maxFontSize of an element based on its
 * children.
 */
var sizeElementFromChildren = function sizeElementFromChildren(elem) {
    var height = 0;
    var depth = 0;
    var maxFontSize = 0;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = (0, _getIterator3.default)(elem.children), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var child = _step.value;

            if (child.height > height) {
                height = child.height;
            }
            if (child.depth > depth) {
                depth = child.depth;
            }
            if (child.maxFontSize > maxFontSize) {
                maxFontSize = child.maxFontSize;
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    elem.height = height;
    elem.depth = depth;
    elem.maxFontSize = maxFontSize;
};

/**
 * Makes a span with the given list of classes, list of children, and options.
 *
 * TODO(#953): Ensure that `options` is always provided (currently some call
 * sites don't pass it) and make the type below mandatory.
 * TODO: add a separate argument for math class (e.g. `mop`, `mbin`), which
 * should if present come first in `classes`.
 */
var makeSpan = function makeSpan(classes, children, options) {
    var span = new _domTree2.default.span(classes, children, options);

    sizeElementFromChildren(span);

    return span;
};

var makeLineSpan = function makeLineSpan(className, options) {
    // Return a span with an SVG image of a horizontal line. The SVG path
    // fills the middle fifth of the span. We want an extra tall span
    // because Chrome will sometimes not display a span that is 0.04em tall.
    var lineHeight = options.fontMetrics().defaultRuleThickness;
    var line = _stretchy2.default.ruleSpan(className, lineHeight, options);
    line.height = lineHeight;
    line.style.height = 5 * line.height + "em";
    line.maxFontSize = 1.0;
    return line;
};

/**
 * Makes an anchor with the given href, list of classes, list of children,
 * and options.
 */
var makeAnchor = function makeAnchor(href, classes, children, options) {
    var anchor = new _domTree2.default.anchor(href, classes, children, options);

    sizeElementFromChildren(anchor);

    return anchor;
};

/**
 * Prepends the given children to the given span, updating height, depth, and
 * maxFontSize.
 */
var prependChildren = function prependChildren(span, children) {
    span.children = children.concat(span.children);

    sizeElementFromChildren(span);
};

/**
 * Makes a document fragment with the given list of children.
 */
var makeFragment = function makeFragment(children) {
    var fragment = new _domTree2.default.documentFragment(children);

    sizeElementFromChildren(fragment);

    return fragment;
};

// These are exact object types to catch typos in the names of the optional fields.


// A list of child or kern nodes to be stacked on top of each other (i.e. the
// first element will be at the bottom, and the last at the top).


// Computes the updated `children` list and the overall depth.
//
// This helper function for makeVList makes it easier to enforce type safety by
// allowing early exits (returns) in the logic.
var getVListChildrenAndDepth = function getVListChildrenAndDepth(params) {
    if (params.positionType === "individualShift") {
        var oldChildren = params.children;
        var _children = [oldChildren[0]];

        // Add in kerns to the list of params.children to get each element to be
        // shifted to the correct specified shift
        var _depth = -oldChildren[0].shift - oldChildren[0].elem.depth;
        var currPos = _depth;
        for (var i = 1; i < oldChildren.length; i++) {
            var diff = -oldChildren[i].shift - currPos - oldChildren[i].elem.depth;
            var _size = diff - (oldChildren[i - 1].elem.height + oldChildren[i - 1].elem.depth);

            currPos = currPos + diff;

            _children.push({ type: "kern", size: _size });
            _children.push(oldChildren[i]);
        }

        return { children: _children, depth: _depth };
    }

    var depth = void 0;
    if (params.positionType === "top") {
        // We always start at the bottom, so calculate the bottom by adding up
        // all the sizes
        var bottom = params.positionData;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = (0, _getIterator3.default)(params.children), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var child = _step2.value;

                bottom -= child.type === "kern" ? child.size : child.elem.height + child.elem.depth;
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        depth = bottom;
    } else if (params.positionType === "bottom") {
        depth = -params.positionData;
    } else {
        var firstChild = params.children[0];
        if (firstChild.type !== "elem") {
            throw new Error('First child must have type "elem".');
        }
        if (params.positionType === "shift") {
            depth = -firstChild.elem.depth - params.positionData;
        } else if (params.positionType === "firstBaseline") {
            depth = -firstChild.elem.depth;
        } else {
            throw new Error("Invalid positionType " + params.positionType + ".");
        }
    }
    return { children: params.children, depth: depth };
};

/**
 * Makes a vertical list by stacking elements and kerns on top of each other.
 * Allows for many different ways of specifying the positioning method.
 *
 * See VListParam documentation above.
 */
var makeVList = function makeVList(params, options) {
    var _getVListChildrenAndD = getVListChildrenAndDepth(params),
        children = _getVListChildrenAndD.children,
        depth = _getVListChildrenAndD.depth;

    // Create a strut that is taller than any list item. The strut is added to
    // each item, where it will determine the item's baseline. Since it has
    // `overflow:hidden`, the strut's top edge will sit on the item's line box's
    // top edge and the strut's bottom edge will sit on the item's baseline,
    // with no additional line-height spacing. This allows the item baseline to
    // be positioned precisely without worrying about font ascent and
    // line-height.


    var pstrutSize = 0;
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = (0, _getIterator3.default)(children), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var child = _step3.value;

            if (child.type === "elem") {
                var _elem = child.elem;
                pstrutSize = Math.max(pstrutSize, _elem.maxFontSize, _elem.height);
            }
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    pstrutSize += 2;
    var pstrut = makeSpan(["pstrut"], []);
    pstrut.style.height = pstrutSize + "em";

    // Create a new list of actual children at the correct offsets
    var realChildren = [];
    var minPos = depth;
    var maxPos = depth;
    var currPos = depth;
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = (0, _getIterator3.default)(children), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _child = _step4.value;

            if (_child.type === "kern") {
                currPos += _child.size;
            } else {
                var _elem2 = _child.elem;
                var classes = _child.wrapperClasses || [];

                var childWrap = makeSpan(classes, [pstrut, _elem2]);
                childWrap.style.top = -pstrutSize - currPos - _elem2.depth + "em";
                if (_child.marginLeft) {
                    childWrap.style.marginLeft = _child.marginLeft;
                }
                if (_child.marginRight) {
                    childWrap.style.marginRight = _child.marginRight;
                }

                realChildren.push(childWrap);
                currPos += _elem2.height + _elem2.depth;
            }
            minPos = Math.min(minPos, currPos);
            maxPos = Math.max(maxPos, currPos);
        }

        // The vlist contents go in a table-cell with `vertical-align:bottom`.
        // This cell's bottom edge will determine the containing table's baseline
        // without overly expanding the containing line-box.
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }

    var vlist = makeSpan(["vlist"], realChildren);
    vlist.style.height = maxPos + "em";

    // A second row is used if necessary to represent the vlist's depth.
    var rows = void 0;
    if (minPos < 0) {
        var depthStrut = makeSpan(["vlist"], []);
        depthStrut.style.height = -minPos + "em";

        // Safari wants the first row to have inline content; otherwise it
        // puts the bottom of the *second* row on the baseline.
        var topStrut = makeSpan(["vlist-s"], [new _domTree2.default.symbolNode("\u200B")]);

        rows = [makeSpan(["vlist-r"], [vlist, topStrut]), makeSpan(["vlist-r"], [depthStrut])];
    } else {
        rows = [makeSpan(["vlist-r"], [vlist])];
    }

    var vtable = makeSpan(["vlist-t"], rows);
    if (rows.length === 2) {
        vtable.classes.push("vlist-t2");
    }
    vtable.height = maxPos;
    vtable.depth = -minPos;
    return vtable;
};

// Converts verb group into body string, dealing with \verb* form
var makeVerb = function makeVerb(group, options) {
    // TODO(#892): Make ParseNode type-safe and confirm `group.type` to guarantee
    // that `group.value.body` is of type string.
    var text = group.value.body;
    if (group.value.star) {
        text = text.replace(/ /g, "\u2423"); // Open Box
    } else {
        text = text.replace(/ /g, '\xA0'); // No-Break Space
        // (so that, in particular, spaces don't coalesce)
    }
    return text;
};

// Takes an Options object, and returns the appropriate fontLookup
var retrieveTextFontName = function retrieveTextFontName(fontFamily, fontWeight, fontShape) {
    var baseFontName = retrieveBaseFontName(fontFamily);
    var fontStylesName = retrieveFontStylesName(fontWeight, fontShape);
    return baseFontName + "-" + fontStylesName;
};

var retrieveBaseFontName = function retrieveBaseFontName(font) {
    var baseFontName = "";
    switch (font) {
        case "amsrm":
            baseFontName = "AMS";
            break;
        case "textrm":
            baseFontName = "Main";
            break;
        case "textsf":
            baseFontName = "SansSerif";
            break;
        case "texttt":
            baseFontName = "Typewriter";
            break;
        default:
            throw new Error("Invalid font provided: " + font);
    }
    return baseFontName;
};

var retrieveFontStylesName = function retrieveFontStylesName(fontWeight, fontShape) {
    var fontStylesName = '';
    if (fontWeight === "textbf") {
        fontStylesName += "Bold";
    }
    if (fontShape === "textit") {
        fontStylesName += "Italic";
    }
    return fontStylesName || "Regular";
};

// A map of spacing functions to their attributes, like size and corresponding
// CSS class
var spacingFunctions = {
    "\\qquad": {
        size: "2em",
        className: "qquad"
    },
    "\\quad": {
        size: "1em",
        className: "quad"
    },
    "\\enspace": {
        size: "0.5em",
        className: "enspace"
    },
    "\\;": {
        size: "0.277778em",
        className: "thickspace"
    },
    "\\:": {
        size: "0.22222em",
        className: "mediumspace"
    },
    "\\,": {
        size: "0.16667em",
        className: "thinspace"
    },
    "\\!": {
        size: "-0.16667em",
        className: "negativethinspace"
    }
};

/**
 * Maps TeX font commands to objects containing:
 * - variant: string used for "mathvariant" attribute in buildMathML.js
 * - fontName: the "style" parameter to fontMetrics.getCharacterMetrics
 */
// A map between tex font commands an MathML mathvariant attribute values
var fontMap = {
    // styles
    "mathbf": {
        variant: "bold",
        fontName: "Main-Bold"
    },
    "mathrm": {
        variant: "normal",
        fontName: "Main-Regular"
    },
    "textit": {
        variant: "italic",
        fontName: "Main-Italic"
    },

    // "mathit" and "boldsymbol" are missing because they require the use of two
    // fonts: Main-Italic and Math-Italic for "mathit", and Math-BoldItalic and
    // Main-Bold for "boldsymbol".  This is handled by a special case in makeOrd
    // which ends up calling mathit and boldsymbol.

    // families
    "mathbb": {
        variant: "double-struck",
        fontName: "AMS-Regular"
    },
    "mathcal": {
        variant: "script",
        fontName: "Caligraphic-Regular"
    },
    "mathfrak": {
        variant: "fraktur",
        fontName: "Fraktur-Regular"
    },
    "mathscr": {
        variant: "script",
        fontName: "Script-Regular"
    },
    "mathsf": {
        variant: "sans-serif",
        fontName: "SansSerif-Regular"
    },
    "mathtt": {
        variant: "monospace",
        fontName: "Typewriter-Regular"
    }
};

var svgData = {
    //   path, width, height
    vec: ["vec", 0.471, 0.714] // values from the font glyph
};

var staticSvg = function staticSvg(value, options) {
    // Create a span with inline SVG for the element.
    var _svgData$value = (0, _slicedToArray3.default)(svgData[value], 3),
        pathName = _svgData$value[0],
        width = _svgData$value[1],
        height = _svgData$value[2];

    var path = new _domTree2.default.pathNode(pathName);
    var svgNode = new _domTree2.default.svgNode([path], {
        "width": width + "em",
        "height": height + "em",
        // Override CSS rule `.katex svg { width: 100% }`
        "style": "width:" + width + "em",
        "viewBox": "0 0 " + 1000 * width + " " + 1000 * height,
        "preserveAspectRatio": "xMinYMin"
    });
    var span = makeSpan(["overlay"], [svgNode], options);
    span.height = height;
    span.style.height = height + "em";
    span.style.width = width + "em";
    return span;
};

exports.default = {
    fontMap: fontMap,
    makeSymbol: makeSymbol,
    mathsym: mathsym,
    makeSpan: makeSpan,
    makeLineSpan: makeLineSpan,
    makeAnchor: makeAnchor,
    makeFragment: makeFragment,
    makeVList: makeVList,
    makeOrd: makeOrd,
    makeVerb: makeVerb,
    staticSvg: staticSvg,
    tryCombineChars: tryCombineChars,
    prependChildren: prependChildren,
    spacingFunctions: spacingFunctions
};

},{"./domTree":98,"./fontMetrics":101,"./stretchy":126,"./symbols":128,"./utils":133,"babel-runtime/core-js/get-iterator":3,"babel-runtime/helpers/slicedToArray":10}],92:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.buildGroup = exports.groupTypes = exports.makeNullDelimiter = exports.getTypeOfDomTree = exports.buildExpression = exports.spliceSpaces = undefined;

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

exports.default = buildHTML;

var _ParseError = require("./ParseError");

var _ParseError2 = _interopRequireDefault(_ParseError);

var _Style = require("./Style");

var _Style2 = _interopRequireDefault(_Style);

var _buildCommon = require("./buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _domTree = require("./domTree");

var _domTree2 = _interopRequireDefault(_domTree);

var _units = require("./units");

var _utils = require("./utils");

var _utils2 = _interopRequireDefault(_utils);

var _stretchy = require("./stretchy");

var _stretchy2 = _interopRequireDefault(_stretchy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var makeSpan = _buildCommon2.default.makeSpan; /**
                                                * WARNING: New methods on groupTypes should be added to src/functions.
                                                *
                                                * This file does the main work of building a domTree structure from a parse
                                                * tree. The entry point is the `buildHTML` function, which takes a parse tree.
                                                * Then, the buildExpression, buildGroup, and various groupTypes functions are
                                                * called, to produce a final HTML tree.
                                                */

var isSpace = function isSpace(node) {
    return node instanceof _domTree2.default.span && node.classes[0] === "mspace";
};

// Binary atoms (first class `mbin`) change into ordinary atoms (`mord`)
// depending on their surroundings. See TeXbook pg. 442-446, Rules 5 and 6,
// and the text before Rule 19.
var isBin = function isBin(node) {
    return node && node.classes[0] === "mbin";
};

var isBinLeftCanceller = function isBinLeftCanceller(node, isRealGroup) {
    // TODO: This code assumes that a node's math class is the first element
    // of its `classes` array. A later cleanup should ensure this, for
    // instance by changing the signature of `makeSpan`.
    if (node) {
        return _utils2.default.contains(["mbin", "mopen", "mrel", "mop", "mpunct"], node.classes[0]);
    } else {
        return isRealGroup;
    }
};

var isBinRightCanceller = function isBinRightCanceller(node, isRealGroup) {
    if (node) {
        return _utils2.default.contains(["mrel", "mclose", "mpunct"], node.classes[0]);
    } else {
        return isRealGroup;
    }
};

/**
 * Splice out any spaces from `children` starting at position `i`, and return
 * the spliced-out array. Returns null if `children[i]` does not exist or is not
 * a space.
 */
var spliceSpaces = exports.spliceSpaces = function spliceSpaces(children, i) {
    var j = i;
    while (j < children.length && isSpace(children[j])) {
        j++;
    }
    if (j === i) {
        return null;
    } else {
        return children.splice(i, j - i);
    }
};

/**
 * Take a list of nodes, build them in order, and return a list of the built
 * nodes. documentFragments are flattened into their contents, so the
 * returned list contains no fragments. `isRealGroup` is true if `expression`
 * is a real group (no atoms will be added on either side), as opposed to
 * a partial group (e.g. one created by \color).
 */
var buildExpression = exports.buildExpression = function buildExpression(expression, options, isRealGroup) {
    // Parse expressions into `groups`.
    var groups = [];
    for (var i = 0; i < expression.length; i++) {
        var group = expression[i];
        var output = buildGroup(group, options);
        if (output instanceof _domTree2.default.documentFragment) {
            Array.prototype.push.apply(groups, output.children);
        } else {
            groups.push(output);
        }
    }
    // At this point `groups` consists entirely of `symbolNode`s and `span`s.

    // Explicit spaces (e.g., \;, \,) should be ignored with respect to atom
    // spacing (e.g., "add thick space between mord and mrel"). Since CSS
    // adjacency rules implement atom spacing, spaces should be invisible to
    // CSS. So we splice them out of `groups` and into the atoms themselves.
    for (var _i = 0; _i < groups.length; _i++) {
        var spaces = spliceSpaces(groups, _i);
        if (spaces) {
            // Splicing of spaces may have removed all remaining groups.
            if (_i < groups.length) {
                // If there is a following group, move space within it.
                if (groups[_i] instanceof _domTree2.default.symbolNode) {
                    groups[_i] = makeSpan([].concat(groups[_i].classes), [groups[_i]]);
                }
                _buildCommon2.default.prependChildren(groups[_i], spaces);
            } else {
                // Otherwise, put any spaces back at the end of the groups.
                Array.prototype.push.apply(groups, spaces);
                break;
            }
        }
    }

    // Binary operators change to ordinary symbols in some contexts.
    for (var _i2 = 0; _i2 < groups.length; _i2++) {
        if (isBin(groups[_i2]) && (isBinLeftCanceller(groups[_i2 - 1], isRealGroup) || isBinRightCanceller(groups[_i2 + 1], isRealGroup))) {
            groups[_i2].classes[0] = "mord";
        }
    }

    // Process \\not commands within the group.
    // TODO(kevinb): Handle multiple \\not commands in a row.
    // TODO(kevinb): Handle \\not{abc} correctly.  The \\not should appear over
    // the 'a' instead of the 'c'.
    for (var _i3 = 0; _i3 < groups.length; _i3++) {
        if (groups[_i3].value === "\u0338" && _i3 + 1 < groups.length) {
            var children = groups.slice(_i3, _i3 + 2);

            children[0].classes = ["mainrm"];
            // \u0338 is a combining glyph so we could reorder the children so
            // that it comes after the other glyph.  This works correctly on
            // most browsers except for Safari.  Instead we absolutely position
            // the glyph and set its right side to match that of the other
            // glyph which is visually equivalent.
            children[0].style.position = "absolute";
            children[0].style.right = "0";

            // Copy the classes from the second glyph to the new container.
            // This is so it behaves the same as though there was no \\not.
            var classes = groups[_i3 + 1].classes;
            var container = makeSpan(classes, children);

            // LaTeX adds a space between ords separated by a \\not.
            if (classes.indexOf("mord") !== -1) {
                // \glue(\thickmuskip) 2.77771 plus 2.77771
                container.style.paddingLeft = "0.277771em";
            }

            // Ensure that the \u0338 is positioned relative to the container.
            container.style.position = "relative";
            groups.splice(_i3, 2, container);
        }
    }

    return groups;
};

// Return math atom class (mclass) of a domTree.
var getTypeOfDomTree = exports.getTypeOfDomTree = function getTypeOfDomTree(node) {
    if (node instanceof _domTree2.default.documentFragment) {
        if (node.children.length) {
            return getTypeOfDomTree(node.children[node.children.length - 1]);
        }
    } else {
        if (_utils2.default.contains(["mord", "mop", "mbin", "mrel", "mopen", "mclose", "mpunct", "minner"], node.classes[0])) {
            return node.classes[0];
        }
    }
    return null;
};

/**
 * Sometimes, groups perform special rules when they have superscripts or
 * subscripts attached to them. This function lets the `supsub` group know that
 * its inner element should handle the superscripts and subscripts instead of
 * handling them itself.
 */
var shouldHandleSupSub = function shouldHandleSupSub(group, options) {
    if (!group.value.base) {
        return false;
    } else {
        var base = group.value.base;
        if (base.type === "op") {
            // Operators handle supsubs differently when they have limits
            // (e.g. `\displaystyle\sum_2^3`)
            return base.value.limits && (options.style.size === _Style2.default.DISPLAY.size || base.value.alwaysHandleSupSub);
        } else if (base.type === "accent") {
            return _utils2.default.isCharacterBox(base.value.base);
        } else if (base.type === "horizBrace") {
            var isSup = group.value.sub ? false : true;
            return isSup === base.value.isOver;
        } else {
            return null;
        }
    }
};

var makeNullDelimiter = exports.makeNullDelimiter = function makeNullDelimiter(options, classes) {
    var moreClasses = ["nulldelimiter"].concat(options.baseSizingClasses());
    return makeSpan(classes.concat(moreClasses));
};

/**
 * This is a map of group types to the function used to handle that type.
 * Simpler types come at the beginning, while complicated types come afterwards.
 */
var groupTypes = exports.groupTypes = {};

groupTypes.mathord = function (group, options) {
    return _buildCommon2.default.makeOrd(group, options, "mathord");
};

groupTypes.textord = function (group, options) {
    return _buildCommon2.default.makeOrd(group, options, "textord");
};

groupTypes.bin = function (group, options) {
    return _buildCommon2.default.mathsym(group.value, group.mode, options, ["mbin"]);
};

groupTypes.rel = function (group, options) {
    return _buildCommon2.default.mathsym(group.value, group.mode, options, ["mrel"]);
};

groupTypes.open = function (group, options) {
    return _buildCommon2.default.mathsym(group.value, group.mode, options, ["mopen"]);
};

groupTypes.close = function (group, options) {
    return _buildCommon2.default.mathsym(group.value, group.mode, options, ["mclose"]);
};

groupTypes.inner = function (group, options) {
    return _buildCommon2.default.mathsym(group.value, group.mode, options, ["minner"]);
};

groupTypes.punct = function (group, options) {
    return _buildCommon2.default.mathsym(group.value, group.mode, options, ["mpunct"]);
};

groupTypes.ordgroup = function (group, options) {
    return makeSpan(["mord"], buildExpression(group.value, options, true), options);
};

groupTypes.supsub = function (group, options) {
    // Superscript and subscripts are handled in the TeXbook on page
    // 445-446, rules 18(a-f).

    // Here is where we defer to the inner group if it should handle
    // superscripts and subscripts itself.
    if (shouldHandleSupSub(group, options)) {
        return groupTypes[group.value.base.type](group, options);
    }

    var base = buildGroup(group.value.base, options);
    var supm = void 0;
    var subm = void 0;

    var metrics = options.fontMetrics();
    var newOptions = void 0;

    // Rule 18a
    var supShift = 0;
    var subShift = 0;

    if (group.value.sup) {
        newOptions = options.havingStyle(options.style.sup());
        supm = buildGroup(group.value.sup, newOptions, options);
        if (!_utils2.default.isCharacterBox(group.value.base)) {
            supShift = base.height - newOptions.fontMetrics().supDrop * newOptions.sizeMultiplier / options.sizeMultiplier;
        }
    }

    if (group.value.sub) {
        newOptions = options.havingStyle(options.style.sub());
        subm = buildGroup(group.value.sub, newOptions, options);
        if (!_utils2.default.isCharacterBox(group.value.base)) {
            subShift = base.depth + newOptions.fontMetrics().subDrop * newOptions.sizeMultiplier / options.sizeMultiplier;
        }
    }

    // Rule 18c
    var minSupShift = void 0;
    if (options.style === _Style2.default.DISPLAY) {
        minSupShift = metrics.sup1;
    } else if (options.style.cramped) {
        minSupShift = metrics.sup3;
    } else {
        minSupShift = metrics.sup2;
    }

    // scriptspace is a font-size-independent size, so scale it
    // appropriately
    var multiplier = options.sizeMultiplier;
    var scriptspace = 0.5 / metrics.ptPerEm / multiplier + "em";

    var supsub = void 0;
    if (!group.value.sup) {
        // Rule 18b
        subShift = Math.max(subShift, metrics.sub1, subm.height - 0.8 * metrics.xHeight);

        var vlistElem = [{ type: "elem", elem: subm, marginRight: scriptspace }];
        // Subscripts shouldn't be shifted by the base's italic correction.
        // Account for that by shifting the subscript back the appropriate
        // amount. Note we only do this when the base is a single symbol.
        if (base instanceof _domTree2.default.symbolNode) {
            vlistElem[0].marginLeft = -base.italic + "em";
        }

        supsub = _buildCommon2.default.makeVList({
            positionType: "shift",
            positionData: subShift,
            children: vlistElem
        }, options);
    } else if (!group.value.sub) {
        // Rule 18c, d
        supShift = Math.max(supShift, minSupShift, supm.depth + 0.25 * metrics.xHeight);

        supsub = _buildCommon2.default.makeVList({
            positionType: "shift",
            positionData: -supShift,
            children: [{ type: "elem", elem: supm, marginRight: scriptspace }]
        }, options);
    } else {
        supShift = Math.max(supShift, minSupShift, supm.depth + 0.25 * metrics.xHeight);
        subShift = Math.max(subShift, metrics.sub2);

        var ruleWidth = metrics.defaultRuleThickness;

        // Rule 18e
        if (supShift - supm.depth - (subm.height - subShift) < 4 * ruleWidth) {
            subShift = 4 * ruleWidth - (supShift - supm.depth) + subm.height;
            var psi = 0.8 * metrics.xHeight - (supShift - supm.depth);
            if (psi > 0) {
                supShift += psi;
                subShift -= psi;
            }
        }

        var _vlistElem = [{ type: "elem", elem: subm, shift: subShift, marginRight: scriptspace }, { type: "elem", elem: supm, shift: -supShift, marginRight: scriptspace }];
        // See comment above about subscripts not being shifted
        if (base instanceof _domTree2.default.symbolNode) {
            _vlistElem[0].marginLeft = -base.italic + "em";
        }

        supsub = _buildCommon2.default.makeVList({
            positionType: "individualShift",
            children: _vlistElem
        }, options);
    }

    // We ensure to wrap the supsub vlist in a span.msupsub to reset text-align
    var mclass = getTypeOfDomTree(base) || "mord";
    return makeSpan([mclass], [base, makeSpan(["msupsub"], [supsub])], options);
};

groupTypes.spacing = function (group, options) {
    if (group.value === "\\ " || group.value === "\\space" || group.value === " " || group.value === "~") {
        // Spaces are generated by adding an actual space. Each of these
        // things has an entry in the symbols table, so these will be turned
        // into appropriate outputs.
        if (group.mode === "text") {
            return _buildCommon2.default.makeOrd(group, options, "textord");
        } else {
            return makeSpan(["mspace"], [_buildCommon2.default.mathsym(group.value, group.mode, options)], options);
        }
    } else {
        // Other kinds of spaces are of arbitrary width. We use CSS to
        // generate these.
        return makeSpan(["mspace", _buildCommon2.default.spacingFunctions[group.value].className], [], options);
    }
};

function sizingGroup(value, options, baseOptions) {
    var inner = buildExpression(value, options, false);
    var multiplier = options.sizeMultiplier / baseOptions.sizeMultiplier;

    // Add size-resetting classes to the inner list and set maxFontSize
    // manually. Handle nested size changes.
    for (var i = 0; i < inner.length; i++) {
        var pos = _utils2.default.indexOf(inner[i].classes, "sizing");
        if (pos < 0) {
            Array.prototype.push.apply(inner[i].classes, options.sizingClasses(baseOptions));
        } else if (inner[i].classes[pos + 1] === "reset-size" + options.size) {
            // This is a nested size change: e.g., inner[i] is the "b" in
            // `\Huge a \small b`. Override the old size (the `reset-` class)
            // but not the new size.
            inner[i].classes[pos + 1] = "reset-size" + baseOptions.size;
        }

        inner[i].height *= multiplier;
        inner[i].depth *= multiplier;
    }

    return _buildCommon2.default.makeFragment(inner);
}

groupTypes.sizing = function (group, options) {
    // Handle sizing operators like \Huge. Real TeX doesn't actually allow
    // these functions inside of math expressions, so we do some special
    // handling.
    var newOptions = options.havingSize(group.value.size);
    return sizingGroup(group.value.value, newOptions, options);
};

groupTypes.styling = function (group, options) {
    // Style changes are handled in the TeXbook on pg. 442, Rule 3.

    // Figure out what style we're changing to.
    var styleMap = {
        "display": _Style2.default.DISPLAY,
        "text": _Style2.default.TEXT,
        "script": _Style2.default.SCRIPT,
        "scriptscript": _Style2.default.SCRIPTSCRIPT
    };

    var newStyle = styleMap[group.value.style];
    var newOptions = options.havingStyle(newStyle);
    return sizingGroup(group.value.value, newOptions, options);
};

groupTypes.font = function (group, options) {
    var font = group.value.font;
    return buildGroup(group.value.body, options.withFontFamily(font));
};

groupTypes.accent = function (group, options) {
    // Accents are handled in the TeXbook pg. 443, rule 12.
    var base = group.value.base;

    var supsubGroup = void 0;
    if (group.type === "supsub") {
        // If our base is a character box, and we have superscripts and
        // subscripts, the supsub will defer to us. In particular, we want
        // to attach the superscripts and subscripts to the inner body (so
        // that the position of the superscripts and subscripts won't be
        // affected by the height of the accent). We accomplish this by
        // sticking the base of the accent into the base of the supsub, and
        // rendering that, while keeping track of where the accent is.

        // The supsub group is the group that was passed in
        var supsub = group;
        // The real accent group is the base of the supsub group
        group = supsub.value.base;
        // The character box is the base of the accent group
        base = group.value.base;
        // Stick the character box into the base of the supsub group
        supsub.value.base = base;

        // Rerender the supsub group with its new base, and store that
        // result.
        supsubGroup = buildGroup(supsub, options);
    }

    // Build the base group
    var body = buildGroup(base, options.havingCrampedStyle());

    // Does the accent need to shift for the skew of a character?
    var mustShift = group.value.isShifty && _utils2.default.isCharacterBox(base);

    // Calculate the skew of the accent. This is based on the line "If the
    // nucleus is not a single character, let s = 0; otherwise set s to the
    // kern amount for the nucleus followed by the \skewchar of its font."
    // Note that our skew metrics are just the kern between each character
    // and the skewchar.
    var skew = 0;
    if (mustShift) {
        // If the base is a character box, then we want the skew of the
        // innermost character. To do that, we find the innermost character:
        var baseChar = _utils2.default.getBaseElem(base);
        // Then, we render its group to get the symbol inside it
        var baseGroup = buildGroup(baseChar, options.havingCrampedStyle());
        // Finally, we pull the skew off of the symbol.
        skew = baseGroup.skew;
        // Note that we now throw away baseGroup, because the layers we
        // removed with getBaseElem might contain things like \color which
        // we can't get rid of.
        // TODO(emily): Find a better way to get the skew
    }

    // calculate the amount of space between the body and the accent
    var clearance = Math.min(body.height, options.fontMetrics().xHeight);

    // Build the accent
    var accentBody = void 0;
    if (!group.value.isStretchy) {
        var accent = void 0;
        if (group.value.label === "\\vec") {
            // Before version 0.9, \vec used the combining font glyph U+20D7.
            // But browsers, especially Safari, are not consistent in how they
            // render combining characters when not preceded by a character.
            // So now we use an SVG.
            // If Safari reforms, we should consider reverting to the glyph.
            accent = _buildCommon2.default.staticSvg("vec", options);
            accent.width = parseFloat(accent.style.width);
        } else {
            accent = _buildCommon2.default.makeSymbol(group.value.label, "Main-Regular", group.mode, options);
        }
        // Remove the italic correction of the accent, because it only serves to
        // shift the accent over to a place we don't want.
        accent.italic = 0;

        accentBody = makeSpan(["accent-body"], [accent]);

        // CSS defines `.katex .accent .accent-body { width: 0 }`
        // so that the accent doesn't contribute to the bounding box.
        // We need to shift the character by its width (effectively half
        // its width) to compensate.
        var left = -accent.width / 2;

        // Shift the accent over by the skew.
        left += skew;

        // The \H character that the fonts use is a combining character, and
        // thus shows up much too far to the left. To account for this, we add
        // a manual shift of the width of one space.
        // TODO(emily): Fix this in a better way, like by changing the font
        if (group.value.label === '\\H') {
            left += 0.5; // twice width of space, or width of accent
        }

        accentBody.style.left = left + "em";

        accentBody = _buildCommon2.default.makeVList({
            positionType: "firstBaseline",
            children: [{ type: "elem", elem: body }, { type: "kern", size: -clearance }, { type: "elem", elem: accentBody }]
        }, options);
    } else {
        accentBody = _stretchy2.default.svgSpan(group, options);

        accentBody = _buildCommon2.default.makeVList({
            positionType: "firstBaseline",
            children: [{ type: "elem", elem: body }, { type: "elem", elem: accentBody }]
        }, options);

        var styleSpan = accentBody.children[0].children[0].children[1];
        styleSpan.classes.push("svg-align"); // text-align: left;
        if (skew > 0) {
            // Shorten the accent and nudge it to the right.
            styleSpan.style.width = "calc(100% - " + 2 * skew + "em)";
            styleSpan.style.marginLeft = 2 * skew + "em";
        }
    }

    var accentWrap = makeSpan(["mord", "accent"], [accentBody], options);

    if (supsubGroup) {
        // Here, we replace the "base" child of the supsub with our newly
        // generated accent.
        supsubGroup.children[0] = accentWrap;

        // Since we don't rerun the height calculation after replacing the
        // accent, we manually recalculate height.
        supsubGroup.height = Math.max(accentWrap.height, supsubGroup.height);

        // Accents should always be ords, even when their innards are not.
        supsubGroup.classes[0] = "mord";

        return supsubGroup;
    } else {
        return accentWrap;
    }
};

groupTypes.horizBrace = function (group, options) {
    var style = options.style;

    var hasSupSub = group.type === "supsub";
    var supSubGroup = void 0;
    var newOptions = void 0;
    if (hasSupSub) {
        // Ref: LaTeX source2e: }}}}\limits}
        // i.e. LaTeX treats the brace similar to an op and passes it
        // with \limits, so we need to assign supsub style.
        if (group.value.sup) {
            newOptions = options.havingStyle(style.sup());
            supSubGroup = buildGroup(group.value.sup, newOptions, options);
        } else {
            newOptions = options.havingStyle(style.sub());
            supSubGroup = buildGroup(group.value.sub, newOptions, options);
        }
        group = group.value.base;
    }

    // Build the base group
    var body = buildGroup(group.value.base, options.havingBaseStyle(_Style2.default.DISPLAY));

    // Create the stretchy element
    var braceBody = _stretchy2.default.svgSpan(group, options);

    // Generate the vlist, with the appropriate kerns               ┏━━━━━━━━┓
    // This first vlist contains the subject matter and the brace:   equation
    var vlist = void 0;
    if (group.value.isOver) {
        vlist = _buildCommon2.default.makeVList({
            positionType: "firstBaseline",
            children: [{ type: "elem", elem: body }, { type: "kern", size: 0.1 }, { type: "elem", elem: braceBody }]
        }, options);
        vlist.children[0].children[0].children[1].classes.push("svg-align");
    } else {
        vlist = _buildCommon2.default.makeVList({
            positionType: "bottom",
            positionData: body.depth + 0.1 + braceBody.height,
            children: [{ type: "elem", elem: braceBody }, { type: "kern", size: 0.1 }, { type: "elem", elem: body }]
        }, options);
        vlist.children[0].children[0].children[0].classes.push("svg-align");
    }

    if (hasSupSub) {
        // In order to write the supsub, wrap the first vlist in another vlist:
        // They can't all go in the same vlist, because the note might be wider
        // than the equation. We want the equation to control the brace width.

        //      note          long note           long note
        //   ┏━━━━━━━━┓   or    ┏━━━┓     not    ┏━━━━━━━━━┓
        //    equation           eqn                 eqn

        var vSpan = makeSpan(["mord", group.value.isOver ? "mover" : "munder"], [vlist], options);

        if (group.value.isOver) {
            vlist = _buildCommon2.default.makeVList({
                positionType: "firstBaseline",
                children: [{ type: "elem", elem: vSpan }, { type: "kern", size: 0.2 }, { type: "elem", elem: supSubGroup }]
            }, options);
        } else {
            vlist = _buildCommon2.default.makeVList({
                positionType: "bottom",
                positionData: vSpan.depth + 0.2 + supSubGroup.height,
                children: [{ type: "elem", elem: supSubGroup }, { type: "kern", size: 0.2 }, { type: "elem", elem: vSpan }]
            }, options);
        }
    }

    return makeSpan(["mord", group.value.isOver ? "mover" : "munder"], [vlist], options);
};

groupTypes.accentUnder = function (group, options) {
    // Treat under accents much like underlines.
    var innerGroup = buildGroup(group.value.base, options);

    var accentBody = _stretchy2.default.svgSpan(group, options);
    var kern = /tilde/.test(group.value.label) ? 0.12 : 0;

    // Generate the vlist, with the appropriate kerns
    var vlist = _buildCommon2.default.makeVList({
        positionType: "bottom",
        positionData: accentBody.height + kern,
        children: [{ type: "elem", elem: accentBody }, { type: "kern", size: kern }, { type: "elem", elem: innerGroup }]
    }, options);

    vlist.children[0].children[0].children[0].classes.push("svg-align");

    return makeSpan(["mord", "accentunder"], [vlist], options);
};

groupTypes.xArrow = function (group, options) {
    var style = options.style;

    // Build the argument groups in the appropriate style.
    // Ref: amsmath.dtx:   \hbox{$\scriptstyle\mkern#3mu{#6}\mkern#4mu$}%

    var newOptions = options.havingStyle(style.sup());
    var upperGroup = buildGroup(group.value.body, newOptions, options);
    upperGroup.classes.push("x-arrow-pad");

    var lowerGroup = void 0;
    if (group.value.below) {
        // Build the lower group
        newOptions = options.havingStyle(style.sub());
        lowerGroup = buildGroup(group.value.below, newOptions, options);
        lowerGroup.classes.push("x-arrow-pad");
    }

    var arrowBody = _stretchy2.default.svgSpan(group, options);

    // Re shift: Note that stretchy.svgSpan returned arrowBody.depth = 0.
    // The point we want on the math axis is at 0.5 * arrowBody.height.
    var arrowShift = -options.fontMetrics().axisHeight + 0.5 * arrowBody.height;
    // 2 mu kern. Ref: amsmath.dtx: #7\if0#2\else\mkern#2mu\fi
    var upperShift = -options.fontMetrics().axisHeight - 0.5 * arrowBody.height - 0.111;

    // Generate the vlist
    var vlist = void 0;
    if (group.value.below) {
        var lowerShift = -options.fontMetrics().axisHeight + lowerGroup.height + 0.5 * arrowBody.height + 0.111;
        vlist = _buildCommon2.default.makeVList({
            positionType: "individualShift",
            children: [{ type: "elem", elem: upperGroup, shift: upperShift }, { type: "elem", elem: arrowBody, shift: arrowShift }, { type: "elem", elem: lowerGroup, shift: lowerShift }]
        }, options);
    } else {
        vlist = _buildCommon2.default.makeVList({
            positionType: "individualShift",
            children: [{ type: "elem", elem: upperGroup, shift: upperShift }, { type: "elem", elem: arrowBody, shift: arrowShift }]
        }, options);
    }

    vlist.children[0].children[0].children[1].classes.push("svg-align");

    return makeSpan(["mrel", "x-arrow"], [vlist], options);
};

groupTypes.mclass = function (group, options) {
    var elements = buildExpression(group.value.value, options, true);

    return makeSpan([group.value.mclass], elements, options);
};

groupTypes.raisebox = function (group, options) {
    var body = groupTypes.sizing({ value: {
            value: [{
                type: "text",
                value: {
                    body: group.value.value,
                    font: "mathrm" // simulate \textrm
                }
            }],
            size: 6 // simulate \normalsize
        } }, options);
    var dy = (0, _units.calculateSize)(group.value.dy.value, options);
    return _buildCommon2.default.makeVList({
        positionType: "shift",
        positionData: -dy,
        children: [{ type: "elem", elem: body }]
    }, options);
};

/**
 * buildGroup is the function that takes a group and calls the correct groupType
 * function for it. It also handles the interaction of size and style changes
 * between parents and children.
 */
var buildGroup = exports.buildGroup = function buildGroup(group, options, baseOptions) {
    if (!group) {
        return makeSpan();
    }

    if (groupTypes[group.type]) {
        // Call the groupTypes function
        var groupNode = groupTypes[group.type](group, options);

        // If the size changed between the parent and the current group, account
        // for that size difference.
        if (baseOptions && options.size !== baseOptions.size) {
            groupNode = makeSpan(options.sizingClasses(baseOptions), [groupNode], options);

            var multiplier = options.sizeMultiplier / baseOptions.sizeMultiplier;

            groupNode.height *= multiplier;
            groupNode.depth *= multiplier;
        }

        return groupNode;
    } else {
        throw new _ParseError2.default("Got group of unknown type: '" + group.type + "'");
    }
};

/**
 * Take an entire parse tree, and build it into an appropriate set of HTML
 * nodes.
 */
function buildHTML(tree, options) {
    // buildExpression is destructive, so we need to make a clone
    // of the incoming tree so that it isn't accidentally changed
    tree = JSON.parse((0, _stringify2.default)(tree));

    // Build the expression contained in the tree
    var expression = buildExpression(tree, options, true);
    var body = makeSpan(["base"], expression, options);

    // Add struts, which ensure that the top of the HTML element falls at the
    // height of the expression, and the bottom of the HTML element falls at the
    // depth of the expression.
    var topStrut = makeSpan(["strut"]);
    var bottomStrut = makeSpan(["strut", "bottom"]);

    topStrut.style.height = body.height + "em";
    bottomStrut.style.height = body.height + body.depth + "em";
    // We'd like to use `vertical-align: top` but in IE 9 this lowers the
    // baseline of the box to the bottom of this strut (instead staying in the
    // normal place) so we use an absolute value for vertical-align instead
    bottomStrut.style.verticalAlign = -body.depth + "em";

    // Wrap the struts and body together
    var htmlNode = makeSpan(["katex-html"], [topStrut, bottomStrut, body]);

    htmlNode.setAttribute("aria-hidden", "true");

    return htmlNode;
}

},{"./ParseError":84,"./Style":89,"./buildCommon":91,"./domTree":98,"./stretchy":126,"./units":132,"./utils":133,"babel-runtime/core-js/json/stringify":5}],93:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.buildGroup = exports.buildExpression = exports.groupTypes = exports.makeText = undefined;
exports.default = buildMathML;

var _buildCommon = require("./buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _fontMetrics = require("./fontMetrics");

var _fontMetrics2 = _interopRequireDefault(_fontMetrics);

var _mathMLTree = require("./mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _ParseError = require("./ParseError");

var _ParseError2 = _interopRequireDefault(_ParseError);

var _Style = require("./Style");

var _Style2 = _interopRequireDefault(_Style);

var _symbols = require("./symbols");

var _symbols2 = _interopRequireDefault(_symbols);

var _utils = require("./utils");

var _utils2 = _interopRequireDefault(_utils);

var _stretchy = require("./stretchy");

var _stretchy2 = _interopRequireDefault(_stretchy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a symbol and converts it into a MathML text node after performing
 * optional replacement from symbols.js.
 */
/**
 * WARNING: New methods on groupTypes should be added to src/functions.
 *
 * This file converts a parse tree into a cooresponding MathML tree. The main
 * entry point is the `buildMathML` function, which takes a parse tree from the
 * parser.
 */

var makeText = exports.makeText = function makeText(text, mode) {
    if (_symbols2.default[mode][text] && _symbols2.default[mode][text].replace) {
        text = _symbols2.default[mode][text].replace;
    }

    return new _mathMLTree2.default.TextNode(text);
};

/**
 * Returns the math variant as a string or null if none is required.
 */
var getVariant = function getVariant(group, options) {
    var font = options.fontFamily;
    if (!font) {
        return null;
    }

    var mode = group.mode;
    if (font === "mathit") {
        return "italic";
    } else if (font === "boldsymbol") {
        return "bold-italic";
    }

    var value = group.value;
    if (_utils2.default.contains(["\\imath", "\\jmath"], value)) {
        return null;
    }

    if (_symbols2.default[mode][value] && _symbols2.default[mode][value].replace) {
        value = _symbols2.default[mode][value].replace;
    }

    var fontName = _buildCommon2.default.fontMap[font].fontName;
    if (_fontMetrics2.default.getCharacterMetrics(value, fontName)) {
        return _buildCommon2.default.fontMap[font].variant;
    }

    return null;
};

/**
 * Functions for handling the different types of groups found in the parse
 * tree. Each function should take a parse group and return a MathML node.
 */
var groupTypes = exports.groupTypes = {};

var defaultVariant = {
    "mi": "italic",
    "mn": "normal",
    "mtext": "normal"
};

groupTypes.mathord = function (group, options) {
    var node = new _mathMLTree2.default.MathNode("mi", [makeText(group.value, group.mode)]);

    var variant = getVariant(group, options) || "italic";
    if (variant !== defaultVariant[node.type]) {
        node.setAttribute("mathvariant", variant);
    }
    return node;
};

groupTypes.textord = function (group, options) {
    var text = makeText(group.value, group.mode);

    var variant = getVariant(group, options) || "normal";

    var node = void 0;
    if (group.mode === 'text') {
        node = new _mathMLTree2.default.MathNode("mtext", [text]);
    } else if (/[0-9]/.test(group.value)) {
        // TODO(kevinb) merge adjacent <mn> nodes
        // do it as a post processing step
        node = new _mathMLTree2.default.MathNode("mn", [text]);
    } else if (group.value === "\\prime") {
        node = new _mathMLTree2.default.MathNode("mo", [text]);
    } else {
        node = new _mathMLTree2.default.MathNode("mi", [text]);
    }
    if (variant !== defaultVariant[node.type]) {
        node.setAttribute("mathvariant", variant);
    }

    return node;
};

groupTypes.bin = function (group, options) {
    var node = new _mathMLTree2.default.MathNode("mo", [makeText(group.value, group.mode)]);

    var variant = getVariant(group, options);
    if (variant === "bold-italic") {
        node.setAttribute("mathvariant", variant);
    }

    return node;
};

groupTypes.rel = function (group) {
    var node = new _mathMLTree2.default.MathNode("mo", [makeText(group.value, group.mode)]);

    return node;
};

groupTypes.open = function (group) {
    var node = new _mathMLTree2.default.MathNode("mo", [makeText(group.value, group.mode)]);

    return node;
};

groupTypes.close = function (group) {
    var node = new _mathMLTree2.default.MathNode("mo", [makeText(group.value, group.mode)]);

    return node;
};

groupTypes.inner = function (group) {
    var node = new _mathMLTree2.default.MathNode("mo", [makeText(group.value, group.mode)]);

    return node;
};

groupTypes.punct = function (group) {
    var node = new _mathMLTree2.default.MathNode("mo", [makeText(group.value, group.mode)]);

    node.setAttribute("separator", "true");

    return node;
};

groupTypes.ordgroup = function (group, options) {
    var inner = buildExpression(group.value, options);

    var node = new _mathMLTree2.default.MathNode("mrow", inner);

    return node;
};

groupTypes.supsub = function (group, options) {
    // Is the inner group a relevant horizonal brace?
    var isBrace = false;
    var isOver = void 0;
    var isSup = void 0;
    if (group.value.base) {
        if (group.value.base.value.type === "horizBrace") {
            isSup = group.value.sup ? true : false;
            if (isSup === group.value.base.value.isOver) {
                isBrace = true;
                isOver = group.value.base.value.isOver;
            }
        }
    }

    var removeUnnecessaryRow = true;
    var children = [buildGroup(group.value.base, options, removeUnnecessaryRow)];

    if (group.value.sub) {
        children.push(buildGroup(group.value.sub, options, removeUnnecessaryRow));
    }

    if (group.value.sup) {
        children.push(buildGroup(group.value.sup, options, removeUnnecessaryRow));
    }

    var nodeType = void 0;
    if (isBrace) {
        nodeType = isOver ? "mover" : "munder";
    } else if (!group.value.sub) {
        var base = group.value.base;
        if (base && base.value.limits && options.style === _Style2.default.DISPLAY) {
            nodeType = "mover";
        } else {
            nodeType = "msup";
        }
    } else if (!group.value.sup) {
        var _base = group.value.base;
        if (_base && _base.value.limits && options.style === _Style2.default.DISPLAY) {
            nodeType = "munder";
        } else {
            nodeType = "msub";
        }
    } else {
        var _base2 = group.value.base;
        if (_base2 && _base2.value.limits && options.style === _Style2.default.DISPLAY) {
            nodeType = "munderover";
        } else {
            nodeType = "msubsup";
        }
    }

    var node = new _mathMLTree2.default.MathNode(nodeType, children);

    return node;
};

groupTypes.accent = function (group, options) {
    var accentNode = void 0;
    if (group.value.isStretchy) {
        accentNode = _stretchy2.default.mathMLnode(group.value.label);
    } else {
        accentNode = new _mathMLTree2.default.MathNode("mo", [makeText(group.value.label, group.mode)]);
    }

    var node = new _mathMLTree2.default.MathNode("mover", [buildGroup(group.value.base, options), accentNode]);

    node.setAttribute("accent", "true");

    return node;
};

groupTypes.spacing = function (group) {
    var node = void 0;

    if (group.value === "\\ " || group.value === "\\space" || group.value === " " || group.value === "~") {
        node = new _mathMLTree2.default.MathNode("mtext", [new _mathMLTree2.default.TextNode("\xA0")]);
    } else {
        node = new _mathMLTree2.default.MathNode("mspace");

        node.setAttribute("width", _buildCommon2.default.spacingFunctions[group.value].size);
    }

    return node;
};

groupTypes.font = function (group, options) {
    var font = group.value.font;
    return buildGroup(group.value.body, options.withFontFamily(font));
};

groupTypes.styling = function (group, options) {
    // Figure out what style we're changing to.
    // TODO(kevinb): dedupe this with buildHTML.js
    // This will be easier of handling of styling nodes is in the same file.
    var styleMap = {
        "display": _Style2.default.DISPLAY,
        "text": _Style2.default.TEXT,
        "script": _Style2.default.SCRIPT,
        "scriptscript": _Style2.default.SCRIPTSCRIPT
    };

    var newStyle = styleMap[group.value.style];
    var newOptions = options.havingStyle(newStyle);

    var inner = buildExpression(group.value.value, newOptions);

    var node = new _mathMLTree2.default.MathNode("mstyle", inner);

    var styleAttributes = {
        "display": ["0", "true"],
        "text": ["0", "false"],
        "script": ["1", "false"],
        "scriptscript": ["2", "false"]
    };

    var attr = styleAttributes[group.value.style];

    node.setAttribute("scriptlevel", attr[0]);
    node.setAttribute("displaystyle", attr[1]);

    return node;
};

groupTypes.sizing = function (group, options) {
    var newOptions = options.havingSize(group.value.size);
    var inner = buildExpression(group.value.value, newOptions);

    var node = new _mathMLTree2.default.MathNode("mstyle", inner);

    // TODO(emily): This doesn't produce the correct size for nested size
    // changes, because we don't keep state of what style we're currently
    // in, so we can't reset the size to normal before changing it.  Now
    // that we're passing an options parameter we should be able to fix
    // this.
    node.setAttribute("mathsize", newOptions.sizeMultiplier + "em");

    return node;
};

groupTypes.accentUnder = function (group, options) {
    var accentNode = _stretchy2.default.mathMLnode(group.value.label);
    var node = new _mathMLTree2.default.MathNode("munder", [buildGroup(group.value.body, options), accentNode]);
    node.setAttribute("accentunder", "true");
    return node;
};

groupTypes.horizBrace = function (group, options) {
    var accentNode = _stretchy2.default.mathMLnode(group.value.label);
    return new _mathMLTree2.default.MathNode(group.value.isOver ? "mover" : "munder", [buildGroup(group.value.base, options), accentNode]);
};

groupTypes.xArrow = function (group, options) {
    var arrowNode = _stretchy2.default.mathMLnode(group.value.label);
    var node = void 0;
    var lowerNode = void 0;

    if (group.value.body) {
        var upperNode = buildGroup(group.value.body, options);
        if (group.value.below) {
            lowerNode = buildGroup(group.value.below, options);
            node = new _mathMLTree2.default.MathNode("munderover", [arrowNode, lowerNode, upperNode]);
        } else {
            node = new _mathMLTree2.default.MathNode("mover", [arrowNode, upperNode]);
        }
    } else if (group.value.below) {
        lowerNode = buildGroup(group.value.below, options);
        node = new _mathMLTree2.default.MathNode("munder", [arrowNode, lowerNode]);
    } else {
        node = new _mathMLTree2.default.MathNode("mover", [arrowNode]);
    }
    return node;
};

groupTypes.mclass = function (group, options) {
    var inner = buildExpression(group.value.value, options);
    return new _mathMLTree2.default.MathNode("mstyle", inner);
};

groupTypes.raisebox = function (group, options) {
    var node = new _mathMLTree2.default.MathNode("mpadded", [buildGroup(group.value.body, options)]);
    var dy = group.value.dy.value.number + group.value.dy.value.unit;
    node.setAttribute("voffset", dy);
    return node;
};

/**
 * Takes a list of nodes, builds them, and returns a list of the generated
 * MathML nodes. A little simpler than the HTML version because we don't do any
 * previous-node handling.
 */
var buildExpression = exports.buildExpression = function buildExpression(expression, options) {
    var groups = [];
    for (var i = 0; i < expression.length; i++) {
        var group = expression[i];
        groups.push(buildGroup(group, options));
    }

    // TODO(kevinb): combine \\not with mrels and mords

    return groups;
};

/**
 * Takes a group from the parser and calls the appropriate groupTypes function
 * on it to produce a MathML node.
 */
var buildGroup = exports.buildGroup = function buildGroup(group, options) {
    var removeUnnecessaryRow = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    if (!group) {
        return new _mathMLTree2.default.MathNode("mrow");
    }

    if (groupTypes[group.type]) {
        // Call the groupTypes function
        var result = groupTypes[group.type](group, options);
        if (removeUnnecessaryRow) {
            if (result.type === "mrow" && result.children.length === 1) {
                return result.children[0];
            }
        }
        return result;
    } else {
        throw new _ParseError2.default("Got group of unknown type: '" + group.type + "'");
    }
};

/**
 * Takes a full parse tree and settings and builds a MathML representation of
 * it. In particular, we put the elements from building the parse tree into a
 * <semantics> tag so we can also include that TeX source as an annotation.
 *
 * Note that we actually return a domTree element with a `<math>` inside it so
 * we can do appropriate styling.
 */
function buildMathML(tree, texExpression, options) {
    var expression = buildExpression(tree, options);

    // Wrap up the expression in an mrow so it is presented in the semantics
    // tag correctly.
    var wrapper = new _mathMLTree2.default.MathNode("mrow", expression);

    // Build a TeX annotation of the source
    var annotation = new _mathMLTree2.default.MathNode("annotation", [new _mathMLTree2.default.TextNode(texExpression)]);

    annotation.setAttribute("encoding", "application/x-tex");

    var semantics = new _mathMLTree2.default.MathNode("semantics", [wrapper, annotation]);

    var math = new _mathMLTree2.default.MathNode("math", [semantics]);

    // You can't style <math> nodes, so we wrap the node in a span.
    return _buildCommon2.default.makeSpan(["katex-mathml"], [math]);
}

},{"./ParseError":84,"./Style":89,"./buildCommon":91,"./fontMetrics":101,"./mathMLTree":124,"./stretchy":126,"./symbols":128,"./utils":133}],94:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.buildHTMLTree = exports.buildTree = undefined;

var _buildHTML = require("./buildHTML");

var _buildHTML2 = _interopRequireDefault(_buildHTML);

var _buildMathML = require("./buildMathML");

var _buildMathML2 = _interopRequireDefault(_buildMathML);

var _buildCommon = require("./buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _Options = require("./Options");

var _Options2 = _interopRequireDefault(_Options);

var _Settings = require("./Settings");

var _Settings2 = _interopRequireDefault(_Settings);

var _Style = require("./Style");

var _Style2 = _interopRequireDefault(_Style);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var optionsFromSettings = function optionsFromSettings(settings) {
    return new _Options2.default({
        style: settings.displayMode ? _Style2.default.DISPLAY : _Style2.default.TEXT,
        maxSize: settings.maxSize
    });
};

var buildTree = exports.buildTree = function buildTree(tree, expression, settings) {
    var options = optionsFromSettings(settings);
    // `buildHTML` sometimes messes with the parse tree (like turning bins ->
    // ords), so we build the MathML version first.
    var mathMLNode = (0, _buildMathML2.default)(tree, expression, options);
    var htmlNode = (0, _buildHTML2.default)(tree, options);

    var katexNode = _buildCommon2.default.makeSpan(["katex"], [mathMLNode, htmlNode]);

    if (settings.displayMode) {
        return _buildCommon2.default.makeSpan(["katex-display"], [katexNode]);
    } else {
        return katexNode;
    }
};

var buildHTMLTree = exports.buildHTMLTree = function buildHTMLTree(tree, expression, settings) {
    var options = optionsFromSettings(settings);
    var htmlNode = (0, _buildHTML2.default)(tree, options);
    var katexNode = _buildCommon2.default.makeSpan(["katex"], [htmlNode]);
    if (settings.displayMode) {
        return _buildCommon2.default.makeSpan(["katex-display"], [katexNode]);
    } else {
        return katexNode;
    }
};

exports.default = buildTree;

},{"./Options":83,"./Settings":87,"./Style":89,"./buildCommon":91,"./buildHTML":92,"./buildMathML":93}],95:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports._environments = undefined;
exports.default = defineEnvironment;

var _buildHTML = require("./buildHTML");

var _buildMathML = require("./buildMathML");

var _Options = require("./Options");

var _Options2 = _interopRequireDefault(_Options);

var _ParseNode = require("./ParseNode");

var _ParseNode2 = _interopRequireDefault(_ParseNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * All registered environments.
 * `environments.js` exports this same dictionary again and makes it public.
 * `Parser.js` requires this dictionary via `environments.js`.
 */


/**
 * The context contains the following properties:
 *  - mode: current parsing mode.
 *  - envName: the name of the environment, one of the listed names.
 *  - parser: the parser object.
 */


/**
 *  - context: information and references provided by the parser
 *  - args: an array of arguments passed to \begin{name}
 *  - optArgs: an array of optional arguments passed to \begin{name}
 */


/**
 *  - numArgs: (default 0) The number of arguments after the \begin{name} function.
 *  - argTypes: (optional) Just like for a function
 *  - allowedInText: (default false) Whether or not the environment is allowed
 *                   inside text mode (not enforced yet).
 *  - numOptionalArgs: (default 0) Just like for a function
 */


/**
 * Final enviornment spec for use at parse time.
 * This is almost identical to `EnvDefSpec`, except it
 * 1. includes the function handler
 * 2. requires all arguments except argType
 * It is generated by `defineEnvironment()` below.
 */
var _environments = exports._environments = {};

function defineEnvironment(_ref) {
    var type = _ref.type,
        names = _ref.names,
        props = _ref.props,
        handler = _ref.handler,
        htmlBuilder = _ref.htmlBuilder,
        mathmlBuilder = _ref.mathmlBuilder;

    // Set default values of environments
    var data = {
        numArgs: props.numArgs || 0,
        greediness: 1,
        allowedInText: false,
        numOptionalArgs: 0,
        handler: handler
    };
    for (var i = 0; i < names.length; ++i) {
        _environments[names[i]] = data;
    }
    if (htmlBuilder) {
        _buildHTML.groupTypes[type] = htmlBuilder;
    }
    if (mathmlBuilder) {
        _buildMathML.groupTypes[type] = mathmlBuilder;
    }
}

},{"./Options":83,"./ParseNode":85,"./buildHTML":92,"./buildMathML":93}],96:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ordargument = exports._functions = undefined;
exports.default = defineFunction;

var _buildHTML = require("./buildHTML");

var _buildMathML = require("./buildMathML");

/**
 * All registered functions.
 * `functions.js` just exports this same dictionary again and makes it public.
 * `Parser.js` requires this dictionary.
 */


/** Context provided to function handlers for error messages. */


// TODO: Enumerate all allowed output types.


/**
 * Final function spec for use at parse time.
 * This is almost identical to `FunctionPropSpec`, except it
 * 1. includes the function handler, and
 * 2. requires all arguments except argTypes.
 * It is generated by `defineFunction()` below.
 */
var _functions = exports._functions = {};

function defineFunction(_ref) {
    var type = _ref.type,
        names = _ref.names,
        props = _ref.props,
        handler = _ref.handler,
        htmlBuilder = _ref.htmlBuilder,
        mathmlBuilder = _ref.mathmlBuilder;

    // Set default values of functions
    var data = {
        numArgs: props.numArgs,
        argTypes: props.argTypes,
        greediness: props.greediness === undefined ? 1 : props.greediness,
        allowedInText: !!props.allowedInText,
        allowedInMath: props.allowedInMath === undefined ? true : props.allowedInMath,
        numOptionalArgs: props.numOptionalArgs || 0,
        infix: !!props.infix,
        handler: handler
    };
    for (var i = 0; i < names.length; ++i) {
        _functions[names[i]] = data;
    }
    if (type) {
        if (htmlBuilder) {
            _buildHTML.groupTypes[type] = htmlBuilder;
        }
        if (mathmlBuilder) {
            _buildMathML.groupTypes[type] = mathmlBuilder;
        }
    }
}

// Since the corresponding buildHTML/buildMathML function expects a
// list of elements, we normalize for different kinds of arguments
var ordargument = exports.ordargument = function ordargument(arg) {
    if (arg.type === "ordgroup") {
        return arg.value;
    } else {
        return [arg];
    }
};

},{"./buildHTML":92,"./buildMathML":93}],97:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ParseError = require("./ParseError");

var _ParseError2 = _interopRequireDefault(_ParseError);

var _Style = require("./Style");

var _Style2 = _interopRequireDefault(_Style);

var _domTree = require("./domTree");

var _domTree2 = _interopRequireDefault(_domTree);

var _buildCommon = require("./buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _fontMetrics = require("./fontMetrics");

var _fontMetrics2 = _interopRequireDefault(_fontMetrics);

var _symbols = require("./symbols");

var _symbols2 = _interopRequireDefault(_symbols);

var _utils = require("./utils");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get the metrics for a given symbol and font, after transformation (i.e.
 * after following replacement from symbols.js)
 */
var getMetrics = function getMetrics(symbol, font) {
    if (_symbols2.default.math[symbol] && _symbols2.default.math[symbol].replace) {
        return _fontMetrics2.default.getCharacterMetrics(_symbols2.default.math[symbol].replace, font);
    } else {
        return _fontMetrics2.default.getCharacterMetrics(symbol, font);
    }
};

/**
 * Puts a delimiter span in a given style, and adds appropriate height, depth,
 * and maxFontSizes.
 */
/**
 * This file deals with creating delimiters of various sizes. The TeXbook
 * discusses these routines on page 441-442, in the "Another subroutine sets box
 * x to a specified variable delimiter" paragraph.
 *
 * There are three main routines here. `makeSmallDelim` makes a delimiter in the
 * normal font, but in either text, script, or scriptscript style.
 * `makeLargeDelim` makes a delimiter in textstyle, but in one of the Size1,
 * Size2, Size3, or Size4 fonts. `makeStackedDelim` makes a delimiter out of
 * smaller pieces that are stacked on top of one another.
 *
 * The functions take a parameter `center`, which determines if the delimiter
 * should be centered around the axis.
 *
 * Then, there are three exposed functions. `sizedDelim` makes a delimiter in
 * one of the given sizes. This is used for things like `\bigl`.
 * `customSizedDelim` makes a delimiter with a given total height+depth. It is
 * called in places like `\sqrt`. `leftRightDelim` makes an appropriate
 * delimiter which surrounds an expression of a given height an depth. It is
 * used in `\left` and `\right`.
 */

var styleWrap = function styleWrap(delim, toStyle, options, classes) {
    var newOptions = options.havingBaseStyle(toStyle);

    var span = _buildCommon2.default.makeSpan((classes || []).concat(newOptions.sizingClasses(options)), [delim], options);

    span.delimSizeMultiplier = newOptions.sizeMultiplier / options.sizeMultiplier;
    span.height *= span.delimSizeMultiplier;
    span.depth *= span.delimSizeMultiplier;
    span.maxFontSize = newOptions.sizeMultiplier;

    return span;
};

var centerSpan = function centerSpan(span, options, style) {
    var newOptions = options.havingBaseStyle(style);
    var shift = (1 - options.sizeMultiplier / newOptions.sizeMultiplier) * options.fontMetrics().axisHeight;

    span.classes.push("delimcenter");
    span.style.top = shift + "em";
    span.height -= shift;
    span.depth += shift;
};

/**
 * Makes a small delimiter. This is a delimiter that comes in the Main-Regular
 * font, but is restyled to either be in textstyle, scriptstyle, or
 * scriptscriptstyle.
 */
var makeSmallDelim = function makeSmallDelim(delim, style, center, options, mode, classes) {
    var text = _buildCommon2.default.makeSymbol(delim, "Main-Regular", mode, options);
    var span = styleWrap(text, style, options, classes);
    if (center) {
        centerSpan(span, options, style);
    }
    return span;
};

/**
 * Builds a symbol in the given font size (note size is an integer)
 */
var mathrmSize = function mathrmSize(value, size, mode, options) {
    return _buildCommon2.default.makeSymbol(value, "Size" + size + "-Regular", mode, options);
};

/**
 * Makes a large delimiter. This is a delimiter that comes in the Size1, Size2,
 * Size3, or Size4 fonts. It is always rendered in textstyle.
 */
var makeLargeDelim = function makeLargeDelim(delim, size, center, options, mode, classes) {
    var inner = mathrmSize(delim, size, mode, options);
    var span = styleWrap(_buildCommon2.default.makeSpan(["delimsizing", "size" + size], [inner], options), _Style2.default.TEXT, options, classes);
    if (center) {
        centerSpan(span, options, _Style2.default.TEXT);
    }
    return span;
};

/**
 * Make an inner span with the given offset and in the given font. This is used
 * in `makeStackedDelim` to make the stacking pieces for the delimiter.
 */
var makeInner = function makeInner(symbol, font, mode) {
    var sizeClass = void 0;
    // Apply the correct CSS class to choose the right font.
    if (font === "Size1-Regular") {
        sizeClass = "delim-size1";
    } else if (font === "Size4-Regular") {
        sizeClass = "delim-size4";
    }

    var inner = _buildCommon2.default.makeSpan(["delimsizinginner", sizeClass], [_buildCommon2.default.makeSpan([], [_buildCommon2.default.makeSymbol(symbol, font, mode)])]);

    // Since this will be passed into `makeVList` in the end, wrap the element
    // in the appropriate tag that VList uses.
    return { type: "elem", elem: inner };
};

/**
 * Make a stacked delimiter out of a given delimiter, with the total height at
 * least `heightTotal`. This routine is mentioned on page 442 of the TeXbook.
 */
var makeStackedDelim = function makeStackedDelim(delim, heightTotal, center, options, mode, classes) {
    // There are four parts, the top, an optional middle, a repeated part, and a
    // bottom.
    var top = void 0;
    var middle = void 0;
    var repeat = void 0;
    var bottom = void 0;
    top = repeat = bottom = delim;
    middle = null;
    // Also keep track of what font the delimiters are in
    var font = "Size1-Regular";

    // We set the parts and font based on the symbol. Note that we use
    // '\u23d0' instead of '|' and '\u2016' instead of '\\|' for the
    // repeats of the arrows
    if (delim === "\\uparrow") {
        repeat = bottom = "\u23D0";
    } else if (delim === "\\Uparrow") {
        repeat = bottom = "\u2016";
    } else if (delim === "\\downarrow") {
        top = repeat = "\u23D0";
    } else if (delim === "\\Downarrow") {
        top = repeat = "\u2016";
    } else if (delim === "\\updownarrow") {
        top = "\\uparrow";
        repeat = "\u23D0";
        bottom = "\\downarrow";
    } else if (delim === "\\Updownarrow") {
        top = "\\Uparrow";
        repeat = "\u2016";
        bottom = "\\Downarrow";
    } else if (delim === "[" || delim === "\\lbrack") {
        top = "\u23A1";
        repeat = "\u23A2";
        bottom = "\u23A3";
        font = "Size4-Regular";
    } else if (delim === "]" || delim === "\\rbrack") {
        top = "\u23A4";
        repeat = "\u23A5";
        bottom = "\u23A6";
        font = "Size4-Regular";
    } else if (delim === "\\lfloor") {
        repeat = top = "\u23A2";
        bottom = "\u23A3";
        font = "Size4-Regular";
    } else if (delim === "\\lceil") {
        top = "\u23A1";
        repeat = bottom = "\u23A2";
        font = "Size4-Regular";
    } else if (delim === "\\rfloor") {
        repeat = top = "\u23A5";
        bottom = "\u23A6";
        font = "Size4-Regular";
    } else if (delim === "\\rceil") {
        top = "\u23A4";
        repeat = bottom = "\u23A5";
        font = "Size4-Regular";
    } else if (delim === "(") {
        top = "\u239B";
        repeat = "\u239C";
        bottom = "\u239D";
        font = "Size4-Regular";
    } else if (delim === ")") {
        top = "\u239E";
        repeat = "\u239F";
        bottom = "\u23A0";
        font = "Size4-Regular";
    } else if (delim === "\\{" || delim === "\\lbrace") {
        top = "\u23A7";
        middle = "\u23A8";
        bottom = "\u23A9";
        repeat = "\u23AA";
        font = "Size4-Regular";
    } else if (delim === "\\}" || delim === "\\rbrace") {
        top = "\u23AB";
        middle = "\u23AC";
        bottom = "\u23AD";
        repeat = "\u23AA";
        font = "Size4-Regular";
    } else if (delim === "\\lgroup") {
        top = "\u23A7";
        bottom = "\u23A9";
        repeat = "\u23AA";
        font = "Size4-Regular";
    } else if (delim === "\\rgroup") {
        top = "\u23AB";
        bottom = "\u23AD";
        repeat = "\u23AA";
        font = "Size4-Regular";
    } else if (delim === "\\lmoustache") {
        top = "\u23A7";
        bottom = "\u23AD";
        repeat = "\u23AA";
        font = "Size4-Regular";
    } else if (delim === "\\rmoustache") {
        top = "\u23AB";
        bottom = "\u23A9";
        repeat = "\u23AA";
        font = "Size4-Regular";
    }

    // Get the metrics of the four sections
    var topMetrics = getMetrics(top, font);
    var topHeightTotal = topMetrics.height + topMetrics.depth;
    var repeatMetrics = getMetrics(repeat, font);
    var repeatHeightTotal = repeatMetrics.height + repeatMetrics.depth;
    var bottomMetrics = getMetrics(bottom, font);
    var bottomHeightTotal = bottomMetrics.height + bottomMetrics.depth;
    var middleHeightTotal = 0;
    var middleFactor = 1;
    if (middle !== null) {
        var middleMetrics = getMetrics(middle, font);
        middleHeightTotal = middleMetrics.height + middleMetrics.depth;
        middleFactor = 2; // repeat symmetrically above and below middle
    }

    // Calcuate the minimal height that the delimiter can have.
    // It is at least the size of the top, bottom, and optional middle combined.
    var minHeight = topHeightTotal + bottomHeightTotal + middleHeightTotal;

    // Compute the number of copies of the repeat symbol we will need
    var repeatCount = Math.ceil((heightTotal - minHeight) / (middleFactor * repeatHeightTotal));

    // Compute the total height of the delimiter including all the symbols
    var realHeightTotal = minHeight + repeatCount * middleFactor * repeatHeightTotal;

    // The center of the delimiter is placed at the center of the axis. Note
    // that in this context, "center" means that the delimiter should be
    // centered around the axis in the current style, while normally it is
    // centered around the axis in textstyle.
    var axisHeight = options.fontMetrics().axisHeight;
    if (center) {
        axisHeight *= options.sizeMultiplier;
    }
    // Calculate the depth
    var depth = realHeightTotal / 2 - axisHeight;

    // Now, we start building the pieces that will go into the vlist

    // Keep a list of the inner pieces
    var inners = [];

    // Add the bottom symbol
    inners.push(makeInner(bottom, font, mode));

    if (middle === null) {
        // Add that many symbols
        for (var i = 0; i < repeatCount; i++) {
            inners.push(makeInner(repeat, font, mode));
        }
    } else {
        // When there is a middle bit, we need the middle part and two repeated
        // sections
        for (var _i = 0; _i < repeatCount; _i++) {
            inners.push(makeInner(repeat, font, mode));
        }
        inners.push(makeInner(middle, font, mode));
        for (var _i2 = 0; _i2 < repeatCount; _i2++) {
            inners.push(makeInner(repeat, font, mode));
        }
    }

    // Add the top symbol
    inners.push(makeInner(top, font, mode));

    // Finally, build the vlist
    var newOptions = options.havingBaseStyle(_Style2.default.TEXT);
    var inner = _buildCommon2.default.makeVList({
        positionType: "bottom",
        positionData: depth,
        children: inners
    }, newOptions);

    return styleWrap(_buildCommon2.default.makeSpan(["delimsizing", "mult"], [inner], newOptions), _Style2.default.TEXT, options, classes);
};

var sqrtSvg = function sqrtSvg(sqrtName, height, viewBoxHeight, options) {
    var alternate = void 0;
    if (sqrtName === "sqrtTall") {
        // sqrtTall is from glyph U23B7 in the font KaTeX_Size4-Regular
        // One path edge has a variable length. It runs from the viniculumn
        // to a point near (14 units) the bottom of the surd. The viniculum
        // is 40 units thick. So the length of the line in question is:
        var vertSegment = viewBoxHeight - 54;
        alternate = "M702 0H400000v40H742v" + vertSegment + "l-4 4-4 4c-.667.667\n-2 1.5-4 2.5s-4.167 1.833-6.5 2.5-5.5 1-9.5 1h-12l-28-84c-16.667-52-96.667\n-294.333-240-727l-212 -643 -85 170c-4-3.333-8.333-7.667-13 -13l-13-13l77-155\n 77-156c66 199.333 139 419.667 219 661 l218 661zM702 0H400000v40H742z";
    }
    var pathNode = new _domTree2.default.pathNode(sqrtName, alternate);

    var svg = new _domTree2.default.svgNode([pathNode], {
        // Note: 1000:1 ratio of viewBox to document em width.
        "width": "400em",
        "height": height + "em",
        "viewBox": "0 0 400000 " + viewBoxHeight,
        "preserveAspectRatio": "xMinYMin slice"
    });

    return _buildCommon2.default.makeSpan(["hide-tail"], [svg], options);
};

/**
 * Make a sqrt image of the given height,
 */
var makeSqrtImage = function makeSqrtImage(height, options) {
    var delim = traverseSequence("\\surd", height, stackLargeDelimiterSequence, options);

    // Create a span containing an SVG image of a sqrt symbol.
    var span = void 0;
    var sizeMultiplier = options.sizeMultiplier; // default
    var spanHeight = void 0;
    var viewBoxHeight = void 0;

    if (delim.type === "small") {
        // Get an SVG that is derived from glyph U+221A in font KaTeX-Main.
        viewBoxHeight = 1000; // from font
        var newOptions = options.havingBaseStyle(delim.style);
        sizeMultiplier = newOptions.sizeMultiplier / options.sizeMultiplier;
        spanHeight = 1 * sizeMultiplier;
        span = sqrtSvg("sqrtMain", spanHeight, viewBoxHeight, options);
        span.style.minWidth = "0.853em";
        span.advanceWidth = 0.833 * sizeMultiplier; // from the font.
    } else if (delim.type === "large") {
        // These SVGs come from fonts: KaTeX_Size1, _Size2, etc.
        viewBoxHeight = 1000 * sizeToMaxHeight[delim.size];
        spanHeight = sizeToMaxHeight[delim.size] / sizeMultiplier;
        span = sqrtSvg("sqrtSize" + delim.size, spanHeight, viewBoxHeight, options);
        span.style.minWidth = "1.02em";
        span.advanceWidth = 1.0 / sizeMultiplier; // from the font
    } else {
        // Tall sqrt. In TeX, this would be stacked using multiple glyphs.
        // We'll use a single SVG to accomplish the same thing.
        spanHeight = height / sizeMultiplier;
        viewBoxHeight = Math.floor(1000 * height);
        span = sqrtSvg("sqrtTall", spanHeight, viewBoxHeight, options);
        span.style.minWidth = "0.742em";
        span.advanceWidth = 1.056 / sizeMultiplier;
    }

    span.height = spanHeight;
    span.style.height = spanHeight + "em";

    return {
        span: span,
        // Calculate the actual line width.
        // This actually should depend on the chosen font -- e.g. \boldmath
        // should use the thicker surd symbols from e.g. KaTeX_Main-Bold, and
        // have thicker rules.
        ruleWidth: options.fontMetrics().sqrtRuleThickness * sizeMultiplier
    };
};

// There are three kinds of delimiters, delimiters that stack when they become
// too large
var stackLargeDelimiters = ["(", ")", "[", "\\lbrack", "]", "\\rbrack", "\\{", "\\lbrace", "\\}", "\\rbrace", "\\lfloor", "\\rfloor", "\\lceil", "\\rceil", "\\surd"];

// delimiters that always stack
var stackAlwaysDelimiters = ["\\uparrow", "\\downarrow", "\\updownarrow", "\\Uparrow", "\\Downarrow", "\\Updownarrow", "|", "\\|", "\\vert", "\\Vert", "\\lvert", "\\rvert", "\\lVert", "\\rVert", "\\lgroup", "\\rgroup", "\\lmoustache", "\\rmoustache"];

// and delimiters that never stack
var stackNeverDelimiters = ["<", ">", "\\langle", "\\rangle", "/", "\\backslash", "\\lt", "\\gt"];

// Metrics of the different sizes. Found by looking at TeX's output of
// $\bigl| // \Bigl| \biggl| \Biggl| \showlists$
// Used to create stacked delimiters of appropriate sizes in makeSizedDelim.
var sizeToMaxHeight = [0, 1.2, 1.8, 2.4, 3.0];

/**
 * Used to create a delimiter of a specific size, where `size` is 1, 2, 3, or 4.
 */
var makeSizedDelim = function makeSizedDelim(delim, size, options, mode, classes) {
    // < and > turn into \langle and \rangle in delimiters
    if (delim === "<" || delim === "\\lt") {
        delim = "\\langle";
    } else if (delim === ">" || delim === "\\gt") {
        delim = "\\rangle";
    }

    // Sized delimiters are never centered.
    if (_utils2.default.contains(stackLargeDelimiters, delim) || _utils2.default.contains(stackNeverDelimiters, delim)) {
        return makeLargeDelim(delim, size, false, options, mode, classes);
    } else if (_utils2.default.contains(stackAlwaysDelimiters, delim)) {
        return makeStackedDelim(delim, sizeToMaxHeight[size], false, options, mode, classes);
    } else {
        throw new _ParseError2.default("Illegal delimiter: '" + delim + "'");
    }
};

/**
 * There are three different sequences of delimiter sizes that the delimiters
 * follow depending on the kind of delimiter. This is used when creating custom
 * sized delimiters to decide whether to create a small, large, or stacked
 * delimiter.
 *
 * In real TeX, these sequences aren't explicitly defined, but are instead
 * defined inside the font metrics. Since there are only three sequences that
 * are possible for the delimiters that TeX defines, it is easier to just encode
 * them explicitly here.
 */

// Delimiters that never stack try small delimiters and large delimiters only
var stackNeverDelimiterSequence = [{ type: "small", style: _Style2.default.SCRIPTSCRIPT }, { type: "small", style: _Style2.default.SCRIPT }, { type: "small", style: _Style2.default.TEXT }, { type: "large", size: 1 }, { type: "large", size: 2 }, { type: "large", size: 3 }, { type: "large", size: 4 }];

// Delimiters that always stack try the small delimiters first, then stack
var stackAlwaysDelimiterSequence = [{ type: "small", style: _Style2.default.SCRIPTSCRIPT }, { type: "small", style: _Style2.default.SCRIPT }, { type: "small", style: _Style2.default.TEXT }, { type: "stack" }];

// Delimiters that stack when large try the small and then large delimiters, and
// stack afterwards
var stackLargeDelimiterSequence = [{ type: "small", style: _Style2.default.SCRIPTSCRIPT }, { type: "small", style: _Style2.default.SCRIPT }, { type: "small", style: _Style2.default.TEXT }, { type: "large", size: 1 }, { type: "large", size: 2 }, { type: "large", size: 3 }, { type: "large", size: 4 }, { type: "stack" }];

/**
 * Get the font used in a delimiter based on what kind of delimiter it is.
 */
var delimTypeToFont = function delimTypeToFont(type) {
    if (type.type === "small") {
        return "Main-Regular";
    } else if (type.type === "large") {
        return "Size" + type.size + "-Regular";
    } else if (type.type === "stack") {
        return "Size4-Regular";
    }
};

/**
 * Traverse a sequence of types of delimiters to decide what kind of delimiter
 * should be used to create a delimiter of the given height+depth.
 */
var traverseSequence = function traverseSequence(delim, height, sequence, options) {
    // Here, we choose the index we should start at in the sequences. In smaller
    // sizes (which correspond to larger numbers in style.size) we start earlier
    // in the sequence. Thus, scriptscript starts at index 3-3=0, script starts
    // at index 3-2=1, text starts at 3-1=2, and display starts at min(2,3-0)=2
    var start = Math.min(2, 3 - options.style.size);
    for (var i = start; i < sequence.length; i++) {
        if (sequence[i].type === "stack") {
            // This is always the last delimiter, so we just break the loop now.
            break;
        }

        var metrics = getMetrics(delim, delimTypeToFont(sequence[i]));
        var heightDepth = metrics.height + metrics.depth;

        // Small delimiters are scaled down versions of the same font, so we
        // account for the style change size.

        if (sequence[i].type === "small") {
            var newOptions = options.havingBaseStyle(sequence[i].style);
            heightDepth *= newOptions.sizeMultiplier;
        }

        // Check if the delimiter at this size works for the given height.
        if (heightDepth > height) {
            return sequence[i];
        }
    }

    // If we reached the end of the sequence, return the last sequence element.
    return sequence[sequence.length - 1];
};

/**
 * Make a delimiter of a given height+depth, with optional centering. Here, we
 * traverse the sequences, and create a delimiter that the sequence tells us to.
 */
var makeCustomSizedDelim = function makeCustomSizedDelim(delim, height, center, options, mode, classes) {
    if (delim === "<" || delim === "\\lt") {
        delim = "\\langle";
    } else if (delim === ">" || delim === "\\gt") {
        delim = "\\rangle";
    }

    // Decide what sequence to use
    var sequence = void 0;
    if (_utils2.default.contains(stackNeverDelimiters, delim)) {
        sequence = stackNeverDelimiterSequence;
    } else if (_utils2.default.contains(stackLargeDelimiters, delim)) {
        sequence = stackLargeDelimiterSequence;
    } else {
        sequence = stackAlwaysDelimiterSequence;
    }

    // Look through the sequence
    var delimType = traverseSequence(delim, height, sequence, options);

    // Get the delimiter from font glyphs.
    // Depending on the sequence element we decided on, call the
    // appropriate function.
    if (delimType.type === "small") {
        return makeSmallDelim(delim, delimType.style, center, options, mode, classes);
    } else if (delimType.type === "large") {
        return makeLargeDelim(delim, delimType.size, center, options, mode, classes);
    } else /* if (delimType.type === "stack") */{
            return makeStackedDelim(delim, height, center, options, mode, classes);
        }
};

/**
 * Make a delimiter for use with `\left` and `\right`, given a height and depth
 * of an expression that the delimiters surround.
 */
var makeLeftRightDelim = function makeLeftRightDelim(delim, height, depth, options, mode, classes) {
    // We always center \left/\right delimiters, so the axis is always shifted
    var axisHeight = options.fontMetrics().axisHeight * options.sizeMultiplier;

    // Taken from TeX source, tex.web, function make_left_right
    var delimiterFactor = 901;
    var delimiterExtend = 5.0 / options.fontMetrics().ptPerEm;

    var maxDistFromAxis = Math.max(height - axisHeight, depth + axisHeight);

    var totalHeight = Math.max(
    // In real TeX, calculations are done using integral values which are
    // 65536 per pt, or 655360 per em. So, the division here truncates in
    // TeX but doesn't here, producing different results. If we wanted to
    // exactly match TeX's calculation, we could do
    //   Math.floor(655360 * maxDistFromAxis / 500) *
    //    delimiterFactor / 655360
    // (To see the difference, compare
    //    x^{x^{\left(\rule{0.1em}{0.68em}\right)}}
    // in TeX and KaTeX)
    maxDistFromAxis / 500 * delimiterFactor, 2 * maxDistFromAxis - delimiterExtend);

    // Finally, we defer to `makeCustomSizedDelim` with our calculated total
    // height
    return makeCustomSizedDelim(delim, totalHeight, true, options, mode, classes);
};

exports.default = {
    sqrtImage: makeSqrtImage,
    sizedDelim: makeSizedDelim,
    customSizedDelim: makeCustomSizedDelim,
    leftRightDelim: makeLeftRightDelim
};

},{"./ParseError":84,"./Style":89,"./buildCommon":91,"./domTree":98,"./fontMetrics":101,"./symbols":128,"./utils":133}],98:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _unicodeScripts = require("./unicodeScripts");

var _utils = require("./utils");

var _utils2 = _interopRequireDefault(_utils);

var _svgGeometry = require("./svgGeometry");

var _svgGeometry2 = _interopRequireDefault(_svgGeometry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create an HTML className based on a list of classes. In addition to joining
 * with spaces, we also remove null or empty classes.
 */
var createClass = function createClass(classes) {
    classes = classes.slice();
    for (var i = classes.length - 1; i >= 0; i--) {
        if (!classes[i]) {
            classes.splice(i, 1);
        }
    }

    return classes.join(" ");
};

// To ensure that all nodes have compatible signatures for these methods.


/**
 * All `DomChildNode`s MUST have `height`, `depth`, and `maxFontSize` numeric
 * fields.
 *
 * `DomChildNode` is not defined as an interface since `documentFragment` also
 * has these fields but should not be considered a `DomChildNode`.
 */

/**
 * These objects store the data about the DOM nodes we create, as well as some
 * extra data. They can then be transformed into real DOM nodes with the
 * `toNode` function or HTML markup using `toMarkup`. They are useful for both
 * storing extra properties on the nodes, as well as providing a way to easily
 * work with the DOM.
 *
 * Similar functions for working with MathML nodes exist in mathMLTree.js.
 */

/**
 * This node represents a span node, with a className, a list of children, and
 * an inline style. It also contains information about its height, depth, and
 * maxFontSize.
 */
var span = function () {
    function span(classes, children, options) {
        (0, _classCallCheck3.default)(this, span);

        this.classes = classes || [];
        this.children = children || [];
        this.height = 0;
        this.depth = 0;
        this.maxFontSize = 0;
        this.style = {};
        this.attributes = {};
        if (options) {
            if (options.style.isTight()) {
                this.classes.push("mtight");
            }
            var color = options.getColor();
            if (color) {
                this.style.color = color;
            }
        }
    }

    /**
     * Sets an arbitrary attribute on the span. Warning: use this wisely. Not all
     * browsers support attributes the same, and having too many custom attributes
     * is probably bad.
     */


    (0, _createClass3.default)(span, [{
        key: "setAttribute",
        value: function setAttribute(attribute, value) {
            this.attributes[attribute] = value;
        }
    }, {
        key: "tryCombine",
        value: function tryCombine(sibling) {
            return false;
        }

        /**
         * Convert the span into an HTML node
         */

    }, {
        key: "toNode",
        value: function toNode() {
            var span = document.createElement("span");

            // Apply the class
            span.className = createClass(this.classes);

            // Apply inline styles
            for (var style in this.style) {
                if (Object.prototype.hasOwnProperty.call(this.style, style)) {
                    // $FlowFixMe Flow doesn't seem to understand span.style's type.
                    span.style[style] = this.style[style];
                }
            }

            // Apply attributes
            for (var attr in this.attributes) {
                if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                    span.setAttribute(attr, this.attributes[attr]);
                }
            }

            // Append the children, also as HTML nodes
            for (var i = 0; i < this.children.length; i++) {
                span.appendChild(this.children[i].toNode());
            }

            return span;
        }

        /**
         * Convert the span into an HTML markup string
         */

    }, {
        key: "toMarkup",
        value: function toMarkup() {
            var markup = "<span";

            // Add the class
            if (this.classes.length) {
                markup += " class=\"";
                markup += _utils2.default.escape(createClass(this.classes));
                markup += "\"";
            }

            var styles = "";

            // Add the styles, after hyphenation
            for (var style in this.style) {
                if (this.style.hasOwnProperty(style)) {
                    styles += _utils2.default.hyphenate(style) + ":" + this.style[style] + ";";
                }
            }

            if (styles) {
                markup += " style=\"" + _utils2.default.escape(styles) + "\"";
            }

            // Add the attributes
            for (var attr in this.attributes) {
                if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                    markup += " " + attr + "=\"";
                    markup += _utils2.default.escape(this.attributes[attr]);
                    markup += "\"";
                }
            }

            markup += ">";

            // Add the markup of the children, also as markup
            for (var i = 0; i < this.children.length; i++) {
                markup += this.children[i].toMarkup();
            }

            markup += "</span>";

            return markup;
        }
    }]);
    return span;
}();

/**
 * This node represents an anchor (<a>) element with a hyperlink, a list of classes,
 * a list of children, and an inline style. It also contains information about its
 * height, depth, and maxFontSize.
 */


var anchor = function () {
    function anchor(href, classes, children, options) {
        (0, _classCallCheck3.default)(this, anchor);

        this.href = href;
        this.classes = classes;
        this.children = children;
        this.height = 0;
        this.depth = 0;
        this.maxFontSize = 0;
        this.style = {};
        this.attributes = {};
        if (options.style.isTight()) {
            this.classes.push("mtight");
        }
        var color = options.getColor();
        if (color) {
            this.style.color = color;
        }
    }

    /**
     * Sets an arbitrary attribute on the anchor. Warning: use this wisely. Not all
     * browsers support attributes the same, and having too many custom attributes
     * is probably bad.
     */


    (0, _createClass3.default)(anchor, [{
        key: "setAttribute",
        value: function setAttribute(attribute, value) {
            this.attributes[attribute] = value;
        }
    }, {
        key: "tryCombine",
        value: function tryCombine(sibling) {
            return false;
        }

        /**
         * Convert the anchor into an HTML node
         */

    }, {
        key: "toNode",
        value: function toNode() {
            var a = document.createElement("a");

            // Apply the href
            a.setAttribute('href', this.href);

            // Apply the class
            if (this.classes.length) {
                a.className = createClass(this.classes);
            }

            // Apply inline styles
            for (var style in this.style) {
                if (Object.prototype.hasOwnProperty.call(this.style, style)) {
                    // $FlowFixMe Flow doesn't seem to understand a.style's type.
                    a.style[style] = this.style[style];
                }
            }

            // Apply attributes
            for (var attr in this.attributes) {
                if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                    a.setAttribute(attr, this.attributes[attr]);
                }
            }

            // Append the children, also as HTML nodes
            for (var i = 0; i < this.children.length; i++) {
                a.appendChild(this.children[i].toNode());
            }

            return a;
        }

        /**
         * Convert the a into an HTML markup string
         */

    }, {
        key: "toMarkup",
        value: function toMarkup() {
            var markup = "<a";

            // Add the href
            markup += "href=\"" + (markup += _utils2.default.escape(this.href)) + "\"";
            // Add the class
            if (this.classes.length) {
                markup += " class=\"" + _utils2.default.escape(createClass(this.classes)) + "\"";
            }

            var styles = "";

            // Add the styles, after hyphenation
            for (var style in this.style) {
                if (this.style.hasOwnProperty(style)) {
                    styles += _utils2.default.hyphenate(style) + ":" + this.style[style] + ";";
                }
            }

            if (styles) {
                markup += " style=\"" + _utils2.default.escape(styles) + "\"";
            }

            // Add the attributes
            for (var attr in this.attributes) {
                if (attr !== "href" && Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                    markup += " " + attr + "=\"" + _utils2.default.escape(this.attributes[attr]) + "\"";
                }
            }

            markup += ">";

            // Add the markup of the children, also as markup
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(this.children), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var child = _step.value;

                    markup += child.toMarkup();
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            markup += "</a>";

            return markup;
        }
    }]);
    return anchor;
}();

/**
 * This node represents a document fragment, which contains elements, but when
 * placed into the DOM doesn't have any representation itself. Thus, it only
 * contains children and doesn't have any HTML properties. It also keeps track
 * of a height, depth, and maxFontSize.
 */


var documentFragment = function () {
    function documentFragment(children) {
        (0, _classCallCheck3.default)(this, documentFragment);

        this.children = children || [];
        this.height = 0;
        this.depth = 0;
        this.maxFontSize = 0;
    }

    /**
     * Convert the fragment into a node
     */


    (0, _createClass3.default)(documentFragment, [{
        key: "toNode",
        value: function toNode() {
            // Create a fragment
            var frag = document.createDocumentFragment();

            // Append the children
            for (var i = 0; i < this.children.length; i++) {
                frag.appendChild(this.children[i].toNode());
            }

            return frag;
        }

        /**
         * Convert the fragment into HTML markup
         */

    }, {
        key: "toMarkup",
        value: function toMarkup() {
            var markup = "";

            // Simply concatenate the markup for the children together
            for (var i = 0; i < this.children.length; i++) {
                markup += this.children[i].toMarkup();
            }

            return markup;
        }
    }]);
    return documentFragment;
}();

var iCombinations = {
    'î': "\u0131\u0302",
    'ï': "\u0131\u0308",
    'í': "\u0131\u0301",
    // 'ī': '\u0131\u0304', // enable when we add Extended Latin
    'ì': "\u0131\u0300"
};

/**
 * A symbol node contains information about a single symbol. It either renders
 * to a single text node, or a span with a single text node in it, depending on
 * whether it has CSS classes, styles, or needs italic correction.
 */

var symbolNode = function () {
    function symbolNode(value, height, depth, italic, skew, width, classes, style) {
        (0, _classCallCheck3.default)(this, symbolNode);

        this.value = value;
        this.height = height || 0;
        this.depth = depth || 0;
        this.italic = italic || 0;
        this.skew = skew || 0;
        this.width = width || 0;
        this.classes = classes || [];
        this.style = style || {};
        this.maxFontSize = 0;

        // Mark text from non-Latin scripts with specific classes so that we
        // can specify which fonts to use.  This allows us to render these
        // characters with a serif font in situations where the browser would
        // either default to a sans serif or render a placeholder character.
        // We use CSS class names like cjk_fallback, hangul_fallback and
        // brahmic_fallback. See ./unicodeScripts.js for the set of possible
        // script names
        var script = (0, _unicodeScripts.scriptFromCodepoint)(this.value.charCodeAt(0));
        if (script) {
            this.classes.push(script + "_fallback");
        }

        if (/[îïíì]/.test(this.value)) {
            // add ī when we add Extended Latin
            this.value = iCombinations[this.value];
        }
    }

    (0, _createClass3.default)(symbolNode, [{
        key: "tryCombine",
        value: function tryCombine(sibling) {
            if (!sibling || !(sibling instanceof symbolNode) || this.italic > 0 || createClass(this.classes) !== createClass(sibling.classes) || this.skew !== sibling.skew || this.maxFontSize !== sibling.maxFontSize) {
                return false;
            }
            for (var style in this.style) {
                if (this.style.hasOwnProperty(style) && this.style[style] !== sibling.style[style]) {
                    return false;
                }
            }
            for (var _style in sibling.style) {
                if (sibling.style.hasOwnProperty(_style) && this.style[_style] !== sibling.style[_style]) {
                    return false;
                }
            }
            this.value += sibling.value;
            this.height = Math.max(this.height, sibling.height);
            this.depth = Math.max(this.depth, sibling.depth);
            this.italic = sibling.italic;
            return true;
        }

        /**
         * Creates a text node or span from a symbol node. Note that a span is only
         * created if it is needed.
         */

    }, {
        key: "toNode",
        value: function toNode() {
            var node = document.createTextNode(this.value);
            var span = null;

            if (this.italic > 0) {
                span = document.createElement("span");
                span.style.marginRight = this.italic + "em";
            }

            if (this.classes.length > 0) {
                span = span || document.createElement("span");
                span.className = createClass(this.classes);
            }

            for (var style in this.style) {
                if (this.style.hasOwnProperty(style)) {
                    span = span || document.createElement("span");
                    // $FlowFixMe Flow doesn't seem to understand span.style's type.
                    span.style[style] = this.style[style];
                }
            }

            if (span) {
                span.appendChild(node);
                return span;
            } else {
                return node;
            }
        }

        /**
         * Creates markup for a symbol node.
         */

    }, {
        key: "toMarkup",
        value: function toMarkup() {
            // TODO(alpert): More duplication than I'd like from
            // span.prototype.toMarkup and symbolNode.prototype.toNode...
            var needsSpan = false;

            var markup = "<span";

            if (this.classes.length) {
                needsSpan = true;
                markup += " class=\"";
                markup += _utils2.default.escape(createClass(this.classes));
                markup += "\"";
            }

            var styles = "";

            if (this.italic > 0) {
                styles += "margin-right:" + this.italic + "em;";
            }
            for (var style in this.style) {
                if (this.style.hasOwnProperty(style)) {
                    styles += _utils2.default.hyphenate(style) + ":" + this.style[style] + ";";
                }
            }

            if (styles) {
                needsSpan = true;
                markup += " style=\"" + _utils2.default.escape(styles) + "\"";
            }

            var escaped = _utils2.default.escape(this.value);
            if (needsSpan) {
                markup += ">";
                markup += escaped;
                markup += "</span>";
                return markup;
            } else {
                return escaped;
            }
        }
    }]);
    return symbolNode;
}();

/**
 * SVG nodes are used to render stretchy wide elements.
 */


var svgNode = function () {
    function svgNode(children, attributes) {
        (0, _classCallCheck3.default)(this, svgNode);

        this.children = children || [];
        this.attributes = attributes || {};
        this.height = 0;
        this.depth = 0;
        this.maxFontSize = 0;
    }
    // Required for all `DomChildNode`s. Are always 0 for svgNode.


    (0, _createClass3.default)(svgNode, [{
        key: "toNode",
        value: function toNode() {
            var svgNS = "http://www.w3.org/2000/svg";
            var node = document.createElementNS(svgNS, "svg");

            // Apply attributes
            for (var attr in this.attributes) {
                if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                    node.setAttribute(attr, this.attributes[attr]);
                }
            }

            for (var i = 0; i < this.children.length; i++) {
                node.appendChild(this.children[i].toNode());
            }
            return node;
        }
    }, {
        key: "toMarkup",
        value: function toMarkup() {
            var markup = "<svg";

            // Apply attributes
            for (var attr in this.attributes) {
                if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                    markup += " " + attr + "='" + this.attributes[attr] + "'";
                }
            }

            markup += ">";

            for (var i = 0; i < this.children.length; i++) {
                markup += this.children[i].toMarkup();
            }

            markup += "</svg>";

            return markup;
        }
    }]);
    return svgNode;
}();

var pathNode = function () {
    function pathNode(pathName, alternate) {
        (0, _classCallCheck3.default)(this, pathNode);

        this.pathName = pathName;
        this.alternate = alternate; // Used only for tall \sqrt
    }

    (0, _createClass3.default)(pathNode, [{
        key: "toNode",
        value: function toNode() {
            var svgNS = "http://www.w3.org/2000/svg";
            var node = document.createElementNS(svgNS, "path");

            if (this.alternate) {
                node.setAttribute("d", this.alternate);
            } else {
                node.setAttribute("d", _svgGeometry2.default.path[this.pathName]);
            }

            return node;
        }
    }, {
        key: "toMarkup",
        value: function toMarkup() {
            if (this.alternate) {
                return "<path d='" + this.alternate + "'/>";
            } else {
                return "<path d='" + _svgGeometry2.default.path[this.pathName] + "'/>";
            }
        }
    }]);
    return pathNode;
}();

var lineNode = function () {
    function lineNode(attributes) {
        (0, _classCallCheck3.default)(this, lineNode);

        this.attributes = attributes || {};
    }

    (0, _createClass3.default)(lineNode, [{
        key: "toNode",
        value: function toNode() {
            var svgNS = "http://www.w3.org/2000/svg";
            var node = document.createElementNS(svgNS, "line");

            // Apply attributes
            for (var attr in this.attributes) {
                if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                    node.setAttribute(attr, this.attributes[attr]);
                }
            }

            return node;
        }
    }, {
        key: "toMarkup",
        value: function toMarkup() {
            var markup = "<line";

            for (var attr in this.attributes) {
                if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                    markup += " " + attr + "='" + this.attributes[attr] + "'";
                }
            }

            markup += "/>";

            return markup;
        }
    }]);
    return lineNode;
}();

exports.default = {
    span: span,
    anchor: anchor,
    documentFragment: documentFragment,
    symbolNode: symbolNode,
    svgNode: svgNode,
    pathNode: pathNode,
    lineNode: lineNode
};

},{"./svgGeometry":127,"./unicodeScripts":130,"./utils":133,"babel-runtime/core-js/get-iterator":3,"babel-runtime/helpers/classCallCheck":8,"babel-runtime/helpers/createClass":9}],99:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineEnvironment = require("./defineEnvironment");

require("./environments/array.js");

var environments = _defineEnvironment._environments;
exports.default = environments;

// All environment definitions should be imported below

},{"./defineEnvironment":95,"./environments/array.js":100}],100:[function(require,module,exports){
"use strict";

var _buildCommon = require("../buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _defineEnvironment = require("../defineEnvironment");

var _defineEnvironment2 = _interopRequireDefault(_defineEnvironment);

var _mathMLTree = require("../mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _ParseError = require("../ParseError");

var _ParseError2 = _interopRequireDefault(_ParseError);

var _ParseNode = require("../ParseNode");

var _ParseNode2 = _interopRequireDefault(_ParseNode);

var _units = require("../units");

var _utils = require("../utils");

var _utils2 = _interopRequireDefault(_utils);

var _stretchy = require("../stretchy");

var _stretchy2 = _interopRequireDefault(_stretchy);

var _buildHTML = require("../buildHTML");

var html = _interopRequireWildcard(_buildHTML);

var _buildMathML = require("../buildMathML");

var mml = _interopRequireWildcard(_buildMathML);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Parse the body of the environment, with rows delimited by \\ and
 * columns delimited by &, and create a nested list in row-major order
 * with one group per cell.  If given an optional argument style
 * ("text", "display", etc.), then each cell is cast into that style.
 */


// Data stored in the ParseNode associated with the environment.
function parseArray(parser, result, style) {
    var row = [];
    var body = [row];
    var rowGaps = [];
    while (true) {
        // eslint-disable-line no-constant-condition
        var cell = parser.parseExpression(false, undefined);
        cell = new _ParseNode2.default("ordgroup", cell, parser.mode);
        if (style) {
            cell = new _ParseNode2.default("styling", {
                style: style,
                value: [cell]
            }, parser.mode);
        }
        row.push(cell);
        var next = parser.nextToken.text;
        if (next === "&") {
            parser.consume();
        } else if (next === "\\end") {
            // Arrays terminate newlines with `\crcr` which consumes a `\cr` if
            // the last line is empty.
            var lastRow = body[body.length - 1];
            if (body.length > 1 && lastRow.length === 1 && lastRow[0].value.value[0].value.length === 0) {
                body.pop();
            }
            break;
        } else if (next === "\\\\" || next === "\\cr") {
            var cr = parser.parseFunction();
            if (!cr) {
                throw new _ParseError2.default("Failed to parse function after " + next);
            }
            rowGaps.push(cr.value.size);
            row = [];
            body.push(row);
        } else {
            throw new _ParseError2.default("Expected & or \\\\ or \\end", parser.nextToken);
        }
    }
    result.body = body;
    result.rowGaps = rowGaps;
    return new _ParseNode2.default(result.type, result, parser.mode);
}

// Decides on a style for cells in an array according to whether the given
// environment name starts with the letter 'd'.
function dCellStyle(envName) {
    if (envName.substr(0, 1) === "d") {
        return "display";
    } else {
        return "text";
    }
}

var htmlBuilder = function htmlBuilder(group, options) {
    var r = void 0;
    var c = void 0;
    var nr = group.value.body.length;
    var nc = 0;
    var body = new Array(nr);

    // Horizontal spacing
    var pt = 1 / options.fontMetrics().ptPerEm;
    var arraycolsep = 5 * pt; // \arraycolsep in article.cls

    // Vertical spacing
    var baselineskip = 12 * pt; // see size10.clo
    // Default \jot from ltmath.dtx
    // TODO(edemaine): allow overriding \jot via \setlength (#687)
    var jot = 3 * pt;
    // Default \arraystretch from lttab.dtx
    // TODO(gagern): may get redefined once we have user-defined macros
    var arraystretch = _utils2.default.deflt(group.value.arraystretch, 1);
    var arrayskip = arraystretch * baselineskip;
    var arstrutHeight = 0.7 * arrayskip; // \strutbox in ltfsstrc.dtx and
    var arstrutDepth = 0.3 * arrayskip; // \@arstrutbox in lttab.dtx

    var totalHeight = 0;
    for (r = 0; r < group.value.body.length; ++r) {
        var inrow = group.value.body[r];
        var _height = arstrutHeight; // \@array adds an \@arstrut
        var _depth = arstrutDepth; // to each tow (via the template)

        if (nc < inrow.length) {
            nc = inrow.length;
        }

        var outrow = new Array(inrow.length);
        for (c = 0; c < inrow.length; ++c) {
            var elt = html.buildGroup(inrow[c], options);
            if (_depth < elt.depth) {
                _depth = elt.depth;
            }
            if (_height < elt.height) {
                _height = elt.height;
            }
            outrow[c] = elt;
        }

        var gap = 0;
        if (group.value.rowGaps[r]) {
            gap = (0, _units.calculateSize)(group.value.rowGaps[r].value, options);
            if (gap > 0) {
                // \@argarraycr
                gap += arstrutDepth;
                if (_depth < gap) {
                    _depth = gap; // \@xargarraycr
                }
                gap = 0;
            }
        }
        // In AMS multiline environments such as aligned and gathered, rows
        // correspond to lines that have additional \jot added to the
        // \baselineskip via \openup.
        if (group.value.addJot) {
            _depth += jot;
        }

        outrow.height = _height;
        outrow.depth = _depth;
        totalHeight += _height;
        outrow.pos = totalHeight;
        totalHeight += _depth + gap; // \@yargarraycr
        body[r] = outrow;
    }

    var offset = totalHeight / 2 + options.fontMetrics().axisHeight;
    var colDescriptions = group.value.cols || [];
    var cols = [];
    var colSep = void 0;
    var colDescrNum = void 0;
    for (c = 0, colDescrNum = 0;
    // Continue while either there are more columns or more column
    // descriptions, so trailing separators don't get lost.
    c < nc || colDescrNum < colDescriptions.length; ++c, ++colDescrNum) {

        var colDescr = colDescriptions[colDescrNum] || {};

        var firstSeparator = true;
        while (colDescr.type === "separator") {
            // If there is more than one separator in a row, add a space
            // between them.
            if (!firstSeparator) {
                colSep = _buildCommon2.default.makeSpan(["arraycolsep"], []);
                colSep.style.width = options.fontMetrics().doubleRuleSep + "em";
                cols.push(colSep);
            }

            if (colDescr.separator === "|") {
                var _separator = _stretchy2.default.ruleSpan("vertical-separator", 0.05, options);
                _separator.style.height = totalHeight + "em";
                _separator.style.verticalAlign = -(totalHeight - offset) + "em";

                cols.push(_separator);
            } else {
                throw new _ParseError2.default("Invalid separator type: " + colDescr.separator);
            }

            colDescrNum++;
            colDescr = colDescriptions[colDescrNum] || {};
            firstSeparator = false;
        }

        if (c >= nc) {
            continue;
        }

        var sepwidth = void 0;
        if (c > 0 || group.value.hskipBeforeAndAfter) {
            sepwidth = _utils2.default.deflt(colDescr.pregap, arraycolsep);
            if (sepwidth !== 0) {
                colSep = _buildCommon2.default.makeSpan(["arraycolsep"], []);
                colSep.style.width = sepwidth + "em";
                cols.push(colSep);
            }
        }

        var col = [];
        for (r = 0; r < nr; ++r) {
            var row = body[r];
            var elem = row[c];
            if (!elem) {
                continue;
            }
            var shift = row.pos - offset;
            elem.depth = row.depth;
            elem.height = row.height;
            col.push({ type: "elem", elem: elem, shift: shift });
        }

        col = _buildCommon2.default.makeVList({
            positionType: "individualShift",
            children: col
        }, options);
        col = _buildCommon2.default.makeSpan(["col-align-" + (colDescr.align || "c")], [col]);
        cols.push(col);

        if (c < nc - 1 || group.value.hskipBeforeAndAfter) {
            sepwidth = _utils2.default.deflt(colDescr.postgap, arraycolsep);
            if (sepwidth !== 0) {
                colSep = _buildCommon2.default.makeSpan(["arraycolsep"], []);
                colSep.style.width = sepwidth + "em";
                cols.push(colSep);
            }
        }
    }
    body = _buildCommon2.default.makeSpan(["mtable"], cols);
    return _buildCommon2.default.makeSpan(["mord"], [body], options);
};

var mathmlBuilder = function mathmlBuilder(group, options) {
    return new _mathMLTree2.default.MathNode("mtable", group.value.body.map(function (row) {
        return new _mathMLTree2.default.MathNode("mtr", row.map(function (cell) {
            return new _mathMLTree2.default.MathNode("mtd", [mml.buildGroup(cell, options)]);
        }));
    }));
};

// Convinient function for aligned and alignedat environments.
var alignedHandler = function alignedHandler(context, args) {
    var res = {
        type: "array",
        cols: [],
        addJot: true
    };
    res = parseArray(context.parser, res, "display");

    // Determining number of columns.
    // 1. If the first argument is given, we use it as a number of columns,
    //    and makes sure that each row doesn't exceed that number.
    // 2. Otherwise, just count number of columns = maximum number
    //    of cells in each row ("aligned" mode -- isAligned will be true).
    //
    // At the same time, prepend empty group {} at beginning of every second
    // cell in each row (starting with second cell) so that operators become
    // binary.  This behavior is implemented in amsmath's \start@aligned.
    var numMaths = void 0;
    var numCols = 0;
    var emptyGroup = new _ParseNode2.default("ordgroup", [], context.mode);
    if (args[0] && args[0].value) {
        var arg0 = "";
        for (var i = 0; i < args[0].value.length; i++) {
            arg0 += args[0].value[i].value;
        }
        numMaths = Number(arg0);
        numCols = numMaths * 2;
    }
    var isAligned = !numCols;
    res.value.body.forEach(function (row) {
        for (var _i = 1; _i < row.length; _i += 2) {
            // Modify ordgroup node within styling node
            var ordgroup = row[_i].value.value[0];
            ordgroup.value.unshift(emptyGroup);
        }
        if (!isAligned) {
            // Case 1
            var curMaths = row.length / 2;
            if (numMaths < curMaths) {
                throw new _ParseError2.default("Too many math in a row: " + ("expected " + numMaths + ", but got " + curMaths), row);
            }
        } else if (numCols < row.length) {
            // Case 2
            numCols = row.length;
        }
    });

    // Adjusting alignment.
    // In aligned mode, we add one \qquad between columns;
    // otherwise we add nothing.
    for (var _i2 = 0; _i2 < numCols; ++_i2) {
        var _align = "r";
        var _pregap = 0;
        if (_i2 % 2 === 1) {
            _align = "l";
        } else if (_i2 > 0 && isAligned) {
            // "aligned" mode.
            _pregap = 1; // add one \quad
        }
        res.value.cols[_i2] = {
            type: "align",
            align: _align,
            pregap: _pregap,
            postgap: 0
        };
    }
    return res;
};

// Arrays are part of LaTeX, defined in lttab.dtx so its documentation
// is part of the source2e.pdf file of LaTeX2e source documentation.
// {darray} is an {array} environment where cells are set in \displaystyle,
// as defined in nccmath.sty.
(0, _defineEnvironment2.default)({
    type: "array",
    names: ["array", "darray"],
    props: {
        numArgs: 1
    },
    handler: function handler(context, args) {
        var colalign = args[0];
        colalign = colalign.value.map ? colalign.value : [colalign];
        var cols = colalign.map(function (node) {
            var ca = node.value;
            if ("lcr".indexOf(ca) !== -1) {
                return {
                    type: "align",
                    align: ca
                };
            } else if (ca === "|") {
                return {
                    type: "separator",
                    separator: "|"
                };
            }
            throw new _ParseError2.default("Unknown column alignment: " + node.value, node);
        });
        var res = {
            type: "array",
            cols: cols,
            hskipBeforeAndAfter: true // \@preamble in lttab.dtx
        };
        res = parseArray(context.parser, res, dCellStyle(context.envName));
        return res;
    },
    htmlBuilder: htmlBuilder,
    mathmlBuilder: mathmlBuilder
});

// The matrix environments of amsmath builds on the array environment
// of LaTeX, which is discussed above.
(0, _defineEnvironment2.default)({
    type: "array",
    names: ["matrix", "pmatrix", "bmatrix", "Bmatrix", "vmatrix", "Vmatrix"],
    props: {
        numArgs: 0
    },
    handler: function handler(context) {
        var delimiters = {
            "matrix": null,
            "pmatrix": ["(", ")"],
            "bmatrix": ["[", "]"],
            "Bmatrix": ["\\{", "\\}"],
            "vmatrix": ["|", "|"],
            "Vmatrix": ["\\Vert", "\\Vert"]
        }[context.envName];
        var res = {
            type: "array",
            hskipBeforeAndAfter: false // \hskip -\arraycolsep in amsmath
        };
        res = parseArray(context.parser, res, dCellStyle(context.envName));
        if (delimiters) {
            res = new _ParseNode2.default("leftright", {
                body: [res],
                left: delimiters[0],
                right: delimiters[1]
            }, context.mode);
        }
        return res;
    },
    htmlBuilder: htmlBuilder,
    mathmlBuilder: mathmlBuilder
});

// A cases environment (in amsmath.sty) is almost equivalent to
// \def\arraystretch{1.2}%
// \left\{\begin{array}{@{}l@{\quad}l@{}} … \end{array}\right.
// {dcases} is a {cases} environment where cells are set in \displaystyle,
// as defined in mathtools.sty.
(0, _defineEnvironment2.default)({
    type: "array",
    names: ["cases", "dcases"],
    props: {
        numArgs: 0
    },
    handler: function handler(context) {
        var res = {
            type: "array",
            arraystretch: 1.2,
            cols: [{
                type: "align",
                align: "l",
                pregap: 0,
                // TODO(kevinb) get the current style.
                // For now we use the metrics for TEXT style which is what we were
                // doing before.  Before attempting to get the current style we
                // should look at TeX's behavior especially for \over and matrices.
                postgap: 1.0 /* 1em quad */
            }, {
                type: "align",
                align: "l",
                pregap: 0,
                postgap: 0
            }]
        };
        res = parseArray(context.parser, res, dCellStyle(context.envName));
        res = new _ParseNode2.default("leftright", {
            body: [res],
            left: "\\{",
            right: "."
        }, context.mode);
        return res;
    },
    htmlBuilder: htmlBuilder,
    mathmlBuilder: mathmlBuilder
});

// An aligned environment is like the align* environment
// except it operates within math mode.
// Note that we assume \nomallineskiplimit to be zero,
// so that \strut@ is the same as \strut.
(0, _defineEnvironment2.default)({
    type: "array",
    names: ["aligned"],
    props: {
        numArgs: 0
    },
    handler: alignedHandler,
    htmlBuilder: htmlBuilder,
    mathmlBuilder: mathmlBuilder
});

// A gathered environment is like an array environment with one centered
// column, but where rows are considered lines so get \jot line spacing
// and contents are set in \displaystyle.
(0, _defineEnvironment2.default)({
    type: "array",
    names: ["gathered"],
    props: {
        numArgs: 0
    },
    handler: function handler(context) {
        var res = {
            type: "array",
            cols: [{
                type: "align",
                align: "c"
            }],
            addJot: true
        };
        res = parseArray(context.parser, res, "display");
        return res;
    },
    htmlBuilder: htmlBuilder,
    mathmlBuilder: mathmlBuilder
});

// alignat environment is like an align environment, but one must explicitly
// specify maximum number of columns in each row, and can adjust spacing between
// each columns.
(0, _defineEnvironment2.default)({
    type: "array",
    names: ["alignedat"],
    // One for numbered and for unnumbered;
    // but, KaTeX doesn't supports math numbering yet,
    // they make no difference for now.
    props: {
        numArgs: 1
    },
    handler: alignedHandler,
    htmlBuilder: htmlBuilder,
    mathmlBuilder: mathmlBuilder
});

},{"../ParseError":84,"../ParseNode":85,"../buildCommon":91,"../buildHTML":92,"../buildMathML":93,"../defineEnvironment":95,"../mathMLTree":124,"../stretchy":126,"../units":132,"../utils":133}],101:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _unicodeScripts = require("./unicodeScripts");

var _fontMetricsData = require("./fontMetricsData");

var _fontMetricsData2 = _interopRequireDefault(_fontMetricsData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This file contains metrics regarding fonts and individual symbols. The sigma
 * and xi variables, as well as the metricMap map contain data extracted from
 * TeX, TeX font metrics, and the TTF files. These data are then exposed via the
 * `metrics` variable and the getCharacterMetrics function.
 */

// In TeX, there are actually three sets of dimensions, one for each of
// textstyle (size index 5 and higher: >=9pt), scriptstyle (size index 3 and 4:
// 7-8pt), and scriptscriptstyle (size index 1 and 2: 5-6pt).  These are
// provided in the the arrays below, in that order.
//
// The font metrics are stored in fonts cmsy10, cmsy7, and cmsy5 respsectively.
// This was determined by running the following script:
//
//     latex -interaction=nonstopmode \
//     '\documentclass{article}\usepackage{amsmath}\begin{document}' \
//     '$a$ \expandafter\show\the\textfont2' \
//     '\expandafter\show\the\scriptfont2' \
//     '\expandafter\show\the\scriptscriptfont2' \
//     '\stop'
//
// The metrics themselves were retreived using the following commands:
//
//     tftopl cmsy10
//     tftopl cmsy7
//     tftopl cmsy5
//
// The output of each of these commands is quite lengthy.  The only part we
// care about is the FONTDIMEN section. Each value is measured in EMs.
var sigmasAndXis = {
    slant: [0.250, 0.250, 0.250], // sigma1
    space: [0.000, 0.000, 0.000], // sigma2
    stretch: [0.000, 0.000, 0.000], // sigma3
    shrink: [0.000, 0.000, 0.000], // sigma4
    xHeight: [0.431, 0.431, 0.431], // sigma5
    quad: [1.000, 1.171, 1.472], // sigma6
    extraSpace: [0.000, 0.000, 0.000], // sigma7
    num1: [0.677, 0.732, 0.925], // sigma8
    num2: [0.394, 0.384, 0.387], // sigma9
    num3: [0.444, 0.471, 0.504], // sigma10
    denom1: [0.686, 0.752, 1.025], // sigma11
    denom2: [0.345, 0.344, 0.532], // sigma12
    sup1: [0.413, 0.503, 0.504], // sigma13
    sup2: [0.363, 0.431, 0.404], // sigma14
    sup3: [0.289, 0.286, 0.294], // sigma15
    sub1: [0.150, 0.143, 0.200], // sigma16
    sub2: [0.247, 0.286, 0.400], // sigma17
    supDrop: [0.386, 0.353, 0.494], // sigma18
    subDrop: [0.050, 0.071, 0.100], // sigma19
    delim1: [2.390, 1.700, 1.980], // sigma20
    delim2: [1.010, 1.157, 1.420], // sigma21
    axisHeight: [0.250, 0.250, 0.250], // sigma22

    // These font metrics are extracted from TeX by using tftopl on cmex10.tfm;
    // they correspond to the font parameters of the extension fonts (family 3).
    // See the TeXbook, page 441. In AMSTeX, the extension fonts scale; to
    // match cmex7, we'd use cmex7.tfm values for script and scriptscript
    // values.
    defaultRuleThickness: [0.04, 0.049, 0.049], // xi8; cmex7: 0.049
    bigOpSpacing1: [0.111, 0.111, 0.111], // xi9
    bigOpSpacing2: [0.166, 0.166, 0.166], // xi10
    bigOpSpacing3: [0.2, 0.2, 0.2], // xi11
    bigOpSpacing4: [0.6, 0.611, 0.611], // xi12; cmex7: 0.611
    bigOpSpacing5: [0.1, 0.143, 0.143], // xi13; cmex7: 0.143

    // The \sqrt rule width is taken from the height of the surd character.
    // Since we use the same font at all sizes, this thickness doesn't scale.
    sqrtRuleThickness: [0.04, 0.04, 0.04],

    // This value determines how large a pt is, for metrics which are defined
    // in terms of pts.
    // This value is also used in katex.less; if you change it make sure the
    // values match.
    ptPerEm: [10.0, 10.0, 10.0],

    // The space between adjacent `|` columns in an array definition. From
    // `\showthe\doublerulesep` in LaTeX. Equals 2.0 / ptPerEm.
    doubleRuleSep: [0.2, 0.2, 0.2]
};

// This map contains a mapping from font name and character code to character
// metrics, including height, depth, italic correction, and skew (kern from the
// character to the corresponding \skewchar)
// This map is generated via `make metrics`. It should not be changed manually.


// These are very rough approximations.  We default to Times New Roman which
// should have Latin-1 and Cyrillic characters, but may not depending on the
// operating system.  The metrics do not account for extra height from the
// accents.  In the case of Cyrillic characters which have both ascenders and
// descenders we prefer approximations with ascenders, primarily to prevent
// the fraction bar or root line from intersecting the glyph.
// TODO(kevinb) allow union of multiple glyph metrics for better accuracy.
var extraCharacterMap = {
    // Latin-1
    'Å': 'A',
    'Ç': 'C',
    'Ð': 'D',
    'Þ': 'o',
    'å': 'a',
    'ç': 'c',
    'ð': 'd',
    'þ': 'o',

    // Cyrillic
    'А': 'A',
    'Б': 'B',
    'В': 'B',
    'Г': 'F',
    'Д': 'A',
    'Е': 'E',
    'Ж': 'K',
    'З': '3',
    'И': 'N',
    'Й': 'N',
    'К': 'K',
    'Л': 'N',
    'М': 'M',
    'Н': 'H',
    'О': 'O',
    'П': 'N',
    'Р': 'P',
    'С': 'C',
    'Т': 'T',
    'У': 'y',
    'Ф': 'O',
    'Х': 'X',
    'Ц': 'U',
    'Ч': 'h',
    'Ш': 'W',
    'Щ': 'W',
    'Ъ': 'B',
    'Ы': 'X',
    'Ь': 'B',
    'Э': '3',
    'Ю': 'X',
    'Я': 'R',
    'а': 'a',
    'б': 'b',
    'в': 'a',
    'г': 'r',
    'д': 'y',
    'е': 'e',
    'ж': 'm',
    'з': 'e',
    'и': 'n',
    'й': 'n',
    'к': 'n',
    'л': 'n',
    'м': 'm',
    'н': 'n',
    'о': 'o',
    'п': 'n',
    'р': 'p',
    'с': 'c',
    'т': 'o',
    'у': 'y',
    'ф': 'b',
    'х': 'x',
    'ц': 'n',
    'ч': 'n',
    'ш': 'w',
    'щ': 'w',
    'ъ': 'a',
    'ы': 'm',
    'ь': 'a',
    'э': 'e',
    'ю': 'm',
    'я': 'r'
};

/**
 * This function is a convenience function for looking up information in the
 * metricMap table. It takes a character as a string, and a font.
 *
 * Note: the `width` property may be undefined if fontMetricsData.js wasn't
 * built using `Make extended_metrics`.
 */
var getCharacterMetrics = function getCharacterMetrics(character, font) {
    if (!_fontMetricsData2.default[font]) {
        throw new Error("Font metrics not found for font: " + font + ".");
    }
    var ch = character.charCodeAt(0);
    if (character[0] in extraCharacterMap) {
        ch = extraCharacterMap[character[0]].charCodeAt(0);
    }
    var metrics = _fontMetricsData2.default[font][ch];

    if (!metrics) {
        // We don't typically have font metrics for Asian scripts.
        // So if the character is in a script we support but we
        // dont have metrics for it, just use the metrics for
        // the Latin capital letter M. This is close enough because
        // we (currently) only care about the height of the glpyh
        // not its width.
        if ((0, _unicodeScripts.supportedCodepoint)(ch)) {
            metrics = _fontMetricsData2.default[font][77]; // 77 is the charcode for 'M'
        }
    }

    if (metrics) {
        return {
            depth: metrics[0],
            height: metrics[1],
            italic: metrics[2],
            skew: metrics[3],
            width: metrics[4]
        };
    }
};

var fontMetricsBySizeIndex = {};

/**
 * Get the font metrics for a given size.
 */
var getFontMetrics = function getFontMetrics(size) {
    var sizeIndex = void 0;
    if (size >= 5) {
        sizeIndex = 0;
    } else if (size >= 3) {
        sizeIndex = 1;
    } else {
        sizeIndex = 2;
    }
    if (!fontMetricsBySizeIndex[sizeIndex]) {
        var metrics = fontMetricsBySizeIndex[sizeIndex] = {
            cssEmPerMu: sigmasAndXis.quad[sizeIndex] / 18
        };
        for (var key in sigmasAndXis) {
            if (sigmasAndXis.hasOwnProperty(key)) {
                metrics[key] = sigmasAndXis[key][sizeIndex];
            }
        }
    }
    return fontMetricsBySizeIndex[sizeIndex];
};

exports.default = {
    getFontMetrics: getFontMetrics,
    getCharacterMetrics: getCharacterMetrics
};

},{"./fontMetricsData":102,"./unicodeScripts":130}],102:[function(require,module,exports){
"use strict";

module.exports = {
    "AMS-Regular": {
        "65": [0, 0.68889, 0, 0, 0.72222],
        "66": [0, 0.68889, 0, 0, 0.66667],
        "67": [0, 0.68889, 0, 0, 0.72222],
        "68": [0, 0.68889, 0, 0, 0.72222],
        "69": [0, 0.68889, 0, 0, 0.66667],
        "70": [0, 0.68889, 0, 0, 0.61111],
        "71": [0, 0.68889, 0, 0, 0.77778],
        "72": [0, 0.68889, 0, 0, 0.77778],
        "73": [0, 0.68889, 0, 0, 0.38889],
        "74": [0.16667, 0.68889, 0, 0, 0.5],
        "75": [0, 0.68889, 0, 0, 0.77778],
        "76": [0, 0.68889, 0, 0, 0.66667],
        "77": [0, 0.68889, 0, 0, 0.94445],
        "78": [0, 0.68889, 0, 0, 0.72222],
        "79": [0.16667, 0.68889, 0, 0, 0.77778],
        "80": [0, 0.68889, 0, 0, 0.61111],
        "81": [0.16667, 0.68889, 0, 0, 0.77778],
        "82": [0, 0.68889, 0, 0, 0.72222],
        "83": [0, 0.68889, 0, 0, 0.55556],
        "84": [0, 0.68889, 0, 0, 0.66667],
        "85": [0, 0.68889, 0, 0, 0.72222],
        "86": [0, 0.68889, 0, 0, 0.72222],
        "87": [0, 0.68889, 0, 0, 1.0],
        "88": [0, 0.68889, 0, 0, 0.72222],
        "89": [0, 0.68889, 0, 0, 0.72222],
        "90": [0, 0.68889, 0, 0, 0.66667],
        "107": [0, 0.68889, 0, 0, 0.55556],
        "165": [0, 0.675, 0.025, 0, 0.75],
        "174": [0.15559, 0.69224, 0, 0, 0.94666],
        "240": [0, 0.68889, 0, 0, 0.55556],
        "295": [0, 0.68889, 0, 0, 0.54028],
        "710": [0, 0.825, 0, 0, 2.33334],
        "732": [0, 0.9, 0, 0, 2.33334],
        "770": [0, 0.825, 0, 0, 2.33334],
        "771": [0, 0.9, 0, 0, 2.33334],
        "989": [0.08167, 0.58167, 0, 0, 0.77778],
        "1008": [0, 0.43056, 0.04028, 0, 0.66667],
        "8245": [0, 0.54986, 0, 0, 0.275],
        "8463": [0, 0.68889, 0, 0, 0.54028],
        "8487": [0, 0.68889, 0, 0, 0.72222],
        "8498": [0, 0.68889, 0, 0, 0.55556],
        "8502": [0, 0.68889, 0, 0, 0.66667],
        "8503": [0, 0.68889, 0, 0, 0.44445],
        "8504": [0, 0.68889, 0, 0, 0.66667],
        "8513": [0, 0.68889, 0, 0, 0.63889],
        "8592": [-0.03598, 0.46402, 0, 0, 0.5],
        "8594": [-0.03598, 0.46402, 0, 0, 0.5],
        "8602": [-0.13313, 0.36687, 0, 0, 1.0],
        "8603": [-0.13313, 0.36687, 0, 0, 1.0],
        "8606": [0.01354, 0.52239, 0, 0, 1.0],
        "8608": [0.01354, 0.52239, 0, 0, 1.0],
        "8610": [0.01354, 0.52239, 0, 0, 1.11111],
        "8611": [0.01354, 0.52239, 0, 0, 1.11111],
        "8619": [0, 0.54986, 0, 0, 1.0],
        "8620": [0, 0.54986, 0, 0, 1.0],
        "8621": [-0.13313, 0.37788, 0, 0, 1.38889],
        "8622": [-0.13313, 0.36687, 0, 0, 1.0],
        "8624": [0, 0.69224, 0, 0, 0.5],
        "8625": [0, 0.69224, 0, 0, 0.5],
        "8630": [0, 0.43056, 0, 0, 1.0],
        "8631": [0, 0.43056, 0, 0, 1.0],
        "8634": [0.08198, 0.58198, 0, 0, 0.77778],
        "8635": [0.08198, 0.58198, 0, 0, 0.77778],
        "8638": [0.19444, 0.69224, 0, 0, 0.41667],
        "8639": [0.19444, 0.69224, 0, 0, 0.41667],
        "8642": [0.19444, 0.69224, 0, 0, 0.41667],
        "8643": [0.19444, 0.69224, 0, 0, 0.41667],
        "8644": [0.1808, 0.675, 0, 0, 1.0],
        "8646": [0.1808, 0.675, 0, 0, 1.0],
        "8647": [0.1808, 0.675, 0, 0, 1.0],
        "8648": [0.19444, 0.69224, 0, 0, 0.83334],
        "8649": [0.1808, 0.675, 0, 0, 1.0],
        "8650": [0.19444, 0.69224, 0, 0, 0.83334],
        "8651": [0.01354, 0.52239, 0, 0, 1.0],
        "8652": [0.01354, 0.52239, 0, 0, 1.0],
        "8653": [-0.13313, 0.36687, 0, 0, 1.0],
        "8654": [-0.13313, 0.36687, 0, 0, 1.0],
        "8655": [-0.13313, 0.36687, 0, 0, 1.0],
        "8666": [0.13667, 0.63667, 0, 0, 1.0],
        "8667": [0.13667, 0.63667, 0, 0, 1.0],
        "8669": [-0.13313, 0.37788, 0, 0, 1.0],
        "8672": [-0.064, 0.437, 0, 0, 1187],
        "8674": [-0.064, 0.437, 0, 0, 1167],
        "8705": [0, 0.825, 0, 0, 0.5],
        "8708": [0, 0.68889, 0, 0, 0.55556],
        "8709": [0.08167, 0.58167, 0, 0, 0.77778],
        "8717": [0, 0.43056, 0, 0, 0.42917],
        "8722": [-0.03598, 0.46402, 0, 0, 0.5],
        "8724": [0.08198, 0.69224, 0, 0, 0.77778],
        "8726": [0.08167, 0.58167, 0, 0, 0.77778],
        "8733": [0, 0.69224, 0, 0, 0.77778],
        "8736": [0, 0.69224, 0, 0, 0.72222],
        "8737": [0, 0.69224, 0, 0, 0.72222],
        "8738": [0.03517, 0.52239, 0, 0, 0.72222],
        "8739": [0.08167, 0.58167, 0, 0, 0.22222],
        "8740": [0.25142, 0.74111, 0, 0, 0.27778],
        "8741": [0.08167, 0.58167, 0, 0, 0.38889],
        "8742": [0.25142, 0.74111, 0, 0, 0.5],
        "8756": [0, 0.69224, 0, 0, 0.66667],
        "8757": [0, 0.69224, 0, 0, 0.66667],
        "8764": [-0.13313, 0.36687, 0, 0, 0.77778],
        "8765": [-0.13313, 0.37788, 0, 0, 0.77778],
        "8769": [-0.13313, 0.36687, 0, 0, 0.77778],
        "8770": [-0.03625, 0.46375, 0, 0, 0.77778],
        "8774": [0.30274, 0.79383, 0, 0, 0.77778],
        "8776": [-0.01688, 0.48312, 0, 0, 0.77778],
        "8778": [0.08167, 0.58167, 0, 0, 0.77778],
        "8782": [0.06062, 0.54986, 0, 0, 0.77778],
        "8783": [0.06062, 0.54986, 0, 0, 0.77778],
        "8785": [0.08198, 0.58198, 0, 0, 0.77778],
        "8786": [0.08198, 0.58198, 0, 0, 0.77778],
        "8787": [0.08198, 0.58198, 0, 0, 0.77778],
        "8790": [0, 0.69224, 0, 0, 0.77778],
        "8791": [0.22958, 0.72958, 0, 0, 0.77778],
        "8796": [0.08198, 0.91667, 0, 0, 0.77778],
        "8806": [0.25583, 0.75583, 0, 0, 0.77778],
        "8807": [0.25583, 0.75583, 0, 0, 0.77778],
        "8808": [0.25142, 0.75726, 0, 0, 0.77778],
        "8809": [0.25142, 0.75726, 0, 0, 0.77778],
        "8812": [0.25583, 0.75583, 0, 0, 0.5],
        "8814": [0.20576, 0.70576, 0, 0, 0.77778],
        "8815": [0.20576, 0.70576, 0, 0, 0.77778],
        "8816": [0.30274, 0.79383, 0, 0, 0.77778],
        "8817": [0.30274, 0.79383, 0, 0, 0.77778],
        "8818": [0.22958, 0.72958, 0, 0, 0.77778],
        "8819": [0.22958, 0.72958, 0, 0, 0.77778],
        "8822": [0.1808, 0.675, 0, 0, 0.77778],
        "8823": [0.1808, 0.675, 0, 0, 0.77778],
        "8828": [0.13667, 0.63667, 0, 0, 0.77778],
        "8829": [0.13667, 0.63667, 0, 0, 0.77778],
        "8830": [0.22958, 0.72958, 0, 0, 0.77778],
        "8831": [0.22958, 0.72958, 0, 0, 0.77778],
        "8832": [0.20576, 0.70576, 0, 0, 0.77778],
        "8833": [0.20576, 0.70576, 0, 0, 0.77778],
        "8840": [0.30274, 0.79383, 0, 0, 0.77778],
        "8841": [0.30274, 0.79383, 0, 0, 0.77778],
        "8842": [0.13597, 0.63597, 0, 0, 0.77778],
        "8843": [0.13597, 0.63597, 0, 0, 0.77778],
        "8847": [0.03517, 0.54986, 0, 0, 0.77778],
        "8848": [0.03517, 0.54986, 0, 0, 0.77778],
        "8858": [0.08198, 0.58198, 0, 0, 0.77778],
        "8859": [0.08198, 0.58198, 0, 0, 0.77778],
        "8861": [0.08198, 0.58198, 0, 0, 0.77778],
        "8862": [0, 0.675, 0, 0, 0.77778],
        "8863": [0, 0.675, 0, 0, 0.77778],
        "8864": [0, 0.675, 0, 0, 0.77778],
        "8865": [0, 0.675, 0, 0, 0.77778],
        "8872": [0, 0.69224, 0, 0, 0.61111],
        "8873": [0, 0.69224, 0, 0, 0.72222],
        "8874": [0, 0.69224, 0, 0, 0.88889],
        "8876": [0, 0.68889, 0, 0, 0.61111],
        "8877": [0, 0.68889, 0, 0, 0.61111],
        "8878": [0, 0.68889, 0, 0, 0.72222],
        "8879": [0, 0.68889, 0, 0, 0.72222],
        "8882": [0.03517, 0.54986, 0, 0, 0.77778],
        "8883": [0.03517, 0.54986, 0, 0, 0.77778],
        "8884": [0.13667, 0.63667, 0, 0, 0.77778],
        "8885": [0.13667, 0.63667, 0, 0, 0.77778],
        "8888": [0, 0.54986, 0, 0, 1.11111],
        "8890": [0.19444, 0.43056, 0, 0, 0.55556],
        "8891": [0.19444, 0.69224, 0, 0, 0.61111],
        "8892": [0.19444, 0.69224, 0, 0, 0.61111],
        "8901": [0, 0.54986, 0, 0, 0.27778],
        "8903": [0.08167, 0.58167, 0, 0, 0.77778],
        "8905": [0.08167, 0.58167, 0, 0, 0.77778],
        "8906": [0.08167, 0.58167, 0, 0, 0.77778],
        "8907": [0, 0.69224, 0, 0, 0.77778],
        "8908": [0, 0.69224, 0, 0, 0.77778],
        "8909": [-0.03598, 0.46402, 0, 0, 0.77778],
        "8910": [0, 0.54986, 0, 0, 0.76042],
        "8911": [0, 0.54986, 0, 0, 0.76042],
        "8912": [0.03517, 0.54986, 0, 0, 0.77778],
        "8913": [0.03517, 0.54986, 0, 0, 0.77778],
        "8914": [0, 0.54986, 0, 0, 0.66667],
        "8915": [0, 0.54986, 0, 0, 0.66667],
        "8916": [0, 0.69224, 0, 0, 0.66667],
        "8918": [0.0391, 0.5391, 0, 0, 0.77778],
        "8919": [0.0391, 0.5391, 0, 0, 0.77778],
        "8920": [0.03517, 0.54986, 0, 0, 1.33334],
        "8921": [0.03517, 0.54986, 0, 0, 1.33334],
        "8922": [0.38569, 0.88569, 0, 0, 0.77778],
        "8923": [0.38569, 0.88569, 0, 0, 0.77778],
        "8926": [0.13667, 0.63667, 0, 0, 0.77778],
        "8927": [0.13667, 0.63667, 0, 0, 0.77778],
        "8928": [0.30274, 0.79383, 0, 0, 0.77778],
        "8929": [0.30274, 0.79383, 0, 0, 0.77778],
        "8934": [0.23222, 0.74111, 0, 0, 0.77778],
        "8935": [0.23222, 0.74111, 0, 0, 0.77778],
        "8936": [0.23222, 0.74111, 0, 0, 0.77778],
        "8937": [0.23222, 0.74111, 0, 0, 0.77778],
        "8938": [0.20576, 0.70576, 0, 0, 0.77778],
        "8939": [0.20576, 0.70576, 0, 0, 0.77778],
        "8940": [0.30274, 0.79383, 0, 0, 0.77778],
        "8941": [0.30274, 0.79383, 0, 0, 0.77778],
        "8994": [0.19444, 0.69224, 0, 0, 0.77778],
        "8995": [0.19444, 0.69224, 0, 0, 0.77778],
        "9416": [0.15559, 0.69224, 0, 0, 0.90222],
        "9484": [0, 0.69224, 0, 0, 0.5],
        "9488": [0, 0.69224, 0, 0, 0.5],
        "9492": [0, 0.37788, 0, 0, 0.5],
        "9496": [0, 0.37788, 0, 0, 0.5],
        "9585": [0.19444, 0.68889, 0, 0, 0.88889],
        "9586": [0.19444, 0.74111, 0, 0, 0.88889],
        "9632": [0, 0.675, 0, 0, 0.77778],
        "9633": [0, 0.675, 0, 0, 0.77778],
        "9650": [0, 0.54986, 0, 0, 0.72222],
        "9651": [0, 0.54986, 0, 0, 0.72222],
        "9654": [0.03517, 0.54986, 0, 0, 0.77778],
        "9660": [0, 0.54986, 0, 0, 0.72222],
        "9661": [0, 0.54986, 0, 0, 0.72222],
        "9664": [0.03517, 0.54986, 0, 0, 0.77778],
        "9674": [0.11111, 0.69224, 0, 0, 0.66667],
        "9733": [0.19444, 0.69224, 0, 0, 0.94445],
        "10003": [0, 0.69224, 0, 0, 0.83334],
        "10016": [0, 0.69224, 0, 0, 0.83334],
        "10731": [0.11111, 0.69224, 0, 0, 0.66667],
        "10846": [0.19444, 0.75583, 0, 0, 0.61111],
        "10877": [0.13667, 0.63667, 0, 0, 0.77778],
        "10878": [0.13667, 0.63667, 0, 0, 0.77778],
        "10885": [0.25583, 0.75583, 0, 0, 0.77778],
        "10886": [0.25583, 0.75583, 0, 0, 0.77778],
        "10887": [0.13597, 0.63597, 0, 0, 0.77778],
        "10888": [0.13597, 0.63597, 0, 0, 0.77778],
        "10889": [0.26167, 0.75726, 0, 0, 0.77778],
        "10890": [0.26167, 0.75726, 0, 0, 0.77778],
        "10891": [0.48256, 0.98256, 0, 0, 0.77778],
        "10892": [0.48256, 0.98256, 0, 0, 0.77778],
        "10901": [0.13667, 0.63667, 0, 0, 0.77778],
        "10902": [0.13667, 0.63667, 0, 0, 0.77778],
        "10933": [0.25142, 0.75726, 0, 0, 0.77778],
        "10934": [0.25142, 0.75726, 0, 0, 0.77778],
        "10935": [0.26167, 0.75726, 0, 0, 0.77778],
        "10936": [0.26167, 0.75726, 0, 0, 0.77778],
        "10937": [0.26167, 0.75726, 0, 0, 0.77778],
        "10938": [0.26167, 0.75726, 0, 0, 0.77778],
        "10949": [0.25583, 0.75583, 0, 0, 0.77778],
        "10950": [0.25583, 0.75583, 0, 0, 0.77778],
        "10955": [0.28481, 0.79383, 0, 0, 0.77778],
        "10956": [0.28481, 0.79383, 0, 0, 0.77778],
        "57350": [0.08167, 0.58167, 0, 0, 0.22222],
        "57351": [0.08167, 0.58167, 0, 0, 0.38889],
        "57352": [0.08167, 0.58167, 0, 0, 0.77778],
        "57353": [0, 0.43056, 0.04028, 0, 0.66667],
        "57356": [0.25142, 0.75726, 0, 0, 0.77778],
        "57357": [0.25142, 0.75726, 0, 0, 0.77778],
        "57358": [0.41951, 0.91951, 0, 0, 0.77778],
        "57359": [0.30274, 0.79383, 0, 0, 0.77778],
        "57360": [0.30274, 0.79383, 0, 0, 0.77778],
        "57361": [0.41951, 0.91951, 0, 0, 0.77778],
        "57366": [0.25142, 0.75726, 0, 0, 0.77778],
        "57367": [0.25142, 0.75726, 0, 0, 0.77778],
        "57368": [0.25142, 0.75726, 0, 0, 0.77778],
        "57369": [0.25142, 0.75726, 0, 0, 0.77778],
        "57370": [0.13597, 0.63597, 0, 0, 0.77778],
        "57371": [0.13597, 0.63597, 0, 0, 0.77778]
    },
    "Caligraphic-Regular": {
        "48": [0, 0.43056, 0, 0, 0.5],
        "49": [0, 0.43056, 0, 0, 0.5],
        "50": [0, 0.43056, 0, 0, 0.5],
        "51": [0.19444, 0.43056, 0, 0, 0.5],
        "52": [0.19444, 0.43056, 0, 0, 0.5],
        "53": [0.19444, 0.43056, 0, 0, 0.5],
        "54": [0, 0.64444, 0, 0, 0.5],
        "55": [0.19444, 0.43056, 0, 0, 0.5],
        "56": [0, 0.64444, 0, 0, 0.5],
        "57": [0.19444, 0.43056, 0, 0, 0.5],
        "65": [0, 0.68333, 0, 0.19445, 0.79847],
        "66": [0, 0.68333, 0.03041, 0.13889, 0.65681],
        "67": [0, 0.68333, 0.05834, 0.13889, 0.52653],
        "68": [0, 0.68333, 0.02778, 0.08334, 0.77139],
        "69": [0, 0.68333, 0.08944, 0.11111, 0.52778],
        "70": [0, 0.68333, 0.09931, 0.11111, 0.71875],
        "71": [0.09722, 0.68333, 0.0593, 0.11111, 0.59487],
        "72": [0, 0.68333, 0.00965, 0.11111, 0.84452],
        "73": [0, 0.68333, 0.07382, 0, 0.54452],
        "74": [0.09722, 0.68333, 0.18472, 0.16667, 0.67778],
        "75": [0, 0.68333, 0.01445, 0.05556, 0.76195],
        "76": [0, 0.68333, 0, 0.13889, 0.68972],
        "77": [0, 0.68333, 0, 0.13889, 1.2009],
        "78": [0, 0.68333, 0.14736, 0.08334, 0.82049],
        "79": [0, 0.68333, 0.02778, 0.11111, 0.79611],
        "80": [0, 0.68333, 0.08222, 0.08334, 0.69556],
        "81": [0.09722, 0.68333, 0, 0.11111, 0.81667],
        "82": [0, 0.68333, 0, 0.08334, 0.8475],
        "83": [0, 0.68333, 0.075, 0.13889, 0.60556],
        "84": [0, 0.68333, 0.25417, 0, 0.54464],
        "85": [0, 0.68333, 0.09931, 0.08334, 0.62583],
        "86": [0, 0.68333, 0.08222, 0, 0.61278],
        "87": [0, 0.68333, 0.08222, 0.08334, 0.98778],
        "88": [0, 0.68333, 0.14643, 0.13889, 0.7133],
        "89": [0.09722, 0.68333, 0.08222, 0.08334, 0.66834],
        "90": [0, 0.68333, 0.07944, 0.13889, 0.72473]
    },
    "Fraktur-Regular": {
        "33": [0, 0.69141, 0, 0, 0.29574],
        "34": [0, 0.69141, 0, 0, 0.21471],
        "38": [0, 0.69141, 0, 0, 0.73786],
        "39": [0, 0.69141, 0, 0, 0.21201],
        "40": [0.24982, 0.74947, 0, 0, 0.38865],
        "41": [0.24982, 0.74947, 0, 0, 0.38865],
        "42": [0, 0.62119, 0, 0, 0.27764],
        "43": [0.08319, 0.58283, 0, 0, 0.75623],
        "44": [0, 0.10803, 0, 0, 0.27764],
        "45": [0.08319, 0.58283, 0, 0, 0.75623],
        "46": [0, 0.10803, 0, 0, 0.27764],
        "47": [0.24982, 0.74947, 0, 0, 0.50181],
        "48": [0, 0.47534, 0, 0, 0.50181],
        "49": [0, 0.47534, 0, 0, 0.50181],
        "50": [0, 0.47534, 0, 0, 0.50181],
        "51": [0.18906, 0.47534, 0, 0, 0.50181],
        "52": [0.18906, 0.47534, 0, 0, 0.50181],
        "53": [0.18906, 0.47534, 0, 0, 0.50181],
        "54": [0, 0.69141, 0, 0, 0.50181],
        "55": [0.18906, 0.47534, 0, 0, 0.50181],
        "56": [0, 0.69141, 0, 0, 0.50181],
        "57": [0.18906, 0.47534, 0, 0, 0.50181],
        "58": [0, 0.47534, 0, 0, 0.21606],
        "59": [0.12604, 0.47534, 0, 0, 0.21606],
        "61": [-0.13099, 0.36866, 0, 0, 0.75623],
        "63": [0, 0.69141, 0, 0, 0.36245],
        "65": [0, 0.69141, 0, 0, 0.7176],
        "66": [0, 0.69141, 0, 0, 0.88397],
        "67": [0, 0.69141, 0, 0, 0.61254],
        "68": [0, 0.69141, 0, 0, 0.83158],
        "69": [0, 0.69141, 0, 0, 0.66278],
        "70": [0.12604, 0.69141, 0, 0, 0.61119],
        "71": [0, 0.69141, 0, 0, 0.78539],
        "72": [0.06302, 0.69141, 0, 0, 0.7203],
        "73": [0, 0.69141, 0, 0, 0.55448],
        "74": [0.12604, 0.69141, 0, 0, 0.55231],
        "75": [0, 0.69141, 0, 0, 0.66845],
        "76": [0, 0.69141, 0, 0, 0.66602],
        "77": [0, 0.69141, 0, 0, 1.04953],
        "78": [0, 0.69141, 0, 0, 0.83212],
        "79": [0, 0.69141, 0, 0, 0.82699],
        "80": [0.18906, 0.69141, 0, 0, 0.82753],
        "81": [0.03781, 0.69141, 0, 0, 0.82699],
        "82": [0, 0.69141, 0, 0, 0.82807],
        "83": [0, 0.69141, 0, 0, 0.82861],
        "84": [0, 0.69141, 0, 0, 0.66899],
        "85": [0, 0.69141, 0, 0, 0.64576],
        "86": [0, 0.69141, 0, 0, 0.83131],
        "87": [0, 0.69141, 0, 0, 1.04602],
        "88": [0, 0.69141, 0, 0, 0.71922],
        "89": [0.18906, 0.69141, 0, 0, 0.83293],
        "90": [0.12604, 0.69141, 0, 0, 0.60201],
        "91": [0.24982, 0.74947, 0, 0, 0.27764],
        "93": [0.24982, 0.74947, 0, 0, 0.27764],
        "94": [0, 0.69141, 0, 0, 0.49965],
        "97": [0, 0.47534, 0, 0, 0.50046],
        "98": [0, 0.69141, 0, 0, 0.51315],
        "99": [0, 0.47534, 0, 0, 0.38946],
        "100": [0, 0.62119, 0, 0, 0.49857],
        "101": [0, 0.47534, 0, 0, 0.40053],
        "102": [0.18906, 0.69141, 0, 0, 0.32626],
        "103": [0.18906, 0.47534, 0, 0, 0.5037],
        "104": [0.18906, 0.69141, 0, 0, 0.52126],
        "105": [0, 0.69141, 0, 0, 0.27899],
        "106": [0, 0.69141, 0, 0, 0.28088],
        "107": [0, 0.69141, 0, 0, 0.38946],
        "108": [0, 0.69141, 0, 0, 0.27953],
        "109": [0, 0.47534, 0, 0, 0.76676],
        "110": [0, 0.47534, 0, 0, 0.52666],
        "111": [0, 0.47534, 0, 0, 0.48885],
        "112": [0.18906, 0.52396, 0, 0, 0.50046],
        "113": [0.18906, 0.47534, 0, 0, 0.48912],
        "114": [0, 0.47534, 0, 0, 0.38919],
        "115": [0, 0.47534, 0, 0, 0.44266],
        "116": [0, 0.62119, 0, 0, 0.33301],
        "117": [0, 0.47534, 0, 0, 0.5172],
        "118": [0, 0.52396, 0, 0, 0.5118],
        "119": [0, 0.52396, 0, 0, 0.77351],
        "120": [0.18906, 0.47534, 0, 0, 0.38865],
        "121": [0.18906, 0.47534, 0, 0, 0.49884],
        "122": [0.18906, 0.47534, 0, 0, 0.39054],
        "8216": [0, 0.69141, 0, 0, 0.21471],
        "8217": [0, 0.69141, 0, 0, 0.21471],
        "58112": [0, 0.62119, 0, 0, 0.49749],
        "58113": [0, 0.62119, 0, 0, 0.4983],
        "58114": [0.18906, 0.69141, 0, 0, 0.33328],
        "58115": [0.18906, 0.69141, 0, 0, 0.32923],
        "58116": [0.18906, 0.47534, 0, 0, 0.50343],
        "58117": [0, 0.69141, 0, 0, 0.33301],
        "58118": [0, 0.62119, 0, 0, 0.33409],
        "58119": [0, 0.47534, 0, 0, 0.50073]
    },
    "Main-Bold": {
        "33": [0, 0.69444, 0, 0, 0.35],
        "34": [0, 0.69444, 0, 0, 0.60278],
        "35": [0.19444, 0.69444, 0, 0, 0.95833],
        "36": [0.05556, 0.75, 0, 0, 0.575],
        "37": [0.05556, 0.75, 0, 0, 0.95833],
        "38": [0, 0.69444, 0, 0, 0.89444],
        "39": [0, 0.69444, 0, 0, 0.31944],
        "40": [0.25, 0.75, 0, 0, 0.44722],
        "41": [0.25, 0.75, 0, 0, 0.44722],
        "42": [0, 0.75, 0, 0, 0.575],
        "43": [0.13333, 0.63333, 0, 0, 0.89444],
        "44": [0.19444, 0.15556, 0, 0, 0.31944],
        "45": [0, 0.44444, 0, 0, 0.38333],
        "46": [0, 0.15556, 0, 0, 0.31944],
        "47": [0.25, 0.75, 0, 0, 0.575],
        "48": [0, 0.64444, 0, 0, 0.575],
        "49": [0, 0.64444, 0, 0, 0.575],
        "50": [0, 0.64444, 0, 0, 0.575],
        "51": [0, 0.64444, 0, 0, 0.575],
        "52": [0, 0.64444, 0, 0, 0.575],
        "53": [0, 0.64444, 0, 0, 0.575],
        "54": [0, 0.64444, 0, 0, 0.575],
        "55": [0, 0.64444, 0, 0, 0.575],
        "56": [0, 0.64444, 0, 0, 0.575],
        "57": [0, 0.64444, 0, 0, 0.575],
        "58": [0, 0.44444, 0, 0, 0.31944],
        "59": [0.19444, 0.44444, 0, 0, 0.31944],
        "60": [0.08556, 0.58556, 0, 0, 0.89444],
        "61": [-0.10889, 0.39111, 0, 0, 0.89444],
        "62": [0.08556, 0.58556, 0, 0, 0.89444],
        "63": [0, 0.69444, 0, 0, 0.54305],
        "64": [0, 0.69444, 0, 0, 0.89444],
        "65": [0, 0.68611, 0, 0, 0.86944],
        "66": [0, 0.68611, 0, 0, 0.81805],
        "67": [0, 0.68611, 0, 0, 0.83055],
        "68": [0, 0.68611, 0, 0, 0.88194],
        "69": [0, 0.68611, 0, 0, 0.75555],
        "70": [0, 0.68611, 0, 0, 0.72361],
        "71": [0, 0.68611, 0, 0, 0.90416],
        "72": [0, 0.68611, 0, 0, 0.9],
        "73": [0, 0.68611, 0, 0, 0.43611],
        "74": [0, 0.68611, 0, 0, 0.59444],
        "75": [0, 0.68611, 0, 0, 0.90138],
        "76": [0, 0.68611, 0, 0, 0.69166],
        "77": [0, 0.68611, 0, 0, 1.09166],
        "78": [0, 0.68611, 0, 0, 0.9],
        "79": [0, 0.68611, 0, 0, 0.86388],
        "80": [0, 0.68611, 0, 0, 0.78611],
        "81": [0.19444, 0.68611, 0, 0, 0.86388],
        "82": [0, 0.68611, 0, 0, 0.8625],
        "83": [0, 0.68611, 0, 0, 0.63889],
        "84": [0, 0.68611, 0, 0, 0.8],
        "85": [0, 0.68611, 0, 0, 0.88472],
        "86": [0, 0.68611, 0.01597, 0, 0.86944],
        "87": [0, 0.68611, 0.01597, 0, 1.18888],
        "88": [0, 0.68611, 0, 0, 0.86944],
        "89": [0, 0.68611, 0.02875, 0, 0.86944],
        "90": [0, 0.68611, 0, 0, 0.70277],
        "91": [0.25, 0.75, 0, 0, 0.31944],
        "92": [0.25, 0.75, 0, 0, 0.575],
        "93": [0.25, 0.75, 0, 0, 0.31944],
        "94": [0, 0.69444, 0, 0, 0.575],
        "95": [0.31, 0.13444, 0.03194, 0, 0.575],
        "96": [0, 0.69444, 0, 0, 0.575],
        "97": [0, 0.44444, 0, 0, 0.55902],
        "98": [0, 0.69444, 0, 0, 0.63889],
        "99": [0, 0.44444, 0, 0, 0.51111],
        "100": [0, 0.69444, 0, 0, 0.63889],
        "101": [0, 0.44444, 0, 0, 0.52708],
        "102": [0, 0.69444, 0.10903, 0, 0.35139],
        "103": [0.19444, 0.44444, 0.01597, 0, 0.575],
        "104": [0, 0.69444, 0, 0, 0.63889],
        "105": [0, 0.69444, 0, 0, 0.31944],
        "106": [0.19444, 0.69444, 0, 0, 0.35139],
        "107": [0, 0.69444, 0, 0, 0.60694],
        "108": [0, 0.69444, 0, 0, 0.31944],
        "109": [0, 0.44444, 0, 0, 0.95833],
        "110": [0, 0.44444, 0, 0, 0.63889],
        "111": [0, 0.44444, 0, 0, 0.575],
        "112": [0.19444, 0.44444, 0, 0, 0.63889],
        "113": [0.19444, 0.44444, 0, 0, 0.60694],
        "114": [0, 0.44444, 0, 0, 0.47361],
        "115": [0, 0.44444, 0, 0, 0.45361],
        "116": [0, 0.63492, 0, 0, 0.44722],
        "117": [0, 0.44444, 0, 0, 0.63889],
        "118": [0, 0.44444, 0.01597, 0, 0.60694],
        "119": [0, 0.44444, 0.01597, 0, 0.83055],
        "120": [0, 0.44444, 0, 0, 0.60694],
        "121": [0.19444, 0.44444, 0.01597, 0, 0.60694],
        "122": [0, 0.44444, 0, 0, 0.51111],
        "123": [0.25, 0.75, 0, 0, 0.575],
        "124": [0.25, 0.75, 0, 0, 0.31944],
        "125": [0.25, 0.75, 0, 0, 0.575],
        "126": [0.35, 0.34444, 0, 0, 0.575],
        "168": [0, 0.69444, 0, 0, 0.575],
        "172": [0, 0.44444, 0, 0, 0.76666],
        "175": [0, 0.59611, 0, 0, 0.575],
        "176": [0, 0.69444, 0, 0, 0.86944],
        "177": [0.13333, 0.63333, 0, 0, 0.89444],
        "180": [0, 0.69444, 0, 0, 0.575],
        "215": [0.13333, 0.63333, 0, 0, 0.89444],
        "247": [0.13333, 0.63333, 0, 0, 0.89444],
        "305": [0, 0.44444, 0, 0, 0.31944],
        "567": [0.19444, 0.44444, 0, 0, 0.35139],
        "710": [0, 0.69444, 0, 0, 0.575],
        "711": [0, 0.63194, 0, 0, 0.575],
        "713": [0, 0.59611, 0, 0, 0.575],
        "714": [0, 0.69444, 0, 0, 0.575],
        "715": [0, 0.69444, 0, 0, 0.575],
        "728": [0, 0.69444, 0, 0, 0.575],
        "729": [0, 0.69444, 0, 0, 0.31944],
        "730": [0, 0.69444, 0, 0, 0.86944],
        "732": [0, 0.69444, 0, 0, 0.575],
        "768": [0, 0.69444, 0, 0, 0.575],
        "769": [0, 0.69444, 0, 0, 0.575],
        "770": [0, 0.69444, 0, 0, 0.575],
        "771": [0, 0.69444, 0, 0, 0.575],
        "772": [0, 0.59611, 0, 0, 0.575],
        "774": [0, 0.69444, 0, 0, 0.575],
        "775": [0, 0.69444, 0, 0, 0.31944],
        "776": [0, 0.69444, 0, 0, 0.575],
        "778": [0, 0.69444, 0, 0, 0.86944],
        "779": [0, 0.69444, 0, 0, 0.575],
        "780": [0, 0.63194, 0, 0, 0.575],
        "824": [0.19444, 0.69444, 0, 0, 0],
        "915": [0, 0.68611, 0, 0, 0.69166],
        "916": [0, 0.68611, 0, 0, 0.95833],
        "920": [0, 0.68611, 0, 0, 0.89444],
        "923": [0, 0.68611, 0, 0, 0.80555],
        "926": [0, 0.68611, 0, 0, 0.76666],
        "928": [0, 0.68611, 0, 0, 0.9],
        "931": [0, 0.68611, 0, 0, 0.83055],
        "933": [0, 0.68611, 0, 0, 0.89444],
        "934": [0, 0.68611, 0, 0, 0.83055],
        "936": [0, 0.68611, 0, 0, 0.89444],
        "937": [0, 0.68611, 0, 0, 0.83055],
        "8211": [0, 0.44444, 0.03194, 0, 0.575],
        "8212": [0, 0.44444, 0.03194, 0, 1.14999],
        "8216": [0, 0.69444, 0, 0, 0.31944],
        "8217": [0, 0.69444, 0, 0, 0.31944],
        "8220": [0, 0.69444, 0, 0, 0.60278],
        "8221": [0, 0.69444, 0, 0, 0.60278],
        "8224": [0.19444, 0.69444, 0, 0, 0.51111],
        "8225": [0.19444, 0.69444, 0, 0, 0.51111],
        "8242": [0, 0.55556, 0, 0, 0.34444],
        "8407": [0, 0.72444, 0.15486, 0, 0.575],
        "8463": [0, 0.69444, 0, 0, 0.66759],
        "8465": [0, 0.69444, 0, 0, 0.83055],
        "8467": [0, 0.69444, 0, 0, 0.47361],
        "8472": [0.19444, 0.44444, 0, 0, 0.74027],
        "8476": [0, 0.69444, 0, 0, 0.83055],
        "8501": [0, 0.69444, 0, 0, 0.70277],
        "8592": [-0.10889, 0.39111, 0, 0, 1.14999],
        "8593": [0.19444, 0.69444, 0, 0, 0.575],
        "8594": [-0.10889, 0.39111, 0, 0, 1.14999],
        "8595": [0.19444, 0.69444, 0, 0, 0.575],
        "8596": [-0.10889, 0.39111, 0, 0, 1.14999],
        "8597": [0.25, 0.75, 0, 0, 0.575],
        "8598": [0.19444, 0.69444, 0, 0, 1.14999],
        "8599": [0.19444, 0.69444, 0, 0, 1.14999],
        "8600": [0.19444, 0.69444, 0, 0, 1.14999],
        "8601": [0.19444, 0.69444, 0, 0, 1.14999],
        "8636": [-0.10889, 0.39111, 0, 0, 1.14999],
        "8637": [-0.10889, 0.39111, 0, 0, 1.14999],
        "8640": [-0.10889, 0.39111, 0, 0, 1.14999],
        "8641": [-0.10889, 0.39111, 0, 0, 1.14999],
        "8656": [-0.10889, 0.39111, 0, 0, 1.14999],
        "8657": [0.19444, 0.69444, 0, 0, 0.70277],
        "8658": [-0.10889, 0.39111, 0, 0, 1.14999],
        "8659": [0.19444, 0.69444, 0, 0, 0.70277],
        "8660": [-0.10889, 0.39111, 0, 0, 1.14999],
        "8661": [0.25, 0.75, 0, 0, 0.70277],
        "8704": [0, 0.69444, 0, 0, 0.63889],
        "8706": [0, 0.69444, 0.06389, 0, 0.62847],
        "8707": [0, 0.69444, 0, 0, 0.63889],
        "8709": [0.05556, 0.75, 0, 0, 0.575],
        "8711": [0, 0.68611, 0, 0, 0.95833],
        "8712": [0.08556, 0.58556, 0, 0, 0.76666],
        "8715": [0.08556, 0.58556, 0, 0, 0.76666],
        "8722": [0.13333, 0.63333, 0, 0, 0.89444],
        "8723": [0.13333, 0.63333, 0, 0, 0.89444],
        "8725": [0.25, 0.75, 0, 0, 0.575],
        "8726": [0.25, 0.75, 0, 0, 0.575],
        "8727": [-0.02778, 0.47222, 0, 0, 0.575],
        "8728": [-0.02639, 0.47361, 0, 0, 0.575],
        "8729": [-0.02639, 0.47361, 0, 0, 0.575],
        "8730": [0.18, 0.82, 0, 0, 0.95833],
        "8733": [0, 0.44444, 0, 0, 0.89444],
        "8734": [0, 0.44444, 0, 0, 1.14999],
        "8736": [0, 0.69224, 0, 0, 0.72222],
        "8739": [0.25, 0.75, 0, 0, 0.31944],
        "8741": [0.25, 0.75, 0, 0, 0.575],
        "8743": [0, 0.55556, 0, 0, 0.76666],
        "8744": [0, 0.55556, 0, 0, 0.76666],
        "8745": [0, 0.55556, 0, 0, 0.76666],
        "8746": [0, 0.55556, 0, 0, 0.76666],
        "8747": [0.19444, 0.69444, 0.12778, 0, 0.56875],
        "8764": [-0.10889, 0.39111, 0, 0, 0.89444],
        "8768": [0.19444, 0.69444, 0, 0, 0.31944],
        "8771": [0.00222, 0.50222, 0, 0, 0.89444],
        "8776": [0.02444, 0.52444, 0, 0, 0.89444],
        "8781": [0.00222, 0.50222, 0, 0, 0.89444],
        "8801": [0.00222, 0.50222, 0, 0, 0.89444],
        "8804": [0.19667, 0.69667, 0, 0, 0.89444],
        "8805": [0.19667, 0.69667, 0, 0, 0.89444],
        "8810": [0.08556, 0.58556, 0, 0, 1.14999],
        "8811": [0.08556, 0.58556, 0, 0, 1.14999],
        "8826": [0.08556, 0.58556, 0, 0, 0.89444],
        "8827": [0.08556, 0.58556, 0, 0, 0.89444],
        "8834": [0.08556, 0.58556, 0, 0, 0.89444],
        "8835": [0.08556, 0.58556, 0, 0, 0.89444],
        "8838": [0.19667, 0.69667, 0, 0, 0.89444],
        "8839": [0.19667, 0.69667, 0, 0, 0.89444],
        "8846": [0, 0.55556, 0, 0, 0.76666],
        "8849": [0.19667, 0.69667, 0, 0, 0.89444],
        "8850": [0.19667, 0.69667, 0, 0, 0.89444],
        "8851": [0, 0.55556, 0, 0, 0.76666],
        "8852": [0, 0.55556, 0, 0, 0.76666],
        "8853": [0.13333, 0.63333, 0, 0, 0.89444],
        "8854": [0.13333, 0.63333, 0, 0, 0.89444],
        "8855": [0.13333, 0.63333, 0, 0, 0.89444],
        "8856": [0.13333, 0.63333, 0, 0, 0.89444],
        "8857": [0.13333, 0.63333, 0, 0, 0.89444],
        "8866": [0, 0.69444, 0, 0, 0.70277],
        "8867": [0, 0.69444, 0, 0, 0.70277],
        "8868": [0, 0.69444, 0, 0, 0.89444],
        "8869": [0, 0.69444, 0, 0, 0.89444],
        "8900": [-0.02639, 0.47361, 0, 0, 0.575],
        "8901": [-0.02639, 0.47361, 0, 0, 0.31944],
        "8902": [-0.02778, 0.47222, 0, 0, 0.575],
        "8968": [0.25, 0.75, 0, 0, 0.51111],
        "8969": [0.25, 0.75, 0, 0, 0.51111],
        "8970": [0.25, 0.75, 0, 0, 0.51111],
        "8971": [0.25, 0.75, 0, 0, 0.51111],
        "8994": [-0.13889, 0.36111, 0, 0, 1.14999],
        "8995": [-0.13889, 0.36111, 0, 0, 1.14999],
        "9651": [0.19444, 0.69444, 0, 0, 1.02222],
        "9657": [-0.02778, 0.47222, 0, 0, 0.575],
        "9661": [0.19444, 0.69444, 0, 0, 1.02222],
        "9667": [-0.02778, 0.47222, 0, 0, 0.575],
        "9711": [0.19444, 0.69444, 0, 0, 1.14999],
        "9824": [0.12963, 0.69444, 0, 0, 0.89444],
        "9825": [0.12963, 0.69444, 0, 0, 0.89444],
        "9826": [0.12963, 0.69444, 0, 0, 0.89444],
        "9827": [0.12963, 0.69444, 0, 0, 0.89444],
        "9837": [0, 0.75, 0, 0, 0.44722],
        "9838": [0.19444, 0.69444, 0, 0, 0.44722],
        "9839": [0.19444, 0.69444, 0, 0, 0.44722],
        "10216": [0.25, 0.75, 0, 0, 0.44722],
        "10217": [0.25, 0.75, 0, 0, 0.44722],
        "10815": [0, 0.68611, 0, 0, 0.9],
        "10927": [0.19667, 0.69667, 0, 0, 0.89444],
        "10928": [0.19667, 0.69667, 0, 0, 0.89444]
    },
    "Main-Italic": {
        "33": [0, 0.69444, 0.12417, 0, 0.30667],
        "34": [0, 0.69444, 0.06961, 0, 0.51444],
        "35": [0.19444, 0.69444, 0.06616, 0, 0.81777],
        "37": [0.05556, 0.75, 0.13639, 0, 0.81777],
        "38": [0, 0.69444, 0.09694, 0, 0.76666],
        "39": [0, 0.69444, 0.12417, 0, 0.30667],
        "40": [0.25, 0.75, 0.16194, 0, 0.40889],
        "41": [0.25, 0.75, 0.03694, 0, 0.40889],
        "42": [0, 0.75, 0.14917, 0, 0.51111],
        "43": [0.05667, 0.56167, 0.03694, 0, 0.76666],
        "44": [0.19444, 0.10556, 0, 0, 0.30667],
        "45": [0, 0.43056, 0.02826, 0, 0.35778],
        "46": [0, 0.10556, 0, 0, 0.30667],
        "47": [0.25, 0.75, 0.16194, 0, 0.51111],
        "48": [0, 0.64444, 0.13556, 0, 0.51111],
        "49": [0, 0.64444, 0.13556, 0, 0.51111],
        "50": [0, 0.64444, 0.13556, 0, 0.51111],
        "51": [0, 0.64444, 0.13556, 0, 0.51111],
        "52": [0.19444, 0.64444, 0.13556, 0, 0.51111],
        "53": [0, 0.64444, 0.13556, 0, 0.51111],
        "54": [0, 0.64444, 0.13556, 0, 0.51111],
        "55": [0.19444, 0.64444, 0.13556, 0, 0.51111],
        "56": [0, 0.64444, 0.13556, 0, 0.51111],
        "57": [0, 0.64444, 0.13556, 0, 0.51111],
        "58": [0, 0.43056, 0.0582, 0, 0.30667],
        "59": [0.19444, 0.43056, 0.0582, 0, 0.30667],
        "61": [-0.13313, 0.36687, 0.06616, 0, 0.76666],
        "63": [0, 0.69444, 0.1225, 0, 0.51111],
        "64": [0, 0.69444, 0.09597, 0, 0.76666],
        "65": [0, 0.68333, 0, 0, 0.74333],
        "66": [0, 0.68333, 0.10257, 0, 0.70389],
        "67": [0, 0.68333, 0.14528, 0, 0.71555],
        "68": [0, 0.68333, 0.09403, 0, 0.755],
        "69": [0, 0.68333, 0.12028, 0, 0.67833],
        "70": [0, 0.68333, 0.13305, 0, 0.65277],
        "71": [0, 0.68333, 0.08722, 0, 0.77361],
        "72": [0, 0.68333, 0.16389, 0, 0.74333],
        "73": [0, 0.68333, 0.15806, 0, 0.38555],
        "74": [0, 0.68333, 0.14028, 0, 0.525],
        "75": [0, 0.68333, 0.14528, 0, 0.76888],
        "76": [0, 0.68333, 0, 0, 0.62722],
        "77": [0, 0.68333, 0.16389, 0, 0.89666],
        "78": [0, 0.68333, 0.16389, 0, 0.74333],
        "79": [0, 0.68333, 0.09403, 0, 0.76666],
        "80": [0, 0.68333, 0.10257, 0, 0.67833],
        "81": [0.19444, 0.68333, 0.09403, 0, 0.76666],
        "82": [0, 0.68333, 0.03868, 0, 0.72944],
        "83": [0, 0.68333, 0.11972, 0, 0.56222],
        "84": [0, 0.68333, 0.13305, 0, 0.71555],
        "85": [0, 0.68333, 0.16389, 0, 0.74333],
        "86": [0, 0.68333, 0.18361, 0, 0.74333],
        "87": [0, 0.68333, 0.18361, 0, 0.99888],
        "88": [0, 0.68333, 0.15806, 0, 0.74333],
        "89": [0, 0.68333, 0.19383, 0, 0.74333],
        "90": [0, 0.68333, 0.14528, 0, 0.61333],
        "91": [0.25, 0.75, 0.1875, 0, 0.30667],
        "93": [0.25, 0.75, 0.10528, 0, 0.30667],
        "94": [0, 0.69444, 0.06646, 0, 0.51111],
        "95": [0.31, 0.12056, 0.09208, 0, 0.51111],
        "97": [0, 0.43056, 0.07671, 0, 0.51111],
        "98": [0, 0.69444, 0.06312, 0, 0.46],
        "99": [0, 0.43056, 0.05653, 0, 0.46],
        "100": [0, 0.69444, 0.10333, 0, 0.51111],
        "101": [0, 0.43056, 0.07514, 0, 0.46],
        "102": [0.19444, 0.69444, 0.21194, 0, 0.30667],
        "103": [0.19444, 0.43056, 0.08847, 0, 0.46],
        "104": [0, 0.69444, 0.07671, 0, 0.51111],
        "105": [0, 0.65536, 0.1019, 0, 0.30667],
        "106": [0.19444, 0.65536, 0.14467, 0, 0.30667],
        "107": [0, 0.69444, 0.10764, 0, 0.46],
        "108": [0, 0.69444, 0.10333, 0, 0.25555],
        "109": [0, 0.43056, 0.07671, 0, 0.81777],
        "110": [0, 0.43056, 0.07671, 0, 0.56222],
        "111": [0, 0.43056, 0.06312, 0, 0.51111],
        "112": [0.19444, 0.43056, 0.06312, 0, 0.51111],
        "113": [0.19444, 0.43056, 0.08847, 0, 0.46],
        "114": [0, 0.43056, 0.10764, 0, 0.42166],
        "115": [0, 0.43056, 0.08208, 0, 0.40889],
        "116": [0, 0.61508, 0.09486, 0, 0.33222],
        "117": [0, 0.43056, 0.07671, 0, 0.53666],
        "118": [0, 0.43056, 0.10764, 0, 0.46],
        "119": [0, 0.43056, 0.10764, 0, 0.66444],
        "120": [0, 0.43056, 0.12042, 0, 0.46389],
        "121": [0.19444, 0.43056, 0.08847, 0, 0.48555],
        "122": [0, 0.43056, 0.12292, 0, 0.40889],
        "126": [0.35, 0.31786, 0.11585, 0, 0.51111],
        "163": [0, 0.69444, 0, 0, 0.76909],
        "305": [0, 0.43056, 0, 0.02778, 0.32246],
        "567": [0.19444, 0.43056, 0, 0.08334, 0.38403],
        "768": [0, 0.69444, 0, 0, 0.51111],
        "769": [0, 0.69444, 0.09694, 0, 0.51111],
        "770": [0, 0.69444, 0.06646, 0, 0.51111],
        "771": [0, 0.66786, 0.11585, 0, 0.51111],
        "772": [0, 0.56167, 0.10333, 0, 0.51111],
        "774": [0, 0.69444, 0.10806, 0, 0.51111],
        "775": [0, 0.66786, 0.11752, 0, 0.30667],
        "776": [0, 0.66786, 0.10474, 0, 0.51111],
        "778": [0, 0.69444, 0, 0, 0.83129],
        "779": [0, 0.69444, 0.1225, 0, 0.51111],
        "780": [0, 0.62847, 0.08295, 0, 0.51111],
        "915": [0, 0.68333, 0.13305, 0, 0.62722],
        "916": [0, 0.68333, 0, 0, 0.81777],
        "920": [0, 0.68333, 0.09403, 0, 0.76666],
        "923": [0, 0.68333, 0, 0, 0.69222],
        "926": [0, 0.68333, 0.15294, 0, 0.66444],
        "928": [0, 0.68333, 0.16389, 0, 0.74333],
        "931": [0, 0.68333, 0.12028, 0, 0.71555],
        "933": [0, 0.68333, 0.11111, 0, 0.76666],
        "934": [0, 0.68333, 0.05986, 0, 0.71555],
        "936": [0, 0.68333, 0.11111, 0, 0.76666],
        "937": [0, 0.68333, 0.10257, 0, 0.71555],
        "8211": [0, 0.43056, 0.09208, 0, 0.51111],
        "8212": [0, 0.43056, 0.09208, 0, 1.02222],
        "8216": [0, 0.69444, 0.12417, 0, 0.30667],
        "8217": [0, 0.69444, 0.12417, 0, 0.30667],
        "8220": [0, 0.69444, 0.1685, 0, 0.51444],
        "8221": [0, 0.69444, 0.06961, 0, 0.51444],
        "8463": [0, 0.68889, 0, 0, 0.54028]
    },
    "Main-Regular": {
        "32": [0, 0, 0, 0, 0],
        "33": [0, 0.69444, 0, 0, 0.27778],
        "34": [0, 0.69444, 0, 0, 0.5],
        "35": [0.19444, 0.69444, 0, 0, 0.83334],
        "36": [0.05556, 0.75, 0, 0, 0.5],
        "37": [0.05556, 0.75, 0, 0, 0.83334],
        "38": [0, 0.69444, 0, 0, 0.77778],
        "39": [0, 0.69444, 0, 0, 0.27778],
        "40": [0.25, 0.75, 0, 0, 0.38889],
        "41": [0.25, 0.75, 0, 0, 0.38889],
        "42": [0, 0.75, 0, 0, 0.5],
        "43": [0.08333, 0.58333, 0, 0, 0.77778],
        "44": [0.19444, 0.10556, 0, 0, 0.27778],
        "45": [0, 0.43056, 0, 0, 0.33333],
        "46": [0, 0.10556, 0, 0, 0.27778],
        "47": [0.25, 0.75, 0, 0, 0.5],
        "48": [0, 0.64444, 0, 0, 0.5],
        "49": [0, 0.64444, 0, 0, 0.5],
        "50": [0, 0.64444, 0, 0, 0.5],
        "51": [0, 0.64444, 0, 0, 0.5],
        "52": [0, 0.64444, 0, 0, 0.5],
        "53": [0, 0.64444, 0, 0, 0.5],
        "54": [0, 0.64444, 0, 0, 0.5],
        "55": [0, 0.64444, 0, 0, 0.5],
        "56": [0, 0.64444, 0, 0, 0.5],
        "57": [0, 0.64444, 0, 0, 0.5],
        "58": [0, 0.43056, 0, 0, 0.27778],
        "59": [0.19444, 0.43056, 0, 0, 0.27778],
        "60": [0.0391, 0.5391, 0, 0, 0.77778],
        "61": [-0.13313, 0.36687, 0, 0, 0.77778],
        "62": [0.0391, 0.5391, 0, 0, 0.77778],
        "63": [0, 0.69444, 0, 0, 0.47222],
        "64": [0, 0.69444, 0, 0, 0.77778],
        "65": [0, 0.68333, 0, 0, 0.75],
        "66": [0, 0.68333, 0, 0, 0.70834],
        "67": [0, 0.68333, 0, 0, 0.72222],
        "68": [0, 0.68333, 0, 0, 0.76389],
        "69": [0, 0.68333, 0, 0, 0.68056],
        "70": [0, 0.68333, 0, 0, 0.65278],
        "71": [0, 0.68333, 0, 0, 0.78472],
        "72": [0, 0.68333, 0, 0, 0.75],
        "73": [0, 0.68333, 0, 0, 0.36111],
        "74": [0, 0.68333, 0, 0, 0.51389],
        "75": [0, 0.68333, 0, 0, 0.77778],
        "76": [0, 0.68333, 0, 0, 0.625],
        "77": [0, 0.68333, 0, 0, 0.91667],
        "78": [0, 0.68333, 0, 0, 0.75],
        "79": [0, 0.68333, 0, 0, 0.77778],
        "80": [0, 0.68333, 0, 0, 0.68056],
        "81": [0.19444, 0.68333, 0, 0, 0.77778],
        "82": [0, 0.68333, 0, 0, 0.73611],
        "83": [0, 0.68333, 0, 0, 0.55556],
        "84": [0, 0.68333, 0, 0, 0.72222],
        "85": [0, 0.68333, 0, 0, 0.75],
        "86": [0, 0.68333, 0.01389, 0, 0.75],
        "87": [0, 0.68333, 0.01389, 0, 1.02778],
        "88": [0, 0.68333, 0, 0, 0.75],
        "89": [0, 0.68333, 0.025, 0, 0.75],
        "90": [0, 0.68333, 0, 0, 0.61111],
        "91": [0.25, 0.75, 0, 0, 0.27778],
        "92": [0.25, 0.75, 0, 0, 0.5],
        "93": [0.25, 0.75, 0, 0, 0.27778],
        "94": [0, 0.69444, 0, 0, 0.5],
        "95": [0.31, 0.12056, 0.02778, 0, 0.5],
        "96": [0, 0.69444, 0, 0, 0.5],
        "97": [0, 0.43056, 0, 0, 0.5],
        "98": [0, 0.69444, 0, 0, 0.55556],
        "99": [0, 0.43056, 0, 0, 0.44445],
        "100": [0, 0.69444, 0, 0, 0.55556],
        "101": [0, 0.43056, 0, 0, 0.44445],
        "102": [0, 0.69444, 0.07778, 0, 0.30556],
        "103": [0.19444, 0.43056, 0.01389, 0, 0.5],
        "104": [0, 0.69444, 0, 0, 0.55556],
        "105": [0, 0.66786, 0, 0, 0.27778],
        "106": [0.19444, 0.66786, 0, 0, 0.30556],
        "107": [0, 0.69444, 0, 0, 0.52778],
        "108": [0, 0.69444, 0, 0, 0.27778],
        "109": [0, 0.43056, 0, 0, 0.83334],
        "110": [0, 0.43056, 0, 0, 0.55556],
        "111": [0, 0.43056, 0, 0, 0.5],
        "112": [0.19444, 0.43056, 0, 0, 0.55556],
        "113": [0.19444, 0.43056, 0, 0, 0.52778],
        "114": [0, 0.43056, 0, 0, 0.39167],
        "115": [0, 0.43056, 0, 0, 0.39445],
        "116": [0, 0.61508, 0, 0, 0.38889],
        "117": [0, 0.43056, 0, 0, 0.55556],
        "118": [0, 0.43056, 0.01389, 0, 0.52778],
        "119": [0, 0.43056, 0.01389, 0, 0.72222],
        "120": [0, 0.43056, 0, 0, 0.52778],
        "121": [0.19444, 0.43056, 0.01389, 0, 0.52778],
        "122": [0, 0.43056, 0, 0, 0.44445],
        "123": [0.25, 0.75, 0, 0, 0.5],
        "124": [0.25, 0.75, 0, 0, 0.27778],
        "125": [0.25, 0.75, 0, 0, 0.5],
        "126": [0.35, 0.31786, 0, 0, 0.5],
        "160": [0, 0, 0, 0, 0],
        "168": [0, 0.66786, 0, 0, 0.5],
        "172": [0, 0.43056, 0, 0, 0.66667],
        "175": [0, 0.56778, 0, 0, 0.5],
        "176": [0, 0.69444, 0, 0, 0.75],
        "177": [0.08333, 0.58333, 0, 0, 0.77778],
        "180": [0, 0.69444, 0, 0, 0.5],
        "198": [0, 0.68333, 0, 0, 0.90278],
        "215": [0.08333, 0.58333, 0, 0, 0.77778],
        "216": [0.04861, 0.73194, 0, 0, 0.77778],
        "223": [0, 0.69444, 0, 0, 0.5],
        "230": [0, 0.43056, 0, 0, 0.72222],
        "247": [0.08333, 0.58333, 0, 0, 0.77778],
        "248": [0.09722, 0.52778, 0, 0, 0.5],
        "305": [0, 0.43056, 0, 0, 0.27778],
        "338": [0, 0.68333, 0, 0, 1.01389],
        "339": [0, 0.43056, 0, 0, 0.77778],
        "567": [0.19444, 0.43056, 0, 0, 0.30556],
        "710": [0, 0.69444, 0, 0, 0.5],
        "711": [0, 0.62847, 0, 0, 0.5],
        "713": [0, 0.56778, 0, 0, 0.5],
        "714": [0, 0.69444, 0, 0, 0.5],
        "715": [0, 0.69444, 0, 0, 0.5],
        "728": [0, 0.69444, 0, 0, 0.5],
        "729": [0, 0.66786, 0, 0, 0.27778],
        "730": [0, 0.69444, 0, 0, 0.75],
        "732": [0, 0.66786, 0, 0, 0.5],
        "768": [0, 0.69444, 0, 0, 0.5],
        "769": [0, 0.69444, 0, 0, 0.5],
        "770": [0, 0.69444, 0, 0, 0.5],
        "771": [0, 0.66786, 0, 0, 0.5],
        "772": [0, 0.56778, 0, 0, 0.5],
        "774": [0, 0.69444, 0, 0, 0.5],
        "775": [0, 0.66786, 0, 0, 0.27778],
        "776": [0, 0.66786, 0, 0, 0.5],
        "778": [0, 0.69444, 0, 0, 0.75],
        "779": [0, 0.69444, 0, 0, 0.5],
        "780": [0, 0.62847, 0, 0, 0.5],
        "824": [0.19444, 0.69444, 0, 0, 0],
        "915": [0, 0.68333, 0, 0, 0.625],
        "916": [0, 0.68333, 0, 0, 0.83334],
        "920": [0, 0.68333, 0, 0, 0.77778],
        "923": [0, 0.68333, 0, 0, 0.69445],
        "926": [0, 0.68333, 0, 0, 0.66667],
        "928": [0, 0.68333, 0, 0, 0.75],
        "931": [0, 0.68333, 0, 0, 0.72222],
        "933": [0, 0.68333, 0, 0, 0.77778],
        "934": [0, 0.68333, 0, 0, 0.72222],
        "936": [0, 0.68333, 0, 0, 0.77778],
        "937": [0, 0.68333, 0, 0, 0.72222],
        "8211": [0, 0.43056, 0.02778, 0, 0.5],
        "8212": [0, 0.43056, 0.02778, 0, 1.0],
        "8216": [0, 0.69444, 0, 0, 0.27778],
        "8217": [0, 0.69444, 0, 0, 0.27778],
        "8220": [0, 0.69444, 0, 0, 0.5],
        "8221": [0, 0.69444, 0, 0, 0.5],
        "8224": [0.19444, 0.69444, 0, 0, 0.44445],
        "8225": [0.19444, 0.69444, 0, 0, 0.44445],
        "8230": [0, 0.12, 0, 0, 1015],
        "8242": [0, 0.55556, 0, 0, 0.275],
        "8407": [0, 0.71444, 0.15382, 0, 0.5],
        "8463": [0, 0.68889, 0, 0, 0.54028],
        "8465": [0, 0.69444, 0, 0, 0.72222],
        "8467": [0, 0.69444, 0, 0.11111, 0.41667],
        "8472": [0.19444, 0.43056, 0, 0.11111, 0.63646],
        "8476": [0, 0.69444, 0, 0, 0.72222],
        "8501": [0, 0.69444, 0, 0, 0.61111],
        "8592": [-0.13313, 0.36687, 0, 0, 1.0],
        "8593": [0.19444, 0.69444, 0, 0, 0.5],
        "8594": [-0.13313, 0.36687, 0, 0, 1.0],
        "8595": [0.19444, 0.69444, 0, 0, 0.5],
        "8596": [-0.13313, 0.36687, 0, 0, 1.0],
        "8597": [0.25, 0.75, 0, 0, 0.5],
        "8598": [0.19444, 0.69444, 0, 0, 1.0],
        "8599": [0.19444, 0.69444, 0, 0, 1.0],
        "8600": [0.19444, 0.69444, 0, 0, 1.0],
        "8601": [0.19444, 0.69444, 0, 0, 1.0],
        "8614": [0.011, 0.511, 0, 0, 889],
        "8617": [0.011, 0.511, 0, 0, 1015],
        "8618": [0.011, 0.511, 0, 0, 1015],
        "8636": [-0.13313, 0.36687, 0, 0, 1.0],
        "8637": [-0.13313, 0.36687, 0, 0, 1.0],
        "8640": [-0.13313, 0.36687, 0, 0, 1.0],
        "8641": [-0.13313, 0.36687, 0, 0, 1.0],
        "8652": [0.011, 0.671, 0, 0, 889],
        "8656": [-0.13313, 0.36687, 0, 0, 1.0],
        "8657": [0.19444, 0.69444, 0, 0, 0.61111],
        "8658": [-0.13313, 0.36687, 0, 0, 1.0],
        "8659": [0.19444, 0.69444, 0, 0, 0.61111],
        "8660": [-0.13313, 0.36687, 0, 0, 1.0],
        "8661": [0.25, 0.75, 0, 0, 0.61111],
        "8704": [0, 0.69444, 0, 0, 0.55556],
        "8706": [0, 0.69444, 0.05556, 0.08334, 0.5309],
        "8707": [0, 0.69444, 0, 0, 0.55556],
        "8709": [0.05556, 0.75, 0, 0, 0.5],
        "8711": [0, 0.68333, 0, 0, 0.83334],
        "8712": [0.0391, 0.5391, 0, 0, 0.66667],
        "8715": [0.0391, 0.5391, 0, 0, 0.66667],
        "8722": [0.08333, 0.58333, 0, 0, 0.77778],
        "8723": [0.08333, 0.58333, 0, 0, 0.77778],
        "8725": [0.25, 0.75, 0, 0, 0.5],
        "8726": [0.25, 0.75, 0, 0, 0.5],
        "8727": [-0.03472, 0.46528, 0, 0, 0.5],
        "8728": [-0.05555, 0.44445, 0, 0, 0.5],
        "8729": [-0.05555, 0.44445, 0, 0, 0.5],
        "8730": [0.2, 0.8, 0, 0, 0.83334],
        "8733": [0, 0.43056, 0, 0, 0.77778],
        "8734": [0, 0.43056, 0, 0, 1.0],
        "8736": [0, 0.69224, 0, 0, 0.72222],
        "8739": [0.25, 0.75, 0, 0, 0.27778],
        "8741": [0.25, 0.75, 0, 0, 0.5],
        "8743": [0, 0.55556, 0, 0, 0.66667],
        "8744": [0, 0.55556, 0, 0, 0.66667],
        "8745": [0, 0.55556, 0, 0, 0.66667],
        "8746": [0, 0.55556, 0, 0, 0.66667],
        "8747": [0.19444, 0.69444, 0.11111, 0, 0.41667],
        "8764": [-0.13313, 0.36687, 0, 0, 0.77778],
        "8768": [0.19444, 0.69444, 0, 0, 0.27778],
        "8771": [-0.03625, 0.46375, 0, 0, 0.77778],
        "8773": [-0.022, 0.589, 0, 0, 667],
        "8776": [-0.01688, 0.48312, 0, 0, 0.77778],
        "8781": [-0.03625, 0.46375, 0, 0, 0.77778],
        "8784": [-0.133, 0.67, 0, 0, 666],
        "8800": [0.215, 0.716, 0, 0, 666],
        "8801": [-0.03625, 0.46375, 0, 0, 0.77778],
        "8804": [0.13597, 0.63597, 0, 0, 0.77778],
        "8805": [0.13597, 0.63597, 0, 0, 0.77778],
        "8810": [0.0391, 0.5391, 0, 0, 1.0],
        "8811": [0.0391, 0.5391, 0, 0, 1.0],
        "8826": [0.0391, 0.5391, 0, 0, 0.77778],
        "8827": [0.0391, 0.5391, 0, 0, 0.77778],
        "8834": [0.0391, 0.5391, 0, 0, 0.77778],
        "8835": [0.0391, 0.5391, 0, 0, 0.77778],
        "8838": [0.13597, 0.63597, 0, 0, 0.77778],
        "8839": [0.13597, 0.63597, 0, 0, 0.77778],
        "8846": [0, 0.55556, 0, 0, 0.66667],
        "8849": [0.13597, 0.63597, 0, 0, 0.77778],
        "8850": [0.13597, 0.63597, 0, 0, 0.77778],
        "8851": [0, 0.55556, 0, 0, 0.66667],
        "8852": [0, 0.55556, 0, 0, 0.66667],
        "8853": [0.08333, 0.58333, 0, 0, 0.77778],
        "8854": [0.08333, 0.58333, 0, 0, 0.77778],
        "8855": [0.08333, 0.58333, 0, 0, 0.77778],
        "8856": [0.08333, 0.58333, 0, 0, 0.77778],
        "8857": [0.08333, 0.58333, 0, 0, 0.77778],
        "8866": [0, 0.69444, 0, 0, 0.61111],
        "8867": [0, 0.69444, 0, 0, 0.61111],
        "8868": [0, 0.69444, 0, 0, 0.77778],
        "8869": [0, 0.69444, 0, 0, 0.77778],
        "8872": [0.249, 0.75, 0, 0, 692],
        "8900": [-0.05555, 0.44445, 0, 0, 0.5],
        "8901": [-0.05555, 0.44445, 0, 0, 0.27778],
        "8902": [-0.03472, 0.46528, 0, 0, 0.5],
        "8904": [0.005, 0.505, 0, 0, 847],
        "8942": [0.03, 0.9, 0, 0, 121],
        "8943": [-0.19, 0.31, 0, 0, 1015],
        "8945": [-0.1, 0.82, 0, 0, 1015],
        "8968": [0.25, 0.75, 0, 0, 0.44445],
        "8969": [0.25, 0.75, 0, 0, 0.44445],
        "8970": [0.25, 0.75, 0, 0, 0.44445],
        "8971": [0.25, 0.75, 0, 0, 0.44445],
        "8994": [-0.14236, 0.35764, 0, 0, 1.0],
        "8995": [-0.14236, 0.35764, 0, 0, 1.0],
        "9136": [0.244, 0.744, 0, 0, 301],
        "9137": [0.244, 0.744, 0, 0, 301],
        "9651": [0.19444, 0.69444, 0, 0, 0.88889],
        "9657": [-0.03472, 0.46528, 0, 0, 0.5],
        "9661": [0.19444, 0.69444, 0, 0, 0.88889],
        "9667": [-0.03472, 0.46528, 0, 0, 0.5],
        "9711": [0.19444, 0.69444, 0, 0, 1.0],
        "9824": [0.12963, 0.69444, 0, 0, 0.77778],
        "9825": [0.12963, 0.69444, 0, 0, 0.77778],
        "9826": [0.12963, 0.69444, 0, 0, 0.77778],
        "9827": [0.12963, 0.69444, 0, 0, 0.77778],
        "9837": [0, 0.75, 0, 0, 0.38889],
        "9838": [0.19444, 0.69444, 0, 0, 0.38889],
        "9839": [0.19444, 0.69444, 0, 0, 0.38889],
        "10216": [0.25, 0.75, 0, 0, 0.38889],
        "10217": [0.25, 0.75, 0, 0, 0.38889],
        "10222": [0.244, 0.744, 0, 0, 184],
        "10223": [0.244, 0.744, 0, 0, 184],
        "10229": [0.011, 0.511, 0, 0, 1470],
        "10230": [0.011, 0.511, 0, 0, 1469],
        "10231": [0.011, 0.511, 0, 0, 1748],
        "10232": [0.024, 0.525, 0, 0, 1497],
        "10233": [0.024, 0.525, 0, 0, 1526],
        "10234": [0.024, 0.525, 0, 0, 1746],
        "10236": [0.011, 0.511, 0, 0, 1498],
        "10815": [0, 0.68333, 0, 0, 0.75],
        "10927": [0.13597, 0.63597, 0, 0, 0.77778],
        "10928": [0.13597, 0.63597, 0, 0, 0.77778]
    },
    "Math-BoldItalic": {
        "47": [0.19444, 0.69444, 0, 0, 0],
        "65": [0, 0.68611, 0, 0, 0.86944],
        "66": [0, 0.68611, 0.04835, 0, 0.8664],
        "67": [0, 0.68611, 0.06979, 0, 0.81694],
        "68": [0, 0.68611, 0.03194, 0, 0.93812],
        "69": [0, 0.68611, 0.05451, 0, 0.81007],
        "70": [0, 0.68611, 0.15972, 0, 0.68889],
        "71": [0, 0.68611, 0, 0, 0.88673],
        "72": [0, 0.68611, 0.08229, 0, 0.98229],
        "73": [0, 0.68611, 0.07778, 0, 0.51111],
        "74": [0, 0.68611, 0.10069, 0, 0.63125],
        "75": [0, 0.68611, 0.06979, 0, 0.97118],
        "76": [0, 0.68611, 0, 0, 0.75555],
        "77": [0, 0.68611, 0.11424, 0, 1.14201],
        "78": [0, 0.68611, 0.11424, 0, 0.95034],
        "79": [0, 0.68611, 0.03194, 0, 0.83666],
        "80": [0, 0.68611, 0.15972, 0, 0.72309],
        "81": [0.19444, 0.68611, 0, 0, 0.86861],
        "82": [0, 0.68611, 0.00421, 0, 0.87235],
        "83": [0, 0.68611, 0.05382, 0, 0.69271],
        "84": [0, 0.68611, 0.15972, 0, 0.63663],
        "85": [0, 0.68611, 0.11424, 0, 0.80027],
        "86": [0, 0.68611, 0.25555, 0, 0.67778],
        "87": [0, 0.68611, 0.15972, 0, 1.09305],
        "88": [0, 0.68611, 0.07778, 0, 0.94722],
        "89": [0, 0.68611, 0.25555, 0, 0.67458],
        "90": [0, 0.68611, 0.06979, 0, 0.77257],
        "97": [0, 0.44444, 0, 0, 0.63287],
        "98": [0, 0.69444, 0, 0, 0.52083],
        "99": [0, 0.44444, 0, 0, 0.51342],
        "100": [0, 0.69444, 0, 0, 0.60972],
        "101": [0, 0.44444, 0, 0, 0.55361],
        "102": [0.19444, 0.69444, 0.11042, 0, 0.56806],
        "103": [0.19444, 0.44444, 0.03704, 0, 0.5449],
        "104": [0, 0.69444, 0, 0, 0.66759],
        "105": [0, 0.69326, 0, 0, 0.4048],
        "106": [0.19444, 0.69326, 0.0622, 0, 0.47083],
        "107": [0, 0.69444, 0.01852, 0, 0.6037],
        "108": [0, 0.69444, 0.0088, 0, 0.34815],
        "109": [0, 0.44444, 0, 0, 1.0324],
        "110": [0, 0.44444, 0, 0, 0.71296],
        "111": [0, 0.44444, 0, 0, 0.58472],
        "112": [0.19444, 0.44444, 0, 0, 0.60092],
        "113": [0.19444, 0.44444, 0.03704, 0, 0.54213],
        "114": [0, 0.44444, 0.03194, 0, 0.5287],
        "115": [0, 0.44444, 0, 0, 0.53125],
        "116": [0, 0.63492, 0, 0, 0.41528],
        "117": [0, 0.44444, 0, 0, 0.68102],
        "118": [0, 0.44444, 0.03704, 0, 0.56666],
        "119": [0, 0.44444, 0.02778, 0, 0.83148],
        "120": [0, 0.44444, 0, 0, 0.65903],
        "121": [0.19444, 0.44444, 0.03704, 0, 0.59028],
        "122": [0, 0.44444, 0.04213, 0, 0.55509],
        "915": [0, 0.68611, 0.15972, 0, 0.65694],
        "916": [0, 0.68611, 0, 0, 0.95833],
        "920": [0, 0.68611, 0.03194, 0, 0.86722],
        "923": [0, 0.68611, 0, 0, 0.80555],
        "926": [0, 0.68611, 0.07458, 0, 0.84125],
        "928": [0, 0.68611, 0.08229, 0, 0.98229],
        "931": [0, 0.68611, 0.05451, 0, 0.88507],
        "933": [0, 0.68611, 0.15972, 0, 0.67083],
        "934": [0, 0.68611, 0, 0, 0.76666],
        "936": [0, 0.68611, 0.11653, 0, 0.71402],
        "937": [0, 0.68611, 0.04835, 0, 0.8789],
        "945": [0, 0.44444, 0, 0, 0.76064],
        "946": [0.19444, 0.69444, 0.03403, 0, 0.65972],
        "947": [0.19444, 0.44444, 0.06389, 0, 0.59003],
        "948": [0, 0.69444, 0.03819, 0, 0.52222],
        "949": [0, 0.44444, 0, 0, 0.52882],
        "950": [0.19444, 0.69444, 0.06215, 0, 0.50833],
        "951": [0.19444, 0.44444, 0.03704, 0, 0.6],
        "952": [0, 0.69444, 0.03194, 0, 0.5618],
        "953": [0, 0.44444, 0, 0, 0.41204],
        "954": [0, 0.44444, 0, 0, 0.66759],
        "955": [0, 0.69444, 0, 0, 0.67083],
        "956": [0.19444, 0.44444, 0, 0, 0.70787],
        "957": [0, 0.44444, 0.06898, 0, 0.57685],
        "958": [0.19444, 0.69444, 0.03021, 0, 0.50833],
        "959": [0, 0.44444, 0, 0, 0.58472],
        "960": [0, 0.44444, 0.03704, 0, 0.68241],
        "961": [0.19444, 0.44444, 0, 0, 0.6118],
        "962": [0.09722, 0.44444, 0.07917, 0, 0.42361],
        "963": [0, 0.44444, 0.03704, 0, 0.68588],
        "964": [0, 0.44444, 0.13472, 0, 0.52083],
        "965": [0, 0.44444, 0.03704, 0, 0.63055],
        "966": [0.19444, 0.44444, 0, 0, 0.74722],
        "967": [0.19444, 0.44444, 0, 0, 0.71805],
        "968": [0.19444, 0.69444, 0.03704, 0, 0.75833],
        "969": [0, 0.44444, 0.03704, 0, 0.71782],
        "977": [0, 0.69444, 0, 0, 0.69155],
        "981": [0.19444, 0.69444, 0, 0, 0.7125],
        "982": [0, 0.44444, 0.03194, 0, 0.975],
        "1009": [0.19444, 0.44444, 0, 0, 0.6118],
        "1013": [0, 0.44444, 0, 0, 0.48333]
    },
    "Math-Italic": {
        "47": [0.19444, 0.69444, 0, 0, 0],
        "65": [0, 0.68333, 0, 0.13889, 0.75],
        "66": [0, 0.68333, 0.05017, 0.08334, 0.75851],
        "67": [0, 0.68333, 0.07153, 0.08334, 0.71472],
        "68": [0, 0.68333, 0.02778, 0.05556, 0.82792],
        "69": [0, 0.68333, 0.05764, 0.08334, 0.7382],
        "70": [0, 0.68333, 0.13889, 0.08334, 0.64306],
        "71": [0, 0.68333, 0, 0.08334, 0.78625],
        "72": [0, 0.68333, 0.08125, 0.05556, 0.83125],
        "73": [0, 0.68333, 0.07847, 0.11111, 0.43958],
        "74": [0, 0.68333, 0.09618, 0.16667, 0.55451],
        "75": [0, 0.68333, 0.07153, 0.05556, 0.84931],
        "76": [0, 0.68333, 0, 0.02778, 0.68056],
        "77": [0, 0.68333, 0.10903, 0.08334, 0.97014],
        "78": [0, 0.68333, 0.10903, 0.08334, 0.80347],
        "79": [0, 0.68333, 0.02778, 0.08334, 0.76278],
        "80": [0, 0.68333, 0.13889, 0.08334, 0.64201],
        "81": [0.19444, 0.68333, 0, 0.08334, 0.79056],
        "82": [0, 0.68333, 0.00773, 0.08334, 0.75929],
        "83": [0, 0.68333, 0.05764, 0.08334, 0.6132],
        "84": [0, 0.68333, 0.13889, 0.08334, 0.58438],
        "85": [0, 0.68333, 0.10903, 0.02778, 0.68278],
        "86": [0, 0.68333, 0.22222, 0, 0.58333],
        "87": [0, 0.68333, 0.13889, 0, 0.94445],
        "88": [0, 0.68333, 0.07847, 0.08334, 0.82847],
        "89": [0, 0.68333, 0.22222, 0, 0.58056],
        "90": [0, 0.68333, 0.07153, 0.08334, 0.68264],
        "97": [0, 0.43056, 0, 0, 0.52859],
        "98": [0, 0.69444, 0, 0, 0.42917],
        "99": [0, 0.43056, 0, 0.05556, 0.43276],
        "100": [0, 0.69444, 0, 0.16667, 0.52049],
        "101": [0, 0.43056, 0, 0.05556, 0.46563],
        "102": [0.19444, 0.69444, 0.10764, 0.16667, 0.48959],
        "103": [0.19444, 0.43056, 0.03588, 0.02778, 0.47697],
        "104": [0, 0.69444, 0, 0, 0.57616],
        "105": [0, 0.65952, 0, 0, 0.34451],
        "106": [0.19444, 0.65952, 0.05724, 0, 0.41181],
        "107": [0, 0.69444, 0.03148, 0, 0.5206],
        "108": [0, 0.69444, 0.01968, 0.08334, 0.29838],
        "109": [0, 0.43056, 0, 0, 0.87801],
        "110": [0, 0.43056, 0, 0, 0.60023],
        "111": [0, 0.43056, 0, 0.05556, 0.48472],
        "112": [0.19444, 0.43056, 0, 0.08334, 0.50313],
        "113": [0.19444, 0.43056, 0.03588, 0.08334, 0.44641],
        "114": [0, 0.43056, 0.02778, 0.05556, 0.45116],
        "115": [0, 0.43056, 0, 0.05556, 0.46875],
        "116": [0, 0.61508, 0, 0.08334, 0.36111],
        "117": [0, 0.43056, 0, 0.02778, 0.57246],
        "118": [0, 0.43056, 0.03588, 0.02778, 0.48472],
        "119": [0, 0.43056, 0.02691, 0.08334, 0.71592],
        "120": [0, 0.43056, 0, 0.02778, 0.57153],
        "121": [0.19444, 0.43056, 0.03588, 0.05556, 0.49028],
        "122": [0, 0.43056, 0.04398, 0.05556, 0.46505],
        "915": [0, 0.68333, 0.13889, 0.08334, 0.61528],
        "916": [0, 0.68333, 0, 0.16667, 0.83334],
        "920": [0, 0.68333, 0.02778, 0.08334, 0.76278],
        "923": [0, 0.68333, 0, 0.16667, 0.69445],
        "926": [0, 0.68333, 0.07569, 0.08334, 0.74236],
        "928": [0, 0.68333, 0.08125, 0.05556, 0.83125],
        "931": [0, 0.68333, 0.05764, 0.08334, 0.77986],
        "933": [0, 0.68333, 0.13889, 0.05556, 0.58333],
        "934": [0, 0.68333, 0, 0.08334, 0.66667],
        "936": [0, 0.68333, 0.11, 0.05556, 0.61222],
        "937": [0, 0.68333, 0.05017, 0.08334, 0.7724],
        "945": [0, 0.43056, 0.0037, 0.02778, 0.6397],
        "946": [0.19444, 0.69444, 0.05278, 0.08334, 0.56563],
        "947": [0.19444, 0.43056, 0.05556, 0, 0.51773],
        "948": [0, 0.69444, 0.03785, 0.05556, 0.44444],
        "949": [0, 0.43056, 0, 0.08334, 0.46632],
        "950": [0.19444, 0.69444, 0.07378, 0.08334, 0.4375],
        "951": [0.19444, 0.43056, 0.03588, 0.05556, 0.49653],
        "952": [0, 0.69444, 0.02778, 0.08334, 0.46944],
        "953": [0, 0.43056, 0, 0.05556, 0.35394],
        "954": [0, 0.43056, 0, 0, 0.57616],
        "955": [0, 0.69444, 0, 0, 0.58334],
        "956": [0.19444, 0.43056, 0, 0.02778, 0.60255],
        "957": [0, 0.43056, 0.06366, 0.02778, 0.49398],
        "958": [0.19444, 0.69444, 0.04601, 0.11111, 0.4375],
        "959": [0, 0.43056, 0, 0.05556, 0.48472],
        "960": [0, 0.43056, 0.03588, 0, 0.57003],
        "961": [0.19444, 0.43056, 0, 0.08334, 0.51702],
        "962": [0.09722, 0.43056, 0.07986, 0.08334, 0.36285],
        "963": [0, 0.43056, 0.03588, 0, 0.57141],
        "964": [0, 0.43056, 0.1132, 0.02778, 0.43715],
        "965": [0, 0.43056, 0.03588, 0.02778, 0.54028],
        "966": [0.19444, 0.43056, 0, 0.08334, 0.65417],
        "967": [0.19444, 0.43056, 0, 0.05556, 0.62569],
        "968": [0.19444, 0.69444, 0.03588, 0.11111, 0.65139],
        "969": [0, 0.43056, 0.03588, 0, 0.62245],
        "977": [0, 0.69444, 0, 0.08334, 0.59144],
        "981": [0.19444, 0.69444, 0, 0.08334, 0.59583],
        "982": [0, 0.43056, 0.02778, 0, 0.82813],
        "1009": [0.19444, 0.43056, 0, 0.08334, 0.51702],
        "1013": [0, 0.43056, 0, 0.05556, 0.4059]
    },
    "Math-Regular": {
        "65": [0, 0.68333, 0, 0.13889, 0.75],
        "66": [0, 0.68333, 0.05017, 0.08334, 0.75851],
        "67": [0, 0.68333, 0.07153, 0.08334, 0.71472],
        "68": [0, 0.68333, 0.02778, 0.05556, 0.82792],
        "69": [0, 0.68333, 0.05764, 0.08334, 0.7382],
        "70": [0, 0.68333, 0.13889, 0.08334, 0.64306],
        "71": [0, 0.68333, 0, 0.08334, 0.78625],
        "72": [0, 0.68333, 0.08125, 0.05556, 0.83125],
        "73": [0, 0.68333, 0.07847, 0.11111, 0.43958],
        "74": [0, 0.68333, 0.09618, 0.16667, 0.55451],
        "75": [0, 0.68333, 0.07153, 0.05556, 0.84931],
        "76": [0, 0.68333, 0, 0.02778, 0.68056],
        "77": [0, 0.68333, 0.10903, 0.08334, 0.97014],
        "78": [0, 0.68333, 0.10903, 0.08334, 0.80347],
        "79": [0, 0.68333, 0.02778, 0.08334, 0.76278],
        "80": [0, 0.68333, 0.13889, 0.08334, 0.64201],
        "81": [0.19444, 0.68333, 0, 0.08334, 0.79056],
        "82": [0, 0.68333, 0.00773, 0.08334, 0.75929],
        "83": [0, 0.68333, 0.05764, 0.08334, 0.6132],
        "84": [0, 0.68333, 0.13889, 0.08334, 0.58438],
        "85": [0, 0.68333, 0.10903, 0.02778, 0.68278],
        "86": [0, 0.68333, 0.22222, 0, 0.58333],
        "87": [0, 0.68333, 0.13889, 0, 0.94445],
        "88": [0, 0.68333, 0.07847, 0.08334, 0.82847],
        "89": [0, 0.68333, 0.22222, 0, 0.58056],
        "90": [0, 0.68333, 0.07153, 0.08334, 0.68264],
        "97": [0, 0.43056, 0, 0, 0.52859],
        "98": [0, 0.69444, 0, 0, 0.42917],
        "99": [0, 0.43056, 0, 0.05556, 0.43276],
        "100": [0, 0.69444, 0, 0.16667, 0.52049],
        "101": [0, 0.43056, 0, 0.05556, 0.46563],
        "102": [0.19444, 0.69444, 0.10764, 0.16667, 0.48959],
        "103": [0.19444, 0.43056, 0.03588, 0.02778, 0.47697],
        "104": [0, 0.69444, 0, 0, 0.57616],
        "105": [0, 0.65952, 0, 0, 0.34451],
        "106": [0.19444, 0.65952, 0.05724, 0, 0.41181],
        "107": [0, 0.69444, 0.03148, 0, 0.5206],
        "108": [0, 0.69444, 0.01968, 0.08334, 0.29838],
        "109": [0, 0.43056, 0, 0, 0.87801],
        "110": [0, 0.43056, 0, 0, 0.60023],
        "111": [0, 0.43056, 0, 0.05556, 0.48472],
        "112": [0.19444, 0.43056, 0, 0.08334, 0.50313],
        "113": [0.19444, 0.43056, 0.03588, 0.08334, 0.44641],
        "114": [0, 0.43056, 0.02778, 0.05556, 0.45116],
        "115": [0, 0.43056, 0, 0.05556, 0.46875],
        "116": [0, 0.61508, 0, 0.08334, 0.36111],
        "117": [0, 0.43056, 0, 0.02778, 0.57246],
        "118": [0, 0.43056, 0.03588, 0.02778, 0.48472],
        "119": [0, 0.43056, 0.02691, 0.08334, 0.71592],
        "120": [0, 0.43056, 0, 0.02778, 0.57153],
        "121": [0.19444, 0.43056, 0.03588, 0.05556, 0.49028],
        "122": [0, 0.43056, 0.04398, 0.05556, 0.46505],
        "915": [0, 0.68333, 0.13889, 0.08334, 0.61528],
        "916": [0, 0.68333, 0, 0.16667, 0.83334],
        "920": [0, 0.68333, 0.02778, 0.08334, 0.76278],
        "923": [0, 0.68333, 0, 0.16667, 0.69445],
        "926": [0, 0.68333, 0.07569, 0.08334, 0.74236],
        "928": [0, 0.68333, 0.08125, 0.05556, 0.83125],
        "931": [0, 0.68333, 0.05764, 0.08334, 0.77986],
        "933": [0, 0.68333, 0.13889, 0.05556, 0.58333],
        "934": [0, 0.68333, 0, 0.08334, 0.66667],
        "936": [0, 0.68333, 0.11, 0.05556, 0.61222],
        "937": [0, 0.68333, 0.05017, 0.08334, 0.7724],
        "945": [0, 0.43056, 0.0037, 0.02778, 0.6397],
        "946": [0.19444, 0.69444, 0.05278, 0.08334, 0.56563],
        "947": [0.19444, 0.43056, 0.05556, 0, 0.51773],
        "948": [0, 0.69444, 0.03785, 0.05556, 0.44444],
        "949": [0, 0.43056, 0, 0.08334, 0.46632],
        "950": [0.19444, 0.69444, 0.07378, 0.08334, 0.4375],
        "951": [0.19444, 0.43056, 0.03588, 0.05556, 0.49653],
        "952": [0, 0.69444, 0.02778, 0.08334, 0.46944],
        "953": [0, 0.43056, 0, 0.05556, 0.35394],
        "954": [0, 0.43056, 0, 0, 0.57616],
        "955": [0, 0.69444, 0, 0, 0.58334],
        "956": [0.19444, 0.43056, 0, 0.02778, 0.60255],
        "957": [0, 0.43056, 0.06366, 0.02778, 0.49398],
        "958": [0.19444, 0.69444, 0.04601, 0.11111, 0.4375],
        "959": [0, 0.43056, 0, 0.05556, 0.48472],
        "960": [0, 0.43056, 0.03588, 0, 0.57003],
        "961": [0.19444, 0.43056, 0, 0.08334, 0.51702],
        "962": [0.09722, 0.43056, 0.07986, 0.08334, 0.36285],
        "963": [0, 0.43056, 0.03588, 0, 0.57141],
        "964": [0, 0.43056, 0.1132, 0.02778, 0.43715],
        "965": [0, 0.43056, 0.03588, 0.02778, 0.54028],
        "966": [0.19444, 0.43056, 0, 0.08334, 0.65417],
        "967": [0.19444, 0.43056, 0, 0.05556, 0.62569],
        "968": [0.19444, 0.69444, 0.03588, 0.11111, 0.65139],
        "969": [0, 0.43056, 0.03588, 0, 0.62245],
        "977": [0, 0.69444, 0, 0.08334, 0.59144],
        "981": [0.19444, 0.69444, 0, 0.08334, 0.59583],
        "982": [0, 0.43056, 0.02778, 0, 0.82813],
        "1009": [0.19444, 0.43056, 0, 0.08334, 0.51702],
        "1013": [0, 0.43056, 0, 0.05556, 0.4059]
    },
    "SansSerif-Bold": {
        "33": [0, 0.69444, 0, 0, 0.36667],
        "34": [0, 0.69444, 0, 0, 0.55834],
        "35": [0.19444, 0.69444, 0, 0, 0.91667],
        "36": [0.05556, 0.75, 0, 0, 0.55],
        "37": [0.05556, 0.75, 0, 0, 1.02912],
        "38": [0, 0.69444, 0, 0, 0.83056],
        "39": [0, 0.69444, 0, 0, 0.30556],
        "40": [0.25, 0.75, 0, 0, 0.42778],
        "41": [0.25, 0.75, 0, 0, 0.42778],
        "42": [0, 0.75, 0, 0, 0.55],
        "43": [0.11667, 0.61667, 0, 0, 0.85556],
        "44": [0.10556, 0.13056, 0, 0, 0.30556],
        "45": [0, 0.45833, 0, 0, 0.36667],
        "46": [0, 0.13056, 0, 0, 0.30556],
        "47": [0.25, 0.75, 0, 0, 0.55],
        "48": [0, 0.69444, 0, 0, 0.55],
        "49": [0, 0.69444, 0, 0, 0.55],
        "50": [0, 0.69444, 0, 0, 0.55],
        "51": [0, 0.69444, 0, 0, 0.55],
        "52": [0, 0.69444, 0, 0, 0.55],
        "53": [0, 0.69444, 0, 0, 0.55],
        "54": [0, 0.69444, 0, 0, 0.55],
        "55": [0, 0.69444, 0, 0, 0.55],
        "56": [0, 0.69444, 0, 0, 0.55],
        "57": [0, 0.69444, 0, 0, 0.55],
        "58": [0, 0.45833, 0, 0, 0.30556],
        "59": [0.10556, 0.45833, 0, 0, 0.30556],
        "61": [-0.09375, 0.40625, 0, 0, 0.85556],
        "63": [0, 0.69444, 0, 0, 0.51945],
        "64": [0, 0.69444, 0, 0, 0.73334],
        "65": [0, 0.69444, 0, 0, 0.73334],
        "66": [0, 0.69444, 0, 0, 0.73334],
        "67": [0, 0.69444, 0, 0, 0.70278],
        "68": [0, 0.69444, 0, 0, 0.79445],
        "69": [0, 0.69444, 0, 0, 0.64167],
        "70": [0, 0.69444, 0, 0, 0.61111],
        "71": [0, 0.69444, 0, 0, 0.73334],
        "72": [0, 0.69444, 0, 0, 0.79445],
        "73": [0, 0.69444, 0, 0, 0.33056],
        "74": [0, 0.69444, 0, 0, 0.51945],
        "75": [0, 0.69444, 0, 0, 0.76389],
        "76": [0, 0.69444, 0, 0, 0.58056],
        "77": [0, 0.69444, 0, 0, 0.97778],
        "78": [0, 0.69444, 0, 0, 0.79445],
        "79": [0, 0.69444, 0, 0, 0.79445],
        "80": [0, 0.69444, 0, 0, 0.70278],
        "81": [0.10556, 0.69444, 0, 0, 0.79445],
        "82": [0, 0.69444, 0, 0, 0.70278],
        "83": [0, 0.69444, 0, 0, 0.61111],
        "84": [0, 0.69444, 0, 0, 0.73334],
        "85": [0, 0.69444, 0, 0, 0.76389],
        "86": [0, 0.69444, 0.01528, 0, 0.73334],
        "87": [0, 0.69444, 0.01528, 0, 1.03889],
        "88": [0, 0.69444, 0, 0, 0.73334],
        "89": [0, 0.69444, 0.0275, 0, 0.73334],
        "90": [0, 0.69444, 0, 0, 0.67223],
        "91": [0.25, 0.75, 0, 0, 0.34306],
        "93": [0.25, 0.75, 0, 0, 0.34306],
        "94": [0, 0.69444, 0, 0, 0.55],
        "95": [0.35, 0.10833, 0.03056, 0, 0.55],
        "97": [0, 0.45833, 0, 0, 0.525],
        "98": [0, 0.69444, 0, 0, 0.56111],
        "99": [0, 0.45833, 0, 0, 0.48889],
        "100": [0, 0.69444, 0, 0, 0.56111],
        "101": [0, 0.45833, 0, 0, 0.51111],
        "102": [0, 0.69444, 0.07639, 0, 0.33611],
        "103": [0.19444, 0.45833, 0.01528, 0, 0.55],
        "104": [0, 0.69444, 0, 0, 0.56111],
        "105": [0, 0.69444, 0, 0, 0.25556],
        "106": [0.19444, 0.69444, 0, 0, 0.28611],
        "107": [0, 0.69444, 0, 0, 0.53056],
        "108": [0, 0.69444, 0, 0, 0.25556],
        "109": [0, 0.45833, 0, 0, 0.86667],
        "110": [0, 0.45833, 0, 0, 0.56111],
        "111": [0, 0.45833, 0, 0, 0.55],
        "112": [0.19444, 0.45833, 0, 0, 0.56111],
        "113": [0.19444, 0.45833, 0, 0, 0.56111],
        "114": [0, 0.45833, 0.01528, 0, 0.37222],
        "115": [0, 0.45833, 0, 0, 0.42167],
        "116": [0, 0.58929, 0, 0, 0.40417],
        "117": [0, 0.45833, 0, 0, 0.56111],
        "118": [0, 0.45833, 0.01528, 0, 0.5],
        "119": [0, 0.45833, 0.01528, 0, 0.74445],
        "120": [0, 0.45833, 0, 0, 0.5],
        "121": [0.19444, 0.45833, 0.01528, 0, 0.5],
        "122": [0, 0.45833, 0, 0, 0.47639],
        "126": [0.35, 0.34444, 0, 0, 0.55],
        "305": [0, 0.45833, 0, 0, 0.25556],
        "567": [0.19444, 0.45833, 0, 0, 0.28611],
        "768": [0, 0.69444, 0, 0, 0.55],
        "769": [0, 0.69444, 0, 0, 0.55],
        "770": [0, 0.69444, 0, 0, 0.55],
        "771": [0, 0.69444, 0, 0, 0.55],
        "772": [0, 0.63778, 0, 0, 0.55],
        "774": [0, 0.69444, 0, 0, 0.55],
        "775": [0, 0.69444, 0, 0, 0.30556],
        "776": [0, 0.69444, 0, 0, 0.55],
        "778": [0, 0.69444, 0, 0, 0.73334],
        "779": [0, 0.69444, 0, 0, 0.55],
        "780": [0, 0.63542, 0, 0, 0.55],
        "915": [0, 0.69444, 0, 0, 0.58056],
        "916": [0, 0.69444, 0, 0, 0.91667],
        "920": [0, 0.69444, 0, 0, 0.85556],
        "923": [0, 0.69444, 0, 0, 0.67223],
        "926": [0, 0.69444, 0, 0, 0.73334],
        "928": [0, 0.69444, 0, 0, 0.79445],
        "931": [0, 0.69444, 0, 0, 0.79445],
        "933": [0, 0.69444, 0, 0, 0.85556],
        "934": [0, 0.69444, 0, 0, 0.79445],
        "936": [0, 0.69444, 0, 0, 0.85556],
        "937": [0, 0.69444, 0, 0, 0.79445],
        "8211": [0, 0.45833, 0.03056, 0, 0.55],
        "8212": [0, 0.45833, 0.03056, 0, 1.10001],
        "8216": [0, 0.69444, 0, 0, 0.30556],
        "8217": [0, 0.69444, 0, 0, 0.30556],
        "8220": [0, 0.69444, 0, 0, 0.55834],
        "8221": [0, 0.69444, 0, 0, 0.55834]
    },
    "SansSerif-Italic": {
        "33": [0, 0.69444, 0.05733, 0, 0.31945],
        "34": [0, 0.69444, 0.00316, 0, 0.5],
        "35": [0.19444, 0.69444, 0.05087, 0, 0.83334],
        "36": [0.05556, 0.75, 0.11156, 0, 0.5],
        "37": [0.05556, 0.75, 0.03126, 0, 0.83334],
        "38": [0, 0.69444, 0.03058, 0, 0.75834],
        "39": [0, 0.69444, 0.07816, 0, 0.27778],
        "40": [0.25, 0.75, 0.13164, 0, 0.38889],
        "41": [0.25, 0.75, 0.02536, 0, 0.38889],
        "42": [0, 0.75, 0.11775, 0, 0.5],
        "43": [0.08333, 0.58333, 0.02536, 0, 0.77778],
        "44": [0.125, 0.08333, 0, 0, 0.27778],
        "45": [0, 0.44444, 0.01946, 0, 0.33333],
        "46": [0, 0.08333, 0, 0, 0.27778],
        "47": [0.25, 0.75, 0.13164, 0, 0.5],
        "48": [0, 0.65556, 0.11156, 0, 0.5],
        "49": [0, 0.65556, 0.11156, 0, 0.5],
        "50": [0, 0.65556, 0.11156, 0, 0.5],
        "51": [0, 0.65556, 0.11156, 0, 0.5],
        "52": [0, 0.65556, 0.11156, 0, 0.5],
        "53": [0, 0.65556, 0.11156, 0, 0.5],
        "54": [0, 0.65556, 0.11156, 0, 0.5],
        "55": [0, 0.65556, 0.11156, 0, 0.5],
        "56": [0, 0.65556, 0.11156, 0, 0.5],
        "57": [0, 0.65556, 0.11156, 0, 0.5],
        "58": [0, 0.44444, 0.02502, 0, 0.27778],
        "59": [0.125, 0.44444, 0.02502, 0, 0.27778],
        "61": [-0.13, 0.37, 0.05087, 0, 0.77778],
        "63": [0, 0.69444, 0.11809, 0, 0.47222],
        "64": [0, 0.69444, 0.07555, 0, 0.66667],
        "65": [0, 0.69444, 0, 0, 0.66667],
        "66": [0, 0.69444, 0.08293, 0, 0.66667],
        "67": [0, 0.69444, 0.11983, 0, 0.63889],
        "68": [0, 0.69444, 0.07555, 0, 0.72223],
        "69": [0, 0.69444, 0.11983, 0, 0.59722],
        "70": [0, 0.69444, 0.13372, 0, 0.56945],
        "71": [0, 0.69444, 0.11983, 0, 0.66667],
        "72": [0, 0.69444, 0.08094, 0, 0.70834],
        "73": [0, 0.69444, 0.13372, 0, 0.27778],
        "74": [0, 0.69444, 0.08094, 0, 0.47222],
        "75": [0, 0.69444, 0.11983, 0, 0.69445],
        "76": [0, 0.69444, 0, 0, 0.54167],
        "77": [0, 0.69444, 0.08094, 0, 0.875],
        "78": [0, 0.69444, 0.08094, 0, 0.70834],
        "79": [0, 0.69444, 0.07555, 0, 0.73611],
        "80": [0, 0.69444, 0.08293, 0, 0.63889],
        "81": [0.125, 0.69444, 0.07555, 0, 0.73611],
        "82": [0, 0.69444, 0.08293, 0, 0.64584],
        "83": [0, 0.69444, 0.09205, 0, 0.55556],
        "84": [0, 0.69444, 0.13372, 0, 0.68056],
        "85": [0, 0.69444, 0.08094, 0, 0.6875],
        "86": [0, 0.69444, 0.1615, 0, 0.66667],
        "87": [0, 0.69444, 0.1615, 0, 0.94445],
        "88": [0, 0.69444, 0.13372, 0, 0.66667],
        "89": [0, 0.69444, 0.17261, 0, 0.66667],
        "90": [0, 0.69444, 0.11983, 0, 0.61111],
        "91": [0.25, 0.75, 0.15942, 0, 0.28889],
        "93": [0.25, 0.75, 0.08719, 0, 0.28889],
        "94": [0, 0.69444, 0.0799, 0, 0.5],
        "95": [0.35, 0.09444, 0.08616, 0, 0.5],
        "97": [0, 0.44444, 0.00981, 0, 0.48056],
        "98": [0, 0.69444, 0.03057, 0, 0.51667],
        "99": [0, 0.44444, 0.08336, 0, 0.44445],
        "100": [0, 0.69444, 0.09483, 0, 0.51667],
        "101": [0, 0.44444, 0.06778, 0, 0.44445],
        "102": [0, 0.69444, 0.21705, 0, 0.30556],
        "103": [0.19444, 0.44444, 0.10836, 0, 0.5],
        "104": [0, 0.69444, 0.01778, 0, 0.51667],
        "105": [0, 0.67937, 0.09718, 0, 0.23889],
        "106": [0.19444, 0.67937, 0.09162, 0, 0.26667],
        "107": [0, 0.69444, 0.08336, 0, 0.48889],
        "108": [0, 0.69444, 0.09483, 0, 0.23889],
        "109": [0, 0.44444, 0.01778, 0, 0.79445],
        "110": [0, 0.44444, 0.01778, 0, 0.51667],
        "111": [0, 0.44444, 0.06613, 0, 0.5],
        "112": [0.19444, 0.44444, 0.0389, 0, 0.51667],
        "113": [0.19444, 0.44444, 0.04169, 0, 0.51667],
        "114": [0, 0.44444, 0.10836, 0, 0.34167],
        "115": [0, 0.44444, 0.0778, 0, 0.38333],
        "116": [0, 0.57143, 0.07225, 0, 0.36111],
        "117": [0, 0.44444, 0.04169, 0, 0.51667],
        "118": [0, 0.44444, 0.10836, 0, 0.46111],
        "119": [0, 0.44444, 0.10836, 0, 0.68334],
        "120": [0, 0.44444, 0.09169, 0, 0.46111],
        "121": [0.19444, 0.44444, 0.10836, 0, 0.46111],
        "122": [0, 0.44444, 0.08752, 0, 0.43472],
        "126": [0.35, 0.32659, 0.08826, 0, 0.5],
        "305": [0, 0.44444, 0.04169, 0, 0.23889],
        "567": [0.19444, 0.44444, 0.04169, 0, 0.26667],
        "768": [0, 0.69444, 0, 0, 0.5],
        "769": [0, 0.69444, 0.09205, 0, 0.5],
        "770": [0, 0.69444, 0.0799, 0, 0.5],
        "771": [0, 0.67659, 0.08826, 0, 0.5],
        "772": [0, 0.60889, 0.08776, 0, 0.5],
        "774": [0, 0.69444, 0.09483, 0, 0.5],
        "775": [0, 0.67937, 0.07774, 0, 0.27778],
        "776": [0, 0.67937, 0.06385, 0, 0.5],
        "778": [0, 0.69444, 0, 0, 0.73752],
        "779": [0, 0.69444, 0.09205, 0, 0.5],
        "780": [0, 0.63194, 0.08432, 0, 0.5],
        "915": [0, 0.69444, 0.13372, 0, 0.54167],
        "916": [0, 0.69444, 0, 0, 0.83334],
        "920": [0, 0.69444, 0.07555, 0, 0.77778],
        "923": [0, 0.69444, 0, 0, 0.61111],
        "926": [0, 0.69444, 0.12816, 0, 0.66667],
        "928": [0, 0.69444, 0.08094, 0, 0.70834],
        "931": [0, 0.69444, 0.11983, 0, 0.72222],
        "933": [0, 0.69444, 0.09031, 0, 0.77778],
        "934": [0, 0.69444, 0.04603, 0, 0.72222],
        "936": [0, 0.69444, 0.09031, 0, 0.77778],
        "937": [0, 0.69444, 0.08293, 0, 0.72222],
        "8211": [0, 0.44444, 0.08616, 0, 0.5],
        "8212": [0, 0.44444, 0.08616, 0, 1.0],
        "8216": [0, 0.69444, 0.07816, 0, 0.27778],
        "8217": [0, 0.69444, 0.07816, 0, 0.27778],
        "8220": [0, 0.69444, 0.14205, 0, 0.5],
        "8221": [0, 0.69444, 0.00316, 0, 0.5]
    },
    "SansSerif-Regular": {
        "33": [0, 0.69444, 0, 0, 0.31945],
        "34": [0, 0.69444, 0, 0, 0.5],
        "35": [0.19444, 0.69444, 0, 0, 0.83334],
        "36": [0.05556, 0.75, 0, 0, 0.5],
        "37": [0.05556, 0.75, 0, 0, 0.83334],
        "38": [0, 0.69444, 0, 0, 0.75834],
        "39": [0, 0.69444, 0, 0, 0.27778],
        "40": [0.25, 0.75, 0, 0, 0.38889],
        "41": [0.25, 0.75, 0, 0, 0.38889],
        "42": [0, 0.75, 0, 0, 0.5],
        "43": [0.08333, 0.58333, 0, 0, 0.77778],
        "44": [0.125, 0.08333, 0, 0, 0.27778],
        "45": [0, 0.44444, 0, 0, 0.33333],
        "46": [0, 0.08333, 0, 0, 0.27778],
        "47": [0.25, 0.75, 0, 0, 0.5],
        "48": [0, 0.65556, 0, 0, 0.5],
        "49": [0, 0.65556, 0, 0, 0.5],
        "50": [0, 0.65556, 0, 0, 0.5],
        "51": [0, 0.65556, 0, 0, 0.5],
        "52": [0, 0.65556, 0, 0, 0.5],
        "53": [0, 0.65556, 0, 0, 0.5],
        "54": [0, 0.65556, 0, 0, 0.5],
        "55": [0, 0.65556, 0, 0, 0.5],
        "56": [0, 0.65556, 0, 0, 0.5],
        "57": [0, 0.65556, 0, 0, 0.5],
        "58": [0, 0.44444, 0, 0, 0.27778],
        "59": [0.125, 0.44444, 0, 0, 0.27778],
        "61": [-0.13, 0.37, 0, 0, 0.77778],
        "63": [0, 0.69444, 0, 0, 0.47222],
        "64": [0, 0.69444, 0, 0, 0.66667],
        "65": [0, 0.69444, 0, 0, 0.66667],
        "66": [0, 0.69444, 0, 0, 0.66667],
        "67": [0, 0.69444, 0, 0, 0.63889],
        "68": [0, 0.69444, 0, 0, 0.72223],
        "69": [0, 0.69444, 0, 0, 0.59722],
        "70": [0, 0.69444, 0, 0, 0.56945],
        "71": [0, 0.69444, 0, 0, 0.66667],
        "72": [0, 0.69444, 0, 0, 0.70834],
        "73": [0, 0.69444, 0, 0, 0.27778],
        "74": [0, 0.69444, 0, 0, 0.47222],
        "75": [0, 0.69444, 0, 0, 0.69445],
        "76": [0, 0.69444, 0, 0, 0.54167],
        "77": [0, 0.69444, 0, 0, 0.875],
        "78": [0, 0.69444, 0, 0, 0.70834],
        "79": [0, 0.69444, 0, 0, 0.73611],
        "80": [0, 0.69444, 0, 0, 0.63889],
        "81": [0.125, 0.69444, 0, 0, 0.73611],
        "82": [0, 0.69444, 0, 0, 0.64584],
        "83": [0, 0.69444, 0, 0, 0.55556],
        "84": [0, 0.69444, 0, 0, 0.68056],
        "85": [0, 0.69444, 0, 0, 0.6875],
        "86": [0, 0.69444, 0.01389, 0, 0.66667],
        "87": [0, 0.69444, 0.01389, 0, 0.94445],
        "88": [0, 0.69444, 0, 0, 0.66667],
        "89": [0, 0.69444, 0.025, 0, 0.66667],
        "90": [0, 0.69444, 0, 0, 0.61111],
        "91": [0.25, 0.75, 0, 0, 0.28889],
        "93": [0.25, 0.75, 0, 0, 0.28889],
        "94": [0, 0.69444, 0, 0, 0.5],
        "95": [0.35, 0.09444, 0.02778, 0, 0.5],
        "97": [0, 0.44444, 0, 0, 0.48056],
        "98": [0, 0.69444, 0, 0, 0.51667],
        "99": [0, 0.44444, 0, 0, 0.44445],
        "100": [0, 0.69444, 0, 0, 0.51667],
        "101": [0, 0.44444, 0, 0, 0.44445],
        "102": [0, 0.69444, 0.06944, 0, 0.30556],
        "103": [0.19444, 0.44444, 0.01389, 0, 0.5],
        "104": [0, 0.69444, 0, 0, 0.51667],
        "105": [0, 0.67937, 0, 0, 0.23889],
        "106": [0.19444, 0.67937, 0, 0, 0.26667],
        "107": [0, 0.69444, 0, 0, 0.48889],
        "108": [0, 0.69444, 0, 0, 0.23889],
        "109": [0, 0.44444, 0, 0, 0.79445],
        "110": [0, 0.44444, 0, 0, 0.51667],
        "111": [0, 0.44444, 0, 0, 0.5],
        "112": [0.19444, 0.44444, 0, 0, 0.51667],
        "113": [0.19444, 0.44444, 0, 0, 0.51667],
        "114": [0, 0.44444, 0.01389, 0, 0.34167],
        "115": [0, 0.44444, 0, 0, 0.38333],
        "116": [0, 0.57143, 0, 0, 0.36111],
        "117": [0, 0.44444, 0, 0, 0.51667],
        "118": [0, 0.44444, 0.01389, 0, 0.46111],
        "119": [0, 0.44444, 0.01389, 0, 0.68334],
        "120": [0, 0.44444, 0, 0, 0.46111],
        "121": [0.19444, 0.44444, 0.01389, 0, 0.46111],
        "122": [0, 0.44444, 0, 0, 0.43472],
        "126": [0.35, 0.32659, 0, 0, 0.5],
        "305": [0, 0.44444, 0, 0, 0.23889],
        "567": [0.19444, 0.44444, 0, 0, 0.26667],
        "768": [0, 0.69444, 0, 0, 0.5],
        "769": [0, 0.69444, 0, 0, 0.5],
        "770": [0, 0.69444, 0, 0, 0.5],
        "771": [0, 0.67659, 0, 0, 0.5],
        "772": [0, 0.60889, 0, 0, 0.5],
        "774": [0, 0.69444, 0, 0, 0.5],
        "775": [0, 0.67937, 0, 0, 0.27778],
        "776": [0, 0.67937, 0, 0, 0.5],
        "778": [0, 0.69444, 0, 0, 0.66667],
        "779": [0, 0.69444, 0, 0, 0.5],
        "780": [0, 0.63194, 0, 0, 0.5],
        "915": [0, 0.69444, 0, 0, 0.54167],
        "916": [0, 0.69444, 0, 0, 0.83334],
        "920": [0, 0.69444, 0, 0, 0.77778],
        "923": [0, 0.69444, 0, 0, 0.61111],
        "926": [0, 0.69444, 0, 0, 0.66667],
        "928": [0, 0.69444, 0, 0, 0.70834],
        "931": [0, 0.69444, 0, 0, 0.72222],
        "933": [0, 0.69444, 0, 0, 0.77778],
        "934": [0, 0.69444, 0, 0, 0.72222],
        "936": [0, 0.69444, 0, 0, 0.77778],
        "937": [0, 0.69444, 0, 0, 0.72222],
        "8211": [0, 0.44444, 0.02778, 0, 0.5],
        "8212": [0, 0.44444, 0.02778, 0, 1.0],
        "8216": [0, 0.69444, 0, 0, 0.27778],
        "8217": [0, 0.69444, 0, 0, 0.27778],
        "8220": [0, 0.69444, 0, 0, 0.5],
        "8221": [0, 0.69444, 0, 0, 0.5]
    },
    "Script-Regular": {
        "65": [0, 0.7, 0.22925, 0, 0.80253],
        "66": [0, 0.7, 0.04087, 0, 0.90757],
        "67": [0, 0.7, 0.1689, 0, 0.66619],
        "68": [0, 0.7, 0.09371, 0, 0.77443],
        "69": [0, 0.7, 0.18583, 0, 0.56162],
        "70": [0, 0.7, 0.13634, 0, 0.89544],
        "71": [0, 0.7, 0.17322, 0, 0.60961],
        "72": [0, 0.7, 0.29694, 0, 0.96919],
        "73": [0, 0.7, 0.19189, 0, 0.80907],
        "74": [0.27778, 0.7, 0.19189, 0, 1.05159],
        "75": [0, 0.7, 0.31259, 0, 0.91364],
        "76": [0, 0.7, 0.19189, 0, 0.87373],
        "77": [0, 0.7, 0.15981, 0, 1.08031],
        "78": [0, 0.7, 0.3525, 0, 0.9015],
        "79": [0, 0.7, 0.08078, 0, 0.73787],
        "80": [0, 0.7, 0.08078, 0, 1.01262],
        "81": [0, 0.7, 0.03305, 0, 0.88282],
        "82": [0, 0.7, 0.06259, 0, 0.85],
        "83": [0, 0.7, 0.19189, 0, 0.86767],
        "84": [0, 0.7, 0.29087, 0, 0.74697],
        "85": [0, 0.7, 0.25815, 0, 0.79996],
        "86": [0, 0.7, 0.27523, 0, 0.62204],
        "87": [0, 0.7, 0.27523, 0, 0.80532],
        "88": [0, 0.7, 0.26006, 0, 0.94445],
        "89": [0, 0.7, 0.2939, 0, 0.70961],
        "90": [0, 0.7, 0.24037, 0, 0.8212]
    },
    "Size1-Regular": {
        "40": [0.35001, 0.85, 0, 0, 0.45834],
        "41": [0.35001, 0.85, 0, 0, 0.45834],
        "47": [0.35001, 0.85, 0, 0, 0.57778],
        "91": [0.35001, 0.85, 0, 0, 0.41667],
        "92": [0.35001, 0.85, 0, 0, 0.57778],
        "93": [0.35001, 0.85, 0, 0, 0.41667],
        "123": [0.35001, 0.85, 0, 0, 0.58334],
        "125": [0.35001, 0.85, 0, 0, 0.58334],
        "710": [0, 0.72222, 0, 0, 0.55556],
        "732": [0, 0.72222, 0, 0, 0.55556],
        "770": [0, 0.72222, 0, 0, 0.55556],
        "771": [0, 0.72222, 0, 0, 0.55556],
        "8214": [-0.00099, 0.601, 0, 0, 0.77778],
        "8593": [1e-05, 0.6, 0, 0, 0.66667],
        "8595": [1e-05, 0.6, 0, 0, 0.66667],
        "8657": [1e-05, 0.6, 0, 0, 0.77778],
        "8659": [1e-05, 0.6, 0, 0, 0.77778],
        "8719": [0.25001, 0.75, 0, 0, 0.94445],
        "8720": [0.25001, 0.75, 0, 0, 0.94445],
        "8721": [0.25001, 0.75, 0, 0, 1.05556],
        "8730": [0.35001, 0.85, 0, 0, 1.0],
        "8739": [-0.00599, 0.606, 0, 0, 0.33333],
        "8741": [-0.00599, 0.606, 0, 0, 0.55556],
        "8747": [0.30612, 0.805, 0.19445, 0, 0.47222],
        "8748": [0.306, 0.805, 0.19445, 0, 0.47222],
        "8749": [0.306, 0.805, 0.19445, 0, 0.47222],
        "8750": [0.30612, 0.805, 0.19445, 0, 0.47222],
        "8896": [0.25001, 0.75, 0, 0, 0.83334],
        "8897": [0.25001, 0.75, 0, 0, 0.83334],
        "8898": [0.25001, 0.75, 0, 0, 0.83334],
        "8899": [0.25001, 0.75, 0, 0, 0.83334],
        "8968": [0.35001, 0.85, 0, 0, 0.47222],
        "8969": [0.35001, 0.85, 0, 0, 0.47222],
        "8970": [0.35001, 0.85, 0, 0, 0.47222],
        "8971": [0.35001, 0.85, 0, 0, 0.47222],
        "9168": [-0.00099, 0.601, 0, 0, 0.66667],
        "10216": [0.35001, 0.85, 0, 0, 0.47222],
        "10217": [0.35001, 0.85, 0, 0, 0.47222],
        "10752": [0.25001, 0.75, 0, 0, 1.11111],
        "10753": [0.25001, 0.75, 0, 0, 1.11111],
        "10754": [0.25001, 0.75, 0, 0, 1.11111],
        "10756": [0.25001, 0.75, 0, 0, 0.83334],
        "10758": [0.25001, 0.75, 0, 0, 0.83334]
    },
    "Size2-Regular": {
        "40": [0.65002, 1.15, 0, 0, 0.59722],
        "41": [0.65002, 1.15, 0, 0, 0.59722],
        "47": [0.65002, 1.15, 0, 0, 0.81111],
        "91": [0.65002, 1.15, 0, 0, 0.47222],
        "92": [0.65002, 1.15, 0, 0, 0.81111],
        "93": [0.65002, 1.15, 0, 0, 0.47222],
        "123": [0.65002, 1.15, 0, 0, 0.66667],
        "125": [0.65002, 1.15, 0, 0, 0.66667],
        "710": [0, 0.75, 0, 0, 1.0],
        "732": [0, 0.75, 0, 0, 1.0],
        "770": [0, 0.75, 0, 0, 1.0],
        "771": [0, 0.75, 0, 0, 1.0],
        "8719": [0.55001, 1.05, 0, 0, 1.27778],
        "8720": [0.55001, 1.05, 0, 0, 1.27778],
        "8721": [0.55001, 1.05, 0, 0, 1.44445],
        "8730": [0.65002, 1.15, 0, 0, 1.0],
        "8747": [0.86225, 1.36, 0.44445, 0, 0.55556],
        "8748": [0.862, 1.36, 0.44445, 0, 0.55556],
        "8749": [0.862, 1.36, 0.44445, 0, 0.55556],
        "8750": [0.86225, 1.36, 0.44445, 0, 0.55556],
        "8896": [0.55001, 1.05, 0, 0, 1.11111],
        "8897": [0.55001, 1.05, 0, 0, 1.11111],
        "8898": [0.55001, 1.05, 0, 0, 1.11111],
        "8899": [0.55001, 1.05, 0, 0, 1.11111],
        "8968": [0.65002, 1.15, 0, 0, 0.52778],
        "8969": [0.65002, 1.15, 0, 0, 0.52778],
        "8970": [0.65002, 1.15, 0, 0, 0.52778],
        "8971": [0.65002, 1.15, 0, 0, 0.52778],
        "10216": [0.65002, 1.15, 0, 0, 0.61111],
        "10217": [0.65002, 1.15, 0, 0, 0.61111],
        "10752": [0.55001, 1.05, 0, 0, 1.51112],
        "10753": [0.55001, 1.05, 0, 0, 1.51112],
        "10754": [0.55001, 1.05, 0, 0, 1.51112],
        "10756": [0.55001, 1.05, 0, 0, 1.11111],
        "10758": [0.55001, 1.05, 0, 0, 1.11111]
    },
    "Size3-Regular": {
        "40": [0.95003, 1.45, 0, 0, 0.73611],
        "41": [0.95003, 1.45, 0, 0, 0.73611],
        "47": [0.95003, 1.45, 0, 0, 1.04445],
        "91": [0.95003, 1.45, 0, 0, 0.52778],
        "92": [0.95003, 1.45, 0, 0, 1.04445],
        "93": [0.95003, 1.45, 0, 0, 0.52778],
        "123": [0.95003, 1.45, 0, 0, 0.75],
        "125": [0.95003, 1.45, 0, 0, 0.75],
        "710": [0, 0.75, 0, 0, 1.44445],
        "732": [0, 0.75, 0, 0, 1.44445],
        "770": [0, 0.75, 0, 0, 1.44445],
        "771": [0, 0.75, 0, 0, 1.44445],
        "8730": [0.95003, 1.45, 0, 0, 1.0],
        "8968": [0.95003, 1.45, 0, 0, 0.58334],
        "8969": [0.95003, 1.45, 0, 0, 0.58334],
        "8970": [0.95003, 1.45, 0, 0, 0.58334],
        "8971": [0.95003, 1.45, 0, 0, 0.58334],
        "10216": [0.95003, 1.45, 0, 0, 0.75],
        "10217": [0.95003, 1.45, 0, 0, 0.75]
    },
    "Size4-Regular": {
        "40": [1.25003, 1.75, 0, 0, 0.79167],
        "41": [1.25003, 1.75, 0, 0, 0.79167],
        "47": [1.25003, 1.75, 0, 0, 1.27778],
        "91": [1.25003, 1.75, 0, 0, 0.58334],
        "92": [1.25003, 1.75, 0, 0, 1.27778],
        "93": [1.25003, 1.75, 0, 0, 0.58334],
        "123": [1.25003, 1.75, 0, 0, 0.80556],
        "125": [1.25003, 1.75, 0, 0, 0.80556],
        "710": [0, 0.825, 0, 0, 1.8889],
        "732": [0, 0.825, 0, 0, 1.8889],
        "770": [0, 0.825, 0, 0, 1.8889],
        "771": [0, 0.825, 0, 0, 1.8889],
        "8730": [1.25003, 1.75, 0, 0, 1.0],
        "8968": [1.25003, 1.75, 0, 0, 0.63889],
        "8969": [1.25003, 1.75, 0, 0, 0.63889],
        "8970": [1.25003, 1.75, 0, 0, 0.63889],
        "8971": [1.25003, 1.75, 0, 0, 0.63889],
        "9115": [0.64502, 1.155, 0, 0, 0.875],
        "9116": [1e-05, 0.6, 0, 0, 0.875],
        "9117": [0.64502, 1.155, 0, 0, 0.875],
        "9118": [0.64502, 1.155, 0, 0, 0.875],
        "9119": [1e-05, 0.6, 0, 0, 0.875],
        "9120": [0.64502, 1.155, 0, 0, 0.875],
        "9121": [0.64502, 1.155, 0, 0, 0.66667],
        "9122": [-0.00099, 0.601, 0, 0, 0.66667],
        "9123": [0.64502, 1.155, 0, 0, 0.66667],
        "9124": [0.64502, 1.155, 0, 0, 0.66667],
        "9125": [-0.00099, 0.601, 0, 0, 0.66667],
        "9126": [0.64502, 1.155, 0, 0, 0.66667],
        "9127": [1e-05, 0.9, 0, 0, 0.88889],
        "9128": [0.65002, 1.15, 0, 0, 0.88889],
        "9129": [0.90001, 0, 0, 0, 0.88889],
        "9130": [0, 0.3, 0, 0, 0.88889],
        "9131": [1e-05, 0.9, 0, 0, 0.88889],
        "9132": [0.65002, 1.15, 0, 0, 0.88889],
        "9133": [0.90001, 0, 0, 0, 0.88889],
        "9143": [0.88502, 0.915, 0, 0, 1.05556],
        "10216": [1.25003, 1.75, 0, 0, 0.80556],
        "10217": [1.25003, 1.75, 0, 0, 0.80556],
        "57344": [-0.00499, 0.605, 0, 0, 1.05556],
        "57345": [-0.00499, 0.605, 0, 0, 1.05556],
        "57680": [0, 0.12, 0, 0, 0.45],
        "57681": [0, 0.12, 0, 0, 0.45],
        "57682": [0, 0.12, 0, 0, 0.45],
        "57683": [0, 0.12, 0, 0, 0.45]
    },
    "Typewriter-Regular": {
        "33": [0, 0.61111, 0, 0, 0.525],
        "34": [0, 0.61111, 0, 0, 0.525],
        "35": [0, 0.61111, 0, 0, 0.525],
        "36": [0.08333, 0.69444, 0, 0, 0.525],
        "37": [0.08333, 0.69444, 0, 0, 0.525],
        "38": [0, 0.61111, 0, 0, 0.525],
        "39": [0, 0.61111, 0, 0, 0.525],
        "40": [0.08333, 0.69444, 0, 0, 0.525],
        "41": [0.08333, 0.69444, 0, 0, 0.525],
        "42": [0, 0.52083, 0, 0, 0.525],
        "43": [-0.08056, 0.53055, 0, 0, 0.525],
        "44": [0.13889, 0.125, 0, 0, 0.525],
        "45": [-0.08056, 0.53055, 0, 0, 0.525],
        "46": [0, 0.125, 0, 0, 0.525],
        "47": [0.08333, 0.69444, 0, 0, 0.525],
        "48": [0, 0.61111, 0, 0, 0.525],
        "49": [0, 0.61111, 0, 0, 0.525],
        "50": [0, 0.61111, 0, 0, 0.525],
        "51": [0, 0.61111, 0, 0, 0.525],
        "52": [0, 0.61111, 0, 0, 0.525],
        "53": [0, 0.61111, 0, 0, 0.525],
        "54": [0, 0.61111, 0, 0, 0.525],
        "55": [0, 0.61111, 0, 0, 0.525],
        "56": [0, 0.61111, 0, 0, 0.525],
        "57": [0, 0.61111, 0, 0, 0.525],
        "58": [0, 0.43056, 0, 0, 0.525],
        "59": [0.13889, 0.43056, 0, 0, 0.525],
        "60": [-0.05556, 0.55556, 0, 0, 0.525],
        "61": [-0.19549, 0.41562, 0, 0, 0.525],
        "62": [-0.05556, 0.55556, 0, 0, 0.525],
        "63": [0, 0.61111, 0, 0, 0.525],
        "64": [0, 0.61111, 0, 0, 0.525],
        "65": [0, 0.61111, 0, 0, 0.525],
        "66": [0, 0.61111, 0, 0, 0.525],
        "67": [0, 0.61111, 0, 0, 0.525],
        "68": [0, 0.61111, 0, 0, 0.525],
        "69": [0, 0.61111, 0, 0, 0.525],
        "70": [0, 0.61111, 0, 0, 0.525],
        "71": [0, 0.61111, 0, 0, 0.525],
        "72": [0, 0.61111, 0, 0, 0.525],
        "73": [0, 0.61111, 0, 0, 0.525],
        "74": [0, 0.61111, 0, 0, 0.525],
        "75": [0, 0.61111, 0, 0, 0.525],
        "76": [0, 0.61111, 0, 0, 0.525],
        "77": [0, 0.61111, 0, 0, 0.525],
        "78": [0, 0.61111, 0, 0, 0.525],
        "79": [0, 0.61111, 0, 0, 0.525],
        "80": [0, 0.61111, 0, 0, 0.525],
        "81": [0.13889, 0.61111, 0, 0, 0.525],
        "82": [0, 0.61111, 0, 0, 0.525],
        "83": [0, 0.61111, 0, 0, 0.525],
        "84": [0, 0.61111, 0, 0, 0.525],
        "85": [0, 0.61111, 0, 0, 0.525],
        "86": [0, 0.61111, 0, 0, 0.525],
        "87": [0, 0.61111, 0, 0, 0.525],
        "88": [0, 0.61111, 0, 0, 0.525],
        "89": [0, 0.61111, 0, 0, 0.525],
        "90": [0, 0.61111, 0, 0, 0.525],
        "91": [0.08333, 0.69444, 0, 0, 0.525],
        "92": [0.08333, 0.69444, 0, 0, 0.525],
        "93": [0.08333, 0.69444, 0, 0, 0.525],
        "94": [0, 0.61111, 0, 0, 0.525],
        "95": [0.09514, 0, 0, 0, 0.525],
        "96": [0, 0.61111, 0, 0, 0.525],
        "97": [0, 0.43056, 0, 0, 0.525],
        "98": [0, 0.61111, 0, 0, 0.525],
        "99": [0, 0.43056, 0, 0, 0.525],
        "100": [0, 0.61111, 0, 0, 0.525],
        "101": [0, 0.43056, 0, 0, 0.525],
        "102": [0, 0.61111, 0, 0, 0.525],
        "103": [0.22222, 0.43056, 0, 0, 0.525],
        "104": [0, 0.61111, 0, 0, 0.525],
        "105": [0, 0.61111, 0, 0, 0.525],
        "106": [0.22222, 0.61111, 0, 0, 0.525],
        "107": [0, 0.61111, 0, 0, 0.525],
        "108": [0, 0.61111, 0, 0, 0.525],
        "109": [0, 0.43056, 0, 0, 0.525],
        "110": [0, 0.43056, 0, 0, 0.525],
        "111": [0, 0.43056, 0, 0, 0.525],
        "112": [0.22222, 0.43056, 0, 0, 0.525],
        "113": [0.22222, 0.43056, 0, 0, 0.525],
        "114": [0, 0.43056, 0, 0, 0.525],
        "115": [0, 0.43056, 0, 0, 0.525],
        "116": [0, 0.55358, 0, 0, 0.525],
        "117": [0, 0.43056, 0, 0, 0.525],
        "118": [0, 0.43056, 0, 0, 0.525],
        "119": [0, 0.43056, 0, 0, 0.525],
        "120": [0, 0.43056, 0, 0, 0.525],
        "121": [0.22222, 0.43056, 0, 0, 0.525],
        "122": [0, 0.43056, 0, 0, 0.525],
        "123": [0.08333, 0.69444, 0, 0, 0.525],
        "124": [0.08333, 0.69444, 0, 0, 0.525],
        "125": [0.08333, 0.69444, 0, 0, 0.525],
        "126": [0, 0.61111, 0, 0, 0.525],
        "127": [0, 0.61111, 0, 0, 0.525],
        "305": [0, 0.43056, 0, 0, 0.525],
        "567": [0.22222, 0.43056, 0, 0, 0.525],
        "768": [0, 0.61111, 0, 0, 0.525],
        "769": [0, 0.61111, 0, 0, 0.525],
        "770": [0, 0.61111, 0, 0, 0.525],
        "771": [0, 0.61111, 0, 0, 0.525],
        "772": [0, 0.56555, 0, 0, 0.525],
        "774": [0, 0.61111, 0, 0, 0.525],
        "776": [0, 0.61111, 0, 0, 0.525],
        "778": [0, 0.61111, 0, 0, 0.525],
        "780": [0, 0.56597, 0, 0, 0.525],
        "915": [0, 0.61111, 0, 0, 0.525],
        "916": [0, 0.61111, 0, 0, 0.525],
        "920": [0, 0.61111, 0, 0, 0.525],
        "923": [0, 0.61111, 0, 0, 0.525],
        "926": [0, 0.61111, 0, 0, 0.525],
        "928": [0, 0.61111, 0, 0, 0.525],
        "931": [0, 0.61111, 0, 0, 0.525],
        "933": [0, 0.61111, 0, 0, 0.525],
        "934": [0, 0.61111, 0, 0, 0.525],
        "936": [0, 0.61111, 0, 0, 0.525],
        "937": [0, 0.61111, 0, 0, 0.525],
        "8216": [0, 0.61111, 0, 0, 0.525],
        "8217": [0, 0.61111, 0, 0, 0.525],
        "8242": [0, 0.61111, 0, 0, 0.525],
        "9251": [0.11111, 0.21944, 0, 0, 0.525]
    }
};

},{}],103:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _utils = require("./utils");

var _utils2 = _interopRequireDefault(_utils);

var _ParseError = require("./ParseError");

var _ParseError2 = _interopRequireDefault(_ParseError);

var _ParseNode = require("./ParseNode");

var _ParseNode2 = _interopRequireDefault(_ParseNode);

var _defineFunction2 = require("./defineFunction");

var _defineFunction3 = _interopRequireDefault(_defineFunction2);

require("./functions/sqrt");

require("./functions/color");

require("./functions/text");

require("./functions/enclose");

require("./functions/overline");

require("./functions/underline");

require("./functions/rule");

require("./functions/kern");

require("./functions/phantom");

require("./functions/mod");

require("./functions/op");

require("./functions/operatorname");

require("./functions/genfrac");

require("./functions/lap");

require("./functions/smash");

require("./functions/delimsizing");

require("./functions/verb");

require("./functions/href");

require("./functions/mathchoice");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// WARNING: New functions should be added to src/functions and imported here.

/** Include this to ensure that all functions are defined. */
var functions = _defineFunction2._functions;
exports.default = functions;

// Define a convenience function that mimcs the old semantics of defineFunction
// to support existing code so that we can migrate it a little bit at a time.

var defineFunction = function defineFunction(names, props, handler) // null only if handled in parser
{
    (0, _defineFunction3.default)({ names: names, props: props, handler: handler });
};

// \color is handled in Parser.js's parseImplicitGroup
defineFunction(["\\color"], {
    numArgs: 1,
    allowedInText: true,
    greediness: 3,
    argTypes: ["color"]
}, null);

// Math class commands except \mathop
defineFunction(["\\mathord", "\\mathbin", "\\mathrel", "\\mathopen", "\\mathclose", "\\mathpunct", "\\mathinner"], {
    numArgs: 1
}, function (context, args) {
    var body = args[0];
    return {
        type: "mclass",
        mclass: "m" + context.funcName.substr(5),
        value: (0, _defineFunction2.ordargument)(body)
    };
});

// Build a relation by placing one symbol on top of another
defineFunction(["\\stackrel"], {
    numArgs: 2
}, function (context, args) {
    var top = args[0];
    var bottom = args[1];

    var bottomop = new _ParseNode2.default("op", {
        type: "op",
        limits: true,
        alwaysHandleSupSub: true,
        symbol: false,
        value: (0, _defineFunction2.ordargument)(bottom)
    }, bottom.mode);

    var supsub = new _ParseNode2.default("supsub", {
        base: bottomop,
        sup: top,
        sub: null
    }, top.mode);

    return {
        type: "mclass",
        mclass: "mrel",
        value: [supsub]
    };
});

var fontAliases = {
    "\\Bbb": "\\mathbb",
    "\\bold": "\\mathbf",
    "\\frak": "\\mathfrak",
    "\\bm": "\\boldsymbol"
};

var singleCharIntegrals = {
    "\u222B": "\\int",
    "\u222C": "\\iint",
    "\u222D": "\\iiint",
    "\u222E": "\\oint"
};

// There are 2 flags for operators; whether they produce limits in
// displaystyle, and whether they are symbols and should grow in
// displaystyle. These four groups cover the four possible choices.

// No limits, not symbols
defineFunction(["\\arcsin", "\\arccos", "\\arctan", "\\arctg", "\\arcctg", "\\arg", "\\ch", "\\cos", "\\cosec", "\\cosh", "\\cot", "\\cotg", "\\coth", "\\csc", "\\ctg", "\\cth", "\\deg", "\\dim", "\\exp", "\\hom", "\\ker", "\\lg", "\\ln", "\\log", "\\sec", "\\sin", "\\sinh", "\\sh", "\\tan", "\\tanh", "\\tg", "\\th"], {
    numArgs: 0
}, function (context) {
    return {
        type: "op",
        limits: false,
        symbol: false,
        body: context.funcName
    };
});

// Limits, not symbols
defineFunction(["\\det", "\\gcd", "\\inf", "\\lim", "\\max", "\\min", "\\Pr", "\\sup"], {
    numArgs: 0
}, function (context) {
    return {
        type: "op",
        limits: true,
        symbol: false,
        body: context.funcName
    };
});

// No limits, symbols
defineFunction(["\\int", "\\iint", "\\iiint", "\\oint", "\u222B", "\u222C", "\u222D", "\u222E"], {
    numArgs: 0
}, function (context) {
    var fName = context.funcName;
    if (fName.length === 1) {
        fName = singleCharIntegrals[fName];
    }
    return {
        type: "op",
        limits: false,
        symbol: true,
        body: fName
    };
});

// Sizing functions (handled in Parser.js explicitly, hence no handler)
defineFunction(["\\tiny", "\\scriptsize", "\\footnotesize", "\\small", "\\normalsize", "\\large", "\\Large", "\\LARGE", "\\huge", "\\Huge"], { numArgs: 0 }, null);

// Style changing functions (handled in Parser.js explicitly, hence no
// handler)
defineFunction(["\\displaystyle", "\\textstyle", "\\scriptstyle", "\\scriptscriptstyle"], { numArgs: 0 }, null);

// Old font changing functions
defineFunction(["\\rm", "\\sf", "\\tt", "\\bf", "\\it"], { numArgs: 0 }, null);

defineFunction([
// styles
"\\mathrm", "\\mathit", "\\mathbf", "\\boldsymbol",

// families
"\\mathbb", "\\mathcal", "\\mathfrak", "\\mathscr", "\\mathsf", "\\mathtt",

// aliases
"\\Bbb", "\\bold", "\\frak", "\\bm"], {
    numArgs: 1,
    greediness: 2
}, function (context, args) {
    var body = args[0];
    var func = context.funcName;
    if (func in fontAliases) {
        func = fontAliases[func];
    }
    return {
        type: "font",
        font: func.slice(1),
        body: body
    };
});

// Accents
defineFunction(["\\acute", "\\grave", "\\ddot", "\\tilde", "\\bar", "\\breve", "\\check", "\\hat", "\\vec", "\\dot", "\\widehat", "\\widetilde", "\\overrightarrow", "\\overleftarrow", "\\Overrightarrow", "\\overleftrightarrow", "\\overgroup", "\\overlinesegment", "\\overleftharpoon", "\\overrightharpoon"], {
    numArgs: 1
}, function (context, args) {
    var base = args[0];

    var isStretchy = !_utils2.default.contains(["\\acute", "\\grave", "\\ddot", "\\tilde", "\\bar", "\\breve", "\\check", "\\hat", "\\vec", "\\dot"], context.funcName);

    var isShifty = !isStretchy || _utils2.default.contains(["\\widehat", "\\widetilde"], context.funcName);

    return {
        type: "accent",
        label: context.funcName,
        isStretchy: isStretchy,
        isShifty: isShifty,
        base: base
    };
});

// Text-mode accents
defineFunction(["\\'", "\\`", "\\^", "\\~", "\\=", "\\u", "\\.", '\\"', "\\r", "\\H", "\\v"], {
    numArgs: 1,
    allowedInText: true,
    allowedInMath: false
}, function (context, args) {
    var base = args[0];

    return {
        type: "accent",
        label: context.funcName,
        isStretchy: false,
        isShifty: true,
        base: base
    };
});

// Horizontal stretchy braces
defineFunction(["\\overbrace", "\\underbrace"], {
    numArgs: 1
}, function (context, args) {
    var base = args[0];
    return {
        type: "horizBrace",
        label: context.funcName,
        isOver: /^\\over/.test(context.funcName),
        base: base
    };
});

// Stretchy accents under the body
defineFunction(["\\underleftarrow", "\\underrightarrow", "\\underleftrightarrow", "\\undergroup", "\\underlinesegment", "\\utilde"], {
    numArgs: 1
}, function (context, args) {
    var base = args[0];
    return {
        type: "accentUnder",
        label: context.funcName,
        base: base
    };
});

// Stretchy arrows with an optional argument
defineFunction(["\\xleftarrow", "\\xrightarrow", "\\xLeftarrow", "\\xRightarrow", "\\xleftrightarrow", "\\xLeftrightarrow", "\\xhookleftarrow", "\\xhookrightarrow", "\\xmapsto", "\\xrightharpoondown", "\\xrightharpoonup", "\\xleftharpoondown", "\\xleftharpoonup", "\\xrightleftharpoons", "\\xleftrightharpoons", "\\xlongequal", "\\xtwoheadrightarrow", "\\xtwoheadleftarrow", "\\xtofrom"], {
    numArgs: 1,
    numOptionalArgs: 1
}, function (context, args, optArgs) {
    var below = optArgs[0];
    var body = args[0];
    return {
        type: "xArrow", // x for extensible
        label: context.funcName,
        body: body,
        below: below
    };
});

// Infix generalized fractions
defineFunction(["\\over", "\\choose", "\\atop"], {
    numArgs: 0,
    infix: true
}, function (context) {
    var replaceWith = void 0;
    switch (context.funcName) {
        case "\\over":
            replaceWith = "\\frac";
            break;
        case "\\choose":
            replaceWith = "\\binom";
            break;
        case "\\atop":
            replaceWith = "\\\\atopfrac";
            break;
        default:
            throw new Error("Unrecognized infix genfrac command");
    }
    return {
        type: "infix",
        replaceWith: replaceWith,
        token: context.token
    };
});

// Row breaks for aligned data
defineFunction(["\\\\", "\\cr"], {
    numArgs: 0,
    numOptionalArgs: 1,
    argTypes: ["size"]
}, function (context, args, optArgs) {
    var size = optArgs[0];
    return {
        type: "cr",
        size: size
    };
});

// Environment delimiters
defineFunction(["\\begin", "\\end"], {
    numArgs: 1,
    argTypes: ["text"]
}, function (context, args) {
    var nameGroup = args[0];
    if (nameGroup.type !== "ordgroup") {
        throw new _ParseError2.default("Invalid environment name", nameGroup);
    }
    var name = "";
    for (var i = 0; i < nameGroup.value.length; ++i) {
        name += nameGroup.value[i].value;
    }
    return {
        type: "environment",
        name: name,
        nameGroup: nameGroup
    };
});

// Box manipulation
defineFunction(["\\raisebox"], {
    numArgs: 2,
    argTypes: ["size", "text"],
    allowedInText: true
}, function (context, args) {
    var amount = args[0];
    var body = args[1];
    return {
        type: "raisebox",
        dy: amount,
        body: body,
        value: (0, _defineFunction2.ordargument)(body)
    };
});

// Hyperlinks


// MathChoice

},{"./ParseError":84,"./ParseNode":85,"./defineFunction":96,"./functions/color":104,"./functions/delimsizing":105,"./functions/enclose":106,"./functions/genfrac":107,"./functions/href":108,"./functions/kern":109,"./functions/lap":110,"./functions/mathchoice":111,"./functions/mod":112,"./functions/op":113,"./functions/operatorname":114,"./functions/overline":115,"./functions/phantom":116,"./functions/rule":117,"./functions/smash":118,"./functions/sqrt":119,"./functions/text":120,"./functions/underline":121,"./functions/verb":122,"./utils":133}],104:[function(require,module,exports){
"use strict";

var _defineFunction = require("../defineFunction");

var _defineFunction2 = _interopRequireDefault(_defineFunction);

var _buildCommon = require("../buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _mathMLTree = require("../mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _buildHTML = require("../buildHTML");

var html = _interopRequireWildcard(_buildHTML);

var _buildMathML = require("../buildMathML");

var mml = _interopRequireWildcard(_buildMathML);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var htmlBuilder = function htmlBuilder(group, options) {
    var elements = html.buildExpression(group.value.value, options.withColor(group.value.color), false);

    // \color isn't supposed to affect the type of the elements it contains.
    // To accomplish this, we wrap the results in a fragment, so the inner
    // elements will be able to directly interact with their neighbors. For
    // example, `\color{red}{2 +} 3` has the same spacing as `2 + 3`
    return new _buildCommon2.default.makeFragment(elements);
};


var mathmlBuilder = function mathmlBuilder(group, options) {
    var inner = mml.buildExpression(group.value.value, options);

    var node = new _mathMLTree2.default.MathNode("mstyle", inner);

    node.setAttribute("mathcolor", group.value.color);

    return node;
};

(0, _defineFunction2.default)({
    type: "color",
    names: ["\\textcolor"],
    props: {
        numArgs: 2,
        allowedInText: true,
        greediness: 3,
        argTypes: ["color", "original"]
    },
    handler: function handler(context, args) {
        var color = args[0];
        var body = args[1];
        return {
            type: "color",
            color: color.value,
            value: (0, _defineFunction.ordargument)(body)
        };
    },

    htmlBuilder: htmlBuilder,
    mathmlBuilder: mathmlBuilder
});

// TODO(kevinb): define these using macros
(0, _defineFunction2.default)({
    type: "color",
    names: ["\\blue", "\\orange", "\\pink", "\\red", "\\green", "\\gray", "\\purple", "\\blueA", "\\blueB", "\\blueC", "\\blueD", "\\blueE", "\\tealA", "\\tealB", "\\tealC", "\\tealD", "\\tealE", "\\greenA", "\\greenB", "\\greenC", "\\greenD", "\\greenE", "\\goldA", "\\goldB", "\\goldC", "\\goldD", "\\goldE", "\\redA", "\\redB", "\\redC", "\\redD", "\\redE", "\\maroonA", "\\maroonB", "\\maroonC", "\\maroonD", "\\maroonE", "\\purpleA", "\\purpleB", "\\purpleC", "\\purpleD", "\\purpleE", "\\mintA", "\\mintB", "\\mintC", "\\grayA", "\\grayB", "\\grayC", "\\grayD", "\\grayE", "\\grayF", "\\grayG", "\\grayH", "\\grayI", "\\kaBlue", "\\kaGreen"],
    props: {
        numArgs: 1,
        allowedInText: true,
        greediness: 3
    },
    handler: function handler(context, args) {
        var body = args[0];
        return {
            type: "color",
            color: "katex-" + context.funcName.slice(1),
            value: (0, _defineFunction.ordargument)(body)
        };
    },

    htmlBuilder: htmlBuilder,
    mathmlBuilder: mathmlBuilder
});

},{"../buildCommon":91,"../buildHTML":92,"../buildMathML":93,"../defineFunction":96,"../mathMLTree":124}],105:[function(require,module,exports){
"use strict";

var _buildCommon = require("../buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _defineFunction = require("../defineFunction");

var _defineFunction2 = _interopRequireDefault(_defineFunction);

var _delimiter = require("../delimiter");

var _delimiter2 = _interopRequireDefault(_delimiter);

var _mathMLTree = require("../mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _ParseError = require("../ParseError");

var _ParseError2 = _interopRequireDefault(_ParseError);

var _utils = require("../utils");

var _utils2 = _interopRequireDefault(_utils);

var _buildHTML = require("../buildHTML");

var html = _interopRequireWildcard(_buildHTML);

var _buildMathML = require("../buildMathML");

var mml = _interopRequireWildcard(_buildMathML);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Extra data needed for the delimiter handler down below
var delimiterSizes = {
    "\\bigl": { mclass: "mopen", size: 1 },
    "\\Bigl": { mclass: "mopen", size: 2 },
    "\\biggl": { mclass: "mopen", size: 3 },
    "\\Biggl": { mclass: "mopen", size: 4 },
    "\\bigr": { mclass: "mclose", size: 1 },
    "\\Bigr": { mclass: "mclose", size: 2 },
    "\\biggr": { mclass: "mclose", size: 3 },
    "\\Biggr": { mclass: "mclose", size: 4 },
    "\\bigm": { mclass: "mrel", size: 1 },
    "\\Bigm": { mclass: "mrel", size: 2 },
    "\\biggm": { mclass: "mrel", size: 3 },
    "\\Biggm": { mclass: "mrel", size: 4 },
    "\\big": { mclass: "mord", size: 1 },
    "\\Big": { mclass: "mord", size: 2 },
    "\\bigg": { mclass: "mord", size: 3 },
    "\\Bigg": { mclass: "mord", size: 4 }
};

var delimiters = ["(", ")", "[", "\\lbrack", "]", "\\rbrack", "\\{", "\\lbrace", "\\}", "\\rbrace", "\\lfloor", "\\rfloor", "\\lceil", "\\rceil", "<", ">", "\\langle", "\\rangle", "\\lt", "\\gt", "\\lvert", "\\rvert", "\\lVert", "\\rVert", "\\lgroup", "\\rgroup", "\\lmoustache", "\\rmoustache", "/", "\\backslash", "|", "\\vert", "\\|", "\\Vert", "\\uparrow", "\\Uparrow", "\\downarrow", "\\Downarrow", "\\updownarrow", "\\Updownarrow", "."];

// Delimiter functions
function checkDelimiter(delim, context) {
    if (_utils2.default.contains(delimiters, delim.value)) {
        return delim;
    } else {
        throw new _ParseError2.default("Invalid delimiter: '" + delim.value + "' after '" + context.funcName + "'", delim);
    }
}

(0, _defineFunction2.default)({
    type: "delimsizing",
    names: ["\\bigl", "\\Bigl", "\\biggl", "\\Biggl", "\\bigr", "\\Bigr", "\\biggr", "\\Biggr", "\\bigm", "\\Bigm", "\\biggm", "\\Biggm", "\\big", "\\Big", "\\bigg", "\\Bigg"],
    props: {
        numArgs: 1
    },
    handler: function handler(context, args) {
        var delim = checkDelimiter(args[0], context);

        return {
            type: "delimsizing",
            size: delimiterSizes[context.funcName].size,
            mclass: delimiterSizes[context.funcName].mclass,
            value: delim.value
        };
    },
    htmlBuilder: function htmlBuilder(group, options) {
        var delim = group.value.value;

        if (delim === ".") {
            // Empty delimiters still count as elements, even though they don't
            // show anything.
            return _buildCommon2.default.makeSpan([group.value.mclass]);
        }

        // Use delimiter.sizedDelim to generate the delimiter.
        return _delimiter2.default.sizedDelim(delim, group.value.size, options, group.mode, [group.value.mclass]);
    },
    mathmlBuilder: function mathmlBuilder(group) {
        var children = [];

        if (group.value.value !== ".") {
            children.push(mml.makeText(group.value.value, group.mode));
        }

        var node = new _mathMLTree2.default.MathNode("mo", children);

        if (group.value.mclass === "mopen" || group.value.mclass === "mclose") {
            // Only some of the delimsizing functions act as fences, and they
            // return "mopen" or "mclose" mclass.
            node.setAttribute("fence", "true");
        } else {
            // Explicitly disable fencing if it's not a fence, to override the
            // defaults.
            node.setAttribute("fence", "false");
        }

        return node;
    }
});

(0, _defineFunction2.default)({
    type: "leftright",
    names: ["\\left", "\\right"],
    props: {
        numArgs: 1
    },
    handler: function handler(context, args) {
        var delim = checkDelimiter(args[0], context);

        // \left and \right are caught somewhere in Parser.js, which is
        // why this data doesn't match what is in buildHTML.
        return {
            type: "leftright",
            value: delim.value
        };
    },
    htmlBuilder: function htmlBuilder(group, options) {
        // Build the inner expression
        var inner = html.buildExpression(group.value.body, options, true);

        var innerHeight = 0;
        var innerDepth = 0;
        var hadMiddle = false;

        // Calculate its height and depth
        for (var i = 0; i < inner.length; i++) {
            if (inner[i].isMiddle) {
                hadMiddle = true;
            } else {
                innerHeight = Math.max(inner[i].height, innerHeight);
                innerDepth = Math.max(inner[i].depth, innerDepth);
            }
        }

        // The size of delimiters is the same, regardless of what style we are
        // in. Thus, to correctly calculate the size of delimiter we need around
        // a group, we scale down the inner size based on the size.
        innerHeight *= options.sizeMultiplier;
        innerDepth *= options.sizeMultiplier;

        var leftDelim = void 0;
        if (group.value.left === ".") {
            // Empty delimiters in \left and \right make null delimiter spaces.
            leftDelim = html.makeNullDelimiter(options, ["mopen"]);
        } else {
            // Otherwise, use leftRightDelim to generate the correct sized
            // delimiter.
            leftDelim = _delimiter2.default.leftRightDelim(group.value.left, innerHeight, innerDepth, options, group.mode, ["mopen"]);
        }
        // Add it to the beginning of the expression
        inner.unshift(leftDelim);

        // Handle middle delimiters
        if (hadMiddle) {
            for (var _i = 1; _i < inner.length; _i++) {
                var middleDelim = inner[_i];
                if (middleDelim.isMiddle) {
                    // Apply the options that were active when \middle was called
                    inner[_i] = _delimiter2.default.leftRightDelim(middleDelim.isMiddle.value, innerHeight, innerDepth, middleDelim.isMiddle.options, group.mode, []);
                    // Add back spaces shifted into the delimiter
                    var spaces = html.spliceSpaces(middleDelim.children, 0);
                    if (spaces) {
                        _buildCommon2.default.prependChildren(inner[_i], spaces);
                    }
                }
            }
        }

        var rightDelim = void 0;
        // Same for the right delimiter
        if (group.value.right === ".") {
            rightDelim = html.makeNullDelimiter(options, ["mclose"]);
        } else {
            rightDelim = _delimiter2.default.leftRightDelim(group.value.right, innerHeight, innerDepth, options, group.mode, ["mclose"]);
        }
        // Add it to the end of the expression.
        inner.push(rightDelim);

        return _buildCommon2.default.makeSpan(["minner"], inner, options);
    },
    mathmlBuilder: function mathmlBuilder(group, options) {
        var inner = mml.buildExpression(group.value.body, options);

        if (group.value.left !== ".") {
            var leftNode = new _mathMLTree2.default.MathNode("mo", [mml.makeText(group.value.left, group.mode)]);

            leftNode.setAttribute("fence", "true");

            inner.unshift(leftNode);
        }

        if (group.value.right !== ".") {
            var rightNode = new _mathMLTree2.default.MathNode("mo", [mml.makeText(group.value.right, group.mode)]);

            rightNode.setAttribute("fence", "true");

            inner.push(rightNode);
        }

        var outerNode = new _mathMLTree2.default.MathNode("mrow", inner);

        return outerNode;
    }
});

(0, _defineFunction2.default)({
    type: "middle",
    names: ["\\middle"],
    props: {
        numArgs: 1
    },
    handler: function handler(context, args) {
        var delim = checkDelimiter(args[0], context);
        if (!context.parser.leftrightDepth) {
            throw new _ParseError2.default("\\middle without preceding \\left", delim);
        }

        return {
            type: "middle",
            value: delim.value
        };
    },
    htmlBuilder: function htmlBuilder(group, options) {
        var middleDelim = void 0;
        if (group.value.value === ".") {
            middleDelim = html.makeNullDelimiter(options, []);
        } else {
            middleDelim = _delimiter2.default.sizedDelim(group.value.value, 1, options, group.mode, []);
            middleDelim.isMiddle = { value: group.value.value, options: options };
        }
        return middleDelim;
    },
    mathmlBuilder: function mathmlBuilder(group, options) {
        var middleNode = new _mathMLTree2.default.MathNode("mo", [mml.makeText(group.value.middle, group.mode)]);
        middleNode.setAttribute("fence", "true");
        return middleNode;
    }
});

},{"../ParseError":84,"../buildCommon":91,"../buildHTML":92,"../buildMathML":93,"../defineFunction":96,"../delimiter":97,"../mathMLTree":124,"../utils":133}],106:[function(require,module,exports){
"use strict";

var _defineFunction = require("../defineFunction");

var _defineFunction2 = _interopRequireDefault(_defineFunction);

var _buildCommon = require("../buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _mathMLTree = require("../mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _utils = require("../utils");

var _utils2 = _interopRequireDefault(_utils);

var _stretchy = require("../stretchy");

var _stretchy2 = _interopRequireDefault(_stretchy);

var _buildHTML = require("../buildHTML");

var html = _interopRequireWildcard(_buildHTML);

var _buildMathML = require("../buildMathML");

var mml = _interopRequireWildcard(_buildMathML);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var htmlBuilder = function htmlBuilder(group, options) {
    // \cancel, \bcancel, \xcancel, \sout, \fbox, \colorbox, \fcolorbox
    var inner = html.buildGroup(group.value.body, options);

    var label = group.value.label.substr(1);
    var scale = options.sizeMultiplier;
    var img = void 0;
    var imgShift = 0;
    var isColorbox = /color/.test(label);

    if (label === "sout") {
        img = _buildCommon2.default.makeSpan(["stretchy", "sout"]);
        img.height = options.fontMetrics().defaultRuleThickness / scale;
        imgShift = -0.5 * options.fontMetrics().xHeight;
    } else {
        // Add horizontal padding
        inner.classes.push(/cancel/.test(label) ? "cancel-pad" : "boxpad");

        // Add vertical padding
        var vertPad = 0;
        // ref: LaTeX source2e: \fboxsep = 3pt;  \fboxrule = .4pt
        // ref: cancel package: \advance\totalheight2\p@ % "+2"
        if (/box/.test(label)) {
            vertPad = label === "colorbox" ? 0.3 : 0.34;
        } else {
            vertPad = _utils2.default.isCharacterBox(group.value.body) ? 0.2 : 0;
        }

        img = _stretchy2.default.encloseSpan(inner, label, vertPad, options);
        imgShift = inner.depth + vertPad;

        if (isColorbox) {
            img.style.backgroundColor = group.value.backgroundColor.value;
            if (label === "fcolorbox") {
                img.style.borderColor = group.value.borderColor.value;
            }
        }
    }

    var vlist = void 0;
    if (isColorbox) {
        vlist = _buildCommon2.default.makeVList({
            positionType: "individualShift",
            children: [
            // Put the color background behind inner;
            { type: "elem", elem: img, shift: imgShift }, { type: "elem", elem: inner, shift: 0 }]
        }, options);
    } else {
        vlist = _buildCommon2.default.makeVList({
            positionType: "individualShift",
            children: [
            // Write the \cancel stroke on top of inner.
            {
                type: "elem",
                elem: inner,
                shift: 0
            }, {
                type: "elem",
                elem: img,
                shift: imgShift,
                wrapperClasses: /cancel/.test(label) ? ["svg-align"] : []
            }]
        }, options);
    }

    if (/cancel/.test(label)) {
        // cancel does not create horiz space for its line extension.
        // That is, not when adjacent to a mord.
        return _buildCommon2.default.makeSpan(["mord", "cancel-lap"], [vlist], options);
    } else {
        return _buildCommon2.default.makeSpan(["mord"], [vlist], options);
    }
};


var mathmlBuilder = function mathmlBuilder(group, options) {
    var node = new _mathMLTree2.default.MathNode("menclose", [mml.buildGroup(group.value.body, options)]);
    switch (group.value.label) {
        case "\\cancel":
            node.setAttribute("notation", "updiagonalstrike");
            break;
        case "\\bcancel":
            node.setAttribute("notation", "downdiagonalstrike");
            break;
        case "\\sout":
            node.setAttribute("notation", "horizontalstrike");
            break;
        case "\\fbox":
            node.setAttribute("notation", "box");
            break;
        case "\\colorbox":
            node.setAttribute("mathbackground", group.value.backgroundColor.value);
            break;
        case "\\fcolorbox":
            node.setAttribute("mathbackground", group.value.backgroundColor.value);
            // TODO(ron): I don't know any way to set the border color.
            node.setAttribute("notation", "box");
            break;
        default:
            // xcancel
            node.setAttribute("notation", "updiagonalstrike downdiagonalstrike");
    }
    return node;
};

(0, _defineFunction2.default)({
    type: "enclose",
    names: ["\\colorbox"],
    props: {
        numArgs: 2,
        allowedInText: true,
        greediness: 3,
        argTypes: ["color", "text"]
    },
    handler: function handler(context, args, optArgs) {
        var color = args[0];
        var body = args[1];
        return {
            type: "enclose",
            label: context.funcName,
            backgroundColor: color,
            body: body
        };
    },

    htmlBuilder: htmlBuilder,
    mathmlBuilder: mathmlBuilder
});

(0, _defineFunction2.default)({
    type: "enclose",
    names: ["\\fcolorbox"],
    props: {
        numArgs: 3,
        allowedInText: true,
        greediness: 3,
        argTypes: ["color", "color", "text"]
    },
    handler: function handler(context, args, optArgs) {
        var borderColor = args[0];
        var backgroundColor = args[1];
        var body = args[2];
        return {
            type: "enclose",
            label: context.funcName,
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            body: body
        };
    },

    htmlBuilder: htmlBuilder,
    mathmlBuilder: mathmlBuilder
});

(0, _defineFunction2.default)({
    type: "enclose",
    names: ["\\cancel", "\\bcancel", "\\xcancel", "\\sout", "\\fbox"],
    props: {
        numArgs: 1
    },
    handler: function handler(context, args, optArgs) {
        var body = args[0];
        return {
            type: "enclose",
            label: context.funcName,
            body: body
        };
    },

    htmlBuilder: htmlBuilder,
    mathmlBuilder: mathmlBuilder
});

},{"../buildCommon":91,"../buildHTML":92,"../buildMathML":93,"../defineFunction":96,"../mathMLTree":124,"../stretchy":126,"../utils":133}],107:[function(require,module,exports){
"use strict";

var _defineFunction = require("../defineFunction");

var _defineFunction2 = _interopRequireDefault(_defineFunction);

var _buildCommon = require("../buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _delimiter = require("../delimiter");

var _delimiter2 = _interopRequireDefault(_delimiter);

var _mathMLTree = require("../mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _Style = require("../Style");

var _Style2 = _interopRequireDefault(_Style);

var _buildHTML = require("../buildHTML");

var html = _interopRequireWildcard(_buildHTML);

var _buildMathML = require("../buildMathML");

var mml = _interopRequireWildcard(_buildMathML);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _defineFunction2.default)({
    type: "genfrac",
    names: ["\\dfrac", "\\frac", "\\tfrac", "\\dbinom", "\\binom", "\\tbinom", "\\\\atopfrac"],
    props: {
        numArgs: 2,
        greediness: 2
    },
    handler: function handler(context, args) {
        var numer = args[0];
        var denom = args[1];
        var hasBarLine = void 0;
        var leftDelim = null;
        var rightDelim = null;
        var size = "auto";

        switch (context.funcName) {
            case "\\dfrac":
            case "\\frac":
            case "\\tfrac":
                hasBarLine = true;
                break;
            case "\\\\atopfrac":
                hasBarLine = false;
                break;
            case "\\dbinom":
            case "\\binom":
            case "\\tbinom":
                hasBarLine = false;
                leftDelim = "(";
                rightDelim = ")";
                break;
            default:
                throw new Error("Unrecognized genfrac command");
        }

        switch (context.funcName) {
            case "\\dfrac":
            case "\\dbinom":
                size = "display";
                break;
            case "\\tfrac":
            case "\\tbinom":
                size = "text";
                break;
        }

        return {
            type: "genfrac",
            numer: numer,
            denom: denom,
            hasBarLine: hasBarLine,
            leftDelim: leftDelim,
            rightDelim: rightDelim,
            size: size
        };
    },
    htmlBuilder: function htmlBuilder(group, options) {
        // Fractions are handled in the TeXbook on pages 444-445, rules 15(a-e).
        // Figure out what style this fraction should be in based on the
        // function used
        var style = options.style;
        if (group.value.size === "display") {
            style = _Style2.default.DISPLAY;
        } else if (group.value.size === "text") {
            style = _Style2.default.TEXT;
        }

        var nstyle = style.fracNum();
        var dstyle = style.fracDen();
        var newOptions = void 0;

        newOptions = options.havingStyle(nstyle);
        var numerm = html.buildGroup(group.value.numer, newOptions, options);

        newOptions = options.havingStyle(dstyle);
        var denomm = html.buildGroup(group.value.denom, newOptions, options);

        var rule = void 0;
        var ruleWidth = void 0;
        var ruleSpacing = void 0;
        if (group.value.hasBarLine) {
            rule = _buildCommon2.default.makeLineSpan("frac-line", options);
            ruleWidth = rule.height;
            ruleSpacing = rule.height;
        } else {
            rule = null;
            ruleWidth = 0;
            ruleSpacing = options.fontMetrics().defaultRuleThickness;
        }

        // Rule 15b
        var numShift = void 0;
        var clearance = void 0;
        var denomShift = void 0;
        if (style.size === _Style2.default.DISPLAY.size) {
            numShift = options.fontMetrics().num1;
            if (ruleWidth > 0) {
                clearance = 3 * ruleSpacing;
            } else {
                clearance = 7 * ruleSpacing;
            }
            denomShift = options.fontMetrics().denom1;
        } else {
            if (ruleWidth > 0) {
                numShift = options.fontMetrics().num2;
                clearance = ruleSpacing;
            } else {
                numShift = options.fontMetrics().num3;
                clearance = 3 * ruleSpacing;
            }
            denomShift = options.fontMetrics().denom2;
        }

        var frac = void 0;
        if (!rule) {
            // Rule 15c
            var candidateClearance = numShift - numerm.depth - (denomm.height - denomShift);
            if (candidateClearance < clearance) {
                numShift += 0.5 * (clearance - candidateClearance);
                denomShift += 0.5 * (clearance - candidateClearance);
            }

            frac = _buildCommon2.default.makeVList({
                positionType: "individualShift",
                children: [{ type: "elem", elem: denomm, shift: denomShift }, { type: "elem", elem: numerm, shift: -numShift }]
            }, options);
        } else {
            // Rule 15d
            var axisHeight = options.fontMetrics().axisHeight;

            if (numShift - numerm.depth - (axisHeight + 0.5 * ruleWidth) < clearance) {
                numShift += clearance - (numShift - numerm.depth - (axisHeight + 0.5 * ruleWidth));
            }

            if (axisHeight - 0.5 * ruleWidth - (denomm.height - denomShift) < clearance) {
                denomShift += clearance - (axisHeight - 0.5 * ruleWidth - (denomm.height - denomShift));
            }

            var midShift = -(axisHeight - 0.5 * ruleWidth);

            frac = _buildCommon2.default.makeVList({
                positionType: "individualShift",
                children: [{ type: "elem", elem: denomm, shift: denomShift },
                // The next line would ordinarily contain "shift: midShift".
                // But we put the rule into a a span that is 5 rules tall,
                // to overcome a Chrome rendering issue. Put another way,
                // we've replaced a kern of width = 2 * ruleWidth with a
                // bottom gap in the SVG = 2 * ruleWidth.
                { type: "elem", elem: rule, shift: midShift + 2 * ruleWidth }, { type: "elem", elem: numerm, shift: -numShift }]
            }, options);
        }

        // Since we manually change the style sometimes (with \dfrac or \tfrac),
        // account for the possible size change here.
        newOptions = options.havingStyle(style);
        frac.height *= newOptions.sizeMultiplier / options.sizeMultiplier;
        frac.depth *= newOptions.sizeMultiplier / options.sizeMultiplier;

        // Rule 15e
        var delimSize = void 0;
        if (style.size === _Style2.default.DISPLAY.size) {
            delimSize = options.fontMetrics().delim1;
        } else {
            delimSize = options.fontMetrics().delim2;
        }

        var leftDelim = void 0;
        var rightDelim = void 0;
        if (group.value.leftDelim == null) {
            leftDelim = html.makeNullDelimiter(options, ["mopen"]);
        } else {
            leftDelim = _delimiter2.default.customSizedDelim(group.value.leftDelim, delimSize, true, options.havingStyle(style), group.mode, ["mopen"]);
        }
        if (group.value.rightDelim == null) {
            rightDelim = html.makeNullDelimiter(options, ["mclose"]);
        } else {
            rightDelim = _delimiter2.default.customSizedDelim(group.value.rightDelim, delimSize, true, options.havingStyle(style), group.mode, ["mclose"]);
        }

        return _buildCommon2.default.makeSpan(["mord"].concat(newOptions.sizingClasses(options)), [leftDelim, _buildCommon2.default.makeSpan(["mfrac"], [frac]), rightDelim], options);
    },
    mathmlBuilder: function mathmlBuilder(group, options) {
        var node = new _mathMLTree2.default.MathNode("mfrac", [mml.buildGroup(group.value.numer, options), mml.buildGroup(group.value.denom, options)]);

        if (!group.value.hasBarLine) {
            node.setAttribute("linethickness", "0px");
        }

        if (group.value.leftDelim != null || group.value.rightDelim != null) {
            var withDelims = [];

            if (group.value.leftDelim != null) {
                var leftOp = new _mathMLTree2.default.MathNode("mo", [new _mathMLTree2.default.TextNode(group.value.leftDelim)]);

                leftOp.setAttribute("fence", "true");

                withDelims.push(leftOp);
            }

            withDelims.push(node);

            if (group.value.rightDelim != null) {
                var rightOp = new _mathMLTree2.default.MathNode("mo", [new _mathMLTree2.default.TextNode(group.value.rightDelim)]);

                rightOp.setAttribute("fence", "true");

                withDelims.push(rightOp);
            }

            var outerNode = new _mathMLTree2.default.MathNode("mrow", withDelims);

            return outerNode;
        }

        return node;
    }
});

},{"../Style":89,"../buildCommon":91,"../buildHTML":92,"../buildMathML":93,"../defineFunction":96,"../delimiter":97,"../mathMLTree":124}],108:[function(require,module,exports){
"use strict";

var _defineFunction = require("../defineFunction");

var _defineFunction2 = _interopRequireDefault(_defineFunction);

var _buildCommon = require("../buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _mathMLTree = require("../mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _buildHTML = require("../buildHTML");

var html = _interopRequireWildcard(_buildHTML);

var _buildMathML = require("../buildMathML");

var mml = _interopRequireWildcard(_buildMathML);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _defineFunction2.default)({
    type: "href",
    names: ["\\href"],
    props: {
        numArgs: 2,
        argTypes: ["url", "original"]
    },
    handler: function handler(context, args) {
        var body = args[1];
        var href = args[0].value;
        return {
            type: "href",
            href: href,
            body: (0, _defineFunction.ordargument)(body)
        };
    },
    htmlBuilder: function htmlBuilder(group, options) {
        var elements = html.buildExpression(group.value.body, options, false);

        var href = group.value.href;

        /**
         * Determining class for anchors.
         * 1. if it has the only element, use its class;
         * 2. if it has more than two elements, and the classes
         *    of its first and last elements coincide, then use it;
         * 3. otherwise, we will inject an empty <span>s at both ends,
         *    with the same classes of both ends of elements, with the
         *    first span having the same class as the first element of body,
         *    and the second one the same as the last.
         */

        var classes = []; // Default behaviour for Case 3.
        var first = void 0; // mathtype of the first child
        var last = void 0; // mathtype of the last child
        // Invariants: both first and last must be non-null if classes is null.
        if (elements.length === 1) {
            // Case 1
            classes = elements[0].classes;
        } else if (elements.length >= 2) {
            first = html.getTypeOfDomTree(elements[0]) || 'mord';
            last = html.getTypeOfDomTree(elements[elements.length - 1]) || 'mord';
            if (first === last) {
                // Case 2 : type of both ends coincides
                classes = [first];
            } else {
                // Case 3: both ends have different types.
                var anc = _buildCommon2.default.makeAnchor(href, [], elements, options);
                return new _buildCommon2.default.makeFragment([new _buildCommon2.default.makeSpan([first], [], options), anc, new _buildCommon2.default.makeSpan([last], [], options)]);
            }
        }
        return new _buildCommon2.default.makeAnchor(href, classes, elements, options);
    },
    mathmlBuilder: function mathmlBuilder(group, options) {
        var inner = mml.buildExpression(group.value.body, options);
        var math = new _mathMLTree2.default.MathNode("mrow", inner);
        math.setAttribute("href", group.value.href);
        return math;
    }
});

},{"../buildCommon":91,"../buildHTML":92,"../buildMathML":93,"../defineFunction":96,"../mathMLTree":124}],109:[function(require,module,exports){
"use strict";

var _defineFunction = require("../defineFunction");

var _defineFunction2 = _interopRequireDefault(_defineFunction);

var _buildCommon = require("../buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _mathMLTree = require("../mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _units = require("../units");

var _ParseError = require("../ParseError");

var _ParseError2 = _interopRequireDefault(_ParseError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: \hskip and \mskip should support plus and minus in lengths

(0, _defineFunction2.default)({
    type: "kern",
    names: ["\\kern", "\\mkern", "\\hskip", "\\mskip"],
    props: {
        numArgs: 1,
        argTypes: ["size"],
        allowedInText: true
    },
    handler: function handler(context, args) {
        var mathFunction = context.funcName[1] === 'm'; // \mkern, \mskip
        var muUnit = args[0].value.unit === 'mu';
        if (mathFunction) {
            if (!muUnit) {
                typeof console !== "undefined" && console.warn("In LaTeX, " + context.funcName + " supports only mu units, " + ("not " + args[0].value.unit + " units"));
            }
            if (context.parser.mode !== "math") {
                throw new _ParseError2.default("Can't use function '" + context.funcName + "' in text mode");
            }
        } else {
            // !mathFunction
            if (muUnit) {
                typeof console !== "undefined" && console.warn("In LaTeX, " + context.funcName + " does not support mu units");
            }
        }
        return {
            type: "kern",
            dimension: args[0].value
        };
    },
    htmlBuilder: function htmlBuilder(group, options) {
        // Make an empty span for the rule
        var rule = _buildCommon2.default.makeSpan(["mord", "rule"], [], options);

        if (group.value.dimension) {
            var dimension = (0, _units.calculateSize)(group.value.dimension, options);
            rule.style.marginRight = dimension + "em";
        }

        return rule;
    },
    mathmlBuilder: function mathmlBuilder(group, options) {
        var node = new _mathMLTree2.default.MathNode("mspace");

        if (group.value.dimension) {
            var dimension = (0, _units.calculateSize)(group.value.dimension, options);
            node.setAttribute("width", dimension + "em");
        }

        return node;
    }
});
/* eslint no-console:0 */
// Horizontal spacing commands

},{"../ParseError":84,"../buildCommon":91,"../defineFunction":96,"../mathMLTree":124,"../units":132}],110:[function(require,module,exports){
"use strict";

var _defineFunction = require("../defineFunction");

var _defineFunction2 = _interopRequireDefault(_defineFunction);

var _buildCommon = require("../buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _mathMLTree = require("../mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _buildHTML = require("../buildHTML");

var html = _interopRequireWildcard(_buildHTML);

var _buildMathML = require("../buildMathML");

var mml = _interopRequireWildcard(_buildMathML);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _defineFunction2.default)({
    type: "lap",
    names: ["\\mathllap", "\\mathrlap", "\\mathclap"],
    props: {
        numArgs: 1,
        allowedInText: true
    },
    handler: function handler(context, args) {
        var body = args[0];
        return {
            type: "lap",
            alignment: context.funcName.slice(5),
            body: body
        };
    },
    htmlBuilder: function htmlBuilder(group, options) {
        // mathllap, mathrlap, mathclap
        var inner = void 0;
        if (group.value.alignment === "clap") {
            // ref: https://www.math.lsu.edu/~aperlis/publications/mathclap/
            inner = _buildCommon2.default.makeSpan([], [html.buildGroup(group.value.body, options)]);
            // wrap, since CSS will center a .clap > .inner > span
            inner = _buildCommon2.default.makeSpan(["inner"], [inner], options);
        } else {
            inner = _buildCommon2.default.makeSpan(["inner"], [html.buildGroup(group.value.body, options)]);
        }
        var fix = _buildCommon2.default.makeSpan(["fix"], []);
        return _buildCommon2.default.makeSpan(["mord", group.value.alignment], [inner, fix], options);
    },
    mathmlBuilder: function mathmlBuilder(group, options) {
        // mathllap, mathrlap, mathclap
        var node = new _mathMLTree2.default.MathNode("mpadded", [mml.buildGroup(group.value.body, options)]);

        if (group.value.alignment !== "rlap") {
            var offset = group.value.alignment === "llap" ? "-1" : "-0.5";
            node.setAttribute("lspace", offset + "width");
        }
        node.setAttribute("width", "0px");

        return node;
    }
});
// Horizontal overlap functions

},{"../buildCommon":91,"../buildHTML":92,"../buildMathML":93,"../defineFunction":96,"../mathMLTree":124}],111:[function(require,module,exports){
"use strict";

var _defineFunction = require("../defineFunction");

var _defineFunction2 = _interopRequireDefault(_defineFunction);

var _buildCommon = require("../buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _mathMLTree = require("../mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _Style = require("../Style");

var _Style2 = _interopRequireDefault(_Style);

var _buildHTML = require("../buildHTML");

var html = _interopRequireWildcard(_buildHTML);

var _buildMathML = require("../buildMathML");

var mml = _interopRequireWildcard(_buildMathML);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var chooseMathStyle = function chooseMathStyle(group, options) {
    var style = options.style;
    if (style.size === _Style2.default.DISPLAY.size) {
        return group.value.display;
    } else if (style.size === _Style2.default.TEXT.size) {
        return group.value.text;
    } else if (style.size === _Style2.default.SCRIPT.size) {
        return group.value.script;
    } else if (style.size === _Style2.default.SCRIPTSCRIPT.size) {
        return group.value.scriptscript;
    }
    return group.value.text;
};

(0, _defineFunction2.default)({
    type: "mathchoice",
    names: ["\\mathchoice"],
    props: {
        numArgs: 4
    },
    handler: function handler(context, args) {
        return {
            type: "mathchoice",
            display: (0, _defineFunction.ordargument)(args[0]),
            text: (0, _defineFunction.ordargument)(args[1]),
            script: (0, _defineFunction.ordargument)(args[2]),
            scriptscript: (0, _defineFunction.ordargument)(args[3])
        };
    },
    htmlBuilder: function htmlBuilder(group, options) {
        var body = chooseMathStyle(group, options);
        var elements = html.buildExpression(body, options, false);
        return new _buildCommon2.default.makeFragment(elements);
    },
    mathmlBuilder: function mathmlBuilder(group, options) {
        var body = chooseMathStyle(group, options);
        var elements = mml.buildExpression(body, options, false);
        return new _mathMLTree2.default.MathNode("mrow", elements);
    }
});

},{"../Style":89,"../buildCommon":91,"../buildHTML":92,"../buildMathML":93,"../defineFunction":96,"../mathMLTree":124}],112:[function(require,module,exports){
"use strict";

var _defineFunction = require("../defineFunction");

var _defineFunction2 = _interopRequireDefault(_defineFunction);

var _buildCommon = require("../buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _mathMLTree = require("../mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _Style = require("../Style");

var _Style2 = _interopRequireDefault(_Style);

var _buildHTML = require("../buildHTML");

var html = _interopRequireWildcard(_buildHTML);

var _buildMathML = require("../buildMathML");

var mml = _interopRequireWildcard(_buildMathML);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// \mod-type functions
var htmlModBuilder = function htmlModBuilder(group, options) {
    var inner = [];

    if (group.value.modType === "bmod") {
        // “\nonscript\mskip-\medmuskip\mkern5mu”, where \medmuskip is
        // 4mu plus 2mu minus 1mu, translates to 1mu space in
        // display/textstyle and 5mu space in script/scriptscriptstyle.
        if (!options.style.isTight()) {
            inner.push(_buildCommon2.default.makeSpan(["mspace", "muspace"], [], options));
        } else {
            inner.push(_buildCommon2.default.makeSpan(["mspace", "thickspace"], [], options));
        }
    } else if (options.style.size === _Style2.default.DISPLAY.size) {
        inner.push(_buildCommon2.default.makeSpan(["mspace", "quad"], [], options));
    } else if (group.value.modType === "mod") {
        inner.push(_buildCommon2.default.makeSpan(["mspace", "twelvemuspace"], [], options));
    } else {
        inner.push(_buildCommon2.default.makeSpan(["mspace", "eightmuspace"], [], options));
    }

    if (group.value.modType === "pod" || group.value.modType === "pmod") {
        inner.push(_buildCommon2.default.mathsym("(", group.mode));
    }

    if (group.value.modType !== "pod") {
        var modInner = [_buildCommon2.default.mathsym("m", group.mode), _buildCommon2.default.mathsym("o", group.mode), _buildCommon2.default.mathsym("d", group.mode)];
        if (group.value.modType === "bmod") {
            inner.push(_buildCommon2.default.makeSpan(["mbin"], modInner, options));
            // “\mkern5mu\nonscript\mskip-\medmuskip” as above
            if (!options.style.isTight()) {
                inner.push(_buildCommon2.default.makeSpan(["mspace", "muspace"], [], options));
            } else {
                inner.push(_buildCommon2.default.makeSpan(["mspace", "thickspace"], [], options));
            }
        } else {
            Array.prototype.push.apply(inner, modInner);
            inner.push(_buildCommon2.default.makeSpan(["mspace", "sixmuspace"], [], options));
        }
    }

    if (group.value.value) {
        Array.prototype.push.apply(inner, html.buildExpression(group.value.value, options, false));
    }

    if (group.value.modType === "pod" || group.value.modType === "pmod") {
        inner.push(_buildCommon2.default.mathsym(")", group.mode));
    }

    return _buildCommon2.default.makeFragment(inner);
};

var mmlModBuilder = function mmlModBuilder(group, options) {
    var inner = [];

    if (group.value.modType === "pod" || group.value.modType === "pmod") {
        inner.push(new _mathMLTree2.default.MathNode("mo", [mml.makeText("(", group.mode)]));
    }
    if (group.value.modType !== "pod") {
        inner.push(new _mathMLTree2.default.MathNode("mo", [mml.makeText("mod", group.mode)]));
    }
    if (group.value.value) {
        var space = new _mathMLTree2.default.MathNode("mspace");
        space.setAttribute("width", "0.333333em");
        inner.push(space);
        inner = inner.concat(mml.buildExpression(group.value.value, options));
    }
    if (group.value.modType === "pod" || group.value.modType === "pmod") {
        inner.push(new _mathMLTree2.default.MathNode("mo", [mml.makeText(")", group.mode)]));
    }

    return new _mathMLTree2.default.MathNode("mo", inner);
};

(0, _defineFunction2.default)({
    type: "mod",
    names: ["\\bmod"],
    props: {
        numArgs: 0
    },
    handler: function handler(context, args) {
        return {
            type: "mod",
            modType: "bmod",
            value: null
        };
    },
    htmlBuilder: htmlModBuilder,
    mathmlBuilder: mmlModBuilder
});

// Note: calling defineFunction with a type that's already been defined only
// works because the same htmlBuilder and mathmlBuilder are being used.
(0, _defineFunction2.default)({
    type: "mod",
    names: ["\\pod", "\\pmod", "\\mod"],
    props: {
        numArgs: 1
    },
    handler: function handler(context, args) {
        var body = args[0];
        return {
            type: "mod",
            modType: context.funcName.substr(1),
            value: (0, _defineFunction.ordargument)(body)
        };
    },
    htmlBuilder: htmlModBuilder,
    mathmlBuilder: mmlModBuilder
});

},{"../Style":89,"../buildCommon":91,"../buildHTML":92,"../buildMathML":93,"../defineFunction":96,"../mathMLTree":124}],113:[function(require,module,exports){
"use strict";

var _defineFunction = require("../defineFunction");

var _defineFunction2 = _interopRequireDefault(_defineFunction);

var _buildCommon = require("../buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _domTree = require("../domTree");

var _domTree2 = _interopRequireDefault(_domTree);

var _mathMLTree = require("../mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _utils = require("../utils");

var _utils2 = _interopRequireDefault(_utils);

var _Style = require("../Style");

var _Style2 = _interopRequireDefault(_Style);

var _buildHTML = require("../buildHTML");

var html = _interopRequireWildcard(_buildHTML);

var _buildMathML = require("../buildMathML");

var mml = _interopRequireWildcard(_buildMathML);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Limits, symbols
var htmlBuilder = function htmlBuilder(group, options) {
    // Operators are handled in the TeXbook pg. 443-444, rule 13(a).
    var supGroup = void 0;
    var subGroup = void 0;
    var hasLimits = false;
    if (group.type === "supsub") {
        // If we have limits, supsub will pass us its group to handle. Pull
        // out the superscript and subscript and set the group to the op in
        // its base.
        supGroup = group.value.sup;
        subGroup = group.value.sub;
        group = group.value.base;
        hasLimits = true;
    }

    var style = options.style;

    // Most operators have a large successor symbol, but these don't.
    var noSuccessor = ["\\smallint"];

    var large = false;
    if (style.size === _Style2.default.DISPLAY.size && group.value.symbol && !_utils2.default.contains(noSuccessor, group.value.body)) {

        // Most symbol operators get larger in displaystyle (rule 13)
        large = true;
    }

    var base = void 0;
    if (group.value.symbol) {
        // If this is a symbol, create the symbol.
        var fontName = large ? "Size2-Regular" : "Size1-Regular";
        base = _buildCommon2.default.makeSymbol(group.value.body, fontName, "math", options, ["mop", "op-symbol", large ? "large-op" : "small-op"]);
    } else if (group.value.value) {
        // If this is a list, compose that list.
        var inner = html.buildExpression(group.value.value, options, true);
        if (inner.length === 1 && inner[0] instanceof _domTree2.default.symbolNode) {
            base = inner[0];
            base.classes[0] = "mop"; // replace old mclass
        } else {
            base = _buildCommon2.default.makeSpan(["mop"], inner, options);
        }
    } else {
        // Otherwise, this is a text operator. Build the text from the
        // operator's name.
        // TODO(emily): Add a space in the middle of some of these
        // operators, like \limsup
        var output = [];
        for (var i = 1; i < group.value.body.length; i++) {
            output.push(_buildCommon2.default.mathsym(group.value.body[i], group.mode));
        }
        base = _buildCommon2.default.makeSpan(["mop"], output, options);
    }

    // If content of op is a single symbol, shift it vertically.
    var baseShift = 0;
    var slant = 0;
    if (base instanceof _domTree2.default.symbolNode) {
        // Shift the symbol so its center lies on the axis (rule 13). It
        // appears that our fonts have the centers of the symbols already
        // almost on the axis, so these numbers are very small. Note we
        // don't actually apply this here, but instead it is used either in
        // the vlist creation or separately when there are no limits.
        baseShift = (base.height - base.depth) / 2 - options.fontMetrics().axisHeight;

        // The slant of the symbol is just its italic correction.
        slant = base.italic;
    }

    if (hasLimits) {
        // IE 8 clips \int if it is in a display: inline-block. We wrap it
        // in a new span so it is an inline, and works.
        base = _buildCommon2.default.makeSpan([], [base]);

        var sub = void 0;
        var sup = void 0;
        // We manually have to handle the superscripts and subscripts. This,
        // aside from the kern calculations, is copied from supsub.
        if (supGroup) {
            var elem = html.buildGroup(supGroup, options.havingStyle(style.sup()), options);

            sup = {
                elem: elem,
                kern: Math.max(options.fontMetrics().bigOpSpacing1, options.fontMetrics().bigOpSpacing3 - elem.depth)
            };
        }

        if (subGroup) {
            var _elem = html.buildGroup(subGroup, options.havingStyle(style.sub()), options);

            sub = {
                elem: _elem,
                kern: Math.max(options.fontMetrics().bigOpSpacing2, options.fontMetrics().bigOpSpacing4 - _elem.height)
            };
        }

        // Build the final group as a vlist of the possible subscript, base,
        // and possible superscript.
        var finalGroup = void 0;
        if (sup && sub) {
            var bottom = options.fontMetrics().bigOpSpacing5 + sub.elem.height + sub.elem.depth + sub.kern + base.depth + baseShift;

            finalGroup = _buildCommon2.default.makeVList({
                positionType: "bottom",
                positionData: bottom,
                children: [{ type: "kern", size: options.fontMetrics().bigOpSpacing5 }, { type: "elem", elem: sub.elem, marginLeft: -slant + "em" }, { type: "kern", size: sub.kern }, { type: "elem", elem: base }, { type: "kern", size: sup.kern }, { type: "elem", elem: sup.elem, marginLeft: slant + "em" }, { type: "kern", size: options.fontMetrics().bigOpSpacing5 }]
            }, options);
        } else if (sub) {
            var top = base.height - baseShift;

            // Shift the limits by the slant of the symbol. Note
            // that we are supposed to shift the limits by 1/2 of the slant,
            // but since we are centering the limits adding a full slant of
            // margin will shift by 1/2 that.
            finalGroup = _buildCommon2.default.makeVList({
                positionType: "top",
                positionData: top,
                children: [{ type: "kern", size: options.fontMetrics().bigOpSpacing5 }, { type: "elem", elem: sub.elem, marginLeft: -slant + "em" }, { type: "kern", size: sub.kern }, { type: "elem", elem: base }]
            }, options);
        } else if (sup) {
            var _bottom = base.depth + baseShift;

            finalGroup = _buildCommon2.default.makeVList({
                positionType: "bottom",
                positionData: _bottom,
                children: [{ type: "elem", elem: base }, { type: "kern", size: sup.kern }, { type: "elem", elem: sup.elem, marginLeft: slant + "em" }, { type: "kern", size: options.fontMetrics().bigOpSpacing5 }]
            }, options);
        } else {
            // This case probably shouldn't occur (this would mean the
            // supsub was sending us a group with no superscript or
            // subscript) but be safe.
            return base;
        }

        return _buildCommon2.default.makeSpan(["mop", "op-limits"], [finalGroup], options);
    } else {
        if (baseShift) {
            base.style.position = "relative";
            base.style.top = baseShift + "em";
        }

        return base;
    }
};

var mathmlBuilder = function mathmlBuilder(group, options) {
    var node = void 0;

    // TODO(emily): handle big operators using the `largeop` attribute

    if (group.value.symbol) {
        // This is a symbol. Just add the symbol.
        node = new _mathMLTree2.default.MathNode("mo", [mml.makeText(group.value.body, group.mode)]);
    } else if (group.value.value) {
        // This is an operator with children. Add them.
        node = new _mathMLTree2.default.MathNode("mo", mml.buildExpression(group.value.value, options));
    } else {
        // This is a text operator. Add all of the characters from the
        // operator's name.
        // TODO(emily): Add a space in the middle of some of these
        // operators, like \limsup.
        node = new _mathMLTree2.default.MathNode("mi", [new _mathMLTree2.default.TextNode(group.value.body.slice(1))]);

        // Append an <mo>&ApplyFunction;</mo>.
        // ref: https://www.w3.org/TR/REC-MathML/chap3_2.html#sec3.2.4
        var operator = new _mathMLTree2.default.MathNode("mo", [mml.makeText("\u2061", "text")]);

        return new _domTree2.default.documentFragment([node, operator]);
    }

    return node;
};

var singleCharBigOps = {
    "\u220F": "\\prod",
    "\u2210": "\\coprod",
    "\u2211": "\\sum",
    "\u22C0": "\\bigwedge",
    "\u22C1": "\\bigvee",
    "\u22C2": "\\bigcap",
    "\u22C3": "\\bigcap",
    "\u2A00": "\\bigodot",
    "\u2A01": "\\bigoplus",
    "\u2A02": "\\bigotimes",
    "\u2A04": "\\biguplus",
    "\u2A06": "\\bigsqcup"
};

(0, _defineFunction2.default)({
    type: "op",
    names: ["\\coprod", "\\bigvee", "\\bigwedge", "\\biguplus", "\\bigcap", "\\bigcup", "\\intop", "\\prod", "\\sum", "\\bigotimes", "\\bigoplus", "\\bigodot", "\\bigsqcup", "\\smallint", "\u220F", "\u2210", "\u2211", "\u22C0", "\u22C1", "\u22C2", "\u22C3", "\u2A00", "\u2A01", "\u2A02", "\u2A04", "\u2A06"],
    props: {
        numArgs: 0
    },
    handler: function handler(context, args) {
        var fName = context.funcName;
        if (fName.length === 1) {
            fName = singleCharBigOps[fName];
        }
        return {
            type: "op",
            limits: true,
            symbol: true,
            body: fName
        };
    },
    htmlBuilder: htmlBuilder,
    mathmlBuilder: mathmlBuilder
});

// Note: calling defineFunction with a type that's already been defined only
// works because the same htmlBuilder and mathmlBuilder are being used.
(0, _defineFunction2.default)({
    type: "op",
    names: ["\\mathop"],
    props: {
        numArgs: 1
    },
    handler: function handler(context, args) {
        var body = args[0];
        return {
            type: "op",
            limits: false,
            symbol: false,
            value: (0, _defineFunction.ordargument)(body)
        };
    },
    htmlBuilder: htmlBuilder,
    mathmlBuilder: mathmlBuilder
});

},{"../Style":89,"../buildCommon":91,"../buildHTML":92,"../buildMathML":93,"../defineFunction":96,"../domTree":98,"../mathMLTree":124,"../utils":133}],114:[function(require,module,exports){
"use strict";

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _defineFunction = require("../defineFunction");

var _defineFunction2 = _interopRequireDefault(_defineFunction);

var _buildCommon = require("../buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _mathMLTree = require("../mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _domTree = require("../domTree");

var _domTree2 = _interopRequireDefault(_domTree);

var _buildHTML = require("../buildHTML");

var html = _interopRequireWildcard(_buildHTML);

var _buildMathML = require("../buildMathML");

var mml = _interopRequireWildcard(_buildMathML);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// \operatorname
// amsopn.dtx: \mathop{#1\kern\z@\operator@font#3}\newmcodes@
(0, _defineFunction2.default)({
    type: "operatorname",
    names: ["\\operatorname"],
    props: {
        numArgs: 1
    },
    handler: function handler(context, args) {
        var body = args[0];
        return {
            type: "operatorname",
            value: (0, _defineFunction.ordargument)(body)
        };
    },

    htmlBuilder: function htmlBuilder(group, options) {
        var output = [];
        if (group.value.value.length > 0) {
            var letter = "";
            var mode = "";

            // Consolidate Greek letter function names into symbol characters.
            var temp = html.buildExpression(group.value.value, options.withFontFamily("mathrm"), true);

            // All we want from temp are the letters. With them, we'll
            // create a text operator similar to \tan or \cos.
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(temp), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var child = _step.value;

                    if (child instanceof _domTree2.default.symbolNode) {
                        letter = child.value;

                        // In the amsopn package, \newmcodes@ changes four
                        // characters, *-/:’, from math operators back into text.
                        // Given what is in temp, we have to address two of them.
                        letter = letter.replace(/\u2212/, "-"); // minus => hyphen
                        letter = letter.replace(/\u2217/, "*");

                        // Use math mode for Greek letters
                        mode = /[\u0391-\u03D7]/.test(letter) ? "math" : "text";
                        output.push(_buildCommon2.default.mathsym(letter, mode));
                    } else {
                        output.push(child);
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
        return _buildCommon2.default.makeSpan(["mop"], output, options);
    },

    mathmlBuilder: function mathmlBuilder(group, options) {
        // The steps taken here are similar to the html version.
        var output = [];
        if (group.value.value.length > 0) {
            var temp = mml.buildExpression(group.value.value, options.withFontFamily("mathrm"));

            var word = temp.map(function (node) {
                return node.toText();
            }).join("");

            word = word.replace(/\u2212/g, "-");
            word = word.replace(/\u2217/g, "*");
            output = [new _mathMLTree2.default.TextNode(word)];
        }
        var identifier = new _mathMLTree2.default.MathNode("mi", output);
        identifier.setAttribute("mathvariant", "normal");

        // \u2061 is the same as &ApplyFunction;
        // ref: https://www.w3schools.com/charsets/ref_html_entities_a.asp
        var operator = new _mathMLTree2.default.MathNode("mo", [mml.makeText("\u2061", "text")]);

        return new _domTree2.default.documentFragment([identifier, operator]);
    }
});

},{"../buildCommon":91,"../buildHTML":92,"../buildMathML":93,"../defineFunction":96,"../domTree":98,"../mathMLTree":124,"babel-runtime/core-js/get-iterator":3}],115:[function(require,module,exports){
"use strict";

var _defineFunction = require("../defineFunction");

var _defineFunction2 = _interopRequireDefault(_defineFunction);

var _buildCommon = require("../buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _mathMLTree = require("../mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _buildHTML = require("../buildHTML");

var html = _interopRequireWildcard(_buildHTML);

var _buildMathML = require("../buildMathML");

var mml = _interopRequireWildcard(_buildMathML);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _defineFunction2.default)({
    type: "overline",
    names: ["\\overline"],
    props: {
        numArgs: 1
    },
    handler: function handler(context, args) {
        var body = args[0];
        return {
            type: "overline",
            body: body
        };
    },
    htmlBuilder: function htmlBuilder(group, options) {
        // Overlines are handled in the TeXbook pg 443, Rule 9.

        // Build the inner group in the cramped style.
        var innerGroup = html.buildGroup(group.value.body, options.havingCrampedStyle());

        // Create the line above the body
        var line = _buildCommon2.default.makeLineSpan("overline-line", options);

        // Generate the vlist, with the appropriate kerns
        var vlist = _buildCommon2.default.makeVList({
            positionType: "firstBaseline",
            children: [{ type: "elem", elem: innerGroup },
            // The kern on the next line would ordinarily be 3 * line.height
            // But we put the line into a span that is 5 lines tall, to
            // overcome a Chrome rendering issue. The SVG has a space in
            // the bottom that is 2 lines high. That and the 1-line-high
            // kern sum up to the same distance as the old 3 line kern.
            { type: "kern", size: line.height }, { type: "elem", elem: line }]
        }, options);

        return _buildCommon2.default.makeSpan(["mord", "overline"], [vlist], options);
    },
    mathmlBuilder: function mathmlBuilder(group, options) {
        var operator = new _mathMLTree2.default.MathNode("mo", [new _mathMLTree2.default.TextNode("\u203E")]);
        operator.setAttribute("stretchy", "true");

        var node = new _mathMLTree2.default.MathNode("mover", [mml.buildGroup(group.value.body, options), operator]);
        node.setAttribute("accent", "true");

        return node;
    }
});

},{"../buildCommon":91,"../buildHTML":92,"../buildMathML":93,"../defineFunction":96,"../mathMLTree":124}],116:[function(require,module,exports){
"use strict";

var _defineFunction = require("../defineFunction");

var _defineFunction2 = _interopRequireDefault(_defineFunction);

var _buildCommon = require("../buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _mathMLTree = require("../mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _buildHTML = require("../buildHTML");

var html = _interopRequireWildcard(_buildHTML);

var _buildMathML = require("../buildMathML");

var mml = _interopRequireWildcard(_buildMathML);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _defineFunction2.default)({
    type: "phantom",
    names: ["\\phantom"],
    props: {
        numArgs: 1
    },
    handler: function handler(context, args) {
        var body = args[0];
        return {
            type: "phantom",
            value: (0, _defineFunction.ordargument)(body)
        };
    },
    htmlBuilder: function htmlBuilder(group, options) {
        var elements = html.buildExpression(group.value.value, options.withPhantom(), false);

        // \phantom isn't supposed to affect the elements it contains.
        // See "color" for more details.
        return new _buildCommon2.default.makeFragment(elements);
    },
    mathmlBuilder: function mathmlBuilder(group, options) {
        var inner = mml.buildExpression(group.value.value, options);
        return new _mathMLTree2.default.MathNode("mphantom", inner);
    }
});


(0, _defineFunction2.default)({
    type: "hphantom",
    names: ["\\hphantom"],
    props: {
        numArgs: 1
    },
    handler: function handler(context, args) {
        var body = args[0];
        return {
            type: "hphantom",
            value: (0, _defineFunction.ordargument)(body),
            body: body
        };
    },
    htmlBuilder: function htmlBuilder(group, options) {
        var node = _buildCommon2.default.makeSpan([], [html.buildGroup(group.value.body, options.withPhantom())]);
        node.height = 0;
        node.depth = 0;
        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                node.children[i].height = 0;
                node.children[i].depth = 0;
            }
        }

        // See smash for comment re: use of makeVList
        node = _buildCommon2.default.makeVList({
            positionType: "firstBaseline",
            children: [{ type: "elem", elem: node }]
        }, options);

        return node;
    },
    mathmlBuilder: function mathmlBuilder(group, options) {
        var inner = mml.buildExpression(group.value.value, options);
        var node = new _mathMLTree2.default.MathNode("mphantom", inner);
        node.setAttribute("height", "0px");
        return node;
    }
});

(0, _defineFunction2.default)({
    type: "vphantom",
    names: ["\\vphantom"],
    props: {
        numArgs: 1
    },
    handler: function handler(context, args) {
        var body = args[0];
        return {
            type: "vphantom",
            value: (0, _defineFunction.ordargument)(body),
            body: body
        };
    },
    htmlBuilder: function htmlBuilder(group, options) {
        var inner = _buildCommon2.default.makeSpan(["inner"], [html.buildGroup(group.value.body, options.withPhantom())]);
        var fix = _buildCommon2.default.makeSpan(["fix"], []);
        return _buildCommon2.default.makeSpan(["mord", "rlap"], [inner, fix], options);
    },
    mathmlBuilder: function mathmlBuilder(group, options) {
        var inner = mml.buildExpression(group.value.value, options);
        var node = new _mathMLTree2.default.MathNode("mphantom", inner);
        node.setAttribute("width", "0px");
        return node;
    }
});

},{"../buildCommon":91,"../buildHTML":92,"../buildMathML":93,"../defineFunction":96,"../mathMLTree":124}],117:[function(require,module,exports){
"use strict";

var _buildCommon = require("../buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _defineFunction = require("../defineFunction");

var _defineFunction2 = _interopRequireDefault(_defineFunction);

var _mathMLTree = require("../mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _units = require("../units");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _defineFunction2.default)({
    type: "rule",
    names: ["\\rule"],
    props: {
        numArgs: 2,
        numOptionalArgs: 1,
        argTypes: ["size", "size", "size"]
    },
    handler: function handler(context, args, optArgs) {
        var shift = optArgs[0];
        var width = args[0];
        var height = args[1];
        return {
            type: "rule",
            shift: shift && shift.value,
            width: width.value,
            height: height.value
        };
    },
    htmlBuilder: function htmlBuilder(group, options) {
        // Make an empty span for the rule
        var rule = _buildCommon2.default.makeSpan(["mord", "rule"], [], options);

        // Calculate the shift, width, and height of the rule, and account for units
        var shift = 0;
        if (group.value.shift) {
            shift = (0, _units.calculateSize)(group.value.shift, options);
        }

        var width = (0, _units.calculateSize)(group.value.width, options);
        var height = (0, _units.calculateSize)(group.value.height, options);

        // Style the rule to the right size
        rule.style.borderRightWidth = width + "em";
        rule.style.borderTopWidth = height + "em";
        rule.style.bottom = shift + "em";

        // Record the height and width
        rule.width = width;
        rule.height = height + shift;
        rule.depth = -shift;
        // Font size is the number large enough that the browser will
        // reserve at least `absHeight` space above the baseline.
        // The 1.125 factor was empirically determined
        rule.maxFontSize = height * 1.125 * options.sizeMultiplier;

        return rule;
    },
    mathmlBuilder: function mathmlBuilder(group, options) {
        // TODO(emily): Figure out if there's an actual way to draw black boxes
        // in MathML.
        var node = new _mathMLTree2.default.MathNode("mrow");

        return node;
    }
});

},{"../buildCommon":91,"../defineFunction":96,"../mathMLTree":124,"../units":132}],118:[function(require,module,exports){
"use strict";

var _defineFunction = require("../defineFunction");

var _defineFunction2 = _interopRequireDefault(_defineFunction);

var _buildCommon = require("../buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _mathMLTree = require("../mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _buildHTML = require("../buildHTML");

var html = _interopRequireWildcard(_buildHTML);

var _buildMathML = require("../buildMathML");

var mml = _interopRequireWildcard(_buildMathML);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _defineFunction2.default)({
    type: "smash",
    names: ["\\smash"],
    props: {
        numArgs: 1,
        numOptionalArgs: 1,
        allowedInText: true
    },
    handler: function handler(context, args, optArgs) {
        var smashHeight = false;
        var smashDepth = false;
        var tbArg = optArgs[0];
        if (tbArg) {
            // Optional [tb] argument is engaged.
            // ref: amsmath: \renewcommand{\smash}[1][tb]{%
            //               def\mb@t{\ht}\def\mb@b{\dp}\def\mb@tb{\ht\z@\z@\dp}%
            var letter = "";
            for (var i = 0; i < tbArg.value.length; ++i) {
                letter = tbArg.value[i].value;
                if (letter === "t") {
                    smashHeight = true;
                } else if (letter === "b") {
                    smashDepth = true;
                } else {
                    smashHeight = false;
                    smashDepth = false;
                    break;
                }
            }
        } else {
            smashHeight = true;
            smashDepth = true;
        }

        var body = args[0];
        return {
            type: "smash",
            body: body,
            smashHeight: smashHeight,
            smashDepth: smashDepth
        };
    },
    htmlBuilder: function htmlBuilder(group, options) {
        var node = _buildCommon2.default.makeSpan(["mord"], [html.buildGroup(group.value.body, options)]);

        if (!group.value.smashHeight && !group.value.smashDepth) {
            return node;
        }

        if (group.value.smashHeight) {
            node.height = 0;
            // In order to influence makeVList, we have to reset the children.
            if (node.children) {
                for (var i = 0; i < node.children.length; i++) {
                    node.children[i].height = 0;
                }
            }
        }

        if (group.value.smashDepth) {
            node.depth = 0;
            if (node.children) {
                for (var _i = 0; _i < node.children.length; _i++) {
                    node.children[_i].depth = 0;
                }
            }
        }

        // At this point, we've reset the TeX-like height and depth values.
        // But the span still has an HTML line height.
        // makeVList applies "display: table-cell", which prevents the browser
        // from acting on that line height. So we'll call makeVList now.

        return _buildCommon2.default.makeVList({
            positionType: "firstBaseline",
            children: [{ type: "elem", elem: node }]
        }, options);
    },
    mathmlBuilder: function mathmlBuilder(group, options) {
        var node = new _mathMLTree2.default.MathNode("mpadded", [mml.buildGroup(group.value.body, options)]);

        if (group.value.smashHeight) {
            node.setAttribute("height", "0px");
        }

        if (group.value.smashDepth) {
            node.setAttribute("depth", "0px");
        }

        return node;
    }
});
// smash, with optional [tb], as in AMS

},{"../buildCommon":91,"../buildHTML":92,"../buildMathML":93,"../defineFunction":96,"../mathMLTree":124}],119:[function(require,module,exports){
"use strict";

var _defineFunction = require("../defineFunction");

var _defineFunction2 = _interopRequireDefault(_defineFunction);

var _buildCommon = require("../buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _domTree = require("../domTree");

var _domTree2 = _interopRequireDefault(_domTree);

var _mathMLTree = require("../mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _delimiter = require("../delimiter");

var _delimiter2 = _interopRequireDefault(_delimiter);

var _Style = require("../Style");

var _Style2 = _interopRequireDefault(_Style);

var _buildHTML = require("../buildHTML");

var html = _interopRequireWildcard(_buildHTML);

var _buildMathML = require("../buildMathML");

var mml = _interopRequireWildcard(_buildMathML);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _defineFunction2.default)({
    type: "sqrt",
    names: ["\\sqrt"],
    props: {
        numArgs: 1,
        numOptionalArgs: 1
    },
    handler: function handler(context, args, optArgs) {
        var index = optArgs[0];
        var body = args[0];
        return {
            type: "sqrt",
            body: body,
            index: index
        };
    },
    htmlBuilder: function htmlBuilder(group, options) {
        // Square roots are handled in the TeXbook pg. 443, Rule 11.

        // First, we do the same steps as in overline to build the inner group
        // and line
        var inner = html.buildGroup(group.value.body, options.havingCrampedStyle());
        if (inner.height === 0) {
            // Render a small surd.
            inner.height = options.fontMetrics().xHeight;
        }

        // Some groups can return document fragments.  Handle those by wrapping
        // them in a span.
        if (inner instanceof _domTree2.default.documentFragment) {
            inner = _buildCommon2.default.makeSpan([], [inner], options);
        }

        // Calculate the minimum size for the \surd delimiter
        var metrics = options.fontMetrics();
        var theta = metrics.defaultRuleThickness;

        var phi = theta;
        if (options.style.id < _Style2.default.TEXT.id) {
            phi = options.fontMetrics().xHeight;
        }

        // Calculate the clearance between the body and line
        var lineClearance = theta + phi / 4;

        var minDelimiterHeight = (inner.height + inner.depth + lineClearance + theta) * options.sizeMultiplier;

        // Create a sqrt SVG of the required minimum size

        var _delimiter$sqrtImage = _delimiter2.default.sqrtImage(minDelimiterHeight, options),
            img = _delimiter$sqrtImage.span,
            ruleWidth = _delimiter$sqrtImage.ruleWidth;

        var delimDepth = img.height - ruleWidth;

        // Adjust the clearance based on the delimiter size
        if (delimDepth > inner.height + inner.depth + lineClearance) {
            lineClearance = (lineClearance + delimDepth - inner.height - inner.depth) / 2;
        }

        // Shift the sqrt image
        var imgShift = img.height - inner.height - lineClearance - ruleWidth;

        inner.style.paddingLeft = img.advanceWidth + "em";

        // Overlay the image and the argument.
        var body = _buildCommon2.default.makeVList({
            positionType: "firstBaseline",
            children: [{ type: "elem", elem: inner, wrapperClasses: ["svg-align"] }, { type: "kern", size: -(inner.height + imgShift) }, { type: "elem", elem: img }, { type: "kern", size: ruleWidth }]
        }, options);

        if (!group.value.index) {
            return _buildCommon2.default.makeSpan(["mord", "sqrt"], [body], options);
        } else {
            // Handle the optional root index

            // The index is always in scriptscript style
            var newOptions = options.havingStyle(_Style2.default.SCRIPTSCRIPT);
            var rootm = html.buildGroup(group.value.index, newOptions, options);

            // The amount the index is shifted by. This is taken from the TeX
            // source, in the definition of `\r@@t`.
            var toShift = 0.6 * (body.height - body.depth);

            // Build a VList with the superscript shifted up correctly
            var rootVList = _buildCommon2.default.makeVList({
                positionType: "shift",
                positionData: -toShift,
                children: [{ type: "elem", elem: rootm }]
            }, options);
            // Add a class surrounding it so we can add on the appropriate
            // kerning
            var rootVListWrap = _buildCommon2.default.makeSpan(["root"], [rootVList]);

            return _buildCommon2.default.makeSpan(["mord", "sqrt"], [rootVListWrap, body], options);
        }
    },
    mathmlBuilder: function mathmlBuilder(group, options) {
        var node = void 0;
        if (group.value.index) {
            node = new _mathMLTree2.default.MathNode("mroot", [mml.buildGroup(group.value.body, options), mml.buildGroup(group.value.index, options)]);
        } else {
            node = new _mathMLTree2.default.MathNode("msqrt", [mml.buildGroup(group.value.body, options)]);
        }

        return node;
    }
});

},{"../Style":89,"../buildCommon":91,"../buildHTML":92,"../buildMathML":93,"../defineFunction":96,"../delimiter":97,"../domTree":98,"../mathMLTree":124}],120:[function(require,module,exports){
"use strict";

var _defineFunction = require("../defineFunction");

var _defineFunction2 = _interopRequireDefault(_defineFunction);

var _buildCommon = require("../buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _mathMLTree = require("../mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _buildHTML = require("../buildHTML");

var html = _interopRequireWildcard(_buildHTML);

var _buildMathML = require("../buildMathML");

var mml = _interopRequireWildcard(_buildMathML);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Non-mathy text, possibly in a font
var textFontFamilies = {
    "\\text": undefined, "\\textrm": "textrm", "\\textsf": "textsf",
    "\\texttt": "texttt", "\\textnormal": "textrm"
};


var textFontWeights = {
    "\\textbf": "textbf"
};

var textFontShapes = {
    "\\textit": "textit"
};

(0, _defineFunction2.default)({
    type: "text",
    names: [
    // Font families
    "\\text", "\\textrm", "\\textsf", "\\texttt", "\\textnormal",
    // Font weights
    "\\textbf",
    // Font Shapes
    "\\textit"],
    props: {
        numArgs: 1,
        argTypes: ["text"],
        greediness: 2,
        allowedInText: true
    },
    handler: function handler(context, args) {
        var body = args[0];
        return {
            type: "text",
            body: (0, _defineFunction.ordargument)(body),
            font: context.funcName
        };
    },
    htmlBuilder: function htmlBuilder(group, options) {
        var font = group.value.font;
        // Checks if the argument is a font family or a font style.
        var newOptions = void 0;
        if (textFontFamilies[font]) {
            newOptions = options.withFontFamily(textFontFamilies[font]);
        } else if (textFontWeights[font]) {
            newOptions = options.withFontWeight(textFontWeights[font]);
        } else {
            newOptions = options.withFontShape(textFontShapes[font]);
        }
        var inner = html.buildExpression(group.value.body, newOptions, true);
        _buildCommon2.default.tryCombineChars(inner);
        return _buildCommon2.default.makeSpan(["mord", "text"], inner, newOptions);
    },
    mathmlBuilder: function mathmlBuilder(group, options) {
        var body = group.value.body;

        // Convert each element of the body into MathML, and combine consecutive
        // <mtext> outputs into a single <mtext> tag.  In this way, we don't
        // nest non-text items (e.g., $nested-math$) within an <mtext>.
        var inner = [];
        var currentText = null;
        for (var i = 0; i < body.length; i++) {
            var _group = mml.buildGroup(body[i], options);
            if (_group.type === 'mtext' && currentText != null) {
                Array.prototype.push.apply(currentText.children, _group.children);
            } else {
                inner.push(_group);
                if (_group.type === 'mtext') {
                    currentText = _group;
                }
            }
        }

        // If there is a single tag in the end (presumably <mtext>),
        // just return it.  Otherwise, wrap them in an <mrow>.
        if (inner.length === 1) {
            return inner[0];
        } else {
            return new _mathMLTree2.default.MathNode("mrow", inner);
        }
    }
});

},{"../buildCommon":91,"../buildHTML":92,"../buildMathML":93,"../defineFunction":96,"../mathMLTree":124}],121:[function(require,module,exports){
"use strict";

var _defineFunction = require("../defineFunction");

var _defineFunction2 = _interopRequireDefault(_defineFunction);

var _buildCommon = require("../buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _mathMLTree = require("../mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _buildHTML = require("../buildHTML");

var html = _interopRequireWildcard(_buildHTML);

var _buildMathML = require("../buildMathML");

var mml = _interopRequireWildcard(_buildMathML);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _defineFunction2.default)({
    type: "underline",
    names: ["\\underline"],
    props: {
        numArgs: 1
    },
    handler: function handler(context, args) {
        var body = args[0];
        return {
            type: "underline",
            body: body
        };
    },
    htmlBuilder: function htmlBuilder(group, options) {
        // Underlines are handled in the TeXbook pg 443, Rule 10.
        // Build the inner group.
        var innerGroup = html.buildGroup(group.value.body, options);

        // Create the line to go below the body
        var line = _buildCommon2.default.makeLineSpan("underline-line", options);

        // Generate the vlist, with the appropriate kerns
        var vlist = _buildCommon2.default.makeVList({
            positionType: "top",
            positionData: innerGroup.height,
            children: [
            // The SVG image is 5x as tall as the line.
            // The bottom 2/5 of the image is blank and acts like a kern.
            // So we omit the kern that would otherwise go at the bottom.
            { type: "elem", elem: line }, { type: "kern", size: 5 * line.height }, { type: "elem", elem: innerGroup }]
        }, options);

        return _buildCommon2.default.makeSpan(["mord", "underline"], [vlist], options);
    },
    mathmlBuilder: function mathmlBuilder(group, options) {
        var operator = new _mathMLTree2.default.MathNode("mo", [new _mathMLTree2.default.TextNode("\u203E")]);
        operator.setAttribute("stretchy", "true");

        var node = new _mathMLTree2.default.MathNode("munder", [mml.buildGroup(group.value.body, options), operator]);
        node.setAttribute("accentunder", "true");

        return node;
    }
});

},{"../buildCommon":91,"../buildHTML":92,"../buildMathML":93,"../defineFunction":96,"../mathMLTree":124}],122:[function(require,module,exports){
"use strict";

var _defineFunction = require("../defineFunction");

var _defineFunction2 = _interopRequireDefault(_defineFunction);

var _buildCommon = require("../buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _mathMLTree = require("../mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _ParseError = require("../ParseError");

var _ParseError2 = _interopRequireDefault(_ParseError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _defineFunction2.default)({
    type: "verb",
    names: ["\\verb"],
    props: {
        numArgs: 0,
        allowedInText: true
    },
    handler: function handler(context, args, optArgs) {
        // \verb and \verb* are dealt with directly in Parser.js.
        // If we end up here, it's because of a failure to match the two delimiters
        // in the regex in Lexer.js.  LaTeX raises the following error when \verb is
        // terminated by end of line (or file).
        throw new _ParseError2.default("\\verb ended by end of line instead of matching delimiter");
    },
    htmlBuilder: function htmlBuilder(group, options) {
        var text = _buildCommon2.default.makeVerb(group, options);
        var body = [];
        // \verb enters text mode and therefore is sized like \textstyle
        var newOptions = options.havingStyle(options.style.text());
        for (var i = 0; i < text.length; i++) {
            if (text[i] === '\xA0') {
                // spaces appear as nonbreaking space
                // The space character isn't in the Typewriter-Regular font,
                // so we implement it as a kern of the same size as a character.
                // 0.525 is the width of a texttt character in LaTeX.
                // It automatically gets scaled by the font size.
                var rule = _buildCommon2.default.makeSpan(["mord", "rule"], [], newOptions);
                rule.style.marginLeft = "0.525em";
                body.push(rule);
            } else {
                body.push(_buildCommon2.default.makeSymbol(text[i], "Typewriter-Regular", group.mode, newOptions, ["mathtt"]));
            }
        }
        _buildCommon2.default.tryCombineChars(body);
        return _buildCommon2.default.makeSpan(["mord", "text"].concat(newOptions.sizingClasses(options)),
        // tryCombinChars expects CombinableDomNode[] while makeSpan expects
        // DomChildNode[].
        // $FlowFixMe: CombinableDomNode[] is not compatible with DomChildNode[]
        body, newOptions);
    },
    mathmlBuilder: function mathmlBuilder(group, options) {
        var text = new _mathMLTree2.default.TextNode(_buildCommon2.default.makeVerb(group, options));
        var node = new _mathMLTree2.default.MathNode("mtext", [text]);
        node.setAttribute("mathvariant", _buildCommon2.default.fontMap["mathtt"].variant);
        return node;
    }
});

},{"../ParseError":84,"../buildCommon":91,"../defineFunction":96,"../mathMLTree":124}],123:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.defineMacro = defineMacro;

var _fontMetricsData = require("./fontMetricsData");

var _fontMetricsData2 = _interopRequireDefault(_fontMetricsData);

var _symbols = require("./symbols");

var _symbols2 = _interopRequireDefault(_symbols);

var _utils = require("./utils");

var _utils2 = _interopRequireDefault(_utils);

var _Token = require("./Token");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Provides context to macros defined by functions. Implemented by
 * MacroExpander.
 */


/** Macro tokens (in reverse order). */

/**
 * Predefined macros for KaTeX.
 * This can be used to define some commands in terms of others.
 */

var builtinMacros = {};
exports.default = builtinMacros;

// This function might one day accept an additional argument and do more things.

function defineMacro(name, body) {
    builtinMacros[name] = body;
}

//////////////////////////////////////////////////////////////////////
// macro tools

// LaTeX's \@firstoftwo{#1}{#2} expands to #1, skipping #2
// TeX source: \long\def\@firstoftwo#1#2{#1}
defineMacro("\\@firstoftwo", function (context) {
    var args = context.consumeArgs(2);
    return { tokens: args[0], numArgs: 0 };
});

// LaTeX's \@secondoftwo{#1}{#2} expands to #2, skipping #1
// TeX source: \long\def\@secondoftwo#1#2{#2}
defineMacro("\\@secondoftwo", function (context) {
    var args = context.consumeArgs(2);
    return { tokens: args[1], numArgs: 0 };
});

// LaTeX's \@ifnextchar{#1}{#2}{#3} looks ahead to the next (unexpanded)
// symbol.  If it matches #1, then the macro expands to #2; otherwise, #3.
// Note, however, that it does not consume the next symbol in either case.
defineMacro("\\@ifnextchar", function (context) {
    var args = context.consumeArgs(3); // symbol, if, else
    var nextToken = context.future();
    if (args[0].length === 1 && args[0][0].text === nextToken.text) {
        return { tokens: args[1], numArgs: 0 };
    } else {
        return { tokens: args[2], numArgs: 0 };
    }
});

// LaTeX's \@ifstar{#1}{#2} looks ahead to the next (unexpanded) symbol.
// If it is `*`, then it consumes the symbol, and the macro expands to #1;
// otherwise, the macro expands to #2 (without consuming the symbol).
// TeX source: \def\@ifstar#1{\@ifnextchar *{\@firstoftwo{#1}}}
defineMacro("\\@ifstar", "\\@ifnextchar *{\\@firstoftwo{#1}}");

// LaTeX's \TextOrMath{#1}{#2} expands to #1 in text mode, #2 in math mode
defineMacro("\\TextOrMath", function (context) {
    var args = context.consumeArgs(2);
    if (context.mode === 'text') {
        return { tokens: args[0], numArgs: 0 };
    } else {
        return { tokens: args[1], numArgs: 0 };
    }
});

//////////////////////////////////////////////////////////////////////
// basics
defineMacro("\\bgroup", "{");
defineMacro("\\egroup", "}");
defineMacro("\\begingroup", "{");
defineMacro("\\endgroup", "}");

// Unicode double-struck letters
defineMacro("\u2102", "\\mathbb{C}");
defineMacro("\u210D", "\\mathbb{H}");
defineMacro("\u2115", "\\mathbb{N}");
defineMacro("\u2119", "\\mathbb{P}");
defineMacro("\u211A", "\\mathbb{Q}");
defineMacro("\u211D", "\\mathbb{R}");
defineMacro("\u2124", "\\mathbb{Z}");

// Unicode middle dot
// The KaTeX fonts do not contain U+00B7. Instead, \cdotp displays
// the dot at U+22C5 and gives it punct spacing.
defineMacro("\xB7", "\\cdotp");

// \llap and \rlap render their contents in text mode
defineMacro("\\llap", "\\mathllap{\\textrm{#1}}");
defineMacro("\\rlap", "\\mathrlap{\\textrm{#1}}");
defineMacro("\\clap", "\\mathclap{\\textrm{#1}}");

//////////////////////////////////////////////////////////////////////
// amsmath.sty
// http://mirrors.concertpass.com/tex-archive/macros/latex/required/amsmath/amsmath.pdf

// \def\overset#1#2{\binrel@{#2}\binrel@@{\mathop{\kern\z@#2}\limits^{#1}}}
defineMacro("\\overset", "\\mathop{#2}\\limits^{#1}");
defineMacro("\\underset", "\\mathop{#2}\\limits_{#1}");

// \newcommand{\boxed}[1]{\fbox{\m@th$\displaystyle#1$}}
defineMacro("\\boxed", "\\fbox{\\displaystyle{#1}}");

// \def\iff{\DOTSB\;\Longleftrightarrow\;}
// \def\implies{\DOTSB\;\Longrightarrow\;}
// \def\impliedby{\DOTSB\;\Longleftarrow\;}
defineMacro("\\iff", "\\DOTSB\\;\\Longleftrightarrow\\;");
defineMacro("\\implies", "\\DOTSB\\;\\Longrightarrow\\;");
defineMacro("\\impliedby", "\\DOTSB\\;\\Longleftarrow\\;");

// AMSMath's automatic \dots, based on \mdots@@ macro.
var dotsByToken = {
    ',': '\\dotsc',
    '\\not': '\\dotsb',
    // \keybin@ checks for the following:
    '+': '\\dotsb',
    '=': '\\dotsb',
    '<': '\\dotsb',
    '>': '\\dotsb',
    '-': '\\dotsb',
    '*': '\\dotsb',
    ':': '\\dotsb',
    // Symbols whose definition starts with \DOTSB:
    '\\DOTSB': '\\dotsb',
    '\\coprod': '\\dotsb',
    '\\bigvee': '\\dotsb',
    '\\bigwedge': '\\dotsb',
    '\\biguplus': '\\dotsb',
    '\\bigcap': '\\dotsb',
    '\\bigcup': '\\dotsb',
    '\\prod': '\\dotsb',
    '\\sum': '\\dotsb',
    '\\bigotimes': '\\dotsb',
    '\\bigoplus': '\\dotsb',
    '\\bigodot': '\\dotsb',
    '\\bigsqcup': '\\dotsb',
    '\\implies': '\\dotsb',
    '\\impliedby': '\\dotsb',
    '\\And': '\\dotsb',
    '\\longrightarrow': '\\dotsb',
    '\\Longrightarrow': '\\dotsb',
    '\\longleftarrow': '\\dotsb',
    '\\Longleftarrow': '\\dotsb',
    '\\longleftrightarrow': '\\dotsb',
    '\\Longleftrightarrow': '\\dotsb',
    '\\mapsto': '\\dotsb',
    '\\longmapsto': '\\dotsb',
    '\\hookrightarrow': '\\dotsb',
    '\\iff': '\\dotsb',
    '\\doteq': '\\dotsb',
    // Symbols whose definition starts with \mathbin:
    '\\mathbin': '\\dotsb',
    '\\bmod': '\\dotsb',
    // Symbols whose definition starts with \mathrel:
    '\\mathrel': '\\dotsb',
    '\\relbar': '\\dotsb',
    '\\Relbar': '\\dotsb',
    '\\xrightarrow': '\\dotsb',
    '\\xleftarrow': '\\dotsb',
    // Symbols whose definition starts with \DOTSI:
    '\\DOTSI': '\\dotsi',
    '\\int': '\\dotsi',
    '\\oint': '\\dotsi',
    '\\iint': '\\dotsi',
    '\\iiint': '\\dotsi',
    '\\iiiint': '\\dotsi',
    '\\idotsint': '\\dotsi',
    // Symbols whose definition starts with \DOTSX:
    '\\DOTSX': '\\dotsx'
};

defineMacro("\\dots", function (context) {
    // TODO: If used in text mode, should expand to \textellipsis.
    // However, in KaTeX, \textellipsis and \ldots behave the same
    // (in text mode), and it's unlikely we'd see any of the math commands
    // that affect the behavior of \dots when in text mode.  So fine for now
    // (until we support \ifmmode ... \else ... \fi).
    var thedots = '\\dotso';
    var next = context.expandAfterFuture().text;
    if (next in dotsByToken) {
        thedots = dotsByToken[next];
    } else if (next.substr(0, 4) === '\\not') {
        thedots = '\\dotsb';
    } else if (next in _symbols2.default.math) {
        if (_utils2.default.contains(['bin', 'rel'], _symbols2.default.math[next].group)) {
            thedots = '\\dotsb';
        }
    }
    return thedots;
});

var spaceAfterDots = {
    // \rightdelim@ checks for the following:
    ')': true,
    ']': true,
    '\\rbrack': true,
    '\\}': true,
    '\\rbrace': true,
    '\\rangle': true,
    '\\rceil': true,
    '\\rfloor': true,
    '\\rgroup': true,
    '\\rmoustache': true,
    '\\right': true,
    '\\bigr': true,
    '\\biggr': true,
    '\\Bigr': true,
    '\\Biggr': true,
    // \extra@ also tests for the following:
    '$': true,
    // \extrap@ checks for the following:
    ';': true,
    '.': true,
    ',': true
};

defineMacro("\\dotso", function (context) {
    var next = context.future().text;
    if (next in spaceAfterDots) {
        return "\\ldots\\,";
    } else {
        return "\\ldots";
    }
});

defineMacro("\\dotsc", function (context) {
    var next = context.future().text;
    // \dotsc uses \extra@ but not \extrap@, instead specially checking for
    // ';' and '.', but doesn't check for ','.
    if (next in spaceAfterDots && next !== ',') {
        return "\\ldots\\,";
    } else {
        return "\\ldots";
    }
});

defineMacro("\\cdots", function (context) {
    var next = context.future().text;
    if (next in spaceAfterDots) {
        return "\\@cdots\\,";
    } else {
        return "\\@cdots";
    }
});

defineMacro("\\dotsb", "\\cdots");
defineMacro("\\dotsm", "\\cdots");
defineMacro("\\dotsi", "\\!\\cdots");
// amsmath doesn't actually define \dotsx, but \dots followed by a macro
// starting with \DOTSX implies \dotso, and then \extra@ detects this case
// and forces the added `\,`.
defineMacro("\\dotsx", "\\ldots\\,");

// \let\DOTSI\relax
// \let\DOTSB\relax
// \let\DOTSX\relax
defineMacro("\\DOTSI", "\\relax");
defineMacro("\\DOTSB", "\\relax");
defineMacro("\\DOTSX", "\\relax");

// http://texdoc.net/texmf-dist/doc/latex/amsmath/amsmath.pdf
defineMacro("\\thinspace", "\\,"); //   \let\thinspace\,
defineMacro("\\medspace", "\\:"); //   \let\medspace\:
defineMacro("\\thickspace", "\\;"); //   \let\thickspace\;

//////////////////////////////////////////////////////////////////////
// LaTeX source2e

// \def\TeX{T\kern-.1667em\lower.5ex\hbox{E}\kern-.125emX\@}
// TODO: Doesn't normally work in math mode because \@ fails.  KaTeX doesn't
// support \@ yet, so that's omitted, and we add \text so that the result
// doesn't look funny in math mode.
defineMacro("\\TeX", "\\textrm{T\\kern-.1667em\\raisebox{-.5ex}{E}\\kern-.125emX}");

// \DeclareRobustCommand{\LaTeX}{L\kern-.36em%
//         {\sbox\z@ T%
//          \vbox to\ht\z@{\hbox{\check@mathfonts
//                               \fontsize\sf@size\z@
//                               \math@fontsfalse\selectfont
//                               A}%
//                         \vss}%
//         }%
//         \kern-.15em%
//         \TeX}
// This code aligns the top of the A with the T (from the perspective of TeX's
// boxes, though visually the A appears to extend above slightly).
// We compute the corresponding \raisebox when A is rendered at \scriptsize,
// which is size3, which has a scale factor of 0.7 (see Options.js).
var latexRaiseA = _fontMetricsData2.default['Main-Regular']["T".charCodeAt(0)][1] - 0.7 * _fontMetricsData2.default['Main-Regular']["A".charCodeAt(0)][1] + "em";
defineMacro("\\LaTeX", "\\textrm{L\\kern-.36em\\raisebox{" + latexRaiseA + "}{\\scriptsize A}" + "\\kern-.15em\\TeX}");

// New KaTeX logo based on tweaking LaTeX logo
defineMacro("\\KaTeX", "\\textrm{K\\kern-.17em\\raisebox{" + latexRaiseA + "}{\\scriptsize A}" + "\\kern-.15em\\TeX}");

// \DeclareRobustCommand\hspace{\@ifstar\@hspacer\@hspace}
// \def\@hspace#1{\hskip  #1\relax}
// KaTeX doesn't do line breaks, so \hspace and \hspace* are the same as \kern
defineMacro("\\hspace", "\\@ifstar\\kern\\kern");

//////////////////////////////////////////////////////////////////////
// mathtools.sty

//\providecommand\ordinarycolon{:}
defineMacro("\\ordinarycolon", ":");
//\def\vcentcolon{\mathrel{\mathop\ordinarycolon}}
//TODO(edemaine): Not yet centered. Fix via \raisebox or #726
defineMacro("\\vcentcolon", "\\mathrel{\\mathop\\ordinarycolon}");
// \providecommand*\dblcolon{\vcentcolon\mathrel{\mkern-.9mu}\vcentcolon}
defineMacro("\\dblcolon", "\\vcentcolon\\mathrel{\\mkern-.9mu}\\vcentcolon");
// \providecommand*\coloneqq{\vcentcolon\mathrel{\mkern-1.2mu}=}
defineMacro("\\coloneqq", "\\vcentcolon\\mathrel{\\mkern-1.2mu}=");
// \providecommand*\Coloneqq{\dblcolon\mathrel{\mkern-1.2mu}=}
defineMacro("\\Coloneqq", "\\dblcolon\\mathrel{\\mkern-1.2mu}=");
// \providecommand*\coloneq{\vcentcolon\mathrel{\mkern-1.2mu}\mathrel{-}}
defineMacro("\\coloneq", "\\vcentcolon\\mathrel{\\mkern-1.2mu}\\mathrel{-}");
// \providecommand*\Coloneq{\dblcolon\mathrel{\mkern-1.2mu}\mathrel{-}}
defineMacro("\\Coloneq", "\\dblcolon\\mathrel{\\mkern-1.2mu}\\mathrel{-}");
// \providecommand*\eqqcolon{=\mathrel{\mkern-1.2mu}\vcentcolon}
defineMacro("\\eqqcolon", "=\\mathrel{\\mkern-1.2mu}\\vcentcolon");
// \providecommand*\Eqqcolon{=\mathrel{\mkern-1.2mu}\dblcolon}
defineMacro("\\Eqqcolon", "=\\mathrel{\\mkern-1.2mu}\\dblcolon");
// \providecommand*\eqcolon{\mathrel{-}\mathrel{\mkern-1.2mu}\vcentcolon}
defineMacro("\\eqcolon", "\\mathrel{-}\\mathrel{\\mkern-1.2mu}\\vcentcolon");
// \providecommand*\Eqcolon{\mathrel{-}\mathrel{\mkern-1.2mu}\dblcolon}
defineMacro("\\Eqcolon", "\\mathrel{-}\\mathrel{\\mkern-1.2mu}\\dblcolon");
// \providecommand*\colonapprox{\vcentcolon\mathrel{\mkern-1.2mu}\approx}
defineMacro("\\colonapprox", "\\vcentcolon\\mathrel{\\mkern-1.2mu}\\approx");
// \providecommand*\Colonapprox{\dblcolon\mathrel{\mkern-1.2mu}\approx}
defineMacro("\\Colonapprox", "\\dblcolon\\mathrel{\\mkern-1.2mu}\\approx");
// \providecommand*\colonsim{\vcentcolon\mathrel{\mkern-1.2mu}\sim}
defineMacro("\\colonsim", "\\vcentcolon\\mathrel{\\mkern-1.2mu}\\sim");
// \providecommand*\Colonsim{\dblcolon\mathrel{\mkern-1.2mu}\sim}
defineMacro("\\Colonsim", "\\dblcolon\\mathrel{\\mkern-1.2mu}\\sim");

//////////////////////////////////////////////////////////////////////
// colonequals.sty

// Alternate names for mathtools's macros:
defineMacro("\\ratio", "\\vcentcolon");
defineMacro("\\coloncolon", "\\dblcolon");
defineMacro("\\colonequals", "\\coloneqq");
defineMacro("\\coloncolonequals", "\\Coloneqq");
defineMacro("\\equalscolon", "\\eqqcolon");
defineMacro("\\equalscoloncolon", "\\Eqqcolon");
defineMacro("\\colonminus", "\\coloneq");
defineMacro("\\coloncolonminus", "\\Coloneq");
defineMacro("\\minuscolon", "\\eqcolon");
defineMacro("\\minuscoloncolon", "\\Eqcolon");
// \colonapprox name is same in mathtools and colonequals.
defineMacro("\\coloncolonapprox", "\\Colonapprox");
// \colonsim name is same in mathtools and colonequals.
defineMacro("\\coloncolonsim", "\\Colonsim");

// Additional macros, implemented by analogy with mathtools definitions:
defineMacro("\\simcolon", "\\sim\\mathrel{\\mkern-1.2mu}\\vcentcolon");
defineMacro("\\simcoloncolon", "\\sim\\mathrel{\\mkern-1.2mu}\\dblcolon");
defineMacro("\\approxcolon", "\\approx\\mathrel{\\mkern-1.2mu}\\vcentcolon");
defineMacro("\\approxcoloncolon", "\\approx\\mathrel{\\mkern-1.2mu}\\dblcolon");

// Present in newtxmath, pxfonts and txfonts
// TODO: The unicode character U+220C ∌ should be added to the font, and this
//       macro turned into a propper defineSymbol in symbols.js. That way, the
//       MathML result will be much cleaner.
defineMacro("\\notni", "\\not\\ni");
defineMacro("\\limsup", "\\DOTSB\\mathop{\\operatorname{lim\\,sup}}\\limits");
defineMacro("\\liminf", "\\DOTSB\\mathop{\\operatorname{lim\\,inf}}\\limits");

},{"./Token":90,"./fontMetricsData":102,"./symbols":128,"./utils":133}],124:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = require("./utils");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This node represents a general purpose MathML node of any type. The
 * constructor requires the type of node to create (for example, `"mo"` or
 * `"mspace"`, corresponding to `<mo>` and `<mspace>` tags).
 */


/**
 * MathML node types used in KaTeX. For a complete list of MathML nodes, see
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element.
 */
var MathNode = function () {
    function MathNode(type, children) {
        (0, _classCallCheck3.default)(this, MathNode);

        this.type = type;
        this.attributes = {};
        this.children = children || [];
    }

    /**
     * Sets an attribute on a MathML node. MathML depends on attributes to convey a
     * semantic content, so this is used heavily.
     */


    (0, _createClass3.default)(MathNode, [{
        key: "setAttribute",
        value: function setAttribute(name, value) {
            this.attributes[name] = value;
        }

        /**
         * Converts the math node into a MathML-namespaced DOM element.
         */

    }, {
        key: "toNode",
        value: function toNode() {
            var node = document.createElementNS("http://www.w3.org/1998/Math/MathML", this.type);

            for (var attr in this.attributes) {
                if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                    node.setAttribute(attr, this.attributes[attr]);
                }
            }

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(this.children), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var child = _step.value;

                    node.appendChild(child.toNode());
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return node;
        }

        /**
         * Converts the math node into an HTML markup string.
         */

    }, {
        key: "toMarkup",
        value: function toMarkup() {
            var markup = "<" + this.type;

            // Add the attributes
            for (var attr in this.attributes) {
                if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                    markup += " " + attr + "=\"";
                    markup += _utils2.default.escape(this.attributes[attr]);
                    markup += "\"";
                }
            }

            markup += ">";

            for (var i = 0; i < this.children.length; i++) {
                markup += this.children[i].toMarkup();
            }

            markup += "</" + this.type + ">";

            return markup;
        }

        /**
         * Converts the math node into a string, similar to innerText.
         */

    }, {
        key: "toText",
        value: function toText() {
            if (this.type === "mspace") {
                if (this.attributes.width === "0.16667em") {
                    return "\u2006";
                } else {
                    // TODO: Use other space characters for different widths.
                    // https://github.com/Khan/KaTeX/issues/1036
                    return " ";
                }
            }
            return this.children.map(function (child) {
                return child.toText();
            }).join("");
        }
    }]);
    return MathNode;
}();

/**
 * This node represents a piece of text.
 */

/**
 * These objects store data about MathML nodes. This is the MathML equivalent
 * of the types in domTree.js. Since MathML handles its own rendering, and
 * since we're mainly using MathML to improve accessibility, we don't manage
 * any of the styling state that the plain DOM nodes do.
 *
 * The `toNode` and `toMarkup` functions work simlarly to how they do in
 * domTree.js, creating namespaced DOM nodes and HTML text markup respectively.
 */

var TextNode = function () {
    function TextNode(text) {
        (0, _classCallCheck3.default)(this, TextNode);

        this.text = text;
    }

    /**
     * Converts the text node into a DOM text node.
     */


    (0, _createClass3.default)(TextNode, [{
        key: "toNode",
        value: function toNode() {
            return document.createTextNode(this.text);
        }

        /**
         * Converts the text node into HTML markup (which is just the text itself).
         */

    }, {
        key: "toMarkup",
        value: function toMarkup() {
            return _utils2.default.escape(this.text);
        }

        /**
         * Converts the text node into a string (which is just the text iteself).
         */

    }, {
        key: "toText",
        value: function toText() {
            return this.text;
        }
    }]);
    return TextNode;
}();

exports.default = {
    MathNode: MathNode,
    TextNode: TextNode
};

},{"./utils":133,"babel-runtime/core-js/get-iterator":3,"babel-runtime/helpers/classCallCheck":8,"babel-runtime/helpers/createClass":9}],125:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Parser = require("./Parser");

var _Parser2 = _interopRequireDefault(_Parser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Parses an expression using a Parser, then returns the parsed result.
 */
var parseTree = function parseTree(toParse, settings) {
  if (!(typeof toParse === 'string' || toParse instanceof String)) {
    throw new TypeError('KaTeX can only parse string typed expression');
  }
  var parser = new _Parser2.default(toParse, settings);

  return parser.parse();
};
/**
 * Provides a single function for parsing an expression using a Parser
 * TODO(emily): Remove this
 */

exports.default = parseTree;

},{"./Parser":86}],126:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _domTree = require("./domTree");

var _domTree2 = _interopRequireDefault(_domTree);

var _buildCommon = require("./buildCommon");

var _buildCommon2 = _interopRequireDefault(_buildCommon);

var _mathMLTree = require("./mathMLTree");

var _mathMLTree2 = _interopRequireDefault(_mathMLTree);

var _utils = require("./utils");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This file provides support to buildMathML.js and buildHTML.js
 * for stretchy wide elements rendered from SVG files
 * and other CSS trickery.
 */

var stretchyCodePoint = {
    widehat: "^",
    widetilde: "~",
    utilde: "~",
    overleftarrow: "\u2190",
    underleftarrow: "\u2190",
    xleftarrow: "\u2190",
    overrightarrow: "\u2192",
    underrightarrow: "\u2192",
    xrightarrow: "\u2192",
    underbrace: "\u23B5",
    overbrace: "\u23DE",
    overleftrightarrow: "\u2194",
    underleftrightarrow: "\u2194",
    xleftrightarrow: "\u2194",
    Overrightarrow: "\u21D2",
    xRightarrow: "\u21D2",
    overleftharpoon: "\u21BC",
    xleftharpoonup: "\u21BC",
    overrightharpoon: "\u21C0",
    xrightharpoonup: "\u21C0",
    xLeftarrow: "\u21D0",
    xLeftrightarrow: "\u21D4",
    xhookleftarrow: "\u21A9",
    xhookrightarrow: "\u21AA",
    xmapsto: "\u21A6",
    xrightharpoondown: "\u21C1",
    xleftharpoondown: "\u21BD",
    xrightleftharpoons: "\u21CC",
    xleftrightharpoons: "\u21CB",
    xtwoheadleftarrow: "\u219E",
    xtwoheadrightarrow: "\u21A0",
    xlongequal: "=",
    xtofrom: "\u21C4"
};

var mathMLnode = function mathMLnode(label) {
    var node = new _mathMLTree2.default.MathNode("mo", [new _mathMLTree2.default.TextNode(stretchyCodePoint[label.substr(1)])]);
    node.setAttribute("stretchy", "true");
    return node;
};

// Many of the KaTeX SVG images have been adapted from glyphs in KaTeX fonts.
// Copyright (c) 2009-2010, Design Science, Inc. (<www.mathjax.org>)
// Copyright (c) 2014-2017 Khan Academy (<www.khanacademy.org>)
// Licensed under the SIL Open Font License, Version 1.1.
// See \nhttp://scripts.sil.org/OFL

// Very Long SVGs
//    Many of the KaTeX stretchy wide elements use a long SVG image and an
//    overflow: hidden tactic to achieve a stretchy image while avoiding
//    distortion of arrowheads or brace corners.

//    The SVG typically contains a very long (400 em) arrow.

//    The SVG is in a container span that has overflow: hidden, so the span
//    acts like a window that exposes only part of the  SVG.

//    The SVG always has a longer, thinner aspect ratio than the container span.
//    After the SVG fills 100% of the height of the container span,
//    there is a long arrow shaft left over. That left-over shaft is not shown.
//    Instead, it is sliced off because the span's CSS has overflow: hidden.

//    Thus, the reader sees an arrow that matches the subject matter width
//    without distortion.

//    Some functions, such as \cancel, need to vary their aspect ratio. These
//    functions do not get the overflow SVG treatment.

// Second Brush Stroke
//    Low resolution monitors struggle to display images in fine detail.
//    So browsers apply anti-aliasing. A long straight arrow shaft therefore
//    will sometimes appear as if it has a blurred edge.

//    To mitigate this, these SVG files contain a second "brush-stroke" on the
//    arrow shafts. That is, a second long thin rectangular SVG path has been
//    written directly on top of each arrow shaft. This reinforcement causes
//    some of the screen pixels to display as black instead of the anti-aliased
//    gray pixel that a  single path would generate. So we get arrow shafts
//    whose edges appear to be sharper.

// In the katexImagesData object just below, the dimensions all
// correspond to path geometry inside the relevant SVG.
// For example, \overrightarrow uses the same arrowhead as glyph U+2192
// from the KaTeX Main font. The scaling factor is 1000.
// That is, inside the font, that arrowhead is 522 units tall, which
// corresponds to 0.522 em inside the document.

var katexImagesData = {
    //   path(s), minWidth, height, align
    overrightarrow: [["rightarrow"], 0.888, 522, "xMaxYMin"],
    overleftarrow: [["leftarrow"], 0.888, 522, "xMinYMin"],
    underrightarrow: [["rightarrow"], 0.888, 522, "xMaxYMin"],
    underleftarrow: [["leftarrow"], 0.888, 522, "xMinYMin"],
    xrightarrow: [["rightarrow"], 1.469, 522, "xMaxYMin"],
    xleftarrow: [["leftarrow"], 1.469, 522, "xMinYMin"],
    Overrightarrow: [["doublerightarrow"], 0.888, 560, "xMaxYMin"],
    xRightarrow: [["doublerightarrow"], 1.526, 560, "xMaxYMin"],
    xLeftarrow: [["doubleleftarrow"], 1.526, 560, "xMinYMin"],
    overleftharpoon: [["leftharpoon"], 0.888, 522, "xMinYMin"],
    xleftharpoonup: [["leftharpoon"], 0.888, 522, "xMinYMin"],
    xleftharpoondown: [["leftharpoondown"], 0.888, 522, "xMinYMin"],
    overrightharpoon: [["rightharpoon"], 0.888, 522, "xMaxYMin"],
    xrightharpoonup: [["rightharpoon"], 0.888, 522, "xMaxYMin"],
    xrightharpoondown: [["rightharpoondown"], 0.888, 522, "xMaxYMin"],
    xlongequal: [["longequal"], 0.888, 334, "xMinYMin"],
    xtwoheadleftarrow: [["twoheadleftarrow"], 0.888, 334, "xMinYMin"],
    xtwoheadrightarrow: [["twoheadrightarrow"], 0.888, 334, "xMaxYMin"],

    overleftrightarrow: [["leftarrow", "rightarrow"], 0.888, 522],
    overbrace: [["leftbrace", "midbrace", "rightbrace"], 1.6, 548],
    underbrace: [["leftbraceunder", "midbraceunder", "rightbraceunder"], 1.6, 548],
    underleftrightarrow: [["leftarrow", "rightarrow"], 0.888, 522],
    xleftrightarrow: [["leftarrow", "rightarrow"], 1.75, 522],
    xLeftrightarrow: [["doubleleftarrow", "doublerightarrow"], 1.75, 560],
    xrightleftharpoons: [["leftharpoondownplus", "rightharpoonplus"], 1.75, 716],
    xleftrightharpoons: [["leftharpoonplus", "rightharpoondownplus"], 1.75, 716],
    xhookleftarrow: [["leftarrow", "righthook"], 1.08, 522],
    xhookrightarrow: [["lefthook", "rightarrow"], 1.08, 522],
    overlinesegment: [["leftlinesegment", "rightlinesegment"], 0.888, 522],
    underlinesegment: [["leftlinesegment", "rightlinesegment"], 0.888, 522],
    overgroup: [["leftgroup", "rightgroup"], 0.888, 342],
    undergroup: [["leftgroupunder", "rightgroupunder"], 0.888, 342],
    xmapsto: [["leftmapsto", "rightarrow"], 1.5, 522],
    xtofrom: [["leftToFrom", "rightToFrom"], 1.75, 528]
};

var groupLength = function groupLength(arg) {
    if (arg.type === "ordgroup") {
        return arg.value.length;
    } else {
        return 1;
    }
};

var svgSpan = function svgSpan(group, options) {
    // Create a span with inline SVG for the element.
    function buildSvgSpan_() {
        var viewBoxWidth = 400000; // default
        var label = group.value.label.substr(1);
        if (_utils2.default.contains(["widehat", "widetilde", "utilde"], label)) {
            // There are four SVG images available for each function.
            // Choose a taller image when there are more characters.
            var numChars = groupLength(group.value.base);
            var viewBoxHeight = void 0;
            var pathName = void 0;
            var _height = void 0;

            if (numChars > 5) {
                viewBoxHeight = label === "widehat" ? 420 : 312;
                viewBoxWidth = label === "widehat" ? 2364 : 2340;
                // Next get the span height, in 1000 ems
                _height = label === "widehat" ? 0.42 : 0.34;
                pathName = (label === "widehat" ? "widehat" : "tilde") + "4";
            } else {
                var imgIndex = [1, 1, 2, 2, 3, 3][numChars];
                if (label === "widehat") {
                    viewBoxWidth = [0, 1062, 2364, 2364, 2364][imgIndex];
                    viewBoxHeight = [0, 239, 300, 360, 420][imgIndex];
                    _height = [0, 0.24, 0.3, 0.3, 0.36, 0.42][imgIndex];
                    pathName = "widehat" + imgIndex;
                } else {
                    viewBoxWidth = [0, 600, 1033, 2339, 2340][imgIndex];
                    viewBoxHeight = [0, 260, 286, 306, 312][imgIndex];
                    _height = [0, 0.26, 0.286, 0.3, 0.306, 0.34][imgIndex];
                    pathName = "tilde" + imgIndex;
                }
            }
            var path = new _domTree2.default.pathNode(pathName);
            var svgNode = new _domTree2.default.svgNode([path], {
                "width": "100%",
                "height": _height + "em",
                "viewBox": "0 0 " + viewBoxWidth + " " + viewBoxHeight,
                "preserveAspectRatio": "none"
            });
            return {
                span: _buildCommon2.default.makeSpan([], [svgNode], options),
                minWidth: 0,
                height: _height
            };
        } else {
            var spans = [];

            var _katexImagesData$labe = (0, _slicedToArray3.default)(katexImagesData[label], 4),
                paths = _katexImagesData$labe[0],
                _minWidth = _katexImagesData$labe[1],
                _viewBoxHeight = _katexImagesData$labe[2],
                align1 = _katexImagesData$labe[3];

            var _height2 = _viewBoxHeight / 1000;

            var numSvgChildren = paths.length;
            var widthClasses = void 0;
            var aligns = void 0;
            if (numSvgChildren === 1) {
                widthClasses = ["hide-tail"];
                aligns = [align1];
            } else if (numSvgChildren === 2) {
                widthClasses = ["halfarrow-left", "halfarrow-right"];
                aligns = ["xMinYMin", "xMaxYMin"];
            } else if (numSvgChildren === 3) {
                widthClasses = ["brace-left", "brace-center", "brace-right"];
                aligns = ["xMinYMin", "xMidYMin", "xMaxYMin"];
            } else {
                throw new Error("Correct katexImagesData or update code here to support\n                    " + numSvgChildren + " children.");
            }

            for (var i = 0; i < numSvgChildren; i++) {
                var _path = new _domTree2.default.pathNode(paths[i]);

                var _svgNode = new _domTree2.default.svgNode([_path], {
                    "width": "400em",
                    "height": _height2 + "em",
                    "viewBox": "0 0 " + viewBoxWidth + " " + _viewBoxHeight,
                    "preserveAspectRatio": aligns[i] + " slice"
                });

                var _span = _buildCommon2.default.makeSpan([widthClasses[i]], [_svgNode], options);
                if (numSvgChildren === 1) {
                    return { span: _span, minWidth: _minWidth, height: _height2 };
                } else {
                    _span.style.height = _height2 + "em";
                    spans.push(_span);
                }
            }

            return {
                span: _buildCommon2.default.makeSpan(["stretchy"], spans, options),
                minWidth: _minWidth,
                height: _height2
            };
        }
    } // buildSvgSpan_()

    var _buildSvgSpan_ = buildSvgSpan_(),
        span = _buildSvgSpan_.span,
        minWidth = _buildSvgSpan_.minWidth,
        height = _buildSvgSpan_.height;

    // Note that we are returning span.depth = 0.
    // Any adjustments relative to the baseline must be done in buildHTML.


    span.height = height;
    span.style.height = height + "em";
    if (minWidth > 0) {
        span.style.minWidth = minWidth + "em";
    }

    return span;
};

var encloseSpan = function encloseSpan(inner, label, pad, options) {
    // Return an image span for \cancel, \bcancel, \xcancel, or \fbox
    var img = void 0;
    var totalHeight = inner.height + inner.depth + 2 * pad;

    if (/fbox|color/.test(label)) {
        img = _buildCommon2.default.makeSpan(["stretchy", label], [], options);

        if (label === "fbox") {
            var color = options.color && options.getColor();
            if (color) {
                img.style.borderColor = color;
            }
        }
    } else {
        // \cancel, \bcancel, or \xcancel
        // Since \cancel's SVG is inline and it omits the viewBox attribute,
        // its stroke-width will not vary with span area.

        var lines = [];
        if (/^[bx]cancel$/.test(label)) {
            lines.push(new _domTree2.default.lineNode({
                "x1": "0",
                "y1": "0",
                "x2": "100%",
                "y2": "100%",
                "stroke-width": "0.046em"
            }));
        }

        if (/^x?cancel$/.test(label)) {
            lines.push(new _domTree2.default.lineNode({
                "x1": "0",
                "y1": "100%",
                "x2": "100%",
                "y2": "0",
                "stroke-width": "0.046em"
            }));
        }

        var svgNode = new _domTree2.default.svgNode(lines, {
            "width": "100%",
            "height": totalHeight + "em"
        });

        img = _buildCommon2.default.makeSpan([], [svgNode], options);
    }

    img.height = totalHeight;
    img.style.height = totalHeight + "em";

    return img;
};

var ruleSpan = function ruleSpan(className, lineThickness, options) {

    // Get a span with an SVG line that fills the middle fifth of the span.
    // We're using an extra wide span so Chrome won't round it down to zero.

    var lines = [];
    var svgNode = void 0;
    if (className === "vertical-separator") {
        // Apply 2 brush strokes for sharper edges on low-res screens.
        for (var i = 0; i < 2; i++) {
            lines.push(new _domTree2.default.lineNode({
                "x1": "5",
                "y1": "0",
                "x2": "5",
                "y2": "10",
                "stroke-width": "2"
            }));
        }

        svgNode = new _domTree2.default.svgNode(lines, {
            "width": "0.25em",
            "height": "100%",
            "viewBox": "0 0 10 10",
            "preserveAspectRatio": "none"
        });
    } else {
        for (var _i = 0; _i < 2; _i++) {
            lines.push(new _domTree2.default.lineNode({
                "x1": "0",
                "y1": "5",
                "x2": "10",
                "y2": "5",
                "stroke-width": "2"
            }));
        }

        svgNode = new _domTree2.default.svgNode(lines, {
            "width": "100%",
            "height": 5 * lineThickness + "em",
            "viewBox": "0 0 10 10",
            "preserveAspectRatio": "none"
        });
    }

    return _buildCommon2.default.makeSpan([className], [svgNode], options);
};

exports.default = {
    encloseSpan: encloseSpan,
    mathMLnode: mathMLnode,
    ruleSpan: ruleSpan,
    svgSpan: svgSpan
};

},{"./buildCommon":91,"./domTree":98,"./mathMLTree":124,"./utils":133,"babel-runtime/helpers/slicedToArray":10}],127:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var path = {
    // sqrtMain path geometry is from glyph U221A in the font KaTeX Main
    sqrtMain: "M95 622c-2.667 0-7.167-2.667-13.5\n-8S72 604 72 600c0-2 .333-3.333 1-4 1.333-2.667 23.833-20.667 67.5-54s\n65.833-50.333 66.5-51c1.333-1.333 3-2 5-2 4.667 0 8.667 3.333 12 10l173\n378c.667 0 35.333-71 104-213s137.5-285 206.5-429S812 17.333 812 14c5.333\n-9.333 12-14 20-14h399166v40H845.272L620 507 385 993c-2.667 4.667-9 7-19\n7-6 0-10-1-12-3L160 575l-65 47zM834 0h399166v40H845z",

    // size1 is from glyph U221A in the font KaTeX_Size1-Regular
    sqrtSize1: "M263 601c.667 0 18 39.667 52 119s68.167\n 158.667 102.5 238 51.833 119.333 52.5 120C810 373.333 980.667 17.667 982 11\nc4.667-7.333 11-11 19-11h398999v40H1012.333L741 607c-38.667 80.667-84 175-136\n 283s-89.167 185.333-111.5 232-33.833 70.333-34.5 71c-4.667 4.667-12.333 7-23\n 7l-12-1-109-253c-72.667-168-109.333-252-110-252-10.667 8-22 16.667-34 26-22\n 17.333-33.333 26-34 26l-26-26 76-59 76-60zM1001 0h398999v40H1012z",

    // size2 is from glyph U221A in the font KaTeX_Size2-Regular
    sqrtSize2: "M1001 0h398999v40H1013.084S929.667 308 749\n 880s-277 876.333-289 913c-4.667 4.667-12.667 7-24 7h-12c-1.333-3.333-3.667\n-11.667-7-25-35.333-125.333-106.667-373.333-214-744-10 12-21 25-33 39l-32 39\nc-6-5.333-15-14-27-26l25-30c26.667-32.667 52-63 76-91l52-60 208 722c56-175.333\n 126.333-397.333 211-666s153.833-488.167 207.5-658.5C944.167 129.167 975 32.667\n 983 10c4-6.667 10-10 18-10zm0 0h398999v40H1013z",

    // size3 is from glyph U221A in the font KaTeX_Size3-Regular
    sqrtSize3: "M424 2398c-1.333-.667-38.5-172-111.5-514 S202.667 1370.667 202\n 1370c0-2-10.667 14.333-32 49-4.667 7.333-9.833 15.667-15.5 25s-9.833 16-12.5\n 20l-5 7c-4-3.333-8.333-7.667-13-13l-13-13 76-122 77-121 209 968c0-2 84.667\n-361.667 254-1079C896.333 373.667 981.667 13.333 983 10c4-6.667 10-10 18-10\nh398999v40H1014.622S927.332 418.667 742 1206c-185.333 787.333-279.333 1182.333\n-282 1185-2 6-10 9-24 9-8 0-12-.667-12-2zM1001 0h398999v40H1014z",

    // size4 is from glyph U221A in the font KaTeX_Size4-Regular
    sqrtSize4: "M473 2713C812.333 913.667 982.333 13 983 11c3.333-7.333 9.333\n-11 18-11h399110v40H1017.698S927.168 518 741.5 1506C555.833 2494 462 2989 460\n 2991c-2 6-10 9-24 9-8 0-12-.667-12-2s-5.333-32-16-92c-50.667-293.333-119.667\n-693.333-207-1200 0-1.333-5.333 8.667-16 30l-32 64-16 33-26-26 76-153 77-151\nc.667.667 35.667 202 105 604 67.333 400.667 102 602.667 104 606z\nM1001 0h398999v40H1017z",

    // The doubleleftarrow geometry is from glyph U+21D0 in the font KaTeX Main
    doubleleftarrow: "M262 157\nl10-10c34-36 62.7-77 86-123 3.3-8 5-13.3 5-16 0-5.3-6.7-8-20-8-7.3\n 0-12.2.5-14.5 1.5-2.3 1-4.8 4.5-7.5 10.5-49.3 97.3-121.7 169.3-217 216-28\n 14-57.3 25-88 33-6.7 2-11 3.8-13 5.5-2 1.7-3 4.2-3 7.5s1 5.8 3 7.5\nc2 1.7 6.3 3.5 13 5.5 68 17.3 128.2 47.8 180.5 91.5 52.3 43.7 93.8 96.2 124.5\n 157.5 9.3 8 15.3 12.3 18 13h6c12-.7 18-4 18-10 0-2-1.7-7-5-15-23.3-46-52-87\n-86-123l-10-10h399738v-40H218c328 0 0 0 0 0l-10-8c-26.7-20-65.7-43-117-69 2.7\n-2 6-3.7 10-5 36.7-16 72.3-37.3 107-64l10-8h399782v-40z\nm8 0v40h399730v-40zm0 194v40h399730v-40z",

    // doublerightarrow is from glyph U+21D2 in font KaTeX Main
    doublerightarrow: "M399738 392l\n-10 10c-34 36-62.7 77-86 123-3.3 8-5 13.3-5 16 0 5.3 6.7 8 20 8 7.3 0 12.2-.5\n 14.5-1.5 2.3-1 4.8-4.5 7.5-10.5 49.3-97.3 121.7-169.3 217-216 28-14 57.3-25 88\n-33 6.7-2 11-3.8 13-5.5 2-1.7 3-4.2 3-7.5s-1-5.8-3-7.5c-2-1.7-6.3-3.5-13-5.5-68\n-17.3-128.2-47.8-180.5-91.5-52.3-43.7-93.8-96.2-124.5-157.5-9.3-8-15.3-12.3-18\n-13h-6c-12 .7-18 4-18 10 0 2 1.7 7 5 15 23.3 46 52 87 86 123l10 10H0v40h399782\nc-328 0 0 0 0 0l10 8c26.7 20 65.7 43 117 69-2.7 2-6 3.7-10 5-36.7 16-72.3 37.3\n-107 64l-10 8H0v40zM0 157v40h399730v-40zm0 194v40h399730v-40z",

    // leftarrow is from glyph U+2190 in font KaTeX Main
    leftarrow: "M400000 241H110l3-3c68.7-52.7 113.7-120\n 135-202 4-14.7 6-23 6-25 0-7.3-7-11-21-11-8 0-13.2.8-15.5 2.5-2.3 1.7-4.2 5.8\n-5.5 12.5-1.3 4.7-2.7 10.3-4 17-12 48.7-34.8 92-68.5 130S65.3 228.3 18 247\nc-10 4-16 7.7-18 11 0 8.7 6 14.3 18 17 47.3 18.7 87.8 47 121.5 85S196 441.3 208\n 490c.7 2 1.3 5 2 9s1.2 6.7 1.5 8c.3 1.3 1 3.3 2 6s2.2 4.5 3.5 5.5c1.3 1 3.3\n 1.8 6 2.5s6 1 10 1c14 0 21-3.7 21-11 0-2-2-10.3-6-25-20-79.3-65-146.7-135-202\n l-3-3h399890zM100 241v40h399900v-40z",

    // overbrace is from glyphs U+23A9/23A8/23A7 in font KaTeX_Size4-Regular
    leftbrace: "M6 548l-6-6v-35l6-11c56-104 135.3-181.3 238-232 57.3-28.7 117\n-45 179-50h399577v120H403c-43.3 7-81 15-113 26-100.7 33-179.7 91-237 174-2.7\n 5-6 9-10 13-.7 1-7.3 1-20 1H6z",

    leftbraceunder: "M0 6l6-6h17c12.688 0 19.313.3 20 1 4 4 7.313 8.3 10 13\n 35.313 51.3 80.813 93.8 136.5 127.5 55.688 33.7 117.188 55.8 184.5 66.5.688\n 0 2 .3 4 1 18.688 2.7 76 4.3 172 5h399450v120H429l-6-1c-124.688-8-235-61.7\n-331-161C60.687 138.7 32.312 99.3 7 54L0 41V6z",

    // overgroup is from the MnSymbol package (public domain)
    leftgroup: "M400000 80\nH435C64 80 168.3 229.4 21 260c-5.9 1.2-18 0-18 0-2 0-3-1-3-3v-38C76 61 257 0\n 435 0h399565z",

    leftgroupunder: "M400000 262\nH435C64 262 168.3 112.6 21 82c-5.9-1.2-18 0-18 0-2 0-3 1-3 3v38c76 158 257 219\n 435 219h399565z",

    // Harpoons are from glyph U+21BD in font KaTeX Main
    leftharpoon: "M0 267c.7 5.3 3 10 7 14h399993v-40H93c3.3\n-3.3 10.2-9.5 20.5-18.5s17.8-15.8 22.5-20.5c50.7-52 88-110.3 112-175 4-11.3 5\n-18.3 3-21-1.3-4-7.3-6-18-6-8 0-13 .7-15 2s-4.7 6.7-8 16c-42 98.7-107.3 174.7\n-196 228-6.7 4.7-10.7 8-12 10-1.3 2-2 5.7-2 11zm100-26v40h399900v-40z",

    leftharpoonplus: "M0 267c.7 5.3 3 10 7 14h399993v-40H93c3.3-3.3 10.2-9.5\n 20.5-18.5s17.8-15.8 22.5-20.5c50.7-52 88-110.3 112-175 4-11.3 5-18.3 3-21-1.3\n-4-7.3-6-18-6-8 0-13 .7-15 2s-4.7 6.7-8 16c-42 98.7-107.3 174.7-196 228-6.7 4.7\n-10.7 8-12 10-1.3 2-2 5.7-2 11zm100-26v40h399900v-40zM0 435v40h400000v-40z\nm0 0v40h400000v-40z",

    leftharpoondown: "M7 241c-4 4-6.333 8.667-7 14 0 5.333.667 9 2 11s5.333\n 5.333 12 10c90.667 54 156 130 196 228 3.333 10.667 6.333 16.333 9 17 2 .667 5\n 1 9 1h5c10.667 0 16.667-2 18-6 2-2.667 1-9.667-3-21-32-87.333-82.667-157.667\n-152-211l-3-3h399907v-40zM93 281 H400000 v-40L7 241z",

    leftharpoondownplus: "M7 435c-4 4-6.3 8.7-7 14 0 5.3.7 9 2 11s5.3 5.3 12\n 10c90.7 54 156 130 196 228 3.3 10.7 6.3 16.3 9 17 2 .7 5 1 9 1h5c10.7 0 16.7\n-2 18-6 2-2.7 1-9.7-3-21-32-87.3-82.7-157.7-152-211l-3-3h399907v-40H7zm93 0\nv40h399900v-40zM0 241v40h399900v-40zm0 0v40h399900v-40z",

    // hook is from glyph U+21A9 in font KaTeX Main
    lefthook: "M400000 281 H103s-33-11.2-61-33.5S0 197.3 0 164s14.2-61.2 42.5\n-83.5C70.8 58.2 104 47 142 47 c16.7 0 25 6.7 25 20 0 12-8.7 18.7-26 20-40 3.3\n-68.7 15.7-86 37-10 12-15 25.3-15 40 0 22.7 9.8 40.7 29.5 54 19.7 13.3 43.5 21\n 71.5 23h399859zM103 281v-40h399897v40z",

    leftlinesegment: "M40 281 V428 H0 V94 H40 V241 H400000 v40z\nM40 281 V428 H0 V94 H40 V241 H400000 v40z",

    leftmapsto: "M40 281 V448H0V74H40V241H400000v40z\nM40 281 V448H0V74H40V241H400000v40z",

    // tofrom is from glyph U+21C4 in font KaTeX AMS Regular
    leftToFrom: "M0 147h400000v40H0zm0 214c68 40 115.7 95.7 143 167h22c15.3 0 23\n-.3 23-1 0-1.3-5.3-13.7-16-37-18-35.3-41.3-69-70-101l-7-8h399905v-40H95l7-8\nc28.7-32 52-65.7 70-101 10.7-23.3 16-35.7 16-37 0-.7-7.7-1-23-1h-22C115.7 265.3\n 68 321 0 361zm0-174v-40h399900v40zm100 154v40h399900v-40z",

    longequal: "M0 50 h400000 v40H0z m0 194h40000v40H0z\nM0 50 h400000 v40H0z m0 194h40000v40H0z",

    midbrace: "M200428 334\nc-100.7-8.3-195.3-44-280-108-55.3-42-101.7-93-139-153l-9-14c-2.7 4-5.7 8.7-9 14\n-53.3 86.7-123.7 153-211 199-66.7 36-137.3 56.3-212 62H0V214h199568c178.3-11.7\n 311.7-78.3 403-201 6-8 9.7-12 11-12 .7-.7 6.7-1 18-1s17.3.3 18 1c1.3 0 5 4 11\n 12 44.7 59.3 101.3 106.3 170 141s145.3 54.3 229 60h199572v120z",

    midbraceunder: "M199572 214\nc100.7 8.3 195.3 44 280 108 55.3 42 101.7 93 139 153l9 14c2.7-4 5.7-8.7 9-14\n 53.3-86.7 123.7-153 211-199 66.7-36 137.3-56.3 212-62h199568v120H200432c-178.3\n 11.7-311.7 78.3-403 201-6 8-9.7 12-11 12-.7.7-6.7 1-18 1s-17.3-.3-18-1c-1.3 0\n-5-4-11-12-44.7-59.3-101.3-106.3-170-141s-145.3-54.3-229-60H0V214z",

    rightarrow: "M0 241v40h399891c-47.3 35.3-84 78-110 128\n-16.7 32-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20\n 11 8 0 13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7\n 39-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85\n-40.5-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5\n-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67\n 151.7 139 205zm0 0v40h399900v-40z",

    rightbrace: "M400000 542l\n-6 6h-17c-12.7 0-19.3-.3-20-1-4-4-7.3-8.3-10-13-35.3-51.3-80.8-93.8-136.5-127.5\ns-117.2-55.8-184.5-66.5c-.7 0-2-.3-4-1-18.7-2.7-76-4.3-172-5H0V214h399571l6 1\nc124.7 8 235 61.7 331 161 31.3 33.3 59.7 72.7 85 118l7 13v35z",

    rightbraceunder: "M399994 0l6 6v35l-6 11c-56 104-135.3 181.3-238 232-57.3\n 28.7-117 45-179 50H-300V214h399897c43.3-7 81-15 113-26 100.7-33 179.7-91 237\n-174 2.7-5 6-9 10-13 .7-1 7.3-1 20-1h17z",

    rightgroup: "M0 80h399565c371 0 266.7 149.4 414 180 5.9 1.2 18 0 18 0 2 0\n 3-1 3-3v-38c-76-158-257-219-435-219H0z",

    rightgroupunder: "M0 262h399565c371 0 266.7-149.4 414-180 5.9-1.2 18 0 18\n 0 2 0 3 1 3 3v38c-76 158-257 219-435 219H0z",

    rightharpoon: "M0 241v40h399993c4.7-4.7 7-9.3 7-14 0-9.3\n-3.7-15.3-11-18-92.7-56.7-159-133.7-199-231-3.3-9.3-6-14.7-8-16-2-1.3-7-2-15-2\n-10.7 0-16.7 2-18 6-2 2.7-1 9.7 3 21 15.3 42 36.7 81.8 64 119.5 27.3 37.7 58\n 69.2 92 94.5zm0 0v40h399900v-40z",

    rightharpoonplus: "M0 241v40h399993c4.7-4.7 7-9.3 7-14 0-9.3-3.7-15.3-11\n-18-92.7-56.7-159-133.7-199-231-3.3-9.3-6-14.7-8-16-2-1.3-7-2-15-2-10.7 0-16.7\n 2-18 6-2 2.7-1 9.7 3 21 15.3 42 36.7 81.8 64 119.5 27.3 37.7 58 69.2 92 94.5z\nm0 0v40h399900v-40z m100 194v40h399900v-40zm0 0v40h399900v-40z",

    rightharpoondown: "M399747 511c0 7.3 6.7 11 20 11 8 0 13-.8 15-2.5s4.7-6.8\n 8-15.5c40-94 99.3-166.3 178-217 13.3-8 20.3-12.3 21-13 5.3-3.3 8.5-5.8 9.5\n-7.5 1-1.7 1.5-5.2 1.5-10.5s-2.3-10.3-7-15H0v40h399908c-34 25.3-64.7 57-92 95\n-27.3 38-48.7 77.7-64 119-3.3 8.7-5 14-5 16zM0 241v40h399900v-40z",

    rightharpoondownplus: "M399747 705c0 7.3 6.7 11 20 11 8 0 13-.8\n 15-2.5s4.7-6.8 8-15.5c40-94 99.3-166.3 178-217 13.3-8 20.3-12.3 21-13 5.3-3.3\n 8.5-5.8 9.5-7.5 1-1.7 1.5-5.2 1.5-10.5s-2.3-10.3-7-15H0v40h399908c-34 25.3\n-64.7 57-92 95-27.3 38-48.7 77.7-64 119-3.3 8.7-5 14-5 16zM0 435v40h399900v-40z\nm0-194v40h400000v-40zm0 0v40h400000v-40z",

    righthook: "M399859 241c-764 0 0 0 0 0 40-3.3 68.7-15.7 86-37 10-12 15-25.3\n 15-40 0-22.7-9.8-40.7-29.5-54-19.7-13.3-43.5-21-71.5-23-17.3-1.3-26-8-26-20 0\n-13.3 8.7-20 26-20 38 0 71 11.2 99 33.5 0 0 7 5.6 21 16.7 14 11.2 21 33.5 21\n 66.8s-14 61.2-42 83.5c-28 22.3-61 33.5-99 33.5L0 241z M0 281v-40h399859v40z",

    rightlinesegment: "M399960 241 V94 h40 V428 h-40 V281 H0 v-40z\nM399960 241 V94 h40 V428 h-40 V281 H0 v-40z",

    rightToFrom: "M400000 167c-70.7-42-118-97.7-142-167h-23c-15.3 0-23 .3-23\n 1 0 1.3 5.3 13.7 16 37 18 35.3 41.3 69 70 101l7 8H0v40h399905l-7 8c-28.7 32\n-52 65.7-70 101-10.7 23.3-16 35.7-16 37 0 .7 7.7 1 23 1h23c24-69.3 71.3-125 142\n-167z M100 147v40h399900v-40zM0 341v40h399900v-40z",

    // twoheadleftarrow is from glyph U+219E in font KaTeX AMS Regular
    twoheadleftarrow: "M0 167c68 40\n 115.7 95.7 143 167h22c15.3 0 23-.3 23-1 0-1.3-5.3-13.7-16-37-18-35.3-41.3-69\n-70-101l-7-8h125l9 7c50.7 39.3 85 86 103 140h46c0-4.7-6.3-18.7-19-42-18-35.3\n-40-67.3-66-96l-9-9h399716v-40H284l9-9c26-28.7 48-60.7 66-96 12.7-23.333 19\n-37.333 19-42h-46c-18 54-52.3 100.7-103 140l-9 7H95l7-8c28.7-32 52-65.7 70-101\n 10.7-23.333 16-35.7 16-37 0-.7-7.7-1-23-1h-22C115.7 71.3 68 127 0 167z",

    twoheadrightarrow: "M400000 167\nc-68-40-115.7-95.7-143-167h-22c-15.3 0-23 .3-23 1 0 1.3 5.3 13.7 16 37 18 35.3\n 41.3 69 70 101l7 8h-125l-9-7c-50.7-39.3-85-86-103-140h-46c0 4.7 6.3 18.7 19 42\n 18 35.3 40 67.3 66 96l9 9H0v40h399716l-9 9c-26 28.7-48 60.7-66 96-12.7 23.333\n-19 37.333-19 42h46c18-54 52.3-100.7 103-140l9-7h125l-7 8c-28.7 32-52 65.7-70\n 101-10.7 23.333-16 35.7-16 37 0 .7 7.7 1 23 1h22c27.3-71.3 75-127 143-167z",

    // tilde1 is a modified version of a glyph from the MnSymbol package
    tilde1: "M200 55.538c-77 0-168 73.953-177 73.953-3 0-7\n-2.175-9-5.437L2 97c-1-2-2-4-2-6 0-4 2-7 5-9l20-12C116 12 171 0 207 0c86 0\n 114 68 191 68 78 0 168-68 177-68 4 0 7 2 9 5l12 19c1 2.175 2 4.35 2 6.525 0\n 4.35-2 7.613-5 9.788l-19 13.05c-92 63.077-116.937 75.308-183 76.128\n-68.267.847-113-73.952-191-73.952z",

    // ditto tilde2, tilde3, & tilde4
    tilde2: "M344 55.266c-142 0-300.638 81.316-311.5 86.418\n-8.01 3.762-22.5 10.91-23.5 5.562L1 120c-1-2-1-3-1-4 0-5 3-9 8-10l18.4-9C160.9\n 31.9 283 0 358 0c148 0 188 122 331 122s314-97 326-97c4 0 8 2 10 7l7 21.114\nc1 2.14 1 3.21 1 4.28 0 5.347-3 9.626-7 10.696l-22.3 12.622C852.6 158.372 751\n 181.476 676 181.476c-149 0-189-126.21-332-126.21z",

    tilde3: "M786 59C457 59 32 175.242 13 175.242c-6 0-10-3.457\n-11-10.37L.15 138c-1-7 3-12 10-13l19.2-6.4C378.4 40.7 634.3 0 804.3 0c337 0\n 411.8 157 746.8 157 328 0 754-112 773-112 5 0 10 3 11 9l1 14.075c1 8.066-.697\n 16.595-6.697 17.492l-21.052 7.31c-367.9 98.146-609.15 122.696-778.15 122.696\n -338 0-409-156.573-744-156.573z",

    tilde4: "M786 58C457 58 32 177.487 13 177.487c-6 0-10-3.345\n-11-10.035L.15 143c-1-7 3-12 10-13l22-6.7C381.2 35 637.15 0 807.15 0c337 0 409\n 177 744 177 328 0 754-127 773-127 5 0 10 3 11 9l1 14.794c1 7.805-3 13.38-9\n 14.495l-20.7 5.574c-366.85 99.79-607.3 139.372-776.3 139.372-338 0-409\n -175.236-744-175.236z",

    // vec is from glyph U+20D7 in font KaTeX Main
    vec: "M377 20c0-5.333 1.833-10 5.5-14S391 0 397 0c4.667 0 8.667 1.667 12 5\n3.333 2.667 6.667 9 10 19 6.667 24.667 20.333 43.667 41 57 7.333 4.667 11\n10.667 11 18 0 6-1 10-3 12s-6.667 5-14 9c-28.667 14.667-53.667 35.667-75 63\n-1.333 1.333-3.167 3.5-5.5 6.5s-4 4.833-5 5.5c-1 .667-2.5 1.333-4.5 2s-4.333 1\n-7 1c-4.667 0-9.167-1.833-13.5-5.5S337 184 337 178c0-12.667 15.667-32.333 47-59\nH213l-171-1c-8.667-6-13-12.333-13-19 0-4.667 4.333-11.333 13-20h359\nc-16-25.333-24-45-24-59z",

    // widehat1 is a modified version of a glyph from the MnSymbol package
    widehat1: "M529 0h5l519 115c5 1 9 5 9 10 0 1-1 2-1 3l-4 22\nc-1 5-5 9-11 9h-2L532 67 19 159h-2c-5 0-9-4-11-9l-5-22c-1-6 2-12 8-13z",

    // ditto widehat2, widehat3, & widehat4
    widehat2: "M1181 0h2l1171 176c6 0 10 5 10 11l-2 23c-1 6-5 10\n-11 10h-1L1182 67 15 220h-1c-6 0-10-4-11-10l-2-23c-1-6 4-11 10-11z",

    widehat3: "M1181 0h2l1171 236c6 0 10 5 10 11l-2 23c-1 6-5 10\n-11 10h-1L1182 67 15 280h-1c-6 0-10-4-11-10l-2-23c-1-6 4-11 10-11z",

    widehat4: "M1181 0h2l1171 296c6 0 10 5 10 11l-2 23c-1 6-5 10\n-11 10h-1L1182 67 15 340h-1c-6 0-10-4-11-10l-2-23c-1-6 4-11 10-11z"
};

exports.default = { path: path };

},{}],128:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

/**
 * This file holds a list of all no-argument functions and single-character
 * symbols (like 'a' or ';').
 *
 * For each of the symbols, there are three properties they can have:
 * - font (required): the font to be used for this symbol. Either "main" (the
     normal font), or "ams" (the ams fonts).
 * - group (required): the ParseNode group type the symbol should have (i.e.
     "textord", "mathord", etc).
     See https://github.com/Khan/KaTeX/wiki/Examining-TeX#group-types
 * - replace: the character that this symbol or function should be
 *   replaced with (i.e. "\phi" has a replace value of "\u03d5", the phi
 *   character in the main font).
 *
 * The outermost map in the table indicates what mode the symbols should be
 * accepted in (e.g. "math" or "text").
 */

var symbols = {
    "math": {},
    "text": {}
};
exports.default = symbols;

/** `acceptUnicodeChar = true` is only applicable if `replace` is set. */

function defineSymbol(mode, font, group, replace, name, acceptUnicodeChar) {
    symbols[mode][name] = { font: font, group: group, replace: replace };

    if (acceptUnicodeChar && replace) {
        symbols[mode][replace] = symbols[mode][name];
    }
}

// Some abbreviations for commonly used strings.
// This helps minify the code, and also spotting typos using jshint.

// modes:
var math = "math";
var text = "text";

// fonts:
var main = "main";
var ams = "ams";

// groups:
var accent = "accent";
var bin = "bin";
var close = "close";
var inner = "inner";
var mathord = "mathord";
var op = "op";
var open = "open";
var punct = "punct";
var rel = "rel";
var spacing = "spacing";
var textord = "textord";

// Now comes the symbol table

// Relation Symbols
defineSymbol(math, main, rel, "\u2261", "\\equiv", true);
defineSymbol(math, main, rel, "\u227A", "\\prec", true);
defineSymbol(math, main, rel, "\u227B", "\\succ", true);
defineSymbol(math, main, rel, "\u223C", "\\sim", true);
defineSymbol(math, main, rel, "\u22A5", "\\perp");
defineSymbol(math, main, rel, "\u2AAF", "\\preceq", true);
defineSymbol(math, main, rel, "\u2AB0", "\\succeq", true);
defineSymbol(math, main, rel, "\u2243", "\\simeq", true);
defineSymbol(math, main, rel, "\u2223", "\\mid", true);
defineSymbol(math, main, rel, "\u226A", "\\ll");
defineSymbol(math, main, rel, "\u226B", "\\gg", true);
defineSymbol(math, main, rel, "\u224D", "\\asymp", true);
defineSymbol(math, main, rel, "\u2225", "\\parallel");
defineSymbol(math, main, rel, "\u22C8", "\\bowtie", true);
defineSymbol(math, main, rel, "\u2323", "\\smile", true);
defineSymbol(math, main, rel, "\u2291", "\\sqsubseteq", true);
defineSymbol(math, main, rel, "\u2292", "\\sqsupseteq", true);
defineSymbol(math, main, rel, "\u2250", "\\doteq", true);
defineSymbol(math, main, rel, "\u2322", "\\frown", true);
defineSymbol(math, main, rel, "\u220B", "\\ni", true);
defineSymbol(math, main, rel, "\u221D", "\\propto", true);
defineSymbol(math, main, rel, "\u22A2", "\\vdash", true);
defineSymbol(math, main, rel, "\u22A3", "\\dashv", true);
defineSymbol(math, main, rel, "\u220B", "\\owns");

// Punctuation
defineSymbol(math, main, punct, ".", "\\ldotp");
defineSymbol(math, main, punct, "\u22C5", "\\cdotp");

// Misc Symbols
defineSymbol(math, main, textord, "#", "\\#");
defineSymbol(text, main, textord, "#", "\\#");
defineSymbol(math, main, textord, "&", "\\&");
defineSymbol(text, main, textord, "&", "\\&");
defineSymbol(math, main, textord, "\u2135", "\\aleph", true);
defineSymbol(math, main, textord, "\u2200", "\\forall", true);
defineSymbol(math, main, textord, "\u210F", "\\hbar");
defineSymbol(math, main, textord, "\u2203", "\\exists", true);
defineSymbol(math, main, textord, "\u2207", "\\nabla", true);
defineSymbol(math, main, textord, "\u266D", "\\flat", true);
defineSymbol(math, main, textord, "\u2113", "\\ell", true);
defineSymbol(math, main, textord, "\u266E", "\\natural", true);
defineSymbol(math, main, textord, "\u2663", "\\clubsuit", true);
defineSymbol(math, main, textord, "\u2118", "\\wp", true);
defineSymbol(math, main, textord, "\u266F", "\\sharp", true);
defineSymbol(math, main, textord, "\u2662", "\\diamondsuit", true);
defineSymbol(math, main, textord, "\u211C", "\\Re", true);
defineSymbol(math, main, textord, "\u2661", "\\heartsuit", true);
defineSymbol(math, main, textord, "\u2111", "\\Im", true);
defineSymbol(math, main, textord, "\u2660", "\\spadesuit", true);

// Math and Text
defineSymbol(math, main, textord, "\u2020", "\\dag");
defineSymbol(text, main, textord, "\u2020", "\\dag");
defineSymbol(text, main, textord, "\u2020", "\\textdagger");
defineSymbol(math, main, textord, "\u2021", "\\ddag");
defineSymbol(text, main, textord, "\u2021", "\\ddag");
defineSymbol(text, main, textord, "\u2020", "\\textdaggerdbl");

// Large Delimiters
defineSymbol(math, main, close, "\u23B1", "\\rmoustache");
defineSymbol(math, main, open, "\u23B0", "\\lmoustache");
defineSymbol(math, main, close, "\u27EF", "\\rgroup");
defineSymbol(math, main, open, "\u27EE", "\\lgroup");

// Binary Operators
defineSymbol(math, main, bin, "\u2213", "\\mp", true);
defineSymbol(math, main, bin, "\u2296", "\\ominus", true);
defineSymbol(math, main, bin, "\u228E", "\\uplus", true);
defineSymbol(math, main, bin, "\u2293", "\\sqcap", true);
defineSymbol(math, main, bin, "\u2217", "\\ast");
defineSymbol(math, main, bin, "\u2294", "\\sqcup", true);
defineSymbol(math, main, bin, "\u25EF", "\\bigcirc");
defineSymbol(math, main, bin, "\u2219", "\\bullet");
defineSymbol(math, main, bin, "\u2021", "\\ddagger");
defineSymbol(math, main, bin, "\u2240", "\\wr", true);
defineSymbol(math, main, bin, "\u2A3F", "\\amalg");
defineSymbol(math, main, bin, "&", "\\And"); // from amsmath

// Arrow Symbols
defineSymbol(math, main, rel, "\u27F5", "\\longleftarrow", true);
defineSymbol(math, main, rel, "\u21D0", "\\Leftarrow", true);
defineSymbol(math, main, rel, "\u27F8", "\\Longleftarrow", true);
defineSymbol(math, main, rel, "\u27F6", "\\longrightarrow", true);
defineSymbol(math, main, rel, "\u21D2", "\\Rightarrow", true);
defineSymbol(math, main, rel, "\u27F9", "\\Longrightarrow", true);
defineSymbol(math, main, rel, "\u2194", "\\leftrightarrow", true);
defineSymbol(math, main, rel, "\u27F7", "\\longleftrightarrow", true);
defineSymbol(math, main, rel, "\u21D4", "\\Leftrightarrow", true);
defineSymbol(math, main, rel, "\u27FA", "\\Longleftrightarrow", true);
defineSymbol(math, main, rel, "\u21A6", "\\mapsto", true);
defineSymbol(math, main, rel, "\u27FC", "\\longmapsto", true);
defineSymbol(math, main, rel, "\u2197", "\\nearrow", true);
defineSymbol(math, main, rel, "\u21A9", "\\hookleftarrow", true);
defineSymbol(math, main, rel, "\u21AA", "\\hookrightarrow", true);
defineSymbol(math, main, rel, "\u2198", "\\searrow", true);
defineSymbol(math, main, rel, "\u21BC", "\\leftharpoonup", true);
defineSymbol(math, main, rel, "\u21C0", "\\rightharpoonup", true);
defineSymbol(math, main, rel, "\u2199", "\\swarrow", true);
defineSymbol(math, main, rel, "\u21BD", "\\leftharpoondown", true);
defineSymbol(math, main, rel, "\u21C1", "\\rightharpoondown", true);
defineSymbol(math, main, rel, "\u2196", "\\nwarrow", true);
defineSymbol(math, main, rel, "\u21CC", "\\rightleftharpoons", true);

// AMS Negated Binary Relations
defineSymbol(math, ams, rel, "\u226E", "\\nless", true);
defineSymbol(math, ams, rel, "\uE010", "\\nleqslant");
defineSymbol(math, ams, rel, "\uE011", "\\nleqq");
defineSymbol(math, ams, rel, "\u2A87", "\\lneq", true);
defineSymbol(math, ams, rel, "\u2268", "\\lneqq", true);
defineSymbol(math, ams, rel, "\uE00C", "\\lvertneqq");
defineSymbol(math, ams, rel, "\u22E6", "\\lnsim", true);
defineSymbol(math, ams, rel, "\u2A89", "\\lnapprox", true);
defineSymbol(math, ams, rel, "\u2280", "\\nprec", true);
// unicode-math maps \u22e0 to \npreccurlyeq. We'll use the AMS synonym.
defineSymbol(math, ams, rel, "\u22E0", "\\npreceq", true);
defineSymbol(math, ams, rel, "\u22E8", "\\precnsim", true);
defineSymbol(math, ams, rel, "\u2AB9", "\\precnapprox", true);
defineSymbol(math, ams, rel, "\u2241", "\\nsim", true);
defineSymbol(math, ams, rel, "\uE006", "\\nshortmid");
defineSymbol(math, ams, rel, "\u2224", "\\nmid", true);
defineSymbol(math, ams, rel, "\u22AC", "\\nvdash", true);
defineSymbol(math, ams, rel, "\u22AD", "\\nvDash", true);
defineSymbol(math, ams, rel, "\u22EA", "\\ntriangleleft");
defineSymbol(math, ams, rel, "\u22EC", "\\ntrianglelefteq", true);
defineSymbol(math, ams, rel, "\u228A", "\\subsetneq", true);
defineSymbol(math, ams, rel, "\uE01A", "\\varsubsetneq");
defineSymbol(math, ams, rel, "\u2ACB", "\\subsetneqq", true);
defineSymbol(math, ams, rel, "\uE017", "\\varsubsetneqq");
defineSymbol(math, ams, rel, "\u226F", "\\ngtr", true);
defineSymbol(math, ams, rel, "\uE00F", "\\ngeqslant");
defineSymbol(math, ams, rel, "\uE00E", "\\ngeqq");
defineSymbol(math, ams, rel, "\u2A88", "\\gneq", true);
defineSymbol(math, ams, rel, "\u2269", "\\gneqq", true);
defineSymbol(math, ams, rel, "\uE00D", "\\gvertneqq");
defineSymbol(math, ams, rel, "\u22E7", "\\gnsim", true);
defineSymbol(math, ams, rel, "\u2A8A", "\\gnapprox", true);
defineSymbol(math, ams, rel, "\u2281", "\\nsucc", true);
// unicode-math maps \u22e1 to \nsucccurlyeq. We'll use the AMS synonym.
defineSymbol(math, ams, rel, "\u22E1", "\\nsucceq", true);
defineSymbol(math, ams, rel, "\u22E9", "\\succnsim", true);
defineSymbol(math, ams, rel, "\u2ABA", "\\succnapprox", true);
// unicode-math maps \u2246 to \simneqq. We'll use the AMS synonym.
defineSymbol(math, ams, rel, "\u2246", "\\ncong", true);
defineSymbol(math, ams, rel, "\uE007", "\\nshortparallel");
defineSymbol(math, ams, rel, "\u2226", "\\nparallel", true);
defineSymbol(math, ams, rel, "\u22AF", "\\nVDash", true);
defineSymbol(math, ams, rel, "\u22EB", "\\ntriangleright");
defineSymbol(math, ams, rel, "\u22ED", "\\ntrianglerighteq", true);
defineSymbol(math, ams, rel, "\uE018", "\\nsupseteqq");
defineSymbol(math, ams, rel, "\u228B", "\\supsetneq", true);
defineSymbol(math, ams, rel, "\uE01B", "\\varsupsetneq");
defineSymbol(math, ams, rel, "\u2ACC", "\\supsetneqq", true);
defineSymbol(math, ams, rel, "\uE019", "\\varsupsetneqq");
defineSymbol(math, ams, rel, "\u22AE", "\\nVdash", true);
defineSymbol(math, ams, rel, "\u2AB5", "\\precneqq", true);
defineSymbol(math, ams, rel, "\u2AB6", "\\succneqq", true);
defineSymbol(math, ams, rel, "\uE016", "\\nsubseteqq");
defineSymbol(math, ams, bin, "\u22B4", "\\unlhd");
defineSymbol(math, ams, bin, "\u22B5", "\\unrhd");

// AMS Negated Arrows
defineSymbol(math, ams, rel, "\u219A", "\\nleftarrow", true);
defineSymbol(math, ams, rel, "\u219B", "\\nrightarrow", true);
defineSymbol(math, ams, rel, "\u21CD", "\\nLeftarrow", true);
defineSymbol(math, ams, rel, "\u21CF", "\\nRightarrow", true);
defineSymbol(math, ams, rel, "\u21AE", "\\nleftrightarrow", true);
defineSymbol(math, ams, rel, "\u21CE", "\\nLeftrightarrow", true);

// AMS Misc
defineSymbol(math, ams, rel, "\u25B3", "\\vartriangle");
defineSymbol(math, ams, textord, "\u210F", "\\hslash");
defineSymbol(math, ams, textord, "\u25BD", "\\triangledown");
defineSymbol(math, ams, textord, "\u25CA", "\\lozenge");
defineSymbol(math, ams, textord, "\u24C8", "\\circledS");
defineSymbol(math, ams, textord, "\xAE", "\\circledR");
defineSymbol(text, ams, textord, "\xAE", "\\circledR");
defineSymbol(math, ams, textord, "\u2221", "\\measuredangle", true);
defineSymbol(math, ams, textord, "\u2204", "\\nexists");
defineSymbol(math, ams, textord, "\u2127", "\\mho");
defineSymbol(math, ams, textord, "\u2132", "\\Finv", true);
defineSymbol(math, ams, textord, "\u2141", "\\Game", true);
defineSymbol(math, ams, textord, "k", "\\Bbbk");
defineSymbol(math, ams, textord, "\u2035", "\\backprime");
defineSymbol(math, ams, textord, "\u25B2", "\\blacktriangle");
defineSymbol(math, ams, textord, "\u25BC", "\\blacktriangledown");
defineSymbol(math, ams, textord, "\u25A0", "\\blacksquare");
defineSymbol(math, ams, textord, "\u29EB", "\\blacklozenge");
defineSymbol(math, ams, textord, "\u2605", "\\bigstar");
defineSymbol(math, ams, textord, "\u2222", "\\sphericalangle", true);
defineSymbol(math, ams, textord, "\u2201", "\\complement", true);
// unicode-math maps U+F0 to \matheth. We map to AMS function \eth
defineSymbol(math, ams, textord, "\xF0", "\\eth", true);
defineSymbol(math, ams, textord, "\u2571", "\\diagup");
defineSymbol(math, ams, textord, "\u2572", "\\diagdown");
defineSymbol(math, ams, textord, "\u25A1", "\\square");
defineSymbol(math, ams, textord, "\u25A1", "\\Box");
defineSymbol(math, ams, textord, "\u25CA", "\\Diamond");
// unicode-math maps U+A5 to \mathyen. We map to AMS function \yen
defineSymbol(math, ams, textord, "\xA5", "\\yen", true);
defineSymbol(math, ams, textord, "\u2713", "\\checkmark", true);
defineSymbol(text, ams, textord, "\u2713", "\\checkmark");

// AMS Hebrew
defineSymbol(math, ams, textord, "\u2136", "\\beth", true);
defineSymbol(math, ams, textord, "\u2138", "\\daleth", true);
defineSymbol(math, ams, textord, "\u2137", "\\gimel", true);

// AMS Greek
defineSymbol(math, ams, textord, "\u03DD", "\\digamma");
defineSymbol(math, ams, textord, "\u03F0", "\\varkappa");

// AMS Delimiters
defineSymbol(math, ams, open, "\u250C", "\\ulcorner");
defineSymbol(math, ams, close, "\u2510", "\\urcorner");
defineSymbol(math, ams, open, "\u2514", "\\llcorner");
defineSymbol(math, ams, close, "\u2518", "\\lrcorner");

// AMS Binary Relations
defineSymbol(math, ams, rel, "\u2266", "\\leqq", true);
defineSymbol(math, ams, rel, "\u2A7D", "\\leqslant");
defineSymbol(math, ams, rel, "\u2A95", "\\eqslantless", true);
defineSymbol(math, ams, rel, "\u2272", "\\lesssim");
defineSymbol(math, ams, rel, "\u2A85", "\\lessapprox");
defineSymbol(math, ams, rel, "\u224A", "\\approxeq", true);
defineSymbol(math, ams, bin, "\u22D6", "\\lessdot");
defineSymbol(math, ams, rel, "\u22D8", "\\lll");
defineSymbol(math, ams, rel, "\u2276", "\\lessgtr");
defineSymbol(math, ams, rel, "\u22DA", "\\lesseqgtr");
defineSymbol(math, ams, rel, "\u2A8B", "\\lesseqqgtr");
defineSymbol(math, ams, rel, "\u2251", "\\doteqdot");
defineSymbol(math, ams, rel, "\u2253", "\\risingdotseq", true);
defineSymbol(math, ams, rel, "\u2252", "\\fallingdotseq", true);
defineSymbol(math, ams, rel, "\u223D", "\\backsim", true);
defineSymbol(math, ams, rel, "\u22CD", "\\backsimeq", true);
defineSymbol(math, ams, rel, "\u2AC5", "\\subseteqq", true);
defineSymbol(math, ams, rel, "\u22D0", "\\Subset", true);
defineSymbol(math, ams, rel, "\u228F", "\\sqsubset", true);
defineSymbol(math, ams, rel, "\u227C", "\\preccurlyeq", true);
defineSymbol(math, ams, rel, "\u22DE", "\\curlyeqprec", true);
defineSymbol(math, ams, rel, "\u227E", "\\precsim", true);
defineSymbol(math, ams, rel, "\u2AB7", "\\precapprox", true);
defineSymbol(math, ams, rel, "\u22B2", "\\vartriangleleft");
defineSymbol(math, ams, rel, "\u22B4", "\\trianglelefteq");
defineSymbol(math, ams, rel, "\u22A8", "\\vDash");
defineSymbol(math, ams, rel, "\u22AA", "\\Vvdash", true);
defineSymbol(math, ams, rel, "\u2323", "\\smallsmile");
defineSymbol(math, ams, rel, "\u2322", "\\smallfrown");
defineSymbol(math, ams, rel, "\u224F", "\\bumpeq", true);
defineSymbol(math, ams, rel, "\u224E", "\\Bumpeq", true);
defineSymbol(math, ams, rel, "\u2267", "\\geqq", true);
defineSymbol(math, ams, rel, "\u2A7E", "\\geqslant", true);
defineSymbol(math, ams, rel, "\u2A96", "\\eqslantgtr", true);
defineSymbol(math, ams, rel, "\u2273", "\\gtrsim", true);
defineSymbol(math, ams, rel, "\u2A86", "\\gtrapprox", true);
defineSymbol(math, ams, bin, "\u22D7", "\\gtrdot");
defineSymbol(math, ams, rel, "\u22D9", "\\ggg", true);
defineSymbol(math, ams, rel, "\u2277", "\\gtrless", true);
defineSymbol(math, ams, rel, "\u22DB", "\\gtreqless", true);
defineSymbol(math, ams, rel, "\u2A8C", "\\gtreqqless", true);
defineSymbol(math, ams, rel, "\u2256", "\\eqcirc", true);
defineSymbol(math, ams, rel, "\u2257", "\\circeq", true);
defineSymbol(math, ams, rel, "\u225C", "\\triangleq", true);
defineSymbol(math, ams, rel, "\u223C", "\\thicksim");
defineSymbol(math, ams, rel, "\u2248", "\\thickapprox");
defineSymbol(math, ams, rel, "\u2AC6", "\\supseteqq", true);
defineSymbol(math, ams, rel, "\u22D1", "\\Supset", true);
defineSymbol(math, ams, rel, "\u2290", "\\sqsupset", true);
defineSymbol(math, ams, rel, "\u227D", "\\succcurlyeq", true);
defineSymbol(math, ams, rel, "\u22DF", "\\curlyeqsucc", true);
defineSymbol(math, ams, rel, "\u227F", "\\succsim", true);
defineSymbol(math, ams, rel, "\u2AB8", "\\succapprox", true);
defineSymbol(math, ams, rel, "\u22B3", "\\vartriangleright");
defineSymbol(math, ams, rel, "\u22B5", "\\trianglerighteq");
defineSymbol(math, ams, rel, "\u22A9", "\\Vdash", true);
defineSymbol(math, ams, rel, "\u2223", "\\shortmid");
defineSymbol(math, ams, rel, "\u2225", "\\shortparallel");
defineSymbol(math, ams, rel, "\u226C", "\\between", true);
defineSymbol(math, ams, rel, "\u22D4", "\\pitchfork", true);
defineSymbol(math, ams, rel, "\u221D", "\\varpropto");
defineSymbol(math, ams, rel, "\u25C0", "\\blacktriangleleft");
// unicode-math says that \therefore is a mathord atom.
// We kept the amssymb atom type, which is rel.
defineSymbol(math, ams, rel, "\u2234", "\\therefore", true);
defineSymbol(math, ams, rel, "\u220D", "\\backepsilon");
defineSymbol(math, ams, rel, "\u25B6", "\\blacktriangleright");
// unicode-math says that \because is a mathord atom.
// We kept the amssymb atom type, which is rel.
defineSymbol(math, ams, rel, "\u2235", "\\because", true);
defineSymbol(math, ams, rel, "\u22D8", "\\llless");
defineSymbol(math, ams, rel, "\u22D9", "\\gggtr");
defineSymbol(math, ams, bin, "\u22B2", "\\lhd");
defineSymbol(math, ams, bin, "\u22B3", "\\rhd");
defineSymbol(math, ams, rel, "\u2242", "\\eqsim", true);
defineSymbol(math, main, rel, "\u22C8", "\\Join");
defineSymbol(math, ams, rel, "\u2251", "\\Doteq", true);

// AMS Binary Operators
defineSymbol(math, ams, bin, "\u2214", "\\dotplus", true);
defineSymbol(math, ams, bin, "\u2216", "\\smallsetminus");
defineSymbol(math, ams, bin, "\u22D2", "\\Cap", true);
defineSymbol(math, ams, bin, "\u22D3", "\\Cup", true);
defineSymbol(math, ams, bin, "\u2A5E", "\\doublebarwedge", true);
defineSymbol(math, ams, bin, "\u229F", "\\boxminus", true);
defineSymbol(math, ams, bin, "\u229E", "\\boxplus", true);
defineSymbol(math, ams, bin, "\u22C7", "\\divideontimes", true);
defineSymbol(math, ams, bin, "\u22C9", "\\ltimes", true);
defineSymbol(math, ams, bin, "\u22CA", "\\rtimes", true);
defineSymbol(math, ams, bin, "\u22CB", "\\leftthreetimes", true);
defineSymbol(math, ams, bin, "\u22CC", "\\rightthreetimes", true);
defineSymbol(math, ams, bin, "\u22CF", "\\curlywedge", true);
defineSymbol(math, ams, bin, "\u22CE", "\\curlyvee", true);
defineSymbol(math, ams, bin, "\u229D", "\\circleddash", true);
defineSymbol(math, ams, bin, "\u229B", "\\circledast", true);
defineSymbol(math, ams, bin, "\u22C5", "\\centerdot");
defineSymbol(math, ams, bin, "\u22BA", "\\intercal", true);
defineSymbol(math, ams, bin, "\u22D2", "\\doublecap");
defineSymbol(math, ams, bin, "\u22D3", "\\doublecup");
defineSymbol(math, ams, bin, "\u22A0", "\\boxtimes", true);

// AMS Arrows
// Note: unicode-math maps \u21e2 to their own function \rightdasharrow.
// We'll map it to AMS function \dashrightarrow. It produces the same atom.
defineSymbol(math, ams, rel, "\u21E2", "\\dashrightarrow", true);
// unicode-math maps \u21e0 to \leftdasharrow. We'll use the AMS synonym.
defineSymbol(math, ams, rel, "\u21E0", "\\dashleftarrow", true);
defineSymbol(math, ams, rel, "\u21C7", "\\leftleftarrows", true);
defineSymbol(math, ams, rel, "\u21C6", "\\leftrightarrows", true);
defineSymbol(math, ams, rel, "\u21DA", "\\Lleftarrow", true);
defineSymbol(math, ams, rel, "\u219E", "\\twoheadleftarrow", true);
defineSymbol(math, ams, rel, "\u21A2", "\\leftarrowtail", true);
defineSymbol(math, ams, rel, "\u21AB", "\\looparrowleft", true);
defineSymbol(math, ams, rel, "\u21CB", "\\leftrightharpoons", true);
defineSymbol(math, ams, rel, "\u21B6", "\\curvearrowleft", true);
// unicode-math maps \u21ba to \acwopencirclearrow. We'll use the AMS synonym.
defineSymbol(math, ams, rel, "\u21BA", "\\circlearrowleft", true);
defineSymbol(math, ams, rel, "\u21B0", "\\Lsh", true);
defineSymbol(math, ams, rel, "\u21C8", "\\upuparrows", true);
defineSymbol(math, ams, rel, "\u21BF", "\\upharpoonleft", true);
defineSymbol(math, ams, rel, "\u21C3", "\\downharpoonleft", true);
defineSymbol(math, ams, rel, "\u22B8", "\\multimap", true);
defineSymbol(math, ams, rel, "\u21AD", "\\leftrightsquigarrow", true);
defineSymbol(math, ams, rel, "\u21C9", "\\rightrightarrows", true);
defineSymbol(math, ams, rel, "\u21C4", "\\rightleftarrows", true);
defineSymbol(math, ams, rel, "\u21A0", "\\twoheadrightarrow", true);
defineSymbol(math, ams, rel, "\u21A3", "\\rightarrowtail", true);
defineSymbol(math, ams, rel, "\u21AC", "\\looparrowright", true);
defineSymbol(math, ams, rel, "\u21B7", "\\curvearrowright", true);
// unicode-math maps \u21bb to \cwopencirclearrow. We'll use the AMS synonym.
defineSymbol(math, ams, rel, "\u21BB", "\\circlearrowright", true);
defineSymbol(math, ams, rel, "\u21B1", "\\Rsh", true);
defineSymbol(math, ams, rel, "\u21CA", "\\downdownarrows", true);
defineSymbol(math, ams, rel, "\u21BE", "\\upharpoonright", true);
defineSymbol(math, ams, rel, "\u21C2", "\\downharpoonright", true);
defineSymbol(math, ams, rel, "\u21DD", "\\rightsquigarrow", true);
defineSymbol(math, ams, rel, "\u21DD", "\\leadsto");
defineSymbol(math, ams, rel, "\u21DB", "\\Rrightarrow", true);
defineSymbol(math, ams, rel, "\u21BE", "\\restriction");

defineSymbol(math, main, textord, "\u2018", "`");
defineSymbol(math, main, textord, "$", "\\$");
defineSymbol(text, main, textord, "$", "\\$");
defineSymbol(text, main, textord, "$", "\\textdollar");
defineSymbol(math, main, textord, "%", "\\%");
defineSymbol(text, main, textord, "%", "\\%");
defineSymbol(math, main, textord, "_", "\\_");
defineSymbol(text, main, textord, "_", "\\_");
defineSymbol(text, main, textord, "_", "\\textunderscore");
defineSymbol(math, main, textord, "\u2220", "\\angle", true);
defineSymbol(math, main, textord, "\u221E", "\\infty", true);
defineSymbol(math, main, textord, "\u2032", "\\prime");
defineSymbol(math, main, textord, "\u25B3", "\\triangle");
defineSymbol(math, main, textord, "\u0393", "\\Gamma", true);
defineSymbol(math, main, textord, "\u0394", "\\Delta", true);
defineSymbol(math, main, textord, "\u0398", "\\Theta", true);
defineSymbol(math, main, textord, "\u039B", "\\Lambda", true);
defineSymbol(math, main, textord, "\u039E", "\\Xi", true);
defineSymbol(math, main, textord, "\u03A0", "\\Pi", true);
defineSymbol(math, main, textord, "\u03A3", "\\Sigma", true);
defineSymbol(math, main, textord, "\u03A5", "\\Upsilon", true);
defineSymbol(math, main, textord, "\u03A6", "\\Phi", true);
defineSymbol(math, main, textord, "\u03A8", "\\Psi", true);
defineSymbol(math, main, textord, "\u03A9", "\\Omega", true);
defineSymbol(math, main, textord, "\xAC", "\\neg");
defineSymbol(math, main, textord, "\xAC", "\\lnot");
defineSymbol(math, main, textord, "\u22A4", "\\top");
defineSymbol(math, main, textord, "\u22A5", "\\bot");
defineSymbol(math, main, textord, "\u2205", "\\emptyset");
defineSymbol(math, ams, textord, "\u2205", "\\varnothing");
defineSymbol(math, main, mathord, "\u03B1", "\\alpha", true);
defineSymbol(math, main, mathord, "\u03B2", "\\beta", true);
defineSymbol(math, main, mathord, "\u03B3", "\\gamma", true);
defineSymbol(math, main, mathord, "\u03B4", "\\delta", true);
defineSymbol(math, main, mathord, "\u03F5", "\\epsilon", true);
defineSymbol(math, main, mathord, "\u03B6", "\\zeta", true);
defineSymbol(math, main, mathord, "\u03B7", "\\eta", true);
defineSymbol(math, main, mathord, "\u03B8", "\\theta", true);
defineSymbol(math, main, mathord, "\u03B9", "\\iota", true);
defineSymbol(math, main, mathord, "\u03BA", "\\kappa", true);
defineSymbol(math, main, mathord, "\u03BB", "\\lambda", true);
defineSymbol(math, main, mathord, "\u03BC", "\\mu", true);
defineSymbol(math, main, mathord, "\u03BD", "\\nu", true);
defineSymbol(math, main, mathord, "\u03BE", "\\xi", true);
defineSymbol(math, main, mathord, "\u03BF", "\\omicron", true);
defineSymbol(math, main, mathord, "\u03C0", "\\pi", true);
defineSymbol(math, main, mathord, "\u03C1", "\\rho", true);
defineSymbol(math, main, mathord, "\u03C3", "\\sigma", true);
defineSymbol(math, main, mathord, "\u03C4", "\\tau", true);
defineSymbol(math, main, mathord, "\u03C5", "\\upsilon", true);
defineSymbol(math, main, mathord, "\u03D5", "\\phi", true);
defineSymbol(math, main, mathord, "\u03C7", "\\chi", true);
defineSymbol(math, main, mathord, "\u03C8", "\\psi", true);
defineSymbol(math, main, mathord, "\u03C9", "\\omega", true);
defineSymbol(math, main, mathord, "\u03B5", "\\varepsilon", true);
defineSymbol(math, main, mathord, "\u03D1", "\\vartheta", true);
defineSymbol(math, main, mathord, "\u03D6", "\\varpi", true);
defineSymbol(math, main, mathord, "\u03F1", "\\varrho", true);
defineSymbol(math, main, mathord, "\u03C2", "\\varsigma", true);
defineSymbol(math, main, mathord, "\u03C6", "\\varphi", true);
defineSymbol(math, main, bin, "\u2217", "*");
defineSymbol(math, main, bin, "+", "+");
defineSymbol(math, main, bin, "\u2212", "-");
defineSymbol(math, main, bin, "\u22C5", "\\cdot", true);
defineSymbol(math, main, bin, "\u2218", "\\circ");
defineSymbol(math, main, bin, "\xF7", "\\div", true);
defineSymbol(math, main, bin, "\xB1", "\\pm", true);
defineSymbol(math, main, bin, "\xD7", "\\times", true);
defineSymbol(math, main, bin, "\u2229", "\\cap", true);
defineSymbol(math, main, bin, "\u222A", "\\cup", true);
defineSymbol(math, main, bin, "\u2216", "\\setminus");
defineSymbol(math, main, bin, "\u2227", "\\land");
defineSymbol(math, main, bin, "\u2228", "\\lor");
defineSymbol(math, main, bin, "\u2227", "\\wedge", true);
defineSymbol(math, main, bin, "\u2228", "\\vee", true);
defineSymbol(math, main, textord, "\u221A", "\\surd");
defineSymbol(math, main, open, "(", "(");
defineSymbol(math, main, open, "[", "[");
defineSymbol(math, main, open, "\u27E8", "\\langle");
defineSymbol(math, main, open, "\u2223", "\\lvert");
defineSymbol(math, main, open, "\u2225", "\\lVert");
defineSymbol(math, main, close, ")", ")");
defineSymbol(math, main, close, "]", "]");
defineSymbol(math, main, close, "?", "?");
defineSymbol(math, main, close, "!", "!");
defineSymbol(math, main, close, "\u27E9", "\\rangle");
defineSymbol(math, main, close, "\u2223", "\\rvert");
defineSymbol(math, main, close, "\u2225", "\\rVert");
defineSymbol(math, main, rel, "=", "=");
defineSymbol(math, main, rel, "<", "<");
defineSymbol(math, main, rel, ">", ">");
defineSymbol(math, main, rel, ":", ":");
defineSymbol(math, main, rel, "\u2248", "\\approx", true);
defineSymbol(math, main, rel, "\u2245", "\\cong", true);
defineSymbol(math, main, rel, "\u2265", "\\ge");
defineSymbol(math, main, rel, "\u2265", "\\geq", true);
defineSymbol(math, main, rel, "\u2190", "\\gets");
defineSymbol(math, main, rel, ">", "\\gt");
defineSymbol(math, main, rel, "\u2208", "\\in", true);
defineSymbol(math, main, rel, "\u2209", "\\notin", true);
defineSymbol(math, main, rel, "\u0338", "\\not");
defineSymbol(math, main, rel, "\u2282", "\\subset", true);
defineSymbol(math, main, rel, "\u2283", "\\supset", true);
defineSymbol(math, main, rel, "\u2286", "\\subseteq", true);
defineSymbol(math, main, rel, "\u2287", "\\supseteq", true);
defineSymbol(math, ams, rel, "\u2288", "\\nsubseteq", true);
defineSymbol(math, ams, rel, "\u2289", "\\nsupseteq", true);
defineSymbol(math, main, rel, "\u22A8", "\\models");
defineSymbol(math, main, rel, "\u2190", "\\leftarrow", true);
defineSymbol(math, main, rel, "\u2264", "\\le");
defineSymbol(math, main, rel, "\u2264", "\\leq", true);
defineSymbol(math, main, rel, "<", "\\lt");
defineSymbol(math, main, rel, "\u2260", "\\ne", true);
defineSymbol(math, main, rel, "\u2260", "\\neq");
defineSymbol(math, main, rel, "\u2192", "\\rightarrow", true);
defineSymbol(math, main, rel, "\u2192", "\\to");
defineSymbol(math, ams, rel, "\u2271", "\\ngeq", true);
defineSymbol(math, ams, rel, "\u2270", "\\nleq", true);
defineSymbol(math, main, spacing, null, "\\!");
defineSymbol(math, main, spacing, "\xA0", "\\ ");
defineSymbol(math, main, spacing, "\xA0", "~");
defineSymbol(math, main, spacing, null, "\\,");
defineSymbol(math, main, spacing, null, "\\:");
defineSymbol(math, main, spacing, null, "\\;");
defineSymbol(math, main, spacing, null, "\\enspace");
defineSymbol(math, main, spacing, null, "\\qquad");
defineSymbol(math, main, spacing, null, "\\quad");
defineSymbol(math, main, spacing, "\xA0", "\\space");
defineSymbol(math, main, punct, ",", ",");
defineSymbol(math, main, punct, ";", ";");
defineSymbol(math, main, punct, ":", "\\colon");
defineSymbol(math, ams, bin, "\u22BC", "\\barwedge", true);
defineSymbol(math, ams, bin, "\u22BB", "\\veebar", true);
defineSymbol(math, main, bin, "\u2299", "\\odot", true);
defineSymbol(math, main, bin, "\u2295", "\\oplus", true);
defineSymbol(math, main, bin, "\u2297", "\\otimes", true);
defineSymbol(math, main, textord, "\u2202", "\\partial", true);
defineSymbol(math, main, bin, "\u2298", "\\oslash", true);
defineSymbol(math, ams, bin, "\u229A", "\\circledcirc", true);
defineSymbol(math, ams, bin, "\u22A1", "\\boxdot", true);
defineSymbol(math, main, bin, "\u25B3", "\\bigtriangleup");
defineSymbol(math, main, bin, "\u25BD", "\\bigtriangledown");
defineSymbol(math, main, bin, "\u2020", "\\dagger");
defineSymbol(math, main, bin, "\u22C4", "\\diamond");
defineSymbol(math, main, bin, "\u22C6", "\\star");
defineSymbol(math, main, bin, "\u25C3", "\\triangleleft");
defineSymbol(math, main, bin, "\u25B9", "\\triangleright");
defineSymbol(math, main, open, "{", "\\{");
defineSymbol(text, main, textord, "{", "\\{");
defineSymbol(text, main, textord, "{", "\\textbraceleft");
defineSymbol(math, main, close, "}", "\\}");
defineSymbol(text, main, textord, "}", "\\}");
defineSymbol(text, main, textord, "}", "\\textbraceright");
defineSymbol(math, main, open, "{", "\\lbrace");
defineSymbol(math, main, close, "}", "\\rbrace");
defineSymbol(math, main, open, "[", "\\lbrack");
defineSymbol(math, main, close, "]", "\\rbrack");
defineSymbol(text, main, textord, "<", "\\textless"); // in T1 fontenc
defineSymbol(text, main, textord, ">", "\\textgreater"); // in T1 fontenc
defineSymbol(math, main, open, "\u230A", "\\lfloor");
defineSymbol(math, main, close, "\u230B", "\\rfloor");
defineSymbol(math, main, open, "\u2308", "\\lceil");
defineSymbol(math, main, close, "\u2309", "\\rceil");
defineSymbol(math, main, textord, "\\", "\\backslash");
defineSymbol(math, main, textord, "\u2223", "|");
defineSymbol(math, main, textord, "\u2223", "\\vert");
defineSymbol(text, main, textord, "|", "\\textbar"); // in T1 fontenc
defineSymbol(math, main, textord, "\u2225", "\\|");
defineSymbol(math, main, textord, "\u2225", "\\Vert");
defineSymbol(text, main, textord, "\u2225", "\\textbardbl");
defineSymbol(math, main, rel, "\u2191", "\\uparrow", true);
defineSymbol(math, main, rel, "\u21D1", "\\Uparrow", true);
defineSymbol(math, main, rel, "\u2193", "\\downarrow", true);
defineSymbol(math, main, rel, "\u21D3", "\\Downarrow", true);
defineSymbol(math, main, rel, "\u2195", "\\updownarrow", true);
defineSymbol(math, main, rel, "\u21D5", "\\Updownarrow", true);
defineSymbol(math, main, op, "\u2210", "\\coprod");
defineSymbol(math, main, op, "\u22C1", "\\bigvee");
defineSymbol(math, main, op, "\u22C0", "\\bigwedge");
defineSymbol(math, main, op, "\u2A04", "\\biguplus");
defineSymbol(math, main, op, "\u22C2", "\\bigcap");
defineSymbol(math, main, op, "\u22C3", "\\bigcup");
defineSymbol(math, main, op, "\u222B", "\\int");
defineSymbol(math, main, op, "\u222B", "\\intop");
defineSymbol(math, main, op, "\u222C", "\\iint");
defineSymbol(math, main, op, "\u222D", "\\iiint");
defineSymbol(math, main, op, "\u220F", "\\prod");
defineSymbol(math, main, op, "\u2211", "\\sum");
defineSymbol(math, main, op, "\u2A02", "\\bigotimes");
defineSymbol(math, main, op, "\u2A01", "\\bigoplus");
defineSymbol(math, main, op, "\u2A00", "\\bigodot");
defineSymbol(math, main, op, "\u222E", "\\oint");
defineSymbol(math, main, op, "\u2A06", "\\bigsqcup");
defineSymbol(math, main, op, "\u222B", "\\smallint");
defineSymbol(text, main, inner, "\u2026", "\\textellipsis");
defineSymbol(math, main, inner, "\u2026", "\\mathellipsis");
defineSymbol(text, main, inner, "\u2026", "\\ldots", true);
defineSymbol(math, main, inner, "\u2026", "\\ldots", true);
defineSymbol(math, main, inner, "\u22EF", "\\@cdots", true);
defineSymbol(math, main, inner, "\u22F1", "\\ddots", true);
defineSymbol(math, main, textord, "\u22EE", "\\vdots", true);
defineSymbol(math, main, accent, "\xB4", "\\acute");
defineSymbol(math, main, accent, "`", "\\grave");
defineSymbol(math, main, accent, "\xA8", "\\ddot");
defineSymbol(math, main, accent, "~", "\\tilde");
defineSymbol(math, main, accent, "\xAF", "\\bar");
defineSymbol(math, main, accent, "\u02D8", "\\breve");
defineSymbol(math, main, accent, "\u02C7", "\\check");
defineSymbol(math, main, accent, "^", "\\hat");
defineSymbol(math, main, accent, "\u20D7", "\\vec");
defineSymbol(math, main, accent, "\u02D9", "\\dot");
defineSymbol(math, main, mathord, "\u0131", "\\imath", true);
defineSymbol(math, main, mathord, "\u0237", "\\jmath", true);
defineSymbol(text, main, textord, "\u0131", "\\i", true);
defineSymbol(text, main, textord, "\u0237", "\\j", true);
defineSymbol(text, main, textord, "\xDF", "\\ss", true);
defineSymbol(text, main, textord, "\xE6", "\\ae", true);
defineSymbol(text, main, textord, "\xE6", "\\ae", true);
defineSymbol(text, main, textord, "\u0153", "\\oe", true);
defineSymbol(text, main, textord, "\xF8", "\\o", true);
defineSymbol(text, main, textord, "\xC6", "\\AE", true);
defineSymbol(text, main, textord, "\u0152", "\\OE", true);
defineSymbol(text, main, textord, "\xD8", "\\O", true);
defineSymbol(text, main, accent, "\u02CA", "\\'"); // acute
defineSymbol(text, main, accent, "\u02CB", "\\`"); // grave
defineSymbol(text, main, accent, "\u02C6", "\\^"); // circumflex
defineSymbol(text, main, accent, "\u02DC", "\\~"); // tilde
defineSymbol(text, main, accent, "\u02C9", "\\="); // macron
defineSymbol(text, main, accent, "\u02D8", "\\u"); // breve
defineSymbol(text, main, accent, "\u02D9", "\\."); // dot above
defineSymbol(text, main, accent, "\u02DA", "\\r"); // ring above
defineSymbol(text, main, accent, "\u02C7", "\\v"); // caron
defineSymbol(text, main, accent, "\xA8", '\\"'); // diaresis
defineSymbol(text, main, accent, "\u030B", "\\H"); // double acute

defineSymbol(text, main, textord, "\u2013", "--");
defineSymbol(text, main, textord, "\u2013", "\\textendash");
defineSymbol(text, main, textord, "\u2014", "---");
defineSymbol(text, main, textord, "\u2014", "\\textemdash");
defineSymbol(text, main, textord, "\u2018", "`");
defineSymbol(text, main, textord, "\u2018", "\\textquoteleft");
defineSymbol(text, main, textord, "\u2019", "'");
defineSymbol(text, main, textord, "\u2019", "\\textquoteright");
defineSymbol(text, main, textord, "\u201C", "``");
defineSymbol(text, main, textord, "\u201C", "\\textquotedblleft");
defineSymbol(text, main, textord, "\u201D", "''");
defineSymbol(text, main, textord, "\u201D", "\\textquotedblright");
defineSymbol(math, main, textord, "\xB0", "\\degree");
defineSymbol(text, main, textord, "\xB0", "\\degree");
// TODO: In LaTeX, \pounds can generate a different character in text and math
// mode, but among our fonts, only Main-Italic defines this character "163".
defineSymbol(math, main, mathord, "\xA3", "\\pounds");
defineSymbol(math, main, mathord, "\xA3", "\\mathsterling", true);
defineSymbol(text, main, mathord, "\xA3", "\\pounds");
defineSymbol(text, main, mathord, "\xA3", "\\textsterling", true);
defineSymbol(math, ams, textord, "\u2720", "\\maltese");
defineSymbol(text, ams, textord, "\u2720", "\\maltese");

defineSymbol(text, main, spacing, "\xA0", "\\ ");
defineSymbol(text, main, spacing, "\xA0", " ");
defineSymbol(text, main, spacing, "\xA0", "~");

// There are lots of symbols which are the same, so we add them in afterwards.

// All of these are textords in math mode
var mathTextSymbols = "0123456789/@.\"";
for (var i = 0; i < mathTextSymbols.length; i++) {
    var ch = mathTextSymbols.charAt(i);
    defineSymbol(math, main, textord, ch, ch);
}

// All of these are textords in text mode
var textSymbols = "0123456789!@*()-=+[]<>|\";:?/.,";
for (var _i = 0; _i < textSymbols.length; _i++) {
    var _ch = textSymbols.charAt(_i);
    defineSymbol(text, main, textord, _ch, _ch);
}

// All of these are textords in text mode, and mathords in math mode
var letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
for (var _i2 = 0; _i2 < letters.length; _i2++) {
    var _ch2 = letters.charAt(_i2);
    defineSymbol(math, main, mathord, _ch2, _ch2);
    defineSymbol(text, main, textord, _ch2, _ch2);
}

// We add these Latin-1 letters as symbols for backwards-compatibility,
// but they are not actually in the font, nor are they supported by the
// Unicode accent mechanism, so they fall back to Times font and look ugly.
// TODO(edemaine): Fix this.
var extraLatin = "ÇÐÞçðþ";
for (var _i3 = 0; _i3 < extraLatin.length; _i3++) {
    var _ch3 = extraLatin.charAt(_i3);
    defineSymbol(math, main, mathord, _ch3, _ch3);
    defineSymbol(text, main, textord, _ch3, _ch3);
}
var extraLatinMath = "Åå";
for (var _i4 = 0; _i4 < extraLatinMath.length; _i4++) {
    var _ch4 = extraLatinMath.charAt(_i4);
    defineSymbol(math, main, mathord, _ch4, _ch4);
}

// Cyrillic
for (var _i5 = 0x0410; _i5 <= 0x044F; _i5++) {
    var _ch5 = String.fromCharCode(_i5);
    defineSymbol(text, main, textord, _ch5, _ch5);
}

// Unicode versions of existing characters
defineSymbol(text, main, textord, "\u2013", "–");
defineSymbol(text, main, textord, "\u2014", "—");
defineSymbol(text, main, textord, "\u2018", "‘");
defineSymbol(text, main, textord, "\u2019", "’");
defineSymbol(text, main, textord, "\u201C", "“");
defineSymbol(text, main, textord, "\u201D", "”");

},{}],129:[function(require,module,exports){
'use strict';

// Mapping of Unicode accent characters to their LaTeX equivalent in text and
// math mode (when they exist).

// NOTE: This module needs to be written with Node-style modules (not
// ES6 modules) so that unicodeMake.js (a Node application) can import it.
module.exports = {
    '\u0301': { text: "\\'", math: '\\acute' },
    '\u0300': { text: '\\`', math: '\\grave' },
    '\u0308': { text: '\\"', math: '\\ddot' },
    '\u0303': { text: '\\~', math: '\\tilde' },
    '\u0304': { text: '\\=', math: '\\bar' },
    '\u0306': { text: '\\u', math: '\\breve' },
    '\u030C': { text: '\\v', math: '\\check' },
    '\u0302': { text: '\\^', math: '\\hat' },
    '\u0307': { text: '\\.', math: '\\dot' },
    '\u030A': { text: '\\r' },
    '\u030B': { text: '\\H' }
};

},{}],130:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

exports.scriptFromCodepoint = scriptFromCodepoint;
exports.supportedCodepoint = supportedCodepoint;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Unicode block data for the families of scripts we support.
 */
var scriptData = [{
    // Chinese and Japanese.
    // The "k" in cjk is for Korean, but we've separated Korean out
    name: "cjk",
    blocks: [[0x3000, 0x30FF], // CJK symbols and punctuation, Hiragana, Katakana
    [0x4E00, 0x9FAF], // CJK ideograms
    [0xFF00, 0xFF60]]
}, {
    // Korean
    name: 'hangul',
    blocks: [[0xAC00, 0xD7AF]]
}, {
    // The Brahmic scripts of South and Southeast Asia
    // Devanagari (0900–097F)
    // Bengali (0980–09FF)
    // Gurmukhi (0A00–0A7F)
    // Gujarati (0A80–0AFF)
    // Oriya (0B00–0B7F)
    // Tamil (0B80–0BFF)
    // Telugu (0C00–0C7F)
    // Kannada (0C80–0CFF)
    // Malayalam (0D00–0D7F)
    // Sinhala (0D80–0DFF)
    // Thai (0E00–0E7F)
    // Lao (0E80–0EFF)
    // Tibetan (0F00–0FFF)
    // Myanmar (1000–109F)
    name: 'brahmic',
    blocks: [[0x0900, 0x109F]]
}];

/**
 * Given a codepoint, return the name of the script or script family
 * it is from, or null if it is not part of a known block
 */


/*
 * This file defines the Unicode scripts and script families that we
 * support. To add new scripts or families, just add a new entry to the
 * scriptData array below. Adding scripts to the scriptData array allows
 * characters from that script to appear in \text{} environments.
 */

/**
 * Each script or script family has a name and an array of blocks.
 * Each block is an array of two numbers which specify the start and
 * end points (inclusive) of a block of Unicode codepoints.
 */
function scriptFromCodepoint(codepoint) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = (0, _getIterator3.default)(scriptData), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var script = _step.value;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = (0, _getIterator3.default)(script.blocks), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var block = _step2.value;

                    if (codepoint >= block[0] && codepoint <= block[1]) {
                        return script.name;
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return null;
}

/**
 * A flattened version of all the supported blocks in a single array.
 * This is an optimization to make supportedCodepoint() fast.
 */
var allBlocks = [];
scriptData.forEach(function (s) {
    return s.blocks.forEach(function (b) {
        return allBlocks.push.apply(allBlocks, (0, _toConsumableArray3.default)(b));
    });
});

/**
 * Given a codepoint, return true if it falls within one of the
 * scripts or script families defined above and false otherwise.
 *
 * Micro benchmarks shows that this is faster than
 * /[\u3000-\u30FF\u4E00-\u9FAF\uFF00-\uFF60\uAC00-\uD7AF\u0900-\u109F]/.test()
 * in Firefox, Chrome and Node.
 */
function supportedCodepoint(codepoint) {
    for (var i = 0; i < allBlocks.length; i += 2) {
        if (codepoint >= allBlocks[i] && codepoint <= allBlocks[i + 1]) {
            return true;
        }
    }
    return false;
}

},{"babel-runtime/core-js/get-iterator":3,"babel-runtime/helpers/toConsumableArray":11}],131:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
// This file is GENERATED by unicodeMake.js. DO NOT MODIFY.

exports.default = {
    "\xE1": "a\u0301", // á = \'{a}
    "\xE0": "a\u0300", // à = \`{a}
    "\xE4": "a\u0308", // ä = \"{a}
    "\u01DF": "a\u0308\u0304", // ǟ = \"\={a}
    "\xE3": "a\u0303", // ã = \~{a}
    "\u0101": "a\u0304", // ā = \={a}
    "\u0103": "a\u0306", // ă = \u{a}
    "\u1EAF": "a\u0306\u0301", // ắ = \u\'{a}
    "\u1EB1": "a\u0306\u0300", // ằ = \u\`{a}
    "\u1EB5": "a\u0306\u0303", // ẵ = \u\~{a}
    "\u01CE": "a\u030C", // ǎ = \v{a}
    "\xE2": "a\u0302", // â = \^{a}
    "\u1EA5": "a\u0302\u0301", // ấ = \^\'{a}
    "\u1EA7": "a\u0302\u0300", // ầ = \^\`{a}
    "\u1EAB": "a\u0302\u0303", // ẫ = \^\~{a}
    "\u0227": "a\u0307", // ȧ = \.{a}
    "\u01E1": "a\u0307\u0304", // ǡ = \.\={a}
    "\xE5": "a\u030A", // å = \r{a}
    "\u01FB": "a\u030A\u0301", // ǻ = \r\'{a}
    "\u1E03": "b\u0307", // ḃ = \.{b}
    "\u0107": "c\u0301", // ć = \'{c}
    "\u010D": "c\u030C", // č = \v{c}
    "\u0109": "c\u0302", // ĉ = \^{c}
    "\u010B": "c\u0307", // ċ = \.{c}
    "\u010F": "d\u030C", // ď = \v{d}
    "\u1E0B": "d\u0307", // ḋ = \.{d}
    "\xE9": "e\u0301", // é = \'{e}
    "\xE8": "e\u0300", // è = \`{e}
    "\xEB": "e\u0308", // ë = \"{e}
    "\u1EBD": "e\u0303", // ẽ = \~{e}
    "\u0113": "e\u0304", // ē = \={e}
    "\u1E17": "e\u0304\u0301", // ḗ = \=\'{e}
    "\u1E15": "e\u0304\u0300", // ḕ = \=\`{e}
    "\u0115": "e\u0306", // ĕ = \u{e}
    "\u011B": "e\u030C", // ě = \v{e}
    "\xEA": "e\u0302", // ê = \^{e}
    "\u1EBF": "e\u0302\u0301", // ế = \^\'{e}
    "\u1EC1": "e\u0302\u0300", // ề = \^\`{e}
    "\u1EC5": "e\u0302\u0303", // ễ = \^\~{e}
    "\u0117": "e\u0307", // ė = \.{e}
    "\u1E1F": "f\u0307", // ḟ = \.{f}
    "\u01F5": "g\u0301", // ǵ = \'{g}
    "\u1E21": "g\u0304", // ḡ = \={g}
    "\u011F": "g\u0306", // ğ = \u{g}
    "\u01E7": "g\u030C", // ǧ = \v{g}
    "\u011D": "g\u0302", // ĝ = \^{g}
    "\u0121": "g\u0307", // ġ = \.{g}
    "\u1E27": "h\u0308", // ḧ = \"{h}
    "\u021F": "h\u030C", // ȟ = \v{h}
    "\u0125": "h\u0302", // ĥ = \^{h}
    "\u1E23": "h\u0307", // ḣ = \.{h}
    "\xED": "i\u0301", // í = \'{i}
    "\xEC": "i\u0300", // ì = \`{i}
    "\xEF": "i\u0308", // ï = \"{i}
    "\u1E2F": "i\u0308\u0301", // ḯ = \"\'{i}
    "\u0129": "i\u0303", // ĩ = \~{i}
    "\u012B": "i\u0304", // ī = \={i}
    "\u012D": "i\u0306", // ĭ = \u{i}
    "\u01D0": "i\u030C", // ǐ = \v{i}
    "\xEE": "i\u0302", // î = \^{i}
    "\u01F0": "j\u030C", // ǰ = \v{j}
    "\u0135": "j\u0302", // ĵ = \^{j}
    "\u1E31": "k\u0301", // ḱ = \'{k}
    "\u01E9": "k\u030C", // ǩ = \v{k}
    "\u013A": "l\u0301", // ĺ = \'{l}
    "\u013E": "l\u030C", // ľ = \v{l}
    "\u1E3F": "m\u0301", // ḿ = \'{m}
    "\u1E41": "m\u0307", // ṁ = \.{m}
    "\u0144": "n\u0301", // ń = \'{n}
    "\u01F9": "n\u0300", // ǹ = \`{n}
    "\xF1": "n\u0303", // ñ = \~{n}
    "\u0148": "n\u030C", // ň = \v{n}
    "\u1E45": "n\u0307", // ṅ = \.{n}
    "\xF3": "o\u0301", // ó = \'{o}
    "\xF2": "o\u0300", // ò = \`{o}
    "\xF6": "o\u0308", // ö = \"{o}
    "\u022B": "o\u0308\u0304", // ȫ = \"\={o}
    "\xF5": "o\u0303", // õ = \~{o}
    "\u1E4D": "o\u0303\u0301", // ṍ = \~\'{o}
    "\u1E4F": "o\u0303\u0308", // ṏ = \~\"{o}
    "\u022D": "o\u0303\u0304", // ȭ = \~\={o}
    "\u014D": "o\u0304", // ō = \={o}
    "\u1E53": "o\u0304\u0301", // ṓ = \=\'{o}
    "\u1E51": "o\u0304\u0300", // ṑ = \=\`{o}
    "\u014F": "o\u0306", // ŏ = \u{o}
    "\u01D2": "o\u030C", // ǒ = \v{o}
    "\xF4": "o\u0302", // ô = \^{o}
    "\u1ED1": "o\u0302\u0301", // ố = \^\'{o}
    "\u1ED3": "o\u0302\u0300", // ồ = \^\`{o}
    "\u1ED7": "o\u0302\u0303", // ỗ = \^\~{o}
    "\u022F": "o\u0307", // ȯ = \.{o}
    "\u0231": "o\u0307\u0304", // ȱ = \.\={o}
    "\u0151": "o\u030B", // ő = \H{o}
    "\u1E55": "p\u0301", // ṕ = \'{p}
    "\u1E57": "p\u0307", // ṗ = \.{p}
    "\u0155": "r\u0301", // ŕ = \'{r}
    "\u0159": "r\u030C", // ř = \v{r}
    "\u1E59": "r\u0307", // ṙ = \.{r}
    "\u015B": "s\u0301", // ś = \'{s}
    "\u1E65": "s\u0301\u0307", // ṥ = \'\.{s}
    "\u0161": "s\u030C", // š = \v{s}
    "\u1E67": "s\u030C\u0307", // ṧ = \v\.{s}
    "\u015D": "s\u0302", // ŝ = \^{s}
    "\u1E61": "s\u0307", // ṡ = \.{s}
    "\u1E97": "t\u0308", // ẗ = \"{t}
    "\u0165": "t\u030C", // ť = \v{t}
    "\u1E6B": "t\u0307", // ṫ = \.{t}
    "\xFA": "u\u0301", // ú = \'{u}
    "\xF9": "u\u0300", // ù = \`{u}
    "\xFC": "u\u0308", // ü = \"{u}
    "\u01D8": "u\u0308\u0301", // ǘ = \"\'{u}
    "\u01DC": "u\u0308\u0300", // ǜ = \"\`{u}
    "\u01D6": "u\u0308\u0304", // ǖ = \"\={u}
    "\u01DA": "u\u0308\u030C", // ǚ = \"\v{u}
    "\u0169": "u\u0303", // ũ = \~{u}
    "\u1E79": "u\u0303\u0301", // ṹ = \~\'{u}
    "\u016B": "u\u0304", // ū = \={u}
    "\u1E7B": "u\u0304\u0308", // ṻ = \=\"{u}
    "\u016D": "u\u0306", // ŭ = \u{u}
    "\u01D4": "u\u030C", // ǔ = \v{u}
    "\xFB": "u\u0302", // û = \^{u}
    "\u016F": "u\u030A", // ů = \r{u}
    "\u0171": "u\u030B", // ű = \H{u}
    "\u1E7D": "v\u0303", // ṽ = \~{v}
    "\u1E83": "w\u0301", // ẃ = \'{w}
    "\u1E81": "w\u0300", // ẁ = \`{w}
    "\u1E85": "w\u0308", // ẅ = \"{w}
    "\u0175": "w\u0302", // ŵ = \^{w}
    "\u1E87": "w\u0307", // ẇ = \.{w}
    "\u1E98": "w\u030A", // ẘ = \r{w}
    "\u1E8D": "x\u0308", // ẍ = \"{x}
    "\u1E8B": "x\u0307", // ẋ = \.{x}
    "\xFD": "y\u0301", // ý = \'{y}
    "\u1EF3": "y\u0300", // ỳ = \`{y}
    "\xFF": "y\u0308", // ÿ = \"{y}
    "\u1EF9": "y\u0303", // ỹ = \~{y}
    "\u0233": "y\u0304", // ȳ = \={y}
    "\u0177": "y\u0302", // ŷ = \^{y}
    "\u1E8F": "y\u0307", // ẏ = \.{y}
    "\u1E99": "y\u030A", // ẙ = \r{y}
    "\u017A": "z\u0301", // ź = \'{z}
    "\u017E": "z\u030C", // ž = \v{z}
    "\u1E91": "z\u0302", // ẑ = \^{z}
    "\u017C": "z\u0307", // ż = \.{z}
    "\xC1": "A\u0301", // Á = \'{A}
    "\xC0": "A\u0300", // À = \`{A}
    "\xC4": "A\u0308", // Ä = \"{A}
    "\u01DE": "A\u0308\u0304", // Ǟ = \"\={A}
    "\xC3": "A\u0303", // Ã = \~{A}
    "\u0100": "A\u0304", // Ā = \={A}
    "\u0102": "A\u0306", // Ă = \u{A}
    "\u1EAE": "A\u0306\u0301", // Ắ = \u\'{A}
    "\u1EB0": "A\u0306\u0300", // Ằ = \u\`{A}
    "\u1EB4": "A\u0306\u0303", // Ẵ = \u\~{A}
    "\u01CD": "A\u030C", // Ǎ = \v{A}
    "\xC2": "A\u0302", // Â = \^{A}
    "\u1EA4": "A\u0302\u0301", // Ấ = \^\'{A}
    "\u1EA6": "A\u0302\u0300", // Ầ = \^\`{A}
    "\u1EAA": "A\u0302\u0303", // Ẫ = \^\~{A}
    "\u0226": "A\u0307", // Ȧ = \.{A}
    "\u01E0": "A\u0307\u0304", // Ǡ = \.\={A}
    "\xC5": "A\u030A", // Å = \r{A}
    "\u01FA": "A\u030A\u0301", // Ǻ = \r\'{A}
    "\u1E02": "B\u0307", // Ḃ = \.{B}
    "\u0106": "C\u0301", // Ć = \'{C}
    "\u010C": "C\u030C", // Č = \v{C}
    "\u0108": "C\u0302", // Ĉ = \^{C}
    "\u010A": "C\u0307", // Ċ = \.{C}
    "\u010E": "D\u030C", // Ď = \v{D}
    "\u1E0A": "D\u0307", // Ḋ = \.{D}
    "\xC9": "E\u0301", // É = \'{E}
    "\xC8": "E\u0300", // È = \`{E}
    "\xCB": "E\u0308", // Ë = \"{E}
    "\u1EBC": "E\u0303", // Ẽ = \~{E}
    "\u0112": "E\u0304", // Ē = \={E}
    "\u1E16": "E\u0304\u0301", // Ḗ = \=\'{E}
    "\u1E14": "E\u0304\u0300", // Ḕ = \=\`{E}
    "\u0114": "E\u0306", // Ĕ = \u{E}
    "\u011A": "E\u030C", // Ě = \v{E}
    "\xCA": "E\u0302", // Ê = \^{E}
    "\u1EBE": "E\u0302\u0301", // Ế = \^\'{E}
    "\u1EC0": "E\u0302\u0300", // Ề = \^\`{E}
    "\u1EC4": "E\u0302\u0303", // Ễ = \^\~{E}
    "\u0116": "E\u0307", // Ė = \.{E}
    "\u1E1E": "F\u0307", // Ḟ = \.{F}
    "\u01F4": "G\u0301", // Ǵ = \'{G}
    "\u1E20": "G\u0304", // Ḡ = \={G}
    "\u011E": "G\u0306", // Ğ = \u{G}
    "\u01E6": "G\u030C", // Ǧ = \v{G}
    "\u011C": "G\u0302", // Ĝ = \^{G}
    "\u0120": "G\u0307", // Ġ = \.{G}
    "\u1E26": "H\u0308", // Ḧ = \"{H}
    "\u021E": "H\u030C", // Ȟ = \v{H}
    "\u0124": "H\u0302", // Ĥ = \^{H}
    "\u1E22": "H\u0307", // Ḣ = \.{H}
    "\xCD": "I\u0301", // Í = \'{I}
    "\xCC": "I\u0300", // Ì = \`{I}
    "\xCF": "I\u0308", // Ï = \"{I}
    "\u1E2E": "I\u0308\u0301", // Ḯ = \"\'{I}
    "\u0128": "I\u0303", // Ĩ = \~{I}
    "\u012A": "I\u0304", // Ī = \={I}
    "\u012C": "I\u0306", // Ĭ = \u{I}
    "\u01CF": "I\u030C", // Ǐ = \v{I}
    "\xCE": "I\u0302", // Î = \^{I}
    "\u0130": "I\u0307", // İ = \.{I}
    "\u0134": "J\u0302", // Ĵ = \^{J}
    "\u1E30": "K\u0301", // Ḱ = \'{K}
    "\u01E8": "K\u030C", // Ǩ = \v{K}
    "\u0139": "L\u0301", // Ĺ = \'{L}
    "\u013D": "L\u030C", // Ľ = \v{L}
    "\u1E3E": "M\u0301", // Ḿ = \'{M}
    "\u1E40": "M\u0307", // Ṁ = \.{M}
    "\u0143": "N\u0301", // Ń = \'{N}
    "\u01F8": "N\u0300", // Ǹ = \`{N}
    "\xD1": "N\u0303", // Ñ = \~{N}
    "\u0147": "N\u030C", // Ň = \v{N}
    "\u1E44": "N\u0307", // Ṅ = \.{N}
    "\xD3": "O\u0301", // Ó = \'{O}
    "\xD2": "O\u0300", // Ò = \`{O}
    "\xD6": "O\u0308", // Ö = \"{O}
    "\u022A": "O\u0308\u0304", // Ȫ = \"\={O}
    "\xD5": "O\u0303", // Õ = \~{O}
    "\u1E4C": "O\u0303\u0301", // Ṍ = \~\'{O}
    "\u1E4E": "O\u0303\u0308", // Ṏ = \~\"{O}
    "\u022C": "O\u0303\u0304", // Ȭ = \~\={O}
    "\u014C": "O\u0304", // Ō = \={O}
    "\u1E52": "O\u0304\u0301", // Ṓ = \=\'{O}
    "\u1E50": "O\u0304\u0300", // Ṑ = \=\`{O}
    "\u014E": "O\u0306", // Ŏ = \u{O}
    "\u01D1": "O\u030C", // Ǒ = \v{O}
    "\xD4": "O\u0302", // Ô = \^{O}
    "\u1ED0": "O\u0302\u0301", // Ố = \^\'{O}
    "\u1ED2": "O\u0302\u0300", // Ồ = \^\`{O}
    "\u1ED6": "O\u0302\u0303", // Ỗ = \^\~{O}
    "\u022E": "O\u0307", // Ȯ = \.{O}
    "\u0230": "O\u0307\u0304", // Ȱ = \.\={O}
    "\u0150": "O\u030B", // Ő = \H{O}
    "\u1E54": "P\u0301", // Ṕ = \'{P}
    "\u1E56": "P\u0307", // Ṗ = \.{P}
    "\u0154": "R\u0301", // Ŕ = \'{R}
    "\u0158": "R\u030C", // Ř = \v{R}
    "\u1E58": "R\u0307", // Ṙ = \.{R}
    "\u015A": "S\u0301", // Ś = \'{S}
    "\u1E64": "S\u0301\u0307", // Ṥ = \'\.{S}
    "\u0160": "S\u030C", // Š = \v{S}
    "\u1E66": "S\u030C\u0307", // Ṧ = \v\.{S}
    "\u015C": "S\u0302", // Ŝ = \^{S}
    "\u1E60": "S\u0307", // Ṡ = \.{S}
    "\u0164": "T\u030C", // Ť = \v{T}
    "\u1E6A": "T\u0307", // Ṫ = \.{T}
    "\xDA": "U\u0301", // Ú = \'{U}
    "\xD9": "U\u0300", // Ù = \`{U}
    "\xDC": "U\u0308", // Ü = \"{U}
    "\u01D7": "U\u0308\u0301", // Ǘ = \"\'{U}
    "\u01DB": "U\u0308\u0300", // Ǜ = \"\`{U}
    "\u01D5": "U\u0308\u0304", // Ǖ = \"\={U}
    "\u01D9": "U\u0308\u030C", // Ǚ = \"\v{U}
    "\u0168": "U\u0303", // Ũ = \~{U}
    "\u1E78": "U\u0303\u0301", // Ṹ = \~\'{U}
    "\u016A": "U\u0304", // Ū = \={U}
    "\u1E7A": "U\u0304\u0308", // Ṻ = \=\"{U}
    "\u016C": "U\u0306", // Ŭ = \u{U}
    "\u01D3": "U\u030C", // Ǔ = \v{U}
    "\xDB": "U\u0302", // Û = \^{U}
    "\u016E": "U\u030A", // Ů = \r{U}
    "\u0170": "U\u030B", // Ű = \H{U}
    "\u1E7C": "V\u0303", // Ṽ = \~{V}
    "\u1E82": "W\u0301", // Ẃ = \'{W}
    "\u1E80": "W\u0300", // Ẁ = \`{W}
    "\u1E84": "W\u0308", // Ẅ = \"{W}
    "\u0174": "W\u0302", // Ŵ = \^{W}
    "\u1E86": "W\u0307", // Ẇ = \.{W}
    "\u1E8C": "X\u0308", // Ẍ = \"{X}
    "\u1E8A": "X\u0307", // Ẋ = \.{X}
    "\xDD": "Y\u0301", // Ý = \'{Y}
    "\u1EF2": "Y\u0300", // Ỳ = \`{Y}
    "\u0178": "Y\u0308", // Ÿ = \"{Y}
    "\u1EF8": "Y\u0303", // Ỹ = \~{Y}
    "\u0232": "Y\u0304", // Ȳ = \={Y}
    "\u0176": "Y\u0302", // Ŷ = \^{Y}
    "\u1E8E": "Y\u0307", // Ẏ = \.{Y}
    "\u0179": "Z\u0301", // Ź = \'{Z}
    "\u017D": "Z\u030C", // Ž = \v{Z}
    "\u1E90": "Z\u0302", // Ẑ = \^{Z}
    "\u017B": "Z\u0307", // Ż = \.{Z}
    "\u03AC": "\u03B1\u0301", // ά = \'{α}
    "\u1F70": "\u03B1\u0300", // ὰ = \`{α}
    "\u1FB1": "\u03B1\u0304", // ᾱ = \={α}
    "\u1FB0": "\u03B1\u0306", // ᾰ = \u{α}
    "\u03AD": "\u03B5\u0301", // έ = \'{ε}
    "\u1F72": "\u03B5\u0300", // ὲ = \`{ε}
    "\u03AE": "\u03B7\u0301", // ή = \'{η}
    "\u1F74": "\u03B7\u0300", // ὴ = \`{η}
    "\u03AF": "\u03B9\u0301", // ί = \'{ι}
    "\u1F76": "\u03B9\u0300", // ὶ = \`{ι}
    "\u03CA": "\u03B9\u0308", // ϊ = \"{ι}
    "\u0390": "\u03B9\u0308\u0301", // ΐ = \"\'{ι}
    "\u1FD2": "\u03B9\u0308\u0300", // ῒ = \"\`{ι}
    "\u1FD1": "\u03B9\u0304", // ῑ = \={ι}
    "\u1FD0": "\u03B9\u0306", // ῐ = \u{ι}
    "\u03CC": "\u03BF\u0301", // ό = \'{ο}
    "\u1F78": "\u03BF\u0300", // ὸ = \`{ο}
    "\u03CD": "\u03C5\u0301", // ύ = \'{υ}
    "\u1F7A": "\u03C5\u0300", // ὺ = \`{υ}
    "\u03CB": "\u03C5\u0308", // ϋ = \"{υ}
    "\u03B0": "\u03C5\u0308\u0301", // ΰ = \"\'{υ}
    "\u1FE2": "\u03C5\u0308\u0300", // ῢ = \"\`{υ}
    "\u1FE1": "\u03C5\u0304", // ῡ = \={υ}
    "\u1FE0": "\u03C5\u0306", // ῠ = \u{υ}
    "\u03CE": "\u03C9\u0301", // ώ = \'{ω}
    "\u1F7C": "\u03C9\u0300", // ὼ = \`{ω}
    "\u038E": "\u03A5\u0301", // Ύ = \'{Υ}
    "\u1FEA": "\u03A5\u0300", // Ὺ = \`{Υ}
    "\u03AB": "\u03A5\u0308", // Ϋ = \"{Υ}
    "\u1FE9": "\u03A5\u0304", // Ῡ = \={Υ}
    "\u1FE8": "\u03A5\u0306", // Ῠ = \u{Υ}
    "\u038F": "\u03A9\u0301", // Ώ = \'{Ω}
    "\u1FFA": "\u03A9\u0300" // Ὼ = \`{Ω}
};

},{}],132:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.calculateSize = exports.validUnit = undefined;

var _ParseError = require("./ParseError");

var _ParseError2 = _interopRequireDefault(_ParseError);

var _Options = require("./Options");

var _Options2 = _interopRequireDefault(_Options);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This table gives the number of TeX pts in one of each *absolute* TeX unit.
// Thus, multiplying a length by this number converts the length from units
// into pts.  Dividing the result by ptPerEm gives the number of ems
// *assuming* a font size of ptPerEm (normal size, normal style).


/**
 * This file does conversion between units.  In particular, it provides
 * calculateSize to convert other units into ems.
 */

var ptPerUnit = {
    // https://en.wikibooks.org/wiki/LaTeX/Lengths and
    // https://tex.stackexchange.com/a/8263
    "pt": 1, // TeX point
    "mm": 7227 / 2540, // millimeter
    "cm": 7227 / 254, // centimeter
    "in": 72.27, // inch
    "bp": 803 / 800, // big (PostScript) points
    "pc": 12, // pica
    "dd": 1238 / 1157, // didot
    "cc": 14856 / 1157, // cicero (12 didot)
    "nd": 685 / 642, // new didot
    "nc": 1370 / 107, // new cicero (12 new didot)
    "sp": 1 / 65536, // scaled point (TeX's internal smallest unit)
    // https://tex.stackexchange.com/a/41371
    "px": 803 / 800 // \pdfpxdimen defaults to 1 bp in pdfTeX and LuaTeX
};

// Dictionary of relative units, for fast validity testing.
var relativeUnit = {
    "ex": true,
    "em": true,
    "mu": true
};

/**
 * Determine whether the specified unit (either a string defining the unit
 * or a "size" parse node containing a unit field) is valid.
 */
var validUnit = exports.validUnit = function validUnit(unit) {
    if (typeof unit !== "string") {
        unit = unit.unit;
    }
    return unit in ptPerUnit || unit in relativeUnit || unit === "ex";
};

/*
 * Convert a "size" parse node (with numeric "number" and string "unit" fields,
 * as parsed by functions.js argType "size") into a CSS em value for the
 * current style/scale.  `options` gives the current options.
 */
var calculateSize = exports.calculateSize = function calculateSize(sizeValue, options) {
    var scale = void 0;
    if (sizeValue.unit in ptPerUnit) {
        // Absolute units
        scale = ptPerUnit[sizeValue.unit] // Convert unit to pt
        / options.fontMetrics().ptPerEm // Convert pt to CSS em
        / options.sizeMultiplier; // Unscale to make absolute units
    } else if (sizeValue.unit === "mu") {
        // `mu` units scale with scriptstyle/scriptscriptstyle.
        scale = options.fontMetrics().cssEmPerMu;
    } else {
        // Other relative units always refer to the *textstyle* font
        // in the current size.
        var unitOptions = void 0;
        if (options.style.isTight()) {
            // isTight() means current style is script/scriptscript.
            unitOptions = options.havingStyle(options.style.text());
        } else {
            unitOptions = options;
        }
        // TODO: In TeX these units are relative to the quad of the current
        // *text* font, e.g. cmr10. KaTeX instead uses values from the
        // comparably-sized *Computer Modern symbol* font. At 10pt, these
        // match. At 7pt and 5pt, they differ: cmr7=1.138894, cmsy7=1.170641;
        // cmr5=1.361133, cmsy5=1.472241. Consider $\scriptsize a\kern1emb$.
        // TeX \showlists shows a kern of 1.13889 * fontsize;
        // KaTeX shows a kern of 1.171 * fontsize.
        if (sizeValue.unit === "ex") {
            scale = unitOptions.fontMetrics().xHeight;
        } else if (sizeValue.unit === "em") {
            scale = unitOptions.fontMetrics().quad;
        } else {
            throw new _ParseError2.default("Invalid unit: '" + sizeValue.unit + "'");
        }
        if (unitOptions !== options) {
            scale *= unitOptions.sizeMultiplier / options.sizeMultiplier;
        }
    }
    return Math.min(sizeValue.number * scale, options.maxSize);
};

},{"./Options":83,"./ParseError":84}],133:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

/**
 * This file contains a list of utility functions which are useful in other
 * files.
 */

/**
 * Provide an `indexOf` function which works in IE8, but defers to native if
 * possible.
 */
var nativeIndexOf = Array.prototype.indexOf;
var indexOf = function indexOf(list, elem) {
    if (list == null) {
        return -1;
    }
    if (nativeIndexOf && list.indexOf === nativeIndexOf) {
        return list.indexOf(elem);
    }
    var l = list.length;
    for (var i = 0; i < l; i++) {
        if (list[i] === elem) {
            return i;
        }
    }
    return -1;
};

/**
 * Return whether an element is contained in a list
 */
var contains = function contains(list, elem) {
    return indexOf(list, elem) !== -1;
};

/**
 * Provide a default value if a setting is undefined
 * NOTE: Couldn't use `T` as the output type due to facebook/flow#5022.
 */
var deflt = function deflt(setting, defaultIfUndefined) {
    return setting === undefined ? defaultIfUndefined : setting;
};

// hyphenate and escape adapted from Facebook's React under Apache 2 license

var uppercase = /([A-Z])/g;
var hyphenate = function hyphenate(str) {
    return str.replace(uppercase, "-$1").toLowerCase();
};

var ESCAPE_LOOKUP = {
    "&": "&amp;",
    ">": "&gt;",
    "<": "&lt;",
    "\"": "&quot;",
    "'": "&#x27;"
};

var ESCAPE_REGEX = /[&><"']/g;

/**
 * Escapes text to prevent scripting attacks.
 */
function escape(text) {
    return String(text).replace(ESCAPE_REGEX, function (match) {
        return ESCAPE_LOOKUP[match];
    });
}

/**
 * A function to set the text content of a DOM element in all supported
 * browsers. Note that we don't define this if there is no document.
 */
var setTextContent = void 0;
if (typeof document !== "undefined") {
    var testNode = document.createElement("span");
    if ("textContent" in testNode) {
        setTextContent = function setTextContent(node, text) {
            node.textContent = text;
        };
    } else {
        setTextContent = function setTextContent(node, text) {
            node.innerText = text;
        };
    }
}

/**
 * A function to clear a node.
 */
function clearNode(node) {
    setTextContent(node, "");
}

/**
 * Sometimes we want to pull out the innermost element of a group. In most
 * cases, this will just be the group itself, but when ordgroups and colors have
 * a single element, we want to pull that out.
 */
var getBaseElem = function getBaseElem(group) {
    if (!group) {
        return false;
    } else if (group.type === "ordgroup") {
        if (group.value.length === 1) {
            return getBaseElem(group.value[0]);
        } else {
            return group;
        }
    } else if (group.type === "color") {
        if (group.value.value.length === 1) {
            return getBaseElem(group.value.value[0]);
        } else {
            return group;
        }
    } else if (group.type === "font") {
        return getBaseElem(group.value.body);
    } else {
        return group;
    }
};

/**
 * TeXbook algorithms often reference "character boxes", which are simply groups
 * with a single character in them. To decide if something is a character box,
 * we find its innermost group, and see if it is a single character.
 */
var isCharacterBox = function isCharacterBox(group) {
    var baseElem = getBaseElem(group);

    // These are all they types of groups which hold single characters
    return baseElem.type === "mathord" || baseElem.type === "textord" || baseElem.type === "bin" || baseElem.type === "rel" || baseElem.type === "inner" || baseElem.type === "open" || baseElem.type === "close" || baseElem.type === "punct";
};

exports.default = {
    contains: contains,
    deflt: deflt,
    escape: escape,
    hyphenate: hyphenate,
    indexOf: indexOf,
    setTextContent: setTextContent,
    clearNode: clearNode,
    getBaseElem: getBaseElem,
    isCharacterBox: isCharacterBox
};

},{}]},{},[1])(1)
});