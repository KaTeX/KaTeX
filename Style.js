function Style(id, size, multiplier, cramped) {
    this.id = id;
    this.size = size;
    this.cramped = cramped;
    this.sizeMultiplier = multiplier;
}

Style.prototype.sup = function() {
    return styles[sup[this.id]];
};

Style.prototype.sub = function() {
    return styles[sub[this.id]];
};

Style.prototype.fracNum = function() {
    return styles[fracNum[this.id]];
};

Style.prototype.fracDen = function() {
    return styles[fracDen[this.id]];
};

Style.prototype.cramp = function() {
    return styles[cramp[this.id]];
};

// HTML class name, like "displaystyle cramped"
Style.prototype.cls = function() {
    return sizeNames[this.size] + (this.cramped ? " cramped" : " uncramped");
};

// HTML Reset class name, like "reset-textstyle"
Style.prototype.reset = function() {
    return resetNames[this.size];
};

var D = 0;
var Dc = 1;
var T = 2;
var Tc = 3;
var S = 4;
var Sc = 5;
var SS = 6;
var SSc = 7;

var sizeNames = [
    "displaystyle textstyle",
    "textstyle",
    "scriptstyle",
    "scriptscriptstyle"
];

var resetNames = [
    "reset-textstyle",
    "reset-textstyle",
    "reset-scriptstyle",
    "reset-scriptscriptstyle",
];

var styles = [
    new Style(D, 0, 1.0, false),
    new Style(Dc, 0, 1.0, true),
    new Style(T, 1, 1.0, false),
    new Style(Tc, 1, 1.0, true),
    new Style(S, 2, 0.7, false),
    new Style(Sc, 2, 0.7, true),
    new Style(SS, 3, 0.5, false),
    new Style(SSc, 3, 0.5, true)
];

var sup = [S, Sc, S, Sc, SS, SSc, SS, SSc];
var sub = [Sc, Sc, Sc, Sc, SSc, SSc, SSc, SSc];
var fracNum = [T, Tc, S, Sc, SS, SSc, SS, SSc];
var fracDen = [Tc, Tc, Sc, Sc, SSc, SSc, SSc, SSc];
var cramp = [Dc, Dc, Tc, Tc, Sc, Sc, SSc, SSc];

module.exports = {
    DISPLAY: styles[D],
    TEXT: styles[T]
};
