FROM ubuntu:14.04
MAINTAINER xymostech <xymostech@gmail.com>
RUN apt-get -qq update
RUN apt-get -qqy install nodejs=0.10.25~dfsg2-2ubuntu1 default-jre=2:1.7-51 firefox=28.0+build2-0ubuntu2 xvfb=2:1.15.1-0ubuntu2 wget=1.15-1ubuntu1 || true
RUN wget http://selenium-release.storage.googleapis.com/2.42/selenium-server-standalone-2.42.2.jar
RUN ln -s /usr/bin/nodejs /usr/bin/node
ENV DISPLAY :1
CMD /bin/bash ~/run.sh
RUN echo "java -jar /selenium-server-standalone-2.42.2.jar > /dev/null &" >> ~/run.sh
RUN echo "Xvfb :1 2> /dev/null &" >> ~/run.sh
RUN echo "make -C /KaTeX serve > /dev/null &" >> ~/run.sh
RUN echo "sleep 2" >> ~/run.sh
RUN echo "/KaTeX/node_modules/.bin/hux --write /KaTeX/test/huxley/" >> ~/run.sh
