#!/usr/bin/env bash

set -e -o pipefail
shopt -s extglob

VERSION=
NEXT_VERSION=
BRANCH=$(git rev-parse --abbrev-ref HEAD)
ORIGIN=${ORIGIN:-origin}
NARGS=0
DRY_RUN=
PUBLISH=
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
    echo " --publish|-p: publish a release."
    echo " --dry-run|-n: only print commands, do not execute them."
    echo ""
    echo "You may omit NEXT_VERSION in order to avoid updating the version field"
    echo "of the package.json."
    echo ""
    echo "Run this on the master branch. This will create a release branch."
    echo "Open a pull request and after it gets merged, run with --publish"
    echo "option on the master branch."
    echo ""
    echo "To update SRI hashes, run this again on the generated release branch"
    echo ""
    echo "Examples:"
    echo " When releasing a v0.6.3:"
    echo "   ./release.sh 0.6.3 0.6.4"
    echo " Open a pull request from v0.6.3-release to master."
    echo " After it's merged:"
    echo "   ./release.sh -p 0.6.3"
    exit $1
}

while [ $# -gt 0 ]; do
    case "$1" in
        --dry-run|-n|--just-print)
            DRY_RUN=true
            git() { echo "git $*"; }
            npm() { echo "npm $*"; }
            yarn() { echo "yarn $*"; }
            ;;
        --publish|-p)
            PUBLISH=true
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
if [[ $BRANCH != @(v*-release|master) ]]; then
    echo "'$BRANCH' does not look like a release branch to me" >&2
    : $((++INSANE))
fi

if [[ $PUBLISH ]]; then
    echo "About to publish $VERSION from $BRANCH. "
elif [[ $BRANCH == @(v*-release) ]]; then
    echo "About to update SRI hashes for $BRANCH. "
elif [[ ! $NEXT_VERSION ]]; then
    echo "About to release $VERSION from $BRANCH. "
else
    echo "About to release $VERSION from $BRANCH and bump to $NEXT_VERSION-pre."
fi
if [[ $INSANE != 0 ]]; then
    read -r -p "$INSANE sanity check(s) failed, really proceed? [y/n] " CONFIRM
else
    read -r -p "Look good? [y/n] " CONFIRM
fi
if [[ $CONFIRM != "y" ]]; then
    exit 1
fi

git checkout "$BRANCH"
git pull

if [[ ! $PUBLISH ]]; then
    # Make a release branch
    git checkout -B "v$VERSION-release"

    # Edit package.json to the right version, as it's inlined (see
    # http://stackoverflow.com/a/22084103 for why we need the .bak file to make
    # this mac & linux compatible)
    sed -i.bak -E 's|"version": "[^"]+",|"version": "'$VERSION'",|' package.json
    rm -f package.json.bak

    # Build generated files
    yarn build

    if [[ $BRANCH != @(v*-release) ]]; then
        if [ ! -z "$NEXT_VERSION" ]; then
            # Edit package.json to the next version
            sed -i.bak -E 's|"version": "[^"]+",|"version": "'$NEXT_VERSION'-pre",|' package.json
            rm -f package.json.bak
        fi

        # Edit docs to use CSS from CDN
        grep -l '/static/' docs/*.md | xargs sed -i.bak \
            's|/static/\([^"]\+\)|https://cdn.jsdelivr.net/npm/katex@./dist/\1" integrity="sha384-\1" crossorigin="anonymous|'

        # Update the version number in CDN URLs included in the README and the documentation,
        # and regenerate the Subresource Integrity hash for these files.
        yarn node update-sri.js "$VERSION" README.md contrib/*/README.md \
            docs/*.md docs/*.md.bak website/pages/index.html

        # Generate a new version of the docs
        pushd website
        yarn run version "$VERSION"
        popd

        # Restore docs to use local built CSS
        for file in docs/*.md.bak; do
            mv -f "$file" "${file%.bak}"
        done
    else
        # Restore package.json
        git checkout package.json

        # Regenerate the Subresource Integrity hash in the README and the documentation
        yarn node update-sri.js "$VERSION" README.md contrib/*/README.md \
            docs/*.md website/pages/index.html website/versioned_docs/version-$VERSION/*.md
    fi

    # Make the commit and push
    git add package.json README.md contrib/*/README.md \
        docs website/pages/index.html website/versioned_docs/ \
        website/versioned_sidebars/ website/versions.json
    if [[ $BRANCH == @(v*-release) ]]; then
        git commit -n -m "Update SRI hashes"
    elif [[ ! $NEXT_VERSION ]]; then
        git commit -n -m "Release v$VERSION"
    else
        git commit -n -m "Release v$VERSION" -m "Bump $BRANCH to v$NEXT_VERSION-pre"
    fi
    git push -u "$ORIGIN" "v$VERSION-release"

    echo ""
    echo "The automatic parts are done!"
    echo "Now create a pull request against master from 'v$VERSION-release'"
    echo "Visit https://github.com/KaTeX/KaTeX/pulls to open a pull request."
    echo "After it gets merged, run './release.sh -p $VERSION'!"
    echo "Note that if KaTeX source code is changed after running this script,"
    echo "you have to run the release script again."

    git diff --stat --exit-code # check for uncommitted changes
else
    # Edit package.json to the right version
    sed -i.bak -E 's|"version": "[^"]+",|"version": "'$VERSION'",|' package.json
    rm -f package.json.bak

    # Build generated files
    yarn dist

    # Check Subresource Integrity hashes
    yarn node update-sri.js check README.md contrib/*/README.md

    # Make the tag and push
    git tag -a "v$VERSION" -m "v$VERSION"
    git push "$ORIGIN" "v$VERSION"

    # Update npm (cdnjs update automatically)
    # Fallback to npm publish, if yarn cannot authenticate, e.g., 2FA
    yarn publish --new-version "$VERSION" || npm publish

    echo ""
    echo "The automatic parts are done!"
    echo "Now all that's left is to create the release on GitHub."
    echo "Visit https://github.com/KaTeX/KaTeX/releases/new?tag=v$VERSION to edit the release notes."
    echo "Don't forget to upload katex.tar.gz and katex.zip to the release!"
fi

if [[ $DRY_RUN ]]; then
    echo ""
    echo "This was a dry run."
    echo "Operations using git or yarn were printed not executed."
    echo "Some files got modified, though, so you might want to undo "
    echo "these changes now, e.g. using \`git checkout -- .\` or similar."
    echo ""
fi
