#!/bin/bash

set -x
imgname=katex/texcmp
tag=1.2
imgid=$(docker images | awk "/${imgname//\//\\/} *${tag//./\\.}/{print \$3}")
cd "$(dirname "$0")" || exit $?
if [[ -z ${imgid} ]]; then
    docker build -t "${imgname}:${tag}" . || exit $?
fi

cd ../..
mkdir -p test/screenshotter/{tex,diff}

cleanup() {
    [[ "${container}" ]] && false \
        && docker stop "${container}" >/dev/null \
        && docker rm "${container}" >/dev/null
    container=
}
container=$(docker create -t -u 0:0 \
    -w /KaTeX/dockers/texcmp \
    "${imgname}:${tag}" \
    bash -c "npm install \
&& ( cd ../../test/screenshotter && npm i js-yaml; ) \
&& nodejs texcmp.js $*")
trap cleanup EXIT
tar c dockers/texcmp/{texcmp.js,package.json} \
    test/screenshotter/{ss_data.{js,yaml},images/*-firefox.png,test.tex} \
    | docker cp - "${container}:/KaTeX"
docker start -a "${container}"
docker cp "${container}:/KaTeX/test/screenshotter/tex" - \
    | ( cd test/screenshotter/tex; tar xov; ) || exit $?
docker cp "${container}:/KaTeX/test/screenshotter/diff" - \
    | ( cd test/screenshotter/diff; tar xov; ) || exit $?
cleanup
