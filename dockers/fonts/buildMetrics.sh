#!/bin/sh
# Generates fontMetricsData.js
PERL="perl"
PYTHON=`python2 --version >/dev/null 2>&1 && echo python2 || echo python`

cd src/metrics
$PERL ./mapping.pl | $PYTHON ./extract_tfms.py | $PYTHON ./extract_ttfs.py | $PYTHON ./format_json.py --width > ../fontMetricsData.js
