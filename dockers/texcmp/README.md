# How to compare against LaTeX

The tools in this directory can be used to create reference images
using LaTeX, and to compare them against the screenshots taken from a
browser.

## Execution environment

### Docker environment

If you don't want to ensure the presence of all required tools, or
want to make sure that you create reproducible results, simply run

    dockers/texcmp/texcmp.sh

from the root of your KaTeX directory tree.
This will build a suitable docker image unless such an image already
exists.  It will then use a container based on that image to generate
all the images described below.

Note that the files and directories created in the source tree from
within the docker will be owned by root, so you might have trouble
deleting them later on.  Be sure you can obtain superuser permissions
on your computer or know someone who can, just to be safe.

### Native environment

If you want to avoid the overhead of creating a docker container, or
the even larger overhead of setting up docker and creating the initial
image, then you may instead execute the commands

    cd dockers/texcmp
    npm install
    node texcmp.js

from the root of your KaTeX directory tree.  Required tools include the
`pdflatex` tool of a standard TeX distribution as well as the
`convert` tool from ImageMagick.

Note that this approach will use `/tmp/texcmp` as a temporary directory.
The use of a single directory name here can lead to conflicts if
multiple developers on the same machine try to use that directory.

Also note that different software configurations can lead to different results,
so if reproducibility is desired, the Docker approach should be chosen.

## Generated files

After running either of the above commands, you will find two
(possibly new) subdirectories inside `test/screenshotter`,
called `tex` and `diff`.

### Rasterized documents

`test/screenshotter/tex` will contain images created by `pdflatex` by
plugging the test case formula in question into the template
`test/screenshotter/test.tex`.  This is essentially our reference of
how LaTeX renders a given input.

### Difference images

`test/screenshotter/diff` will contain images depicting the difference
between the LaTeX rendering and the Firefox screenshot.  Black areas
indicate overlapping print.  Green areas are black in LaTeX but white
in Firefox, while it's the other way round for red areas.  Colored
input is first converted to grayscale, before being subject to the
coloring just described.  The pictures will be aligned in such a way
as to maximize the overlap between the two versions (i.e. the amount
of black output).  The result will then be trimmed so it can easily be
pasted into bug reports.

## Command line arguments

Both `texcmp.sh` and `texcmp.js` will accept the names of test cases
on the command line.  This can be useful if one particular test case
is affected by current development, so that the effects on it can be
seen more quickly.

Examples:

    dockers/texcmp/texcmp.sh Sqrt SqrtRoot
    node dockers/texcmp/texcmp.js Baseline
