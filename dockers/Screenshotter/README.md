# How to generate screenshotter images

## Automatic generation of screen shots

Now you too can generate screenshots from your own computer, and (hopefully)
have them look mostly the same as the current ones! Make sure you have docker
installed and running.
If all you want is (re)create
all the snapshots for all the browsers, then you can do so by running the
`screenshotter.sh` script:

    dockers/Screenshotter/screenshotter.sh

It will fetch all required selenium docker images, and use them to
take screenshots.

## Manual generation

If you are creating screenshots on a regular basis, you can keep the
docker containers with the selenium setups running.  Essentially you
are encouraged to reproduce the steps from `screenshotter.sh`
manually.  Example run for Firefox:

    container=$(docker run -d -P selenium/standalone-firefox:2.46.0)
    node dockers/Screenshotter/screenshotter.js -b firefox -c ${container}
    # possibly repeat the above command as often as you need, then eventually
    docker stop ${container}
    docker rm ${container}

For Chrome, simply replace both occurrences of `firefox` with `chrome`.

## Use without docker

It is possible to run `screenshotter.js` without the use of Docker:

    npm install selenium-webdriver
    node dockers/Screenshotter/screenshotter.js

This will generate screenshots using the Firefox installed on your system.
Browsers other than Firefox can be targeted using the `--browser` option.
For a complete list of options pass `--help` as an argument to
`screenshotter.js`.  Using these it should be possible to have the script
connect to almost any Selenium web driver you might have access to.

Note that screenshots taken without Docker are very likely to disagree
from the ones stored in the repository, due to different versions of
various software components being used.  The screenshots taken in this
fashion are well suited for visual inspection, but for exact binary
comparisons it would be neccessary to carefully set up the environment
to match the one used by the Docker approach.

## Choosing the list of test cases

Both `screenshotter.js` and `screenshotter.sh` will accept
an `--include` option (short `-i`) which can be used to specify
a list of test cases to be processed, as a comma separated list.
Conversely, the `--exclude` option (short `-x`) can be used
to specify a list of cases which are not being processed.

Examples:

    node dockers/Screenshotter/screenshotter.js -i Sqrt,SqrtRoot
    dockers/Screenshotter/screenshotter.sh --exclude=GreekLetters
