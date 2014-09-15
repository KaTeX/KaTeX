### How to generate huxley images
---------------------------------

Now you too can generate huxley images from your own computer, and (hopefully)
have them look mostly the same as the current ones! To start, make a docker
image from the included Dockerfile using a command like

    sudo docker build --tag=huxley .

from within this directory (note you need to have docker installed and running
for this to work). This will build a docker image with the huxley tag,
which you can then use to run dockers based on them.

This huxleyfile is set up such that it will run everything and generate all the
huxley images when the image is run, so no interactive input is required. All
that you need to do is mount the KaTeX directory you want to test into the
`/KaTeX` directory in the docker, and run the huxley docker, like so:

    sudo docker run --volume=/your/KaTeX/:/KaTeX huxley

The `--volume=/your/KaTeX:/KaTeX` switch mounts your KaTeX directory into the
docker. Note this is a read-write mounting, so the new huxley images will be
directly placed into your KaTeX directory.

Since this docker is very self-contained, there should be no need to do
interactive management of the docker, but if you feel the need, you can read the
General Docker Help section of the MathJaxFonts docker readme.

That's it!