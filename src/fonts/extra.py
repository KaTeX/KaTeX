extra = {}

extra['Main-Regular'] = {
    'cdots': [
        'Select(0u22C5)',
        'Copy()',
        'Select(0u22EF)',
        'Paste()',
        'PasteWithOffset(447,0)',
        'PasteWithOffset(894,0)',
        'SetRBearing(894,1)',
    ],

    'ldots': [
        'Select(0u2E)',
        'Copy()',
        'Select(0u2026)',
        'Paste()',
        'PasteWithOffset(447,0)',
        'PasteWithOffset(894,0)',
        'SetRBearing(894,1)',
    ],

    'vdots': [
        'Select(0u2E)',
        'Copy()',
        'Select(0u22EE)',
        'Clear()',
        'PasteWithOffset(0,-30)',
        'PasteWithOffset(0,380)',
        'PasteWithOffset(0,780)',
        'SetRBearing(-722,1)',
    ],

    'ddots': [
        'Select(0u2E)',
        'Copy()',
        'Select(0u22F1)',
        'Clear()',
        'PasteWithOffset(55,700)',
        'PasteWithOffset(502,400)',
        'PasteWithOffset(949,100)',
        'SetRBearing(282,1)',
    ],

    'spaceEn': [
        'Select(0u2002)',
        'SetRBearing(500)',
    ],

    'spaceEm': [
        'Select(0u2003)',
        'SetRBearing(999)',
    ],

    'space3': [
        'Select(0u2004)',
        'SetRBearing(333)',
    ],

    'space4': [
        'Select(0u2005)',
        'SetRBearing(250)',
    ],

    'space6': [
        'Select(0u2006)',
        'SetRBearing(167)',
    ],

    'thinspace': [
        'Select(0u2009)',
        'SetRBearing(167)',
    ],

    'hairspace': [
        'Select(0u200A)',
        'SetRBearing(83)',
    ],

    'cong': [
        'Select(0u223C)',
        'Copy()',
        'Select(0u2245)',
        'Clear()',
        'PasteWithOffset(0,222)',
        'Select(0u3D)',
        'Copy()',
        'Select(0u2245)',
        'PasteWithOffset(0,-111)',
        'SetWidth(778)',
    ],

    'bowtie': [
        'Select(0u25B9)',
        'Copy()',
        'Select(0u22C8)',
        'Paste()',
        'Select(0u25C3)',
        'Copy()',
        'Select(0u22C8)',
        'PasteWithOffset(400,0)',
        'SetRBearing(400,1)',
        'RemoveOverlap()',
    ],

    'models': [
        'Select(0u2223)',
        'Copy()',
        'Select(0u22A8)',
        'Paste()',
        'Select(0u3D)',
        'Copy()',
        'Select(0u22A8)',
        'PasteWithOffset(89,0)',
        'SetRBearing(589,1)',
        'RemoveOverlap()',
    ],

    'doteq': [
        'Select(0u3D)',
        'Copy()',
        'Select(0u2250)',
        'Paste()',
        'Select(0u2E)',
        'Copy()',
        'Select(0u2250)',
        'PasteWithOffset(251,550)',
    ],

    'not': [
        'Select(0uE020)',
        'SetRBearing(778,1)',
    ],

    # notin : [
    #  'Select(0u2208)',
    #  'Copy()',
    #  'Select(0u2209)',
    #  'Paste()',
    #  'Select(0u338)',
    #  'Copy()',
    #  'Select(0u2209)',
    #  'PasteWithOffset(-55,0)',
    #  'RemoveOverlap()',
    # ],

    # noteq : [
    #  'Select(0u3D)',
    #  'Copy()',
    #  'Select(0u2260)',
    #  'Paste()',
    #  'Select(0u338)',
    #  'Copy()',
    #  'Select(0u2260)',
    #  'PasteWithOffset(0,0)',
    #  'RemoveOverlap()',
    # ],

    'longleftarrow': [
        'Select(0u2190)',
        'Copy()',
        'Select(0u27F5)',
        'Paste()',
        'Select(0u2212)',
        'Copy()',
        'Select(0u27F5)',
        'PasteWithOffset(831,0)',
        'SetRBearing(609,1)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'Longleftarrow': [
        'Select(0u21D0)',
        'Copy()',
        'Select(0u27F8)',
        'Paste()',
        'Select(0u3D)',
        'Copy()',
        'Select(0u27F8)',
        'PasteWithOffset(831,0)',
        'SetRBearing(609,1)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'longrightarrow': [
        'Select(0u2212)',
        'Copy()',
        'Select(0u27F6)',
        'Paste()',
        'Select(0u2192)',
        'Copy()',
        'Select(0u27F6)',
        'PasteWithOffset(609,0)',
        'SetRBearing(860,1)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'Longrightarrow': [
        'Select(0u3D)',
        'Copy()',
        'Select(0u27F9)',
        'Paste()',
        'Select(0u21D2)',
        'Copy()',
        'Select(0u27F9)',
        'PasteWithOffset(638,0)',
        'SetRBearing(860,1)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'leftrightarrow': [
        'Select(0u2190)',
        'Copy()',
        'Select(0u27F7)',
        'Paste()',
        'Select(0u2192)',
        'Copy()',
        'Select(0u27F7)',
        'PasteWithOffset(859,0)',
        'SetRBearing(859,1)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'Leftrightarrow': [
        'Select(0u21D0)',
        'Copy()',
        'Select(0u27FA)',
        'Paste()',
        'Select(0u21D2)',
        'Copy()',
        'Select(0u27FA)',
        'PasteWithOffset(858,0)',
        'SetRBearing(858,1)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'mapsto': [
        'Select(0u2192)',
        'Copy()',
        'Select(0u21A6)',
        'Paste()',
        'Generate("otf/Main-Regular.otf")',
        'Open("pfa/cmsy10.pfa")',
        'Select(0x37)',
        'Copy()',
        'Open("otf/Main-Regular.otf")',
        'Select(0u21A6)',
        'PasteWithOffset(0,0)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'xlongmapsto': [
        'Select(0u27F6)',
        'Copy()',
        'Select(0u27FC)',
        'Paste()',
        'Generate("otf/Main-Regular.otf")',
        'Open("pfa/cmsy10.pfa")',
        'Select(0x37)',
        'Copy()',
        'Open("otf/Main-Regular.otf")',
        'Select(0u27FC)',
        'PasteWithOffset(0,0)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'hookleftarrow': [
        'Select(0u2190)',
        'Copy()',
        'Select(0u21A9)',
        'Paste()',
        'Generate("otf/Main-Regular.otf")',
        'Open("pfa/cmmi10.pfa")',
        'Select(0x2D)',
        'Copy()',
        'Open("otf/Main-Regular.otf")',
        'Select(0u21A9)',
        'PasteWithOffset(848,0)',
        'SetRBearing(126,1)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'hookrightarrow': [
        'Generate("otf/Main-Regular.otf")',
        'Open("pfa/cmmi10.pfa")',
        'Select(0x2C)',
        'Copy()',
        'Open("otf/Main-Regular.otf")',
        'Select(0u21AA)',
        'Paste()',
        'Select(0u2192)',
        'Copy()',
        'Select(0u21AA)',
        'PasteWithOffset(126,0)',
        'SetRBearing(848,1)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'rightleftharpoons': [
        'Select(0u21BD)',
        'Copy()',
        'Select(0u21CC)',
        'Paste()',
        'Select(0u21C0)',
        'Copy()',
        'Select(0u21CC)',
        'PasteWithOffset(0,160)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'lgroup': [
        'Select(0u23B0)',
        'Copy()',
        'Select(0u27EE)',
        'Paste()',
        'Select(0u23A9)',
        'Copy()',
        'Select(0u27EE)',
        'PasteWithOffset(0,0)',
        'Scale(55,0,0)',
        'RoundToInt()',
        'Move(-38,250)',
        'RemoveOverlap()',
        'Simplify()',
        'SetRBearing(-38,1)',
    ],

    'rgroup': [
        'Select(0u23B1)',
        'Copy()',
        'Select(0u27EF)',
        'Paste()',
        'Select(0u23AD)',
        'Copy()',
        'Select(0u27EF)',
        'PasteWithOffset(1,0)',
        'Scale(55,0,0)',
        'RoundToInt()',
        'Move(-38,250)',
        'RemoveOverlap()',
        'Simplify()',
        'SetRBearing(-38,1)',
    ],

    'lmoustache': [
        'Select(0u23AD)',
        'Copy()',
        'Select(0u23B0)',
        'PasteWithOffset(0,0)',
        'Scale(55,0,0)',
        'RoundToInt()',
        'Move(-38,250)',
        'RemoveOverlap()',
        'Simplify()',
        'SetRBearing(-38,1)',
    ],

    'rmoustache': [
        'Select(0u23A9)',
        'Copy()',
        'Select(0u23B1)',
        'PasteWithOffset(0,0)',
        'Scale(55,0,0)',
        'RoundToInt()',
        'Move(-38,250)',
        'RemoveOverlap()',
        'Simplify()',
        'SetRBearing(-38,1)',
    ],

    'diacriticals': [
        'Select(0uB0)',
        'SetRBearing(-125,1)',   # \degree
        'Select(0u20D7)',
        'SetRBearing(153,1)',    # \vec
    ],
}

extra['Main-Bold'] = {
    'cdots': [
        'Select(0u22C5)',
        'Copy()',
        'Select(0u22EF)',
        'Paste()',
        'PasteWithOffset(488,0)',
        'PasteWithOffset(976,0)',
        'SetRBearing(976,1)',
    ],

    'ldots': [
        'Select(0u2E)',
        'Copy()',
        'Select(0u2026)',
        'Paste()',
        'PasteWithOffset(488,0)',
        'PasteWithOffset(976,0)',
        'SetRBearing(976,1)',
    ],

    'vdots': [
        'Select(0u2E)',
        'Copy()',
        'Select(0u22EE)',
        'Clear()',
        'PasteWithOffset(0,-30)',
        'PasteWithOffset(0,380)',
        'PasteWithOffset(0,780)',
        'SetRBearing(-681,1)',
    ],

    'ddots': [
        'Select(0u2E)',
        'Copy()',
        'Select(0u22F1)',
        'Clear()',
        'PasteWithOffset(55,700)',
        'PasteWithOffset(502,400)',
        'PasteWithOffset(949,100)',
        'SetRBearing(323,1)',
    ],

    'spaceEn': [
        'Select(0u2002)',
        'SetRBearing(500)',
    ],

    'spaceEm': [
        'Select(0u2003)',
        'SetRBearing(999)',
    ],

    'space3': [
        'Select(0u2004)',
        'SetRBearing(333)',
    ],

    'space4': [
        'Select(0u2005)',
        'SetRBearing(250)',
    ],

    'space6': [
        'Select(0u2006)',
        'SetRBearing(167)',
    ],

    'thinspace': [
        'Select(0u2009)',
        'SetRBearing(167)',
    ],

    'hairspace': [
        'Select(0u200A)',
        'SetRBearing(83)',
    ],

    'cong': [
        'Select(0u223C)',
        'Copy()',
        'Select(0u2245)',
        'Clear()',
        'PasteWithOffset(0,247)',
        'Select(0u3D)',
        'Copy()',
        'Select(0u2245)',
        'PasteWithOffset(0,-136)',
        'SetWidth(894)',
    ],

    'bowtie': [
        'Select(0u25B9)',
        'Copy()',
        'Select(0u22C8)',
        'Paste()',
        'Select(0u25C3)',
        'Copy()',
        'Select(0u22C8)',
        'PasteWithOffset(425,0)',
        'SetRBearing(425,1)',
        'RemoveOverlap()',
    ],

    'models': [
        'Select(0u2223)',
        'Copy()',
        'Select(0u22A8)',
        'Paste()',
        'Select(0u3D)',
        'Copy()',
        'Select(0u22A8)',
        'PasteWithOffset(89,0)',
        'SetRBearing(655,1)',
        'RemoveOverlap()',
    ],

    'doteq': [
        'Select(0u3D)',
        'Copy()',
        'Select(0u2250)',
        'Paste()',
        'Select(0u2E)',
        'Copy()',
        'Select(0u2250)',
        'PasteWithOffset(288,550)',
    ],

    'not': [
        'Select(0uE020)',
        'SetRBearing(894,1)',
    ],

    #  'notin' : [
    #    'Select(0u2208)',
    #    'Copy()',
    #    'Select(0u2209)',
    #    'Paste()',
    #    'Select(0u338)',
    #    'Copy()',
    #    'Select(0u2209)',
    #    'PasteWithOffset(-63,0)',
    #    'PasteWithOffset(831,0)',
    #    'RemoveOverlap()',
    #  ],

    #  'noteq' : [
    #    'Select(0u3D)',
    #    'Copy()',
    #    'Select(0u2260)',
    #    'Paste()',
    #    'Select(0u338)',
    #    'Copy()',
    #    'Select(0u2260)',
    #    'PasteWithOffset(0,0)',
    #    'PasteWithOffset(894,0)',
    #    'RemoveOverlap()',
    #  ],

    'longleftarrow': [
        'Select(0u2190)',
        'Copy()',
        'Select(0u27F5)',
        'Paste()',
        'Select(0u2212)',
        'Copy()',
        'Select(0u27F5)',
        'PasteWithOffset(944,0)',
        'SetRBearing(655,1)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'Longleftarrow': [
        'Select(0u21D0)',
        'Copy()',
        'Select(0u27F8)',
        'Paste()',
        'Select(0u3D)',
        'Copy()',
        'Select(0u27F8)',
        'PasteWithOffset(975,0)',
        'SetRBearing(718,1)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'longrightarrow': [
        'Select(0u2212)',
        'Copy()',
        'Select(0u27F6)',
        'Paste()',
        'Select(0u2192)',
        'Copy()',
        'Select(0u27F6)',
        'PasteWithOffset(688,0)',
        'SetRBearing(939,1)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'Longrightarrow': [
        'Select(0u3D)',
        'Copy()',
        'Select(0u27F9)',
        'Paste()',
        'Select(0u21D2)',
        'Copy()',
        'Select(0u27F9)',
        'PasteWithOffset(720,0)',
        'SetRBearing(976,1)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'leftrightarrow': [
        'Select(0u2190)',
        'Copy()',
        'Select(0u27F7)',
        'Paste()',
        'Select(0u2192)',
        'Copy()',
        'Select(0u27F7)',
        'PasteWithOffset(976,0)',
        'SetRBearing(976,1)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'Leftrightarrow': [
        'Select(0u21D0)',
        'Copy()',
        'Select(0u27FA)',
        'Paste()',
        'Select(0u21D2)',
        'Copy()',
        'Select(0u27FA)',
        'PasteWithOffset(976,0)',
        'SetRBearing(976,1)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'mapsto': [
        'Select(0u2192)',
        'Copy()',
        'Select(0u21A6)',
        'Paste()',
        'Generate("otf/Main-Bold.otf")',
        'Open("pfa/cmbsy10.pfa")',
        'Select(0x37)',
        'Copy()',
        'Open("otf/Main-Bold.otf")',
        'Select(0u21A6)',
        'PasteWithOffset(0,0)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'xlongmapsto': [
        'Select(0u27F6)',
        'Copy()',
        'Select(0u27FC)',
        'Paste()',
        'Generate("otf/Main-Bold.otf")',
        'Open("pfa/cmbsy10.pfa")',
        'Select(0x37)',
        'Copy()',
        'Open("otf/Main-Bold.otf")',
        'Select(0u27FC)',
        'PasteWithOffset(0,0)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'hookleftarrow': [
        'Select(0u2190)',
        'Copy()',
        'Select(0u21A9)',
        'Paste()',
        'Generate("otf/Main-Bold.otf")',
        'Open("pfa/cmmib10.pfa")',
        'Select(0x2D)',
        'Copy()',
        'Open("otf/Main-Bold.otf")',
        'Select(0u21A9)',
        'PasteWithOffset(965,0)',
        'SetRBearing(132,1)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'hookrightarrow': [
        'Generate("otf/Main-Bold.otf")',
        'Open("pfa/cmmib10.pfa")',
        'Select(0x2C)',
        'Copy()',
        'Open("otf/Main-Bold.otf")',
        'Select(0u21AA)',
        'Paste()',
        'Select(0u2192)',
        'Copy()',
        'Select(0u21AA)',
        'PasteWithOffset(132,0)',
        'SetRBearing(963,1)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'rightleftharpoons': [
        'Select(0u21BD)',
        'Copy()',
        'Select(0u21CC)',
        'Paste()',
        'Select(0u21C0)',
        'Copy()',
        'Select(0u21CC)',
        'PasteWithOffset(0,200)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'hbar': [
        'Select(0u2C9)',
        'Copy()',
        'Select(0u210F)',
        'PasteWithOffset(0,0)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'angle': [
        'Select(0u2220)',
        'Copy()',
        'PasteWithOffset(0,10)',
        'PasteWithOffset(0,20)',
        'RemoveOverlap()',
        'Simplify()',
        'PasteWithOffset(10,0)',
        'RemoveOverlap()',
        'Simplify()',
    ],

    'diacriticals': [
        'Select(0uB0)',
        'SetRBearing(-147,1)',   # \degree
        'Select(0u20D7)',
        'SetRBearing(154,1)',    # \vec
    ],
}

extra['Main-Italic'] = {
    'diacriticals': [
        'Select(0uB0)',
        'SetRBearing(-160,1)',   # \degree
    ],
}

extra['Size1'] = {
    'iint': [
        'Select(0u222B)',
        'Copy()',
        'Select(0u222C)',
        'Paste()',
        'PasteWithOffset(347,0)',
        'SetRBearing(347,1)',
    ],

    'iiint': [
        'Select(0u222B)',
        'Copy()',
        'Select(0u222D)',
        'Paste()',
        'PasteWithOffset(347,0)',
        'PasteWithOffset(694,0)',
        'SetRBearing(694,1)',
    ],
}

extra['Size2'] = {
    'iint': [
        'Select(0u222B)',
        'Copy()',
        'Select(0u222C)',
        'Paste()',
        'PasteWithOffset(528,0)',
        'SetRBearing(528,1)',
    ],

    'iiint': [
        'Select(0u222B)',
        'Copy()',
        'Select(0u222D)',
        'Paste()',
        'PasteWithOffset(528,0)',
        'PasteWithOffset(1036,0)',
        'SetRBearing(1036,1)',
    ],
}

extra['Size4'] = {
    'braceext': [
        'Open("lib/Extra.otf")',
        'Select(0u5F)',
        'Copy()',
        'Open("otf/Size4-Regular.otf")',
        'Select(0uE154)',
        'Paste()',
    ],
}

extra['AMS'] = {
    'dashleftarrow': [
        'Select(0u2190)',
        'Copy()',
        'Select(0u21E0)',
        'Paste()',
        'Select(0u2212)',
        'Copy()',
        'Select(0u21E0)',
        'PasteWithOffset(417,0)',
        'PasteWithOffset(834,0)',
        'SetRBearing(834,1)',
    ],

    'dashrightarrow': [
        'Select(0u2212)',
        'Copy()',
        'Select(0u21E2)',
        'Paste()',
        'PasteWithOffset(417,0)',
        'Select(0u2192)',
        'Copy()',
        'Select(0u21E2)',
        'PasteWithOffset(834,0)',
        'SetRBearing(834,1)',
    ],
}

extra['Typewriter'] = {
    'space': [
        'Select(0u20)',
        'Clear()',
        'SetRBearing(525)',
    ],

    'spaceNB': [
        'Select(0uA0)',
        'Clear()',
        'SetRBearing(525)',
    ],
}

extra['SansSerif-Regular'] = {
    'diacriticals': [
        'Select(0uB0)',
        'SetRBearing(-142,1)',   # \degree
    ],
}

extra['SansSerif-Italic'] = {
    'diacriticals': [
        'Select(0uB0)',
        'SetRBearing(-113,1)',   # \degree
    ],
}

extra['SansSerif-Bold'] = {
    'diacriticals': [
        'Select(0uB0)',
        'SetRBearing(-58,1)',   # \degree
    ],
}
