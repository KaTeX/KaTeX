FROM ubuntu:14.04.5
MAINTAINER xymostech <xymostech@gmail.com>

# Install things
RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get -y upgrade \
 && DEBIAN_FRONTEND=noninteractive apt-get -y install \
    --no-install-recommends --auto-remove \
    software-properties-common \
    texlive \
    wget \
    fontforge \
    mftrace \
    man-db \
    build-essential \
    python-fontforge \
    python-dev \
    python-pip \
    pkg-config \
    libharfbuzz-dev \
    libfreetype6-dev \
    libjson-perl \
 && add-apt-repository ppa:git-core/ppa \
 && apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get -y install \
    --no-install-recommends --auto-remove \
    git \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && pip install fonttools==3.28.0 brotli zopfli

# Download and compile ttfautohint
RUN wget "http://download.savannah.gnu.org/releases/freetype/ttfautohint-1.3.tar.gz" \
 && tar -xzf ttfautohint-*.tar.gz \
 && cd ttfautohint-*/ \
 && ./configure --without-qt \
 && make \
 && mv frontend/ttfautohint /usr/bin \
 && cd .. \
 && rm -r ttfautohint-*
