#!/usr/bin/env bash

set -e

if [ -z "$1" ]; then
    echo "Usage: $(basename $0) <docker name>"
    echo "  If you followed the README, the docker name would be 'mjf'"
    exit 1
else
    DOCKER_NAME="$1"
fi

mkdir fonts

used_fonts=(
    KaTeX_AMS-Regular
    KaTeX_Caligraphic-Bold
    KaTeX_Caligraphic-Regular
    KaTeX_Fraktur-Bold
    KaTeX_Fraktur-Regular
    KaTeX_Main-Bold
    KaTeX_Main-Italic
    KaTeX_Main-Regular
    KaTeX_Math-BoldItalic
    KaTeX_Math-Italic
    KaTeX_Math-Regular
    KaTeX_SansSerif-Bold
    KaTeX_SansSerif-Italic
    KaTeX_SansSerif-Regular
    KaTeX_Script-Regular
    KaTeX_Size1-Regular
    KaTeX_Size2-Regular
    KaTeX_Size3-Regular
    KaTeX_Size4-Regular
    KaTeX_Typewriter-Regular
)

for filetype in ttf eot woff woff2; do
    echo "Copying $filetype"
    docker cp "$DOCKER_NAME":/MathJax-dev/fonts/OTF/TeX/"$filetype" fonts

    for font in ${used_fonts[*]}; do
        mv fonts/"$filetype"/"$font"* fonts/
    done

    rm -rf fonts/"$filetype"
done
