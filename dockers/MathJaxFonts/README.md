### How to generate MathJax fonts
---------------------------------

It's really simple (now)! Just make a docker image from the included Dockerfile
using a command like

    sudo docker build --tag=mathjaxfonts .

from within this directory (note you need to have docker installed and running
for this to work). This will build a docker image with the mathjaxfonts tag,
which you can then use to run dockers based on them. Then, run a mathjaxfonts
docker with

    sudo docker run --interactive --tty --name mjf mathjaxfonts /bin/bash

We name this docker "mjf" so we can reference it later when we want to copy the
files off. (If you get an error about the name being in use, perhaps because you
are trying to create another docker, you can either delete the old docker with

    sudo docker rm mjf

or use a different name.) This will get you into the docker in the root
directory. From there, cd into the `/MathJax-dev/fonts/OTF/TeX` directory, and
run

    make ttf eot woff woff2

to build all of the fonts that we need. Finally, leave the docker and copy all
the files off with the `copy_fonts.sh` script:

    ./copy_fonts.sh mjf

And you're good to go! Don't forget to update the font metrics with `make
metrics`.

### General Docker Help
-----------------------

When you quit the docker, it will stop the docker from running. If you want to
reattach to the docker, you can start it again with

    sudo docker start mjf

and then attach with

    sudo docker attach mjf

Alternatively, if you want to detach from the docker when you're done instead of
quitting and stopping it, you can detach with `C-p C-q`, and then re-attach with

    sudo docker attach mjf

To see a list of your current dockers, you can run

    docker ps
