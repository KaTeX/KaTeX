"use strict";

function fontView() {
    var match = /(?:^\?|&)f=([^&]*)/.exec(window.location.search);
    if (!match) return;
    var font = match[1];
    var style = "@font-face {\n" +
        "  font-family: '" + font + "';\n" +
        "  src: url('/fonts/" + font + ".eot');\n  src:" +
        " url('/fonts/" + font + ".eot#iefix')" +
        " format('embedded-opentype')," +
        " url('/fonts/" + font + ".woff2')" +
        " format('woff2')," +
        " url('/fonts/" + font + ".woff')" +
        " format('woff')," +
        " url('/fonts/" + font + ".ttf')" +
        " format('ttf');\n" +
        "  font-weight: normal;\n" +
        "  font-style: normal;\n" +
        "}\n\n" +
        ".curfont {\n" +
        "  font-family: '" + font + "';\n" +
        "  font-weight: normal;\n" +
        "  font-style: normal;\n" +
        "}\n";
    var styleElt = document.createElement("style");
    styleElt.setAttribute("type", "text/css");
    styleElt.textContent = style;
    document.head.appendChild(styleElt);

    var req = new XMLHttpRequest();
    req.open("GET", "/fonts/" + font + ".ttx", true);
    req.overrideMimeType("application/xml");
    req.onload = fontData;
    req.send();
}

function td(content, className) {
    var elt = document.createElement("td");
    elt.textContent = content;
    elt.className = className;
    return elt;
}

function fontData() {
    var resp = this.responseXML;
    console.log(resp);
    var maps = resp.getElementsByTagName("cmap_format_4");
    var map = null;
    for (var mapi = 0; mapi < maps.length; ++mapi) {
        var map = maps[mapi];
        if (map.getAttribute("platformID") === "3" &&
            map.getAttribute("platEncID") === "1") {
            break;
        }
    }
    var table = document.createElement("table");
    for (var n = map.firstChild; n; n = n.nextSibling) {
        if (n.nodeType !== 1) continue;
        var code = parseInt(n.getAttribute("code").substr(2), 16);
        var str = String.fromCharCode(code);
        var name = n.getAttribute("name");
        var tr = document.createElement("tr");
        tr.appendChild(td(code, "code"));
        tr.appendChild(td(str, "curfont"));
        tr.appendChild(td(str, "reffont"));
        tr.appendChild(td(name, "name"));
        table.appendChild(tr);
    }
    document.getElementById("table").appendChild(table);
}

fontView();
