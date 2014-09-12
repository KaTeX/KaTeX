#!/usr/bin/env python

import fontforge
import sys
import json

metrics_to_extract = {
    "Main-Regular": [
        u"\u2260",
        u"\u2245",
        u"\u0020",
        u"\u00a0",
        u"\u2026",
        u"\u22ef",
        u"\u22f1",
        u"\u22ee",
    ]
}


def main():
    start_json = json.load(sys.stdin)

    for font, chars in metrics_to_extract.iteritems():
        fontInfo = fontforge.open("../static/fonts/KaTeX_" + font + ".ttf")

        for glyph in fontInfo.glyphs():
            try:
                char = unichr(glyph.unicode)
            except ValueError:
                continue

            if char in chars:
                _, depth, _, height = glyph.boundingBox()

                depth = -depth

                # TODO(emily): Figure out a real way to calculate this
                italic = 0

                start_json[font][ord(char)] = {
                    height: height / fontInfo.em,
                    depth: depth / fontInfo.em,
                    italic: italic / fontInfo.em,
                }

    sys.stdout.write(
        json.dumps(start_json, separators=(',', ':'), sort_keys=True))

if __name__ == "__main__":
    main()
