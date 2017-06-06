/**
 * This file contains information about the options that the Parser carries
 * around with it while parsing. Data is held in an `Options` object, and when
 * recursing, a new `Options` object can be created with the `.with*` and
 * `.reset` functions.
 */

const Style = require("./Style");

const sizeStyleMap = [
    // Each element contains [textsize, scriptsize, scriptscriptsize].
    // Obtained by rounding [1x, 0.7x, 0.5x] the base size.
    [1, 1, 1],    // size1: 0.5
    [2, 1, 1],    // size2: 0.7
    [3, 2, 1],    // size3: 0.8
    [4, 2, 1],    // size4: 0.9
    [5, 2, 1],    // size5: 1.0
    [6, 3, 2],    // size6: 1.2
    [7, 5, 2],    // size7: 1.44
    [8, 6, 4],    // size8: 1.73
    [9, 7, 5],    // size9: 2.07
    [10, 8, 6],   // size10: 2.49
];

const sizeMultipliers = [
    0.5, 0.7, 0.8, 0.9, 1.0, 1.2, 1.44, 1.73, 2.07, 2.49,
];

/**
 * This is the main options class. It contains the current style, size, color,
 * and font.
 *
 * Options objects should not be modified. To create a new Options with
 * different properties, call a `.having*` method.
 */
function Options(data) {
    this.style = data.style;
    this.color = data.color;
    this.size = data.size;
    this.baseSize = data.baseSize || this.size;
    this.phantom = data.phantom;
    this.font = data.font;
    this.sizeMultiplier = sizeMultipliers[this.size - 1];
}

/**
 * Returns a new options object with the same properties as "this".  Properties
 * from "extension" will be copied to the new options object.
 */
Options.prototype.extend = function(extension) {
    const data = {
        style: this.style,
        size: this.size,
        baseSize: this.baseSize,
        color: this.color,
        parentStyle: this.style,
        parentSize: this.size,
        phantom: this.phantom,
        font: this.font,
    };

    for (const key in extension) {
        if (extension.hasOwnProperty(key)) {
            data[key] = extension[key];
        }
    }

    return new Options(data);
};

function sizeAtStyle(size, style) {
    return style.size < 2 ? size : sizeStyleMap[size - 1][style.size - 1];
}

/**
 * Return an options object with the given style. If `this.style === style`,
 * returns `this`.
 */
Options.prototype.havingStyle = function(style) {
    if (this.style === style) {
        return this;
    } else {
        return this.extend({
            style: style,
            size: sizeAtStyle(this.baseSize, style),
        });
    }
};

/**
 * Return an options object with a cramped version of the current style. If
 * the current style is cramped, returns `this`.
 */
Options.prototype.havingCrampedStyle = function() {
    return this.havingStyle(this.style.cramp());
};

/**
 * Return an options object with the given size and baseSize. If
 * `this.size === size && this.baseSize === size`, returns `this`.
 * Also resets the style to be at least `\textstyle`.
 */
Options.prototype.havingSize = function(size) {
    if (this.size === size && this.baseSize === size) {
        return this;
    } else {
        // Ensure style is at least `\textstyle`.
        let style = this.style;
        if (style.size > 1) {
            style = style.cramped ? Style.TEXT.cramp() : Style.TEXT;
        }

        return this.extend({
            style: style,
            size: size,
            baseSize: size,
        });
    }
};

/**
 * Like `this.havingSize(5).havingStyle(style)`.
 */
Options.prototype.havingBaseStyle = function(style) {
    const wantSize = sizeAtStyle(5, style);
    if (this.size === wantSize && this.baseSize === 5 && this.style === style) {
        return this;
    } else {
        return this.extend({
            style: style,
            size: wantSize,
            baseSize: 5,
        });
    }
};

/**
 * Create a new options object with the given color.
 */
Options.prototype.withColor = function(color) {
    return this.extend({
        color: color,
    });
};

/**
 * Create a new options object with "phantom" set to true.
 */
Options.prototype.withPhantom = function() {
    return this.extend({
        phantom: true,
    });
};

/**
 * Create a new options objects with the give font.
 */
Options.prototype.withFont = function(font) {
    return this.extend({
        font: font || this.font,
    });
};

/**
 * Return the CSS sizing classes required to switch from enclosing options
 * `oldOptions` to `this`. Returns an array of classes.
 */
Options.prototype.sizingClasses = function(oldOptions) {
    if (oldOptions.size !== this.size) {
        return ["sizing", "reset-size" + oldOptions.size, "size" + this.size];
    } else {
        return [];
    }
};

/**
 * A map of color names to CSS colors.
 * TODO(emily): Remove this when we have real macros
 */
const colorMap = {
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
    "katex-kaGreen": "#71B307",
};

/**
 * Gets the CSS color of the current options object, accounting for the
 * `colorMap`.
 */
Options.prototype.getColor = function() {
    if (this.phantom) {
        return "transparent";
    } else {
        return colorMap[this.color] || this.color;
    }
};

module.exports = Options;
