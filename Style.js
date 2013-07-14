function Style(id, size, cramped) {
    this.id = id;
    this.size = size;
    this.cramped = cramped;
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

/**
 * HTML class name, like "display cramped"
 */
Style.prototype.cls = function() {
    return sizeNames[this.size] + (this.cramped ? " cramped" : " uncramped");
};

var D   = 0;
var Dc  = 1;
var T   = 2;
var Tc  = 3;
var S   = 4;
var Sc  = 5;
var SS  = 6;
var SSc = 7;

var sizeNames = [
    "displaystyle textstyle",
    "textstyle",
    "scriptstyle",
    "scriptscriptstyle"
];

var styles = [
    new Style(D, 0, false),
    new Style(Dc, 0, true),
    new Style(T, 1, false),
    new Style(Tc, 1, true),
    new Style(S, 2, false),
    new Style(Sc, 2, true),
    new Style(SS, 3, false),
    new Style(SSc, 3, true)
];

var sup = [S, Sc, S, Sc, SS, SSc, SS, SSc];
var sub = [Sc, Sc, Sc, Sc, SSc, SSc, SSc, SSc];
var fracNum = [T, Tc, S, Sc, SS, SSc, SS, SSc];
var fracDen = [Tc, Tc, Sc, Sc, SSc, SSc, SSc, SSc];

module.exports = {
    DISPLAY: styles[D],
    TEXT: styles[T],
};
