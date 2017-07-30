FROM ubuntu:17.04

MAINTAINER Martin von Gagern <gagern@ma.tum.de>

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/bin/dumb-init

# Disable regular updates, keep security updates, avoid intermediate layers
RUN sed -i 's/^\(deb.*updates\)/#\1/' /etc/apt/sources.list \
 && apt-get update \
 && apt-get upgrade -y \
 && DEBIAN_FRONTEND=noninteractive \
    apt-get install -qy --no-install-recommends \
        ca-certificates \
        etoolbox \
        ghostscript \
        imagemagick \
        nodejs \
        npm \
        texlive-fonts-recommended \
        texlive-latex-base \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && chmod +x /usr/bin/dumb-init

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

RUN useradd --create-home --home-dir /KaTeX katex \
 && mkdir -p /KaTeX/dockers/texcmp /KaTeX/test/screenshotter

ADD package.json /KaTeX/dockers/texcmp/package.json

RUN ( cd /KaTeX/dockers/texcmp; npm install; ) \
 && ( cd /KaTeX/test/screenshotter; npm install js-yaml; ) \
 && chown -R katex:katex /KaTeX

USER katex
