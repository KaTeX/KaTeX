#!/usr/bin/env python

import fontforge
import sys
import json

# map of characters to extract
metrics_to_extract = {
    # Font name
    "Main-Regular": {
        # Skew and italic metrics can't be easily parsed from the TTF. Instead,
        # we map each character to a "base character", which is a character
        # from the same font with correct italic and skew metrics. A character
        # maps to None if it doesn't have a base.

        u"\u2260": None,  # \neq
        u"\u2245": None,  # \cong
        u"\u0020": None,  # space
        u"\u00a0": None,  # nbsp
        u"\u2026": None,  # \ldots
        u"\u22ef": None,  # \cdots
        u"\u22f1": None,  # \ddots
        u"\u22ee": None,  # \vdots
    },
    "Size1-Regular": {
        u"\u222c": u"\u222b",  # \iint, based on \int
        u"\u222d": u"\u222b",  # \iiint, based on \int
    },
    "Size2-Regular": {
        u"\u222c": u"\u222b",  # \iint, based on \int
        u"\u222d": u"\u222b",  # \iiint, based on \int
    },
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

                base_char = chars[char]
                if base_char:
                    base_char_str = str(ord(base_char))
                    base_metrics = start_json[font][base_char_str]

                    italic = base_metrics["italic"]
                    skew = base_metrics["skew"]
                else:
                    italic = 0
                    skew = 0

                start_json[font][ord(char)] = {
                    "height": height / fontInfo.em,
                    "depth": depth / fontInfo.em,
                    "italic": italic,
                    "skew": skew,
                }

    sys.stdout.write(
        json.dumps(start_json, separators=(',', ':'), sort_keys=True))

if __name__ == "__main__":
    main()
