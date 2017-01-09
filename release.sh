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
BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ -z "$NEXT_VERSION" ]; then
    echo "About to release $VERSION from $BRANCH. "
else
    echo "About to release $VERSION from $BRANCH and bump to $NEXT_VERSION-pre."
fi

read -r -p "Look good? [y/n] " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    exit 1
fi

# Make a new detached HEAD
git checkout "$BRANCH"
git pull
git checkout --detach

# Build generated files and add them to the repository (for bower)
git clean -fdx build dist
make setup dist
sed -i.bak -E '/^\/dist\/$/d' .gitignore
rm -f .gitignore.bak
git add .gitignore dist/

# Edit package.json and bower.json to the right version (see
# http://stackoverflow.com/a/22084103 for why we need the .bak file to make
# this mac & linux compatible)
sed -i.bak -E 's|"version": "[^"]+",|"version": "'$VERSION'",|' package.json
rm -f package.json.bak

# Make the commit and tag, and push them.
git add package.json bower.json
git commit -n -m "v$VERSION"
git tag "v$VERSION"
git push origin "v$VERSION"

# Update npm (bower and cdnjs update automatically)
npm publish

if [ ! -z "$NEXT_VERSION" ]; then
    # Go back to master to bump
    git checkout "$BRANCH"

    # Edit package.json and bower.json to the right version
    sed -i.bak -E 's|"version": "[^"]+",|"version": "'$NEXT_VERSION'-pre",|' package.json
    rm -f package.json.bak

    git add package.json bower.json
    git commit -n -m "Bump master to v$NEXT_VERSION-pre"
    git push origin "$BRANCH"

    # Go back to the tag which has build/katex.tar.gz and build/katex.zip
    git checkout "v$VERSION"
fi

echo "The automatic parts are done!"
echo "Now all that's left is to create the release on github."
echo "Visit https://github.com/Khan/KaTeX/releases/new?tag=v$VERSION to edit the release notes"
echo "Don't forget to upload build/katex.tar.gz and build/katex.zip to the release!"
