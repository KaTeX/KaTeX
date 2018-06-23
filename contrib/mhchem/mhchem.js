/* -*- Mode: Javascript; indent-tabs-mode:nil; js-indent-level: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */

/*************************************************************
 *
 *  https://github.com/Khan/KaTeX/tree/master/contrib/mhchem
 *
 *  Implements the \ce command for handling chemical formulas
 *  from the mhchem LaTeX package.
 *
 *  ---------------------------------------------------------------------
 *
 *  Copyright (c) 2015-2018 Martin Hensel
 *  Copyright (c) 2011-2015 The MathJax Consortium
 *  Copyright (c) 2018 Khan Academy
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

//
// Coding Style
//   - use '' for identifiers that can be minified/uglified
//   - use "" for strings that need to stay untouched

var mhchem = (function () {

  //
  //  This is the main function for handing the \ce and \pu commands.
  //  It takes the argument to \ce or \pu and returns the corresponding TeX string.
  //

  var chemParse = function (str, stateMachine) {
    try {
      var tex = texify.go(mhchemParser.go(str, stateMachine));
      return {"expansion": tex, "errorMsg": ""};
    } catch (ex) {
      return {"expansion": "", "errorMsg": ex};
    }    
  };

  //
  // Core parser for mhchem syntax  (recursive)
  //
  var mhchemParser = {};
  //
  // Parses mchem \ce syntax
  //
  // Call like
  //   go("H2O");
  //
  // Looks through mhchemParser.transitions, to execute a matching action
  // (recursive)
  //
  mhchemParser.go = function(input, stateMachine) {
    if (!input) { return input; }
    if (stateMachine === undefined) { stateMachine = 'ce'; }
    var state = '0';

    //
    // String buffers for parsing:
    //
    // buffer.a == amount
    // buffer.o == element
    // buffer.b == left-side superscript
    // buffer.p == left-side subscript
    // buffer.q == right-side subscript
    // buffer.d == right-side superscript
    //
    // buffer.r == arrow
    // buffer.rdt == arrow, script above, type
    // buffer.rd == arrow, script above, content
    // buffer.rqt == arrow, script below, type
    // buffer.rq == arrow, script below, content
    //
    // buffer.text
    // buffer.rm
    // etc.
    //
    // buffer.parenthesisLevel == int, starting at 0
    // buffer.sb == bool, space before
    // buffer.beginsWithBond == bool
    //
    // These letters are also used as state names.
    //
    // Other states:
    // 0 == begin of main part (arrow/operator unlikely)
    // 1 == next entity
    // 2 == next entity (arrow/operator unlikely)
    // 3 == next atom
    // c == macro
    //
    var buffer = {};
    buffer['parenthesisLevel'] = 0;

    input = input.replace(/[\u2212\u2013\u2014\u2010]/g, "-");
    input = input.replace(/[\u2026]/g, "...");

    var lastInput, watchdog;
    var output = [];
    while (true) {
      if (lastInput !== input) {
        watchdog = 10;
        lastInput = input;
      } else {
        watchdog--;
      }
      //
      // Look for matching string in transition table
      //
      var machine = mhchemParser.stateMachines[stateMachine];
      var iTmax = machine.transitions.length;
      iterateTransitions:
      for (var iT=0; iT<iTmax; iT++) {  // Surprisingly, looping is not slower than another data structure with direct lookups.  635d910e-0a6d-45b4-8d38-2f98ac9d9a94
        var t = machine.transitions[iT];
        var tasks = t.actions[state]  ||  t.actions['*']  ||  null;
        if (tasks) {  // testing tasks (actions) before matches is slightly faster
          var matches = mhchemParser.matchh(t.matchh, input);
          if (matches) {
            //
            // Execute action
            //
            var actions = mhchemParser.concatNotUndefined([], tasks.action);
            var iAmax = actions.length;
            for (var iA=0; iA<iAmax; iA++) {
              var a = actions[iA];
              var o;
              var option = undefined;
              if (a.type) {
                option = a.option;
                a = a.type;
              }
              if (typeof a === "string") {
                if (machine.actions[a]) {
                  o = machine.actions[a](buffer, matches.matchh, option);
                } else if (mhchemParser.actions[a]) {
                  o = mhchemParser.actions[a](buffer, matches.matchh, option);
                } else {
                  throw ["MhchemBugA", "mhchem bug A. Please report. (" + a + ")"];  // Trying to use non-existing action
                }
              } else if (typeof a === "function") {
                o = a(buffer, matches.matchh);
              }
              output = mhchemParser.concatNotUndefined(output, o);
            }
            //
            // Set next state,
            // Shorten input,
            // Continue with next character
            //   (= apply only one transition per position)
            //
            state = tasks.nextState || state;
            if (input.length > 0) {
              if (!tasks.revisit) {
                input = matches.remainder;
              }
              if (!tasks.toContinue) {
                break iterateTransitions;
              }
            } else {
              return output;
            }
          }
        }
      }
      //
      // Prevent infinite loop
      //
      if (watchdog <= 0) {
        throw ["MhchemBugU", "mhchem bug U. Please report."];  // Unexpected character
      }
    }
  };
  mhchemParser.concatNotUndefined = function(a, b) {
    if (!b) { return a; }
    if (!a) { return [].concat(b); }
    return a.concat(b);
  };

  //
  // Matching patterns
  // either regexps or function that return null or {match:"a", remainder:"bc"}
  //
  mhchemParser.patterns = {
    // property names must not look like integers ("2") for correct property traversal order, later on
    'empty': /^$/,
    'else': /^./,
    'else2': /^./,
    'space': /^\s/,
    'space A': /^\s(?=[A-Z\\$])/,
    'a-z': /^[a-z]/,
    'x': /^x/,
    'x$': /^x$/,
    'i$': /^i$/,
    'letters': /^(?:[a-zA-Z\u03B1-\u03C9\u0391-\u03A9?@]|(?:\\(?:alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|omicron|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega)(?:\s+|\{\}|(?![a-zA-Z]))))+/,
    '\\greek': /^\\(?:alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|omicron|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega)(?:\s+|\{\}|(?![a-zA-Z]))/,
    'one lowercase latin letter $': /^(?:([a-z])(?:$|[^a-zA-Z]))$/,
    '$one lowercase latin letter$ $': /^\$(?:([a-z])(?:$|[^a-zA-Z]))\$$/,
    'one lowercase greek letter $': /^(?:\$?[\u03B1-\u03C9]\$?|\$?\\(?:alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|omicron|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega)\s*\$?)(?:\s+|\{\}|(?![a-zA-Z]))$/,
    'digits': /^[0-9]+/,
    '-9.,9': /^[+\-]?(?:[0-9]+(?:[,.][0-9]+)?|[0-9]*(?:\.[0-9]+))/,
    '-9.,9 no missing 0': /^[+\-]?[0-9]+(?:[.,][0-9]+)?/,
    '(-)(9.,9)(e)(99)': function (input) {
      var m = input.match(/^(\+\-|\+\/\-|\+|\-|\\pm\s?)?([0-9]+(?:[,.][0-9]+)?|[0-9]*(?:\.[0-9]+)?)(\((?:[0-9]+(?:[,.][0-9]+)?|[0-9]*(?:\.[0-9]+)?)\))?(?:([eE]|\s*(\*|x|\\times|\u00D7)\s*10\^)([+\-]?[0-9]+|\{[+\-]?[0-9]+\}))?/);
      if (m && m[0]) {
        return { matchh: m.splice(1), remainder: input.substr(m[0].length) };
      }
      return null;
    },
    '(-)(9)^(-9)':  function (input) {
      var m = input.match(/^(\+\-|\+\/\-|\+|\-|\\pm\s?)?([0-9]+(?:[,.][0-9]+)?|[0-9]*(?:\.[0-9]+)?)\^([+\-]?[0-9]+|\{[+\-]?[0-9]+\})/);
      if (m && m[0]) {
        return { matchh: m.splice(1), remainder: input.substr(m[0].length) };
      }
      return null;
    },
    'state of aggregation $': function (input) {  // or crystal system
      var a = this['_findObserveGroups'](input, "", /^\([a-z]{1,3}(?=[\),])/, ")", "");  // (aq), (aq,$\infty$), (aq, sat)
      if (a  &&  a.remainder.match(/^($|[\s,;\)\]\}])/)) { return a; }  //  AND end of 'phrase'
      var m = input.match(/^(?:\((?:\\ca\s?)?\$[amothc]\$\))/);  // OR crystal system ($o$) (\ca$c$)
      if (m) {
        return { matchh: m[0], remainder: input.substr(m[0].length) };
      }
      return null;
    },
    '_{(state of aggregation)}$': /^_\{(\([a-z]{1,3}\))\}/,
    '\{[(': /^(?:\\\{|\[|\()/,
    ')]\}': /^(?:\)|\]|\\\})/,
    ', ': /^[,;]\s*/,
    ',': /^[,;]/,
    '.': /^[.]/,
    '. ': /^([.\u22C5\u00B7\u2022])\s*/,
    '...': /^\.\.\.(?=$|[^.])/,
    '* ': /^([*])\s*/,
    '^{(...)}': function (input) { return this['_findObserveGroups'](input, "^{", "", "", "}"); },
    '^($...$)': function (input) { return this['_findObserveGroups'](input, "^", "$", "$", ""); },
    '^a': /^\^([0-9]+|[^\\_])/,
    '^\\x{}{}':  function (input) { return this['_findObserveGroups'](input, "^", /^\\[a-zA-Z]+\{/, "}", "", "", "{", "}", "", true); },
    '^\\x{}':  function (input) { return this['_findObserveGroups'](input, "^", /^\\[a-zA-Z]+\{/, "}", ""); },
    '^\\x': /^\^(\\[a-zA-Z]+)\s*/,
    '^(-1)': /^\^(-?\d+)/,
    '\'': /^'/,
    '_{(...)}': function (input) { return this['_findObserveGroups'](input, "_{", "", "", "}"); },
    '_($...$)': function (input) { return this['_findObserveGroups'](input, "_", "$", "$", ""); },
    '_9': /^_([+\-]?[0-9]+|[^\\])/,
    '_\\x{}{}':  function (input) { return this['_findObserveGroups'](input, "_", /^\\[a-zA-Z]+\{/, "}", "", "", "{", "}", "", true); },
    '_\\x{}':  function (input) { return this['_findObserveGroups'](input, "_", /^\\[a-zA-Z]+\{/, "}", ""); },
    '_\\x': /^_(\\[a-zA-Z]+)\s*/,
    '^_': /^(?:\^(?=_)|\_(?=\^)|[\^_]$)/,
    '{}': /^\{\}/,
    '{...}': function (input) { return this['_findObserveGroups'](input, "", "{", "}", ""); },
    '{(...)}': function (input) { return this['_findObserveGroups'](input, "{", "", "", "}"); },
    '$...$': function (input) { return this['_findObserveGroups'](input, "", "$", "$", ""); },
    '${(...)}$': function (input) { return this['_findObserveGroups'](input, "${", "", "", "}$"); },
    '$(...)$': function (input) { return this['_findObserveGroups'](input, "$", "", "", "$"); },
    '=<>': /^[=<>]/,
    '#': /^[#\u2261]/,
    '+': /^\+/,
    '-$': /^-(?=[\s_},;\]/]|$|\([a-z]+\))/,  // -space -, -; -] -/ -$ -state-of-aggregation
    '-9': /^-(?=[0-9])/,
    '- orbital overlap': /^-(?=(?:[spd]|sp)(?:$|[\s,;\)\]\}]))/,
    '-': /^-/,
    'pm-operator': /^(?:\\pm|\$\\pm\$|\+-|\+\/-)/,
    'operator': /^(?:\+|(?:[\-=<>]|<<|>>|\\approx|\$\\approx\$)(?=\s|$|-?[0-9]))/,
    'arrowUpDown': /^(?:v|\(v\)|\^|\(\^\))(?=$|[\s,;\)\]\}])/,
    '\\bond{(...)}': function (input) { return this['_findObserveGroups'](input, "\\bond{", "", "", "}"); },
    '->': /^(?:<->|<-->|->|<-|<=>>|<<=>|<=>|[\u2192\u27F6\u21CC])/,
    'CMT': /^[CMT](?=\[)/,
    '[(...)]': function (input) { return this['_findObserveGroups'](input, "[", "", "", "]"); },
    '1st-level escape': /^(&|\\\\|\\hline)\s*/,
    '\\,': /^(?:\\[,\ ;:])/,  // \\x - but output no space before
    '\\x{}{}':  function (input) { return this['_findObserveGroups'](input, "", /^\\[a-zA-Z]+\{/, "}", "", "", "{", "}", "", true); },
    '\\x{}':  function (input) { return this['_findObserveGroups'](input, "", /^\\[a-zA-Z]+\{/, "}", ""); },
    '\\ca': /^\\ca(?:\s+|(?![a-zA-Z]))/,
    '\\x': /^(?:\\[a-zA-Z]+\s*|\\[_&{}%])/,
    'orbital': /^(?:[0-9]{1,2}[spdfgh]|[0-9]{0,2}sp)(?=$|[^a-zA-Z])/,  // only those with numbers in front, because the others will be formatted correctly anyway
    'others': /^[\/~|]/,
    '\\frac{(...)}': function (input) { return this['_findObserveGroups'](input, "\\frac{", "", "", "}", "{", "", "", "}"); },
    '\\overset{(...)}': function (input) { return this['_findObserveGroups'](input, "\\overset{", "", "", "}", "{", "", "", "}"); },
    '\\underset{(...)}': function (input) { return this['_findObserveGroups'](input, "\\underset{", "", "", "}", "{", "", "", "}"); },
    '\\underbrace{(...)}': function (input) { return this['_findObserveGroups'](input, "\\underbrace{", "", "", "}_", "{", "", "", "}"); },
    '\\color{(...)}0': function (input) { return this['_findObserveGroups'](input, "\\color{", "", "", "}"); },
    '\\color{(...)}{(...)}1': function (input) { return this['_findObserveGroups'](input, "\\color{", "", "", "}", "{", "", "", "}"); },
    '\\color(...){(...)}2': function (input) { return this['_findObserveGroups'](input, "\\color", "\\", "", /^(?=\{)/, "{", "", "", "}"); },
    '\\ce{(...)}': function (input) { return this['_findObserveGroups'](input, "\\ce{", "", "", "}"); },
    'oxidation$': /^(?:[+-][IVX]+|\\pm\s*0|\$\\pm\$\s*0)$/,
    'd-oxidation$': /^(?:[+-]?\s?[IVX]+|\\pm\s*0|\$\\pm\$\s*0)$/,  // 0 could be oxidation or charge
    'roman numeral': /^[IVX]+/,
    '1/2$': /^[+\-]?(?:[0-9]+|\$[a-z]\$|[a-z])\/[0-9]+(?:\$[a-z]\$|[a-z])?$/,
    'amount': function (input) {
      var matchh;
      // e.g. 2, 0.5, 1/2, -2, n/2, +;  $a$ could be added later in parsing
      matchh = input.match(/^(?:(?:(?:\([+\-]?[0-9]+\/[0-9]+\)|[+\-]?(?:[0-9]+|\$[a-z]\$|[a-z])\/[0-9]+|[+\-]?[0-9]+[.,][0-9]+|[+\-]?\.[0-9]+|[+\-]?[0-9]+)(?:[a-z](?=\s*[A-Z]))?)|[+\-]?[a-z](?=\s*[A-Z])|\+(?!\s))/);
      if (matchh) {
        return { matchh: matchh[0], remainder: input.substr(matchh[0].length) };
      }
      var a = this['_findObserveGroups'](input, "", "$", "$", "");
      if (a) {  // e.g. $2n-1$, $-$
        matchh = a.matchh.match(/^\$(?:\(?[+\-]?(?:[0-9]*[a-z]?[+\-])?[0-9]*[a-z](?:[+\-][0-9]*[a-z]?)?\)?|\+|-)\$$/);
        if (matchh) {
          return { matchh: matchh[0], remainder: input.substr(matchh[0].length) };
        }
      }
      return null;
    },
    'amount2': function (input) { return this['amount'](input); },
    '(KV letters),': /^(?:[A-Z][a-z]{0,2}|i)(?=,)/,
    'formula$': function (input) {
      if (input.match(/^\([a-z]+\)$/)) { return null; }  // state of aggregation = no formula
      var matchh = input.match(/^(?:[a-z]|(?:[0-9\ \+\-\,\.\(\)]+[a-z])+[0-9\ \+\-\,\.\(\)]*|(?:[a-z][0-9\ \+\-\,\.\(\)]+)+[a-z]?)$/);
      if (matchh) {
        return { matchh: matchh[0], remainder: input.substr(matchh[0].length) };
      }
      return null;
    },
    'uprightEntities': /^(?:pH|pOH|pC|pK|iPr|iBu)(?=$|[^a-zA-Z])/,
    '/': /^\s*(\/)\s*/,
    '//': /^\s*(\/\/)\s*/,
    '*': /^\s*\*\s*/,
    '_findObserveGroups': function (input, begExcl, begIncl, endIncl, endExcl, beg2Excl, beg2Incl, end2Incl, end2Excl, combine) {
      var matchh = this['__match'](input, begExcl);
      if (matchh === null) { return null; }
      input = input.substr(matchh.length);
      matchh = this['__match'](input, begIncl);
      if (matchh === null) { return null; }
      var e = this['__findObserveGroups'](input, matchh.length, endIncl || endExcl);
      if (e === null) { return null; }
      var match1 = input.substring(0, (endIncl ? e.endMatchEnd : e.endMatchBegin));
      if (!(beg2Excl || beg2Incl)) {
        return {
          matchh: match1,
          remainder: input.substr(e.endMatchEnd)
        };
      } else {
        var group2 = this['_findObserveGroups'](input.substr(e.endMatchEnd), beg2Excl, beg2Incl, end2Incl, end2Excl);
        if (group2 === null) { return null; }
        var matchRet = [match1, group2.matchh];
        if (combine) { matchRet = matchRet.join(""); }
        return {
          matchh: matchRet,
          remainder: group2.remainder
        };
      }
    },
    '__match': function (input, pattern) {
      if (typeof pattern === "string") {
        if (input.indexOf(pattern) !== 0) { return null; }
        return pattern;
      } else {
        var matchh = input.match(pattern);
        if (!matchh) { return null; }
        return matchh[0];
      }
    },
    '__findObserveGroups': function (input, i, endChars) {
      var braces = 0;
      while (i < input.length) {
        var a = input.charAt(i);
        var matchh = this['__match'](input.substr(i), endChars);
        if (matchh !== null  &&  braces === 0) {
          return { endMatchBegin: i, endMatchEnd: i + matchh.length };
        } else if (a === "{") {
          braces++;
        } else if (a === "}") {
          if (braces === 0) {
            throw ["ExtraCloseMissingOpen", "Extra close brace or missing open brace"];
          } else {
            braces--;
          }
        }
        i++;
      }
      if (braces > 0) {
        return null;
      }
      return null;
    }
  };

  //
  // Matching function
  // e.g. matchh("a", input) will look for the regexp called "a" and see if it matches
  // returns null or {matchh:"a", remainder:"bc"}
  //
  mhchemParser.matchh = function (m, input) {
    var pattern = mhchemParser.patterns[m];
    if (pattern === undefined) {
      throw ["MhchemBugP", "mhchem bug P. Please report. (" + m + ")"];  // Trying to use non-existing pattern
    } else if (typeof pattern === "function") {
      return mhchemParser.patterns[m](input);  // cannot use cached var pattern here, because some pattern functions need this===mhchemParser
    } else {  // RegExp
      var matchh = input.match(pattern);
      if (matchh) {
        var mm;
        if (matchh[2]) {
          mm = [ matchh[1], matchh[2] ];
        } else if (matchh[1]) {
          mm = matchh[1];
        } else {
          mm = matchh[0];
        }
        return { matchh: mm, remainder: input.substr(matchh[0].length) };
      }
      return null;
    }
  };

  //
  // Generic state machine actions
  //
  mhchemParser.actions = {
    'a=': function (buffer, m) { buffer.a = (buffer.a || "") + m; },
    'b=': function (buffer, m) { buffer.b = (buffer.b || "") + m; },
    'p=': function (buffer, m) { buffer.p = (buffer.p || "") + m; },
    'o=': function (buffer, m) { buffer.o = (buffer.o || "") + m; },
    'q=': function (buffer, m) { buffer.q = (buffer.q || "") + m; },
    'd=': function (buffer, m) { buffer.d = (buffer.d || "") + m; },
    'rm=': function (buffer, m) { buffer.rm = (buffer.rm || "") + m; },
    'text=': function (buffer, m) { buffer.text = (buffer.text || "") + m; },
    'insert': function (buffer, m, a) { return { type: a }; },
    'insert+p1': function (buffer, m, a) { return { type: a, p1: m }; },
    'insert+p1+p2': function (buffer, m, a) { return { type: a, p1: m[0], p2: m[1] }; },
    'copy': function (buffer, m) { return m; },
    'rm': function (buffer, m) { return { type: 'rm', p1: m }; },
    'text': function (buffer, m) { return mhchemParser.go(m, 'text'); },
    '{text}': function (buffer, m) {
      var ret = [ "{" ];
      ret = mhchemParser.concatNotUndefined(ret, mhchemParser.go(m, 'text'));
      ret = mhchemParser.concatNotUndefined(ret, "}");
      return ret;
    },
    'tex-math': function (buffer, m) { return mhchemParser.go(m, 'tex-math'); },
    'tex-math tight': function (buffer, m) { return mhchemParser.go(m, 'tex-math tight'); },
    'bond': function (buffer, m, k) { return { type: 'bond', kind: k || m }; },
    'color0-output': function (buffer, m) { return { type: 'color0', color: m[0] }; },
    'ce': function (buffer, m) { return mhchemParser.go(m); },
    '1/2': function (buffer, m) {
      var ret;
      if (m.match(/^[+\-]/)) {
        ret = [ m.substr(0, 1) ];
        m = m.substr(1);
      }
      var n = m.match(/^([0-9]+|\$[a-z]\$|[a-z])\/([0-9]+)(\$[a-z]\$|[a-z])?$/);
      n[1] = n[1].replace(/\$/g, "");
      ret = mhchemParser.concatNotUndefined(ret, { type: 'frac', p1: n[1], p2: n[2] } );
      if (n[3]) {
        n[3] = n[3].replace(/\$/g, "");
        ret = mhchemParser.concatNotUndefined(ret, { type: 'tex-math', p1: n[3] } );
      }
      return ret;
    },
    '9,9': function (buffer, m) { return mhchemParser.go(m, '9,9'); }
  };

  //
  // State machine definitions
  //
  mhchemParser.stateMachines = {};
  //
  // convert  { 'a': { '*': { action: 'output' } } }  to  [ { matchh: 'a', actions: { '*': { action: 'output' } } } ]
  // with expansion of 'a|b' to 'a' and 'b' (at 2 places)
  //
  mhchemParser.createTransitions = function (o) {
    var a, b, s, i;
    //
    // 1. o ==> oo, expanding 'a|b'
    //
    var oo = {};
    for (a in o) {
      if (a.indexOf("|") !== -1) {
        s = a.split("|");
        for (i=0; i<s.length; i++) {
          oo[s[i]] = o[a];
        }
      } else {
        oo[a] = o[a];
      }
    }
    //
    // 2. oo ==> transition array
    //
    var transitions = [];
    for (a in oo) {
      var actions = {};
      var ooa = oo[a];
      for (b in ooa) {
        //
        // expanding action-state:'a|b' if needed
        //
        if (b.indexOf("|") !== -1) {
          s = b.split("|");
          for (i=0; i<s.length; i++) {
            actions[s[i]] = ooa[b];
          }
        } else {
          actions[b] = ooa[b];
        }
      }
      transitions.push( { matchh: a, actions: actions } );
    }
    return transitions;
  };
  //
  //
  // \ce state machines
  //
  //
  // Transitions and actions of main parser
  //
  mhchemParser.stateMachines['ce'] = {
    transitions: mhchemParser.createTransitions({
      'empty': {
        '*': { action: 'output' } },
      'else':  {
        '0|1|2': { action: 'beginsWithBond=false', revisit: true, toContinue: true } },
      'oxidation$': {
        '0': { action: 'oxidation-output' } },
      'CMT': {
        'r': { action: 'rdt=', nextState: 'rt' },
        'rd': { action: 'rqt=', nextState: 'rdt' } },
      'arrowUpDown': {
        '0|1|2|as': { action: [ 'sb=false', 'output', 'operator' ], nextState: '1' } },
      'uprightEntities': {
        '0|1|2': { action: [ 'o=', 'output' ], nextState: '1' } },
      'orbital': {
        '0|1|2|3': { action: 'o=', nextState: 'o' } },
      '->': {
        '0|1|2|3': { action: 'r=', nextState: 'r' },
        'a|as': { action: [ 'output', 'r=' ], nextState: 'r' },
        '*': { action: [ 'output', 'r=' ], nextState: 'r' } },
      '+': {
        'o': { action: 'd= kv',  nextState: 'd' },
        'd|D': { action: 'd=', nextState: 'd' },
        'q': { action: 'd=',  nextState: 'qd' },
        'qd|qD': { action: 'd=', nextState: 'qd' },
        'dq': { action: [ 'output', 'd=' ], nextState: 'd' },
        '3': { action: [ 'sb=false', 'output', 'operator' ], nextState: '0' } },
      'amount': {
        '0|2': { action: 'a=', nextState: 'a' } },
      'pm-operator': {
        '0|1|2|a|as': { action: [ 'sb=false', 'output', { type: 'operator', option: '\\pm' } ], nextState: '0' } },
      'operator': {
        '0|1|2|a|as': { action: [ 'sb=false', 'output', 'operator' ], nextState: '0' } },
      '-$': {
        'o|q': { action: [ 'charge or bond', 'output' ],  nextState: 'qd' },
        'd': { action: 'd=', nextState: 'd' },
        'D': { action: [ 'output', { type: 'bond', option: "-" } ], nextState: '3' },
        'q': { action: 'd=',  nextState: 'qd' },
        'qd': { action: 'd=', nextState: 'qd' },
        'qD|dq': { action: [ 'output', { type: 'bond', option: "-" } ], nextState: '3' } },
      '-9': {
        '3|o': { action: [ 'output', { type: 'insert', option: 'hyphen' } ], nextState: '3' } },
      '- orbital overlap': {
        'o': { action: { type: '- after o', option: true }, nextState: '2' },
        'd': { action: { type: '- after d', option: true }, nextState: '2' } },
      '-': {
        '0|1|2': { action: [ { type: 'output', option: 1 }, 'beginsWithBond=true', { type: 'bond', option: "-" } ], nextState: '3' },
        '3': { action: { type: 'bond', option: "-" } },
        'a': { action: [ 'output', { type: 'insert', option: 'hyphen' } ], nextState: '2' },
        'as': { action: [ { type: 'output', option: 2 }, { type: 'bond', option: "-" } ], nextState: '3' },
        'b': { action: 'b=' },
        'o': { action: '- after o', nextState: '2' },
        'q': { action: '- after o', nextState: '2' },
        'd|qd|dq': { action: '- after d', nextState: '2' },
        'D|qD|p': { action: [ 'output', { type: 'bond', option: "-" } ], nextState: '3' } },
      'amount2': {
        '1|3': { action: 'a=', nextState: 'a' } },
      'letters': {
        '0|1|2|3|a|as|b|p|bp|o': { action: 'o=', nextState: 'o' },
        'q|dq': { action: ['output', 'o='], nextState: 'o' },
        'd|D|qd|qD': { action: 'o after d', nextState: 'o' } },
      'digits': {
        'o': { action: 'q=', nextState: 'q' },
        'd|D': { action: 'q=', nextState: 'dq' },
        'q': { action: [ 'output', 'o=' ], nextState: 'o' },
        'a': { action: 'o=', nextState: 'o' } },
      'space A': {
        'b|p|bp': {} },
      'space': {
        'a': { nextState: 'as' },
        '0': { action: 'sb=false' },
        '1|2': { action: 'sb=true' },
        'r|rt|rd|rdt|rdq': { action: 'output', nextState: '0' },
        '*': { action: [ 'output', 'sb=true' ], nextState: '1'} },
      '1st-level escape': {
        '1|2': { action: [ 'output', { type: 'insert+p1', option: '1st-level escape' } ] },
        '*': { action: [ 'output', { type: 'insert+p1', option: '1st-level escape' } ], nextState: '0' } },
      '[(...)]': {
        'r|rt': { action: 'rd=', nextState: 'rd' },
        'rd|rdt': { action: 'rq=', nextState: 'rdq' } },
      '...': {
        'o|d|D|dq|qd|qD': { action: [ 'output', { type: 'bond', option: "..." } ], nextState: '3' },
        '*': { action: [ { type: 'output', option: 1 }, { type: 'insert', option: 'ellipsis' } ], nextState: '1' } },
      '. |* ': {
        '*': { action: [ 'output', { type: 'insert', option: 'addition compound' } ], nextState: '1' } },
      'state of aggregation $': {
        '*': { action: [ 'output', 'state of aggregation' ], nextState: '1' } },
      '\{[(': {
        'a|as|o': { action: [ 'o=', 'output', 'parenthesisLevel++' ], nextState: '2' },
        '0|1|2|3': { action: [ 'o=', 'output', 'parenthesisLevel++' ], nextState: '2' },
        '*': { action: [ 'output', 'o=', 'output', 'parenthesisLevel++' ], nextState: '2' } },
      ')]\}': {
        '0|1|2|3|b|p|bp|o': { action: [ 'o=', 'parenthesisLevel--' ], nextState: 'o' },
        'a|as|d|D|q|qd|qD|dq': { action: [ 'output', 'o=', 'parenthesisLevel--' ], nextState: 'o' } },
      ', ': {
        '*': { action: [ 'output', 'comma' ], nextState: '0' } },
      '^_': {  // ^ and _ without a sensible argument
        '*': { } },
      '^{(...)}|^($...$)': {
        '0|1|2|as': { action: 'b=', nextState: 'b' },
        'p': { action: 'b=', nextState: 'bp' },
        '3|o': { action: 'd= kv', nextState: 'D' },
        'q': { action: 'd=', nextState: 'qD' },
        'd|D|qd|qD|dq': { action: [ 'output', 'd=' ], nextState: 'D' } },
      '^a|^\\x{}{}|^\\x{}|^\\x|\'': {
        '0|1|2|as': { action: 'b=', nextState: 'b' },
        'p': { action: 'b=', nextState: 'bp' },
        '3|o': { action: 'd= kv', nextState: 'd' },
        'q': { action: 'd=', nextState: 'qd' },
        'd|qd|D|qD': { action: 'd=' },
        'dq': { action: [ 'output', 'd=' ], nextState: 'd' } },
      '_{(state of aggregation)}$': {
        'd|D|q|qd|qD|dq': { action: [ 'output', 'q=' ], nextState: 'q' } },
      '_{(...)}|_($...$)|_9|_\\x{}{}|_\\x{}|_\\x': {
        '0|1|2|as': { action: 'p=', nextState: 'p' },
        'b': { action: 'p=', nextState: 'bp' },
        '3|o': { action: 'q=', nextState: 'q' },
        'd|D': { action: 'q=', nextState: 'dq' },
        'q|qd|qD|dq': { action: [ 'output', 'q=' ], nextState: 'q' } },
      '=<>': {
        '0|1|2|3|a|as|o|q|d|D|qd|qD|dq': { action: [ { type: 'output', option: 2 }, 'bond' ], nextState: '3' } },
      '#': {
        '0|1|2|3|a|as|o': { action: [ { type: 'output', option: 2 }, { type: 'bond', option: "#" } ], nextState: '3' } },
      '{}': {
        '*': { action: { type: 'output', option: 1 },  nextState: '1' } },
      '{...}': {
        '0|1|2|3|a|as|b|p|bp': { action: 'o=', nextState: 'o' },
        'o|d|D|q|qd|qD|dq': { action: [ 'output', 'o=' ], nextState: 'o' } },
      '$...$': {
        'a': { action: 'a=' },  // 2$n$
        '0|1|2|3|as|b|p|bp|o': { action: 'o=', nextState: 'o' },  // not 'amount'
        'as|o': { action: 'o=' },
        'q|d|D|qd|qD|dq': { action: [ 'output', 'o=' ], nextState: 'o' } },
      '\\bond{(...)}': {
        '*': { action: [ { type: 'output', option: 2 }, 'bond' ], nextState: "3" } },
      '\\frac{(...)}': {
        '*': { action: [ { type: 'output', option: 1 }, 'frac-output' ], nextState: '3' } },
      '\\overset{(...)}': {
        '*': { action: [ { type: 'output', option: 2 }, 'overset-output' ], nextState: '3' } },
      '\\underset{(...)}': {
        '*': { action: [ { type: 'output', option: 2 }, 'underset-output' ], nextState: '3' } },
      '\\underbrace{(...)}': {
        '*': { action: [ { type: 'output', option: 2 }, 'underbrace-output' ], nextState: '3' } },
      '\\color{(...)}{(...)}1|\\color(...){(...)}2': {
        '*': { action: [ { type: 'output', option: 2 }, 'color-output' ], nextState: '3' } },
      '\\color{(...)}0': {
        '*': { action: [ { type: 'output', option: 2 }, 'color0-output' ] } },
      '\\ce{(...)}': {
        '*': { action: [ { type: 'output', option: 2 }, 'ce' ], nextState: '3' } },
      '\\,': {
        '*': { action: [ { type: 'output', option: 1 }, 'copy' ], nextState: '1' } },
      '\\x{}{}|\\x{}|\\x': {
        '0|1|2|3|a|as|b|p|bp|o|c0': { action: [ 'o=', 'output' ], nextState: '3' },
        '*': { action: ['output', 'o=', 'output' ], nextState: '3' } },
      'others': {
        '*': { action: [ { type: 'output', option: 1 }, 'copy' ], nextState: '3' } },
      'else2': {
        'a': { action: 'a to o', nextState: 'o', revisit: true },
        'as': { action: [ { type: 'output' }, 'sb=true' ], nextState: '1', revisit: true },
        'r|rt|rd|rdt|rdq': { action: [ 'output' ], nextState: '0', revisit: true },
        '*': { action: [ 'output', 'copy' ], nextState: '3' } }
    }),
    actions: {
      'o after d': function (buffer, m) {
        var ret;
        if (buffer.d.match(/^[0-9]+$/)) {
          var tmp = buffer.d;
          buffer.d = undefined;
          ret = this['output'](buffer);
          buffer.b = tmp;
        } else {
          ret = this['output'](buffer);
        }
        mhchemParser.actions['o='](buffer, m);
        return ret;
      },
      'd= kv': function (buffer, m) {
        buffer.d = m;
        buffer['d-type'] = 'kv';
      },
      'charge or bond': function (buffer, m) {
        if (buffer['beginsWithBond']) {
          var ret = mhchemParser.concatNotUndefined(ret, this['output'](buffer));
          ret = mhchemParser.concatNotUndefined(ret, mhchemParser.actions['bond'](buffer, m, "-"));
          return ret;
        } else {
          buffer.d = m;
        }
      },
      '- after o': function (buffer, m, isOrbitalOverlap) {
        var hyphenFollows = isOrbitalOverlap  ||  this['_hyphenFollows'](buffer, m);
        var ret = mhchemParser.concatNotUndefined(null, this['output'](buffer, m));
        if (hyphenFollows) {
          ret = mhchemParser.concatNotUndefined(ret, { type: 'hyphen' });
        } else {
          ret = mhchemParser.concatNotUndefined(ret, mhchemParser.actions['bond'](buffer, m, "-"));
        }
        return ret;
      },
      '- after d': function (buffer, m, isOrbitalOverlap) {
        var hyphenFollows = isOrbitalOverlap  ||  this['_hyphenFollows'](buffer, m);
        var ret;
        if (hyphenFollows) {
          ret = mhchemParser.concatNotUndefined(ret, this['output'](buffer, m));
          ret = mhchemParser.concatNotUndefined(ret, { type: 'hyphen' });
        } else {
          var c1 = mhchemParser.matchh('digits', buffer.d || "");
          if (c1 && c1.remainder==='') {
            ret = mhchemParser.concatNotUndefined(null, mhchemParser.actions['d='](buffer, m));
            ret = mhchemParser.concatNotUndefined(ret, this['output'](buffer));
          } else {
            ret = mhchemParser.concatNotUndefined(ret, this['output'](buffer, m));
            ret = mhchemParser.concatNotUndefined(ret, mhchemParser.actions['bond'](buffer, m, "-"));
          }
        }
        return ret;
      },
      '_hyphenFollows': function (buffer, m) {
        var c1 = mhchemParser.matchh('orbital', buffer.o || "");
        var c2 = mhchemParser.matchh('one lowercase greek letter $', buffer.o || "");
        var c3 = mhchemParser.matchh('one lowercase latin letter $', buffer.o || "");
        var c4 = mhchemParser.matchh('$one lowercase latin letter$ $', buffer.o || "");
        var hyphenFollows =  m==="-" && ( c1 && c1.remainder===''  ||  c2  ||  c3  ||  c4 );
        if (hyphenFollows && !buffer.a && !buffer.b && !buffer.p && !buffer.d && !buffer.q && !c1 && c3) {
          buffer.o = '$' + buffer.o + '$';
        }
        return hyphenFollows;
      },
      'a to o': function (buffer, m) {
          buffer.o = buffer.a;
          buffer.a = undefined;
      },
      'sb=true': function (buffer, m) { buffer.sb = true; },
      'sb=false': function (buffer, m) { buffer.sb = false; },
      'beginsWithBond=true': function (buffer, m) { buffer.beginsWithBond = true; },
      'beginsWithBond=false': function (buffer, m) { buffer.beginsWithBond = false; },
      'parenthesisLevel++': function (buffer, m) { buffer.parenthesisLevel++; },
      'parenthesisLevel--': function (buffer, m) { buffer.parenthesisLevel--; },
      'state of aggregation': function (buffer, m) {
          m = mhchemParser.go(m, 'o');
          return { type: 'state of aggregation', p1: m };
      },
      'comma': function (buffer, m) {
        var a = m.replace(/\s*$/, '');
        var withSpace = (a !== m);
        if (withSpace  &&  buffer['parenthesisLevel'] === 0) {
          return { type: 'comma enumeration L', p1: a };
        } else {
          return { type: 'comma enumeration M', p1: a };
        }
      },
      'output': function (buffer, m, entityFollows) {
        // entityFollows:
        //   undefined = if we have nothing else to output, also ignore the just read space (buffer.sb)
        //   1 = an entity follows, never omit the space if there was one just read before (can only apply to state 1)
        //   2 = 1 + the entity can have an amount, so output a\, instead of converting it to o (can only apply to states a|as)
        var ret;
        if (!buffer.r) {
          ret = [];
          if (!buffer.a && !buffer.b && !buffer.p && !buffer.o && !buffer.q && !buffer.d && !entityFollows) {
            ret = null;
          } else {
            if (buffer.sb) {
              ret.push({ type: 'entitySkip' });
            }
            if (!buffer.o && !buffer.q && !buffer.d && !buffer.b && !buffer.p && entityFollows!==2) {
              buffer.o = buffer.a;
              buffer.a = undefined;
            } else if (!buffer.o && !buffer.q && !buffer.d && (buffer.b || buffer.p)) {
              buffer.o = buffer.a;
              buffer.d = buffer.b;
              buffer.q = buffer.p;
              buffer.a = buffer.b = buffer.p = undefined;
            } else {
              if (buffer.o && buffer['d-type']==='kv' && mhchemParser.matchh('d-oxidation$', buffer.d || "")) {
                buffer['d-type'] = 'oxidation';
              } else if (buffer.o && buffer['d-type']==='kv' && !buffer.q) {
                buffer['d-type'] = undefined;
              }
            }
            buffer.a = mhchemParser.go(buffer.a, 'a');
            buffer.b = mhchemParser.go(buffer.b, 'bd');
            buffer.p = mhchemParser.go(buffer.p, 'pq');
            buffer.o = mhchemParser.go(buffer.o, 'o');
            if (buffer['d-type'] === 'oxidation') {
              buffer.d = mhchemParser.go(buffer.d, 'oxidation');
            } else {
              buffer.d = mhchemParser.go(buffer.d, 'bd');
            }
            buffer.q = mhchemParser.go(buffer.q, 'pq');
            ret.push({
              type: 'chemfive',
              a: buffer.a,
              b: buffer.b,
              p: buffer.p,
              o: buffer.o,
              q: buffer.q,
              d: buffer.d,
              'd-type': buffer['d-type']
            });
          }
        } else {  // r
          if (buffer.rdt === 'M') {
            buffer.rd = mhchemParser.go(buffer.rd, 'tex-math');
          } else if (buffer.rdt === 'T') {
            buffer.rd = [ { type: 'text', p1: buffer.rd } ];
          } else {
            buffer.rd = mhchemParser.go(buffer.rd);
          }
          if (buffer.rqt === 'M') {
            buffer.rq = mhchemParser.go(buffer.rq, 'tex-math');
          } else if (buffer.rqt === 'T') {
            buffer.rq = [ { type: 'text', p1: buffer.rq } ];
          } else {
            buffer.rq = mhchemParser.go(buffer.rq);
          }
          ret = {
            type: 'arrow',
            r: buffer.r,
            rd: buffer.rd,
            rq: buffer.rq
          };
        }
        for (var p in buffer) {
          if (p !== 'parenthesisLevel'  &&  p !== 'beginsWithBond') {
            delete buffer[p];
          }
        }
        return ret;
      },
      'oxidation-output': function (buffer, m) {
          var ret = [ "{" ];
          ret = mhchemParser.concatNotUndefined(ret, mhchemParser.go(m, 'oxidation'));
          ret = ret.concat([ "}" ]);
        return ret;
      },
      'frac-output': function (buffer, m) {
        return { type: 'frac-ce', p1: mhchemParser.go(m[0]), p2: mhchemParser.go(m[1]) };
      },
      'overset-output': function (buffer, m) {
        return { type: 'overset', p1: mhchemParser.go(m[0]), p2: mhchemParser.go(m[1]) };
      },
      'underset-output': function (buffer, m) {
        return { type: 'underset', p1: mhchemParser.go(m[0]), p2: mhchemParser.go(m[1]) };
      },
      'underbrace-output': function (buffer, m) {
        return { type: 'underbrace', p1: mhchemParser.go(m[0]), p2: mhchemParser.go(m[1]) };
      },
      'color-output': function (buffer, m) {
        return { type: 'color', color1: m[0], color2: mhchemParser.go(m[1]) };
      },
      'r=': function (buffer, m) { buffer.r = (buffer.r || "") + m; },
      'rdt=': function (buffer, m) { buffer.rdt = (buffer.rdt || "") + m; },
      'rd=': function (buffer, m) { buffer.rd = (buffer.rd || "") + m; },
      'rqt=': function (buffer, m) { buffer.rqt = (buffer.rqt || "") + m; },
      'rq=': function (buffer, m) { buffer.rq = (buffer.rq || "") + m; },
      'operator': function (buffer, m, p1) { return { type: 'operator', kind: (p1 || m) }; }
    }
  };
  //
  // Transitions and actions of a parser
  //
  mhchemParser.stateMachines['a'] = {
    transitions: mhchemParser.createTransitions({
      'empty': {
        '*': {} },
      '1/2$': {
        '0': { action: '1/2' } },
      'else': {
        '0': { nextState: '1', revisit: true } },
      '$(...)$': {
        '*': { action: 'tex-math tight', nextState: '1' } },
      ',': {
        '*': { action: { type: 'insert', option: 'commaDecimal' } } },
      'else2': {
        '*': { action: 'copy' } }
    }),
    actions: {}
  };
  //
  // Transitions and actions of o parser
  //
  mhchemParser.stateMachines['o'] = {
    transitions: mhchemParser.createTransitions({
      'empty': {
        '*': {} },
      '1/2$': {
        '0': { action: '1/2' } },
      'else': {
        '0': { nextState: '1', revisit: true } },
      'letters': {
        '*': { action: 'rm' } },
      '\\ca': {
        '*': { action: { type: 'insert', option: 'circa' } } },
      '\\x{}{}|\\x{}|\\x': {
        '*': { action: 'copy' } },
      '${(...)}$|$(...)$': {
        '*': { action: 'tex-math' } },
      '{(...)}': {
        '*': { action: '{text}' } },
      'else2': {
        '*': { action: 'copy' } }
    }),
    actions: {}
  };
  //
  // Transitions and actions of text parser
  //
  mhchemParser.stateMachines['text'] = {
    transitions: mhchemParser.createTransitions({
      'empty': {
        '*': { action: 'output' } },
      '{...}': {
        '*': { action: 'text=' } },
      '${(...)}$|$(...)$': {
        '*': { action: 'tex-math' } },
      '\\greek': {
        '*': { action: [ 'output', 'rm' ] } },
      '\\,|\\x{}{}|\\x{}|\\x': {
        '*': { action: [ 'output', 'copy' ] } },
      'else': {
        '*': { action: 'text=' } }
    }),
    actions: {
      'output': function (buffer, m) {
        if (buffer.text) {
          var ret = { type: 'text', p1: buffer.text };
          for (var p in buffer) { delete buffer[p]; }
          return ret;
        }
        return null;
      }
    }
  };
  //
  // Transitions and actions of pq parser
  //
  mhchemParser.stateMachines['pq'] = {
    transitions: mhchemParser.createTransitions({
      'empty': {
        '*': {} },
      'state of aggregation $': {
        '*': { action: 'state of aggregation' } },
      'i$': {
        '0': { nextState: '!f', revisit: true } },
      '(KV letters),': {
        '0': { action: 'rm', nextState: '0' } },
      'formula$': {
        '0': { nextState: 'f', revisit: true } },
      '1/2$': {
        '0': { action: '1/2' } },
      'else': {
        '0': { nextState: '!f', revisit: true } },
      '${(...)}$|$(...)$': {
        '*': { action: 'tex-math' } },
      '{(...)}': {
        '*': { action: 'text' } },
      'a-z': {
        'f': { action: 'tex-math' } },
      'letters': {
        '*': { action: 'rm' } },
      '-9.,9': {
        '*': { action: '9,9'  } },
      ',': {
        '*': { action: { type: 'insert+p1', option: 'comma enumeration S' } } },
      '\\color{(...)}{(...)}1|\\color(...){(...)}2': {
        '*': { action: 'color-output' } },
      '\\color{(...)}0': {
        '*': { action: 'color0-output' } },
      '\\ce{(...)}': {
        '*': { action: 'ce' } },
      '\\,|\\x{}{}|\\x{}|\\x': {
        '*': { action: 'copy' } },
      'else2': {
        '*': { action: 'copy' } }
    }),
    actions: {
      'state of aggregation': function (buffer, m) {
          m = mhchemParser.go(m, 'o');
          return { type: 'state of aggregation subscript', p1: m };
      },
      'color-output': function (buffer, m) {
        return { type: 'color', color1: m[0], color2: mhchemParser.go(m[1], 'pq') };
      }
    }
  };
  //
  // Transitions and actions of bd parser
  //
  mhchemParser.stateMachines['bd'] = {
    transitions: mhchemParser.createTransitions({
      'empty': {
        '*': {} },
      'x$': {
        '0': { nextState: '!f', revisit: true } },
      'formula$': {
        '0': { nextState: 'f', revisit: true } },
      'else': {
        '0': { nextState: '!f', revisit: true } },
      '-9.,9 no missing 0': {
        '*': { action: '9,9' } },
      '.': {
        '*': { action: { type: 'insert', option: 'electron dot' } } },
      'a-z': {
        'f': { action: 'tex-math' } },
      'x': {
        '*': { action: { type: 'insert', option: 'KV x' } } },
      'letters': {
        '*': { action: 'rm' } },
      '\'': {
        '*': { action: { type: 'insert', option: 'prime' } } },
      '${(...)}$|$(...)$': {
        '*': { action: 'tex-math' } },
      '{(...)}': {
        '*': { action: 'text' } },
      '\\color{(...)}{(...)}1|\\color(...){(...)}2': {
        '*': { action: 'color-output' } },
      '\\color{(...)}0': {
        '*': { action: 'color0-output' } },
      '\\ce{(...)}': {
        '*': { action: 'ce' } },
      '\\,|\\x{}{}|\\x{}|\\x': {
        '*': { action: 'copy' } },
      'else2': {
        '*': { action: 'copy' } }
    }),
    actions: {
      'color-output': function (buffer, m) {
        return { type: 'color', color1: m[0], color2: mhchemParser.go(m[1], 'bd') };
      }
    }
  };
  //
  // Transitions and actions of oxidation parser
  //
  mhchemParser.stateMachines['oxidation'] = {
    transitions: mhchemParser.createTransitions({
      'empty': {
        '*': {} },
      'roman numeral': {
        '*': { action: 'roman-numeral' } },
      '${(...)}$|$(...)$': {
        '*': { action: 'tex-math' } },
      'else': {
        '*': { action: 'copy' } }
    }),
    actions: {
      'roman-numeral': function (buffer, m) { return { type: 'roman numeral', p1: m }; }
    }
  };
  //
  // Transitions and actions of tex-math parser
  //
  mhchemParser.stateMachines['tex-math'] = {
    transitions: mhchemParser.createTransitions({
      'empty': {
        '*': { action: 'output' } },
      '\\ce{(...)}': {
        '*': { action: [ 'output', 'ce' ] } },
      '{...}|\\,|\\x{}{}|\\x{}|\\x': {
        '*': { action: 'o=' } },
      'else': {
        '*': { action: 'o=' } }
    }),
    actions: {
      'output': function (buffer, m) {
        if (buffer.o) {
          var ret = { type: 'tex-math', p1: buffer.o };
          for (var p in buffer) { delete buffer[p]; }
          return ret;
        }
        return null;
      }
    }
  };
  //
  // Transitions and actions of tex-math-tight parser
  //
  mhchemParser.stateMachines['tex-math tight'] = {
    transitions: mhchemParser.createTransitions({
      'empty': {
        '*': { action: 'output' } },
      '\\ce{(...)}': {
        '*': { action: [ 'output', 'ce' ] } },
      '{...}|\\,|\\x{}{}|\\x{}|\\x': {
        '*': { action: 'o=' } },
      '-|+': {
        '*': { action: 'tight operator' } },
      'else': {
        '*': { action: 'o=' } }
    }),
    actions: {
      'tight operator': function (buffer, m) { buffer.o = (buffer.o || "") + "{"+m+"}"; },
      'output': function (buffer, m) {
        if (buffer.o) {
          var ret = { type: 'tex-math', p1: buffer.o };
          for (var p in buffer) { delete buffer[p]; }
          return ret;
        }
        return null;
      }
    }
  };
  //
  // Transitions and actions of 9,9 parser
  //
  mhchemParser.stateMachines['9,9'] = {
    transitions: mhchemParser.createTransitions({
      'empty': {
        '*': {} },
      ',': {
        '*': { action: 'comma' } },
      'else': {
        '*': { action: 'copy' } }
    }),
    actions: {
      'comma': function (buffer, m) { return { type: 'commaDecimal' }; }
    }
  };
  //
  //
  // \pu state machines
  //
  //
  // Transitions and actions of pu main parser
  //
  mhchemParser.stateMachines['pu'] = {
    transitions: mhchemParser.createTransitions({
      'empty': {
        '*': { action: 'output' } },
      '\{[(|)]\}': {
        '0|a': { action: 'copy' } },
      '(-)(9)^(-9)': {
        '0': { action: 'number^', nextState: 'a' } },
      '(-)(9.,9)(e)(99)': {
        '0': { action: 'enumber', nextState: 'a' } },
      'space': {
        '0|a': {} },
      'pm-operator': {
        '0|a': { action: { type: 'operator', option: '\\pm' }, nextState: '0' } },
      'operator': {
        '0|a': { action: 'copy', nextState: '0' } },
      '//': {
        'd': { action: 'o=', nextState: '/' } },
      '/': {
        'd': { action: 'o=', nextState: '/' } },
      '{...}|else': {
        '0|d': { action: 'd=', nextState: 'd' },
        'a': { action: [ 'space', 'd=' ], nextState: 'd' },
        '/|q': { action: 'q=', nextState: 'q' } }
    }),
    actions: {
      'enumber': function (buffer, m) {
        var ret = [];
        if (m[0] === "+-"  ||  m[0] === "+/-") {
          ret.push("\\pm ");
        } else if (m[0]) {
          ret.push(m[0]);
        }
        if (m[1]) {
          ret = mhchemParser.concatNotUndefined(ret, mhchemParser.go(m[1], 'pu-9,9'));
          if (m[2]) {
            if (m[2].match(/[,.]/)) {
              ret = mhchemParser.concatNotUndefined(ret, mhchemParser.go(m[2], 'pu-9,9'));
            } else {
              ret.push(m[2]);
            }
          }
          m[3] = m[4] || m[3];
          if (m[3]) {
            m[3] = m[3].trim();
            if (m[3] === "e"  ||  m[3].substr(0, 1) === "*") {
              ret.push({ type: 'cdot' });
            } else {
                ret.push({ type: 'times' });
            }
          }
        }
        if (m[3]) {
          ret.push("10^{"+m[5]+"}");
        }
        return ret;
      },
      'number^': function (buffer, m) {
        var ret = [];
        if (m[0] === "+-"  ||  m[0] === "+/-") {
          ret.push("\\pm ");
        } else if (m[0]) {
          ret.push(m[0]);
        }
        ret = mhchemParser.concatNotUndefined(ret, mhchemParser.go(m[1], 'pu-9,9'));
        ret.push("^{"+m[2]+"}");
        return ret;
      },
      'operator': function (buffer, m, p1) { return { type: 'operator', kind: (p1 || m) }; },
      'space': function (buffer, m) { return { type: 'pu-space-1' }; },
      'output': function (buffer, m) {
        var ret;
        var md = mhchemParser.matchh('{(...)}', buffer.d || "");
        if (md  &&  md.remainder === '') { buffer.d = md.matchh; }
        var mq = mhchemParser.matchh('{(...)}', buffer.q || "");
        if (mq  &&  mq.remainder === '') { buffer.q = mq.matchh; }
        if (buffer.d) {
            buffer.d = buffer.d.replace(/\u00B0C|\^oC|\^{o}C/g, "{}^{\\circ}C");
            buffer.d = buffer.d.replace(/\u00B0F|\^oF|\^{o}F/g, "{}^{\\circ}F");
        }
        if (buffer.q) {  // fraction
          buffer.d = mhchemParser.go(buffer.d, 'pu');
          buffer.q = buffer.q.replace(/\u00B0C|\^oC|\^{o}C/g, "{}^{\\circ}C");
          buffer.q = buffer.q.replace(/\u00B0F|\^oF|\^{o}F/g, "{}^{\\circ}F");
          buffer.q = mhchemParser.go(buffer.q, 'pu');
          if (buffer.o === '//') {
            ret = { type: 'pu-frac', p1: buffer.d, p2: buffer.q };
          } else {
            ret = buffer.d;
            if (buffer.d.length > 1  ||  buffer.q.length > 1) {
              ret = mhchemParser.concatNotUndefined(ret, { type: ' / ' });
            } else {
              ret = mhchemParser.concatNotUndefined(ret, { type: '/' });
            }
            ret = mhchemParser.concatNotUndefined(ret, buffer.q);
          }
        } else {  // no fraction
          ret = mhchemParser.go(buffer.d, 'pu-2');
        }
        for (var p in buffer) { delete buffer[p]; }
        return ret;
      }
    }
  };
  //
  // Transitions and actions of pu-2 parser
  //
  mhchemParser.stateMachines['pu-2'] = {
    transitions: mhchemParser.createTransitions({
      'empty': {
        '*': { action: 'output' } },
      '*': {
        '*': { action: [ 'output', 'cdot' ], nextState: '0' } },
      '\\x': {
        '*': { action: 'rm=' }, nextState: '1' },
      'space': {
        '*': { action: [ 'output', 'space' ], nextState: '0' } },
      '^{(...)}|^(-1)': {
        '1': { action: '^(-1)' } },
      '-9.,9': {
        '0': { action: 'rm=', nextState: '0' },
        '1': { action: '^(-1)', nextState: '0' } },
      '{...}|else': {
        '*': { action: 'rm=', nextState: '1' } }
    }),
    actions: {
      'cdot': function (buffer, m) { return { type: 'tight cdot' }; },
      '^(-1)': function (buffer, m) { buffer.rm += "^{"+m+"}"; },
      'space': function (buffer, m) { return { type: 'pu-space-2' }; },
      'output': function (buffer, m) {
        var ret;
        if (buffer.rm) {
          var mrm = mhchemParser.matchh('{(...)}', buffer.rm || "");
          if (mrm  &&  mrm.remainder === '') {
            ret = mhchemParser.go(mrm.matchh, 'pu');
          } else {
            ret = { type: 'rm', p1: buffer.rm };
          }
        }
        for (var p in buffer) { delete buffer[p]; }
        return ret;
      }
    }
  };
  //
  // Transitions and actions of 9,9 parser
  //
  mhchemParser.stateMachines['pu-9,9'] = {
    transitions: mhchemParser.createTransitions({
      'empty': {
        '0': { action: 'output-0' },
        'o': { action: 'output-o' } },
      ',': {
        '0': { action: [ 'output-0', 'comma' ], nextState: 'o' } },
      '.': {
        '0': { action: [ 'output-0', 'copy' ], nextState: 'o' } },
      'else': {
        '*': { action: 'text=' } }
    }),
    actions: {
      'comma': function (buffer, m) { return { type: 'commaDecimal' }; },
      'output-0': function (buffer, m) {
        var ret = [];
        if (buffer.text.length > 4) {
            var a = buffer.text.length % 3;
            if (a === 0) { a = 3; }
            for (var i=buffer.text.length-3; i>0; i-=3) {
              ret.push(buffer.text.substr(i, 3));
              ret.push({ type: '1000 separator' });
            }
            ret.push(buffer.text.substr(0, a));
            ret.reverse();
        } else {
            ret.push(buffer.text);
        }
        for (var p in buffer) { delete buffer[p]; }
        return ret;
      },
      'output-o': function (buffer, m) {
        var ret = [];
        if (buffer.text.length > 4) {
            var a = buffer.text.length - 3;
            for (var i=0; i<a; i+=3) {
              ret.push(buffer.text.substr(i, 3));
              ret.push({ type: '1000 separator' });
            }
            ret.push(buffer.text.substr(i));
        } else {
            ret.push(buffer.text);
        }
        for (var p in buffer) { delete buffer[p]; }
        return ret;
      }
    }
  };

  //
  //
  // Take MhchemParser output and convert it to TeX
  // (recursive)
  //
  //
  var texify = {
    types: {
      'chemfive': function (buf) {
        var res = "";
        buf.a = texify.go2(buf.a);
        buf.b = texify.go2(buf.b);
        buf.p = texify.go2(buf.p);
        buf.o = texify.go2(buf.o);
        buf.q = texify.go2(buf.q);
        buf.d = texify.go2(buf.d);
        //
        // a
        //
        if (buf.a) {
          if (buf.a.match(/^[+\-]/)) { buf.a = "{"+buf.a+"}"; }
          res += buf.a + "\\,";
        }
        //
        // b and p
        //
        if (buf.b || buf.p) {
          res += "{\\vphantom{X}}";
          res += "^{\\hphantom{"+(buf.b||"")+"}}_{\\hphantom{"+(buf.p||"")+"}}";
          res += "{\\vphantom{X}}";
          res += "^{\\smash[t]{\\vphantom{2}}\\mathllap{"+(buf.b||"")+"}}";
          res += "_{\\vphantom{2}\\mathllap{\\smash[t]{"+(buf.p||"")+"}}}";
        }
        //
        // o
        //
        if (buf.o) {
          if (buf.o.match(/^[+\-]/)) { buf.o = "{"+buf.o+"}"; }
          res += buf.o;
        }
        //
        // q and d
        //
        if (buf['d-type'] === 'kv') {
          if (buf.d || buf.q) {
            res += "{\\vphantom{X}}";
          }
          if (buf.d) {
            res += "^{"+buf.d+"}";
          }
          if (buf.q) {
            res += "_{\\smash[t]{"+buf.q+"}}";
          }
        } else if (buf['d-type'] === 'oxidation') {
          if (buf.d) {
            res += "{\\vphantom{X}}";
            res += "^{"+buf.d+"}";
          }
          if (buf.q) {
            res += "{\\vphantom{X}}";
            res += "_{\\smash[t]{"+buf.q+"}}";
          }
        } else {
          if (buf.q) {
            res += "{\\vphantom{X}}";
            res += "_{\\smash[t]{"+buf.q+"}}";
          }
          if (buf.d) {
            res += "{\\vphantom{X}}";
            res += "^{"+buf.d+"}";
          }
        }
        return res;
      },
      'rm': function (buf) { return "\\mathrm{"+buf.p1+"}"; },
      'text': function (buf) {
        if (buf.p1.match(/[\^_]/)) {
          buf.p1 = buf.p1.replace(" ", "~").replace("-", "\\text{-}");
          return "\\mathrm{"+buf.p1+"}";
        } else {
          return "\\text{"+buf.p1+"}";
        }
      },
      'roman numeral': function (buf) { return "\\mathrm{"+buf.p1+"}"; },
      'state of aggregation': function (buf) { return "\\mskip2mu "+texify.go2(buf.p1); },
      'state of aggregation subscript': function (buf) { return "\\mskip1mu "+texify.go2(buf.p1); },
      'bond': function (buf) {
        var ret = texify.bonds[buf.kind];
        if (!ret) {
          throw ["MhchemErrorBond", "mhchem Error. Unknown bond type (" + buf.kind + ")"];
        }
        return ret;
      },
      'frac': function (buf) {
          var c = "\\frac{" + buf.p1 + "}{" + buf.p2 + "}";
          return "\\mathchoice{\\textstyle"+c+"}{"+c+"}{"+c+"}{"+c+"}";
       },
      'pu-frac': function (buf) {
          var c = "\\frac{" + texify.go2(buf.p1) + "}{" + texify.go2(buf.p2) + "}";
          return "\\mathchoice{\\textstyle"+c+"}{"+c+"}{"+c+"}{"+c+"}";
       },
      'tex-math': function (buf) { return buf.p1 + " "; },
      'frac-ce': function (buf) {
        return "\\frac{" + texify.go2(buf.p1) + "}{" + texify.go2(buf.p2) + "}";
      },
      'overset': function (buf) {
        return "\\overset{" + texify.go2(buf.p1) + "}{" + texify.go2(buf.p2) + "}";
      },
      'underset': function (buf) {
        return "\\underset{" + texify.go2(buf.p1) + "}{" + texify.go2(buf.p2) + "}";
      },
      'underbrace': function (buf) {
        return "\\underbrace{" + texify.go2(buf.p1) + "}_{" + texify.go2(buf.p2) + "}";
      },
      'color': function (buf) {
        return "{\\color{" + buf.color1 + "}{" + texify.go2(buf.color2) + "}}";
      },
      'color0': function (buf) {
        return "\\color{" + buf.color + "}";
      },
      'arrow': function (buf) {
        buf.rd = texify.go2(buf.rd);
        buf.rq = texify.go2(buf.rq);
        var arrow = texify.arrows[buf.r];
        if (buf.rq) { arrow += "[{" + buf.rq + "}]"; }
        if (buf.rd) {
          arrow += "{" + buf.rd + "}";
        } else {
          arrow += "{}";
        }
        return arrow;
      },
      'operator': function (buf) { return texify.operators[buf.kind]; }
    },
    arrows: {
      "->": "\\xrightarrow",
      "\u2192": "\\xrightarrow",
      "\u27F6": "\\xrightarrow",
      "<-": "\\xleftarrow",
      "<->": "\\xleftrightarrow",
      "<-->": "\\xrightleftarrows",
      "<=>": "\\xrightleftharpoons",
      "\u21CC": "\\xrightleftharpoons",
      "<=>>": "\\xrightequilibrium",
      "<<=>": "\\xleftequilibrium"
    },
    bonds: {
      "-": "{-}",
      "1": "{-}",
      "=": "{=}",
      "2": "{=}",
      "#": "{\\equiv}",
      "3": "{\\equiv}",
      "~": "{\\tripledash}",
      "~-": "{\\mathrlap{\\raisebox{-.1em}{$-$}}\\raisebox{.1em}{$\\tripledash$}}",
      "~=": "{\\mathrlap{\\raisebox{-.2em}{$-$}}\\mathrlap{\\raisebox{.2em}{$\\tripledash$}}-}",
      "~--": "{\\mathrlap{\\raisebox{-.2em}{$-$}}\\mathrlap{\\raisebox{.2em}{$\\tripledash$}}-}",
      "-~-": "{\\mathrlap{\\raisebox{-.2em}{$-$}}\\mathrlap{\\raisebox{.2em}{$-$}}\\tripledash}",
      "...": "{{\\cdot}{\\cdot}{\\cdot}}",
      "....": "{{\\cdot}{\\cdot}{\\cdot}{\\cdot}}",
      "->": "{\\rightarrow}",
      "<-": "{\\leftarrow}",
      "<": "{<}",
      ">": "{>}"
    },
    entities: {
      'space': " ",
      'entitySkip': "~",
      'pu-space-1': "~",
      'pu-space-2': "\\mkern3mu ",
      '1000 separator': "\\mkern2mu ",
      'commaDecimal': "{,}",
      'comma enumeration L': "{{0}}\\mkern6mu ",
      'comma enumeration M': "{{0}}\\mkern3mu ",
      'comma enumeration S': "{{0}}\\mkern1mu ",
      'hyphen': "\\text{-}",
      'addition compound': "\\,{\\cdot}\\,",
      'electron dot': "\\mkern1mu \\bullet\\mkern1mu ",
      'KV x': "{\\times}",
      'prime': "\\prime ",
      'cdot': "\\cdot ",
      'tight cdot': "\\mkern1mu{\\cdot}\\mkern1mu ",
      'times': "\\times ",
      'circa': "{\\sim}",
      '^': "uparrow",
      'v': "downarrow",
      'ellipsis': "\\ldots ",
      '/': "/",
      ' / ': "\\,/\\,",
      '1st-level escape': "{0} "  // &, \\\\, \\hline
    },
    operators: {
      "+": " {}+{} ",
      "-": " {}-{} ",
      "=": " {}={} ",
      "<": " {}<{} ",
      ">": " {}>{} ",
      "<<": " {}\\ll{} ",
      ">>": " {}\\gg{} ",
      "\\pm": " {}\\pm{} ",
      "\\approx": " {}\\approx{} ",
      "$\\approx$": " {}\\approx{} ",
      "v": " \\downarrow{} ",
      "(v)": " \\downarrow{} ",
      "^": " \\uparrow{} ",
      "(^)": " \\uparrow{} "
    },

    go: function (input, isInner) {
      if (!input) { return input; }
      var res = "";
      var cee = false;
      for (var i=0; i<input.length; i++) {
        var inputi = input[i];
        if (typeof inputi === "string") {
          res += inputi;
        } else if (this.types[inputi.type]) {
          res += this.types[inputi.type](inputi);
        } else if (this.entities[inputi.type]) {
          var a = this.entities[inputi.type];
          a = a.replace("{0}", inputi.p1 || "");
          a = a.replace("{1}", inputi.p2 || "");
          res += a;
          if (inputi.type === '1st-level escape') { cee = true; }
        } else {
          throw ["MhchemBugT", "mhchem bug T. Please report."];  // Missing texify rule or unknown MhchemParser output
        }
      }
      if (!isInner && !cee) {
        res = "{" + res + "}";
      }
      return res;
    },
    go2: function(input) {
      return this.go(input, true);
    }
  };

return {
  expand: chemParse,
};

})();
