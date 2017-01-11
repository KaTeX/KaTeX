FROM ubuntu:14.04
MAINTAINER xymostech <xymostech@gmail.com>

# Install things
RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get -y upgrade \
 && DEBIAN_FRONTEND=noninteractive apt-get -y install \
    --no-install-recommends --auto-remove \
    git \
    dvipng \
    default-jre \
    default-jdk \
    texlive \
    wget \
    fontforge \
    mftrace \
    fonttools \
    optipng \
    advancecomp \
    man-db \
    build-essential \
    unzip \
    zlib1g-dev \
    python-fontforge \
    ruby \
    woff-tools \
    pkg-config \
    libharfbuzz-dev \
    libfreetype6-dev \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && gem install ttfunk --version 1.1.1

# Download yuicompressor
ADD https://github.com/yui/yuicompressor/releases/download/v2.4.8/yuicompressor-2.4.8.jar /usr/share/yui-compressor/yui-compressor.jar

# Download batik-ttf2svg.jar
RUN wget "https://archive.apache.org/dist/xmlgraphics/batik/batik-1.7.zip" \
 && unzip batik-*.zip batik-*/batik-ttf2svg.jar \
 && mv batik-*/batik-ttf2svg.jar /usr/share/java/ \
 && rm -r batik-*

# Download and compile ttf2eof (note we add a patch to make it compile)
RUN wget "https://github.com/wget/ttf2eot/archive/v0.0.2-2.tar.gz" -O ttf2eot.tar.gz\
 && tar -xzf ttf2eot.tar.gz \
 && sed -i "1s/^/#include <cstddef>/" ttf2eot-*/OpenTypeUtilities.h \
 && make -C ttf2eot-*/ \
 && mv ttf2eot-*/ttf2eot /usr/bin/ \
 && rm -r ttf2eot*

# Download and compile ttfautohint
RUN wget "http://download.savannah.gnu.org/releases/freetype/ttfautohint-1.3.tar.gz" \
 && tar -xzf ttfautohint-*.tar.gz \
 && cd ttfautohint-*/ \
 && ./configure --without-qt \
 && make \
 && mv frontend/ttfautohint /usr/bin \
 && cd .. \
 && rm -r ttfautohint-*

# Download and compile woff2_compress
RUN wget "https://github.com/google/woff2/archive/d9a74803fa884559879e3205cfe6f257a2d85519.tar.gz" -O woff2.tar.gz \
 && tar -xzf woff2.tar.gz \
 && make -C woff2-*/woff2/ \
 && mv woff2-*/woff2/woff2_compress /usr/bin \
 && rm -r woff2*
