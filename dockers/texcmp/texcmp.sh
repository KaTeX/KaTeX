#!/bin/bash

set -x
imgname=katex/texcmp
tag=1.1
imgid=$(docker images | awk "/${imgname//\//\\/} *${tag//./\\.}/{print \$3}")
cd "$(dirname "$0")" || exit $?
npm install || exit $?
if [[ -z ${imgid} ]]; then
    docker build -t "${imgname}:${tag}" . || exit $?
fi
base=$(cd ../..; pwd)
docker run --rm \
       -v "${base}":/KaTeX \
       -w /KaTeX/dockers/texcmp \
       "${imgname}:${tag}" \
       nodejs texcmp.js "$@"
