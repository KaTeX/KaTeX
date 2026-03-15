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
for browserTag in "firefox:128.0-20260222" "chromium:145.0-20260222"; do
    browser=${browserTag%:*}
    #this is done so because old images were for chrome and selenium-webdriver expects "chrome" as browser name
    if [ "${browser}" = "chromium" ]; then
        browser="chrome"
    fi
    image=selenium/standalone-${browserTag}
    echo "Starting container for ${image}"
    #https://github.com/SeleniumHQ/docker-selenium#--shm-size2g
    container=$(docker run -d --shm-size=2g -P ${image})
    [[ ${container} ]] || continue
    echo "Container ${container:0:12} started"

    seleniumPort=$(docker port "${container}" 4444 | head -1 | sed 's/.*://')

    # host.docker.internal for emulators, bridge gateway for native docker
    if docker exec "${container}" getent hosts host.docker.internal >/dev/null 2>&1; then
        katexIP="host.docker.internal"
    else
        katexIP=$(docker inspect -f '{{.NetworkSettings.Networks.bridge.Gateway}}' "${container}")
    fi

    echo "Waiting for Selenium to be ready on localhost:${seleniumPort}..."
    for i in $(seq 1 120); do
        if curl -sf "http://localhost:${seleniumPort}/wd/hub/status" >/dev/null 2>&1; then
            echo "Selenium is ready (${i}s)"
            break
        fi
        if [ "$i" -eq 120 ]; then
            echo "Selenium failed to start within 120s, failing ${browser}"
            status=1
            cleanup
            continue 2
        fi
        sleep 1
    done

    echo "Creating screenshots for ${browser}..."
    yarn node "$(dirname "$0")"/screenshotter.js \
            --browser="${browser}" --container="${container}" \
            --selenium-url "http://localhost:${seleniumPort}/wd/hub" \
            --katex-ip "${katexIP}" \
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

if [[ $BROWSERSTACK_USER ]]; then
    echo "Creating screenshots for Safari..."
    yarn node "$(dirname "$0")"/screenshotter.js \
            --browser=safari --browserstack --selenium-capabilities '{
                "browserName": "Safari",
                "browser_version": "13.1",
                "os": "OS X",
                "os_version": "Catalina"
            }' "$@"
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
    echo "${res} for safari"
fi

exit ${status}
