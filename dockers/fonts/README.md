### How to generate KaTeX fonts and metrics

Originally based on MathJax font generation

#### Fonts

The `buildFonts.sh` script should do everything automatically,
as long as Docker is installed.

If you want to try out a change
to [the katex-fonts repository](https://github.com/KaTeX/katex-fonts),
create a local clone (or download and unpack the ZIP file)
and specify the path to this directory as an argument to `buildFonts.sh`.
You can also specify a local or remote tarball,
e.g. a GitHub download of your own personal feature branch.

The script `buildFonts.sh` automatically creates Docker images
from the supplied `Dockerfile`.
It uses the hash of the file to tag the image, so a change to the file
will result in the creation of a new image.
If you want to see all created images, run `docker images katex/fonts`.
To remove all generated images, you can run
`docker rmi $(docker images --format '{{.Repository}}:{{.Tag}}' katex/fonts)`.

#### Metrics

The script `buildMetrics.sh` generates [metrics](fontMetricsData.js)
(dimensions of each character) for the generated fonts.
See [detailed requirements for running this script](src/metrics/).

If there is a problem, file a bug report.
