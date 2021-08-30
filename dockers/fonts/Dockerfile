FROM ubuntu:20.04

# Install things
RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get -y upgrade \
 && DEBIAN_FRONTEND=noninteractive apt-get -y install \
    --no-install-recommends --auto-remove \
    git \
    texlive-base \
    texlive-fonts-recommended \
    fontforge=1:20190801~dfsg-4 \
    mftrace=1.2.20+git20190918.fd8fef5-2 \
    build-essential \
    python3-fontforge=1:20190801~dfsg-4 \
    python3-dev \
    python3-pip \
    ttfautohint=1.8.3-2build1 \
    libjson-perl \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && pip3 install fonttools==4.21.1 brotli zopfli
