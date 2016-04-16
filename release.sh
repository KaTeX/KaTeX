#!/usr/bin/env bash

set -e -o pipefail

if [ $# -lt 1 ]; then
    echo "Usage:"
    echo "./release.sh <VERSION_TO_RELEASE> [NEXT_VERSION]"
    echo ""
    echo "Examples:"
    echo " When releasing a new point release:"
    echo "   ./release.sh 0.6.3"
    echo " When releasing a new major version:"
    echo "   ./release.sh 0.7.0 0.8.0"
    exit
fi

VERSION=$1
NEXT_VERSION=$2

if [ -z "$NEXT_VERSION" ]; then
    PROMPT="About to release $VERSION. Look good? [y/n] "
else
    PROMPT="About to release $VERSION and bump master to $NEXT_VERSION-pre. Look good? [y/n] "
fi

read -r -p "$PROMPT" CONFIRM
if [ "$CONFIRM" != "y" ]; then
    exit
fi

# Make a new detached HEAD
git checkout master
git pull
git checkout --detach
make setup dist
git add dist/

# Edit package.json and bower.json to the right version
sed -i "" -E 's|"version": "[^"]+",|"version": "'$VERSION'",|' package.json
sed -i "" -E 's|"version": "[^"]+",|"version": "'$VERSION'",|' bower.json

# Make the commit and tag, and push them.
git add package.json bower.json
git commit -n -m "v$VERSION"
git tag "v$VERSION"
git push origin "v$VERSION"

# Update npm (bower and cdnjs update automatically)
npm publish

if [ ! -z "$NEXT_VERSION" ]; then
    # Go back to master to bump
    git checkout master

    # Edit package.json and bower.json to the right version
    sed -i "" -E 's|"version": "[^"]+",|"version": "'$NEXT_VERSION'-pre",|' package.json
    sed -i "" -E 's|"version": "[^"]+",|"version": "'$NEXT_VERSION'-pre",|' bower.json

    git add package.json bower.json
    git commit -n -m "Bump master to v$NEXT_VERSION-pre"
    git push origin master

    # Go back to the tag which has build/katex.tar.gz and build/katex.zip
    git checkout "v$VERSION"
fi

echo "The automatic parts are done!"
echo "Now all that's left is to create the release on github."
echo "Visit https://github.com/Khan/KaTeX/releases/tag/$VERSION to edit the release notes"
echo "Don't forget to upload build/katex.tar.gz and build/katex.zip to the release!"
