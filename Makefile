UNAME=$(shell uname)

.PHONY: build setup copy serve clean
build: setup build/katex.js build/katex.less.css
ifeq ($(UNAME),Darwin)
build: pdiff
endif

setup:
	npm install
ifeq ($(UNAME),Darwin)
	brew install webkit2png
	brew install graphicsmagick
endif

compress: build/katex.min.js
	@printf "Minified, gzipped size: "
	@gzip -c $^ | wc -c

build/katex.js: katex.js $(wildcard *.js)
	./node_modules/.bin/browserify $< --standalone katex > $@

build/katex.min.js: build/katex.js
	uglifyjs --mangle < $< > $@

build/katex.less.css: static/katex.less
	./node_modules/.bin/lessc $< > $@

serve:
	node server.js

pdiff:
	@printf "Creating new pdiff image...\n"
	@webkit2png http://localhost:7936/test/pdiff.html -F --transparent -D build -o pdiff
	@mv build/pdiff-full.png build/pdiff.png
	@printf "Comparing to reference pdiff image...\n"
	@node test/pdiff.js

clean:
	rm -rf build/*
