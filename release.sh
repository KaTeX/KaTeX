#!/usr/bin/env bash

set -e -o pipefail
shopt -s extglob

VERSION=
NEXT_VERSION=
BRANCH=$(git rev-parse --abbrev-ref HEAD)
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
elif [[ $BRANCH != "master" ]]; then
    echo "About to update SRI hashes for $BRANCH. "
elif [[ -z "$NEXT_VERSION" ]]; then
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

git checkout "$BRANCH"
# git pull

if [[ $BRANCH != "master" ]]; then
    # Build generated files
    yarn build

    # Regenerate the Subresource Integrity hash in the README and the documentation
    node update-sri.js "${VERSION}" README.md contrib/*/README.md \
        docs/*.md website/pages/index.html website/versioned_docs/version-$VERSION/*.md

    # Make the commit and push
    git add README.md contrib/*/README.md \
        docs website/pages/index.html website/versioned_docs/
    git commit -n -m "Update SRI hashes"
    git push
elif [[ ! $PUBLISH ]]; then
    # Make a release branch
    git checkout -b "v$VERSION-release"

    # Edit package.json to the right version, as it's inlined (see
    # http://stackoverflow.com/a/22084103 for why we need the .bak file to make
    # this mac & linux compatible)
    sed -i.bak -E 's|"version": "[^"]+",|"version": "'$VERSION'",|' package.json
    rm -f package.json.bak

    # Build generated files
    yarn build

    if [ ! -z "$NEXT_VERSION" ]; then
        # Edit package.json to the next version
        sed -i.bak -E 's|"version": "[^"]+",|"version": "'$NEXT_VERSION'-pre",|' package.json
        rm -f package.json.bak
        git add package.json
    fi

    # Edit docs to use CSS from CDN
    grep -l '{@stylesheet: katex.min.css}' docs/*.md | xargs sed -i.bak \
        's|{@stylesheet: katex.min.css}|<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@./dist/katex.min.css" integrity="sha384-katex.min.css" crossorigin="anonymous"/>|'

    # Update the version number in CDN URLs included in the README and the documentation,
    # and regenerate the Subresource Integrity hash for these files.
    node update-sri.js "${VERSION}" README.md contrib/*/README.md \
        docs/*.md docs/*.md.bak website/pages/index.html

    # Generate a new version of the docs
    pushd website
    yarn run version "${VERSION}"
    popd

    # Restore docs to use local built CSS
    for file in docs/*.md.bak; do
        mv -f "$file" "${file%.bak}"
    done

    # Make the commit and push
    git add package.json README.md contrib/*/README.md \
        docs website/pages/index.html website/versioned_docs/ \
        website/versioned_sidebars/ website/versions.json
    if [[ -z "$NEXT_VERSION" ]]; then
        git commit -n -m "Release v$VERSION"
    else
        git commit -n -m "Release v$VERSION" -m "Bump $BRANCH to v$NEXT_VERSION-pre"
    fi
    git diff --stat --exit-code # check for uncommitted changes
    git push -u origin "v$VERSION-release"

    echo ""
    echo "The automatic parts are done!"
    echo "Now create a pull request against master from 'v$VERSION-release'"
    echo "Visit https://github.com/Khan/KaTeX/pulls to open a pull request."
    echo "After it gets merged, run './release.sh -p $VERSION'!"
    echo "Note that if KaTeX source code is changed after running this script,"
    echo "you have to run the release script again."
else
    # Make a new detached HEAD
    git checkout --detach

    # Edit package.json to the right version
    sed -i.bak -E 's|"version": "[^"]+",|"version": "'$VERSION'",|' package.json
    rm -f package.json.bak

    # Build generated files and add them to the repository
    git clean -fdx dist
    yarn dist
    sed -i.bak -E '/^\/dist\/$/d' .gitignore
    rm -f .gitignore.bak

    # Check Subresource Integrity hashes
    node update-sri.js check README.md contrib/*/README.md

    # Make the commit and tag, and push them.
    git add package.json .gitignore dist/
    git commit -n -m "v$VERSION"
    git diff --stat --exit-code # check for uncommitted changes
    git tag -a "v$VERSION" -m "v$VERSION"
    git push origin "v$VERSION"

    # Update npm (cdnjs update automatically)
    yarn publish --new-version "${VERSION}"

    # Publish the website
    pushd website
    USE_SSH=true yarn publish-gh-pages
    popd

    echo ""
    echo "The automatic parts are done!"
    echo "Now all that's left is to create the release on GitHub."
    echo "Visit https://github.com/Khan/KaTeX/releases/new?tag=v$VERSION to edit the release notes."
    echo "Don't forget to upload katex.tar.gz and katex.zip to the release!"
fi

if [[ ${DRY_RUN} ]]; then
    echo ""
    echo "This was a dry run."
    echo "Operations using git or yarn were printed not executed."
    echo "Some files got modified, though, so you might want to undo "
    echo "these changes now, e.g. using \`git checkout -- .\` or similar."
    echo ""
fi
