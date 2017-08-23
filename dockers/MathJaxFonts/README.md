### How to generate MathJax fonts
---------------------------------

The `buildFonts.sh` script should do everything automatically,
as long as Docker is installed.

If you want to try out a change
to [the MathJax-dev repository](https://github.com/Khan/MathJax-dev),
create a local clone (or download and unpack the ZIP file)
and specify the path to this directory as an arument to `buildFonts.sh`.
You can also specify a local or remote tarball,
e.g. a GitHub download of your own personal feature branch.

The script `buildFonts.sh` automatically creates Docker images
from the supplied `Dockerfile`.
It uses the hash of the file to tag the image, so a change to the file
will result in the creation of a new image.
If you want to see all created images, run `docker images katex/fonts`.
To remove all generated images, you can run
`docker rmi $(docker images --format '{{.Repository}}:{{.Tag}}' katex/fonts)`.

If there is a problem, file a bug report.
