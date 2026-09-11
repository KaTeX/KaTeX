#! /usr/bin/env python3

import mapping
import json
import sys

m = mapping.mapping

reverse = {}

for tex_font, fonts in m.items():
    for f in fonts:
        s = f.split('-')
        if len(s) == 1:
            style = 'Regular'
        else:
            style = s[-1]

        family = s[0]

        font_name = family + '-' + style

        if font_name not in reverse:
            reverse[font_name] = {}

        reverse[font_name][tex_font] = m[tex_font][f]


output = {}


def add_to_output(font_name, tex_font, fr, to):
    if type(to) is tuple:
        to, shift_x, shift_y = to
    else:
        shift_x = 0
        shift_y = 0

    data = {}
    data['font'] = tex_font
    data['char'] = fr
    data['xshift'] = shift_x
    data['yshift'] = shift_y

    if font_name not in output:
        output[font_name] = {}

    if to in output[font_name]:
        # TODO: add duplicate mapping handling
        pass

    output[font_name][to] = data


for font_name, tex_fonts in reverse.items():
    for tex_font, maps in tex_fonts.items():
        for k, v in maps.items():
            if type(v) is not list:
                values = [v]
            else:
                values = v

            for v in values:
                if type(k) is tuple:
                    start, end = k

                    for fr in range(start, end + 1):
                        to = v + (fr - start)
                        add_to_output(font_name, tex_font, fr, to)
                else:
                    add_to_output(font_name, tex_font, k, v)

# Cleanup temp glyphs
del output['Main-Regular'][0x23A9]
del output['Main-Regular'][0x23AD]

sys.stdout.write(json.dumps(output))
