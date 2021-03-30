FROM ubuntu:20.04

# Install things
RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get -y upgrade \
 && DEBIAN_FRONTEND=noninteractive apt-get -y install \
    --no-install-recommends --auto-remove \
    git \
    texlive \
    fontforge \
    mftrace \
    build-essential \
    python3-fontforge \
    python3-dev \
    python3-pip \
    ttfautohint \
    libjson-perl \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && pip3 install fonttools==4.21.1 brotli zopfli
