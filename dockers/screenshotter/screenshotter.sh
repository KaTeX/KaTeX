#!/bin/bash

# This script does a one-shot creation of screenshots, creating needed
# docker containers and removing them afterwards.

cleanup() {
    [[ "${container}" ]] \
        && docker stop "${container}" >/dev/null \
        && docker rm "${container}" >/dev/null
    container=
}

container=
trap cleanup EXIT
status=0
for browserTag in "firefox:128.0-20260222" "chromium:145.0-20260222" "webkit:2.0"; do
    browser=${browserTag%:*}
    # We use Chromium so it works on all architectures.
    # We hack the name because old images were for chrome
    # and selenium-webdriver expects "chrome" as browser name
    if [ "${browser}" = "chromium" ]; then
        browser="chrome"
    fi

    #https://github.com/SeleniumHQ/docker-selenium#--shm-size2g
    if [ "${browser}" = "webkit" ]; then
        image=ghcr.io/katex/katex-webkit:${browserTag#*:}
        browser="safari"
        echo "Starting container for ${image}"
        container=$(docker run -d --shm-size=2g -P ${image})
        [[ ${container} ]] || continue
        echo "Container ${container:0:12} started"
        port=$(docker port "${container}" 4444 | head -1 | sed 's/.*://')
        extra_args="--selenium-url http://localhost:${port} --wait 0.5 --threshold 0.001"
    else
        image=selenium/standalone-${browserTag}
        echo "Starting container for ${image}"
        container=$(docker run -d --shm-size=2g -P ${image})
        [[ ${container} ]] || continue
        echo "Container ${container:0:12} started"
        sleep 5
        extra_args="--container=${container}"
    fi

    echo "Creating screenshots for ${browser}..."
    node "$(dirname "$0")"/screenshotter.js \
            --browser="${browser}" \
            ${extra_args} \
            "$@"
    rc=$?
    if [ $rc -eq 0 ]; then
        res="Done"
    elif [ $rc -eq 3 ]; then
        res="Screenshots mismatched"
        status=1
    else
        res="Failed (exit code $rc)"
        status=1
    fi
    echo "${res} for ${browser}, stopping and removing ${container:0:12}"
    cleanup
done

exit ${status}
