#!/usr/bin/env python2

import sys

with open("../fontMetrics.js", "r") as metrics:
    old_lines = file.readlines(metrics)

replace = sys.stdin.read()

with open("../fontMetrics.js", "w") as output:
    for line in old_lines:
        if line.startswith("var metricMap"):
            output.write("var metricMap = ")
            output.write(replace)
            output.write(";\n")
        else:
            output.write(line)
