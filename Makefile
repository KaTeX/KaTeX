.PHONY: build setup copy serve clean metrics
build: setup build/katex.js build/katex.less.css

setup:
	npm install

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

metrics:
	cd metrics && ./mapping.pl | ./extract_tfms.py | ./replace_line.py

clean:
	rm -rf build/*
