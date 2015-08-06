#!/usr/bin/env python

import sys
import json

data = json.load(sys.stdin)
sep = "module.exports = {\n"
for font in sorted(data):
  sys.stdout.write(sep + json.dumps(font))
  sep = ": {\n  "
  for glyph in sorted(data[font], key=int):
      sys.stdout.write(sep + json.dumps(glyph) + ": ")
      sys.stdout.write(json.dumps(data[font][glyph], sort_keys=True))
      sep = ",\n  "
  sep = "\n},\n"
sys.stdout.write("\n}};\n");
