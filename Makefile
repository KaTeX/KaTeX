.PHONY: build setup copy serve clean
build: setup build/katex.js

setup:
	@npm install
	@mkdir -p build

compress: build/katex.min.js
	@echo -n "Minified, gzipped size: "
	@gzip -c $^ | wc -c

build/katex.js: katex.js Parser.js Lexer.js
	./node_modules/.bin/browserify $< --standalone katex > $@

build/katex.min.js: build/katex.js
	uglifyjs --mangle < $< > $@


copy: build
	cp build/katex.js ../exercises/utils/katex.js
	cp static/katex.css ../exercises/css/
	cp -R static/fonts ../exercises/css/

serve:
	node server.js

clean:
	rm -rf build/*
