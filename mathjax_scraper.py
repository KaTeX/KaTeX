import pprint
import re
import requests as r
import string

url = 'http://docs.mathjax.org/en/latest/tex.html'
res = r.get(url)
res_text = res.text

start_index = re.search('<h[0-9]>Symbols', res_text).start()
end_index = re.search('<h[0-9]>Environments', res_text).start()

all_matches = re.findall("\\\\.</span>|\\\\[A-z]*</span>",
                         res_text[start_index:end_index])

# remove span
for i, m in enumerate(all_matches):
    all_matches[i] = m[:-len('</span>')]

# add basic symbols
basic_symbols = [u'#', u'%', u'&', u'^', u'_', u'{', u'}', u'~', u"'"]
all_matches = basic_symbols + all_matches

# put into dictionary
alpha_dict = dict(zip(list(string.ascii_lowercase), [[] for i in range(26)]))
basic_label = 'basic'
alpha_dict[basic_label] = []

for m in all_matches:
    key = re.findall('[^\\\\]+', m)
    if key != []:
        if key[0][0].lower() in alpha_dict.keys():
            alpha_dict[key[0][0].lower()].append(m)
        else:
            if key == [u'|']:
                # | -> ASCII for clean markdown
                key = [u'&#124;']
            alpha_dict[basic_label].append(m)

PATH = 'README.md'
with open(PATH, 'r') as f:
    readme_text = f.read()

# delete existant table
mathjax_section_start = '[comment]: <> (Start of MathJax Section)'
mathjax_section_end = '[comment]: <> (End of MathJax Section)'

readme_text.find(mathjax_section_start)
readme_text.find(mathjax_section_end)

old_text = readme_text[
    readme_text.find(mathjax_section_start) +
    len(mathjax_section_start):readme_text.find(mathjax_section_end)
]

# construct md table
table = ''
main_header = '''\n|MathJax Symbols| KaTeX Support|\n|---|---|\n'''
table += main_header

for key in list(string.ascii_lowercase) + [basic_label]:
    section = ''
    section_header = '| **{}** | |\n'.format(key.upper())
    section += section_header
    for name in alpha_dict[key]:
        section += '| {} | {} |\n'.format(name, '')
    table += section

# double pipes for end of table
table = table[:-1] + '|\n'

# inject table in README.md
readme_updated = readme_text.replace(old_text, table)

# overwrite file
with open(PATH, 'w') as f:
    f.write(readme_updated)
