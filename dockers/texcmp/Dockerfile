# convert from PDF to PNG with -flatten looks really bad on 14.04 LTS
FROM ubuntu:15.04

MAINTAINER Martin von Gagern <gagern@ma.tum.de>

# Disable regular updates, but keep security updates
RUN sed -i 's/^\(deb.*updates\)/#\1/' /etc/apt/sources.list && apt-get update

# Install all required packages, but try not to pull in TOO much
RUN apt-get -qy --no-install-recommends install \
  texlive-latex-base etoolbox imagemagick ghostscript nodejs
