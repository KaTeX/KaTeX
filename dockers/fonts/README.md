### How to generate KaTeX fonts and metrics

Originally based on MathJax font generation

#### Fonts

The `buildFonts.sh` script should do everything automatically,
as long as Docker is installed.

The script `buildFonts.sh` automatically creates Docker images
from the supplied `Dockerfile`.
It uses the hash of the file to tag the image, so a change to the file
will result in the creation of a new image.
If you want to see all created images, run `docker images katex/fonts`.
To remove all generated images, you can run
`docker rmi $(docker images --format '{{.Repository}}:{{.Tag}}' katex/fonts)`.

#### Metrics

The script `buildMetrics.sh` generates [metrics](../../src/fontMetricsData.js)
(dimensions of each character) for the generated fonts.
See [detailed requirements for running this script](../../src/metrics/).

If there is a problem, file a bug report.
