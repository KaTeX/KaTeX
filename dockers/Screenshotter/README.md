### How to generate screenshotter images
----------------------------------------

Now you too can generate screenshots from your own computer, and (hopefully)
have them look mostly the same as the current ones! To start, make a docker
image from the included Dockerfile using a command like

    sudo docker build --tag=ss .

from within this directory (note you need to have docker installed and running
for this to work). This will build a docker image with the `ss` tag, which you
can then use to run dockers based on it.

This Dockerfile is set up such that it will run everything and generate all the
screenshots when the docker is run, so no interactive input is required. All
that you need to do is mount the KaTeX directory you want to test into the
`/KaTeX` directory in the docker, and run the `ss` docker, like so:

    sudo docker run --volume=/your/KaTeX/:/KaTeX ss

The `--volume=/your/KaTeX:/KaTeX` switch mounts your KaTeX directory into the
docker. Note this is a read-write mounting, so the new screenshots will be
directly placed into your KaTeX directory.

Since this docker is very self-contained, there should be no need to do
interactive management of the docker, but if you feel the need, you can read the
General Docker Help section of the MathJaxFonts docker readme.

That's it!
