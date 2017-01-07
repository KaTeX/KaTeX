#!/bin/bash

# This script does a one-shot creation of screenshots, creating needed
# docker containers and removing them afterwards.  During development,
# it might be desirable to avoid the overhead for starting and
# stopping the containers.  Developers are encouraged to manage
# suitable containers themselves, calling the screenshotter.js script
# directly.

cleanup() {
    [[ "${container}" ]] \
        && docker stop "${container}" >/dev/null \
        && docker rm "${container}" >/dev/null
    container=
}

SS_DIR=$(dirname "$0")
TOP_DIR=${SS_DIR}/../..
FONTS_DIR=${TOP_DIR}/test/screenshotter/unicode-fonts
if [[ ! -d "${FONTS_DIR}" ]]; then
    echo "Cloning test fonts repository"
    git clone https://github.com/Khan/KaTeX-test-fonts "${FONTS_DIR}" \
        || exit 2
fi
pushd "${FONTS_DIR}" || exit 2
git checkout --detach 99fa66a2da643218754c8236b9f9151cac71ba7c || exit 2
popd || exit 2

container=
trap cleanup EXIT
status=0
for browserTag in firefox:2.48.2 chrome:2.48.2; do
    browser=${browserTag%:*}
    image=selenium/standalone-${browserTag}
    echo "Starting container for ${image}"
    container=$(docker run -d -P ${image})
    [[ ${container} ]] || continue
    echo "Container ${container:0:12} started, creating screenshots..."
    if node "$(dirname "$0")"/screenshotter.js \
            --browser="${browser}" --container="${container}" "$@"; then
        res=Done
    else
        res=Failed
        status=1
    fi
    echo "${res} taking screenshots, stopping and removing ${container:0:12}"
    cleanup
done
exit ${status}
