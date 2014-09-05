#!/usr/bin/env python

import collections
import json
import parse_tfm
import subprocess
import sys


def find_font_path(font_name):
    try:
        font_path = subprocess.check_output(['kpsewhich', font_name])
    except OSError:
        raise RuntimeError("Couldn't find kpsewhich program, make sure you" +
                           " have TeX installed")
    except subprocess.CalledProcessError:
        raise RuntimeError("Couldn't find font metrics: '%s'" % font_name)
    return font_path.strip()


def main():
    mapping = json.load(sys.stdin)

    fonts = [
        'cmbsy10.tfm',
        'cmbx10.tfm',
        'cmex10.tfm',
        'cmmi10.tfm',
        'cmmib10.tfm',
        'cmr10.tfm',
        'cmsy10.tfm',
        'cmti10.tfm',
        'msam10.tfm',
        'msbm10.tfm'
    ]

    font_name_to_tfm = {}

    for font_name in fonts:
        font_basename = font_name.split('.')[0]
        font_path = find_font_path(font_name)
        font_name_to_tfm[font_basename] = parse_tfm.read_tfm_file(font_path)

    families = collections.defaultdict(dict)

    for family, chars in mapping.iteritems():
        for char, char_data in chars.iteritems():
            char_num = int(char)

            font = char_data['font']
            tex_char_num = int(char_data['char'])
            yshift = float(char_data['yshift'])

            tfm_char = font_name_to_tfm[font].get_char_metrics(tex_char_num)

            height = round(tfm_char.height + yshift / 1000.0, 5)
            depth = round(tfm_char.depth - yshift / 1000.0, 5)
            italic = round(tfm_char.italic_correction, 5)

            families[family][char_num] = {
                'height': height,
                'depth': depth,
                'italic': italic
            }

    sys.stdout.write(
        json.dumps(families, separators=(',', ':'), sort_keys=True))

if __name__ == '__main__':
    main()
