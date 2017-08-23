#!/usr/bin/env bash

set -e -o pipefail
shopt -s extglob

VERSION=
NEXT_VERSION=
BRANCH=$(git rev-parse --abbrev-ref HEAD)
NARGS=0
DRY_RUN=
INSANE=0

# usage [ERROR-MESSAGES...] EXIT-CODE
usage() {
    while [[ $# -gt 1 ]]; do
        echo "$1" >&2
        shift
    done
    echo "Usage:"
    echo "./release.sh [OPTIONS] <VERSION_TO_RELEASE> [NEXT_VERSION]"
    echo ""
    echo "Options:"
    echo " --dry-run|-n: only print commands, do not execute them."
    echo ""
    echo "Examples:"
    echo " When releasing a new point release:"
    echo "   ./release.sh 0.6.3 0.6.4"
    echo " When releasing a new major version:"
    echo "   ./release.sh 0.7.0 0.8.0"
    echo ""
    echo "You may omit NEXT_VERSION in order to avoid creating a commit on"
    echo "the branch from which the release was created.  Not recommended."
    exit $1
}

while [ $# -gt 0 ]; do
    case "$1" in
        --dry-run|-n|--just-print)
            DRY_RUN=true
            git() { echo "git $*"; }
            npm() { echo "npm $*"; }
            ;;
        -h|-\?|--help)
            usage 0
            ;;
        -*)
            usage "Unknown option: $1" "" 1
            ;;
        *)
            case "$NARGS" in
                0)
                    VERSION="$1"
                    NARGS=1
                    ;;
                1)
                    NEXT_VERSION="$1"
                    NARGS=2
                    ;;
                *)
                    usage "Too many arguments: $1" "" 1
                    ;;
            esac
            ;;
    esac
    shift
done

if [[ $NARGS = 0 ]]; then
    usage "Missing argument: version number" "" 1
fi

# Some sanity checks up front
if ! command git diff --stat --exit-code HEAD; then
    echo "Please make sure you have no uncommitted changes" >&2
    : $((++INSANE))
fi
if ! command npm owner ls katex | grep -q "^$(command npm whoami) <"; then
    echo "You don't seem do be logged into npm, use \`npm login\`" >&2
    : $((++INSANE))
fi
if [[ $BRANCH != @(v*|master) ]]; then
    echo "'$BRANCH' does not like a release branch to me" >&2
    : $((++INSANE))
fi

if [[ -z "$NEXT_VERSION" ]]; then
    echo "About to release $VERSION from $BRANCH. "
else
    echo "About to release $VERSION from $BRANCH and bump to $NEXT_VERSION-pre."
fi
if [[ $INSANE != 0 ]]; then
    read -r -p "$INSANE sanity check(s) failed, really proceed? [y/n] " CONFIRM
else
    read -r -p "Look good? [y/n] " CONFIRM
fi
if [[ "$CONFIRM" != "y" ]]; then
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

# Update the version number in CDN URLs included in the README files,
# and regenerate the Subresource Integrity hash for these files.
node update-sri.js "${VERSION}" README.md contrib/*/README.md dist/README.md

# Make the commit and tag, and push them.
git add package.json bower.json README.md contrib/*/README.md dist/README.md
git commit -n -m "v$VERSION"
git diff --stat --exit-code # check for uncommitted changes
git tag -a "v$VERSION" -m "v$VERSION"
git push origin "v$VERSION"

# Update npm (bower and cdnjs update automatically)
npm publish

if [ ! -z "$NEXT_VERSION" ]; then
    # Go back to original branch to bump
    git checkout "$BRANCH"

    # Edit package.json and bower.json to the right version
    sed -i.bak -E 's|"version": "[^"]+",|"version": "'$NEXT_VERSION'-pre",|' package.json
    rm -f package.json.bak

    # Refer to the just-released version in the documentation of the
    # development branch, too.  Most people will read docs on master.
    git checkout "v${VERSION}" -- README.md contrib/*/README.md

    git add package.json bower.json
    git commit -n -m "Bump $BRANCH to v$NEXT_VERSION-pre"
    git push origin "$BRANCH"

    # Go back to the tag which has build/katex.tar.gz and build/katex.zip
    git checkout "v$VERSION"
fi

echo ""
echo "The automatic parts are done!"
echo "Now all that's left is to create the release on github."
echo "Visit https://github.com/Khan/KaTeX/releases/new?tag=v$VERSION to edit the release notes"
echo "Don't forget to upload build/katex.tar.gz and build/katex.zip to the release!"

if [[ ${DRY_RUN} ]]; then
    echo ""
    echo "This was a dry run."
    echo "Operations using git or npm were printed not executed."
    echo "Some files got modified, though, so you might want to undo "
    echo "these changes now, e.g. using \`git checkout -- .\` or similar."
    echo ""
fi
