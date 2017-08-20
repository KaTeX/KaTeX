#!/usr/bin/env bash
shopt -s extglob

usage() {
    while [[ $# -gt 1 ]]; do
        echo "$1" >&2
        shift
    done
    echo "Usage: ${0##*/} [OPTIONS] [SOURCE]"
    echo ""
    echo "SOURCE may be"
    echo "  - a URL for a tarball, or"
    echo "  - a local tarball file, or"
    echo "  - a local directory"
    echo "with a layout compatible to MathJax-dev."
    echo "It defaults to ${URL}"
    echo ""
    echo "OPTIONS:"
    echo "  -h|--help         display this help"
    echo "  --image NAME:TAG  use the named docker image [$IMAGE]"
    exit $1
}

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

cleanup() {
    [[ "${CONTAINER}" ]] \
        && docker stop "${CONTAINER}" >/dev/null \
        && docker rm "${CONTAINER}" >/dev/null
    CONTAINER=
    [[ -f "${TMPFILE}" ]] && rm "${TMPFILE}"
    TMPFILE=
}
CONTAINER=
trap cleanup EXIT

IMAGE="katex/fonts:DF-$(openssl sha1 Dockerfile | tail -c 9)"
URL=https://github.com/Khan/MathJax-dev/archive/master.tar.gz
TMPFILE=
FILE=
NARGS=0
while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            usage 0
            ;;
        --image=*)
            IMAGE="${1#*=}"
            ;;
        --image)
            shift
            IMAGE="$1"
            ;;
        -*)
            usage "Invalid option: $1" "" 1
            ;;
        *)
            case $NARGS in
                0)
                    if [[ -d "$1" ]]; then
                        TMPFILE="$(mktemp "${TMPDIR:-/tmp}/mjf.XXXXXXXX")"
                        FILE="$TMPFILE"
                        pushd "$1"
                        if [[ ! -f fonts/OTF/TeX/Makefile ]]; then
                            echo "$1 does not look like MathJax-dev" >&2
                            exit 1
                        fi
                        tar cf "$FILE" Makefile default.cfg fonts/OTF/TeX
                        popd
                    elif [[ -f "$1" ]]; then
                        FILE="$1"
                    elif [[ "$1" = http?(s)://* ]]; then
                        URL="$1"
                    else
                        echo "'$1' is not a valid source" >&2
                        exit 1
                    fi
                    NARGS=1
                    ;;
                *)
                    usage "Too many arguments: $1" "" 1
                    ;;
            esac
            ;;
    esac
    shift
done

# build image if missing
if [[ $(docker images "$IMAGE" | wc -l) -lt 2 ]]; then
    echo "Need to build docker image $IMAGE"
    docker build --tag "$IMAGE" .
fi

CMDS="set -ex
test -f MathJax-dev.tar.gz || wget -O MathJax-dev.tar.gz '${URL}'
mk=\$(tar tf MathJax-dev.tar.gz | grep 'fonts/OTF/TeX/Makefile\$')
tar xf MathJax-dev.tar.gz
cd \"\${mk%fonts/*}\"
cp default.cfg custom.cfg
make custom.cfg.pl
make -C fonts/OTF/TeX ${filetypes[*]}
tar cf /fonts.tar ${filetypes[*]/#/fonts/OTF/TeX/}"

echo "Creating and starting docker container from image $IMAGE"
CONTAINER=$(docker create "$IMAGE" /bin/sh -c "${CMDS}")
if [[ ${FILE} ]]; then
    docker cp "${FILE}" $CONTAINER:/MathJax-dev.tar.gz
fi
docker start --attach $CONTAINER
docker cp $CONTAINER:/fonts.tar .
cleanup
echo "Docker executed successfully, will now unpack the fonts"

tar xf fonts.tar
for filetype in "${filetypes[@]}"; do
    for font in "${used_fonts[@]}"; do
        echo "$filetype/$font"
        mv "fonts/OTF/TeX/$filetype/$font".* ../../static/fonts/
    done
done
rm -rf fonts fonts.tar
