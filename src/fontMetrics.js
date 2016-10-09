/* eslint no-unused-vars:0 */

var Style = require("./Style");
var cjkRegex = require("./unicodeRegexes").cjkRegex;

/**
 * This file contains metrics regarding fonts and individual symbols. The sigma
 * and xi variables, as well as the metricMap map contain data extracted from
 * TeX, TeX font metrics, and the TTF files. These data are then exposed via the
 * `metrics` variable and the getCharacterMetrics function.
 */

// In TeX, there are actually three sets of dimensions, one for each of
// textstyle, scriptstyle, and scriptscriptstyle.  These are provided in the
// the arrays below, in that order.  Metrics with only a single value are
// assumed to be the same for all three font styles.
//
// The font metrics are stored in fonts cmsy10, cmsy7, and cmsy5 respsectively.
// This was determined by running the folllowing script:
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
var sigma1 = [0.250, 0.250, 0.250];  // slant
var sigma2 = [0.000, 0.000, 0.000];  // space
var sigma3 = [0.000, 0.000, 0.000];  // stretch
var sigma4 = [0.000, 0.000, 0.000];  // shrink
var sigma5 = [0.431, 0.431, 0.431];  // xheight
var sigma6 = [1.000, 1.171, 1.472];  // quad
var sigma7 = [0.000, 0.000, 0.000];  // extraspace
var sigma8 = [0.677, 0.732, 0.925];  // num1
var sigma9 = [0.394, 0.384, 0.387];  // num2
var sigma10 = [0.444, 0.471, 0.504]; // num3
var sigma11 = [0.686, 0.752, 1.025]; // denom1
var sigma12 = [0.345, 0.344, 0.532]; // denom2
var sigma13 = [0.413, 0.503, 0.504]; // sup1
var sigma14 = [0.363, 0.431, 0.404]; // sup2
var sigma15 = [0.289, 0.286, 0.294]; // sup3
var sigma16 = [0.150, 0.143, 0.200]; // sub1
var sigma17 = [0.247, 0.286, 0.400]; // sub2
var sigma18 = [0.386, 0.353, 0.494]; // supdrop
var sigma19 = [0.050, 0.071, 0.100]; // subdrop
var sigma20 = [2.390, 1.700, 1.980]; // delim1
var sigma21 = [1.010, 1.157, 1.420]; // delim2
var sigma22 = [0.250, 0.250, 0.250]; // axisHeight

// These font metrics are extracted from TeX by using
// \font\a=cmex10
// \showthe\fontdimenX\a
// where X is the corresponding variable number. These correspond to the font
// parameters of the extension fonts (family 3). See the TeXbook, page 441.
var xi1 = 0;
var xi2 = 0;
var xi3 = 0;
var xi4 = 0;
var xi5 = 0.431;
var xi6 = 1;
var xi7 = 0;
var xi8 = 0.04;
var xi9 = 0.111;
var xi10 = 0.166;
var xi11 = 0.2;
var xi12 = 0.6;
var xi13 = 0.1;

// This value determines how large a pt is, for metrics which are defined in
// terms of pts.
// This value is also used in katex.less; if you change it make sure the values
// match.
var ptPerEm = 10.0;

// The space between adjacent `|` columns in an array definition. From
// `\showthe\doublerulesep` in LaTeX.
var doubleRuleSep = 2.0 / ptPerEm;

// Return a function that will return the style specific value for the given
// array of metric values.
function createMetricsGetter(metrics) {
    return function(style) {
        var size = style.size;
        if (size === Style.TEXT.size || size === Style.DISPLAY.size) {
            return metrics[0];
        } else if (size === Style.SCRIPT.size) {
            return metrics[1];
        } else if (size === Style.SCRIPTSCRIPT.size) {
            return metrics[2];
        }
        throw new Error("Unexpected style size: " + style.size);
    };
}

/**
 * This is just a mapping from common names to real metrics
 */
var metrics = {
    getXHeight: createMetricsGetter(sigma5),
    getQuad: createMetricsGetter(sigma6),
    getNum1: createMetricsGetter(sigma8),
    getNum2: createMetricsGetter(sigma9),
    getNum3: createMetricsGetter(sigma10),
    getDenom1: createMetricsGetter(sigma11),
    getDenom2: createMetricsGetter(sigma12),
    getSup1: createMetricsGetter(sigma13),
    getSup2: createMetricsGetter(sigma14),
    getSup3: createMetricsGetter(sigma15),
    getSub1: createMetricsGetter(sigma16),
    getSub2: createMetricsGetter(sigma17),
    getSupDrop: createMetricsGetter(sigma18),
    getSubDrop: createMetricsGetter(sigma19),
    getDelim1: createMetricsGetter(sigma20),
    getDelim2: createMetricsGetter(sigma21),
    getAxisHeight: createMetricsGetter(sigma22),

    defaultRuleThickness: xi8,
    bigOpSpacing1: xi9,
    bigOpSpacing2: xi10,
    bigOpSpacing3: xi11,
    bigOpSpacing4: xi12,
    bigOpSpacing5: xi13,
    ptPerEm: ptPerEm,
    getEmPerEx: function(style) {
        return sigma5 / metrics.getQuad(style);
    },
    doubleRuleSep: doubleRuleSep,
};

// This map contains a mapping from font name and character code to character
// metrics, including height, depth, italic correction, and skew (kern from the
// character to the corresponding \skewchar)
// This map is generated via `make metrics`. It should not be changed manually.
var metricMap = require("./fontMetricsData");

// These are very rough approximations.  We default to Times New Roman which
// should have Latin-1 and Cyrillic characters, but may not depending on the
// operating system.  The metrics do not account for extra height from the
// accents.  In the case of Cyrillic characters which have both ascenders and
// descenders we prefer approximations with ascenders, primarily to prevent
// the fraction bar or root line from intersecting the glyph.
// TODO(kevinb) allow union of multiple glyph metrics for better accuracy.
var extraCharacterMap = {
    // Latin-1
    'À': 'A',
    'Á': 'A',
    'Â': 'A',
    'Ã': 'A',
    'Ä': 'A',
    'Å': 'A',
    'Æ': 'A',
    'Ç': 'C',
    'È': 'E',
    'É': 'E',
    'Ê': 'E',
    'Ë': 'E',
    'Ì': 'I',
    'Í': 'I',
    'Î': 'I',
    'Ï': 'I',
    'Ð': 'D',
    'Ñ': 'N',
    'Ò': 'O',
    'Ó': 'O',
    'Ô': 'O',
    'Õ': 'O',
    'Ö': 'O',
    'Ø': 'O',
    'Ù': 'U',
    'Ú': 'U',
    'Û': 'U',
    'Ü': 'U',
    'Ý': 'Y',
    'Þ': 'o',
    'ß': 'B',
    'à': 'a',
    'á': 'a',
    'â': 'a',
    'ã': 'a',
    'ä': 'a',
    'å': 'a',
    'æ': 'a',
    'ç': 'c',
    'è': 'e',
    'é': 'e',
    'ê': 'e',
    'ë': 'e',
    'ì': 'i',
    'í': 'i',
    'î': 'i',
    'ï': 'i',
    'ð': 'd',
    'ñ': 'n',
    'ò': 'o',
    'ó': 'o',
    'ô': 'o',
    'õ': 'o',
    'ö': 'o',
    'ø': 'o',
    'ù': 'u',
    'ú': 'u',
    'û': 'u',
    'ü': 'u',
    'ý': 'y',
    'þ': 'o',
    'ÿ': 'y',

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
    'я': 'r',
};

/**
 * This function is a convenience function for looking up information in the
 * metricMap table. It takes a character as a string, and a style.
 *
 * Note: the `width` property may be undefined if fontMetricsData.js wasn't
 * built using `Make extended_metrics`.
 */
var getCharacterMetrics = function(character, style) {
    var ch = character.charCodeAt(0);
    if (character[0] in extraCharacterMap) {
        ch = extraCharacterMap[character[0]].charCodeAt(0);
    } else if (cjkRegex.test(character[0])) {
        ch = 'M'.charCodeAt(0);
    }
    var metrics = metricMap[style][ch];
    if (metrics) {
        return {
            depth: metrics[0],
            height: metrics[1],
            italic: metrics[2],
            skew: metrics[3],
            width: metrics[4],
        };
    }
};

module.exports = {
    metrics: metrics,
    getCharacterMetrics: getCharacterMetrics,
};
