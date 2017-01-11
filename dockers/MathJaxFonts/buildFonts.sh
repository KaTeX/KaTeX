#!/usr/bin/env bash

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

filetypes=( ttf eot woff woff2 )

set -e
cd "$(dirname "$0")"

# build image if missing
IMAGE=mathjaxfonts
if [[ $(docker images "$IMAGE" | wc -l) -lt 2 ]]; then
    echo "Need to build docker image"
    docker build .
fi

cleanup() {
    [[ "${CONTAINER}" ]] \
        && docker stop "${CONTAINER}" >/dev/null \
        && docker rm "${CONTAINER}" >/dev/null
    CONTAINER=
}
CONTAINER=
trap cleanup EXIT

URL=${1:-https://github.com/khan/MathJax-dev.git}

CMDS="set -ex
git clone ${URL} MathJax-dev
cd MathJax-dev
cp default.cfg custom.cfg
make custom.cfg.pl
make -C fonts/OTF/TeX ${filetypes[*]}
tar cf ../fonts.tar ${filetypes[*]/#/fonts/OTF/TeX/}"

CONTAINER=$(docker create "$IMAGE" /bin/sh -c "${CMDS}")
docker start --attach $CONTAINER
docker cp $CONTAINER:/fonts.tar .
cleanup

tar xf fonts.tar
for filetype in "${filetypes[@]}"; do
    for font in "${used_fonts[@]}"; do
        mv fonts/OTF/TeX/"$filetype"/"$font".* ../../static/fonts/
    done
done
rm -rf fonts fonts.tar
