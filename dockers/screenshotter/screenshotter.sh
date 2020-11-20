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

container=
trap cleanup EXIT
status=0
for browserTag in "firefox:3.141.59-20201119" "chrome:3.141.59-20201119"; do
    browser=${browserTag%:*}
    image=selenium/standalone-${browserTag}
    echo "Starting container for ${image}"
    container=$(docker run -d -P ${image})
    [[ ${container} ]] || continue
    echo "Container ${container:0:12} started, creating screenshots..."
    if yarn node "$(dirname "$0")"/screenshotter.js \
            --browser="${browser}" --container="${container}" "$@"; then
        res=Done
    else
        res=Failed
        status=1
    fi
    echo "${res} taking screenshots, stopping and removing ${container:0:12}"
    cleanup
done

if [[ $BROWSERSTACK_USER ]]; then
    echo "Creating screenshots for Safari..."
    if yarn node "$(dirname "$0")"/screenshotter.js \
            --browser=safari --browserstack --selenium-capabilities '{
                "browserName": "Safari",
                "browser_version": "13.1",
                "os": "OS X",
                "os_version": "Catalina"
            }' "$@"; then
        res=Done
    else
        res=Failed
        status=1
    fi
    echo "${res} taking screenshots"
fi

exit ${status}
