FROM ubuntu:24.04
LABEL authors="Grigoriy Reshetniak"
LABEL org.opencontainers.image.source=https://github.com/KaTeX/KaTeX
RUN apt-get update && apt-get install -y --no-install-recommends \
    webkit2gtk-driver libwebkit2gtk-4.1-0 \
    xvfb dbus-x11 \
    fonts-dejavu fonts-liberation \
    libgl1-mesa-dri libegl-mesa0 libgbm1 \
    && rm -rf /var/lib/apt/lists/*
EXPOSE 4444
CMD ["sh", "-c", "dbus-run-session -- xvfb-run --server-args='-screen 0 1024x768x24' WebKitWebDriver --host=0.0.0.0 --port=4444"]
