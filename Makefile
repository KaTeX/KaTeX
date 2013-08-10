.PHONY: build setup copy serve clean
build: setup build/katex.js

setup:
	npm install

compress: build/katex.min.js
	@printf "Minified, gzipped size: "
	@gzip -c $^ | wc -c

build/katex.js: katex.js $(wildcard *.js)
	./node_modules/.bin/browserify $< --standalone katex > $@

build/katex.min.js: build/katex.js
	uglifyjs --mangle < $< > $@

serve:
	node server.js

clean:
	rm -rf build/*
