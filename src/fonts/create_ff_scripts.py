#! /usr/bin/env python3

import mapping
import extra

m = mapping.mapping

# This will contain the scripts for every font
scripts = {}
prefix = "KaTeX_"


def create_initial_ttx(family, style, normal):
    with open('lib/Space.ttx', 'r') as f:
        space = f.read()

        if style == 'BoldItalic':
            weight_s = 'Bold Italic'
        else:
            weight_s = style

        space = space.format(name=family, weight=style,
                             weight_s=weight_s, normal=normal)

        with open('ttx/{0}.ttx'.format(font_name), 'w') as w:
            w.write(space)


# Return the font name and the style part of the font
def font_to_font_name(font):
    s = font.split('-')

    if len(s) == 1:
        style = 'Regular'
    else:
        style = s[-1]

    family = s[0]

    return family + '-' + style, style


for tex_font in sorted(m.keys()):
    for font in sorted(m[tex_font].keys()):
        font_name, style = font_to_font_name(font)

        # The original perl script never sets this to bold...
        normal = 'Normal'

        otf = 'otf/{0}.otf'.format(font_name)

        if font not in scripts:
            family = font.split('-')[0]
            create_initial_ttx(prefix + family, style, normal)

            if style[:4] == 'Bold':
                weight = 700
            else:
                weight = 400

            if style == 'Bold':
                panose = 8
            else:
                panose = 0

            scripts[font] = [
                'Open("{0}")'.format(otf),
                'SetPanose([0,0,{0},0,0,0,0,0,0,0])'.format(panose),
                'SetOS2Value("Weight",{0})'.format(weight),
                'SetGasp(8,2,16,1,65535,3)',
                'Reencode("unicode")',
                'Generate("{0}")'.format(otf),
            ]

        if tex_font[:2] == 'eu':
            ext = 'pfb'
        else:
            ext = 'pfa'

        sc = scripts[font]

        for k, v in m[tex_font][font].items():

            # If we do not have a list, make one to simplify the code a lot
            if type(v) is not list:
                values = [v]
            else:
                values = v

            for v in values:
                open_str = 'Open("pfa/{0}.{1}")'
                sc.append(open_str.format(tex_font, ext))

                # Selector
                if type(k) is tuple:
                    fr, to = k
                    selector = '{0},{1}'.format(fr, to)
                else:
                    selector = '{0}'.format(k)

                sc.append('Select({0})'.format(selector))
                sc.append('Copy()')
                sc.append('Open("{0}")'.format(otf))

                if type(k) is tuple:
                    fr, to = k

                    if type(v) is tuple:
                        raise 4

                    sc.append('Select(0u{0:04x},0u{1:04x})'.format(
                        v, v + (to - fr)))
                    sc.append('Paste()')
                elif type(v) is tuple:
                    to, shift_x, shift_y = v

                    sc.append('Select(0u{0:04x})'.format(to))
                    sc.append('Paste()')
                    sc.append('Move({0},{1})'.format(shift_x, shift_y))
                else:
                    sc.append('Select(0u{0:04x})'.format(v))
                    sc.append('Paste()')

                sc.append('Generate("{0}")'.format(otf))


e = extra.extra


def append_extras():
    for font, extras in e.items():
        script = scripts[font]

        for key in sorted(extras.keys()):
            script.extend(extras[key])


def cleanup_temp_glyphs():
    scripts['Main-Regular'].extend([
        'Select(0u23A9)',
        'Clear()',
        'Select(0u23AD)',
        'Clear()'
    ])


def write_scripts():
    for font, script in scripts.items():
        font_name, _ = font_to_font_name(font)

        otf = 'otf/{0}.otf'.format(font_name)
        ttf = 'ttf/{0}.ttf'.format(font_name)
        ff = 'ff/{0}.ff'.format(font_name)

        extra = [
            'SelectAll()',
            'RoundToInt()',
            'Simplify()',
            'AddExtrema()',
            'Simplify()',
            'ClearHints()',
            'AutoHint()',
            'RoundToInt()',
            'Generate("{0}")'.format(otf),
            'SelectAll()',
            'AutoInstr()',
            'Generate("{0}")'.format(ttf)
        ]

        script.extend(extra)

        s = ';\n'.join(script)

        with open(ff, 'w') as f:
            f.write(s)


append_extras()
cleanup_temp_glyphs()
write_scripts()
